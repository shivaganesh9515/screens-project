import { z } from "zod";

// --- Auth ---
export const OnboardSchema = z.object({
  name: z.string().min(1, "Organization name is required").max(100).optional(),
});

// --- Screens ---
export const PairScreenSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  group_id: z.string().uuid("Invalid group ID").optional(),
});

export const PairCompleteSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

export const HeartbeatSchema = z.object({
  screen_id: z.string().uuid("Invalid screen ID"),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const UpdateScreenSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  group_id: z.string().uuid().nullable().optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  resolution: z.string().max(20).optional(),
});

// --- Media ---
export const ListMediaSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  page_size: z.coerce.number().int().min(1).max(100).default(20),
  folder: z.string().optional(),
  tag: z.string().optional(),
  type: z.enum(["image", "video"]).optional(),
  search: z.string().max(200).optional(),
});

// --- Playlists ---
export const CreatePlaylistSchema = z.object({
  name: z.string().min(1).max(200),
});

export const UpdatePlaylistSchema = z.object({
  name: z.string().min(1).max(200).optional(),
});

export const PlaylistItemSchema = z.object({
  media_item_id: z.string().uuid(),
  position: z.number().int().min(0),
  duration_ms: z.number().int().min(1000).max(600000).default(10000),
});

export const UpdatePlaylistItemsSchema = z.object({
  items: z.array(PlaylistItemSchema).max(100),
});

// --- Schedules ---
export const CreateScheduleSchema = z.object({
  screen_id: z.string().uuid().optional(),
  group_id: z.string().uuid().optional(),
  playlist_id: z.string().uuid().optional(),
  template_id: z.string().uuid().optional(),
  is_default: z.boolean().default(false),
  priority: z.number().int().min(0).max(100).default(0),
  start_at: z.string().datetime().optional(),
  end_at: z.string().datetime().optional(),
  recurrence: z.any().optional(),
}).refine(
  (data) => data.screen_id || data.group_id,
  { message: "Either screen_id or group_id is required" }
).refine(
  (data) => data.playlist_id || data.template_id,
  { message: "Either playlist_id or template_id is required" }
);

export const UpdateScheduleSchema = z.object({
  playlist_id: z.string().uuid().nullable().optional(),
  template_id: z.string().uuid().nullable().optional(),
  is_default: z.boolean().optional(),
  priority: z.number().int().min(0).max(100).optional(),
  start_at: z.string().datetime().nullable().optional(),
  end_at: z.string().datetime().nullable().optional(),
  recurrence: z.any().nullable().optional(),
});

// --- Screen Groups ---
export const CreateScreenGroupSchema = z.object({
  name: z.string().min(1).max(100),
});

export const UpdateScreenGroupSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

// --- Ads ---
export const CreateAdSchema = z.object({
  name: z.string().min(1).max(200),
  media_item_id: z.string().uuid().optional(),
  franchise_ids: z.array(z.string().uuid()).min(1).optional(),
});

export const CreateFranchiseAdSchema = z.object({
  name: z.string().min(1).max(200),
  media_item_id: z.string().uuid().optional(),
  franchise_id: z.string().uuid("Invalid franchise ID"),
  screen_type: z.enum(["static", "bus", "auto"]).optional(),
  orientation: z.enum(["landscape", "portrait"]).optional(),
});

export const ApproveRejectAdSchema = z.object({
  franchise_id: z.string().uuid("Invalid franchise ID"),
});

export const ListAdsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  page_size: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  franchise_id: z.string().uuid().optional(),
});

// --- Org ---
export const InviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "editor", "viewer", "franchise_manager", "advertiser"]),
  orgId: z.string().uuid("Invalid organization ID"),
});

// --- Realtime ---
export const PushSchema = z.object({
  screen_id: z.string().uuid("Invalid screen ID"),
  type: z.string().min(1).max(50),
  payload: z.any().optional(),
});

// --- Play Logs ---
export const PlayLogSchema = z.object({
  screen_id: z.string().uuid(),
  media_item_id: z.string().uuid().optional(),
  playlist_id: z.string().uuid().optional(),
  started_at: z.string().datetime(),
  ended_at: z.string().datetime().optional(),
  duration_ms: z.number().int().min(0).optional(),
});

export const BulkPlayLogSchema = z.object({
  logs: z.array(PlayLogSchema).min(1).max(500),
});

// --- Pagination helper ---
export function paginate(query: any, page: number, pageSize: number) {
  const offset = (page - 1) * pageSize;
  return query.range(offset, offset + pageSize - 1);
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}
