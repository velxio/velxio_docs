---
title: 编写你自己的 World
description: 让 AI 根据携带你整个项目的提示词编写一个 World，或者使用 window.velxio API 自己编写 world.html。
sidebar:
  order: 4
---

`world.html` 是一个普通的 HTML 页面。[场景套件](/docs/zh-cn/worlds/scene-editor/)无法绘制的任何内容（一台机器、一个房间、一个游戏、一个自定义机器人）都可以是你自己编写的页面，可以手写，也可以由 AI 编写。

## 使用 AI

在 3D 介绍中或 World 栏中按下 **Copy AI prompt**（复制 AI 提示词）。该提示词是一份完整的简报，根据你当时的项目构建：

- **你的项目，从画布读取**：每块板、每个部件（带有简短设置，例如 LED 的颜色）、作为网络的接线（哪些引脚相连，也包括通过面包板相连），以及固件文件。
- **World 可以读写什么**，针对你拥有的部件以及 World 支持的每个部件，这样 AI 就能告诉你该添加哪个部件以及如何接线。
- **规则**：页面在哪里运行、`window.velxio` API、基于模拟时间的物理，以及编写 World 的两种方式（套件场景或自由页面）。
- **如何回答**：完整的 `world.html`、需要更改时的新固件，以及逐引脚的接线更改。

将其粘贴到 ChatGPT、Claude、Gemini 或任何其他聊天工具中，并在末尾用任何语言写下你想构建的内容。例如，画布上有一个 ESP32 和四个舵机：“一个拿起红色方块并将其放入盒子中的机械臂”。然后打开 World，切换到 **HTML**，用答案替换所有内容并按下 **Run**（运行）。

## 页面在哪里运行

- 一个沙盒化的 iframe，无法访问 Velxio 的 API、你的账户或你的 cookie。`localStorage` 可能不可用。
- 脚本和样式仅从 `cdn.jsdelivr.net`、`cdnjs.cloudflare.com`、`unpkg.com` 和 `esm.sh` 加载，外加内联代码。three.js 来自 `https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js`。
- 当你的脚本运行时，`window.velxio` 已经存在。它是与电路之间的唯一链接。

## velxio API

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

## 行为良好的 World 的规则

1. **基于模拟时间的物理。** 累加 `f.dt` 并以固定步长推进（2 ms 效果不错），将积压限制在 0.25 s。使用 `requestAnimationFrame` 绘制，但绝不要按墙钟时间移动任何东西：模拟器可能比实时运行得更慢或更快。
2. **仅在 `f.running` 为 true 时移动**，并在 `reset` 时将所有内容恢复到起始状态。
3. **仅在传感器的值发生变化时写入**，距离传感器最多每 30 ms 模拟时间写入一次。从场景中测量：在线传感器下方采样地面，为距离传感器投射射线。
4. **将电机的驱动映射到轮速**，带一点惯性（约 80 ms 的一阶滞后）和一个小死区。差速机器人通过两侧之差来转向。
5. **一个自包含文件**，随窗口调整大小，并在一个小覆盖层中显示重要的读数。

## 一个最小的自由 World

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

[Romeo ESP32-S3 循线机器人](/docs/zh-cn/worlds/example-romeo-line-follower/)是一个完整的自由 World：一个带有自己机器人模型的 three.js 场景、一个贴有胶带的环形轨道上的三个线传感器，以及一个能看到你可以放在轨道上的盒子的 URM09。
