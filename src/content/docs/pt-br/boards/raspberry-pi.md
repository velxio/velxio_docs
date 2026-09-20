---
title: Raspberry Pi (Linux)
description: Placas Raspberry Pi, da Zero à Pi 5. Python contra o circuito na tela, no navegador por padrão ou em um guest Linux nos servidores da Velxio, com o que funciona em cada parte medida, componente por componente.
sidebar:
  order: 7
  badge: PRO
---

A família Raspberry Pi executa **scripts Python contra o circuito na
tela**. Diferente das placas microcontroladoras, não há nada a compilar:
você escreve um script, pressiona **Run** e a Velxio escolhe um de dois
motores para executá-lo. Nenhum dos motores é um desktop do Raspberry Pi OS,
então leia esta página antes de presumir que um tutorial escrito para
hardware real funcionará sem alterações. A maioria funciona: as tabelas
abaixo foram medidas contra o produto ao vivo, componente por componente,
em 2026-09-19 e 2026-09-20.

| Placa                         | Perfil de CPU        |
| ----------------------------- | -------------------- |
| **Raspberry Pi Zero / 1 / 2** | Classe ARM Cortex-A7 |
| **Raspberry Pi 3**            | Cortex-A53           |
| **Raspberry Pi 4**            | Cortex-A72           |
| **Raspberry Pi 5**            | Cortex-A76           |

Qualquer pessoa pode colocar um Pi na tela e montar um circuito ao redor
dele. **Executá-lo** exige um plano pago, ou uma das **três sessões de
teste gratuitas de 15 minutos** que toda conta autenticada recebe para a
família Pi (veja
[planos](/docs/pt-br/getting-started/plans/)). Um projeto que não tem nada que um
Pi possa executar, como um sketch Arduino `.ino` em uma placa Pi, é avisado
disso antes que uma sessão de teste seja gasta nele.

![Raspberry Pi 5 na tela da Velxio](../../../../assets/docs/boards/raspberry-pi-5.png)

## Dois motores

### Instantâneo (no seu navegador)

O padrão. Seu script roda em um interpretador Python compilado para
WebAssembly dentro da aba, inicia em poucos segundos e não precisa de nada
dos servidores da Velxio. As escritas de pino chegam diretamente à tela,
então um LED acende no momento em que `led.on()` é executado. I2C, SPI e
1-Wire estão lá como os arquivos de dispositivo que um Pi tem
(`/dev/i2c-1`, `/dev/spidev0.0`, a árvore
`/sys/bus/w1/devices`), respondidos pelos componentes conectados na tela,
então os verdadeiros `smbus2`, `w1thermsensor` e Adafruit Blinka rodam sem
modificação.

É um interpretador simples, não um sistema operacional: não há shell, nem
`subprocess`, nem sockets brutos. Um script que pede um desses é enviado
ao motor Linux; o **engine chip** na barra de ferramentas diz qual
motor vai executar e, quando é Linux, o arquivo e a linha que o solicitaram.

### Linux (nos servidores da Velxio)

Um guest Linux real inicializado no QEMU (`-M virt`, com o perfil de CPU da
sua placa) que você acessa pelo console serial no workspace. Seja preciso
sobre o que ele é:

- **Alpine Linux**, não Raspberry Pi OS. `python3` e `pip` estão instalados;
  `apt`, `raspi-config`, o desktop e as ferramentas de firmware do Pi não
  estão lá.
- **Sem rede** de dentro do guest, de propósito. Nada lá dentro pode
  alcançar o PyPI; os pacotes que um projeto declara em `requirements.txt`
  são importáveis no momento em que o guest inicializa, e o próprio `pip`
  funciona offline contra um wheelhouse local (abaixo).
- **Os barramentos do header são arquivos de dispositivo reais.** `/dev/i2c-0`, `/dev/i2c-1`,
  `/dev/spidev0.0` e `/dev/spidev0.1` respondem às mesmas chamadas de sistema que
  respondem em um Pi, então uma biblioteca que os abre por conta própria (Adafruit Blinka), um programa
  em C, ou seu próprio código `ioctl` conversa com os componentes na
  tela. Um endereço que ninguém ocupa falha com `OSError: [Errno 121] Remote I/O error`,
  como no hardware.
