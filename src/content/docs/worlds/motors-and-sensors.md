---
title: Motors and sensors
description: What a World reads from the circuit, what it writes back into the sensors, and firmware that drives a robot with each driver.
sidebar:
  order: 3
---

The World never runs your code and never touches a pin directly. It reads
what the circuit drives and writes what the sensors would measure, so the
firmware is the same code that runs the real robot.

## What the World reads

| Part                                    | Value the World gets                                          |
| --------------------------------------- | ------------------------------------------------------------- |
| DC motor, gear motor with encoder       | `drive`, from -1 to 1: the duty on the motor, sign = direction |
| Servo                                   | `angle`, 0 to 180 degrees                                     |

A motor's drive is read through whatever drives it: an L293D, a transistor or
MOSFET, a board's onboard driver (the Romeo boards), or a pin straight to the
motor. A robot side follows the average drive of its motors, with a little
inertia (about 80 ms) and a small deadband, like a real gearbox.

## What the World writes

| Part                                   | Values                                                     | How the firmware reads it                                     |
| -------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------- |
| DFRobot Gravity line tracker (SEN0017) | reflectance 0 to 1, `black`                                | `digitalRead(pin) == LOW` over the black tape                 |
| DFRobot URM09, Trig mode (SEN0388)     | distance, 2 to 500 cm                                      | one pin: a 10 us trigger, then `pulseIn(pin, HIGH) / 58.0`    |
| DFRobot URM37 V5.0, PWM mode           | distance, 2 to 500 cm                                      | pull COMP/TRIG low, then `pulseIn(ECHO, LOW) / 50`            |
| HC-SR04                                | distance, 2 to 400 cm                                      | TRIG high 10 us, then `pulseIn(ECHO, HIGH) / 58.0`            |
| MPU6050                                | acceleration in g, rotation in degrees per second          | I2C, as on the real chip                                       |

Distance sensors look straight ahead from the robot's bumper, with a narrow
cone of about 12 degrees each side. Line sensors sample the mat (or the ramp)
right under them.

## Drive a robot: the firmware side

The sign of the drive decides the direction. If a side runs backwards in the
World, either fix the firmware or tick **Reverse** for that side in the
[scene editor](/docs/worlds/scene-editor/).

### L293D (any board)

Channel 1: EN1 (PWM) with IN1 and IN2, outputs OUT1 and OUT2. Channel 2: EN2
with IN3 and IN4. IN1 HIGH and IN2 LOW is a positive drive, and the duty on
EN1 sets the speed.

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

### DFRobot Romeo BLE and Romeo BLE mini

M1: direction D4, PWM D5. M2: direction D7, PWM D6. Wire each motor to the
board's M1+/M1- or M2+/M2- terminals.

```cpp
void side(int dirPin, int pwmPin, int speed) {
  digitalWrite(dirPin, speed >= 0 ? HIGH : LOW);
  analogWrite(pwmPin, min(abs(speed), 255));
}
void drive(int left, int right) { side(4, 5, left); side(7, 6, right); }   // M1 left, M2 right
```

DFRobot's DFMobile library (used by the Devastator samples) drives the
direction pin LOW for forward with `Robot.Direction(LOW, HIGH)`, so a robot
running it needs **Reverse** on both sides.

### DFRobot Romeo ESP32-S3

Four DRV8876 drivers in PH/EN mode. M1 EN 12 / PH 13, M2 14 / 21, M3 9 / 10,
M4 47 / 11. PH HIGH is forward.

```cpp
const int EN[4] = { 12, 14, 9, 47 }, PH[4] = { 13, 21, 10, 11 };
void motor(int i, int speed) {
  digitalWrite(PH[i], speed >= 0 ? HIGH : LOW);
  analogWrite(EN[i], min(abs(speed), 255));
}
void drive(int left, int right) { motor(0, left); motor(2, left); motor(1, right); motor(3, right); }
```

### Transistor or MOSFET

One direction only: the duty on the gate pin is the drive.

## Behaviours

A three-sensor line follower:

```cpp
bool L = digitalRead(LINE_L) == LOW, C = digitalRead(LINE_C) == LOW, R = digitalRead(LINE_R) == LOW;
if (C && !L && !R) drive(150, 150);        // on the line
else if (L)        drive(40, 170);         // tape on the left: turn left
else if (R)        drive(170, 40);         // tape on the right: turn right
else               drive(-80, 80);         // lost: spin and look for it
```

An obstacle avoider drives forward, and under 20 to 35 cm it stops, backs off,
and turns toward the side with more room (a sonar on a servo can look at 0
and 180 degrees first). Read the sonar every 50 to 100 ms and never block for
long in `loop()`.

At full drive a 2WD robot does 0.55 m/s, a 4WD 0.61 m/s and the tank
0.36 m/s. For a line follower on a 22 mm tape, 120 to 170 out of 255 keeps it
on the line.
