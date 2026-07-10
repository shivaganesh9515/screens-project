# Implementation Roadmap — Local SQL Database Workflow

> **Generated:** July 10, 2026
> **Execution order:** Phase 1 → 2 → 3 → 4 → 5 → 6

---

## Overview

| Phase | Priority | Tasks | Est. Time |
|-------|----------|-------|-----------|
| **0** Foundation | ✅ Done | 14 items | — |
| **1** Ad Creation Fields | **P0** | 6 tasks | ~50 min |
| **2** Approval → Schedule | **P0** | 4 tasks | ~35 min |
| **3** Player Playback | **P1** | 7 tasks | ~90 min |
| **4** Analytics Wiring | **P1** | 7 tasks | ~110 min |
| **5** Cleanup & Polish | **P2/P3** | 4 tasks | ~50 min |
| **6** Testing & Bug Fixing | **🏁 Final** | 16 tasks | ~160 min |
| | | **44 tasks total** | **~8 hrs** |

---

## Phase 0 — Foundation ✅ (Already Done)

| Step | Status |
|------|--------|
| Local SQLite database (19 tables) | ✅ |
| Simple local login (admin/demo accounts) | ✅ |
| Demo accounts (admin/franchise/advertiser) | ✅ |
| Franchise CRUD (create/list) | ✅ |
| Screen management (add/list/detail) | ✅ |
| Media upload (with orientation/type) | ✅ |
| Playlist builder | ✅ |
| Schedule calendar UI | ✅ |
| Analytics dashboard (charts/KPIs) | ✅ |
| Player kiosk shell | ✅ |
| Play Logs API | ✅ |
| Approve/Reject API | ✅ |
| JWT session auth + middleware | ✅ |

---

## Phase 1 — Ad Creation Fields 🥇 P0

**Goal:** Add screen type + orientation selection to ad creation.

| # | Task | Est. Time |
|---|------|:---------:|
| 1.1 | Add `screen_type` + `orientation` columns to `ads` table schema | 5 min |
| 1.2 | Add screen type selector (Bus/Auto/Static) to Create Ad dialog | 15 min |
| 1.3 | Add orientation selector (Landscape/Portrait) to Create Ad dialog | 10 min |
| 1.4 | Update DB INSERT to save new fields | 5 min |
| 1.5 | Create `ad_franchise_targets` row on ad submission | 10 min |
| 1.6 | Update seed data | 5 min |

---

## Phase 2 — Approval → Schedule Automation 🥇 P0

**Goal:** On franchise approval, auto-create schedule assigning media to screens.

| # | Task | Est. Time |
|---|------|:---------:|
| 2.1 | Update approve API: fetch franchise screens | 10 min |
| 2.2 | Get or create playlist from ad's media_item_id | 10 min |
| 2.3 | Insert schedule row for each screen | 10 min |
| 2.4 | Update reject API to clean up partial schedules | 5 min |

---

## Phase 3 — Player Content Playback 🥈 P1

**Goal:** Player fetches schedule, renders media, loops, generates play logs.

| # | Task | Est. Time |
|---|------|:---------:|
| 3.1 | Fetch resolved schedule + playlist items for screen | 15 min |
| 3.2 | Image rendering with CSS fade transitions | 20 min |
| 3.3 | Video autoplay + ended handler → next item | 15 min |
| 3.4 | Infinite playback loop | 10 min |
| 3.5 | POST play-log to API after each item | 10 min |
| 3.6 | Heartbeat every 30s | 10 min |
| 3.7 | Empty schedule fallback | 10 min |

---

## Phase 4 — Analytics & Data Wiring 🥈 P1

**Goal:** Dashboards use real SQLite data, not just seed.

| # | Task | Est. Time |
|---|------|:---------:|
| 4.1 | Seed realistic play_logs (30 days) | 10 min |
| 4.2 | Advertiser analytics uses real play_logs | 20 min |
| 4.3 | Fix admin dashboard: replace nested joins | 20 min |
| 4.4 | Fix franchise dashboard: same pattern | 20 min |
| 4.5 | Fix advertiser dashboard: same pattern | 15 min |
| 4.6 | Fix approve/reject API routes | 10 min |
| 4.7 | Fix schedule API routes | 15 min |

---

## Phase 5 — Cleanup & Polish 🥉 P2/P3

| # | Task | Est. Time |
|---|------|:---------:|
| 5.1 | Fix role mismatch in seed (advertiser role) | 5 min |
| 5.2 | Remove duplicate advertiser route at `app/advertiser/` | 15 min |
| 5.3 | Fix remaining nested join queries | 20 min |
| 5.4 | Remove unused imports / lint warnings | 10 min |

---

## Phase 6 — End-to-End Testing & Bug Fixing 🏁 FINAL

| # | Task | Est. Time |
|---|------|:---------:|
| 6.1 | Verify every page loads without errors | 20 min |
| 6.2 | Test all CRUD operations | 20 min |
| 6.3 | Verify login/logout for every role | 10 min |
| 6.4 | Verify role-based access | 10 min |
| 6.5 | Test advertisement creation and approval flow | 10 min |
| 6.6 | Test automatic schedule creation | 5 min |
| 6.7 | Test player playback | 10 min |
| 6.8 | Verify play logs generation | 5 min |
| 6.9 | Verify analytics updates | 10 min |
| 6.10 | Test empty-state handling | 10 min |
| 6.11 | Test invalid inputs and validation | 10 min |
| 6.12 | Check browser console for JS errors | 10 min |
| 6.13 | Check server logs for backend errors | 5 min |
| 6.14 | Fix UI issues (dialogs, overlays, toasts) | 20 min |
| 6.15 | Remove unused code and warnings | 10 min |
| 6.16 | Final regression build | 2 min |

---

## Time Estimates

| Scenario | Total |
|----------|:-----:|
| **Optimistic** (no blockers) | **~8 hours** |
| **Realistic** (debugging + fixes) | **~11–13 hours** |
| **Conservative** (issues + reviews) | **~14–16 hours** |

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@demo.com | admin123 |
| **Franchise** | franchise@demo.com | franchise123 |
| **Advertiser** | advertiser@demo.com | advertiser123 |

---

*Phase 0 is complete. Start with Phase 1 (P0) and work through sequentially.*
