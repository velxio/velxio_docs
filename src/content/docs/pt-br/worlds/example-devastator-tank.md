---
title: "Exemplo: tanque Devastator"
description: O tanque Devastator da DFRobot sobre um Romeo BLE executa o exemplo de desvio de obstáculos da própria DFRobot, com um URM37 em um servo, em uma arena com rampas e obstáculos.
sidebar:
  order: 6
---

O tanque Devastator da DFRobot sobre um Romeo BLE executa o exemplo de
desvio de obstáculos da própria DFRobot. Ele avança até que o URM37 em seu
servo leia menos de 35 cm, olha para a direita e para a esquerda, recua e vira
para o lado com mais espaço. O World é uma arena com obstáculos quadrados e
redondos, uma ponte, uma colina e uma rampa, feita com o kit de cena, para que
você possa editá-la com o mouse.

**Abra:** [velxio.dev/example/dfrobot-devastator-tank-avoidance](https://velxio.dev/example/dfrobot-devastator-tank-avoidance)
e pressione **Run**.

![O Devastator em sua arena](../../../../assets/docs/worlds/devastator-running.png)

## Peças

| Id                   | Peça                                                   |
| -------------------- | ------------------------------------------------------ |
| `dfrobot-romeo-ble`  | DFRobot Romeo BLE (dois canais de motor na placa)      |
| `motorL`, `motorR`   | Motor com engrenagem e encoder, 45:1                   |
| `servo1`             | Servo que gira o sonar                                 |
| `urm37`              | DFRobot URM37 V5.0 ultrassônico, modo PWM              |

## Ligação

| De                        | Para (Romeo BLE) |
| ------------------------- | ---------------- |
| `motorL` M1 / M2          | M1+ / M1-        |
| `motorR` M1 / M2          | M2+ / M2-        |
| `servo1` PWM / V+ / GND   | D10 / 5V / GND   |
| `urm37` ECHO              | D8               |
| `urm37` TRIG (COMP/TRIG)  | D9               |
| `urm37` VCC / GND         | 5V / GND         |

## Firmware

O sketch é o exemplo da DFRobot para o Devastator (`Avoidance_URM37.ino`, de
Gavin, 2015), com as duas bibliotecas que ele inclui, `DFMobile` e `URM37`,
como arquivos do projeto. Apenas duas coisas mudaram na cópia do projeto: as
quebras de linha, e os includes usam aspas porque as bibliotecas vêm junto ao
sketch. A listagem abaixo encurta os comentários da DFRobot.

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

`Robot.Direction(LOW, HIGH)` faz "para frente" ser um nível de direção LOW em
ambos os lados, porque o chassi real monta seus motores espelhados. O World
indica isso com **Reverse** em ambos os lados do tanque (`invertLeft` e
`invertRight`), então o sketch permanece exatamente o da DFRobot.

## O World

A cena (em `world.html`, editável com **Edit**):

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

- O URM37 olha para onde o servo o aponta: `sonarServo` gira o sonar com o
  ângulo do servo (0 graus à direita, 90 à frente, 180 à esquerda).
- O tanque sobe até 3 cm, então passa por cima da ponte, da colina e da
  rampa, e para contra as caixas, os cilindros e as paredes.
- Todo vão entre obstáculos é mais largo que o tanque de 22 cm, então ele
  nunca fica preso.

![A mesma arena na vista superior 2D](../../../../assets/docs/worlds/view-2d.png)

## Tente a seguir

- Pressione **Edit**, mova uma caixa para o caminho do tanque e observe-o
  escanear e virar.
- Mude `35` em `loop()` para `20` e veja o quão mais perto ele chega antes de
  olhar em volta.
- Adicione um MPU6050 ao circuito, vincule-o ao tanque como sua **IMU** no
  editor, e leia a taxa de giro no sketch.
