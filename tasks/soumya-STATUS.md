# soumya — Task Status Report

**Branch:** `soumya` → `soumya-pending`
**Last Updated:** July 7, 2026 — 6:45 IST

---

## Overall Progress

### Phase 1 Tasks (Original — Screen Registration & Management)

| # | Task | Status | Files Changed |
|---|------|--------|---------------|
| 1 | Rework "Add Screen" flow — unique number + franchise picker | ✅ **COMPLETED** | `add-screen-modal.tsx`, `screens/page.tsx`, `lib/types/database.ts`, `lib/supabase/mock-data.ts`, `lib/supabase/mock-client.ts` |
| 2 | Screens table — surface new metadata | ✅ **COMPLETED** | `screens-table.tsx`, `mock-data.ts` |
| 3 | Screen detail view — unique number + metadata | ✅ **COMPLETED** | `screen-detail.tsx`, `database.ts` |
| 4 | Franchise-scoped screen list | 🔄 **In Progress** (on `soumya-pending` branch) | `screens/page.tsx` |

### Phase 2 Tasks (Updated — Media, Playlist, Settings UI)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 3 | Media upload — orientation filter + live video link | ✅ **COMPLETED** | Upload dialog now has orientation toggle + Upload/Live Link mode |
| 4 | Playlist builder — repeat count per item | ✅ **Already built by srinitha** (merged to master) | `playlist-builder.tsx` has `repeat_count` input + save |
| 5 | Screensaver picker — settings section | ✅ **Already built by srinitha** (merged to master) | `settings-form.tsx` has full media picker + save/clear |
| 6 | Read-only invite toggle | ✅ **Already built** (merged to master) | Invite form has role selector with `viewer` option |

---

## Detailed Breakdown

### ✅ Phase 1 — All 3 core tasks complete

**Tasks 1-3** (Add Screen, Screens Table, Screen Detail) — all built, typechecked, and reviewed. See previous status entries for full details.

**Task 4** — Franchise scoping on `screens/page.tsx` — needs harshitha's shared RBAC hook or ad-hoc role check. Schema is ready (`franchise_id`, `franchises` table, `franchise_manager` role all in master).

---

### ✅ Phase 2 — Task 3: Media upload form updates

**What was built (July 7, 6:30 IST):**
- **Live Video Link mode** — tab toggle at top of dialog (Upload File / Live Video Link)
  - Link mode shows a URL input for HLS/DASH streaming URLs
  - Saves with `source_type: "link"` and `external_url`
- **Orientation selection** — ToggleGroup (Landscape / Portrait) in both modes
- Saves `orientation`, `source_type`, `external_url` to `media_items` table
- Updated `lib/types/database.ts` — added `orientation`, `source_type`, `external_url` to shared `MediaItem` interface
- TypeScript: ✅ zero errors | Code review: ✅ clean

**Files changed:**
- `app/(app)/media/media-upload.tsx` — main upload dialog rewrite
- `lib/types/database.ts` — MediaItem interface updated

---

### ✅ Phase 2 — Tasks 4, 5, 6: Already built (verified)

All three tasks were already implemented by srinitha's merges into master:

| Task | Where | Evidence |
|------|-------|----------|
| **4. Playlist repeat count** | `playlist-builder.tsx` | `repeat_count` field on items, input in UI, saved in inserts |
| **5. Screensaver picker** | `settings-form.tsx` | Full media picker dialog, save/clear buttons, `screensaver_media_id` on orgs |
| **6. Read-only invite toggle** | `settings-form.tsx` | Role selector has `admin`/`editor`/`viewer` options |

---

### ⏳ Task 4 (Original) — Franchise-scoped screen list

**What's needed:**
- Franchise scoping in `screens/page.tsx` — franchise managers see only their screens
- Server-side filter by `franchise_id` when role is `franchise_manager`

**Unblocked:** Schema has `franchise_id` on `screens` + `franchises` table + `franchise_manager` role. Ready to build once role-check pattern is confirmed.

---

## Git Status

- New branch `soumya-pending` created from latest master
- Working tree has uncommitted changes:
  - `app/(app)/media/media-upload.tsx` — orientation + live link
  - `lib/types/database.ts` — MediaItem fields
  - `tasks/soumya-STATUS.md` — this update

## Next Steps

1. **Build Task 4** — franchise scoping on screens page (add `franchise_id` filter based on user role)
2. **Add franchise column** to `screens-table.tsx` showing franchise name
3. **Show franchise** in `screen-detail.tsx` edit view
