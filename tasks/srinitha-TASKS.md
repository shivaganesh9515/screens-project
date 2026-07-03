# srinitha — Your Tasks (Simple Version)

You own **login/signup/password reset**, **media upload**, and **analytics/reporting**. All three are largely built already — your job is mostly review + closing real gaps, not building from scratch.

**Heads up on the product:** no `users` table, no orientation/portrait-landscape on media, no `live_url` media type, no ad-approval anything. `media_items.type` is only `'image'` or `'video'`. Read `supabase/migrations/00001_schema.sql` and `lib/types/database.ts` before touching any query so you use real column names.

---

## TASK 1: Login System — STATUS: DONE (two small bugs)

### What exists (already built, review it, don't redo it)
- `lib/supabase/client.ts` / `lib/supabase/server.ts` — both already exist, and both auto-fall-back to an in-memory **mock client** (`lib/supabase/mock-client.ts`) whenever `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` are blank in `.env.local`. That's why the app currently "works" with no real backend — harshitha owns filling in real Supabase credentials (her Task 1); once that's done these files need no changes.
- `app/(auth)/login/page.tsx` — calls `supabase.auth.signInWithPassword({ email, password })`, redirects to `/overview` on success. Done.
- `app/(auth)/signup/page.tsx` — calls `supabase.auth.signUp(...)`, then correctly inserts a real `orgs` row and a real `org_members` row with `role: "admin"` tying the new `auth.users` id to that org. This is the right pattern for this schema (there is no `users` table to insert into). Done.
- `app/(auth)/reset-password/page.tsx` — calls `supabase.auth.resetPasswordForEmail(...)`. Done.
- `app/auth/callback/route.ts` — exchanges the auth code for a session and redirects. Done.
- `middleware.ts` — already exists, handles both mock-mode bypass and real session-based route protection (redirects signed-out users to `/login`, redirects signed-in users away from auth pages, leaves `/api` and `/player` alone). Done, no changes needed.

### What's missing / needs a fix pass

**Fix 1 — signup isn't atomic.** `app/(auth)/signup/page.tsx` does three separate calls in sequence: `auth.signUp` → insert into `orgs` → insert into `org_members`. If step 2 or 3 fails partway (network blip, slug collision on `orgs.slug`), you end up with an auth user that has no org, and they'll be stuck. At minimum, catch errors from each step and show a clear message; ideally, move org+member creation into a single Postgres function (`SECURITY DEFINER` RPC) called once after signup so it's one atomic transaction. If you don't have time for the RPC, at least add a friendly error for slug collisions (currently a raw Postgres error would leak to the user).

**Fix 2 — reset-password redirect param mismatch.** `reset-password/page.tsx` calls `resetPasswordForEmail(email, { redirectTo: ...&redirect_to=/overview })` but `app/auth/callback/route.ts` reads `searchParams.get("next")`, not `redirect_to`. It happens to still work today because `next` defaults to `/overview` anyway, but if you ever want the reset flow to land somewhere other than `/overview`, this silently won't work. Rename the query param on the sending side to `next` so it actually matches what the callback reads.

---

## TASK 2: Media Upload — STATUS: PARTIAL

### What exists (already built, review it, don't redo it)
- `app/(app)/media/page.tsx` — server component, fetches real `media_items` for your org, derives the folder list from the real `folder` column.
- `app/(app)/media/media-grid.tsx` — grid view using only real columns (`storage_path`, `thumbnail_path`, `duration_ms`, `size_bytes`, `folder`, `tags`, `type: "image"|"video"`). Type filter and a folder filter dropdown both work. Delete removes the `media_items` row.
- `app/(app)/media/media-upload.tsx` — uploads the file to Storage bucket `media`, generates a video thumbnail client-side via `<video>`/`<canvas>` for videos, inserts a `media_items` row with `org_id`, `name`, `type`, `storage_path`, `thumbnail_path`, `duration_ms`, `size_bytes`. No phantom columns (no `orientation`, `live_url`, `created_by` — correctly matches schema).

### What's missing / needs a fix pass

**Fix 1 — no way to set folder or tags on upload.** `media-grid.tsx` can filter by folder, and the `tags[]` column exists on `media_items`, but `media-upload.tsx` never lets the user pick a folder or add tags — every upload gets `folder: null, tags: null`. Add a folder text input (or a select-existing/type-new combo) and a simple tag input (comma-separated → `string[]`) to the upload form, and include `folder`/`tags` in the `insert(...)` call.