- **`smbus2` e `spidev` são os pacotes upstream**, não substitutos da Velxio:
  `import smbus2` fornece o smbus2 real, `import spidev`
  um py-spidev compilado, e ambos passam por esses nós de dispositivo. Então as
  regras do kernel se aplicam como em uma placa. Uma transferência de bloco SMBus
  maior que 32 bytes falha com um erro em vez de ser silenciosamente
  encurtada, e abrir um barramento que não existe, `SMBus(2)` por
  exemplo, gera exceção na chamada de abertura em vez de na primeira leitura.
- **A UART do header é uma porta serial real.** `/dev/serial0` (também
  `/dev/ttyAMA0` e `/dev/ttyS0`) é um tty genuíno controlado pelo
  pyserial sem modificação: `serial.tools.list_ports`, `select()` na porta
  e `cat /dev/serial0` todos funcionam, e os bytes vão para o que estiver conectado
  ao GPIO14 e GPIO15 na tela.
- **1-Wire está lá como a árvore sysfs que um Pi tem.** Um DS18B20 no GPIO4 aparece
  em `/sys/bus/w1/devices/28-*/` com `w1_slave` e `temperature`, então
  `cat`, leitores no estilo `w1thermsensor` e seu próprio código funcionam
  (`dtoverlay=w1-gpio,gpiopin=N` em um `config.txt` do projeto move o
  pino).
- **`libcamera-jpeg`, `rpicam-jpeg`, `rpicam-still` e `libcamera-still`**
  tiram uma foto do componente de câmera na tela, do jeito que um script os chama com
  `subprocess`. A imagem é o **padrão de teste** do componente, a menos
  que você permita que o guest use sua webcam, o que a Velxio pede na primeira
  vez que um programa tira uma foto (veja abaixo).
- **GPIO tem um dispositivo de caractere real.** `/dev/gpiochip0` está lá, e também
  está o obsoleto `/sys/class/gpio`, além de `RPi.GPIO` e `gpiozero`.
  Ainda **não** há `/dev/gpiomem`, então o `pigpio`, que quer os
  registradores de periférico, não tem com o que conversar (veja abaixo).
- A inicialização leva cerca de 20 a 30 segundos, mais quando o servidor está ocupado; uma
  sobreposição "Booting" acompanha isso. Uma sessão de guest termina após **2 horas** no
  máximo.
- O guest executa **`script.py`** do seu projeto quando inicializa. Nomeie seu
  arquivo principal assim no modo Linux (o motor instantâneo executa o primeiro
  `.py` que encontra).

O botão **Linux terminal** no workspace fixa este motor pelo
resto da sessão quando você quer o shell, por exemplo para inspecionar arquivos
ou executar um script manualmente. A escolha não é salva com o projeto: reabra-o
amanhã e Run volta à resposta do detector. Tudo o que o
motor instantâneo pode executar é mais rápido sem ele.

## GPIO no motor Linux: gpiochip0 e libgpiod

O guest registra um dispositivo de caractere GPIO com a própria identidade do Pi,
então a pilha moderna que o Bookworm e a documentação do Pi 5 ensinam funciona
aqui. O `gpiodetect` responde:

```text
gpiochip0 [pinctrl-bcm2835] (54 lines)
```

As ferramentas estão instaladas (`gpiodetect`, `gpioinfo`, `gpioget`, `gpioset`,
`gpiomon`), e uma linha que elas acionam chega ao componente conectado àquele pino na
tela.

A imagem traz a **libgpiod versão 1**, então escreva os comandos no
formato da versão 1: o chip é um argumento posicional, não uma opção `--chip`.

