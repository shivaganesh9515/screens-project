# Team Coordination — Simple Version

Most of the app is already built (against the real schema in `supabase/migrations/00001_schema.sql`). This isn't a "build everything from scratch" project anymore — it's "connect real Supabase, fix real gaps, build the two genuinely-missing pieces (the player app's actual playback, and the template zone editor)."

## Who Builds What

| Person | Owns | Status | Depends On |
|--------|--------|--------|------------|
| **harshitha** | Database/Supabase setup, screens + pairing, schedules, player app | DB schema DONE, needs real Supabase creds; screens DONE w/ small fixes; schedules DONE w/ 2 fixes; player app MOSTLY NOT STARTED | Nothing — starts first (needs to wire real Supabase before others can test against real data) |
| **srinitha** | Login/signup/reset, media upload, analytics | Auth DONE w/ 2 small bugs; media PARTIAL (folder/tag UI, storage cleanup); analytics DONE w/ polish items | harshitha's real Supabase connection |
| **abhinya** | Dashboard home, playlists, templates (zone editor), settings | Dashboard DONE w/ polish; playlists DONE; templates PARTIAL — zone editor is the biggest real gap in the whole app; settings PARTIAL (logo, invite, password) | harshitha's real Supabase connection |

---

## Real Dependency Chain

1. **harshitha connects real Supabase** (her Task 1) — until this is done, everyone is developing against the mock in-memory client (`lib/supabase/mock-client.ts`), which is fine for UI work but nobody's changes are actually persisted or provable end-to-end. Do this first.
2. **harshitha fixes the group-count bug and the group_id-on-schedules bug** — abhinya's Quick Deploy fix (Task 1) copies the same insert shape `schedule-calendar.tsx` uses, so wait for that bug to be fixed first or you'll copy the same mistake.
3. **srinitha's media folder/tag fields** feed abhinya's template zone editor only indirectly (templates bind zones to *playlists*, not media directly) — no hard dependency, but if srinitha adds tag filtering to media, it makes playlist-building easier for whoever's testing templates.
4. **harshitha's player app (Task 4)** depends on abhinya's template zone editor (Task 3) being functional if you want to test template-based (multi-zone) playback end-to-end — a plain playlist-based schedule can be tested without templates. Coordinate: harshitha can build/test playlist playback first, then template playback once zones have real `playlist_id` bindings.
5. **srinitha's analytics Fix 2 (real historical uptime)** explicitly depends on a decision from harshitha about whether/how to log online/offline history — don't build this without talking to her first (see srinitha's Task 3, Fix 2).

---

## What to Do If Blocked

| Problem | Do This |
|---------|---------|
| `.env.local` still blank / seeing "Using mock client" in the terminal | Tell harshitha — she owns getting real Supabase credentials into `.env.local` |
| Need to know a real column name | Check `supabase/migrations/00001_schema.sql` or `lib/types/database.ts` — don't guess, don't reuse old task-file names (`ads`, `screen_saver`, `vehicle_number`, `lat`/`lng` etc. don't exist) |
| Need test screens/media/playlists to work against | Create them yourself through the UI — mock mode seeds some fake data (`lib/supabase/mock-data.ts`) but once real Supabase is connected you'll need to create real rows |
| Not sure what to build | Read your `-TASKS.md` file — every task says DONE / PARTIAL / NOT STARTED at the top, with exact file paths |
| Git conflict | Tell the team lead |

---

## Daily Check-in Questions

1. What did you finish yesterday?
2. What are you working on today?
3. Are you stuck on anything?

---

## Git Rules

- Work ONLY on your branch
- NEVER push to master
- Push with: `git push origin <your-branch>`
- Commit with clear messages like "add folder/tag fields to media upload" or "build template zone editor"
