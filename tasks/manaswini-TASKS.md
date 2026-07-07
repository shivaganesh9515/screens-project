# manaswini's Tasks — Frontend

**Your role:** Live Map + The 3 Dashboards (what the user sees and clicks)

## What you're building, in plain words
This is the biggest frontend piece: a live map showing all screens, and three separate dashboards for the three types of users (main admin, franchise, advertiser).

## Your tasks

**1. Live map on the home page**
- Add a map on the left side of the main dashboard page.
- Every screen shows up as a point: **green if online, red if offline**.
- Static screens sit at a fixed spot. Bus/auto screens should move as their GPS location updates.
- Clicking a point shows the screen's name and status.

**2. Get GPS working on the player screen itself**
- On the actual screen device (bus/auto only), ask the browser for its location and send it up regularly, alongside the existing heartbeat ping.
- Static screens don't need this — skip it for them.

**3. Send people to the right dashboard after login**
- Main admin → admin dashboard
- Franchise manager → franchise dashboard
- Advertiser → advertiser dashboard

**4. Main Admin dashboard**
- See everything: all franchises, all screens, all advertisers.
- A queue to approve ads that franchises submit for themselves.
- A way to create/edit franchises and assign a manager to each.

**5. Franchise dashboard ("the all-rounder")**
- Only shows their own territory's screens/schedules/playlists.
- A queue to approve/reject advertiser ads targeting their territory.
- A way for the franchise to submit their own ad (goes to main admin for approval).

**6. Advertiser dashboard**
- Kept simple: "My Ads" (with approval status per territory), "Create Ad" (pick media + pick which territories to target), and a page showing their own ad analytics.
- They should never see anyone else's data.

## Note
Almost everything here depends on the backend team, especially harshitha's franchises/advertisers/ads work. Check `memory/SCHEMA-REFERENCE.md` first, and don't be afraid to ask soumya or ashwanth for help — this is a lot of ground to cover alone.

## Done means
Live map works with correct colors + moving vehicle markers, and all 3 dashboards are up and connected to the real approval flow.
