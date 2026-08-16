---
title: 界面导览
description: 编辑器一览——画布、代码编辑器、工具栏、控制台和AI面板。
sidebar:
  order: 4
---

这是运行中项目的Velxio编辑器：

![Velxio编辑器，按区域标注](../../../../assets/docs/getting-started/first-project-running.png)

## 菜单栏

![Velxio菜单栏：文件、编辑、视图、账户、帮助](../../../../assets/docs/getting-started/interface-menu-bar.png)

**File（文件）· Edit（编辑）· View（视图）· Account（账户）· Help（帮助）** — 项目操作、撤销/重做、面板可见性、您的账户和套餐，以及帮助资源。

## 工具栏

![编辑器工具栏，从布局切换到添加按钮](../../../../assets/docs/getting-started/interface-toolbar.png)

从左到右：

| 控件              | 功能                                                                                               |
| -------------------- | ---------------------------------------------------------------------------------------------------------- |
| 布局切换       | 显示**Code（代码）**编辑器、**Circuit（电路）**画布，或**Both（两者）**并排显示                                 |
| 语言选择器    | **Arduino C++**、**MicroPython**或**ESP-IDF** — 按开发板选择，参见[语言](/docs/zh-cn/programming/languages/) |
| **Compile（编译）** (Ctrl+B) | 构建但不运行                                                                                      |
| **Run（运行）**              | 如需则先编译，然后启动仿真                                                               |
| **Stop（停止）** / **Reset（重置）** | 停止仿真 / 从头重新启动固件                                                    |
| **Libraries（库）**        | 搜索并安装Arduino库                                                                       |
| 输出切换        | 显示/隐藏编译器输出控制台                                                                      |
| 开发板选择器       | 代码编辑器和**Run（运行）**所应用的开发板（项目可以有多个）                                   |
| **Serial（串口）**           | 切换[串口监视器](/docs/zh-cn/programming/serial-monitor/)                                             |
| **Scope（示波器）**            | 切换[示波器/逻辑分析仪](/docs/zh-cn/instruments/oscilloscope/)                                |
| **Add（添加）**              | 打开[元件选择器](/docs/zh-cn/circuit-editor/placing-components/)                                      |

## 工作区面板（左侧）

![带有项目文件树的工作区面板](../../../../assets/docs/getting-started/interface-workspace.png)

您项目的文件树：每个开发板都有自己的文件（`sketch.ino`、`libraries.json`，以及您添加的任何文件）。其上方的图标可从[入门模板](/docs/zh-cn/getting-started/projects/)创建工作区、打开项目文件和保存。

## 画布（中央）

![带有ESP32闪烁电路、SPICE徽章和缩放控件的画布](../../../../assets/docs/getting-started/interface-canvas.png)

电路所在之处。滚动以平移，使用右下角的缩放控件，点击元件以选中，右键单击打开其[检查器](/docs/zh-cn/circuit-editor/part-inspector/)。黄色**SPICE**徽章报告所选电路的模拟引擎状态。

## 控制台（底部）

![输出控制台和串口监视器并排显示](../../../../assets/docs/programming/serial-monitor.png)

- **Output（输出）** — 编译器和系统消息。
- **Serial monitor（串口监视器）** — 每个运行中的开发板一个标签页；输入框用于发送数据。参见[串口监视器](/docs/zh-cn/programming/serial-monitor/)。
- **Oscilloscope（示波器）** — 当切换开启时。参见[示波器](/docs/zh-cn/instruments/oscilloscope/)。

## AI面板（右侧）

![带有Basic、Agent和Tutor标签页以及额度计数器的AI面板](../../../../assets/docs/getting-started/interface-ai-panel.png)

助手有三种模式 — **Basic（基础）**、**Agent（代理）**、**Tutor（导师）** — 底部显示您剩余的每日额度。参见[AI助手](/docs/zh-cn/ai/overview/)。当您需要完整画布时，可使用箭头按钮将其最小化。
