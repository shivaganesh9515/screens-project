---
phase: 4-overview
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - components/ui/stat-card.tsx
  - components/ui/trend-pill.tsx
  - components/ui/status-pill.tsx
  - components/ui/section-card.tsx
  - components/ui/progress-bar.tsx
  - components/ui/timeframe-toggle.tsx
  - components/ui/gradient-area-chart.tsx
  - app/(app)/overview/analytics-cards.tsx
  - app/(app)/overview/playback-activity-chart.tsx
  - app/(app)/overview/recent-activity.tsx
  - app/(app)/overview/quick-deploy-widget.tsx
  - app/(app)/overview/smart-insights.tsx
  - app/(app)/overview/operational-metrics.tsx
  - app/(app)/overview/page.tsx
autonomous: true
requirements: [OVERVIEW-01, OVERVIEW-02, OVERVIEW-03]
must_haves:
  truths:
    - "User sees 4 KPI stat cards (Total Screens, Screens Online, Screens Offline, Active Content) with trend pills"
    - "User sees a gradient-filled area chart for Playback Activity with 1D/1W/1M/1Y/ALL timeframe pills"
    - "User can select a playlist and a screen/group target in the Quick Deploy widget"
    - "User sees a Recent Activity list with icon/thumbnail, name, timestamp, and status pill per row"
    - "User sees a Smart Insights panel with 2-3 auto-generated insight text rows"
    - "User sees an Operational Metrics panel with progress bars for Fleet Uptime, Storage Used, Content Freshness"
    - "User sees existing extra charts (Media Distribution, Screen Health, Top Content, etc.) below the fold in a 3-col grid"
    - "All data is live-fetched from Supabase using the same queries — no hardcoded values"
    - "All components use the Vella-inspired design tokens (14px radius, soft shadow, white cards, slate labels)"
  artifacts:
    - path: "components/ui/stat-card.tsx"
      provides: "Reusable KPI card with icon chip + label + value + trend pill slot"
      min_lines: 60
    - path: "components/ui/trend-pill.tsx"
      provides: "Reusable positive/negative trend indicator pill"
      min_lines: 30
    - path: "components/ui/status-pill.tsx"
      provides: "Online/Offline/Playing/Scheduled status pill variants"
      min_lines: 30
    - path: "components/ui/section-card.tsx"
      provides: "Reusable card wrapper with title+subtitle+action slot"
      min_lines: 40
    - path: "components/ui/progress-bar.tsx"
      provides: "Labeled horizontal progress bar with value"
      min_lines: 30
    - path: "components/ui/timeframe-toggle.tsx"
      provides: "Pill group toggle (1D/1W/1M/1Y/ALL)"
      min_lines: 35
    - path: "components/ui/gradient-area-chart.tsx"
      provides: "Recharts AreaChart wrapper with blue gradient fill preset"
      min_lines: 40
    - path: "app/(app)/overview/quick-deploy-widget.tsx"
      provides: "Quick Deploy widget with two selects and Push to Screen CTA"
      min_lines: 70
    - path: "app/(app)/overview/smart-insights.tsx"
      provides: "Auto-generated insight text rows"
      min_lines: 40
    - path: "app/(app)/overview/operational-metrics.tsx"
      provides: "Operational metrics with ProgressBars"
      min_lines: 40
    - path: "app/(app)/overview/page.tsx"
      provides: "Full Overview page with 3-row Vella-inspired layout + below-fold demoted charts"
      min_lines: 120
  key_links:
    - from: "app/(app)/overview/analytics-cards.tsx"
      to: "components/ui/stat-card.tsx"
      via: "import StatCard"
      pattern: "import.*StatCard.*from.*@/components/ui/stat-card"
    - from: "app/(app)/overview/analytics-cards.tsx"
      to: "components/ui/trend-pill.tsx"
      via: "import TrendPill"
      pattern: "import.*TrendPill.*from.*@/components/ui/trend-pill"
    - from: "app/(app)/overview/recent-activity.tsx"
      to: "components/ui/status-pill.tsx"
      via: "import StatusPill"
      pattern: "import.*StatusPill.*from.*@/components/ui/status-pill"
    - from: "app/(app)/overview/playback-activity-chart.tsx"
      to: "components/ui/timeframe-toggle.tsx"
      via: "import TimeframeToggle"
      pattern: "import.*TimeframeToggle.*from.*@/components/ui/timeframe-toggle"
    - from: "app/(app)/overview/playback-activity-chart.tsx"
      to: "components/ui/gradient-area-chart.tsx"
      via: "import GradientAreaChart"
      pattern: "import.*GradientAreaChart.*from.*@/components/ui/gradient-area-chart"
    - from: "app/(app)/overview/operational-metrics.tsx"
      to: "components/ui/progress-bar.tsx"
      via: "import ProgressBar"
      pattern: "import.*ProgressBar.*from.*@/components/ui/progress-bar"
    - from: "app/(app)/overview/recent-activity.tsx"
      to: "components/ui/section-card.tsx"
      via: "import SectionCard"
      pattern: "import.*SectionCard.*from.*@/components/ui/section-card"
    - from: "app/(app)/overview/page.tsx"
      to: "app/(app)/overview/quick-deploy-widget.tsx"
      via: "import QuickDeployWidget"
      pattern: "import.*QuickDeployWidget"
    - from: "app/(app)/overview/page.tsx"
      to: "app/(app)/overview/smart-insights.tsx"
      via: "import SmartInsights"
      pattern: "import.*SmartInsights"
    - from: "app/(app)/overview/page.tsx"
      to: "app/(app)/overview/operational-metrics.tsx"
      via: "import OperationalMetrics"
      pattern: "import.*OperationalMetrics"
