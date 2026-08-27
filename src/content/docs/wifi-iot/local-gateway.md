---
title: Local network gateway
description: Run velxiogw on your machine and the simulated board joins your real network — LAN, localhost and all.
sidebar:
  order: 3
---

By default a simulated board reaches the internet through Velxio's cloud
gateway — but not your local network. The **local network gateway**
(`velxiogw`) removes that limit: a small program you run on your own
machine, and the board's traffic egresses from there instead. Your MQTT
broker, your Home Assistant, the API you are developing on `localhost` —
all reachable from the sketch. A Maker plan enables the pairing.

## Setup

1. Download the gateway for your platform from the
   [latest release](https://github.com/velxio/velxiogw/releases/latest)
   and run it:

   ```
   $ ./velxiogw
   velxiogw 0.1.2 — Velxio IoT Network Gateway
     listening on   ws://127.0.0.1:9013
     pairing code   493028
     reach scope    your LAN + localhost + internet
     host alias     host.velxio.internal -> this machine
   ```

2. In the editor, open the **WiFi panel** (the caret next to the WiFi
   icon). The panel detects the running gateway by itself.

3. Type the **pairing code** the gateway printed and click **Connect**.
   From the next Run on, the board is on your network.

The first time, Chrome asks for permission to let the page talk to a
device on your local network — click **Allow**. (Safari does not currently
support this; use Chrome, Edge or Firefox.)

## Reaching your own machine

Inside a sketch, the hostname `host.velxio.internal` always resolves to
the machine the gateway runs on:

```cpp
#include <HTTPClient.h>

HTTPClient http;
http.begin("http://host.velxio.internal:8000/api/reading");
int status = http.GET();
```

Anything else on your LAN is reachable by its normal IP or mDNS-less
hostname, exactly as from a real board on your WiFi.

## Notes

- The gateway binds to your loopback only and refuses connections without
  the pairing code, so nothing else on your network — or any other web
  page — can use it.
- Traffic through the local gateway never touches Velxio's servers, and is
  usually faster for losing the round trip.
- The source is public at
  [github.com/velxio/velxiogw](https://github.com/velxio/velxiogw); the
  binaries are free to download, and the pairing flow in the editor is the
  Maker-plan feature.
- On the Velxio Desktop app none of this is needed: the simulation already
  runs on your machine, so the board is on your network by construction.
