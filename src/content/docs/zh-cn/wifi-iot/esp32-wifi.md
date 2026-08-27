---
title: 模拟器中的ESP32 WiFi
description: 加入内置的Velxio-GUEST网络，从模拟的ESP32访问真实互联网。
sidebar:
  order: 2
---

Velxio中的ESP32开发板自带**可用的WiFi**：模拟无线电能够看到一个名为**`Velxio-GUEST`**的开放接入点，连接后通过DHCP获取IP地址，并通过模拟器的NAT网关访问互联网。完全相同的代码在实体芯片上也能运行。

## Arduino

```cpp
#include <WiFi.h>

const char* WIFI_SSID = "Velxio-GUEST";  // 开放接入点，无密码

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID);
  while (WiFi.status() != WL_CONNECTED) { delay(250); Serial.print("."); }
  Serial.printf("\nConnected! IP: %s\n", WiFi.localIP().toString().c_str());
}
```

串口监视器会显示熟悉的`wifi:connected`启动信息和DHCP租约——因为运行的就是真实的WiFi协议栈：

![WiFi连接期间的串口监视器](../../../../assets/docs/wifi-iot/serial-wifi.png)

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

## 自定义网络：自定义接入点

使用Maker计划时，您不仅限于内置的演示网络：在画布上添加一个**WiFi接入点**部件（在部件选择器中搜索“WiFi Access Point”），模拟无线电就会广播**您的SSID**。代码随后连接到它实际指定的网络：

```cpp
WiFi.begin("HomeNet", "");   // 您的接入点部件上的SSID
```

该部件没有引脚——它不是电气元件，而是无线空间。只要项目中包含至少一个接入点部件，内置网络就会静默：扫描结果将完全符合画布上的定义。添加多个部件可以测试网络选择界面；每个部件都有自己的信道和信号强度，重复扫描时信号强度会像真实情况一样有几dB的抖动。

有两个属性值得了解：

- **Internet**（互联网）——关闭后网络将变为隔离状态：开发板仍能连接并通过DHCP获取IP，但无法路由到外部。这就是配置/强制门户场景，现在可以在模拟器中测试了。
- **Password**（密码）——与部件一起存储并显示在其卡片上，但在WPA2模拟实现之前，网络仍以开放认证方式广播。传入密码的代码仍然可以连接。

上传的固件同样受益：在其他地方编译的二进制文件可以连接到它指定的任何网络，只要有一个接入点部件广播该SSID——无需重新编译。

一键尝试：画廊示例**连接到您自己的WiFi网络**打开时，画布上已经放置了该部件。

## WiFi面板

工具栏中的WiFi图标是一个分体按钮。图标本身保持单击操作——有IP时通过IoT网关打开开发板的Web服务器。旁边的小箭头打开**WiFi面板**：

- 当前在线的网络（您的接入点或内置网络），已连接的网络会打勾；
- 开发板的连接状态和IP；
- **Download PCAP**（下载PCAP）——本次运行的802.11流量捕获文件，Wireshark可直接打开（管理帧、DHCP、DNS、TCP，带模拟时间戳）。不会上传任何内容；文件在您的浏览器中生成；
- [本地网络网关](/docs/zh-cn/wifi-iot/local-gateway/)配对。

## 可以访问的内容

连接后，标准TCP/UDP套接字、HTTP客户端和MQTT库都可以与**互联网上的真实服务器**通信——公共MQTT代理、REST API、NTP。完整的项目示例请参阅[MQTT和HTTP](/docs/zh-cn/wifi-iot/mqtt-http/)。

## 支持的开发板

WiFi在模拟的ESP32系列中均可用——经典ESP32开发板、ESP32-S3、ESP32-C3、ESP32-C6和ESP32-C5（及其XIAO / Nano / M5Stack变体）。初始化BLE的代码也会报告蓝牙广播状态。

----- 页面结束 -----
