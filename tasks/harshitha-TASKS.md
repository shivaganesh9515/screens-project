# harshitha — Backend: Franchises, Advertisers, Ads, Roles & Approval Logic

**Branch:** `harshitha`
**Role:** Backend
**Status:** NOT STARTED

## Tasks

### 1. New tables
Migration file: `supabase/migrations/00003_franchise_advertiser.sql`
- `franchises`: `id`, `org_id` (references `orgs`), `name`, `territory_area`, `manager_user_id` (references `auth.users`), `created_at`
- `advertisers`: `id`, `user_id` (references `auth.users`), `name`/`company_name`, `created_at` — independent accounts, not scoped to one org/franchise
- `ads`: `id`, `advertiser_id`, `media_item_id`/`playlist_item_id` (coordinate with srinitha on final media shape), `status` (`pending`/`approved`/`rejected`), `created_at`
- `ad_franchise_targets`: `ad_id`, `franchise_id`, `status` — approval is **per-franchise** (an ad targeting 3 franchises can be approved in one and still pending in another)
- Franchise's own ads (need main-admin approval, not franchise approval): add `submitted_by_franchise_id` nullable column on `ads`, or a separate table if cleaner — your call, just document it.

### 2. Roles
- Extend `org_members.role` CHECK constraint: add `main_admin`, `franchise_manager` (keep existing `admin/editor/viewer` if still needed elsewhere, or fold them in — your call, document the final role list clearly since manaswini's dashboard UI gates on this).

### 3. Approval workflow logic
- API routes / server actions for: submit ad, approve/reject per franchise target, franchise submits their own ad for main-admin approval.
- **On approval**, create the real `schedules`/`playlist_items` rows so the ad actually gets scheduled onto that franchise's screens — this is the step that makes the approval meaningful, not just a status flip.

### 4. RLS policies
- `advertisers`: user sees only their own row (`user_id = auth.uid()`)
- `ads` / `ad_franchise_targets`: advertiser sees only their own ads; franchise_manager sees only ads targeting their franchise; main_admin sees all
- `franchises`: franchise_manager sees only their own; main_admin sees all
- **Fix the existing `orgs_select_auth` policy** from `00002_rls_fix.sql` — right now any authenticated user can read every org. Scope it to org members only.

### 5. Document everything
- Update `memory/SCHEMA-REFERENCE.md` with every new table/column/role as you add it — manaswini and soumya are building UI against this and shouldn't have to guess.

## Deliverable
Working tables, roles, RLS, and API logic for franchises/advertisers/ads and the two-tier approval workflow (advertiser→franchise, franchise→main admin), documented so the frontend side can build against it.