---

<objective>
**Full relayout of the Overview dashboard page to match the Vella-inspired design.**

Purpose: This is the showcase page of the redesign — the first thing users see after login. Translating Vella's fintech module layout into signage equivalents creates a premium, spacious, insight-first dashboard.

Output: A completely restyled Overview page with 3 main rows (4 KPI stat cards → 60/40 split chart+widget → 50/50 split activity+insights) plus below-fold demoted existing charts. All new UI primitives (StatCard, TrendPill, etc.) are created as reusable components for the rest of the app.
</objective>

<execution_context>
@C:/Users/gunny/.config/opencode/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/research/STACK.md
@.planning/research/ARCHITECTURE.md
@UI_REDESIGN_PLAN.md
@app/globals.css
@app/(app)/overview/page.tsx
@app/(app)/overview/analytics-cards.tsx
@app/(app)/overview/playback-activity-chart.tsx
@app/(app)/overview/recent-activity.tsx
@app/(app)/overview/media-distribution-chart.tsx
@app/(app)/overview/screen-health-chart.tsx
@app/(app)/overview/top-content.tsx
@app/(app)/overview/recent-media.tsx
@app/(app)/overview/screen-status-list.tsx
@app/(app)/overview/upcoming-schedules.tsx
@app/(app)/overview/quick-actions.tsx
@app/(app)/overview/overview-stats.tsx
@components/ui/card.tsx
@components/ui/badge.tsx
@components/ui/chart.tsx
@components/ui/select.tsx
@components/section-cards.tsx
</context>

<tasks>

<!-- ============================================================ -->
<!-- WAVE 1: UI PRIMITIVES (no dependencies)                      -->
<!-- ============================================================ -->

