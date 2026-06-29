---
phase: 2-shell
plan: phase-2
type: execute
wave: 1
depends_on: []
files_modified:
  - app/globals.css
  - components/layout/sidebar.tsx
  - components/layout/header.tsx
  - app/(app)/layout.tsx
autonomous: true
requirements:
  - SHELL-01 � Light sidebar with white bg, proper nav items, logo block, storage meter
  - SHELL-02 � Three-zone header with welcome, capsule search, notification/avatar cluster
  - SHELL-03 � Updated app layout wiring shell components correctly

must_haves:
  truths:
    - "Sidebar has white background with subtle right border, not dark navy"
    - "Sidebar shows a blue geometric mark + screens wordmark at top"
    - "Sidebar nav items match order: Overview . Screens . Media . Playlists . Templates . Schedule . Analytics . Settings"
    - "Active nav item shows soft blue block #EEF3FF background with blue icon and blue text"
    - "Inactive nav items show slate #6B7394 text/icon, hover shows #F0F3FA background"
    - "Sidebar has section labels MENU and SYSTEM in tiny uppercase slate"
    - "Sidebar bottom has a storage-used mini-meter card and a collapse toggle"
    - "Header shows Welcome back, {name} on the left with a subline"
    - "Header has a capsule-shaped search input in the center with magnifier icon"
    - "Header right side shows: quick-add button, notification bell with dot, avatar + name + role pill"
    - "Header is h-16 with white background and bottom border"
    - "App layout properly positions sidebar on left and header at top"
  artifacts:
    - path: "app/globals.css"
      provides: "Light sidebar theme tokens"
      contains: "--color-sidebar: #FFFFFF"
    - path: "components/layout/sidebar.tsx"
      provides: "Light sidebar implementation"
      min_lines: 140
    - path: "components/layout/header.tsx"
      provides: "Three-zone header implementation"
      min_lines: 100
    - path: "app/(app)/layout.tsx"
      provides: "App shell wiring"
      min_lines: 15
  key_links:
    - from: "components/layout/sidebar.tsx"
      to: "next/navigation (usePathname)"
      via: "active route matching for nav highlighting"
    - from: "components/layout/sidebar.tsx"
      to: "lucide-react icons"
      via: "nav item icons (LayoutDashboard, MonitorSmartphone, Image, Play, Layout, Calendar, BarChart3, Settings)"
    - from: "components/layout/header.tsx"
      to: "@/lib/supabase/client"
      via: "fetching user data for welcome message"
    - from: "components/layout/header.tsx"
      to: "next/navigation (useRouter)"
      via: "navigation actions (logout, settings link)"
    - from: "app/(app)/layout.tsx"
      to: "@/components/layout/sidebar"
      via: "Sidebar component import"
    - from: "app/(app)/layout.tsx"
      to: "@/components/layout/header"
      via: "Header component import"
---

<objective>
Redesign the Screens app shell - light sidebar + new top header.

Purpose: Replace the existing dark navy sidebar and basic header with the Vella-inspired light shell. This is the structural framework every page renders inside, so getting it right is foundational for all subsequent phase work.

Output:
- Updated globals.css with light sidebar tokens + Plus Jakarta Sans font
- Rewritten sidebar.tsx - white bg, new nav order, logo block, storage meter, collapse toggle
- Rewritten header.tsx - three-zone: welcome+subline, capsule search, quick-add+notifications+avatar+role
- Updated layout.tsx - clean shell integration
</objective>

<execution_context>
@C:/Users/gunny/.config/opencode/get-shit-done/workflows/execute-plan.md
@C:/Users/gunny/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
The design spec is in UI_REDESIGN_PLAN.md at project root - sections 1 (tokens) and 2 (shell redesign).

