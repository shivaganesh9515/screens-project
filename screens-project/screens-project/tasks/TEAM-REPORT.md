# Team Coordination Report — July 7, 2026

## Overview

**Milestone:** Franchise/Advertiser 3-tier structure + Screen metadata/GPS/Analytics
**Team:** 6 members — 3 backend, 2 frontend, 1 floating support
**Status:** Backend mostly done, frontend significantly behind, coordination issues detected

---

## 1. Task Assignments vs Completion

### Harshitha — Backend (Franchises, Advertisers, Ads, Roles)

| # | Assigned Task | Status | Evidence |
|---|--------------|--------|----------|
| 1 | Create `franchises`/`advertisers`/`ads`/`ad_franchise_targets` tables | ✅ Done | `00003_franchise_ads.sql` (49 lines) |
| 2 | Add `main_admin` and `franchise_manager` roles | ✅ Done | DB types updated, invite route fixed |
| 3 | Build approval logic (submit → franchise approve → reject) | ✅ Done | `ads/[adId]/approve/route.ts` (91 lines), `ads/[adId]/reject/route.ts` (91 lines) |
| 4 | Lock down access (RLS) — advertisers see own ads, franchise sees territory, admin sees all | ✅ Done | Migration includes RLS policies |
| 5 | Write in SCHEMA-REFERENCE.md | ✅ Done | Schema reference updated |
| **Result** | | **5/5 Complete** | |

**Commits (6):**
- `e777256` Jul 6 6:39 PM — franchise/advertiser schema
- `1124353` Jul 6 6:52 PM — main admin and franchise manager roles
- `bb961dc` Jul 6 7:31 PM — sync database types
- `b5fe075` Jul 6 8:07 PM — advertiser ad submission endpoint
- `2676edd` Jul 6 8:57 PM — franchise ad approval endpoint
- `a95f6b4` Jul 6 9:31 PM — franchise ad rejection endpoint

---

### Srinitha — Backend (Media, Playlists, Screensaver)

| # | Assigned Task | Status | Evidence |
|---|--------------|--------|----------|
| 1 | Media orientation (landscape/portrait) | ✅ Done | `00003_add_orientation_to_media.sql` + `media-grid.tsx` + `media-upload.tsx` |
| 2 | Live video links (paste URL instead of upload) | ✅ Done | `00004_add_source_type_to_media.sql` + `media-upload.tsx` (+237 lines) |
| 3 | Playlist repeat count (per-item) | ✅ Done | `00005_add_repeat_count_to_playlist_items.sql` + `playlist-builder.tsx` |
| 4 | Screensaver setting (default media when nothing scheduled) | ✅ Done | `00006_add_screensaver_media_id_to_orgs.sql` + `settings-form.tsx` (+118 lines) |
| 5 | Read-only invites locked down everywhere | ❓ Unknown | No visible verification in commits |
| 6 | Media deletion from storage (not just DB) | ❓ Unknown | Not visible in commits |
| 7 | Unused upload API cleanup | ❓ Unknown | Not visible in commits |
| **Result** | | **4/7 Complete, 3 unclear** | |

**Commits (7):**
- `08e1831` Jul 6 6:23 PM — portrait/landscape orientation
- `ec5fa40` Jul 6 9:55 PM — media updates
- `00e6626` Jul 6 10:32 PM — button fixes
- `78143a3` Jul 6 11:19 PM — live video via link
- `d6bc338` Jul 7 10:41 AM — playlist repeat count
- `f03bf23` Jul 7 10:59 AM — playlist button updates
- `0bc1ab4` Jul 7 11:30 AM — dialog trigger update
- `4244a14` Jul 7 5:12 PM — screensaver option

---

### Abhinaya — Backend (Screens, GPS, Analytics)

