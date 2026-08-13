---
title: Utilizzo delle librerie
description: Cerca, installa e fissa le librerie Arduino per il tuo progetto.
sidebar:
  order: 5
---

Fai clic su **Libraries** (Librerie) nella barra degli strumenti per cercare nel registro delle librerie Arduino
e aggiungere librerie alla scheda attiva.

Le librerie installate vengono registrate nel file **`libraries.json`** della scheda
(visibile nell'albero dei file), quindi viaggiano con il progetto: chiunque
lo apra — incluso il tuo io futuro — ottiene le stesse versioni risolte al
momento della compilazione. Nessuna cartella di librerie per macchina da tenere sincronizzata.

## Utilizzare una libreria

Installala, poi includila con `#include` come al solito:

```cpp
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
```

Il compilatore cloud recupera le librerie dichiarate (più le loro
dipendenze) prima di compilare. Se una compilazione fallisce con
`No such file or directory` su un header, la libreria che fornisce quell'header
non è ancora dichiarata — aggiungila tramite **Libraries**.

## MicroPython

Il firmware MicroPython include i suoi moduli standard integrati
(`machine`, `network`, `time`, …). I moduli helper in puro Python possono essere aggiunti
come file extra nell'albero dei file accanto a `main.py` e importati normalmente.

## Gli esempi sono già preconfigurati

Ogni esempio della galleria dichiara le librerie di cui ha bisogno — aprendone uno
ottieni una combinazione già collaudata di codice + circuito + versioni delle librerie, il che
li rende ottimi punti di partenza per i tuoi progetti.
