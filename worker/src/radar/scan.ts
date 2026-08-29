/**
 * PRTS Tactical Radar — Worker spatial scan + shared candidate cache.
 *
 * Owns:
 *  - the geohash bucket reads for a scan,
 *  - a Workers Cache API layer that caches the SPATIAL CANDIDATE SET (not the
 *    per-user final response), so multiple users asking for the same region
 *    reuse a single set of KV reads.
 *
 * Per-user concerns (excludeId, distance filtering, radius truncation, global
 * mode) are applied AFTER cache retrieval inside scanNearby, never cached.
 *
 * This module has no business logic beyond scanning and no protocol knowledge —
 * caching key construction lives here, geometry lives in shared/radarSpatial.
 */
import {
  getRadarCellSignature,
  getRadarCells,
  getRadarPrecision,
} from '../../../shared/radarSpatial';

export interface Presence {
  id: string;
  name: string;
  title: string;
  level: number;
  uid: string;
  server: string;
  assistant: WireOperator;
  supportOperators: WireSupport[];
  motto: string;
  wantedClues: number[];
  extraClues: number[];
  lat: number;
  lng: number;
  isCamouflaged: boolean;
  offsetRadiusMeters: number;
  beaconBroadcastRadiusKm: number;
  broadcastVisibility: 'all' | 'radius';
  lastActive: number;
  receivedSanityCount: number;
  isOnline: boolean;
}

interface WireOperator {
  opId?: string;
  dataUrl?: string;
  name: string;
  cnName: string;
  color: string;
  masterySkill?: string;
}

interface WireSupport {
  operator: WireOperator;
  level: number;
  elite: number;
  skillLevel: string;
}

const BASE_TTL_SEC = 600; // presence expiry (10 min) — kept consistent with index.ts
const MAX_BUCKET_DOCS = 200;
const MAX_RESPONSE = 120;
const MAX_CELLS = 49;

// Cache key version prefix — bump to v2 to invalidate all prior scan caches when
// the spatial algorithm changes.
const CACHE_VERSION = 'v1';
const CACHE_TTL_SEC = 10;
const CACHE_ORIGIN = 'https://radar-scan-cache.local';

const toRad = (d: number) => (d * Math.PI) / 180;

export function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(6371e3 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

/**
 * Read a fine-precision geohash presence bucket. (Coarse buckets use the `c:`
 * prefix and are handled by the caller's key mapping.)
 */
export async function getBucket(kv: KVNamespace, hash: string): Promise<Presence[]> {
  return (await kv.get<Presence[]>(`p:${hash}`, 'json')) || [];
}

export interface ScanResult {
  doctors: (Presence & { distance: number })[];
  /** 'hit' = served from cache candidate set; 'miss' = freshly read from KV. */
  scanCache: 'hit' | 'miss';
  /** Number of geohash buckets actually queried from KV. */
  scannedCells: number;
}

/**
 * Unified scan: derives the spatial cell set from the resolved radius, checks
 * the shared cache, and only on a miss reads KV buckets. Per-user filtering
 * (excludeId, visibility, radius/global truncation, distance ordering) is
 * always applied per request, so cached candidates are safe to share.
 *
 * `radiusKm` must already be resolved by the caller (0.1..100, or GLOBAL_SCAN_KM
 * in global mode); `globalMode` disables distance truncation.
 */
export async function scanNearby(
  kv: KVNamespace,
  lat: number,
  lng: number,
  radiusKm: number,
  globalMode: boolean,
  excludeId: string,
): Promise<ScanResult> {
  const precision = getRadarPrecision(radiusKm);
  const prefix = precision === 4 ? 'c:' : '';

  const cellSet = getRadarCells(lat, lng, radiusKm).slice(0, MAX_CELLS);
  const cellSig = getRadarCellSignature(lat, lng, radiusKm);
  const scannedCells = cellSet.length;

  const cacheKey = `${CACHE_VERSION}:p${precision}:${cellSig}`;
  const cacheUrl = `${CACHE_ORIGIN}/${cacheKey}`;

  let candidates: Presence[] | null = null;
  let scanCache: 'hit' | 'miss' = 'miss';

  // 1) Try shared cache (spatial candidate set).
  try {
    const cache = caches.default;
    const hit = await cache.match(cacheUrl);
    if (hit) {
      candidates = (await hit.json<Presence[]>()) as Presence[];
      scanCache = 'hit';
    }
  } catch {
    // Cache failures are non-fatal; fall through to a fresh KV read.
    candidates = null;
    scanCache = 'miss';
  }

  // 2) Cache miss → read KV buckets for this cell set.
  // Fine buckets live under `p:<cell>`, coarse under `p:c:<cell>` (the `p:`
  // prefix is applied inside getBucket, mirroring the legacy write path).
  if (!candidates) {
    const keys = cellSet.map((h) => getBucket(kv, `${prefix}${h}`));
    const buckets = await Promise.all(keys);
    const seen = new Set<string>();
    const merged: Presence[] = [];
    for (const bucket of buckets) {
      if (!Array.isArray(bucket)) continue;
      for (const doc of bucket) {
        if (!doc || seen.has(doc.id)) continue;
        seen.add(doc.id);
        merged.push(doc);
      }
    }
    candidates = merged;

    // Store candidate set in shared cache (raw spatial data — no per-user state).
    // TTL is controlled via Cache-Control: s-maxage (Workers Cache API).
    try {
      const cache = caches.default;
      await cache.put(
        cacheUrl,
        new Response(JSON.stringify(candidates), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': `s-maxage=${CACHE_TTL_SEC}`,
          },
        }),
      );
    } catch {
      // best-effort; a cache write failure must not fail the scan
    }
  }

  // 3) Per-request filter & order (never cached).
  const now = Date.now();
  const seen = new Set<string>();
  const results: (Presence & { distance: number })[] = [];

  for (const doc of candidates) {
    if (seen.has(doc.id) || doc.id === excludeId) continue;
    if (now - doc.lastActive > BASE_TTL_SEC * 1000) continue;
    seen.add(doc.id);

    const dist = haversineMeters(lat, lng, doc.lat, doc.lng);
    if (!globalMode && dist > radiusKm * 1000) continue;
    if (doc.broadcastVisibility !== 'all' && dist > (doc.beaconBroadcastRadiusKm || 5) * 1000) continue;

    results.push({ ...doc, distance: dist });
  }

  results.sort((a, b) => a.distance - b.distance);
  return { doctors: results.slice(0, MAX_RESPONSE), scanCache, scannedCells };
}