Key structural facts:
- app/(app)/layout.tsx imports Sidebar from @/components/layout/sidebar and Header from @/components/layout/header - these import paths stay the same
- sidebar.tsx - current dark custom sidebar (126 lines). Complete rewrite.
- header.tsx - current header with page title, org badge, notifications, user dropdown (123 lines). Rewrite.
- app-sidebar.tsx and nav-*.tsx - OLD shadcn sidebar parts (not used by layout, ignore).
- User data: header fetches user.email and org.name from Supabase. Parse display name from email prefix.
- Routes exist: /overview, /screens, /media, /playlists, /templates, /schedule, /analytics, /settings
</context>

<tasks>

<task type="auto">
  <name>Task 1: Update globals.css sidebar tokens to light theme + add Plus Jakarta Sans</name>
  <files>app/globals.css, app/layout.tsx</files>
  <action>
    A) Update the sidebar-related tokens in the @theme inline block of app/globals.css:

    Current (dark):
    --color-sidebar: #0B1124;
    --color-sidebar-foreground: #8B95B5;
    --color-sidebar-active: #4A7CF7;
    --color-sidebar-active-bg: rgba(74, 124, 247, 0.1);
    --color-sidebar-hover: #141D3A;

    New (light):
    --color-sidebar: #FFFFFF;
    --color-sidebar-foreground: #6B7394;
    --color-sidebar-active: #4A7CF7;
    --color-sidebar-active-bg: #EEF3FF;
    --color-sidebar-hover: #F0F3FA;

    Do NOT change other tokens (primary, muted, card, border, chart, shadow, radius, animation) - those stay as-is from Phase 1.

    Also update the font family:
    --font-sans: "Plus Jakarta Sans", "Inter", ui-sans-serif, system-ui, sans-serif;

    B) Add Plus Jakarta Sans font import in root app/layout.tsx:
    - Import { Plus_Jakarta_Sans } from "next/font/google"
    - Create: const plusJakartaSans = Plus_Jakarta_Sans({ variable: "--font-plus-jakarta-sans", subsets: ["latin"] })
    - Apply to html tag: add {plusJakartaSans.variable} alongside inter.variable
    - Update globals.css --font-sans to use var(--font-plus-jakarta-sans) as primary: \"Plus Jakarta Sans\", var(--font-plus-jakarta-sans), \"Inter\", ui-sans-serif, system-ui, sans-serif

    Why: The design spec requires Plus Jakarta Sans as the primary typeface. Using next/font/google variable with CSS variable approach lets Tailwind use it via font-sans utility class.
  </action>
  <verify>
    grep --color=never &quot;--color-sidebar: #FFFFFF&quot; app/globals.css returns a match.
    grep --color=never &quot;Plus_Jakarta_Sans&quot; app/layout.tsx returns a match.
    grep --color=never &quot;font-plus-jakarta-sans&quot; app/layout.tsx returns a match.
  </verify>
  <done>
    globals.css sidebar tokens are all light-themed (white bg, slate text, soft blue active). Plus Jakarta Sans is loaded via next/font and available as a CSS variable.
  </done>
</task>

