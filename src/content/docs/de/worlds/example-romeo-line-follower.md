---
title: "Beispiel: Romeo ESP32-S3 Linienfolger"
description: Ein vierrädriger DFRobot Romeo ESP32-S3 Roboter folgt mit drei Linientrackern einer geklebten Schleife und hält mit einem URM09 vor Hindernissen an, in einer 3D World.
sidebar:
  order: 5
---

Ein vierrädriger Roboter auf dem DFRobot Romeo ESP32-S3 folgt mit drei
Gravity Linientrackern einer geklebten Schleife und hält mit einem
URM09-Ultraschallsensor vor einem Hindernis an. Die Firmware ist reiner
Arduino-Code; die World zeichnet den Roboter auf seiner Matte und speist die
vier Sensoren.

**Öffnen:** [velxio.dev/example/dfrobot-romeo-esp32s3-line-robot-3d](https://velxio.dev/example/dfrobot-romeo-esp32s3-line-robot-3d)
und **Run** (Ausführen) drücken.

![Der Romeo Linienfolger im Betrieb, die World neben seiner Schaltung](../../../../assets/docs/worlds/romeo-running.png)

## Teile

| Id                                       | Teil                                         |
| ---------------------------------------- | -------------------------------------------- |
| `dfrobot-romeo-esp32s3`                  | DFRobot Romeo ESP32-S3 (vier DRV8876 Motortreiber an Bord) |
| `motorFL`, `motorFR`, `motorRL`, `motorRR` | Getriebemotor mit Encoder, 50:1            |
| `lineL`, `lineC`, `lineR`                | DFRobot Gravity Linientracker (SEN0017)      |
| `urm09`                                  | DFRobot Gravity URM09 Ultraschall, Trig-Modus (SEN0388) |

## Verdrahtung

| Von                 | Nach (Romeo ESP32-S3) |
| ------------------- | ------------------- |
| `motorFL` M1 / M2   | M1+ / M1-           |
| `motorFR` M1 / M2   | M2+ / M2-           |
| `motorRL` M1 / M2   | M3+ / M3-           |
| `motorRR` M1 / M2   | M4+ / M4-           |
| `lineL` OUT         | GPIO 4              |
| `lineC` OUT         | GPIO 5              |
| `lineR` OUT         | GPIO 6              |
| `urm09` TRIG        | GPIO 16             |
| jeder Sensor VCC / GND | 3V3 / GND        |

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

## Die World

Die `world.html` dieses Beispiels ist eine freie World, die für diesen
Roboter geschrieben wurde (siehe
[Write your own World](/docs/de/worlds/write-your-own/)): eine 2,4 x 1,6 m
große Matte mit einer 2,1 x 0,9 m großen Schleife aus 22 mm schwarzem
Klebeband und einem Modell des Roboters mit seinen vier Rädern, drei
Linientrackern im Abstand von 18 mm über die Front verteilt und dem URM09
auf der Stoßstange.

In der World:

- **Camera** (Kamera) wechselt zwischen Orbit, Folge dem Roboter und
  Draufsicht.
- **Obstacle** (Hindernis) lässt eine Kiste auf der gegenüberliegenden
  Geraden fallen. Der URM09 erkennt sie und die Firmware stoppt den Roboter
  davor; erneut drücken, um die Kiste zu entfernen, und der Roboter fährt
  weiter.
- **Reset robot** (Roboter zurücksetzen) setzt ihn an den Start zurück.
- Das Panel zeigt die simulierte Zeit, die Geschwindigkeit, die drei
  Linientracker, die URM09-Distanz, die Runden und den Antrieb jedes Motors.

Was zu erwarten ist, gemessen bei Velxios eigener Prüfung dieses Beispiels:
eine Runde der Schleife in etwa 16 Sekunden simulierter Zeit, nie mehr als
8 mm neben dem Klebeband, und ein Halt 8 bis 11 cm vor der Kiste. Die
Firmware entscheidet bei 15 cm; das 50-ms-Ping-Intervall und das Ausrollen
der Motoren erklären den Rest, wie bei einem echten Roboter.

## Als Nächstes

- Ändere `CRUISE` und die beiden Wendegeschwindigkeiten und beobachte, wie
  der Roboter die Kurven schneidet oder überfährt.
- Ändere `STOP_CM`, drücke **Obstacle** und prüfe, wo er anhält.
- Gib `millis()` neben den Linienwerten im Serial Monitor aus und vergleiche
  es mit der simulierten Zeit im Panel der World: sie stimmen überein.
