---
phase: 03-primitives
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - components/ui/trend-pill.tsx
  - components/ui/status-pill.tsx
  - components/ui/progress-bar.tsx
  - components/ui/section-card.tsx
  - components/ui/capsule-input.tsx
  - components/ui/capsule-select.tsx
  - components/ui/timeframe-toggle.tsx
  - components/ui/stat-card.tsx
  - components/ui/gradient-area-chart.tsx
  - app/globals.css
autonomous: true
requirements: []

must_haves:
  truths:
    - "TrendPill renders emerald/coral rounded chip with directional arrow for up/down/neutral trends"
    - "StatusPill renders Online (emerald), Offline (coral), Playing (emerald), Scheduled (blue) variants with dot indicator"
    - "SectionCard renders a white card with 14px radius, soft shadow, p-6 padding, and optional header (title+subtitle+action)"
    - "CapsuleInput renders as rounded-full or rounded-lg input field reusing the existing Input base"
    - "CapsuleSelect renders as rounded-full or rounded-lg select trigger reusing the existing Select base"
    - "TimeframeToggle renders a pill-group toggle with 1D/1W/1M/1Y/ALL options, active state fills blue"
    - "ProgressBar renders a labeled linear meter with label on left, value on right, colored fill track"
    - "StatCard renders icon chip (tinted bg circle) + label + bold value + optional TrendPill footer inside a SectionCard"
    - "GradientAreaChart renders a Recharts AreaChart with blue linear gradient fill, tooltip on hover, and cartesian grid"
    - "All components use design tokens (--color-*) not hardcoded colors — dark mode ready"
    - "All interactive components have visible focus-visible rings and aria attributes"
  artifacts:
    - path: components/ui/trend-pill.tsx
      provides: "Reusable trend indicator pill (emerald up / coral down)"
      min_lines: 45
    - path: components/ui/status-pill.tsx
      provides: "Status badge with dot + label for Online/Offline/Playing/Scheduled"
      min_lines: 65
    - path: components/ui/section-card.tsx
      provides: "Vella-style card container with header slots and consistent shadow/radius"
      min_lines: 50
    - path: components/ui/capsule-input.tsx
      provides: "Rounded-full or rounded-lg wrapper around existing Input"
      min_lines: 30
    - path: components/ui/capsule-select.tsx
      provides: "Rounded-full or rounded-lg wrapper around existing SelectTrigger"
      min_lines: 30
    - path: components/ui/timeframe-toggle.tsx
      provides: "Pill-group toggle with timeframe labels and blue active state"
      min_lines: 50
    - path: components/ui/progress-bar.tsx
      provides: "Labeled linear progress bar with colored fill"
      min_lines: 45
    - path: components/ui/stat-card.tsx
      provides: "KPI stat card composing icon chip + label + value + trend pill inside SectionCard"
      min_lines: 65
    - path: components/ui/gradient-area-chart.tsx
      provides: "Recharts AreaChart wrapper with pre-configured blue gradient, tooltip, and grid"
      min_lines: 80
    - path: app/globals.css
      provides: "Updated radius tokens (--radius: 0.875rem) matching Vella spec"
      modifies: true
  key_links:
    - from: "components/ui/stat-card.tsx"
      to: "components/ui/trend-pill.tsx"
      via: "import TrendPill"
      pattern: "import.*TrendPill"
    - from: "components/ui/stat-card.tsx"
      to: "components/ui/section-card.tsx"
      via: "import SectionCard as card wrapper"
      pattern: "import.*SectionCard"
    - from: "components/ui/section-card.tsx"
      to: "components/ui/card.tsx"
      via: "extends or wraps shadcn Card"
      pattern: "from.*@/components/ui/card"
    - from: "components/ui/capsule-input.tsx"
      to: "components/ui/input.tsx"
      via: "wraps Input component"
      pattern: "import.*Input.*from.*@/components/ui/input"
    - from: "components/ui/capsule-select.tsx"
      to: "components/ui/select.tsx"
      via: "wraps SelectTrigger"
      pattern: "import.*SelectTrigger.*from.*@/components/ui/select"
    - from: "components/ui/timeframe-toggle.tsx"
      to: "components/ui/toggle-group.tsx"
      via: "uses ToggleGroup + ToggleGroupItem"
      pattern: "import.*ToggleGroup"
    - from: "components/ui/gradient-area-chart.tsx"
      to: "components/ui/chart.tsx"
      via: "uses ChartContainer + ChartTooltip"
      pattern: "import.*ChartContainer.*from.*@/components/ui/chart"
    - from: "components/ui/gradient-area-chart.tsx"
      to: "recharts"
      via: "imports Area, AreaChart, CartesianGrid, XAxis, YAxis"
      pattern: "import.*from.*recharts"
