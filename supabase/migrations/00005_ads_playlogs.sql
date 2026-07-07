-- =============================================
-- SCREENS - Phase 3: Extended Features
-- Migration 00005: Franchise Ads, Ad Play Counts
-- =============================================
--
-- Phase 3 of ashwanth's milestone. Depends on Phase 1 (00003) and Phase 2 (00004).
--
--   5.  Add submitted_by_franchise_id to ads (franchise-submitted ads need main-admin approval)
--   7.  Add ad_id to play_logs (for ad-level play count analytics)
--
-- =============================================

-- =============================================
-- TASK 5: Franchise-submitted ads
-- =============================================
-- When submitted_by_franchise_id IS NOT NULL, the ad was created by a franchise
-- and needs main-admin approval. When advertiser_id IS NOT NULL, the ad was
-- created by an advertiser and needs franchise-manager approval.
-- One ad can have both set (franchise acts on behalf of advertiser).

ALTER TABLE ads ADD COLUMN submitted_by_franchise_id UUID REFERENCES franchises(id) ON DELETE SET NULL;

COMMENT ON COLUMN ads.submitted_by_franchise_id IS 'If set, this ad was submitted by a franchise manager and needs main-admin approval.';

CREATE INDEX ads_submitted_by_franchise_id_idx ON ads(submitted_by_franchise_id);

-- =============================================
-- TASK 7: Add ad_id to play_logs
-- =============================================
-- Needed by abhinaya for per-ad play count analytics.
-- Nullable — existing play logs without ad association remain valid.

ALTER TABLE play_logs ADD COLUMN ad_id UUID REFERENCES ads(id) ON DELETE SET NULL;

COMMENT ON COLUMN play_logs.ad_id IS 'Links a play event to a specific ad for per-ad impression counting.';

CREATE INDEX play_logs_ad_id_idx ON play_logs(ad_id);
