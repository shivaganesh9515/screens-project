-- =============================================
-- SCREENS - Add screensaver_media_id to orgs
-- Migration 00006
-- =============================================

ALTER TABLE orgs
  ADD COLUMN screensaver_media_id UUID NULL REFERENCES media_items(id) ON DELETE SET NULL;
