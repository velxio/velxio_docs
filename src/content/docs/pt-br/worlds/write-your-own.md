---
title: Escreva seu próprio World
description: Deixe uma IA escrever um World a partir de um prompt que carrega todo o seu projeto, ou escreva o world.html você mesmo com a API window.velxio.
sidebar:
  order: 4
---

`world.html` é uma página HTML simples. Qualquer coisa que o [kit de cena](/docs/pt-br/worlds/scene-editor/)
não consegue desenhar (uma máquina, uma sala, um jogo, um robô personalizado) pode ser uma página sua,
escrita à mão ou por uma IA.

## Com uma IA

Pressione **Copy AI prompt**, na introdução 3D ou na barra do World. O
prompt é um briefing completo, montado a partir do seu projeto naquele momento:

- **Seu projeto, lido do canvas**: cada placa, cada componente (com
  configurações curtas como a cor de um LED), a fiação como nets (quais pinos estão
  conectados, inclusive através de protoboards), e os arquivos de firmware.
- **O que um World pode ler e escrever**, para os componentes que você tem e para cada
  componente que um World suporta, para que a IA possa dizer qual componente adicionar e como
  conectá-lo.
- **As regras**: onde a página roda, a API `window.velxio`, física em tempo
  simulado, e as duas formas de escrever um World (uma cena do kit ou uma página livre).
- **Como responder**: o `world.html` completo, o novo firmware se precisar
  mudar, e as mudanças de fiação pino a pino.

Cole no ChatGPT, Claude, Gemini ou qualquer outro chat, e escreva o que você
quer construir no final, em qualquer idioma. Por exemplo, com um ESP32 e
quatro servos no canvas: "um braço robótico que pega o cubo vermelho e o coloca
na caixa". Depois abra o World, mude para **HTML**, substitua tudo pela
resposta e pressione **Run**.

## Onde a página roda

- Um iframe em sandbox sem acesso à API do Velxio, à sua conta ou aos seus
  cookies. O `localStorage` pode estar indisponível.
- Scripts e estilos carregam apenas de `cdn.jsdelivr.net`, `cdnjs.cloudflare.com`,
  `unpkg.com` e `esm.sh`, além de código inline. O three.js vem de
  `https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js`.
- O `window.velxio` já existe quando seus scripts rodam. É o único elo
  com o circuito.

## A API velxio

```js
const info = await velxio.ready();
// { boards: [{ id, kind }],
//   parts: [{ id, type, board, outputs: [...], inputs: [{ key, kind, min, max, unit }] }],
//   theme: 'dark' | 'light' }

velxio.onFrame((f) => {            // cerca de 125 vezes por segundo
  // f.t        segundos simulados desde que a placa iniciou (null enquanto parado)
  // f.dt       segundos simulados desde o frame anterior
  // f.running  true enquanto o firmware roda
  // f.parts    { [id]: { drive, rpm } } para motores, { [id]: { angle } } para servos,
  //            { [id]: { on, brightness } } para LEDs
});

velxio.set(partId, values);        // escreve em um sensor: apenas as chaves listadas, valores limitados
velxio.press(partId);              // botões e chaves
velxio.release(partId);
velxio.on('reset', fn);            // o firmware reiniciou: volte o world ao seu início
velxio.on('theme', fn);            // o Velxio alternou entre escuro e claro
velxio.on('visibility', fn);       // pare de desenhar enquanto oculto, mantenha a física nos frames
velxio.telemetry({ ... });         // estado opcional para mostrar no Velxio
console.log(...);                  // vai para o log do World
```

## Regras para um World que se comporta bem

1. **Física em tempo simulado.** Some `f.dt` e avance com um passo fixo
   (2 ms funciona bem), limitando o acúmulo a 0,25 s. Desenhe com
   `requestAnimationFrame`, mas nunca mova nada por tempo real: o
   simulador pode rodar mais lento ou mais rápido que o tempo real.
2. **Mova apenas enquanto `f.running` for true**, e coloque tudo de volta ao seu
   início no `reset`.
3. **Escreva em um sensor apenas quando seu valor mudar**, e em um sensor de distância no
   máximo a cada 30 ms de tempo simulado. Meça a partir da cena: amostre o
   chão sob um sensor de linha, lance um raio para um sensor de distância.
4. **Mapeie o drive de um motor para a velocidade da roda** com um pouco de inércia (um
   atraso de primeira ordem de cerca de 80 ms) e uma pequena zona morta. Um robô diferencial
   gira pela diferença entre seus dois lados.
5. **Um arquivo autocontido** que se redimensiona com a janela e mostra as
   leituras que importam em uma pequena sobreposição.

## Um World livre mínimo

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

O [seguidor de linha Romeo ESP32-S3](/docs/pt-br/worlds/example-romeo-line-follower/)
é um World livre completo: uma cena three.js com seu próprio modelo de robô, três
sensores de linha em um circuito de fita, e um URM09 que vê uma caixa que você pode soltar na
pista.
