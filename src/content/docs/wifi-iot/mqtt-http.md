---
title: MQTT and HTTP projects
description: Talk to real brokers and APIs from your simulated board.
sidebar:
  order: 3
---

With [WiFi connected](/docs/wifi-iot/esp32-wifi/), your simulated ESP32
can run real IoT workloads. The examples gallery has a whole **ESP32
MQTT** category ready to open and run.

## MQTT

The classic PubSubClient flow works unchanged: join `Velxio-GUEST`,
connect to a public broker, publish and subscribe. Open the gallery's
MQTT examples to see:

- publishing sensor readings on a timer,
- subscribing to a topic and driving an output from received messages,
- a complete two-way dashboard exchange against a public broker.

Because the broker is real, you can watch your simulated board's messages
arrive on your phone or laptop with any MQTT client — and publish back to
it.

## HTTP

`HTTPClient` (Arduino) and `urequests` (MicroPython) work against real
endpoints: fetch a REST API, download a file, post a webhook. Keep
payloads reasonable — the emulated chip has the same RAM limits as the
real one.

## Notes and limits

- The AP is **open** (no password) and provides NAT internet access —
  there is no inbound access to your simulated board from the internet.
- DNS, TCP, UDP and TLS behave like on hardware; heavy TLS handshakes
  cost real emulated CPU time, so expect them to take a moment.
- If a connection fails, check the serial monitor first — the WiFi
  stack's own log lines (`wifi:connected`, `got ip`) tell you which step
  didn't happen.