```bash
gpioset gpiochip0 17=1     # drive GPIO17 high
gpioget gpiochip0 5        # read GPIO5, prints 0 or 1
gpiomon gpiochip0 5        # print edges on GPIO5 as they arrive
```

A grafia da versão 2 (`gpioset --chip gpiochip0 17=1`) não é
compreendida. Se um tutorial a usar, remova a opção e passe o chip
sozinho.

Os bindings Python também estão pré-instalados, novamente com a API da
versão 1:

```python
import gpiod

chip = gpiod.Chip("gpiochip0")
line = chip.get_line(17)
line.request(consumer="velxio", type=gpiod.LINE_REQ_DIR_OUT)
line.set_value(1)
```

`RPi.GPIO` e `gpiozero` não são afetados por isso e continuam sendo o caminho mais curto
para escrever um script. A interface sysfs obsoleta em `/sys/class/gpio`
também funciona, então um tutorial antigo que exporta um pino escrevendo em arquivos
faz o que diz. O que ainda está ausente é `/dev/gpiomem`, e com ele
o `pigpio`: essa biblioteca mapeia os registradores de periférico diretamente, e não
há nada aqui para mapear.

O motor instantâneo não tem dispositivo de caractere: no seu navegador, GPIO é
`RPi.GPIO`, `gpiozero` ou Blinka.

## A câmera no motor Linux

Por padrão, as ferramentas de câmera do guest retornam o **padrão de
teste** do componente de câmera, e um script que tira uma foto obtém uma imagem sem que
nada seja perguntado a ninguém.

Na primeira vez que um programa pede uma foto no motor Linux com o
componente de câmera no modo webcam, a Velxio pergunta se pode usar sua webcam
real para isso. Ela precisa perguntar por causa de onde o código roda: no
motor instantâneo os quadros nunca saem da sua máquina, enquanto o guest Linux
roda nos servidores da Velxio, então permitir significa que os quadros são enviados para lá.

- Diga **não** e as ferramentas continuam retornando o padrão de teste. Nada
  quebra e nenhum script precisa mudar.
- Diga **sim** e as fotos serão da sua webcam real, **apenas para aquela sessão
  de página**. A resposta não é salva no projeto nem lembrada após
  um recarregamento, então na próxima vez que você abrir a página será perguntado novamente.

`picamera2` é outro assunto: ainda é um módulo do motor instantâneo.
No guest Linux, tire fotos com as ferramentas de linha de comando.

## O que funciona, componente por componente

Cada linha é um script escrito do jeito que um tutorial de Pi escreve, executado no
produto ao vivo com o componente conectado na tela, em um Raspberry Pi 4.
As linhas de display são verificadas na própria tela: o painel precisa acender,
não apenas o script terminar.

| O quê | Biblioteca que o script usa | Instantâneo | Linux |
| --- | --- | --- | --- |
| LED e botão de pressão | `gpiozero` | Sim | Sim |
| LED pelo shell | `gpioset` (libgpiod 1) | Não | Sim |
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
| Sonda de temperatura DS18B20 | 1-Wire sysfs, `w1thermsensor` | Sim | Sim |
| Módulo GPS na UART do header | `pyserial` em `/dev/serial0` | Sim | Sim |
| E-paper de 7,5" (UC8179) | `spidev` + `RPi.GPIO`, driver estilo Waveshare | Sim | Sim |
| Potenciômetro direto em um GPIO | | Não (veja abaixo) | Não |

As linhas de OLED e LCD também foram executadas em um Raspberry Pi Zero no motor
Linux, que é um guest de 32 bits com sua própria imagem.

## O que não funciona

- **Entrada analógica em um GPIO.** Um Raspberry Pi **não tem ADC**, também no
  hardware real. Um potenciômetro, LDR ou sensor de pulso conectado diretamente a um
  GPIO só lê alto ou baixo, e o console de execução diz isso. Coloque um
  **ADS1115** (I2C) ou um **MCP3008** (SPI) entre o sensor e o Pi,
  exatamente como você faria em uma bancada; ambos estão no catálogo, e a galeria
  tem um exemplo de MCP3008 com um potenciômetro.
