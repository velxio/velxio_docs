---
title: Flash hardware reale dal browser
description: Scrivi il tuo progetto compilato su una scheda fisica via USB, direttamente dal browser, senza installare alcun toolchain.
sidebar:
  order: 4
---

Quando il tuo progetto funziona nel simulatore, puoi metterlo su una
**scheda reale** senza installare nulla: Velxio flasha il firmware
compilato via USB, direttamente dal browser.

## Requisiti

- Un browser basato su Chromium (Chrome o Edge). Il flasher usa le API
  Web Serial e WebUSB del browser, che Firefox e Safari non includono.
  Le schede della famiglia Pico ricevono comunque un pulsante **Download .uf2** lì
  (vedi sotto).
- Un cavo USB dati per la tua scheda.
- Chiudi prima qualsiasi altra cosa che usi la porta (monitor seriali, IDE,
  picotool): il browser necessita di accesso esclusivo.

![La finestra di flash che seleziona una porta seriale USB](../../../../assets/docs/wifi-iot/flash-modal.png)

## Flash

1. Fai clic con il tasto destro sulla scheda nell'area di disegno e scegli **Flash to real board**.
2. Fai clic su **Connect & flash**. Il browser chiede a quale dispositivo USB concedere l'accesso;
   seleziona la tua scheda.
3. Velxio usa la build che ha già creato per quella scheda (lo stesso binario
   che il simulatore stava eseguendo). Se il codice è cambiato da allora, ricompila
   prima e l'output del compilatore scorre nella finestra.
4. Osserva la barra di avanzamento; quando finisce, la scheda si riavvia nel tuo
   progetto.

La finestra sceglie il protocollo per il target:

| Famiglia | Come viene scritto | La scheda deve essere |
| --- | --- | --- |
| ESP32, S3, C3, C6 | esptool sulla porta seriale, il `.bin` unito | collegata; tieni premuto BOOT se non risponde |
| Arduino Uno, Nano, Mega, ATtiny85 | STK500 contro il bootloader della scheda, il `.hex` | collegata (ATtiny85: tramite un Arduino che esegue ArduinoISP) |
| Raspberry Pi Pico, Pico W, Pico 2, schede Pimoroni RP2040 / RP2350 | PICOBOOT su WebUSB, il `.uf2` creato da picotool | in modalità **BOOTSEL** (sezione successiva) |

## Schede della famiglia Pico: prima BOOTSEL

Un RP2040 o RP2350 viene programmato dal suo bootloader, una personalità USB
separata che il chip mostra solo in modalità **BOOTSEL**. Due modi per
arrivarci:

- **A mano**: tieni premuto il pulsante BOOTSEL mentre colleghi la scheda, poi
  rilascialo. La scheda si monta come unità USB denominata `RPI-RP2` (RP2040) o
  `RP2350`.
- **Dalla finestra**: la finestra di flash per queste schede ha un pulsante
  **Reboot into bootloader over USB**. Funziona quando la scheda sta
  eseguendo uno sketch creato da Velxio (il core Arduino si riavvia su un'apertura
  a 1200 baud) o MicroPython (la REPL esegue `machine.bootloader()`). Il
  browser chiede la porta seriale della scheda, la scheda si scollega e
  ritorna come bootloader. Poi fai clic su **Connect & flash** e seleziona il
  dispositivo `RP2 Boot` / `RP2350 Boot`.

Due clic, due richieste di autorizzazione: la porta seriale per il riavvio e
il dispositivo USB per la scrittura. Una volta che la scheda è in BOOTSEL, i flash successivi
richiedono solo la seconda.

### Due revisioni della stessa scheda

Pimoroni ha venduto lo Stellar e il Galactic Unicorn con un Pico W (RP2040)
fino a gennaio 2025 e con un Pico 2 W (RP2350) da allora. Il simulatore
esegue quello attuale; la finestra di flash ha un selettore **Real board revision**
per queste schede. Scegli "Pico W aboard" per l'unità più vecchia: la
finestra crea una seconda immagine per quel chip, la flasha o la scarica, e
il simulatore continua a eseguire la propria build. La scelta viene ricordata per
scheda. L'etichetta sul retro della scheda (o il nome dell'unità in BOOTSEL,
`RPI-RP2` rispetto a `RP2350`) ti dice quale hai.

La finestra rifiuta un'immagine che non corrisponde al chip che ha risposto
(una build RP2350 su un RP2040, una build RISC-V su una configurazione ARM)
prima che qualsiasi cosa venga cancellata, verifica ogni byte dopo la scrittura e
riavvia la scheda nel programma.

