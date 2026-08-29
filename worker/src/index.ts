/**
 * PRTS Tactical Radar — Cloudflare Worker API
 *
 * Realtime presence is owned by the PresenceCoordinator Durable Object
 * (Level 1 = memory + WebSockets). This Worker:
 *   - terminates HTTP API routes (ping/scan/interact/inbox/offline) and proxies
 *     presence traffic to the DO, keeping response shapes backward-compatible
 *     for the Web app and the WeChat miniapp,
 *   - terminates the WebSocket upgrade at /api/radar/ws and hands the
 *     connection to the DO,
 *   - serves Level 2/3 persistence via D1 (user profiles, last-seen, inbox).
 * KV is no longer on the presence write path.
 */
import { Env } from './env';
import { PresenceCoordinator } from './presence';
import { sanitizeBeacon, putBeacon, removeBeacon, queryBeacons, queryMyBeacon, refreshBeaconOnOnline } from './beacon';

export { PresenceCoordinator };

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
// Geohash (kept for the legacy `geohash` response field — presence no longer
// reads KV buckets, but the ping response shape is preserved for compat).
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

// ---------------------------------------------------------------------------
// Helpers
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

const PRECISION = 5;

// ---------------------------------------------------------------------------
// Presence DO stub access
// ---------------------------------------------------------------------------
function presenceStub(env: Env): DurableObjectStub {
  return env.PRESENCE.get(env.PRESENCE.idFromName('global'));
}

// ---------------------------------------------------------------------------
// Request handlers
// ---------------------------------------------------------------------------
async function handlePing(request: Request, env: Env): Promise<Response> {
  let body: any;
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }

  const id = str(body.id, 64);
  if (!id) return json({ error: 'Missing id' }, 400);

  const lat = num(body.lat, -85, 85, 0);
  const lng = num(body.lng, -180, 180, 0);
  if (!lat && !lng) return json({ error: 'Invalid coordinates' }, 400);

  // Forward to the Presence DO (it owns sanitization + memory). No KV write.
  const res = await presenceStub(env).fetch('https://presence.local/presence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  await res.arrayBuffer(); // drain
  if (!res.ok) return json({ ok: false, error: 'presence failed' }, 502);

  // Coming online refreshes an existing beacon's TTL (active users stay visible).
  await refreshBeaconOnOnline(env.DB, id);

  return json({ ok: true, geohash: geohashEncode(lat, lng, PRECISION) });
}

async function handleScan(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const lat = num(url.searchParams.get('lat'), -85, 85, 0);
  const lng = num(url.searchParams.get('lng'), -180, 180, 0);
  const radiusRaw = url.searchParams.get('radius');
  const excludeId = url.searchParams.get('exclude') || '';

  if (!lat && !lng) return json({ error: 'Missing coordinates' }, 400);

  const globalMode = (() => {
    if (radiusRaw === 'all' || radiusRaw === 'global') return true;
    const n = Number(radiusRaw);
    return Number.isFinite(n) && n >= 10000;
  })();
  const radiusKm = globalMode ? 100 : num(radiusRaw, 0.1, 100, 5);

  const res = await presenceStub(env).fetch(
    `https://presence.local/snapshot?lat=${lat}&lng=${lng}&radius=${radiusKm}&exclude=${encodeURIComponent(excludeId)}&global=${globalMode ? '1' : '0'}`,
  );
  const data: any = await res.json().catch(() => ({ ok: false }));

  // Merge persistent beacons (offline discoverable users) with live presence.
  const beacons = await queryBeacons(env.DB, lat, lng, radiusKm, excludeId, globalMode);

  const doctors = [...(Array.isArray(data?.doctors) ? data.doctors : []), ...beacons];
  doctors.sort((a: any, b: any) => (a.distance ?? 0) - (b.distance ?? 0));

  return json({
    ok: true,
    doctors: doctors.slice(0, 120),
    scan_cache: data?.scan_cache || 'ws',
    scan_cells: data?.scan_cells ?? 0,
    beacon_count: beacons.length,
  });
}

async function handleInteract(request: Request, env: Env): Promise<Response> {
  let body: any;
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }

  const validTypes = ['SANITY', 'INVITE', 'CLUE', 'PING'];
  const type = str(body.type, 10);
  if (!validTypes.includes(type)) return json({ error: 'Invalid interaction type' }, 400);
  if (!str(body.toDoctorId, 64)) return json({ error: 'Missing toDoctorId' }, 400);

  // Written to D1 + pushed to the recipient's live socket by the DO.
  const res = await presenceStub(env).fetch('https://presence.local/interact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data: any = await res.json().catch(() => ({ ok: false }));
  if (!data?.ok) return json({ error: 'Failed to deliver' }, 502);
  return json({ ok: true });
}

