-- =============================================
-- SCREENS - Digital Signage Platform Schema
-- Consolidated Migration (final state)
-- =============================================

-- =============================================
-- CORE TABLES
-- =============================================

-- Organizations (tenants)
CREATE TABLE orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization members
CREATE TABLE org_members (
  org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor', 'viewer', 'franchise', 'advertiser')),
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

-- Screens
CREATE TABLE screens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
  group_id UUID REFERENCES screen_groups(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline')),
  pairing_code TEXT,
  anon_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  orientation TEXT CHECK (orientation IN ('landscape', 'portrait')),
  size_type TEXT,
  screen_type TEXT CHECK (screen_type IN ('static', 'bus', 'auto')),
  unique_number TEXT UNIQUE NOT NULL,
  connectivity_type TEXT CHECK (connectivity_type IN ('sim', 'wifi')),
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION
);

COMMENT ON COLUMN screens.orientation IS 'Physical orientation of the display';
COMMENT ON COLUMN screens.size_type IS 'Display size as free text';
COMMENT ON COLUMN screens.screen_type IS 'Screen deployment type: static, bus, or auto';
COMMENT ON COLUMN screens.unique_number IS 'Pre-printed serial number (SCR-NNN) used to claim/verify a screen';
COMMENT ON COLUMN screens.connectivity_type IS 'How the screen connects to the internet';
COMMENT ON COLUMN screens.lat IS 'Static latitude for fixed-location screens';
COMMENT ON COLUMN screens.lng IS 'Static longitude for fixed-location screens';

-- Media items
CREATE TABLE media_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  folder TEXT,
  storage_path TEXT,
  thumbnail_path TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  orientation TEXT CHECK (orientation IN ('portrait', 'landscape')),
  source_type TEXT NOT NULL DEFAULT 'upload' CHECK (source_type IN ('upload', 'link')),
  external_url TEXT NULL
);

-- Add screensaver_media_id to orgs (after media_items exists)
ALTER TABLE orgs ADD COLUMN screensaver_media_id UUID NULL REFERENCES media_items(id) ON DELETE SET NULL;

-- Playlists
CREATE TABLE playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_system_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Playlist items
CREATE TABLE playlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  media_item_id UUID REFERENCES media_items(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  duration_ms INTEGER NOT NULL DEFAULT 10000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  repeat_count INTEGER NOT NULL DEFAULT 1
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
  days_of_week INTEGER[] DEFAULT '{0,1,2,3,4,5,6}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Play logs
CREATE TABLE play_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  screen_id UUID REFERENCES screens(id) ON DELETE CASCADE,
  media_item_id UUID REFERENCES media_items(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- FRANCHISE / ADVERTISER / ADS TABLES
-- =============================================

-- Franchise locations belonging to an org
CREATE TABLE franchises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
  managed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add franchise_id to screens (after franchises exists)
ALTER TABLE screens ADD COLUMN franchise_id UUID REFERENCES franchises(id) ON DELETE SET NULL;
COMMENT ON COLUMN screens.franchise_id IS 'The franchise territory this screen belongs to';

-- Advertiser accounts linked to auth.users
CREATE TABLE advertisers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ad creatives belonging to an advertiser
CREATE TABLE ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_id UUID REFERENCES advertisers(id) ON DELETE CASCADE,
  org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  media_item_id UUID REFERENCES media_items(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_by_franchise_id UUID REFERENCES franchises(id) ON DELETE SET NULL
);

COMMENT ON COLUMN ads.submitted_by_franchise_id IS 'If set, this ad was submitted by a franchise manager and needs main-admin approval';

-- Junction: which ads target which franchises
CREATE TABLE ad_franchise_targets (
  ad_id UUID REFERENCES ads(id) ON DELETE CASCADE,
  franchise_id UUID REFERENCES franchises(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (ad_id, franchise_id)
);

-- Add ad_id to play_logs (after ads exists)
ALTER TABLE play_logs ADD COLUMN ad_id UUID REFERENCES ads(id) ON DELETE SET NULL;
COMMENT ON COLUMN play_logs.ad_id IS 'Links a play event to a specific ad for per-ad impression counting';

-- Screen uptime history log
CREATE TABLE screen_status_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  screen_id UUID REFERENCES screens(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('online', 'offline')),
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- GPS tracking for mobile screens
CREATE TABLE screen_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  screen_id UUID REFERENCES screens(id) ON DELETE CASCADE,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE screen_locations IS 'Append-only GPS position log for vehicle-mounted screens';

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- org_members: self-scope only (prevents recursion)
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_members_insert_self" ON org_members
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "org_members_select_self" ON org_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "org_members_update_self" ON org_members
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "org_members_delete_self" ON org_members
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- orgs
ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orgs_insert_auth" ON orgs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "orgs_select_member" ON orgs
  FOR SELECT TO authenticated
  USING (id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE POLICY "orgs_update_admin" ON orgs
  FOR UPDATE TO authenticated
  USING (id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role IN ('admin', 'main_admin')))
  WITH CHECK (id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role IN ('admin', 'main_admin')));

CREATE POLICY "orgs_delete_admin" ON orgs
  FOR DELETE TO authenticated
  USING (id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role IN ('admin', 'main_admin')));

-- screen_groups, screens, media_items, playlists, templates, schedules: org-scoped
DO $$
DECLARE
  tables_with_org TEXT[] := ARRAY['screen_groups', 'screens', 'media_items', 'playlists', 'templates', 'schedules'];
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY tables_with_org
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', tbl);
    EXECUTE format('
      CREATE POLICY "org_isolation_select" ON %I FOR SELECT
        USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));', tbl);
    EXECUTE format('
      CREATE POLICY "org_isolation_insert" ON %I FOR INSERT
        WITH CHECK (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));', tbl);
    EXECUTE format('
      CREATE POLICY "org_isolation_update" ON %I FOR UPDATE
        USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));', tbl);
    EXECUTE format('
      CREATE POLICY "org_isolation_delete" ON %I FOR DELETE
        USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));', tbl);
  END LOOP;
