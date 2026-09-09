---
name: velxio-rebuild-video
description: Film a circuit being BUILT FROM SCRATCH in the real Velxio app — board and parts from the picker, wire by pin, sketch, Run, then work the inputs so the thing visibly reacts. Recipes come either from the gallery dump or from a REAL user's wiring trace in pro_engagement_events, which supplies the order and the pauses. Use when asked for a rebuild/build-from-scratch video, a per-example demo clip, "record a project being wired", or to re-record after a UI change. Also the reference for WHY each workaround exists (pin overlays, picker flyout, knob geometry, sensor panel, code scroll, wire counting).
---

# Rebuild videos

Films one example being built end to end. Distinct from
`velxio-promo-video`, which is a single scripted marketing take; this one
is per-project and batchable.

Three stages, all in `velxio_docs` (`/home/dave/velxio_docs`):

1. **Recipe** — what to build. Either `scripts/recipes.json` (dumped from
   the app's own example data by `scripts/dump-recipes.mjs`) or, for a
   real user's circuit, `scripts/trace-recipe.py`.
2. **Record** — `scripts/rebuild-record.mjs` drives the real app with an
   injected cursor and click ripples, writing
   `promo/public/rebuild/<slug>.{webm,json,-circuit.png}`. The `.json`
   is the beat list the post stage cuts on.
3. **Post** — `scripts/rebuild-render.mjs` renders each take through the
   Remotion `rebuild` composition into `promo/out/rebuild/<slug>.mp4`.

## Commands

```bash
# a recipe from a real user's project + its own wiring trace
PGPASSWORD=$(grep '^DATABASE_URL' /home/dave/velxio-prod/.env |
             sed -E 's|.*://velxio:([^@]*)@.*|\1|') \
  python3 scripts/trace-recipe.py <project-id-prefix>... -o /tmp/batch.json

# record (RECIPES_FILE is optional; without it, the gallery dump)
RECIPES_FILE=/tmp/batch.json VELXIO_BASE=http://127.0.0.1:3080 \
  node scripts/rebuild-record.mjs [slug ...] [--force]

# post
cd promo && npm install && node prepare.mjs && cd ..
node scripts/rebuild-render.mjs [slug ...] [--force]
```

`WIRE_DEBUG=1` logs every pin hit and screenshots a part that would not
land.

## Recipes from user traces

`pro_engagement_events` has ~1 M `wire_added` rows. What each carries:
`{start_component, start_pin, end_component, end_pin, signal_type}` plus
a timestamp. **No coordinates** — `PrivacyModal.tsx` promises users the
wire path is not recorded, and the only `mousemove` listener
(`SessionTracker.tsx`) just resets the idle timer. So a trace gives ORDER
and PACING, never a cursor path. It does not need to: `wirePin()` does
not click coordinates.

Two things the generator gets right and a naive query would not:

- **Filter the noise.** ~55% of rows are not hand-wiring: opening a
  project logs every wire as `added` in the same millisecond, and
  dragging a part across a breadboard makes auto-connect regenerate its
  wires on every move. Keep rows that have BOTH pin names and a gap over
  ~0.5 s from the previous one; drop anything mentioning a breadboard.
- **Match on type + pin, never on instance id.** Ids are timestamp-
  derived and users rebuild a circuit several times, so no id in the
  trace survives into the saved project. `components_json`'s
  `metadataId` gives the type on both sides, and it is also the key into
  `scripts/catalog.json` for the picker card name.

The netlist comes from the saved project (that is the circuit that
compiles), the order from the trace, and the sketch from disk
(`data/projects/<id>/<group>/sketch.*`) — `projects.code` is a legacy
fallback that can be stale.

Aggregated across 24 857 wiring bursts the "human order" is a weak
signal (POWER 0.42, GND 0.49, SIGNAL 0.51, DATA 0.56, CLK 0.59 mean
position). Per project it is worth using; as a general heuristic it is
not.

## Traps, and why the code looks like it does

**Pin hit areas are mounted only while the part BODY is hovered, and they
sit on its outline.** Move the pointer onto the pin and they unmount, the
press lands on the canvas, and the app records a waypoint instead of a
connection. Boards are big enough to hide this; every small part failed
100% of the time. `wirePin()` hovers the part, parks the VISIBLE cursor
on the pin for the camera, and dispatches the press to the pin element.

**Do not zoom the canvas to make pins easier to hit.** At any scale but
1:1 the pin hit areas stop responding and every wire misses. The same
goes for `deviceScaleFactor: 2`.

**Count wires only after Escape.** The wire-in-progress preview is drawn
with the same stroke as a finished wire, so counting before cancelling
scores a missed click as a landed one — and ships takes with an empty
canvas.

**Hovering a picker card raises a detail flyout drawn over its
NEIGHBOURS.** The pointer's own travel across the grid leaves a panel on
the target card and the press adds nothing. Same shape as the pin trap,
same answer: move for the camera, ask `elementFromPoint` what is on top,
dispatch to the card element when it is something else.

**Two different things happen when you click a part during a run**, and
`SimulatorCanvas.handleComponentMouseDown` decides which. A pushbutton,
switch or pot gets the raw mousedown through to its wokwi-element shadow
DOM, which raises `button-press` / `input` itself. A SENSOR has its click
claimed, and the mouseup opens the `SensorControlPanel` — whose sliders
are the only way to move that sensor's value. So: press, then look for
`.sensor-control-panel` and sweep `.sensor-slider` if it came up.

**A potentiometer is rotated by the ANGLE of the pointer around its knob,
and it binds `mousemove` on its own SVG.** A drag that leaves the part
does nothing, and pressing it just selects it — which is how a take
shipped with the sketch reading a flat 0. Drag an arc INSIDE the part;
fall back to the hidden `input[type=range]` the element keeps in its
shadow DOM for keyboard users.

**`setValue` lands the whole sketch at once**, so without an explicit
scroll the camera only ever sees its first screen. `scrollCode()` eases
down with `monaco.editor.getEditors()[0].setScrollTop` and back up. It
returns early when the file fits — that is correct, not a failure.

**Recording runs anonymous against prod.** `s3-tester@moontero.com` from
the promo skill exists only on STAGING. Anonymous works because the
anon-compile guard is client-side (`localStorage`
`velxio.pro.anonCompileCount`, see `anonCompileGuard.ts`) and every take
opens a fresh browser context.

**Node.** The scripts use `fs.globSync` (Node 22); the dev box runs 20,
so both carry a small stand-in. **Remotion** needs `npm install` in
`promo/` AND `node prepare.mjs` first — `src/data.json` is generated, is
absent from the repo, and the bundler needs it even to render the
`rebuild` composition.

**`media/` is not part of the Astro site.** Videos committed there are
repo material; no page references them and they do not enter the build.
Pushing makes them viewable on GitHub; deploying does not publish them.

## Housekeeping

Killing a stuck render with `pkill -f remotion` kills the shell that runs
it: the pattern matches pkill's own command line. Write it `remoti[o]n`.

## Board coverage

`BOARD_BY_TYPE` in the recorder maps a recipe's `boardType` to a picker
card name. Only what is listed there can be filmed — extend it before
picking a project on a board it does not know.
