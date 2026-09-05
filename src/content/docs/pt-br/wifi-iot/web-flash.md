---
title: Grave hardware real a partir do navegador
description: Escreva seu projeto compilado em uma placa física via USB, direto do navegador, sem precisar instalar nenhuma ferramenta.
sidebar:
  order: 4
---

Quando seu projeto funciona no simulador, você pode colocá-lo em uma
**placa real** sem instalar nada: o Velxio grava o firmware compilado
via USB, direto do navegador.

## Requisitos

- Um navegador baseado em Chromium (Chrome ou Edge). O gravador usa
  as APIs Web Serial e WebUSB do navegador, que o Firefox e o Safari não
  possuem. Placas da família Pico ainda recebem um botão **Download .uf2** lá
  (veja abaixo).
- Um cabo USB com capacidade de dados para sua placa.
- Feche qualquer outra coisa que esteja usando a porta primeiro (monitores seriais, IDEs,
  picotool): o navegador precisa de acesso exclusivo.

![A caixa de diálogo de gravação selecionando uma porta serial USB](../../../../assets/docs/wifi-iot/flash-modal.png)

## Gravando

1. Clique com o botão direito na placa na tela e escolha **Flash to real board** (Gravar na placa real).
2. Clique em **Connect & flash** (Conectar e gravar). O navegador pergunta qual dispositivo USB você deseja conceder;
   escolha sua placa.
3. O Velxio usa a compilação que já fez para aquela placa (o mesmo binário
   que o simulador estava executando). Se o código mudou desde então, ele recompila
   primeiro e a saída do compilador é transmitida para a caixa de diálogo.
4. Observe a barra de progresso; quando terminar, a placa reinicia no seu
   projeto.

A caixa de diálogo escolhe o protocolo para o alvo:

| Família | Como é gravado | A placa deve estar |
| --- | --- | --- |
| ESP32, S3, C3, C6 | esptool pela porta serial, o `.bin` mesclado | conectada; segure BOOT se ela não responder |
| Arduino Uno, Nano, Mega, ATtiny85 | STK500 contra o bootloader da placa, o `.hex` | conectada (ATtiny85: através de um Arduino executando ArduinoISP) |
| Raspberry Pi Pico, Pico W, Pico 2, placas Pimoroni RP2040 / RP2350 | PICOBOOT via WebUSB, o `.uf2` que o picotool construiu | no modo **BOOTSEL** (próxima seção) |

## Placas da família Pico: BOOTSEL primeiro

Um RP2040 ou RP2350 é programado pelo seu bootloader, uma personalidade USB
separada que o chip só mostra no modo **BOOTSEL**. Duas maneiras de chegar
lá:

- **Manual**: segure o botão BOOTSEL enquanto conecta a placa e depois
  solte-o. A placa é montada como uma unidade USB chamada `RPI-RP2` (RP2040) ou
  `RP2350`.
- **Pela caixa de diálogo**: a caixa de diálogo de gravação para essas placas tem um
  botão **Reboot into bootloader over USB** (Reiniciar no bootloader via USB). Ele funciona quando a placa está
  executando um sketch que o Velxio construiu (o núcleo Arduino reinicia em uma
  abertura de 1200 baud) ou MicroPython (o REPL executa `machine.bootloader()`). O
  navegador pede a porta serial da placa, a placa se desconecta e volta
  como o bootloader. Então clique em **Connect & flash** (Conectar e gravar) e escolha o
  dispositivo `RP2 Boot` / `RP2350 Boot`.

Dois cliques, dois prompts de permissão: a porta serial para a reinicialização e
o dispositivo USB para a gravação. Uma vez que a placa está em BOOTSEL, gravações posteriores
precisam apenas do segundo.

### Duas revisões da mesma placa

A Pimoroni vendeu o Stellar e o Galactic Unicorn com um Pico W (RP2040)
até janeiro de 2025 e com um Pico 2 W (RP2350) desde então. O simulador
executa o atual; a caixa de diálogo de gravação tem um seletor
**Real board revision** (Revisão da placa real) para essas placas. Escolha "Pico W aboard" para a unidade mais antiga: a
caixa de diálogo cria uma segunda imagem para aquele chip, grava ou baixa, e
o simulador continua executando sua própria compilação. A escolha é lembrada por
placa. O rótulo na parte de trás da placa (ou o nome da unidade em BOOTSEL,
`RPI-RP2` versus `RP2350`) informa qual você tem.

A caixa de diálogo recusa uma imagem que não corresponde ao chip que respondeu
(uma compilação RP2350 em um RP2040, uma compilação RISC-V em uma configuração ARM)
antes que qualquer coisa seja apagada, verifica cada byte após a gravação e
reinicia a placa no programa.

