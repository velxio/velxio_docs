---
title: Raspberry Pi (Linux)
description: Schede Raspberry Pi, dalla Zero alla Pi 5. Python contro il circuito sulla tela, nel browser per impostazione predefinita o in un guest Linux sui server di Velxio, con ciò che funziona su ciascuna parte misurata pezzo per pezzo.
sidebar:
  order: 7
  badge: PRO
---

La famiglia Raspberry Pi esegue **script Python contro il circuito sulla
tela**. A differenza delle schede microcontroller non c'è nulla da compilare:
si scrive uno script, si preme **Run**, e Velxio sceglie uno dei due motori per
eseguirlo. Nessuno dei due motori è un desktop Raspberry Pi OS, quindi leggi questa pagina
prima di dare per scontato che un tutorial scritto per l'hardware reale funzioni invariato.
La maggior parte di essi funziona: le tabelle seguenti sono state misurate sul prodotto live,
parte per parte, il 2026-09-19.

| Scheda                        | Profilo CPU         |
| ----------------------------- | ------------------- |
| **Raspberry Pi Zero / 1 / 2** | Classe ARM Cortex-A7 |
| **Raspberry Pi 3**            | Cortex-A53          |
| **Raspberry Pi 4**            | Cortex-A72          |
| **Raspberry Pi 5**            | Cortex-A76          |

Chiunque può posizionare una Pi sulla tela e cablare un circuito attorno ad essa. **Eseguirla**
richiede un piano a pagamento, oppure una delle **tre sessioni di prova gratuite da 15
minuti** che ogni account connesso riceve per la famiglia Pi (vedi
[piani](/docs/it/getting-started/plans/)). A un progetto che non ha nulla che una Pi possa
eseguire, come uno sketch Arduino `.ino` su una scheda Pi, viene detto prima che venga spesa una sessione di prova.

![Raspberry Pi 5 sulla tela di Velxio](../../../../assets/docs/boards/raspberry-pi-5.png)

## Due motori

### Istantaneo (nel tuo browser)

Il predefinito. Il tuo script viene eseguito su un interprete Python compilato in
WebAssembly all'interno della scheda, si avvia in pochi secondi e non richiede nulla
dai server di Velxio. Le scritture sui pin raggiungono direttamente la tela, quindi un LED
si accende nel momento in cui viene eseguito `led.on()`. I2C, SPI e 1-Wire sono presenti come
i file di dispositivo che una Pi ha (`/dev/i2c-1`, `/dev/spidev0.0`, l'albero
`/sys/bus/w1/devices`), gestiti dalle parti cablate sulla tela, quindi
le librerie reali `smbus2`, `w1thermsensor` e Adafruit Blinka funzionano senza modifiche.

È un semplice interprete, non un sistema operativo: non c'è shell, né
`subprocess`, né socket grezzi. Uno script che ne richiede uno viene inviato
al motore Linux; il **engine chip** nella barra degli strumenti indica quale
motore verrà eseguito e, quando è Linux, il file e la riga che lo hanno richiesto.

### Linux (sui server di Velxio)

Un vero guest Linux avviato in QEMU (`-M virt`, con il profilo CPU della tua
scheda) a cui accedi tramite la console seriale nell'area di lavoro. Sii
preciso su cosa sia:

- **Alpine Linux**, non Raspberry Pi OS. `python3` e `pip` sono installati;
  `apt`, `raspi-config`, il desktop e gli strumenti firmware della Pi non sono
  presenti.
- **Nessuna rete** dall'interno del guest, di proposito. `pip install` non può
  raggiungere PyPI; i pacchetti arrivano tramite `requirements.txt` (sotto).
- **I bus dell'header sono veri file di dispositivo.** `/dev/i2c-1`,
  `/dev/spidev0.0` e `/dev/spidev0.1` rispondono alle stesse chiamate di sistema che
  fanno su una Pi, quindi una libreria che li apre da sola (Adafruit Blinka), un programma
  C, o il tuo codice `ioctl` comunicano con le parti sulla tela. Un
  indirizzo che nessuno detiene fallisce con `OSError: [Errno 121] Remote I/O error`,
  come sull'hardware.
