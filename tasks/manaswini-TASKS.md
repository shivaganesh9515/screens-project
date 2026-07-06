# manaswini — Frontend: Live Map, GPS Display & The 3 Dashboards

**Branch:** `manaswini`
**Role:** Frontend
**Status:** NOT STARTED
**Depends on:** abhinaya's `screen_locations`/`screen_status_log` tables and harshitha's `franchises`/`advertisers`/`ads`/roles — check `memory/SCHEMA-REFERENCE.md` before starting each piece.

## Tasks

### 1. Live map on the main home page
File: `app/(app)/overview/page.tsx` + new `overview-map.tsx` component, positioned on the left of the layout
- Use a lightweight map library (MapLibre GL or Leaflet — avoid Google Maps to skip billing/API-key setup).
- Static screens: plot at fixed `lat`/`lng`.
- Bus/auto screens: plot at latest position from `screen_locations` (join, `ORDER BY recorded_at DESC LIMIT 1` per screen).
- Point color: green if `is_online`, red/grey if offline.
- Click a point → popover with screen name + status.
- Live updates: poll every few seconds, or use Supabase Realtime if already set up elsewhere in the codebase.

### 2. GPS reporting from the player app (the device side of the map)
File: `app/player/[token]/page.tsx`
- For `screen_type` = `bus`/`auto`, use the browser Geolocation API to get lat/lng and send it to the heartbeat endpoint (abhinaya's backend accepts it).
- Static screens skip this — no permission prompt needed.
- Handle geolocation permission denial gracefully — don't break playback if it's denied.

### 3. Role-based routing shell
- After login, route users to the right dashboard based on role: `main_admin` → admin dashboard, `franchise_manager` → franchise dashboard, `advertiser` → advertiser dashboard.
- Build this early — soumya and everyone else doing role-scoped UI needs a shared way to check "current user's role/franchise."

### 4. Main Admin dashboard
- Global view: all franchises, all screens across territories, all advertisers.
- Approval queue for franchise-submitted ads (harshitha's backend logic powers this).
- Franchise management UI: create/edit franchises, assign a franchise_manager.

### 5. Franchise dashboard ("the all-rounder")
- Scoped to their own franchise/territory — screens, schedules, playlists (reuse existing UI, add franchise filter).
- Their approval queue: advertiser ads targeting their franchise, approve/reject per-ad.
- Ability to submit their own ads (which then need main-admin approval).

### 6. Advertiser dashboard
- Minimal: "My Ads" (with per-franchise approval status), "Create Ad" (pick media, pick target franchises), and an analytics view (abhinaya's queries, you build the page).
- Must never render other advertisers'/franchises' data — enforce in the UI even though RLS backs it up too.

## Deliverable
A live map with correct status colors and GPS-tracked vehicle screens, plus three working role-gated dashboards wired to the approval workflow.
