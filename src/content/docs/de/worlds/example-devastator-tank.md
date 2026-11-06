---
title: "Beispiel: Devastator-Panzer"
description: Der Devastator-Panzer von DFRobot auf einem Romeo BLE führt DFRobots eigenes Hindernisvermeidungs-Beispiel aus, mit einem URM37 auf einem Servo, in einer Arena mit Rampen und Hindernissen.
sidebar:
  order: 6
---

Der DFRobot Devastator-Panzer auf einem Romeo BLE führt DFRobots eigenes
Hindernisvermeidungs-Beispiel aus. Er fährt, bis der URM37 auf seinem Servo
weniger als 35 cm misst, schaut nach rechts und links, setzt zurück und dreht
sich zur Seite mit mehr Platz. Die World ist eine Arena mit quadratischen und
runden Hindernissen, einer Brücke, einem Hügel und einer Rampe, erstellt mit
dem Szenen-Kit, sodass du sie mit der Maus bearbeiten kannst.

**Öffnen:** [velxio.dev/example/dfrobot-devastator-tank-avoidance](https://velxio.dev/example/dfrobot-devastator-tank-avoidance)
und **Run** drücken.

![Der Devastator in seiner Arena](../../../../assets/docs/worlds/devastator-running.png)

## Teile

| Id                   | Teil                                                   |
| -------------------- | ------------------------------------------------------ |
| `dfrobot-romeo-ble`  | DFRobot Romeo BLE (zwei Motor Kanäle on board)        |
| `motorL`, `motorR`   | Getriebemotor mit Encoder, 45:1                        |
| `servo1`             | Servo, der das Sonar dreht                             |
| `urm37`              | DFRobot URM37 V5.0 Ultraschall, PWM-Modus              |

## Verdrahtung

| Von                       | Nach (Romeo BLE) |
| ------------------------- | -------------- |
| `motorL` M1 / M2          | M1+ / M1-      |
| `motorR` M1 / M2          | M2+ / M2-      |
| `servo1` PWM / V+ / GND   | D10 / 5V / GND |
| `urm37` ECHO              | D8             |
| `urm37` TRIG (COMP/TRIG)  | D9             |
| `urm37` VCC / GND         | 5V / GND       |

## Firmware

Der Sketch ist DFRobots Beispiel für den Devastator (`Avoidance_URM37.ino`, von
Gavin, 2015), mit den beiden enthaltenen Bibliotheken `DFMobile` und `URM37`
als Dateien des Projekts. Nur zwei Dinge wurden in der Kopie des Projekts
geändert: die Zeilenenden, und die Includes verwenden Anführungszeichen, weil
die Bibliotheken neben dem Sketch ausgeliefert werden. Die folgende Auflistung
kürzt DFRobots Kommentare.

```cpp
#include "DFMobile.h"
DFMobile Robot (4,5,7,6);   // left dir D4 / PWM D5, right dir D7 / PWM D6

#include<Servo.h>
Servo myservo;

#include "URM37.h"
ultrasonic URM37;
double distance;
int i=0;
int distanceBuffer[3];

void setup(){
  myservo.attach(10);
  Robot.Direction(LOW,HIGH);   // (left direction, right direction)
  Serial.begin (115200);
  URM37.Init(8,9);             // ECHO on D8, COMP/TRIG on D9
}

void loop(){
  myservo.write(90);           // look ahead
  Robot.Speed(80,80);          // forward
  Measurement();

  if(distance < 35){
    Robot.Speed (0,0);         // stop
    myservo.write(0);          // look right
    Measurement();
    delay(200);
    double degree_0 = distance;
    delay(50);
    myservo.write(180);        // look left
    Measurement();
    delay(200);
    double degree_180 = distance;
    delay(50);

    if(degree_0 > degree_180){
      Robot.Speed(-200,-200);  // back off
      delay(50);
      Robot.Speed(200,-200);   // turn right
      delay(200);
    }
    else{
      Robot.Speed(-200,-200);  // back off
      delay(50);
      Robot.Speed(-200,200);   // turn left
      delay(200);
    }
  }
  else{
    myservo.write(90);
    Robot.Speed (100,100);     // forward
  }
}

void Measurement(){
  distanceBuffer[i] = URM37.Distance();
  i++;
  if(i>2){
    i=0;
  }
  // the largest of the last three readings
  distance = distanceBuffer[0]>distanceBuffer[1] && distanceBuffer[0]>distanceBuffer[2]?distanceBuffer[0]:(distanceBuffer[1]>distanceBuffer[2]?distanceBuffer[1]:distanceBuffer[2]);
  Serial.print(distance);
  Serial.println (" cm");
  delay (100);
}
```

`Robot.Direction(LOW, HIGH)` macht "vorwärts" zu einem LOW-Richtungspegel auf
beiden Seiten, weil das echte Chassis seine Motoren gespiegelt montiert. Die
World gibt das mit **Reverse** auf beiden Seiten des Panzers an (`invertLeft`
und `invertRight`), sodass der Sketch genau DFRobots bleibt.

## Die World

Die Szene (in `world.html`, bearbeitbar mit **Edit**):

```json
{ "version": 1, "view": "3d", "floor": { "w": 3.0, "h": 2.4, "color": "#d8d2c4", "grid": true },
  "objects": [
    { "id": "wallN", "type": "wall", "x": 0, "y": 1.18, "rot": 0, "w": 3.0, "d": 0.04, "h": 0.15, "color": "#7f8c8d" },
    { "id": "wallS", "type": "wall", "x": 0, "y": -1.18, "rot": 0, "w": 3.0, "d": 0.04, "h": 0.15, "color": "#7f8c8d" },
    { "id": "wallE", "type": "wall", "x": 1.48, "y": 0, "rot": 90, "w": 2.32, "d": 0.04, "h": 0.15, "color": "#7f8c8d" },
    { "id": "wallW", "type": "wall", "x": -1.48, "y": 0, "rot": 90, "w": 2.32, "d": 0.04, "h": 0.15, "color": "#7f8c8d" },
    { "id": "box1", "type": "box", "x": 0.55, "y": 0.5, "rot": 15, "w": 0.25, "d": 0.25, "h": 0.2, "color": "#c0392b" },
    { "id": "box2", "type": "box", "x": -0.55, "y": -0.65, "rot": 0, "w": 0.3, "d": 0.18, "h": 0.15, "color": "#d68910" },
    { "id": "cyl1", "type": "cylinder", "x": 0.95, "y": -0.55, "r": 0.12, "h": 0.25, "color": "#2e86c1" },
    { "id": "cyl2", "type": "cylinder", "x": -0.35, "y": 0.75, "r": 0.09, "h": 0.2, "color": "#7d3c98" },
    { "id": "bridge1", "type": "ramp", "profile": "bridge", "x": -0.1, "y": -0.05, "rot": 0, "w": 0.9, "d": 0.4, "h": 0.07, "color": "#8d6e63" },
    { "id": "hill1", "type": "ramp", "profile": "hill", "x": 0.9, "y": 0.15, "rot": 0, "w": 0.6, "d": 0.6, "h": 0.06, "color": "#a1887f" },
    { "id": "ramp1", "type": "ramp", "profile": "wedge", "x": -0.9, "y": 0.45, "rot": -90, "w": 0.5, "d": 0.35, "h": 0.06, "color": "#bcaaa4" },
    { "id": "tank1", "type": "robot", "preset": "tank", "label": "Devastator", "x": -1.05, "y": -0.3, "rot": 0, "color": "#1f2326",
      "bind": { "left": ["motorL"], "right": ["motorR"], "invertLeft": true, "invertRight": true,
                "sonar": "urm37", "sonarServo": "servo1" } }
  ] }
```

- Der URM37 schaut dorthin, wohin der Servo zeigt: `sonarServo` dreht das
  Sonar mit dem Winkel des Servos (0 Grad rechts, 90 voraus, 180 links).
- Der Panzer klettert bis zu 3 cm hoch, sodass er über die Brücke, den Hügel
  und die Rampe fährt und vor den Kisten, den Zylindern und den Wänden
  anhält.
- Jede Lücke zwischen Hindernissen ist breiter als der 22 cm große Panzer,
  sodass er nie eingeschlossen wird.

![Dieselbe Arena in der 2D-Draufsicht](../../../../assets/docs/worlds/view-2d.png)

## Als Nächstes

- **Edit** drücken, eine Kiste in den Weg des Panzers schieben und beobachten,
  wie er scannt und abbiegt.
- `35` in `loop()` auf `20` ändern und sehen, wie viel näher er kommt, bevor
  er sich umschaut.
- Einen MPU6050 zum Schaltkreis hinzufügen, ihn im Editor als **IMU** an den
  Panzer binden und die Drehrate im Sketch auslesen.