- **L'UART dell'header è una vera porta seriale.** `/dev/serial0` (anche
  `/dev/ttyAMA0` e `/dev/ttyS0`) è un tty autentico gestito dal
  pyserial non modificato: `serial.tools.list_ports`, `select()` sulla porta
  e `cat /dev/serial0` funzionano tutti, e i byte vanno a qualunque cosa sia cablata
  su GPIO14 e GPIO15 sulla tela.
- **1-Wire è presente come l'albero sysfs che una Pi ha.** Un DS18B20 su GPIO4 appare
  sotto `/sys/bus/w1/devices/28-*/` con `w1_slave` e `temperature`, quindi
  `cat`, i lettori in stile `w1thermsensor` e il tuo codice funzionano
  (`dtoverlay=w1-gpio,gpiopin=N` in un `config.txt` del progetto sposta il
  pin).
- **`libcamera-jpeg`, `rpicam-jpeg`, `rpicam-still`** scattano una foto dalla
  parte camera sulla tela, come uno script li chiama con `subprocess`.
  In questo motore l'immagine è il **pattern di test** della parte: il guest viene eseguito
  sui server di Velxio, e i pixel della tua webcam non lasciano mai il tuo browser.
- **Non** ci sono `/dev/gpiomem`, `/dev/gpiochip0` o `/sys/class/gpio`. Il GPIO
  passa attraverso `RPi.GPIO` e `gpiozero`, che sono presenti; `libgpiod`,
  `gpioinfo` e `pigpio` non hanno nulla con cui comunicare.
- L'avvio richiede circa 20-30 secondi, più a lungo quando il server è occupato; un
  overlay "Booting" lo traccia. Una sessione guest termina dopo **2 ore** al
  massimo.
- Il guest esegue **`script.py`** dal tuo progetto quando si avvia. Nomina il tuo
  file principale in quel modo in modalità Linux (il motore istantaneo esegue il primo
  `.py` che trova).

Il pulsante **Linux terminal** nell'area di lavoro fissa questo motore per il
resto della sessione quando vuoi la shell, ad esempio per ispezionare file
o eseguire uno script manualmente. La scelta non viene salvata con il progetto: riaprilo
domani e Run torna alla risposta del rilevatore. Tutto ciò che il
motore istantaneo può eseguire è più veloce senza di esso.

## Cosa funziona, parte per parte

Ogni riga è uno script scritto come lo scrive un tutorial per Pi, eseguito attraverso
il prodotto live con la parte cablata sulla tela, su una Raspberry Pi 4.
Le righe dei display sono verificate sulla tela stessa: il pannello deve illuminarsi,
non solo lo script deve terminare.

| Cosa | Libreria usata dallo script | Istantaneo | Linux |
| --- | --- | --- | --- |
| LED e pulsante | `gpiozero` | Sì | Sì |
| Servo (PWM) | `gpiozero.Servo` | Sì | Sì |
| Accelerometro MPU6050 | `smbus2` | Sì | Sì |
| Orologio in tempo reale DS3231 | `smbus2` | Sì | Sì |
| Sensore di pressione BMP280 | `smbus2` | Sì | Sì |
| Temperatura e umidità SHT31 | `smbus2` | Sì | Sì |
| Driver PWM a 16 canali PCA9685 | `smbus2` | Sì | Sì |
| ADC ADS1115 | `smbus2` | Sì | Sì |
| LCD 16x2, backpack I2C | `smbus2` o `RPLCD.i2c` | Sì | Sì |
| LCD 16x2, parallelo (RS, E, D4 a D7) | `RPLCD.gpio` | Sì | Sì |
| OLED SSD1306 | `smbus2` | Sì | Sì |
| OLED SSD1306 | `luma.oled` | Sì | Sì |
| OLED SSD1306 | Adafruit Blinka + `adafruit_ssd1306` | Sì | Sì |
| TFT ILI9341 | `spidev` | Sì | Sì |
| Scheda microSD (modalità SPI) | `spidev` | Sì | Sì |
| Sonda di temperatura DS18B20 | 1-Wire sysfs, `w1thermsensor` | Sì | Sì |
| Modulo GPS sull'UART dell'header | `pyserial` su `/dev/serial0` | Sì | Sì |
| E-paper 7.5" (UC8179) | `spidev` + `RPi.GPIO`, driver in stile Waveshare | Sì | Sì |
| Potenziometro direttamente su un GPIO | | No (vedi sotto) | No |

