---
title: Languages — Arduino, MicroPython, ESP-IDF
description: Qual linguagem roda em qual placa e como alternar.
sidebar:
  order: 2
---

O **seletor de linguagem** na barra de ferramentas alterna como o código
da placa ativa é escrito e compilado. Alternar a linguagem troca o conjunto
de arquivos do espaço de trabalho (um `sketch.ino` vira um `main.py`, e assim por diante).

## Arduino C++

O padrão em quase todos os lugares: sketches clássicos `setup()` / `loop()`,
compilados com o toolchain real do Arduino para o alvo. Use o botão
**Libraries** para adicionar qualquer biblioteca Arduino publicada — veja
[Libraries](/docs/pt-br/programming/libraries/).

Disponível em todas as placas, exceto na família Linux Raspberry Pi.

## MicroPython

Firmware MicroPython real rodando no chip emulado — o REPL funciona
no monitor serial, `import machine` e afins se comportam como no
hardware.

Disponível em:

- **Raspberry Pi Pico / Pico W** (RP2040)
- **ESP32 classic** — DevKit V1, DevKit-C v4, ESP32-CAM, Lolin32 Lite
- **ESP32-S3** — DevKit, XIAO ESP32-S3, Arduino Nano ESP32
- **ESP32-C3** — DevKit, XIAO ESP32-C3, C3 SuperMini

## ESP-IDF

Projetos ESP-IDF puros (um ponto de entrada `app_main()`, APIs IDF, sem núcleo
Arduino), compilados com o mesmo toolchain ESP-IDF. Para quando você está
escrevendo o que gravaria em produção.

Disponível nas mesmas placas da família ESP32 que o MicroPython acima.

## Python no Linux (Raspberry Pi)

As placas Linux Raspberry Pi (Zero até 5) não usam o
seletor de linguagem: elas inicializam um Linux completo e você trabalha em um shell real — execute Python
com `gpiozero`/`RPi.GPIO` contra o GPIO simulado, exatamente como no
Pi físico. Veja as [páginas de placas](/docs/pt-br/boards/overview/).
----- END PAGE -----
