---
title: Conecta Claude Code o Codex
description: "Controla un proyecto guardado desde tu propio agente de IA (Claude Code / Codex) a través de MCP: construye el circuito y escribe el firmware en vivo en tu lienzo."
sidebar:
  order: 5
  badge:
    text: Pro
    variant: tip
---

El [modo Agente](/docs/es/ai/agent-mode/) integrado de Velxio ejecuta el asistente
_dentro_ de la aplicación. **Connect AI agent** hace lo contrario: permite que tu
propio agente — **Claude Code** o **OpenAI Codex** en tu terminal — acceda a un
proyecto guardado de Velxio y lo construya por ti. El circuito y el código aparecen en
tu lienzo en unos segundos, exactamente como si el agente integrado lo hubiera hecho.

Funciona a través de [MCP](https://modelcontextprotocol.io) (el Protocolo de
Contexto de Modelos): Velxio expone sus herramientas de circuito y código como un
servidor MCP, y tú apuntas tu agente hacia él con un token específico del proyecto.

![El modal de Connect AI agent, que muestra las pestañas Claude Code / Codex, el comando de configuración y la conexión activa](../../../../assets/docs/ai/connect-agent.png)

:::note
Conectar un agente externo es una función **Pro**. Los planes Gratuito y Maker utilizan
los modos [Agente](/docs/es/ai/agent-mode/) y [Tutor](/docs/es/ai/tutor-mode/) integrados
en su lugar. Consulta [planes](/docs/es/getting-started/plans/).
:::

## La forma más rápida: el plugin de Claude Code

Si usas Claude Code, instala el plugin: incluye las herramientas, un
comando `/velxio:build` y el conocimiento de cableado en un solo paso:

```
/plugin marketplace add velxio/velxio-plugin
/plugin install velxio@velxio
```

Luego genera un token (pasos a continuación), expórtalo y reinicia Claude Code:

```bash
export VELXIO_MCP_TOKEN="vlxmcp_...tu token..."
```

Ahora `/velxio:build un HC-SR04 que imprima la distancia por serial` hace todo el
trabajo. `/velxio:check` valida y compila lo que ya existe.

## Conectar manualmente, en tres pasos

1. **Guarda el proyecto primero.** El agente se conecta a un proyecto guardado, así que
   dale un nombre y guárdalo si aún no lo has hecho.
2. **Abre el conector.** En el editor, ve a **File → Connect AI agent
   (Claude/Codex)**, elige la pestaña **Claude Code** o **Codex CLI**, y haz clic en
   **Generate connection token**.
3. **Ejecuta la configuración de una línea** que te muestra, en tu terminal:

   **Claude Code**

   ```bash
   claude mcp add --transport http velxio https://velxio.dev/api/pro/mcp \
     --header "Authorization: Bearer vlxmcp_tu_token_aqui"
   ```

   **Codex** — añade a `~/.codex/config.toml`:

   ```toml
   [mcp_servers.velxio]
   url = "https://velxio.dev/api/pro/mcp"
   http_headers = { "Authorization" = "Bearer vlxmcp_tu_token_aqui" }
   ```

Eso es todo. Inicia `claude` (o `codex`) y pídele que construya algo:

> _"Usando las herramientas de velxio, conecta un HC-SR04 a la placa y escribe el
> firmware que imprima la distancia por serial."_

La línea de estado en el modal cambia a **Connected** en el momento en que tu agente
hace su primera llamada, y las piezas, cables y código llegan a tu lienzo en vivo.

## Lo que el agente puede hacer

Tu agente obtiene el mismo conjunto de herramientas que usa el agente integrado: puede
leer el proyecto, añadir y conectar componentes, añadir placas, colocar piezas en un
protoboard, escribir y editar el sketch, y validar el circuito. También tiene las
**skills** específicas por componente de Velxio — nombres de pines exactos, recetas de
cableado y errores comunes del simulador — para que conecte un SSD1306 o un DHT22
correctamente en lugar de adivinar.

También puede **compilar**: `compile_sketch` construye el firmware en el servidor de
Velxio y entrega al agente la salida del compilador, para que pueda corregir sus
propios errores en lugar de darte código que no compila. Ejecutar la simulación y
leer el monitor serial aún requieren el emulador en vivo en tu pestaña — cuando la
compilación esté en verde, presiona **Run** en Velxio.

## Iniciar sesión sin un token

Los clientes que hablan OAuth (Claude Code entre ellos) pueden conectarse con tu
cuenta de Velxio en lugar de un token pegado: apúntalos a `https://velxio.dev/api/pro/mcp`
sin credenciales, y descubrirán el flujo de inicio de sesión, abrirán un navegador y
te pedirán aprobación. La pantalla de consentimiento nombra al cliente y la cuenta, y el
token de acceso que recibe está vinculado solo al endpoint MCP de Velxio.

Los tokens siguen siendo el camino más simple, y nada sobre ellos cambia.

## Seguridad

El token de conexión es una **capacidad limitada y específica del proyecto**, diseñada
para pegarse en una CLI de terceros:

- **Limitado a un proyecto.** Un token solo toca el único proyecto para el que fue
  creado — nunca tus otros proyectos ni tu cuenta.
- **Almacenado con hash, mostrado una vez.** Velxio guarda solo un hash del token; el
  texto plano se muestra una sola vez cuando lo generas.
- **Revocable.** El modal lista cada conexión activa con un botón **Revoke**,
  y una acción **Revoke all** las elimina todas a la vez. La revocación tiene efecto
  inmediato.
- **Caduca.** Cada token deja de funcionar después de 90 días; genera uno nuevo para
  continuar.

Si alguna vez pegas un token en un lugar donde no deberías, abre el modal y presiona
**Revoke** — el token antiguo queda muerto en el instante en que lo haces.

## Notas y límites

- Las ediciones del agente se guardan en tu proyecto como cualquier otro cambio, por lo
  que tu historial de deshacer y el autoguardado habituales siguen aplicándose.
- Si el proyecto está vinculado a [GitHub Sync](/docs/es/getting-started/github-sync/), las
  ediciones del agente también se reflejan en tu repositorio (en lotes, para que una
  ráfaga de ediciones no inunde los commits).
- Compilar, ejecutar y leer el monitor serial ocurren en el navegador, así que
  mantén la pestaña de Velxio abierta mientras controlas el proyecto desde tu agente.
