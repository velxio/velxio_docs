---
title: Напишите свой собственный World
description: Позвольте ИИ написать World по промпту, который содержит весь ваш проект, или напишите world.html самостоятельно с помощью API window.velxio.
sidebar:
  order: 4
---

`world.html` — это обычная HTML-страница. Всё, что [набор сцен](/docs/ru/worlds/scene-editor/)
не может нарисовать (станок, комната, игра, нестандартный робот), может быть страницей,
написанной вами вручную или с помощью ИИ.

## С помощью ИИ

Нажмите **Copy AI prompt** в разделе 3D-введения или на панели World. Этот
промпт — полное техническое задание, собранное из вашего проекта на данный момент:

- **Ваш проект, считанный с холста**: каждая плата, каждая деталь (с
  краткими настройками, например, цветом светодиода), соединения в виде цепей (какие выводы
  соединены, в том числе через макетные платы), и файлы прошивки.
- **Что World может читать и записывать**, для имеющихся у вас деталей и для каждой
  детали, которую поддерживает World, чтобы ИИ мог подсказать, какую деталь добавить и как её
  подключить.
- **Правила**: где выполняется страница, API `window.velxio`, физика на модельном времени,
  и оба способа написания World (сцена из набора или свободная страница).
- **Как отвечать**: полный `world.html`, новая прошивка, если её нужно
  изменить, и изменения в подключении вывод к выводу.

Вставьте его в ChatGPT, Claude, Gemini или любой другой чат и в конце напишите, что вы
хотите построить, на любом языке. Например, с ESP32 и
четырьмя сервоприводами на холсте: "робот-манипулятор, который берёт красный куб и кладёт его
в коробку". Затем откройте World, переключитесь на **HTML**, замените всё
ответом и нажмите **Run**.

## Где выполняется страница

- В изолированном iframe без доступа к API Velxio, вашему аккаунту или вашим
  cookie. `localStorage` может отсутствовать.
- Скрипты и стили загружаются только с `cdn.jsdelivr.net`, `cdnjs.cloudflare.com`,
  `unpkg.com` и `esm.sh`, плюс встроенный код. three.js берётся с
  `https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js`.
- `window.velxio` уже существует, когда выполняются ваши скрипты. Это единственная связь
  со схемой.

## API velxio

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

## Правила для правильно работающего World

1. **Физика на модельном времени.** Суммируйте `f.dt` и выполняйте шаги с фиксированным шагом
   (2 мс подходит хорошо), ограничивая накопленное значение 0.25 с. Рисуйте с помощью
   `requestAnimationFrame`, но никогда не перемещайте ничего по реальному времени: симулятор
   может работать медленнее или быстрее реального времени.
2. **Двигайте что-либо только пока `f.running` равно true**, и возвращайте всё в исходное
   состояние по `reset`.
3. **Записывайте показания датчика только при изменении его значения**, а датчика расстояния —
   не чаще чем каждые 30 мс модельного времени. Измеряйте по сцене: считывайте пол под
   датчиком линии, пускайте луч для датчика расстояния.
4. **Сопоставляйте drive мотора со скоростью колеса** с небольшой инерцией (запаздывание
   первого порядка около 80 мс) и небольшим мёртвым диапазоном. Дифференциальный робот
   поворачивает за счёт разницы между двумя сторонами.
5. **Один самодостаточный файл**, который подстраивается под размер окна и показывает
   важные показания в небольшом оверлее.

## Минимальный свободный World

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

[Следователь по линии на Romeo ESP32-S3](/docs/ru/worlds/example-romeo-line-follower/)
— это полноценный свободный World: сцена three.js с собственной моделью робота, тремя
датчиками линии на замкнутой трассе из ленты и URM09, который видит коробку, которую можно
поставить на трассу.
