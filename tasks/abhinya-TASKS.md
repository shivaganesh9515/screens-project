# abhinya — Your Tasks (Simple Version)

You build the **home page with the map**, **playlists**, and **settings**. Wait for harshitha to finish the database first.

---

## TASK 1: Home Page with Google Map

### What
The main page after login. Shows a map with all screens as colored dots. Left side is map, right side is screen list.

### Files to create

#### `app/(app)/overview/page.tsx`
Main dashboard page. This is what users see after login.

**Layout:**
```
+------------------------------------------+
|  Total Screens: 12  Online: 8  Off: 4   |  ← stats row
+------------------------------------------+
|                    |                      |
|    GOOGLE MAP      |    SCREEN LIST       |
|    (left 60%)      |    (right 40%)       |
|                    |                      |
|   🟢  🟢           |  🟢 Bus 42 - Online  |
|      🔴           |  🔴 Auto 15 - Offline |
|   🟢             |  🟢 Bus 08 - Online  |
|                    |                      |
+------------------------------------------+
```

**Step by step:**
1. Read existing `app/(app)/overview/page.tsx` to understand the layout
2. Fetch all screens: `supabase.from("screens").select("*")`
3. Left side: render Google Map with screen dots
4. Right side: render stats cards + screen list

#### `components/dashboard/screen-map.tsx`
Google Map component.

**First:** Install Google Maps: `npm install @react-google-maps/api`

**What it does:**
1. Shows a map of India (or your city)
2. For each screen with GPS coordinates, puts a colored dot:
   - Green dot = screen is online
   - Red dot = screen is offline
3. Click on dot → shows popup with screen info

**Code:**
```tsx
"use client";
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import { useState } from "react";

export function ScreenMap({ screens }) {
  const [selected, setSelected] = useState(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return <div className="w-full h-full bg-gray-100 flex items-center justify-center">Map loading...</div>;
  }

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap 
        mapContainerStyle={{ width: "100%", height: "100%" }} 
        center={{ lat: 20.5937, lng: 78.9629 }} 
        zoom={5}
      >
        {screens.map((screen) => (
          screen.lat && screen.lng && (
            <Marker
              key={screen.id}
              position={{ lat: screen.lat, lng: screen.lng }}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: screen.is_online ? "#22C55E" : "#EF4444",
                fillOpacity: 1,
                strokeColor: "#fff",
                strokeWeight: 2,
              }}
              onClick={() => setSelected(screen)}
            />
          )
        ))}
        {selected && (
          <InfoWindow position={{ lat: selected.lat, lng: selected.lng }} onCloseClick={() => setSelected(null)}>
            <div>
              <h3 className="font-bold">{selected.name}</h3>
              <p>{selected.unique_id}</p>
              <p>{selected.vehicle_number || "No vehicle number"}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
}
```

**If no API key yet:** Show a gray placeholder box with "Map — API key needed" text.

#### `components/dashboard/stats-row.tsx`
Four stat cards at the top.

**Cards:**
1. Total Screens (blue icon)
2. Online (green icon)
3. Offline (red icon)
4. Active Ads (purple icon)

**Code:**
```tsx
import { Monitor, Wifi, WifiOff, Megaphone } from "lucide-react";

export function StatsRow({ total, online, offline, activeAds }) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <Monitor className="w-5 h-5 text-blue-600" />
        <p className="text-2xl font-bold mt-2">{total}</p>
        <p className="text-sm text-gray-500">Total Screens</p>
      </div>
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <Wifi className="w-5 h-5 text-green-600" />
        <p className="text-2xl font-bold mt-2">{online}</p>
        <p className="text-sm text-gray-500">Online</p>
      </div>
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <WifiOff className="w-5 h-5 text-red-600" />
        <p className="text-2xl font-bold mt-2">{offline}</p>
        <p className="text-sm text-gray-500">Offline</p>
      </div>
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <Megaphone className="w-5 h-5 text-purple-600" />
        <p className="text-2xl font-bold mt-2">{activeAds}</p>
        <p className="text-sm text-gray-500">Active Ads</p>
      </div>
    </div>
  );
}
```

