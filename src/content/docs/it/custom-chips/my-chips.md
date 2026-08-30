---
title: "I Miei Chip: salva e riutilizza i tuoi chip"
description: Salva un chip personalizzato una volta e aggiungilo a qualsiasi progetto dal tuo selettore di componenti, contrassegnato come CUSTOM. Piano Pro.
sidebar:
  order: 4
---

Hai creato un chip che vale la pena conservare? Salvalo in **I Miei Chip** e diventerà parte
del *tuo* selettore di componenti — in ogni progetto, pronto per l'esecuzione, contrassegnato con
un badge viola **CUSTOM**. Solo tu puoi vedere la tua libreria.

:::note[Pro]
Il salvataggio dei chip fa parte del piano Pro (la stessa autorizzazione che alimenta
"Create with AI"). La modifica e la compilazione dei chip all'interno di un progetto funziona su
qualsiasi piano.
:::

## Salvataggio di un chip

Nell'esplora file, ogni chip personalizzato ha la propria sezione. Fai clic sul
pulsante **save** (salva) nella sua intestazione (accanto a Compile), assegnagli un nome e una
descrizione facoltativa, e sarà nella tua libreria — compilato e pronto.
Il salvataggio di un chip con un nome già utilizzato offre di aggiornare la
voce esistente, così un chip può evolversi tra i progetti.

Anche l'agente AI può farlo: chiedigli di *"salva questo chip nei miei chip"*
(`save_custom_chip`), elenca ciò che hai (`list_my_chips`), o posiziona un
chip salvato (`use_my_chip`) — e gli agenti esterni connessi tramite il
[ponte MCP](/docs/it/ai/connect-external-agent/) ricevono gli stessi tre strumenti.

## Utilizzo di un chip salvato

Apri il selettore di componenti e i tuoi chip sono lì, con il badge CUSTOM sulla
scheda. Trascinarne uno lo **copia** nel progetto — sorgente, manifest e
binario compilato — così i progetti rimangono completamente autonomi: la modifica della
copia non tocca mai la tua libreria, e la condivisione del progetto condivide un
chip funzionante, non un riferimento che solo tu puoi risolvere.

I chip trascinati finiscono direttamente nell'editor con i loro `chip.c` e
`chip.json` come file ordinari, come qualsiasi chip personalizzato.

## Limiti

- Fino a **100 chip** per account.
- Sorgente fino a 64 KB, chip compilato fino a ~512 KB.
- L'eliminazione di un progetto non elimina mai i chip della libreria, e l'eliminazione di un chip
  della libreria non tocca mai i progetti che lo hanno copiato.
