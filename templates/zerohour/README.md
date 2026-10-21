# ZERO HOUR templates

Concept: it started everywhere at the same minute (05:47 UTC). Each story is a different place, told one day at a time, one new rule per day.
First story: Zombie Outbreak, 10 days trapped inside a Japanese high school (Tokyo, 2:47 PM local).

## Cover format (Instagram Reels / YouTube Shorts)

- Size 1080x1920. Everything important sits inside the center 3:4 area (y 240 to 1680) so the profile grid crop keeps it.
- Background: the story's opening scene (for the school story, the school exterior from Day 1), darkened (black 28% plus vignette).
- Top band (y 330 to 560, black 55%): two lines, 64px Noto Sans JP Black.
  - Line 1 white: `WHAT HAPPENED AT A`
  - Line 2 red `#d6261c`: `HIGH SCHOOL IN TOKYO`
- Center: `DAY N` 230px white with drop shadow, red bar 240x12 under it, `OF 10` 66px Noto Sans JP Bold.
- Bottom: `ZERO HOUR` 48px white, letter-spacing 12.
- No local time on the cover.
- Film grain 7%.

Render with `node cover.mjs <day> "<line 1>" "<line 2>" <out.png>` (needs Playwright with Chromium, run from this folder). The cover is drawn by `window.drawCover2` in `school.html`.

## Video format

- 1080x1920, 30 fps. Narration only (no dialogue), English, ElevenLabs voice.
- Opening: `DAY N / OF 10` title card plus local time, then HUD pill `DAY N / 10` top-left. Rules stack under the HUD as red pills.
- Captions: sentence chunks, white Noto Sans JP Black 70px with shadow, centered around y 1430.
- Ending: iris (circle) fade-out onto the last key detail.
- Sound: ElevenLabs sound effects from `assets/sfx/elevenlabs`, ducked under the voice with sidechain compression, loudness -14 LUFS.
