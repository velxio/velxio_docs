---
title: Connect Claude Code or Codex
description: Drive a saved project from your own AI agent (Claude Code / Codex) over MCP — it builds the circuit and writes the firmware live on your canvas.
sidebar:
  order: 5
  badge:
    text: Pro
    variant: tip
---

Velxio's built-in [Agent mode](/docs/ai/agent-mode/) runs the assistant
_inside_ the app. **Connect AI agent** does the opposite: it lets your own
agent — **Claude Code** or **OpenAI Codex** in your terminal — reach into a
saved Velxio project and build it for you. The circuit and code appear on
your canvas within a few seconds, exactly as if the in-app agent had done it.

It works over [MCP](https://modelcontextprotocol.io) (the Model Context
Protocol): Velxio exposes its circuit and code tools as an MCP server, and you
point your agent at it with a per-project token.

![The Connect AI agent modal, showing the Claude Code / Codex tabs, the setup command and the active connection](../../../assets/docs/ai/connect-agent.png)

:::note
Connecting an external agent is a **Pro** feature. Free and Maker plans use the
in-app [Agent](/docs/ai/agent-mode/) and [Tutor](/docs/ai/tutor-mode/) modes
instead. See [plans](/docs/getting-started/plans/).
:::

## The quickest way: the Claude Code plugin

If you use Claude Code, install the plugin — it brings the tools, a
`/velxio:build` command and the wiring know-how in one step:

```
/plugin marketplace add velxio/velxio-plugin
/plugin install velxio@velxio
```

Then generate a token (steps below), export it, and restart Claude Code:

```bash
export VELXIO_MCP_TOKEN="vlxmcp_...your token..."
```

Now `/velxio:build an HC-SR04 that prints distance over serial` does the whole
job. `/velxio:check` validates and compiles what is already there.

## Connect manually, in three steps

1. **Save the project first.** The agent connects to a saved project, so give
   it a name and save it if you haven't yet.
2. **Open the connector.** In the editor, go to **File → Connect AI agent
   (Claude/Codex)**, pick the **Claude Code** or **Codex CLI** tab, and click
   **Generate connection token**.
3. **Run the one-line setup** it shows you, in your terminal:

   **Claude Code**

   ```bash
   claude mcp add --transport http velxio https://velxio.dev/api/pro/mcp \
     --header "Authorization: Bearer vlxmcp_your_token_here"
   ```

   **Codex** — add to `~/.codex/config.toml`:

   ```toml
   [mcp_servers.velxio]
   url = "https://velxio.dev/api/pro/mcp"
   http_headers = { "Authorization" = "Bearer vlxmcp_your_token_here" }
   ```

That's it. Start `claude` (or `codex`) and ask it to build something:

> _"Using the velxio tools, wire an HC-SR04 to the board and write the
> firmware that prints the distance over serial."_

The status line in the modal flips to **Connected** the moment your agent makes
its first call, and the parts, wires and code land on your canvas live.

## What the agent can do

Your agent gets the same toolset the in-app agent uses: it can read the project,
add and wire components, add boards, place parts on a breadboard, write and edit
the sketch, and validate the circuit. It also has Velxio's per-component
**skills** — exact pin names, wiring recipes and simulator gotchas — so it wires
an SSD1306 or a DHT22 correctly instead of guessing.

It can also **compile**: `compile_sketch` builds the firmware on the Velxio
server and hands the agent the compiler output, so it can fix its own mistakes
instead of telling you code that does not build. Running the simulation and
reading the serial monitor still need the live emulator in your tab — when the
build is green, press **Run** in Velxio.

## Signing in without a token

Clients that speak OAuth (Claude Code among them) can connect with your Velxio
account instead of a pasted token: point them at `https://velxio.dev/api/pro/mcp`
with no credentials, and they will discover the login flow, open a browser, and
ask you to approve. The consent screen names the client and the account, and the
access token it receives is bound to Velxio's MCP endpoint only.

Tokens remain the simplest path, and nothing about them changes.

## Security

The connection token is a **narrow, per-project capability**, designed to be
pasted into a third-party CLI:

- **Scoped to one project.** A token only ever touches the single project it was
  minted for — never your other projects or your account.
- **Stored hashed, shown once.** Velxio keeps only a hash of the token; the
  plaintext is shown a single time when you generate it.
- **Revocable.** The modal lists every live connection with a **Revoke** button,
  and a **Revoke all** action kills them all at once. Revoking takes effect
  immediately.
- **Expires.** Every token stops working after 90 days; generate a fresh one to
  keep going.

If you ever paste a token somewhere you shouldn't have, open the modal and hit
**Revoke** — the old token is dead the instant you do.

## Notes and limits

- The agent's edits save to your project like any other change, so your normal
  undo history and autosave still apply.
- If the project is linked to [GitHub Sync](/docs/getting-started/github-sync/), agent
  edits are mirrored to your repo too (batched, so a burst of edits doesn't spam
  commits).
- Compiling, running and reading the serial monitor happen in the browser, so
  keep the Velxio tab open while you drive the project from your agent.
