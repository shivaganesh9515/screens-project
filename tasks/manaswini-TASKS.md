# manaswini — Live Map, GPS Tracking & Player App Updates

**Branch:** `manaswini`
**Status:** NOT STARTED
**Depends on:** ashwanth's `screen_locations` table and `screens` lat/lng/screen_type columns.

## Tasks

### 1. Live map on the main home page
File: `app/(app)/overview/page.tsx` (add a map panel, likely a new `overview-map.tsx` component on the left side of the layout)
- Use a lightweight map library (MapLibre GL or Leaflet — avoid Google Maps to sidestep billing/API-key setup) to plot every screen as a point.
- Static screens: plot at their fixed `lat`/`lng`.
- Bus/auto screens: plot at their latest position from `screen_locations` (join on `screen_id`, `ORDER BY recorded_at DESC LIMIT 1` per screen).
- Point color: **green if `is_online`, red/grey if offline** — reuse the existing `is_online` field.
- Clicking a point should show the screen name + status (basic popover, doesn't need to be fancy).

### 2. GPS reporting from the player app
File: `app/player/[token]/page.tsx`
- For screens where `screen_type` is `bus` or `auto`, use the browser Geolocation API (`navigator.geolocation.watchPosition` or a timed `getCurrentPosition` poll) to get lat/lng.
- Send it to a new endpoint alongside (or merged with) the existing heartbeat call — e.g. extend `app/api/screens/heartbeat/route.ts` to accept optional `lat`/`lng` and insert a row into `screen_locations`.
- Static screens skip this entirely (no GPS needed, no permission prompt).
- Handle the geolocation permission prompt gracefully — if denied, don't break playback, just skip location reporting.

### 3. Live position updates on the map without a full page reload
- Options: polling `screen_locations`/`screens` every N seconds, or Supabase Realtime subscription on the `screen_locations` table. Pick whichever is simpler to wire given the existing Supabase client setup — Realtime is nicer but check if it's already configured anywhere in the codebase first.

### 4. Offline detection (carried over from the earlier backlog — fits naturally here since it's status logic)
- Flip `is_online` to false after ~90s of no heartbeat. This likely needs a scheduled Supabase Edge Function (cron) rather than client-side logic, since nothing else polls screens when the dashboard isn't open.
- Coordinate with ashwanth if this needs a new column (e.g. `last_seen` already exists — check if it's sufficient or if you need `offline_since`).

## Deliverable
A live map on the home page with correct green/red status per screen, moving markers for bus/auto screens, and the player app actually reporting GPS for vehicle-mounted screens.
