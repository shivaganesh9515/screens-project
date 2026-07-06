# srinitha — Media, Playlist & Admin Panel Enhancements

**Branch:** `srinitha`
**Status:** NOT STARTED (continuing your existing media/admin ownership from the previous round)
**Depends on:** nothing blocking from ashwanth's schema for most of this — you can start immediately. Coordinate with him only if the `ads` table shape affects how media attaches to an ad.

## Tasks

### 1. Orientation filter on media upload/library
File: media upload + library components (wherever `app/(app)/media/` currently lives)
- Add a portrait/landscape filter to the media grid/browser.
- Tag each uploaded item with orientation at upload time (or auto-detect from the file's dimensions if feasible — otherwise a manual toggle at upload is fine).

### 2. Support live video via link, not just file upload
- Add an alternate upload path: "paste a live stream URL" instead of uploading a file. Store this as a `media_items` row with a `source_type` (`upload` vs `link`) and `external_url` column instead of `storage_path` — you'll need a small migration for this, or coordinate with ashwanth to bundle it into his pass.
- Player app playback (whoever ends up building actual playback rendering) will need to handle both cases — flag this clearly in your PR description so it's not missed downstream.

### 3. Playlist per-item repeat count
File: playlist builder (`app/(app)/playlists/[id]/playlist-builder.tsx`)
- Add a "number of times" field per playlist item (not a whole-playlist loop — confirmed per-item).
- Store as a new column on `playlist_items`, e.g. `repeat_count INT DEFAULT 1`.
- Update playlist_items schema via migration.

### 4. Screensaver option in admin panel
- New admin setting (org-level or per-screen — your call, org-level is simpler to start) for fallback content shown when no schedule/playlist is active.
- Likely a new `screensaver_media_id` column on `orgs` or a dedicated settings table, plus a settings UI section.

### 5. User invite with read-only access
File: wherever team invites currently live (`app/(app)/settings/settings-form.tsx` per the existing settings work)
- Add a "read only" option when inviting a new user — maps to the existing `viewer` role in `org_members`, just make sure it's actually enforced (check RLS/UI gating, not just cosmetic).

### 6. Carry-over from the previous backlog (still not done)
- Delete the actual Storage file when a media item is deleted (currently just removes the DB row/list entry, file stays orphaned).
- Decide the fate of the unused media upload API route — use it or delete it.

## Deliverable
Orientation filtering + live-link media support, per-item playlist repeat counts, a screensaver setting, and read-only user invites.
