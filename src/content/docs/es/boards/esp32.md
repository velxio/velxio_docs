---
title: ESP32 (clásico)
description: ESP32 DevKit V1, DevKit-C V4, ESP32-CAM y Wemos Lolin32 Lite.
sidebar:
  order: 3
---

El ESP32 Xtensa original de doble núcleo — el caballo de batalla del catálogo, con
**WiFi y Bluetooth** disponibles en el simulador.

| Placa                  | Características destacadas                        |
| ---------------------- | ------------------------------------------------- |
| **ESP32 DevKit V1**    | El devkit estándar de 30 pines; LED integrado en GPIO2 |
| **ESP32 DevKit-C V4**  | Devkit oficial de Espressif, 38 GPIO              |
| **ESP32-CAM**          | ESP32 + módulo de cámara de 2 MP + ranura microSD |
| **Wemos Lolin32 Lite** | Compacto, con huella de cargador LiPo             |

**Lenguajes:** Arduino C++, MicroPython, ESP-IDF — cambia con el
[selector de lenguaje](/docs/es/programming/languages/) de la barra de herramientas.

## Qué funciona

- **WiFi**: únete a `Velxio-GUEST` y accede a internet real — consulta
  [ESP32 WiFi](/docs/es/wifi-iot/esp32-wifi/).
- **Periféricos**: GPIO, PWM (LEDC), ADC, I2C, SPI, UART y el
  mecanismo de temporizadores/interrupciones — tu firmware arranca con el registro ROM real.
- **ESP32-CAM** expone su cámara y microSD en los
  paneles de componentes del simulador.
- **Flash web**: envía el mismo binario a un ESP32 físico por USB —
  [cómo](/docs/es/wifi-iot/web-flash/).

## Notas

- La primera compilación de ESP-IDF/Arduino de una sesión es la lenta; las
  compilaciones posteriores se almacenan en caché.
- El ejemplo de parpadeo integrado
  ([tu primer proyecto](/docs/es/getting-started/first-project/)) está dirigido
  al DevKit V1.
