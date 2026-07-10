// Local SQLite database schema
// Mirrors the Supabase PostgreSQL schema but adapted for SQLite

import { getDb } from "./connection";

const SCHEMA_SQL = `
-- =============================================
-- Organizations
-- =============================================
CREATE TABLE IF NOT EXISTS orgs (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'free',
  timezone TEXT DEFAULT 'UTC',
  logo_path TEXT,
  screensaver_media_id TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- =============================================
-- Org Members (Users ↔ Orgs)
-- =============================================
CREATE TABLE IF NOT EXISTS org_members (
  org_id TEXT NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin','editor','viewer','main_admin','franchise_manager','advertiser')),
  joined_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (org_id, user_id)
);

-- =============================================
-- Users (local auth)
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin','franchise_manager','advertiser','viewer')),
  created_at TEXT DEFAULT (datetime('now'))
);

-- =============================================
-- Screen Groups
-- =============================================
CREATE TABLE IF NOT EXISTS screen_groups (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  org_id TEXT NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- =============================================
-- Franchises
-- =============================================
CREATE TABLE IF NOT EXISTS franchises (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  org_id TEXT NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  territory_area TEXT,
  manager_user_id TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- =============================================
-- Advertisers
-- =============================================
CREATE TABLE IF NOT EXISTS advertisers (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  org_id TEXT NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id TEXT,
  company_name TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- =============================================
-- Screens / Devices
-- =============================================
CREATE TABLE IF NOT EXISTS screens (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  org_id TEXT NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  franchise_id TEXT REFERENCES franchises(id) ON DELETE SET NULL,
  group_id TEXT REFERENCES screen_groups(id) ON DELETE SET NULL,
  anon_user_id TEXT,
  name TEXT NOT NULL DEFAULT 'New Screen',
  pairing_code TEXT,
  pairing_expires_at TEXT,
  paired_at TEXT,
  last_seen TEXT,
  is_online INTEGER DEFAULT 0,
  resolution TEXT,
  orientation TEXT CHECK (orientation IN ('landscape','portrait')),
  size_type TEXT,
  screen_type TEXT CHECK (screen_type IN ('static','bus','auto')),
  unique_number TEXT UNIQUE,
  connectivity_type TEXT CHECK (connectivity_type IN ('sim','wifi')),
  lat REAL,
  lng REAL,
  tags TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now'))
);

-- =============================================
-- Media Items
-- =============================================
CREATE TABLE IF NOT EXISTS media_items (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  org_id TEXT NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image','video')),
  storage_path TEXT,
  thumbnail_path TEXT,
  duration_ms INTEGER,
  size_bytes INTEGER,
  folder TEXT,
  tags TEXT DEFAULT '[]',
  orientation TEXT CHECK (orientation IN ('landscape','portrait')),
  source_type TEXT DEFAULT 'upload' CHECK (source_type IN ('upload','link')),
  external_url TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- =============================================
-- Playlists
-- =============================================
CREATE TABLE IF NOT EXISTS playlists (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  org_id TEXT NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- =============================================
-- Playlist Items
-- =============================================
CREATE TABLE IF NOT EXISTS playlist_items (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  playlist_id TEXT NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  media_item_id TEXT NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  duration_ms INTEGER NOT NULL DEFAULT 10000,
  repeat_count INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- =============================================
-- Templates
-- =============================================
CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  org_id TEXT NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_preset INTEGER DEFAULT 0,
  zones TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now'))
);

-- =============================================
-- Schedules
-- =============================================
CREATE TABLE IF NOT EXISTS schedules (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  org_id TEXT NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  screen_id TEXT REFERENCES screens(id) ON DELETE CASCADE,
  group_id TEXT REFERENCES screen_groups(id) ON DELETE CASCADE,
  playlist_id TEXT REFERENCES playlists(id) ON DELETE SET NULL,
  template_id TEXT REFERENCES templates(id) ON DELETE SET NULL,
  is_default INTEGER DEFAULT 0,
  priority INTEGER DEFAULT 0,
  start_at TEXT,
  end_at TEXT,
  recurrence TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- =============================================
-- Ads
-- =============================================
CREATE TABLE IF NOT EXISTS ads (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  advertiser_id TEXT REFERENCES advertisers(id) ON DELETE CASCADE,
  org_id TEXT NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  media_item_id TEXT REFERENCES media_items(id) ON DELETE CASCADE,
  screen_type TEXT,
  orientation TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  submitted_by_franchise_id TEXT REFERENCES franchises(id) ON DELETE SET NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- =============================================
-- Ad Franchise Targets (per-franchise approval)
-- =============================================
CREATE TABLE IF NOT EXISTS ad_franchise_targets (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  ad_id TEXT NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
  franchise_id TEXT NOT NULL REFERENCES franchises(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewed_by TEXT,
  reviewed_at TEXT,
  UNIQUE(ad_id, franchise_id)
);

-- =============================================
-- Screen Locations (GPS tracking)
-- =============================================
CREATE TABLE IF NOT EXISTS screen_locations (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  screen_id TEXT NOT NULL REFERENCES screens(id) ON DELETE CASCADE,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  recorded_at TEXT DEFAULT (datetime('now'))
);

-- =============================================
-- Screen Status Log (uptime/downtime history)
-- =============================================
CREATE TABLE IF NOT EXISTS screen_status_log (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  screen_id TEXT NOT NULL REFERENCES screens(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('online','offline')),
  changed_at TEXT DEFAULT (datetime('now'))
);

-- =============================================
-- Play Logs
-- =============================================
CREATE TABLE IF NOT EXISTS play_logs (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  screen_id TEXT REFERENCES screens(id) ON DELETE SET NULL,
  media_item_id TEXT REFERENCES media_items(id) ON DELETE SET NULL,
  playlist_id TEXT REFERENCES playlists(id) ON DELETE SET NULL,
  ad_id TEXT REFERENCES ads(id) ON DELETE SET NULL,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  duration_ms INTEGER
);

-- =============================================
-- Indexes for performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_org_members_user ON org_members(user_id);
CREATE INDEX IF NOT EXISTS idx_franchises_org ON franchises(org_id);
CREATE INDEX IF NOT EXISTS idx_screens_org ON screens(org_id);
CREATE INDEX IF NOT EXISTS idx_screens_franchise ON screens(franchise_id);
CREATE INDEX IF NOT EXISTS idx_media_org ON media_items(org_id);
CREATE INDEX IF NOT EXISTS idx_playlists_org ON playlists(org_id);
CREATE INDEX IF NOT EXISTS idx_playlist_items_playlist ON playlist_items(playlist_id);
CREATE INDEX IF NOT EXISTS idx_templates_org ON templates(org_id);
CREATE INDEX IF NOT EXISTS idx_schedules_org ON schedules(org_id);
CREATE INDEX IF NOT EXISTS idx_schedules_screen ON schedules(screen_id);
CREATE INDEX IF NOT EXISTS idx_ads_advertiser ON ads(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_ad_franchise_targets_ad ON ad_franchise_targets(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_franchise_targets_franchise ON ad_franchise_targets(franchise_id);
CREATE INDEX IF NOT EXISTS idx_screen_locations_screen_time ON screen_locations(screen_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_play_logs_screen ON play_logs(screen_id);
CREATE INDEX IF NOT EXISTS idx_play_logs_ad ON play_logs(ad_id);
`;

export function initSchema(): void {
  const db = getDb();

  // Execute each statement individually for better error reporting
  // Note: Strips SQL comment lines (-- ...) from each chunk to avoid filtering out
  //       entire CREATE TABLE statements that are preceded by comments.
  const statements = SCHEMA_SQL
    .split(";")
    .map(s =>
      s
        .split("\n")
        .filter(line => !line.trim().startsWith("--"))
        .join("\n")
        .trim()
    )
    .filter(s => s.length > 0);

  for (const sql of statements) {
    try {
      db.exec(sql + ";");
    } catch (err) {
      console.error(`[DB Schema] Error executing: ${sql.substring(0, 60)}...`, err);
      throw err;
    }
  }

  console.log("[DB Schema] All tables initialized successfully");
}
