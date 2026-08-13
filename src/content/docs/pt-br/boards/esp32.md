---
title: ESP32 (clássico)
description: ESP32 DevKit V1, DevKit-C V4, ESP32-CAM e Wemos Lolin32 Lite.
sidebar:
  order: 3
---

O Xtensa ESP32 dual-core original — o cavalo de batalha do catálogo, com
**WiFi e Bluetooth** disponíveis no simulador.

| Placa                  | Destaques                                        |
| ---------------------- | ------------------------------------------------- |
| **ESP32 DevKit V1**    | O devkit padrão de 30 pinos; LED integrado no GPIO2 |
| **ESP32 DevKit-C V4**  | Devkit oficial da Espressif, 38 GPIO                |
| **ESP32-CAM**          | ESP32 + módulo de câmera de 2 MP + slot microSD         |
| **Wemos Lolin32 Lite** | Compacto, com footprint de carregador LiPo                   |

**Linguagens:** Arduino C++, MicroPython, ESP-IDF — alterne com o
[seletor de linguagem](/docs/pt-br/programming/languages/) da barra de ferramentas.

## O que funciona

- **WiFi**: conecte-se ao `Velxio-GUEST` e alcance a internet real — veja
  [ESP32 WiFi](/docs/pt-br/wifi-iot/esp32-wifi/).
- **Periféricos**: GPIO, PWM (LEDC), ADC, I2C, SPI, UART e o
  mecanismo de temporizadores/interrupções — seu firmware inicializa com o log real da ROM.
- **ESP32-CAM** expõe sua câmera e microSD nos
  painéis de componentes do simulador.
- **Web flash**: envie o mesmo binário para um ESP32 físico via USB —
  [como](/docs/pt-br/wifi-iot/web-flash/).

## Notas

- A primeira compilação ESP-IDF/Arduino de uma sessão é a lenta; as compilações
  posteriores usam cache.
- O exemplo de piscar LED integrado
  ([seu primeiro projeto](/docs/pt-br/getting-started/first-project/)) tem como alvo
  o DevKit V1.

----- END PAGE -----
