# ZERO HOUR — long-form YouTube thumbnail format

Approved format for compilation / long-form thumbnails (1280×720). See `example_tokyo.jpg`.

- Left: dark navy panel with stacked text
  1. **City** — biggest, gold (`TOKYO`, `NEW DELHI`, …)
  2. **Number** — big white (`30`)
  3. **Line 1** — white (`STUDENTS`)
  4. **Line 2** — red (`TRAPPED`)
  5. **Red label** — episode range (`DAY 1 – FINAL DAY`)
- Right: a clean scene frame (no captions/HUD), dusk colour grade, fading into the panel
- One warm glow on the focal point (e.g. the lit classroom window)
- No spoiler shots (no red eyes, no deaths); the situation alone should sell it

Build:

```bash
python3 make_thumbnail.py scene.jpg out.jpg --city TOKYO --num 30 \
  --line1 STUDENTS --line2 TRAPPED --label "DAY 1 – FINAL DAY"
```
