---
title: シミュレータでのESP32 WiFi
description: シミュレートされたESP32からネットワークに参加し、独自のSSIDをブロードキャストし、トラフィックをPCAPとしてキャプチャして、実際のLANに到達します。
sidebar:
  order: 2
---

VelxioのESP32ボードには、**動作するWiFi**が搭載されています。エミュレートされた無線は、スキャン、関連付け、DHCPによるIPアドレスの取得を行い、エミュレータのNATゲートウェイを介してインターネットに到達します。これは、エミュレートされた無線上で動作するベンダーSDKの実際のWiFiスタックであり、スタブではありません。同じスケッチが、変更されることなく、物理チップ上でも動作します。

このページでは、最初の接続から、独自のネットワーク、パケットキャプチャ、そして実際のLANまでを説明します。

## 最初の接続

1. ギャラリーの例 **Connect to WiFi** ([`/example/esp32-wifi-connect`](/example/esp32-wifi-connect)) を開くか、ESP32ボードをキャンバスにドロップして、以下のスケッチを貼り付けます。
2. **Run** を押します。セッションの最初のコンパイルは時間がかかります。以降はキャッシュされます。
3. キャンバスの下にあるツールバーから **Serial** モニタを開きます。
4. 参加の様子を確認します。SDK自身の起動時のチャッター、次にDHCPリースが表示されます。

```cpp
#include <WiFi.h>

const char* WIFI_SSID = "Velxio-GUEST";  // 内蔵、オープンネットワーク

void setup() {
  Serial.begin(115200);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID);

  Serial.print("Connecting");
  while (WiFi.status() != WL_CONNECTED) {
    delay(250);
    Serial.print(".");
  }

  Serial.printf("\nConnected. IP: %s\n", WiFi.localIP().toString().c_str());
  Serial.printf("Gateway:      %s\n", WiFi.gatewayIP().toString().c_str());
  Serial.printf("RSSI:         %d dBm\n", WiFi.RSSI());
}

void loop() {}
```

シリアルモニタには、参加の様子と、エミュレートされたDHCPサーバーが発行したアドレスが表示されます。

![シリアルモニタ: Espressif に接続中、その後 IP 10.13.37.42、MACアドレス、および信号強度とともに Connected と表示](../../../../assets/docs/wifi-iot/serial-wifi.png)

誰もが初めて驚くことが一つあります。それは、スケッチが `Velxio-GUEST` を指定しているにもかかわらず、ログに `Connecting to Espressif` と表示されることです。これはSSID書き換えが機能しているためであり、次のセクションで説明します。

IPはシミュレーション内で実際に有効です。ソケット、HTTPクライアント、MQTTライブラリは、この時点から動作します。完全なプロジェクトについては、[MQTTとHTTP](/docs/ja/wifi-iot/mqtt-http/) を参照してください。

## 内蔵ネットワーク

キャンバスにアクセスポイント部品がない場合、無線は4つのデモネットワークをビーコンとして送信します。ステーションは、そのうちの正確に1つに関連付けられます。

| SSID            | チャネル | 信号    | 認証      |
| --------------- | ------- | ------- | --------- |
| `Velxio-GUEST`  | 6       | -20 dBm | オープン  |
| `PICSimLabWifi` | 1       | -25 dBm | WPA2-PSK  |
| `Espressif`     | 5       | -30 dBm | WPA2-PSK  |
| `MasseyWifi`    | 10      | -40 dBm | WPA2-PSK  |

### スケッチ内のSSIDは重要ではありません

プロジェクトにアクセスポイント部品がない間は、記述したネットワーク名はボードが参加するものでは**ありません**。エミュレータへの途中で、コンパイラはすべてのSSIDリテラルを `Espressif` に書き換え、すべてのパスワードリテラルを空白にします。それが変数、配列、`#define`、構造体フィールドのいずれであっても同様です。

```cpp
const char* ssid = "MyHomeNetwork";   // "Espressif" としてコンパイルされる
#define WIFI_PASS "hunter2"           // "" としてコンパイルされる
```

そのため、チュートリアルからコピーしたスケッチが編集なしでここに接続できる理由、間違ったパスワードを渡しても失敗しない理由、そしてシリアルログに自分が入力していないネットワーク名が表示される理由はここにあります。それが起こっても、何も問題はありません。

知っておく価値のある2つの結果：

- **アクセスポイント部品を追加すると、書き換えがオフになります。** 以降、プロジェクトは独自の電波空間を定義するため、入力したものが存在するものとなり、SSIDは部品と一致する必要があります。
- **すでにビルドされたファームウェアは、書き換えを通過しません。** バイナリに焼き付けられたSSIDを探すため、それ以外は正常に動作する `.bin` が関連付けに失敗してそこにある可能性があります。上記の4つのネットワークのいずれかを指定して再ビルドするか、アクセスポイント部品でそれが期待するSSIDをブロードキャストしてください。

## MicroPython

