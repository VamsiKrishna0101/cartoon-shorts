# Cartoon short engine

Vertical 1080x1920 animated shorts: flat 2D bean-head cartoon characters (billboard cards) in a toon-shaded 3D world with black ink outlines.
Everything renders on CPU (headless Chrome + SwiftShader WebGL), about 2 s per frame.

## Make a video
1. `web/stories/<slug>/script.txt` — the narration.
2. Voiceover → `web/stories/<slug>/voice.mp3`, then `python3 timing.py web/stories/<slug>/voice.mp3 web/stories/<slug>/script.txt web/stories/<slug>/phrases.json`
3. `web/stories/<slug>/story.js` — world + shots, timed to phrase starts `T(i)` (see `stories/milo` as the template).
4. Stills: `node render.mjs <slug> out/<slug>/stills "40,200,400"` then `python3 sheet.py out/<slug>/stills out/<slug>/sheet.jpg`
5. Sound: `web/stories/<slug>/cues.json`, then `python3 audio.py web/stories/<slug> out/<slug>/audio` and
   `python3 mix.py web/stories/<slug>/voice.mp3 out/<slug>/audio/music.wav out/<slug>/audio/sfx.wav out/<slug>/mix.wav <seconds>`
6. Frames: `node render.mjs <slug> out/<slug>/frames "0-"` (`RESUME=1` continues)
7. `bash finish.sh out/<slug>/frames out/<slug>/mix.wav out/<slug>/<slug>.mp4`

## Library
- `web/engine.js` — renderer, toon materials, ink + grade post pass, light presets (day/golden/night/gym), billboard cards, camera keys.
- `web/toon.js` — character drawing (Pen API, 15 expressions, poses: flex, carry, up, cheer, belly, point, lift).
- `web/lib/props.js` — cows/calves/bulls, bone pile, dumbbells, moo bubble, sweat, confetti.
- `web/lib/sets.js` — ground, hills+mountains, Greek temple, houses, olive/cypress trees, stadium + seats, modern gym, clouds.
- `audio.py` — synthesized march music + SFX (whoosh, pop, boing, thunk, ting, clank, sting, crowd, moo, chomp, burp, flash).
- `mix.py` — music at exactly -6 dB under the voice, SFX at -6 dB or less.

Character drawing code adapted from mromidev/claude-animated-shorts (MIT). three.js r160 (MIT).
