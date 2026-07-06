# abhinaya — Backend: Screen Metadata, GPS Table & Analytics Queries

**Branch:** `abhinaya`
**Role:** Backend
**Status:** NOT STARTED

## Tasks

### 1. Extend `screens` table
Migration file: `supabase/migrations/00003_screen_metadata.sql` (coordinate with harshitha/srinitha on migration numbering so you don't collide)
- `orientation TEXT CHECK (orientation IN ('landscape', 'portrait'))`
- `size_type TEXT`
- `screen_type TEXT CHECK (screen_type IN ('static', 'bus', 'auto'))`
- `unique_number TEXT UNIQUE NOT NULL` — pre-printed serial number used to register/verify a screen, **replacing** the old random pairing-code flow
- `connectivity_type TEXT CHECK (connectivity_type IN ('sim', 'wifi'))`
- `lat DOUBLE PRECISION`, `lng DOUBLE PRECISION` — static location, for `static` screens only
- `franchise_id UUID REFERENCES franchises(id)` — depends on harshitha's `franchises` table, add once it exists

### 2. GPS tracking table
- `screen_locations`: `id`, `screen_id`, `lat`, `lng`, `recorded_at` — append-only log. Index on `(screen_id, recorded_at DESC)` so "latest position per screen" is fast.
- Update `app/api/screens/heartbeat/route.ts` to accept optional `lat`/`lng` and insert a row here (only relevant for `bus`/`auto` screens — manaswini's player-side GPS work sends this data).

### 3. Screen status history (for uptime/downtime analytics)
- New `screen_status_log` table: `screen_id`, `status` (online/offline), `changed_at` — log a row every time `is_online` flips, so historical uptime/downtime can be calculated rather than only ever seeing a live snapshot.
- Offline detection logic: flip `is_online` to false after ~90s of no heartbeat (likely a scheduled Supabase Edge Function/cron), writing to this log when it flips.

### 4. Ad play-count support
- Add `ad_id UUID REFERENCES ads(id)` (nullable) to `play_logs` — depends on harshitha's `ads` table existing first.

### 5. Analytics queries
- Uptime/downtime totals per screen over a date range, from `screen_status_log`.
- Ad play counts per ad / per franchise, from `play_logs.ad_id`.
- Advertiser-scoped query: only rows belonging to `advertiser_id = current user's advertiser record` — this is what manaswini's advertiser dashboard UI will call.
- Fix the existing bug: analytics currently groups by screen **name** instead of **id** (two screens with the same name incorrectly merge stats) — fix in whatever query/component currently does this grouping.

## Deliverable
Screen metadata + GPS + status-history tables, and working analytics queries (uptime history, ad play counts, advertiser-scoped), documented in `memory/SCHEMA-REFERENCE.md` for manaswini/soumya to build UI against.
