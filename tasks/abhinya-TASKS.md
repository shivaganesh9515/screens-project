# abhinya — Your Tasks (Simple Version)

You own the **dashboard home page**, **playlists**, **templates** (the zone editor — your biggest real task), and **settings**.

**Heads up on the product:** there's no Google Map, no GPS, no lat/lng anywhere in the schema — the old "map with colored dots" task doesn't apply. The real home page is an analytics-style dashboard. Templates are zone layouts (`zones` JSONB, each zone `{id,x,y,w,h,playlist_id}`) — each zone gets bound to a playlist, and that's the part that's genuinely unbuilt. Read `supabase/migrations/00001_schema.sql` and `lib/types/database.ts` before writing any query so you use real column names.

---

## TASK 1: Dashboard Home Page — STATUS: DONE (minor polish only)

### What exists (already built, review it, don't redo it — this is NOT a map, don't build one)
`app/(app)/overview/page.tsx` is a real server component pulling real data: `screens`, `media_items`, `schedules` (joined to `playlists(name)`, `screens(name)`, `screen_groups(name)`), `playlists`, `screen_groups`, and `play_logs` (joined to `screens(name)`, `media_items(name, type)`, capped at 1000 rows). No mock imports anywhere in this directory. Child components, all real:
- `analytics-cards.tsx` — Total/Online/Offline screens + Active Content KPI cards.
- `playback-activity-chart.tsx` — real `play_logs` bucketed by hour/day/month with a 1D/1W/1M/1Y/ALL toggle.
- `recent-activity.tsx`, `media-distribution-chart.tsx`, `screen-health-chart.tsx`, `top-content.tsx`, `recent-media.tsx`, `upcoming-schedules.tsx`, `screen-status-list.tsx` — all render real data passed down as props.
- `smart-insights.tsx`, `operational-metrics.tsx` — mostly real (`fleetUptime` is a real computed ratio).
- `quick-deploy-widget.tsx` — real `playlists`/`screens`/`screen_groups` populate its dropdowns.

### What's missing / needs a fix pass

