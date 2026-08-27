---
title: シミュレータでのESP32 WiFi
description: 内蔵のVelxio-GUESTネットワークに接続し、シミュレートされたESP32から実際のインターネットに到達します。
sidebar:
  order: 2
---

VelxioのESP32ボードには**動作するWiFi**が搭載されています。エミュレートされた無線は、**`Velxio-GUEST`** という名前のオープンアクセスポイントを認識し、DHCP経由でIPアドレスを取得し、エミュレータのNATゲートウェイを通じてインターネットに到達します。まったく同じスケッチが物理チップ上でも動作します。

## Arduino

```cpp
#include <WiFi.h>

const char* WIFI_SSID = "Velxio-GUEST";  // open AP, no password

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID);
  while (WiFi.status() != WL_CONNECTED) { delay(250); Serial.print("."); }
  Serial.printf("\nConnected! IP: %s\n", WiFi.localIP().toString().c_str());
}
```

シリアルモニタには、おなじみの `wifi:connected` 起動時のメッセージとDHCPリースが表示されます。これは、実際のWiFiスタックが動作しているからです。

![WiFi接続中のシリアルモニタ](../../../../assets/docs/wifi-iot/serial-wifi.png)

## MicroPython

```python
import network

WIFI_SSID = "Velxio-GUEST"

sta = network.WLAN(network.STA_IF)
sta.active(True)
sta.connect(WIFI_SSID)
while not sta.isconnected():
    pass
print("Connected, IP:", sta.ifconfig()[0])
```

## 独自のネットワーク：カスタムアクセスポイント

Makerプランでは、内蔵のデモネットワークに限定されません。キャンバスに**WiFi Access Point**パーツを追加すると（パーツピッカーで「WiFi Access Point」を検索）、エミュレートされた無線は代わりに**あなたのSSID**をブロードキャストします。スケッチは、実際に名前を指定したネットワークに接続します。

```cpp
WiFi.begin("HomeNet", "");   // the SSID on your Access Point part
```

このパーツにはピンがありません。電気部品ではなく、空間です。プロジェクトにアクセスポイントパーツが1つでも含まれると、内蔵ネットワークは沈黙します。スキャンでは、キャンバスで定義されたものだけが表示されます。ネットワーク選択UIを試すために複数のパーツを追加できます。各パーツには独自のチャネルと信号強度があり、繰り返しスキャンすると実際のものと同様に数dBのジッターが発生します。

知っておく価値のある2つのプロパティがあります。

- **Internet** — これをオフにすると、ネットワークは分離されます。ボードは関連付けられ、DHCPでIPを取得しますが、外部へのルーティングは行われません。これはプロビジョニング/キャプティブポータルのシナリオであり、シミュレータでテストできるようになりました。
- **Password** — パーツに保存され、そのカードに表示されますが、WPA2エミュレーションが実装されるまで、ネットワークはオープン認証をブロードキャストし続けます。パスワードを渡すスケッチは、とにかく接続します。

アップロードされたファームウェアも恩恵を受けます。他の場所でビルドされたバイナリは、アクセスポイントパーツがそのSSIDをブロードキャストしている限り、名前を指定したネットワークに接続します。再ビルドは不要です。

ワンクリックでお試しください。ギャラリーの例 **Connect to your own WiFi network** は、パーツがすでにキャンバス上にある状態で開きます。

## WiFiパネル

ツールバーのWiFiアイコンは分割ボタンです。アイコン自体はワンクリックアクションを維持します。IPがある場合は、IoTゲートウェイを介してボードのWebサーバーを開きます。その隣の小さなキャレットは、**WiFiパネル**を開きます。

- 現在電波に乗っているネットワーク（あなたのアクセスポイント、または内蔵セット）と、関連付けられたネットワークのチェックマーク。
- ボードの接続状態とIP。
- **Download PCAP** — 実行の802.11トラフィックをキャプチャファイルとして保存します。Wiresharkで直接開けます（管理フレーム、DHCP、DNS、TCP、シミュレートされたタイムスタンプ付き）。何もアップロードされません。ファイルはブラウザ内で生成されます。
- [ローカルネットワークゲートウェイ](/docs/ja/wifi-iot/local-gateway/)のペアリング。

## 到達可能なもの

接続すると、標準のTCP/UDPソケット、HTTPクライアント、MQTTライブラリが**インターネット上の実際のサーバー**に対して機能します。パブリックMQTTブローカー、REST API、NTPなどです。完全なプロジェクトについては、[MQTTとHTTP](/docs/ja/wifi-iot/mqtt-http/)を参照してください。

## 対応ボード

WiFiは、シミュレートされたESP32ファミリ全体で利用できます。クラシックなESP32ボード、ESP32-S3、ESP32-C3、ESP32-C6、ESP32-C5（およびそれらのXIAO / Nano / M5Stackバリアント）です。BLEを初期化するスケッチのために、Bluetoothアドバタイズ状態も報告されます。

----- END PAGE -----
