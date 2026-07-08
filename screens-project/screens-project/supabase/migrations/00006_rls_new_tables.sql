-- =============================================
-- SCREENS - Phase 4: RLS Policies
-- Migration 00006: RLS for New Tables + Fix orgs
-- =============================================
--
-- Phase 4 of ashwanth's milestone. Depends on all previous migrations
-- (00003, 00004, 00005) since policies reference tables created there.
--
--   8a. RLS for franchises (org-scoped)
--   8b. RLS for advertisers (user-scoped, not org-scoped)
--   8c. RLS for ads (advertiser + franchise-manager + admin scoped)
--   8d. RLS for ad_franchise_targets (same scoping as ads)
--   8e. RLS for screen_locations (org access + player insert)
--   8f. Fix orgs_select_auth (currently lets ANY auth user read ALL orgs)
--
-- =============================================

-- =============================================
-- 8a. RLS: franchises (org-scoped)
-- =============================================

ALTER TABLE franchises ENABLE ROW LEVEL SECURITY;

-- All org members can view franchises (needed for screen assignment UI)
CREATE POLICY "franchises_select_org" ON franchises
  FOR SELECT
  TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM org_members WHERE user_id = auth.uid()
    )
  );

-- Only admins/main_admins can insert/update/delete franchises
CREATE POLICY "franchises_insert_admin" ON franchises
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM org_members
      WHERE user_id = auth.uid()
      AND org_id = franchises.org_id
      AND role IN ('admin', 'main_admin')
    )
  );

CREATE POLICY "franchises_update_admin" ON franchises
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM org_members
      WHERE user_id = auth.uid()
      AND org_id = franchises.org_id
      AND role IN ('admin', 'main_admin')
    )
  );

CREATE POLICY "franchises_delete_admin" ON franchises
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM org_members
      WHERE user_id = auth.uid()
      AND org_id = franchises.org_id
      AND role IN ('admin', 'main_admin')
    )
  );

-- =============================================
-- 8b. RLS: advertisers (user-scoped)
-- =============================================

ALTER TABLE advertisers ENABLE ROW LEVEL SECURITY;

-- Advertisers can only see/edit their own row
-- This is NOT org-scoped — advertisers are independent accounts
CREATE POLICY "advertisers_own" ON advertisers
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =============================================
-- 8c. RLS: ads
-- =============================================

ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

-- Advertiser sees only their own ads
CREATE POLICY "ads_advertiser_own" ON ads
  FOR ALL
  TO authenticated
  USING (
    advertiser_id IN (
      SELECT id FROM advertisers WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    advertiser_id IN (
      SELECT id FROM advertisers WHERE user_id = auth.uid()
    )
  );

-- franchise_manager sees ads targeting their franchise
CREATE POLICY "ads_franchise_targeted" ON ads
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT ad_id FROM ad_franchise_targets
      WHERE franchise_id IN (
        SELECT id FROM franchises WHERE manager_user_id = auth.uid()
      )
    )
  );

-- main_admin/admin sees ALL ads
CREATE POLICY "ads_admin_all" ON ads
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM org_members
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'main_admin')
    )
  );

-- =============================================
-- 8d. RLS: ad_franchise_targets
-- =============================================

ALTER TABLE ad_franchise_targets ENABLE ROW LEVEL SECURITY;

-- Advertiser sees targets for their own ads
CREATE POLICY "targets_advertiser" ON ad_franchise_targets
  FOR ALL
  TO authenticated
  USING (
    ad_id IN (
      SELECT id FROM ads WHERE advertiser_id IN (
        SELECT id FROM advertisers WHERE user_id = auth.uid()
      )
    )
  );

-- franchise_manager sees targets for their franchise
CREATE POLICY "targets_franchise_manager" ON ad_franchise_targets
  FOR SELECT
  TO authenticated
  USING (
    franchise_id IN (
      SELECT id FROM franchises WHERE manager_user_id = auth.uid()
    )
  );

-- franchise_manager can update targets for their own franchise (approve/reject)
CREATE POLICY "targets_franchise_manager_update" ON ad_franchise_targets
  FOR UPDATE
  TO authenticated
  USING (
    franchise_id IN (
      SELECT id FROM franchises WHERE manager_user_id = auth.uid()
    )
  )
  WITH CHECK (
    franchise_id IN (
      SELECT id FROM franchises WHERE manager_user_id = auth.uid()
    )
  );

-- main_admin/admin sees all targets
CREATE POLICY "targets_admin_all" ON ad_franchise_targets
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM org_members
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'main_admin')
    )
  );

-- =============================================
-- 8e. RLS: screen_locations
-- =============================================

ALTER TABLE screen_locations ENABLE ROW LEVEL SECURITY;

-- Org members can view locations of screens in their org
CREATE POLICY "locations_select_org" ON screen_locations
  FOR SELECT
  TO authenticated
  USING (
    screen_id IN (
      SELECT id FROM screens WHERE org_id IN (
        SELECT org_id FROM org_members WHERE user_id = auth.uid()
      )
    )
  );

-- Player (anon user) can insert GPS locations for their own screen
CREATE POLICY "locations_player_insert" ON screen_locations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    screen_id IN (
      SELECT id FROM screens WHERE anon_user_id = auth.uid()
    )
  );

-- =============================================
-- 8f. Fix: orgs_select_auth policy
-- =============================================
-- CURRENT PROBLEM: orgs_select_auth (from 00002_rls_fix.sql) lets ANY
-- authenticated user read ALL orgs. This is too permissive.
--
-- FIX: Restrict to org members only.

DROP POLICY IF EXISTS "orgs_select_auth" ON orgs;

CREATE POLICY "orgs_select_member" ON orgs
  FOR SELECT
  TO authenticated
  USING (
    id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
  );

-- Also ensure the admin update policy still works (it's from 00001)
-- orgs_update_admin already restricts to admin role members — it remains unchanged.
