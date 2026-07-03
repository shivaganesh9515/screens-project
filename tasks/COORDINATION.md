# Team Coordination — Simple Version

## Who Builds What

| Person | Builds | Depends On |
|--------|--------|------------|
| **harshitha** | Database, Screens, Ads, Player | Nothing — starts first |
| **srinitha** | Login, Media Upload, Analytics | harshitha's database |
| **abhinya** | Map, Playlists, Settings | harshitha's database |

---

## Execution Order

### Week 1
- **harshitha:** Create database tables (MUST FINISH FIRST)
- **srinitha:** Build login pages (can start anytime)
- **abhinya:** Read existing layout, prepare map placeholder

### Week 1-2
- **harshitha:** Build screen management + pairing
- **srinitha:** Build media upload (needs media_items table)
- **abhinya:** Build home page with map (needs screens table)

### Week 2
- **harshitha:** Build ad system
- **srinitha:** Build analytics (needs ad_play_logs table)
- **abhinya:** Build playlists (needs playlists tables)

### Week 3
- **harshitha:** Build player app
- **abhinya:** Build settings (needs screen_saver table)

---

## What to Do If Blocked

| Problem | Do This |
|---------|---------|
| Table doesn't exist yet | Tell harshitha to create it |
| Need media data | Tell srinitha to upload test files |
| Need screen data | Tell harshitha to create test screens |
| Not sure what to build | Read your TASKS.md file |
| Git conflict | Tell the team lead |

---

## Daily Check-in Questions

1. What did you finish yesterday?
2. What are you working on today?
3. Are you stuck on anything?

---

## Git Rules

- Work ONLY on your branch
- NEVER push to master
- Push with: `git push origin <your-branch>`
- Commit with clear messages like "added login page" or "created screen table"
