---
title: velxio.toml
description: O arquivo de projeto que o Velxio CI lê - placa, firmware, circuito e cenário - com as placas que o CI executa hoje e como cada caminho é resolvido.
sidebar:
  order: 3
---

`velxio.toml` diz à CLI o que executar: qual placa, qual firmware
compilado, qual circuito e qual cenário. Ele fica no diretório para o qual
você aponta a CLI. Todo caminho nele é relativo ao próprio arquivo, e
barras normais funcionam em qualquer sistema operacional.

```toml
[velxio]
version = 1                      # required
board = "esp32-s3"               # Velxio board kind
firmware = "build/app.bin"       # .hex | .bin | .uf2 | merged ESP32 image
diagram = "diagram.json"         # Wokwi-format circuit (the default when present)
scenario = "test.yaml"           # default scenario; --scenario overrides it
```

`velxio-cli init --board arduino-uno` escreve um `velxio.toml` inicial e um
`diagram.json` com uma placa dentro.

## Chaves

| chave          | significado                                                                                                                                  |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `version`      | deve ser `1`.                                                                                                                                |
| `board`        | o tipo de placa Velxio (tabela abaixo). Opcional quando o diagrama ou o `.vlx` já nomeia a placa; quando ambos estão presentes, devem concordar. |
| `firmware`     | a imagem compilada: `.hex`, `.bin`, `.uf2`, ou uma imagem de flash ESP32 mesclada.                                                           |
| `flasher_args` | um `build/flasher_args.json` do ESP-IDF em vez de `firmware`. Os dois são mutuamente exclusivos.                                             |
| `elf`          | um ELF usado quando `firmware` está ausente. Convertido para placas AVR e RP2040.                                                            |
| `diagram`      | o circuito, no formato `diagram.json` do Wokwi.                                                                                              |
| `project`      | uma exportação de projeto `.vlx` do Velxio. Tem precedência sobre `diagram`.                                                                 |
| `scenario`     | o YAML de cenário a executar por padrão. Veja [Cenários](/docs/pt-br/ci/scenarios/).                                                               |
| `language`     | `arduino`. `micropython` é recusado com saída 2 - o CI executa apenas firmware compilado.                                                    |

Nada é ignorado em silêncio. Uma chave que a CLI não conhece é um aviso; um
recurso que ainda não foi implementado faz a execução falhar com
`feature_unsupported` em vez de executar silenciosamente um projeto
diferente do que você escreveu. `[[chip]]` (chips personalizados) é um
desses: é recusado hoje, com o arquivo de origem nomeado.

## Placas que o CI executa hoje

O servidor decide, não a CLI. Trinta e seis tipos rodam agora — toda placa
com um motor no navegador, cada uma comprovada inicializando firmware real.

### AVR

| tipo | placa | tipo em `diagram.json` | firmware |
| ---- | ----- | ------------------- | -------- |
| `arduino-uno` | Arduino Uno | `wokwi-arduino-uno` | Intel HEX |
| `arduino-nano` | Arduino Nano | `wokwi-arduino-nano` | Intel HEX |
| `arduino-mega` | Arduino Mega | `wokwi-arduino-mega` | Intel HEX |
| `attiny85` | ATtiny85 | `wokwi-attiny85` | Intel HEX |

### RP2040 e RP2350

| tipo | placa | tipo em `diagram.json` | firmware |
| ---- | ----- | ------------------- | -------- |
| `raspberry-pi-pico` | Raspberry Pi Pico | `wokwi-pi-pico`, `board-pi-pico`, `wokwi-raspberry-pi-pico` | imagem de flash |
| `pi-pico-w` | Raspberry Pi Pico W | `board-pi-pico-w` | imagem de flash |
| `xiao-rp2040` | XIAO RP2040 | `board-velxio-xiao-rp2040` | imagem de flash |
| `xiao-rp2350` | XIAO RP2350 | `board-velxio-xiao-rp2350` | imagem de flash |
| `pimoroni-pico-plus-2w` | Pimoroni Pico Plus 2 W | `board-velxio-pimoroni-pico-plus-2w` | imagem de flash |
| `badger-2350` | Pimoroni Badger 2350 | `board-velxio-badger-2350` | imagem de flash |
| `stellar-unicorn` | Pimoroni Stellar Unicorn | `board-velxio-stellar-unicorn` | imagem de flash |

### XIAO ARM