<task type="auto">
  <name>Task 1: Create StatCard, TrendPill, StatusPill primitives</name>
  <files>
    components/ui/stat-card.tsx
    components/ui/trend-pill.tsx
    components/ui/status-pill.tsx
  </files>
  <action>
    Create three reusable component files under `components/ui/`:

    **1. `trend-pill.tsx`** — Small rounded chip showing positive/negative trend.
    - Props: `value: number` (positive → emerald with TrendingUp, negative → coral/destructive with TrendingDown), optional `suffix?: string` (e.g. "vs yesterday")
    - Use `cn()` for conditional styling. Emerald bg-tint (`bg-emerald-50/80 text-emerald-600`) for positive, coral bg-tint (`bg-destructive/10 text-destructive`) for negative.
    - Re-export `TrendPill` as default.

    **2. `status-pill.tsx`** — Status variant pill for Online/Offline/Playing/Scheduled.
    - Props: `status: "online" | "offline" | "playing" | "scheduled"`
    - Online: emerald bg-tint + text, small green dot before text
    - Offline: coral/destructive bg-tint + text
    - Playing: emerald bg-tint (slightly different shade) + play icon
    - Scheduled: blue bg-tint (`bg-primary/10 text-primary`) + clock icon
    - Use Lucide icons (Wifi, WifiOff, Play, Clock).
    - Re-export `StatusPill` as default. Export a `statusPillVariants` object if useful.

    **3. `stat-card.tsx`** — KPI card matching Vella spec:
    - Props: `icon: LucideIcon`, `iconColor?: string`, `iconBg?: string`, `label: string`, `value: string | number`, `trend?: { value: number; suffix?: string }`, `className?: string`
    - Renders: tiny icon chip (top-left, tinted bg using `iconColor/iconBg`) → label in `text-sm text-muted-foreground` → big bold value in `text-3xl font-bold tabular-nums` → optional TrendPill at bottom
    - Card wrapper: white bg, `rounded-xl` (14px via token), soft shadow (`shadow-card`), `p-6`, hover lift to `shadow-card-hover` with 150ms transition
    - No border on the card itself (prefer shadow per spec)
    - Use `animate-slide-up` with stagger via `style={{ animationDelay }}` if passed as prop
    - Re-export `StatCard` as default.

    **IMPORTANT:** Import `TrendPill` from `./trend-pill` inside `stat-card.tsx`. All three files must use `"use client"` if they use state/effects. StatCard does NOT need `"use client"` since it just renders props — keep it as a server-friendly component if possible. TrendPill and StatusPill also don't need `"use client"`.
  </action>
  <verify>`npm run build` passes with no errors. Check each file exists at `components/ui/`. Verify `StatCard`, `TrendPill`, `StatusPill` can be imported without TS errors.</verify>
  <done>Three primitive files created: StatCard (icon+label+value+trend), TrendPill (emerald/coral chip), StatusPill (online/offline/playing/scheduled variants)</done>
</task>

<task type="auto">
  <name>Task 2: Create SectionCard, ProgressBar, TimeframeToggle primitives</name>
  <files>
    components/ui/section-card.tsx
    components/ui/progress-bar.tsx
    components/ui/timeframe-toggle.tsx
  </files>
  <action>
    Create three more reusable primitives:

    **1. `section-card.tsx`** — Reusable card container for sections.
    - Props: `title?: string`, `subtitle?: string`, `action?: React.ReactNode`, `icon?: LucideIcon`, `iconColor?: string`, `className?: string`, `children: React.ReactNode`
    - Outer: white bg, `rounded-xl`, `shadow-card`, `p-6`, hover shadow transition
    - If `title` is provided: header row with icon (optional) + title (`text-lg font-semibold`) + subtitle (`text-sm text-muted-foreground`) on left, `action` slot right-aligned
    - No border anywhere on the card, no border under header (per Vella spec for chart cards)
    - If no title: just renders children in the padded container
    - Re-export `SectionCard` as default. Server-compatible (no `"use client"`).

    **2. `progress-bar.tsx`** — Labeled horizontal progress bar.
    - Props: `label: string`, `value: number` (0-100), `color?: string` (default `#4A7CF7` blue), `showValue?: boolean` (default true), `size?: "sm" | "default"` (default default)
    - Renders: label left, value right (e.g. "Fleet Uptime" → "99.2%"), then track (h-1.5 or h-2, rounded-full bg-muted) with fill bar (rounded-full, color, width based on value, transition-all duration-500)
    - Re-export `ProgressBar` as default. Server-compatible.

    **3. `timeframe-toggle.tsx`** — Pill group for selecting time ranges.
    - Props: `options: string[]` (default `["1D", "1W", "1M", "1Y", "ALL"]`), `value: string`, `onChange: (value: string) => void`, `className?: string`
    - Must be `"use client"` (interactive).
    - Renders a horizontal pill group with `bg-muted/50` container, `rounded-md`, `p-0.5`, `border border-border/60`
    - Active pill: `bg-primary text-white`, `rounded px-3 py-1 text-xs font-medium`
    - Inactive pill: `text-muted-foreground hover:text-foreground`, same padding
    - Use the existing toggle pattern from `playback-activity-chart.tsx` as reference but make generic.
    - Re-export `TimeframeToggle` as default.
  </action>
  <verify>`npm run build` passes. Check each file exists at `components/ui/`. Verify SectionCard, ProgressBar, TimeframeToggle can be imported.</verify>
  <done>Three primitive files created: SectionCard (white card with title slot), ProgressBar (labeled meter), TimeframeToggle (1D/1W/1M/1Y/ALL pill group)</done>
