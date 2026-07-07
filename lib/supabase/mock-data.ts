// Mock seed data for local development when Supabase is not available

// Generate realistic play_logs across the last 30 days
function generatePlayLogs() {
  const logs: any[] = [];
  const mediaItems = [
    { id: "media-1", name: "Welcome Banner.jpg", type: "image" },
    { id: "media-2", name: "Product Launch.mp4", type: "video" },
    { id: "media-3", name: "Company Overview.mp4", type: "video" },
    { id: "media-4", name: "Special Offer.jpg", type: "image" },
    { id: "media-5", name: "Weather Widget.png", type: "image" },
    { id: "media-6", name: "Social Media Feed.mp4", type: "video" },
    { id: "media-7", name: "Event Announcement.jpg", type: "image" },
    { id: "media-8", name: "Lunch Menu.jpg", type: "image" },
  ];
  const screens = [
    { id: "screen-1", name: "Main Lobby Display", playlists: ["pl-1", "pl-5"] },
    { id: "screen-2", name: "Second Floor Lobby", playlists: ["pl-4", "pl-5"] },
    { id: "screen-3", name: "Board Room", playlists: ["pl-2"] },
    { id: "screen-4", name: "Warehouse Display", playlists: ["pl-1"] },
    { id: "screen-5", name: "Cafeteria Menu Board", playlists: ["pl-3"] },
  ];

  // Assign media items to playlists
  const playlistMedia: Record<string, string[]> = {
    "pl-1": ["media-1", "media-2", "media-4", "media-5"],
    "pl-2": ["media-3", "media-6", "media-7"],
    "pl-3": ["media-8", "media-5"],
    "pl-4": ["media-3", "media-6", "media-4"],
    "pl-5": ["media-1", "media-7"],
  };

  let logId = 0;
  const now = Date.now();

  // Generate logs for the last 30 days, with hourly activity patterns
  for (let day = 30; day >= 0; day--) {
    const dayDate = new Date(now - day * 86400000);
    const dayOfWeek = dayDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Each screen has a base play count per day
    for (const screen of screens) {
      // Skip warehouse on weekends
      if (screen.id === "screen-4" && isWeekend) continue;

      // Base plays per hour varies by screen type
      const baseHourlyPlays: { [key: string]: number } = {
        "screen-1": isWeekend ? 2 : 4,   // Lobby - busier on weekdays
        "screen-2": isWeekend ? 1 : 3,
        "screen-3": isWeekend ? 0 : 5,   // Board room - weekdays only
        "screen-4": isWeekend ? 0 : 2,   // Warehouse - weekdays
        "screen-5": isWeekend ? 3 : 3,   // Cafeteria - consistent
      };

      // Active hours vary by screen
      const activeHours: { [key: string]: number[] } = {
        "screen-1": [7,8,9,10,11,12,13,14,15,16,17,18,19,20],
        "screen-2": [7,8,9,10,11,12,13,14,15,16,17,18,19,20],
        "screen-3": isWeekend ? [] : [8,9,10,11,13,14,15,16,17],
        "screen-4": isWeekend ? [] : [8,9,10,11,12,13,14,15,16],
        "screen-5": [6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21],
      };

      const hours = activeHours[screen.id] || [];
      for (const hour of hours) {
        const playsPerHour = baseHourlyPlays[screen.id] || 2;
        // Add some randomness
        const actualPlays = Math.max(0, playsPerHour + Math.floor(Math.random() * 4) - 2);

        for (let p = 0; p < actualPlays; p++) {
          // Pick a random media item from the screen's playlists
          const playlistId = screen.playlists[Math.floor(Math.random() * screen.playlists.length)];
          const mediaIds = playlistMedia[playlistId] || [];
          if (mediaIds.length === 0) continue;

          const mediaId = mediaIds[Math.floor(Math.random() * mediaIds.length)];
          const media = mediaItems.find((m) => m.id === mediaId);
          if (!media) continue;

          const startMinute = Math.floor(Math.random() * 60);
          const startedAt = new Date(dayDate);
          startedAt.setHours(hour, startMinute, Math.floor(Math.random() * 60));

          const durationVariation = media.type === "video"
            ? 15000 + Math.floor(Math.random() * 45000)  // 15-60s for video
            : 5000 + Math.floor(Math.random() * 10000);  // 5-15s for image

          const endedAt = new Date(startedAt.getTime() + durationVariation);

          logId++;
          logs.push({
            id: `log-auto-${logId}`,
            screen_id: screen.id,
            media_item_id: mediaId,
            playlist_id: playlistId,
            started_at: startedAt.toISOString(),
            ended_at: endedAt.toISOString(),
            duration_ms: durationVariation,
            screens: { name: screen.name },
            media_items: { name: media.name, type: media.type },
          });
        }
      }
    }
  }

  return logs;
}

