---
title: Cableado
description: Conecta pines con cables, enrútalos y codifícalos por colores como un kit de jumpers real.
sidebar:
  order: 3
---

## Realizando una conexión

Haz clic en un **pin** de cualquier componente: un cable comienza a seguir tu cursor. Haz clic en el pin de destino para finalizarlo. Los cables se enrutan ortogonalmente (curvas en ángulo recto), de la manera en que se leen mejor los esquemáticos y las fotos de protoboards.

- Presiona **Escape** para cancelar un cable que hayas comenzado.
- Haz clic en un cable para seleccionarlo; **Delete** lo elimina.
- También puedes comenzar a cablear desde el [inspector de componentes](/docs/es/circuit-editor/part-inspector/):
  haz clic derecho en un componente y "toca un pin para cablear".

## Colores de los cables

Mientras un cable está en progreso (o con un cable seleccionado), presiona una tecla para establecer su color: la misma convención de paleta que los usuarios de Wokwi conocen:

| Tecla | Color   | Tecla                       | Color                                      |
| ----- | ------- | --------------------------- | ------------------------------------------ |
| `0`   | Negro   | `6`                         | Azul                                       |
| `1`   | Marrón  | `7`                         | Violeta                                    |
| `2`   | Rojo    | `8`                         | Gris                                       |
| `3`   | Naranja | `9`                         | Blanco                                     |
| `4`   | Dorado  | `c` / `l` / `m` / `p` / `y` | Cian / Lima / Magenta / Púrpura / Amarillo |
| `5`   | Verde   |                             |                                            |

Los cables nuevos reciben un color automático de kit de jumpers: los cables vecinos eligen colores visiblemente diferentes, con rojo y negro reservados para las líneas de alimentación.

## Protoboards

Cuando los pines de un componente están en los orificios de la protoboard, aparecen **puntos verdes** en los pines asentados: "enchufado y conectado" es visible de un vistazo, sin necesidad de pasar el cursor. Las líneas internas de la protoboard (filas y tiras de alimentación) conducen exactamente como las reales.

## Realidad eléctrica

Los cables no son solo dibujos: el motor analógico resuelve el circuito que realmente has cableado. Una resistencia en serie faltante, un cortocircuito, una entrada flotante: todo se comporta (y se comporta mal) como en el banco de trabajo. Si una conexión quemaría un componente en modo eléctrico, el verificador de circuitos te advierte antes de **Run** (Ejecutar).
