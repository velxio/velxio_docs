---
title: 3D-Welten
description: Stelle deine Schaltung in eine 3D- oder 2D-Szene. Die Firmware des Boards steuert den Roboter, und die Sensoren des Roboters lesen die Szene zurück.
sidebar:
  order: 1
---

Eine **World** (Welt) stellt deine Schaltung in eine physische Szene. Die Firmware läuft auf dem emulierten Board genau so, wie sie auf dem echten laufen würde: Die Motoren, die sie ansteuert, bewegen einen Roboter, die Servos, die sie setzt, drehen einen Arm oder einen Sensor, und die Linien-, Abstands- und Bewegungssensoren lesen, was sich unter und vor dem Roboter befindet. Derselbe Code läuft dann auf der echten Hardware.

![Der Romeo ESP32-S3 Line Follower in seiner World, neben der laufenden Schaltung](../../../../assets/docs/worlds/romeo-running.png)

## Die World öffnen

Jedes Projekt mit einem Board hat eine **3D**-Schaltfläche in der Kopfzeile der Arbeitsfläche, neben der Board-Auswahl:

![Die 3D-Schaltfläche neben der Board-Auswahl](../../../../assets/docs/worlds/3d-button.png)

Beim ersten Mal öffnet sie eine Einführung mit drei Einstiegsmöglichkeiten:

![Die Einführung in die 3D-World](../../../../assets/docs/worlds/intro.png)

- **Start from a robot** (Mit einem Roboter beginnen): Öffne ein vollständiges Roboterprojekt (Board, verdrahtete Motoren und Sensoren, Firmware und World) und drücke **Run**. Siehe den [Romeo ESP32-S3 Line Follower](/docs/de/worlds/example-romeo-line-follower/) und den [Devastator-Panzer](/docs/de/worlds/example-devastator-tank/).
- **Create a world for this circuit** (Eine World für diese Schaltung erstellen): Velxio baut aus dem, was auf deiner Arbeitsfläche liegt, eine Startszene. Motoren werden zu einem Roboter (zwei oder vier Räder), Liniensensoren bekommen eine aufgeklebte Strecke unter sich, ein Abstandssensor bekommt Hindernisse vor sich, und reine Servos werden zu einem Roboterarm auf einem kleinen Tisch.
- **Copy AI prompt** (KI-Prompt kopieren): Kopiert eine Zusammenfassung mit deinen Boards, Bauteilen, der Verdrahtung und der Firmware für ChatGPT, Claude oder Gemini, damit eine KI jede World schreiben kann, die du beschreibst. Siehe [Write your own World](/docs/de/worlds/write-your-own/).

Sobald das Projekt eine World hat, wechselt die 3D-Schaltfläche zwischen der World und deinem Code.

## Run drücken

Wenn die Simulation startet, zeigt der Editorbereich die World, und die Arbeitsfläche bleibt daneben, sodass du sehen kannst, wie sich die Motoren in der Schaltung drehen, während der Roboter fährt. Die Schleife schließt sich etwa 125 Mal pro Sekunde:

1. Die Firmware setzt Pins: eine Richtung und einen PWM-Duty-Cycle für jeden Motor, einen Impuls für jedes Servo.
2. Velxio liest die Ansteuerung jedes Motors (über welchen Treiber die Schaltung auch immer verfügt) und den Winkel jedes Servos und sendet sie an die World.
3. Die World bewegt den Roboter und misst die Szene: die Strecke unter jedem Liniensensor, das nächste Hindernis vor jedem Abstandssensor, die Beschleunigung und Drehrate des Roboters für ein IMU.
4. Velxio schreibt diese Messwerte in die Sensor-Bauteile, und die Firmware liest sie bei ihrem nächsten `digitalRead()`, `pulseIn()` oder I2C-Transfer.

Die World läuft auf der **simulierten Uhr** des Boards, nicht auf der Echtzeit. Wenn dein Computer die Simulation mit halber Geschwindigkeit ausführt, bewegt sich der Roboter ebenfalls mit halber Geschwindigkeit, und es stimmt weiterhin mit dem `millis()` der Firmware überein.

## Die World-Leiste

| Steuerelement       | Was es bewirkt                                                                                            |
| ------------------- | --------------------------------------------------------------------------------------------------------- |
| **World / HTML**    | Zeigt die Szene oder den dahinterliegenden `world.html`-Quelltext.                                        |
| **Guide**           | Eine kurze Erklärung der World, über der Szene.                                                           |
| **Copy AI prompt**  | Kopiert die Zusammenfassung für einen externen KI-Chat (siehe [Write your own World](/docs/de/worlds/write-your-own/)). |
| **Reload**          | Startet die World aus ihrer Datei neu.                                                                    |
| **Full screen**     | Zeigt nur die World. Drücke Esc, um zurückzukehren.                                                        |

Worlds, die mit Velxios Szenen-Kit erstellt wurden, fügen ihre eigene Werkzeugleiste innerhalb der Szene hinzu: **Edit**, **Add**, **3D / 2D**, **Camera** (Orbit, dem Roboter folgen, von oben) und **Reset** (die Roboter an ihren Startpunkt zurücksetzen). Siehe [Build a scene](/docs/de/worlds/scene-editor/).

## 3D oder 2D

Die 3D-Ansicht benötigt WebGL. Die **2D**-Draufsicht zeichnet dieselbe Szene und führt dieselbe Physik ohne Grafikkarte aus, sodass sie auf jedem Schulcomputer funktioniert, und sie ist der Rückfall, wenn 3D nicht verfügbar ist.

![Die Devastator-Arena in der 2D-Draufsicht](../../../../assets/docs/worlds/view-2d.png)

## Womit eine World funktioniert

- **Liest**: DC-Motoren und Getriebemotoren (hinter einem L293D, einem Transistor oder MOSFET, einem integrierten Treiber des Boards oder direkt an einem Pin) und Servos.
- **Speist**: den DFRobot Gravity Line Tracker, die Ultraschallsensoren URM09 und URM37, den HC-SR04 und das MPU6050 IMU.

Jedes andere Bauteil (LEDs, Displays, Summer) funktioniert auf der Arbeitsfläche weiter. Details und Firmware-Rezepte: [Motors and sensors](/docs/de/worlds/motors-and-sensors/).

## Es ist eine Datei

Eine World ist eine einzige Datei, `world.html`, in der Dateigruppe des Boards neben dem Sketch. Sie wird mit dem Projekt gespeichert, geteilt und exportiert und gelangt nie auf das Board: Sie wird nicht kompiliert, nicht in den Flash geschrieben und nicht auf die microSD-Karte kopiert. Lösche die Datei, und das Projekt hat keine World.
