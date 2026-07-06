# Team Coordination — Franchise/Advertiser Milestone

This is a new, bigger milestone on top of the existing screens/playlists/schedules/media/templates engine (which is done and merged into `master`). It adds a 3-tier structure: **main admin** (whole platform) → **franchise** (a territory, the "all-rounder") → **advertiser** (only sees their own ads, can target multiple franchises).

## Who Builds What

| Person | Branch | Owns | Depends On |
|--------|--------|------|------------|
| **ashwanth** | `ashwanth` | Data model foundation — new tables/columns for screens metadata, franchises, advertisers, ads, GPS logging, RLS | Nothing — starts first, push early even if incomplete |
| **soumya** | `soumya` | Screen registration UI (unique-number verification, orientation/size/type/connectivity fields) | ashwanth's `screens` columns |
| **manaswini** | `manaswini` | Live map on home page, GPS tracking from player app, offline detection | ashwanth's `screen_locations` table |
| **abhinaya** | `abhinaya` | Analytics: uptime/downtime history, per-ad play counts, advertiser-scoped analytics view | ashwanth's `ad_id` on `play_logs`, possibly a new status-log table |
| **srinitha** | `srinitha` | Media (orientation filter, live video links), playlist per-item repeat count, screensaver, read-only invites | Mostly independent, can start immediately |
| **harshitha** | `harshitha` | Three dashboards (main admin / franchise / advertiser), RBAC routing, two-tier approval workflow | ashwanth's `franchises`/`advertisers`/`ads` tables |

Full task breakdown for each person is in `tasks/<name>-TASKS.md`.

## Real Dependency Chain

1. **ashwanth's schema** unblocks almost everyone — get a first migration pushed fast, even partial, and document new columns/tables in `memory/SCHEMA-REFERENCE.md` as you go so nobody guesses column names.
2. **harshitha's RBAC/routing shell** (Task 1 in her file) is the second blocker — soumya, manaswini, and abhinaya all need a way to check "what's this user's role and franchise scope" rather than each inventing their own check.
3. **soumya's screen registration** and **manaswini's live map/GPS** touch overlapping files (`app/(app)/screens/`) — coordinate directly if you're both editing the same component in the same week.
4. **abhinaya's ad play-count analytics** and **harshitha's approval workflow** both touch the `ads`/`ad_franchise_targets` tables — an ad only has plays to count once harshitha's approval flow actually creates real schedules from it. Sequence: harshitha's approval-to-schedule logic first, then abhinaya's play-count queries.
5. **srinitha's work is the most independent** — start immediately, minimal blocking dependencies.

## What to Do If Blocked

| Problem | Do This |
|---------|---------|
| Need a column/table that doesn't exist yet | Check `memory/SCHEMA-REFERENCE.md` first; if it's genuinely missing and blocking you, add it yourself in your own migration and flag it to ashwanth so there's no conflict |
| Not sure what to build | Read your `-TASKS.md` file — exact file paths and field names are listed |
| Git conflict | Tell the team lead |

## Git Rules

- Work ONLY on your own branch
- NEVER push to master
- Push with: `git push origin <your-branch>`
- Pull `master` first before branching off, so you start from the latest merged state