---

<objective>
Build all 8 reusable UI primitives from Section 5 of UI_REDESIGN_PLAN.md as standalone `components/ui/` files.

**Purpose:** Establish a consistent component vocabulary that all dashboard pages (Overview, Screens, Media, Analytics, etc.) will consume. These primitives encode the Vella-inspired design language (rounded, spacious, soft shadows, blue accent) and must be built once, reused everywhere.

**Output:** 9 new component files in `components/ui/` + updates to `app/globals.css` radius tokens to match the Vella spec.
</objective>

<execution_context>
@C:/Users/gunny/.config/opencode/get-shit-done/workflows/execute-plan.md
@C:/Users/gunny/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/research/STACK.md
@/UI_REDESIGN_PLAN.md

@components/ui/card.tsx
@components/ui/input.tsx
@components/ui/select.tsx
@components/ui/badge.tsx
@components/ui/toggle-group.tsx
@components/ui/toggle.tsx
@components/ui/chart.tsx
@app/globals.css
</context>

<tasks>

<!-- ─────────────────────────── TASK 1 ─────────────────────────── -->

<task type="auto">
<name>Task 1: Build standalone primitives — TrendPill, StatusPill, ProgressBar</name>

<files>
  components/ui/trend-pill.tsx
  components/ui/status-pill.tsx
  components/ui/progress-bar.tsx
  app/globals.css
</files>

<action>
Create three standalone presentational components and update global radius tokens.

**FIRST — Update `app/globals.css` design tokens:**

In the `@theme inline` block, add the missing radius size tokens to match the Vella spec (Section 1 of UI_REDESIGN_PLAN):
- Change `--radius: 0.5rem` → `--radius: 0.875rem` (14px base)
- Add `--radius-sm: 0.625rem` (10px)
- Add `--radius-lg: 1rem` (16px)
- Add `--radius-xl: 1.25rem` (20px) for pill/capsule shapes
- Add `--radius-2xl: 1.5rem` (24px) for full-pill inputs

Also update the color tokens that differ from Vella spec:
- Change `--color-border: #E4E9F2` → `--color-border: #ECEFF4` (softer per Vella)
- Change `--color-input: #E4E9F2` → `--color-input: #ECEFF4`
- Change `--color-success: #22C55E` → `--color-success: #10B981` (emerald per Vella)
- Change `--color-destructive: #EF4444` → `--color-destructive: #F43F5E` (coral per Vella)

**THEN — Build TrendPill (`trend-pill.tsx`):**

A small rounded chip that displays a directional trend indicator.

```
"use client"

import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

type TrendDirection = "up" | "down" | "neutral"

interface TrendPillProps {
  value: string | number        // e.g. "+12.5%"
  direction: TrendDirection
  variant?: "default" | "subtle"  // default has bg tint, subtle is lighter
  size?: "sm" | "default"
  className?: string
}
```

