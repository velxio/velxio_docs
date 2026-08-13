---
title: 串行监视器
description: 查看程序的串行输出并向其发送数据。
sidebar:
  order: 4
---

使用工具栏中的 **Serial**（串行）按钮切换串行监视器。它作为底部面板打开，**项目中的每个板卡对应一个标签页**：

![运行期间的串行监视器](../../../../assets/docs/programming/serial-monitor.png)

固件打印的所有内容（`Serial.println`、MicroPython 的 `print`、启动 ROM 日志）都会实时显示在这里——包括芯片自身的启动消息，因为模拟器启动的是真实固件。

## 控件

- **Baud rate**（波特率）— 与您的 `Serial.begin(...)` 匹配；通常为 115200。
- **Autoscroll**（自动滚动）— 跟随最新输出；取消勾选可回滚查看。
- **Clear**（清除）— 清空缓冲区。
- **Hardware serial**（硬件串行）— 表示该标签页已连接到板卡的 UART。

## 发送输入

在底部的**消息框**中输入内容，然后按 **Send**（发送）。行尾选择器（换行 / 回车 / 两者 / 无）对于解析 `Serial.read()` 的程序很重要——与 Arduino IDE 监视器中的行为相同。

在 MicroPython 板卡上，串行监视器兼作 **REPL**：使用 Ctrl+C 风格的中断停止脚本，然后以交互方式输入 Python 代码。
