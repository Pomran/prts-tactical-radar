/**
 * PRTS Tactical Radar — PresenceCoordinator Durable Object.
 *
 * Level 1 realtime presence: a single DO instance ("global") holds all live
 * sessions in memory, each backed by a hibernatable WebSocket. Online == an
 * open WebSocket, so there is NO per-ping KV/D1 write on the hot path.
 *
 * Client protocol (over WS):
 *   →  { type: 'presence:set', presence: {...DoctorProfile} }   upsert own presence
 *   ←  { type: 'presence:init',  users: [...] }                  full visible snapshot
 *   ←  { type: 'presence:join',  user: {...} }                   new visible user
 *   ←  { type: 'presence:update', user: {...} }                  visible user changed
 *   ←  { type: 'presence:leave', userId: '...' }                 user went offline
 *   ←  { type: 'inbox:deliver', items: [...] }                   new inbox items (if any)
 *
 * Visibility: each user's presence is only pushed to sockets that may legally
 * see them (broadcastVisibility 'all', or 'radius' within beaconBroadcastRadiusKm
 * of the observer). This preserves the previous server-side privacy semantics —
 * we do NOT leak hidden ('radius') users to arbitrary clients.
 *
 * HTTP RPC (worker → DO, for the HTTP API + miniapp compat):
 *   GET  /snapshot?lat&lng&radius&exclude&global  → filtered doctors
 *   POST /presence                                → upsert (HTTP ping path)
 *   POST /interact                                → write inbox + push delivery
 *   POST /remove                                  → leave (HTTP offline path)
 *   GET  /stats                                   → debug: { online, sockets }
 */
import { Env } from './env';
import { haversineMeters } from './geo';

export interface WireOperator {
  opId?: string;
  dataUrl?: string;
  name: string;
  cnName: string;
  color: string;
  masterySkill?: string;
}

export interface WireSupport {
  operator: WireOperator;
  level: number;
  elite: number;
  skillLevel: string;
}

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

interface SocketMeta {
  userId: string;
  // Observer's own location, needed to evaluate 'radius' visibility of others.
  lat?: number;
  lng?: number;
}

const TTL_SEC = 600; // presence freshness (fallback for disconnected-but-cached)
const MAX_RESPONSE = 120;

/** Lightweight per-connection context stored in the WS attachment (hibernation-safe). */
function attachMeta(ws: WebSocket): SocketMeta | null {
  try {
    const m = ws.deserializeAttachment() as SocketMeta | null;
    return m && m.userId ? m : null;
  } catch {
    return null;
  }
}

export class PresenceCoordinator {
  private state: DurableObjectState;
  private env: Env;
  private users = new Map<string, Presence>();

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  // -------------------------------------------------------------------------
  // Entry
  // -------------------------------------------------------------------------
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // WebSocket upgrade → own the connection (hibernation).
    if (request.headers.get('Upgrade')?.toLowerCase() === 'websocket') {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      this.state.acceptWebSocket(server);
      return new Response(null, { status: 101, webSocket: client });
    }