### Windows e um RP2040: instale o WinUSB uma vez

O bootloader RP2040 não vem com um descritor de driver Windows, então o navegador
não pode reivindicá-lo até que o WinUSB esteja vinculado a ele. Configuração única:

1. Coloque a placa em BOOTSEL e conecte-a.
2. Baixe e execute o [Zadig](https://zadig.akeo.ie).
3. Escolha `RP2 Boot (Interface 1)` na lista (Options, List All
   Devices se estiver oculto), selecione **WinUSB** como o driver e clique em
   **Install Driver** (Instalar driver).

Placas RP2350 (Pico 2, Pico 2 W, os Unicorns Pimoroni "Pico 2 W Aboard",
Badger 2350) não precisam de nada: seu bootloader carrega o
descritor e o Windows vincula o WinUSB sozinho. O macOS não precisa de nada em
nenhum dos chips.

### Linux: uma regra udev

O Linux dá dispositivos USB ao root por padrão. Crie
`/etc/udev/rules.d/99-velxio-rp2.rules` com:

```
SUBSYSTEM=="usb", ATTRS{idVendor}=="2e8a", MODE="0666", TAG+="uaccess"
```

depois `sudo udevadm control --reload-rules && sudo udevadm trigger` e
reconecte a placa. A porta serial usada para a etapa de reinicialização também precisa
da associação usual ao grupo `dialout`.

### Qualquer navegador: baixe o .uf2 ou copie-o para a unidade

A caixa de diálogo de gravação para uma placa da família Pico sempre oferece **Download .uf2**
(no Firefox e Safari, onde o navegador não pode gravar, essa é toda a
caixa de diálogo). Salve o arquivo, coloque a placa em BOOTSEL e arraste o arquivo para a
unidade `RPI-RP2` / `RP2350`: a placa reinicia no seu sketch no momento
em que a cópia termina.

No Chrome e Edge há também **Copy to the board's drive** (Copiar para a unidade da placa): o
navegador pede que você escolha a unidade e grava o arquivo lá sozinho. Nenhum
driver está envolvido, então é a maneira de programar um RP2040 no Windows
sem instalar o WinUSB. A caixa de diálogo verifica se a pasta que você escolheu
é uma unidade BOOTSEL (ela contém `INFO_UF2.TXT`) antes de gravar qualquer coisa.

### Projetos MicroPython em um Pico

A caixa de diálogo envia os arquivos `.py` do projeto pelo REPL e reinicia
em `main.py`. O MicroPython em si precisa estar na placa primeiro:

- **Pico e Pico W**: a caixa de diálogo o instala. Se nenhum REPL responder, ela
  pede que você coloque a placa em BOOTSEL e clique em Retry (Tentar novamente); esse clique grava
  a mesma compilação MicroPython que o simulador executa, e mais um Retry (Tentar novamente)
  envia seus arquivos.
- **Placas Pimoroni RP2350** (Badger 2350, Pico Plus 2W): elas vêm com
  o MicroPython próprio da Pimoroni. Se o seu o perdeu, baixe o `.uf2` de
  [pimoroni-pico-rp2350](https://github.com/pimoroni/pimoroni-pico-rp2350/releases)
  e arraste-o para a unidade BOOTSEL uma vez, depois grave pela caixa de diálogo.

## Solução de problemas

- **"No board in BOOTSEL mode was found"** (Nenhuma placa no modo BOOTSEL foi encontrada): o seletor de dispositivos estava vazio.
  Use o botão de reinicialização ou segure BOOTSEL ao conectar e conecte
  novamente.
- **"The board in BOOTSEL is an RP2040 but this project is built for
  RP2350"** (A placa em BOOTSEL é um RP2040, mas este projeto é compilado para RP2350): um Unicorn mais antigo com um Pico W a bordo. Escolha "Pico W aboard"
  no seletor **Real board revision** (Revisão da placa real) da caixa de diálogo e grave novamente.
- **"Could not claim the USB device"** (Não foi possível reivindicar o dispositivo USB) no Windows com um RP2040: o
  passo do Zadig acima. No Linux: a regra udev acima.
- **A reinicialização serial não fez nada**: um sketch compilado com a pilha USB
  desabilitada não pode ser reiniciado via USB. Segure BOOTSEL ao conectar.

## Simule primeiro, grave depois

Isso fecha o ciclo que torna o Velxio útil para o trabalho real: itere
rapidamente no simulador (sem cabo, sem desgaste no hardware, reinicializações
instantâneas) e depois grave exatamente o mesmo artefato de compilação quando ele se comportar bem.
```
