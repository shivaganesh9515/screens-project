# soumya's Tasks — Frontend

**Your role:** Screen, Media & Playlist Screens (what the user sees and clicks)

## What you're building, in plain words
The forms and pages where people register screens, upload media, and build playlists — updated to match the new fields the backend team is adding.

## Your tasks

**1. New "Add Screen" form**
- Instead of the old pairing code, the admin now types in the screen's **unique number** to register it.
- Add fields: orientation, size type, screen type (static/bus/auto), connectivity (SIM/WiFi), and location (only needed for static screens, skip it for bus/auto).

**2. Update the screens list**
- Show the new details as columns or little badges (orientation, screen type icon, connectivity).
- Let people filter/sort by screen type and orientation.

**3. Update the media upload page**
- Add a filter for portrait vs landscape.
- Add an option to paste a live video link instead of uploading a file.

**4. Update the playlist builder**
- Add a "play this many times" input next to each video in a playlist.

**5. Add a screensaver picker**
- Simple settings section where admin picks which media item is the screensaver.

**6. Add "read only" option when inviting a user**
- Just a toggle/dropdown in the invite form.

## Note
Some of this depends on the backend team (harshitha/srinitha/abhinaya) adding the fields first — check `memory/SCHEMA-REFERENCE.md` before you start each piece, or just ask them directly if it's not there yet.

## Done means
All the forms/pages above are updated and working with the new fields.
