---
title: Modalità agente — costruisce insieme a te
description: L'assistente posiziona i componenti, li collega, scrive lo sketch, compila ed esegue.
sidebar:
  order: 3
---

La modalità **Agent** dà le mani all'assistente. Chiedi un circuito e lui
aggiungerà i componenti, li collegherà, scriverà il codice, compilerà ed
eseguirà — direttamente sulla tua tela, mentre guardi:

![Il pannello AI in modalità Agent](../../../../assets/docs/ai/mode-agent.png)

Prova prompt come:

- _"Costruisci un semaforo con 3 LED."_
- _"Aggiungi un display OLED a questa scheda e mostra un contatore."_
- _"Le letture del mio pulsante rimbalzano — correggi lo sketch."_
- _"Converti questo progetto in MicroPython."_

## Resti tu al controllo

Ogni azione finisce nel tuo progetto normale: i componenti appaiono sulla
tela, le modifiche si vedono nell'editor del codice e la cronologia di undo
è tua. Ispeziona ciò che ha fatto, modificalo o chiedi il passo successivo.
Se un'esecuzione fallisce, l'agente legge l'output del compilatore e il
monitor seriale nello stesso modo in cui faresti tu, e itera.

## Lavorare bene con l'agente

- **Piccoli passi battono i saggi** — "aggiungi un DHT22 e stampa la temperatura"
  dà risultati migliori di un paragrafo di requisiti.
- **Lascialo finire** — un turno dell'agente può comprendere più azioni (posiziona, collega,
  codice, compila, esegui); il pannello racconta mentre procede.
- Allega un'immagine del circuito che vuoi riprodotto — può lavorare da una
  foto o da uno schema.

I turni dell'agente costano più **cicli** delle risposte in chat; il contatore della quota in
basso nel pannello tiene traccia di quanto resta oggi. Vedi
[piani](/docs/it/getting-started/plans/).
