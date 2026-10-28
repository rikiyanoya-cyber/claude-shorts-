# AnotherStory — landscape long-form compilation (1920x1080)

Turns vertical vote-story episodes into one landscape video for YouTube:
fast-forward through the voted story → narration → rewind to Part 1 → ANOTHER STORY title →
Part 1 (condensed) → "A WINS" card → ANOTHER STORY episodes 2..N → outro.

- Left: path map (lit column = the path being shown; B for the voted story, A for ANOTHER STORY)
- Centre: the 608x1080 vertical episode
- Right: chapter, "THE REAL STORY" / "ANOTHER STORY" + "Not canon." label

## Steps
1. Write a config (see `config.example.json`): the voted episodes and their cut times (end of the
   "You decide." line, before any vote call-to-action), the bridge narration, the ranges of Part 1
   to keep, the ANOTHER STORY episode videos, and the choice labels for both maps.
2. `python3 whatif/prep.py config.json [--force]` → writes media into `public/whatif/` (gitignored)
   and `public/whatif/timeline.json`.
3. Put fonts in `public/whatif/fonts/` (M9/M8/M6 = Montserrat Black/ExtraBold/SemiBold, RM7 = Roboto Mono)
   and SFX (`.m4a`) in `public/whatif/sfx/` (names in `SFX` in `src/whatif/AnotherStory.tsx`).
4. Render: `REMOTION_BROWSER=/path/to/headless_shell node whatif/render.mjs out.mp4 [from] [to]`
   or still checks: `node whatif/render.mjs --stills outdir 120 900`.

Missing episode videos render as a placeholder card, so the edit can be reviewed before they are done.
