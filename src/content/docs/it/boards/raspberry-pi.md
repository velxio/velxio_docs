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
eseguirlo. Nessuno dei due motori è un desktop Raspberry Pi OS, quindi leggete questa pagina
prima di dare per scontato che un tutorial scritto per l'hardware reale funzioni senza modifiche.
La maggior parte di essi funziona: le tabelle seguenti sono state misurate contro il prodotto live,
parte per parte, il 2026-09-19 e il 2026-09-20.

| Scheda                        | Profilo CPU         |
| ----------------------------- | ------------------- |
| **Raspberry Pi Zero / 1 / 2** | Classe ARM Cortex-A7 |
| **Raspberry Pi 3**            | Cortex-A53          |
| **Raspberry Pi 4**            | Cortex-A72          |
| **Raspberry Pi 5**            | Cortex-A76          |

Chiunque può posizionare una Pi sulla tela e cablare un circuito attorno ad essa. **Eseguirla**
richiede un piano a pagamento, oppure una delle **tre sessioni di prova gratuite da 15
minuti** che ogni account autenticato riceve per la famiglia Pi (vedi
[piani](/docs/it/getting-started/plans/)). A un progetto che non ha nulla che una Pi possa
eseguire, come uno sketch Arduino `.ino` su una scheda Pi, viene detto prima che venga spesa una sessione di prova.

![Raspberry Pi 5 sulla tela di Velxio](../../../../assets/docs/boards/raspberry-pi-5.png)

## Due motori

### Istantaneo (nel tuo browser)

Il predefinito. Il tuo script viene eseguito su un interprete Python compilato in
WebAssembly all'interno della scheda, si avvia in pochi secondi e non richiede nulla
dai server di Velxio. Le scritture sui pin raggiungono direttamente la tela, quindi un LED
si accende nel momento in cui viene eseguito `led.on()`. I2C, SPI e 1-Wire sono presenti come
file di dispositivo che una Pi ha (`/dev/i2c-1`, `/dev/spidev0.0`, l'albero
`/sys/bus/w1/devices`), gestiti dalle parti cablate sulla tela, quindi
i veri `smbus2`, `w1thermsensor` e Adafruit Blinka funzionano senza modifiche.

È un semplice interprete, non un sistema operativo: non c'è shell, né
`subprocess`, né socket grezzi. Uno script che ne richiede uno viene inviato
al motore Linux; il **chip del motore** nella barra degli strumenti indica quale
motore verrà eseguito e, quando è Linux, il file e la riga che lo hanno richiesto.

### Linux (sui server di Velxio)

Un vero guest Linux avviato in QEMU (`-M virt`, con il profilo CPU della tua
scheda) che raggiungi attraverso la console seriale nell'area di lavoro. Siate
precisi su cosa sia:

- **Alpine Linux**, non Raspberry Pi OS. `python3` e `pip` sono installati;
  `apt`, `raspi-config`, il desktop e gli strumenti firmware della Pi non ci sono.
- **Nessuna rete** dall'interno del guest, di proposito. Nulla là dentro può
  raggiungere PyPI; i pacchetti che un progetto dichiara in `requirements.txt` sono
  importabili nel momento in cui il guest si avvia, e `pip` stesso funziona offline
  contro un wheelhouse locale (sotto).
- **I bus dell'header sono veri file di dispositivo.** `/dev/i2c-0`, `/dev/i2c-1`,
  `/dev/spidev0.0` e `/dev/spidev0.1` rispondono alle stesse chiamate di sistema che
  fanno su una Pi, quindi una libreria che li apre da sola (Adafruit Blinka), un programma
  C, o il tuo codice `ioctl` parlano con le parti sulla tela. Un
  indirizzo che nessuno detiene fallisce con `OSError: [Errno 121] Remote I/O error`,
  come sull'hardware.
- **`smbus2` e `spidev` sono i pacchetti upstream**, non sostituti di Velxio:
  `import smbus2` ti dà il vero smbus2, `import spidev`
  un py-spidev compilato, ed entrambi passano attraverso quei nodi di dispositivo. Quindi le
  regole del kernel si applicano come su una scheda. Un trasferimento a blocco SMBus
  più lungo di 32 byte fallisce con un errore invece di essere silenziosamente
  accorciato, e aprire un bus che non esiste, `SMBus(2)` per
  esempio, solleva un'eccezione alla chiamata di apertura piuttosto che alla prima lettura.
