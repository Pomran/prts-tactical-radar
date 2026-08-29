/**
 * PRTS Tactical Radar — persistent beacons (常驻信标).
 *
 * A beacon is a doctor's presence profile persisted in D1 so that OFFLINE users
 * stay discoverable: others can see the beacon on the radar and send
 * interactions (SANITY/INVITE/CLUE/PING) that land in the owner's inbox and are
 * pushed over WS when they reconnect.
 *
 * Data model: one row per doctor (doctor_id PK, upserted). TTL 24h; a beacon is
 * refreshed automatically whenever the owner comes online, and expired rows are
 * ignored at read time (and lazily cleaned).
 */
import { haversineMeters } from './geo';

const BEACON_TTL_SEC = 24 * 60 * 60; // 24 hours

export interface BeaconRow {
  doctor_id: string;
  profile_json: string;
  message: string;
  lat: number;
  lng: number;
  created_at: number;
  expires_at: number;
}

export interface BeaconPayload {
  id: string;
  name: string;
  title: string;
  level: number;
  uid: string;
  server: string;
  assistant: any;
  supportOperators: any[];
  motto: string;
  wantedClues: number[];
  extraClues: number[];
  isCamouflaged: boolean;
  offsetRadiusMeters: number;
  beaconBroadcastRadiusKm: number;
  broadcastVisibility: 'all' | 'radius';
  receivedSanityCount: number;
}

/** Sanitize a client-supplied beacon payload into a storable profile + coords. */
export function sanitizeBeacon(body: any): { doc: BeaconPayload; lat: number; lng: number; message: string } | null {
  const id = typeof body?.id === 'string' ? body.id.slice(0, 64) : '';
  if (!id) return null;
  const lat = num(body?.lat, -85, 85, 0);
  const lng = num(body?.lng, -180, 180, 0);
  if (!lat && !lng) return null;

  const doc: BeaconPayload = {
    id,
    name: str(body?.name, 32, 'Doctor'),
    title: str(body?.title, 40, '罗德岛指挥官'),
    level: num(body?.level, 1, 180, 120),
    uid: str(body?.uid, 16, '--------'),
    server: str(body?.server, 16, 'CN_OFFICIAL'),
    assistant: sanitizeOp(body?.assistant),
    supportOperators: Array.isArray(body?.supportOperators)
      ? body.supportOperators.slice(0, 4).map((s: any) => ({
          operator: sanitizeOp(s?.operator),
          level: num(s?.level, 0, 120, 90),
          elite: num(s?.elite, 0, 3, 2),
          skillLevel: str(s?.skillLevel, 20, '专精 3'),
        }))
      : [],
    motto: str(body?.motto, 200),
    wantedClues: Array.isArray(body?.wantedClues) ? body.wantedClues.slice(0, 7).map((n: any) => num(n, 1, 7, 1)) : [],
    extraClues: Array.isArray(body?.extraClues) ? body.extraClues.slice(0, 7).map((n: any) => num(n, 1, 7, 1)) : [],
    isCamouflaged: !!body?.isCamouflaged,
    offsetRadiusMeters: num(body?.offsetRadiusMeters, 10, 5000, 300),
    beaconBroadcastRadiusKm: num(body?.beaconBroadcastRadiusKm, 0.1, 100, 5),
    broadcastVisibility: body?.broadcastVisibility === 'radius' ? 'radius' : 'all',
    receivedSanityCount: num(body?.receivedSanityCount, 0, 99999, 0),
  };
  return { doc, lat, lng, message: str(body?.message, 300) };
}

