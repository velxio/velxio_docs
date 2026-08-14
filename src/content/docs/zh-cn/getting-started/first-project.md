---
title: 您的第一个项目
description: 打开闪烁示例，运行它，观察LED闪烁，并让它成为您自己的项目——只需五分钟。
sidebar:
  order: 2
---

理解Velxio最快的方式就是运行一些东西。在本教程中，您将打开经典的_闪烁_示例，运行它，观察模拟的ESP32驱动真实的LED电路，然后修改代码。

![The blink example running](../../../../assets/docs/getting-started/blink.gif)

## 1. 打开示例

前往 [velxio.dev/example/esp32-blink-led](https://velxio.dev/example/esp32-blink-led)
（或在 [示例画廊](/docs/zh-cn/getting-started/examples-gallery/) 中找到 **ESP32 Blink**）。

![编辑器中的闪烁示例](../../../../assets/docs/getting-started/first-project-loaded.png)

您会得到一个完整的项目：左侧是**代码**（一个切换两个LED的Arduino草图），中间是**电路**——一个通过电阻连接到外部LED的ESP32 DevKit。

## 2. 按下 Run

点击工具栏中的绿色 **Run** 按钮（或按 **Ctrl+B** 先编译）。Velxio会在云端使用真实的Arduino/ESP-IDF工具链编译您的草图——左下角的**输出**控制台会实时显示编译器的进度，就像Arduino IDE一样。

会话的首次编译可能需要一些时间；之后，构建会快得多。

## 3. 观察运行

当构建完成时，固件会在模拟的ESP32上启动：

![闪烁示例运行中：LED亮起，串行输出流动](../../../../assets/docs/getting-started/first-project-running.png)

三件事同时发生：

- **画布上的LED闪烁**——仿真通过真实的电阻驱动实际组件。
- **串行监视器**显示启动日志，然后是`LED ON` / `LED OFF`，直接来自草图中的`Serial.println()`。
- 电路上方的黄色**SPICE徽章**显示模拟引擎正在求解LED的电流路径。

## 4. 让它成为您的

编辑草图——例如，更改延迟使其闪烁更快：

```cpp
delay(100);   // 原来是 500
```

再次按下 **Run**。这就是整个循环：编辑、运行、观察。

## 5. 保存

点击文件树上方的**保存图标**（或 **Ctrl+S**），为项目命名，它就会存储在您的账户中。请参阅
[保存和打开项目](/docs/zh-cn/getting-started/projects/)。

> **提示：** 卡住了？打开右侧的AI助手并提问——
> “为什么我的LED不闪烁？”是它的示例提示之一，这是有原因的。
> 请参阅 [AI助手](/docs/zh-cn/ai/overview/)。

## 下一步

- [界面导览](/docs/zh-cn/getting-started/interface-tour/) — 每个面板和按钮的作用。
- [电路编辑器](/docs/zh-cn/circuit-editor/overview/) — 从头开始构建电路，而不是从示例开始。
- [支持的开发板](/docs/zh-cn/boards/overview/) — 将ESP32换成Arduino UNO、Pi Pico、STM32……
