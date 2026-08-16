---
title: Recorrido por la interfaz
description: "El editor de un vistazo: lienzo, editor de código, barra de herramientas, consolas y el panel de IA."
sidebar:
  order: 4
---

Este es el editor de Velxio con un proyecto en ejecución:

![El editor de Velxio, anotado por región](../../../../assets/docs/getting-started/first-project-running.png)

## La barra de menú

![La barra de menú de Velxio: Archivo, Edición, Ver, Cuenta, Ayuda](../../../../assets/docs/getting-started/interface-menu-bar.png)

**File · Edit · View · Account · Help** — operaciones de proyecto, deshacer/rehacer,
visibilidad de paneles, tu cuenta y plan, y recursos de ayuda.

## La barra de herramientas

![La barra de herramientas del editor, desde los conmutadores de diseño hasta el botón Add](../../../../assets/docs/getting-started/interface-toolbar.png)

De izquierda a derecha:

| Control                | Qué hace                                                                                                   |
| ---------------------- | ---------------------------------------------------------------------------------------------------------- |
| Conmutadores de diseño | Muestra el editor de **Code**, el lienzo de **Circuit**, o **Both** lado a lado                            |
| Selector de lenguaje   | **Arduino C++**, **MicroPython** o **ESP-IDF** — según la placa, consulta [Lenguajes](/docs/es/programming/languages/) |
| **Compile** (Ctrl+B)   | Compilar sin ejecutar                                                                                      |
| **Run**                | Compilar si es necesario y luego iniciar la simulación                                                     |
| **Stop** / **Reset**   | Detener la simulación / reiniciar el firmware desde el principio                                           |
| **Libraries**          | Buscar e instalar librerías de Arduino                                                                     |
| Conmutador de salida   | Mostrar/ocultar la consola de salida del compilador                                                        |
| Selector de placa      | A qué placa se aplican el editor de código y **Run** (los proyectos pueden tener varias)                   |
| **Serial**             | Activar el [monitor serie](/docs/es/programming/serial-monitor/)                                              |
| **Scope**              | Activar el [osciloscopio / analizador lógico](/docs/es/instruments/oscilloscope/)                             |
| **Add**                | Abrir el [selector de componentes](/docs/es/circuit-editor/placing-components/)                               |

## El panel de espacio de trabajo (izquierda)

![El panel de espacio de trabajo con el árbol de archivos del proyecto](../../../../assets/docs/getting-started/interface-workspace.png)

El árbol de archivos de tu proyecto: cada placa tiene sus propios archivos (`sketch.ino`,
`libraries.json`, cualquier cosa que añadas). Los iconos que hay encima crean un nuevo
espacio de trabajo a partir de una [plantilla de inicio](/docs/es/getting-started/projects/), abren
un archivo de proyecto y guardan.

## El lienzo (centro)

![El lienzo con un circuito de parpadeo ESP32, la insignia SPICE y los controles de zoom](../../../../assets/docs/getting-started/interface-canvas.png)

Aquí es donde vive el circuito. Desplázate para moverte, usa los controles de zoom en la parte inferior
derecha, haz clic en las piezas para seleccionarlas, haz clic derecho para abrir su
[inspector](/docs/es/circuit-editor/part-inspector/). La insignia amarilla **SPICE**
informa del estado del motor analógico para el circuito seleccionado.

## Las consolas (abajo)

![La consola de salida y el monitor serie lado a lado](../../../../assets/docs/programming/serial-monitor.png)

- **Output** — mensajes del compilador y del sistema.
- **Serial monitor** — una pestaña por placa en ejecución; cuadro de entrada para enviar datos
  de vuelta. Consulta [Monitor serie](/docs/es/programming/serial-monitor/).
- **Oscilloscope** — cuando está activado. Consulta
  [Osciloscopio](/docs/es/instruments/oscilloscope/).

## El panel de IA (derecha)

![El panel de IA con las pestañas Basic, Agent y Tutor y el contador de créditos](../../../../assets/docs/getting-started/interface-ai-panel.png)

El asistente en sus tres modos — **Basic**, **Agent**, **Tutor** — con
tu cuota diaria restante en la parte inferior. Consulta
[Asistente de IA](/docs/es/ai/overview/). Minimízalo con el botón de flecha cuando
quieras ver el lienzo completo.
