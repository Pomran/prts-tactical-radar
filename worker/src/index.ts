/**
 * PRTS Tactical Radar — Cloudflare Worker API
 *
 * Minimal viable backend: KV-only presence (geohash bucketing) + interaction inbox.
 * No D1, no auth tokens. Deploy with: wrangler deploy
 */

// ---------------------------------------------------------------------------
// Env (set via wrangler.jsonc bindings / .dev.vars / Secret)
// ---------------------------------------------------------------------------
export interface Env {
  RADAR_KV: KVNamespace;
  /** Gaode (AMap) WebService REST API key. Set via Secret (production) or .dev.vars (local). */
  GAODE_KEY?: string;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
import { Presence, getBucket, scanNearby } from './radar/scan';

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

interface InboxItem {
  id: string;
  type: string;
  fromDoctorId: string;
  fromDoctorName: string;
  fromAssistantName: string;
  toDoctorId: string;
  timestamp: number;
  message: string;
}

// ---------------------------------------------------------------------------
// Geohash (pure JS, zero deps — precision 5 ≈ 5km cells)
// ---------------------------------------------------------------------------
const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';

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

const NEIGHBORS_OFFSETS: [number, number][] = [
  [1, 0], [-1, 0], [0, 1], [0, -1],
  [1, 1], [1, -1], [-1, 1], [-1, -1],
];

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

// ---------------------------------------------------------------------------
// Math helpers
// ---------------------------------------------------------------------------
function toRad(d: number) { return (d * Math.PI) / 180; }

function num(v: unknown, min: number, max: number, fallback: number): number {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
}

function str(v: unknown, maxLen: number, fallback = ''): string {
  return typeof v === 'string' ? v.slice(0, maxLen) : fallback;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-store',
    },
  });
}

const PRESENCE_TTL = 600; // seconds — 10 min
const INBOX_TTL = 86400; // 24 hours
const PRECISION = 5; // geohash precision (~5km cells)
const MAX_BUCKET_DOCS = 200;
const MAX_INBOX = 50;

// ---------------------------------------------------------------------------
// KV bucket helpers
// ---------------------------------------------------------------------------
async function putBucket(kv: KVNamespace, hash: string, docs: Presence[]): Promise<void> {
  const pruned = docs
    .filter((d) => Date.now() - d.lastActive < PRESENCE_TTL * 1000)
    .slice(-MAX_BUCKET_DOCS);
  await kv.put(`p:${hash}`, JSON.stringify(pruned), { expirationTtl: PRESENCE_TTL });
}

async function removeFromBuckets(kv: KVNamespace, id: string, lat: number, lng: number) {
  const center = geohashEncode(lat, lng, PRECISION);
  const keys = [center, ...geohashNeighbors(center)];
  for (const h of keys) {
    const bucket = await getBucket(kv, h);
    const filtered = bucket.filter((d) => d.id !== id);
    if (filtered.length !== bucket.length) {
      await kv.put(`p:${h}`, JSON.stringify(filtered), { expirationTtl: PRESENCE_TTL });
    }
  }
}

