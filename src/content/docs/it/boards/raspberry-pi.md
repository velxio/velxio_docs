---
title: Raspberry Pi (Linux)
description: Schede Raspberry Pi, dalla Zero alla Pi 5. Python contro il circuito sul canvas, nel browser per impostazione predefinita o in un guest Linux sui server di Velxio, con ciò che funziona su ciascuna parte misurata pezzo per pezzo.
sidebar:
  order: 7
  badge: PRO
---

La famiglia Raspberry Pi esegue **script Python contro il circuito sul
canvas**. A differenza delle schede microcontroller non c'è nulla da compilare:
si scrive uno script, si preme **Run**, e Velxio sceglie uno dei due motori per
eseguirlo. Nessuno dei due motori è un desktop Raspberry Pi OS, quindi leggete
questa pagina prima di dare per scontato che un tutorial scritto per l'hardware
reale funzioni senza modifiche. La maggior parte lo fa: le tabelle seguenti sono
state misurate sul prodotto live, pezzo per pezzo, il 2026-09-19.

| Scheda                        | Profilo CPU         |
| ----------------------------- | ------------------- |
| **Raspberry Pi Zero / 1 / 2** | Classe ARM Cortex-A7 |
| **Raspberry Pi 3**            | Cortex-A53          |
| **Raspberry Pi 4**            | Cortex-A72          |
| **Raspberry Pi 5**            | Cortex-A76          |

Chiunque può posizionare una Pi sul canvas e cablare un circuito attorno ad
essa. **Eseguirla** richiede un piano a pagamento, oppure una delle **tre
sessioni di prova gratuite da 15 minuti** che ogni account autenticato riceve
per la famiglia Pi (vedere
[piani](/docs/it/getting-started/plans/)). A un progetto che non ha nulla che una
Pi possa eseguire, come uno sketch Arduino `.ino` su una scheda Pi, viene
detto prima che venga spesa una sessione di prova.

![Raspberry Pi 5 sul canvas di Velxio](../../../../assets/docs/boards/raspberry-pi-5.png)

## Due motori

### Instant (nel browser)

Il predefinito. Il vostro script viene eseguito su un interprete Python
compilato in WebAssembly all'interno della scheda, si avvia in pochi secondi e
non richiede nulla dai server di Velxio. Le scritture sui pin raggiungono
direttamente il canvas, quindi un LED si accende nel momento in cui viene
eseguito `led.on()`. I2C, SPI e 1-Wire sono presenti come i file di dispositivo
che una Pi ha (`/dev/i2c-1`, `/dev/spidev0.0`, l'albero
`/sys/bus/w1/devices`), gestiti dai componenti cablati sul canvas, quindi le
librerie reali `smbus2`, `w1thermsensor` e Adafruit Blinka funzionano senza
modifiche.

È un semplice interprete, non un sistema operativo: non c'è shell, né
`subprocess`, né socket grezzi. Uno script che ne richiede uno viene inviato
invece al motore Linux; il **engine chip** nella barra degli strumenti indica
quale motore verrà eseguito e, quando è Linux, il file e la riga che lo hanno
richiesto.

### Linux (sui server di Velxio)

Un vero guest Linux avviato in QEMU (`-M virt`, con il profilo CPU della vostra
scheda) a cui si accede tramite la console seriale nel workspace. Siate precisi
su cosa sia:

- **Alpine Linux**, non Raspberry Pi OS. `python3` e `pip` sono installati;
  `apt`, `raspi-config`, il desktop e gli strumenti firmware della Pi non ci
  sono.
- **Nessuna rete** dall'interno del guest, di proposito. `pip install` non può
  raggiungere PyPI; i pacchetti arrivano tramite `requirements.txt` (sotto).
- **I bus dell'header sono veri file di dispositivo.** `/dev/i2c-1`,
  `/dev/spidev0.0` e `/dev/spidev0.1` rispondono alle stesse system call che
  fanno su una Pi, quindi una libreria che li apre da sola (Adafruit Blinka),
  un programma C, o il vostro codice `ioctl` comunicano con i componenti sul
  canvas. Un indirizzo che nessuno detiene fallisce con `OSError: [Errno 121]
  Remote I/O error`, come sull'hardware.