</task>

<task type="auto">
  <name>Task 3: Create GradientAreaChart wrapper</name>
  <files>components/ui/gradient-area-chart.tsx</files>
  <action>
    Create a Recharts AreaChart wrapper with preset blue gradient fill.

    - Props: `data: Array<Record<string, any>>`, `dataKey: string` (default `"plays"`), `xKey: string` (default `"label"`), `height?: number` (default 250), `gradientId?: string` (auto-generated), `strokeColor?: string` (default `#4A7CF7`), `fillColor?: string` (default `#4A7CF7`), `children?: React.ReactNode` (for additional Recharts elements), `className?: string`, `tooltipContent?: React.ReactNode` (custom tooltip component)
    - Must be `"use client"` (uses Recharts interactive components).
    - Wraps: `ResponsiveContainer` → `AreaChart` with proper margins
    - Includes: `defs` with `linearGradient` (offset 0% stopOpacity 0.15, offset 100% stopOpacity 0)
    - Includes: `CartesianGrid` (strokeDasharray="3 3", stroke="#E4E9F2", vertical={false})
    - Includes: `XAxis` (dataKey=xKey, tick font 11, slate, no line/ticks)
    - Includes: `YAxis` (tick font 11, slate, no line/ticks, left margin adjusted)
    - Includes: `Tooltip` with cursor styling (dashed blue line on hover)
    - Includes: `Area` (type="monotone", stroke=strokeColor, strokeWidth=2, fill gradient, activeDot)
    - Children are rendered inside the AreaChart, after the Area component (for additional `<ReferenceLine>`, `<Brush>`, etc.)
    - Collect `total` and `average` from data and expose via a render prop or simply return them — actually, just keep it simple: render the chart, no stats line. The stats line ("Total: X / Avg/day: Y") stays in the calling component.
    - Disable animation by default for SSR compat via `isAnimationActive={false}` (caller can override via children).

    **Important:** Use `recharts` directly (not the `@/components/ui/chart` wrapper). The shadcn chart wrapper is for the ChartContainer/ChartTooltip pattern which is complex — this GradientAreaChart is a simpler, opinionated preset. Reference the existing `playback-activity-chart.tsx` for the implementation pattern.
  </action>
  <verify>`npm run build` passes. File exists at `components/ui/gradient-area-chart.tsx`. Check that it doesn't introduce any TS errors.</verify>
  <done>GradientAreaChart wrapper created — reusable Recharts AreaChart with blue gradient fill, grid, axes, and tooltip preset</done>
</task>

<!-- ============================================================ -->
<!-- WAVE 2: OVERVIEW COMPONENTS (depend on Wave 1 primitives)    -->
<!-- ============================================================ -->

<task type="auto">
  <name>Task 4: Refactor analytics-cards into 4 KPI StatCards</name>
  <files>
    app/(app)/overview/analytics-cards.tsx
  </files>
  <action>
    Rewrite `app/(app)/overview/analytics-cards.tsx` to use the new StatCard and TrendPill primitives.

    The component receives the same props (totalScreens, onlineScreens, offlineScreens, totalMedia, plus optional trend values). It renders a responsive 4-column grid (`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6`) with four StatCards:

    1. **Total Screens** — icon: Monitor (Lucide), iconColor: #4A7CF7 (blue), label: "Total Screens", value: totalScreens, trend suffix: "this month"
    2. **Screens Online** — icon: Wifi (Lucide), iconColor: #10B981 (emerald), label: "Screens Online", value: onlineScreens, trend suffix: "vs yesterday"  
    3. **Screens Offline** — icon: WifiOff (Lucide), iconColor: #F43F5E (coral), label: "Screens Offline", value: offlineScreens, trend suffix: "vs yesterday" (note: negative trend is good here — fewer offline = better)
    4. **Active Content** — icon: Play (Lucide), iconColor: #10B981 (emerald), label: "Active Content", value: computed from totalMedia or totalImpressions, trend suffix: "vs last week"

    For the trend values:
    - Accept optional `screenTrend?: number`, `onlineTrend?: number`, `offlineTrend?: number`, `contentTrend?: number` props (default to sensible values from existing data if not provided, e.g. +12, +5, -3, +8)
    - Pass each to the respective StatCard's `trend` prop

    Import:
    ```tsx
    import { StatCard } from "@/components/ui/stat-card"
    import { Monitor, Wifi, WifiOff, Play } from "lucide-react"
    ```

    Remove the old hardcoded card markup. Keep the exact same exported function name `AnalyticsCards` and the same props interface.

    Add `"use client"` directive since the component may receive interactive props.

    Add `animate-slide-up` class to the grid with staggered animation-delay per card (use `style={{ animationDelay: `${idx * 80}ms` }}`).
  </action>
  <verify>`npm run build` passes. Open `analytics-cards.tsx` and confirm it imports StatCard from the primitives package. The grid renders 4 StatCards with distinct icons and colors.</verify>
  <done>AnalyticsCards component refactored — uses StatCard + TrendPill primitives, renders 4 KPI cards in responsive grid</done>
