---
title: 编译与运行
description: 按下“运行”按钮时会发生什么——云端编译、真实固件，以及如何解读错误信息。
sidebar:
  order: 3
---

## 运行（Run）的作用

**Run**（运行）会编译当前开发板的代码（如有需要），并在模拟开发板上启动运行结果。这里没有“对源代码的模拟”——Velxio 使用真实工具链（arduino-cli / ESP-IDF / MicroPython）构建**真实的固件二进制文件**，并逐条指令执行。

- **Compile**（编译，Ctrl+B）只构建而不运行——适合快速检查错误。
- **Stop**（停止）暂停模拟；**Reset**（重置）从头重启固件。

## 输出控制台

左下角的 **OUTPUT**（输出）面板会实时显示构建过程：库解析、编译器调用、内存使用情况，最后显示 `Compilation successful`。这与 Arduino IDE 或 `idf.py build` 给出的输出完全一致。

## 解读编译错误

错误信息会以编译器输出的原始格式显示，包含文件名和行号：

- `'foo' was not declared in this scope` —— 拼写错误或缺少 `#include`。
- 头文件报 `No such file or directory` —— 库未安装；请通过 **Libraries**（库）添加（[操作方法](/docs/zh-cn/programming/libraries/)）。
- 大型程序出现链接器/段错误 —— 二进制文件超出所选开发板的闪存容量。

修复后，再次按下 **Run**（运行）。得益于缓存机制，首次之后的构建速度会快得多。

> **Tip**（提示）：将编译错误粘贴到 [AI 助手](/docs/zh-cn/ai/overview/)中——在上下文中解释错误正是其 Basic 模式最擅长的。

## 运行期间

- 文件树中开发板名称旁的**状态圆点**会显示 空闲 / 已编译 / 运行中。
- **串行监视器**会自动连接——参见 [串行监视器](/docs/zh-cn/programming/serial-monitor/)。
- 可实时与电路交互：按下按钮、旋转电位器、从控制面板更改传感器数值。