- **L'UART dell'header è una vera porta seriale.** `/dev/serial0` (anche
  `/dev/ttyAMA0` e `/dev/ttyS0`) è un vero tty pilotato dal
  pyserial non modificato: `serial.tools.list_ports`, `select()` sulla porta
  e `cat /dev/serial0` funzionano tutti, e i byte vanno a qualunque cosa sia cablata a
  GPIO14 e GPIO15 sulla tela.
- **1-Wire è presente come l'albero sysfs che una Pi ha.** Un DS18B20 su GPIO4 appare
  sotto `/sys/bus/w1/devices/28-*/` con `w1_slave` e `temperature`, quindi
  `cat`, lettori in stile `w1thermsensor` e il tuo codice funzionano
  (`dtoverlay=w1-gpio,gpiopin=N` in un `config.txt` del progetto sposta il
  pin).
- **`libcamera-jpeg`, `rpicam-jpeg`, `rpicam-still` e `libcamera-still`**
  scattano una foto dalla parte camera sulla tela, come uno script li chiama
  con `subprocess`. L'immagine è il **pattern di test** della parte a meno che
  tu non permetta al guest di usare la tua webcam, cosa che Velxio chiede la prima
  volta che un programma scatta una foto (vedi sotto).
- **GPIO ha un vero character device.** `/dev/gpiochip0` è presente, e lo è
  anche il deprecato `/sys/class/gpio`, oltre a `RPi.GPIO` e `gpiozero`.
  Non c'è ancora **nessun** `/dev/gpiomem`, quindi `pigpio`, che vuole i
  registri periferici, non ha nulla con cui parlare (vedi sotto).
- L'avvio richiede circa 20-30 secondi, di più quando il server è occupato; un
  overlay "Booting" lo traccia. Una sessione guest termina dopo **2 ore** al
  massimo.
- Il guest esegue **`script.py`** dal tuo progetto quando si avvia. Nomina il tuo
  file principale in quel modo in modalità Linux (il motore istantaneo esegue il primo
  `.py` che trova).

Il pulsante **Linux terminal** nell'area di lavoro fissa questo motore per il
resto della sessione quando vuoi la shell, per esempio per ispezionare file
o eseguire uno script a mano. La scelta non viene salvata con il progetto: riaprilo
domani e Run torna alla risposta del rilevatore. Tutto ciò che il
motore istantaneo può eseguire è più veloce senza di esso.

## GPIO nel motore Linux: gpiochip0 e libgpiod

Il guest registra un character device GPIO con l'identità propria della Pi,
quindi lo stack moderno che la documentazione di Bookworm e della Pi 5 insegna funziona
qui. `gpiodetect` risponde:

```text
gpiochip0 [pinctrl-bcm2835] (54 lines)
```

Gli strumenti sono installati (`gpiodetect`, `gpioinfo`, `gpioget`, `gpioset`,
`gpiomon`), e una linea che essi pilotano raggiunge la parte cablata a quel pin sulla
tela.

L'immagine include **libgpiod versione 1**, quindi scrivi i comandi
nel modo della versione 1: il chip è un argomento posizionale, non un'opzione `--chip`.

```bash
gpioset gpiochip0 17=1     # drive GPIO17 high
gpioget gpiochip0 5        # read GPIO5, prints 0 or 1
gpiomon gpiochip0 5        # print edges on GPIO5 as they arrive
```

La sintassi della versione 2 (`gpioset --chip gpiochip0 17=1`) non è
compresa. Se un tutorial la usa, elimina l'opzione e passa il chip
da solo.

Anche i binding Python sono preinstallati, sempre con l'API
versione 1:

```python
import gpiod

chip = gpiod.Chip("gpiochip0")
line = chip.get_line(17)
line.request(consumer="velxio", type=gpiod.LINE_REQ_DIR_OUT)
line.set_value(1)
```

