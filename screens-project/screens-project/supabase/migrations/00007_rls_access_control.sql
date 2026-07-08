-- =============================================
-- SCREENS - RLS Access Control Completion
-- Migration 00007: Fix cross-org admin leaks,
--                  enable play_logs RLS,
--                  restore org admin policies.
-- =============================================
--
-- Depends on all previous migrations.
-- Does NOT touch advertisers, franchises,
-- screen_locations, or any working policy.
--
-- Does NOT create admin policies on org_members
-- (would reintroduce PostgreSQL 42P17 recursion).
--
-- =============================================

-- =============================================
-- 1. Replace ads_admin_all — org-scoped
-- =============================================
-- Old policy: EXISTS (org_members WHERE role IN
--   ('admin','main_admin')) — no org filter.
--   Admins from org A could access ads in org B.
-- New policy: same EXISTS but with
--   AND org_id = ads.org_id.

DROP POLICY IF EXISTS "ads_admin_all" ON ads;

CREATE POLICY "ads_admin_all" ON ads
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM org_members
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'main_admin')
        AND org_id = ads.org_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM org_members
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'main_admin')
        AND org_id = ads.org_id
    )
  );

-- =============================================
-- 2. Replace targets_admin_all — org-scoped
--    via ads table
-- =============================================
-- ad_franchise_targets has no org_id column.
-- Resolve the organization through ads.
-- Only admins/main_admins of the same org as
-- the target's parent ad may access it.

DROP POLICY IF EXISTS "targets_admin_all" ON ad_franchise_targets;

CREATE POLICY "targets_admin_all" ON ad_franchise_targets
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ads
      WHERE ads.id = ad_franchise_targets.ad_id
        AND EXISTS (
          SELECT 1 FROM org_members
          WHERE user_id = auth.uid()
            AND role IN ('admin', 'main_admin')
            AND org_id = ads.org_id
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ads
      WHERE ads.id = ad_franchise_targets.ad_id
        AND EXISTS (
          SELECT 1 FROM org_members
          WHERE user_id = auth.uid()
            AND role IN ('admin', 'main_admin')
            AND org_id = ads.org_id
        )
    )
  );

-- =============================================
-- 3. Enable RLS on play_logs
-- =============================================
-- Previously had no RLS at all.  Anyone
-- authenticated could read or write play logs.

ALTER TABLE play_logs ENABLE ROW LEVEL SECURITY;

-- Org members can read play_logs for screens
-- that belong to their organization.
CREATE POLICY "play_logs_select_org" ON play_logs
  FOR SELECT
  TO authenticated
  USING (
    screen_id IN (
      SELECT id FROM screens WHERE org_id IN (
        SELECT org_id FROM org_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Only the player that owns a screen may
-- insert play logs for that screen.
CREATE POLICY "play_logs_insert_player" ON play_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    screen_id IN (
      SELECT id FROM screens
      WHERE anon_user_id = auth.uid()
    )
  );

-- =============================================
-- 4. Restore org administration policies
-- =============================================
-- orgs_update_admin was created in 00001 then
-- dropped in 00002.  The comment in 00006
-- claimed it "remains unchanged" but it was
-- already removed.  orgs_delete_admin never
-- existed.  Both are needed so admins and
-- main_admins can manage their own org.
--
-- Safe: these policies query org_members from
-- a policy on orgs (different table), so no
-- recursion is possible.

DROP POLICY IF EXISTS "orgs_update_admin" ON orgs;

CREATE POLICY "orgs_update_admin" ON orgs
  FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT org_id FROM org_members
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'main_admin')
    )
  )
  WITH CHECK (
    id IN (
      SELECT org_id FROM org_members
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'main_admin')
    )
  );

CREATE POLICY "orgs_delete_admin" ON orgs
  FOR DELETE
  TO authenticated
  USING (
    id IN (
      SELECT org_id FROM org_members
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'main_admin')
    )
  );
