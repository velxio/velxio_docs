---
title: velxio.toml
description: El archivo de proyecto que lee Velxio CI (placa, firmware, circuito y escenario), con las placas que CI ejecuta hoy y cómo se resuelve cada ruta.
sidebar:
  order: 3
---

`velxio.toml` le indica a la CLI qué ejecutar: qué placa, qué firmware
compilado, qué circuito y qué escenario. Se ubica en el directorio al que
apuntas la CLI. Cada ruta dentro del archivo es relativa al propio archivo,
y las barras inclinadas funcionan en todos los sistemas operativos.

```toml
[velxio]
version = 1                      # required
board = "esp32-s3"               # Velxio board kind
firmware = "build/app.bin"       # .hex | .bin | .uf2 | merged ESP32 image
diagram = "diagram.json"         # Wokwi-format circuit (the default when present)
scenario = "test.yaml"           # default scenario; --scenario overrides it
```

`velxio-cli init --board arduino-uno` escribe un `velxio.toml` inicial y un
`diagram.json` con una placa dentro.

## Claves

| clave          | significado                                                                                                                                  |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `version`      | debe ser `1`.                                                                                                                                |
| `board`        | el tipo de placa de Velxio (tabla más abajo). Opcional cuando el diagrama o el `.vlx` ya nombran la placa; si ambos están presentes, deben coincidir. |
| `firmware`     | la imagen compilada: `.hex`, `.bin`, `.uf2` o una imagen de flash ESP32 fusionada.                                                           |
| `flasher_args` | un `build/flasher_args.json` de ESP-IDF en lugar de `firmware`. Los dos son mutuamente excluyentes.                                          |
| `elf`          | un ELF que se usa cuando `firmware` está ausente. Se convierte para placas AVR y RP2040.                                                     |
| `diagram`      | el circuito, en el formato `diagram.json` de Wokwi.                                                                                          |
| `project`      | una exportación de proyecto `.vlx` de Velxio. Tiene prioridad sobre `diagram`.                                                               |
| `scenario`     | el YAML de escenario que se ejecuta por defecto. Consulta [Scenarios](/docs/es/ci/scenarios/).                                                  |
| `language`     | `arduino`. `micropython` se rechaza con salida 2: CI solo ejecuta firmware compilado.                                                        |

Nada se ignora en silencio. Una clave que la CLI no conoce es una
advertencia; una función que aún no está implementada hace fallar la
ejecución con `feature_unsupported` en lugar de ejecutar en silencio un
proyecto distinto del que escribiste. `[[chip]]` (chips personalizados) es
una de esas: hoy se rechaza, nombrando el archivo de origen.

## Placas que CI ejecuta hoy

Lo decide el servidor, no la CLI. Hoy se ejecutan treinta y seis tipos:
todas las placas con motor en el navegador, cada una comprobada arrancando
firmware real.

### AVR

| tipo | placa | tipo en `diagram.json` | firmware |
| ---- | ----- | ------------------- | -------- |
| `arduino-uno` | Arduino Uno | `wokwi-arduino-uno` | Intel HEX |
| `arduino-nano` | Arduino Nano | `wokwi-arduino-nano` | Intel HEX |
| `arduino-mega` | Arduino Mega | `wokwi-arduino-mega` | Intel HEX |
| `attiny85` | ATtiny85 | `wokwi-attiny85` | Intel HEX |

### RP2040 y RP2350

| tipo | placa | tipo en `diagram.json` | firmware |
| ---- | ----- | ------------------- | -------- |
| `raspberry-pi-pico` | Raspberry Pi Pico | `wokwi-pi-pico`, `board-pi-pico`, `wokwi-raspberry-pi-pico` | imagen de flash |
| `pi-pico-w` | Raspberry Pi Pico W | `board-pi-pico-w` | imagen de flash |
| `xiao-rp2040` | XIAO RP2040 | `board-velxio-xiao-rp2040` | imagen de flash |
| `xiao-rp2350` | XIAO RP2350 | `board-velxio-xiao-rp2350` | imagen de flash |
| `pimoroni-pico-plus-2w` | Pimoroni Pico Plus 2 W | `board-velxio-pimoroni-pico-plus-2w` | imagen de flash |
| `badger-2350` | Pimoroni Badger 2350 | `board-velxio-badger-2350` | imagen de flash |
| `stellar-unicorn` | Pimoroni Stellar Unicorn | `board-velxio-stellar-unicorn` | imagen de flash |

