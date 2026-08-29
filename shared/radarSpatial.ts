/**
 * PRTS Tactical Radar — shared spatial algorithm (pure, framework-agnostic).
 *
 * Used by BOTH the Vite frontend (for client-side scan dedup) and the Cloudflare
 * Worker (for the spatial scan cell-set). Because both sides import this single
 * module, a change to the scan algorithm in one place stays consistent in the
 * other (e.g. the `radius > 8 → precision 4` threshold).
 *
 * This module contains NO business/API protocol logic and NO data access —
 * it only owns the geometry used to derive which geohash cells a scan touches.
 */

// geohash BASE32 alphabet (geohash-36, same as worker)
const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';

const NEIGHBORS_OFFSETS: [number, number][] = [
  [1, 0], [-1, 0], [0, 1], [0, -1],
  [1, 1], [1, -1], [-1, 1], [-1, -1],
];

/** Precision-5 geohash cells are used for radii <= 8km (approx. 5km cells). */
export const RADAR_FINE_PRECISION = 5;

/** Radii above this threshold switch to coarse (precision-4) cells. */
export const RADAR_COARSE_THRESHOLD_KM = 8;

/** Sentinel radius sent by the client for "scan everything" (全域) mode. */
export const GLOBAL_SCAN_SENTINEL = 10000;

/** Effective radius used for a global scan (clamped to this many km). */
export const GLOBAL_SCAN_KM = 100;

function geohashEncode(lat: number, lng: number, precision: number): string {
  let latMin = -90, latMax = 90;
  let lngMin = -180, lngMax = 180;
  let hash = '';
  let bit = 0;
  let ch = 0;
  let isLng = true;

  while (hash.length < precision) {
    if (isLng) {
      const mid = (lngMin + lngMax) / 2;
      if (lng >= mid) { ch |= 1 << (4 - bit); lngMin = mid; } else { lngMax = mid; }
    } else {
      const mid = (latMin + latMax) / 2;
      if (lat >= mid) { ch |= 1 << (4 - bit); latMin = mid; } else { latMax = mid; }
    }
    isLng = !isLng;
    if (bit < 4) { bit++; } else { hash += BASE32[ch]; bit = 0; ch = 0; }
  }
  return hash;
}

function geohashNeighbors(hash: string): string[] {
  const neighbors: string[] = [];
  const isOdd = hash.length % 2 === 1;

  for (const [dy, dx] of NEIGHBORS_OFFSETS) {
    let newHash = '';
    let carryLat = dy;
    let carryLng = dx;
    for (let i = hash.length - 1; i >= 0; i--) {
      const ch = BASE32.indexOf(hash[i]);
      const bitIdx = isOdd ? (i % 2 === 0 ? 0 : 1) : (i % 2 === 0 ? 1 : 0);

      let v = ch;
      if (bitIdx === 0) {
        v += carryLng;
        carryLng = 0;
        if (v < 0) { v += 32; carryLat += (isOdd ? -1 : -2); }
        else if (v >= 32) { v -= 32; carryLat += (isOdd ? 1 : 2); }
      } else {
        v += carryLat;
        carryLat = 0;
        if (v < 0) { v += 32; carryLng += (isOdd ? -2 : -1); }
        else if (v >= 32) { v -= 32; carryLng += (isOdd ? 2 : 1); }
      }
      newHash = BASE32[v] + newHash;
    }
    if (carryLat === 0 && carryLng === 0) neighbors.push(newHash);
  }
  return [...new Set(neighbors)];
}

const toRad = (d: number) => (d * Math.PI) / 180;

/**
 * Resolve the effective radius for a scan. Global scans (sentinel >= 10000, or
 * 'all'/'global') map to GLOBAL_SCAN_KM; otherwise the raw radius is used.
 * Mirrors the worker's scanning behavior.
 */
export function resolveScanRadius(radiusRaw: number | string): number {
  if (radiusRaw === 'all' || radiusRaw === 'global') return GLOBAL_SCAN_KM;
  const n = Number(radiusRaw);
  if (!Number.isFinite(n)) return GLOBAL_SCAN_KM;
  if (n >= GLOBAL_SCAN_SENTINEL) return GLOBAL_SCAN_KM;
  return n;
}

/** Geohash precision (4 or 5) used for a given radius. */
export function getRadarPrecision(radiusKm: number): 4 | 5 {
  return radiusKm > RADAR_COARSE_THRESHOLD_KM ? 4 : RADAR_FINE_PRECISION;
}

/**
 * Compute the set of geohash cells (center + neighbors) that a scan of
 * `radiusKm` centered at (lat, lng) touches. Deduplicated, unsorted.
 */
export function getRadarCells(lat: number, lng: number, radiusKm: number): string[] {
  const precision = getRadarPrecision(radiusKm);
  const latDelta = (radiusKm / 111) * 1.2;
  const cosLat = Math.max(0.2, Math.cos(toRad(lat)));
  const lngDelta = (radiusKm / (111 * cosLat)) * 1.2;

  const corners = [
    geohashEncode(lat - latDelta, lng - lngDelta, precision),
    geohashEncode(lat - latDelta, lng + lngDelta, precision),
    geohashEncode(lat + latDelta, lng - lngDelta, precision),
    geohashEncode(lat + latDelta, lng + lngDelta, precision),
    geohashEncode(lat, lng, precision),
  ];

  const cellSet = new Set<string>();
  for (const h of corners) {
    cellSet.add(h);
    for (const n of geohashNeighbors(h)) cellSet.add(n);
  }
  return [...cellSet];
}

/**
 * Stable signature of a scan = its exact cell set. Two scans sharing a
 * signature will query the same geohash buckets (after client radius clamping),
 * so the client can use it to skip redundant requests and the worker can use it
 * as a shared-cache key.
 */
export function getRadarCellSignature(lat: number, lng: number, radiusKm: number): string {
  return getRadarCells(lat, lng, radiusKm).sort().join(',');
}