| # | Assigned Task | Status | Evidence |
|---|--------------|--------|----------|
| 1 | Screen metadata (orientation, size, type, unique #, connectivity, location) | ✅ Done | `00003_screen_metadata.sql` (on Ashwanth's branch) |
| 2 | GPS tracking for vehicles | ✅ Done | `00004_ads_locations.sql` (on Ashwanth's branch) |
| 3 | Online/offline history table | ✅ Done | `00005_ads_playlogs.sql` (on Ashwanth's branch) |
| 4 | Ad play counts | ✅ Done | `00005_ads_playlogs.sql` (on Ashwanth's branch) |
| 5 | RLS for new tables | ✅ Done | `00006_rls_new_tables.sql` (on Ashwanth's branch) |
| 6 | Analytics queries (uptime/downtime, play count, group by ID fix) | ❓ Unknown | No analytics code visible in her branch diff |
| **Result** | | **5/6 Complete, 1 unclear** | |

**Commits on her branch (0):** Only has the task restructure commit from Jul 6 2:28 PM
**Note:** All her actual code work appears on **Ashwanth's branch** — not her own

---

### Soumya — Frontend (Screen, Media, Playlist UI)

| # | Assigned Task | Status | Evidence |
|---|--------------|--------|----------|
| 1 | New "Add Screen" form (unique #, orientation, type, connectivity, location) | ✅ Done | `add-screen-modal.tsx` (+227 lines) — full form with all fields |
| 2 | Update screens list (badges, filter/sort by type/orientation) | ✅ Done | `screens-table.tsx` (+127 lines) |
| 3 | Update media upload page (portrait/landscape filter, live link option) | ❌ Not started | No changes in `app/(app)/media/` |
| 4 | Update playlist builder ("play this many times" input) | ❌ Not started | No changes in `app/(app)/playlists/` |
| 5 | Add screensaver picker (settings section) | ❌ Not started | No changes in `app/(app)/settings/` |
| 6 | Add "read only" option in invite form | ❌ Not started | No changes in invite UI |
| **Result** | | **2/6 Complete, 4 missing** | |

**Commits (2):**
- `acbdaeb` Jul 7 4:28 PM — screens table metadata
- `f747e29` Jul 7 5:14 PM — add screen form rework

---

### Manaswini — Frontend (Live Map + Dashboards)

| # | Assigned Task | Status | Evidence |
|---|--------------|--------|----------|
| 1 | Live map on home page (green=online, red=offline, moving GPS points) | ❌ Not started | No map component created |
| 2 | GPS on player screen (browser location for bus/auto) | ❌ Not started | No GPS code in player |
| 3 | Role-based routing after login (admin→admin, franchise→franchise, advertiser→advertiser) | ✅ Done | Role support migration + invite route |
| 4 | Main Admin dashboard (all franchises, all screens, all advertisers, approval queue, create/edit franchises) | ❌ Not started | No dashboard components |
| 5 | Franchise dashboard (territory screens/schedules, approval queue, submit own ad) | ❌ Not started | No dashboard components |
| 6 | Advertiser dashboard ("My Ads", "Create Ad", own analytics) | ❌ Not started | No dashboard components |
| **Result** | | **1/6 Complete, 5 missing** | |

**Commits (1):**
- `6c202a2` Jul 7 4:18 PM — franchise and advertiser role support

---

### Ashwanth — Floating Support

| # | Assigned Task | Status | Evidence |
|---|--------------|--------|----------|
| 1 | Help whoever is stuck/behind | ⚠️ Wrong focus | Did Abhinaya's backend work instead of floating |
| 2 | Start backend-heavy, then switch to frontend | ⚠️ Did backend only | Created all 4 screen/GPS/analytics migrations |
| **Result** | | **Did another person's work** | |

**Commits (1):**
- `720ee9c` Jul 7 4:34 PM — First commit (contains Abhinaya's migrations + schema + RLS)

---

## 2. Where Coordination Got Messed Up

### Issue 1: Abhinaya's Work Done by Ashwanth
- **What happened:** Ashwanth created all 4 migrations (screen metadata, GPS locations, playlogs, RLS) that were Abhinaya's assigned tasks
- **Impact:** Abhinaya's branch has zero new commits — her work doesn't exist on her branch
- **Root cause:** No clear communication about who is working on what. Ashwanth "floated" into Abhinaya's area without coordinating
- **Fix:** Before starting any task, announce in the group: "I'm working on [task X]"

### Issue 2: Frontend Team Behind by 4-5 Tasks Each
- **What happened:** Soumya completed 2/6 tasks, Manaswini completed 1/6 tasks
- **Impact:** The biggest frontend pieces (3 dashboards, live map, media/playlist updates) are untouched
- **Root cause:** Possibly waiting on backend, but backend was done by Jul 6 night — frontend had Jul 7 to work
- **Fix:** Frontend should start UI skeleton immediately even before backend is 100% ready, using mock data

### Issue 3: Srinitha's 3 Tasks Unclear
- **What happened:** She made 8 commits but 3 tasks (read-only invites, media deletion, unused API) have no visible evidence
- **Impact:** These are small fixes that may have been forgotten
- **Root cause:** Tasks were bundled together and the smaller ones got deprioritized
- **Fix:** Treat each task as a separate commit so it's trackable

### Issue 4: Abhinaya's Analytics Queries Unknown
- **What happened:** Her assigned task #6 (analytics queries for uptime, play count, group by ID fix) has no visible code
- **Impact:** Frontend dashboards can't show real analytics without these queries
- **Root cause:** Unclear if she completed this on a different branch or if it's still pending
- **Fix:** Verify directly with Abhinaya — check if she has uncommitted work

### Issue 5: No Daily Check-ins
- **What happened:** Work happened in silos — nobody knew Ashwanth was doing Abhinaya's tasks
- **Impact:** Duplicate work, wrong person doing the work
- **Root cause:** No daily standup or progress sync
- **Fix:** Quick daily 5-min check: "What did I do? What's blocking me? Who needs help?"

---

## 3. What's Still Missing (Critical Path)

### Backend (mostly done)
| Person | Remaining |
|--------|-----------|
| Harshitha | ✅ All done |
| Srinitha | Read-only invite lockdown, media deletion from storage, unused API cleanup |
| Abhinaya | Analytics queries (verify with her) |

### Frontend (significantly behind)
| Person | Remaining |
|--------|-----------|
| Soumya | Media upload updates, playlist builder updates, screensaver picker, read-only invite toggle |
| Manaswini | Live map, GPS on player, all 3 dashboards (admin/franchise/advertiser) |
| Ashwanth | Should pivot to frontend help — especially Manaswini who has the biggest load |

---

## 4. Suggestions to Cover Faster

### Immediate Actions (Today)
1. **Verify with Abhinaya** — Does she have unpushed analytics code? If not, this is the #1 backend blocker
2. **Srinitha** — Finish the 3 small remaining tasks (read-only invites, media deletion, unused API) — these are 1-2 hour tasks
3. **Ashwanth** — Pivot to frontend immediately. Help Manaswini build the 3 dashboards since that's the biggest chunk
4. **Soumya** — Complete media upload, playlist builder, screensaver picker, and invite toggle today — these are straightforward since Srinitha already added the backend fields

### Work Redistribution
| Current Owner | Task | Reassign To | Reason |
|---------------|------|-------------|--------|
| Manaswini | Live map | **Ashwanth** | Manaswini has 5 tasks — split the map work |
| Manaswini | GPS on player | **Ashwanth** | Smaller task, easy to parallelize |
| Soumya | Screensaver picker | Keep (Soumya) | Quick task, she's closest to settings |
| Srinitha | Media deletion fix | **Harshitha** | Harshitha is done — can help with small fixes |

### Process Fixes
1. **Daily 5-min standup** — Each person says: done / doing / blocked
2. **No task without announcement** — Before coding, post "I'm working on X" in the group
3. **Push early, push rough** — Don't wait for polish. A rough working version > a perfect unpushed version
4. **Check SCHEMA-REFERENCE.md before starting** — If the column/table you need isn't there, ask the backend person first
5. **Each task = one commit** — Makes it easy to track who did what

### Timeline to Complete
| Work | Estimated Time | Owner |
|------|---------------|-------|
| Srinitha's 3 small fixes | 2-3 hours | Srinitha |
| Abhinaya's analytics queries | 3-4 hours | Abhinaya (verify first) |
| Soumya's 4 remaining UI tasks | 6-8 hours | Soumya |
| Manaswini's 5 dashboard/map tasks | 12-15 hours | Manaswini + Ashwanth |
| **Total remaining** | **~25-30 hours** | |

With Ashwanth helping Manaswini and Harshitha helping with small fixes, the remaining work can be done in **2-3 days** instead of 4-5 days solo.

---

*Report generated: July 7, 2026*
