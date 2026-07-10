-- =============================================
-- SCREENS - Phase 2: Dependent Tables
-- Migration 00004: franchise_id, Ads, Screen Locations
-- =============================================
--
-- Phase 2 of ashwanth's milestone. Depends on Phase 1 (00003).
-- All tasks here reference tables created in Phase 1.
--
--   1b. Add franchise_id FK to screens (needs franchises table)
--   4.  Create ads + ad_franchise_targets (needs advertisers + franchises)
--   6.  Create screen_locations (needs screens table)
--
-- =============================================

-- =============================================
-- TASK 1b: Add franchise_id to screens
-- =============================================

ALTER TABLE screens ADD COLUMN franchise_id UUID REFERENCES franchises(id) ON DELETE SET NULL;

COMMENT ON COLUMN screens.franchise_id IS 'The franchise territory this screen belongs to. NULL means unassigned.';

CREATE INDEX screens_franchise_id_idx ON screens(franchise_id);

-- =============================================
-- TASK 4: Create ads + ad_franchise_targets
-- =============================================

CREATE TABLE ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_id UUID REFERENCES advertisers(id) ON DELETE CASCADE,
  media_item_id UUID REFERENCES media_items(id) ON DELETE CASCADE,
  playlist_item_id UUID REFERENCES playlist_items(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE ads IS 'Ad content submitted for approval. Can be created by an advertiser or by a franchise (see submitted_by_franchise_id in Phase 3).';
COMMENT ON COLUMN ads.media_item_id IS 'Primary content reference (image/video). Prefer this over playlist_item_id.';
COMMENT ON COLUMN ads.playlist_item_id IS 'Optional — only used if the ad is bound to a specific position in a playlist.';

CREATE INDEX ads_advertiser_id_idx ON ads(advertiser_id);
CREATE INDEX ads_media_item_id_idx ON ads(media_item_id);

CREATE TABLE ad_franchise_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID REFERENCES ads(id) ON DELETE CASCADE,
  franchise_id UUID REFERENCES franchises(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  UNIQUE(ad_id, franchise_id)
);

COMMENT ON TABLE ad_franchise_targets IS 'Per-franchise approval status for each ad. One ad can target multiple franchises, each approves independently.';

CREATE INDEX ad_franchise_targets_ad_id_idx ON ad_franchise_targets(ad_id);
CREATE INDEX ad_franchise_targets_franchise_id_idx ON ad_franchise_targets(franchise_id);

-- =============================================
-- TASK 6: Create screen_locations (GPS Tracking)
-- =============================================

CREATE TABLE screen_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  screen_id UUID REFERENCES screens(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE screen_locations IS 'Append-only GPS position log for vehicle-mounted screens (bus/auto). Used by manaswini for live map and position trails.';

CREATE INDEX screen_locations_screen_recorded_idx ON screen_locations(screen_id, recorded_at DESC);