END $$;

-- Screen-specific RLS for player access
CREATE POLICY "screen_player_select" ON screens FOR SELECT
  USING (anon_user_id = auth.uid());

-- Playlist items: read via playlist ownership or schedule
ALTER TABLE playlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "playlist_items_select_own" ON playlist_items FOR SELECT
  USING (
    playlist_id IN (SELECT id FROM playlists WHERE org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()))
    OR playlist_id IN (SELECT playlist_id FROM schedules WHERE screen_id IN (SELECT id FROM screens WHERE anon_user_id = auth.uid()))
  );

-- play_logs
ALTER TABLE play_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "play_logs_select_org" ON play_logs FOR SELECT TO authenticated
  USING (screen_id IN (SELECT id FROM screens WHERE org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())));

CREATE POLICY "play_logs_insert_player" ON play_logs FOR INSERT TO authenticated
  WITH CHECK (screen_id IN (SELECT id FROM screens WHERE anon_user_id = auth.uid()));

-- franchises: org-scoped, admin write
ALTER TABLE franchises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "franchises_select_org" ON franchises FOR SELECT TO authenticated
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE POLICY "franchises_insert_admin" ON franchises FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM org_members WHERE user_id = auth.uid() AND org_id = franchises.org_id AND role IN ('admin', 'main_admin')));

CREATE POLICY "franchises_update_admin" ON franchises FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM org_members WHERE user_id = auth.uid() AND org_id = franchises.org_id AND role IN ('admin', 'main_admin')));

CREATE POLICY "franchises_delete_admin" ON franchises FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM org_members WHERE user_id = auth.uid() AND org_id = franchises.org_id AND role IN ('admin', 'main_admin')));

-- advertisers: user-scoped (independent accounts)
ALTER TABLE advertisers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "advertisers_own" ON advertisers FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ads: advertiser-own + franchise-targeted + admin
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ads_advertiser_own" ON ads FOR ALL TO authenticated
  USING (advertiser_id IN (SELECT id FROM advertisers WHERE user_id = auth.uid()))
  WITH CHECK (advertiser_id IN (SELECT id FROM advertisers WHERE user_id = auth.uid()));

