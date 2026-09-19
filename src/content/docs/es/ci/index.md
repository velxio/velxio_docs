---
title: Velxio CI
description: "Ejecuta tu firmware en una placa simulada desde una terminal o un trabajo de CI, y haz fallar la compilación cuando el firmware se comporte mal."
sidebar:
  order: 1
  badge:
    text: Paid
    variant: tip
---

Velxio CI ejecuta uno de tus proyectos en nuestro simulador desde fuera del navegador:
tu terminal, un trabajo de GitHub Actions, cualquier CI que pueda ejecutar un binario. La placa
arranca tu firmware compilado real, la salida serie se transmite de vuelta, y el
comando termina con un código distinto de cero cuando algo de lo que pediste no ocurrió.

```bash
curl -fsSL https://velxio.dev/ci/install.sh | sh
velxio-cli login                           # approve in the browser, once
cd firmware/blink
velxio-cli run --expect-text "Hello, world!" --timeout 10000 .
```

```
velxio-cli 0.1.0 · plan pro · 1998.3 of 2000 min left (resets 2026-10-01)
project blink (esp32-s3, 4 parts) · firmware build/blink.bin (ESP32 image, 912 KB)
run r_9f3c2a1b7e4d queued · budget 10.0 s simulated
Hello, world!
ok   wait-serial "Hello, world!" at 0.412 s
PASS in 0.41 s simulated (3.2 s wall) · billed 1 s · exit 0
```

## Para qué sirve

- **Detectar una regresión del firmware antes que el hardware.** Una prueba que arranca el
  binario y espera una línea de serie es un solo comando; una prueba que pulsa un
  botón, establece un sensor y comprueba un pin es un archivo YAML corto.
- **Probar lo que no puedes tener en un escritorio.** Cada placa que Velxio simula está
  disponible para cada trabajo, en paralelo, sin laboratorio y sin flashear.
- **Conservar la cadena de herramientas que ya tienes.** Compila con arduino-cli, ESP-IDF,
  PlatformIO o cargo en un paso anterior; Velxio solo ejecuta lo que salió de ahí.

## Cuánto cuesta

CI se factura en **minutos simulados** — el tiempo que el firmware invitado cree
que ha transcurrido, no cuánto tardaron nuestros servidores. Una prueba de 10 segundos cuesta 10 segundos
en cada placa, ya sea que el emulador lo ejecute más rápido o más lento que el tiempo real.

| Plan  | Minutos de CI por mes | Trabajos a la vez | Duración máxima |
| ----- | -------------------- | ------------ | ----------- |
| Free  | —                    | —            | —           |
| Maker | 200                  | 1            | 5 min       |
| Pro   | 2,000                | 2            | 10 min      |

Una ejecución que nunca comienza (una placa desconocida, un firmware que no coincide con la
placa, un escenario rechazado) no cuesta nada. Los minutos se restablecen el primer día del
mes, UTC. Tu saldo, tu historial de ejecuciones y tus tokens están en
[/account/ci](https://velxio.dev/account/ci):

![La página de la cuenta de CI: minutos usados este mes, los tokens que existen con cuándo se usó cada uno por última vez, y una tabla de ejecuciones recientes con su estado, segundos simulados y facturados y código de salida](../../../../assets/docs/ci/account.png)

## Cómo se describe un proyecto

Dos archivos en el directorio al que apuntas el CLI:

- `velxio.toml` — la placa y el firmware. Un `wokwi.toml` de Wokwi también funciona.
- `diagram.json` — el circuito. El formato de Wokwi, así que un diagrama existente se ejecuta
  sin cambios.

Añade `scenario.yaml` cuando una comprobación de serie no sea suficiente: puede esperar texto,
enviar texto, esperar en el reloj simulado, comprobar un pin y establecer un control en una
pieza. Consulta [Scenarios](/docs/es/ci/scenarios/).

## A continuación

- [Quickstart](/docs/es/ci/quickstart/) — una primera ejecución exitosa en cinco minutos.
- [velxio.toml](/docs/es/ci/velxio-toml/) — cada clave, y cómo se resuelven las rutas.
- [Scenarios](/docs/es/ci/scenarios/) — los pasos y qué significan.
- [GitHub Actions](/docs/es/ci/github-action/) — la acción y sus entradas.
- [Exit codes](/docs/es/ci/exit-codes/) — qué significa cada uno para tu trabajo.
- [Coming from Wokwi CI](/docs/es/ci/migrating-from-wokwi/) — qué cambia.
