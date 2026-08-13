---
title: Tu primer proyecto
description: Abre el ejemplo de parpadeo, ejecútalo, observa el LED parpadear y hazlo tuyo — en cinco minutos.
sidebar:
  order: 2
---

La forma más rápida de entender Velxio es ejecutar algo. En este tutorial
abrirás el clásico ejemplo de _parpadeo_, lo ejecutarás, verás un ESP32 simulado
manejar un circuito LED real y luego cambiarás el código.

## 1. Abre el ejemplo

Ve a [velxio.dev/example/esp32-blink-led](https://velxio.dev/example/esp32-blink-led)
(o busca **ESP32 Blink** en la [galería de ejemplos](/docs/es/getting-started/examples-gallery/)).

![El ejemplo de parpadeo cargado en el editor](../../../../assets/docs/getting-started/first-project-loaded.png)

Obtienes un proyecto completo: el **código** a la izquierda (un sketch de Arduino que
alterna dos LEDs) y el **circuito** en el medio — un ESP32 DevKit conectado
a través de una resistencia a un LED externo.

## 2. Pulsa Run (Ejecutar)

Haz clic en el botón verde **Run** en la barra de herramientas (o pulsa **Ctrl+B** para
compilar primero). Velxio compila tu sketch con la cadena de herramientas real de Arduino/ESP-IDF
en la nube — la consola **Output** (Salida) en la parte inferior izquierda transmite
el progreso del compilador, exactamente como lo haría el IDE de Arduino.

La primera compilación de una sesión puede tardar un poco; después de eso, las compilaciones
son mucho más rápidas.

## 3. Observa cómo se ejecuta

Cuando la compilación termina, el firmware arranca en el ESP32 emulado:

![El ejemplo de parpadeo ejecutándose: LED encendido, salida serial fluyendo](../../../../assets/docs/getting-started/first-project-running.png)

Tres cosas suceden a la vez:

- **El LED en el lienzo parpadea** — la simulación maneja el componente
  real, a través de la resistencia real.
- **El monitor serial** muestra el registro de arranque y luego `LED ON` / `LED OFF`,
  directamente desde `Serial.println()` en el sketch.
- La insignia amarilla **SPICE** sobre el circuito muestra el motor analógico
  resolviendo la trayectoria de la corriente del LED.

## 4. Hazlo tuyo

Edita el sketch — por ejemplo, cambia el retardo para que parpadee más rápido:

```cpp
delay(100);   // era 500
```

Pulsa **Run** de nuevo. Ese es todo el ciclo: editar, ejecutar, observar.

## 5. Guárdalo

Haz clic en el **icono de guardar** sobre el árbol de archivos (o **Ctrl+S**), dale
un nombre al proyecto y se almacenará en tu cuenta. Consulta
[Guardar y abrir proyectos](/docs/es/getting-started/projects/).

> **Tip (Consejo):** ¿Atascado en algún punto? Abre el asistente de IA a la derecha y pregunta —
> "¿por qué mi LED no parpadea?" es uno de sus ejemplos de indicaciones por una razón.
> Consulta [Asistente de IA](/docs/es/ai/overview/).

## Dónde continuar

- [Recorrido por la interfaz](/docs/es/getting-started/interface-tour/) — qué hace cada
  panel y botón.
- [Editor de circuitos](/docs/es/circuit-editor/overview/) — construye un circuito desde
  cero en lugar de comenzar desde un ejemplo.
- [Placas compatibles](/docs/es/boards/overview/) — cambia el ESP32 por un
  Arduino UNO, un Pi Pico, un STM32…
