---
title: Raspberry Pi (Linux)
description: Placas Raspberry Pi, da Zero à Pi 5. Python contra o circuito na tela, no navegador por padrão ou em um guest Linux nos servidores da Velxio, com o que funciona em cada peça medida, parte por parte.
sidebar:
  order: 7
  badge: PRO
---

A família Raspberry Pi executa **scripts Python contra o circuito na tela**. Diferente das placas microcontroladoras, não há nada para compilar: você escreve um script, pressiona **Run** (Executar) e a Velxio escolhe um de dois motores para executá-lo. Nenhum dos motores é um desktop Raspberry Pi OS, então leia esta página antes de presumir que um tutorial escrito para hardware real funcionará sem alterações. A maioria funciona: as tabelas abaixo foram medidas contra o produto ao vivo, parte por parte, em 2026-09-19.

| Placa                         | Perfil de CPU        |
| ----------------------------- | -------------------- |
| **Raspberry Pi Zero / 1 / 2** | Classe ARM Cortex-A7 |
| **Raspberry Pi 3**            | Cortex-A53           |
| **Raspberry Pi 4**            | Cortex-A72           |
| **Raspberry Pi 5**            | Cortex-A76           |

Qualquer pessoa pode colocar um Pi na tela e montar um circuito ao redor dele. **Executá-lo** exige um plano pago, ou uma das **três sessões de teste gratuitas de 15 minutos** que toda conta conectada recebe para a família Pi (veja [planos](/docs/pt-br/getting-started/plans/)). Um projeto que não tem nada que um Pi possa executar, como um sketch Arduino `.ino` em uma placa Pi, é avisado disso antes que uma sessão de teste seja gasta nele.

![Raspberry Pi 5 na tela da Velxio](../../../../assets/docs/boards/raspberry-pi-5.png)

## Dois motores

### Instantâneo (no seu navegador)

O padrão. Seu script roda em um interpretador Python compilado para WebAssembly dentro da aba, inicia em poucos segundos e não precisa de nada dos servidores da Velxio. As escritas de pino chegam diretamente à tela, então um LED acende no momento em que `led.on()` é executado. I2C, SPI e 1-Wire estão lá como os arquivos de dispositivo que um Pi tem (`/dev/i2c-1`, `/dev/spidev0.0`, a árvore `/sys/bus/w1/devices`), respondidos pelas peças conectadas na tela, então os verdadeiros `smbus2`, `w1thermsensor` e Adafruit Blinka rodam sem modificação.

É um interpretador simples, não um sistema operacional: não há shell, nem `subprocess`, nem sockets brutos. Um script que pede uma dessas coisas é enviado ao motor Linux; o **engine chip** (indicador de motor) na barra de ferramentas diz qual motor irá executar e, quando é Linux, o arquivo e a linha que o solicitaram.

### Linux (nos servidores da Velxio)

Um guest Linux real inicializado no QEMU (`-M virt`, com o perfil de CPU da sua placa) que você acessa pelo console serial no workspace. Seja preciso sobre o que ele é:

- **Alpine Linux**, não Raspberry Pi OS. `python3` e `pip` estão instalados; `apt`, `raspi-config`, o desktop e as ferramentas de firmware do Pi não estão lá.
- **Sem rede** de dentro do guest, de propósito. `pip install` não consegue alcançar o PyPI; os pacotes chegam através do `requirements.txt` (abaixo).
- **Os barramentos do header são arquivos de dispositivo reais.** `/dev/i2c-1`, `/dev/spidev0.0` e `/dev/spidev0.1` respondem às mesmas chamadas de sistema que respondem em um Pi, então uma biblioteca que os abre por conta própria (Adafruit Blinka), um programa em C ou seu próprio código `ioctl` conversa com as peças na tela. Um endereço que ninguém ocupa falha com `OSError: [Errno 121] Remote I/O error`, como no hardware.
- **A UART do header é uma porta serial real.** `/dev/serial0` (também `/dev/ttyAMA0` e `/dev/ttyS0`) é um tty genuíno controlado pelo pyserial sem modificação: `serial.tools.list_ports`, `select()` na porta e `cat /dev/serial0` funcionam, e os bytes vão para o que estiver conectado aos GPIO14 e GPIO15 na tela.
- **Não há** `/dev/gpiomem`, `/dev/gpiochip0`, `/sys/class/gpio` nem árvore 1-Wire. O GPIO passa por `RPi.GPIO` e `gpiozero`, que estão lá; `libgpiod`, `gpioinfo` e `pigpio` não têm com o que conversar.
- A inicialização leva cerca de 20 a 30 segundos, mais quando o servidor está ocupado; uma sobreposição "Booting" acompanha o processo. Uma sessão de guest termina após **2 horas**, no máximo.
- O guest executa **`script.py`** do seu projeto quando inicializa. Nomeie seu arquivo principal assim no modo Linux (o motor instantâneo executa o primeiro `.py` que encontra).

