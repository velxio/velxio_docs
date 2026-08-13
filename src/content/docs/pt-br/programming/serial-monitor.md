---
title: Monitor serial
description: Veja a saída serial do seu programa e envie dados de volta para ele.
sidebar:
  order: 4
---

Alterne o monitor serial com o botão **Serial** na barra de ferramentas. Ele
abre como um painel inferior, com **uma aba por placa** no projeto:

![O monitor serial durante uma execução](../../../../assets/docs/programming/serial-monitor.png)

Tudo o que seu firmware imprime (`Serial.println`, o `print` do MicroPython,
o log do boot ROM) aparece aqui em tempo real — incluindo as mensagens de boot
do próprio chip, porque o emulador inicializa o firmware real.

## Controles

- **Baud rate** — corresponde ao seu `Serial.begin(...)`; 115200 é o usual.
- **Autoscroll** — segue a saída mais recente; desmarque para rolar para trás.
- **Clear** — esvazia o buffer.
- **Hardware serial** — indica que a aba está conectada à UART da placa.

## Enviando entrada

Digite na **caixa de mensagem** na parte inferior e pressione **Send**. O
seletor de final de linha (Newline / Carriage return / ambos / nenhum) é
importante para sketches que analisam `Serial.read()` — da mesma forma que
no monitor do IDE do Arduino.

Em placas MicroPython, o monitor serial também funciona como **REPL**: pare
seu script com interrupções estilo Ctrl+C e digite Python interativamente.
