---
title: FAQ
description: Velxioに関するよくある質問。
sidebar:
  order: 8
---

### 何かをインストールする必要はありますか？

いいえ。Velxioは完全にブラウザ上で動作します。エディタ、コンパイラ（クラウド上）、そしてシミュレーションもすべてです。デスクトップの最新のChrome、Edge、またはFirefoxが最適な体験を提供します。

### 本当に自分のコードが実行されているのですか？

はい。あなたのスケッチは、実際のボードが使用するものと同じツールチェーン（arduino-cli、ESP-IDF、MicroPython）でコンパイルされ、その結果生成された**実際のバイナリ**がエミュレートされたCPUによって実行されます。ソースコードの行ごとの解釈ではありません。ブートログ、タイミングの癖、レジスタの動作など、表示されるものはシリコンが行うであろう動作そのものです。

### Velxioは無料ですか？

コアシミュレータは無料で、オープンボードカタログとサンプルギャラリーも含まれます。Proボード、AIアシスタント、プライベートプロジェクトは有料プランが必要です。[プラン](/docs/ja/getting-started/plans/)をご覧ください。

### Wokwiプロジェクトをインポートできますか？

はい。**open project**（プロジェクトを開く）ボタンは、Velxio独自の`.vlx`ファイルに加えて、Wokwiの`.zip`アーカイブも受け付けます。[プロジェクトの保存と開き方](/docs/ja/getting-started/projects/)をご覧ください。

### 対応しているボードはどれですか？

Arduino UNO/Nano/Mega、ESP32ファミリー（classic、S3、C3）、Raspberry Pi PicoおよびPico W、STM32、フルLinux Raspberry Pi、ATtiny85などです。詳細な完全なリストは[ボード](/docs/ja/boards/overview/)にあります。

### シミュレータでWiFiは動作しますか？

ESP32ボードの場合、はい。シミュレートされたステーションは関連付けを行い、DHCPでIPを取得し、MQTT/HTTPプロジェクト用にインターネットゲートウェイに到達できます。[WiFi & IoT](/docs/ja/wifi-iot/overview/)をご覧ください。

### プロジェクトを実際のハードウェアに移行できますか？

はい。ESP32プロジェクトの場合、**web flash**（ウェブフラッシュ）を使用すると、ブラウザから直接、コンパイルされたファームウェアをUSB経由で実際のボードに書き込むことができます。[Web flash](/docs/ja/wifi-iot/overview/)をご覧ください。

### バグを報告したり、機能をリクエストするにはどうすればよいですか？

エディタの**Help**（ヘルプ）メニュー、Velxioの[Discordコミュニティ](https://velxio.dev)、またはGitHub組織を通じて、お好みの方法でご連絡ください。
