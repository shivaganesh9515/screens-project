-- =============================================
-- SCREENS - Fix RLS recursion (42P17)
-- Migration 00002: Minimum Viable RLS
-- =============================================

-- STEP 1: REMOVE ALL POLICIES ON org_members
DROP POLICY IF EXISTS "org_isolation_select" ON org_members;
DROP POLICY IF EXISTS "org_isolation_insert" ON org_members;
DROP POLICY IF EXISTS "org_isolation_update" ON org_members;
DROP POLICY IF EXISTS "org_isolation_delete" ON org_members;

-- STEP 2: org_members — identity-level only
CREATE POLICY "org_members_insert_self" ON org_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "org_members_select_self" ON org_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "org_members_update_self" ON org_members
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "org_members_delete_self" ON org_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- STEP 3: orgs — no dependencies on any table
DROP POLICY IF EXISTS "orgs_select_member" ON orgs;
DROP POLICY IF EXISTS "orgs_update_admin" ON orgs;

CREATE POLICY "orgs_insert_auth" ON orgs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "orgs_select_auth" ON orgs
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);
