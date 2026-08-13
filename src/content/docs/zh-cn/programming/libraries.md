---
title: 使用库
description: 搜索、安装并固定Arduino库以用于您的项目。
sidebar:
  order: 5
---

点击工具栏中的 **Libraries**（库）来搜索Arduino库注册表，
并将库添加到当前活动的开发板。

已安装的库会记录在开发板的 **`libraries.json`** 文件中
（在文件树中可见），因此它们会随项目一起移动：任何打开该项目的人——
包括未来的您——都会在编译时获得相同的版本解析结果。无需在每台机器上维护单独的库文件夹。

## 使用库

安装库后，像平常一样 `#include` 它：

```cpp
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
```

云编译器会在构建前获取声明的库（以及它们的依赖项）。如果构建失败并提示
`No such file or directory`（没有这样的文件或目录）关于某个头文件，说明提供该头文件的库尚未声明——请通过 **Libraries**（库）添加它。

## MicroPython

MicroPython固件自带其标准捆绑模块
（`machine`、`network`、`time` 等）。纯Python辅助模块可以作为额外文件添加到文件树中，放在 `main.py` 旁边，然后正常导入。

## 示例已预先接线

每个图库示例都声明了它所需的库——打开一个示例即可获得代码 + 电路 + 库版本的已知良好组合，这使得它们成为您自己项目的良好起点。

----- 页面结束 -----
