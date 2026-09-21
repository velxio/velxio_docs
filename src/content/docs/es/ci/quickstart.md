---
title: Inicio rápido de CI
description: "De cero a una ejecución correcta en cinco minutos. Instala la CLI, escribe dos archivos, ejecútalo."
sidebar:
  order: 2
---

Necesitas una cuenta de Velxio en un plan de pago y un archivo de firmware compilado. El simulador nunca compila nada aquí: trae el `.hex`, `.bin`, `.uf2` o `.elf` que haya producido tu propia cadena de herramientas.

## 1. Instala la CLI

```bash
curl -fsSL https://velxio.dev/ci/install.sh | sh
```

Coloca un único binario en `~/.velxio/bin` y te indica cómo añadirlo a tu `PATH`. Windows: `iwr https://velxio.dev/ci/install.ps1 -useb | iex`. Los binarios están en la [página de releases](https://github.com/velxio/velxio-cli/releases) si prefieres descargar uno tú mismo.

## 2. Inicia sesión

```bash
velxio-cli login
```

Muestra un código corto, abre tu navegador y espera. Aprueba la solicitud y la CLI guarda lo que se le entrega, así que nunca manejas un token en tu propia máquina.

```
code     7XJ6-33M5
approve  https://velxio.dev/account/ci/device?code=7XJ6-33M5
waiting for approval of 7XJ6-33M5 (the code expires in 10 min)
signed in as velxio-cli on laptop
```

La página muestra qué está solicitando, desde qué máquina y para qué, antes de que apruebes nada:

![La página del navegador que aprueba un inicio de sesión de la CLI: nombra la herramienta, la máquina en la que se ejecuta y lo que está solicitando, con botones Approve y Deny](../../../../assets/docs/ci/device-approve.png)

Un trabajo de CI no tiene navegador, así que lleva un secreto en su lugar. El mismo flujo lo genera, con el nombre del repositorio que lo va a contener:

```bash
velxio-cli login --ci --name "my-firmware"
```

Ese muestra el token una sola vez. Guárdalo como un secreto del repositorio (en GitHub: Settings, Secrets and variables, Actions) y nunca en el propio repositorio. Ambos tipos aparecen en [velxio.dev/account/ci](https://velxio.dev/account/ci), donde puedes revocar cualquiera de los dos.

## 3. Describe el proyecto

Dos archivos junto a tu firmware. `velxio-cli init` escribe un par inicial, o escríbelos a mano:

```toml
# velxio.toml
[velxio]
version = 1
board = "esp32-s3"
firmware = "build/blink.bin"
```

```json
{
  "version": 1,
  "parts": [
    { "type": "board-esp32-s3-devkitc-1", "id": "esp", "top": 0, "left": 0 },
    {
      "type": "wokwi-led",
      "id": "led1",
      "top": 0,
      "left": 120,
      "attrs": { "color": "red" }
    },
    {
      "type": "wokwi-resistor",
      "id": "r1",
      "top": 60,
      "left": 60,
      "attrs": { "value": "220" }
    }
  ],
  "connections": [
    ["esp:2", "r1:1", "green", []],
    ["r1:2", "led1:A", "green", []],
    ["led1:C", "esp:GND.1", "black", []]
  ]
}
```

Ese es el formato `diagram.json` de Wokwi, así que un diagrama existente funciona tal cual.

## 4. Ejecútalo

```bash
velxio-cli run --expect-text "Hello, world!" --timeout 10000 .
```

El firmware arranca, la salida serie aparece a medida que ocurre, y el comando sale con 0 en cuanto aparece el texto, o con 42 cuando se agotan los diez segundos simulados sin que aparezca.

```
velxio-cli 0.2.1 · plan pro · 1998.3 of 2000 min left (resets 2026-10-01)
project blink (esp32-s3, 3 parts) · firmware build/blink.bin (ESP32 image, 912 KB)
run r_9f3c2a1b7e4d queued · budget 10.0 s simulated
Hello, world!
ok   wait-serial "Hello, world!" at 0.412 s
PASS in 0.41 s simulated (3.2 s wall) · billed 1 s · exit 0
```

## 5. Ponlo en CI

```yaml
- name: Test with Velxio
  uses: velxio/velxio-ci-action@v1
  with:
    token: ${{ secrets.VELXIO_CLI_TOKEN }}
    path: firmware/blink
    timeout: 10000
    expect_text: "Hello, world!"
```

Compila en un paso anterior; este solo ejecuta lo que compilaste.

## Cuando no funciona

- **`exit 2` antes de que se ejecutara nada.** Un problema de configuración: la placa no es una que Velxio ejecute, el firmware no coincide con la placa, o el escenario tiene un paso que nombra una pieza que tu diagrama no tiene. No se facturó nada. `velxio-cli lint .` encuentra la mayoría de estos sin token y sin red.
- **`exit 3`.** El token falta, fue revocado o pertenece a un plan sin CI.
- **`exit 4`.** No quedan minutos este mes, o hay más trabajos a la vez de los que ejecuta tu plan.
- **El texto nunca llega.** Aumenta `--timeout`, luego ejecuta sin ninguna expectativa (`velxio-cli run --timeout 5000 .`) para leer lo que el firmware imprime realmente.
