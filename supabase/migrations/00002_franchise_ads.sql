-- =============================================
-- SCREENS - Franchise / Advertiser / Uptime Schema
-- Migration 00002: Franchises, Advertisers, Ads, Uptime Logging
-- =============================================

-- =============================================
-- PART 1: Franchise / Advertiser Tables
-- =============================================

-- Franchise locations belonging to an org
CREATE TABLE franchises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
  managed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction: which ads target which franchises (with per-target approval)
CREATE TABLE ad_franchise_targets (
  ad_id UUID REFERENCES ads(id) ON DELETE CASCADE,
  franchise_id UUID REFERENCES franchises(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (ad_id, franchise_id)
);

-- =============================================
-- PART 2: Screen Uptime History Log
-- =============================================

-- Tracks online/offline status changes over time for historical uptime calculations
CREATE TABLE screen_status_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  screen_id UUID REFERENCES screens(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('online', 'offline')),
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX screen_status_log_screen_id_idx ON screen_status_log(screen_id);
CREATE INDEX screen_status_log_changed_at_idx ON screen_status_log(changed_at);

-- =============================================
-- PART 3: Add ad_id to play_logs for ad-level tracking
-- =============================================

ALTER TABLE play_logs ADD COLUMN ad_id UUID REFERENCES ads(id) ON DELETE SET NULL;
CREATE INDEX play_logs_ad_id_idx ON play_logs(ad_id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Helper: Enable RLS on new tables
ALTER TABLE franchises ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_franchise_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE screen_status_log ENABLE ROW LEVEL SECURITY;

-- Franchises: org-member scoped
CREATE POLICY "franchises_org_select" ON franchises FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "franchises_org_insert" ON franchises FOR INSERT
  WITH CHECK (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "franchises_org_update" ON franchises FOR UPDATE
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "franchises_org_delete" ON franchises FOR DELETE
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

-- Advertisers: org-member scoped
CREATE POLICY "advertisers_org_select" ON advertisers FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "advertisers_org_insert" ON advertisers FOR INSERT
  WITH CHECK (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "advertisers_org_update" ON advertisers FOR UPDATE
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "advertisers_org_delete" ON advertisers FOR DELETE
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

-- Ads: org-member scoped
CREATE POLICY "ads_org_select" ON ads FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "ads_org_insert" ON ads FOR INSERT
  WITH CHECK (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "ads_org_update" ON ads FOR UPDATE
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "ads_org_delete" ON ads FOR DELETE
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

-- Ad-Franchise targets: org-member scoped
CREATE POLICY "aft_org_select" ON ad_franchise_targets FOR SELECT
  USING (ad_id IN (SELECT id FROM ads WHERE org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())));
CREATE POLICY "aft_org_insert" ON ad_franchise_targets FOR INSERT
  WITH CHECK (ad_id IN (SELECT id FROM ads WHERE org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())));
CREATE POLICY "aft_org_update" ON ad_franchise_targets FOR UPDATE
  USING (ad_id IN (SELECT id FROM ads WHERE org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())));
CREATE POLICY "aft_org_delete" ON ad_franchise_targets FOR DELETE
  USING (ad_id IN (SELECT id FROM ads WHERE org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())));

-- Screen status log: screen-scoped (for player access) + org-scoped (for admin)
CREATE POLICY "ssl_org_select" ON screen_status_log FOR SELECT
  USING (screen_id IN (SELECT id FROM screens WHERE org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())));
CREATE POLICY "ssl_player_insert" ON screen_status_log FOR INSERT
  WITH CHECK (screen_id IN (SELECT id FROM screens WHERE anon_user_id = auth.uid()));

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX franchises_org_id_idx ON franchises(org_id);
CREATE INDEX advertisers_org_id_idx ON advertisers(org_id);
CREATE INDEX ads_advertiser_id_idx ON ads(advertiser_id);
CREATE INDEX ads_org_id_idx ON ads(org_id);
