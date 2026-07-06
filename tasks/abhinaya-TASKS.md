# abhinaya — Analytics: Uptime History & Ad Play Counts

**Branch:** `abhinaya`
**Status:** NOT STARTED
**Depends on:** ashwanth's `ad_id` column on `play_logs`, and (for uptime history) a way to log status changes over time — check with ashwanth/manaswini whether that needs a new `screen_status_log` table (recommended: log a row every time `is_online` flips, rather than trying to reconstruct history from nothing).

## Tasks

### 1. Screen on-time / off-time history
- If it doesn't exist yet, this needs a `screen_status_log` table: `screen_id`, `status` (online/offline), `changed_at`. Flag this to ashwanth if his migration doesn't already include it — you may need to add it yourself since you're the consumer.
- Build a view/query that sums total online duration vs offline duration per screen over a date range (day/week/month).
- File: `app/(app)/analytics/analytics-dashboard.tsx` — add an uptime/downtime chart or stat per screen, replacing today's live-snapshot-only `is_online` boolean display.
- Keep the existing label fix from the old backlog: make clear this is now real historical data, not a snapshot (once this ships, that caveat goes away).

### 2. Ad play count analytics
- Query `play_logs` filtered by `ad_id` (once ashwanth adds that column) to count plays per ad, per franchise, over a date range.
- Surface this in the main admin / franchise analytics view: "Ad X played 340 times this week across Hyderabad."

### 3. Advertiser-scoped analytics (the advertiser's own dashboard)
- This is the advertiser-facing piece: an advertiser should see **only their own ads'** play counts and status (pending/approved/rejected per franchise), nothing else.
- Likely a new route, e.g. `app/(advertiser)/analytics/page.tsx` — coordinate with harshitha since she owns the overall dashboard/routing structure and RBAC; you own the analytics queries and charts within it.

### 4. Fix the existing analytics grouping bug while you're in this file
- `analytics-dashboard.tsx` currently groups stats by screen **name** instead of **id** — two screens with the same name incorrectly merge. Fix to group by id.

## Deliverable
Real historical uptime/downtime per screen, ad-level play-count analytics, and an advertiser-scoped analytics view showing only their own ads.
