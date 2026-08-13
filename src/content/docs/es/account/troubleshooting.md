---
title: Solución de problemas
description: Las comprobaciones que solucionan la mayoría de los problemas, en orden.
sidebar:
  order: 4
---

## La simulación no se inicia

1. Revisa la **consola de salida** — si la compilación falló, el error
   está ahí, con archivo y línea. Consulta
   [errores de compilación](/docs/es/programming/compile-and-run/).
2. Una advertencia del **verificador de circuitos** (por ejemplo, un LED sin
   resistencia en serie en modo eléctrico) bloquea la ejecución a propósito —
   corrige el cableado marcado.
3. La primera ejecución de una sesión compila en frío y puede tardar un poco
   con los toolchains grandes (ESP-IDF); las ejecuciones posteriores son mucho
   más rápidas. Dale tiempo a la primera antes de asumir que se colgó.

## Se ejecuta, pero no pasa nada

- ¿Está seleccionada la **placa correcta** en el selector de placas de la barra de herramientas?
- Abre el **monitor serie** — un firmware que falló o está esperando
  entrada te lo dice ahí.
- Haz clic derecho en los componentes para confirmar sus **propiedades**
  (una tira de NeoPixel configurada con 0 LEDs no dibuja absolutamente nada).

## La página en sí se comporta mal

- Velxio requiere un **Chromium o Firefox de escritorio**, razonablemente actualizado.
- Recarga forzada (Ctrl+Shift+R) después de las actualizaciones — un bundle
  en caché obsoleto puede combinarse mal con un backend nuevo.
- Las extensiones del navegador que interfieren con WebAssembly, canvas o
  WebSockets (bloqueadores de privacidad agresivos) pueden romper los
  emuladores — prueba con una ventana de incógnito.

## El flash web no detecta mi placa

- Usa **Chrome o Edge** — Firefox/Safari no incluyen la API de serie
  del navegador.
- Cierra cualquier otro programa que use el puerto (monitores serie, IDEs).
- Prueba con otro cable — los cables USB solo de carga son la trampa clásica.

## Los ejemplos de WiFi no se conectan

- El SSID es exactamente **`Velxio-GUEST`**, abierto, sin contraseña.
- Observa el monitor serie para ver las líneas de progreso de la pila WiFi
  (`wifi:connected`, `got ip`) y saber qué paso falla.

## ¿Sigue atascado?

Pregunta al [asistente de IA](/docs/es/ai/overview/) con tu proyecto abierto —
lee los mismos errores que tú. Para errores, contacta al equipo a través del
menú **Ayuda**, Discord o GitHub.
