---
title: 本地网络网关
description: 在您的机器上运行 velxiogw，模拟板即可加入您的真实网络——局域网、本地主机，一应俱全。
sidebar:
  order: 3
---

默认情况下，模拟板通过 Velxio 的云网关访问互联网——但无法访问您的本地网络。**本地网络网关**（`velxiogw`）消除了这一限制：这是一个在您自己机器上运行的小程序，板的流量将从这里出口。您的 MQTT 代理、您的 Home Assistant、您在 `localhost` 上开发的 API——所有这些都可以从 sketch 中访问。Maker 计划支持配对功能。

## 设置

1. 从[最新版本](https://github.com/velxio/velxiogw/releases/latest)下载适用于您平台的网关并运行它：

   ```
   $ ./velxiogw
   velxiogw 0.1.2 — Velxio IoT Network Gateway
     listening on   ws://127.0.0.1:9013
     pairing code   493028
     reach scope    your LAN + localhost + internet
     host alias     host.velxio.internal -> this machine
   ```

2. 在编辑器中，打开 **WiFi 面板**（WiFi 图标旁边的插入符）。面板会自动检测正在运行的网关。

3. 输入网关打印的**配对码**，然后点击 **Connect**（连接）。从下次 Run（运行）开始，板就位于您的网络上了。

首次使用时，Chrome 会请求权限，允许页面与您本地网络上的设备通信——请点击 **Allow**（允许）。（Safari 目前不支持此功能；请使用 Chrome、Edge 或 Firefox。）

## 访问您自己的机器

在 sketch 内部，主机名 `host.velxio.internal` 始终解析为运行网关的机器：

```cpp
#include <HTTPClient.h>

HTTPClient http;
http.begin("http://host.velxio.internal:8000/api/reading");
int status = http.GET();
```

局域网上的任何其他设备都可以通过其正常的 IP 或无 mDNS 的主机名访问，就像真实板在您的 WiFi 上一样。

## 注意事项

- 网关仅绑定到您的回环地址，并拒绝没有配对码的连接，因此您网络上的其他设备——或任何其他网页——都无法使用它。
- 通过本地网关的流量永远不会触及 Velxio 的服务器，并且由于省去了往返，通常速度更快。
- 源代码在 [github.com/velxio/velxiogw](https://github.com/velxio/velxiogw) 公开；二进制文件可免费下载，编辑器中的配对流程是 Maker 计划的功能。
- 在 Velxio Desktop 应用中，这些都不需要：模拟已经在您的机器上运行，因此板默认就在您的网络上。
