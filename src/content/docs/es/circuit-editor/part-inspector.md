---
title: Inspector de componentes y hojas de datos
description: "Haga clic derecho en cualquier componente para ver sus propiedades, distribución de pines, hoja de datos y proyectos de ejemplo."
sidebar:
  order: 4
---

**Haga clic derecho en cualquier componente** en el lienzo para abrir su inspector:

![El inspector de componentes: pestaña de propiedades](../../../../assets/docs/circuit-editor/part-inspector.png)

El lado izquierdo muestra el componente con sus pines numerados: **toque un pin para iniciar
un cable** desde él. La barra inferior tiene **Rotate** (Rotar) y **Delete** (Eliminar).

## Pestaña de propiedades

Todo lo editable sobre el componente: el valor de una resistencia, el color de un LED, la
dirección I2C de un sensor, la variante de una pantalla. Debajo de las propiedades, los enlaces de
**Example projects** (Proyectos de ejemplo) abren circuitos ya preparados que usan este componente.

Los cambios de propiedades surten efecto de inmediato: cambie una resistencia de 220 a
10k mientras la simulación está en ejecución y observe cómo el LED se atenúa.

## Pestaña de hoja de datos

![El inspector de componentes: pestaña de hoja de datos](../../../../assets/docs/circuit-editor/datasheet.png)

Una hoja de datos práctica y condensada: qué es el componente, las funciones de los pines en una
tabla, los valores eléctricos que importan (voltaje directo, corriente
típica, resistencia en serie recomendada…), y consejos de uso. El botón **Product
page** (Página del producto) enlaza al componente real, para que pueda comprar exactamente lo que
simuló.

El mismo contenido se encuentra en la
[referencia de componentes](/docs/es/parts/overview/) de esta documentación; ambos se generan a partir de la
misma fuente, por lo que nunca discrepan.
