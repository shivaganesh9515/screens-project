-- =============================================
-- SCREENS - Digital Signage Platform Schema
-- Migration 00004: Live Map support
-- =============================================
-- Adds location columns to screens and a screen_locations
-- table for real-time GPS tracking of mobile screens.

ALTER TABLE screens
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS screen_type TEXT NOT NULL DEFAULT 'static'
    CHECK (screen_type IN ('static', 'bus', 'auto'));

-- Screen locations (real-time GPS for mobile screens)
CREATE TABLE IF NOT EXISTS screen_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  screen_id UUID NOT NULL REFERENCES screens(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast latest-location lookups
CREATE INDEX IF NOT EXISTS screen_locations_screen_id_recorded_at_idx
  ON screen_locations(screen_id, recorded_at DESC);
