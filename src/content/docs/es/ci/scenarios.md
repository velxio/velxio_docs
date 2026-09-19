---
title: Escenarios
description: "Controla la placa simulada desde un archivo YAML: espera al puerto serie, envía bytes, pulsa un botón, ajusta un sensor, comprueba un pin, todo sobre el reloj simulado."
sidebar:
  order: 4
---

`--expect-text` responde a una pregunta: ¿apareció alguna vez esta línea? Un escenario responde al resto. Es un archivo YAML que enumera los pasos que el ejecutor realiza en orden, sobre el **reloj simulado** de la placa principal.

Los nombres de los campos son los de Wokwi, por lo que un escenario de Wokwi existente se ejecuta sin cambios.

```yaml
# scenario.yaml
name: uno-ready boots and blinks
version: 1
steps:
  - wait-serial: READY
  - delay: 600ms
  - expect-pin:
      part-id: uno
      pin: 13
      expected: 1
```

```bash
velxio-cli run --scenario scenario.yaml .
```

La ejecución pasa cuando pasa el último paso, y falla en el primer paso que no lo hace. Cada paso se reporta a medida que ocurre:

```
ok   wait-serial "READY" at 0.004 s
ok   delay 600 ms at 0.604 s
ok   expect-pin uno:13 expected 1 at 0.604 s
PASS in 0.60 s simulated (2.9 s wall) · billed 1 s · exit 0
```

## Pasos

| paso              | campos                                                                                      | qué hace                                                                                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `delay`           | `500ms`, `2s`, `100us`; un número sin unidad son milisegundos                                | espera hasta que el reloj simulado alcance `t0 + n`                                                                                                                           |
| `wait-serial`     | una cadena, de como máximo 512 bytes                                                        | coincidencia de subcadena, byte a byte, sobre el puerto serie recibido desde el `wait-serial` anterior. Si el presupuesto se agota antes, la ejecución termina con `timeout`   |
| `write-serial`    | una cadena UTF-8, o una lista de bytes `0..255`                                             | escribe en el UART de la placa principal                                                                                                                                      |
| `expect-pin`      | `part-id`, `pin`, `expected` (`0`/`1`, `high`/`low`, `true`/`false`; también se acepta `value`) | lee el pin una vez, inmediatamente. Una discrepancia hace fallar la ejecución e informa del nivel que realmente leyó                                                          |
| `set-control`     | `part-id`, `control`, `value` (número, cadena o booleano)                                   | `pressed` sobre un botón lo pulsa o lo suelta; los demás controles son los controles de sensor y atributos de la pieza. Un control desconocido hace fallar la ejecución y enumera los que tiene esa pieza |
| `take-screenshot` | `part-id`, `save-to` y/o `compare-with`, `tolerance`                                        | captura un PNG de esa pieza en ese punto de la ejecución                                                                                                                      |

Cualquier paso puede llevar un `name:` junto a su clave, solo para el registro.

Límites: 200 pasos y 20 capturas de pantalla por ejecución.

## Todo es tiempo simulado

`delay: 600ms` son 600 milisegundos del reloj del invitado, no del reloj de pared. El mismo escenario tarda el mismo tiempo simulado en un ejecutor cargado y en uno inactivo, que es lo que hace que el resultado sea reproducible, y por lo que se te factura.

:::caution
No vincules un nivel de pin a una línea serie. Los bytes serie se encolan en el UART y terminan de enviarse después del código que los encoló, por lo que un `wait-serial` sobre una línea impresa en el mismo bucle que un `digitalWrite` puede caer en el lado equivocado del flanco, por fracciones de milisegundo, cada vez. Usa `wait-serial` para un centinela de arranque, y luego un `delay` que sitúe la lectura en el medio de la ventana que esperas.
:::

## Controlar entradas

```yaml
steps:
  - wait-serial: READY
  - set-control:
      part-id: btn1
      control: pressed
      value: 1
  - delay: 50ms
  - set-control:
      part-id: btn1
      control: pressed
      value: 0
  - wait-serial: "pressed"
```

`part-id` es el id de tu `diagram.json` (o del `.vlx`), nunca uno interno. Un paso que nombra una pieza que no existe se rechaza antes de que empiece la ejecución, con `scenario_part_missing` y salida 2: no se factura nada.

Los bytes van en sentido contrario con `write-serial`, y vuelven byte a byte, incluidos los valores por encima de `0x7f`:

```yaml
steps:
  - wait-serial: ECHO READY
  - write-serial: "hi\n"
  - wait-serial: "hi"
```

## Capturas de pantalla

```yaml
- take-screenshot:
    part-id: oled1
    save-to: shots/oled.png
```

El PNG de esa pieza se captura en ese punto de la ejecución y se escribe en `save-to`, resuelto respecto al directorio del proyecto. Una ejecución cuya única expectativa es una captura de pantalla pasa una vez tomada la última captura.

:::note
`compare-with` se analiza y se sube, pero la comparación **aún no está implementada**: se captura la captura de pantalla, la ejecución lleva una advertencia diciendo que no se comparó, y nunca hace fallar la ejecución. Por ahora, compara el PNG en tu propio job.
:::

## Flags que se convierten en pasos

Puedes expresar los casos simples sin un archivo, y se combinan con uno:

| flag                                      | equivalente                                                                                                                     |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `--expect-text X`                         | un `wait-serial X` final                                                                                                        |
| `--screenshot-part P --screenshot-time T` | `delay T` y luego `take-screenshot P`                                                                                             |
| `--fail-text Y`                           | no es un paso: `Y` se vigila en cada fragmento serie de cada placa, durante toda la ejecución, y la termina con `failed` en el momento en que aparece |

## Escribir en la placa

`--interactive` reenvía tu stdin al puerto serie de la placa principal, agrupado cada 20 ms. Funciona junto con un escenario: ambos escriben en el mismo UART, en orden de llegada. Cerrar stdin termina la entrada, no la ejecución: eso lo hace el presupuesto o el escenario.

## Aún no compatible

- **Pasos táctiles** (`touch-press`, `touch-move`, `touch-release`). La CLI los rechaza en el momento del lint en lugar de omitirlos.
- **Comparación de capturas de pantalla**, como se indicó arriba.
- **Chips personalizados** en una ejecución de CI: un `[[chip]]` en la configuración se rechaza con `feature_unsupported`.

Consulta [Códigos de salida](/docs/es/ci/exit-codes/) para saber qué devuelve cada fallo a tu job, y [velxio.toml](/docs/es/ci/velxio-toml/) para saber cómo se asocia un escenario a un proyecto de forma predeterminada.
