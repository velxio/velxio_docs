---
title: 界面导览
description: 编辑器一览——画布、代码编辑器、工具栏、控制台和AI面板。
sidebar:
  order: 3
---

这是运行着项目的Velxio编辑器：

![Velxio编辑器，按区域标注](../../../../assets/docs/getting-started/first-project-running.png)

## 菜单栏

**File · Edit · View · Account · Help** — 项目操作、撤销/重做、面板可见性、您的账户和套餐，以及帮助资源。

## 工具栏

从左到右：

| 控件                  | 功能                                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------------ |
| 布局切换              | 显示**Code**编辑器、**Circuit**画布，或**Both**并排显示                                                      |
| 语言选择器            | **Arduino C++**、**MicroPython**或**ESP-IDF** — 按开发板选择，参见[语言](/docs/zh-cn/programming/languages/) |
| **Compile**（Ctrl+B） | 编译但不运行                                                                                                 |
| **Run**               | 如需则先编译，然后启动仿真                                                                                   |
| **Stop** / **Reset**  | 停止仿真 / 从头重启固件                                                                                      |
| **Libraries**         | 搜索并安装Arduino库                                                                                          |
| 输出切换              | 显示/隐藏编译器输出控制台                                                                                    |
| 开发板选择器          | 代码编辑器和Run所应用的开发板（项目可以有多个）                                                              |
| **Serial**            | 切换[串口监视器](/docs/zh-cn/programming/serial-monitor/)                                                    |
| **Scope**             | 切换[示波器/逻辑分析仪](/docs/zh-cn/instruments/oscilloscope/)                                               |
| **Add**               | 打开[元件选择器](/docs/zh-cn/circuit-editor/placing-components/)                                             |

## 工作区面板（左侧）

您项目的文件树：每个开发板都有自己的文件（`sketch.ino`、`libraries.json`，以及您添加的任何文件）。其上方的图标可从[入门模板](/docs/zh-cn/getting-started/projects/)创建工作区、打开项目文件和保存。

## 画布（中央）

电路所在区域。滚动以平移，使用右下角的缩放控件，点击元件以选中，右键打开其[检查器](/docs/zh-cn/circuit-editor/part-inspector/)。黄色**SPICE**徽章显示所选电路的模拟引擎状态。

## 控制台（底部）

- **Output** — 编译器和系统消息。
- **Serial monitor** — 每个运行中的开发板一个标签页；输入框用于发送数据。参见[串口监视器](/docs/zh-cn/programming/serial-monitor/)。
- **Oscilloscope** — 开启时显示。参见[示波器](/docs/zh-cn/instruments/oscilloscope/)。

## AI面板（右侧）

助手有三种模式 — **Basic**、**Agent**、**Tutor** — 底部显示您剩余的每日配额。参见[AI助手](/docs/zh-cn/ai/overview/)。当您需要完整画布时，可用箭头按钮将其最小化。

----- 页面结束 -----
