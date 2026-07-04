# Bugs and Fixes

## Bug 1: group_id Never Inserted (HIGH)
**File:** `app/(app)/schedule/schedule-calendar.tsx:54`
**Problem:** When target is "group", only `screen_id` is set. `group_id` is never added to the insert object.
**Impact:** Group scheduling is completely broken.
**Fix:** Add `scheduleData.group_id = groupId || null;` when target is "group".
**Who:** harshitha

## Bug 2: Double JSON Encoding (HIGH)
**File:** `app/(app)/templates/templates-list.tsx:34,42`
**Problem:** `zones: JSON.stringify(preset.zones)` — zones is already JSONB, supabase-js serializes it. Stringifying first stores a JSON string instead of a JSON array.
**Impact:** Player can't parse zones correctly. Templates are decorative only.
**Fix:** Remove `JSON.stringify()`, pass `preset.zones` directly.
**Who:** abhinya

## Bug 3: Quick Deploy is a Stub (MEDIUM)
**File:** `app/(app)/overview/quick-deploy-widget.tsx:43-48`
**Problem:** `handlePush` just shows `toast.success("Content pushed to screen(s)")` — never writes to `schedules` table.
**Impact:** Feature appears to work but does nothing.
**Fix:** Add `supabase.from("schedules").insert(...)` with correct shape (see `schedule-calendar.tsx:53`).
**Who:** abhinya

## Bug 4: No Folder/Tags on Upload (MEDIUM)
**File:** `app/(app)/media/media-upload.tsx:51`
**Problem:** Insert has no `folder` or `tags` fields. Everything uploads as `folder: null, tags: null`.
**Impact:** Folder/tag filtering in media grid is useless.
**Fix:** Add folder input + tag input to upload form, include in insert.
**Who:** srinitha

## Bug 5: Player Never Plays Content (CRITICAL)
**File:** `app/player/[token]/page.tsx`
**Problem:** Player shows "Waiting for content..." forever. Never loads playlists or plays media.
**Impact:** The whole point of the app doesn't work.
**Fix:** After pairing, fetch schedule for this screen → load playlist → cycle through media items → play images with timer, videos with onended → log plays.
**Who:** harshitha

## Bug 6: No Template Editor (CRITICAL)
**File:** `app/(app)/templates/` — missing `[id]/page.tsx`
**Problem:** Can't open a template to edit zones or bind playlists to zones.
**Impact:** Templates are purely decorative previews. No multi-zone playback possible.
**Fix:** Create `app/(app)/templates/[id]/page.tsx` with zone editor component.
**Who:** abhinya

## Bug 7: Signup Not Atomic (LOW)
**File:** `app/(auth)/signup/page.tsx`
**Problem:** Three separate calls: auth.signUp → insert orgs → insert org_members. If step 2 or 3 fails, user has auth account but no org.
**Impact:** User stuck with no org.
**Fix:** Wrap in transaction or add error handling with friendly messages.
**Who:** srinitha

## Bug 8: Reset Password Redirect Param (LOW)
**File:** `app/(auth)/reset-password/page.tsx`
**Problem:** Uses `redirect_to` param but callback reads `next`. Works by accident since next defaults to `/overview`.
**Impact:** Custom reset destinations won't work.
**Fix:** Change `redirect_to` to `next` on sending side.
**Who:** srinitha

## Bug 9: Analytics Groups by Name (LOW)
**File:** `app/(app)/analytics/analytics-dashboard.tsx`
**Problem:** Media breakdown and per-screen performance group by `name` instead of `id`. If two items share a name, stats merge incorrectly.
**Impact:** Wrong analytics for orgs with duplicate names.
**Fix:** Group by `media_item_id` / `screen_id` instead of name.
**Who:** srinitha

## Bug 10: Analytics 2000 Row Cap (LOW)
**File:** `app/(app)/analytics/page.tsx`
**Problem:** `play_logs` query has `.limit(2000)` with no pagination. Heavy orgs get incomplete data.
**Impact:** Charts/KPIs only reflect recent 2000 rows.
**Fix:** Push date-range filter into Supabase query instead of client-side filtering.
**Who:** srinitha
