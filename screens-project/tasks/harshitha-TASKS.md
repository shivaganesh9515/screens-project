# harshitha's Tasks — Backend

**Your role:** Franchises, Advertisers, Ads, and Approvals (the backend/database side)

## What you're building, in plain words
Right now the app only knows about one company (one "org"). We need it to understand **franchises** (local territories), **advertisers** (people who pay to show ads), and a **2-step approval system** before any ad goes live.

## Your tasks

**1. Create the new database tables**
- `franchises` — one row per territory (name, which org it belongs to, who manages it)
- `advertisers` — one row per advertiser account
- `ads` — one row per ad someone submits (has a status: pending / approved / rejected)
- `ad_franchise_targets` — since one ad can target multiple franchises, this tracks approval **separately for each franchise** (e.g. approved in Hyderabad, still pending in Chennai)

**2. Add new user roles**
- Right now roles are just admin/editor/viewer. Add `main_admin` and `franchise_manager` so we can tell who's who.

**3. Build the approval logic**
- Advertiser submits an ad → goes to the franchise manager(s) they targeted → they approve or reject.
- Franchise wants to run their own ad → goes to the main admin to approve.
- **Important:** once approved, actually create the real schedule so the ad plays on screens — don't just flip a status flag and stop there.

**4. Lock down access (RLS)**
- Advertisers should only ever see their own ads.
- Franchise managers should only see ads for their own territory.
- Main admin sees everything.
- Also fix a bug from last time: right now any logged-in person can see every org's data — that needs to be locked down too.

**5. Write down what you built**
- After each table/column you add, jot it in `memory/SCHEMA-REFERENCE.md` so others aren't guessing names.

## Done means
Franchises, advertisers, ads, and the approval flow all work end-to-end, and it's written down clearly for the rest of the team.