`RPi.GPIO` e `gpiozero` non sono toccati da questo e restano il modo più breve per
scrivere uno script. Anche l'interfaccia sysfs deprecata sotto `/sys/class/gpio`
funziona, quindi un vecchio tutorial che esporta un pin scrivendo su file
fa ciò che dice. Ciò che è ancora assente è `/dev/gpiomem`, e con esso
`pigpio`: quella libreria mappa direttamente i registri periferici, e qui
non c'è nulla da mappare.

Il motore istantaneo non ha character device: nel tuo browser, GPIO è
`RPi.GPIO`, `gpiozero` o Blinka.

## La camera nel motore Linux

Per impostazione predefinita gli strumenti camera del guest restituiscono il **pattern di test**
della parte camera, e uno script che scatta una foto ottiene un'immagine senza che venga
chiesto nulla a nessuno.

La prima volta che un programma richiede una foto nel motore Linux con la
parte camera in modalità webcam, Velxio chiede se può usare la tua vera
webcam per essa. Deve chiedere a causa di dove viene eseguito il codice: nel
motore istantaneo i fotogrammi non lasciano mai la tua macchina, mentre il guest Linux
viene eseguito sui server di Velxio, quindi permetterlo significa che i fotogrammi vengono inviati lì.

- Di' **no** e gli strumenti continuano a restituire il pattern di test. Nulla
  si rompe e nessuno script deve cambiare.
- Di' **sì** e le foto sono la tua vera webcam, **solo per quella sessione di pagina**.
  La risposta non viene salvata nel progetto e non viene ricordata dopo
  un ricaricamento, quindi la prossima volta che apri la pagina ti viene chiesto di nuovo.

`picamera2` è un'altra questione: è ancora un modulo del motore istantaneo.
Nel guest Linux, scatta foto con gli strumenti da riga di comando.

## Cosa funziona, parte per parte

Ogni riga è uno script scritto come lo scrive un tutorial per Pi, eseguito attraverso
il prodotto live con la parte cablata sulla tela, su una Raspberry Pi 4.
Le righe dei display sono verificate sulla tela stessa: il pannello deve accendersi,
non solo lo script deve terminare.

| Cosa | Libreria usata dallo script | Istantaneo | Linux |
| --- | --- | --- | --- |
| LED e pulsante | `gpiozero` | Sì | Sì |
| LED dalla shell | `gpioset` (libgpiod 1) | No | Sì |
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

- **Ingresso analogico su un GPIO.** Una Raspberry Pi **non ha ADC**, anche su hardware
  reale. Un potenziometro, LDR o sensore di impulsi cablato direttamente a un
  GPIO legge sempre solo alto o basso, e la console di esecuzione lo dice. Metti un
  **ADS1115** (I2C) o un **MCP3008** (SPI) tra il sensore e la Pi,
  esattamente come faresti su un banco; entrambi sono nel catalogo, e la galleria
  ha un esempio MCP3008 con un potenziometro.
- **`picamera2` nel motore Linux.** Usa la tua webcam nel motore istantaneo,
  perché lo script viene eseguito nel tuo browser. Nel guest, le foto
  provengono invece da `rpicam-jpeg` e i suoi fratelli, sul pattern di test
  o sulla tua webcam una volta che l'hai permesso (sopra).
