-- =============================================
-- SCREENS - Add source_type and external_url to media_items
-- Migration 00004
-- =============================================

ALTER TABLE media_items
  ALTER COLUMN storage_path DROP NOT NULL,
  ADD COLUMN source_type TEXT NOT NULL DEFAULT 'upload' CHECK (source_type IN ('upload', 'link')),
  ADD COLUMN external_url TEXT NULL;
