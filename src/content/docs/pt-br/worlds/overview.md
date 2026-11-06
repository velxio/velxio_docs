---
title: Mundos 3D
description: "Coloque seu circuito em uma cena 3D ou 2D. O firmware da placa controla o robô, e os sensores do robô leem a cena de volta."
sidebar:
  order: 1
---

Um **World** coloca seu circuito em uma cena física. O firmware roda na
placa emulada exatamente como rodaria na real: os motores que ele aciona movem
um robô, os servos que ele define giram um braço ou um sensor, e os sensores
de linha, distância e movimento leem o que está sob e à frente do robô. O mesmo
código então roda no hardware real.

![O seguidor de linha Romeo ESP32-S3 em seu World, ao lado do circuito em execução](../../../../assets/docs/worlds/romeo-running.png)

## Abra o World

Todo projeto com uma placa tem um botão **3D** no cabeçalho do canvas, ao lado
do seletor de placa:

![O botão 3D ao lado do seletor de placa](../../../../assets/docs/worlds/3d-button.png)

Na primeira vez, ele abre uma introdução com três formas de começar:

![A introdução do World 3D](../../../../assets/docs/worlds/intro.png)

- **Start from a robot**: abra um projeto de robô completo (placa, motores e
  sensores conectados, firmware e World) e pressione **Run**. Há cinco: o
  [seguidor de linha Romeo ESP32-S3](/docs/pt-br/worlds/example-romeo-line-follower/),
  o [tanque Devastator](/docs/pt-br/worlds/example-devastator-tank/), um
  [seguidor de linha Arduino Uno](https://velxio.dev/example/uno-l293d-line-follower-3d)
  com um L293D, um [desviador de obstáculos ESP32](https://velxio.dev/example/esp32-obstacle-avoider-3d)
  com um HC-SR04, e um [braço robótico ESP32](https://velxio.dev/example/esp32-servo-arm-3d)
  cujos quatro servos seguem quatro botões.
- **Create a world for this circuit**: o Velxio monta uma cena inicial a partir
  do que está no seu canvas. Motores viram um robô (duas ou quatro rodas),
  sensores de linha ganham uma pista com fita sob eles, um sensor de distância
  ganha obstáculos à sua frente, e servos sozinhos viram um braço robótico sobre
  uma pequena mesa.
- **Copy AI prompt**: copia um resumo com suas placas, peças, ligações e
  firmware para o ChatGPT, Claude ou Gemini, para que uma IA possa escrever
  qualquer World que você descrever. Veja [Escreva seu próprio World](/docs/pt-br/worlds/write-your-own/).

Depois que o projeto tem um World, o botão 3D alterna entre o World e
seu código.

## Pressione Run

Quando a simulação começa, a área do editor mostra o World e o canvas
fica ao lado, para você ver os motores ligarem no circuito enquanto o
robô se move. O ciclo se fecha cerca de 125 vezes por segundo:

1. O firmware define os pinos: uma direção e um duty de PWM para cada motor, um pulso
   para cada servo.
2. O Velxio lê o acionamento de cada motor (através do driver que o circuito usar)
   e o ângulo de cada servo, e os envia ao World.
3. O World move o robô e mede a cena: a fita sob cada sensor de
   linha, o obstáculo mais próximo à frente de cada sensor de distância, a
   aceleração e a taxa de giro do robô para uma IMU.
4. O Velxio grava essas leituras nas peças dos sensores, e o firmware as lê
   em seu próximo `digitalRead()`, `pulseIn()` ou transferência I2C.

O World roda no **relógio simulado** da placa, não no tempo real. Se seu
computador roda a simulação em meia velocidade, o robô se move em meia velocidade também,
e ainda assim concorda com o `millis()` do firmware.

## A barra do World

| Controle           | O que faz                                                                                                 |
| ------------------ | --------------------------------------------------------------------------------------------------------- |
| **World / HTML**   | Mostra a cena, ou o código-fonte `world.html` por trás dela.                                              |
| **Guide**          | Uma breve explicação do World, sobre a cena.                                                              |
| **Copy AI prompt** | Copia o resumo para um chat de IA externo (veja [Escreva seu próprio World](/docs/pt-br/worlds/write-your-own/)). |
| **Reload**         | Reinicia o World a partir de seu arquivo.                                                                 |
| **Full screen**    | Mostra apenas o World. Pressione Esc para voltar.                                                         |

Worlds feitos com o kit de cena do Velxio adicionam sua própria barra de ferramentas dentro da cena:
**Edit**, **Add**, **3D / 2D**, **Camera** (órbita, seguir o robô, de
cima) e **Reset** (coloca os robôs de volta em suas posições iniciais). Veja
[Construa uma cena](/docs/pt-br/worlds/scene-editor/).

## 3D ou 2D

A visualização 3D precisa de WebGL. A vista superior **2D** desenha a mesma cena e roda
a mesma física sem placa de vídeo, então funciona em qualquer computador escolar,
e é o recurso alternativo quando o 3D não está disponível.

![A arena Devastator na vista superior 2D](../../../../assets/docs/worlds/view-2d.png)

## Com o que um World funciona

- **Lê**: motores DC e motores com redução (atrás de um L293D, um transistor ou
  MOSFET, um driver integrado da placa, ou direto em um pino), servos e LEDs.
- **Alimenta**: o rastreador de linha DFRobot Gravity, os sensores ultrassônicos
  URM09 e URM37, o HC-SR04 e a IMU MPU6050.

Todas as outras peças (displays, buzzers, LEDs RGB) continuam funcionando no canvas. Detalhes
e receitas de firmware: [Motores e sensores](/docs/pt-br/worlds/motors-and-sensors/).

## É um arquivo

Um World é um único arquivo, `world.html`, no grupo de arquivos da placa, ao lado do
sketch. Ele é salvo, compartilhado e exportado com o projeto, e nunca vai
para a placa: não é compilado, não é gravado na flash e não é copiado para o
cartão microSD. Apague o arquivo e o projeto não terá World.
