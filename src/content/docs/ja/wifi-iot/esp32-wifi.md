---
title: シミュレータでのESP32 WiFi
description: 内蔵のVelxio-GUESTネットワークに接続し、シミュレートされたESP32から実際のインターネットに到達します。
sidebar:
  order: 2
---

VelxioのESP32ボードには**動作するWiFi**が搭載されています。エミュレートされた無線は
**`Velxio-GUEST`** という名前のオープンアクセスポイントを認識し、関連付けを行い、
DHCP経由でIPアドレスを取得し、エミュレータのNATゲートウェイを通じてインターネットに到達します。
まったく同じスケッチが物理チップでも動作します。

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

シリアルモニタには、おなじみの `wifi:connected` ブートメッセージと
DHCPリースが表示されます。これは_実際の_WiFiスタックが動作しているためです。

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

## 到達可能なもの

接続後、標準のTCP/UDPソケット、HTTPクライアント、MQTTライブラリは
**インターネット上の実際のサーバー**に対して動作します。公開MQTTブローカー、REST
API、NTPなどです。完全なプロジェクトについては、[MQTTとHTTP](/docs/ja/wifi-iot/mqtt-http/)を参照してください。

## 対応ボード

WiFiはシミュレートされたESP32ファミリー全体で利用可能です。クラシックなESP32
ボード、ESP32-S3、ESP32-C3（およびそれらのXIAO/Nanoバリアント）が含まれます。
BLEを初期化するスケッチのために、Bluetoothアドバタイズ状態も報告されます。

----- END PAGE -----