| tipo | placa | tipo em `diagram.json` | firmware |
| ---- | ----- | ------------------- | -------- |
| `xiao-nrf52840-sense` | XIAO nRF52840 Sense | `board-velxio-xiao-nrf52840-sense` | Intel HEX |
| `xiao-samd21` | XIAO SAMD21 | `board-velxio-xiao-samd21` | Intel HEX |
| `xiao-ra4m1` | XIAO RA4M1 | `board-velxio-xiao-ra4m1` | Intel HEX |
| `xiao-mg24-sense` | XIAO MG24 Sense | `board-velxio-xiao-mg24-sense` | Intel HEX |
| `xiao-nrf54l15-sense` | XIAO nRF54L15 Sense | `board-velxio-xiao-nrf54l15-sense` | Intel HEX |

### ESP32

| tipo | placa | tipo em `diagram.json` | firmware |
| ---- | ----- | ------------------- | -------- |
| `esp32` | ESP32 DevKit v1 | `wokwi-esp32-devkit-v1`, `board-esp32-devkit-v1` | imagem ESP32 mesclada |
| `esp32-s3` | ESP32-S3 DevKitC-1 | `board-esp32-s3-devkitc-1` | imagem ESP32 mesclada |
| `esp32-c3` | ESP32-C3 DevKitM-1 | `board-esp32-c3-devkitm-1` | imagem ESP32 mesclada |
| `esp32-c6` | ESP32-C6 DevKitC-1 | `board-esp32-c6-devkitc-1` | imagem ESP32 mesclada |
| `esp32-devkit-c-v4` | ESP32 DevKitC v4 | `board-esp32-devkit-c-v4` | imagem ESP32 mesclada |
| `esp32-cam` | ESP32-CAM | `board-esp32-cam` | imagem ESP32 mesclada |
| `wemos-lolin32-lite` | WEMOS LOLIN32 Lite | `board-wemos-lolin32-lite` | imagem ESP32 mesclada |
| `xiao-esp32-s3` | XIAO ESP32-S3 | `board-xiao-esp32-s3` | imagem ESP32 mesclada |
| `arduino-nano-esp32` | Arduino Nano ESP32 | `board-arduino-nano-esp32` | imagem ESP32 mesclada |
| `xiao-esp32-c3` | XIAO ESP32-C3 | `board-xiao-esp32-c3` | imagem ESP32 mesclada |
| `aitewinrobot-esp32c3-supermini` | ESP32-C3 SuperMini | `board-aitewinrobot-esp32c3-supermini` | imagem ESP32 mesclada |
| `xiao-esp32c6` | XIAO ESP32-C6 | `board-xiao-esp32-c6` | imagem ESP32 mesclada |
| `esp32-p4` | ESP32-P4 Function EV | `board-esp32-p4-function-ev` | imagem ESP32 mesclada |
| `m5stack-core` | M5Stack Core | `board-velxio-m5stack-core` | imagem ESP32 mesclada |
| `esp32-c3-lcdkit` | ESP32-C3-LCDkit | `board-velxio-esp32-c3-lcdkit` | imagem ESP32 mesclada |
| `cardputer-adv` | M5Stack Cardputer ADV | `board-velxio-cardputer-adv` | imagem ESP32 mesclada |
| `xiao-esp32s3-sense` | XIAO ESP32-S3 Sense | `board-velxio-xiao-esp32s3-sense` | imagem ESP32 mesclada |
| `esp-vocat` | ESP-VoCat | `board-velxio-esp-vocat` | imagem ESP32 mesclada |
| `esp32-s3-eye` | ESP32-S3-EYE | `board-velxio-esp32-s3-eye` | imagem ESP32 mesclada |
| `esp-sensairshuttle` | ESP-SensAirShuttle | `board-velxio-esp-sensairshuttle` | imagem ESP32 mesclada |

Qualquer uma delas também pode ser escrita como `board-velxio-<kind>` no
diagrama, por exemplo `board-velxio-esp32-c6`; as placas sem um tipo Wokwi
próprio não têm outra grafia.

`velxio-cli boards` imprime a lista ao vivo com o status de cada placa, seus
tipos em `diagram.json` e os formatos de firmware que ela aceita.

