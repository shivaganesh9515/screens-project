-- =============================================
-- SCREENS - Digital Signage Platform Schema
-- Migration 00003: Extend roles for franchise/advertiser
-- =============================================
-- Adds 'franchise' and 'advertiser' roles to the org_members table.
-- The original CHECK constraint only allowed: admin, editor, viewer.

ALTER TABLE org_members
  DROP CONSTRAINT IF EXISTS org_members_role_check,
  ADD CONSTRAINT org_members_role_check
    CHECK (role IN ('admin', 'editor', 'viewer', 'franchise', 'advertiser'));
