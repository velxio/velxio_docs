---
title: "教程：气象站"
description: 一个真实的多传感器项目——通过I2C连接BMP280，通过GPIO连接DHT22，通过SPI连接ILI9341 TFT，全部在一个ESP32上实时运行。
draft: true
sidebar:
  order: 3
---

[第一个项目](/docs/zh-cn/getting-started/first-project/)让一个LED闪烁。
这个项目是一个真实的设备：一个ESP32读取**通过I²C连接的温度和压力**（BMP280），**通过GPIO连接的湿度**（DHT22），并在**通过SPI连接的TFT显示屏**（ILI9341）上绘制所有数据——三个总线同时工作，在浏览器中运行。

![气象站运行中：传感器实时馈送数据到TFT](../../../../assets/docs/getting-started/weather-station.gif)

## 1. 打开项目

打开公共项目：
[velxio.dev/dave/estacin-meteorolgica-esp32](https://velxio.dev/dave/estacin-meteorolgica-esp32)。

![气象站打开时的样子](../../../../assets/docs/getting-started/weather-loaded.png)

在运行之前，花点时间阅读电路：

- **BMP280** — `SDA`/`SCL`连接到ESP32的I²C引脚。两根线，两个测量值（温度+压力）。
- **DHT22** — 一个带有上拉电阻的数据GPIO。湿度和第二个温度读数。
- **ILI9341** — SPI总线：`MOSI`、`SCK`、`CS`、`DC`、`RST`。右键点击任何部件查看[其引脚定义和数据手册](/docs/zh-cn/circuit-editor/part-inspector/)。

这个项目是由[Velxio的AI代理](/docs/zh-cn/ai/agent-mode/)端到端设计、布线和编程的——你可以通过请求来构建同样的东西。

## 2. 运行它

按下**Run**。草图使用真实的Arduino工具链编译（观察**Output**控制台解析Adafruit库），ESP32启动，然后：

![气象站运行中，TFT实时显示](../../../../assets/docs/getting-started/weather-running.png)

- **TFT**绘制仪表盘并实时刷新读数。
- **串行监视器**记录每次传感器扫描：

![气象站的串行输出](../../../../assets/docs/getting-started/weather-serial.png)

## 3. 改变天气

在模拟运行时点击**BMP280**或**DHT22**——它们的传感器控制面板允许你拖动温度、湿度和压力。固件在下一次I²C/GPIO轮询时读取新值，TFT随之更新。这个循环——调整输入，观察设备反应——正是先模拟的意义所在。

## 4. 让它成为你的

像对待任何项目一样：在草图中更改显示布局，添加一个阈值，当湿度超过70%时点亮LED，或者从[目录](/docs/zh-cn/parts/overview/)中将DHT22换成另一个传感器。然后[保存你的副本](/docs/zh-cn/getting-started/projects/)。

## 改为从头构建

如果你更愿意自己布线：从一个空白的ESP32[模板](/docs/zh-cn/getting-started/projects/)开始，从[选择器](/docs/zh-cn/circuit-editor/placing-components/)中添加三个部件，按上述方式连接总线，并添加**Adafruit BMP280**、**DHT传感器库**和**Adafruit ILI9341**库（[方法](/docs/zh-cn/programming/libraries/)）。或者打开[AI助手](/docs/zh-cn/ai/agent-mode/)让它和你一起构建气象站——这个项目就是这样诞生的。
