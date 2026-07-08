-- =============================================
-- SCREENS - Franchise/Advertiser Data Model
-- Migration 00003: Screen Metadata, Franchises, Advertisers
-- =============================================
--
-- Phase 1 of ashwanth's milestone. Three independent additions:
--   1a. Extend screens table with metadata columns
--   2.  Create franchises table + update org_members roles
--   3.  Create advertisers table
--
-- franchise_id on screens (FK to franchises) comes in Phase 2
-- after franchises table exists.
--
-- =============================================

-- =============================================
-- TASK 1a: Extend screens table
-- =============================================

ALTER TABLE screens ADD COLUMN orientation TEXT CHECK (orientation IN ('landscape', 'portrait'));
ALTER TABLE screens ADD COLUMN size_type TEXT;
ALTER TABLE screens ADD COLUMN screen_type TEXT CHECK (screen_type IN ('static', 'bus', 'auto'));
ALTER TABLE screens ADD COLUMN unique_number TEXT UNIQUE NOT NULL;
ALTER TABLE screens ADD COLUMN connectivity_type TEXT CHECK (connectivity_type IN ('sim', 'wifi'));
ALTER TABLE screens ADD COLUMN lat DOUBLE PRECISION;
ALTER TABLE screens ADD COLUMN lng DOUBLE PRECISION;

COMMENT ON COLUMN screens.orientation IS 'Physical orientation of the display';
COMMENT ON COLUMN screens.size_type IS 'Display size as free text';
COMMENT ON COLUMN screens.screen_type IS 'Screen deployment type: static, bus, or auto';
COMMENT ON COLUMN screens.unique_number IS 'Pre-printed serial number (SCR-NNN) used to claim/verify a screen. Replaces random pairing code flow.';
COMMENT ON COLUMN screens.connectivity_type IS 'How the screen connects to the internet';
COMMENT ON COLUMN screens.lat IS 'Static latitude for fixed-location screens (null for bus/auto)';
COMMENT ON COLUMN screens.lng IS 'Static longitude for fixed-location screens (null for bus/auto)';

-- =============================================
-- TASK 2: Create franchises table
-- =============================================

CREATE TABLE franchises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  territory_area TEXT,
  manager_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE franchises IS 'Territory managers within an org';
COMMENT ON COLUMN franchises.territory_area IS 'Free-text description of franchise territory';

CREATE INDEX franchises_org_id_idx ON franchises(org_id);

-- Update org_members role CHECK to include new roles alongside existing
ALTER TABLE org_members DROP CONSTRAINT IF EXISTS org_members_role_check;
ALTER TABLE org_members ADD CONSTRAINT org_members_role_check
  CHECK (role IN ('admin', 'editor', 'viewer', 'main_admin', 'franchise_manager'));

-- =============================================
-- TASK 3: Create advertisers table
-- =============================================

CREATE TABLE advertisers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE advertisers IS 'Independent ad-buyer accounts, NOT scoped to a single org';

CREATE INDEX advertisers_user_id_idx ON advertisers(user_id);
