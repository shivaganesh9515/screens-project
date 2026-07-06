# ashwanth — Data Model & Backend Foundation

**Branch:** `ashwanth`
**Status:** NOT STARTED — this is the foundation everyone else builds on. Push early and often so others can pull real columns/tables instead of guessing.

## Why this branch goes first
Every other branch (soumya's screen UI, manaswini's GPS/map, abhinaya's analytics, srinitha's media/playlist, harshitha's dashboards) needs the new tables and columns described here to exist before their UI can query real data. Get a migration pushed in the first day or two, even if incomplete — others can build against it and you can add columns in a follow-up migration.

## Tasks

### 1. Extend `screens` table
File: new migration `supabase/migrations/00003_screen_metadata.sql`
Add columns:
- `orientation TEXT CHECK (orientation IN ('landscape', 'portrait'))`
- `size_type TEXT` (e.g. "32in", "43in" — free text or a lookup, your call)
- `screen_type TEXT CHECK (screen_type IN ('static', 'bus', 'auto'))`
- `unique_number TEXT UNIQUE NOT NULL` — the pre-printed serial number used to claim/verify a screen. **This replaces the random pairing code flow.**
- `connectivity_type TEXT CHECK (connectivity_type IN ('sim', 'wifi'))`
- `lat DOUBLE PRECISION`, `lng DOUBLE PRECISION` — static location for `static` screens
- `franchise_id UUID REFERENCES franchises(id)` — added after Task 2

### 2. New `franchises` table
- `id`, `org_id` (references `orgs`), `name`, `territory_area` (text description or geo bounds — coordinate with soumya/manaswini on whether this needs to be a polygon or just a label), `manager_user_id` (references `auth.users`), `created_at`
- Update `org_members.role` CHECK constraint to add `main_admin`, `franchise_manager` (keep `admin/editor/viewer` or fold into these — decide with harshitha since she owns the dashboards that gate on this)

### 3. New `advertisers` table
- `id`, `user_id` (references `auth.users`), `name`/`company_name`, `created_at`
- Advertisers are NOT scoped to one org/franchise — they're independent accounts that select targets per-ad (Task 4)

### 4. New `ads` table (the approval-gated content)
- `id`, `advertiser_id`, `media_item_id` or `playlist_item_id` (whichever media/playlist shape srinitha lands on — coordinate), `status TEXT CHECK (status IN ('pending', 'approved', 'rejected'))`
- New join table `ad_franchise_targets`: `ad_id`, `franchise_id`, `status` (approval is **per-franchise** — one ad can be approved in Hyderabad and still pending in Chennai)

### 5. Franchise-submitted ads need main-admin approval too
- Same `ads`/status shape, but source is `franchise_id` instead of `advertiser_id` — add a `submitted_by_franchise_id` nullable column, or a separate `franchise_ads` table if that's cleaner. Your call — document whichever you pick in `memory/SCHEMA-REFERENCE.md`.

### 6. GPS tracking table for vehicle screens
- `screen_locations` (or similar): `id`, `screen_id`, `lat`, `lng`, `recorded_at` — append-only log so manaswini's map can show a live position (latest row per screen) and optionally a trail
- Index on `(screen_id, recorded_at DESC)`

### 7. `play_logs` — check it supports ad-level counting
- Confirm `play_logs` (already exists) has a way to tie a play event back to a specific `ad_id` (not just `media_item_id`/`playlist_item_id`) — abhinaya needs this for per-ad play counts. Add `ad_id UUID REFERENCES ads(id)` nullable if missing.

### 8. RLS policies for everything above
- `advertisers`: a user can only see/edit rows where `user_id = auth.uid()`
- `ads`: advertiser sees only their own; franchise_manager sees only ads targeting their franchise; main_admin sees all
- `franchises`: franchise_manager sees only their own row; main_admin sees all
- **Also fix the existing `orgs_select_auth` policy from `00002_rls_fix.sql`** — it currently lets any authenticated user read all orgs. Scope it to org members only.

## Deliverable
A migration file (or a few, incrementally) + updated `memory/SCHEMA-REFERENCE.md` documenting every new table/column so the other 5 people aren't guessing column names.
