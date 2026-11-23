---
title: "BBC micro:bit"
description: "La BBC micro:bit V2 e sette schede DFRobot per essa, con il firmware MicroPython ufficiale in esecuzione nel tuo browser."
sidebar:
  order: 5.5
---

La **BBC micro:bit V2** funziona in Velxio con il proprio firmware MicroPython
ufficiale (2.1.1), non modificato, su un motore in-browser per il suo chip
nRF52833. Scrivi MicroPython, premi **Run** (Esegui) e il programma gira nella
scheda del tuo browser, su ogni piano, incluso quello gratuito.

![La BBC micro:bit V2 sulla tela di Velxio](../../../../assets/docs/boards/microbit-v2.png)

## Cosa funziona

- La matrice LED 5x5, i pulsanti A e B e il logo touch, su un disegno su cui
  puoi cliccare.
- Il sensore di movimento (inclina il pad sotto la scheda), e la direzione
  della bussola, la temperatura, il livello di luce e il livello sonoro,
  impostati dal pannello dei sensori della scheda.
- Lo speaker, una volta attivato l'audio in quel pannello, e il connettore a
  bordo: collega LED, potenziometri, servo o sensori Grove ai suoi anelli e
  strisce come sulla scheda reale.
- Un REPL nel Serial Monitor, e **Upload firmware** (Carica firmware) per un
  file MicroPython `.hex` salvato da python.microbit.org, i cui file si aprono
  nell'editor.

**Solo MicroPython** per ora: niente Arduino/C++ e niente blocchi MakeCode (un
`.hex` di MakeCode non si avvia ancora). La radio tra due micro:bit e il
Bluetooth non sono modellati.

## Inizia da qui

- [Hello, World! sulla matrice LED](https://velxio.dev/example/microbit-v2-hello)
- [Pulsanti A e B](https://velxio.dev/example/microbit-v2-buttons)
- [Livella a bolla](https://velxio.dev/example/microbit-v2-spirit-level), sull'
  accelerometro
- [Termometro](https://velxio.dev/example/microbit-v2-thermometer), sulla
  temperatura del chip stesso

## Schede DFRobot per la micro:bit

Sette schede DFRobot sono in Velxio, ognuna è una scheda a sé sulla tela:
posizionala e la micro:bit arriva inserita nel suo zoccolo, con la matrice e
i pulsanti ancora a portata di mano. Una scheda con chip si apre con un driver
MicroPython accanto a `main.py` (`maqueen.py`, `maqueen_v5.py`,
`microdriver.py`, `microiobox.py`) che scrive gli stessi byte dei blocchi
MakeCode di DFRobot.

![La micro:bit V2 inserita su una DFRobot Maqueen Lite sulla tela di Velxio](../../../../assets/docs/boards/microbit-v2-maqueen-lite.png)

### Maqueen Lite

Il piccolo robot a due ruote di DFRobot (ROB0148-EN): due motori dietro un
driver su I2C, due fari, due sensori di linea, quattro LED RGB e uno zoccolo
per ultrasuoni. In un Mondo 3D la Maqueen stessa è il robot.
[Segui linea](https://velxio.dev/example/microbit-v2-maqueen-lite-line) ·
[Guida e lampeggia i fari](https://velxio.dev/example/microbit-v2-maqueen-lite-drive) ·
[Negozio DFRobot](https://www.dfrobot.com/product-1783.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-maqueen-lite)

### Maqueen Lite V5

L'attuale Maqueen Lite (MBT0046): fari RGB, tre sensori di linea, due sensori
di luce e un livello batteria dietro il proprio controller su I2C.
[Fari colorati e sensori di luce](https://velxio.dev/example/microbit-v2-maqueen-lite-v5-lights) ·
[Negozio DFRobot](https://www.dfrobot.com/product-2937.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-maqueen-lite-v5)

### micro:Driver

Quattro uscite per motori DC e otto connettori per servo da un unico chip
PCA9685 su I2C (DFR0548), più nove pin della micro:bit su connettori a 3 pin.
[Due servo e un motore DC](https://velxio.dev/example/microbit-v2-micro-driver-servos) ·
[Negozio DFRobot](https://www.dfrobot.com/product-1738.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-micro-driver)

### micro:IO-BOX

Un controller compatto per robot (MBT0005): un driver per motori a due vie su
I2C, nove connettori IO, porte I2C e UART e un buzzer su P0.
[Due motori avanti e indietro](https://velxio.dev/example/microbit-v2-io-box-motors) ·
[Negozio DFRobot](https://www.dfrobot.com/product-1847.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-io-box)

### IO Extender

Un breakout (MBT0008) con ogni pin del connettore a bordo su un connettore a
3 pin (segnale, 3.3 V, massa), tre porte I2C e un buzzer su P0 con un
interruttore.
[Un sensore di luce su P1](https://velxio.dev/example/microbit-v2-io-extender-light) ·
[Negozio DFRobot](https://www.dfrobot.com/product-1867.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-io-extender)

### micro:Mate

Una scheda delle dimensioni della micro:bit (DFR0518) che si avvita sulla sua
parte anteriore, con sei connettori Gravity a 3 pin: P0, P1 e P2 a 3.3 V, P8,
P12 e P16 a 5 V.
[Un sensore di luce su P0](https://velxio.dev/example/microbit-v2-micro-mate-light) ·
[Negozio DFRobot](https://www.dfrobot.com/product-1699.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-micro-mate)

### Robotics & Power IO Extender

Un breakout completo per la micro:bit (DFR1231) con i connettori dell'IO
Extender nello stesso ordine e con gli stessi nomi dei pin, così un progetto
si sposta tra i due senza rinominare un filo.
[Un sensore di luce su P1](https://velxio.dev/example/microbit-v2-robotics-io-extender-light) ·
[Negozio DFRobot](https://www.dfrobot.com/product-2963.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-robotics-io-extender)

_I link ai negozi su questa pagina sono link affiliati: Velxio guadagna una piccola commissione senza costi aggiuntivi per te._

## Grafica delle schede e pinout

La grafica sulla tela e la mappa completa dei pin di ogni scheda, generate dal
simulatore:

[BBC micro:bit V2](/docs/it/boards/reference/microbit-v2/) ·
[Maqueen Lite](/docs/it/boards/reference/microbit-v2-maqueen-lite/) ·
[Maqueen Lite V5](/docs/it/boards/reference/microbit-v2-maqueen-lite-v5/) ·
[micro:Driver](/docs/it/boards/reference/microbit-v2-micro-driver/) ·
[micro:IO-BOX](/docs/it/boards/reference/microbit-v2-io-box/) ·
[IO Extender](/docs/it/boards/reference/microbit-v2-io-extender/) ·
[micro:Mate](/docs/it/boards/reference/microbit-v2-micro-mate/) ·
[Robotics & Power IO Extender](/docs/it/boards/reference/microbit-v2-robotics-io-extender/)

---

BBC micro:bit è un marchio della Micro:bit Educational Foundation. Velxio
funziona con la micro:bit; non è prodotto né approvato dalla Foundation. La
micro:bit stessa è venduta tramite i rivenditori elencati dalla Foundation su
[microbit.org](https://microbit.org/buy/).