</task>

<task type="auto">
  <name>Task 5: Refactor PlaybackActivityChart and create QuickDeployWidget</name>
  <files>
    app/(app)/overview/playback-activity-chart.tsx
    app/(app)/overview/quick-deploy-widget.tsx
  </files>
  <action>
    **Part A — Refactor `playback-activity-chart.tsx`:**

    Rewrite the component to use `GradientAreaChart` and `TimeframeToggle` primitives.

    - Replace the existing Daily/Hourly toggle with `TimeframeToggle` using options `["1D", "1W", "1M", "1Y", "ALL"]`
    - Add data aggregation logic for each timeframe:
      - `1D`: 24 hours (hourly buckets)
      - `1W`: 7 days (daily buckets)
      - `1M`: 30 days (daily buckets)
      - `1Y`: 12 months (monthly buckets)
      - `ALL`: all available data bucketed by month
    - Wrap the chart in a `SectionCard` with title "Playback Activity" and subtitle "Play count over time" (no icon needed, use `action` slot for the TimeframeToggle)
    - Delegate chart rendering to `GradientAreaChart` (import from `@/components/ui/gradient-area-chart`)
    - Keep the summary stats line ("Total: X plays / Avg: Y/day") between header and chart
    - Keep the custom tooltip content

    **Part B — Create `quick-deploy-widget.tsx`:**

    New component — the signage equivalent of Vella's currency exchange card.

    Props: `playlists: Array<{ id: string; name: string }>`, `screens: Array<{ id: string; name: string }>`, `groups: Array<{ id: string; name: string }>` (screen_groups)

    Visual structure:
    - Use `SectionCard` with title "Quick Deploy" and subtitle "Push content to screens"
    - Two stacked blocks separated by a centered arrow chip (`ArrowDownUp` or `ArrowRightDown` Lucide icon in a small tinted circle):
      - **Block A (top):** Label "Content" → `<Select>` (from `@/components/ui/select`) with placeholder "Select playlist..." → populate with playlist options
      - **Block B (bottom):** Label "Target" → `<Select>` with placeholder "Select screen or group..." → combine screens + groups into grouped options (group label "Screens" and "Groups") 
    - Below both blocks: full-width primary blue `<Button className="w-full">` with `ArrowRightToLine` (or `Send`) icon + text "Push to Screen"
    - The CTA button is illustrative (UI only) — no actual push-to-screen API call required for this pass. It should show a sonner toast on click: `toast.success("Content pushed to screen(s)")` or `toast("Deploy not yet implemented")` — use `placeholder` behavior.
    - Must be `"use client"` (interactive selects + button).

    Import pattern for selects:
    ```tsx
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
    ```
  </action>
  <verify>`npm run build` passes. Both files exist. PlaybackActivityChart now shows timeframe pills. QuickDeployWidget renders with two selects and a CTA button.</verify>
  <done>PlaybackActivityChart refactored with GradientAreaChart + TimeframeToggle. QuickDeployWidget created with playlist/screen selects + Push to Screen CTA.</done>
</task>

