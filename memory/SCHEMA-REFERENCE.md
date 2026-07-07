# Database Schema Reference

> **Source of truth:** `supabase/migrations/` files (00001 through 00006).
> **Types:** `lib/types/database.ts`

---

## Tables

### orgs
Top-level entity. Each org has users, screens, media, etc.
```sql
CREATE TABLE orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'free',
  timezone TEXT DEFAULT 'UTC',
  logo_path TEXT,
  screensaver_media_id UUID REFERENCES media_items(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### org_members
Links users to orgs with roles. No `users` table — `auth.users` is source of truth.
```sql
CREATE TABLE org_members (
  org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor', 'viewer', 'main_admin', 'franchise_manager')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (org_id, user_id)
);
```
**Update (00003):** Added `main_admin` and `franchise_manager` roles alongside existing `admin`, `editor`, `viewer`.
- `main_admin`: Super-admin who sees everything across all orgs
- `franchise_manager`: Manages a specific franchise territory

### screen_groups
Groups of screens for bulk scheduling.
```sql
CREATE TABLE screen_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### screens
Physical display devices. Track pairing, location, and franchise assignment.
```sql
CREATE TABLE screens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
  group_id UUID REFERENCES screen_groups(id) ON DELETE SET NULL,
  anon_user_id UUID,
  name TEXT NOT NULL DEFAULT 'New Screen',
  pairing_code TEXT,
  pairing_expires_at TIMESTAMPTZ,
  paired_at TIMESTAMPTZ,
  last_seen TIMESTAMPTZ,
  is_online BOOLEAN DEFAULT FALSE,
  resolution TEXT,
  tags TEXT[],
  -- NEW COLUMNS (00003):
  orientation TEXT CHECK (orientation IN ('landscape', 'portrait')),
  size_type TEXT,
  screen_type TEXT CHECK (screen_type IN ('static', 'bus', 'auto')),
  unique_number TEXT UNIQUE NOT NULL,
  connectivity_type TEXT CHECK (connectivity_type IN ('sim', 'wifi')),
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  franchise_id UUID REFERENCES franchises(id) ON DELETE SET NULL,  -- (00004)
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
**Updates:**
- **(00003):** Added `orientation`, `size_type`, `screen_type`, `unique_number`, `connectivity_type`, `lat`, `lng`
- **(00004):** Added `franchise_id` FK → `franchises(id)`
- `unique_number` replaces the random pairing code flow. Format: `SCR-NNN`
- `screen_type` determines behavior: `static` = fixed location with lat/lng; `bus`/`auto` = GPS-tracked via `screen_locations`
- `franchise_id` = null means unassigned to any franchise

### media_items
Uploaded images and videos.
```sql
CREATE TABLE media_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  storage_path TEXT NOT NULL,
  thumbnail_path TEXT,
  duration_ms INTEGER,
  size_bytes INTEGER,
  folder TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### playlists
Ordered lists of media items.
```sql
CREATE TABLE playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### playlist_items
Media items in a playlist with position and duration.
```sql
CREATE TABLE playlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  media_item_id UUID REFERENCES media_items(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  duration_ms INTEGER NOT NULL DEFAULT 10000,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### templates
Zone layouts. `zones` is JSONB array.
```sql
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_preset BOOLEAN DEFAULT FALSE,
  zones JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### schedules
When/where to play content.
```sql
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
  screen_id UUID REFERENCES screens(id) ON DELETE CASCADE,
  group_id UUID REFERENCES screen_groups(id) ON DELETE CASCADE,
  playlist_id UUID REFERENCES playlists(id) ON DELETE SET NULL,
  template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
  is_default BOOLEAN DEFAULT FALSE,
  priority INTEGER DEFAULT 0,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  recurrence JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### play_logs
What played when (from player).
```sql
CREATE TABLE play_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  screen_id UUID REFERENCES screens(id) ON DELETE SET NULL,
  media_item_id UUID REFERENCES media_items(id) ON DELETE SET NULL,
  playlist_id UUID REFERENCES playlists(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_ms INTEGER
  -- NEW COLUMN (00005):
  ad_id UUID REFERENCES ads(id) ON DELETE SET NULL,
);
```
**Update (00005):** Added `ad_id` FK → `ads(id)` — enables per-ad play count analytics (abhinaya).

---

## 🆕 New Tables (ashwanth's milestone)

### franchises (00003)
Territory managers within an org. A franchise manages screens and schedules in a specific geographic area.
```sql
CREATE TABLE franchises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  territory_area TEXT,
  manager_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | Auto-generated |
| `org_id` | UUID FK → orgs | Org this franchise belongs to |
| `name` | TEXT NOT NULL | Display name (e.g. "Hyderabad Region") |
| `territory_area` | TEXT nullable | Free-text description of coverage area |
| `manager_user_id` | UUID FK → auth.users nullable | The franchise manager's auth user ID |
| `created_at` | TIMESTAMPTZ | Auto-set |

**Used by:** soumya (screen registration assigns franchise_id), harshitha (franchise dashboard scoping), manaswini (map filtering by franchise)

### advertisers (00003)
Independent ad-buyer accounts. NOT scoped to a single org — advertisers can target franchises across different orgs.
```sql
CREATE TABLE advertisers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | Auto-generated |
| `user_id` | UUID FK → auth.users | The advertiser's auth user ID (not org-scoped) |
| `company_name` | TEXT NOT NULL | Display name |
| `created_at` | TIMESTAMPTZ | Auto-set |

**RLS:** `user_id = auth.uid()` — advertisers only see their own row.

### ads (00004)
Ad content submitted for approval. References media content and tracks approval status.
```sql
CREATE TABLE ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_id UUID REFERENCES advertisers(id) ON DELETE CASCADE,
  media_item_id UUID REFERENCES media_items(id) ON DELETE SET NULL,
  playlist_item_id UUID REFERENCES playlist_items(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_by_franchise_id UUID REFERENCES franchises(id) ON DELETE SET NULL,  -- (00005)
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | Auto-generated |
| `advertiser_id` | UUID FK → advertisers nullable | The advertiser who created this ad (null if franchise-submitted) |
| `media_item_id` | UUID FK → media_items nullable | Primary content reference (image/video). SET NULL on me
