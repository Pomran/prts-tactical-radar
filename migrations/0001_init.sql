-- PRTS Tactical Radar — D1 schema (Level 2/3 persistence).
-- Level 1 (realtime presence) lives in the PresenceCoordinator Durable Object
-- memory + WS hibernation attachments; D1 holds long-term / cross-session data.

-- User profile + last-seen (written on disconnect, and periodically during a
-- session). Profile is the client-supplied DoctorProfile as JSON so schema
-- evolution stays cheap.
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  profile_json TEXT NOT NULL,
  last_active INTEGER NOT NULL,
  last_lat REAL,
  last_lng REAL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active);

-- Interaction inbox — one row per interaction, keyed by recipient. Read by the
-- recipient (web HTTP poll or WS push); rows are deleted after being delivered
-- to keep the table small (matches the previous KV inbox semantics).
CREATE TABLE IF NOT EXISTS inbox (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  from_doctor_id TEXT NOT NULL,
  from_doctor_name TEXT,
  from_assistant_name TEXT,
  to_doctor_id TEXT NOT NULL,
  message TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_inbox_to ON inbox(to_doctor_id);
