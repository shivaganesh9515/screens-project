# 🎯 Next Steps — What to Work On

> **Purpose:** Current priorities and active tasks. Updated after every session.  
> *AI: When you finish a session, refresh this list based on what was just done.*

---

## Current Priority Queue

### 🔥 P0 — Must Do (Blocking everything else)

| # | Task | Owner | Why It's Blocking |
|---|------|-------|-------------------|
| 1 | **Connect real Supabase** | harshitha | Everything else is against mock data — no persistence, no real testing |
| 2 | **Build player playback** | harshitha | The actual screen app doesn't play content yet |

### ⚡ P1 — High Value

| # | Task | Owner | Notes |
|---|------|-------|-------|
| ~~3~~ | ~~Fix screen group counts~~ | ✅ Verified correct — mock data has group_id, client filters correctly |
| ~~4~~ | ~~Fix schedule group-targeting~~ | ✅ Fixed — added `screen_groups(name)` join to schedule API GET endpoints |
| ~~5~~ | ~~Add offline detection~~ | ✅ Done — `app/api/screens/offline-check/route.ts` marks stale screens offline after 90s |
| ~~6~~ | ~~Add media folder/tags on upload~~ | ✅ Done — restructured `media-upload.tsx` to separate link-specific fields from shared folder/tags |
| ~~7~~ | ~~Add tag filtering to media grid~~ | ✅ Done — added tag filter dropdown + tag badges on grid cards + tags column in list view |

### 🔧 P2 — Important But Not Urgent

| # | Task | Owner | Notes |
|---|------|-------|-------|
| ~~8~~ | ~~Fix signup atomicity~~ | ✅ Done — onboard route now deletes orphaned auth user on org/member creation failure |
| ~~9~~ | ~~Fix reset-password redirect param~~ | ✅ Done — reset-password page now uses `redirect_to`, callback reads both `redirect_to` and `next` |
| ~~10~~ | ~~Delete Storage files when media is deleted~~ | ✅ Done | `app/api/media/[id]/route.ts` now cleans up Storage + thumbnails |
| 11 | Add recurrence UI to schedules | harshitha | `recurrence` JSONB column never set |
| ~~12~~ | ~~Fix analytics grouping by id not name~~ | ✅ Done — mediaBreakdown now groups by `media_item_id`, adPlayData already groups by `ad_id` |
| ~~13~~ | ~~Push date range filter into Supabase query~~ | ✅ Done — server reads `?range=` param, applies `.gte("started_at", sinceDate)` for 7d/30d/90d |

### ✨ P3 — Polish & Nice-to-Have

| # | Task | Notes |
|---|------|-------|
| 14 | Compute `storageUsed` from real data | Currently hardcoded as 64 |
| 15 | Compute `contentFreshness` from real data | Currently hardcoded as 87 |
| 16 | Label analytics uptime as "Currently Online %" | To avoid implying historical data |
| 17 | Decide: use presigned URL upload or direct client upload | Media API route exists but isn't used |
| ~~18~~ | ~~Make pairing codes collision-resistant~~ | ✅ Done — uses `crypto.getRandomValues()` |

### 🚀 Marketing Website

| # | Task | Status | Plan Location |
|---|------|--------|---------------|
| 19 | **Build marketing website** | Planned | `docs/plans/2026-07-07-marketing-website.md` |
| | Landing page (`/`) | — | Hero, stats, how it works, features grid, CTA |
| | Features page (`/features`) | — | 6 detailed feature sections |
| | Pricing page (`/pricing`) | — | 3 tiers + comparison table + FAQ |
| | About page (`/about`) | — | Mission, story, team, values |
| | Contact page (`/contact`) | — | Form + contact info |
| | **Tech** | — | Next.js 16, Tailwind v4, Framer Motion, dark theme |
| | **Estimated time** | — | 6-8 hours, can parallelize across 3 people |

---

## Recently Completed

| What | Session | Date |
|------|---------|------|
| **P2 bug fixes** — signup atomicity (orphan auth user cleanup on onboard failure), reset-password redirect param (`redirect_to`), analytics grouping by `media_item_id` instead of name, server-side date range filter in analytics query | Session 7 | July 9, 2026 |
| **Full API audit + security hardening + CRUD endpoints** — wrote `docs/API-AUDIT.md`, created shared helpers (`lib/api/auth.ts`, `errors.ts`, `validation.ts`), fixed all 12 existing routes (auth, validation, service client, crypto), created 13 new endpoints (screens list/detail/update/delete, playlists list/create/detail/update/delete, schedules list/create/detail/update/delete, screen-groups list/create/update/delete, media delete, health check, org members list/update/remove, ads list, offline-check) | Session 6 | July 9, 2026 |
| **P1 bug fixes** — fixed schedule API GET joins (screen_groups), restructured media upload (folder/tags separated from link fields), added tag filtering to media grid (dropdown + badges + list column), verified screen group counts correct | Session 6 | July 9, 2026 |
| **Merged `harshitha` branch into master** — franchise/advertiser API endpoint docs appended to `memory/SCHEMA-REFERENCE.md` (conflict resolved by keeping master's RLS migration section and appending harshitha's new API docs) | Session 3 | July 9, 2026 |
| **Merged `manaswini` branch into master** — replaced franchise dashboard (`app/(app)/franchise/page.tsx`) with her fuller version (screens/playlists/schedules stats, activity feed, approval queue, ad request submission via `create-ad-dialog.tsx` + `franchise-ads-table.tsx`), added `app/api/ads/franchise/route.ts`. `approval-actions.tsx` is now unused dead code (superseded by `approval-queue.tsx`, same approve/reject API routes) | Session 3 | July 9, 2026 |
| Pushed merged `master` to `origin/master` (`9d90b17`) | Session 3 | July 9, 2026 |
| **All abhinya tasks verified as DONE** — reviewed 7 files, confirmed Quick Deploy, zone editor, settings features all built on `abhinya` branch | Session 2 | July 4, 2026 |
| Created `memory/` folder system (INSTRUCTIONS, SESSION_LOG, NEXT_STEPS) | Session 1 | July 4, 2026 |
| Created `memory/PROJECT_STATE.md` | Session 1 | July 4, 2026 |

## Flagged — Needs Manual Decision

| # | Item | Why |
|---|------|-----|
| 1 | **`origin/soumyaa` branch not merged** | Contains a full accidental duplicate of the entire repo nested inside a `screens-project/` subfolder (599 files, ~87k lines). Root-level content is otherwise identical to master except a 4-line `.gitignore` diff. Left un-merged per user decision (2026-07-09) — needs the branch owner to clean it up before it's usable. |
| 2 | **`approval-actions.tsx` is now dead code** | Superseded by `approval-queue.tsx` after the manaswini merge. Safe to delete once confirmed nothing else imports it. |
| 3 | **Pre-existing implicit-`any` TS errors** | `npx tsc --noEmit` shows ~15 implicit-`any` / type errors across `admin/page.tsx`, `admin/franchises/*`, `franchise/page.tsx`, `lib/supabase/mock-client.ts` (duplicate key). These pre-date this session's merges — not a regression, but worth a cleanup pass. |