- **La UART dell'header è una vera porta seriale.** `/dev/serial0` (anche
  `/dev/ttyAMA0` e `/dev/ttyS0`) è un tty autentico pilotato dal pyserial non
  modificato: `serial.tools.list_ports`, `select()` sulla porta e
  `cat /dev/serial0` funzionano tutti, e i byte vanno a qualunque cosa sia
  cablata ai GPIO14 e GPIO15 sul canvas.
- **Non** ci sono `/dev/gpiomem`, `/dev/gpiochip0`, `/sys/class/gpio` né
  l'albero 1-Wire. Il GPIO passa attraverso `RPi.GPIO` e `gpiozero`, che sono
  presenti; `libgpiod`, `gpioinfo` e `pigpio` non hanno nulla con cui parlare.
- L'avvio richiede circa 20-30 secondi, di più quando il server è occupato;
  un overlay "Booting" lo tiene traccia. Una sessione guest termina dopo
  **2 ore** al massimo.
- Il guest esegue **`script.py`** dal vostro progetto all'avvio. Nominate il
  vostro file principale in quel modo in modalità Linux (il motore instant
  esegue il primo `.py` che trova).

Il pulsante **Linux terminal** nel workspace fissa questo motore per il resto
della sessione quando volete la shell, ad esempio per ispezionare i file o
eseguire uno script a mano. La scelta non viene salvata con il progetto:
riapritelo domani e Run tornerà alla risposta del rilevatore. Tutto ciò che il
motore instant può eseguire è più veloce senza di esso.

## Cosa funziona, pezzo per pezzo

Ogni riga è uno script scritto come lo scriverebbe un tutorial per Pi, eseguito
attraverso il prodotto live con il componente cablato sul canvas, su una
Raspberry Pi 4. Le righe dei display sono verificate sul canvas stesso: il
pannello deve illuminarsi, non solo lo script deve terminare.

| Cosa | Libreria usata dallo script | Instant | Linux |
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
| Sonda di temperatura DS18B20 | 1-Wire sysfs, `w1thermsensor` | Sì | **No** |
| Potenziometro direttamente su un GPIO | | No (vedere sotto) | No |

Le righe OLED e LCD sono state eseguite anche su una Raspberry Pi Zero nel
motore Linux, che è un guest a 32 bit con la propria immagine.

## Cosa non funziona

- **Ingresso analogico su un GPIO.** Una Raspberry Pi **non ha ADC**, anche
  sull'hardware reale. Un potenziometro, un LDR o un sensore a impulsi cablato
  direttamente a un GPIO legge sempre e solo alto o basso, e la console di
  esecuzione lo dice. Mettete un **ADS1115** (I2C) o un **MCP3008** (SPI) tra
  il sensore e la Pi, esattamente come fareste su un banco; entrambi sono nel
  catalogo, e la galleria ha un esempio MCP3008 con un potenziometro.
- **1-Wire nel motore Linux.** Il kernel del guest non ha supporto 1-Wire,
  quindi uno script DS18B20 non trova alcun `/sys/bus/w1/devices` lì. Funziona
  nel motore instant, che è comunque dove viene eseguito uno script che importa
  solo `w1thermsensor`.
- **La fotocamera nel motore Linux.** `picamera2` funziona nel motore instant,
  alimentato dalla vostra webcam o da un pattern di test; il guest non ha
  fotocamera.
- **`pigpio`, `libgpiod` / `gpiod`, `/dev/gpiomem`.** Nessun daemon e nessun
  dispositivo carattere GPIO in nessuno dei due motori. Usate `RPi.GPIO` o
  `gpiozero`.
- **Uno script copiato da un tutorial MicroPython.** `import machine`,
  `from gpio_lcd import GpioLcd` e simili esistono su una Pico o un ESP32, non
  su una scheda che esegue il Python completo. La console nomina l'equivalente
  per Pi (`gpiozero`, `RPLCD`, `luma.oled`, `w1thermsensor`) invece di proporre
  un pacchetto da installare.
- **PyTorch, TensorFlow.** Gigabyte, e nulla qui per accelerarli. Vengono
  rifiutati con quella spiegazione.

## Moduli Python in ciascun motore

Entrambi i motori includono la libreria standard. "Preinstallato" significa che
funziona dalla sola riga `import`, senza `requirements.txt`, come Raspberry Pi
OS ha le sue librerie hardware nell'immagine.

