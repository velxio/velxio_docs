---
title: 电机与传感器
description: World 从电路中读取什么，向传感器写回什么，以及用各驱动板驱动机器人的固件。
sidebar:
  order: 3
---

World 从不运行你的代码，也从不直接接触引脚。它读取电路所驱动的内容，并写入传感器将会测量到的值，因此固件与运行在真实机器人上的代码完全相同。

## World 读取的内容

| 部件                                    | World 获取的值                                                |
| --------------------------------------- | ------------------------------------------------------------- |
| 直流电机、带编码器的减速电机            | `drive`，从 -1 到 1：电机上的占空比，符号表示方向             |
| 舵机                                    | `angle`，0 到 180 度                                          |

电机的 drive 通过驱动它的任何元件来读取：L293D、晶体管或 MOSFET、板载驱动器（Romeo 系列板），或直接连接到电机的引脚。机器人一侧跟随其电机的平均 drive，带有少量惯性（约 80 ms）和一个小死区，就像真实的变速箱一样。

## World 写入的内容

| 部件                                   | 值                                                         | 固件如何读取                                                 |
| -------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------- |
| DFRobot Gravity 循迹传感器 (SEN0017)   | 反射率 0 到 1，`black`                                     | 在黑色胶带上 `digitalRead(pin) == LOW`                        |
| DFRobot URM09，Trig 模式 (SEN0388)     | 距离，2 到 500 cm                                          | 单引脚：10 us 触发，然后 `pulseIn(pin, HIGH) / 58.0`          |
| DFRobot URM37 V5.0，PWM 模式           | 距离，2 到 500 cm                                          | 将 COMP/TRIG 拉低，然后 `pulseIn(ECHO, LOW) / 50`             |
| HC-SR04                                | 距离，2 到 400 cm                                          | TRIG 高电平 10 us，然后 `pulseIn(ECHO, HIGH) / 58.0`          |
| MPU6050                                | 加速度（g），旋转（度每秒）                                | I2C，与真实芯片相同                                           |

距离传感器从机器人保险杠处直视前方，每侧有一个约 12 度的窄锥角。循迹传感器采样其正下方的垫子（或坡道）。

## 驱动机器人：固件侧

drive 的符号决定方向。如果某一侧在 World 中反向运行，要么修正固件，要么在[场景编辑器](/docs/zh-cn/worlds/scene-editor/)中为该侧勾选 **Reverse**。

### L293D（任意板）

通道 1：EN1 (PWM) 配合 IN1 和 IN2，输出 OUT1 和 OUT2。通道 2：EN2 配合 IN3 和 IN4。IN1 高电平且 IN2 低电平为正 drive，EN1 上的占空比设定速度。

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

### DFRobot Romeo BLE 和 Romeo BLE mini

M1：方向 D4，PWM D5。M2：方向 D7，PWM D6。将每个电机连接到板的 M1+/M1- 或 M2+/M2- 端子。

```cpp
void side(int dirPin, int pwmPin, int speed) {
  digitalWrite(dirPin, speed >= 0 ? HIGH : LOW);
  analogWrite(pwmPin, min(abs(speed), 255));
}
void drive(int left, int right) { side(4, 5, left); side(7, 6, right); }   // M1 left, M2 right
```

DFRobot 的 DFMobile 库（Devastator 示例所使用）在前进时将方向引脚驱动为低电平，调用 `Robot.Direction(LOW, HIGH)`，因此运行该库的机器人需要在两侧都勾选 **Reverse**。

### DFRobot Romeo ESP32-S3

四个 DRV8876 驱动器，工作在 PH/EN 模式。M1 EN 12 / PH 13，M2 14 / 21，M3 9 / 10，M4 47 / 11。PH 高电平为前进。

```cpp
const int EN[4] = { 12, 14, 9, 47 }, PH[4] = { 13, 21, 10, 11 };
void motor(int i, int speed) {
  digitalWrite(PH[i], speed >= 0 ? HIGH : LOW);
  analogWrite(EN[i], min(abs(speed), 255));
}
void drive(int left, int right) { motor(0, left); motor(2, left); motor(1, right); motor(3, right); }
```

### 晶体管或 MOSFET

仅单向：栅极引脚上的占空比即为 drive。

## 行为

三传感器循迹：

```cpp
bool L = digitalRead(LINE_L) == LOW, C = digitalRead(LINE_C) == LOW, R = digitalRead(LINE_R) == LOW;
if (C && !L && !R) drive(150, 150);        // on the line
else if (L)        drive(40, 170);         // tape on the left: turn left
else if (R)        drive(170, 40);         // tape on the right: turn right
else               drive(-80, 80);         // lost: spin and look for it
```

避障机器人向前行驶，在 20 到 35 cm 以内时停下、后退，并转向空间更大的一侧（安装在舵机上的声呐可以先查看 0 度和 180 度）。每 50 到 100 ms 读取一次声呐，绝不要在 `loop()` 中长时间阻塞。

全速驱动时，2WD 机器人速度为 0.55 m/s，4WD 为 0.61 m/s，坦克为 0.36 m/s。对于在 22 mm 胶带上运行的循迹机器人，255 中的 120 到 170 能让它保持在线上。