// ---------------------------------------------------------------------------
// Request handlers
// ---------------------------------------------------------------------------
async function handlePing(request: Request, env: Env): Promise<Response> {
  let body: any;
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }

  const id = str(body.id, 64);
  if (!id) return json({ error: 'Missing id' }, 400);

  let lat = num(body.lat, -85, 85, 0);
  let lng = num(body.lng, -180, 180, 0);
  if (!lat && !lng) return json({ error: 'Invalid coordinates' }, 400);

  const camo = !!body.isCamouflaged;
  if (camo) {
    const r = num(body.offsetRadiusMeters, 10, 5000, 300);
    const angle = Math.random() * 2 * Math.PI;
    const dist = (0.5 + Math.random() * 0.5) * r;
    lat += (dist * Math.cos(angle)) / 111000;
    lng += (dist * Math.sin(angle)) / (111000 * Math.cos(toRad(lat)));
  }

  const sanitizeOp = (o: any): WireOperator => ({
    opId: typeof o?.opId === 'string' ? o.opId.slice(0, 40) : undefined,
    dataUrl: typeof o?.dataUrl === 'string' && o.dataUrl.startsWith('data:image/') ? o.dataUrl.slice(0, 150000) : undefined,
    name: str(o?.name, 40, 'Unknown'),
    cnName: str(o?.cnName, 40, '未知'),
    color: typeof o?.color === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(o.color) ? o.color : '#00e5ff',
    masterySkill: str(o?.masterySkill, 60),
  });

  const doc: Presence = {
    id,
    name: str(body.name, 32, 'Doctor'),
    title: str(body.title, 40, '罗德岛指挥官'),
    level: num(body.level, 1, 180, 120),
    uid: str(body.uid, 16, '--------'),
    server: str(body.server, 16, 'CN_OFFICIAL'),
    assistant: sanitizeOp(body.assistant),
    supportOperators: Array.isArray(body.supportOperators)
      ? body.supportOperators.slice(0, 4).map((s: any) => ({
          operator: sanitizeOp(s?.operator),
          level: num(s?.level, 0, 120, 90),
          elite: num(s?.elite, 0, 3, 2),
          skillLevel: str(s?.skillLevel, 20, '专精 3'),
        }))
      : [],
    motto: str(body.motto, 200),
    wantedClues: Array.isArray(body.wantedClues) ? body.wantedClues.slice(0, 7).map((n: any) => num(n, 1, 7, 1)) : [],
    extraClues: Array.isArray(body.extraClues) ? body.extraClues.slice(0, 7).map((n: any) => num(n, 1, 7, 1)) : [],
    lat,
    lng,
    isCamouflaged: camo,
    offsetRadiusMeters: num(body.offsetRadiusMeters, 10, 5000, 300),
    beaconBroadcastRadiusKm: num(body.beaconBroadcastRadiusKm, 0.1, 100, 5),
    broadcastVisibility: body.broadcastVisibility === 'radius' ? 'radius' : 'all',
    lastActive: Date.now(),
    receivedSanityCount: num(body.receivedSanityCount, 0, 99999, 0),
    isOnline: true,
  };

  const hash = geohashEncode(lat, lng, PRECISION);
  const bucket = await getBucket(env.RADAR_KV, hash);
  const updated = [...bucket.filter((d) => d.id !== id), doc];
  await putBucket(env.RADAR_KV, hash, updated);

  // Coarse bucket (precision 4) is only consulted when scanning with
  // radiusKm > 8. Maintain it for doctors whose broadcast radius is large
  // enough to be found by those scans, OR who broadcast to everyone —
  // halves steady-state writes and conserves the free-tier KV write quota.
  if (doc.broadcastVisibility === 'all' || (doc.beaconBroadcastRadiusKm || 5) > 8) {
    const coarseHash = geohashEncode(lat, lng, 4);
    const coarseBucket = await getBucket(env.RADAR_KV, `c:${coarseHash}`);
    const coarseUpdated = [...coarseBucket.filter((d) => d.id !== id), doc];
    await putBucket(env.RADAR_KV, `c:${coarseHash}`, coarseUpdated);
  }

  return json({ ok: true, geohash: hash });
}

async function handleScan(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const lat = num(url.searchParams.get('lat'), -85, 85, 0);
  const lng = num(url.searchParams.get('lng'), -180, 180, 0);
  const radiusRaw = url.searchParams.get('radius');
  const excludeId = url.searchParams.get('exclude') || '';

  if (!lat && !lng) return json({ error: 'Missing coordinates' }, 400);

  // 全域模式：前端对「探测半径=全域」传一个超大哨兵半径(>=10000)，
  // 此时返回广域格内所有符合条件的在线博士，不再按距离截断。
  const globalMode = (() => {
    if (radiusRaw === 'all' || radiusRaw === 'global') return true;
    const n = Number(radiusRaw);
    return Number.isFinite(n) && n >= 10000;
  })();

  const radiusKm = globalMode ? 100 : num(radiusRaw, 0.1, 100, 5);

  const { doctors, scanCache, scannedCells } = await scanNearby(
    env.RADAR_KV,
    lat,
    lng,
    radiusKm,
    globalMode,
    excludeId,
  );

  return json({
    ok: true,
    doctors,
    scan_cache: scanCache,
    scan_cells: scannedCells,
  });
}

