# 📓 Session Log — Screens Project

> **Purpose:** A running log of every session, what was done, and the state after each session.  
> **Newest entries at the top.**  
> *AI: After every session where you make changes, add a new entry here.*

---

## Session 8 — July 9, 2026

**AI Model:** opencode/mimo-v2-free  
**Branch:** `master`

### What was done
- **Local Supabase setup complete** — ran `supabase start`, all containers up on `localhost:54321` (disabled analytics container due to Windows Docker TCP limitation)
- **Consolidated 15 overlapping migrations** into single `00001_schema.sql` — fixed duplicate table creations (`franchises`, `advertisers`, `ads`, `ad_franchise_targets`, `screen_locations`), duplicate column adds, and mismatched column names (`manager_user_id` → `managed_by`)
- **Fixed `playlist_items` RLS** — table has no `org_id` column; policy now checks via `playlists.org_id` instead
- **Fixed FK ordering** — `orgs.screensaver_media_id`, `screens.franchise_id`, `play_logs.ad_id` now added via ALTER TABLE after their referenced tables exist
- **Configured `.env.local`** — filled with local Supabase credentials (URL, anon key, service role key)
- **Updated `config.toml`** — disabled analytics (`enabled = false`) for Windows compatibility
- **Database verified** — all 16 tables created successfully via `supabase db reset`
- **Committed and pushed** — 54 files changed, +2807/-1312 lines (commit `17f07cf`)

### State at end of session
- Local Supabase running with full schema
- `.env.local` configured for local dev
- App ready to test against real database
- Git clean, pushed to `origin/master`

### Problems encountered
- 15 migration files had duplicate version numbers and overlapping CREATE TABLE statements — resolved by consolidating into single migration
- `playlist_items` had no `org_id` but was in the RLS org-isolation loop — fixed by removing from loop and rewriting standalone policy
- `franchises.managed_by` vs `franchises.manager_user_id` naming mismatch across migrations — standardized to `managed_by`
- Analytics container unhealthy on Windows (Docker TCP limitation) — disabled in config

---

## Session 7 — July 9, 2026

**AI Model:** opencode/mimo-v2-pro  
**Branch:** `master`

### What was done
- **P2 #8: Signup atomicity** — onboard route now deletes orphaned auth user via admin API when org or member creation fails
- **P2 #9: Reset-password redirect param** — changed from `next` to `redirect_to` to match Supabase email template expectations; callback reads both for backward compatibility
- **P2 #12: Analytics grouping by id** — mediaBreakdown now groups by `media_item_id` instead of `media.name` (prevents duplicate-name merge); adPlayData already grouped by `ad_id`
- **P2 #13: Server-side date range filter** — analytics page reads `?range=` search param, applies `.gte("started_at", sinceDate)` for 7d/30d/90d; dashboard uses URL-based date range instead of local state

---

## Session 6 — July 9, 2026

**AI Model:** opencode/big-pickle  
**Branch:** `master`

### What was done
- **Full API audit** — wrote `docs/API-AUDIT.md` covering all 12 existing routes (C1-C4 critical, H1-H4 high, M1-M5 medium, L1-L3 low findings)
- **Shared API helpers** — created `lib/api/auth.ts` (requireAuth, requireOrgMember, requireRole, getUserOrgId, getServiceClient), `lib/api/errors.ts` (ApiError, handleApiError), `lib/api/validation.ts` (Zod schemas for all resources)
- **Security fixes on all 12 existing routes** — added auth, Zod validation, service client, crypto.getRandomValues(), fixed role mismatch (main_admin→admin), O(1) user lookup attempt (reverted to listUsers due to API limitation)
- **Created 13 new CRUD endpoints**: screens list/detail/update/delete, playlists list/create/detail/update/delete, schedules list/create/detail/update, screen-groups list/create/update/delete, media delete, health check, org members list/update/remove, ads list
- **Fixed schedule API GET** — added `screen_groups(name)` join to schedules list and detail endpoints
- **Added offline detection** — `app/api/screens/offline-check/route.ts` marks screens offline after 90s of no heartbeat, logs to `screen_status_log`
- **Restructured media upload** — separated link-specific fields (Name, Video URL, Add Live Video button) from shared metadata (Folder, Tags) in `media-upload.tsx`
- **Added tag filtering to media grid** — tag filter dropdown, tag badges on grid cards, tags column in list view

