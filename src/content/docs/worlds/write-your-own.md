---
title: Write your own World
description: Let an AI write a World from a prompt that carries your whole project, or write world.html yourself with the window.velxio API.
sidebar:
  order: 4
---

`world.html` is a plain HTML page. Anything the [scene kit](/docs/worlds/scene-editor/)
cannot draw (a machine, a room, a game, a custom robot) can be a page of your
own, written by hand or by an AI.

## With an AI

Press **Copy AI prompt**, in the 3D introduction or in the World bar. The
prompt is a complete brief, built from your project at that moment:

- **Your project, read from the canvas**: every board, every part (with
  short settings such as an LED's colour), the wiring as nets (which pins are
  joined, through breadboards too), and the firmware files.
- **What a World can read and write**, for the parts you have and for every
  part a World supports, so the AI can tell you which part to add and how to
  wire it.
- **The rules**: where the page runs, the `window.velxio` API, physics on
  simulated time, and both ways to write a World (a kit scene or a free page).
- **How to answer**: the complete `world.html`, the new firmware if it has to
  change, and the wiring changes pin to pin.

Paste it into ChatGPT, Claude, Gemini or any other chat, and write what you
want to build at the end, in any language. For example, with an ESP32 and
four servos on the canvas: "a robot arm that picks the red cube and drops it
in the box". Then open the World, switch to **HTML**, replace everything with
the answer and press **Run**.

## Where the page runs

- A sandboxed iframe with no access to Velxio's API, your account or your
  cookies. `localStorage` may be missing.
- Scripts and styles load only from `cdn.jsdelivr.net`, `cdnjs.cloudflare.com`,
  `unpkg.com` and `esm.sh`, plus inline code. three.js comes from
  `https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js`.
- `window.velxio` already exists when your scripts run. It is the only link
  to the circuit.

## The velxio API

```js
const info = await velxio.ready();
// { boards: [{ id, kind }],
//   parts: [{ id, type, board, outputs: [...], inputs: [{ key, kind, min, max, unit }] }],
//   theme: 'dark' | 'light' }

velxio.onFrame((f) => {            // about 125 times per second
  // f.t        simulated seconds since the board booted (null while stopped)
  // f.dt       simulated seconds since the previous frame
  // f.running  true while the firmware runs
  // f.parts    { [id]: { drive, rpm } } for motors, { [id]: { angle } } for servos,
  //            { [id]: { on, brightness } } for LEDs
});

velxio.set(partId, values);        // write a sensor: only the keys it lists, values clamped
velxio.press(partId);              // pushbuttons and switches
velxio.release(partId);
velxio.on('reset', fn);            // the firmware restarted: put the world back at its start
velxio.on('theme', fn);            // Velxio switched between dark and light
velxio.on('visibility', fn);       // stop drawing while hidden, keep the physics on frames
velxio.telemetry({ ... });         // optional state to show in Velxio
console.log(...);                  // goes to the World log
```

## Rules for a World that behaves

1. **Physics on simulated time.** Add up `f.dt` and step with a fixed step
   (2 ms works well), clamping the backlog at 0.25 s. Draw with
   `requestAnimationFrame`, but never move anything by wall time: the
   simulator can run slower or faster than real time.
2. **Move only while `f.running` is true**, and put everything back at its
   start on `reset`.
3. **Write a sensor only when its value changes**, and a distance sensor at
   most every 30 ms of simulated time. Measure from the scene: sample the
   floor under a line sensor, cast a ray for a distance sensor.
4. **Map a motor's drive to wheel speed** with a little inertia (a
   first-order lag of about 80 ms) and a small deadband. A differential robot
   turns by the difference between its two sides.
5. **One self-contained file** that resizes with the window and shows the
   readings that matter in a small overlay.

## A minimal free World

```html
<!doctype html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>html,body{margin:0;height:100%;overflow:hidden;background:#15171a;color:#ddd;font:12px system-ui}</style>
</head>
<body>
  <script type="module">
    import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
    const info = await velxio.ready();
    // build the scene from info.parts ...
    const STEP = 0.002;
    let acc = 0;
    velxio.onFrame((f) => {
      if (!f.running) return;
      acc = Math.min(acc + f.dt, 0.25);
      while (acc >= STEP) {
        // step the physics: read f.parts[id].drive or f.parts[id].angle
        acc -= STEP;
      }
      // velxio.set('<sensor id>', { ... }) when a reading changed
    });
    velxio.on('reset', () => { /* back to the start */ });
    // requestAnimationFrame loop: draw only
  </script>
</body>
</html>
```

The [Romeo ESP32-S3 line follower](/docs/worlds/example-romeo-line-follower/)
is a complete free World: a three.js scene with its own robot model, three
line sensors on a taped loop, and a URM09 that sees a box you can drop on the
track.
