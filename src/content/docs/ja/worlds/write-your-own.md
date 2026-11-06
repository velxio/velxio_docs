---
title: 自分だけのWorldを書く
description: プロジェクト全体を伝えるプロンプトからAIにWorldを書かせるか、window.velxio APIを使ってworld.htmlを自分で書きます。
sidebar:
  order: 4
---

`world.html` はただのHTMLページです。[シーンキット](/docs/ja/worlds/scene-editor/)では描けないもの（機械、部屋、ゲーム、カスタムロボット）は、手書きでもAIでも、自分だけのページにできます。

## AIを使う

3DイントロダクションまたはWorldバーにある**Copy AI prompt**を押します。プロンプトは、その時点のあなたのプロジェクトから組み立てられた完全なブリーフです:

- **キャンバスから読み取ったあなたのプロジェクト**: すべてのボード、すべてのパーツ（LEDの色などの短い設定を含む）、ネットとしての配線（ブレッドボード経由も含め、どのピンが接続されているか）、そしてファームウェアのファイル。
- **Worldが読み書きできるもの**: あなたが持っているパーツと、Worldが対応するすべてのパーツについて。これによりAIは、どのパーツを追加すべきか、どう配線するかを判断できます。
- **ルール**: ページがどこで動くか、`window.velxio` API、シミュレーション時間に基づく物理、そしてWorldを書く2つの方法（キットシーンか自由なページか）。
- **回答の形式**: 完全な`world.html`、変更が必要なら新しいファームウェア、そしてピン単位の配線変更。

これをChatGPT、Claude、Gemini、その他のチャットに貼り付け、最後に作りたいものを任意の言語で書きます。たとえば、キャンバスにESP32と4つのサーボがある状態で:「赤いキューブをつかんで箱に入れるロボットアーム」。そしてWorldを開き、**HTML**に切り替え、すべてを回答で置き換えて**Run**を押します。

## ページが動く場所

- VelxioのAPI、あなたのアカウント、Cookieにアクセスできないサンドボックス化されたiframe。`localStorage`は存在しない場合があります。
- スクリプトとスタイルは`cdn.jsdelivr.net`、`cdnjs.cloudflare.com`、`unpkg.com`、`esm.sh`、およびインラインコードからのみ読み込まれます。three.jsは`https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js`から読み込まれます。
- スクリプトが実行される時点で`window.velxio`はすでに存在します。これが回路への唯一のリンクです。

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

## 正しく動くWorldのためのルール

1. **シミュレーション時間に基づく物理。** `f.dt`を合計し、固定ステップ（2 msが適しています）で進め、溜まった分は0.25 sでクランプします。描画は`requestAnimationFrame`で行いますが、実時間で何かを動かしてはいけません。シミュレータは実時間より遅くも速くも動くことがあります。
2. **`f.running`がtrueのときだけ動かし**、`reset`で最初の状態に戻します。
3. **センサーは値が変わったときだけ書き込み**、距離センサーはシミュレーション時間で最大30 msごとにします。シーンから測定します。ラインセンサーなら床をサンプリングし、距離センサーならレイを飛ばします。
4. **モーターのdriveを車輪速度にマッピング**するときは、少しの慣性（約80 msの一次遅れ）と小さなデッドバンドを加えます。差動ロボットは左右の差で旋回します。
5. **自己完結した1つのファイル**で、ウィンドウに合わせてリサイズし、重要な値を小さなオーバーレイに表示します。

## 最小限の自由なWorld

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

[Romeo ESP32-S3ライントレーサー](/docs/ja/worlds/example-romeo-line-follower/)は完全な自由なWorldです。独自のロボットモデルを持つthree.jsシーン、テープで描かれたループ上の3つのラインセンサー、そしてトラックに落とせる箱を見るURM09を備えています。