:::caution
O que resta roda no editor mas ainda não no CI: as placas STM32 (elas
precisam da via QEMU), as placas Raspberry Pi e UNIHIKER, o devkit de
pré-visualização ESP32-P4, e a família DFRobot, que ainda está atrás de sua
flag de lançamento. Cada uma é recusada antes do início da execução, com
`board_not_supported_in_ci` e a fase em que está planejada. Nada é cobrado,
e nenhuma placa próxima é substituída em silêncio.
:::

O Pico W roda, mas o CI não tem rede: WiFi e sockets nunca conectam, e a
execução carrega um aviso `no_network`.

## Como os caminhos são resolvidos

- **Arquivo de configuração:** `velxio.toml`, depois `wokwi.toml`, depois
  exatamente um `*.vlx` no diretório. Nenhum deles é saída 2.
- **Circuito:** `--project-file`, depois `[velxio] project`, depois
  `--diagram-file`, depois `[velxio] diagram`, depois `diagram.json` ao lado
  do arquivo de configuração.
- **Firmware:** `--firmware`, depois `--elf`, depois `[velxio] firmware` ou
  `flasher_args`, depois `[velxio] elf`, depois `[wokwi] firmware`, depois
  `[wokwi] elf`.
- **Placa:** `[velxio] board`, depois a parte da placa do diagrama (ou a
  placa ativa do `.vlx`).

Caminhos relativos fornecidos na linha de comando são resolvidos em relação
ao diretório do projeto, não em relação ao diretório de trabalho do seu
shell.

## diagram.json

O formato do Wokwi, lido como está: `version: 1`, `parts` de
`{id, type, left, top, attrs, rotate, hide}` e `connections` de
`[from, to, color, path]`. Os ids das partes no diagrama são os ids que seus
passos de cenário usam.

```json
{
  "version": 1,
  "parts": [
    {
      "type": "wokwi-arduino-uno",
      "id": "uno",
      "top": 0,
      "left": 0,
      "attrs": {}
    },
    {
      "type": "wokwi-resistor",
      "id": "r1",
      "top": -40,
      "left": 300,
      "attrs": { "value": "220" }
    },
    {
      "type": "wokwi-led",
      "id": "led1",
      "top": -100,
      "left": 420,
      "attrs": { "color": "red" }
    }
  ],
  "connections": [
    ["uno:13", "r1:1", "green", ["v0"]],
    ["r1:2", "led1:A", "green", ["v0"]],
    ["led1:C", "uno:GND.1", "black", ["v0"]]
  ]
}
```

As partes são os elementos `wokwi-*` (`wokwi-led`, `wokwi-pushbutton`,
`wokwi-dht22`, e assim por diante). Um tipo de parte que a CLI não reconhece
é um aviso, não um erro: o servidor decide, e as partes que ele não consegue
simular são reportadas por id em vez de descartadas em silêncio.

## .vlx

Um projeto exportado do editor Velxio (`format: "velxio-project"`,
`version: 1`) pode ser o circuito em vez de um diagrama. Coloque o único
`.vlx` no diretório, ou nomeie-o com `project =` ou `--project-file`.
A placa primária da exportação é a placa da execução; o firmware ainda
vem do toml ou de `--firmware`.

## Limites

| o quê                      | limite                                                                                             |
| -------------------------- | -------------------------------------------------------------------------------------------------- |
| firmware por placa         | 16 MiB                                                                                             |
| todos os arquivos enviados por execução | 20 MiB                                                                                 |
| circuito                   | 300 partes, 2.000 fios                                                                             |
| cenário                    | 200 passos, 20 capturas de tela, 512 bytes por texto de `wait-serial`                              |
| `--timeout`                | o teto do seu plano (5 min no Maker, 10 min no Pro), e nunca mais que os minutos que você tem restantes |

Um `--timeout` acima do teto não é um erro: ele é limitado, e a execução
reporta um aviso `timeout_clamped` com o orçamento que ela realmente recebeu.

## Verifique antes de gastar minutos

```bash
velxio-cli lint .
```

`lint` não precisa de token nem de rede. Ele analisa o toml, resolve cada
caminho, verifica se os arquivos existem e cabem nos limites, verifica se os
ids das partes são únicos e se as conexões nomeiam partes existentes,
verifica se a placa é uma que o CI executa, verifica se o formato do firmware
corresponde à família da placa, e verifica se cada passo do cenário é
conhecido, tem seus campos, nomeia partes existentes e analisa suas durações.
A maioria das falhas de `exit 2` é mais barata de encontrar aqui.