<task type="auto">
  <name>Task 6: Refactor RecentActivity, create SmartInsights and OperationalMetrics panels</name>
  <files>
    app/(app)/overview/recent-activity.tsx
    app/(app)/overview/smart-insights.tsx
    app/(app)/overview/operational-metrics.tsx
  </files>
  <action>
    **Part A — Refactor `recent-activity.tsx`:**

    Rewrite to use `SectionCard` and `StatusPill`.

    - Wrap in `SectionCard` with title "Recent Activity", subtitle "Latest playback and screen events"
    - Use `StatusPill` for status indicators per row:
      - Items actively playing → "Playing" (emerald)
      - Recent play events → "Played" (emerald variant)
    - Row layout: left icon/thumbnail (use Lucide `Monitor` or `Video`/`Image` in a tinted rounded container) → center: name (truncated, medium weight) + detail line (subtext muted) → right: timestamp (muted, small) + StatusPill
    - Each row: `flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/50 transition-all`
    - Keep the same data processing logic (filter last 24h, sort by timestamp, limit 15)
    - Support empty state with icon + "No recent activity" message

    **Part B — Create `smart-insights.tsx`:**

    Props: `totalScreens: number`, `onlineScreens: number`, `offlineScreens: number`, `totalImpressions: number`, `topContentName?: string`, `topContentPlays?: number`

    Auto-generates 2-3 insight text rows based on the computed data:
    1. Fleet health: e.g., `"Uptime is {uptimePercent}% this week"` — with a `HeartPulse` icon in emerald tint
    2. Offline alert: if offlineScreens > 0, `"{offlineScreens} screen(s) currently offline"` — with a `TriangleAlert` icon in coral tint. If 0, `"All screens online"` — with a `CheckCircle2` icon in emerald.
    3. Top content: if topContentName, `""{topContentName}" played {topContentPlays} times today"` — with a `TrendingUp` icon in blue tint

    Each insight: row with icon in tinted circle container → text in `text-sm text-card-foreground`.
    Wrap in `SectionCard` with title "Smart Insights".

    Must be `"use client"`.

    **Part C — Create `operational-metrics.tsx`:**

    Props: `fleetUptime: number` (percentage, 0-100), `storageUsed: number` (percentage, 0-100), `contentFreshness: number` (percentage, 0-100)

    Renders three `ProgressBar` components:
    - "Fleet Uptime" → value `fleetUptime`%, blue (`#4A7CF7`)
    - "Storage Used" → value `storageUsed`%, blue (`#4A7CF7`)
    - "Content Freshness" → value `contentFreshness`%, emerald (`#10B981`)

    Wrap in `SectionCard` with title "Operational Metrics".
    Space items with `space-y-4`.

    Must be `"use client"`.

    Import `ProgressBar` from `@/components/ui/progress-bar`.
  </action>
  <verify>`npm run build` passes. RecentActivity uses StatusPill + SectionCard. SmartInsights renders 2-3 dynamic text rows. OperationalMetrics shows 3 progress bars.</verify>
  <done>RecentActivity refactored. SmartInsights and OperationalMetrics panels created as new components.</done>
</task>

<!-- ============================================================ -->
<!-- WAVE 3: PAGE ASSEMBLY (depends on all components)            -->
<!-- ============================================================ -->

