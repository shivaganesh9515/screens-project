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
| 3 | **Fix screen group counts** | harshitha | `_count?.screens` always shows 0 |
| 4 | **Fix schedule group-targeting** | harshitha | Group target doesn't set `group_id` in DB |
| 5 | **Add offline detection** | harshitha | Mark screens offline after 90s of no heartbeat |
| 6 | **Add media folder/tags on upload** | srinitha | Upload form missing folder/tag fields |
| 7 | **Add tag filtering to media grid** | srinitha | Tags exist in DB but no UI to filter by them |

### 🔧 P2 — Important But Not Urgent

| # | Task | Owner | Notes |
|---|------|-------|-------|
| 8 | Fix signup atomicity (handle partial failures) | srinitha | Could leave orphan auth users |
| 9 | Fix reset-password redirect param | srinitha | `redirect_to` vs `next` mismatch |
| 10 | Delete Storage files when media is deleted | srinitha | Orphaned files accumulate |
| 11 | Add recurrence UI to schedules | harshitha | `recurrence` JSONB column never set |
| 12 | Fix analytics grouping by id not name | srinitha | Duplicate names merge stats |
| 13 | Push date range filter into Supabase query | srinitha | Currently hard 2000-row cap |

### ✨ P3 — Polish & Nice-to-Have

| # | Task | Notes |
|---|------|-------|
| 14 | Compute `storageUsed` from real data | Currently hardcoded as 64 |
| 15 | Compute `contentFreshness` from real data | Currently hardcoded as 87 |
| 16 | Label analytics uptime as "Currently Online %" | To avoid implying historical data |
| 17 | Decide: use presigned URL upload or direct client upload | Media API route exists but isn't used |
| 18 | Make pairing codes collision-resistant | Uses `Math.random()` currently |

---

## Recently Completed

| What | Session | Date |
|------|---------|------|
| **All abhinya tasks verified as DONE** — reviewed 7 files, confirmed Quick Deploy, zone editor, settings features all built on `abhinya` branch | Session 2 | July 4, 2026 |
| Created `memory/` folder system (INSTRUCTIONS, SESSION_LOG, NEXT_STEPS) | Session 1 | July 4, 2026 |
| Created `memory/PROJECT_STATE.md` | Session 1 | July 4, 2026 |