CREATE POLICY "ads_franchise_targeted" ON ads FOR SELECT TO authenticated
  USING (id IN (SELECT ad_id FROM ad_franchise_targets WHERE franchise_id IN (SELECT id FROM franchises WHERE managed_by = auth.uid())));

CREATE POLICY "ads_admin_all" ON ads FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM org_members WHERE user_id = auth.uid() AND role IN ('admin', 'main_admin') AND org_id = ads.org_id))
  WITH CHECK (EXISTS (SELECT 1 FROM org_members WHERE user_id = auth.uid() AND role IN ('admin', 'main_admin') AND org_id = ads.org_id));

-- ad_franchise_targets
ALTER TABLE ad_franchise_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "targets_advertiser" ON ad_franchise_targets FOR ALL TO authenticated
  USING (ad_id IN (SELECT id FROM ads WHERE advertiser_id IN (SELECT id FROM advertisers WHERE user_id = auth.uid())));

CREATE POLICY "targets_franchise_manager" ON ad_franchise_targets FOR SELECT TO authenticated
  USING (franchise_id IN (SELECT id FROM franchises WHERE managed_by = auth.uid()));

CREATE POLICY "targets_franchise_manager_update" ON ad_franchise_targets FOR UPDATE TO authenticated
  USING (franchise_id IN (SELECT id FROM franchises WHERE managed_by = auth.uid()))
  WITH CHECK (franchise_id IN (SELECT id FROM franchises WHERE managed_by = auth.uid()));

CREATE POLICY "targets_admin_all" ON ad_franchise_targets FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM ads WHERE ads.id = ad_franchise_targets.ad_id AND EXISTS (SELECT 1 FROM org_members WHERE user_id = auth.uid() AND role IN ('admin', 'main_admin') AND org_id = ads.org_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM ads WHERE ads.id = ad_franchise_targets.ad_id AND EXISTS (SELECT 1 FROM org_members WHERE user_id = auth.uid() AND role IN ('admin', 'main_admin') AND org_id = ads.org_id)));

-- screen_status_log
ALTER TABLE screen_status_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ssl_org_select" ON screen_status_log FOR SELECT
  USING (screen_id IN (SELECT id FROM screens WHERE org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())));

CREATE POLICY "ssl_player_insert" ON screen_status_log FOR INSERT
  WITH CHECK (screen_id IN (SELECT id FROM screens WHERE anon_user_id = auth.uid()));

-- screen_locations
ALTER TABLE screen_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "locations_select_org" ON screen_locations FOR SELECT TO authenticated
  USING (screen_id IN (SELECT id FROM screens WHERE org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())));

CREATE POLICY "locations_player_insert" ON screen_locations FOR INSERT TO authenticated
  WITH CHECK (screen_id IN (SELECT id FROM screens WHERE anon_user_id = auth.uid()));

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX screens_org_id_idx ON screens(org_id);
CREATE INDEX screens_group_id_idx ON screens(group_id);
CREATE INDEX screens_pairing_code_idx ON screens(pairing_code) WHERE pairing_code IS NOT NULL;
CREATE INDEX screens_franchise_id_idx ON screens(franchise_id);
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
CREATE INDEX play_logs_ad_id_idx ON play_logs(ad_id);
CREATE INDEX org_members_user_id_idx ON org_members(user_id);
CREATE INDEX org_members_org_id_idx ON org_members(org_id);
CREATE INDEX franchises_org_id_idx ON franchises(org_id);
CREATE INDEX advertisers_org_id_idx ON advertisers(org_id);
CREATE INDEX ads_advertiser_id_idx ON ads(advertiser_id);
CREATE INDEX ads_org_id_idx ON ads(org_id);
CREATE INDEX ads_submitted_by_franchise_id_idx ON ads(submitted_by_franchise_id);
CREATE INDEX screen_status_log_screen_id_idx ON screen_status_log(screen_id);
CREATE INDEX screen_status_log_changed_at_idx ON screen_status_log(changed_at);
CREATE INDEX screen_locations_screen_recorded_idx ON screen_locations(screen_id, recorded_at DESC);
