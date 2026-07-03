# harshitha — Your Tasks (Simple Version)

You own the **backbone**: the database, screen management/pairing, schedules (what plays where/when), and the player app that runs on the physical screens.

**Heads up on the product itself:** this is NOT an ad-approval marketplace anymore. There's no `ads` table, no franchise/advertiser roles, no GPS/lat-lng, no vehicle fields. The real system is zone/template + schedule based: an org uploads media → builds playlists → optionally arranges playlists into zone templates → schedules a playlist or template onto a screen or screen group → the player on that screen plays it and logs `play_logs`. Read `supabase/migrations/00001_schema.sql` and `lib/types/database.ts` for the exact tables/columns — this file only uses real ones.

**Also heads up:** the app currently runs against a **mock in-memory Supabase client** (`lib/supabase/mock-client.ts` + `mock-data.ts`), because `.env.local` has blank `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`. Every page below is written against the real schema and will work once you plug in real values (see `.env.example`), but nothing has actually been exercised against real Postgres yet. Setting up the real Supabase project and filling in `.env.local` is part of Task 1.

---

## TASK 1: Database — STATUS: DONE

### What exists
`supabase/migrations/00001_schema.sql` already has the full real schema, applied and working: `orgs`, `org_members` (role: admin/editor/viewer — there's no separate `users` table, `auth.users` is the source of truth), `screen_groups`, `screens` (`group_id`, `anon_user_id`, `pairing_code`/`pairing_expires_at`/`paired_at`, `last_seen`, `is_online`, `resolution`, `tags[]`), `media_items` (`type` is `image`|`video` only), `playlists`/`playlist_items` (`position`, `duration_ms`), `templates` (`zones` JSONB — each zone is `{id,x,y,w,h,playlist_id}`), `schedules` (`screen_id` OR `group_id`, `playlist_id` OR `template_id`, `is_default`, `priority`, `start_at`/`end_at`, `recurrence` JSONB), `play_logs`. Row-level security is wired for org isolation plus a special policy so a paired screen (`anon_user_id`) can read its own row. `lib/types/database.ts` has matching TypeScript types — read it before writing any query.

### What's actually NOT done: connecting a real Supabase project
1. Create/confirm the Supabase project for this repo.
2. Copy `.env.example` to `.env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
3. Run `supabase/migrations/00001_schema.sql` against that project (SQL Editor or `supabase db push`).
4. Create a public Storage bucket named exactly `media` (every upload in the codebase already assumes this bucket name — see `app/(app)/media/media-upload.tsx`).
5. Confirm: `console.log("[Supabase] Using mock client...")` should stop appearing in your terminal once env vars are set — that's how you know the app switched from mock data to your real project.

### Check if it worked
- `npm run dev`, sign up a new account, confirm a real row appears in `orgs` and `org_members` in the Supabase dashboard (not just in the browser).
- Add a screen from `/screens` and confirm it's a real row, not something that resets on server restart.

---

## TASK 2: Screen Management — STATUS: DONE (one small bug to fix)

### What exists (already built, review it, don't redo it)
- `app/(app)/screens/page.tsx` — server component, fetches real `screens` (joined to `screen_groups(name)`) scoped to your org.
- `app/(app)/screens/screens-table.tsx` — table with online/offline dot (from `is_online`), name, group, tags, last seen, delete.
- `app/(app)/screens/add-screen-modal.tsx` — posts to `/api/screens/pair`, shows the returned 6-character pairing code with a 10-minute expiry note.
- `app/(app)/screens/[id]/page.tsx` + `screen-detail.tsx` — detail view showing `resolution`, `paired_at`, `pairing_code`, tags, group, and the screen's `schedules` (joined to `playlists(name)`). Editing name/group/tags calls `supabase.from("screens").update(...)`.
- `components/screens/screen-groups.tsx` — create/delete `screen_groups`.
- `app/api/screens/pair/route.ts` (POST) — creates a screen row with a generated `pairing_code` + `pairing_expires_at` (10 min out).
- `app/api/screens/pair/[code]/route.ts` (PUT) — the endpoint a *player* should call to finish pairing (looks up by `pairing_code`, checks expiry, sets `paired_at`, clears the code). Correctly built but **currently never called by anything** — you'll wire it up in Task 4.
- `app/api/screens/heartbeat/route.ts` (POST) — sets `last_seen = now`, `is_online = true`.
- `lib/hooks/use-screens.ts` — a React Query alternative data-access layer (`useScreens`, `useScreen`, `useDeleteScreen`), schema-correct but not currently used by the pages above (they query Supabase directly). Fine to leave as-is or migrate the pages to use it — your call.

### What's missing / needs a fix pass

**Fix 1 — screen group counts always show 0.** In `components/screens/screen-groups.tsx`, each group card shows `group._count?.screens ?? 0`, but nothing anywhere ever fetches that count — the query in the parent page is a plain `select("*")` on `screen_groups` with no aggregation. Fix by counting screens per group, e.g. in the page that renders the groups list, fetch `screens` too and compute counts client-side (`screens.filter(s => s.group_id === group.id).length`), or add a `select("*, screens(count)")` style query and adapt the component to read that shape instead of `_count`.

**Fix 2 — no offline detection.** `POST /api/screens/heartbeat` only ever sets `is_online: true`. Nothing ever flips it back to `false` when a screen stops sending heartbeats — a screen that loses power will show "Online" forever. Add a way to detect staleness, either:
- Compute "online" on the fly wherever you display it: `is_online && last_seen > now - 90s` instead of trusting the raw `is_online` column, OR
- Add a small scheduled job/route (e.g. `app/api/screens/sweep-offline/route.ts`) that sets `is_online = false` for any screen whose `last_seen` is older than ~90 seconds, triggered by a cron (Vercel Cron or Supabase Edge Function schedule).
Pick whichever is simpler for you — the on-the-fly compute is less infrastructure.

**Fix 3 (optional, low priority) — pairing code generation.** `Math.random().toString(36).substring(2, 8).toUpperCase()` in `app/api/screens/pair/route.ts` isn't collision-resistant. Consider using `crypto.randomInt` or checking uniqueness before insert. Not urgent for a small deployment, but worth a TODO.

---

## TASK 3: Schedules — STATUS: DONE (two real gaps)

*(This replaces the old "Ad System" task — there's no approval workflow anymore. A schedule directly says "play this playlist/template on this screen/group, starting at X, optionally repeating, optionally as the always-on default.")*

### What exists (already built)
- `app/(app)/schedule/page.tsx` — server component, fetches real `schedules` (joined to `screens(name)`, `screen_groups(name)`, `playlists(name)`, `templates(name)`), plus lists of screens/playlists/templates for the create form.
- `app/(app)/schedule/schedule-calendar.tsx` — client component built on FullCalendar (`dayGridMonth` view). Each schedule renders as a calendar event using `start_at`/`end_at`. The create dialog inserts a real row into `schedules` with `org_id`, `playlist_id` or `template_id`, `is_default`, `priority`, and (for screen-targeted, non-default schedules) `screen_id`, `start_at`, `end_at`.

### What's missing / needs a fix pass

**Fix 1 — targeting a screen *group* silently does nothing.** In `schedule-calendar.tsx`'s create handler, only the `target === "screen"` branch sets `scheduleData.screen_id`. When the user picks "Group" as the target, there is no equivalent `scheduleData.group_id = ...` branch, so the inserted row has neither `screen_id` nor `group_id` set — the schedule is created but won't apply to anything. Add the missing branch so `target === "group"` sets `scheduleData.group_id = groupId` (and leaves `screen_id` null).

**Fix 2 — recurrence is NOT STARTED.** The `schedules.recurrence` column (JSONB, shape `{ days?: number[], time_start?: string, time_end?: string }` per `lib/types/database.ts`'s `ScheduleRecurrence`) is never read or written anywhere in the UI — only one-off `start_at`/`end_at` windows and always-on `is_default` schedules work today. Build a "Repeats" section in the create dialog: a day-of-week picker (Sun–Sat, stored as `days: number[]` where 0=Sunday) plus a daily time window (`time_start`/`time_end`, e.g. `"08:00"`/`"20:00"`). Save it as `scheduleData.recurrence = { days, time_start, time_end }` when the user enables repeating; leave `null` otherwise. The player (Task 4) is what will actually interpret this JSON to decide if "now" falls inside a recurring window — for this task you just need to capture and display it (add a small text summary like "Mon–Fri, 8am–8pm" on the calendar event/list).

---

## TASK 4: Player App — STATUS: MOSTLY NOT STARTED

### What exists (kiosk chrome only — real, keep it)
`app/player/[token]/page.tsx` already does real, working browser-kiosk mechanics: requests fullscreen, requests a Wake Lock so the screen doesn't sleep, hides the cursor after idle, and blocks Escape/F11/Ctrl+W/Ctrl+Q so a viewer can't accidentally back out. Keep all of that.

### What's NOT actually working (this is the real task)
Everything content-related is currently fake/unreachable:
- The pairing code shown on screen is generated **client-side with `Math.random()`** and is never sent to the server — it will never match the real `pairing_code` created by `add-screen-modal.tsx` / `POST /api/screens/pair`. There's no call to `PUT /api/screens/pair/[code]` (which already exists and works — see Task 2) to actually complete pairing.
- `localStorage.getItem("screen_id")` is checked on load, but nothing anywhere ever *sets* it — so the "paired" branch of the player can never actually be reached through real use.
- Heartbeat (`POST /api/screens/heartbeat` every 30s) is coded correctly but only fires `if (state.paired && state.screenId)` — unreachable for the same reason.
- There is no code that fetches a playlist, fetches `media_items`, or renders an `<img>`/`<video>` — the "paired" UI is just a static "Waiting for content..." placeholder.
- Nothing writes to `play_logs`. `POST /api/play-logs/route.ts` already exists and correctly inserts whatever array of log rows you send it — it's just never called.

### Build this
1. **Real pairing flow.** Replace the fake local code generator with: on first load (no `screen_id` in localStorage), show a 6-character code entry form (not a randomly-generated display — the code comes from whoever ran "Add Screen" in the dashboard and typed/read the pairing code to the physical device). On submit, `PUT /api/screens/pair/{code}` with `{ name: <optional device label> }`. On success, store `screen.id` in `localStorage.setItem("screen_id", ...)` and flip `state.paired = true`.
2. **Resolve what to play.** Once paired, fetch the screen's active schedule. You'll need a new read path — either a client-side Supabase query (the paired screen's `anon_user_id` RLS policy already allows it to read its own `screens` row) or a small API route like `app/api/screens/[id]/now-playing/route.ts` that:
   - Loads `schedules` where `screen_id = this screen` OR `group_id = this screen's group_id`.
   - Picks the best match: prefer a non-default schedule whose `start_at`/`end_at` window contains "now" (and, once Task 3's recurrence UI lands, whose `recurrence.days`/`time_start`/`time_end` also matches "now"), highest `priority` wins on conflict; otherwise fall back to the `is_default = true` schedule for that screen/group.
   - Resolves that schedule's `playlist_id` (fetch `playlist_items` ordered by `position`, joined to `media_items`) or `template_id` (fetch `templates.zones`, and for each zone with a `playlist_id`, fetch that playlist's items — you'll be rendering multiple zones at once, each looping its own playlist).
3. **Playback loop.** For a plain playlist: show each `playlist_items` row's media (`image` → `<img>` for `duration_ms`; `video` → `<video>` play-through, or `duration_ms` if you want a hard cap) in `position` order, looping back to the start when it reaches the end. For a template: render each zone as an absolutely-positioned `div` (using `zone.x/y/w/h` as percentages, same pattern `templates-list.tsx` already uses for previews) and run each zone's playlist loop independently inside it.
4. **Log plays.** When a media item finishes playing (or the player advances past it), push a log entry `{ screen_id, media_item_id, playlist_id, started_at, ended_at, duration_ms }` to a local buffer, and periodically (e.g. every 30s, alongside the heartbeat, or on each item completion) `POST /api/play-logs` with the buffered array.
5. Re-poll for schedule changes periodically (e.g. every 60s) so a newly-created/edited schedule takes effect without a manual reload.

### Test checklist
- [ ] Task 1: `npm run dev` runs against real Supabase (no "Using mock client" log), all tables visible in Supabase dashboard.
- [ ] Task 2: Add a screen, see it in the list with correct group count, pairing code shown and expires after 10 min, offline screens stop showing "Online" after ~90s of no heartbeat.
- [ ] Task 3: Create a schedule targeting a screen AND one targeting a group — both actually apply. Recurrence picker saves and displays correctly.
- [ ] Task 4: Enter a real pairing code on `/player/[anything]`, screen pairs, correct playlist/template plays, `play_logs` rows appear in Supabase after playback.

---

## Git Rules

```bash
git checkout harshitha
git add .
git commit -m "describe what you did"
git push origin harshitha
```

NEVER push to master. Only push to your branch.
