---
title: MQTT 和 HTTP 项目
description: 从您的模拟开发板与真实的代理服务器和 API 通信。
sidebar:
  order: 3
---

在[连接 WiFi](/docs/zh-cn/wifi-iot/esp32-wifi/) 后，您的模拟 ESP32
可以运行真实的物联网工作负载。示例库中有一个完整的 **ESP32
MQTT** 类别，可直接打开并运行。

## MQTT

经典的 PubSubClient 流程无需更改即可正常工作：加入 `Velxio-GUEST`，
连接到公共代理服务器，发布和订阅。打开示例库中的
MQTT 示例以查看：

- 定时发布传感器读数，
- 订阅主题并根据接收到的消息驱动输出，
- 与公共代理服务器进行完整的双向仪表板交换。

由于代理服务器是真实的，您可以使用任何 MQTT 客户端在手机或笔记本电脑上
查看模拟开发板发送的消息——并可以向其发布消息。

## HTTP

`HTTPClient`（Arduino）和 `urequests`（MicroPython）可针对真实的
端点工作：获取 REST API、下载文件、发布 Webhook。请保持
负载合理——模拟芯片具有与真实芯片相同的 RAM 限制。

## 注意事项和限制

- 接入点为**开放**（无密码）并提供 NAT 互联网访问——
  互联网无法对您的模拟开发板进行入站访问。
- DNS、TCP、UDP 和 TLS 的行为与硬件上一致；繁重的 TLS 握手
  会消耗真实的模拟 CPU 时间，因此请预期它们需要一些时间。
- 如果连接失败，请先检查串行监视器——WiFi
  协议栈自身的日志行（`wifi:connected`、`got ip`）会告诉您哪一步
  未完成。