async function handleInteract(request: Request, env: Env): Promise<Response> {
  let body: any;
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }

  const validTypes = ['SANITY', 'INVITE', 'CLUE', 'PING'];
  const type = str(body.type, 10);
  if (!validTypes.includes(type)) return json({ error: 'Invalid interaction type' }, 400);

  const toId = str(body.toDoctorId, 64);
  if (!toId) return json({ error: 'Missing toDoctorId' }, 400);

  const item: InboxItem = {
    id: `it_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type,
    fromDoctorId: str(body.fromDoctorId, 64),
    fromDoctorName: str(body.fromDoctorName, 48),
    fromAssistantName: str(body.fromAssistantName, 48),
    toDoctorId: toId,
    timestamp: Date.now(),
    message: str(body.message, 500),
  };

  const key = `inbox:${toId}`;
  const existing: InboxItem[] = (await env.RADAR_KV.get<InboxItem[]>(key, 'json')) || [];
  const updated = [item, ...existing].slice(0, MAX_INBOX);
  await env.RADAR_KV.put(key, JSON.stringify(updated), { expirationTtl: INBOX_TTL });

  return json({ ok: true });
}

async function handleInbox(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const id = url.searchParams.get('id') || '';
  if (!id) return json({ error: 'Missing id' }, 400);

  const key = `inbox:${id}`;
  const items: InboxItem[] = (await env.RADAR_KV.get<InboxItem[]>(key, 'json')) || [];

  // Clear inbox after reading
  if (items.length > 0) {
    await env.RADAR_KV.delete(key);
  }

  return json({ ok: true, items });
}

// Proxy reverse geocoding through Gaode (AMap) WebService API.
// Keeps the Gaode key server-side so clients only talk to our Worker origin.
// Key is injected via the GAODE_KEY secret — never hardcode it in source.
function gaodeKey(env: Env): string {
  return env.GAODE_KEY || '';
}

function getGaodeUrl(env: Env, path: string, params: Record<string, string>): string | null {
  const key = gaodeKey(env);
  if (!key) return null;
  const qs = new URLSearchParams({ key, ...params }).toString();
  return `https://restapi.amap.com/v3/${path}?${qs}`;
}

async function handleGeoReverse(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const lat = num(url.searchParams.get('lat'), -85, 85, null);
  const lng = num(url.searchParams.get('lng'), -180, 180, null);
  if (lat === null || lng === null) return json({ ok: false, error: 'lat/lng required' }, 400);

  const gaodeUrl = getGaodeUrl(env, 'geocode/regeo', {
    location: `${lng},${lat}`,
    extensions: 'base',
  });
  if (!gaodeUrl) return json({ ok: false, error: 'Gaode key not configured' });

  try {
    // Gaode regeo expects location=lng,lat
    const res = await fetch(gaodeUrl);
    const data: any = await res.json();
    const comp = data?.regeocode?.addressComponent;
    if (data.status === '1' && comp) {
      const province = comp.province || '';
      const city = comp.city || province;
      const district = comp.district || '';
      const street = comp.streetNumber?.street || comp.township || '';
      const formatted = data.regeocode.formattedAddress
        || [province, city, district, street].filter(Boolean).join('');
      return json({
        ok: true,
        address: formatted,
        city,
        district,
        street,
      });
    }
    return json({ ok: false, error: data?.info || 'Gaode geo failed' });
  } catch (e: any) {
    return json({ ok: false, error: e?.message || 'geo proxy failed' });
  }
}