Implementation:
- **Default variant**: `bg-success/10 text-success` for up, `bg-destructive/10 text-destructive` for down, `bg-muted text-muted-foreground` for neutral
- **Subtle variant**: more transparent bg (use `/5` opacity) and reduced text intensity
- **Size sm**: `h-5 text-[11px]` with `size-2.5` icon; **default**: `h-6 text-xs px-1.5` with `size-3` icon
- Shape: `rounded-full` (pill shape), `inline-flex items-center gap-1 font-medium whitespace-nowrap`
- Icon: Lucide `TrendingUp` (rotated 0°), `TrendingDown` (rotated 0°), or `Minus` for neutral
- Do NOT add motion/animation — keep it static (motion is Phase 7)

**THEN — Build StatusPill (`status-pill.tsx`):**

A status badge with colored dot and label.

```
"use client"

import { cn } from "@/lib/utils"

type StatusType = "online" | "offline" | "playing" | "scheduled"

interface StatusPillProps {
  status: StatusType
  label?: string         // optional override — defaults to capitalized status
  size?: "sm" | "default"
  className?: string
}
```

Implementation:
- **Layout**: `inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap`
- **Size sm**: `h-5 text-[11px] px-2` with `size-1.5` dot; **default**: `h-6 text-xs px-2.5` with `size-2` dot
- **Online**: `bg-success/10 text-success` fill + dot
- **Playing**: same as Online (emerald, `bg-success/10 text-success`)
- **Offline**: `bg-destructive/10 text-destructive` fill + dot
- **Scheduled**: `bg-primary-muted text-primary` fill + dot (uses `--color-primary-muted #EEF3FF`)
- The dot is a `<span>` with `rounded-full` + the status color as background
- Default labels: capitalize status string (Online, Offline, Playing, Scheduled)
- Export a helper `statusConfig` object mapping status → { color, label, dotClass } for reuse

**THEN — Build ProgressBar (`progress-bar.tsx`):**

A labeled linear progress meter.

```
"use client"

import { cn } from "@/lib/utils"

interface ProgressBarProps {
  value: number              // 0–100
  label: string              // left-side label, e.g. "Fleet Uptime"
  color?: "blue" | "emerald" | "coral"
  size?: "sm" | "default"
  showValue?: boolean        // show percentage on right, default true
  className?: string
}
```

Implementation:
- **Layout**: `flex flex-col gap-1` — label row on top, track below
- **Label row**: `flex items-center justify-between` — label (left, `text-sm text-muted-foreground`) + value (right, `text-sm font-semibold tabular-nums text-foreground`)
- **Track**: `h-2 rounded-full bg-muted overflow-hidden` (gray track)
- **Fill**: `h-full rounded-full transition-all duration-500` — width set inline to `${value}%`
- **Color variants**:
  - blue: `bg-primary`
  - emerald: `bg-success`
  - coral: `bg-destructive`
- **Size sm**: track `h-1.5`, text `text-xs`
- The fill should use `style={{ width: \`${Math.min(100, Math.max(0, value))}%\` }}` — clamp 0-100

Do NOT import any other custom components. Use only `cn`, `lucide-react` (for TrendPill), and `class-variance-authority` for variants (if beneficial — plain ternary is fine for 3 variants).
</action>

<verify>
```bash
# Check all files exist
Test-Path -LiteralPath "components/ui/trend-pill.tsx"
Test-Path -LiteralPath "components/ui/status-pill.tsx"
Test-Path -LiteralPath "components/ui/progress-bar.tsx"

# Verify globals.css has the right radius tokens
Select-String -Path "app/globals.css" -Pattern "--radius:\s*0\.875rem"
Select-String -Path "app/globals.css" -Pattern "--radius-sm:\s*0\.625rem"
Select-String -Path "app/globals.css" -Pattern "--radius-lg:\s*1rem"
Select-String -Path "app/globals.css" -Pattern "--color-success:\s*#10B981"
Select-String -Path "app/globals.css" -Pattern "--color-destructive:\s*#F43F5E"

# TypeScript compile check
npx tsc --noEmit --pretty 2>&1 | Select-String -Pattern "trend-pill|status-pill|progress-bar" -NotMatch
```
</verify>