### XIAO ARM

| tipo | placa | tipo en `diagram.json` | firmware |
| ---- | ----- | ------------------- | -------- |
| `xiao-nrf52840-sense` | XIAO nRF52840 Sense | `board-velxio-xiao-nrf52840-sense` | Intel HEX |
| `xiao-samd21` | XIAO SAMD21 | `board-velxio-xiao-samd21` | Intel HEX |
| `xiao-ra4m1` | XIAO RA4M1 | `board-velxio-xiao-ra4m1` | Intel HEX |
| `xiao-mg24-sense` | XIAO MG24 Sense | `board-velxio-xiao-mg24-sense` | Intel HEX |
| `xiao-nrf54l15-sense` | XIAO nRF54L15 Sense | `board-velxio-xiao-nrf54l15-sense` | Intel HEX |

### ESP32

| tipo | placa | tipo en `diagram.json` | firmware |
| ---- | ----- | ------------------- | -------- |
| `esp32` | ESP32 DevKit v1 | `wokwi-esp32-devkit-v1`, `board-esp32-devkit-v1` | imagen ESP32 fusionada |
| `esp32-s3` | ESP32-S3 DevKitC-1 | `board-esp32-s3-devkitc-1` | imagen ESP32 fusionada |
| `esp32-c3` | ESP32-C3 DevKitM-1 | `board-esp32-c3-devkitm-1` | imagen ESP32 fusionada |
| `esp32-c6` | ESP32-C6 DevKitC-1 | `board-esp32-c6-devkitc-1` | imagen ESP32 fusionada |
| `esp32-devkit-c-v4` | ESP32 DevKitC v4 | `board-esp32-devkit-c-v4` | imagen ESP32 fusionada |
| `esp32-cam` | ESP32-CAM | `board-esp32-cam` | imagen ESP32 fusionada |
| `wemos-lolin32-lite` | WEMOS LOLIN32 Lite | `board-wemos-lolin32-lite` | imagen ESP32 fusionada |
| `xiao-esp32-s3` | XIAO ESP32-S3 | `board-xiao-esp32-s3` | imagen ESP32 fusionada |
| `arduino-nano-esp32` | Arduino Nano ESP32 | `board-arduino-nano-esp32` | imagen ESP32 fusionada |
| `xiao-esp32-c3` | XIAO ESP32-C3 | `board-xiao-esp32-c3` | imagen ESP32 fusionada |
| `aitewinrobot-esp32c3-supermini` | ESP32-C3 SuperMini | `board-aitewinrobot-esp32c3-supermini` | imagen ESP32 fusionada |
| `xiao-esp32c6` | XIAO ESP32-C6 | `board-xiao-esp32-c6` | imagen ESP32 fusionada |
| `esp32-p4` | ESP32-P4 Function EV | `board-esp32-p4-function-ev` | imagen ESP32 fusionada |
| `m5stack-core` | M5Stack Core | `board-velxio-m5stack-core` | imagen ESP32 fusionada |
| `esp32-c3-lcdkit` | ESP32-C3-LCDkit | `board-velxio-esp32-c3-lcdkit` | imagen ESP32 fusionada |
| `cardputer-adv` | M5Stack Cardputer ADV | `board-velxio-cardputer-adv` | imagen ESP32 fusionada |
| `xiao-esp32s3-sense` | XIAO ESP32-S3 Sense | `board-velxio-xiao-esp32s3-sense` | imagen ESP32 fusionada |
| `esp-vocat` | ESP-VoCat | `board-velxio-esp-vocat` | imagen ESP32 fusionada |
| `esp32-s3-eye` | ESP32-S3-EYE | `board-velxio-esp32-s3-eye` | imagen ESP32 fusionada |
| `esp-sensairshuttle` | ESP-SensAirShuttle | `board-velxio-esp-sensairshuttle` | imagen ESP32 fusionada |

Cualquiera de ellas también se puede escribir como `board-velxio-<kind>` en
el diagrama, por ejemplo `board-velxio-esp32-c6`; las placas que no tienen
un tipo propio de Wokwi no tienen otra forma de escribirse.

`velxio-cli boards` imprime la lista en vivo con el estado de cada placa,
sus tipos en `diagram.json` y los formatos de firmware que acepta.

