---
title: Il tuo primo progetto
description: Apri l'esempio blink, eseguilo, osserva il LED lampeggiare e personalizzalo — in cinque minuti.
sidebar:
  order: 2
---

Il modo più veloce per capire Velxio è eseguire qualcosa. In questo tutorial
aprirai il classico esempio _blink_, lo eseguirai, osserverai un ESP32 simulato
azionare un circuito LED reale, e poi modificherai il codice.

## 1. Apri l'esempio

Vai su [velxio.dev/example/esp32-blink-led](https://velxio.dev/example/esp32-blink-led)
(oppure trova **ESP32 Blink** nella [galleria esempi](/docs/it/getting-started/examples-gallery/)).

![L'esempio blink caricato nell'editor](../../../../assets/docs/getting-started/first-project-loaded.png)

Ottieni un progetto completo: il **codice** a sinistra (uno sketch Arduino che
commuta due LED), e il **circuito** al centro — un ESP32 DevKit collegato
tramite un resistore a un LED esterno.

## 2. Premi Run

Fai clic sul pulsante verde **Run** nella barra degli strumenti (oppure premi **Ctrl+B** per
compilare prima). Velxio compila il tuo sketch con la vera toolchain
Arduino/ESP-IDF nel cloud — la console **Output** in basso a sinistra mostra
l'avanzamento del compilatore, esattamente come farebbe l'IDE Arduino.

La prima compilazione di una sessione può richiedere un po' di tempo; successivamente, le build
sono molto più veloci.

## 3. Guardalo funzionare

Quando la build termina, il firmware si avvia sull'ESP32 emulato:

![L'esempio blink in esecuzione: LED acceso, output seriale in corso](../../../../assets/docs/getting-started/first-project-running.png)

Tre cose accadono contemporaneamente:

- **Il LED sul canvas lampeggia** — la simulazione aziona il componente
  reale, attraverso il resistore reale.
- **Il monitor seriale** mostra il log di avvio e poi `LED ON` / `LED OFF`,
  direttamente da `Serial.println()` nello sketch.
- Il **badge SPICE** giallo sopra il circuito mostra il motore analogico
  che risolve il percorso della corrente del LED.

## 4. Rendilo tuo

Modifica lo sketch — ad esempio, cambia il ritardo per farlo lampeggiare più velocemente:

```cpp
delay(100);   // era 500
```

Premi di nuovo **Run**. Questo è l'intero ciclo: modifica, esegui, osserva.

## 5. Salvalo

Fai clic sull'**icona di salvataggio** sopra l'albero dei file (oppure **Ctrl+S**), dai un
nome al progetto e verrà archiviato nel tuo account. Vedi
[Salvataggio e apertura di progetti](/docs/it/getting-started/projects/).

> **Suggerimento:** bloccato in qualche punto? Apri l'assistente AI a destra e chiedi —
> "perché il mio LED non lampeggia?" è uno dei suoi prompt di esempio per un motivo.
> Vedi [Assistente AI](/docs/it/ai/overview/).

## Dove andare dopo

- [Tour dell'interfaccia](/docs/it/getting-started/interface-tour/) — cosa fa ogni
  pannello e pulsante.
- [Editor di circuiti](/docs/it/circuit-editor/overview/) — costruisci un circuito da
  zero invece di partire da un esempio.
- [Schede supportate](/docs/it/boards/overview/) — sostituisci l'ESP32 con un
  Arduino UNO, un Pi Pico, uno STM32…
