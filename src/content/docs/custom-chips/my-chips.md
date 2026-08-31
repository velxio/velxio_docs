---
title: "My Chips: save and reuse your chips"
description: Save a custom chip once and drop it into any project from your component picker, tagged CUSTOM. Pro plan.
sidebar:
  order: 4
---

Built a chip worth keeping? Save it to **My Chips** and it becomes part
of *your* component picker — in every project, ready to run, marked with
a violet **CUSTOM** badge. Only you see your library.

:::note[Pro]
Saving chips to your library is part of the Pro plan: it is the one piece
of custom chips that lives on the server rather than in your browser.
Writing, compiling and running chips, and driving their
[live sliders](/docs/custom-chips/programmable-sensors/), are free on
every plan; "Create with AI" is Maker and up.
:::

## Saving a chip

In the file explorer, every custom chip has its own section. Click the
**save** button in its header (next to Compile), give it a name and an
optional description, and it's in your library — compiled and ready.
Saving a chip under a name you already used offers to update the
existing entry, so a chip can evolve across projects.

The AI agent can do it too: ask it to *"save this chip to my chips"*
(`save_custom_chip`), list what you have (`list_my_chips`), or place a
saved one (`use_my_chip`) — and external agents connected over the
[MCP bridge](/docs/ai/connect-external-agent/) get the same three tools.

## Using a saved chip

Open the component picker and your chips are there, CUSTOM badge on the
card. Dropping one **copies** it into the project — source, manifest and
compiled binary — so projects stay fully self-contained: editing the
copy never touches your library, and sharing the project shares a
working chip, not a reference only you can resolve.

Dropped chips land straight in the editor with their `chip.c` and
`chip.json` as ordinary files, like any custom chip.

## Limits

- Up to **100 chips** per account.
- Source up to 64 KB, compiled chip up to ~512 KB.
- Deleting a project never deletes library chips, and deleting a library
  chip never touches the projects that copied it.
