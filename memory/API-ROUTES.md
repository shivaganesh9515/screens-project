# API Routes

## auth/onboard/route.ts
**Method:** POST
**Purpose:** Create org and org_member after signup
**Auth:** Requires Bearer token (Supabase access token)
**Body:** `{ name: string }` (org name)
**Flow:**
1. Verify JWT token
2. Get user ID from token
3. Create slug from name
4. Insert into `orgs` table
5. Insert into `org_members` table with role "admin"
**Returns:** 201 on success, 400/500 on error

## org/invite/route.ts
**Method:** POST
**Purpose:** Invite user to org
**Auth:** Requires Bearer token + admin role
**Body:** `{ email: string, role: "admin" | "editor" | "viewer" }`
**Flow:**
1. Verify JWT token
2. Check user is admin of the org
3. Look up invited email in `auth.users` via Admin API
4. If found, insert into `org_members`
5. If not found, return error "ask them to sign up first"
**Returns:** 201 on success, 400/404 on error
**Note:** Uses `SUPABASE_SERVICE_ROLE_KEY` for Admin API

## screens/heartbeat/route.ts
**Method:** POST
**Purpose:** Update screen's `last_seen` timestamp
**Auth:** Requires screen_id in body
**Body:** `{ screen_id: string }`
**Flow:**
1. Update `screens.last_seen` to now
2. Set `screens.is_online` to true
**Returns:** 200 on success

## screens/pair/route.ts
**Method:** POST
**Purpose:** Pair a screen with a pairing code
**Auth:** None (player calls this)
**Body:** `{ pairing_code: string, anon_user_id: string }`
**Flow:**
1. Find screen with matching pairing code
2. Check code hasn't expired
3. Set `anon_user_id`, `paired_at`, clear `pairing_code`
4. Return screen id and org_id
**Returns:** 200 with screen info, 404 if code invalid/expired

## media/upload/route.ts
**Method:** POST
**Purpose:** Get presigned URL for upload
**Auth:** Requires Bearer token
**Body:** `{ org_id: string, file_name: string }`
**Flow:**
1. Verify user is member of org
2. Generate storage path: `{org_id}/{timestamp}_{random}.{ext}`
3. Create signed URL
4. Return `{ signedUrl, path, token }`
**Note:** Currently unused — media-upload.tsx uploads directly

## Player Content Route (NOT BUILT)
**Purpose:** Get current playlist for a screen
**Auth:** anon_user_id
**Flow:**
1. Find screen by anon_user_id
2. Get active schedule (check time window, priority)
3. Load playlist items with media details
4. Return playlist array
**Status:** Not implemented — player just shows "Waiting for content..."

## Play Log Route (NOT BUILT)
**Purpose:** Log when media finishes playing
**Auth:** anon_user_id
**Body:** `{ screen_id, media_item_id, playlist_id, started_at, ended_at, duration_ms }`
**Flow:**
1. Insert into `play_logs` table
**Status:** Not implemented — no analytics data from player
