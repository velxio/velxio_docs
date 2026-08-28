---
title: 模拟器中的ESP32 WiFi
description: 从模拟的ESP32加入网络，广播您自己的SSID，将流量捕获为PCAP文件，并连接到您的真实局域网。
sidebar:
  order: 2
---

Velxio中的ESP32开发板带有**可用的WiFi**。模拟的无线电会扫描、关联、通过DHCP获取IP地址，并通过模拟器的NAT网关访问互联网。这是来自供应商SDK的真实WiFi协议栈在模拟无线电上运行，而不是一个桩实现：相同的代码，无需修改，即可在物理芯片上运行。

本页内容涵盖从首次连接到您自己的网络、数据包捕获以及您的真实局域网。

## 首次连接

1. 打开图库示例 **Connect to WiFi** ([`/example/esp32-wifi-connect`](/example/esp32-wifi-connect))，或者将任意ESP32开发板拖放到画布上并粘贴下面的代码。
2. 按下 **Run**。会话的首次编译需要更长时间；后续编译会被缓存。
3. 从画布下方的工具栏打开 **Serial** 监视器。
4. 观察连接过程：SDK自身的启动信息，然后是DHCP租约。

```cpp
#include <WiFi.h>

const char* WIFI_SSID = "Velxio-GUEST";  // 内置，开放网络

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

串行监视器会显示连接过程以及模拟DHCP服务器分配的地址：

![串行监视器：正在连接到Espressif，然后显示已连接，IP为10.13.37.42，以及MAC地址和信号强度](../../../../assets/docs/wifi-iot/serial-wifi.png)

有一件事让每个人第一次都感到惊讶：日志显示 `Connecting to Espressif`，尽管代码中指定的是 `Velxio-GUEST`。这是SSID重写机制在起作用，下一节将对此进行解释。

该IP在模拟环境中是真实有效的：从此刻起，套接字、HTTP客户端和MQTT库都可以正常工作。有关完整项目，请参阅 [MQTT和HTTP](/docs/zh-cn/wifi-iot/mqtt-http/)。

## 内置网络

当画布上没有接入点部件时，无线电会广播四个演示网络。一个站点只会与其中一个网络关联：

| SSID            | 信道 | 信号    | 认证      |
| --------------- | ------- | ------- | --------- |
| `Velxio-GUEST`  | 6       | -20 dBm | 开放      |
| `PICSimLabWifi` | 1       | -25 dBm | WPA2-PSK  |
| `Espressif`     | 5       | -30 dBm | WPA2-PSK  |
| `MasseyWifi`    | 10      | -40 dBm | WPA2-PSK  |

### 代码中的SSID无关紧要

当项目没有接入点部件时，您编写的网络名称**不是**开发板实际加入的网络。在通往模拟器的过程中，编译器会将每个SSID字面量重写为 `Espressif`，并将每个密码字面量清空，无论它是变量、数组、`#define` 还是结构体字段：

```cpp
const char* ssid = "MyHomeNetwork";   // 编译为 "Espressif"
#define WIFI_PASS "hunter2"           // 编译为 ""
```

这就是为什么从任何教程复制的代码无需修改即可在此连接，为什么传递错误的密码永远不会失败，以及为什么串行日志会显示一个您没有输入的网络名称。发生这种情况时，一切正常。

有两个值得了解的后果：

- **添加接入点部件会关闭重写功能。** 从那时起，项目定义了自己的无线空间，因此您输入的内容就是实际存在的，并且SSID必须与某个部件匹配。
- **已经构建好的固件永远不会经过重写。** 它会寻找烧录在二进制文件中的SSID，这就是为什么一个本来可以工作的 `.bin` 文件可能会一直无法关联。要么重新构建它并指定上述四个网络之一，要么使用接入点部件广播它期望的SSID。

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

`sta.scan()` 返回与Arduino API看到的相同的网络，格式为 `(ssid, bssid, channel, rssi, authmode, hidden)` 元组。

## 您自己的网络

