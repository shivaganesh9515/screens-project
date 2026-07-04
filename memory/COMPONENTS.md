# Component Details

## Dashboard Components

### analytics-cards.tsx
**Props:** `{ totalScreens, onlineScreens, offlineScreens, activeContent }`
**Purpose:** 4 KPI cards showing screen counts and active content
**Location:** `app/(app)/overview/analytics-cards.tsx`

### playback-activity-chart.tsx
**Props:** `{ playLogs }`
**Purpose:** Line chart showing play activity over time with 1D/1W/1M/1Y/ALL toggle
**Location:** `app/(app)/overview/playback-activity-chart.tsx`
**Uses:** Recharts (AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer)

### quick-deploy-widget.tsx
**Props:** `{ playlists, screens, groups }`
**Purpose:** Push content to screens immediately
**Location:** `app/(app)/overview/quick-deploy-widget.tsx`
**Bug:** `handlePush` just shows toast, never writes to DB

### smart-insights.tsx
**Props:** `{ playLogs, screens, mediaItems }`
**Purpose:** Computed insights (peak hours, avg duration, etc.)
**Location:** `app/(app)/overview/smart-insights.tsx`

### operational-metrics.tsx
**Props:** `{ storageUsed, contentFreshness, fleetUptime }`
**Purpose:** Operational metrics display
**Location:** `app/(app)/overview/operational-metrics.tsx`
**Bug:** `storageUsed` and `contentFreshness` are hardcoded constants

## Screen Components

### screens-table.tsx
**Props:** `{ screens, orgId }`
**Purpose:** Table listing all screens with status, group, last seen
**Location:** `app/(app)/screens/screens-table.tsx`
**Features:** Online status indicator, delete, link to detail

### screen-detail.tsx
**Props:** `{ screen, orgId }`
**Purpose:** Screen detail view with edit capabilities
**Location:** `app/(app)/screens/[id]/screen-detail.tsx`
**Features:** Edit name, assign to group, show pairing code, delete

### add-screen-modal.tsx
**Props:** `{ orgId }`
**Purpose:** Dialog to create a new screen
**Location:** `app/(app)/screens/add-screen-modal.tsx`
**Features:** Name input, creates screen with pairing code

## Media Components

### media-grid.tsx
**Props:** `{ mediaItems, orgId }`
**Purpose:** Grid of media items with filters
**Location:** `app/(app)/media/media-grid.tsx`
**Features:** Type filter, folder filter, delete, preview
**Bug:** No tag filtering

### media-upload.tsx
**Props:** `{ orgId }`
**Purpose:** Upload dialog for images/videos
**Location:** `app/(app)/media/media-upload.tsx`
**Features:** Drag-drop, file selection, progress, thumbnail generation for videos
**Bug:** No folder/tags input, no storage cleanup on delete

## Playlist Components

### playlists-list.tsx
**Props:** `{ playlists, orgId }`
**Purpose:** Grid of playlist cards
**Location:** `app/(app)/playlists/playlists-list.tsx`
**Features:** Create, delete, show item count

### playlist-builder.tsx
**Props:** `{ playlist, mediaItems, orgId }`
**Purpose:** Drag-drop playlist editor
**Location:** `app/(app)/playlists/[id]/playlist-builder.tsx`
**Features:** Add media, reorder with drag-drop, edit duration per item, save
**Uses:** @dnd-kit/core, @dnd-kit/sortable

## Template Components

### templates-list.tsx
**Props:** `{ templates, orgId }`
**Purpose:** List of templates with preset picker
**Location:** `app/(app)/templates/templates-list.tsx`
**Features:** 5 preset layouts, create from preset, create custom, delete
**Bug:** Double JSON encoding (`JSON.stringify(preset.zones)`)

### zone-editor.tsx
**Props:** `{ template, playlists, orgId }`
**Purpose:** Visual zone editor for templates
**Location:** `app/(app)/templates/[id]/zone-editor.tsx`
**Features:** Render zones as positioned boxes, assign playlist to zone, save
**Status:** Just created

## Schedule Components

### schedule-calendar.tsx
**Props:** `{ schedules, screens, playlists, templates, orgId }`
**Purpose:** FullCalendar-based schedule UI
**Location:** `app/(app)/schedule/schedule-calendar.tsx`
**Features:** Calendar view, create schedule rule, delete, list view
**Bug:** `group_id` never inserted when targeting groups

## Analytics Components

### analytics-dashboard.tsx
**Props:** `{ playLogs, mediaItems, screens }`
**Purpose:** Analytics dashboard with charts and CSV export
**Location:** `app/(app)/analytics/analytics-dashboard.tsx`
**Features:** Total impressions, play time, uptime, daily trend, media breakdown, per-screen performance, CSV export
**Bug:** Groups by name instead of id, 2000 row cap

## Settings Components

### settings-form.tsx
**Props:** `{ org, membership, members }`
**Purpose:** Settings tabs (org/team/profile/billing)
**Location:** `app/(app)/settings/settings-form.tsx`
**Features:** Edit org name/timezone, list team members, delete members
**Missing:** Logo upload, invite flow, password change

## Player

### [token]/page.tsx
**Props:** `{ params: { token } }`
**Purpose:** Player app that runs on physical screens
**Location:** `app/player/[token]/page.tsx`
**Features:** Pairing code display, fullscreen, wake lock, cursor hide, heartbeat
**Bug:** Never loads playlists or plays content

## Shared UI Components

### section-card.tsx
**Props:** `{ title, subtitle, children }`
**Purpose:** Card wrapper with title/subtitle
**Location:** `components/ui/section-card.tsx`

### empty-state.tsx
**Props:** `{ icon, title, description }`
**Purpose:** Empty state display
**Location:** `components/ui/empty-state.tsx`
