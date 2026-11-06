---
title: Motores y sensores
description: "Lo que un World lee del circuito, lo que escribe en los sensores y el firmware que controla un robot con cada driver."
sidebar:
  order: 3
---

El World nunca ejecuta tu código ni toca un pin directamente. Lee lo que el
circuito controla y escribe lo que medirían los sensores, de modo que el
firmware es el mismo código que se ejecuta en el robot real.

## Lo que lee el World

| Pieza                                    | Valor que obtiene el World                                     |
| ---------------------------------------- | -------------------------------------------------------------- |
| Motor DC, motorreductor con encoder      | `drive`, de -1 a 1: el duty sobre el motor, el signo = dirección |
| Servo                                    | `angle`, de 0 a 180 grados                                     |

El drive de un motor se lee a través de lo que lo controla: un L293D, un
transistor o MOSFET, el driver integrado de una placa (las placas Romeo), o un
pin directo al motor. Un lado del robot sigue el drive promedio de sus
motores, con un poco de inercia (unos 80 ms) y una pequeña banda muerta, como
una caja de engranajes real.

## Lo que escribe el World

| Pieza                                  | Valores                                                    | Cómo lo lee el firmware                                       |
| -------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------- |
| DFRobot Gravity line tracker (SEN0017) | reflectancia de 0 a 1, `black`                             | `digitalRead(pin) == LOW` sobre la cinta negra                |
| DFRobot URM09, modo Trig (SEN0388)     | distancia, de 2 a 500 cm                                   | un pin: un trigger de 10 us, luego `pulseIn(pin, HIGH) / 58.0` |
| DFRobot URM37 V5.0, modo PWM           | distancia, de 2 a 500 cm                                   | poner COMP/TRIG en LOW, luego `pulseIn(ECHO, LOW) / 50`       |
| HC-SR04                                | distancia, de 2 a 400 cm                                   | TRIG en HIGH 10 us, luego `pulseIn(ECHO, HIGH) / 58.0`        |
| MPU6050                                | aceleración en g, rotación en grados por segundo           | I2C, como en el chip real                                      |

Los sensores de distancia miran hacia adelante desde el parachoques del robot,
con un cono estrecho de unos 12 grados por lado. Los sensores de línea toman
la muestra de la alfombra (o de la rampa) justo debajo de ellos.

## Controlar un robot: el lado del firmware

El signo del drive decide la dirección. Si un lado va hacia atrás en el World,
corrige el firmware o marca **Reverse** para ese lado en el
[editor de escena](/docs/es/worlds/scene-editor/).

### L293D (cualquier placa)

Canal 1: EN1 (PWM) con IN1 e IN2, salidas OUT1 y OUT2. Canal 2: EN2 con IN3 e
IN4. IN1 en HIGH e IN2 en LOW es un drive positivo, y el duty sobre EN1 fija
la velocidad.

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

### DFRobot Romeo BLE y Romeo BLE mini

M1: dirección D4, PWM D5. M2: dirección D7, PWM D6. Conecta cada motor a los
terminales M1+/M1- o M2+/M2- de la placa.

```cpp
void side(int dirPin, int pwmPin, int speed) {
  digitalWrite(dirPin, speed >= 0 ? HIGH : LOW);
  analogWrite(pwmPin, min(abs(speed), 255));
}
void drive(int left, int right) { side(4, 5, left); side(7, 6, right); }   // M1 left, M2 right
```

La librería DFMobile de DFRobot (usada por los ejemplos del Devastator)
controla el pin de dirección en LOW para avanzar con `Robot.Direction(LOW,
HIGH)`, así que un robot que la use necesita **Reverse** en ambos lados.

### DFRobot Romeo ESP32-S3

Cuatro drivers DRV8876 en modo PH/EN. M1 EN 12 / PH 13, M2 14 / 21, M3 9 / 10,
M4 47 / 11. PH en HIGH es hacia adelante.

```cpp
const int EN[4] = { 12, 14, 9, 47 }, PH[4] = { 13, 21, 10, 11 };
void motor(int i, int speed) {
  digitalWrite(PH[i], speed >= 0 ? HIGH : LOW);
  analogWrite(EN[i], min(abs(speed), 255));
}
void drive(int left, int right) { motor(0, left); motor(2, left); motor(1, right); motor(3, right); }
```

### Transistor o MOSFET

Una sola dirección: el duty sobre el pin de la compuerta es el drive.

## Comportamientos

Un seguidor de línea de tres sensores:

```cpp
bool L = digitalRead(LINE_L) == LOW, C = digitalRead(LINE_C) == LOW, R = digitalRead(LINE_R) == LOW;
if (C && !L && !R) drive(150, 150);        // on the line
else if (L)        drive(40, 170);         // tape on the left: turn left
else if (R)        drive(170, 40);         // tape on the right: turn right
else               drive(-80, 80);         // lost: spin and look for it
```

Un evasor de obstáculos avanza y, por debajo de 20 a 35 cm, se detiene,
retrocede y gira hacia el lado con más espacio (un sonar sobre un servo puede
mirar primero a 0 y a 180 grados). Lee el sonar cada 50 a 100 ms y nunca
bloquees durante mucho tiempo en `loop()`.

A drive máximo, un robot 2WD hace 0.55 m/s, uno 4WD 0.61 m/s y el tanque
0.36 m/s. Para un seguidor de línea sobre cinta de 22 mm, de 120 a 170 sobre
255 lo mantiene sobre la línea.
