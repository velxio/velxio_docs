---
title: "Пример: танк Devastator"
description: Танк Devastator от DFRobot на Romeo BLE запускает собственный пример DFRobot по объезду препятствий с URM37 на сервоприводе, на арене с пандусами и препятствиями.
sidebar:
  order: 6
---

Танк DFRobot Devastator на Romeo BLE запускает собственный пример DFRobot по
объезду препятствий. Он едет, пока URM37 на сервоприводе не покажет меньше
35 см, смотрит направо и налево, отъезжает и поворачивает в сторону, где
больше места. Мир — это арена с квадратными и круглыми препятствиями, мостом,
холмом и пандусом, созданная с помощью набора сцены, так что вы можете
редактировать её мышью.

**Открыть:** [velxio.dev/example/dfrobot-devastator-tank-avoidance](https://velxio.dev/example/dfrobot-devastator-tank-avoidance)
и нажмите **Run** (Запуск).

![Devastator на своей арене](../../../../assets/docs/worlds/devastator-running.png)

## Детали

| Id                   | Деталь                                                 |
| -------------------- | ------------------------------------------------------ |
| `dfrobot-romeo-ble`  | DFRobot Romeo BLE (два моторных канала на плате)       |
| `motorL`, `motorR`   | Редукторный мотор с энкодером, 45:1                    |
| `servo1`             | Сервопривод, поворачивающий сонар                      |
| `urm37`              | DFRobot URM37 V5.0 ультразвуковой, режим PWM           |

## Подключение

| От                        | К (Romeo BLE)  |
| ------------------------- | -------------- |
| `motorL` M1 / M2          | M1+ / M1-      |
| `motorR` M1 / M2          | M2+ / M2-      |
| `servo1` PWM / V+ / GND   | D10 / 5V / GND |
| `urm37` ECHO              | D8             |
| `urm37` TRIG (COMP/TRIG)  | D9             |
| `urm37` VCC / GND         | 5V / GND       |

## Прошивка

Скетч — это пример DFRobot для Devastator (`Avoidance_URM37.ino`, автор
Gavin, 2015) с двумя включёнными библиотеками, `DFMobile` и `URM37`, в виде
файлов проекта. В копии проекта изменились только две вещи: окончания строк
и то, что директивы include используют кавычки, поскольку библиотеки
поставляются рядом со скетчем. В листинге ниже комментарии DFRobot
сокращены.

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

`Robot.Direction(LOW, HIGH)` делает "вперёд" низким уровнем направления с
обеих сторон, потому что реальное шасси устанавливает моторы зеркально. Мир
учитывает это с помощью **Reverse** (Реверс) с обеих сторон танка
(`invertLeft` и `invertRight`), так что скетч остаётся в точности как у
DFRobot.

## Мир

Сцена (в `world.html`, редактируется кнопкой **Edit**):

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

- URM37 смотрит туда, куда его направляет сервопривод: `sonarServo`
  поворачивает сонар на угол сервопривода (0 градусов направо, 90 вперёд,
  180 налево).
- Танк преодолевает подъёмы до 3 см, поэтому проезжает по мосту, холму и
  пандусу и останавливается перед коробками, цилиндрами и стенами.
- Каждый промежуток между препятствиями шире 22-сантиметрового танка,
  поэтому он никогда не застревает.

![Та же арена в 2D виде сверху](../../../../assets/docs/worlds/view-2d.png)

## Что попробовать дальше

- Нажмите **Edit**, переместите коробку на путь танка и посмотрите, как он
  сканирует и поворачивает.
- Измените `35` в `loop()` на `20` и посмотрите, насколько ближе он
  подъезжает, прежде чем начать осматриваться.
- Добавьте MPU6050 в схему, привяжите его к танку как **IMU** в редакторе и
  считывайте скорость поворота в скетче.