<task type="auto">
  <name>Task 7: Rewrite page.tsx with new 3-row layout + below-fold demotion</name>
  <files>
    app/(app)/overview/page.tsx
  </files>
  <action>
    Rewrite `app/(app)/overview/page.tsx` to implement the full Vella-inspired layout.

    **Data fetching additions:**
    Add two new parallel queries to the existing `Promise.all`:
    ```tsx
    // Already exists:
    const { count: totalScreens }, // screens count
    const { count: onlineScreens }, // screens where is_online=true
    const { count: totalMedia }, // media_items count
    const { data: screens }, // first 5 screens
    const { data: mediaItems }, // first 5 media
    const { data: schedules }, // first 3 schedules with joins

    // ADD these:
    const { data: playlists }, // from "playlists" select "id, name", eq org_id
    const { data: screenGroups }, // from "screen_groups" select "id, name", eq org_id
    ```

    **Imports:**
    ```tsx
    import { AnalyticsCards } from "./analytics-cards"
    import { PlaybackActivityChart } from "./playback-activity-chart"
    import { RecentActivity } from "./recent-activity"
    import { QuickDeployWidget } from "./quick-deploy-widget"
    import { SmartInsights } from "./smart-insights"
    import { OperationalMetrics } from "./operational-metrics"

    // Below-fold imports (demoted):
    import { MediaDistributionChart } from "./media-distribution-chart"
    import { ScreenHealthChart } from "./screen-health-chart"
    import { TopContent } from "./top-content"
    import { RecentMedia } from "./recent-media"
    import { ScreenStatusList } from "./screen-status-list"
    import { UpcomingSchedules } from "./upcoming-schedules"
    ```

    **Computed values (add to existing):**
    ```tsx
    const activeContent = (schedules ?? []).filter(s => s.playlists?.name).length // active playlists scheduled
    const fleetUptime = totalScreens > 0 ? Math.round((onlineScreens / totalScreens) * 100) : 0
    const storageUsed = 64 // placeholder — computed from media storage if available, else hardcoded demo value
    const contentFreshness = 87 // placeholder — computed from schedule coverage if available
    ```

    **Layout structure:**

    ```tsx
    <div className="space-y-6 animate-fade-in">
      {/* Header — keep existing */}
      <div className="flex items-center justify-between gap-4">
        // existing h2 + subtitle + View Analytics button
      </div>

      {/* ROW 1 — 4 KPI Stat Cards (full width 4-col grid) */}
      <AnalyticsCards
        totalScreens={totalScreens ?? 0}
        onlineScreens={onlineScreens ?? 0}
        offlineScreens={offlineScreens}
        totalMedia={totalMedia ?? 0}
        totalImpressions={totalImpressions}
        screenTrend={12}
        onlineTrend={5}
        offlineTrend={-3}
        contentTrend={8}
      />

      {/* ROW 2 — Split 60/40 */}
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <PlaybackActivityChart playLogs={allPlayLogs ?? []} />
        <QuickDeployWidget
          playlists={playlists ?? []}
          screens={screens ?? []}
          groups={screenGroups ?? []}
        />
      </div>

      {/* ROW 3 — Split 50/50 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivity playLogs={allPlayLogs ?? []} />
        <div className="space-y-6">
          <SmartInsights
            totalScreens={totalScreens ?? 0}
            onlineScreens={onlineScreens ?? 0}
            offlineScreens={offlineScreens}
            totalImpressions={totalImpressions}
            topContentName={/* derive from allPlayLogs or remove this prop */}
            topContentPlays={/* derive from allPlayLogs or remove this prop */}
          />
          <OperationalMetrics
            fleetUptime={fleetUptime}
            storageUsed={storageUsed}
            contentFreshness={contentFreshness}
          />
        </div>
      </div>

      {/* BELOW FOLD — Demoted charts */}
      <div>
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Detailed Analytics</h3>
        <div className="grid gap-6 lg:grid-cols-3">
          <MediaDistributionChart playLogs={allPlayLogs ?? []} />
          <ScreenHealthChart online={onlineScreens ?? 0} offline={offlineScreens} />
          <TopContent playLogs={allPlayLogs ?? []} />
        </div>
        <div className="grid gap-6 lg:grid-cols-3 mt-6">
          <RecentMedia mediaItems={mediaItems ?? []} />
          <ScreenStatusList screens={screens ?? []} />
          <UpcomingSchedules schedules={schedules ?? []} />
        </div>
      </div>
    </div>
    ```

    CRITICAL RULES:
    - Keep **all existing data fetching** — only ADD playlists + screenGroups queries
    - Keep **all existing imports** for below-fold charts — only ADD new imports
    - Keep the same `ScreenRow` interface definition
    - Keep the same auth/org flow (getUser → get org_member → orgId)
    - Keep the same `export default async function OverviewPage()`
    - The `QuickDeployWidget` uses `"use client"` — it's a client component embedded in a server component. This is fine — Next.js handles this via the client boundary pattern.
    - For `SmartInsights`, if deriving `topContentName` from playLogs is complex, simplify: pass fewer props or compute a simple top-content value in page.tsx
    - **Do NOT remove** any existing below-fold component file — they stay on disk.
    - The demoted `QuickActions` component replaces: actually, the QuickActions component is now superseded by the QuickDeployWidget. You can either keep QuickActions as a file (for other pages) or remove its import from page.tsx. Keep the file on disk but remove the import from page.tsx.
  </action>
  <verify>
    `npm run build` passes. Open `page.tsx` and verify:
    - All new imports exist and resolve
    - Row 1 uses AnalyticsCards (4 KPI stat cards)
    - Row 2 uses PlaybackActivityChart + QuickDeployWidget in 60/40 grid
    - Row 3 uses RecentActivity + stacked SmartInsights/OperationalMetrics in 50/50 grid
    - Below-fold uses 3-col grids for demoted charts
  </verify>
  <done>Overview page fully relaid with 3-row Vella-inspired layout + below-fold demoted charts. New data fetching for playlists and screen groups added.</done>