#### `components/dashboard/screen-list.tsx`
List of screens on the right side.

**Each screen shows:**
- Green/red dot
- Screen name
- Device type (Bus/Auto)
- Unique ID
- Last seen ("5 min ago")

**Click on a screen → goes to `/screens/[id]`**

#### Update sidebar navigation
Read `app/(app)/layout.tsx`. Make sure the sidebar has these links:
- Home (overview)
- Screens
- Media
- Playlists
- Ads
- Analytics
- Users (admin only)
- Settings

---

## TASK 2: Playlists with Play Count

### What
Group videos into playlists. Set how many times each video plays before moving to the next.

### Files to create

#### `app/(app)/playlists/page.tsx`
Playlist list page.

**What it shows:**
- "Playlists" title + "Create Playlist" button
- Cards for each playlist: name, item count, total duration
- Click card → goes to playlist builder

#### `app/(app)/playlists/[id]/page.tsx`
Playlist builder page. This is the main work.

**Layout:**
```
+------------------------------------------+
|  Playlist: Summer Ads                    |
|  +------------------------------------+  |
|  | ☰ Bus Ad 1      | 10s | play 3x |  |  |
|  | ☰ Auto Ad 2     | 15s | play 1x |  |  |
|  | ☰ Festival Ad   | 20s | play 2x |  |  |
|  +------------------------------------+  |
|  [Add Media]              [Save]         |
+------------------------------------------+
```

**Each row shows:**
- Drag handle (6 dots) — to reorder
- Thumbnail
- Name
- Duration input (seconds)
- **Play Count input** — how many times to play
- Remove button (X)

**Buttons:**
- "Add Media" — opens media picker
- "Save" — saves to database

#### `components/playlists/playlist-builder.tsx`
The main playlist component with drag-and-drop.

**Uses:** `@dnd-kit/core` and `@dnd-kit/sortable` (already installed)

**How drag-and-drop works:**
1. Wrap items in `DndContext` and `SortableContext`
2. Each item uses `useSortable` hook
3. On drag end → reorder items, update position numbers

#### `components/playlists/media-picker.tsx`
Modal to pick videos to add.

**What it shows:**
- Grid of all media items
- Click to select (highlight with blue border)
- "Add Selected" button

#### `components/playlists/playlist-item.tsx`
One item in the playlist.

**Shows:** Drag handle, thumbnail, name, duration input, play count input, remove button

---

## TASK 3: Settings + Screen Saver

### What
Settings page with organization info, screen saver config, and user profile.

### Files to create

#### `app/(app)/settings/page.tsx`
Settings page with tabs.

**Tabs:**
1. Organization — org name, logo, timezone
2. Screen Saver — what shows when no ad is playing
3. Profile — display name, change password

#### `components/settings/org-settings.tsx`
Organization settings form.

**Fields:**
- Organization Name (text input)
- Logo (file upload)
- Timezone (dropdown: UTC, IST, etc.)
- Save button

#### `components/settings/screen-saver-config.tsx`
Screen saver settings.

**What it shows:**
- Toggle: Active / Inactive
- Media picker: select an image for screen saver
- Timeout: how many seconds of idle before screensaver shows (default 300)
- Save button

**How it works:**
1. Fetch current settings from `screen_saver` table
2. Show form with current values
3. On save → update `screen_saver` table

#### `components/settings/profile-settings.tsx`
User profile form.

**Fields:**
- Display Name (text input)
- Email (read-only, grayed out)
- Change Password: new password + confirm
- Save button

---

## Test Checklist

- [ ] Home page shows map (or placeholder) + screen list
- [ ] Stats cards show correct numbers
- [ ] Clicking a screen dot on map shows info popup
- [ ] Can create a playlist
- [ ] Can add media to playlist
- [ ] Can set play count per item
- [ ] Can drag to reorder
- [ ] Can save playlist
- [ ] Settings page shows with tabs
- [ ] Can change org name
- [ ] Can set screen saver image
- [ ] Can update profile

---

## Git Rules

```bash
git checkout abhinya
git add .
git commit -m "what you did"
git push origin abhinya
```

NEVER push to master.
