---
title: Recorrido por la interfaz
description: "El editor de un vistazo: lienzo, editor de código, barra de herramientas, consolas y el panel de IA."
sidebar:
  order: 3
---

Este es el editor de Velxio con un proyecto en ejecución:

![El editor de Velxio, anotado por región](../../../../assets/docs/getting-started/first-project-running.png)

## La barra de menú

**File · Edit · View · Account · Help** — operaciones de proyecto, deshacer/rehacer,
visibilidad de paneles, tu cuenta y plan, y recursos de ayuda.

## La barra de herramientas

De izquierda a derecha:

| Control              | Qué hace                                                                                                             |
| -------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Alternar diseño      | Muestra el editor de **Code**, el lienzo de **Circuit**, o **Both** lado a lado                                      |
| Selector de lenguaje | **Arduino C++**, **MicroPython** o **ESP-IDF** — según la placa, consulta [Idiomas](/docs/es/programming/languages/) |
| **Compile** (Ctrl+B) | Compilar sin ejecutar                                                                                                |
| **Run**              | Compilar si es necesario y luego iniciar la simulación                                                               |
| **Stop** / **Reset** | Detener la simulación / reiniciar el firmware desde el principio                                                     |
| **Libraries**        | Buscar e instalar librerías de Arduino                                                                               |
| Alternar salida      | Mostrar/ocultar la consola de salida del compilador                                                                  |
| Selector de placa    | A qué placa se aplican el editor de código y **Run** (los proyectos pueden tener varias)                             |
| **Serial**           | Alternar el [monitor serie](/docs/es/programming/serial-monitor/)                                                    |
| **Scope**            | Alternar el [osciloscopio / analizador lógico](/docs/es/instruments/oscilloscope/)                                   |
| **Add**              | Abrir el [selector de componentes](/docs/es/circuit-editor/placing-components/)                                      |

## El panel del espacio de trabajo (izquierda)

El árbol de archivos de tu proyecto: cada placa tiene sus propios archivos (`sketch.ino`,
`libraries.json`, cualquier cosa que agregues). Los iconos que están encima crean un nuevo
espacio de trabajo a partir de una [plantilla de inicio](/docs/es/getting-started/projects/), abren
un archivo de proyecto y guardan.

## El lienzo (centro)

Donde vive el circuito. Desplázate para paneo, usa los controles de zoom en la parte inferior
derecha, haz clic en las piezas para seleccionarlas, haz clic derecho para su
[inspector](/docs/es/circuit-editor/part-inspector/). La insignia amarilla **SPICE**
informa el estado del motor analógico para el circuito seleccionado.

## Las consolas (parte inferior)

- **Output** — mensajes del compilador y del sistema.
- **Serial monitor** — una pestaña por placa en ejecución; cuadro de entrada para enviar datos
  de vuelta. Consulta [Monitor serie](/docs/es/programming/serial-monitor/).
- **Oscilloscope** — cuando está activado. Consulta
  [Osciloscopio](/docs/es/instruments/oscilloscope/).

## El panel de IA (derecha)

El asistente en sus tres modos — **Basic**, **Agent**, **Tutor** — con
tu cuota diaria restante en la parte inferior. Consulta
[Asistente de IA](/docs/es/ai/overview/). Minimízalo con el botón de flecha cuando
quieras ver el lienzo completo.

----- END PAGE -----