O botão **Linux terminal** no workspace fixa esse motor pelo resto da sessão quando você quer o shell, por exemplo para inspecionar arquivos ou executar um script manualmente. A escolha não é salva com o projeto: reabra-o amanhã e Run volta à resposta do detector. Tudo o que o motor instantâneo consegue executar é mais rápido sem ele.

## O que funciona, parte por parte

Cada linha é um script escrito da forma como um tutorial de Pi o escreve, executado no produto ao vivo com a peça conectada na tela, em um Raspberry Pi 4. As linhas de display são verificadas na própria tela: o painel precisa acender, não apenas o script terminar.

| O quê | Biblioteca que o script usa | Instantâneo | Linux |
| --- | --- | --- | --- |
| LED e botão de pressão | `gpiozero` | Sim | Sim |
| Servo (PWM) | `gpiozero.Servo` | Sim | Sim |
| Acelerômetro MPU6050 | `smbus2` | Sim | Sim |
| Relógio de tempo real DS3231 | `smbus2` | Sim | Sim |
| Sensor de pressão BMP280 | `smbus2` | Sim | Sim |
| Temperatura e umidade SHT31 | `smbus2` | Sim | Sim |
| Driver PWM de 16 canais PCA9685 | `smbus2` | Sim | Sim |
| ADC ADS1115 | `smbus2` | Sim | Sim |
| LCD 16x2, backpack I2C | `smbus2` ou `RPLCD.i2c` | Sim | Sim |
| LCD 16x2, paralelo (RS, E, D4 a D7) | `RPLCD.gpio` | Sim | Sim |
| OLED SSD1306 | `smbus2` | Sim | Sim |
| OLED SSD1306 | `luma.oled` | Sim | Sim |
| OLED SSD1306 | Adafruit Blinka + `adafruit_ssd1306` | Sim | Sim |
| TFT ILI9341 | `spidev` | Sim | Sim |
| Cartão microSD (modo SPI) | `spidev` | Sim | Sim |
| Sonda de temperatura DS18B20 | 1-Wire sysfs, `w1thermsensor` | Sim | **Não** |
| Potenciômetro direto em um GPIO | | Não (veja abaixo) | Não |

As linhas de OLED e LCD também foram executadas em um Raspberry Pi Zero no motor Linux, que é um guest de 32 bits com sua própria imagem.

## O que não funciona

- **Entrada analógica em um GPIO.** Um Raspberry Pi **não tem ADC**, também no hardware real. Um potenciômetro, LDR ou sensor de pulso conectado diretamente a um GPIO só lê alto ou baixo, e o console de execução informa isso. Coloque um **ADS1115** (I2C) ou um **MCP3008** (SPI) entre o sensor e o Pi, exatamente como você faria em uma bancada; ambos estão no catálogo, e a galeria tem um exemplo de MCP3008 com um potenciômetro.
- **1-Wire no motor Linux.** O kernel do guest não tem suporte a 1-Wire, então um script de DS18B20 não encontra nenhum `/sys/bus/w1/devices` lá. Funciona no motor instantâneo, que é onde um script que só importa `w1thermsensor` acaba rodando de qualquer forma.
- **A câmera no motor Linux.** `picamera2` funciona no motor instantâneo, alimentado pela sua webcam ou por um padrão de teste; o guest não tem câmera.
- **`pigpio`, `libgpiod` / `gpiod`, `/dev/gpiomem`.** Nenhum daemon e nenhum dispositivo de caractere GPIO em qualquer dos motores. Use `RPi.GPIO` ou `gpiozero`.
- **Um script copiado de um tutorial MicroPython.** `import machine`, `from gpio_lcd import GpioLcd` e similares existem em um Pico ou ESP32, não em uma placa que roda o Python completo. O console informa o equivalente para Pi (`gpiozero`, `RPLCD`, `luma.oled`, `w1thermsensor`) em vez de propor um pacote para instalar.
- **PyTorch, TensorFlow.** Gigabytes, e nada aqui para acelerá-los. São recusados com essa explicação.

## Módulos Python em cada motor

