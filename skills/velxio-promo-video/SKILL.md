---
name: velxio-promo-video
description: Produce or update the Velxio promo/demo video (and product GIFs) by driving the REAL app with Playwright and post-producing with Remotion — screen take with visible cursor, zoom-ins on key clicks, captions, intro/outro cards. Use when asked to make/update a promo video, demo video, product animation, "video like the SaaS demo repos", a GIF of a flow, or to re-render after UI changes. Also the reference for WHY each trap workaround exists (starter modal, picker search, pin overlays, circuit verifier, cursor parking, camera math).
---

# Velxio promo video pipeline

Three phases, all in this repo (`velxio_docs`; `/home/dave/velxio_docs`
on the dev box):

1. **Record** — `scripts/promo-record.mjs` drives the real product on
   staging end-to-end (blank project -> pick ESP32 -> add 220R + LED ->
   rotate resistor -> wire by pin clicks -> write sketch -> Run -> LED
   blinks), with an injected visible cursor + click ripples. Every beat
   logs `{t, x, y, label}` to `scripts/promo-events.json`; raw video
   lands at `scripts/promo-raw.webm`.
2. **Beat grid** — `scripts/detect-beats.py` (librosa) turns the
   soundtrack into `promo/src/beats.json` (BPM, beats, kicks, snares).
3. **Post** — `promo/` is a Remotion project. `prepare.mjs` copies the
   take, trims the pre-modal boot, splices out the compile wait, and
   emits `src/data.json`. `src/Promo.tsx` renders the camera (zoom-ins
   centered on each beat, each punch SNAPPED to the nearest musical
   beat within 0.34 s), caption pills, a SOLID intro card, the
   velxio.dev outro, and the music track with fades.

## Commands

```bash
cd /home/dave/velxio_docs
VELXIO_SHOTS_EMAIL='s3-tester@moontero.com' VELXIO_SHOTS_PASSWORD='<see memory vstaging-test-user>' \
  node scripts/promo-record.mjs          # take (~2-4 min incl. compile)
python3 scripts/detect-beats.py promo/public/soundtrack.mp3 --fps 30 \
  --out promo/src/beats.json        # only when the track changes
cd promo && node prepare.mjs
CHROME=$(ls -d $HOME/.cache/ms-playwright/chromium-*/chrome-linux*/chrome | sort | tail -1)
npx remotion render src/index.ts promo out/velxio-demo.mp4 --codec h264 --browser-executable "$CHROME"
```

Published copy for GitHub viewing: `media/velxio-demo.mp4` (committed;
overwrite + push to update the same URL). `promo/out/` is gitignored.

## Review procedure (do NOT skip)

Sample frames AT THE BEAT TIMES from `promo/src/data.json` (`ct` field),
not at guessed times — beats move between takes:

```bash
ffmpeg -y -ss <ct> -i out/velxio-demo.mp4 -vframes 1 /tmp/beat.png
```

Check: intro readable, each zoom shows its subject uncut, captions match
what is on screen, cursor not covering what matters, final LED lit.

## Music

`promo/public/soundtrack.mp3` = Mixkit "House Vibez" by Lily J
(assets.mixkit.co/music/745/745.mp3), Mixkit Stock Music Free License —
free for commercial use, no attribution required. 123 BPM. Swap the file
and re-run `detect-beats.py` to change tracks; keep the licence note in
`promo/public/ATTRIBUTION.md` current.

The track opens with ~8 s of intro: `AUDIO_START` in `Promo.tsx` is the
first detected beat, so the audio is started from there and composition
t=0 lands on a downbeat. Volume rides at 0.55 with a 0.9 s fade-in and a
2.2 s fade-out over the outro.

## Style rules (from David's review — keep them)

- The video starts AT the editor with the board-template modal already
  open and the AI chat already minimized. No home page, no loading, no
  visible minimize click (recorder does it programmatically pre-start;
  prepare.mjs trims to the `start` mark).
- Intro title on a SOLID dark card — never translucent over the UI.
- Zooms must CENTER their subject: translate+scale with edge clamps
  (`Promo.tsx`), never transformOrigin-at-point (leaves the subject at a
  border and cuts it off, e.g. the ESP32 card).
- Add-part beats use a SHORT hold (~0.5 s) so the zoom releases in time
  to SEE where the part landed.
- The code beat centers the WHOLE editor pane (fx/fy override 357,280) —
  never a cropped editor while code is being written.
- After clicking Run, PARK the cursor away (recorder moves to 700,620)
  so the button spinner is visible; Run beat zooms the compile/run
  cluster at moderate scale (1.8).
- Rotate the resistor horizontal after placing (vertical default
  overlaps its own wires on camera).
