# AltPathLong — landscape long-form compilation (1920x1080)

Turns vertical vote-story episodes into one landscape video:
fast-forward through the voted path → narration → rewind to episode 1 → alternate-path title →
episode 1 (condensed) → "A WINS" card → alternate-path episodes 2..N → outro.

- Left: path map (lit column = the path being shown; B for the voted path, A for the alternate one)
- Centre: the 608x1080 vertical episode
- Right: chapter, "THE REAL STORY" / alternate-path tag + "Not canon." label

All on-screen names (channel, series, alternate-path name, outro lines) come from `labels`
in the config, so nothing project-specific lives in the code.

## Steps
1. Write a config (see `config.example.json`): labels, the voted episodes and their cut times
   (end of the "You decide." line, before any vote call-to-action), the bridge narration, the ranges
   of episode 1 to keep, the alternate-path episode videos, and the choice labels for both maps.
2. `python3 whatif/prep.py config.json [--force]` → writes media into `public/whatif/` (gitignored)
   and `public/whatif/timeline.json`.
3. Put fonts in `public/whatif/fonts/` (M9/M8/M6 = Montserrat Black/ExtraBold/SemiBold, RM7 = Roboto Mono)
   and SFX (`.m4a`) in `public/whatif/sfx/` (names in `SFX` in `src/whatif/AltPathLong.tsx`).
4. Render: `REMOTION_BROWSER=/path/to/headless_shell node whatif/render.mjs out.mp4 [from] [to]`
   or still checks: `node whatif/render.mjs --stills outdir 120 900`.

Missing episode videos render as a placeholder card, so the edit can be reviewed before they are done.
