/**
 * PRTS Tactical Radar — Frontend API Client
 *
 * Communicates with the Cloudflare Worker backend for real presence + scan.
 * Falls back gracefully when the backend is unavailable (local dev / no worker).
 */
import { DoctorProfile, Operator, TacticalInteraction, ServerRegion, RadarFilter, LightPresence, WireOperator } from '../types';
import { OPERATOR_DATABASE } from '../data/operators';

// ---------------------------------------------------------------------------
// Device ID — stable anonymous identity stored in localStorage
// ---------------------------------------------------------------------------
const DEVICE_KEY = 'prts_device_id';

export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `d_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

// ---------------------------------------------------------------------------
// User settings persistence — static profile settings & radar filters,
// persisted to localStorage so they survive page reloads.
// ---------------------------------------------------------------------------
const PROFILE_KEY = 'prts_profile_settings';
const FILTER_KEY = 'prts_filter_settings';

/** Persistable subset of DoctorProfile (user preferences, NOT live location) */
export function saveProfileSettings(p: DoctorProfile): void {
  try {
    const data = {
      name: p.name,
      title: p.title,
      level: p.level,
      uid: p.uid,
      server: p.server,
      assistant: p.assistant,
      sanity: p.sanity,
      motto: p.motto,
      supportOperators: p.supportOperators,
      wantedClues: p.wantedClues,
      extraClues: p.extraClues,
      isCamouflaged: p.isCamouflaged,
      offsetRadiusMeters: p.offsetRadiusMeters,
      beaconBroadcastRadiusKm: p.beaconBroadcastRadiusKm,
      broadcastVisibility: p.broadcastVisibility || 'all',
    };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

export function loadProfileSettings(): Partial<DoctorProfile> | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

export function clearProfileSettings(): void {
  try { localStorage.removeItem(PROFILE_KEY); } catch { /* ignore */ }
}

export function saveFilterSettings(f: RadarFilter): void {
  try { localStorage.setItem(FILTER_KEY, JSON.stringify(f)); } catch { /* ignore */ }
}

export function loadFilterSettings(): RadarFilter | null {
  try {
    const raw = localStorage.getItem(FILTER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

// ---------------------------------------------------------------------------
// Wire helpers — map between API payloads and app types
// ---------------------------------------------------------------------------
function toWire(op: Operator): WireOperator {
  const db = OPERATOR_DATABASE.find((o) => o.id === op.id);
  if (db && db.avatar === op.avatar) {
    // Uses the built-in SVG avatar — send only the opId
    return { opId: db.id, name: db.name, cnName: db.cnName, color: db.color, masterySkill: db.masterySkill };
  }
  // Custom (uploaded) avatar — send the data URL
  return { dataUrl: op.avatar, name: op.name, cnName: op.cnName, color: op.color, masterySkill: op.masterySkill };
}

function fromWire(w: WireOperator): Operator {
  if (w.opId) {
    const db = OPERATOR_DATABASE.find((o) => o.id === w.opId);
    if (db) return db;
  }
  // Custom or unknown operator — create a placeholder
  return {
    id: w.opId || `custom_${Math.random().toString(36).slice(2, 8)}`,
    name: w.name || 'Unknown',
    cnName: w.cnName || '未知干员',
    rarity: 6,
    classType: 'Vanguard',
    faction: 'Rhodes Island',
    color: w.color || '#00e5ff',
    avatar: w.dataUrl || '',
    quote: '',
    masterySkill: w.masterySkill,
  };
}

function buildPresencePayload(p: DoctorProfile) {
  return {
    id: p.id,
    name: p.name,
    title: p.title,
    level: p.level,
    uid: p.uid,
    server: p.server,
    assistant: toWire(p.assistant),
    supportOperators: p.supportOperators.map((s) => ({
      operator: toWire(s.operator),
      level: s.level,
      elite: s.elite,
      skillLevel: s.skillLevel,
    })),
    motto: p.motto,
    wantedClues: p.wantedClues,
    extraClues: p.extraClues,
    lat: p.lat,
    lng: p.lng,
    isCamouflaged: p.isCamouflaged,
    offsetRadiusMeters: p.offsetRadiusMeters,
    beaconBroadcastRadiusKm: p.beaconBroadcastRadiusKm,
    broadcastVisibility: p.broadcastVisibility || 'all',
    receivedSanityCount: p.receivedSanityCount,
  };
}

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------
async function jfetch(url: string, init?: RequestInit): Promise<any> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

/** Map a wire presence (from scan or WS push) into a displayable DoctorProfile. */
export function toDoctorProfile(d: any): DoctorProfile {
  const assistant = fromWire(d.assistant || {});
  const supports = (d.supportOperators || []).map((s: any) => ({
    operator: fromWire(s.operator || {}),
    level: s.level ?? 90,
    elite: s.elite ?? 2,
    skillLevel: s.skillLevel ?? '专精 3',
  }));

  // Build lastActive string
  let lastActive = '刚刚在线';
  if (d.lastActive) {
    const mins = Math.floor((Date.now() - d.lastActive) / 60000);
    lastActive = mins < 1 ? '刚刚在线' : `${mins}分钟前`;
  }

  return {
    id: d.id,
    name: d.name || 'Doctor',
    title: d.title || '罗德岛指挥官',
    level: d.level || 120,
    uid: d.uid || '--------',
    server: (d.server || 'CN_OFFICIAL') as ServerRegion,
    assistant,
    sanity: { current: 100, max: 135 }, // not broadcast
    motto: d.motto || '',
    supportOperators: supports,
    wantedClues: d.wantedClues || [],
    extraClues: d.extraClues || [],
    lat: d.lat,
    lng: d.lng,
    jitterLat: d.lat,
    jitterLng: d.lng,
    isCamouflaged: d.isCamouflaged ?? false,
    offsetRadiusMeters: d.offsetRadiusMeters ?? 300,
    beaconBroadcastRadiusKm: d.beaconBroadcastRadiusKm ?? 5,
    broadcastVisibility: d.broadcastVisibility ?? 'all',
    lastActive,
    receivedSanityCount: d.receivedSanityCount ?? 0,
    isOnline: d.isOnline ?? true,
    distance: d.distance ?? 0,
    isBeacon: d.isBeacon ?? false,
    beaconMessage: d.beaconMessage || undefined,
  } satisfies DoctorProfile;
}

/** Map a DoctorProfile into the wire presence payload shared by ping + WS. */
export function toLightPresence(p: DoctorProfile): LightPresence {
  return {
    id: p.id,
    name: p.name,
    title: p.title,
    level: p.level,
    uid: p.uid,
    server: p.server,
    assistant: toWire(p.assistant),
    supportOperators: p.supportOperators.map((s) => ({
      operator: toWire(s.operator),
      level: s.level,
      elite: s.elite,
      skillLevel: s.skillLevel,
    })),
    motto: p.motto,
    wantedClues: p.wantedClues,
    extraClues: p.extraClues,
    lat: p.lat,
    lng: p.lng,
    isCamouflaged: p.isCamouflaged,
    offsetRadiusMeters: p.offsetRadiusMeters ?? 300,
    beaconBroadcastRadiusKm: p.beaconBroadcastRadiusKm ?? 5,
    broadcastVisibility: p.broadcastVisibility || 'all',
    lastActive: Date.now(),
    receivedSanityCount: p.receivedSanityCount ?? 0,
    isOnline: true,
  };
}

// ---------------------------------------------------------------------------
// Presence ping — throttled to conserve the free-tier KV write quota
// (Cloudflare Workers KV caps writes at 1000/day).
//
// ping() only fires a network request when either:
//   a) the presence payload changed meaningfully (coords / beacon radius /
//      assistant / camouflage / broadcast data), or
//   b) the throttle window has elapsed.
// This collapses rapid refreshes and repeated in-page location updates into a
// single KV write per window instead of one write per call.
// ---------------------------------------------------------------------------
const PING_THROTTLE_MS = 5 * 60 * 1000; // 5 minutes
let lastPingAt = 0;
let lastPingSig = '';

function presenceSignature(p: DoctorProfile): string {
  return [
    p.id,
    p.lat.toFixed(4),
    p.lng.toFixed(4),
    p.isCamouflaged ? '1' : '0',
    Math.round(p.offsetRadiusMeters || 0),
    Math.round((p.beaconBroadcastRadiusKm || 0) * 10),
    p.broadcastVisibility || 'all',
    p.assistant?.id || p.assistant?.name || '',
    p.name,
    p.uid,
  ].join('|');
}

// ---------------------------------------------------------------------------
// API client
// ---------------------------------------------------------------------------
export const radarApi = {
  /** Report presence / heartbeat (fire-and-forget, throttled) */
  async ping(profile: DoctorProfile): Promise<void> {
    const now = Date.now();
    const sig = presenceSignature(profile);
    // Skip if unchanged AND within the throttle window
    if (now - lastPingAt < PING_THROTTLE_MS && sig === lastPingSig) {
      return;
    }
    lastPingAt = now;
    lastPingSig = sig;
    await jfetch('/api/radar/ping', {
      method: 'POST',
      body: JSON.stringify(buildPresencePayload(profile)),
    });
  },

  /** Scan for nearby doctors — returns DoctorProfile[] sorted by distance */
  async scan(
    lat: number,
    lng: number,
    radiusKm: number,
    excludeId: string,
  ): Promise<DoctorProfile[]> {
    const data = await jfetch(
      `/api/radar/scan?lat=${lat}&lng=${lng}&radius=${radiusKm}&exclude=${encodeURIComponent(excludeId)}`,
    );
    return (data.doctors || []).map(toDoctorProfile);
  },

  /** Send an interaction (fire-and-forget) */
  async interact(interaction: {
    type: string;
    fromDoctorId: string;
    fromDoctorName: string;
    fromAssistantName: string;
    toDoctorId: string;
    message: string;
  }): Promise<void> {
    await jfetch('/api/radar/interact', {
      method: 'POST',
      body: JSON.stringify(interaction),
    }).catch(() => {}); // best-effort
  },

  /** Get pending inbox items for a doctor */
  async inbox(doctorId: string): Promise<TacticalInteraction[]> {
    const data = await jfetch(
      `/api/radar/inbox?id=${encodeURIComponent(doctorId)}`,
    );
    return (data.items || []) as TacticalInteraction[];
  },

  /** Best-effort offline notification (uses sendBeacon) */
  offline(profile: DoctorProfile): void {
    try {
      const payload = JSON.stringify({ id: profile.id, lat: profile.lat, lng: profile.lng });
      navigator.sendBeacon(
        '/api/radar/offline',
        new Blob([payload], { type: 'application/json' }),
      );
    } catch { /* ignore */ }
  },

  /** Place/refresh a persistent beacon at my current location (offline discoverable). */
  async placeBeacon(profile: DoctorProfile, message = ''): Promise<void> {
    const payload = { ...buildPresencePayload(profile), message };
    await jfetch('/api/radar/beacon', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /** Remove my persistent beacon. */
  async removeBeacon(id: string): Promise<void> {
    await jfetch(`/api/radar/beacon?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
  },
};
