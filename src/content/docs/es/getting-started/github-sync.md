---
title: Sincronización con GitHub
description: Cada guardado de proyecto confirma el sketch, el estado del lienzo y un README en un repositorio de GitHub que tú controlas.
sidebar:
  order: 5
  badge: PRO
---

Cada vez que guardas un proyecto de Velxio, **GitHub Sync** confirma y
envía el sketch, el estado del lienzo y un README generado a un repositorio
de GitHub que te pertenece. Tu código sigue viviendo en tu propio control
de versiones — Velxio es solo el editor encima.

GitHub Sync es parte del nivel **Pro** — consulta
[planes](/docs/es/getting-started/plans/).

## Qué se sincroniza

En cada guardado exitoso, Velxio escribe en la raíz de tu repositorio:

- **`sketch.ino`** — más cualquier archivo adicional `.ino` / `.h` / `.c` / `.py`
  en el grupo de archivos de la placa activa.
- **`velxio.json`** — el estado completo del lienzo: tipo de placa, componentes
  colocados, cables y diseño por placa. Quien clone tu repositorio puede
  abrir el proyecto en Velxio y ver exactamente el mismo circuito.
- **`README.md`** — generado automáticamente, con el nombre del proyecto, la
  descripción y un enlace profundo "Abrir en Velxio". Libre de sobrescribir
  cuando quieras un README más completo.

Velxio nunca toca archivos fuera de esas rutas — la configuración de CI,
documentación, fotos y cualquier otra cosa en el repositorio se deja intacta.

## Cómo habilitarlo

1. Abre cualquier proyecto guardado. Haz clic en el menú de desbordamiento
   **…** en la barra de herramientas del editor y elige **Sync to GitHub**.
2. Solo la primera vez: haz clic en **Connect GitHub**. GitHub pregunta a qué
   repositorios quieres que Velxio escriba — Velxio obtiene acceso limitado a
   *solo* esos repositorios, sin permiso general de "todos tus repositorios".
3. Elige el repositorio de destino en el menú desplegable y pulsa
   **Link & sync now**. Velxio envía la confirmación inicial y muestra el SHA + enlace.
4. Eso es todo. Cada guardado posterior envía otra confirmación; el modal de
   Sync muestra la última hora de sincronización y un enlace directo a la confirmación.

## Modelo de seguridad

Velxio utiliza una **GitHub App**, no un token OAuth personal:

- **Opt-in por repositorio** — eliges en la instalación a qué repositorios
  puede escribir Velxio, y puedes revocar o añadir repositorios en cualquier
  momento desde
  [github.com/settings/installations](https://github.com/settings/installations).
- **Sin tokens de larga duración** — cada sincronización genera un token de
  instalación fresco de ~1 h; los tokens OAuth de usuario se usan exactamente
  una vez (para obtener tu perfil de GitHub durante la conexión) y se descartan.
- **Límite de tasa aislado** — la App tiene su propia cuota, separada de la de
  tus herramientas personales.
- **Desconexión limpia** — eliminar la Velxio App de tu configuración de GitHub
  revoca el acceso inmediatamente; Velxio detecta el webhook y se desconecta
  sin estado obsoleto.

## Conflictos y ediciones manuales

La sincronización es actualmente **push unidireccional**: Velxio → GitHub.
Las ediciones manuales hechas en GitHub entre guardados de Velxio se sobrescriben
en el siguiente guardado — Velxio es la fuente de verdad para los archivos
sincronizados.

¿Quieres desarrollar localmente en VS Code por un tiempo? **Desvincula** el
proyecto (modal Sync → *Unlink*), trabaja en tu clon local, y luego vuelve a
vincular cuando estés listo para trabajar desde Velxio de nuevo. La
sincronización bidireccional está en la hoja de ruta.

## Preguntas frecuentes

**¿Qué pasa si una sincronización falla?**
Los fallos aparecen en el modal de Sync con una acción de recuperación
(Reconnect GitHub, elegir un repositorio diferente, intentar de nuevo más
tarde). El guardado en sí nunca se bloquea — tu proyecto siempre se guarda
dentro de Velxio.

**¿Puedo sincronizar con un repositorio que no me pertenece?**
Sí, siempre que la GitHub App esté instalada en la organización y tengas
acceso de escritura allí.

**¿Qué pasa con los repositorios privados?**
Totalmente compatibles — lo que autorices durante la instalación se vuelve
escribible, público o privado.

**¿Puedo personalizar el README?**
Velxio sobrescribe `README.md` en cada sincronización hoy. En la hoja de
ruta: omitir la sobrescritura una vez que hayas tomado posesión del archivo.
```
