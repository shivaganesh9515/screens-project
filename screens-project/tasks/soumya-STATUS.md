# soumya — Task Status Report

**Branch:** `soumya-pending`
**Last Updated:** July 7, 2026 — 7:15 IST

---

## Overall Progress — ✅ ALL TASKS COMPLETE

| # | Task | Status |
|---|------|--------|
| 1 | Rework "Add Screen" flow — unique number + franchise picker | ✅ **COMPLETED** |
| 2 | Screens table — surface new metadata + franchise column | ✅ **COMPLETED** |
| 3 | Screen detail view — unique number + metadata + franchise info | ✅ **COMPLETED** |
| 4 | Franchise-scoped screen list | ✅ **COMPLETED** |
| — | Media upload — orientation + live video link | ✅ **COMPLETED** |
| — | Playlist builder — repeat count | ✅ **Already built** (srinitha) |
| — | Screensaver picker | ✅ **Already built** (srinitha) |
| — | Read-only invite toggle | ✅ **Already built** |

---

## What Was Built (This Session)

### Franchise Picker (Add Screen Modal)
- Added `franchises` prop, `franchiseId` state, Franchise Territory dropdown
- Includes `franchise_id` in the Supabase insert
- `screens/page.tsx` fetches franchises and passes to modal

### Franchise Column (Screens Table)
- New `Franchise` column showing franchise territory name
- Updated `colSpan` from 9 to 10

### Franchise Info (Screen Detail)
- Added `Franchise` to the Info grid section

### Task 4 — Franchise-Scoped Screen List
- Fetches user's role from `org_members`
- If `franchise_manager`, looks up their managed franchise via `managed_by`
- Filters screens query by `franchise_id`
- Edge case: franchise_manager with no managed franchise sees nothing
- Screens query joins `franchises(name)` so franchise name is available

### Media Upload — Orientation + Live Link
- Upload/Live Video Link mode toggle
- Orientation ToggleGroup (Landscape / Portrait)
- Live URL input for HLS/DASH streams
- Saves `orientation`, `source_type`, `external_url`

### Database Types Updated
- `Franchise` interface, `franchise_id` on `Screen`, `franchises` join
- `orientation`, `source_type`, `external_url` on `MediaItem`

### Mock Data
- 3 franchises added, screens assigned to territories, table registered in mock client

---

## TypeScript: ✅ Zero errors
## Code Review: ✅ No issues found

## Git
- 2 commits on `soumya-pending` branch (media upload + screens/scoping)
