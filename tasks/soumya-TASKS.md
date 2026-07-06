# soumya — Frontend: Screen Registration, Media & Playlist UI

**Branch:** `soumya`
**Role:** Frontend
**Status:** NOT STARTED
**Depends on:** abhinaya's `screens` columns (Task 1 in her file) and srinitha's media/playlist backend changes — check `memory/SCHEMA-REFERENCE.md` before starting each piece, or coordinate directly if it's not pushed yet.

## Tasks

### 1. Rework "Add Screen" flow around the unique number
File: `app/(app)/screens/add-screen-modal.tsx`
- Replace the old pairing-code-first flow: admin enters the screen's **pre-printed unique number** to register/claim it.
- Form fields: unique number, orientation (landscape/portrait toggle), size type, screen type (static/bus/auto), connectivity type (SIM/WiFi), location (lat/lng — static screens only, skip for bus/auto since those get GPS live from manaswini's map work).

### 2. Screens list/table — show the new metadata
File: `app/(app)/screens/screens-table.tsx`, `app/(app)/screens/page.tsx`
- Add columns/badges: orientation, screen type icon (static/bus/auto), connectivity type.
- Filter/sort by screen type and orientation.

### 3. Media upload UI
- Add orientation filter to the media grid/browser (portrait/landscape).
- Add a "paste a live stream URL" option alongside file upload (srinitha's backend adds `source_type`/`external_url` — build the toggle/form for it).

### 4. Playlist builder UI
File: `app/(app)/playlists/[id]/playlist-builder.tsx`
- Add a "number of times" input per playlist item (per-item repeat count, srinitha's `repeat_count` column).

### 5. Screensaver setting UI
- Simple admin settings section: pick a media item as the screensaver/fallback content (srinitha's backend field).

### 6. Read-only invite UI
File: `app/(app)/settings/settings-form.tsx`
- Add a "read only" option to the invite-user form (maps to existing `viewer` role).

## Deliverable
Updated add-screen flow with unique-number verification and new metadata fields, plus media/playlist/screensaver/invite UI updates.
