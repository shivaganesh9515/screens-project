export interface Org {
  id: string;
  name: string;
  slug: string;
  plan: string;
  timezone: string;
  logo_path: string | null;
  created_at: string;
}

export interface OrgMember {
  org_id: string;
  user_id: string;
  role: "admin" | "editor" | "viewer" | "main_admin" | "franchise_manager" | "franchise" | "advertiser";
  joined_at: string;
}

export interface ScreenGroup {
  id: string;
  org_id: string;
  name: string;
  created_at: string;
}

export interface Screen {
  id: string;
  org_id: string;
  group_id: string | null;
  anon_user_id: string | null;
  name: string;
  pairing_code: string | null;
  pairing_expires_at: string | null;
  paired_at: string | null;
  last_seen: string | null;
  is_online: boolean;
  resolution: string | null;
  tags: string[] | null;
  created_at: string;
  screen_groups?: { name: string } | null;
}

export interface MediaItem {
  id: string;
  org_id: string;
  name: string;
  type: "image" | "video";
  storage_path: string;
  thumbnail_path: string | null;
  duration_ms: number | null;
  size_bytes: number | null;
  folder: string | null;
  tags: string[] | null;
  created_at: string;
}

export interface Playlist {
  id: string;
  org_id: string;
  name: string;
  created_at: string;
  playlist_items?: PlaylistItemWithMedia[];
  playlist_items_aggregate?: { count: number };
}

export interface PlaylistItem {
  id: string;
  playlist_id: string;
  media_item_id: string;
  position: number;
  duration_ms: number;
  created_at: string;
}

export interface PlaylistItemWithMedia extends PlaylistItem {
  media_items: MediaItem;
}

export interface Template {
  id: string;
  org_id: string;
  name: string;
  is_preset: boolean;
  zones: Zone[];
  created_at: string;
}

export interface Zone {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  playlist_id: string | null;
}

export interface Schedule {
  id: string;
  org_id: string;
  screen_id: string | null;
  group_id: string | null;
  playlist_id: string | null;
  template_id: string | null;
  is_default: boolean;
  priority: number;
  start_at: string | null;
  end_at: string | null;
  recurrence: ScheduleRecurrence | null;
  created_at: string;
  screens?: { name: string } | null;
  screen_groups?: { name: string } | null;
  playlists?: { name: string } | null;
  templates?: { name: string } | null;
}

export interface ScheduleRecurrence {
  days?: number[];
  time_start?: string;
  time_end?: string;
}

export interface PlayLog {
  id: string;
  screen_id: string | null;
  media_item_id: string | null;
  playlist_id: string | null;
  started_at: string;
  ended_at: string | null;
  duration_ms: number | null;
  screens?: { name: string } | null;
  media_items?: { name: string; type: string } | null;
}

export interface Franchise {
  id: string;
  org_id: string;
  managed_by: string | null;
  name: string;
  created_at: string;
}

export interface Advertiser {
  id: string;
  org_id: string;
  user_id: string | null;
  name: string;
  created_at: string;
}

export interface Ad {
  id: string;
  advertiser_id: string;
  org_id: string;
  name: string;
  media_item_id: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export interface AdFranchiseTarget {
  ad_id: string;
  franchise_id: string;
  status: "pending" | "approved" | "rejected";
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}
