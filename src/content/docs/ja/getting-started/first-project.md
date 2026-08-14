---
title: 最初のプロジェクト
description: 点滅（blink）サンプルを開いて、実行し、LEDの点滅を確認し、自分好みに変更するまでを5分で行います。
sidebar:
  order: 2
---

Velxioを理解する最も速い方法は、何かを実行してみることです。このチュートリアルでは、
定番の _blink_ サンプルを開き、実行し、シミュレートされたESP32が実際のLED回路を
駆動する様子を確認し、コードを変更するところまで行います。

![The blink example running](../../../../assets/docs/getting-started/blink.gif)

## 1. サンプルを開く

[velxio.dev/example/esp32-blink-led](https://velxio.dev/example/esp32-blink-led) にアクセスしてください
（または [サンプルギャラリー](/docs/ja/getting-started/examples-gallery/) で **ESP32 Blink** を見つけてください）。

![エディタに読み込まれたblinkサンプル](../../../../assets/docs/getting-started/first-project-loaded.png)

完全なプロジェクトが表示されます。左側には**コード**（2つのLEDを切り替えるArduinoスケッチ）、
中央には**回路**（抵抗を介して外部LEDに配線されたESP32 DevKit）があります。

## 2. Run（実行）を押す

ツールバーの緑色の **Run** ボタンをクリックします（または **Ctrl+B** を押して先にコンパイルします）。
Velxioはクラウド上の実際のArduino/ESP-IDFツールチェーンでスケッチをコンパイルします。
左下の**Output**コンソールに、Arduino IDEとまったく同じようにコンパイラの進行状況が表示されます。

セッションの最初のコンパイルには少し時間がかかることがありますが、その後はビルドがはるかに速くなります。

## 3. 実行を確認する

ビルドが完了すると、ファームウェアがエミュレートされたESP32上で起動します:

![blinkサンプル実行中: LED点灯、シリアル出力表示](../../../../assets/docs/getting-started/first-project-running.png)

同時に3つのことが起こります:

- **キャンバス上のLEDが点滅します** — シミュレーションが実際の抵抗を介して実際のコンポーネントを駆動します。
- **シリアルモニタ**にブートログが表示され、その後スケッチ内の `Serial.println()` から直接 `LED ON` / `LED OFF` が表示されます。
- 回路の上の黄色い**SPICEバッジ**は、アナログエンジンがLEDの電流経路を計算していることを示します。

## 4. 自分好みに変更する

スケッチを編集します。例えば、遅延を変更して点滅を速くします:

```cpp
delay(100);   // was 500
```

もう一度 **Run** を押します。これが基本ループです: 編集、実行、確認。

## 5. 保存する

ファイルツリーの上の**保存アイコン**をクリックするか（または **Ctrl+S**）、
プロジェクトに名前を付けると、アカウントに保存されます。
[プロジェクトの保存と開き方](/docs/ja/getting-started/projects/) を参照してください。

> **ヒント:** どこかで行き詰まりましたか？ 右側のAIアシスタントを開いて質問してください —
> 「なぜLEDが点滅しないのですか？」は、そのためのサンプルプロンプトの1つです。
> [AIアシスタント](/docs/ja/ai/overview/) を参照してください。

## 次のステップ

- [インターフェースツアー](/docs/ja/getting-started/interface-tour/) — すべてのパネルとボタンの説明。
- [回路エディタ](/docs/ja/circuit-editor/overview/) — サンプルから始める代わりに、ゼロから回路を構築します。
- [対応ボード](/docs/ja/boards/overview/) — ESP32をArduino UNO、Pi Pico、STM32などに交換します。

---
