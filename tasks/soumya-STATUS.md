# soumya — Task Status Report

**Branch:** `soumya`
**Last Updated:** July 7, 2026 — 6:00 IST

---

## Overall Progress

| # | Task | Status | Files Changed |
|---|------|--------|---------------|
| 1 | Rework "Add Screen" flow — unique number + franchise picker | ✅ **COMPLETED** (July 7, 6:00 IST) | `app/(app)/screens/add-screen-modal.tsx`, `app/(app)/screens/page.tsx`, `lib/types/database.ts`, `lib/supabase/mock-data.ts`, `lib/supabase/mock-client.ts` |
| 2 | Screens table — surface new metadata | ✅ **COMPLETED** (July 7, 4:00 IST) | `app/(app)/screens/screens-table.tsx`, `lib/supabase/mock-data.ts` |
| 3 | Screen detail view — unique number + metadata | ✅ **COMPLETED** (July 7, 5:32 IST) | `app/(app)/screens/[id]/screen-detail.tsx`, `lib/types/database.ts` |
| 4 | Franchise-scoped screen list | ⏳ **WAITING** | `app/(app)/screens/page.tsx` |

---

## Detailed Breakdown

### ✅ Task 1 — COMPLETED (July 7, 6:00 IST)

**Requirements checklist:**

| # | Requirement | Status |
|---|-------------|--------|
| 1 | Remove old pairing-code-first flow | ✅ Done |
| 2 | Admin enters pre-printed unique number to register | ✅ Done |
| 3 | Orientation toggle (landscape / portrait) | ✅ Done |
| 4 | Size type select (32in / 43in / 55in / 65in / 75in / 86in) | ✅ Done |
| 5 | Screen type — static / bus / auto | ✅ Done |
| 6 | Connectivity type — SIM (4G/5G) / WiFi | ✅ Done |
| 7 | Location (lat/lng) — shown only for static screens; skipped for bus/auto (manaswini's GPS handles live tracking) | ✅ Done |
| 8 | **Franchise selection dropdown + `franchise_id` in insert** | ✅ **Done** (was unblocked by pulling master with franchise schema) |

**What was built:**
- Rewrote `add-screen-modal.tsx` to replace old pairing-code flow with **unique number registration**
- Form fields implemented: unique number (auto-uppercase, required), screen name (optional), orientation toggle, size select, screen type buttons, connectivity toggle, conditional lat/lng inputs, **franchise picker dropdown**, group select
- On submit: inserts into `screens` table with `org_id` + all metadata fields + **`franchise_id`**
- Success state: green confirmation card showing registered unique number
- Duplicate unique number detection with user-friendly error message
- Updated `screens/page.tsx` to fetch franchises and pass them to the modal
- Added `Franchise` interface + `franchise_id` to `Screen` type
- Added 3 mock franchises with screens assigned to them
- TypeScript: ✅ zero errors | Code review: ✅ no issues found

---

### ✅ Task 2 — COMPLETED (July 7, 4:00 IST)

**What was built:**
- Updated `screens-table.tsx` with 3 new columns:
  - **Type** — colored icon badges for Static (blue), Bus (amber), Auto (purple)
  - **Orientation** — maximize icon with rotation for portrait mode
  - **Connectivity** — WiFi or SIM icon with tooltip on hover
- Added **screen type filter** bar (All Types / Static / Bus / Auto)
- Added **orientation filter** bar (All Orient. / Landscape / Portrait)
- **Unique number** displayed below screen name in monospace font, included in search
- Updated `lib/supabase/mock-data.ts` with new fields for all 5 mock screens
- TypeScript: ✅ zero errors
- Column names confirmed matching ashwanth's migration: ✅

---

### ✅ Task 3 — COMPLETED (July 7, 5:32 IST)

**What was built:**
- Rewrote `screen-detail.tsx` with all new metadata fields
- **Unique number** — prominently displayed in a highlighted gradient card with monospace font, verification label, and one-click copy button
- **Hardware & Connectivity section** (all editable):
  - **Orientation** — ToggleGroup (Landscape / Portrait)
  - **Screen Size** — Select dropdown (32in / 43in / 55in / 65in / 75in / 86in)
  - **Screen Type** — button group (Static / Bus / Auto) with icons
  - **Connectivity** — ToggleGroup (WiFi / SIM 4G/5G)
- **Location section** — lat/lng inputs for static screens; auto-tracked message for bus/auto
- **Info section** — Group (editable), Resolution, Paired At, Last Seen (read-only)
- **Tags** — editable comma-separated input
- Edit/Cancel state management restores original values on cancel
- Updated `lib/types/database.ts` — added `unique_number`, `orientation`, `size_type`, `screen_type`, `connectivity_type`, `lat`, `lng` to the `Screen` interface
- TypeScript: ✅ zero errors
- Code review: ✅ no issues found

---

### ⏳ Task 4 — WAITING

**What's needed:**
- Franchise scoping in `screens/page.tsx` — franchise managers see only their screens
- Server-side filter by `franchise_id` when role is `franchise_manager`

**Blocked by:** harshitha's shared RBAC hook for role checking (cleaner than building ad-hoc)

---

## Git Status

- Working tree may have uncommitted changes (merged master + added franchise picker)

## Next Steps

1. Build Task 4 — franchise-scoped screen list (needs harshitha's RBAC hook)
2. Add franchise column to screens-table.tsx
3. Show franchise name in screen-detail.tsx