<done>
- TrendPill renders emerald up-arrow chip for positive, coral down-arrow for negative, neutral muted for flat — verified by checking default and subtle variants render correctly
- StatusPill renders 4 variants (Online, Offline, Playing in emerald; Offline in coral; Scheduled in blue) with dot + label — verified by checking emerald/coral/blue classes apply
- ProgressBar renders label row + colored track fill clamped 0-100 — verified by checking inline width style
- globals.css has radius tokens: 0.875rem base, 0.625rem sm, 1rem lg, 1.25rem xl, plus updated success/destructive colors
- No TypeScript errors in the three new files
</done>
</task>

<!-- ─────────────────────────── TASK 2 ─────────────────────────── -->

<task type="auto">
<name>Task 2: Build layout + input primitives — SectionCard, CapsuleInput, CapsuleSelect</name>

<files>
  components/ui/section-card.tsx
  components/ui/capsule-input.tsx
  components/ui/capsule-select.tsx
</files>

<action>
Create three wrapper/primitives that extend existing shadcn components with Vella styling.

**SectionCard (`section-card.tsx`):**

A reusable white card container with consistent Vella styling. COMPOSES the existing shadcn Card (does NOT replace it — SectionCard is a convenience wrapper with preset styling).

```
interface SectionCardProps {
  title?: React.ReactNode       // left side heading
  subtitle?: React.ReactNode    // left side sub-text below title
  action?: React.ReactNode      // right side slot (for buttons, toggles, etc.)
  children: React.ReactNode
  className?: string
  size?: "default" | "sm"       // default = p-6, sm = p-4
}
```

Implementation:
- Outer wrapper: `<div data-slot="section-card" className={cn("rounded-[var(--radius)] bg-card p-6 shadow-card", className)}>`
  - Note: use `rounded-[var(--radius)]` (not `rounded-xl`) so it respects the token
  - `shadow-card` uses the existing `--shadow-card` token
- If title or subtitle or action present: render a `<div className="mb-4 flex items-start justify-between gap-4">` header
  - Left column: title (`<h3 className="text-lg font-semibold text-card-foreground">`) + optional subtitle (`<p className="text-sm text-muted-foreground">`)
  - Right column: action slot (`<div className="flex shrink-0 items-center gap-2">`)
- Children rendered below the header
- `size="sm"`: changes padding to `p-4`, title to `text-base`

Do NOT use `<Card>` from shadcn — this is a lighter wrapper that doesn't use CardHeader/CardFooter. Keep it simple: a styled `<div>`.

**CapsuleInput (`capsule-input.tsx`):**

A styled wrapper around the existing shadcn `Input` component with variant-controlled border radius.

```
import { Input } from "@/components/ui/input"

interface CapsuleInputProps
  extends Omit<React.ComponentProps<typeof Input>, "className"> {
  variant?: "pill" | "rounded"    // pill = rounded-full, rounded = rounded-lg (default)
}
```

Implementation:
- Render `<Input className={cn(variant === "pill" ? "rounded-full" : "rounded-lg", className)} {...props} />` inside a forwardRef wrapper
- Default variant is `"rounded"` (matching the `<Input>` default which is `rounded-lg`)
- Pass all props through to Input including `ref` (use `React.forwardRef` for form library compatibility)
- Export both `CapsuleInput` and `CapsuleInputProps`

**CapsuleSelect (`capsule-select.tsx`):**

A styled wrapper that renders the existing shadcn `SelectTrigger` with a variant-controlled border radius.

```
import { SelectTrigger } from "@/components/ui/select"

interface CapsuleSelectTriggerProps
  extends Omit<React.ComponentProps<typeof SelectTrigger>, "className"> {
  variant?: "pill" | "rounded"
}
```

Implementation:
- Create a `CapsuleSelect` component that renders `<SelectTrigger className={cn(variant === "pill" ? "rounded-full" : "rounded-lg", className)} {...props} />`
- Default variant is `"rounded"` (matching `<SelectTrigger>` default)
- Must be a `"use client"` component since SelectTrigger is client-side
- Do NOT re-export the full Select API — just the styled trigger. Consumers use normal `<Select>` / `<CapsuleSelect>` / `<SelectContent>` / etc. pattern:

```tsx
<Select>
  <CapsuleSelect variant="pill" />
  <SelectContent>
    <SelectItem value="...">...</SelectItem>
  </SelectContent>
</Select>
```

For both CapsuleInput and CapsuleSelect: keep the files small, thin wrappers. The heavy logic stays in the base components.
</action>

<verify>
```bash
# Check all files exist
Test-Path -LiteralPath "components/ui/section-card.tsx"
Test-Path -LiteralPath "components/ui/capsule-input.tsx"
Test-Path -LiteralPath "components/ui/capsule-select.tsx"

# Verify exports
Select-String -Path "components/ui/section-card.tsx" -Pattern "export.*SectionCard"
Select-String -Path "components/ui/capsule-input.tsx" -Pattern "export.*CapsuleInput"
Select-String -Path "components/ui/capsule-select.tsx" -Pattern "export.*CapsuleSelect"

# TypeScript compile check
npx tsc --noEmit --pretty 2>&1 | Select-String -Pattern "section-card|capsule" -NotMatch
```
</verify>

<done>
- SectionCard renders as `bg-card p-6 shadow-card rounded-[var(--radius)]` div with optional header (title+subtitle left, action right)
- CapsuleInput wraps Input with `rounded-full` (pill) or `rounded-lg` (rounded) — uses forwardRef
- CapsuleSelect wraps SelectTrigger with `rounded-full` (pill) or `rounded-lg` (rounded)
- No TypeScript errors
- SectionCard uses `--radius`, `--shadow-card`, `--color-card` tokens (not hardcoded)
</done>
</task>

<!-- ─────────────────────────── TASK 3 ─────────────────────────── -->

<task type="auto">
<name>Task 3: Build composite primitives — TimeframeToggle, StatCard, GradientAreaChart</name>

<files>
  components/ui/timeframe-toggle.tsx
  components/ui/stat-card.tsx
  components/ui/gradient-area-chart.tsx
</files>

<action>
Create three composite components that compose lower-level primitives or existing shadcn components.

**TimeframeToggle (`timeframe-toggle.tsx`):**

A pill-group toggle for selecting time windows (used in Overview chart header).

```
"use client"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

type TimeframeValue = "1D" | "1W" | "1M" | "1Y" | "ALL"

interface TimeframeToggleProps {
  value: TimeframeValue
  onValueChange: (value: TimeframeValue) => void
  className?: string
}
```

Implementation:
- Wraps the existing shadcn `<ToggleGroup type="single">` with preset styling
- Items: `1D`, `1W`, `1M`, `1Y`, `ALL`
- Each item uses `<ToggleGroupItem value="..." size="sm" className="rounded-full px-3 text-xs font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">`
- Active state: filled blue (`bg-primary text-primary-foreground`)
- Inactive state: transparent, `text-muted-foreground hover:text-foreground`
- Do NOT add gaps between items (spacing=0) to create a connected pill look, OR use small gap of 2px if connected doesn't look right — let the toggle-group's default spacing handle it
- The component should be small: `h-7` items, `text-xs`

**StatCard (`stat-card.tsx`):**

A KPI stat card composing TrendPill + SectionCard, used for the 4 metric cards on Overview.

```
"use client"

import { cn } from "@/lib/utils"
import { SectionCard } from "@/components/ui/section-card"
import { TrendPill, type TrendPillProps } from "@/components/ui/trend-pill"

interface StatCardProps {
  icon: React.ReactNode            // Lucide icon element (not a component)
  label: string                    // e.g. "Total Screens"
  value: string | number           // big bold number
  trend?: TrendPillProps           // optional trend pill
  variant?: "default" | "hero"    // hero = primary-muted tint for Total Screens
  className?: string
}
```