- **`picamera2` no motor Linux.** Ele usa sua webcam no motor
  instantâneo, porque o script roda no seu navegador. No guest, as fotos
  vêm de `rpicam-jpeg` e seus semelhantes, sobre o padrão de teste
  ou sobre sua webcam depois que você permitir (acima).
- **Um driver de e-paper que envia sua imagem para o lugar errado.** Em um painel
  UC8179 (o de 7,5") o comando `0x10` é a imagem anterior e `0x13` é
  a que o vidro mostra. Um driver que escreve apenas `0x10` obtém uma atualização em branco
  aqui, exatamente como no painel real, e o monitor serial (o
  terminal Linux, naquele motor) diz por quê. O pino BUSY segue o controlador também: LOW enquanto um painel UltraChip
  trabalha, HIGH em um SSD168x.
- **`pigpio` e `/dev/gpiomem`.** O `pigpio` alcança os pinos mapeando os
  registradores de periférico, e nenhum dos motores fornece esse mapeamento. Use
  `RPi.GPIO`, `gpiozero` ou, no motor Linux, `libgpiod` (acima).
- **`libgpiod` / `gpiod` no motor instantâneo.** O dispositivo de caractere é uma
  coisa do motor Linux; no navegador não há `/dev/gpiochip0` para abrir.
- **Um script copiado de um tutorial MicroPython.** `import machine`,
  `from gpio_lcd import GpioLcd` e similares existem em um Pico ou ESP32, não
  em uma placa que roda o Python completo. O console nomeia o equivalente no Pi
  (`gpiozero`, `RPLCD`, `luma.oled`, `w1thermsensor`) em vez de propor um
  pacote para instalar.
- **PyTorch, TensorFlow.** Gigabytes, e nada aqui para acelerá-los.
  Eles são recusados com essa explicação.

## Módulos Python em cada motor

Ambos os motores trazem a biblioteca padrão. "Pré-instalado" significa que funciona a partir
da linha `import` sozinha, sem `requirements.txt`, do jeito que o Raspberry Pi OS
tem suas bibliotecas de hardware na imagem.

| Módulo | Instantâneo (navegador) | Linux (guest) |
| --- | --- | --- |
| `RPi.GPIO` | Pré-instalado | Pré-instalado |
| `gpiozero` | Pré-instalado | Pré-instalado (2.0.1) |
| `gpiod` (libgpiod 1) | Sem dispositivo de caractere no navegador | Pré-instalado, com as ferramentas `gpio*` |
| `smbus2` / `smbus` | Pré-instalado (a biblioteca real) | Pré-instalado (a biblioteca real) |
| `spidev` | Pré-instalado | Pré-instalado (um py-spidev compilado) |
| `serial` (pyserial) | Apenas os caminhos da UART do Pi | O pyserial 3.5 real em um tty real |
| `w1thermsensor` | Pré-instalado | Via `requirements.txt` (a árvore 1-Wire está lá) |
| `luma.core`, `luma.oled`, `luma.lcd` | Pré-instalado | Pré-instalado |
| `RPLCD` | Pré-instalado | Pré-instalado |
| `ST7789` | Pré-instalado | Pré-instalado |
| `board`, `busio`, `digitalio` (Adafruit Blinka) | Pré-instalado | Pré-instalado |
| `adafruit_ssd1306`, `adafruit_rgb_display` | Pré-instalado | Pré-instalado |
| `PIL` (Pillow), `numpy` | Pré-instalado | Pré-instalado (Pillow 10.3, numpy 1.25) |
| `cv2` (OpenCV) | Sim | Não (sem build para o guest) |
| `picamera2` | Sim, sobre sua webcam | Não (use `rpicam-jpeg` / `libcamera-jpeg`) |
| `velxio_screen` | Sim | Sim |
| `requests` / `urllib` | Sim, através do proxy de saída da Velxio com uma allowlist | Sem rede |
| Qualquer outra coisa | Via `requirements.txt` | Via `requirements.txt` |

As fontes DejaVu estão no guest no caminho que o Raspberry Pi OS usa
(`/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf`), porque tutoriais de
display o codificam diretamente.

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

Adicione um arquivo `requirements.txt` ao lado do seu script, um pacote por linha;
a Velxio o resolve antes da execução e informa, no console de execução, o que
instalou. Quando um script importa um pacote que está faltando, o console
oferece a linha para adicionar e um botão a escreve para você. Qual motor pode aceitar
um pacote depende de como ele é construído:

- Um pacote puramente Python (um wheel `py3-none-any`) roda em ambos os motores.
- Um pacote com código compilado roda no motor **instantâneo** quando o
  runtime do navegador o inclui (numpy, pillow, opencv-python, scikit-learn entre
  outros), e no motor **Linux** apenas se o PyPI tiver um wheel **musl aarch64**
  para ele (numpy, pandas, scipy e psutil têm). Pacotes que só
  publicam wheels glibc `manylinux` não podem ser instalados no guest.
- Em um Raspberry Pi Zero, 1 ou 2 o guest é de 32 bits, e o PyPI quase não tem
  wheels compilados para ele: lá, fique com o que está pré-instalado ou com
  pacotes puramente Python.
- Nomes que o guest já fornece (`RPi.GPIO`, `smbus2`, `spidev`,
  `pyserial`, `gpiozero`, `gpiod`) nunca são baixados, então um `requirements.txt` de tutorial
  que os liste não causa dano.

Os wheels contam para a mesma cota de armazenamento que as bibliotecas Arduino.

### Executando pip manualmente no guest Linux

Você nunca precisa. O que o `requirements.txt` declara é importável no
momento em que o guest inicializa, sem nenhuma etapa de instalação. O comando real
também funciona, para quem segue um tutorial que o detalha:

```bash
python3 -m venv --system-site-packages ~/.venv
~/.venv/bin/pip install -r requirements.txt
```

O guest não tem rede, então o `pip` resolve contra um wheelhouse local
que acompanha os pacotes do projeto; ele instala o que o projeto
declara, e não pode alcançar o PyPI para qualquer outra coisa.

Saiba o que isso custa antes de começar, e não leia o silêncio como um
travamento: na CPU emulada, criar um virtualenv **com** pip leva cerca de
quatro minutos (cerca de seis segundos sem ele), e a instalação em si cerca de
meio minuto. A espera não lhe dá nada que você já não tivesse, já que
os pacotes que você declarou já estão importados quando você recebe um
prompt. Ela está lá para as vezes em que você quer o fluxo de trabalho real.

O Python do sistema está marcado como gerenciado externamente (PEP 668), exatamente como no
Raspberry Pi OS Bookworm, então um `pip install` simples fora de um virtualenv
recusa com a mesma mensagem que dá na placa.

## Arquivos

Um **file panel** no workspace do Pi envia scripts e arquivos de dados para
o projeto; no modo Linux eles são copiados para o diretório home do guest
antes de `script.py` iniciar.

## O UNIHIKER M10

O SBC educacional da DFRobot (uma placa Linux com tela sensível ao toque integrada) roda
nos mesmos dois motores, com seus próprios módulos `pinpong` e `unihiker` no
lugar das bibliotecas do Pi. É uma placa paga com suas próprias três sessões de teste;
encontre-a no seletor ao lado da família Pi.

## Arte das placas e pinagens

A arte na tela e o mapa completo de pinos de cada placa, gerados a partir do simulador:

[Raspberry Pi 3 (arte também para Zero/1/2)](/docs/pt-br/boards/reference/raspberry-pi-3/) ·
[Raspberry Pi 4](/docs/pt-br/boards/reference/raspberry-pi-4/) ·
[Raspberry Pi 5](/docs/pt-br/boards/reference/raspberry-pi-5/) ·
[UNIHIKER M10](/docs/pt-br/boards/reference/unihiker-m10/)