使用Maker计划，您不仅限于演示网络。一个 **WiFi Access Point** 部件可以使模拟无线电广播**您的**SSID。

1. 点击画布工具栏上的 **Add Component**。
2. 搜索 `WiFi Access Point` 并放置它。它不需要接线：它没有引脚，它属于无线空间。
3. 选择该部件并将 **ssid** 设置为您想要的网络，例如 `HomeNet`。
4. 将代码指向该名称并按下 **Run**。

```cpp
WiFi.begin("HomeNet");   // 您接入点部件上的SSID
```

![画布上ESP32开发板旁边的WiFi接入点部件，在信道6上广播HomeNet](../../../../assets/docs/wifi-iot/access-point-part.png)

**一旦项目包含一个接入点部件，内置网络就会静默。** 扫描将只看到画布上定义的内容，这使得网络选择代码可测试。

### 部件属性

| 属性       | 默认值       | 功能                                                                           |
| ---------- | ----------- | -------------------------------------------------------------------------------------- |
| `ssid`     | `MyNetwork` | 您的代码要连接的网络名称。                                                |
| `password` | 空       | 存储并显示在卡片上。在WPA2支持落地之前，网络仍以开放认证广播，因此传递密码的代码无论如何都能连接。 |
| `channel`  | `6`         | WiFi信道，1到13。扫描时会报告。                                                |
| `rssi`     | `-50`       | 开发板看到的信号强度（dBm），范围-90到-20。重复扫描会像真实情况一样有几dB的抖动。 |
| `internet` | 开          | 关闭会使网络隔离：开发板可以关联并获取IP，但没有任何流量可以路由出去。 |
| `bssid`    | 空       | AP MAC地址。为空表示根据SSID生成一个稳定的地址。                        |

一键尝试：**Connect to your own WiFi network** ([`/example/esp32-custom-wifi-ap`](/example/esp32-custom-wifi-ap)) 打开时部件已放置好。运行它会扫描，找到您的网络，并加入：

![串行监视器：扫描仅列出HomeNet，然后开发板连接并获取IP](../../../../assets/docs/wifi-iot/custom-ap-serial.png)

### 同时使用多个网络

为每个网络添加一个部件，以测试选择器或“信号最强优先”策略。每个部件都有自己的信道和信号，因此扫描结果会像真实情况一样排序：

```cpp
int n = WiFi.scanNetworks();
for (int i = 0; i < n; i++) {
  Serial.printf("%2d: %-16s ch %2d  %d dBm\n",
                i + 1, WiFi.SSID(i).c_str(), WiFi.channel(i), WiFi.RSSI(i));
}
```

**Scan several WiFi networks** ([`/example/esp32-wifi-scan-multi`](/example/esp32-wifi-scan-multi)) 附带三个部件：`HomeNet` 信号为-40 dBm，`Office_5G` 信号为-62 dBm，`CoffeeShop` 信号为-78 dBm。

### 强制门户和配置

关闭部件上的 **internet** 开关，网络将变为隔离状态。开发板可以关联并获取DHCP租约，但没有流量可以离开。这就是配置场景：设备启动，发现无法访问外部网络，并提供自己的配置页面。

**Captive portal on an isolated network** ([`/example/esp32-wifi-captive-portal`](/example/esp32-wifi-captive-portal)) 使用名为 `SetupAP` 的AP设置了此场景。

## WiFi面板

**当您按下 Run 时**，画布工具栏上会出现一个WiFi徽章，并在停止时消失：它属于正在运行的模拟，因此在启动模拟之前没有可打开的内容。当协议栈启动时它为灰色，一旦开发板获得地址，它就变为绿色。

该徽章是一个拆分按钮。图标保持其单击操作：当有IP时，它会通过IoT网关打开开发板的Web服务器。它旁边的插入符会打开 **WiFi面板**：

![WiFi面板显示此项目空中的网络、下载PCAP和本地网关部分](../../../../assets/docs/wifi-iot/wifi-panel.png)

该面板显示：