Implementation:
- Uses `<SectionCard>` as the outer container
- **Icon chip**: top-left, `<div className="mb-2 flex size-9 items-center justify-center rounded-[var(--radius-sm)] [&_svg]:size-4">` with tinted background:
  - hero variant: `bg-primary-muted text-primary`
  - default: `bg-muted text-muted-foreground`
- **Label**: `<p className="text-sm text-muted-foreground">{label}</p>`
- **Value**: `<p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-card-foreground">{value}</p>`
  - For hero variant: add `text-primary` class to value
- **Trend**: if `trend` provided, render `<div className="mt-3"><TrendPill {...trend} /></div>` at the bottom
- Do NOT set a fixed height — let content dictate height (consistent cards come from same grid context)

**GradientAreaChart (`gradient-area-chart.tsx`):**

A Recharts AreaChart wrapper with pre-configured blue gradient fill, tooltip, and grid.

```
"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

interface GradientAreaChartProps {
  data: Array<Record<string, string | number>>
  xKey?: string                    // default: "date"
  yKey?: string                    // default: "value"
  gradientId?: string              // default: "blueGradient"
  height?: number                  // default: 250
  showGrid?: boolean               // default: true
  showTooltip?: boolean            // default: true
  showYAxis?: boolean              // default: false (cleaner for KPI cards)
  color?: string                   // default: "var(--color-primary)" (#4A7CF7)
  className?: string
  children?: React.ReactNode       // optional extra Recharts elements
}
```

Implementation:
- Render a `<div>` wrapper with `w-full h-[var(--height)]` style
- Inside: `<ChartContainer config={chartConfig}>` with `<ResponsiveContainer>` wrapper
- The `<defs>` section contains a `<linearGradient id={gradientId}>`:
  ```tsx
  <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stopColor={color} stopOpacity={0.25} />
    <stop offset="95%" stopColor={color} stopOpacity={0.01} />
  </linearGradient>
  ```
