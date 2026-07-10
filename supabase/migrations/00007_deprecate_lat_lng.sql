-- =============================================
-- SCREENS - Cleanup: Consolidate GPS Columns
-- Migration 00007: Deprecate lat/lng in favor of latitude/longitude
-- =============================================
--
-- PROBLEM: The screens table has two sets of GPS columns created by
-- different migrations:
--
--   lat, lng              — from 00003_screen_metadata.sql (static coords)
--   latitude, longitude   — from 00004_live_map.sql (static coords)
--
-- Both store the same data (fixed coordinates for static screens).
-- The application reads from latitude/longitude (map, live-map API)
-- and the screen detail page now writes to both sets.
--
-- This migration consolidates by:
--   1. Adding deprecation comments on lat/lng columns
--   2. Copying any lat/lng data into latitude/longitude if the latter is NULL
--   3. Creating an index on latitude/longitude for map queries
--
-- FUTURE: Once all deployments are migrated, drop lat/lng columns entirely.
-- =============================================

-- Copy existing lat/lng values into latitude/longitude where empty
UPDATE screens
SET
  latitude = COALESCE(latitude, lat),
  longitude = COALESCE(longitude, lng)
WHERE lat IS NOT NULL
  AND (latitude IS NULL OR latitude != lat)
  AND lat >= -90 AND lat <= 90
  AND lng >= -180 AND lng <= 180;

COMMENT ON COLUMN screens.lat IS 'DEPRECATED — use latitude instead. To be removed in a future migration.';
COMMENT ON COLUMN screens.lng IS 'DEPRECATED — use longitude instead. To be removed in a future migration.';
COMMENT ON COLUMN screens.latitude IS 'Static latitude for fixed-location screens (replaces lat). Null for bus/auto.';
COMMENT ON COLUMN screens.longitude IS 'Static longitude for fixed-location screens (replaces lng). Null for bus/auto.';

-- Index for map queries filtering static screens by location
CREATE INDEX IF NOT EXISTS screens_latitude_longitude_idx
  ON screens(latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- =============================================
-- Add GPS accuracy column to screen_locations
-- =============================================
-- The player's navigator.geolocation.watchPosition provides
-- position.coords.accuracy (in meters). Store it so the UI
-- can display location quality alongside the coordinates.

ALTER TABLE screen_locations
  ADD COLUMN IF NOT EXISTS accuracy DOUBLE PRECISION;

COMMENT ON COLUMN screen_locations.accuracy
  IS 'GPS horizontal accuracy in meters, reported by the device browser.';

-- =============================================
-- Update the Screen type in application types
-- =============================================
-- The Screen interface in lib/types/database.ts already includes
-- both lat/lng and latitude/longitude. No type-level change needed.
