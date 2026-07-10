// Seed data for local development
// Creates demo accounts and sample data

import { getDb } from "./connection";
import { hashPassword } from "../auth/password";

export async function seedData(): Promise<void> {
  const db = getDb();

  // Check if already seeded
  const existingOrgs = db.prepare("SELECT COUNT(*) as count FROM orgs").get() as { count: number };
  if (existingOrgs.count > 0) {
    console.log("[DB Seed] Data already seeded, skipping");
    return;
  }

  console.log("[DB Seed] Seeding demo data...");

  // === Create Org ===
  const orgId = "org-1";
  db.prepare(`INSERT INTO orgs (id, name, slug, plan, timezone) VALUES (?, ?, ?, ?, ?)`)
    .run(orgId, "My Company", "my-company", "enterprise", "UTC");

  // === Create Demo Users ===
  const adminPassword = await hashPassword("admin123");
  const franchisePassword = await hashPassword("franchise123");
  const advertiserPassword = await hashPassword("advertiser123");

  const adminId = "user-admin";
  const franchiseUserId = "user-franchise";
  const advertiserUserId = "user-advertiser";
  const editorId = "user-editor";

  db.prepare(`INSERT INTO users (id, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)`)
    .run(adminId, "admin@demo.com", adminPassword, "Admin User", "admin");

  db.prepare(`INSERT INTO users (id, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)`)
    .run(franchiseUserId, "franchise@demo.com", franchisePassword, "Franchise Manager", "franchise_manager");

  db.prepare(`INSERT INTO users (id, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)`)
    .run(advertiserUserId, "advertiser@demo.com", advertiserPassword, "Advertiser User", "advertiser");

  db.prepare(`INSERT INTO users (id, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)`)
    .run(editorId, "editor@demo.com", await hashPassword("editor123"), "Editor User", "viewer");

  // === Create Org Memberships ===
  db.prepare(`INSERT INTO org_members (org_id, user_id, role) VALUES (?, ?, ?)`)
    .run(orgId, adminId, "main_admin");
  db.prepare(`INSERT INTO org_members (org_id, user_id, role) VALUES (?, ?, ?)`)
    .run(orgId, franchiseUserId, "franchise_manager");
  db.prepare(`INSERT INTO org_members (org_id, user_id, role) VALUES (?, ?, ?)`)
    .run(orgId, advertiserUserId, "advertiser");
  db.prepare(`INSERT INTO org_members (org_id, user_id, role) VALUES (?, ?, ?)`)
    .run(orgId, editorId, "editor");

  // === Create Screen Groups ===
  db.prepare(`INSERT INTO screen_groups (id, org_id, name) VALUES (?, ?, ?)`)
    .run("group-1", orgId, "Lobby");
  db.prepare(`INSERT INTO screen_groups (id, org_id, name) VALUES (?, ?, ?)`)
    .run("group-2", orgId, "Conference Rooms");
  db.prepare(`INSERT INTO screen_groups (id, org_id, name) VALUES (?, ?, ?)`)
    .run("group-3", orgId, "Cafeteria");

  // === Create Franchises ===
  db.prepare(`INSERT INTO franchises (id, org_id, name, territory_area, manager_user_id) VALUES (?, ?, ?, ?, ?)`)
    .run("franchise-1", orgId, "Downtown District", "Downtown business district", franchiseUserId);
  db.prepare(`INSERT INTO franchises (id, org_id, name, territory_area, manager_user_id) VALUES (?, ?, ?, ?, ?)`)
    .run("franchise-2", orgId, "Westside Region", "West side shopping malls", null);
  db.prepare(`INSERT INTO franchises (id, org_id, name, territory_area, manager_user_id) VALUES (?, ?, ?, ?, ?)`)
    .run("franchise-3", orgId, "Eastside Territory", "East side corporate parks", null);

  // === Create Advertisers ===
  db.prepare(`INSERT INTO advertisers (id, org_id, user_id, company_name) VALUES (?, ?, ?, ?)`)
    .run("adv-1", orgId, advertiserUserId, "PixelPerfect Ads");
  db.prepare(`INSERT INTO advertisers (id, org_id, user_id, company_name) VALUES (?, ?, ?, ?)`)
    .run("adv-2", orgId, null, "BrightMedia Co.");
  db.prepare(`INSERT INTO advertisers (id, org_id, user_id, company_name) VALUES (?, ?, ?, ?)`)
    .run("adv-3", orgId, null, "SignagePro");

  // === Create Screens ===
  const screens = [
    { id: "screen-1", name: "Main Lobby Display", group: "group-1", res: "1920x1080", online: 1, type: "static", lat: 37.7749, lng: -122.4194, orientation: "landscape", unique_number: "SCR-001" },
    { id: "screen-2", name: "Second Floor Lobby", group: "group-1", res: "3840x2160", online: 1, type: "static", lat: 37.7833, lng: -122.4167, orientation: "landscape", unique_number: "SCR-002" },
    { id: "screen-3", name: "Board Room", group: "group-2", res: "1920x1080", online: 1, type: "static", lat: 37.7694, lng: -122.4164, orientation: "landscape", unique_number: "SCR-003" },
    { id: "screen-4", name: "Warehouse Display", group: null, res: "1920x1080", online: 0, type: "static", lat: 37.7710, lng: -122.4300, orientation: "portrait", unique_number: "SCR-004" },
    { id: "screen-5", name: "Cafeteria Menu Board", group: "group-3", res: "1920x1080", online: 1, type: "static", lat: null, lng: null, orientation: "landscape", unique_number: "SCR-005" },
    { id: "screen-6", name: "Bus 101 - Downtown Route", group: null, res: "1920x1080", online: 1, type: "bus", lat: null, lng: null, orientation: "landscape", unique_number: "SCR-006" },
    { id: "screen-7", name: "Auto 201 - City Wide", group: null, res: "1920x1080", online: 0, type: "auto", lat: null, lng: null, orientation: "portrait", unique_number: "SCR-007" },
  ];

  for (const s of screens) {
    db.prepare(`INSERT INTO screens (id, org_id, franchise_id, group_id, name, resolution, is_online, screen_type, lat, lng, orientation, unique_number, last_seen, paired_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?), datetime('now', ?))`)
      .run(s.id, orgId, "franchise-1", s.group, s.name, s.res, s.online, s.type, s.lat, s.lng, s.orientation, s.unique_number, s.online ? "-1 minutes" : "-120 minutes", "-30 days");
  }

  // === Create Media Items ===
  const mediaItems = [
    { id: "media-1", name: "Welcome Banner.jpg", type: "image", folder: "Marketing", tags: '["welcome","brand"]', duration: 5000, size: 245000, orientation: "landscape" },
    { id: "media-2", name: "Product Launch.mp4", type: "video", folder: "Marketing", tags: '["product"]', duration: 30000, size: 15000000, orientation: "landscape" },
    { id: "media-3", name: "Company Overview.mp4", type: "video", folder: "Corporate", tags: '["about"]', duration: 60000, size: 25000000, orientation: "landscape" },
    { id: "media-4", name: "Special Offer.jpg", type: "image", folder: "Marketing", tags: '["promo"]', duration: 8000, size: 180000, orientation: "portrait" },
    { id: "media-5", name: "Weather Widget.png", type: "image", folder: "Widgets", tags: '["utility"]', duration: 10000, size: 95000, orientation: "landscape" },
    { id: "media-6", name: "Social Media Feed.mp4", type: "video", folder: "Widgets", tags: '["social"]', duration: 45000, size: 18000000, orientation: "portrait" },
    { id: "media-7", name: "Event Announcement.jpg", type: "image", folder: "Corporate", tags: '["event"]', duration: 7000, size: 210000, orientation: "landscape" },
    { id: "media-8", name: "Lunch Menu.jpg", type: "image", folder: "Cafeteria", tags: '["menu","food"]', duration: 15000, size: 320000, orientation: "portrait" },
  ];

  for (const m of mediaItems) {
    db.prepare(`INSERT INTO media_items (id, org_id, name, type, storage_path, duration_ms, size_bytes, folder, tags, orientation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(m.id, orgId, m.name, m.type, `org-1/${m.name.toLowerCase().replace(/\s+/g, "-")}`, m.duration, m.size, m.folder, m.tags, m.orientation);
  }

  // === Create Playlists ===
  db.prepare(`INSERT INTO playlists (id, org_id, name) VALUES (?, ?, ?)`).run("pl-1", orgId, "Morning Loop");
  db.prepare(`INSERT INTO playlists (id, org_id, name) VALUES (?, ?, ?)`).run("pl-2", orgId, "Product Showcase");
  db.prepare(`INSERT INTO playlists (id, org_id, name) VALUES (?, ?, ?)`).run("pl-3", orgId, "Cafeteria Feed");
  db.prepare(`INSERT INTO playlists (id, org_id, name) VALUES (?, ?, ?)`).run("pl-4", orgId, "Corporate Overview");
  db.prepare(`INSERT INTO playlists (id, org_id, name) VALUES (?, ?, ?)`).run("pl-5", orgId, "Emergency Alerts");

  // === Create Playlist Items ===
  const plItems = [
    { id: "pli-1", pl: "pl-1", media: "media-1", pos: 0, dur: 5000 },
    { id: "pli-2", pl: "pl-1", media: "media-2", pos: 1, dur: 30000 },
    { id: "pli-3", pl: "pl-1", media: "media-4", pos: 2, dur: 8000 },
    { id: "pli-4", pl: "pl-1", media: "media-5", pos: 3, dur: 10000 },
    { id: "pli-5", pl: "pl-2", media: "media-3", pos: 0, dur: 60000 },
    { id: "pli-6", pl: "pl-2", media: "media-6", pos: 1, dur: 45000 },
    { id: "pli-7", pl: "pl-2", media: "media-7", pos: 2, dur: 7000 },
    { id: "pli-8", pl: "pl-3", media: "media-8", pos: 0, dur: 15000 },
    { id: "pli-9", pl: "pl-3", media: "media-5", pos: 1, dur: 10000 },
    { id: "pli-10", pl: "pl-4", media: "media-3", pos: 0, dur: 60000 },
    { id: "pli-11", pl: "pl-4", media: "media-6", pos: 1, dur: 45000 },
    { id: "pli-12", pl: "pl-4", media: "media-4", pos: 2, dur: 8000 },
    { id: "pli-13", pl: "pl-5", media: "media-1", pos: 0, dur: 5000 },
    { id: "pli-14", pl: "pl-5", media: "media-7", pos: 1, dur: 7000 },
  ];

  for (const pi of plItems) {
    db.prepare(`INSERT INTO playlist_items (id, playlist_id, media_item_id, position, duration_ms) VALUES (?, ?, ?, ?, ?)`)
      .run(pi.id, pi.pl, pi.media, pi.pos, pi.dur);
  }

  // === Create Templates ===
  db.prepare(`INSERT INTO templates (id, org_id, name, is_preset, zones) VALUES (?, ?, ?, ?, ?)`)
    .run("tpl-1", orgId, "Full Screen", 1, JSON.stringify([{ id: "z1", x: 0, y: 0, w: 100, h: 100 }]));
  db.prepare(`INSERT INTO templates (id, org_id, name, is_preset, zones) VALUES (?, ?, ?, ?, ?)`)
    .run("tpl-2", orgId, "L-Bar", 1, JSON.stringify([{ id: "z1", x: 0, y: 0, w: 100, h: 80 }, { id: "z2", x: 0, y: 80, w: 100, h: 20 }]));
  db.prepare(`INSERT INTO templates (id, org_id, name, is_preset, zones) VALUES (?, ?, ?, ?, ?)`)
    .run("tpl-3", orgId, "Split Horizontal", 1, JSON.stringify([{ id: "z1", x: 0, y: 0, w: 50, h: 100 }, { id: "z2", x: 50, y: 0, w: 50, h: 100 }]));

  // === Create Schedules ===
  db.prepare(`INSERT INTO schedules (id, org_id, screen_id, playlist_id, is_default, priority) VALUES (?, ?, ?, ?, ?, ?)`)
    .run("sched-1", orgId, "screen-1", "pl-1", 1, 0);
  db.prepare(`INSERT INTO schedules (id, org_id, screen_id, playlist_id, is_default, priority) VALUES (?, ?, ?, ?, ?, ?)`)
    .run("sched-2", orgId, "screen-3", "pl-2", 1, 0);
  db.prepare(`INSERT INTO schedules (id, org_id, screen_id, playlist_id, is_default, priority) VALUES (?, ?, ?, ?, ?, ?)`)
    .run("sched-3", orgId, "screen-5", "pl-3", 1, 0);
  db.prepare(`INSERT INTO schedules (id, org_id, screen_id, playlist_id, is_default, priority) VALUES (?, ?, ?, ?, ?, ?)`)
    .run("sched-4", orgId, "screen-2", "pl-4", 1, 0);

  // === Create Ads (with screen_type + orientation) ===
  db.prepare(`INSERT INTO ads (id, advertiser_id, org_id, name, media_item_id, screen_type, orientation, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .run("ad-1", "adv-1", orgId, "Summer Sale Banner", "media-1", "static", "landscape", "approved");
  db.prepare(`INSERT INTO ads (id, advertiser_id, org_id, name, media_item_id, screen_type, orientation, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .run("ad-2", "adv-1", orgId, "Product Launch Video", "media-2", "static", "landscape", "approved");
  db.prepare(`INSERT INTO ads (id, advertiser_id, org_id, name, media_item_id, screen_type, orientation, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .run("ad-3", "adv-1", orgId, "Holiday Promo", "media-4", "bus", "portrait", "pending");
  db.prepare(`INSERT INTO ads (id, advertiser_id, org_id, name, media_item_id, screen_type, orientation, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .run("ad-4", "adv-2", orgId, "New Menu Items", "media-8", "static", "portrait", "approved");
  db.prepare(`INSERT INTO ads (id, advertiser_id, org_id, name, media_item_id, screen_type, orientation, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .run("ad-5", "adv-3", orgId, "Brand Awareness", "media-3", "auto", "landscape", "rejected");

  // === Create Ad Franchise Targets ===
  const targets = [
    ["ad-1", "franchise-1", "approved"],
    ["ad-1", "franchise-2", "approved"],
    ["ad-1", "franchise-3", "pending"],
    ["ad-2", "franchise-1", "approved"],
    ["ad-2", "franchise-2", "pending"],
    ["ad-3", "franchise-1", "pending"],
    ["ad-3", "franchise-2", "pending"],
    ["ad-3", "franchise-3", "pending"],
    ["ad-4", "franchise-1", "approved"],
    ["ad-4", "franchise-2", "approved"],
    ["ad-4", "franchise-3", "rejected"],
    ["ad-5", "franchise-1", "rejected"],
    ["ad-5", "franchise-2", "rejected"],
  ];

  for (const [adId, fId, status] of targets) {
    db.prepare(`INSERT INTO ad_franchise_targets (ad_id, franchise_id, status) VALUES (?, ?, ?)`)
      .run(adId, fId, status);
  }

  // === Create Play Logs (last 30 days of generated data) ===
  console.log("[DB Seed] Generating play logs for last 30 days...");

  const mediaLookup: Record<string, any> = {};
  for (const m of mediaItems) mediaLookup[m.id] = m;

  const screenPlaylists: Record<string, string[]> = {
    "screen-1": ["pl-1", "pl-5"],
    "screen-2": ["pl-4", "pl-5"],
    "screen-3": ["pl-2"],
    "screen-4": ["pl-1"],
    "screen-5": ["pl-3"],
  };

  const playlistMedia: Record<string, string[]> = {
    "pl-1": ["media-1", "media-2", "media-4", "media-5"],
    "pl-2": ["media-3", "media-6", "media-7"],
    "pl-3": ["media-8", "media-5"],
    "pl-4": ["media-3", "media-6", "media-4"],
    "pl-5": ["media-1", "media-7"],
  };

  const approvedAdMedia: Record<string, string> = {
    "media-1": "ad-1",
    "media-2": "ad-2",
    "media-8": "ad-4",
  };

  const activeHours: Record<string, number[]> = {
    "screen-1": [7,8,9,10,11,12,13,14,15,16,17,18,19,20],
    "screen-2": [7,8,9,10,11,12,13,14,15,16,17,18,19,20],
    "screen-3": [8,9,10,11,13,14,15,16,17],
    "screen-4": [8,9,10,11,12,13,14,15,16],
    "screen-5": [6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21],
  };

  const baseHourlyPlays: Record<string, number> = {
    "screen-1": 4,
    "screen-2": 3,
    "screen-3": 5,
    "screen-4": 2,
    "screen-5": 3,
  };

  const weekEndHourlyPlays: Record<string, number> = {
    "screen-1": 2,
    "screen-2": 1,
    "screen-3": 0,
    "screen-4": 0,
    "screen-5": 3,
  };

  const now = Date.now();
  let logCount = 0;

  const insertLog = db.prepare(
    `INSERT INTO play_logs (screen_id, media_item_id, playlist_id, ad_id, started_at, ended_at, duration_ms) VALUES (?, ?, ?, ?, ?, ?, ?)`
  );

  for (let day = 30; day >= 0; day--) {
    const dayDate = new Date(now - day * 86400000);
    const dayOfWeek = dayDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    for (const screen of ["screen-1", "screen-2", "screen-3", "screen-4", "screen-5"]) {
      if (screen === "screen-4" && isWeekend) continue;
      if (screen === "screen-3" && isWeekend) continue;

      const hours = activeHours[screen] || [];
      const hourlyPlays = isWeekend ? (weekEndHourlyPlays[screen] || 0) : (baseHourlyPlays[screen] || 2);

      for (const hour of hours) {
        const actualPlays = Math.max(0, hourlyPlays + Math.floor(Math.random() * 4) - 2);

        for (let p = 0; p < actualPlays; p++) {
          const plIds = screenPlaylists[screen] || [];
          const playlistId = plIds[Math.floor(Math.random() * plIds.length)];
          const mediaIds = playlistMedia[playlistId] || [];
          if (mediaIds.length === 0) continue;

          const mediaId = mediaIds[Math.floor(Math.random() * mediaIds.length)];
          const media = mediaLookup[mediaId];
          if (!media) continue;

          const startMinute = Math.floor(Math.random() * 60);
          const startedAt = new Date(dayDate);
          startedAt.setHours(hour, startMinute, Math.floor(Math.random() * 60));

          const durationMs = media.type === "video"
            ? 15000 + Math.floor(Math.random() * 45000)
            : 5000 + Math.floor(Math.random() * 10000);

          const endedAt = new Date(startedAt.getTime() + durationMs);
          const adId = approvedAdMedia[mediaId] || null;

          try {
            insertLog.run(screen, mediaId, playlistId, adId, startedAt.toISOString(), endedAt.toISOString(), durationMs);
            logCount++;
          } catch (err) {
            // Skip duplicate or invalid logs
          }
        }
      }
    }
  }

  console.log(`[DB Seed] Generated ${logCount} play logs`);

  console.log("[DB Seed] Demo data seeded successfully");
  console.log("[DB Seed] ---");
  console.log("[DB Seed] Admin login:      admin@demo.com / admin123");
  console.log("[DB Seed] Franchise login:  franchise@demo.com / franchise123");
  console.log("[DB Seed] Advertiser login: advertiser@demo.com / advertiser123");
}
