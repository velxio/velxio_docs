---
title: "Flasha hardware real desde el navegador"
description: "Escribe tu proyecto compilado en una placa física por USB — sin necesidad de instalar herramientas."
sidebar:
  order: 4
---

Cuando tu proyecto funciona en el simulador, puedes ponerlo en una **placa
real** sin instalar nada: Velxio flashea el firmware compilado
por USB, directamente desde el navegador.

## Requisitos

- Un navegador basado en Chromium (Chrome o Edge) — el flasher utiliza la
  API de puerto serie del navegador, que Firefox y Safari no incluyen.
- Un cable USB con capacidad de datos para tu placa.
- Cierra cualquier otra cosa que use el puerto primero (monitores serie, IDEs) — el
  navegador necesita acceso exclusivo.

## Flasheo

1. Abre el diálogo **Flash** desde el editor.
2. Selecciona el puerto serie USB — el diálogo detecta automáticamente los candidatos, y el
   navegador te pide que confirmes qué puerto conceder.
3. Velxio utiliza el firmware que ya compiló para tu placa — el mismo
   binario que estaba ejecutando el simulador.
4. Observa el progreso; cuando termine, la placa se reinicia en tu
   proyecto.

Las placas RP2040/RP2350 flashean su `.uf2`, las placas ESP32 su `.bin` — el
diálogo elige el protocolo correcto para el objetivo.

## Simula primero, flashea después

Esto cierra el ciclo que hace que Velxio sea útil para el trabajo real: itera
rápidamente en el simulador (sin cable, sin desgaste del hardware, reinicios
instantáneos), y luego flashea el mismo artefacto de compilación cuando se comporta correctamente.
