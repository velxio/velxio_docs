---
title: "Descripción general de WiFi e IoT"
description: "WiFi simulado en placas ESP32, proyectos MQTT/HTTP y flasheo de hardware real desde el navegador."
sidebar:
  order: 1
---

Las placas ESP32 en Velxio incluyen **WiFi simulado**: tu firmware ve una
red, se asocia, obtiene una dirección IP mediante DHCP y puede hablar con
internet — el mismo sketch que se ejecuta en tu escritorio se ejecuta en el simulador.

En esta sección:

- **ESP32 WiFi** — cómo funciona la red simulada, qué chips la soportan,
  y WiFi desde Arduino y MicroPython.
- **MQTT y HTTP** — conecta tu placa simulada a brokers y APIs reales.
- **Web flash** — cuando estés satisfecho con el proyecto, flaséalo a un
  ESP32 real por USB directamente desde el navegador, sin necesidad de instalar un toolchain.
