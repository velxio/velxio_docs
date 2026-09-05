---
title: "Flasha hardware real desde el navegador"
description: "Escribe tu proyecto compilado en una placa física por USB, directamente desde el navegador, sin necesidad de tener un toolchain instalado."
sidebar:
  order: 4
---

Cuando tu proyecto funciona en el simulador, puedes ponerlo en una
**placa real** sin instalar nada: Velxio flashea el firmware compilado
por USB, directamente desde el navegador.

## Requisitos

- Un navegador basado en Chromium (Chrome o Edge). El flasher utiliza
  las APIs Web Serial y WebUSB del navegador, que Firefox y Safari no
  incluyen. Las placas de la familia Pico aún tienen un botón de
  **Download .uf2** allí (ver más abajo).
- Un cable USB con capacidad de datos para tu placa.
- Cierra cualquier otra cosa que esté usando el puerto primero
  (monitores serie, IDEs, picotool): el navegador necesita acceso
  exclusivo.

![El diálogo de flasheo seleccionando un puerto serie USB](../../../../assets/docs/wifi-iot/flash-modal.png)

## Flasheo

1. Haz clic derecho en la placa del lienzo y elige **Flash to real board**.
2. Haz clic en **Connect & flash**. El navegador pregunta a qué
   dispositivo USB conceder acceso; elige tu placa.
3. Velxio utiliza la compilación que ya hizo para esa placa (el mismo
   binario que estaba ejecutando el simulador). Si el código ha cambiado
   desde entonces, recompila primero y la salida del compilador se
   transmite al diálogo.
4. Observa la barra de progreso; cuando termine, la placa se reinicia y
   ejecuta tu proyecto.

El diálogo elige el protocolo para el objetivo:

| Familia | Cómo se escribe | La placa debe estar |
| --- | --- | --- |
| ESP32, S3, C3, C6 | esptool a través del puerto serie, el `.bin` combinado | conectada; mantén pulsado BOOT si no responde |
| Arduino Uno, Nano, Mega, ATtiny85 | STK500 contra el bootloader de la placa, el `.hex` | conectada (ATtiny85: a través de un Arduino ejecutando ArduinoISP) |
| Raspberry Pi Pico, Pico W, Pico 2, placas Pimoroni RP2040 / RP2350 | PICOBOOT sobre WebUSB, el `.uf2` que construyó picotool | en modo **BOOTSEL** (sección siguiente) |

## Placas de la familia Pico: BOOTSEL primero

Un RP2040 o RP2350 se programa mediante su bootloader, una personalidad
USB separada que el chip solo muestra en modo **BOOTSEL**. Dos formas de
llegar allí:

- **Manual**: mantén pulsado el botón BOOTSEL mientras conectas la
  placa, luego suéltalo. La placa se monta como una unidad USB llamada
  `RPI-RP2` (RP2040) o `RP2350`.
- **Desde el diálogo**: el diálogo de flasheo para estas placas tiene un
  botón **Reboot into bootloader over USB**. Funciona cuando la placa
  está ejecutando un sketch que Velxio compiló (el núcleo Arduino se
  reinicia al abrir a 1200 baudios) o MicroPython (el REPL ejecuta
  `machine.bootloader()`). El navegador solicita el puerto serie de la
  placa, la placa se desconecta y vuelve como bootloader. Luego haz clic
  en **Connect & flash** y elige el dispositivo `RP2 Boot` / `RP2350 Boot`.

Dos clics, dos solicitudes de permiso: el puerto serie para el reinicio
y el dispositivo USB para la escritura. Una vez que la placa está en
BOOTSEL, los flasheos posteriores solo necesitan la segunda.

### Dos revisiones de la misma placa

Pimoroni vendió el Stellar y el Galactic Unicorn con un Pico W (RP2040)
hasta enero de 2025 y con un Pico 2 W (RP2350) desde entonces. El
simulador ejecuta el actual; el diálogo de flasheo tiene un selector de
**Real board revision** para estas placas. Elige "Pico W aboard" para la
unidad más antigua: el diálogo construye una segunda imagen para ese
chip, la flashea o la descarga, y el simulador sigue ejecutando su
propia compilación. La elección se recuerda por placa. La etiqueta en la
parte posterior de la placa (o el nombre de la unidad en BOOTSEL,
`RPI-RP2` versus `RP2350`) te indica cuál tienes.

