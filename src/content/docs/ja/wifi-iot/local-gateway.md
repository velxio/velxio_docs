---
title: ローカルネットワークゲートウェイ
description: お使いのマシンでvelxiogwを実行すると、シミュレートされたボードが実際のネットワーク（LAN、localhost、その他すべて）に参加します。
sidebar:
  order: 3
---

デフォルトでは、シミュレートされたボードはVelxioのクラウドゲートウェイを通じてインターネットに到達しますが、ローカルネットワークには到達しません。**ローカルネットワークゲートウェイ**（`velxiogw`）はその制限を解除します。これはお使いのマシンで実行する小さなプログラムで、ボードのトラフィックはそこから外部に出ます。MQTTブローカー、Home Assistant、`localhost`で開発中のAPIなど、すべてスケッチから到達可能になります。Makerプランでペアリングが有効になります。

## セットアップ

1. [最新リリース](https://github.com/velxio/velxiogw/releases/latest)からお使いのプラットフォーム用のゲートウェイをダウンロードして実行します：

   ```
   $ ./velxiogw
   velxiogw 0.1.2 — Velxio IoT Network Gateway
     listening on   ws://127.0.0.1:9013
     pairing code   493028
     reach scope    your LAN + localhost + internet
     host alias     host.velxio.internal -> this machine
   ```

2. エディターで**WiFiパネル**（WiFiアイコンの横のキャレット）を開きます。パネルは実行中のゲートウェイを自動的に検出します。

3. ゲートウェイが表示した**ペアリングコード**を入力し、**Connect**をクリックします。次のRun以降、ボードはお使いのネットワーク上にあります。

初回は、Chromeがページからローカルネットワーク上のデバイスへの通信を許可するか確認します — **Allow**をクリックしてください。（Safariは現在これをサポートしていません。Chrome、Edge、Firefoxを使用してください。）

## お使いのマシンへの到達

スケッチ内では、ホスト名`host.velxio.internal`は常にゲートウェイが実行されているマシンに解決されます：

```cpp
#include <HTTPClient.h>

HTTPClient http;
http.begin("http://host.velxio.internal:8000/api/reading");
int status = http.GET();
```

LAN上の他のものには、通常のIPアドレスまたはmDNSなしのホスト名で、実際のボードがWiFi上で到達するのとまったく同じように到達できます。

## 注意事項

- ゲートウェイはループバックにのみバインドされ、ペアリングコードなしの接続を拒否するため、ネットワーク上の他のものや他のWebページからは使用できません。
- ローカルゲートウェイを通過するトラフィックはVelxioのサーバーには一切触れず、通常はラウンドトリップがなくなる分高速です。
- ソースは[github.com/velxio/velxiogw](https://github.com/velxio/velxiogw)で公開されています。バイナリは無料でダウンロードでき、エディターのペアリングフローはMakerプランの機能です。
- Velxio Desktopアプリではこれらはすべて不要です。シミュレーションはすでにお使いのマシン上で実行されるため、ボードは構造的にお使いのネットワーク上にあります。