</task>

<task type="auto">
  <name>Task 8: Build verification — type-check, lint, visual review</name>
  <files></files>
  <action>
    Run final verification to ensure everything compiles and works together:

    1. Run `npx tsc --noEmit` (or `npm run build`) to catch any type errors in the component wiring
    2. Fix any import issues, incorrect prop names, or missing exports
    3. Verify that:
       - All 7 new primitive files are importable
       - AnalyticsCards connects to StatCard + TrendPill properly
       - PlaybackActivityChart connects to GradientAreaChart + TimeframeToggle
       - RecentActivity connects to StatusPill + SectionCard
       - QuickDeployWidget renders selects correctly
       - SmartInsights accepts and renders data props
       - OperationalMetrics renders ProgressBar components
       - page.tsx has all imports wired and no dead references

    Fix any errors found. Do NOT modify component files beyond fixing imports/props.

    **Do not start the dev server** — this is a static build check only.
  </action>
  <verify>`npx tsc --noEmit` exits with code 0. `npm run build` succeeds.</verify>
  <done>All files compile cleanly with no TypeScript errors. All primitives and components are properly wired.</done>
</task>

</tasks>

<verification>
## Visual verification guide (post-execution)

After executing all tasks, run `npm run dev` and visually verify:

1. **Row 1** — 4 white StatCards with icon chips (blue Monitor, green Wifi, coral WifiOff, green Play), large numbers, trend pills at bottom. Cards have 14px radius and soft shadow.
2. **Row 2 (left)** — Playback Activity chart with blue gradient fill, timeframe pills (1D active blue), hover tooltip showing date + value.
3. **Row 2 (right)** — Quick Deploy widget with two select fields (Content + Target) and full-width "Push to Screen" blue button.
4. **Row 3 (left)** — Recent Activity list with icon, name, timestamp, and status pills per row.
5. **Row 3 (right)** — Stacked: Smart Insights (2-3 auto text rows) + Operational Metrics (3 progress bars).
6. **Below fold** — Existing charts in a 3-col grid, smaller cards with the same restyled visual treatment.
7. All cards use `rounded-xl` (14px), soft shadow, no harsh borders, consistent with Vella tokens.

## TypeScript verification
```bash
npx tsc --noEmit
```
MUST pass with zero errors. Any type errors must be fixed.
</verification>

<success_criteria>
1. [ ] All 7 UI primitive files created under `components/ui/` (stat-card, trend-pill, status-pill, section-card, progress-bar, timeframe-toggle, gradient-area-chart)
2. [ ] `analytics-cards.tsx` refactored to use StatCard + TrendPill — 4 KPIs rendered
3. [ ] `playback-activity-chart.tsx` refactored with GradientAreaChart + TimeframeToggle
4. [ ] `quick-deploy-widget.tsx` created with selects + Push to Screen CTA
5. [ ] `recent-activity.tsx` refactored with StatusPill + SectionCard
6. [ ] `smart-insights.tsx` created with 2-3 auto insight rows
7. [ ] `operational-metrics.tsx` created with 3 ProgressBars
8. [ ] `page.tsx` rewired with 3-row layout + below-fold demoted charts
9. [ ] `npm run build` passes with zero errors
10. [ ] Vella design tokens applied consistently (rounded-xl, shadow-card, slate labels, white cards)
</success_criteria>

<output>
After completion, create `.planning/phases/phase-4-overview/phase-4-overview-01-SUMMARY.md`
</output>