/** Upsert the owner's beacon (refreshing TTL). Returns true on success. */
export async function putBeacon(db: D1Database, payload: BeaconPayload, lat: number, lng: number, message: string): Promise<boolean> {
  const now = Date.now();
  try {
    await db.prepare(
      `INSERT INTO beacons (doctor_id, profile_json, message, lat, lng, created_at, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(doctor_id) DO UPDATE SET
         profile_json = excluded.profile_json,
         message = excluded.message,
         lat = excluded.lat,
         lng = excluded.lng,
         expires_at = excluded.expires_at`,
    )
      .bind(payload.id, JSON.stringify(payload), message, lat, lng, now, now + BEACON_TTL_SEC * 1000)
      .run();
    return true;
  } catch {
    return false;
  }
}

/** Delete a beacon (owner removed it or went offline deliberately). */
export async function removeBeacon(db: D1Database, doctorId: string): Promise<boolean> {
  try {
    await db.prepare('DELETE FROM beacons WHERE doctor_id = ?').bind(doctorId).run();
    return true;
  } catch {
    return false;
  }
}

/**
 * Query beacons near a point, returned as wire doctor objects. Expired rows are
 * skipped (and lazily deleted). `exclude` hides the caller's own beacon.
 * `global` disables the radius cutoff. Result is distance-sorted.
 */
export async function queryBeacons(
  db: D1Database,
  lat: number,
  lng: number,
  radiusKm: number,
  exclude: string,
  global: boolean,
): Promise<(Record<string, unknown> & { distance: number })[]> {
  const now = Date.now();
  let rows: BeaconRow[];
  try {
    const { results } = await db.prepare(
      'SELECT doctor_id, profile_json, message, lat, lng, created_at, expires_at FROM beacons WHERE expires_at > ?',
    ).bind(now).all<BeaconRow>();
    rows = results;
  } catch {
    return [];
  }

  const out: (Record<string, unknown> & { distance: number })[] = [];
  for (const r of rows) {
    if (r.doctor_id === exclude) continue;
    if (!Number.isFinite(r.lat) || !Number.isFinite(r.lng)) continue;
    const dist = haversineMeters(lat, lng, r.lat, r.lng);
    if (!global && dist > radiusKm * 1000) continue;
    let profile: BeaconPayload;
    try { profile = JSON.parse(r.profile_json); } catch { continue; }
    if (!profile || profile.id !== r.doctor_id) continue;

    out.push({
      ...profile,
      lat: r.lat,
      lng: r.lng,
      isOnline: false,
      isBeacon: true,
      beaconMessage: r.message,
      beaconCreatedAt: r.created_at,
      lastActive: r.created_at,
      distance: dist,
    });
  }
  out.sort((a, b) => a.distance - b.distance);

  // Lazy cleanup of this query's expired rows (best-effort, low volume).
  db.prepare('DELETE FROM beacons WHERE expires_at <= ?').bind(now).run().catch(() => {});

  return out;
}

/** Refresh a beacon's TTL whenever the owner comes online (keeps active users' beacons alive). */
export async function refreshBeaconOnOnline(db: D1Database, doctorId: string): Promise<void> {
  if (!doctorId) return;
  const now = Date.now();
  try {
    await db.prepare(
      'UPDATE beacons SET expires_at = ? WHERE doctor_id = ?',
    ).bind(now + BEACON_TTL_SEC * 1000, doctorId).run();
  } catch { /* ignore */ }
}

function sanitizeOp(o: any): any {
  return {
    opId: typeof o?.opId === 'string' ? o.opId.slice(0, 40) : undefined,
    dataUrl: typeof o?.dataUrl === 'string' && o.dataUrl.startsWith('data:image/') ? o.dataUrl.slice(0, 150000) : undefined,
    name: str(o?.name, 40, 'Unknown'),
    cnName: str(o?.cnName, 40, '未知'),
    color: typeof o?.color === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(o.color) ? o.color : '#00e5ff',
    masterySkill: str(o?.masterySkill, 60),
  };
}

function num(v: unknown, min: number, max: number, fallback: number): number {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
}

function str(v: unknown, maxLen: number, fallback = ''): string {
  return typeof v === 'string' ? v.slice(0, maxLen) : fallback;
}