El diálogo rechaza una imagen que no coincida con el chip que ha
respondido (una compilación RP2350 en un RP2040, una compilación RISC-V
en una configuración ARM) antes de borrar nada, verifica cada byte
después de escribir y reinicia la placa para que ejecute el programa.

### Windows y un RP2040: instala WinUSB una vez

El bootloader RP2040 no incluye un descriptor de controlador de Windows,
por lo que el navegador no puede reclamarlo hasta que WinUSB esté
vinculado a él. Configuración única:

1. Pon la placa en BOOTSEL y conéctala.
2. Descarga y ejecuta [Zadig](https://zadig.akeo.ie).
3. Elige `RP2 Boot (Interface 1)` de la lista (Opciones, List All
   Devices si está oculto), selecciona **WinUSB** como controlador y haz
   clic en **Install Driver**.

Las placas RP2350 (Pico 2, Pico 2 W, los Unicornios Pimoroni "Pico 2 W
Aboard", Badger 2350) no necesitan nada: su bootloader incluye el
descriptor y Windows vincula WinUSB por sí mismo. macOS no necesita nada
en ninguno de los dos chips.

### Linux: una regla udev

Linux asigna los dispositivos USB a root por defecto. Crea
`/etc/udev/rules.d/99-velxio-rp2.rules` con:

```
SUBSYSTEM=="usb", ATTRS{idVendor}=="2e8a", MODE="0666", TAG+="uaccess"
```

luego `sudo udevadm control --reload-rules && sudo udevadm trigger` y
vuelve a conectar la placa. El puerto serie utilizado para el paso de
reinicio también necesita la membresía habitual del grupo `dialout`.

### Cualquier navegador: descarga el .uf2, o cópialo a la unidad

El diálogo de flasheo para una placa de la familia Pico siempre ofrece
**Download .uf2** (en Firefox y Safari, donde el navegador no puede
flashear, eso es todo el diálogo). Guarda el archivo, pon la placa en
BOOTSEL y suelta el archivo en la unidad `RPI-RP2` / `RP2350`: la placa
se reinicia y ejecuta tu sketch en el momento en que termina la copia.

En Chrome y Edge también está **Copy to the board's drive**: el
navegador te pide que elijas la unidad y escribe el archivo allí mismo.
No hay ningún controlador involucrado, por lo que es la forma de
programar un RP2040 en Windows sin instalar WinUSB. El diálogo comprueba
que la carpeta que elegiste es una unidad BOOTSEL (lleva `INFO_UF2.TXT`)
antes de escribir nada.

### Proyectos MicroPython en un Pico

El diálogo sube los archivos `.py` del proyecto a través del REPL y se
reinicia en `main.py`. MicroPython tiene que estar en la placa primero:

- **Pico y Pico W**: el diálogo lo instala. Si no responde ningún REPL,
  te pide que pongas la placa en BOOTSEL y hagas clic en Retry; ese clic
  escribe la misma compilación de MicroPython que ejecuta el simulador,
  y un Retry más sube tus archivos.
- **Placas Pimoroni RP2350** (Badger 2350, Pico Plus 2W): vienen con el
  MicroPython propio de Pimoroni. Si el tuyo lo ha perdido, descarga el
  `.uf2` de
  [pimoroni-pico-rp2350](https://github.com/pimoroni/pimoroni-pico-rp2350/releases)
  y suéltalo en la unidad BOOTSEL una vez, luego flashea desde el
  diálogo.

## Solución de problemas

- **"No board in BOOTSEL mode was found"**: el selector de dispositivos
  estaba vacío. Usa el botón de reinicio o mantén pulsado BOOTSEL
  mientras conectas, y luego vuelve a conectar.
- **"The board in BOOTSEL is an RP2040 but this project is built for
  RP2350"**: un Unicornio más antiguo con un Pico W a bordo. Elige "Pico
  W aboard" en el selector de **Real board revision** del diálogo y
  flashea de nuevo.
- **"Could not claim the USB device"** en Windows con un RP2040: el paso
  de Zadig anterior. En Linux: la regla udev anterior.
- **El reinicio serie no hizo nada**: un sketch compilado con la pila
  USB deshabilitada no se puede reiniciar por USB. Mantén pulsado BOOTSEL
  mientras conectas.

## Simula primero, flashea después

Esto cierra el ciclo que hace que Velxio sea útil para el trabajo real:
itera rápido en el simulador (sin cable, sin desgaste del hardware,
reinicios instantáneos), luego flashea el mismo artefacto de compilación
cuando se comporta correctamente.
