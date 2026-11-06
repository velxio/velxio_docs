---
title: Motori e sensori
description: Cosa un World legge dal circuito, cosa riscrive nei sensori e il firmware che guida un robot con ciascun driver.
sidebar:
  order: 3
---

Il World non esegue mai il tuo codice e non tocca mai direttamente un pin. Legge
ciò che il circuito pilota e scrive ciò che i sensori misurerebbero, così il
firmware è lo stesso codice che gira sul robot reale.

## Cosa legge il World

| Componente                              | Valore che il World riceve                                    |
| --------------------------------------- | ------------------------------------------------------------- |
| Motore DC, motoriduttore con encoder    | `drive`, da -1 a 1: il duty sul motore, il segno = direzione   |
| Servo                                   | `angle`, da 0 a 180 gradi                                     |
| LED                                     | `on` (true quando acceso) e `brightness`, da 0 a 1 (segue il PWM) |

Il drive di un motore viene letto attraverso qualunque cosa lo piloti: un L293D, un transistor o
MOSFET, un driver integrato sulla scheda (le schede Romeo), o un pin collegato direttamente al
motore. Un lato del robot segue il drive medio dei suoi motori, con una piccola
inerzia (circa 80 ms) e una piccola zona morta, come un vero cambio.

Un LED non muove nulla, ma un World che scrivi tu puoi disegnarlo: un
semaforo a un incrocio, un faro, una lampada in una stanza.

## Cosa scrive il World

| Componente                             | Valori                                                     | Come lo legge il firmware                                     |
| -------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------- |
| DFRobot Gravity line tracker (SEN0017) | riflettanza da 0 a 1, `black`                              | `digitalRead(pin) == LOW` sul nastro nero                     |
| DFRobot URM09, modalità Trig (SEN0388) | distanza, da 2 a 500 cm                                    | un pin: un trigger di 10 us, poi `pulseIn(pin, HIGH) / 58.0`  |
| DFRobot URM37 V5.0, modalità PWM       | distanza, da 2 a 500 cm                                    | porta COMP/TRIG basso, poi `pulseIn(ECHO, LOW) / 50`          |
| HC-SR04                                | distanza, da 2 a 400 cm                                    | TRIG alto per 10 us, poi `pulseIn(ECHO, HIGH) / 58.0`         |
| MPU6050                                | accelerazione in g, rotazione in gradi al secondo          | I2C, come sul chip reale                                      |

I sensori di distanza guardano dritto davanti dal paraurti del robot, con un cono
stretto di circa 12 gradi per lato. I sensori di linea campionano il tappeto (o la rampa)
proprio sotto di loro.

## Guidare un robot: il lato firmware

Il segno del drive decide la direzione. Se un lato va all'indietro nel
World, correggi il firmware oppure spunta **Reverse** per quel lato nel
[scene editor](/docs/it/worlds/scene-editor/).

### L293D (qualsiasi scheda)

Canale 1: EN1 (PWM) con IN1 e IN2, uscite OUT1 e OUT2. Canale 2: EN2
con IN3 e IN4. IN1 HIGH e IN2 LOW è un drive positivo, e il duty su
EN1 imposta la velocità.

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

M1: direzione D4, PWM D5. M2: direzione D7, PWM D6. Collega ciascun motore ai
terminali M1+/M1- o M2+/M2- della scheda.

```cpp
void side(int dirPin, int pwmPin, int speed) {
  digitalWrite(dirPin, speed >= 0 ? HIGH : LOW);
  analogWrite(pwmPin, min(abs(speed), 255));
}
void drive(int left, int right) { side(4, 5, left); side(7, 6, right); }   // M1 left, M2 right
```

La libreria DFMobile di DFRobot (usata dagli esempi Devastator) pilota il
pin di direzione LOW per andare avanti con `Robot.Direction(LOW, HIGH)`, quindi un robot
che la usa necessita di **Reverse** su entrambi i lati.

### DFRobot Romeo ESP32-S3

Quattro driver DRV8876 in modalità PH/EN. M1 EN 12 / PH 13, M2 14 / 21, M3 9 / 10,
M4 47 / 11. PH HIGH è avanti.

```cpp
const int EN[4] = { 12, 14, 9, 47 }, PH[4] = { 13, 21, 10, 11 };
void motor(int i, int speed) {
  digitalWrite(PH[i], speed >= 0 ? HIGH : LOW);
  analogWrite(EN[i], min(abs(speed), 255));
}
void drive(int left, int right) { motor(0, left); motor(2, left); motor(1, right); motor(3, right); }
```

### Transistor o MOSFET

Una sola direzione: il duty sul pin del gate è il drive.

## Comportamenti

Un line follower a tre sensori:

```cpp
bool L = digitalRead(LINE_L) == LOW, C = digitalRead(LINE_C) == LOW, R = digitalRead(LINE_R) == LOW;
if (C && !L && !R) drive(150, 150);        // on the line
else if (L)        drive(40, 170);         // tape on the left: turn left
else if (R)        drive(170, 40);         // tape on the right: turn right
else               drive(-80, 80);         // lost: spin and look for it
```

Un evita-ostacoli va avanti, e sotto i 20-35 cm si ferma, indietreggia
e gira verso il lato con più spazio (un sonar su un servo può guardare prima a 0
e 180 gradi). Leggi il sonar ogni 50-100 ms e non bloccare mai a lungo
in `loop()`.

A pieno drive un robot 2WD fa 0,55 m/s, un 4WD 0,61 m/s e il tank
0,36 m/s. Per un line follower su un nastro da 22 mm, da 120 a 170 su 255 lo tiene
sulla linea.
