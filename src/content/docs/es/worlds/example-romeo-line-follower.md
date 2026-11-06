---
title: "Ejemplo: seguidor de línea Romeo ESP32-S3"
description: Un robot de cuatro ruedas DFRobot Romeo ESP32-S3 sigue un circuito de cinta con tres rastreadores de línea y se detiene ante obstáculos con un URM09, en un World 3D.
sidebar:
  order: 5
---

Un robot de cuatro ruedas sobre el DFRobot Romeo ESP32-S3 sigue un circuito
de cinta con tres rastreadores de línea Gravity, y se detiene ante un
obstáculo con un sensor ultrasónico URM09. El firmware es código Arduino
normal; el World dibuja el robot sobre su tapete y alimenta los cuatro
sensores.

**Abrirlo:** [velxio.dev/example/dfrobot-romeo-esp32s3-line-robot-3d](https://velxio.dev/example/dfrobot-romeo-esp32s3-line-robot-3d)
y pulsa **Run** (Ejecutar).

![El seguidor de línea Romeo en ejecución, el World junto a su circuito](../../../../assets/docs/worlds/romeo-running.png)

## Piezas

| Id                                       | Pieza                                        |
| ---------------------------------------- | -------------------------------------------- |
| `dfrobot-romeo-esp32s3`                  | DFRobot Romeo ESP32-S3 (cuatro controladores de motor DRV8876 a bordo) |
| `motorFL`, `motorFR`, `motorRL`, `motorRR` | Motorreductor con encoder, 50:1            |
| `lineL`, `lineC`, `lineR`                | Rastreador de línea DFRobot Gravity (SEN0017) |
| `urm09`                                  | DFRobot Gravity URM09 ultrasónico, modo Trig (SEN0388) |

## Cableado

| Desde               | Hacia (Romeo ESP32-S3) |
| ------------------- | ---------------------- |
| `motorFL` M1 / M2   | M1+ / M1-              |
| `motorFR` M1 / M2   | M2+ / M2-              |
| `motorRL` M1 / M2   | M3+ / M3-              |
| `motorRR` M1 / M2   | M4+ / M4-              |
| `lineL` OUT         | GPIO 4                 |
| `lineC` OUT         | GPIO 5                 |
| `lineR` OUT         | GPIO 6                 |
| `urm09` TRIG        | GPIO 16                |
| VCC / GND de cada sensor | 3V3 / GND         |

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

## El World

El `world.html` de este ejemplo es un World libre escrito para este robot
(consulta [Escribe tu propio World](/docs/es/worlds/write-your-own/)): un tapete
de 2,4 x 1,6 m con un circuito de 2,1 x 0,9 m de cinta negra de 22 mm, y un
modelo del robot con sus cuatro ruedas, tres sensores de línea separados 18 mm
entre sí en la parte frontal, y el URM09 en el parachoques.

Dentro del World:

- **Camera** (Cámara) alterna entre órbita, seguir al robot y vista desde arriba.
- **Obstacle** (Obstáculo) deja caer una caja en la recta lejana. El URM09 la
  detecta y el firmware detiene el robot antes de alcanzarla; vuelve a pulsarlo
  para retirar la caja y el robot continúa.
- **Reset robot** (Reiniciar robot) lo devuelve al punto de partida.
- El panel muestra el tiempo simulado, la velocidad, los tres sensores de
  línea, la distancia del URM09, las vueltas y el accionamiento de cada motor.

Lo que cabe esperar, medido en la propia comprobación de Velxio de este
ejemplo: una vuelta al circuito en unos 16 segundos de tiempo simulado, sin
desviarse nunca más de 8 mm de la cinta, y una parada de 8 a 11 cm antes de la
caja. El firmware decide a 15 cm; el intervalo de ping de 50 ms y la inercia de
los motores explican el resto, como en un robot real.

## Prueba a continuación

- Cambia `CRUISE` y las dos velocidades de giro y observa cómo el robot recorta
  u sobrepasa las curvas.
- Cambia `STOP_CM`, pulsa **Obstacle** y comprueba dónde se detiene.
- Imprime `millis()` junto a las lecturas de línea en el monitor serie y
  compáralo con el tiempo simulado del panel del World: coinciden.
