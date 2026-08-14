---
title: "Tutorial: estação meteorológica"
description: Um projeto real com múltiplos sensores — BMP280 via I2C, DHT22 no GPIO e um TFT ILI9341 via SPI, ao vivo em um ESP32.
draft: true
sidebar:
  order: 3
---

O [primeiro projeto](/docs/pt-br/getting-started/first-project/) piscou um LED.
Este é um dispositivo real: um ESP32 lendo **temperatura e pressão via
I²C** (BMP280), **umidade em um GPIO** (DHT22) e desenhando tudo em um
**display TFT via SPI** (ILI9341) — três barramentos funcionando ao mesmo tempo, no
navegador.

![A estação meteorológica em execução: sensores alimentando o TFT ao vivo](../../../../assets/docs/getting-started/weather-station.gif)

## 1. Abra o projeto

Abra o projeto público:
[velxio.dev/dave/estacin-meteorolgica-esp32](https://velxio.dev/dave/estacin-meteorolgica-esp32).

![A estação meteorológica ao abrir](../../../../assets/docs/getting-started/weather-loaded.png)

Reserve um momento para ler o circuito antes de executá-lo:

- **BMP280** — `SDA`/`SCL` nos pinos I²C do ESP32. Dois fios, duas
  medições (temperatura + pressão).
- **DHT22** — um único GPIO de dados com seu pull-up. Umidade e uma segunda
  leitura de temperatura.
- **ILI9341** — o conjunto SPI: `MOSI`, `SCK`, `CS`, `DC`, `RST`. Clique com o botão direito
  em qualquer peça para ver [seu pinout e datasheet](/docs/pt-br/circuit-editor/part-inspector/).

Este projeto foi projetado, conectado e programado de ponta a ponta pelo
[agente de IA da Velxio](/docs/pt-br/ai/agent-mode/) — você pode construir o mesmo
pedindo por ele.

## 2. Execute

Pressione **Run** (Executar). O sketch compila com o toolchain real do Arduino (observe
o console **Output** (Saída) resolver as bibliotecas Adafruit), o ESP32 inicializa,
e:

![Estação meteorológica em execução com TFT ao vivo](../../../../assets/docs/getting-started/weather-running.png)

- O **TFT** desenha o painel e atualiza com leituras ao vivo.
- O **serial monitor** (monitor serial) registra cada varredura do sensor:

![Saída serial da estação meteorológica](../../../../assets/docs/getting-started/weather-serial.png)

## 3. Mude o clima

Clique no **BMP280** ou no **DHT22** enquanto a simulação está em execução — seus
painéis de controle de sensor permitem arrastar temperatura, umidade e pressão.
O firmware lê os novos valores na próxima consulta I²C/GPIO e o TFT
acompanha. Esse ciclo — ajustar a entrada, observar o dispositivo reagir — é o
ponto principal de simular primeiro.

## 4. Torne-o seu

Trate-o como qualquer projeto: altere o layout do display no sketch, adicione um
limite que acenda um LED quando a umidade ultrapassar 70%, ou troque o DHT22
por outro sensor do [catálogo](/docs/pt-br/parts/overview/). Depois,
[salve sua cópia](/docs/pt-br/getting-started/projects/).

## Construa do zero em vez disso

Se preferir conectar você mesmo: comece com um [template](/docs/pt-br/getting-started/projects/) ESP32
em branco, adicione as três peças do
[seletor](/docs/pt-br/circuit-editor/placing-components/), conecte os barramentos como
acima, e adicione as bibliotecas **Adafruit BMP280**, **DHT sensor library** e
**Adafruit ILI9341** ([como](/docs/pt-br/programming/libraries/)).
Ou abra o [assistente de IA](/docs/pt-br/ai/agent-mode/) e peça para ele construir a
estação com você — foi assim que esta nasceu.

```

```