**Fix 1 — "Quick Deploy" doesn't actually deploy anything.** `quick-deploy-widget.tsx`'s `handlePush` currently just shows `toast.success("Content pushed to screen(s)")` — it never writes anything to the database. Wire it to actually `supabase.from("schedules").insert({ org_id, playlist_id: <selected>, screen_id or group_id: <selected>, is_default: true, priority: 0 })` (or whatever priority/target makes sense for a "push now" action), matching the same insert shape `schedule-calendar.tsx` already uses (harshitha's Task 3 — check with her once she's fixed the group_id bug there, so you don't duplicate that mistake).

**Fix 2 (optional, low priority) — two hardcoded metrics.** In `app/(app)/overview/page.tsx`, `storageUsed = 64` and `contentFreshness = 87` are literal constants, not computed from real data, shown via `operational-metrics.tsx`. `storageUsed` could be computed from `media_items.size_bytes` sums (and would need a Storage-bucket-level quota to be meaningful); `contentFreshness` doesn't have an obvious schema-backed definition. Fine to leave as placeholders for now — just don't present them as real in a demo. Only fix if you have spare time.

---

## TASK 2: Playlists — STATUS: DONE

### What exists (already built, review it, don't redo it)
- `app/(app)/playlists/page.tsx` — server component, real `playlists` query with `playlist_items(count)`.
- `app/(app)/playlists/playlists-list.tsx` — grid of playlist cards, create/delete against real `playlists` table. No `play_count` field anywhere (correct — that column doesn't exist in this schema; looping/repetition is controlled purely by how many times you add the same media item to a playlist and by each item's `duration_ms`).
- `app/(app)/playlists/[id]/page.tsx` — server component, loads one playlist with `playlist_items(*, media_items(*))` plus the org's media library.
- `app/(app)/playlists/[id]/playlist-builder.tsx` — real drag-and-drop via `@dnd-kit/core`/`@dnd-kit/sortable` (`DndContext`, `SortableContext`, `useSortable`, `arrayMove`). Save correctly persists `position` (array index) and `duration_ms` (editable per item, defaults to the media's own `duration_ms` or 10000ms for images) to `playlist_items`.

Nothing to build here. If you have spare time: the save flow deletes all `playlist_items` for the playlist and re-inserts them fresh rather than updating in place, which means item ids change on every save — harmless functionally, but if you ever add per-item history/analytics keyed on `playlist_items.id` this would break it. Not worth changing unless you hit that need.

---

## TASK 3: Templates (Zone Editor) — STATUS: PARTIAL — this is your main build

### What exists (already built, review it, don't redo it)
- `app/(app)/templates/page.tsx` — server component, real `templates` query for your org.
- `app/(app)/templates/templates-list.tsx` — a list/preset picker with 5 hardcoded layouts (Full Screen, L-Bar, Split Horizontal, Split Vertical, Picture-in-Picture), each with a fixed `zones` array. "Use Template" inserts a new `templates` row (`is_preset: true`, the preset's zones). A "New Template" dialog lets you name a template and pick one of the 5 presets. Cards show a small read-only aspect-video preview of the zones (positioned `div`s from `zone.x/y/w/h` percentages). Delete works.

### What's actually missing (the real work)

**This is the core gap: there is no way to bind a zone to a playlist, and no way to draw a custom layout.** Every zone created today only ever has `{id,x,y,w,h}` — `zones[].playlist_id` (a real field per `lib/types/database.ts`'s `Zone` type) is never set anywhere in the app. Templates today are purely decorative previews with no actual content behind them, and there's no `app/(app)/templates/[id]/page.tsx` at all.

Build:
1. **`app/(app)/templates/[id]/page.tsx`** — a template editor page, following the same server-component pattern as `app/(app)/playlists/[id]/page.tsx`: load one `templates` row by id + org_id, plus the org's `playlists` list (for the zone-to-playlist picker).
2. **A zone editor component** (e.g. `app/(app)/templates/[id]/zone-editor.tsx` or `components/templates/zone-editor.tsx`, your call which — match whichever convention feels closer to `playlist-builder.tsx`'s placement) that:
   - Renders the template's `zones` as positioned boxes on a canvas (reuse the percentage-position math already in `templates-list.tsx`'s preview).
   - Lets the user click a zone and assign it a playlist from a `<Select>` of the org's real playlists (matching by `playlist_id`, same pattern `screen-detail.tsx` uses for its group `<Select>`).
   - Optionally: lets the user drag/resize zone edges to adjust `x/y/w/h`, and add/remove zones for a from-scratch custom layout (today "New Template" can only reuse one of the 5 presets — a real from-scratch builder is a stretch goal if you have time after playlist-binding works).
   - On save, `supabase.from("templates").update({ zones: updatedZonesArray }).eq("id", template.id)`.
3. **Fix the double-JSON-encoding bug while you're in this file.** `templates-list.tsx`'s "Use Template" handler does `zones: JSON.stringify(preset.zones)` before inserting — since `zones` is already a JSONB column, supabase-js will serialize the array for you; explicitly stringifying it first risks storing a JSON *string* instead of a JSON *array/object* (double-encoded). Remove the manual `JSON.stringify(...)` and pass `preset.zones` directly.
4. Make each template card in `templates-list.tsx` link to `/templates/[id]` so users can actually reach the new editor.

---

## TASK 4: Settings — STATUS: PARTIAL

### What exists (already built, review it, don't redo it)
- `app/(app)/settings/page.tsx` — server component, real `org_members` + `orgs` join for the current user, plus a full `org_members` list for the team section.
- `app/(app)/settings/settings-form.tsx` — 4 tabs:
  - **Organization** — edits real `orgs.name`/`orgs.timezone` via `supabase.from("orgs").update(...)`. `slug` shown read-only.
  - **Team Members** — lists real `org_members`, delete works against the real table.
  - **Profile** — shows real `user.email`/role, read-only.
  - **Billing** — shows real `org.plan`, read-only.

### What's missing / needs a fix pass

**Fix 1 — no logo upload.** `orgs.logo_path` is a real column but there's no UI to set it anywhere. Add a file input to the Organization tab that uploads to the `media` Storage bucket (same bucket srinitha's upload flow uses — e.g. path `${orgId}/logo.{ext}`) and saves the resulting path to `orgs.logo_path` via the same `update()` call the name/timezone fields already use.

**Fix 2 — "Invite" is a stub.** `handleInvite` in the Team Members tab currently just shows a success toast with no actual invite happening — no row is inserted anywhere, no email sent. A real invite needs to look up whether the invited email already has an `auth.users` account (the client can't query `auth.users` directly with the anon key), so build a small API route, e.g. `app/api/org/invite/route.ts`, using the Supabase **service role key** server-side (`SUPABASE_SERVICE_ROLE_KEY`, already in `.env.example`) to look up the user by email via the Supabase Admin API and, if found, insert an `org_members` row for them with `role: "editor"` (or whatever role the inviter picks). If the email has no account yet, return a clear "ask them to sign up first, then invite again" message — building a full email-invite flow is out of scope unless you have extra time.

**Fix 3 — no password change.** The Profile tab is read-only. Add a "change password" form calling `supabase.auth.updateUser({ password: newPassword })`.

**Fix 4 — leave Billing alone.** The "Upgrade Plan" button has no handler and says "Payment processing coming soon" — that's an intentional placeholder, not a bug. No real payment provider is in scope here; don't build anything for it unless asked.

**Not a gap — confirmed correctly absent:** there is no `screen_saver` table in the schema, and no screen-saver UI exists in Settings. That's correct: idle/default content is already handled by a schedule with `is_default = true` (see harshitha's Task 3) rather than a separate screensaver feature — don't add a screen-saver table or UI.

---

## Test Checklist

- [ ] Dashboard shows real KPIs/charts, Quick Deploy actually creates a schedule row.
- [ ] Can create a playlist, drag-reorder items, edit durations, save.
- [ ] Can open a template, assign a playlist to each zone, save, and see it reflected (check `templates.zones[].playlist_id` in Supabase).
- [ ] New templates insert `zones` as a real array/object, not a JSON string.
- [ ] Can update org name/timezone/logo.
- [ ] Can invite a teammate who already has an account (real `org_members` row appears); get a clear message when they don't.
- [ ] Can change your own password from Settings → Profile.

---

## Git Rules

```bash
git checkout abhinya
git add .
git commit -m "what you did"
git push origin abhinya
```

NEVER push to master.