```python
import network
import time

WIFI_SSID = "Velxio-GUEST"

sta = network.WLAN(network.STA_IF)
sta.active(True)
sta.connect(WIFI_SSID)

while not sta.isconnected():
    time.sleep(0.25)

print("Connected. ifconfig:", sta.ifconfig())
```

`sta.scan()` は、Arduino APIが認識するのと同じネットワークを、`(ssid, bssid, channel, rssi, authmode, hidden)` タプルとして返します。

## 独自のネットワーク

Makerプランでは、デモネットワークに限定されません。**WiFi Access Point** 部品を使用すると、エミュレートされた無線が**あなたの**SSIDをブロードキャストします。

1. キャンバスツールバーで **Add Component** をクリックします。
2. `WiFi Access Point` を検索して配置します。配線は不要です。ピンがなく、電波空間です。
3. 部品を選択し、**ssid** を希望のネットワーク（例：`HomeNet`）に設定します。
4. スケッチをその名前に向けて、**Run** を押します。

```cpp
WiFi.begin("HomeNet");   // Access Point 部品の SSID
```

![ESP32ボードの隣のキャンバスにあるWiFi Access Point部品。チャネル6でHomeNetをブロードキャストしている](../../../../assets/docs/wifi-iot/access-point-part.png)

**プロジェクトにアクセスポイント部品が1つでも含まれると、内蔵ネットワークは沈黙します。** その後、スキャンではキャンバスが定義するものだけが正確に表示されるため、ネットワーク選択コードをテスト可能にします。

### 部品プロパティ

| プロパティ   | デフォルト     | 機能                                                                           |
| ---------- | ----------- | -------------------------------------------------------------------------------------- |
| `ssid`     | `MyNetwork` | スケッチが接続するネットワーク名。                                                |
| `password` | 空          | カードに保存され、表示されます。WPA2が実装されるまで、ネットワークはオープン認証をブロードキャストするため、パスワードを渡すスケッチはとにかく接続します。 |
| `channel`  | `6`         | WiFiチャネル、1〜13。スキャンによって報告されます。                                                |
| `rssi`     | `-50`       | ボードから見た信号強度（dBm）、-90〜-20。繰り返しスキャンすると、実際のものと同様に数dBのジッターが発生します。 |
| `internet` | オン          | オフにするとネットワークは分離されます。ボードは関連付けられ、IPを取得しますが、外部へのルーティングは行われません。 |
| `bssid`    | 空          | APのMACアドレス。空の場合は、SSIDから生成された安定したものが使用されます。                        |

ワンクリックで試す：**Connect to your own WiFi network** ([`/example/esp32-custom-wifi-ap`](/example/esp32-custom-wifi-ap)) は、部品がすでに配置された状態で開きます。実行すると、スキャンして、正確にあなたのネットワークだけを見つけ、参加します。

![シリアルモニタ: スキャンはHomeNetのみをリストし、その後ボードが接続してIPを取得](../../../../assets/docs/wifi-iot/custom-ap-serial.png)

### 複数のネットワークを同時に

ピッカーや「最強優先」ポリシーをテストするには、ネットワークごとに1つの部品を追加します。それぞれが独自のチャネルと信号を持つため、スキャンは実際のものと同じように順序付けられて返されます。

```cpp
int n = WiFi.scanNetworks();
for (int i = 0; i < n; i++) {
  Serial.printf("%2d: %-16s ch %2d  %d dBm\n",
                i + 1, WiFi.SSID(i).c_str(), WiFi.channel(i), WiFi.RSSI(i));
}
```

**Scan several WiFi networks** ([`/example/esp32-wifi-scan-multi`](/example/esp32-wifi-scan-multi)) には、`HomeNet` (-40 dBm)、`Office_5G` (-62 dBm)、`CoffeeShop` (-78 dBm) の3つの部品が含まれています。

### キャプティブポータルとプロビジョニング

部品の **internet** をオフにすると、ネットワークは分離されます。ボードは関連付けられ、DHCPリースを取得しますが、トラフィックは外部に出ません。これはプロビジョニングシナリオです。デバイスが起動し、外部への経路がないことを確認し、独自の設定ページを提供します。

**Captive portal on an isolated network** ([`/example/esp32-wifi-captive-portal`](/example/esp32-wifi-captive-portal)) は、`SetupAP` という名前のAPでこれを設定します。

## WiFiパネル

**Run を押すと**、キャンバスツールバーにWiFiバッジが表示され、Stop で消えます。これは実行中のシミュレーションに属しているため、開始する前に開くものはありません。スタックの起動中はグレーで、ボードがアドレスを取得すると緑色になります。

バッジは分割ボタンです。アイコンはワンクリックアクションを維持します。IPを取得すると、IoTゲートウェイを介してボードのWebサーバーを開きます。その隣のキャレットは **WiFiパネル** を開きます。