    // HTTP RPC from the entry Worker.
    switch (url.pathname) {
      case '/snapshot': {
        const lat = num(url.searchParams.get('lat'), -85, 85, 0);
        const lng = num(url.searchParams.get('lng'), -180, 180, 0);
        const radiusKm = num(url.searchParams.get('radius'), 0.1, 100, 5);
        const exclude = url.searchParams.get('exclude') || '';
        const global = url.searchParams.get('global') === '1';
        return json(this.snapshot(lat, lng, radiusKm, exclude, global));
      }
      case '/presence': {
        const body: any = await request.json().catch(() => ({}));
        const p = this.sanitize(body);
        if (!p) return json({ ok: false, error: 'Invalid presence' }, 400);
        await this.upsert(p, null);
        return json({ ok: true });
      }
      case '/interact': {
        const body: any = await request.json().catch(() => ({}));
        const ok = await this.deliverInteraction(body);
        return json({ ok });
      }
      case '/remove': {
        const body: any = await request.json().catch(() => ({}));
        const id = typeof body?.id === 'string' ? body.id : '';
        if (id) {
          this.users.delete(id);
          this.broadcastAll({ type: 'presence:leave', userId: id });
        }
        return json({ ok: true });
      }
      case '/stats': {
        return json({ ok: true, online: this.users.size, sockets: this.state.getWebSockets().length });
      }
      default:
        return json({ error: 'Not found' }, 404);
    }
  }

  // -------------------------------------------------------------------------
  // WebSocket lifecycle (Hibernation API)
  // -------------------------------------------------------------------------
  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    let msg: any;
    try { msg = JSON.parse(String(message)); } catch { return; }
    if (!msg || msg.type !== 'presence:set' || !msg.presence) return;

    const p = this.sanitize(msg.presence);
    if (!p) return;
    await this.upsert(p, ws);
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean): Promise<void> {
    const meta = attachMeta(ws);
    if (!meta) return;
    const { userId } = meta;

    // Only remove presence if this was the last socket for this user.
    const remaining = this.state.getWebSockets().some((w) => {
      const m = attachMeta(w);
      return w !== ws && m?.userId === userId;
    });
    if (remaining) return;

    const p = this.users.get(userId);
    this.users.delete(userId);
    this.broadcastAll({ type: 'presence:leave', userId });

    // Level 2: record last-seen in D1 (best-effort).
    if (p) {
      this.env.DB.prepare(
        `INSERT INTO users (id, profile_json, last_active, last_lat, last_lng, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           profile_json = excluded.profile_json,
           last_active = excluded.last_active,
           last_lat = excluded.last_lat,
           last_lng = excluded.last_lng,
           updated_at = excluded.updated_at`,
      )
        .bind(p.id, JSON.stringify(p), Date.now(), p.lat, p.lng, Date.now())
        .run()
        .catch(() => {});
    }
  }

  // -------------------------------------------------------------------------
  // Core presence operations
  // -------------------------------------------------------------------------
  private async upsert(p: Presence, ws: WebSocket | null): Promise<void> {
    const isNew = !this.users.has(p.id);
    this.users.set(p.id, p);

    // Refresh this socket's attachment (observer location for visibility calc).
    if (ws) ws.serializeAttachment({ userId: p.id, lat: p.lat, lng: p.lng });

    if (ws) {
      // A newly joined socket needs the full visible snapshot.
      const visible = this.visibleToSocket(ws, [...this.users.values()]);
      ws.send(JSON.stringify({ type: 'presence:init', users: visible }));

      // Deliver any pending inbox items for this user.
      await this.pushInbox(ws, p.id);
    }

    // Broadcast the join/update delta to everyone else who can see this user.
    if (isNew) {
      this.broadcast({ type: 'presence:join', user: p }, p.id);
    } else {
      this.broadcast({ type: 'presence:update', user: p }, p.id);
    }
  }

  /** Doctors a socket may legally see, ordered by distance to the socket. */
  private visibleToSocket(ws: WebSocket, all: Presence[]): Presence[] {
    const meta = attachMeta(ws);
    const obsLat = meta?.lat, obsLng = meta?.lng;
    const out: { p: Presence; d: number }[] = [];
    for (const p of all) {
      if (!this.visibleTo(obsLat, obsLng, p)) continue;
      out.push({ p, d: haversineMeters(obsLat ?? p.lat, obsLng ?? p.lng, p.lat, p.lng) });
    }
    out.sort((a, b) => a.d - b.d);
    return out.map((o) => o.p);
  }

  /** Privacy gate: can observer at (lat,lng) see this presence? */
  private visibleTo(obsLat: number | undefined, obsLng: number | undefined, p: Presence): boolean {
    if (p.broadcastVisibility === 'all') return true;
    // 'radius' visibility: only within the beacon broadcast radius.
    if (obsLat === undefined || obsLng === undefined) return false;
    const dist = haversineMeters(obsLat, obsLng, p.lat, p.lng);
    return dist <= (p.beaconBroadcastRadiusKm || 5) * 1000;
  }

  /** Snapshot endpoint — mirrors the old KV scan response shape. */
  private snapshot(lat: number, lng: number, radiusKm: number, exclude: string, global: boolean): any {
    const now = Date.now();
    const out: (Presence & { distance: number })[] = [];
    for (const p of this.users.values()) {
      if (p.id === exclude) continue;
      if (now - p.lastActive > TTL_SEC * 1000) continue;
      if (!this.visibleTo(lat, lng, p)) continue;
      const d = haversineMeters(lat, lng, p.lat, p.lng);
      if (!global && d > radiusKm * 1000) continue;
      out.push({ ...p, distance: d });
    }
    out.sort((a, b) => a.distance - b.distance);
    return { ok: true, doctors: out.slice(0, MAX_RESPONSE), scan_cache: 'ws', scan_cells: this.users.size };
  }

  /** Broadcast a delta to all sockets EXCEPT those owned by `exceptUserId`. */
  private broadcast(msg: any, exceptUserId: string): void {
    const raw = JSON.stringify(msg);
    for (const ws of this.state.getWebSockets()) {
      const meta = attachMeta(ws);
      if (!meta || meta.userId === exceptUserId) continue;
      // Only push the delta if this socket may see the subject user.
      if (msg.user && !this.visibleTo(meta.lat, meta.lng, msg.user as Presence)) continue;
      try { ws.send(raw); } catch { /* ignore */ }
    }
  }

  private broadcastAll(msg: any): void {
    const raw = JSON.stringify(msg);
    for (const ws of this.state.getWebSockets()) {
      try { ws.send(raw); } catch { /* ignore */ }
    }
  }

  // -------------------------------------------------------------------------
  // Inbox (Level 3) — written by interact, pushed over WS, polled by HTTP
  // -------------------------------------------------------------------------
  private async deliverInteraction(body: any): Promise<boolean> {
    const type = typeof body?.type === 'string' ? body.type.slice(0, 10) : '';
    const toId = typeof body?.toDoctorId === 'string' ? body.toDoctorId : '';
    if (!type || !toId) return false;

    const item = {
      id: `it_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type,
      fromDoctorId: str(body.fromDoctorId, 64),
      fromDoctorName: str(body.fromDoctorName, 48),
      fromAssistantName: str(body.fromAssistantName, 48),
      toDoctorId: toId,
      message: str(body.message, 500),
      timestamp: Date.now(),
    };

    try {
      await this.env.DB.prepare(
        `INSERT INTO inbox (id, type, from_doctor_id, from_doctor_name, from_assistant_name, to_doctor_id, message, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
        .bind(item.id, item.type, item.fromDoctorId, item.fromDoctorName, item.fromAssistantName, item.toDoctorId, item.message, item.timestamp)
        .run();
    } catch {
      return false;
    }

    // Push to the recipient's live socket(s), if any.
    const { results } = await this.env.DB.prepare(
      `SELECT id, type, from_doctor_id, from_doctor_name, from_assistant_name, to_doctor_id, message, created_at
       FROM inbox WHERE to_doctor_id = ? ORDER BY created_at DESC LIMIT 50`,
    ).bind(toId).all<InboxRow>().catch(() => ({ results: [] } as any));
    if (results && results.length > 0) {
      const items = results.map(rowToItem);
      const raw = JSON.stringify({ type: 'inbox:deliver', items });
      for (const ws of this.state.getWebSockets()) {
        const meta = attachMeta(ws);
        if (meta?.userId === toId) { try { ws.send(raw); } catch { /* ignore */ } }
      }
    }
    return true;
  }

  private async pushInbox(ws: WebSocket, userId: string): Promise<void> {
    const { results } = await this.env.DB.prepare(
      `SELECT id, type, from_doctor_id, from_doctor_name, from_assistant_name, to_doctor_id, message, created_at
       FROM inbox WHERE to_doctor_id = ? ORDER BY created_at DESC LIMIT 50`,
    ).bind(userId).all<InboxRow>().catch(() => ({ results: [] } as any));
    if (results && results.length > 0) {
      try {
        ws.send(JSON.stringify({ type: 'inbox:deliver', items: results.map(rowToItem) }));
      } catch { /* ignore */ }
    }
  }

  // -------------------------------------------------------------------------
  // Sanitization (mirrors the old HTTP ping sanitizer)
  // -------------------------------------------------------------------------
  private sanitize(body: any): Presence | null {
    const id = str(body?.id, 64);
    if (!id) return null;
    const lat = num(body?.lat, -85, 85, 0);
    const lng = num(body?.lng, -180, 180, 0);
    if (!lat && !lng) return null;

    const sanitizeOp = (o: any): WireOperator => ({
      opId: typeof o?.opId === 'string' ? o.opId.slice(0, 40) : undefined,
      dataUrl: typeof o?.dataUrl === 'string' && o.dataUrl.startsWith('data:image/') ? o.dataUrl.slice(0, 150000) : undefined,
      name: str(o?.name, 40, 'Unknown'),
      cnName: str(o?.cnName, 40, '未知'),
      color: typeof o?.color === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(o.color) ? o.color : '#00e5ff',
      masterySkill: str(o?.masterySkill, 60),
    });

    return {
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
      lat,
      lng,
      isCamouflaged: !!body?.isCamouflaged,
      offsetRadiusMeters: num(body?.offsetRadiusMeters, 10, 5000, 300),
      beaconBroadcastRadiusKm: num(body?.beaconBroadcastRadiusKm, 0.1, 100, 5),
      broadcastVisibility: body?.broadcastVisibility === 'radius' ? 'radius' : 'all',
      lastActive: Date.now(),
      receivedSanityCount: num(body?.receivedSanityCount, 0, 99999, 0),
      isOnline: true,
    };
  }
}

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

function rowToItem(r: InboxRow) {
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
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