### Windows e un RP2040: installa WinUSB una volta

Il bootloader RP2040 non include un descrittore di driver Windows, quindi il browser
non può rivendicarlo finché WinUSB non è associato ad esso. Configurazione una tantum:

1. Metti la scheda in BOOTSEL e collegalo.
2. Scarica ed esegui [Zadig](https://zadig.akeo.ie).
3. Seleziona `RP2 Boot (Interface 1)` dall'elenco (Opzioni, Elenca tutti i
   dispositivi se è nascosto), seleziona **WinUSB** come driver e fai clic su
   **Install Driver**.

Le schede RP2350 (Pico 2, Pico 2 W, gli Unicorn "Pico 2 W Aboard" di Pimoroni,
Badger 2350) non necessitano di nulla: il loro bootloader include il
descrittore e Windows associa WinUSB da solo. macOS non necessita di nulla su
entrambi i chip.

### Linux: una regola udev

Linux assegna i dispositivi USB a root per impostazione predefinita. Crea
`/etc/udev/rules.d/99-velxio-rp2.rules` con:

```
SUBSYSTEM=="usb", ATTRS{idVendor}=="2e8a", MODE="0666", TAG+="uaccess"
```

poi `sudo udevadm control --reload-rules && sudo udevadm trigger` e
ricalibra la scheda. La porta seriale utilizzata per il passaggio di riavvio necessita anche
della consueta appartenenza al gruppo `dialout`.

### Qualsiasi browser: scarica il .uf2 o copialo sull'unità

La finestra di flash per una scheda della famiglia Pico offre sempre **Download .uf2**
(su Firefox e Safari, dove il browser non può flashare, questa è l'intera
finestra). Salva il file, metti la scheda in BOOTSEL e trascina il file sull'unità
`RPI-RP2` / `RP2350`: la scheda si riavvia nel tuo sketch nel momento
in cui la copia termina.

Su Chrome ed Edge c'è anche **Copy to the board's drive**: il
browser ti chiede di selezionare l'unità e scrive il file lì stesso. Nessun
driver è coinvolto, quindi è il modo per programmare un RP2040 su Windows
senza installare WinUSB. La finestra verifica che la cartella selezionata
sia un'unità BOOTSEL (contiene `INFO_UF2.TXT`) prima di scrivere qualsiasi cosa.

### Progetti MicroPython su un Pico

La finestra carica i file `.py` del progetto tramite la REPL e si riavvia
in `main.py`. MicroPython stesso deve essere già sulla scheda:

- **Pico e Pico W**: la finestra lo installa. Se nessuna REPL risponde, ti
  chiede di mettere la scheda in BOOTSEL e fare clic su Retry; quel clic scrive
  la stessa build MicroPython che il simulatore esegue, e un altro Retry
  carica i tuoi file.
- **Schede Pimoroni RP2350** (Badger 2350, Pico Plus 2W): vengono fornite con
  il MicroPython di Pimoroni. Se il tuo lo ha perso, scarica il `.uf2` da
  [pimoroni-pico-rp2350](https://github.com/pimoroni/pimoroni-pico-rp2350/releases)
  e trascinalo sull'unità BOOTSEL una volta, poi flasha dalla finestra.

## Risoluzione dei problemi

- **"No board in BOOTSEL mode was found"**: il selettore del dispositivo era vuoto.
  Usa il pulsante di riavvio o tieni premuto BOOTSEL mentre colleghi, poi connettiti
  di nuovo.
- **"The board in BOOTSEL is an RP2040 but this project is built for
  RP2350"**: un Unicorn più vecchio con un Pico W a bordo. Scegli "Pico W aboard"
  nel selettore **Real board revision** della finestra e flasha di nuovo.
- **"Could not claim the USB device"** su Windows con un RP2040: il
  passaggio Zadig sopra. Su Linux: la regola udev sopra.
- **Il riavvio seriale non ha fatto nulla**: uno sketch creato con lo stack USB
  disabilitato non può essere riavviato via USB. Tieni premuto BOOTSEL mentre colleghi.

## Prima simula, poi flasha

Questo chiude il cerchio che rende Velxio utile per il lavoro reale: itera
velocemente nel simulatore (niente cavo, nessuna usura sull'hardware, ripristini
istantanei), poi flasha lo stesso identico artefatto di build quando si comporta
correttamente.
