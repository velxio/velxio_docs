---
title: "示例：Devastator 坦克"
description: DFRobot 的 Devastator 坦克搭载 Romeo BLE，运行 DFRobot 自带的避障示例，舵机上装有 URM37，场地内有坡道和障碍物。
sidebar:
  order: 6
---

DFRobot Devastator 坦克搭载 Romeo BLE，运行 DFRobot 自带的避障示例。它向前行驶，直到舵机上的 URM37 读数小于 35 cm，然后左右张望，后退，并转向空间更大的一侧。World 是一个带有方形和圆形障碍物、一座桥、一座小山和一段坡道的场地，使用场景套件制作，因此你可以用鼠标编辑它。

**打开它：** [velxio.dev/example/dfrobot-devastator-tank-avoidance](https://velxio.dev/example/dfrobot-devastator-tank-avoidance)
然后按 **Run**（运行）。

![Devastator 在其场地中](../../../../assets/docs/worlds/devastator-running.png)

## 零件

| Id                   | 零件                                                   |
| -------------------- | ------------------------------------------------------ |
| `dfrobot-romeo-ble`  | DFRobot Romeo BLE（板载两路电机通道）        |
| `motorL`, `motorR`   | 带编码器的齿轮电机，45:1                          |
| `servo1`             | 转动声呐的舵机                             |
| `urm37`              | DFRobot URM37 V5.0 超声波，PWM 模式                |

## 接线

| 从                      | 到（Romeo BLE） |
| ------------------------- | -------------- |
| `motorL` M1 / M2          | M1+ / M1-      |
| `motorR` M1 / M2          | M2+ / M2-      |
| `servo1` PWM / V+ / GND   | D10 / 5V / GND |
| `urm37` ECHO              | D8             |
| `urm37` TRIG (COMP/TRIG)  | D9             |
| `urm37` VCC / GND         | 5V / GND       |

## 固件

该 sketch 是 DFRobot 为 Devastator 提供的示例（`Avoidance_URM37.ino`，作者
Gavin，2015），它包含的两个库 `DFMobile` 和 `URM37` 作为项目的文件。项目副本中只改了两处：行尾符，以及 include 使用引号，因为库文件与 sketch 放在一起。下面的清单缩短了 DFRobot 的注释。

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

`Robot.Direction(LOW, HIGH)` 使两侧的“前进”方向电平都为 LOW，因为真实底盘安装电机时是镜像的。World 通过坦克两侧的 **Reverse**（`invertLeft` 和 `invertRight`）来体现这一点，因此 sketch 与 DFRobot 的版本完全一致。

## World

场景（位于 `world.html`，可用 **Edit**（编辑）编辑）：

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

- URM37 朝向舵机所指的方向：`sonarServo` 用舵机的角度转动声呐（0 度向右，90 度向前，180 度向左）。
- 坦克可爬升最高 3 cm，因此它能驶过桥、小山和坡道，并会在箱子、圆柱和墙壁前停下。
- 障碍物之间的每个间隙都比 22 cm 的坦克宽，因此它永远不会被困住。

![同一场地的 2D 俯视图](../../../../assets/docs/worlds/view-2d.png)

## 接下来试试

- 按 **Edit**（编辑），把一个箱子移到坦克的路径上，观察它扫描并转向。
- 将 `loop()` 中的 `35` 改为 `20`，看看它在环顾四周之前能靠近多少。
- 在电路上添加一个 MPU6050，在编辑器中将其绑定为坦克的 **IMU**，并在 sketch 中读取转向速率。
