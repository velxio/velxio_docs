---
title: "Mis Chips: guarda y reutiliza tus chips"
description: Guarda un chip personalizado una vez y colócalo en cualquier proyecto desde tu selector de componentes, etiquetado como CUSTOM. Plan Pro.
sidebar:
  order: 4
---

¿Has creado un chip que vale la pena conservar? Guárdalo en **Mis Chips** y pasará a formar parte de *tu* selector de componentes — en cada proyecto, listo para ejecutarse, marcado con una insignia violeta **CUSTOM**. Solo tú puedes ver tu biblioteca.

:::note[Pro]
Guardar chips es parte del plan Pro (el mismo derecho que habilita
"Crear con IA"). Editar y compilar chips dentro de un proyecto funciona en
todos los planes.
:::

## Guardar un chip

En el explorador de archivos, cada chip personalizado tiene su propia sección. Haz clic en el botón **save** (guardar) en su encabezado (junto a Compile), asígnale un nombre y una descripción opcional, y estará en tu biblioteca — compilado y listo. Guardar un chip con un nombre que ya hayas utilizado ofrece actualizar la entrada existente, de modo que un chip puede evolucionar entre proyectos.

El agente de IA también puede hacerlo: pídele que *"guarde este chip en mis chips"* (`save_custom_chip`), que liste lo que tienes (`list_my_chips`), o que coloque uno guardado (`use_my_chip`) — y los agentes externos conectados a través del [puente MCP](/docs/es/ai/connect-external-agent/) obtienen las mismas tres herramientas.

## Usar un chip guardado

Abre el selector de componentes y tus chips estarán allí, con la insignia CUSTOM en la tarjeta. Colocar uno **copia** el chip en el proyecto — fuente, manifiesto y binario compilado — de modo que los proyectos permanezcan completamente autocontenidos: editar la copia nunca toca tu biblioteca, y compartir el proyecto comparte un chip funcional, no una referencia que solo tú puedes resolver.

Los chips colocados aterrizan directamente en el editor con sus `chip.c` y `chip.json` como archivos ordinarios, como cualquier chip personalizado.

## Límites

- Hasta **100 chips** por cuenta.
- Fuente de hasta 64 KB, chip compilado de hasta ~512 KB.
- Eliminar un proyecto nunca elimina los chips de la biblioteca, y eliminar un chip de la biblioteca nunca toca los proyectos que lo copiaron.
