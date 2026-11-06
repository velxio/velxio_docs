---
title: Scrivi il tuo World
description: Lascia che un'IA scriva un World da un prompt che contiene tutto il tuo progetto, oppure scrivi world.html da solo con l'API window.velxio.
sidebar:
  order: 4
---

`world.html` è una semplice pagina HTML. Tutto ciò che il [scene kit](/docs/it/worlds/scene-editor/)
non riesce a disegnare (una macchina, una stanza, un gioco, un robot personalizzato) può essere una pagina
tua, scritta a mano o da un'IA.

## Con un'IA

Premi **Copy AI prompt**, nell'introduzione 3D o nella barra del World. Il
prompt è un brief completo, costruito dal tuo progetto in quel momento:

- **Il tuo progetto, letto dal canvas**: ogni board, ogni componente (con
  impostazioni brevi come il colore di un LED), il cablaggio come reti (quali pin sono
  collegati, anche attraverso breadboard) e i file del firmware.
- **Cosa un World può leggere e scrivere**, per i componenti che hai e per ogni
  componente che un World supporta, così l'IA può dirti quale componente aggiungere e come
  cablarlo.
- **Le regole**: dove viene eseguita la pagina, l'API `window.velxio`, la fisica sul
  tempo simulato e entrambi i modi di scrivere un World (una scena del kit o una pagina libera).
- **Come rispondere**: il completo `world.html`, il nuovo firmware se deve
  cambiare, e le modifiche al cablaggio pin per pin.

Incollalo in ChatGPT, Claude, Gemini o qualsiasi altra chat, e scrivi cosa
vuoi costruire alla fine, in qualsiasi lingua. Per esempio, con un ESP32 e
quattro servo sul canvas: "un braccio robotico che prende il cubo rosso e lo lascia
nella scatola". Poi apri il World, passa a **HTML**, sostituisci tutto con
la risposta e premi **Run**.

## Dove viene eseguita la pagina

- Un iframe in sandbox senza accesso all'API di Velxio, al tuo account o ai tuoi
  cookie. `localStorage` potrebbe mancare.
- Script e stili si caricano solo da `cdn.jsdelivr.net`, `cdnjs.cloudflare.com`,
  `unpkg.com` e `esm.sh`, più il codice inline. three.js proviene da
  `https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js`.
- `window.velxio` esiste già quando i tuoi script vengono eseguiti. È l'unico collegamento
  al circuito.

## L'API velxio

```js
const info = await velxio.ready();
// { boards: [{ id, kind }],
//   parts: [{ id, type, board, outputs: [...], inputs: [{ key, kind, min, max, unit }] }],
//   theme: 'dark' | 'light' }

velxio.onFrame((f) => {            // about 125 times per second
  // f.t        simulated seconds since the board booted (null while stopped)
  // f.dt       simulated seconds since the previous frame
  // f.running  true while the firmware runs
  // f.parts    { [id]: { drive, rpm } } for motors, { [id]: { angle } } for servos
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

## Regole per un World che si comporta bene

1. **Fisica sul tempo simulato.** Somma `f.dt` e avanza con un passo fisso
   (2 ms funziona bene), limitando l'arretrato a 0,25 s. Disegna con
   `requestAnimationFrame`, ma non muovere mai nulla in base al tempo reale: il
   simulatore può andare più lento o più veloce del tempo reale.
2. **Muovi solo mentre `f.running` è true**, e riporta tutto al suo
   stato iniziale su `reset`.
3. **Scrivi un sensore solo quando il suo valore cambia**, e un sensore di distanza al
   massimo ogni 30 ms di tempo simulato. Misura dalla scena: campiona il
   pavimento sotto un sensore di linea, lancia un raggio per un sensore di distanza.
4. **Mappa la drive di un motore alla velocità della ruota** con un po' di inerzia (un
   ritardo del primo ordine di circa 80 ms) e una piccola zona morta. Un robot
   differenziale gira per la differenza tra i suoi due lati.
5. **Un unico file autonomo** che si ridimensiona con la finestra e mostra le
   letture che contano in un piccolo overlay.

## Un World libero minimale

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

Il [Romeo ESP32-S3 line follower](/docs/it/worlds/example-romeo-line-follower/)
è un World libero completo: una scena three.js con il proprio modello di robot, tre
sensori di linea su un percorso tracciato con nastro, e un URM09 che vede una scatola che puoi lasciare cadere
sulla pista.
