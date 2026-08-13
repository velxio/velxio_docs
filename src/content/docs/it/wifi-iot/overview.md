---
title: Panoramica WiFi e IoT
description: WiFi simulato su schede ESP32, progetti MQTT/HTTP e flashing di hardware reale dal browser.
sidebar:
  order: 1
---

Le schede ESP32 in Velxio sono dotate di **WiFi simulato**: il tuo firmware vede una
rete, si associa, ottiene un indirizzo IP tramite DHCP e può comunicare con
internet — lo stesso sketch che esegui sulla tua scrivania funziona nel simulatore.

In questa sezione:

- **ESP32 WiFi** — come funziona la rete simulata, quali chip la supportano,
  e WiFi da Arduino e MicroPython.
- **MQTT e HTTP** — collega la tua scheda simulata a broker e API reali.
- **Web flash** — quando sei soddisfatto del progetto, caricalo su una
  ESP32 reale via USB direttamente dal browser, senza installare alcun toolchain.
