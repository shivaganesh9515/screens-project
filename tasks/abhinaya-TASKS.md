# abhinaya's Tasks — Backend

**Your role:** Screen Details, GPS & Analytics (the backend/database side)

## What you're building, in plain words
Screens need more details attached to them (like orientation and a unique ID number), we need to track vehicle location (buses/autos), and analytics needs real history instead of just a live snapshot.

## Your tasks

**1. Add new details to each screen**
- Orientation (landscape/portrait)
- Size type
- Screen type: static (shop/mall) or vehicle-mounted (bus/auto)
- A **unique number** — this is how a screen gets registered/verified (replaces the old random pairing code)
- Connectivity: SIM or WiFi
- Location (lat/lng) — only for static screens

**2. Track vehicle location (GPS)**
- New table that logs lat/lng over time for bus/auto screens.
- Update the heartbeat endpoint so it can accept a location update along with the regular "I'm alive" ping.

**3. Track online/offline history**
- New table that logs every time a screen goes online or offline (not just the current status) — this is what makes real uptime/downtime charts possible.
- Also: if a screen hasn't sent a heartbeat in ~90 seconds, mark it offline automatically.

**4. Ad play counts**
- Add a way to link each play event to the specific ad that played, so we can count "this ad played 340 times."

**5. Write the analytics queries**
- Uptime/downtime per screen over time.
- Play count per ad.
- A version scoped to just one advertiser's own ads (for their dashboard).
- Fix a bug: analytics currently groups screens by **name**, which merges two screens that happen to share a name — should group by ID instead.

## Done means
Screens have all their new details, GPS is being logged, uptime history works, and the analytics queries are ready for the frontend to use. Write it all down in `memory/SCHEMA-REFERENCE.md`.
