# WhatIfLong — "every choice" long-form compilation (1920x1080)

Combines vertical vote-story episodes into one landscape video:
real story → vote result → rewind → THE OTHER PATH (the option that lost) → ENDING card → back to the real story.

- Left: path map (gold spine = voted path, red branches = other paths)
- Centre: the 608x1080 vertical episode
- Right: chapter, "THE REAL STORY" / "THE OTHER PATH" + "Not canon." label

## Steps
1. Write a config (see `config.example.json`): each part's source mp4, the cut time (end of the
   "You decide." line, before any vote call-to-action), chapter name, and the other-path video.
2. `python3 whatif/prep.py config.json` → trims/scales media into `public/whatif/` (gitignored)
   and writes `public/whatif/timeline.json`.
3. Put fonts in `public/whatif/fonts/` (M9/M8/M6 = Montserrat Black/ExtraBold/SemiBold, RM7 = Roboto Mono)
   and SFX (`.m4a`) in `public/whatif/sfx/` (names in `SFX` in `src/whatif/WhatIfLong.tsx`).
4. Render: `REMOTION_BROWSER=/path/to/headless_shell node whatif/render.mjs out.mp4 [from] [to]`
   or still checks: `node whatif/render.mjs --stills outdir 120 900`.

Missing other-path videos render as a placeholder card, so the edit can be reviewed before voices arrive.
