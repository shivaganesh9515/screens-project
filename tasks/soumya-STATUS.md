# soumya — Task Status Report

**Branch:** `soumya`
**Last Updated:** July 7, 2026

---

## Overall Progress

| # | Task | Status | Files Changed |
|---|------|--------|---------------|
| 1 | Rework "Add Screen" flow — unique number | ⏳ **WAITING** | `app/(app)/screens/add-screen-modal.tsx` |
| 2 | Screens table — surface new metadata | ✅ **COMPLETED** | `app/(app)/screens/screens-table.tsx`, `lib/supabase/mock-data.ts` |
| 3 | Screen detail view — unique number + metadata | ⏳ **WAITING** | `app/(app)/screens/[id]/screen-detail.tsx` |
| 4 | Franchise-scoped screen list | ⏳ **WAITING** | `app/(app)/screens/page.tsx` |

---

## Detailed Breakdown

### ✅ Task 2 — COMPLETED

**What was built:**
- Updated `screens-table.tsx` with 3 new columns:
  - **Type** — colored icon badges for Static (blue), Bus (amber), Auto (purple)
  - **Orientation** — maximize icon with rotation for portrait mode
  - **Connectivity** — WiFi or SIM icon with tooltip on hover
- Added **screen type filter** bar (All Types / Static / Bus / Auto)
- Added **orientation filter** bar (All Orient. / Landscape / Portrait)
- **Unique number** displayed below screen name in monospace font, included in search
- Updated `lib/supabase/mock-data.ts` with new fields for all 5 mock screens
- TypeScript passes with zero errors

**Files modified:**
- `app/(app)/screens/screens-table.tsx` — table component rewritten
- `lib/supabase/mock-data.ts` — added `unique_number`, `orientation`, `screen_type`, `connectivity_type` to each screen

---

### ⏳ Task 1 — WAITING (ashwanth)

**What's needed:**
- Rewrite `add-screen-modal.tsx` to replace pairing-code flow with unique number registration
- Form fields: unique number, orientation (toggle), size type, screen type (static/bus/auto), connectivity (SIM/WiFi), location lat/lng (for static screens)
- Franchise selection dropdown
- Insert into `screens` with all new fields

**Blocked by:** ashwanth — needs these new `screens` table columns:
- `unique_number TEXT UNIQUE NOT NULL`
- `orientation TEXT CHECK (orientation IN ('landscape', 'portrait'))`
- `size_type TEXT`
- `screen_type TEXT CHECK (screen_type IN ('static', 'bus', 'auto'))`
- `connectivity_type TEXT CHECK (connectivity_type IN ('sim', 'wifi'))`
- `lat DOUBLE PRECISION`, `lng DOUBLE PRECISION`
- `franchise_id UUID` (references `franchises`)

**Note:** `franchises` table already exists on harshitha's branch.

---

### ⏳ Task 3 — WAITING (ashwanth)

**What's needed:**
- Update `screen-detail.tsx` to show unique number prominently (highlighted card, monospace)
- Display all new metadata fields (orientation, screen type, connectivity, location, size)
- All fields editable by admin via toggle groups and selects

**Blocked by:** Same columns as Task 1 — needs ashwanth's schema first.

---

### ⏳ Task 4 — WAITING (ashwanth + harshitha)

**What's needed:**
- Franchise scoping in `screens/page.tsx` — franchise managers see only their screens
- Server-side filter by `franchise_id` when role is `franchise_manager`

**Blocked by:**
- ashwanth — `franchise_id` column on `screens` table
- harshitha — shared RBAC hook for role checking would be cleaner, but direct `org_members` query is a working alternative (harshitha's `franchises` table + `franchise_manager` role already exist)

---

## Dependency Chain

```
ashwanth (screens columns migration)
    └─► Task 1 (add-screen-modal.tsx)
    └─► Task 3 (screen-detail.tsx)
    └─► Task 4 (franchise scoping) ──► also needs harshitha's RBAC

Task 2 ✅ (already complete — no schema dependency)
```

## Git Status

- Working tree is clean
- All changes committed on `soumya` branch
- No files pending