Le righe OLED e LCD sono state eseguite anche su una Raspberry Pi Zero nel motore
Linux, che è un guest a 32 bit con la propria immagine.

## Cosa non funziona

- **Ingresso analogico su un GPIO.** Una Raspberry Pi **non ha ADC**, nemmeno su hardware
  reale. Un potenziometro, LDR o sensore di impulsi cablato direttamente a un
  GPIO legge sempre solo alto o basso, e la console di esecuzione lo dice. Metti un
  **ADS1115** (I2C) o un **MCP3008** (SPI) tra il sensore e la Pi,
  esattamente come faresti su un banco; entrambi sono nel catalogo, e la galleria
  ha un esempio MCP3008 con un potenziometro.
- **La tua webcam nel motore Linux.** `picamera2` nel motore istantaneo può
  usare la tua webcam, perché lo script viene eseguito nel tuo browser. Il guest viene eseguito
  sui nostri server, quindi i suoi strumenti camera ottengono invece il pattern di test.
- **Un driver e-paper che invia la sua immagine nel posto sbagliato.** Su un
  pannello UC8179 (il 7.5") il comando `0x10` è l'immagine precedente e `0x13` è
  quella che il vetro mostra. Un driver che scrive solo `0x10` ottiene un refresh
  vuoto qui, esattamente come sul pannello reale, e il monitor seriale (il
  terminale Linux, in quel motore) dice perché. Anche il pin BUSY segue il controller: LOW mentre un pannello UltraChip
  lavora, HIGH su un SSD168x.
- **`pigpio`, `libgpiod` / `gpiod`, `/dev/gpiomem`.** Nessun daemon e nessun dispositivo
  a caratteri GPIO in nessuno dei due motori. Usa `RPi.GPIO` o `gpiozero`.
- **Uno script copiato da un tutorial MicroPython.** `import machine`,
  `from gpio_lcd import GpioLcd` e simili esistono su un Pico o un ESP32, non
  su una scheda che esegue il Python completo. La console nomina l'equivalente Pi
  (`gpiozero`, `RPLCD`, `luma.oled`, `w1thermsensor`) invece di proporre un
  pacchetto da installare.
- **PyTorch, TensorFlow.** Gigabyte, e nulla qui per accelerarli.
  Vengono rifiutati con quella spiegazione.

## Moduli Python in ciascun motore

Entrambi i motori includono la libreria standard. "Preinstallato" significa che funziona dalla
riga `import` da sola, senza `requirements.txt`, come Raspberry Pi OS
ha le sue librerie hardware nell'immagine.

| Modulo | Istantaneo (browser) | Linux (guest) |
| --- | --- | --- |
| `RPi.GPIO` | Preinstallato | Preinstallato |
| `gpiozero` | Preinstallato | Preinstallato (2.0.1) |
| `smbus2` / `smbus` | Preinstallato (la libreria reale) | Preinstallato |
| `spidev` | Preinstallato | Preinstallato |
| `serial` (pyserial) | Solo i percorsi UART della Pi | Il vero pyserial 3.5 su un vero tty |
| `w1thermsensor` | Preinstallato | Tramite `requirements.txt` (l'albero 1-Wire è presente) |
| `luma.core`, `luma.oled`, `luma.lcd` | Preinstallato | Preinstallato |
| `RPLCD` | Preinstallato | Preinstallato |
| `ST7789` | Preinstallato | Preinstallato |
| `board`, `busio`, `digitalio` (Adafruit Blinka) | Preinstallato | Preinstallato |
| `adafruit_ssd1306`, `adafruit_rgb_display` | Preinstallato | Preinstallato |
| `PIL` (Pillow), `numpy` | Preinstallato | Preinstallato (Pillow 10.3, numpy 1.25) |
| `cv2` (OpenCV) | Sì | No (nessuna build per il guest) |
| `picamera2` | Sì, sulla tua webcam | No (usa `rpicam-jpeg` / `libcamera-jpeg`) |
| `velxio_screen` | Sì | Sì |
| `requests` / `urllib` | Sì, tramite il proxy di uscita di Velxio con una allowlist | Nessuna rete |
| Qualsiasi altro | Tramite `requirements.txt` | Tramite `requirements.txt` |

I font DejaVu sono nel guest al percorso che Raspberry Pi OS usa
(`/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf`), perché i tutorial sui
display lo codificano in modo fisso.

```python
from luma.core.interface.serial import i2c
from luma.core.render import canvas
from luma.oled.device import ssd1306

import time

device = ssd1306(i2c(port=1, address=0x3C))
with canvas(device) as draw:
    draw.text((10, 20), "Hello from a Pi", fill="white")

# luma clears the panel when the script ends, as it does on hardware,
# so keep the script alive for as long as the text should stay up.
while True:
    time.sleep(1)
```

### Altri pacchetti di terze parti richiedono un `requirements.txt`

Aggiungi un file `requirements.txt` accanto al tuo script, un pacchetto per riga;
Velxio lo risolve prima dell'esecuzione e ti dice, nella console di esecuzione, cosa ha
installato. Quando uno script importa un pacchetto mancante, la console
offre la riga da aggiungere e un pulsante la scrive per te. Quale motore può accettare
un pacchetto dipende da come è costruito:

- Un pacchetto puro Python (una wheel `py3-none-any`) funziona in entrambi i motori.
- Un pacchetto con codice compilato funziona nel motore **istantaneo** quando il
  runtime del browser lo include (numpy, pillow, opencv-python, scikit-learn tra
  gli altri), e nel motore **Linux** solo se PyPI ha una wheel
  **musl aarch64** per esso (numpy, pandas, scipy e psutil ce l'hanno). I pacchetti che
  pubblicano solo wheel glibc `manylinux` non possono essere installati nel guest.
- Su una Raspberry Pi Zero, 1 o 2 il guest è a 32 bit, e PyPI non ha quasi
  wheel compilate per esso: lì, resta con ciò che è preinstallato o con
  pacchetti puro Python.
- I nomi che il guest fornisce già (`RPi.GPIO`, `smbus2`, `spidev`,
  `pyserial`, `gpiozero`) non vengono mai scaricati, quindi un `requirements.txt`
  di un tutorial che li elenca non fa danni.

Le wheel contano sulla stessa quota di archiviazione delle librerie Arduino.

## File

Un **file panel** nell'area di lavoro Pi carica script e file di dati nel
progetto; in modalità Linux vengono copiati nella directory home del guest
prima che `script.py` si avvii.

## La UNIHIKER M10

La SBC educativa di DFRobot (una scheda Linux con touchscreen integrato) funziona
sugli stessi due motori, con i propri moduli `pinpong` e `unihiker` al
posto degli shim della Pi. È una scheda a pagamento con le proprie tre sessioni di prova;
la trovi nel selettore accanto alla famiglia Pi.

## Grafica delle schede e pinout

La grafica sulla tela e la mappa completa dei pin di ogni scheda, generate dal simulatore:

[Raspberry Pi 3 (grafica anche per Zero/1/2)](/docs/it/boards/reference/raspberry-pi-3/) ·
[Raspberry Pi 4](/docs/it/boards/reference/raspberry-pi-4/) ·
[Raspberry Pi 5](/docs/it/boards/reference/raspberry-pi-5/) ·
[UNIHIKER M10](/docs/it/boards/reference/unihiker-m10/)
