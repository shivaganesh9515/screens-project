# Current Status — What's Left (Simple Version)

Last checked: 2026-07-04, against the `abhinya`, `harshitha`, `srinitha` branches on GitHub.

This is not merged into `master` yet — it just tracks what each person has actually pushed so far, vs. what their `-TASKS.md` file asked for.

---

## harshitha — NOT STARTED YET

No commits pushed on her branch yet. Everything in `harshitha-TASKS.md` is still open:

1. **Connect real Supabase** — the app is still running on fake/mock data until she fills in `.env.local` with real project keys.
2. **Screen management fixes** — group counts show 0, offline screens never actually show as offline.
3. **Schedule fixes** — scheduling to a *group* of screens silently doesn't work; repeat/recurring schedules aren't built yet.
4. **Player app** — the big one. Pairing, figuring out what to play, actually playing it, and logging plays are all still fake/missing on the physical-screen page.

👉 This is the current bottleneck — nothing can be tested against real data until Task 1 is done, and the player app is the single biggest unfinished piece of the whole product.

---

## srinitha — GOOD PROGRESS, a few things left

Done so far (pushed):
- Signup now properly creates an organization and adds the user to it
- Reset-password link now goes to the right place after clicking it
- Upload form now lets you add a folder name and tags to media

Still left from her task file:
- Show/filter by tags in the media library (grid), not just at upload
- Deleting a media file should also delete it from storage (right now it just removes it from the list, the file stays)
- Decide what to do with an unused upload API route (keep and use it, or delete it)
- Analytics polish: don't group stats by name (two items with the same name would get merged), and the "uptime" number needs a note that it's a live snapshot, not historical

---

## abhinya — GOOD PROGRESS, mostly done

Done so far (pushed):
- Quick Deploy on the dashboard now actually works (used to just show a fake success message)
- Built the template zone editor — this was the biggest missing feature in the app. You can now add/remove zones and assign a playlist to each one, and it saves correctly.
- Fixed a crash in the zone editor
- Settings: added logo upload, working team invites, and password change

Still left (all optional/nice-to-have):
- Drag-to-resize zones in the template editor (stretch goal, not required)
- Two small cosmetic dashboard numbers are still hardcoded placeholders (storage used, content freshness) — not urgent

---

## Overall

- **abhinya** and **srinitha**: on track, doing exactly what their task files asked, only small items left.
- **harshitha**: hasn't started — needs to connect real Supabase first so everyone else's work can be tested against real data, then fix screens/schedules, then build the player app.
- Nothing from `abhinya`/`srinitha`'s branches is merged into `master` yet.
