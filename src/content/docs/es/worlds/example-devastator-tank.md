---
title: "Ejemplo: Tanque Devastator"
description: El tanque Devastator de DFRobot sobre un Romeo BLE ejecuta el ejemplo de evitación de obstáculos del propio DFRobot, con un URM37 sobre un servo, en una arena con rampas y obstáculos.
sidebar:
  order: 6
---

El tanque Devastator de DFRobot sobre un Romeo BLE ejecuta el ejemplo de
evitación de obstáculos del propio DFRobot. Avanza hasta que el URM37 de su
servo lee menos de 35 cm, mira a la derecha y a la izquierda, retrocede y gira
hacia el lado con más espacio. El World es una arena con obstáculos cuadrados y
redondos, un puente, una colina y una rampa, hecha con el kit de escenas, para
que puedas editarla con el ratón.

**Abrirlo:** [velxio.dev/example/dfrobot-devastator-tank-avoidance](https://velxio.dev/example/dfrobot-devastator-tank-avoidance)
y pulsa **Run**.

![El Devastator en su arena](../../../../assets/docs/worlds/devastator-running.png)

## Piezas

| Id                   | Pieza                                                  |
| -------------------- | ------------------------------------------------------ |
| `dfrobot-romeo-ble`  | DFRobot Romeo BLE (dos canales de motor en placa)      |
| `motorL`, `motorR`   | Motorreductor con encoder, 45:1                        |
| `servo1`             | Servo que orienta el sonar                             |
| `urm37`              | DFRobot URM37 V5.0 ultrasónico, modo PWM               |

## Cableado

| Desde                     | Hacia (Romeo BLE) |
| ------------------------- | ----------------- |
| `motorL` M1 / M2          | M1+ / M1-         |
| `motorR` M1 / M2          | M2+ / M2-         |
| `servo1` PWM / V+ / GND   | D10 / 5V / GND    |
| `urm37` ECHO              | D8                |
| `urm37` TRIG (COMP/TRIG)  | D9                |
| `urm37` VCC / GND         | 5V / GND          |

## Firmware

El sketch es el ejemplo de DFRobot para el Devastator (`Avoidance_URM37.ino`, de
Gavin, 2015), con las dos librerías que incluye, `DFMobile` y `URM37`, como
archivos del proyecto. Solo han cambiado dos cosas en la copia del proyecto: los
finales de línea, y los includes usan comillas porque las librerías se
distribuyen junto al sketch. El listado siguiente acorta los comentarios de
DFRobot.

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

`Robot.Direction(LOW, HIGH)` hace que "avanzar" sea un nivel de dirección LOW en
ambos lados, porque el chasis real monta sus motores en espejo. El World lo
indica con **Reverse** en ambos lados del tanque (`invertLeft` e `invertRight`),
así el sketch sigue siendo exactamente el de DFRobot.

## El World

La escena (en `world.html`, editable con **Edit**):

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

- El URM37 mira hacia donde apunta el servo: `sonarServo` orienta el sonar
  con el ángulo del servo (0 grados a la derecha, 90 al frente, 180 a la
  izquierda).
- El tanque sube hasta 3 cm, así que pasa por encima del puente, la colina y la
  rampa, y se detiene contra las cajas, los cilindros y las paredes.
- Cada hueco entre obstáculos es más ancho que el tanque de 22 cm, así que
  nunca queda atrapado.

![La misma arena en la vista superior 2D](../../../../assets/docs/worlds/view-2d.png)

## Prueba a continuación

- Pulsa **Edit**, mueve una caja a la trayectoria del tanque y observa cómo
  escanea y gira.
- Cambia `35` en `loop()` por `20` y comprueba cuánto más se acerca antes de
  mirar alrededor.
- Añade un MPU6050 al circuito, vincúlalo al tanque como su **IMU** en el
  editor, y lee la velocidad de giro en el sketch.
