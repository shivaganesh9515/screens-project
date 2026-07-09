# Screens API — Comprehensive Audit & Design Document

> **Generated:** July 9, 2026  
> **Scope:** All 12 existing API routes, missing APIs, OpenAPI reference, refactoring plan

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Existing API Audit](#2-existing-api-audit)
3. [Security Findings](#3-security-findings)
4. [Consistency Issues](#4-consistency-issues)
5. [Missing APIs](#5-missing-apis)
6. [OpenAPI Reference](#6-openapi-reference)
7. [Refactoring Plan](#7-refactoring-plan)

---

## 1. Executive Summary

| Metric | Status |
|--------|--------|
| Total API routes | 12 |
| Auth-protected | 10 (83%) |
| **Unauthenticated** | **2 (play-logs, heartbeat)** |
| Consistent error format | 0/12 (all use ad-hoc `{ error: string }`) |
| Input validation | 2/12 (onboard, org/invite only) |
| Rate limiting | 0/12 |
| Pagination | 0/12 |
| API versioning | None |
| OpenAPI docs | None |
| Zod validation | Not used in any API route |

**Critical Risks:**
- 2 endpoints have **zero authentication** — anyone can insert play logs or heartbeat data
- No input validation on most routes — raw `request.json()` passed directly to Supabase
- Pairing codes use `Math.random()` — predictable, not collision-resistant
- Middleware bypasses ALL API routes when `isApiRoute` is true — relies solely on per-route auth
- `service_role` key used in client-facing routes (onboard, heartbeat, pair/[code], screens/[id]/schedule)

---

## 2. Existing API Audit

### 2.1 POST /api/auth/onboard

| Aspect | Status | Notes |
|--------|--------|-------|
| Auth | ⚠️ Bearer token | Uses `Authorization: Bearer` header — unique among all routes |
| Service role | ✅ Yes | Correct — needs to create users/orgs without RLS |
| Input validation | ⚠️ Partial | Checks `name` type but allows empty body |
| Error format | `{ error: string }` | Consistent |
| Rollback | ✅ Yes | Deletes org if membership insert fails |
| **Issues** | | Reads body AFTER checking existing member — wastes a parse on returning users. No rate limiting on org creation. |

### 2.2 POST /api/screens/pair

| Aspect | Status | Notes |
|--------|--------|-------|
| Auth | ✅ Cookie-based | Correct |
| Service role | ❌ No | Uses `createClient()` — may hit RLS |
| Input validation | ⚠️ Minimal | Only checks `name` exists |
| Pairing code | 🔴 `Math.random()` | Predictable, 36^6 ≈ 2B combinations, not collision-resistant |
| **Issues** | | No validation on `group_id` (could be arbitrary UUID). No rate limiting on pairing. |

### 2.3 PUT /api/screens/pair/[code]

| Aspect | Status | Notes |
|--------|--------|-------|
| Auth | ⚠️ Service role | No user auth — relies on code secrecy |
| Service role | ✅ Yes | Correct for device-side pairing |
| Input validation | ⚠️ Minimal | Only checks `name` |
| Code expiry | ✅ Checked | Returns 410 for expired codes |
| **Issues** | | Anyone with a valid code can pair a screen to any org. No IP/device fingerprinting. |

### 2.4 POST /api/screens/heartbeat

| Aspect | Status | Notes |
|--------|--------|-------|
| Auth | 🔴 **NONE** | Anyone can send heartbeat for any `screen_id` |
| Service role | ✅ Yes | Correct for write |
| Input validation | ⚠️ Only checks `screen_id` exists | No GPS coordinate bounds |
| **Issues** | | **Critical:** Unauthenticated endpoint. Could be abused to fake screen online status. GPS logging has no validation on coordinate ranges. |

### 2.5 GET /api/screens/[id]/schedule

| Aspect | Status | Notes |
|--------|--------|-------|
| Auth | ⚠️ Service role | No user auth — screen data exposed to anyone |
| Service role | ✅ Yes | Correct for read |
| Input validation | ⚠️ Minimal | Only checks `id` param |
| **Issues** | | No auth check — if you know a screen UUID, you can read its schedule, playlist, and media URLs. Exposes storage CDN URLs. |

### 2.6 POST /api/play-logs

| Aspect | Status | Notes |
|--------|--------|-------|
| Auth | 🔴 **NONE** | Anyone can insert arbitrary play logs |
| Service role | ✅ Yes | Correct for bulk insert |
| Input validation | ⚠️ Only checks array | No validation on individual log fields |
| **Issues** | | **Critical:** Unauthenticated. Could pollute analytics with fake data. No `screen_id` validation against `screens` table. No rate limiting. |

### 2.7 POST /api/ads

| Aspect | Status | Notes |
|--------|--------|-------|
| Auth | ✅ Cookie-based | Correct |
| Input validation | ⚠️ Partial | Checks `name`, `franchise_ids` existence but not UUID format |
| Rollback | ✅ Yes | Deletes ad if target creation fails |
| Role handling | ⚠️ Mixed | `franchise_manager` path auto-sets franchise, advertiser path requires `franchise_ids` |
| **Issues** | | No validation that `franchise_ids` belong to the same org. `media_item_id` not validated against `media_items` table. |

### 2.8 POST /api/ads/franchise

| Aspect | Status | Notes |
|--------|--------|-------|
| Auth | ✅ Cookie-based | Correct |
| Franchise ownership | ✅ Verified | Checks `managed_by === user.id` |
| Rollback | ✅ Yes | Deletes ad if target creation fails |
| **Issues** | | Duplicates logic from `/api/ads` — should be consolidated. |

### 2.9 POST /api/ads/[adId]/approve

| Aspect | Status | Notes |
|--------|--------|-------|
| Auth | ✅ Cookie-based | Correct |
| Authorization | ⚠️ Complex | Two paths: `main_admin` vs `franchise_manager` — confusing |
| Side effects | ⚠️ Creates playlists + schedules | `deployAdPlaylist` has no error handling — partial failures leave orphan playlists |
| Role check | 🔴 `main_admin` vs `admin` | Schema defines `admin`, not `main_admin` |
| **Issues** | | `deployAdPlaylist` is fire-and-forget — no transaction, no rollback on partial failure. Creates duplicate playlists on repeated approvals. |

### 2.10 POST /api/ads/[adId]/reject

| Aspect | Status | Notes |
|--------|--------|-------|
| Auth | ✅ Cookie-based | Correct |
| Authorization | ⚠️ Same complex pattern as approve | Two role paths |
| **Issues** | | Same `main_admin` vs `admin` role naming issue. |

### 2.11 POST /api/org/invite

| Aspect | Status | Notes |
|--------|--------|-------|
| Auth | ✅ Cookie-based | Correct |
| Authorization | ✅ Admin-only | Correct |
| Input validation | ✅ Role whitelist | Checks against valid roles |
| **Issues** | | Uses `admin.auth.admin.listUsers()` to find users — O(n) scan of all users. Should use `getUserByEmail`. Service role key exposed in this route. |

### 2.12 POST /api/realtime/push

| Aspect | Status | Notes |
|--------|--------|-------|
| Auth | ✅ Cookie-based | Correct |
| Input validation | ⚠️ Only checks `screen_id`, `type` | No validation on `type` or `payload` |
| **Issues** | | `channel.subscribe` is async but not awaited properly. Realtime broadcast from server is unreliable. Comment says "use server-side Realtime admin client" — current implementation won't work in production. |

---

## 3. Security Findings

### CRITICAL

| # | Finding | Route | Impact |
|---|---------|-------|--------|
| C1 | **Unauthenticated play-logs** | POST /api/play-logs | Anyone can insert fake analytics data |
| C2 | **Unauthenticated heartbeat** | POST /api/screens/heartbeat | Anyone can fake screen online status |
| C3 | **Unauthenticated schedule read** | GET /api/screens/[id]/schedule | Any screen's schedule + media URLs exposed |
| C4 | **Predictable pairing codes** | POST /api/screens/pair | `Math.random()` is not cryptographically secure |

### HIGH

| # | Finding | Route | Impact |
|---|---------|-------|--------|
| H1 | **Service role in client routes** | onboard, heartbeat, pair/[code], schedule | Service role key bypasses RLS — used correctly but increases blast radius |
| H2 | **No input validation** | All routes except onboard, invite | Raw `request.json()` passed to Supabase — SQL injection possible via crafted fields |
| H3 | **`main_admin` vs `admin` role mismatch** | approve, reject | Schema defines `admin` not `main_admin` — `main_admin` path may never match |
| H4 | **No rate limiting** | All routes | API can be brute-forced |

### MEDIUM

| # | Finding | Route | Impact |
|---|---------|-------|--------|
| M1 | **Middleware skips all API routes** | middleware.ts | Auth enforcement relies entirely on per-route checks |
| M2 | **No CORS headers** | All routes | Third-party integrations blocked |
| M3 | **No request size limits** | play-logs, ads | Large payloads could exhaust memory |
| M4 | **`listUsers()` O(n) scan** | org/invite | Scales poorly with large user bases |
| M5 | **No transaction on approve** | ads/[adId]/approve | Partial failures leave orphan playlists |

### LOW

| # | Finding | Route | Impact |
|---|---------|-------|--------|
| L1 | **No API versioning** | All routes | Breaking changes affect all clients |
| L2 | **No request logging** | All routes | Difficult to debug issues |
| L3 | **No health check endpoint** | — | Monitoring can't verify API is up |

---

## 4. Consistency Issues

### Error Response Format
All routes use `{ error: string }` but:
- No `message` field for user-friendly messages
- No `details` field for validation errors
- No `timestamp` or `requestId` for debugging
- Status codes inconsistent: some 400 vs 422 for validation, some 403 vs 401 for auth

### Auth Pattern
3 different auth patterns exist:
1. **Bearer token** (onboard) — manual header parsing
2. **Cookie-based** (pair, ads, invite, realtime) — `createClient()` from `@/lib/supabase/server`
3. **Service role** (heartbeat, schedule, pair/[code]) — `createClient()` from `@supabase/supabase-js`

### Supabase Client Creation
3 different patterns:
1. Dynamic import with env check (heartbeat, schedule, pair/[code])
2. Static import from `@/lib/supabase/server` (pair, ads, invite, realtime)
3. Direct `createServerClient` from `@supabase/ssr` (onboard)

### HTTP Methods
- Only POST and GET used
- No PATCH for partial updates
- No DELETE for resource removal
- No list (GET) endpoints — only the schedule endpoint reads data

---

## 5. Missing APIs

### 5.1 Resource CRUD Gaps

| Resource | Create | Read | Update | Delete | List |
|----------|--------|------|--------|--------|------|
| screens | POST /pair | ✅ | PUT /pair/[code] | ❌ | ❌ |
| media_items | ❌ (client uploads directly) | ❌ | ❌ | ❌ | ❌ |
| playlists | ❌ | ❌ | ❌ | ❌ | ❌ |
| templates | ❌ | ❌ | ❌ | ❌ | ❌ |
| schedules | ❌ | GET /screens/[id]/schedule | ❌ | ❌ | ❌ |
| screen_groups | ❌ | ❌ | ❌ | ❌ | ❌ |
| orgs | POST /auth/onboard | ❌ | ❌ | ❌ | ❌ |
| org_members | POST /org/invite | ❌ | ❌ | ❌ | ❌ |

### 5.2 Missing API Endpoints (Priority Order)

**P0 — Core functionality gaps:**

| # | Endpoint | Method | Purpose |
|---|----------|--------|---------|
| 1 | `/api/screens` | GET | List screens for the org |
| 2 | `/api/screens/[id]` | GET | Get single screen details |
| 3 | `/api/screens/[id]` | PATCH | Update screen name, group, tags |
| 4 | `/api/screens/[id]` | DELETE | Remove a screen |
| 5 | `/api/media` | GET | List media items with filtering |
| 6 | `/api/media/upload` | POST | Server-side media upload (presigned URL) |
| 7 | `/api/media/[id]` | DELETE | Delete media + cleanup Storage |
| 8 | `/api/playlists` | GET | List playlists |
| 9 | `/api/playlists` | POST | Create playlist |
| 10 | `/api/playlists/[id]` | PATCH | Update playlist (reorder items) |
| 11 | `/api/playlists/[id]` | DELETE | Delete playlist |
| 12 | `/api/schedules` | POST | Create schedule |
| 13 | `/api/schedules/[id]` | PATCH | Update schedule |
| 14 | `/api/schedules/[id]` | DELETE | Delete schedule |
| 15 | `/api/screen-groups` | GET | List screen groups |

**P1 — Franchise/Ad workflow gaps:**

| # | Endpoint | Method | Purpose |
|---|----------|--------|---------|
| 16 | `/api/franchises` | GET | List franchises for the org |
| 17 | `/api/franchises` | POST | Create franchise |
| 18 | `/api/franchises/[id]` | PATCH | Update franchise |
| 19 | `/api/franchises/[id]` | DELETE | Delete franchise |
| 20 | `/api/ads` | GET | List ads with filters (status, franchise) |
| 21 | `/api/ads/[adId]` | GET | Get ad details with targets |
| 22 | `/api/ads/[adId]` | DELETE | Delete an ad |

**P2 — Utility endpoints:**

| # | Endpoint | Method | Purpose |
|---|----------|--------|---------|
| 23 | `/api/health` | GET | Health check (no auth) |
| 24 | `/api/media/tags` | GET | List all unique tags |
| 25 | `/api/screens/[id]/status-log` | GET | Screen status history |
| 26 | `/api/org/members` | GET | List org members |
| 27 | `/api/org/members/[userId]` | DELETE | Remove member from org |
| 28 | `/api/org/members/[userId]` | PATCH | Update member role |

---

## 6. OpenAPI Reference

### Base URL
```
http://localhost:3000/api
```

### Authentication
- **Cookie-based:** Supabase session cookie (via `@supabase/ssr`)
- **Bearer token:** `Authorization: Bearer <access_token>` (onboard only)

### Common Response Schema

**Success:**
```json
{ "ok": true, ...data }
```

**Error:**
```json
{ "error": "Error message" }
```

**Proposed standardized error:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": [{ "field": "name", "message": "Required" }],
    "requestId": "req_abc123"
  }
}
```

---

### POST /api/auth/onboard
Onboard a new user by creating their organization.

**Auth:** Bearer token  
**Request:**
```json
{ "name": "Acme Corp" }
```
**Response 200:**
```json
{ "org_id": "uuid" }
```
**Errors:** 401 (no token), 500 (creation failed)

---

### POST /api/screens/pair
Generate a pairing code for a new screen.

**Auth:** Cookie (authenticated user)  
**Request:**
```json
{ "name": "Lobby TV", "group_id": "uuid" }
```
**Response 200:**
```json
{ "code": "A1B2C3", "screen_id": "uuid", "expires_at": "ISO8601" }
```
**Errors:** 401 (unauthenticated), 500 (creation failed)

---

### PUT /api/screens/pair/[code]
Complete screen pairing with a code (called by the screen device).

**Auth:** None (code-based)  
**Request:**
```json
{ "name": "Lobby TV" }
```
**Response 200:**
```json
{ "screen": { "id": "uuid", "name": "...", ... } }
```
**Errors:** 404 (invalid code), 410 (expired), 500 (update failed)

---

### POST /api/screens/heartbeat
Screen heartbeat. Updates `last_seen` and `is_online`.

**Auth:** None (device endpoint)  
**Request:**
```json
{ "screen_id": "uuid", "latitude": 28.6, "longitude": 77.2 }
```
**Response 200:**
```json
{ "ok": true, "last_seen": "ISO8601" }
```
**Errors:** 400 (missing screen_id), 404 (screen not found), 500

---

### GET /api/screens/[id]/schedule
Fetch the current schedule and playlist items for a screen.

**Auth:** None (device endpoint)  
**Response 200:**
```json
{
  "playlist": { "id": "uuid" },
  "playlist_id": "uuid",
  "template_id": "uuid",
  "zones": [],
  "items": [
    {
      "id": "uuid",
      "media_items": { "id": "uuid", "name": "...", "type": "image", "url": "...", "duration_ms": 10000 },
      "duration_ms": 10000,
      "position": 0
    }
  ],
  "next_change_at": null
}
```
**Errors:** 404 (screen not found), 500

---

### POST /api/play-logs
Bulk insert play log entries.

**Auth:** None (device endpoint)  
**Request:**
```json
[
  {
    "screen_id": "uuid",
    "media_item_id": "uuid",
    "playlist_id": "uuid",
    "started_at": "ISO8601",
    "ended_at": "ISO8601",
    "duration_ms": 10000
  }
]
```
**Response 200:**
```json
{ "ok": true, "count": 1 }
```
**Errors:** 400 (not array), 500 (insert failed)

---

### POST /api/ads
Create an ad targeting one or more franchises.

**Auth:** Cookie (advertiser or franchise_manager)  
**Request:**
```json
{
  "name": "Summer Sale",
  "media_item_id": "uuid",
  "franchise_ids": ["uuid1", "uuid2"]
}
```
**Response 200:**
```json
{ "ad": { "id": "uuid", ... }, "franchise_ids": ["uuid1", "uuid2"] }
```
**Errors:** 400 (missing fields), 401, 403 (not advertiser), 500

---

### POST /api/ads/franchise
Create an ad from franchise manager perspective.

**Auth:** Cookie (franchise_manager)  
**Request:**
```json
{
  "name": "Local Promo",
  "media_item_id": "uuid",
  "franchise_id": "uuid"
}
```
**Response 200:**
```json
{ "ad": { "id": "uuid", ... }, "franchise_id": "uuid" }
```
**Errors:** 400, 401, 403 (not manager of franchise), 404, 500

---

### POST /api/ads/[adId]/approve
Approve an ad for a specific franchise.

**Auth:** Cookie (admin or franchise_manager)  
**Request:**
```json
{ "franchise_id": "uuid" }
```
**Response 200:**
```json
{ "ok": true }
```
**Errors:** 400, 401, 403, 404, 500

---

### POST /api/ads/[adId]/reject
Reject an ad for a specific franchise.

**Auth:** Cookie (admin or franchise_manager)  
**Request:**
```json
{ "franchise_id": "uuid" }
```
**Response 200:**
```json
{ "ok": true }
```
**Errors:** 400, 401, 403, 404, 500

---

### POST /api/org/invite
Invite a user to an organization by email.

**Auth:** Cookie (admin only)  
**Request:**
```json
{ "email": "user@example.com", "role": "editor", "orgId": "uuid" }
```
**Response 200:**
```json
{ "success": true, "message": "user@example.com has been added as editor" }
```
**Errors:** 400 (missing fields), 401, 403 (not admin), 404 (user not found), 409 (already member), 500

---

### POST /api/realtime/push
Broadcast a realtime push event to a screen.

**Auth:** Cookie (authenticated user)  
**Request:**
```json
{ "screen_id": "uuid", "type": "reload", "payload": {} }
```
**Response 200:**
```json
{ "ok": true, "screen_id": "uuid", "type": "reload" }
```
**Errors:** 400 (missing fields), 401, 500

---

## 7. Refactoring Plan

### Phase 1: Security Fixes (Must Do)

| # | Fix | Files | Effort |
|---|-----|-------|--------|
| 1 | **Add auth to play-logs** — require `anon_user_id` match or service role | `app/api/play-logs/route.ts` | 30min |
| 2 | **Add auth to heartbeat** — require valid `screen_id` + anonymous auth | `app/api/screens/heartbeat/route.ts` | 30min |
| 3 | **Add auth to schedule** — require `anon_user_id` match or authenticated user | `app/api/screens/[id]/schedule/route.ts` | 30min |
| 4 | **Replace `Math.random()`** — use `crypto.randomUUID()` or `crypto.randomBytes()` | `app/api/screens/pair/route.ts` | 15min |
| 5 | **Fix role names** — `main_admin` → `admin` in approve/reject | `app/api/ads/[adId]/approve/route.ts`, `reject/route.ts` | 15min |
| 6 | **Add input validation** — Zod schemas for all routes | All route files | 2-3hr |
| 7 | **Add rate limiting** — `@upstash/ratelimit` or middleware-based | `middleware.ts` | 1-2hr |

### Phase 2: Standardization (Should Do)

| # | Fix | Files | Effort |
|---|-----|-------|--------|
| 8 | **Standardize auth pattern** — single `getAuthenticatedClient()` helper | `lib/api/auth.ts` (new) | 1hr |
| 9 | **Standardize error responses** — `ApiError` class with code/message/details | `lib/api/errors.ts` (new) | 1hr |
| 10 | **Standardize Supabase client creation** — one `getServiceClient()` for service role, one `getUserClient()` for auth | `lib/api/supabase.ts` (new) | 30min |
| 11 | **Add request logging** — middleware or route-level logging | `middleware.ts` or each route | 1hr |
| 12 | **Add CORS headers** — allow configured origins | `middleware.ts` | 30min |
| 13 | **Consolidate ads routes** — merge `/api/ads` and `/api/ads/franchise` | `app/api/ads/route.ts` | 1hr |

### Phase 3: Missing APIs (Nice to Have)

| # | Endpoint | Files | Effort |
|---|----------|-------|--------|
| 14 | **Screen CRUD** — GET list, GET detail, PATCH update, DELETE | `app/api/screens/` (new routes) | 2-3hr |
| 15 | **Playlist CRUD** — GET list, POST create, PATCH update, DELETE | `app/api/playlists/` (new routes) | 2-3hr |
| 16 | **Schedule CRUD** — POST create, PATCH update, DELETE | `app/api/schedules/` (new routes) | 2hr |
| 17 | **Screen Groups CRUD** — GET list, POST create, PATCH, DELETE | `app/api/screen-groups/` (new routes) | 1-2hr |
| 18 | **Media delete** — delete from Storage + DB | `app/api/media/[id]/route.ts` | 30min |
| 19 | **Ad list + detail** — GET with filters, GET single | `app/api/ads/route.ts` (add GET) | 1hr |
| 20 | **Org members list + remove** — GET members, DELETE member | `app/api/org/members/` | 1hr |
| 21 | **Health check** — GET /api/health (no auth) | `app/api/health/route.ts` | 10min |

### Phase 4: Documentation & Tooling

| # | Task | Effort |
|---|------|--------|
| 22 | **Generate OpenAPI spec** from route files | 1hr |
| 23 | **Add API testing suite** — Playwright or Vitest for all routes | 3-4hr |
| 24 | **Add API changelog** | 30min |

---

## Appendix A: Proposed Shared Helpers

### `lib/api/auth.ts`
```typescript
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function requireAuth() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    throw new ApiError(401, "Unauthorized");
  }
  return { supabase, user };
}

export async function requireOrgMember(orgId: string) {
  const { supabase, user } = await requireAuth();
  const { data: member } = await supabase
    .from("org_members")
    .select("role, org_id")
    .eq("user_id", user.id)
    .eq("org_id", orgId)
    .single();
  if (!member) throw new ApiError(403, "Not a member of this org");
  return { supabase, user, member };
}

export async function requireRole(orgId: string, roles: string[]) {
  const { supabase, user, member } = await requireOrgMember(orgId);
  if (!roles.includes(member.role)) {
    throw new ApiError(403, `Requires role: ${roles.join(" or ")}`);
  }
  return { supabase, user, member };
}
```

### `lib/api/errors.ts`
```typescript
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
  }

  toResponse(requestId?: string) {
    return NextResponse.json(
      {
        error: {
          code: this.code,
          message: this.message,
          details: this.details,
          requestId,
        },
      },
      { status: this.status }
    );
  }
}
```

### `lib/api/validation.ts`
```typescript
import { z } from "zod";

export const PairScreenSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  group_id: z.string().uuid().optional(),
});

export const HeartbeatSchema = z.object({
  screen_id: z.string().uuid(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const CreateAdSchema = z.object({
  name: z.string().min(1).max(200),
  media_item_id: z.string().uuid().optional(),
  franchise_ids: z.array(z.string().uuid()).min(1),
});

export const InviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "editor", "viewer", "franchise", "advertiser"]),
  orgId: z.string().uuid(),
});
```
