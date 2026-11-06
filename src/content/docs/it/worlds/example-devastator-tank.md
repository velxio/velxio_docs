---
title: "Esempio: carro armato Devastator"
description: Il carro armato Devastator di DFRobot su un Romeo BLE esegue l'esempio di evitamento ostacoli di DFRobot, con un URM37 su un servo, in un'arena con rampe e ostacoli.
sidebar:
  order: 6
---

Il carro armato Devastator di DFRobot su un Romeo BLE esegue l'esempio di
evitamento ostacoli di DFRobot. Avanza finché l'URM37 sul suo servo legge meno
di 35 cm, guarda a destra e a sinistra, indietreggia e gira verso il lato con
più spazio. Il World è un'arena con ostacoli quadrati e rotondi, un ponte, una
collina e una rampa, realizzata con il kit di scena, così puoi modificarla con
il mouse.

**Per aprirlo:** [velxio.dev/example/dfrobot-devastator-tank-avoidance](https://velxio.dev/example/dfrobot-devastator-tank-avoidance)
e premi **Run**.

![Il Devastator nella sua arena](../../../../assets/docs/worlds/devastator-running.png)

## Componenti

| Id                   | Componente                                             |
| -------------------- | ------------------------------------------------------ |
| `dfrobot-romeo-ble`  | DFRobot Romeo BLE (due canali motore a bordo)          |
| `motorL`, `motorR`   | Motore con riduttore e encoder, 45:1                   |
| `servo1`             | Servo che orienta il sonar                             |
| `urm37`              | DFRobot URM37 V5.0 a ultrasuoni, modalità PWM          |

## Cablaggio

| Da                        | A (Romeo BLE)  |
| ------------------------- | -------------- |
| `motorL` M1 / M2          | M1+ / M1-      |
| `motorR` M1 / M2          | M2+ / M2-      |
| `servo1` PWM / V+ / GND   | D10 / 5V / GND |
| `urm37` ECHO              | D8             |
| `urm37` TRIG (COMP/TRIG)  | D9             |
| `urm37` VCC / GND         | 5V / GND       |

## Firmware

Lo sketch è l'esempio di DFRobot per il Devastator (`Avoidance_URM37.ino`, di
Gavin, 2015), con le due librerie che include, `DFMobile` e `URM37`, come
file del progetto. Nella copia del progetto sono cambiate solo due cose: i
caratteri di fine riga e le direttive include che usano le virgolette perché
le librerie sono fornite accanto allo sketch. Il listato seguente abbrevia i
commenti di DFRobot.

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

`Robot.Direction(LOW, HIGH)` rende "avanti" un livello di direzione LOW su
entrambi i lati, perché il telaio reale monta i motori in modo speculare. Il
World lo dichiara con **Reverse** su entrambi i lati del carro armato
(`invertLeft` e `invertRight`), così lo sketch resta esattamente quello di
DFRobot.

## Il World

La scena (in `world.html`, modificabile con **Edit**):

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

- L'URM37 guarda dove lo punta il servo: `sonarServo` orienta il sonar
  con l'angolo del servo (0 gradi a destra, 90 avanti, 180 a sinistra).
- Il carro armato sale fino a 3 cm, quindi supera il ponte, la collina e la
  rampa, e si ferma contro le scatole, i cilindri e le pareti.
- Ogni spazio tra gli ostacoli è più largo del carro armato da 22 cm, così non
  resta mai intrappolato.

![La stessa arena nella vista dall'alto 2D](../../../../assets/docs/worlds/view-2d.png)

## Prova adesso

- Premi **Edit**, sposta una scatola sul percorso del carro armato e osservalo
  scansionare e girare.
- Cambia `35` in `loop()` con `20` e vedi quanto più vicino arriva prima di
  guardarsi intorno.
- Aggiungi un MPU6050 al circuito, collegalo al carro armato come sua **IMU**
  nell'editor e leggi la velocità di rotazione nello sketch.
