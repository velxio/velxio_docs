---
title: Écrivez votre propre World
description: Laissez une IA écrire un World à partir d'un prompt qui contient tout votre projet, ou écrivez world.html vous-même avec l'API window.velxio.
sidebar:
  order: 4
---

`world.html` est une simple page HTML. Tout ce que le [kit de scène](/docs/fr/worlds/scene-editor/)
ne peut pas dessiner (une machine, une pièce, un jeu, un robot personnalisé) peut être une page
à vous, écrite à la main ou par une IA.

## Avec une IA

Appuyez sur **Copy AI prompt**, dans l'introduction 3D ou dans la barre World. Le
prompt est un brief complet, construit à partir de votre projet à cet instant :

- **Votre projet, lu depuis le canvas** : chaque carte, chaque composant (avec
  ses réglages courts comme la couleur d'une LED), le câblage sous forme de nets (quelles broches sont
  reliées, y compris via les platines de prototypage), et les fichiers de firmware.
- **Ce qu'un World peut lire et écrire**, pour les composants que vous avez et pour chaque
  composant qu'un World prend en charge, afin que l'IA puisse vous indiquer quel composant ajouter et comment le
  câbler.
- **Les règles** : où la page s'exécute, l'API `window.velxio`, la physique sur le temps
  simulé, et les deux façons d'écrire un World (une scène de kit ou une page libre).
- **Comment répondre** : le `world.html` complet, le nouveau firmware s'il doit
  changer, et les modifications de câblage broche à broche.

Collez-le dans ChatGPT, Claude, Gemini ou tout autre chat, et écrivez ce que vous
voulez construire à la fin, dans n'importe quelle langue. Par exemple, avec un ESP32 et
quatre servos sur le canvas : « un bras robotique qui prend le cube rouge et le dépose
dans la boîte ». Ensuite, ouvrez le World, passez à **HTML**, remplacez tout par
la réponse et appuyez sur **Run**.

## Où la page s'exécute

- Une iframe sandboxée sans accès à l'API de Velxio, à votre compte ni à vos
  cookies. `localStorage` peut être absent.
- Les scripts et styles se chargent uniquement depuis `cdn.jsdelivr.net`, `cdnjs.cloudflare.com`,
  `unpkg.com` et `esm.sh`, plus le code inline. three.js provient de
  `https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js`.
- `window.velxio` existe déjà lorsque vos scripts s'exécutent. C'est le seul lien
  vers le circuit.

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

## Règles pour un World qui se comporte bien

1. **Physique sur le temps simulé.** Additionnez `f.dt` et avancez avec un pas fixe
   (2 ms fonctionne bien), en plafonnant le retard à 0,25 s. Dessinez avec
   `requestAnimationFrame`, mais ne déplacez jamais rien selon le temps réel : le
   simulateur peut tourner plus lentement ou plus vite que le temps réel.
2. **Ne bougez que lorsque `f.running` est vrai**, et remettez tout à son
   état initial sur `reset`.
3. **N'écrivez un capteur que lorsque sa valeur change**, et un capteur de distance au
   plus toutes les 30 ms de temps simulé. Mesurez depuis la scène : échantillonnez le
   sol sous un capteur de ligne, lancez un rayon pour un capteur de distance.
4. **Associez la commande d'un moteur à la vitesse des roues** avec un peu d'inertie (un
   retard du premier ordre d'environ 80 ms) et une petite zone morte. Un robot
   différentiel tourne par la différence entre ses deux côtés.
5. **Un seul fichier autonome** qui se redimensionne avec la fenêtre et affiche les
   valeurs qui comptent dans une petite superposition.

## Un World libre minimal

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

Le [suiveur de ligne Romeo ESP32-S3](/docs/fr/worlds/example-romeo-line-follower/)
est un World libre complet : une scène three.js avec son propre modèle de robot, trois
capteurs de ligne sur une boucle adhésive, et un URM09 qui voit une boîte que vous pouvez déposer sur la
piste.
