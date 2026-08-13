---
title: Visão geral de WiFi e IoT
description: "WiFi simulado em placas ESP32, projetos MQTT/HTTP e gravação de hardware real pelo navegador."
sidebar:
  order: 1
---

As placas ESP32 no Velxio vêm com **WiFi simulado**: seu firmware enxerga uma
rede, associa-se, obtém um endereço IP via DHCP e pode conversar com a
internet — o mesmo sketch que roda na sua mesa roda no simulador.

Nesta seção:

- **WiFi ESP32** — como a rede simulada funciona, quais chips têm suporte,
  e WiFi a partir do Arduino e do MicroPython.
- **MQTT e HTTP** — conecte sua placa simulada a brokers e APIs reais.
- **Web flash** — quando você estiver satisfeito com o projeto, grave-o em um
  ESP32 real via USB diretamente do navegador, sem instalar toolchain.
