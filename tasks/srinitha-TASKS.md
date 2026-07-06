# srinitha's Tasks — Backend

**Your role:** Media, Playlists & Screensaver (the backend/database side)

## What you're building, in plain words
A few upgrades to how media and playlists work behind the scenes, plus a couple of leftover fixes from last time.

## Your tasks

**1. Media orientation**
- Add a field so each photo/video knows if it's landscape or portrait.

**2. Live video links**
- Right now people can only upload a file. Add support for pasting a **live video URL** instead — so it's stored as a link, not a file.

**3. Playlist repeat count**
- Add a field so each video in a playlist can say "play this 3 times" (per item, not the whole playlist).

**4. Screensaver setting**
- Add a way to pick a default "screensaver" media item — shown when nothing else is scheduled.

**5. Double-check read-only invites work properly**
- We already have a "viewer" role. Just confirm it's actually locked down everywhere (not just hidden in the UI).

**6. Two small leftover fixes**
- When someone deletes a media file, actually delete it from storage too (right now it just disappears from the list, but the file stays).
- There's an unused upload API route sitting around — decide if we keep it or delete it.

## Done means
Media supports orientation + live links, playlists support repeat counts, screensaver setting exists, and the two leftover bugs are fixed. Write new fields down in `memory/SCHEMA-REFERENCE.md`.
