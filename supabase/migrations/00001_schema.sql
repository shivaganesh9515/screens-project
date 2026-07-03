-- =============================================
-- SCREENS - Digital Signage Platform Schema
-- Migration 00001: Initial Schema
-- =============================================

-- Orgs
CREATE TABLE orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'free',
  timezone TEXT DEFAULT 'UTC',
  logo_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users ↔ Orgs (roles: admin, editor, viewer)
CREATE TABLE org_members (
  org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor', 'viewer')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (org_id, user_id)
);

-- Screen groups
CREATE TABLE screen_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Screens / devices
CREATE TABLE screens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
  group_id UUID REFERENCES screen_groups(id) ON DELETE SET NULL,
  anon_user_id UUID,
  name TEXT NOT NULL DEFAULT 'New Screen',
  pairing_code TEXT,
  pairing_expires_at TIMESTAMPTZ,
  paired_at TIMESTAMPTZ,
  last_seen TIMESTAMPTZ,
  is_online BOOLEAN DEFAULT FALSE,
  resolution TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Media items
CREATE TABLE media_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  storage_path TEXT NOT NULL,
  thumbnail_path TEXT,
  duration_ms INTEGER,
  size_bytes INTEGER,
  folder TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Playlists
CREATE TABLE playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE playlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  media_item_id UUID REFERENCES media_items(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  duration_ms INTEGER NOT NULL DEFAULT 10000,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Zone templates
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_preset BOOLEAN DEFAULT FALSE,
  zones JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schedules
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
  screen_id UUID REFERENCES screens(id) ON DELETE CASCADE,
  group_id UUID REFERENCES screen_groups(id) ON DELETE CASCADE,
  playlist_id UUID REFERENCES playlists(id) ON DELETE SET NULL,
  template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
  is_default BOOLEAN DEFAULT FALSE,
  priority INTEGER DEFAULT 0,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  recurrence JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Play logs (from player)
CREATE TABLE play_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  screen_id UUID REFERENCES screens(id) ON DELETE SET NULL,
  media_item_id UUID REFERENCES media_items(id) ON DELETE SET NULL,
  playlist_id UUID REFERENCES playlists(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_ms INTEGER
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Helper: Create standard RLS policies for org-isolated tables
DO $$
DECLARE
  tables_with_org TEXT[] := ARRAY['org_members', 'screen_groups', 'screens', 'media_items', 'playlists', 'playlist_items', 'templates', 'schedules', 'play_logs'];
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY tables_with_org
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', tbl);
    EXECUTE format('
      CREATE POLICY "org_isolation_select" ON %I FOR SELECT
        USING (
          org_id IN (
            SELECT org_id FROM org_members WHERE user_id = auth.uid()
          )
        );', tbl);
    EXECUTE format('
      CREATE POLICY "org_isolation_insert" ON %I FOR INSERT
        WITH CHECK (
          org_id IN (
            SELECT org_id FROM org_members WHERE user_id = auth.uid()
          )
        );', tbl);
    EXECUTE format('
      CREATE POLICY "org_isolation_update" ON %I FOR UPDATE
        USING (
          org_id IN (
            SELECT org_id FROM org_members WHERE user_id = auth.uid()
          )
        );', tbl);
    EXECUTE format('
      CREATE POLICY "org_isolation_delete" ON %I FOR DELETE
        USING (
          org_id IN (
            SELECT org_id FROM org_members WHERE user_id = auth.uid()
          )
        );', tbl);
  END LOOP;
END $$;

-- Screen-specific RLS for player access (anon user scoped to their screen)
CREATE POLICY "screen_player_select" ON screens FOR SELECT
  USING (anon_user_id = auth.uid());

-- Playlist items: allow read via resolved schedule
CREATE POLICY "playlist_items_select_own" ON playlist_items FOR SELECT
  USING (
    org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
    OR playlist_id IN (
      SELECT playlist_id FROM schedules WHERE screen_id IN (
        SELECT id FROM screens WHERE anon_user_id = auth.uid()
      )
    )
  );

-- Orgs table RLS
ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orgs_select_member" ON orgs FOR SELECT
  USING (id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "orgs_update_admin" ON orgs FOR UPDATE
  USING (id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role = 'admin'));

-- =============================================
-- TRIGGERS: Auto-create org for new users
-- =============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- The org creation will be handled by the application layer (server action)
  -- This function creates a basic profile entry
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX screens_org_id_idx ON screens(org_id);
CREATE INDEX screens_group_id_idx ON screens(group_id);
CREATE INDEX screens_pairing_code_idx ON screens(pairing_code) WHERE pairing_code IS NOT NULL;
CREATE INDEX media_items_org_id_idx ON media_items(org_id);
CREATE INDEX media_items_folder_idx ON media_items(folder);
CREATE INDEX media_items_type_idx ON media_items(type);
CREATE INDEX playlists_org_id_idx ON playlists(org_id);
CREATE INDEX playlist_items_playlist_id_idx ON playlist_items(playlist_id);
CREATE INDEX playlist_items_position_idx ON playlist_items(playlist_id, position);
CREATE INDEX templates_org_id_idx ON templates(org_id);
CREATE INDEX schedules_org_id_idx ON schedules(org_id);
CREATE INDEX schedules_screen_id_idx ON schedules(screen_id);
CREATE INDEX schedules_group_id_idx ON schedules(group_id);
CREATE INDEX play_logs_screen_id_idx ON play_logs(screen_id);
CREATE INDEX play_logs_media_item_id_idx ON play_logs(media_item_id);
CREATE INDEX play_logs_started_at_idx ON play_logs(started_at);
CREATE INDEX org_members_user_id_idx ON org_members(user_id);
CREATE INDEX org_members_org_id_idx ON org_members(org_id);
