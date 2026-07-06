# soumya — Screen Registration & Management UI

**Branch:** `soumya`
**Status:** NOT STARTED
**Depends on:** ashwanth's `screens` table columns (Task 1) — pull his branch/migration before starting, or coordinate column names directly if he hasn't pushed yet.

## Tasks

### 1. Rework "Add Screen" flow around the unique number
File: `app/(app)/screens/add-screen-modal.tsx`
- Remove/replace whatever's left of the old pairing-code-first assumption.
- New flow: admin enters the screen's **pre-printed unique number** to register it (this is how the physical unit gets claimed — no more random on-screen code as the primary path).
- Form fields: unique number, orientation (landscape/portrait — radio or toggle), size type, screen type (static / bus / auto), connectivity type (SIM / WiFi), location (lat/lng — for static screens; skip for bus/auto since manaswini's GPS tracking handles those live).
- On submit, insert into `screens` with all these fields plus `franchise_id` (screen belongs to whichever franchise territory it's being registered under).

### 2. Screens list/table — surface the new metadata
File: `app/(app)/screens/screens-table.tsx`, `app/(app)/screens/page.tsx`
- Add columns/badges for orientation, screen type (static/bus/auto icon), connectivity type.
- Filter/sort by screen type and orientation.

### 3. Screen detail view
- Wherever a single screen's details are shown, display the unique number prominently (it's the verification/audit trail), plus all the new metadata fields, editable by admin.

### 4. Franchise-scoped screen list
- Make sure the screens list respects `franchise_id` scoping — a franchise_manager should only see screens in their own territory (this ties into harshitha's RBAC/dashboard work — coordinate on how the franchise scoping check is implemented, e.g. a shared hook or server-side filter).

## Deliverable
Updated add-screen flow using unique-number verification instead of pairing codes, with all new metadata fields, and a screens list that filters/displays them.
