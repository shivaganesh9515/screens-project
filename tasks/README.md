# Screens Project — Simple Overview

## What Are We Building?

A system to run ads on screens placed inside **buses and autos**. Think of it like a TV channel — but the TVs are in vehicles moving around the city.

## 3 Types of Users

### 1. Admin (Main Boss)
- Sees EVERYTHING — all screens, all franchises, all ads
- Approves or rejects ads
- Manages users
- Has a map showing ALL screens live

### 2. Franchise (Partner)
- Owns some screens in a region
- Can add ads (but admin must approve)
- Sees ONLY their own screens on the map
- Sees analytics for their screens only

### 3. Advertiser (Client)
- Pays to show their ad on screens
- Can upload their ad creative
- Can ONLY see how THEIR ad performed
- Cannot see other advertisers' data

---

## What Each Person Builds

### harshitha builds:
1. Database (all tables)
2. Screen management (add, pair, track GPS)
3. Ad system (create, approve/reject)
4. Player app (what runs on the actual TV screens)

### srinitha builds:
1. Login system (email + password)
2. Media upload (images, videos, live links)
3. Analytics (charts, reports)

### abhinya builds:
1. Home page with Google Map
2. Playlists (group videos together)
3. Settings (org info, screen saver)

---

## How It Works (Simple Flow)

```
1. Admin adds a screen → gets a pairing code
2. Physical screen enters the code → screen is registered
3. Screen sends its GPS location every 30 seconds
4. Admin sees screen on map (green = on, red = off)
5. Franchise/Advertiser creates an ad → goes to "pending"
6. Admin reviews → approves or rejects
7. Approved ad plays on the assigned screen
8. Advertiser sees how many times their ad played
```

---

## Files

- `harshitha-TASKS.md` — detailed steps for harshitha
- `srinitha-TASKS.md` — detailed steps for srinitha
- `abhinya-TASKS.md` — detailed steps for abhinya
- `COORDINATION.md` — who waits for whom
