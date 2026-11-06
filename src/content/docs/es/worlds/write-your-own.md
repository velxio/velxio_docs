---
title: Escribe tu propio World
description: Deja que una IA escriba un World a partir de un prompt que lleva todo tu proyecto, o escribe world.html tú mismo con la API window.velxio.
sidebar:
  order: 4
---

`world.html` es una página HTML normal. Todo lo que el [kit de escena](/docs/es/worlds/scene-editor/)
no puede dibujar (una máquina, una habitación, un juego, un robot personalizado) puede ser una página
propia, escrita a mano o por una IA.

## Con una IA

Pulsa **Copy AI prompt**, en la introducción 3D o en la barra del World. El
prompt es un brief completo, construido a partir de tu proyecto en ese momento:

- **Tu proyecto, leído del lienzo**: cada placa, cada componente (con
  ajustes breves como el color de un LED), el cableado como redes (qué pines están
  unidos, también a través de breadboards), y los archivos de firmware.
- **Qué puede leer y escribir un World**, para los componentes que tienes y para cada
  componente que un World soporta, para que la IA pueda decirte qué componente añadir y cómo
  cablearlo.
- **Las reglas**: dónde se ejecuta la página, la API `window.velxio`, la física sobre
  tiempo simulado, y las dos formas de escribir un World (una escena del kit o una página libre).
- **Cómo responder**: el `world.html` completo, el nuevo firmware si tiene que
  cambiar, y los cambios de cableado pin a pin.

Pégalo en ChatGPT, Claude, Gemini o cualquier otro chat, y escribe lo que
quieres construir al final, en cualquier idioma. Por ejemplo, con un ESP32 y
cuatro servos en el lienzo: "un brazo robot que coge el cubo rojo y lo deja
en la caja". Luego abre el World, cambia a **HTML**, reemplaza todo con
la respuesta y pulsa **Run**.

## Dónde se ejecuta la página

- Un iframe en sandbox sin acceso a la API de Velxio, tu cuenta ni tus
  cookies. Puede que falte `localStorage`.
- Los scripts y estilos se cargan solo desde `cdn.jsdelivr.net`, `cdnjs.cloudflare.com`,
  `unpkg.com` y `esm.sh`, además de código en línea. three.js viene de
  `https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js`.
- `window.velxio` ya existe cuando se ejecutan tus scripts. Es el único enlace
  al circuito.

## La API velxio

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

## Reglas para un World que se comporte bien

1. **Física sobre tiempo simulado.** Suma `f.dt` y avanza con un paso fijo
   (2 ms funciona bien), limitando el atraso a 0.25 s. Dibuja con
   `requestAnimationFrame`, pero nunca muevas nada por tiempo real: el
   simulador puede ir más lento o más rápido que el tiempo real.
2. **Muévete solo mientras `f.running` sea true**, y devuelve todo a su
   estado inicial en `reset`.
3. **Escribe un sensor solo cuando cambie su valor**, y un sensor de distancia como
   mucho cada 30 ms de tiempo simulado. Mide desde la escena: muestrea el
   suelo bajo un sensor de línea, lanza un rayo para un sensor de distancia.
4. **Mapea el drive de un motor a la velocidad de la rueda** con un poco de inercia (un
   retardo de primer orden de unos 80 ms) y una pequeña banda muerta. Un robot diferencial
   gira por la diferencia entre sus dos lados.
5. **Un archivo autocontenido** que se redimensione con la ventana y muestre las
   lecturas que importan en una pequeña superposición.

## Un World libre mínimo

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

El [seguidor de línea Romeo ESP32-S3](/docs/es/worlds/example-romeo-line-follower/)
es un World libre completo: una escena de three.js con su propio modelo de robot, tres
sensores de línea sobre un circuito de cinta, y un URM09 que ve una caja que puedes dejar
en la pista.