Ambos os motores incluem a biblioteca padrão. "Pré-instalado" significa que funciona apenas com a linha `import`, sem `requirements.txt`, da forma como o Raspberry Pi OS tem suas bibliotecas de hardware na imagem.

| Módulo | Instantâneo (navegador) | Linux (guest) |
| --- | --- | --- |
| `RPi.GPIO` | Pré-instalado | Pré-instalado |
| `gpiozero` | Pré-instalado | Pré-instalado (2.0.1) |
| `smbus2` / `smbus` | Pré-instalado (a biblioteca real) | Pré-instalado |
| `spidev` | Pré-instalado | Pré-instalado |
| `serial` (pyserial) | Apenas os caminhos da UART do Pi | O pyserial 3.5 real em um tty real |
| `w1thermsensor` | Pré-instalado | Não disponível (sem 1-Wire) |
| `luma.core`, `luma.oled`, `luma.lcd` | Pré-instalado | Pré-instalado |
| `RPLCD` | Pré-instalado | Pré-instalado |
| `ST7789` | Pré-instalado | Pré-instalado |
| `board`, `busio`, `digitalio` (Adafruit Blinka) | Pré-instalado | Pré-instalado |
| `adafruit_ssd1306`, `adafruit_rgb_display` | Pré-instalado | Pré-instalado |
| `PIL` (Pillow), `numpy` | Pré-instalado | Pré-instalado (Pillow 10.3, numpy 1.25) |
| `cv2` (OpenCV) | Sim | Não (sem build para o guest) |
| `picamera2` | Sim, sobre sua webcam | Não |
| `velxio_screen` | Sim | Sim |
| `requests` / `urllib` | Sim, através do proxy de saída da Velxio com uma lista de permissões | Sem rede |
| Qualquer outro | Através do `requirements.txt` | Através do `requirements.txt` |

As fontes DejaVu estão no guest no caminho que o Raspberry Pi OS usa (`/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf`), porque os tutoriais de display o codificam diretamente.

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

### Outros pacotes de terceiros precisam de um `requirements.txt`

Adicione um arquivo `requirements.txt` ao lado do seu script, um pacote por linha; a Velxio o resolve antes da execução e informa, no console de execução, o que instalou. Quando um script importa um pacote que está faltando, o console oferece a linha a adicionar e um botão a escreve para você. Qual motor pode aceitar um pacote depende de como ele é construído:

- Um pacote puramente Python (um wheel `py3-none-any`) roda em ambos os motores.
- Um pacote com código compilado roda no motor **instantâneo** quando o runtime do navegador o inclui (numpy, pillow, opencv-python, scikit-learn entre outros), e no motor **Linux** apenas se o PyPI tiver um wheel **musl aarch64** para ele (numpy, pandas, scipy e psutil têm). Pacotes que só publicam wheels glibc `manylinux` não podem ser instalados no guest.
- Em um Raspberry Pi Zero, 1 ou 2 o guest é de 32 bits, e o PyPI quase não tem wheels compilados para ele: nesse caso, fique com o que está pré-instalado ou com pacotes puramente Python.
- Nomes que o guest já fornece (`RPi.GPIO`, `smbus2`, `spidev`, `pyserial`, `gpiozero`) nunca são baixados, então um `requirements.txt` de tutorial que os liste não causa dano.

Os wheels contam contra a mesma cota de armazenamento que as bibliotecas Arduino.

## Arquivos

Um **file panel** (painel de arquivos) no workspace do Pi envia scripts e arquivos de dados para o projeto; no modo Linux eles são copiados para o diretório home do guest antes de `script.py` iniciar.

## O UNIHIKER M10

O SBC educacional da DFRobot (uma placa Linux com tela sensível ao toque integrada) roda nos mesmos dois motores, com seus próprios módulos `pinpong` e `unihiker` no lugar dos shims do Pi. É uma placa paga com suas próprias três sessões de teste; encontre-a no seletor ao lado da família Pi.

## Arte das placas e pinagens

A arte na tela e o mapa completo de pinos de cada placa, gerados a partir do simulador:

[Raspberry Pi 3 (arte também para Zero/1/2)](/docs/pt-br/boards/reference/raspberry-pi-3/) ·
[Raspberry Pi 4](/docs/pt-br/boards/reference/raspberry-pi-4/) ·
[Raspberry Pi 5](/docs/pt-br/boards/reference/raspberry-pi-5/) ·
[UNIHIKER M10](/docs/pt-br/boards/reference/unihiker-m10/)