- `<AreaChart data={data} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>`
  - `<defs>` with the gradient
  - if showGrid: `<CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />`
  - if showYAxis: `<YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={...} width={40} />`
  - `<XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickMargin={6} />`
  - if showTooltip: `<ChartTooltip content={<ChartTooltipContent />} />`
  - `<Area type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} fill={`url(#${gradientId})`} />`
  - Render `{children}` for any additional Recharts elements
- Create the ChartConfig:
  ```tsx
  const chartConfig = {
    [yKey]: { label: yKey, color: color },
  } satisfies ChartConfig
  ```
  (Make it reactive to props changes via useMemo or inline)

Use the existing `ChartContainer` from `components/ui/chart.tsx` — do NOT reimplement responsive container logic. Pass `config` and let ChartContainer handle auto-sizing.

Format: The component should be minimal and composable. Consumers pass their own data and can layer additional Recharts elements via `children`.
</action>

<verify>
```bash
# Check all files exist
Test-Path -LiteralPath "components/ui/timeframe-toggle.tsx"
Test-Path -LiteralPath "components/ui/stat-card.tsx"
Test-Path -LiteralPath "components/ui/gradient-area-chart.tsx"

# Verify key exports
Select-String -Path "components/ui/timeframe-toggle.tsx" -Pattern "export.*TimeframeToggle"
Select-String -Path "components/ui/stat-card.tsx" -Pattern "export.*StatCard"
Select-String -Path "components/ui/gradient-area-chart.tsx" -Pattern "export.*GradientAreaChart"

# Verify StatCard imports TrendPill + SectionCard
Select-String -Path "components/ui/stat-card.tsx" -Pattern "from.*trend-pill"
Select-String -Path "components/ui/stat-card.tsx" -Pattern "from.*section-card"

# Verify GradientAreaChart imports Recharts + ChartContainer
Select-String -Path "components/ui/gradient-area-chart.tsx" -Pattern "from.*recharts"
Select-String -Path "components/ui/gradient-area-chart.tsx" -Pattern "from.*@/components/ui/chart"

# TypeScript compile check
npx tsc --noEmit --pretty 2>&1 | Select-String -Pattern "timeframe-toggle|stat-card|gradient-area-chart" -NotMatch
```
</verify>

<done>
- TimeframeToggle renders 5 pill buttons (1D, 1W, 1M, 1Y, ALL) with blue active state using ToggleGroup
- StatCard renders icon chip (tinted bg circle) + label + bold value + optional TrendPill footer inside SectionCard
- GradientAreaChart renders Recharts AreaChart with SVG linearGradient fill, configurable axes, tooltip via ChartTooltip, and cartesian grid — all using existing chart.tsx infrastructure
- No TypeScript errors
- All components use design tokens for colors, not hardcoded values
</done>
</task>

</tasks>

<verification>
### Overall Phase 3 Verification

Run these checks after all tasks complete:

```bash
# 1. All 9 component files exist
$files = @(
  "components/ui/trend-pill.tsx",
  "components/ui/status-pill.tsx",
  "components/ui/progress-bar.tsx",
  "components/ui/section-card.tsx",
  "components/ui/capsule-input.tsx",
  "components/ui/capsule-select.tsx",
  "components/ui/timeframe-toggle.tsx",
  "components/ui/stat-card.tsx",
  "components/ui/gradient-area-chart.tsx"
)
$missing = $files | Where-Object { -not (Test-Path -LiteralPath $_) }
if ($missing) { Write-Error "MISSING: $missing" } else { Write-Output "All 9 component files present" }

# 2. Full TypeScript check
npx tsc --noEmit --pretty

# 3. Quick build check (catches CSS/token issues)
npx next build 2>&1 | Select-String -Pattern "Error|Failed" -NotMatch

# 4. No hardcoded color values in the new components (should use tokens)
Select-String -Path "components/ui/trend-pill.tsx" -Pattern "bg-#|text-#|#10B981|#F43F5E" -NotMatch
Select-String -Path "components/ui/status-pill.tsx" -Pattern "bg-#|text-#|#10B981|#F43F5E" -NotMatch
```

### Visual consistency checklist (manual)
- [ ] TrendPill: emerald bg-tint + up arrow for up, coral bg-tint + down arrow for down
- [ ] StatusPill: Online=emerald, Offline=coral, Playing=emerald, Scheduled=blue — each with dot
- [ ] SectionCard: white bg, ~14px radius, soft shadow, p-6 padding, header with title+subtitle+action
- [ ] CapsuleInput: rounded-full when pill variant, rounded-lg when rounded variant
- [ ] CapsuleSelect: same radius behavior as CapsuleInput
- [ ] TimeframeToggle: pill group with blue filled active state
- [ ] ProgressBar: label left, value right, colored track fill
- [ ] StatCard: icon chip (tinted) + label + bold value + optional trend footer
- [ ] GradientAreaChart: smooth blue gradient fill under the line, tooltip on hover
- [ ] All components render correctly in light mode and have appropriate dark mode styles (via token inheritance)
- [ ] Focus-visible rings visible on interactive elements (TimeframeToggle items, CapsuleInput, CapsuleSelect trigger)
</verification>

<success_criteria>
- All 9 component files exist in `components/ui/` with correct TypeScript interfaces and exports
- `app/globals.css` has updated radius tokens (--radius: 0.875rem) and color tokens (success: #10B981, destructive: #F43F5E)
- `npx tsc --noEmit --pretty` passes with no errors related to new files
- `npx next build` succeeds
- Components use design token variables (--color-*, --shadow-*, --radius*) exclusively — no hardcoded colors
- Interactive components (CapsuleInput, CapsuleSelect, TimeframeToggle) have `focus-visible:ring` styles
- Dark mode works via token inheritance (no `.dark` overrides needed in primitives)
- Export names follow PascalCase convention matching existing shadcn/ui pattern
</success_criteria>

<output>
After completion, create `.planning/phases/phase-3-primitives/SUMMARY.md`
</output>
