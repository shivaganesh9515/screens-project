# abhinya — Your Tasks (Simple Version)

You own the **dashboard home page**, **playlists**, **templates** (the zone editor), and **settings**.

**Heads up on the product:** there's no Google Map, no GPS, no lat/lng anywhere in the schema — the old "map with colored dots" task doesn't apply. The real home page is an analytics-style dashboard. Templates are zone layouts (`zones` JSONB, each zone `{id,x,y,w,h,playlist_id}`). Read `supabase/migrations/00001_schema.sql` and `lib/types/database.ts` before writing any query so you use real column names.

---

## TASK 1: Dashboard Home Page — STATUS: ✅ DONE

### What exists
`app/(app)/overview/page.tsx` is a real server component pulling real data: `screens`, `media_items`, `schedules` (joined to `playlists(name)`, `screens(name)`, `screen_groups(name)`), `playlists`, `screen_groups`, and `play_logs` (joined to `screens(name)`, `media_items(name, type)`, capped at 1000 rows). No mock imports anywhere in this directory.

### Fixes applied (commit `bc451a9`)
- **Quick Deploy now writes to the database** — `quick-deploy-widget.tsx`'s `handlePush` inserts a real `schedules` row with `org_id`, `playlist_id`, `is_default: true`, `priority: 0`, and either `screen_id` or `group_id` depending on target type. The old stub (`toast.success` only) has been replaced with real Supabase logic (get user → get org → parse target → insert into `schedules`).

### Still pending (optional, low priority)
- `storageUsed = 64` and `contentFreshness = 87` are still hardcoded placeholders — need real computation from data if desired.

---

## TASK 2: Playlists — STATUS: ✅ DONE

### What exists
- `app/(app)/playlists/page.tsx` — server component, real `playlists` query with `playlist_items(count)`.
- `app/(app)/playlists/playlists-list.tsx` — grid of playlist cards, create/delete against real `playlists` table.
- `app/(app)/playlists/[id]/page.tsx` — server component, loads one playlist with `playlist_items(*, media_items(*))` plus the org's media library.
- `app/(app)/playlists/[id]/playlist-builder.tsx` — real drag-and-drop via `@dnd-kit/core`/`@dnd-kit/sortable`. Save persists `position` and `duration_ms`.

No work needed.

---

## TASK 3: Templates (Zone Editor) — STATUS: ✅ DONE

### What exists (from `master`)
- `app/(app)/templates/page.tsx` — server component, real `templates` query.
- `app/(app)/templates/templates-list.tsx` — preset picker with 5 layouts, create/delete, zone preview.

### What was built (commit `bc451a9` + `7ecaa82`)
All of the following were implemented on the `abhinya` branch:

1. **`app/(app)/templates/[id]/page.tsx`** — template editor server component, loads a template by id + org_id, plus the org's playlists for the zone-to-playlist picker.
2. **`app/(app)/templates/[id]/zone-editor.tsx`** — full zone editor with:
   - Visual zone canvas at 16:9 ratio with percentage-positioned zones
   - Zone colors (6 alternating colors)
   - Playlist assignment per zone via `<Select>` populated with real org playlists
   - Add/remove zones with custom sizing
   - Save updates `templates.name` and `templates.zones` via `supabase.from("templates").update(...)`
   - Zone ID badge + dimension display
3. **`app/(app)/templates/[id]/loading.tsx`** — skeleton loading state for the editor page
4. **Double-JSON-encoding fixed** — `templates-list.tsx` passes `preset.zones` directly (no `JSON.stringify`)
5. **Template cards link to editor** — each template card wraps in `<Link href={"/templates/${template.id}"}>` with external link icon on hover

### Stretch goal (not implemented)
- Drag-to-resize zones on the canvas (zones can be added/deleted and have their dimensions edited via the zone list, but not visually dragged/resized)

---

## TASK 4: Settings — STATUS: ✅ DONE

### What exists (from `master`)
- `app/(app)/settings/page.tsx` — server component with org + members data.
- `app/(app)/settings/settings-form.tsx` — 4 sections (Organization, Team Members, Profile, Billing).

### What was built (commit `bc451a9`)
1. **Logo upload** — `handleLogoUpload` function in `settings-form.tsx` uploads to `media` Storage bucket at path `${org.id}/logo.{ext}` with `upsert: true`, then saves `orgs.logo_path`. UI shows file input button with upload progress state.
2. **Invite endpoint** — `app/api/org/invite/route.ts` fully implemented with:
   - Auth check (must be logged in)
   - Role validation (admin-only)
   - Service role key lookup via Supabase Admin API to find user by email
   - Duplicate membership check
   - Insert into `org_members` with chosen role
   - Clear error message when email has no account
3. **Password change** — `handleChangePassword` in the Profile section calls `supabase.auth.updateUser({ password })` with validation (match check, min length 6).
4. **Admin gating** — logo upload, invite form, member deletion, and org edits are all gated behind `isAdmin` check.

### Intentionally not built
- **Billing** — "Upgrade Plan" button is a placeholder with "Payment processing coming soon" message. No payment provider is in scope.
- **Screen saver** — no `screen_saver` table in schema; default content is handled via `schedules.is_default = true`.

---

## Test Checklist

- [x] Dashboard shows real KPIs/charts, Quick Deploy actually creates a schedule row.
- [x] Can create a playlist, drag-reorder items, edit durations, save.
- [x] Can open a template, assign a playlist to each zone, save, and see it reflected (check `templates.zones[].playlist_id` in Supabase).
- [x] New templates insert `zones` as a real array/object, not a JSON string.
- [x] Can update org name/timezone/logo.
- [x] Can invite a teammate who already has an account (real `org_members` row appears); get a clear message when they don't.
- [x] Can change your own password from Settings → Profile.

---

## Git Rules

```bash
git checkout abhinya
git add .
git commit -m "what you did"
git push origin abhinya
```

NEVER push to master.

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