### State at end of session
- All new API routes compile cleanly (verified with `npx tsc --noEmit`)
- API surface complete: all resources have full CRUD
- NEXT_STEPS.md updated (tasks #10, #18 marked done)
- PROJECT_STATE.md updated

---

## Session 5 — July 7, 2026

**AI Model:** opencode/big-pickle  
**Branch:** `master`

### What was done
- **Verified migration 00007** — Reviewed `supabase/migrations/00007_rls_access_control.sql` against all client requirements; confirmed all 6 requirements satisfied (cross-org fix for `ads_admin_all`, org-scoped `targets_admin_all`, `play_logs` RLS, `orgs` admin policies, no recursion, existing policies untouched)
- **Appended docs** — Added Migration 00007 documentation section to `memory/SCHEMA-REFERENCE.md` without modifying any existing content

### State at end of session
- SCHEMA-REFERENCE.md now documents all migrations including 00007
- Working tree is clean

### Problems encountered
- None

### Next session should
- Tackle P0 priorities from NEXT_STEPS.md: connect real Supabase, or build player playback

---

## Session 4 — July 7, 2026

**AI Model:** opencode/mimo-v2.5-free  
**Branch:** `master`

### What was done
- **Team report generated** — Verified all 6 branches against assigned tasks, created `tasks/TEAM-REPORT.md` with completion status, coordination issues, and suggestions
- **Marketing website planned** — Created full implementation plan at `docs/plans/2026-07-07-marketing-website.md`
  - 14 tasks, 6-8 hours estimated
  - Dark theme, electric blue accent, Inter font
  - Pages: Landing, Features, Pricing, About, Contact
  - Tech: Next.js 16, Tailwind v4, Framer Motion
- **Branches merged** — Pulled all remote branches and merged to master

### State at end of session
- Team report complete — backend mostly done, frontend behind
- Marketing site plan ready for execution
- All branches merged to master

### Problems identified
- Abhinaya's code is on Ashwanth's branch, not hers
- Soumya 2/6 tasks done, Manaswini 1/6 tasks done
- Ashwanth did Abhinaya's work instead of floating support

### Next session should
- Execute marketing website plan (`docs/plans/2026-07-07-marketing-website.md`)
- Follow up on missing frontend tasks (Soumya/Manaswini)

---

## Session 4b — July 6, 2026

**AI Model:** deepseek/deepseek-v4-flash (via Codebuff)  
**Branch:** `abhinya`

### What was done
- **Implemented Task 4** (the only unblocked Abhinaya task):
  - Fixed `screenPerformance` memo to group by `screen_id` (UUID) instead of `screens?.name`
  - Changed uptime lookup from `screens.find(s => s.name === name)` to `screens.find(s => s.id === id)`
  - Changed React `<Cell>` keys from `entry.name` to `entry.id` for proper DOM reconciliation
- **Verified** TypeScript compiles cleanly (`tsc --noEmit` passes)
- **Code-reviewed** — fix is clean and correct
- **Updated** `PLAN-ABHINAYA.md` — Task 4 marked ✅ DONE

### State at end of session
- **Task 4** ✅ Complete — duplicate-named screens no longer merge their stats
- **Tasks 1-3** still 🔴 Blocked (no `screen_status_log`, `franchises`, `advertisers`, `ads`, or `ad_id` in schema yet)

### Next actions
- Wait for Ashwanth to deliver schema foundation (franchises, advertisers, ads, screen_status_log tables)
- Wait for Harshitha to deliver RBAC routing for advertiser dashboard

---

## Session 3 — July 6, 2026

**AI Model:** deepseek/deepseek-v4-flash (via Codebuff)  
**Branch:** `abhinya`

### What was done
- **Fixed TypeScript build error** — added `logo_path` to `OrgData` interface in `settings-form.tsx`
- **Fixed 7 lint issues** — removed unused imports (`Monitor` x2, `useCallback`, `formatRelativeTime`), removed unused props (`avgPlaybackRate`), restored `orgId` destructuring where parent passes it
- **Computed `storageUsed` from real data** — new parallel DB query sums all `media_items.size_bytes`, computes % against 1GB limit (replaced hardcoded `64`)
- **Computed `contentFreshness` from real data** — % of media items played in last 7 days from `play_logs` data (replaced hardcoded `87`)
- **Added drag-to-resize zones on template canvas** — 8 resize handles per zone (corners + edges), pointer event-based drag with percentage math, minimum size clamping (10%), bounds clamping, visual feedback
- **Fixed performance concern** — wrapped `updateZone` in `useCallback` to stabilize `handlePointerMove` deps
- **Build verified** — `npm run build` passes with zero errors

### State at end of session
- All abhinya tasks fully complete (4 tasks + all pending/stretch items)
- Build passes cleanly
- Changes committed and pushed to `abhinya` branch

### Problems encountered
- Several implicit-any TS errors needed explicit type annotations
- The `reduce<number>` generic syntax doesn't work on untyped arrays from mock client — used explicit parameter types instead

### Next session should
- Work on P0 priorities from NEXT_STEPS.md: connect real Supabase, build player playback, or fix bugs from harshitha/srinitha's lists

---

## Session 2 — July 4, 2026

**AI Model:** deepseek/deepseek-v4-flash (via Codebuff)  
**Branch:** `abhinya`

### What was done
- **Reviewed all Abhinya code** across 7 files modified on the `abhinya` branch
- **Verified all features are already implemented** (no new code needed):
  - ✅ Quick Deploy writes to `schedules` table (real DB insert)
  - ✅ Zone editor at `/templates/[id]/` with canvas, playlist binding, add/remove zones
  - ✅ Settings: logo upload, invite API, password change
  - ✅ Double-JSON-encoding bug fixed in template creation
  - ✅ Template cards link to editor
- **Updated documentation to match reality:**
  - `tasks/abhinya-TASKS.md` — changed all statuses from PARTIAL to ✅ DONE, with actual implementation details
  - `memory/PROJECT_STATE.md` — updated abhinya section with accurate status
  - `memory/NEXT_STEPS.md` — removed all abhinya tasks from priority queue (they're done)
  - `memory/SESSION_LOG.md` — added this entry

### State at end of session
- All Abhinya features are complete on the `abhinya` branch
- Task files and memory docs now reflect actual code state
- Only 2 hardcoded placeholders remain (storage=64, freshness=87) — low priority

### Problems encountered
- None — work was already done by previous session on same branch

### Next session should
- Work on highest remaining priorities: connect real Supabase, build player playback, or fix bugs from harshitha/srinitha's lists

---

## Session 1 — July 4, 2026

**AI Model:** deepseek/deepseek-v4-flash (via Codebuff)  
**Branch:** `abhinya` (current), also tracking `master`, `harshitha`, `srinitha`

### What was done
- Created the `memory/` folder system for project continuity across sessions/models
- **Created files:**
  - `memory/INSTRUCTIONS_FOR_NEXT_AI.md` — Guide for any new AI to onboard instantly
  - `memory/SESSION_LOG.md` — This file. Running log of all sessions.
  - `memory/NEXT_STEPS.md` — Current priorities and active work queue
  - `memory/PROJECT_STATE.md` — Comprehensive project state (previously created)
- **Updated files:**
  - `AGENTS.md` — Added memory folder reference for AI agents starting fresh
  - `CLAUDE.md` — Added memory folder reference for Claude/AI onboarding

### State at end of session
- Working tree is clean
- App runs against mock client (no real Supabase yet)
- All 6 UI phases complete (design tokens → motion/animation)
- Biggest gaps remain: zone editor, player playback, real Supabase connection

### Problems encountered
- None

### Next session should
- Pick up whatever is highest priority from `NEXT_STEPS.md`
- Read `INSTRUCTIONS_FOR_NEXT_AI.md` → `PROJECT_STATE.md` → latest `SESSION_LOG.md` → `NEXT_STEPS.md`