async function handleInbox(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const id = url.searchParams.get('id') || '';
  if (!id) return json({ error: 'Missing id' }, 400);

  const { results } = await env.DB.prepare(
    `SELECT id, type, from_doctor_id, from_doctor_name, from_assistant_name, to_doctor_id, message, created_at
     FROM inbox WHERE to_doctor_id = ? ORDER BY created_at DESC LIMIT 50`,
  ).bind(id).all<InboxRow>().catch(() => ({ results: [] } as any));

  const items: InboxItem[] = results.map(rowToItem);

  // Clear inbox after reading (matches legacy KV semantics).
  if (items.length > 0) {
    await env.DB.prepare('DELETE FROM inbox WHERE to_doctor_id = ?').bind(id).run().catch(() => {});
  }

  return json({ ok: true, items });
}

async function handleOffline(request: Request, env: Env): Promise<Response> {
  let body: any;
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }

  const id = str(body.id, 64);
  if (!id) return json({ ok: true }); // best effort

  const res = await presenceStub(env).fetch('https://presence.local/remove', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  await res.arrayBuffer(); // drain
  return json({ ok: true });
}

// ---------------------------------------------------------------------------
// Persistent beacons (常驻信标) — offline users stay discoverable + interactable
// ---------------------------------------------------------------------------
async function handleBeaconPut(request: Request, env: Env): Promise<Response> {
  let body: any;
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }

  const parsed = sanitizeBeacon(body);
  if (!parsed) return json({ error: 'Invalid beacon payload' }, 400);

  const ok = await putBeacon(env.DB, parsed.doc, parsed.lat, parsed.lng, parsed.message);
  if (!ok) return json({ error: 'Failed to store beacon' }, 502);
  return json({ ok: true });
}

async function handleBeaconDelete(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const id = url.searchParams.get('id') || '';
  if (!id) return json({ error: 'Missing id' }, 400);
  await removeBeacon(env.DB, id);
  return json({ ok: true });
}

async function handleBeaconGet(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const id = url.searchParams.get('doctor_id') || '';
  if (!id) return json({ error: 'Missing doctor_id' }, 400);
  const row = await queryMyBeacon(env.DB, id);
  return json({ ok: true, hasBeacon: !!row, expiresAt: row?.expires_at ?? null });
}

// Proxy reverse geocoding through Gaode (AMap) WebService API.
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
  const lat = num(url.searchParams.get('lat'), -85, 85, null as any);
  const lng = num(url.searchParams.get('lng'), -180, 180, null as any);
  if (lat === null || lng === null) return json({ ok: false, error: 'lat/lng required' }, 400);

  const gaodeUrl = getGaodeUrl(env, 'geocode/regeo', {
    location: `${lng},${lat}`,
    extensions: 'base',
  });
  if (!gaodeUrl) return json({ ok: false, error: 'Gaode key not configured' });

  try {
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
      return json({ ok: true, address: formatted, city, district, street });
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
  try {
    const res = await fetch(gaodeUrl || '');
    const data: any = await res.json();
    if (data.status === '1' && data.location) {
      const [lng, lat] = data.location.split(',').map(Number);
      if (lat && lng) {
        return json({ ok: true, lat, lng, city: data.city || data.province || '', country: data.country || '中国', clientIP });
      }
    }
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

// ---------------------------------------------------------------------------
// Simple per-isolate rate limiter (best-effort abuse prevention)
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

    // WebSocket upgrade → hand off to the Presence DO.
    if (url.pathname === '/api/radar/ws') {
      return presenceStub(env).fetch(request);
    }

    // API routes
    if (url.pathname.startsWith('/api/')) {
      const isWriteEndpoint =
        (url.pathname === '/api/radar/ping' && request.method === 'POST') ||
        (url.pathname === '/api/radar/interact' && request.method === 'POST') ||
        (url.pathname === '/api/radar/offline' && request.method === 'POST') ||
        (url.pathname === '/api/radar/beacon' && request.method === 'POST') ||
        (url.pathname === '/api/radar/beacon' && request.method === 'DELETE');
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
        if (url.pathname === '/api/radar/beacon' && request.method === 'POST') {
          return await handleBeaconPut(request, env);
        }
        if (url.pathname === '/api/radar/beacon' && request.method === 'GET') {
          return await handleBeaconGet(request, env);
        }
        if (url.pathname === '/api/radar/beacon' && request.method === 'DELETE') {
          return await handleBeaconDelete(request, env);
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

interface InboxRow {
  id: string;
  type: string;
  from_doctor_id: string;
  from_doctor_name: string | null;
  from_assistant_name: string | null;
  to_doctor_id: string;
  message: string | null;
  created_at: number;
}

function rowToItem(r: InboxRow): InboxItem {
  return {
    id: r.id,
    type: r.type,
    fromDoctorId: r.from_doctor_id,
    fromDoctorName: r.from_doctor_name || '',
    fromAssistantName: r.from_assistant_name || '',
    toDoctorId: r.to_doctor_id,
    message: r.message || '',
    timestamp: r.created_at,
  };
}