const autoLogs = generatePlayLogs();

export let mockData = {
  orgs: [
    { id: "org-1", name: "My Company", slug: "my-company", plan: "free", timezone: "UTC", logo_path: null, created_at: "2025-01-01T00:00:00Z" },
  ],
  org_members: [
    { org_id: "org-1", user_id: "user-1", role: "admin", joined_at: "2025-01-01T00:00:00Z", orgs: { id: "org-1", name: "My Company", slug: "my-company", plan: "free", timezone: "UTC", logo_path: null, created_at: "2025-01-01T00:00:00Z" } },
    { org_id: "org-1", user_id: "user-2", role: "editor", joined_at: "2025-01-02T00:00:00Z", orgs: { id: "org-1", name: "My Company", slug: "my-company", plan: "free", timezone: "UTC", logo_path: null, created_at: "2025-01-01T00:00:00Z" } },
  ],
  screen_groups: [
    { id: "group-1", org_id: "org-1", name: "Lobby", created_at: "2025-01-01T00:00:00Z" },
    { id: "group-2", org_id: "org-1", name: "Conference Rooms", created_at: "2025-01-01T00:00:00Z" },
    { id: "group-3", org_id: "org-1", name: "Cafeteria", created_at: "2025-01-01T00:00:00Z" },
  ],
  screens: [
    { id: "screen-1", org_id: "org-1", group_id: "group-1", anon_user_id: null, name: "Main Lobby Display", pairing_code: null, pairing_expires_at: null, paired_at: "2025-01-15T08:00:00Z", last_seen: new Date(Date.now() - 60000).toISOString(), is_online: true, resolution: "1920x1080", tags: ["lobby", "main"], created_at: "2025-01-10T00:00:00Z", screen_groups: { name: "Lobby" } },
    { id: "screen-2", org_id: "org-1", group_id: "group-1", anon_user_id: null, name: "Second Floor Lobby", pairing_code: null, pairing_expires_at: null, paired_at: "2025-01-20T10:00:00Z", last_seen: new Date(Date.now() - 120000).toISOString(), is_online: true, resolution: "3840x2160", tags: ["lobby", "4k"], created_at: "2025-01-18T00:00:00Z", screen_groups: { name: "Lobby" } },
    { id: "screen-3", org_id: "org-1", group_id: "group-2", anon_user_id: null, name: "Board Room", pairing_code: null, pairing_expires_at: null, paired_at: "2025-02-01T09:00:00Z", last_seen: new Date(Date.now() - 3600000).toISOString(), is_online: true, resolution: "1920x1080", tags: ["conference"], created_at: "2025-01-25T00:00:00Z", screen_groups: { name: "Conference Rooms" } },
    { id: "screen-4", org_id: "org-1", group_id: null, anon_user_id: null, name: "Warehouse Display", pairing_code: null, pairing_expires_at: null, paired_at: "2025-02-10T14:00:00Z", last_seen: new Date(Date.now() - 86400000).toISOString(), is_online: false, resolution: "1920x1080", tags: ["warehouse"], created_at: "2025-02-05T00:00:00Z", screen_groups: null },
    { id: "screen-5", org_id: "org-1", group_id: "group-3", anon_user_id: null, name: "Cafeteria Menu Board", pairing_code: null, pairing_expires_at: null, paired_at: "2025-02-15T11:00:00Z", last_seen: new Date(Date.now() - 1800000).toISOString(), is_online: true, resolution: "1920x1080", tags: ["cafeteria", "menu"], created_at: "2025-02-12T00:00:00Z", screen_groups: { name: "Cafeteria" } },
  ],
  media_items: [
    { id: "media-1", org_id: "org-1", name: "Welcome Banner.jpg", type: "image", storage_path: "org-1/welcome.jpg", thumbnail_path: null, duration_ms: 5000, size_bytes: 245000, folder: "Marketing", tags: ["welcome", "brand"], orientation: "landscape", source_type: "upload", external_url: null, created_at: "2025-01-05T00:00:00Z" },
    { id: "media-2", org_id: "org-1", name: "Product Launch.mp4", type: "video", storage_path: "org-1/launch.mp4", thumbnail_path: null, duration_ms: 30000, size_bytes: 15000000, folder: "Marketing", tags: ["product"], orientation: "landscape", source_type: "upload", external_url: null, created_at: "2025-01-10T00:00:00Z" },
    { id: "media-3", org_id: "org-1", name: "Company Overview.mp4", type: "video", storage_path: "org-1/overview.mp4", thumbnail_path: null, duration_ms: 60000, size_bytes: 25000000, folder: "Corporate", tags: ["about"], orientation: "landscape", source_type: "upload", external_url: null, created_at: "2025-01-15T00:00:00Z" },
    { id: "media-4", org_id: "org-1", name: "Special Offer.jpg", type: "image", storage_path: "org-1/offer.jpg", thumbnail_path: null, duration_ms: 8000, size_bytes: 180000, folder: "Marketing", tags: ["promo"], orientation: "portrait", source_type: "upload", external_url: null, created_at: "2025-02-01T00:00:00Z" },
    { id: "media-5", org_id: "org-1", name: "Weather Widget.png", type: "image", storage_path: "org-1/weather.png", thumbnail_path: null, duration_ms: 10000, size_bytes: 95000, folder: "Widgets", tags: ["utility"], orientation: "landscape", source_type: "upload", external_url: null, created_at: "2025-02-05T00:00:00Z" },
    { id: "media-6", org_id: "org-1", name: "Social Media Feed.mp4", type: "video", storage_path: "org-1/social.mp4", thumbnail_path: null, duration_ms: 45000, size_bytes: 18000000, folder: "Widgets", tags: ["social"], orientation: "portrait", source_type: "upload", external_url: null, created_at: "2025-02-10T00:00:00Z" },
    { id: "media-7", org_id: "org-1", name: "Event Announcement.jpg", type: "image", storage_path: "org-1/event.jpg", thumbnail_path: null, duration_ms: 7000, size_bytes: 210000, folder: "Corporate", tags: ["event"], orientation: "landscape", source_type: "upload", external_url: null, created_at: "2025-02-15T00:00:00Z" },
    { id: "media-8", org_id: "org-1", name: "Lunch Menu.jpg", type: "image", storage_path: "org-1/menu.jpg", thumbnail_path: null, duration_ms: 15000, size_bytes: 320000, folder: "Cafeteria", tags: ["menu", "food"], orientation: "portrait", source_type: "upload", external_url: null, created_at: "2025-02-20T00:00:00Z" },
    { id: "media-9", org_id: "org-1", name: "Lobby Live Feed", type: "video", storage_path: null, thumbnail_path: null, duration_ms: null, size_bytes: null, folder: "Live", tags: ["lobby", "stream"], orientation: null, source_type: "link", external_url: "https://example.com/lobby-stream.m3u8", created_at: "2025-03-01T00:00:00Z" },
  ],
  playlists: [
    { id: "pl-1", org_id: "org-1", name: "Morning Loop", created_at: "2025-01-10T00:00:00Z", playlist_items: [{ count: 4 }], screens: { screens: [{ name: "Main Lobby Display" }] } },
    { id: "pl-2", org_id: "org-1", name: "Product Showcase", created_at: "2025-01-15T00:00:00Z", playlist_items: [{ count: 3 }], screens: { screens: [{ name: "Board Room" }] } },
    { id: "pl-3", org_id: "org-1", name: "Cafeteria Feed", created_at: "2025-02-01T00:00:00Z", playlist_items: [{ count: 2 }], screens: { screens: [{ name: "Cafeteria Menu Board" }] } },
    { id: "pl-4", org_id: "org-1", name: "Corporate Overview", created_at: "2025-01-20T00:00:00Z", playlist_items: [{ count: 3 }], screens: { screens: [{ name: "Second Floor Lobby" }] } },
    { id: "pl-5", org_id: "org-1", name: "Emergency Alerts", created_at: "2025-01-05T00:00:00Z", playlist_items: [{ count: 1 }], screens: { screens: [{ name: "Main Lobby Display" }, { name: "Second Floor Lobby" }] } },
  ],
  playlist_items: [
    { id: "pli-1", playlist_id: "pl-1", media_item_id: "media-1", position: 0, duration_ms: 5000, repeat_count: 1, created_at: "2025-01-10T00:00:00Z", media_items: { id: "media-1", name: "Welcome Banner.jpg", type: "image", storage_path: "org-1/welcome.jpg", thumbnail_path: null, duration_ms: 5000, size_bytes: 245000, folder: "Marketing", tags: ["welcome"], created_at: "2025-01-05T00:00:00Z" } },
    { id: "pli-2", playlist_id: "pl-1", media_item_id: "media-2", position: 1, duration_ms: 30000, repeat_count: 1, created_at: "2025-01-10T00:00:00Z", media_items: { id: "media-2", name: "Product Launch.mp4", type: "video", storage_path: "org-1/launch.mp4", thumbnail_path: null, duration_ms: 30000, size_bytes: 15000000, folder: "Marketing", tags: ["product"], created_at: "2025-01-10T00:00:00Z" } },
    { id: "pli-3", playlist_id: "pl-1", media_item_id: "media-4", position: 2, duration_ms: 8000, repeat_count: 1, created_at: "2025-01-10T00:00:00Z", media_items: { id: "media-4", name: "Special Offer.jpg", type: "image", storage_path: "org-1/offer.jpg", thumbnail_path: null, duration_ms: 8000, size_bytes: 180000, folder: "Marketing", tags: ["promo"], created_at: "2025-02-01T00:00:00Z" } },
    { id: "pli-4", playlist_id: "pl-1", media_item_id: "media-5", position: 3, duration_ms: 10000, repeat_count: 1, created_at: "2025-01-10T00:00:00Z", media_items: { id: "media-5", name: "Weather Widget.png", type: "image", storage_path: "org-1/weather.png", thumbnail_path: null, duration_ms: 10000, size_bytes: 95000, folder: "Widgets", tags: ["utility"], created_at: "2025-02-05T00:00:00Z" } },
  ],
  templates: [
    { id: "tpl-1", org_id: "org-1", name: "Full Screen", is_preset: true, zones: [{ id: "z1", x: 0, y: 0, w: 100, h: 100 }], created_at: "2025-01-01T00:00:00Z", playlists: null },
    { id: "tpl-2", org_id: "org-1", name: "L-Bar", is_preset: true, zones: [{ id: "z1", x: 0, y: 0, w: 100, h: 80 }, { id: "z2", x: 0, y: 80, w: 100, h: 20 }], created_at: "2025-01-01T00:00:00Z", playlists: null },
    { id: "tpl-3", org_id: "org-1", name: "Split Horizontal", is_preset: true, zones: [{ id: "z1", x: 0, y: 0, w: 50, h: 100 }, { id: "z2", x: 50, y: 0, w: 50, h: 100 }], created_at: "2025-01-01T00:00:00Z", playlists: null },
  ],
  schedules: [
    { id: "sched-1", org_id: "org-1", screen_id: "screen-1", group_id: null, playlist_id: "pl-1", template_id: null, is_default: true, priority: 0, start_at: null, end_at: null, recurrence: null, created_at: "2025-01-10T00:00:00Z", screens: { name: "Main Lobby Display" }, screen_groups: null, playlists: { name: "Morning Loop" }, templates: null },
    { id: "sched-2", org_id: "org-1", screen_id: "screen-3", group_id: null, playlist_id: "pl-2", template_id: null, is_default: true, priority: 0, start_at: null, end_at: null, recurrence: null, created_at: "2025-01-15T00:00:00Z", screens: { name: "Board Room" }, screen_groups: null, playlists: { name: "Product Showcase" }, templates: null },
    { id: "sched-3", org_id: "org-1", screen_id: "screen-5", group_id: null, playlist_id: "pl-3", template_id: null, is_default: true, priority: 0, start_at: null, end_at: null, recurrence: null, created_at: "2025-02-01T00:00:00Z", screens: { name: "Cafeteria Menu Board" }, screen_groups: null, playlists: { name: "Cafeteria Feed" }, templates: null },
  ],
  play_logs: autoLogs,
};

// Helper to deep clone data to avoid mutation
export function cloneData<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}
