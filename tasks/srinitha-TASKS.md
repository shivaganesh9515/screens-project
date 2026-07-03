# srinitha — Your Tasks (Simple Version)

You build the **login system**, **media upload**, and **analytics**. Wait for harshitha to finish the database first.

---

## TASK 1: Login System

### What
Pages where users log in, sign up, and reset password.

### Files to create

#### `lib/supabase/client.ts`
Supabase connection for the browser.

```ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

#### `lib/supabase/server.ts`
Supabase connection for the server.

```ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }); },
        remove(name: string, options: CookieOptions) { cookieStore.set({ name, value: "", ...options }); },
      },
    }
  );
}
```

#### `app/(auth)/login/page.tsx`
Login page.

**What it shows:**
- "Screens" title
- Email input
- Password input
- "Sign In" button
- "Forgot password?" link
- "Don't have an account? Sign up" link
- Error message if wrong password

**How it works:**
1. User types email + password
2. Clicks "Sign In"
3. Calls `supabase.auth.signInWithPassword({ email, password })`
4. If success → go to `/overview`
5. If error → show error message

**Style:**
- Centered card on gray background
- White card with rounded corners
- Blue button

#### `app/(auth)/signup/page.tsx`
Signup page.

**What it shows:**
- Full name input
- Email input
- Password input
- Confirm password input
- "Sign Up" button
- "Already have an account? Sign in" link

**How it works:**
1. Validate: passwords match, email valid, password 6+ chars
2. Call `supabase.auth.signUp({ email, password })`
3. If success → insert into `users` table with role `'advertiser'`
4. Go to `/overview`

#### `app/(auth)/reset-password/page.tsx`
Password reset page.

**What it shows:**
- Email input
- "Send Reset Link" button
- "Check your email" message after submit

**How it works:**
1. Call `supabase.auth.resetPasswordForEmail(email)`
2. Show success message

#### `middleware.ts`
Already exists. Read it, understand it, make sure it works.

---

## TASK 2: Media Upload

### What
Page where users upload images, videos, and add live video links. Can filter by portrait/landscape.

### Files to create

#### `app/(app)/media/page.tsx`
Main media page.

**What it shows:**
- Top bar: "Media Library" + "Upload" button + "Add Live URL" button
- Filter buttons: All | Portrait | Landscape
- View toggle: Grid | List
- Media items in grid or list

**How it works:**
1. Fetch media: `supabase.from("media_items").select("*")`
2. Filter by orientation when user clicks filter buttons
3. Switch between grid and list view

#### `components/media/upload-dropzone.tsx`
Upload component.

**What it does:**
1. User drags file or clicks to select
2. Shows modal: "Is this Portrait or Landscape?"
3. User picks orientation
4. Uploads file to Supabase Storage bucket `media`
5. Inserts record into `media_items` table

**Upload code:**
```ts
const filePath = `${Date.now()}-${file.name}`;
await supabase.storage.from("media").upload(filePath, file);
await supabase.from("media_items").insert({
  org_id: orgId,
  name: file.name,
  type: file.type.startsWith("video/") ? "video" : "image",
  orientation: selectedOrientation,
  storage_path: filePath,
  size_bytes: file.size,
});
```

#### `components/media/media-grid.tsx`
Grid view of media.

**Each card shows:**
- Thumbnail image
- Name
- Badge: "Image" / "Video" / "Live"
- Badge: "Portrait" / "Landscape"
- File size
- Delete button

#### `components/media/media-list.tsx`
Table view of media.

**Columns:** Name, Type, Orientation, Size, Duration, Created, Actions

#### `components/media/add-live-url-modal.tsx`
Modal to add a live video link.

**Fields:**
- Name (text)
- URL (text, like "https://example.com/stream.m3u8")
- Orientation: Portrait / Landscape

**On submit:** Insert into `media_items` with `type: 'live_url'`

---

## TASK 3: Analytics

### What
Dashboard showing how much ads played and screen uptime. Advertisers see ONLY their own data.

### Files to create

#### `app/(app)/analytics/page.tsx`
Analytics page.

**What it shows:**
- Stats cards: Total Screen Hours, Total Ad Plays, Active Screens, Pending Ads
- Date range: 7 days | 30 days | 90 days
- Screen Uptime Table: which screens were on/off
- Ad Play Count Table: which ads played how many times
- "Export CSV" button

**Important:** If logged in as advertiser, only show their ads.

#### `components/analytics/stats-card.tsx`
One stat card.

**Shows:** Icon, big number, label

#### `components/analytics/uptime-table.tsx`
Table showing screen uptime.

**Columns:** Screen Name, Device Type, Online Hours, Offline Hours, Uptime %

#### `components/analytics/ad-plays-table.tsx`
Table showing ad play counts.

**Columns:** Ad Name, Created By, Play Count, Total Duration, Last Played

#### `lib/utils.ts`
Add CSV export function:

```ts
export function exportToCSV(data: Record<string, unknown>[], filename: string) {
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(","),
    ...data.map(row => headers.map(h => `"${row[h]}"`).join(","))
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}
```

---

## Test Checklist

- [ ] Can sign up with email + password
- [ ] Can log in and see dashboard
- [ ] Can reset password
- [ ] Can upload image, choose orientation, see it in grid
- [ ] Can add live URL, see it in grid
- [ ] Can filter by portrait/landscape
- [ ] Analytics page shows stats
- [ ] Export CSV downloads a file

---

## Git Rules

```bash
git checkout srinitha
git add .
git commit -m "what you did"
git push origin srinitha
```

NEVER push to master.
