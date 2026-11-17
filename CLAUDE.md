# Daily cartoon short — production recipe

This repo is Vamsi's cartoon video engine. A scheduled run makes ONE finished vertical video from scratch and delivers it.
Read README.md for the tools. `web/stories/milo/` is the reference story: copy its structure.

## Channels
- **TikTok (gym accounts)** — weekdays. Funny gym content built on a REAL, verified fact (history, science, record) plus a
  takeaway workout tip. Gym-related always. Very simple English any viewer gets instantly. No app name, logo or download CTA
  unless Vamsi says the marketing phase has started.
- **YouTube (separate channel, not fitness)** — Saturdays. A funny original cartoon story about a surprising true story
  (history, science, weird laws, lucky accidents, animals, inventions). Frame legends as "legend says".
- Check `stories.md` before picking a topic: never repeat one. Append the new topic when done.

## Budget rules (free ElevenLabs plan, about 10,000 credits a month)
- Script 70-90 words (about 25 s, 350-450 characters). Never longer.
- Generate the voice ONCE. Never press Regenerate. Before generating, read "credits remaining" on the page:
  if it is below the script's character count, stop and notify Vamsi instead.
- No upgrades, purchases or new accounts, ever. If ElevenLabs is signed out, stop and notify.

## Steps
1. `npm i` (three + playwright), Chrome is at /usr/bin/google-chrome.
2. Pick a topic, verify the fact with a web search, write `web/stories/<slug>/script.txt`:
   hook (absurd fact, no setup) → setting → 2-4 escalating beats → "You see," explanation with an everyday analogy → short ironic twist as the last words.
3. Voice: Claude in Chrome → elevenlabs.io/app/speech-synthesis/text-to-speech, voice "Adam - Dominant, Firm", model Eleven v4.
   Clear the box, type the script, Generate speech, download Generation 1. The MP3 lands in the user's Downloads folder:
   stage it with device_stage_files, copy to `web/stories/<slug>/voice.mp3`.
4. `python3 timing.py web/stories/<slug>/voice.mp3 web/stories/<slug>/script.txt web/stories/<slug>/phrases.json`
5. Write `story.js` (one shot per phrase or two, every sentence illustrated literally, props carry the jokes, the twist gets a
   hard cut + push-in with roll, the last word lands the payoff) and `cues.json` (music stops at the twist).
   Reuse lib/sets.js and lib/props.js; add new sets/props there, not inside the story, so the library grows.
6. Stills check before the long render: `node render.mjs <slug> out/<slug>/s "<10-16 frames>"` + `python3 sheet.py ...`.
   Look at the sheet. Fix: characters cut by the frame edge (vertical frame is narrow: ±0.8 m at 4 m), props covering faces,
   camera inside walls/hills, anything unreadable. Re-check.
7. Audio: `python3 audio.py web/stories/<slug> out/<slug>/audio`, then mix.py (confirm music -6.0 dB, sfx ≤ -6 dB).
8. Captions (always on): `python3 captions.py web/stories/<slug>/phrases.json out/<slug>/captions.ass`
   (1-3 words at a time, white + black outline, spoken word in yellow).
   Render: `node render.mjs <slug> out/<slug>/frames "0-"` in the background (~1-2 s/frame), then
   `bash finish.sh out/<slug>/frames out/<slug>/mix.wav out/<slug>/<slug>.mp4 out/<slug>/captions.ass`. QA must show no freezes ≥0.4 s, no black frames.
9. Deliver: SendUserFile the MP4 (status proactive) with a ready-to-paste TikTok caption: ONE short line + 4-5 hashtags.
   Also save it to the user's computer at projects\cartoon-shorts\videos\<date>_<slug>.mp4 if the folder is connected.
10. Commit the story code (not voice/mp3/mp4: they are gitignored) and push to main. Append the topic to stories.md.

## Look rules (keep)
- Characters never freeze: blinks, idle, walk cycles. Every camera hold creeps. Hard cut only on place/time jumps (+ white flash).
- Captions are burned in by captions.py (Vamsi wants them). Other on-screen text only when diegetic (MOO bubble, signs).
- Never a real living person as a character, no brand logos, nothing graphic or political.