<task type="auto">
  <name>Task 2: Rewrite sidebar.tsx - light theme, logo, nav sections, storage meter, collapse toggle</name>
  <files>components/layout/sidebar.tsx</files>
  <action>
    COMPLETELY rewrite components/layout/sidebar.tsx as a &quot;use client&quot; component. Preserve the export name &quot;Sidebar&quot;.

    IMPORTS:
    - Link from next/link
    - usePathname from next/navigation
    - cn from @/lib/utils
    - Lucide icons: LayoutDashboard, MonitorSmartphone, Image, Play, Layout, Calendar, BarChart3, Settings, ChevronLeft, HardDrive, X, Menu
    - useState from react

    NAV DATA:
    menuItems = [
      { href: &quot;/overview&quot;,    label: &quot;Overview&quot;,  icon: LayoutDashboard },
      { href: &quot;/screens&quot;,     label: &quot;Screens&quot;,   icon: MonitorSmartphone },
      { href: &quot;/media&quot;,       label: &quot;Media&quot;,     icon: Image },
      { href: &quot;/playlists&quot;,   label: &quot;Playlists&quot;, icon: Play },
      { href: &quot;/templates&quot;,   label: &quot;Templates&quot;, icon: Layout },
      { href: &quot;/schedule&quot;,    label: &quot;Schedule&quot;,  icon: Calendar },
    ]
    systemItems = [
      { href: &quot;/analytics&quot;,   label: &quot;Analytics&quot;, icon: BarChart3 },
      { href: &quot;/settings&quot;,    label: &quot;Settings&quot;,  icon: Settings },
    ]

    LAYOUT STRUCTURE (desktop):
    <aside className="hidden sm:flex flex-col w-60 border-r border-[#ECEFF4] bg-white">

    LOGO BLOCK (h-16, flex items-center gap-3, border-b border-[#ECEFF4], px-5):
    - Blue geometric mark: div with h-8 w-8 rounded-lg bg-[#4A7CF7], containing a Monitor icon in white (h-5 w-5), or a geometric arrangement of small divs (e.g. two overlapping rounded rectangles to form an abstract mark). Use Monitor icon for simplicity.
    - Wordmark: span className=&quot;text-lg font-bold tracking-tight text-[#0F1A2E]&quot; containing &quot;screens&quot; (lowercase)

    SECTION LABEL HELPER:
    Render a small uppercase label: span className=&quot;px-5 pt-5 pb-1 text-[11px] font-semibold tracking-wider text-[#6B7394]&quot;

    NAV ITEMS (for each item in menuItems and systemItems, separated by their section label):
    - Active detection: pathname === item.href || pathname.startsWith(item.href + &quot;/&quot;)
    - Common: flex items-center gap-3 rounded-[10px] px-3 py-3 text-sm w-full transition-colors duration-150
    - Active: bg-[#EEF3FF] text-[#4A7CF7] font-medium
    - Inactive: text-[#6B7394] hover:bg-[#F0F3FA]
    - Icon: h-4 w-4 shrink-0
    - Use Link component with key=item.href, pass className

    SPACER: div className=&quot;flex-1&quot;

    STORAGE METER CARD (px-5 py-3):
    - White card inside sidebar: div className=&quot;rounded-lg border border-[#ECEFF4] p-3&quot;
    - Top row: HardDrive icon (h-3.5 w-3.5, text-[#6B7394]) + &quot;Storage Used&quot; (text-xs text-[#6B7394])
    - Progress bar track: div className=&quot;mt-2 h-1.5 rounded-full bg-[#EEF3FF]&quot;
    - Progress bar fill: div className=&quot;h-1.5 rounded-full bg-[#4A7CF7]&quot; style={{ width: &quot;48%&quot; }}
    - Label: &quot;2.4 GB / 5 GB&quot; - text-[11px] text-[#6B7394] mt-1

    COLLAPSE TOGGLE (px-5 py-3):
    - button with flex items-center gap-3 w-full text-sm text-[#6B7394] hover:bg-[#F0F3FA] rounded-lg px-3 py-2
    - ChevronLeft icon h-4 w-4 + span &quot;Collapse&quot;
    - Toggle collapsed state on click (just local state, visual only - no width transition needed for this phase)

    MOBILE SIDEBAR:
    - Keep existing pattern: hamburger button (Menu/X icons) fixed top-left z-50 on mobile (sm:hidden)
    - Overlay div onClick closes sidebar
    - Sliding sidebar panel with same nav content, w-64
    - Same nav rendering but with onClick that closes mobile sidebar

    CRITICAL: Maintain same export &quot;export function Sidebar()&quot; so the layout import continues working.
  </action>
  <verify>
    The file compiles without TypeScript errors. grep -n &quot;export function Sidebar&quot; components/layout/sidebar.tsx returns a match. grep -n &quot;#EEF3FF&quot; components/layout/sidebar.tsx shows the active state color is used.
  </verify>
  <done>
    Sidebar renders with white background, correct nav order, MENU/SYSTEM section labels, logo block, storage meter card, and collapse toggle. Active nav items show blue highlight. Inactive items show slate with hover.
  </done>
</task>

<task type="auto">
  <name>Task 3: Rewrite header.tsx - three-zone layout with welcome, capsule search, and notification/avatar cluster</name>
  <files>components/layout/header.tsx</files>
  <action>
    COMPLETELY rewrite components/layout/header.tsx as a &quot;use client&quot; component. Preserve the export name &quot;Header&quot;.

    IMPORTS:
    - usePathname from next/navigation
    - useRouter from next/navigation
    - createClient from @/lib/supabase/client
    - useState, useEffect from react
    - Lucide icons: Bell, Plus, Search, LogOut, Settings
    - DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger from @/components/ui/dropdown-menu
    - Avatar, AvatarFallback from @/components/ui/avatar

    USER DATA FETCHING (inside useEffect):
    - Get user via supabase.auth.getUser()
    - Parse display name from email: user.email.split(&quot;@&quot;)[0] - capitalize first letter
    - Get org name from org_members table (keep existing pattern)
    - Store: name (display name), userEmail (full email), orgName

    LAYOUT:
    <header className="flex h-16 items-center justify-between border-b border-[#ECEFF4] bg-white px-6">

    LEFT ZONE (flex items-center gap-1):
    - h1: &quot;Welcome back, {name}&quot; - text-lg font-semibold text-[#0F1A2E]
    - p: &quot;Here&&apos;s what&apos;s happening across your screens today.&quot; - text-sm text-[#6B7394] hidden md:block

    CENTER ZONE (flex-1 flex justify-center):
    - div className=&quot;relative w-full max-w-md&quot; (hidden on mobile: hidden md:block)
    - Search icon inside: SearchIcon className=&quot;absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7394]&quot;
    - Input: className=&quot;w-full rounded-full bg-[#F0F3FA] border-0 pl-10 pr-4 py-2 text-sm text-[#0F1A2E] placeholder:text-[#6B7394] ring-1 ring-inset ring-[#ECEFF4] focus:ring-2 focus:ring-[#4A7CF7] focus:outline-none&quot;
    - placeholder: &quot;Search screens, media, playlists...&quot;

    RIGHT ZONE (flex items-center gap-2 sm:gap-3):
    - Quick-add button:
      button className=&quot;flex h-9 w-9 items-center justify-center rounded-lg bg-[#4A7CF7] text-white hover:bg-[#3A66D9] transition-colors&quot;
      Plus icon h-4 w-4
      aria-label=&quot;Quick add&quot;

    - Notification bell:
      button className=&quot;relative flex h-9 w-9 items-center justify-center rounded-lg text-[#6B7394] hover:bg-[#F0F3FA] transition-colors&quot;
      Bell icon h-4 w-4
      Red dot: span className=&quot;absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#F43F5E] ring-2 ring-white&quot; (only if notifCount &gt; 0)

    - Divider: div className=&quot;mx-1 h-5 w-px bg-[#ECEFF4]&quot;

    - Avatar + name + role pill (flex items-center gap-2):
      Avatar (h-8 w-8) with initials from email
      div className=&quot;hidden md:block&quot;
        p className=&quot;text-sm font-medium text-[#0F1A2E] leading-tight&quot;: display name
        span className=&quot;text-[11px] text-[#6B7394] bg-[#F0F3FA] rounded-full px-2 py-0.5 leading-tight&quot;: &quot;Admin&quot;

    - Dropdown menu for avatar (on click):
      Keep existing DropdownMenu structure with Settings link and Sign out action
      Trigger wraps the avatar+name+role cluster above

    STATIC NOTIF COUNT:
    - Keep existing const [notifCount] = useState(3) (or 0 - use 0 as default without simulated data)

    MOBILE:
    - On mobile (below md), the center search capsule is hidden
    - The name+role text is hidden (hidden md:block)
    - Only show: quick-add, bell with dot, avatar

    PRESERVE FROM CURRENT HEADER:
    - handleLogout function that signs out via supabase and redirects to /login
    - Dropdown menu items for Settings and Sign out
    - Org name context if available

    REMOVE FROM CURRENT HEADER:
    - pageTitles mapping (no longer needed - we show welcome message instead)
    - The page title h1 that showed &quot;Dashboard&quot; etc.
    - The org badge pill (role pill replaces this pattern)
  </action>
  <verify>
    The file compiles without TypeScript errors. grep -n &quot;export function Header&quot; components/layout/header.tsx returns match. grep -n &quot;Welcome back&quot; components/layout/header.tsx returns match. grep -n &quot;rounded-full&quot; components/layout/header.tsx shows the capsule search input.
  </verify>
  <done>
    Header renders with three zones: welcome message + subline (left), capsule search (center), quick-add + bell + avatar+name+role (right). Mobile hides search and text labels. Desktop shows all elements.
  </done>
</task>

<task type="auto">
  <name>Task 4: Update layout.tsx - clean shell integration with correct spacing</name>
  <files>app/(app)/layout.tsx</files>
  <action>
    Update app/(app)/layout.tsx to ensure the header and sidebar integrate cleanly with the new light design.

    Current structure (keep, just refine):
    - Import Sidebar from @/components/layout/sidebar
    - Import Header from @/components/layout/header
    - Import Toaster from sonner

    The div structure stays:
    div className=&quot;flex h-screen overflow-hidden&quot;
      Sidebar
      div className=&quot;flex flex-1 flex-col overflow-hidden&quot;
        Header
        main className=&quot;flex-1 overflow-y-auto bg-[#F8F9FA]&quot;    -- UPDATE bg from bg-muted/50 to bg-[#F8F9FA] (#F8F9FA = off-white per design spec)
          div className=&quot;mx-auto max-w-7xl p-8&quot;                  -- UPDATE p-8 (32px) per design spec spacing rules
            {children}

    Changes from current:
    1. main bg: bg-muted/50 -&gt; bg-[#F8F9FA] (the new off-white app background, matching --color-background)
    2. Padding: p-4 sm:p-6 lg:p-8 -&gt; p-8 (consistent 32px gutter per spec)
    3. Ensure Toaster is still wired at the end

    Why: The design spec specifies off-white #F8F9FA as the app background color and consistent 32px page padding. The current bg-muted/50 may not render correctly with the new tokens.
  </action>
  <verify>
    grep -n &quot;bg-\[#F8F9FA\]&quot; app/\(app\)/layout.tsx returns a match. grep -n &quot;p-8&quot; app/\(app\)/layout.tsx returns a match.
  </verify>
  <done>
    The app layout uses the correct off-white background and consistent 32px page padding. Sidebar and header render correctly within the layout.
  </done>
</task>

</tasks>

<verification>
1. Visual: Run the dev server (npm run dev) and navigate to the app. The sidebar should be white with a subtle right border, blue geometric mark + screens wordmark, nav items in correct order with MENU/SYSTEM labels, storage meter at bottom, collapse toggle.
2. Visual: Active nav items (matching current route) show soft blue #EEF3FF background with blue text/icon.
3. Visual: Inactive items show slate #6B7394, hover turns #F0F3FA.
4. Visual: Header shows Welcome back, {name} on left, capsule search in center, quick-add + bell + avatar+name+role on right.
5. Visual: Mobile viewport hides search and text labels, shows compact versions.
6. Visual: The overall background is off-white #F8F9FA, page padding is 32px.
7. Functional: Clicking nav items navigates to correct routes.
8. Functional: Logout dropdown works.
9. Verify src: All sidebar tokens use light values in globals.css.
</verification>

<success_criteria>
1. globals.css has all light sidebar tokens (sidebar: white, sidebar-foreground: slate, sidebar-active-bg: #EEF3FF, sidebar-hover: #F0F3FA)
2. Plus Jakarta Sans font is loaded via next/font and applied
3. sidebar.tsx renders with correct DOM structure matching the spec
4. header.tsx renders with three independent zones matching the spec
5. layout.tsx uses correct background (#F8F9FA) and padding (p-8)
6. All routes in the sidebar nav link to existing app pages
7. dev build compiles without errors
8. No regressions in page rendering
</success_criteria>

<output>
After completion, create .planning/phases/phase-2-shell/phase-2-SUMMARY.md
</output>
