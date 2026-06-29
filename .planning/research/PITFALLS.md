# Pitfalls Research: Digital Signage SaaS

## 1. RLS Misconfiguration — Org Data Leakage (Phase 0)

**Warning signs:** Queries returning data across orgs; `supabase.from('screens').select()` returns all rows in dev (no RLS on service role).

**Prevention:**
- Enable RLS on every table immediately — do not defer.
- Write explicit `SELECT`, `INSERT`, `UPDATE`, `DELETE` policies per table from day one.
- Test RLS with a second test org account before any feature is called "done."
- Never use service-role key in the browser or player.

**Phase:** Phase 0 (Foundations)

---

## 2. Supabase SSR Auth Misuse — Middleware Bypass (Phase 1)

**Warning signs:** Redirects not working on server-rendered pages; auth state stale between server/client.

**Prevention:**
- Use `@supabase/ssr` (not the legacy `@supabase/auth-helpers-nextjs`).
- Create a `middleware.ts` that calls `supabase.auth.getUser()` (not `getSession()`) to refresh the session cookie on every request.
- Never rely on `getSession()` server-side — it reads the JWT without refresh, goes stale.

**Phase:** Phase 1 (Auth)

---

## 3. Player Autoplay Blocked — Silent White Screen (Phase 7)

**Warning signs:** Player loads but videos never play; browser console shows "NotAllowedError: play() failed."

**Prevention:**
- All `<video>` elements must have `muted` attribute — autoplay without mute is blocked on all modern browsers/TV platforms.
- Test on the target hardware (Chromecast, Android TV browser, LG webOS) early — don't assume desktop Chrome behaviour carries over.
- Provide a tap-to-start fallback for initial user gesture requirement.

**Phase:** Phase 7 (Player)

---

## 4. Service Worker Caching Stale Media — Old Content Still Playing (Phase 7)

**Warning signs:** Admin updates playlist but screen keeps showing old content; hard-refresh not possible on unattended kiosk.

**Prevention:**
- Cache media by content hash in the URL (Supabase Storage signed URLs include version hash — use those).
- On schedule update message: fetch new schedule → diff media items → pre-cache new items → only then swap playlist.
- Use Workbox `CacheFirst` for media (immutable after upload) + `NetworkFirst` for schedule JSON.
- Build a "force refresh" mechanism: Realtime message type `force_reload` triggers `window.location.reload()`.

**Phase:** Phase 7 (Player)

---

## 5. Realtime Channel Proliferation — Connection Limits (Phase 3 + 7)

**Warning signs:** Screens go offline randomly; Supabase dashboard shows connection count near limits.

**Prevention:**
- Supabase free tier: 200 concurrent Realtime connections. Pro: 500+. Plan channel topology early.
- One channel per screen — `screen:{id}`. Dashboard subscribes to `org:{org_id}` for overview status, not individual screen channels.
- Player unsubscribes cleanly on visibility change / SW install to avoid ghost connections.
- For large deployments: consider a heartbeat aggregation Edge Function rather than individual Realtime presence per screen.

**Phase:** Phase 3 (Screens), Phase 7 (Player)

---

## 6. Scheduling Conflict Resolution — Wrong Content Playing (Phase 6)

**Warning signs:** Screen ignores a higher-priority schedule; default playlist overrides an active time-rule.

**Prevention:**
- Define priority rules explicitly and enforce server-side: specific screen > group, time-range > default, later-created > older for same priority.
- Derive the "current schedule" in a single deterministic server function (Edge Function or Postgres function) — never let the player compute it from raw rules.
- Return a pre-resolved `{ current_playlist, next_change_at }` object to the player. The player should play, not decide.

**Phase:** Phase 6 (Scheduling)

---

## 7. Video Thumbnail Generation Blocking Upload (Phase 4)

**Warning signs:** Upload hangs; UI shows spinner indefinitely; video thumbnail never appears.

**Prevention:**
- Do NOT generate thumbnails synchronously in the upload API route (will hit Vercel 30s timeout for large videos).
- Use a Supabase Edge Function triggered by Storage webhook (`storage.objects` insert) to extract frame asynchronously.
- Show a placeholder thumbnail immediately on upload; update once Edge Function completes (poll or Realtime).
- For v1 simplicity: generate thumbnail client-side with Canvas API (draw frame 0 of the video into a canvas → blob upload). No server compute needed.

**Phase:** Phase 4 (Media Library)

---

## 8. Multi-Zone State Complexity — Unpredictable Zone Editor (Phase 5)

**Warning signs:** Zone positions drift on save/load; zones overlap incorrectly; JSON stored inconsistently.

**Prevention:**
- Store zone layout as percentage-based `{ x, y, w, h }` — never pixel values (screens have different resolutions).
- Validate zone JSON with Zod schema on both write (dashboard) and read (player).
- Render zone editor preview at a fixed aspect ratio (16:9) and scale to actual screen resolution at play time.
- Limit MVP: offer 5-6 preset templates (full, L-bar, split, PiP) rather than a free-draw zone editor. The free editor is very hard to get right.

**Phase:** Phase 5 (Templates)

---

## 9. Player Token Security — Org Data Accessible from Screen (Phase 7)

**Warning signs:** Player's Supabase JWT can read all org media/schedules; a compromised screen leaks org data.

**Prevention:**
- Player must authenticate with a device-scoped anonymous session, not an org admin session.
- RLS policy for player reads: `auth.uid() = screens.anon_user_id` — player can only read its own screen's resolved schedule + assigned media CDN URLs.
- Never embed a service-role key or admin JWT in the player app.

**Phase:** Phase 7 (Player), Phase 0 (RLS design)

---

## 10. Vercel Serverless Cold Starts — Dashboard Feels Slow (Phase 0 + 9)

**Warning signs:** First page load after idle is 2-3s; "Loading…" flash on every navigation.

**Prevention:**
- Use Next.js Server Components (not client-fetching) for data-heavy pages — data fetches happen during SSR, no TTFB penalty for data.
- Enable Vercel Fluid Compute (default) — reuses instances for concurrent requests, dramatically reduces cold starts.
- Pre-warm critical routes with `generateStaticParams` where applicable.
- Use `loading.tsx` files for every route to show skeleton UI immediately.

**Phase:** Phase 9 (Polish)
