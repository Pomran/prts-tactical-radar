/**
 * PRTS Tactical Radar — Worker environment bindings.
 * Shared by the entry Worker (index.ts) and the PresenceCoordinator Durable Object.
 */
export interface Env {
  /** Legacy KV presence buckets — kept for backward-compatible reads only. */
  RADAR_KV: KVNamespace;
  /** Presence Durable Object namespace (single "global" instance). */
  PRESENCE: DurableObjectNamespace;
  /** D1 for Level 2/3 persistence: user profiles, last-seen, inbox. */
  DB: D1Database;
  /** Gaode (AMap) WebService REST API key. Set via Secret (production) or .dev.vars (local). */
  GAODE_KEY?: string;
}
