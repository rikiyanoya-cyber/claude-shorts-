# Sound effects library (ElevenLabs)

Sound effects generated with ElevenLabs Sound Effects for the Zombie School series (Day 1).
They are reusable in other projects (だってよ。, NowClub, etc.).

All files are 48 kHz MP3. Gains below are what worked in the Day 1 mix (voice ducked over SFX with sidechain compression).

| File | Length | Prompt | Notes / suggested use |
|---|---|---|---|
| `school_chime_bell.mp3` | 1.0s | Japanese school chime, Westminster melody, played through an old PA speaker in an empty hallway | Single bell tone. Pitch-shift it to build melodies |
| `school_chime_melody.mp3` | 6.5s | (built from `school_chime_bell.mp3`) | Westminster quarters (キーンコーンカーンコーン), pitch ratios E 1.0, C 0.7937, D 0.8909, low G 0.5946, 0.62s apart |
| `pa_static.mp3` | 1.0s | old school PA speaker crackling static, radio interference | Loop with crossfades for longer static |
| `pa_scream_distant.mp3` | 6.0s | distant man screaming through a distorted PA speaker, then cut off | Day 1 used the first 1.75s with a fade-out |
| `speaker_cutoff.mp3` | 1.0s | loudspeaker suddenly cutting off with a pop, then silence | Hard cut / "signal lost" moments |
| `horror_drone.mp3` | 12.0s | dark ominous horror ambience, low drone, slow tension | Bed under tense scenes. Loop with 0.8s crossfades. Gain about 0.3 |
| `body_fall_dirt.mp3` | 1.0s | body falling onto dirt ground, heavy thud | Falls, drops |
| `bones_crack.mp3` | 1.0s | bones cracking, joints snapping, creepy | Unnatural movement |
| `cinematic_impact.mp3` | 2.0s | deep cinematic horror impact, boom | Reveals, title or rule cards, endings |
| `door_lock_click.mp3` | 1.0s | classroom sliding door lock click, metal latch | Locks, latches, UI-like clicks |
| `desk_drag.mp3` | 2.9s | school desk dragged across wooden floor, scraping | Furniture moving |
| `footsteps_drag.mp3` | 5.0s | slow dragging footsteps in a school hallway, shuffling | Quiet file, use gain about 0.9 |
| `knock_x4.mp3` | 1.8s | three soft knocks on a wooden door | Contains 4 knocks at about 0.10, 0.36, 0.63, 0.92s. Cut single knocks to place them freely |
| `heartbeat_slow.mp3` | 10.3s | slow heavy heartbeat, tense, close to the ear | Suspense, silence scenes |
| `breath_heavy.mp3` | 2.9s | scared teenage boy breathing heavily, out of breath, behind a door | Fear, exhaustion |
| `blood_drip.mp3` | 2.9s | single drops of blood dripping onto a tile floor, quiet hallway | Several drips. Quiet file, use full gain |

## Making more

Generate on the ElevenLabs web app (`https://elevenlabs.io/app/sound-effects`; the mobile app has no Sound Effects menu), or with the API (`text_to_sound_effects.convert`) when `ELEVENLABS_API_KEY` is available. Add new files here with their prompt in this table.
