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

const char* WIFI_SSID = "Velxio-GUEST";  // open AP, no password

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID);
  while (WiFi.status() != WL_CONNECTED) { delay(250); Serial.print("."); }
  Serial.printf("\nConnected! IP: %s\n", WiFi.localIP().toString().c_str());
}
```

串口监视器会显示熟悉的`wifi:connected`启动信息和DHCP租约——因为那_确实_是真实的WiFi协议栈在运行：

![串口监视器显示WiFi连接过程](../../../../assets/docs/wifi-iot/serial-wifi.png)

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

## 你自己的网络：自定义接入点

使用Maker计划，你不受限于内置的演示网络：在画布上添加一个**WiFi Access Point**（WiFi接入点）元件（在元件选择器中搜索“WiFi Access Point”），模拟无线电就会广播**你的SSID**。代码随后会连接到它实际指定的网络：

```cpp
WiFi.begin("HomeNet", "");   // the SSID on your Access Point part
```

![画布上ESP32旁边的WiFi接入点元件，在信道6上广播HomeNet](../../../../assets/docs/wifi-iot/access-point-part.png)

该元件没有引脚——它不是电气元件，而是无线电空间。只要项目中包含至少一个接入点元件，内置网络就会静默：扫描结果将完全符合画布上的定义。添加多个元件可以测试网络选择界面；每个元件都有自己的信道和信号强度，重复扫描时信号会有几dB的抖动，就像真实情况一样。

有两个属性值得了解：

- **Internet**（互联网）——关闭后网络将变为隔离状态：开发板可以连接并通过DHCP获取IP，但无法路由到外部。这就是配置/强制门户场景，现在可以在模拟器中测试了。
- **Password**（密码）——与元件一起存储并显示在其卡片上，但在WPA2模拟实现之前，网络仍然广播开放认证。传入密码的代码仍然可以连接。

上传的固件同样受益：在其他地方编译的二进制文件可以连接到它指定的任何网络，只要有一个接入点元件广播该SSID——无需重新编译。

运行时，扫描会精确找到你的网络，开发板会加入其中：

![串口监视器：扫描仅列出HomeNet，然后开发板连接并获取IP 10.13.37.42](../../../../assets/docs/wifi-iot/custom-ap-serial.png)

一键尝试：示例库中的**Connect to your own WiFi network**（连接到您自己的WiFi网络）打开时，画布上已经放置了该元件。

## WiFi面板

工具栏中的WiFi图标是一个拆分按钮。图标本身保持单击操作——有IP时通过IoT网关打开开发板的Web服务器。旁边的下拉箭头打开**WiFi面板**：

![WiFi面板：当前空中的网络及其信道和信号、开发板关联状态和IP、下载PCAP以及本地网关配对](../../../../assets/docs/wifi-iot/wifi-panel.png)

- 当前空中的网络（你的接入点或内置网络），已关联的网络带有勾选标记；
- 开发板的连接状态和IP；
- **Download PCAP**（下载PCAP）——将本次运行的802.11流量保存为捕获文件，Wireshark可直接打开（管理帧、DHCP、DNS、TCP，带有模拟时间戳）。不会上传任何内容；文件在浏览器中生成；
- [本地网络网关](/docs/zh-cn/wifi-iot/local-gateway/)配对。

## 你可以访问什么

连接后，标准TCP/UDP套接字、HTTP客户端和MQTT库可以访问**互联网上的真实服务器**——公共MQTT代理、REST API、NTP。完整的项目示例请参阅[MQTT和HTTP](/docs/zh-cn/wifi-iot/mqtt-http/)。

## 支持的开发板

WiFi在模拟的ESP32系列中均可用——经典ESP32开发板、ESP32-S3、ESP32-C3、ESP32-C6和ESP32-C5（及其XIAO / Nano / M5Stack变体）。对于初始化BLE的代码，也会报告蓝牙广播状态。
