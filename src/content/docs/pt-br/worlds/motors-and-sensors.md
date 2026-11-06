---
title: Motores e sensores
description: O que um World lê do circuito, o que ele escreve de volta nos sensores, e o firmware que comanda um robô com cada driver.
sidebar:
  order: 3
---

O World nunca executa seu código e nunca toca diretamente em um pino. Ele lê
o que o circuito aciona e escreve o que os sensores mediriam, de modo que o
firmware é o mesmo código que roda no robô real.

## O que o World lê

| Peça                                    | Valor que o World obtém                                       |
| --------------------------------------- | ------------------------------------------------------------- |
| Motor DC, motor com encoder             | `drive`, de -1 a 1: o duty no motor, sinal = direção          |
| Servo                                   | `angle`, 0 a 180 graus                                        |

O drive de um motor é lido através do que quer que o acione: um L293D, um transistor ou
MOSFET, um driver embarcado da placa (as placas Romeo), ou um pino direto no
motor. Um lado do robô segue o drive médio de seus motores, com um pouco de
inércia (cerca de 80 ms) e uma pequena zona morta, como uma caixa de engrenagens real.

## O que o World escreve

| Peça                                   | Valores                                                     | Como o firmware lê                                            |
| -------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------- |
| DFRobot Gravity line tracker (SEN0017) | reflectância 0 a 1, `black`                                | `digitalRead(pin) == LOW` sobre a fita preta                  |
| DFRobot URM09, modo Trig (SEN0388)     | distância, 2 a 500 cm                                      | um pino: um trigger de 10 us, depois `pulseIn(pin, HIGH) / 58.0` |
| DFRobot URM37 V5.0, modo PWM           | distância, 2 a 500 cm                                      | puxe COMP/TRIG para baixo, depois `pulseIn(ECHO, LOW) / 50`   |
| HC-SR04                                | distância, 2 a 400 cm                                      | TRIG em HIGH por 10 us, depois `pulseIn(ECHO, HIGH) / 58.0`   |
| MPU6050                                | aceleração em g, rotação em graus por segundo              | I2C, como no chip real                                        |

Os sensores de distância olham para a frente a partir do para-choque do robô, com um cone
estreito de cerca de 12 graus de cada lado. Os sensores de linha amostram o tapete (ou a rampa)
bem embaixo deles.

## Comande um robô: o lado do firmware

O sinal do drive decide a direção. Se um lado anda para trás no
World, corrija o firmware ou marque **Reverse** para esse lado no
[editor de cena](/docs/pt-br/worlds/scene-editor/).

### L293D (qualquer placa)

Canal 1: EN1 (PWM) com IN1 e IN2, saídas OUT1 e OUT2. Canal 2: EN2
com IN3 e IN4. IN1 em HIGH e IN2 em LOW é um drive positivo, e o duty em
EN1 define a velocidade.

```cpp
// Arduino Uno: left motor on channel 1, right motor on channel 2
const int EN_L = 5, IN1 = 4, IN2 = 7;
const int EN_R = 6, IN3 = 8, IN4 = 12;

void side(int en, int a, int b, int speed) {   // speed -255..255
  digitalWrite(a, speed >= 0 ? HIGH : LOW);
  digitalWrite(b, speed >= 0 ? LOW : HIGH);
  analogWrite(en, min(abs(speed), 255));
}

void drive(int left, int right) {
  side(EN_L, IN1, IN2, left);
  side(EN_R, IN3, IN4, right);
}
```

### DFRobot Romeo BLE e Romeo BLE mini

M1: direção D4, PWM D5. M2: direção D7, PWM D6. Ligue cada motor aos
terminais M1+/M1- ou M2+/M2- da placa.

```cpp
void side(int dirPin, int pwmPin, int speed) {
  digitalWrite(dirPin, speed >= 0 ? HIGH : LOW);
  analogWrite(pwmPin, min(abs(speed), 255));
}
void drive(int left, int right) { side(4, 5, left); side(7, 6, right); }   // M1 left, M2 right
```

A biblioteca DFMobile da DFRobot (usada pelos exemplos do Devastator) aciona o
pino de direção em LOW para frente com `Robot.Direction(LOW, HIGH)`, então um robô
que a utiliza precisa de **Reverse** em ambos os lados.

### DFRobot Romeo ESP32-S3

Quatro drivers DRV8876 em modo PH/EN. M1 EN 12 / PH 13, M2 14 / 21, M3 9 / 10,
M4 47 / 11. PH em HIGH é para frente.

```cpp
const int EN[4] = { 12, 14, 9, 47 }, PH[4] = { 13, 21, 10, 11 };
void motor(int i, int speed) {
  digitalWrite(PH[i], speed >= 0 ? HIGH : LOW);
  analogWrite(EN[i], min(abs(speed), 255));
}
void drive(int left, int right) { motor(0, left); motor(2, left); motor(1, right); motor(3, right); }
```

### Transistor ou MOSFET

Apenas uma direção: o duty no pino de gate é o drive.

## Comportamentos

Um seguidor de linha com três sensores:

```cpp
bool L = digitalRead(LINE_L) == LOW, C = digitalRead(LINE_C) == LOW, R = digitalRead(LINE_R) == LOW;
if (C && !L && !R) drive(150, 150);        // on the line
else if (L)        drive(40, 170);         // tape on the left: turn left
else if (R)        drive(170, 40);         // tape on the right: turn right
else               drive(-80, 80);         // lost: spin and look for it
```

Um desviador de obstáculos anda para frente e, abaixo de 20 a 35 cm, para, recua
e vira para o lado com mais espaço (um sonar em um servo pode olhar para 0
e 180 graus primeiro). Leia o sonar a cada 50 a 100 ms e nunca bloqueie por
muito tempo em `loop()`.

Em drive máximo, um robô 2WD faz 0,55 m/s, um 4WD 0,61 m/s e o tanque
0,36 m/s. Para um seguidor de linha em uma fita de 22 mm, 120 a 170 de 255 o mantém
na linha.