- **空中的网络**，包含信道和信号。当接入点部件定义了它们时，标题显示 *this project*；当四个演示网络在空中时，标题显示 *built-in*：

  ![WiFi面板列出四个内置网络及其信道和信号强度](../../../../assets/docs/wifi-iot/wifi-panel-builtin.png)

- 开发板的关联状态以及DHCP完成后的IP地址；
- **Download PCAP**，本次运行的802.11流量捕获文件；
- [本地网络网关](/docs/zh-cn/wifi-iot/local-gateway/) 部分。在Maker计划中，它包含配对字段；在免费计划中，它解释网关的功能并链接到计划。

### 捕获流量并在Wireshark中打开

1. 按下 **Run** 并让代码执行其网络操作。
2. 打开WiFi面板并点击 **Download PCAP**。
3. 在Wireshark中打开该文件。

捕获文件包含管理帧、DHCP、DNS和TCP，带有模拟时间戳，因此使用 `dhcp` 或 `dns` 作为显示过滤器可以隔离您正在调试的握手过程。该文件在您的浏览器中生成：不会上传任何内容。

## 连接到您自己的机器

上述网络可以路由到公共互联网。要连接到运行在**您**机器上的MQTT代理、Home Assistant或开发服务器，请运行本地网关：请参阅 [本地网络网关](/docs/zh-cn/wifi-iot/local-gateway/)。然后，代码可以通过 `host.velxio.internal` 访问您的机器。

## 现成示例

| 示例                                                                      | 展示内容                                     |
| ---------------------------------------------------------------------------- | ------------------------------------------------- |
| [Connect to WiFi](/example/esp32-wifi-connect)                               | 连接到内置网络的最小示例            |
| [Scan WiFi networks](/example/esp32-wifi-scan)                               | 针对内置网络集使用 `scanNetworks()`         |
| [Connect to your own WiFi network](/example/esp32-custom-wifi-ap)            | 一个接入点部件，扫描并连接              |
| [Scan several WiFi networks](/example/esp32-wifi-scan-multi)                 | 三个具有不同信道和信号的网络 |
| [Captive portal on an isolated network](/example/esp32-wifi-captive-portal)  | `internet` 关闭，配置流程                 |
| [NTP clock over your WiFi](/example/esp32-wifi-ntp-clock)                    | 通过UDP连接到真实时间服务器                     |
| [Fetch JSON from a web API](/example/esp32-wifi-http-json)                   | 针对真实REST API使用HTTPClient                |
| [Reach a service on your own network](/example/esp32-wifi-local-http)        | 通过本地网关使用 `host.velxio.internal`  |
| [MQTT](/example/esp32-wifi-mqtt)                                             | 在公共代理上发布和订阅          |

## 故障排除

| 症状                                            | 原因                                                                     | 修复                                                                        |
| -------------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 上传的固件从不关联                  | 其SSID是烧录的，因此编译器无法重写它                 | 指定一个内置网络，或添加一个具有该SSID的接入点部件         |
| 扫描只返回您的网络                   | 符合预期：一个接入点部件会使内置网络集静默       | 移除部件以恢复演示网络                              |
| 关联并获取IP，但没有流量路由出去   | 部件上的 **internet** 已关闭                                       | 打开它，除非您正在测试强制门户                         |
| 密码未被拒绝                    | WPA2模拟尚未实现，网络以开放认证广播             | 目前符合预期；密码存储在部件上                        |
| `host.velxio.internal` 无法解析             | 没有配对的本地网关                                                    | 请参阅 [本地网络网关](/docs/zh-cn/wifi-iot/local-gateway/)                  |

## 支持的开发板

WiFi在模拟的ESP32系列中均可用：经典ESP32开发板、ESP32-S3、ESP32-C3、ESP32-C6和ESP32-C5，以及它们的XIAO、Nano和M5Stack变体。Raspberry Pi Pico W有其自己的 [CYW43模拟](/docs/zh-cn/boards/pico/)。对于初始化BLE的代码，也会报告蓝牙广播状态。