:::caution
Lo que queda se ejecuta en el editor pero todavía no en CI: las placas STM32
(necesitan el carril QEMU), las placas Raspberry Pi y UNIHIKER, el devkit de
vista previa ESP32-P4 y la familia DFRobot, que sigue detrás de su flag de
lanzamiento. Cada una se rechaza antes de que empiece la ejecución, con
`board_not_supported_in_ci` y la fase en la que está prevista. No se factura
nada y no se sustituye ninguna placa cercana en silencio.
:::

La Pico W se ejecuta, pero CI no tiene red: WiFi y los sockets nunca se
conectan, y la ejecución lleva una advertencia `no_network`.

## Cómo se resuelven las rutas

- **Archivo de configuración:** `velxio.toml`, luego `wokwi.toml`, luego
  exactamente un `*.vlx` en el directorio. Si no hay ninguno, salida 2.
- **Circuito:** `--project-file`, luego `[velxio] project`, luego
  `--diagram-file`, luego `[velxio] diagram`, luego `diagram.json` junto al
  archivo de configuración.
- **Firmware:** `--firmware`, luego `--elf`, luego `[velxio] firmware` o
  `flasher_args`, luego `[velxio] elf`, luego `[wokwi] firmware`, luego
  `[wokwi] elf`.
- **Placa:** `[velxio] board`, luego la parte de placa del diagrama (o la
  placa activa del `.vlx`).

Las rutas relativas que se indican en la línea de comandos se resuelven
contra el directorio del proyecto, no contra el directorio de trabajo de tu
shell.

## diagram.json

El formato de Wokwi, leído tal cual: `version: 1`, `parts` de
`{id, type, left, top, attrs, rotate, hide}` y `connections` de
`[from, to, color, path]`. Los ids de las partes en el diagrama son los ids
que usan los pasos de tu escenario.

```json
{
  "version": 1,
  "parts": [
    {
      "type": "wokwi-arduino-uno",
      "id": "uno",
      "top": 0,
      "left": 0,
      "attrs": {}
    },
    {
      "type": "wokwi-resistor",
      "id": "r1",
      "top": -40,
      "left": 300,
      "attrs": { "value": "220" }
    },
    {
      "type": "wokwi-led",
      "id": "led1",
      "top": -100,
      "left": 420,
      "attrs": { "color": "red" }
    }
  ],
  "connections": [
    ["uno:13", "r1:1", "green", ["v0"]],
    ["r1:2", "led1:A", "green", ["v0"]],
    ["led1:C", "uno:GND.1", "black", ["v0"]]
  ]
}
```

Las partes son los elementos `wokwi-*` (`wokwi-led`, `wokwi-pushbutton`,
`wokwi-dht22`, etcétera). Un tipo de parte que la CLI no reconoce es una
advertencia, no un error: lo decide el servidor, y las partes que no puede
simular se reportan por id en lugar de descartarse en silencio.

## .vlx

Un proyecto exportado desde el editor de Velxio (`format: "velxio-project"`,
`version: 1`) puede ser el circuito en lugar de un diagrama. Coloca el único
`.vlx` en el directorio, o nómbralo con `project =` o `--project-file`.
La placa principal de la exportación es la placa de la ejecución; el
firmware sigue viniendo del toml o de `--firmware`.

## Límites

| qué                        | límite                                                                                             |
| -------------------------- | -------------------------------------------------------------------------------------------------- |
| firmware por placa         | 16 MiB                                                                                             |
| todos los archivos subidos por ejecución | 20 MiB                                                                                |
| circuito                   | 300 partes, 2.000 cables                                                                           |
| escenario                  | 200 pasos, 20 capturas de pantalla, 512 bytes por texto de `wait-serial`                           |
| `--timeout`                | el techo de tu plan (5 min en Maker, 10 min en Pro), y nunca más que los minutos que te quedan     |

Un `--timeout` por encima del techo no es un error: se recorta, y la
ejecución reporta una advertencia `timeout_clamped` con el presupuesto que
realmente recibió.

## Compruébalo antes de gastar minutos

```bash
velxio-cli lint .
```

`lint` no necesita token ni red. Analiza el toml, resuelve cada ruta,
comprueba que los archivos existen y caben en los límites, comprueba que los
ids de las partes son únicos y que las conexiones nombran partes existentes,
comprueba que la placa es una que CI ejecuta, comprueba que el formato del
firmware coincide con la familia de la placa, y comprueba que cada paso del
escenario es conocido, tiene sus campos, nombra partes existentes y analiza
sus duraciones. La mayoría de los fallos de `exit 2` salen más baratos de
encontrar aquí.