- The pointer is a macOS-style ARROW, not a dot. Hotspot math (from the
  saas-product-demo skill): the tip sits at (4,3) in a 24x24 viewBox, so
  at render width W the element is offset by (-4W/24, -3W/24) — without
  it every click reads ~6-8 px off target.
- Zoom punches land on musical beats (see Music above); never let a
  punch drift more than ~0.3 s from its click just to hit a beat.

## Traps (each cost a broken take — all handled in the scripts)

1. `/` is the marketing landing even when signed in; the editor is
   `/editor`. Sign in via fetch POST `/api/auth/login` in-page first.
2. On a fresh `/editor` the "Start a new project" overlay auto-opens
   (`.new-project-overlay`) and intercepts every outside pointer click.
   Interact with it first, or dispatch programmatic clicks.
3. The picker's search input KEEPS the previous query — clear with
   Ctrl+A + Backspace before typing or you search "esp32led".
4. Picker cards: match exact title against
   `.component-picker-modal .card-name` (generic text engines hit Monaco
   tokens behind the modal). Results are debounced — poll up to 5 s.
   Card names are exact ("Resistor 220 Ω" with U+2126-style char, not
   "Resistor"; check `/components-metadata.json`).
5. Boards do NOT drag from their body — leave the board where the picker
   drops it (near the canvas' right edge) and place small parts RELATIVE
   to its live boundingBox, to its LEFT where the space is.
6. Pin clicks: use the app's own `[data-pin-overlay="true"][title=<pin>]`
   divs, choosing the candidate nearest the host element (titles collide:
   board pin "2" vs resistor "2"). Computing from `pinInfo` offsets
   breaks on rotated parts. ESP32 pins are named '2','4','GND' (not D2).
7. Verify each wire landed by counting `path[stroke="#1a1a1a"]` (every
   wire's outline path; wires have no class/data attrs). Retry once via
   Escape + re-click.
8. The circuit verifier BLOCKS Run for an LED without a series resistor
   (3.9e12 A error). The demo must wire GPIO2 -> 220R -> LED A, GND ->
   LED C. Never ship a take that needed "Run anyway".
9. The blank template ships a default sketch — Ctrl+A before typing the
   on-camera comment, then set the full sketch via
   `monaco.editor.getModels()[0].setValue(...)` (literal typing fights
   Monaco auto-closing brackets).
10. The "Enjoying Velxio? / Star on GitHub" toast photobombs takes
    longer than ~5 min — the injected cleaner removes it every second.
11. Playwright records no OS cursor: the injected `#vx-cursor` div +
    mousedown ripple (context.addInitScript) is the visible pointer.
12. Compile wait is real (30 s warm - 5 min cold): recorder logs `run`
    and `sim-started`; prepare.mjs splices that span out. Sim start is
    detected by an "in-browser" console line; "guest crashed" = abort.
13. Remotion renders with the Playwright chromium via
    `--browser-executable` (no bundled browser download on this box).

## Reference repos (examined 2026-08-15)

Two Claude-Code skills for the same genre, different approach: they
COMPOSE films from screenshots/schematic UIs with a synthetic cursor —
ours RECORDS the real product. Clone them when leveling up:

- `github.com/noamdorr/saas-product-demo-video` — 20-45 s beat-synced
  marketing films in Remotion. Steal: soundtrack BEAT-SYNC (librosa
  `detect-beats.py`: scene cuts on snares, in-scene events on kicks —
  our video is silent, adding music + aligning zoom beats is the single
  biggest upgrade available), cursor hotspot math (SVG arrow tip is at
  4,3 of a 24-box — matters if we swap our dot cursor for an arrow),
  typing-budget check, iteration playbook.
- `github.com/Vincentwei1021/video-shotcraft` — 152 shot recipe cards
  with demo sources + gallery (vincentwei1021.github.io/video-shotcraft),
  an approved template (Ink Press), 2.5D camera moves, sound design,
  and three operating modes (template / autonomous / co-created). Steal:
  the directorial shot vocabulary and its final-review checklist; it
  also installs as a plugin if a full cinematic film is ever wanted.

## Related

- Screenshots pipeline: `scripts/shots.mjs` (same repo) — scenes with
  the AI panel minimized unless it is the subject.
- GIFs: record a segment (Playwright recordVideo) and convert with
  ffmpeg two-pass palette; see `scripts/weather-media.mjs` for the
  zoom+crop pattern (crop region from the element's boundingBox).
- Staging test user: memory `vstaging-test-user` (s3-tester, pro).
- Broken showcase project (weather station) is tracked in
  `project/docs-portal-2026-08/STATUS.md` in velxio-prod.
