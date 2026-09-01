---
title: "My Chips: salva e riutilizza i tuoi chip"
description: Salva un chip personalizzato una volta e trascinalo in qualsiasi progetto dal tuo selettore di componenti, contrassegnato come CUSTOM. Piano Pro.
sidebar:
  order: 4
---

Hai creato un chip che vale la pena conservare? Salvalo in **My Chips** e diventerà parte
del *tuo* selettore di componenti — in ogni progetto, pronto per l'esecuzione, contrassegnato con
un badge viola **CUSTOM**. Solo tu puoi vedere la tua libreria.

:::note[Pro]
Salvare chip nella tua libreria fa parte del piano Pro: è l'unico pezzo
di chip personalizzati che risiede sul server anziché nel tuo browser.
Scrivere, compilare ed eseguire chip, e pilotare i loro
[slider live](/docs/it/custom-chips/programmable-sensors/), è gratuito su
ogni piano; "Create with AI" è disponibile dal piano Maker in su.
:::

Un chip salvato conserva tutto: il suo sorgente C, il suo manifest, il WASM
compilato e la sua [immagine](/docs/it/custom-chips/getting-started/#giving-the-chip-a-face)
se ne ha una.

## Salvare un chip

Nell'esplora file, ogni chip personalizzato ha la propria sezione. Fai clic sul
pulsante **save** nella sua intestazione (accanto a Compile), assegnagli un nome e una
descrizione facoltativa, ed è nella tua libreria — compilato e pronto.
Salvare un chip con un nome già utilizzato offre di aggiornare la
voce esistente, così un chip può evolversi tra progetti.

Anche l'agente AI può farlo: chiedigli di *"salvare questo chip nei miei chip"*
(`save_custom_chip`), elencare ciò che hai (`list_my_chips`) o posizionare un
chip salvato (`use_my_chip`) — e gli agenti esterni connessi tramite il
[ponte MCP](/docs/it/ai/connect-external-agent/) ottengono gli stessi tre strumenti.

## Usare un chip salvato

Apri il selettore di componenti e i tuoi chip sono lì, con il badge CUSTOM sulla
scheda. Trascinarne uno lo **copia** nel progetto — sorgente, manifest e
binario compilato — così i progetti rimangono completamente autonomi: modificare la
copia non tocca mai la tua libreria, e condividere il progetto condivide un
chip funzionante, non un riferimento che solo tu puoi risolvere.

I chip trascinati finiscono direttamente nell'editor con i loro `chip.c` e
`chip.json` come file ordinari, come qualsiasi chip personalizzato.

## Limiti

- Fino a **100 chip** per account.
- Sorgente fino a 64 KB, chip compilato fino a ~512 KB.
- Eliminare un progetto non elimina mai i chip della libreria, ed eliminare un chip
  della libreria non tocca mai i progetti che lo hanno copiato.
