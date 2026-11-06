---
title: Schreibe deine eigene World
description: Lass eine KI eine World aus einem Prompt schreiben, der dein ganzes Projekt enthält, oder schreibe world.html selbst mit der window.velxio API.
sidebar:
  order: 4
---

`world.html` ist eine einfache HTML-Seite. Alles, was das [Scene-Kit](/docs/de/worlds/scene-editor/)
nicht zeichnen kann (eine Maschine, ein Raum, ein Spiel, ein eigener Roboter), kann eine eigene
Seite sein, von Hand oder von einer KI geschrieben.

## Mit einer KI

Drücke **Copy AI prompt** (KI-Prompt kopieren), in der 3D-Einführung oder in der World-Leiste. Der
Prompt ist ein vollständiges Briefing, das aus deinem Projekt in diesem Moment erstellt wird:

- **Dein Projekt, aus dem Canvas gelesen**: jede Platine, jedes Bauteil (mit
  kurzen Einstellungen wie der Farbe einer LED), die Verdrahtung als Netze (welche Pins
  verbunden sind, auch über Breadboards), und die Firmware-Dateien.
- **Was eine World lesen und schreiben kann**, für die Bauteile, die du hast, und für jedes
  Bauteil, das eine World unterstützt, damit die KI dir sagen kann, welches Bauteil du hinzufügen und wie du es
  verdrahten sollst.
- **Die Regeln**: wo die Seite läuft, die `window.velxio` API, Physik auf
  simulierter Zeit, und beide Arten, eine World zu schreiben (eine Kit-Szene oder eine freie Seite).
- **Wie geantwortet werden soll**: die vollständige `world.html`, die neue Firmware, falls sie
  geändert werden muss, und die Verdrahtungsänderungen Pin für Pin.

Füge es in ChatGPT, Claude, Gemini oder einen anderen Chat ein, und schreibe am Ende, was du
bauen möchtest, in beliebiger Sprache. Zum Beispiel, mit einem ESP32 und
vier Servos auf dem Canvas: "ein Roboterarm, der den roten Würfel aufnimmt und in die Kiste legt". Öffne dann die World, wechsle zu **HTML**, ersetze alles durch
die Antwort und drücke **Run** (Ausführen).

## Wo die Seite läuft

- Ein sandboxed iframe ohne Zugriff auf Velxios API, dein Konto oder deine
  Cookies. `localStorage` kann fehlen.
- Skripte und Styles laden nur von `cdn.jsdelivr.net`, `cdnjs.cloudflare.com`,
  `unpkg.com` und `esm.sh`, plus Inline-Code. three.js kommt von
  `https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js`.
- `window.velxio` existiert bereits, wenn deine Skripte laufen. Es ist die einzige Verbindung
  zum Schaltkreis.

## Die velxio API

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

## Regeln für eine World, die sich richtig verhält

1. **Physik auf simulierter Zeit.** Summiere `f.dt` und schreite mit einem festen Schritt
   (2 ms funktioniert gut), und begrenze den Rückstand auf 0,25 s. Zeichne mit
   `requestAnimationFrame`, aber bewege niemals etwas nach Wanduhrzeit: der
   Simulator kann langsamer oder schneller als Echtzeit laufen.
2. **Bewege dich nur, solange `f.running` true ist**, und setze bei
   `reset` alles wieder an seinen Startpunkt.
3. **Schreibe einen Sensor nur, wenn sich sein Wert ändert**, und einen Abstandssensor
   höchstens alle 30 ms simulierter Zeit. Miss aus der Szene: taste den
   Boden unter einem Liniensensor ab, wirf einen Strahl für einen Abstandssensor.
4. **Bilde den Antrieb eines Motors auf die Raddrehzahl ab** mit etwas Trägheit (ein
   Verzögerungsglied erster Ordnung von etwa 80 ms) und einem kleinen Totband. Ein Differentialroboter
   dreht sich durch die Differenz zwischen seinen beiden Seiten.
5. **Eine in sich geschlossene Datei**, die sich mit dem Fenster in der Größe anpasst und die
   wichtigen Messwerte in einem kleinen Overlay anzeigt.

## Eine minimale freie World

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

Der [Romeo ESP32-S3 Line Follower](/docs/de/worlds/example-romeo-line-follower/)
ist eine vollständige freie World: eine three.js-Szene mit eigenem Robotermodell, drei
Liniensensoren auf einer geklebten Schleife, und ein URM09, der eine Kiste sieht, die du auf die
Strecke fallen lassen kannst.