**Fix 2 — no tag filtering in the grid.** `media-grid.tsx`'s `MediaItem` type already includes `tags`, but nothing renders or filters on it. Once Fix 1 lets tags get set, add a tag filter alongside the existing type/folder filters (e.g. a multi-select of all distinct tags currently in use, filtering client-side).

**Fix 3 — delete doesn't clean up Storage.** `media-grid.tsx`'s delete only removes the `media_items` row; the actual file at `storage_path` (and its `thumbnail_path`) stays in the `media` bucket forever. Add `supabase.storage.from("media").remove([storage_path, thumbnail_path].filter(Boolean))` before or after the row delete.

**Fix 4 — decide what to do with the orphaned upload API route.** `app/api/media/upload/route.ts` is a fully-working presigned-upload-URL endpoint (`POST` with `{ org_id, file_name }` → `{ signedUrl, path, token }`), but `media-upload.tsx` doesn't use it — it uploads directly from the browser via `supabase.storage.from("media").upload(...)` using the anon key. Either:
  - (recommended) switch `media-upload.tsx` to request a signed URL from `/api/media/upload` first, then upload to that URL — this is the safer pattern since it doesn't require the client to hold broad storage-write permission, or
  - remove the unused route if you decide direct client upload is fine for this app's threat model.
Pick one and note your reasoning in the PR.

---

## TASK 3: Analytics — STATUS: DONE (polish items, not a rebuild)

### What exists (already built, review it, don't redo it)
- `app/(app)/analytics/page.tsx` — server component. Real queries: `screens` (id, name, is_online), `play_logs` joined to `screens!inner(name)` and `media_items(name, type)` filtered to your org's screen ids, ordered by `started_at` desc, capped at 2000 rows, and `media_items` (id, name, type).
- `app/(app)/analytics/analytics-dashboard.tsx` — client component, does all aggregation from the `playLogs` prop: total impressions, total play time, active screens, uptime %, daily trend chart, media breakdown, type distribution pie, per-screen performance, and a working **CSV export** button (`Media, Media Type, Screen, Started, Duration (s)`).

This is real, functioning `play_logs` reporting — not mock data, not a stub.

### What's missing / needs a fix pass

**Fix 1 — grouping by name instead of id.** Both the media breakdown and per-screen performance aggregations group rows by `media_items.name` / `screens.name` instead of `media_item_id` / `screen_id`. If two items in the same org ever share a name, their stats will incorrectly merge. Switch the grouping keys to the ids (still display the name, just don't group by it).

**Fix 2 — "uptime %" is a live snapshot, not a real historical metric.** `uptimePercent` is computed as `onlineScreens / screens.length` using the *current* `screens.is_online` flag — it does not reflect how online each screen was across the selected date range, since the schema has no historical online/offline log (only a single live boolean). This is a real, known limitation, not a bug to "fix" by yourself — flag it to harshitha, since a real historical uptime metric would need either (a) the offline-detection sweep she's building in her Task 2 to also write a small time-series log, or (b) deriving approximate uptime from `play_logs` density (screens with logged plays are inferred "up"). Coordinate with her before building anything here; for now just make sure the dashboard clearly labels this stat "Currently Online %" rather than implying it's a historical percentage.

**Fix 3 — hard 2000-row cap.** `page.tsx`'s `play_logs` query has `.limit(2000)` with no pagination, so for an org with heavy play volume, all charts/KPIs silently only reflect the most recent 2000 log rows regardless of the selected date range. If this matters for your org's scale, either raise the limit, or better, push the date-range filter into the Supabase query itself (`.gte("started_at", rangeStart)`) instead of fetching a flat 2000 and filtering client-side.

---

## Test Checklist

- [ ] Can sign up (creates a real `orgs` + `org_members` row), log in, reset password.
- [ ] Signup shows a friendly error on slug collision instead of a raw DB error.
- [ ] Can upload an image/video, set a folder and tags, see them in the grid.
- [ ] Can filter media by folder and by tag.
- [ ] Deleting a media item also removes its file from Storage.
- [ ] Analytics dashboard shows real numbers from `play_logs`, media/screen breakdowns don't merge same-named items, CSV export downloads a file.

---

## Git Rules

```bash
git checkout srinitha
git add .
git commit -m "what you did"
git push origin srinitha
```

NEVER push to master.
