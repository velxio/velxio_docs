---
title: 模拟器中的ESP32 WiFi
description: 加入内置的Velxio-GUEST网络，从模拟的ESP32访问真实互联网。
sidebar:
  order: 2
---

Velxio中的ESP32开发板配备**可用的WiFi**：模拟无线电能够看到一个名为**`Velxio-GUEST`**的开放接入点，连接后通过DHCP获取IP地址，并通过模拟器的NAT网关访问互联网。完全相同的代码在实体芯片上也能运行。

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

串口监视器会显示熟悉的`wifi:connected`启动信息和DHCP租约——因为运行的就是真实的WiFi协议栈。

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

## 可以访问的内容

连接后，标准的TCP/UDP套接字、HTTP客户端和MQTT库都可以与**互联网上的真实服务器**通信——包括公共MQTT代理、REST API、NTP。完整的项目示例请参阅[MQTT和HTTP](/docs/zh-cn/wifi-iot/mqtt-http/)。

## 支持的开发板

WiFi功能适用于整个模拟ESP32系列——经典ESP32开发板、ESP32-S3和ESP32-C3（及其XIAO/Nano变体）。对于初始化BLE的代码，也会报告蓝牙广播状态。