![このプロジェクトの電波上のネットワーク、Download PCAP、およびローカルゲートウェイセクションを表示するWiFiパネル](../../../../assets/docs/wifi-iot/wifi-panel.png)

パネルには以下が表示されます：

- **電波上のネットワーク**。チャネルと信号付き。見出しは、アクセスポイント部品がそれらを定義する場合は *this project*、4つのデモネットワークが電波上にある場合は *built-in* と表示されます。

  ![4つの内蔵ネットワークとそのチャネルおよび信号強度を一覧表示するWiFiパネル](../../../../assets/docs/wifi-iot/wifi-panel-builtin.png)

- ボードの関連付け状態と、DHCP完了後のIP。
- **Download PCAP**。実行の802.11トラフィックをキャプチャファイルとして保存します。
- [ローカルネットワークゲートウェイ](/docs/ja/wifi-iot/local-gateway/) セクション。Makerプランではペアリングフィールドを保持し、無料プランではゲートウェイの機能を説明し、プランへのリンクを提供します。

### トラフィックをキャプチャしてWiresharkで開く

1. **Run** を押して、スケッチにネットワーク処理を実行させます。
2. WiFiパネルを開き、**Download PCAP** をクリックします。
3. ファイルをWiresharkで開きます。

キャプチャには、管理フレーム、DHCP、DNS、TCPがシミュレートされたタイムスタンプとともに含まれているため、`dhcp` や `dns` を表示フィルタとして使用すると、デバッグ中のハンドシェイクを分離できます。ファイルはブラウザ内で生成されます。アップロードされるものはありません。

## 自分のマシンに到達する

上記のネットワークはパブリックインターネットにルーティングされます。**あなたの**マシンで実行されているMQTTブローカー、Home Assistant、開発サーバーに到達するには、ローカルゲートウェイを実行します。[ローカルネットワークゲートウェイ](/docs/ja/wifi-iot/local-gateway/) を参照してください。スケッチはその後、`host.velxio.internal` としてあなたのマシンに到達できます。

## 既製の例

| 例                                                                      | 内容                                     |
| ---------------------------------------------------------------------------- | ------------------------------------------------- |
| [Connect to WiFi](/example/esp32-wifi-connect)                               | 内蔵ネットワークへの最小限の参加            |
| [Scan WiFi networks](/example/esp32-wifi-scan)                               | 内蔵セットに対する `scanNetworks()`         |
| [Connect to your own WiFi network](/example/esp32-custom-wifi-ap)            | 1つのアクセスポイント部品、スキャンと参加              |
| [Scan several WiFi networks](/example/esp32-wifi-scan-multi)                 | 異なるチャネルと信号を持つ3つのネットワーク |
| [Captive portal on an isolated network](/example/esp32-wifi-captive-portal)  | `internet` オフ、プロビジョニングフロー                 |
| [NTP clock over your WiFi](/example/esp32-wifi-ntp-clock)                    | 実際のタイムサーバーへのUDP送信                     |
| [Fetch JSON from a web API](/example/esp32-wifi-http-json)                   | 実際のREST APIに対するHTTPClient                |
| [Reach a service on your own network](/example/esp32-wifi-local-http)        | ローカルゲートウェイ経由の `host.velxio.internal`  |
| [MQTT](/example/esp32-wifi-mqtt)                                             | パブリックブローカーでのパブリッシュとサブスクライブ          |

## トラブルシューティング

| 症状                                            | 原因                                                                     | 修正                                                                        |
| -------------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| アップロードしたファームウェアが関連付けられない                  | SSIDが焼き付けられているため、コンパイラが書き換えられなかった                 | 内蔵ネットワークを指定するか、そのSSIDを持つアクセスポイント部品を追加する         |
| スキャンで自分のネットワークのみが返される                   | 意図したとおり: アクセスポイント部品が1つあると内蔵セットが無効になる       | デモネットワークを戻すには部品を削除する                              |
| 関連付けられ、IPを取得するが、外部へのルーティングがない   | 部品の **internet** がオフになっている                                       | キャプティブポータルをテストしている場合を除き、オンにする                         |
| パスワードが拒否されない                    | WPA2エミュレーションはまだ実装されておらず、ネットワークはオープン認証をブロードキャストする             | 現時点では想定内。パスワードは部品に保存されます                        |
| `host.velxio.internal` が解決されない             | ローカルゲートウェイがペアリングされていない                                                    | [ローカルネットワークゲートウェイ](/docs/ja/wifi-iot/local-gateway/) を参照                  |

## 対応ボード

WiFiは、シミュレートされたESP32ファミリ全体で利用できます。クラシックなESP32ボード、ESP32-S3、ESP32-C3、ESP32-C6、ESP32-C5に加え、それらのXIAO、Nano、M5Stackバリアントがあります。Raspberry Pi Pico Wには、独自の[CYW43エミュレーション](/docs/ja/boards/pico/)があります。BLEを初期化するスケッチのために、Bluetoothアドバタイズ状態も報告されます。
