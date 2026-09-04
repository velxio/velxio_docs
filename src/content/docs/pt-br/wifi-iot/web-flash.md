---
title: Grave firmware real em hardware pelo navegador
description: Escreva seu projeto compilado em uma placa física via USB, direto do navegador, sem precisar instalar toolchain.
sidebar:
  order: 4
---

Quando seu projeto funciona no simulador, você pode colocá-lo em uma
**placa real** sem instalar nada: o Velxio grava o firmware compilado
via USB, direto do navegador.

## Requisitos

- Um navegador baseado em Chromium (Chrome ou Edge). O gravador usa
  as APIs Web Serial e WebUSB do navegador, que Firefox e Safari não
  possuem. Placas da família Pico ainda têm um botão **Download .uf2**
  nesses navegadores (veja abaixo).
- Um cabo USB com capacidade de dados para sua placa.
- Feche qualquer outra coisa que esteja usando a porta primeiro
  (monitores seriais, IDEs, picotool): o navegador precisa de acesso
  exclusivo.

![A caixa de diálogo de gravação selecionando uma porta USB serial](../../../../assets/docs/wifi-iot/flash-modal.png)

## Gravando

1. Clique com o botão direito na placa no canvas e escolha **Flash to real board** (Gravar na placa real).
2. Clique em **Connect & flash** (Conectar e gravar). O navegador pergunta qual dispositivo USB você quer conceder acesso; escolha sua placa.
3. O Velxio usa a compilação que já fez para aquela placa (o mesmo binário
   que o simulador estava executando). Se o código mudou desde então, ele
   recompila primeiro e a saída do compilador é transmitida para a caixa
   de diálogo.
4. Observe a barra de progresso; quando terminar, a placa reinicia no seu
   projeto.

A caixa de diálogo escolhe o protocolo para o alvo:

| Família | Como é gravado | A placa deve estar |
| --- | --- | --- |
| ESP32, S3, C3, C6 | esptool pela porta serial, o `.bin` mesclado | conectada; segure BOOT se ela não responder |
| Arduino Uno, Nano, Mega, ATtiny85 | STK500 contra o bootloader da placa, o `.hex` | conectada (ATtiny85: através de um Arduino executando ArduinoISP) |
| Raspberry Pi Pico, Pico W, Pico 2, placas Pimoroni RP2040 / RP2350 | PICOBOOT via WebUSB, o `.uf2` que o picotool construiu | em modo **BOOTSEL** (próxima seção) |

## Placas da família Pico: BOOTSEL primeiro

Um RP2040 ou RP2350 é programado pelo seu bootloader, uma personalidade
USB separada que o chip só mostra no modo **BOOTSEL**. Duas maneiras de
chegar lá:

- **Manual**: segure o botão BOOTSEL enquanto conecta a placa e depois
  solte. A placa é montada como uma unidade USB chamada `RPI-RP2`
  (RP2040) ou `RP2350`.
- **Pela caixa de diálogo**: a caixa de diálogo de gravação para essas
  placas tem um botão **Reboot into bootloader over USB** (Reiniciar no bootloader via USB). Ele funciona quando a placa está executando um
  sketch que o Velxio construiu (o núcleo Arduino reinicia ao abrir a
  porta a 1200 baud) ou MicroPython (o REPL executa
  `machine.bootloader()`). O navegador pede a porta serial da placa, a
  placa se desconecta e volta como bootloader. Então clique em
  **Connect & flash** e escolha o dispositivo `RP2 Boot` / `RP2350 Boot`.

Dois cliques, duas solicitações de permissão: a porta serial para o
reinício e o dispositivo USB para a gravação. Uma vez que a placa está
em BOOTSEL, gravações posteriores precisam apenas da segunda.

A caixa de diálogo recusa uma imagem que não corresponde ao chip que
respondeu (uma compilação RP2350 em um RP2040, uma compilação RISC-V em
uma configuração ARM) antes que qualquer coisa seja apagada, verifica
cada byte após a gravação e reinicia a placa no programa.

### Windows e um RP2040: instale o WinUSB uma vez

O bootloader RP2040 não vem com descritor de driver para Windows, então
o navegador não pode usá-lo até que o WinUSB esteja vinculado a ele.
Configuração única:

1. Coloque a placa em BOOTSEL e conecte-a.
2. Baixe e execute o [Zadig](https://zadig.akeo.ie).
3. Escolha `RP2 Boot (Interface 1)` na lista (Options, List All
   Devices se estiver oculto), selecione **WinUSB** como driver e clique
   em **Install Driver**.

Placas RP2350 (Pico 2, Pico 2 W, os Unicorns Pimoroni "Pico 2 W Aboard",
Badger 2350) não precisam de nada: o bootloader delas carrega o
descritor e o Windows vincula o WinUSB sozinho. macOS não precisa de
nada em nenhum dos chips.

### Linux: uma regra udev

O Linux dá dispositivos USB ao root por padrão. Crie
`/etc/udev/rules.d/99-velxio-rp2.rules` com:

```
SUBSYSTEM=="usb", ATTRS{idVendor}=="2e8a", MODE="0666", TAG+="uaccess"
```

depois `sudo udevadm control --reload-rules && sudo udevadm trigger` e
reconecte a placa. A porta serial usada para a etapa de reinício também
precisa da associação usual ao grupo `dialout`.

### Qualquer navegador: baixe o .uf2

A caixa de diálogo de gravação para uma placa da família Pico sempre
oferece **Download .uf2** (no Firefox e Safari, onde o navegador não
pode gravar, isso é toda a caixa de diálogo). Salve o arquivo, coloque a
placa em BOOTSEL e arraste o arquivo para a unidade `RPI-RP2` /
`RP2350`: a placa reinicia no seu sketch no momento em que a cópia
termina.

### Projetos MicroPython em um Pico

A caixa de diálogo envia os arquivos `.py` do projeto pelo REPL e
reinicia no `main.py`. O MicroPython em si já precisa estar na placa:
é um `.uf2` que você arrasta para a unidade BOOTSEL uma vez (placas
Pimoroni vêm com ele; downloads em
[pimoroni-pico-rp2350](https://github.com/pimoroni/pimoroni-pico-rp2350/releases)
e [micropython.org](https://micropython.org/download/)).

## Solução de problemas

- **"No board in BOOTSEL mode was found"** (Nenhuma placa em modo BOOTSEL foi encontrada): o seletor de dispositivos estava vazio.
  Use o botão de reinício ou segure BOOTSEL ao conectar e conecte
  novamente.
- **"The board in BOOTSEL is an RP2040 but this project is built for
  RP2350"** (A placa em BOOTSEL é um RP2040, mas este projeto é compilado para RP2350): a Pimoroni vendeu o Stellar e o Galactic Unicorn com um Pico W
  (RP2040) até janeiro de 2025 e com um Pico 2 W (RP2350) desde então.
  Verifique o rótulo na sua unidade e escolha a placa correspondente no
  editor.
- **"Could not claim the USB device"** (Não foi possível obter o dispositivo USB) no Windows com um RP2040: o
  passo do Zadig acima. No Linux: a regra udev acima.
- **O reinício serial não fez nada**: um sketch compilado com a pilha
  USB desabilitada não pode ser reiniciado via USB. Segure BOOTSEL ao
  conectar.

## Simule primeiro, grave depois

Isso fecha o ciclo que torna o Velxio útil para trabalho real: itere
rapidamente no simulador (sem cabo, sem desgaste no hardware, reinícios
instantâneos) e depois grave exatamente o mesmo artefato de compilação
quando ele se comportar corretamente.

----- END PAGE -----
