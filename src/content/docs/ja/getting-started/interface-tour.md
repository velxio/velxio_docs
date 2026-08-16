---
title: インターフェースツアー
description: エディターの概要 — キャンバス、コードエディター、ツールバー、コンソール、AIパネル。
sidebar:
  order: 4
---

これはプロジェクトを実行中のVelxioエディターです：

![領域ごとに注釈が付けられたVelxioエディター](../../../../assets/docs/getting-started/first-project-running.png)

## メニューバー

![Velxioメニューバー：File、Edit、View、Account、Help](../../../../assets/docs/getting-started/interface-menu-bar.png)

**File · Edit · View · Account · Help** — プロジェクト操作、元に戻す/やり直し、
パネルの表示/非表示、アカウントとプラン、ヘルプリソース。

## ツールバー

![レイアウト切り替えからAddボタンまでのエディターツールバー](../../../../assets/docs/getting-started/interface-toolbar.png)

左から右へ：

| コントロール              | 機能                                                                                               |
| -------------------- | ---------------------------------------------------------------------------------------------------------- |
| レイアウト切り替え       | **Code**エディター、**Circuit**キャンバス、または**Both**（両方を並べて表示）を表示                                 |
| 言語セレクター    | **Arduino C++**、**MicroPython**、または**ESP-IDF** — ボードごとに指定。[言語](/docs/ja/programming/languages/)を参照 |
| **Compile**（Ctrl+B） | 実行せずにビルド                                                                                      |
| **Run**              | 必要に応じてコンパイルし、シミュレーションを開始                                                               |
| **Stop** / **Reset** | シミュレーションを停止 / ファームウェアを最初から再起動                                                    |
| **Libraries**        | Arduinoライブラリを検索してインストール                                                                       |
| 出力切り替え       | コンパイラ出力コンソールの表示/非表示                                                                      |
| ボードセレクター       | コードエディターとRunが適用されるボード（プロジェクトには複数のボードを設定できます）                                   |
| **Serial**           | [シリアルモニター](/docs/ja/programming/serial-monitor/)の切り替え                                             |
| **Scope**            | [オシロスコープ / ロジックアナライザー](/docs/ja/instruments/oscilloscope/)の切り替え                                |
| **Add**              | [コンポーネントピッカー](/docs/ja/circuit-editor/placing-components/)を開く                                      |

## ワークスペースパネル（左）

![プロジェクトファイルツリーが表示されたワークスペースパネル](../../../../assets/docs/getting-started/interface-workspace.png)

プロジェクトのファイルツリー：各ボードには独自のファイル（`sketch.ino`、
`libraries.json`、追加したファイル）があります。その上のアイコンで、
[スターターテンプレート](/docs/ja/getting-started/projects/)から新しい
ワークスペースを作成したり、プロジェクトファイルを開いたり、保存したりできます。

## キャンバス（中央）

![ESP32点滅回路、SPICEバッジ、ズームコントロールが表示されたキャンバス](../../../../assets/docs/getting-started/interface-canvas.png)

回路が配置される場所です。スクロールでパン、右下のズームコントロールを使用、
部品をクリックして選択、右クリックで
[インスペクター](/docs/ja/circuit-editor/part-inspector/)を開きます。黄色の**SPICE**
バッジは、選択した回路のアナログエンジンの状態を報告します。

## コンソール（下部）

![出力コンソールとシリアルモニターを並べて表示](../../../../assets/docs/programming/serial-monitor.png)

- **Output** — コンパイラおよびシステムメッセージ。
- **Serial monitor** — 実行中のボードごとに1つのタブ。データを送信するための
  入力ボックスもあります。[シリアルモニター](/docs/ja/programming/serial-monitor/)を参照。
- **Oscilloscope** — 切り替えで表示されます。
  [オシロスコープ](/docs/ja/instruments/oscilloscope/)を参照。

## AIパネル（右）

![Basic、Agent、Tutorタブとクレジットカウンターが表示されたAIパネル](../../../../assets/docs/getting-started/interface-ai-panel.png)

3つのモード — **Basic**、**Agent**、**Tutor** — を備えたアシスタント。
下部に残りの1日あたりのクォータが表示されます。
[AIアシスタント](/docs/ja/ai/overview/)を参照。キャンバス全体を表示したいときは、
矢印ボタンで最小化できます。
