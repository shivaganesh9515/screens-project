# Team Tasks

## harshitha — Database, Screens, Schedules, Player

### Task 1: Database Setup — DONE
- Schema created in `supabase/migrations/00001_schema.sql`
- All tables, RLS policies, indexes done
- **Next:** Wire real Supabase credentials into `.env.local`

### Task 2: Screen Management — DONE (bugs to fix)
- Screen CRUD works
- Pairing code generation works
- **Fix:** Group count bug (screen_groups query)
- **Fix:** Offline detection sweep

### Task 3: Schedules — DONE (bugs to fix)
- Schedule calendar UI works
- FullCalendar integration done
- **Fix:** `group_id` never inserted (Bug 1)
- **Fix:** Add recurrence UI

### Task 4: Player App — NOT STARTED
- Pairing screen works (shows code)
- **Build:** Load playlist after pairing
- **Build:** Play images with timer, videos with onended
- **Build:** Cycle through playlist items
- **Build:** Log plays to play_logs
- **Build:** Multi-zone playback from template

---

## srinitha — Auth, Media, Analytics

### Task 1: Login System — DONE (bugs to fix)
- Signup, login, reset-password all work
- Middleware handles auth routing
- **Fix:** Signup atomicity (Bug 7)
- **Fix:** Reset password redirect param (Bug 8)

### Task 2: Media Upload — PARTIAL
- Basic upload works
- Grid with type/folder filter works
- Delete works
- **Fix:** Add folder/tag inputs to upload form (Bug 4)
- **Fix:** Add tag filtering to grid
- **Fix:** Clean up Storage on delete
- **Fix:** Decide on signed URL vs direct upload

### Task 3: Analytics — DONE (bugs to fix)
- Real play_logs queries work
- Dashboard with charts/KPIs works
- CSV export works
- **Fix:** Group by id instead of name (Bug 9)
- **Fix:** Label "Currently Online %" correctly
- **Fix:** Push date-range into query (Bug 10)

---

## abhinya — Dashboard, Playlists, Templates, Settings

### Task 1: Dashboard — DONE (bugs to fix)
- Real KPIs and charts work
- Quick Deploy widget exists
- **Fix:** Wire Quick Deploy to actually create schedule (Bug 3)

### Task 2: Playlists — DONE
- Playlist CRUD works
- Drag-reorder with @dnd-kit works
- Per-item duration editing works
- Nothing major to fix

### Task 3: Templates — PARTIAL (biggest gap)
- Preset picker works
- Template list with preview works
- **Fix:** Double JSON encoding (Bug 2)
- **Build:** `templates/[id]/page.tsx` — template editor page (Bug 6)
- **Build:** Zone editor component — assign playlists to zones
- **Build:** Make template cards link to `/templates/[id]`

### Task 4: Settings — PARTIAL
- Org name/timezone edit works
- Team member list works
- **Fix:** Logo upload to Storage
- **Fix:** Invite flow (API route with service role key)
- **Fix:** Password change in Profile tab
