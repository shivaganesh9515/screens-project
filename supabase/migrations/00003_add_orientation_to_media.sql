-- =============================================
-- SCREENS - Add orientation column to media_items
-- Migration 00003
-- =============================================

ALTER TABLE media_items ADD COLUMN orientation TEXT CHECK (orientation IN ('portrait', 'landscape'));
