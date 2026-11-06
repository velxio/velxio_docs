---
title: Motoren und Sensoren
description: Was eine World aus der Schaltung liest, was sie in die Sensoren zurückschreibt und welche Firmware einen Roboter mit jedem Treiber ansteuert.
sidebar:
  order: 3
---

Die World führt niemals deinen Code aus und berührt niemals direkt einen Pin. Sie liest,
was die Schaltung ansteuert, und schreibt, was die Sensoren messen würden, sodass die
Firmware derselbe Code ist, der auf dem echten Roboter läuft.

## Was die World liest

| Bauteil                                 | Wert, den die World erhält                                     |
| --------------------------------------- | ------------------------------------------------------------- |
| DC-Motor, Getriebemotor mit Encoder     | `drive`, von -1 bis 1: das Tastverhältnis am Motor, Vorzeichen = Richtung |
| Servo                                   | `angle`, 0 bis 180 Grad                                       |
| LED                                     | `on` (true, wenn an) und `brightness`, 0 bis 1 (folgt dem PWM) |

Der Drive eines Motors wird über das gelesen, was ihn ansteuert: ein L293D, ein Transistor oder
MOSFET, ein Onboard-Treiber eines Boards (die Romeo-Boards) oder ein Pin direkt zum
Motor. Eine Roboterseite folgt dem durchschnittlichen Drive ihrer Motoren, mit etwas
Trägheit (etwa 80 ms) und einer kleinen Totzone, wie ein echtes Getriebe.

Eine LED bewegt nichts, aber eine World, die du selbst schreibst, kann sie zeichnen: eine
Ampel an einer Kreuzung, ein Leuchtturm, eine Lampe in einem Raum.

## Was die World schreibt

| Bauteil                                | Werte                                                      | Wie die Firmware sie liest                                    |
| -------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------- |
| DFRobot Gravity Linienfolger (SEN0017) | Reflexion 0 bis 1, `black`                                 | `digitalRead(pin) == LOW` über dem schwarzen Klebeband         |
| DFRobot URM09, Trig-Modus (SEN0388)    | Entfernung, 2 bis 500 cm                                   | ein Pin: ein 10 us Trigger, dann `pulseIn(pin, HIGH) / 58.0`  |
| DFRobot URM37 V5.0, PWM-Modus          | Entfernung, 2 bis 500 cm                                   | COMP/TRIG auf LOW ziehen, dann `pulseIn(ECHO, LOW) / 50`      |
| HC-SR04                                | Entfernung, 2 bis 400 cm                                   | TRIG 10 us auf HIGH, dann `pulseIn(ECHO, HIGH) / 58.0`        |
| MPU6050                                | Beschleunigung in g, Rotation in Grad pro Sekunde          | I2C, wie auf dem echten Chip                                  |

Entfernungssensoren blicken geradeaus von der Stoßstange des Roboters, mit einem schmalen
Kegel von etwa 12 Grad pro Seite. Liniensensoren tasten die Matte (oder die Rampe)
direkt unter sich ab.

## Einen Roboter ansteuern: die Firmware-Seite

Das Vorzeichen des Drive entscheidet über die Richtung. Wenn eine Seite in der
World rückwärts läuft, korrigiere entweder die Firmware oder setze für diese Seite ein Häkchen bei **Reverse** im
[Szeneneditor](/docs/de/worlds/scene-editor/).

### L293D (beliebiges Board)

Kanal 1: EN1 (PWM) mit IN1 und IN2, Ausgänge OUT1 und OUT2. Kanal 2: EN2
mit IN3 und IN4. IN1 HIGH und IN2 LOW ist ein positiver Drive, und das Tastverhältnis an
EN1 bestimmt die Geschwindigkeit.

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

### DFRobot Romeo BLE und Romeo BLE mini

M1: Richtung D4, PWM D5. M2: Richtung D7, PWM D6. Verbinde jeden Motor mit den
M1+/M1- oder M2+/M2- Anschlüssen des Boards.

```cpp
void side(int dirPin, int pwmPin, int speed) {
  digitalWrite(dirPin, speed >= 0 ? HIGH : LOW);
  analogWrite(pwmPin, min(abs(speed), 255));
}
void drive(int left, int right) { side(4, 5, left); side(7, 6, right); }   // M1 left, M2 right
```

Die DFMobile-Bibliothek von DFRobot (verwendet von den Devastator-Beispielen) steuert den
Richtungspin für Vorwärts mit `Robot.Direction(LOW, HIGH)` auf LOW, daher braucht ein Roboter,
der sie verwendet, **Reverse** auf beiden Seiten.

### DFRobot Romeo ESP32-S3

Vier DRV8876-Treiber im PH/EN-Modus. M1 EN 12 / PH 13, M2 14 / 21, M3 9 / 10,
M4 47 / 11. PH HIGH ist vorwärts.

```cpp
const int EN[4] = { 12, 14, 9, 47 }, PH[4] = { 13, 21, 10, 11 };
void motor(int i, int speed) {
  digitalWrite(PH[i], speed >= 0 ? HIGH : LOW);
  analogWrite(EN[i], min(abs(speed), 255));
}
void drive(int left, int right) { motor(0, left); motor(2, left); motor(1, right); motor(3, right); }
```

### Transistor oder MOSFET

Nur eine Richtung: das Tastverhältnis am Gate-Pin ist der Drive.

## Verhaltensweisen

Ein Linienfolger mit drei Sensoren:

```cpp
bool L = digitalRead(LINE_L) == LOW, C = digitalRead(LINE_C) == LOW, R = digitalRead(LINE_R) == LOW;
if (C && !L && !R) drive(150, 150);        // on the line
else if (L)        drive(40, 170);         // tape on the left: turn left
else if (R)        drive(170, 40);         // tape on the right: turn right
else               drive(-80, 80);         // lost: spin and look for it
```

Ein Hindernisvermeider fährt vorwärts und stoppt unter 20 bis 35 cm, setzt zurück
und dreht zur Seite mit mehr Platz (ein Sonar auf einem Servo kann zuerst auf 0
und 180 Grad schauen). Lies das Sonar alle 50 bis 100 ms und blockiere niemals
lange in `loop()`.

Bei vollem Drive fährt ein 2WD-Roboter 0,55 m/s, ein 4WD 0,61 m/s und der Panzer
0,36 m/s. Für einen Linienfolger auf einem 22 mm Klebeband halten 120 bis 170 von 255 ihn
auf der Linie.