| Modulo | Instant (browser) | Linux (guest) |
| --- | --- | --- |
| `RPi.GPIO` | Preinstallato | Preinstallato |
| `gpiozero` | Preinstallato | Preinstallato (2.0.1) |
| `smbus2` / `smbus` | Preinstallato (la libreria reale) | Preinstallato |
| `spidev` | Preinstallato | Preinstallato |
| `serial` (pyserial) | Solo i percorsi UART della Pi | Il vero pyserial 3.5 su un vero tty |
| `w1thermsensor` | Preinstallato | Non disponibile (nessun 1-Wire) |
| `luma.core`, `luma.oled`, `luma.lcd` | Preinstallato | Preinstallato |
| `RPLCD` | Preinstallato | Preinstallato |
| `ST7789` | Preinstallato | Preinstallato |
| `board`, `busio`, `digitalio` (Adafruit Blinka) | Preinstallato | Preinstallato |
| `adafruit_ssd1306`, `adafruit_rgb_display` | Preinstallato | Preinstallato |
| `PIL` (Pillow), `numpy` | Preinstallato | Preinstallato (Pillow 10.3, numpy 1.25) |
| `cv2` (OpenCV) | Sì | No (nessuna build per il guest) |
| `picamera2` | Sì, tramite la vostra webcam | No |
| `velxio_screen` | Sì | Sì |
| `requests` / `urllib` | Sì, tramite il proxy di uscita di Velxio con una allowlist | Nessuna rete |
| Qualsiasi altro | Tramite `requirements.txt` | Tramite `requirements.txt` |

I font DejaVu sono nel guest al percorso che usa Raspberry Pi OS
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

Aggiungete un file `requirements.txt` accanto al vostro script, un pacchetto
per riga; Velxio lo risolve prima dell'esecuzione e vi dice, nella console di
esecuzione, cosa ha installato. Quando uno script importa un pacchetto
mancante, la console offre la riga da aggiungere e un pulsante la scrive per
voi. Quale motore può accettare un pacchetto dipende da come è costruito:

- Un pacchetto puro Python (una wheel `py3-none-any`) funziona in entrambi i
  motori.
- Un pacchetto con codice compilato funziona nel motore **instant** quando il
  runtime del browser lo fornisce (numpy, pillow, opencv-python, scikit-learn
  tra gli altri), e nel motore **Linux** solo se PyPI ha una wheel **musl
  aarch64** per esso (numpy, pandas, scipy e psutil ce l'hanno). I pacchetti
  che pubblicano solo wheel glibc `manylinux` non possono essere installati nel
  guest.
- Su una Raspberry Pi Zero, 1 o 2 il guest è a 32 bit, e PyPI non ha quasi
  nessuna wheel compilata per esso: lì, attenetevi a ciò che è preinstallato o
  ai pacchetti puro Python.
- I nomi che il guest fornisce già (`RPi.GPIO`, `smbus2`, `spidev`, `pyserial`,
  `gpiozero`) non vengono mai scaricati, quindi un `requirements.txt` di un
  tutorial che li elenca non fa danni.

Le wheel contano sulla stessa quota di archiviazione delle librerie Arduino.

## File

Un **file panel** nel workspace Pi carica script e file di dati nel progetto;
in modalità Linux vengono copiati nella directory home del guest prima che
`script.py` si avvii.

## La UNIHIKER M10

La SBC educativa di DFRobot (una scheda Linux con touchscreen integrato)
funziona sugli stessi due motori, con i propri moduli `pinpong` e `unihiker` al
posto degli shim per Pi. È una scheda a pagamento con le proprie tre sessioni
di prova; trovatela nel selettore accanto alla famiglia Pi.

## Arte delle schede e pinout

L'arte del canvas e la mappa completa dei pin di ciascuna scheda, generate dal
simulatore:

[Raspberry Pi 3 (arte anche per Zero/1/2)](/docs/it/boards/reference/raspberry-pi-3/) ·
[Raspberry Pi 4](/docs/it/boards/reference/raspberry-pi-4/) ·
[Raspberry Pi 5](/docs/it/boards/reference/raspberry-pi-5/) ·
[UNIHIKER M10](/docs/it/boards/reference/unihiker-m10/)
