---
title: "Exemplo: seguidor de linha Romeo ESP32-S3"
description: Um robô de quatro rodas DFRobot Romeo ESP32-S3 segue um circuito de fita adesiva com três sensores de linha e para diante de obstáculos com um URM09, em um World 3D.
sidebar:
  order: 5
---

Um robô de quatro rodas sobre o DFRobot Romeo ESP32-S3 segue um circuito de
fita adesiva com três sensores de linha Gravity, e para antes de um obstáculo
com um sensor ultrassônico URM09. O firmware é código Arduino puro; o World
desenha o robô sobre o tapete e alimenta os quatro sensores.

**Abra:** [velxio.dev/example/dfrobot-romeo-esp32s3-line-robot-3d](https://velxio.dev/example/dfrobot-romeo-esp32s3-line-robot-3d)
e pressione **Run** (Executar).

![O seguidor de linha Romeo em execução, o World ao lado do seu circuito](../../../../assets/docs/worlds/romeo-running.png)

## Peças

| Id                                       | Peça                                         |
| ---------------------------------------- | -------------------------------------------- |
| `dfrobot-romeo-esp32s3`                  | DFRobot Romeo ESP32-S3 (quatro drivers de motor DRV8876 na placa) |
| `motorFL`, `motorFR`, `motorRL`, `motorRR` | Motor com encoder, 50:1                    |
| `lineL`, `lineC`, `lineR`                | DFRobot Gravity line tracker (SEN0017)       |
| `urm09`                                  | DFRobot Gravity URM09 ultrassônico, modo Trig (SEN0388) |

## Ligação

| De                  | Para (Romeo ESP32-S3) |
| ------------------- | ------------------- |
| `motorFL` M1 / M2   | M1+ / M1-           |
| `motorFR` M1 / M2   | M2+ / M2-           |
| `motorRL` M1 / M2   | M3+ / M3-           |
| `motorRR` M1 / M2   | M4+ / M4-           |
| `lineL` OUT         | GPIO 4              |
| `lineC` OUT         | GPIO 5              |
| `lineR` OUT         | GPIO 6              |
| `urm09` TRIG        | GPIO 16             |
| VCC / GND de cada sensor | 3V3 / GND      |

## Firmware

```cpp
// DFRobot Romeo ESP32-S3 line-following robot (4WD) with a URM09 bumper.
// Motors on the onboard DRV8876 drivers, PH/EN mode:
//   M1 front-left, M2 front-right, M3 rear-left, M4 rear-right.
const int EN[4] = { 12, 14, 9, 47 };   // speed (PWM)
const int PH[4] = { 13, 21, 10, 11 };  // direction (HIGH = forward)

// Gravity line trackers (SEN0017): LOW over the black tape, HIGH on white.
const int LINE_L = 4, LINE_C = 5, LINE_R = 6;
// Gravity URM09 Trig (SEN0388): one pin for trigger and echo.
const int URM09 = 16;

const int CRUISE = 150;               // 0-255
const int TURN_FAST = 170, TURN_SLOW = 40;
const float STOP_CM = 15;

void side(bool left, int speed) {     // speed -255..255
  int a = left ? 0 : 1, b = left ? 2 : 3;
  bool fwd = speed >= 0;
  int s = min(abs(speed), 255);
  digitalWrite(PH[a], fwd ? HIGH : LOW); analogWrite(EN[a], s);
  digitalWrite(PH[b], fwd ? HIGH : LOW); analogWrite(EN[b], s);
}

void drive(int left, int right) { side(true, left); side(false, right); }

float readCm() {
  pinMode(URM09, OUTPUT);
  digitalWrite(URM09, LOW);  delayMicroseconds(2);
  digitalWrite(URM09, HIGH); delayMicroseconds(10);
  digitalWrite(URM09, LOW);
  pinMode(URM09, INPUT);
  unsigned long us = pulseIn(URM09, HIGH, 40000);
  return us == 0 ? 500 : us / 58.0;
}

int lastTurn = -1;                    // -1 left, +1 right
unsigned long lastPing = 0, lastPrint = 0;
float cm = 500;

void setup() {
  Serial.begin(115200);
  for (int i = 0; i < 4; i++) pinMode(PH[i], OUTPUT);
  pinMode(LINE_L, INPUT);
  pinMode(LINE_C, INPUT);
  pinMode(LINE_R, INPUT);
  drive(0, 0);
  Serial.println("Romeo line robot ready");
}

void loop() {
  if (millis() - lastPing >= 50) { lastPing = millis(); cm = readCm(); }

  bool L = digitalRead(LINE_L) == LOW;
  bool C = digitalRead(LINE_C) == LOW;
  bool R = digitalRead(LINE_R) == LOW;

  if (cm < STOP_CM) {
    drive(0, 0);                                   // something ahead: wait
  } else if (L && !R) {
    drive(TURN_SLOW, TURN_FAST); lastTurn = -1;    // tape on the left
  } else if (R && !L) {
    drive(TURN_FAST, TURN_SLOW); lastTurn = +1;    // tape on the right
  } else if (C) {
    drive(CRUISE, CRUISE);                         // centred
  } else if (lastTurn < 0) {
    drive(-80, 150);                               // lost: search left
  } else {
    drive(150, -80);                               // lost: search right
  }

  if (millis() - lastPrint >= 500) {
    lastPrint = millis();
    Serial.printf("line %d%d%d  distance %.0f cm\n", L, C, R, cm);
  }
  delay(2);
}
```

## O World

O `world.html` deste exemplo é um World livre escrito para este robô (veja
[Escreva seu próprio World](/docs/pt-br/worlds/write-your-own/)): um tapete de
2,4 x 1,6 m com um circuito de 2,1 x 0,9 m de fita adesiva preta de 22 mm, e
um modelo do robô com suas quatro rodas, três sensores de linha a 18 mm de
distância entre si na frente, e o URM09 no para-choque.

Dentro do World:

- **Camera** (Câmera) alterna entre órbita, seguir o robô e vista de cima.
- **Obstacle** (Obstáculo) solta uma caixa na reta mais distante. O URM09 a
  detecta e o firmware faz o robô parar antes dela; pressione novamente para
  remover a caixa e o robô continua.
- **Reset robot** (Reiniciar robô) o coloca de volta no início.
- O painel mostra o tempo simulado, a velocidade, os três sensores de linha, a
  distância do URM09, as voltas e o acionamento de cada motor.

O que esperar, medido na própria verificação do Velxio para este exemplo: uma
volta no circuito em cerca de 16 segundos de tempo simulado, nunca mais de
8 mm fora da fita, e uma parada de 8 a 11 cm antes da caixa. O firmware decide
a 15 cm; o intervalo de ping de 50 ms e a inércia dos motores explicam o
resto, como em um robô real.

## Tente a seguir

- Altere `CRUISE` e as duas velocidades de curva e observe o robô cortar ou
  passar das curvas.
- Altere `STOP_CM`, pressione **Obstacle** e verifique onde ele para.
- Imprima `millis()` ao lado das leituras de linha no monitor serial e compare
  com o tempo simulado no painel do World: eles coincidem.
