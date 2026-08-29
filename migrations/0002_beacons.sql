-- PRTS Tactical Radar — persistent beacons (常驻信标).
-- Level 3 persistence: a beacon lets offline users stay discoverable so others
-- can send interactions (friend/invite/clue) that land in their inbox on return.
-- Beacon is keyed by the owning doctor id (one beacon per doctor, upserted).
CREATE TABLE IF NOT EXISTS beacons (
  doctor_id TEXT PRIMARY KEY,
  profile_json TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_beacons_expires ON beacons(expires_at);