- **Un driver e-paper che invia la sua immagine nel posto sbagliato.** Su un pannello
  UC8179 (il 7.5") il comando `0x10` è l'immagine precedente e `0x13` è
  quella che il vetro mostra. Un driver che scrive solo `0x10` ottiene un refresh
  vuoto qui, esattamente come sul pannello reale, e il monitor seriale (il
  terminale Linux, in quel motore) dice perché. Anche il pin BUSY segue il controller: LOW mentre un pannello UltraChip
  lavora, HIGH su un SSD168x.
- **`pigpio` e `/dev/gpiomem`.** `pigpio` raggiunge i pin mappando i
  registri periferici, e nessuno dei due motori gli dà quella mappatura. Usa
  `RPi.GPIO`, `gpiozero` o, nel motore Linux, `libgpiod` (sopra).
- **`libgpiod` / `gpiod` nel motore istantaneo.** Il character device è una
  cosa del motore Linux; nel browser non c'è `/dev/gpiochip0` da aprire.
- **Uno script copiato da un tutorial MicroPython.** `import machine`,
  `from gpio_lcd import GpioLcd` e simili esistono su un Pico o un ESP32, non
  su una scheda che esegue il Python completo. La console nomina l'equivalente Pi
  (`gpiozero`, `RPLCD`, `luma.oled`, `w1thermsensor`) invece di proporre un
  pacchetto da installare.
- **PyTorch, TensorFlow.** Gigabyte, e qui nulla per accelerarli.
  Vengono rifiutati con quella spiegazione.

## Moduli Python in ciascun motore

Entrambi i motori includono la libreria standard. "Preinstallato" significa che funziona dalla
riga `import` da sola, senza `requirements.txt`, come Raspberry Pi OS
ha le sue librerie hardware nell'immagine.

| Modulo | Istantaneo (browser) | Linux (guest) |
| --- | --- | --- |
| `RPi.GPIO` | Preinstallato | Preinstallato |
| `gpiozero` | Preinstallato | Preinstallato (2.0.1) |
| `gpiod` (libgpiod 1) | Nessun character device nel browser | Preinstallato, con gli strumenti `gpio*` |
| `smbus2` / `smbus` | Preinstallato (la vera libreria) | Preinstallato (la vera libreria) |
| `spidev` | Preinstallato | Preinstallato (un py-spidev compilato) |
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
| `requests` / `urllib` | Sì, attraverso il proxy di uscita di Velxio con una allowlist | Nessuna rete |
| Qualsiasi altra cosa | Tramite `requirements.txt` | Tramite `requirements.txt` |

I font DejaVu sono nel guest al percorso che Raspberry Pi OS usa
(`/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf`), perché i tutorial sui
display lo codificano direttamente.

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
  `pyserial`, `gpiozero`, `gpiod`) non vengono mai scaricati, quindi un
  `requirements.txt` di un tutorial che li elenca non fa danni.

Le wheel contano sulla stessa quota di archiviazione delle librerie Arduino.

### Eseguire pip a mano nel guest Linux

Non devi mai farlo. Ciò che `requirements.txt` dichiara è importabile nel
momento in cui il guest si avvia, senza alcun passaggio di installazione. Anche il vero comando
funziona, per chi segue un tutorial che lo specifica esplicitamente:

```bash
python3 -m venv --system-site-packages ~/.venv
~/.venv/bin/pip install -r requirements.txt
```

Il guest non ha rete, quindi `pip` risolve contro un wheelhouse locale
che viene fornito con i pacchetti del progetto; installa ciò che il progetto
dichiara, e non può raggiungere PyPI per qualsiasi altra cosa.

Sappi quanto costa prima di iniziare, e non leggere il silenzio come un
blocco: sulla CPU emulata, creare un virtualenv **con** pip richiede circa
quattro minuti (circa sei secondi senza), e l'installazione stessa circa
mezzo minuto. L'attesa non ti dà nulla che tu non avessi già, poiché
i pacchetti che hai dichiarato sono già importati nel momento in cui ottieni un
prompt. È lì per le volte in cui vuoi il flusso di lavoro reale.

Il Python di sistema è contrassegnato come gestito esternamente (PEP 668), esattamente come su
Raspberry Pi OS Bookworm, quindi un semplice `pip install` fuori da un virtualenv
rifiuta con lo stesso messaggio che dà sulla scheda.

## File

Un **pannello file** nell'area di lavoro Pi carica script e file di dati nel
progetto; in modalità Linux vengono copiati nella directory home del guest
prima che `script.py` si avvii.

## L'UNIHIKER M10

La SBC educativa di DFRobot (una scheda Linux con touchscreen integrato) funziona
sugli stessi due motori, con i propri moduli `pinpong` e `unihiker` al
posto delle librerie Pi. È una scheda a pagamento con le proprie tre sessioni di prova;
la trovi nel selettore accanto alla famiglia Pi.

## Grafica delle schede e pinout

La grafica sulla tela e la mappa completa dei pin di ciascuna scheda, generate dal simulatore:

[Raspberry Pi 3 (grafica anche per Zero/1/2)](/docs/it/boards/reference/raspberry-pi-3/) ·
[Raspberry Pi 4](/docs/it/boards/reference/raspberry-pi-4/) ·
[Raspberry Pi 5](/docs/it/boards/reference/raspberry-pi-5/) ·
[UNIHIKER M10](/docs/it/boards/reference/unihiker-m10/)
