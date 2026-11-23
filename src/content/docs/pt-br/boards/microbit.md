---
title: "BBC micro:bit"
description: "A BBC micro:bit V2 e sete placas DFRobot para ela, executando o firmware oficial MicroPython no seu navegador."
sidebar:
  order: 5.5
---

A **BBC micro:bit V2** roda no Velxio com seu próprio firmware oficial
MicroPython (2.1.1), sem modificações, em um motor no navegador para o seu chip
nRF52833. Escreva MicroPython, pressione Run (Executar) e o programa roda na
aba do seu navegador, em todos os planos, inclusive o gratuito.

![A BBC micro:bit V2 na tela do Velxio](../../../../assets/docs/boards/microbit-v2.png)

## O que roda

- A matriz de LEDs 5x5, os botões A e B e o logotipo de toque, em um desenho
  que você pode clicar.
- O sensor de movimento (incline a base sob a placa), e a direção da bússola,
  a temperatura, o nível de luz e o nível de som, definidos no painel de
  sensores da placa.
- O alto-falante, depois que você ligar o som nesse painel, e o conector de
  borda: conecte LEDs, potenciômetros, servos ou sensores Grove aos seus anéis
  e tiras como na placa real.
- Um REPL no Serial Monitor, e **Upload firmware** para um `.hex` de
  MicroPython salvo pelo python.microbit.org, cujos arquivos abrem no editor.

**Somente MicroPython** por enquanto: sem Arduino/C++ e sem blocos MakeCode (um
`.hex` do MakeCode ainda não é suportado). Rádio entre duas micro:bits e
Bluetooth não são modelados.

## Comece aqui

- [Hello, World! na matriz de LEDs](https://velxio.dev/example/microbit-v2-hello)
- [Botões A e B](https://velxio.dev/example/microbit-v2-buttons)
- [Nível de bolha](https://velxio.dev/example/microbit-v2-spirit-level), no
  acelerômetro
- [Termômetro](https://velxio.dev/example/microbit-v2-thermometer), na
  temperatura do próprio chip

## Placas DFRobot para a micro:bit

Sete placas DFRobot estão no Velxio, cada uma é sua própria placa na tela:
coloque-a e a micro:bit vem encaixada em seu soquete, com a matriz e
os botões ainda ao alcance. Uma placa com chips abre com um driver MicroPython
ao lado de `main.py` (`maqueen.py`, `maqueen_v5.py`, `microdriver.py`,
`microiobox.py`) que grava os mesmos bytes que os blocos MakeCode da própria
DFRobot.

![A micro:bit V2 encaixada em uma DFRobot Maqueen Lite na tela do Velxio](../../../../assets/docs/boards/microbit-v2-maqueen-lite.png)

### Maqueen Lite

O pequeno robô de duas rodas da DFRobot (ROB0148-EN): dois motores atrás de um
driver em I2C, dois faróis, dois sensores de linha, quatro LEDs RGB e um
soquete ultrassônico. Em um Mundo 3D a própria Maqueen é o robô.
[Seguidor de linha](https://velxio.dev/example/microbit-v2-maqueen-lite-line) ·
[Dirigir e piscar os faróis](https://velxio.dev/example/microbit-v2-maqueen-lite-drive) ·
[Loja DFRobot](https://www.dfrobot.com/product-1783.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-maqueen-lite)

### Maqueen Lite V5

A Maqueen Lite atual (MBT0046): faróis RGB, três sensores de linha, dois
sensores de luz e um nível de bateria atrás de seu próprio controlador em I2C.
[Faróis coloridos e sensores de luz](https://velxio.dev/example/microbit-v2-maqueen-lite-v5-lights) ·
[Loja DFRobot](https://www.dfrobot.com/product-2937.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-maqueen-lite-v5)

### micro:Driver

Quatro saídas de motor DC e oito conectores de servo a partir de um único chip
PCA9685 em I2C (DFR0548), além de nove pinos da micro:bit em conectores de 3
pinos.
[Dois servos e um motor DC](https://velxio.dev/example/microbit-v2-micro-driver-servos) ·
[Loja DFRobot](https://www.dfrobot.com/product-1738.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-micro-driver)

### micro:IO-BOX

Um controlador de robô compacto (MBT0005): um driver de motor de duas vias em
I2C, nove conectores IO, portas I2C e UART e um buzzer em P0.
[Dois motores para frente e para trás](https://velxio.dev/example/microbit-v2-io-box-motors) ·
[Loja DFRobot](https://www.dfrobot.com/product-1847.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-io-box)

### IO Extender

Um breakout (MBT0008) com todos os pinos do conector de borda em um conector
de 3 pinos (sinal, 3,3 V, terra), três portas I2C e um buzzer em P0 com um
interruptor.
[Um sensor de luz em P1](https://velxio.dev/example/microbit-v2-io-extender-light) ·
[Loja DFRobot](https://www.dfrobot.com/product-1867.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-io-extender)

### micro:Mate

Uma placa do tamanho da micro:bit (DFR0518) que se parafusa em sua frente, com
seis conectores Gravity de 3 pinos: P0, P1 e P2 a 3,3 V, P8, P12 e P16 a 5 V.
[Um sensor de luz em P0](https://velxio.dev/example/microbit-v2-micro-mate-light) ·
[Loja DFRobot](https://www.dfrobot.com/product-1699.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-micro-mate)

### Robotics & Power IO Extender

Um breakout completo para a micro:bit (DFR1231) com os conectores do
IO Extender na mesma ordem e os mesmos nomes de pino, para que um projeto
passe de um para o outro sem renomear um fio.
[Um sensor de luz em P1](https://velxio.dev/example/microbit-v2-robotics-io-extender-light) ·
[Loja DFRobot](https://www.dfrobot.com/product-2963.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-robotics-io-extender)

_Os links de loja nesta página são links de afiliado: o Velxio ganha uma pequena comissão sem custo extra para você._

## Arte das placas e pinagens

A arte de cada placa na tela e o mapa completo de pinos, gerados a partir do simulador:

[BBC micro:bit V2](/docs/pt-br/boards/reference/microbit-v2/) ·
[Maqueen Lite](/docs/pt-br/boards/reference/microbit-v2-maqueen-lite/) ·
[Maqueen Lite V5](/docs/pt-br/boards/reference/microbit-v2-maqueen-lite-v5/) ·
[micro:Driver](/docs/pt-br/boards/reference/microbit-v2-micro-driver/) ·
[micro:IO-BOX](/docs/pt-br/boards/reference/microbit-v2-io-box/) ·
[IO Extender](/docs/pt-br/boards/reference/microbit-v2-io-extender/) ·
[micro:Mate](/docs/pt-br/boards/reference/microbit-v2-micro-mate/) ·
[Robotics & Power IO Extender](/docs/pt-br/boards/reference/microbit-v2-robotics-io-extender/)

---

BBC micro:bit é uma marca registrada da Micro:bit Educational Foundation. O Velxio
funciona com a micro:bit; não é fabricado nem endossado pela Foundation. A
micro:bit em si é vendida pelos revendedores que a Foundation lista em
[microbit.org](https://microbit.org/buy/).