async function handleGeoIP(request: Request, env: Env): Promise<Response> {
  const cf = (request as any).cf;
  const clientIP = cf?.connectingIP
    || request.headers.get('CF-Connecting-IP')
    || request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim()
    || '';

  if (!clientIP) {
    return json({ ok: false, error: 'No client IP', cfKeys: cf ? Object.keys(cf) : [] });
  }

  const gaodeUrl = getGaodeUrl(env, 'ip', { ip: clientIP, type: '4' });
  // Use Gaode IP geolocation API for precise location
  try {
    const res = await fetch(gaodeUrl || '');
    const data: any = await res.json();
    if (data.status === '1' && data.location) {
      const [lng, lat] = data.location.split(',').map(Number);
      if (lat && lng) {
        return json({
          ok: true,
          lat,
          lng,
          city: data.city || data.province || '',
          country: data.country || '中国',
          clientIP,
        });
      }
    }
    // Fallback to CF edge location
    if (cf?.latitude && cf?.longitude) {
      return json({
        ok: true,
        lat: parseFloat(cf.latitude),
        lng: parseFloat(cf.longitude),
        city: cf.city || cf.region || '',
        country: cf.country || '',
        clientIP,
      });
    }
  } catch (e: any) {
    // Fallback to CF edge location
    if (cf?.latitude && cf?.longitude) {
      return json({
        ok: true,
        lat: parseFloat(cf.latitude),
        lng: parseFloat(cf.longitude),
        city: cf.city || cf.region || '',
        country: cf.country || '',
        clientIP,
      });
    }
  }

  return json({ ok: false, error: 'All geolocation methods failed', clientIP });
}

async function handleOffline(request: Request, env: Env): Promise<Response> {
  let body: any;
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }

  const id = str(body.id, 64);
  const lat = num(body.lat, -85, 85, 0);
  const lng = num(body.lng, -180, 180, 0);

  if (!id || (!lat && !lng)) return json({ ok: true }); // best effort

  await removeFromBuckets(env.RADAR_KV, id, lat, lng);

  return json({ ok: true });
}

// ---------------------------------------------------------------------------
// Simple per-isolate rate limiter (best-effort abuse prevention)
// Uses in-memory Map — resets per isolate, no KV writes. Blocks excessive
// requests from the same IP within a short window.
// ---------------------------------------------------------------------------
interface RateEntry { count: number; resetAt: number; }
const rateBuckets = new Map<string, RateEntry>();

function rateLimit(key: string, limit: number, windowSec: number): boolean {
  const now = Date.now();
  const entry = rateBuckets.get(key);
  if (!entry || now >= entry.resetAt) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    return true;
  }
  entry.count += 1;
  if (entry.count > limit) {
    rateBuckets.set(key, { count: entry.count, resetAt: entry.resetAt });
    return false;
  }
  return true;
}

function clientKey(request: Request): string {
  const cf = (request as any).cf;
  return cf?.connectingIP || request.headers.get('CF-Connecting-IP') || 'unknown';
}

// ---------------------------------------------------------------------------
// Main fetch handler
// ---------------------------------------------------------------------------
export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // API routes
    if (url.pathname.startsWith('/api/')) {
      // Rate limit write endpoints (ping/interact/offline) per IP:
      // 10 requests / 10s window — blocks naive flood abuse, generous for real users
      const isWriteEndpoint =
        (url.pathname === '/api/radar/ping' && request.method === 'POST') ||
        (url.pathname === '/api/radar/interact' && request.method === 'POST') ||
        (url.pathname === '/api/radar/offline' && request.method === 'POST');
      if (isWriteEndpoint && !rateLimit(`w:${clientKey(request)}`, 10, 10)) {
        return json({ error: 'Too many requests, slow down' }, 429);
      }
      try {
        if (url.pathname === '/api/radar/ping' && request.method === 'POST') {
          return await handlePing(request, env);
        }
        if (url.pathname === '/api/radar/scan' && request.method === 'GET') {
          return await handleScan(request, env);
        }
        if (url.pathname === '/api/radar/interact' && request.method === 'POST') {
          return await handleInteract(request, env);
        }
        if (url.pathname === '/api/radar/inbox' && request.method === 'GET') {
          return await handleInbox(request, env);
        }
        if (url.pathname === '/api/radar/offline' && request.method === 'POST') {
          return await handleOffline(request, env);
        }
        if (url.pathname === '/api/radar/geoip' && request.method === 'GET') {
          return await handleGeoIP(request, env);
        }
        if (url.pathname === '/api/geo/reverse' && request.method === 'GET') {
          return await handleGeoReverse(request, env);
        }
        return json({ error: 'Not found' }, 404);
      } catch (e: any) {
        return json({ error: 'Internal error', detail: e?.message }, 500);
      }
    }

    // 404 for unknown non-API routes
    return new Response('Not Found', { status: 404 });
  },
};
