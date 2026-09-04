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

- Un browser basato su Chromium (Chrome o Edge). Il flasher utilizza
  le API Web Serial e WebUSB del browser, che Firefox e Safari non
  includono. Le schede della famiglia Pico ricevono comunque un pulsante **Download .uf2** lì
  (vedi sotto).
- Un cavo USB con capacità dati per la tua scheda.
- Chiudi prima qualsiasi altra cosa che utilizzi la porta (monitor seriali, IDE,
  picotool): il browser necessita di accesso esclusivo.

![La finestra di dialogo del flash che seleziona una porta seriale USB](../../../../assets/docs/wifi-iot/flash-modal.png)

## Flashing

1. Fai clic con il pulsante destro del mouse sulla scheda nell'area di disegno e scegli **Flash to real board** (Flash su scheda reale).
2. Fai clic su **Connect & flash** (Connetti e flasha). Il browser chiede a quale dispositivo USB concedere l'accesso;
   seleziona la tua scheda.
3. Velxio utilizza la build che ha già creato per quella scheda (lo stesso binario
   che il simulatore stava eseguendo). Se il codice è cambiato da allora, ricompila
   prima e l'output del compilatore viene trasmesso nella finestra di dialogo.
4. Osserva la barra di avanzamento; quando finisce, la scheda si riavvia nel tuo
   progetto.

La finestra di dialogo sceglie il protocollo per il target:

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
  rilascialo. La scheda viene montata come unità USB denominata `RPI-RP2` (RP2040) o
  `RP2350`.
- **Dalla finestra di dialogo**: la finestra di dialogo del flash per queste schede ha un
  pulsante **Reboot into bootloader over USB** (Riavvia nel bootloader via USB). Funziona quando la scheda sta
  eseguendo uno sketch creato da Velxio (il core Arduino si riavvia su un'apertura a 1200 baud)
  o MicroPython (la REPL esegue `machine.bootloader()`). Il
  browser chiede la porta seriale della scheda, la scheda si scollega e
  ritorna come bootloader. Quindi fai clic su **Connect & flash** (Connetti e flasha) e seleziona il
  dispositivo `RP2 Boot` / `RP2350 Boot`.

Due clic, due richieste di autorizzazione: la porta seriale per il riavvio e
il dispositivo USB per la scrittura. Una volta che la scheda è in BOOTSEL, i flash successivi
richiedono solo la seconda.

La finestra di dialogo rifiuta un'immagine che non corrisponde al chip che ha risposto
(una build RP2350 su un RP2040, una build RISC-V su una configurazione ARM)
prima che qualsiasi cosa venga cancellata, verifica ogni byte dopo la scrittura e
riavvia la scheda nel programma.

### Windows e un RP2040: installa WinUSB una volta

Il bootloader RP2040 non include un descrittore di driver Windows, quindi il browser
non può rivendicarlo finché WinUSB non è associato ad esso. Configurazione una tantum:

1. Metti la scheda in BOOTSEL e collegala.
2. Scarica ed esegui [Zadig](https://zadig.akeo.ie).
3. Seleziona `RP2 Boot (Interface 1)` dall'elenco (Opzioni, Elenca tutti i
   dispositivi se è nascosto), seleziona **WinUSB** come driver e fai clic su
   **Install Driver** (Installa driver).

Le schede RP2350 (Pico 2, Pico 2 W, gli Unicorni Pimoroni "Pico 2 W Aboard",
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
ricollega la scheda. La porta seriale utilizzata per il passaggio di riavvio necessita anche della
consueta appartenenza al gruppo `dialout`.

### Qualsiasi browser: scarica il .uf2

La finestra di dialogo del flash per una scheda della famiglia Pico offre sempre **Download .uf2**
(su Firefox e Safari, dove il browser non può flashare, questa è l'intera
finestra di dialogo). Salva il file, metti la scheda in BOOTSEL e rilascia il file sull'
unità `RPI-RP2` / `RP2350`: la scheda si riavvia nel tuo sketch nel momento
in cui la copia termina.

### Progetti MicroPython su un Pico

La finestra di dialogo carica i file `.py` del progetto tramite la REPL e si riavvia
in `main.py`. MicroPython stesso deve essere già sulla scheda: è
un `.uf2` che rilasci sull'unità BOOTSEL una volta (le schede Pimoroni lo includono;
download su
[pimoroni-pico-rp2350](https://github.com/pimoroni/pimoroni-pico-rp2350/releases)
e [micropython.org](https://micropython.org/download/)).

## Risoluzione dei problemi

- **"No board in BOOTSEL mode was found"** (Nessuna scheda in modalità BOOTSEL trovata): il selettore del dispositivo era vuoto.
  Usa il pulsante di riavvio o tieni premuto BOOTSEL mentre colleghi, poi connettiti
  di nuovo.
- **"The board in BOOTSEL is an RP2040 but this project is built for
  RP2350"** (La scheda in BOOTSEL è un RP2040 ma questo progetto è creato per RP2350): Pimoroni ha venduto lo Stellar e il Galactic Unicorn con un Pico W
  (RP2040) fino a gennaio 2025 e con un Pico 2 W (RP2350) da allora. Controlla
  l'etichetta sulla tua unità e seleziona la scheda corrispondente nell'editor.
- **"Could not claim the USB device"** (Impossibile rivendicare il dispositivo USB) su Windows con un RP2040:
  il passaggio Zadig sopra. Su Linux: la regola udev sopra.
- **Il riavvio seriale non ha fatto nulla**: uno sketch creato con lo stack USB
  disabilitato non può essere riavviato via USB. Tieni premuto BOOTSEL mentre colleghi.

## Prima simula, poi flasha

Questo chiude il cerchio che rende Velxio utile per il lavoro reale: itera
velocemente nel simulatore (niente cavo, nessuna usura sull'hardware, ripristini
istantanei), poi flasha lo stesso identico artefatto di build quando si comporta
correttamente.
