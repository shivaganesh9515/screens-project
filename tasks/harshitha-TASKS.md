# harshitha — Three Dashboards, RBAC & Approval Workflow

**Branch:** `harshitha`
**Status:** NOT STARTED (continuing your existing dashboard/auth ownership from the previous round)
**Depends on:** ashwanth's `franchises`, `advertisers`, `ads`, `ad_franchise_targets` tables and the extended `org_members` roles.

## Tasks

### 1. Role-based routing / RBAC shell
- Extend the auth/onboarding flow so a logging-in user lands on the right dashboard based on their role: `main_admin` → admin dashboard, `franchise_manager` → franchise dashboard, `advertiser` → advertiser dashboard.
- This is the piece everyone else's role-scoped work depends on — get the routing/guard logic in early and document how to check "current user's role/franchise" so soumya/manaswini/abhinaya can reuse it instead of reinventing scoping checks.

### 2. Main Admin dashboard
- Global view: all franchises, all screens across territories, all advertisers.
- Approval queue for **franchise-submitted ads** (franchise → main admin approval tier).
- Franchise management: create/edit franchises, assign a franchise_manager user to one.

### 3. Franchise dashboard ("the all-rounder")
- Scoped to their own franchise/territory only — screens, schedules, playlists (reuse existing screens/schedule/playlist UI, just add the franchise scope filter).
- Their own approval queue: **advertiser ads targeting their franchise** — approve/reject per-ad, per-franchise (remember: one ad can target multiple franchises, each approves independently).
- Ability to submit their own ads, which then go to main admin for approval (Task 2's queue).

### 4. Advertiser dashboard
- Deliberately minimal: "My Ads" (list with per-franchise approval status), "Create Ad" (upload/select media, pick which franchises to target), and analytics (abhinaya owns the analytics queries — you own the page/routing shell it lives in).
- An advertiser must never see other advertisers' data, other franchises' screens, or anything main-admin/franchise-level. Enforce via RLS (ashwanth) + don't fetch/render anything out of scope client-side either.

### 5. The approval workflow itself
- Ad submission → `pending` status → shows up in the relevant approval queue(s) → approve/reject action updates `ad_franchise_targets.status` (or the franchise-ads equivalent) → on approval, create the actual `schedules`/`playlist_items` entries so the ad actually plays on that franchise's screens.
- Rejected ads should show a reason field if you want that level of polish (not required for v1, nice to have).

## Deliverable
Three working, role-gated dashboards (main admin / franchise / advertiser) and a functioning two-tier approval workflow that actually results in approved ads getting scheduled onto real screens.
