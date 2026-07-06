# srinitha — Backend: Media, Playlist & Screensaver Logic

**Branch:** `srinitha`
**Role:** Backend
**Status:** NOT STARTED (continuing your existing media/admin domain)

## Tasks

### 1. Media: orientation tagging
- Add `orientation` column to `media_items` (`landscape`/`portrait`) if not already covered by another migration — check `memory/SCHEMA-REFERENCE.md` first, ashwanth/harshitha may have touched this table.
- Backend logic/API to tag orientation at upload time (auto-detect from file dimensions if feasible, otherwise accept it as a field from the upload request).

### 2. Media: live video via link
- Add `source_type` (`upload`/`link`) and `external_url` column to `media_items` — migration + API support for creating a media item from a URL instead of a file upload.
- Document clearly for whoever builds playback (player app) that both cases need to be handled.

### 3. Playlist: per-item repeat count
- Add `repeat_count INT DEFAULT 1` to `playlist_items` — migration + API support for setting/reading it when building a playlist.

### 4. Screensaver backend
- New setting for fallback content when no schedule/playlist is active — likely a `screensaver_media_id` column on `orgs` (org-level, simplest to start), plus API to get/set it.

### 5. Read-only user invite — backend enforcement
- Confirm the existing `viewer` role in `org_members` is actually enforced everywhere (RLS + API checks), not just a label. This is what "read only" invite maps to.

### 6. Carry-over from the previous backlog
- Delete the actual Storage file when a media item is deleted (currently only removes the DB row, file stays orphaned) — fix in the delete API/logic.
- Decide the fate of the unused media upload API route — use it or delete it.

## Deliverable
Backend/schema support for media orientation + live links, playlist repeat-count, screensaver setting, and confirmed read-only enforcement — all documented in `memory/SCHEMA-REFERENCE.md` for soumya to build the UI against.
