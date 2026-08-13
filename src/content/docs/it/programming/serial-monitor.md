---
title: Monitor seriale
description: Visualizza l'output seriale del tuo programma e invia dati ad esso.
sidebar:
  order: 4
---

Attiva il monitor seriale con il pulsante **Serial** nella barra degli strumenti. Si
apre come pannello inferiore, con **una scheda per ogni board** nel progetto:

![Il monitor seriale durante un'esecuzione](../../../../assets/docs/programming/serial-monitor.png)

Tutto ciò che il tuo firmware stampa (`Serial.println`, la funzione `print` di MicroPython,
il log di avvio del boot ROM) appare qui in tempo reale — inclusi i messaggi di avvio
del chip stesso, perché l'emulatore avvia il firmware reale.

## Controlli

- **Baud rate** — corrisponde al tuo `Serial.begin(...)`; 115200 è il valore usuale.
- **Autoscroll** — segui l'output più recente; deseleziona per scorrere indietro.
- **Clear** — svuota il buffer.
- **Hardware serial** — indica che la scheda è collegata alla UART della board.

## Invio di input

Digita nella **message box** (casella di messaggio) in basso e premi **Send**. Il selettore
del terminatore di riga (Newline / Carriage return / entrambi / nessuno) è importante per
gli sketch che analizzano `Serial.read()` — allo stesso modo del monitor dell'IDE Arduino.

Sulle board MicroPython il monitor seriale funge anche da **REPL**: ferma
il tuo script con interruzioni in stile Ctrl+C e digita Python in modo interattivo.
