---
title: Osciloscópio
description: Observe a forma de onda de qualquer pino ao vivo — canais, base de tempo e disparo.
sidebar:
  order: 2
---

Ative o osciloscópio com o botão **Scope** na barra de ferramentas. Ele abre
como um painel inferior ao lado do monitor serial.

## Adicionando um canal

Clique em **+ Add Channel** e escolha o pino da placa para monitorar:

![Adicionando um canal de osciloscópio](../../../../assets/docs/instruments/oscilloscope-add-channel.png)

Cada canal recebe uma cor e um rótulo (placa + pino). Remova um com o
pequeno **x** sob seu rótulo.

## Lendo o traço

Aqui o osciloscópio observa o **GPIO2** — o pino do LED piscante do
[primeiro projeto](/docs/pt-br/getting-started/first-project/):

![Uma onda quadrada no osciloscópio](../../../../assets/docs/instruments/oscilloscope.png)

## Controles

| Controle          | O que faz                                                                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Time/div**      | Escala horizontal, de 0,1 ms a 500 ms por divisão. Ajuste-a ao seu sinal: uma piscada de 1 s é melhor lida em torno de 100 ms/div; um PWM de 1 kHz em torno de 0,5 ms/div. |
| **Trigger**       | **Auto** (execução livre), **Normal** (só desenha no disparo) ou **Single** (uma captura). Escolha o canal de disparo e a borda — subida, descida ou ambas. |
| **Pause / Resume**| Congele a exibição para inspecionar uma forma de onda.                                                                                                   |
| **Clear**         | Apague os traços.                                                                                                                                       |

## O que experimentar

- **Meça um ciclo de trabalho PWM**: execute um sketch `analogWrite()`, observe o
  pino em 0,5 ms/div, compare o tempo alto vs. baixo.
- **Capture um evento único**: defina o disparo para **Single**, borda de subida, e
  pressione um botão no seu circuito.
- **Compare dois sinais**: adicione dois canais — por exemplo, as saídas A e B
  de um encoder — e observe a relação de fase entre eles.
```
