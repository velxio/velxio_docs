---
title: "referencia de controles"
description: "Cada campo de la sección de controles en chip.json, la alternativa automática de deslizador, cómo se almacenan los valores y qué comprobar cuando un control no hace nada."
sidebar:
  order: 6
---

La matriz `controls` en `chip.json` describe lo que muestra el panel mientras
se ejecuta la simulación. Cada entrada controla el atributo cuyo `name` coincide
con el `id` de la entrada.

## Campos de entrada

| Campo | Se aplica a | Significado |
| --- | --- | --- |
| `id` | todos | **Obligatorio.** El atributo que controla esta entrada. Una entrada sin `id` se omite |
| `type` | todos | `"range"` para un deslizador, `"button"` para un disparador momentáneo. Cualquier otro valor se ignora y la entrada no produce nada |
| `label` | todos | Texto junto al control. Se usa el `label` del atributo como alternativa, y luego el `id` |
| `min` | range | Límite inferior. Se usa el `min` del atributo como alternativa, y luego `0` |
| `max` | range | Límite superior. Se usa el `max` del atributo como alternativa, y luego `100` |
| `step` | range | Incremento. Se usa el `step` del atributo como alternativa, y luego `1` cuando el rango es mayor de 20, de lo contrario `0.01` |
| `unit` | range | Se muestra después del valor, por ejemplo `ppm` o `%`. Vacío por defecto |
| `scale` | range | `"log"` da un deslizador logarítmico. Se ignora cuando `min` es negativo, ya que la curva no está definida allí |

La **posición inicial** de un deslizador no se toma del control. Proviene
del `default` del atributo, con `min` como alternativa. Mantén el `default`
del atributo dentro del rango del control o el panel se abrirá con el
controlador fijado en un extremo.

## El título del panel

Se toma del `name` del chip. Un chip sin `name` muestra "Custom Chip".

## La alternativa automática

No es necesario escribir `controls` en absoluto.

**Cualquier atributo que declare tanto `min` como `max`, y que ningún control
explícito ya reclame, recibe un deslizador.** Su etiqueta proviene del
`label` del atributo, su paso del `step` del atributo, o se infiere:
`1` para `type: "int"`, de lo contrario `1` cuando el rango es mayor de 20 y
`0.01` cuando no lo es. No recibe unidad.

Por lo tanto, `controls` solo es necesario para renombrar un deslizador, añadir
una unidad, hacerlo logarítmico o declarar un botón. Dos consecuencias prácticas:

- Los chips escritos antes de que existieran los controles en vivo ya son
  ajustables con frecuencia, sin necesidad de edición.
- Un chip cuyos atributos no tienen `min`/`max` y sin sección `controls`
  muestra **ningún panel en absoluto**. Esa es la razón habitual por la que
  hacer clic en un chip parece no hacer nada.

## Botones

Una entrada `"button"` representa un disparador momentáneo para líneas de
reinicio, eventos de tipo "simular movimiento" y cualquier otra cosa que sea
un flanco en lugar de un nivel:

![Un control de botón y un deslizador de tiempo de retención en el panel del sensor de movimiento](../../../../../assets/docs/custom-chips/motion-button-panel.png) Al presionarlo, el atributo se establece en `1` y vuelve a `0` unos
150 ms después, por lo que tu chip debe tratar una lectura distinta de cero
como "el evento ocurrió" en lugar de intentar capturar un instante específico.

## Dónde se almacenan los valores

Las posiciones de los deslizadores se reflejan en las propiedades guardadas
del componente (bajo `attrs`) unos 250 ms después de que dejes de moverlos,
con los valores pendientes fusionados. Es por eso que arrastrar un deslizador
no escribe en el proyecto en cada píxel, y por qué la posición sigue
sobreviviendo a un guardado y recarga.

El espejo es una *copia*. El valor que lee el chip en ejecución es el vivo,
aplicado en el momento en que el control se mueve.

## Motores

| Motor | Cómo llega el valor |
| --- | --- |
| AVR, RP2040, ESP32 en el navegador | Escrito directamente en el almacén de atributos que WebAssembly lee en cada `vx_attr_read` |
| ESP32 en el backend QEMU | Reenviado al trabajador y aplicado al almacén de atributos del runtime del chip allí |

Ambos son en vivo: sin recompilar, sin reiniciar, sin botón "aplicar". La única
latencia es la frecuencia con la que tu propio código llama a `vx_attr_read`.

## Plan

Los controles en vivo son **gratuitos**, en todos los planes, al igual que
escribir, compilar y ejecutar el chip que los declara. Dos características
vecinas son de pago: que la IA cree un chip o sensor por ti (Maker y superior),
y la biblioteca [My Chips](/docs/es/custom-chips/my-chips/) que mantiene un chip
en el servidor para reutilizarlo entre proyectos (Pro).

## Cuando un control no hace nada

| Síntoma | Causa |
| --- | --- |
| Al hacer clic en el chip no se abre ningún panel | Sin entrada `controls` y sin atributo con `min` y `max`, o la simulación está detenida |
| Falta una entrada específica en el panel | Su `type` no es ni `range` ni `button`, o no tiene `id` |
| El deslizador se mueve pero nada cambia | El chip almacenó en caché `vx_attr_read` en lugar de llamarlo donde se usa el valor |
| El deslizador comienza en el extremo equivocado | El `default` del atributo está fuera del `min`/`max` del control |
| El valor salta en números enteros | `step` se infirió como `1` porque el rango es mayor de 20; establece `step` explícitamente |
| Un deslizador logarítmico es lineal | `scale: "log"` se ignora cuando `min` es negativo |

## Véase también

- [Tutorial: un sensor de CO2 analógico](/docs/es/custom-chips/programmable-sensors/co2-analog/)
- [Tutorial: temperatura y humedad a través de I2C](/docs/es/custom-chips/programmable-sensors/i2c-env/)
- [Referencia de la API de chips personalizados](/docs/es/custom-chips/api/)
- Ejemplos en ejecución de cada campo aquí: el
  [botón](https://velxio.dev/example/motion-sensor-sim-button), el
  [deslizador logarítmico](https://velxio.dev/example/night-light-log-slider), un
  sensor [SPI](https://velxio.dev/example/spi-thermometer-live-slider) y un
  sensor [UART](https://velxio.dev/example/uart-air-sensor-live-slider)
