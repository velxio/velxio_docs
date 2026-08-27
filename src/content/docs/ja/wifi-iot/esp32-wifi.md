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

シリアルモニタには、おなじみの `wifi:connected` ブートメッセージとDHCPリースが表示されます。これは、_実際の_ WiFiスタックが動作しているためです。

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

## 独自のネットワーク: カスタムアクセスポイント

Makerプランでは、内蔵のデモネットワークに限定されません。キャンバスに**WiFi Access Point**パーツを追加すると(パーツピッカーで「WiFi Access Point」を検索)、エミュレートされた無線は代わりに**あなたのSSID**をブロードキャストします。スケッチは、実際に名前を付けたネットワークに接続します:

```cpp
WiFi.begin("HomeNet", "");   // the SSID on your Access Point part
```

![ESP32の隣のキャンバス上にあるWiFi Access Pointパーツ。チャンネル6でHomeNetをブロードキャストしている](../../../../assets/docs/wifi-iot/access-point-part.png)

このパーツにはピンがありません。電気部品ではなく、空間です。プロジェクトにアクセスポイントパーツが少なくとも1つ含まれると、内蔵ネットワークは沈黙します。スキャンでは、キャンバスで定義されたものだけが表示されます。ネットワーク選択UIを試すために複数のパーツを追加できます。各パーツには独自のチャンネルと信号強度があり、繰り返しスキャンすると、実際のものと同様に数dBのジッターが発生します。

知っておく価値のある2つのプロパティがあります:

- **Internet** — これをオフにすると、ネットワークは分離されます。ボードは関連付けられ、DHCP経由でIPを取得しますが、外部へのルーティングは行われません。これはプロビジョニング/キャプティブポータルのシナリオであり、シミュレータでテストできるようになりました。
- **Password** — パーツに保存され、そのカードに表示されますが、WPA2エミュレーションが実装されるまで、ネットワークは引き続きオープン認証をブロードキャストします。パスワードを渡すスケッチは、とにかく接続します。

アップロードされたファームウェアも恩恵を受けます。別の場所でビルドされたバイナリは、アクセスポイントパーツがそのSSIDをブロードキャストしている限り、名前を付けたネットワークに接続します。再ビルドは不要です。

実行すると、スキャンは正確にあなたのネットワークを見つけ、ボードはそれに参加します:

![シリアルモニタ: スキャンはHomeNetのみをリストし、その後ボードが接続してIP 10.13.37.42を取得します](../../../../assets/docs/wifi-iot/custom-ap-serial.png)

ワンクリックでお試しください: ギャラリーの例 **Connect to your own WiFi network** は、パーツがすでにキャンバス上にある状態で開きます。

## WiFiパネル

ツールバーのWiFiアイコンは分割ボタンです。アイコン自体はワンクリックアクションを維持します。IPがある場合は、IoTゲートウェイを介してボードのWebサーバーを開きます。その隣の小さなキャレットをクリックすると、**WiFiパネル**が開きます:

![WiFiパネル: チャンネルと信号を備えた電波上のネットワーク、ボードの関連付けとIP、Download PCAP、およびローカルゲートウェイのペアリング](../../../../assets/docs/wifi-iot/wifi-panel.png)

- 現在電波上にあるネットワーク(アクセスポイントまたは内蔵セット)。関連付けられたものにはチェックマークが付きます。
- ボードの接続状態とIP。
- **Download PCAP** — 実行の802.11トラフィックをキャプチャファイルとして保存します。Wiresharkで直接開けます(管理フレーム、DHCP、DNS、TCP、シミュレートされたタイムスタンプ付き)。何もアップロードされません。ファイルはブラウザ内で生成されます。
- [ローカルネットワークゲートウェイ](/docs/ja/wifi-iot/local-gateway/)のペアリング。

## 到達できるもの

接続されると、標準のTCP/UDPソケット、HTTPクライアント、MQTTライブラリが、**インターネット上の実際のサーバー**に対して機能します。パブリックMQTTブローカー、REST API、NTPなどです。完全なプロジェクトについては、[MQTT and HTTP](/docs/ja/wifi-iot/mqtt-http/)を参照してください。

## 対応ボード

WiFiは、シミュレートされたESP32ファミリ全体で利用できます。クラシックなESP32ボード、ESP32-S3、ESP32-C3、ESP32-C6、ESP32-C5(およびそれらのXIAO / Nano / M5Stackバリアント)です。BLEを初期化するスケッチのために、Bluetoothアドバタイズ状態も報告されます。

----- END PAGE -----
