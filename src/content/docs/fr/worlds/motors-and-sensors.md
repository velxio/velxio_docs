---
title: Moteurs et capteurs
description: Ce qu'un World lit depuis le circuit, ce qu'il réécrit dans les capteurs, et le firmware qui pilote un robot avec chaque driver.
sidebar:
  order: 3
---

Le World n'exécute jamais votre code et ne touche jamais directement à une broche. Il lit
ce que le circuit pilote et écrit ce que les capteurs mesureraient, ainsi le
firmware est le même code que celui qui tourne sur le vrai robot.

## Ce que le World lit

| Composant                               | Valeur que le World obtient                                   |
| --------------------------------------- | ------------------------------------------------------------- |
| Moteur DC, moteur à engrenages avec encodeur | `drive`, de -1 à 1 : le rapport cyclique sur le moteur, le signe = la direction |
| Servo                                   | `angle`, de 0 à 180 degrés                                    |

Le drive d'un moteur est lu à travers ce qui le pilote : un L293D, un transistor ou
MOSFET, le driver embarqué d'une carte (les cartes Romeo), ou une broche directement vers le
moteur. Un côté du robot suit le drive moyen de ses moteurs, avec un peu
d'inertie (environ 80 ms) et une petite zone morte, comme un vrai réducteur.

## Ce que le World écrit

| Composant                              | Valeurs                                                    | Comment le firmware le lit                                    |
| -------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------- |
| DFRobot Gravity line tracker (SEN0017) | réflectance de 0 à 1, `black`                              | `digitalRead(pin) == LOW` sur le ruban noir                   |
| DFRobot URM09, mode Trig (SEN0388)     | distance, de 2 à 500 cm                                    | une broche : un trigger de 10 us, puis `pulseIn(pin, HIGH) / 58.0` |
| DFRobot URM37 V5.0, mode PWM           | distance, de 2 à 500 cm                                    | tirer COMP/TRIG à l'état bas, puis `pulseIn(ECHO, LOW) / 50`  |
| HC-SR04                                | distance, de 2 à 400 cm                                    | TRIG haut 10 us, puis `pulseIn(ECHO, HIGH) / 58.0`            |
| MPU6050                                | accélération en g, rotation en degrés par seconde          | I2C, comme sur la vraie puce                                  |

Les capteurs de distance regardent droit devant eux depuis le pare-chocs du robot, avec un cône
étroit d'environ 12 degrés de chaque côté. Les capteurs de ligne échantillonnent le tapis (ou la rampe)
juste sous eux.

## Piloter un robot : le côté firmware

Le signe du drive décide de la direction. Si un côté tourne à l'envers dans le
World, corrigez le firmware ou cochez **Reverse** pour ce côté dans
l'[éditeur de scène](/docs/fr/worlds/scene-editor/).

### L293D (n'importe quelle carte)

Canal 1 : EN1 (PWM) avec IN1 et IN2, sorties OUT1 et OUT2. Canal 2 : EN2
avec IN3 et IN4. IN1 HIGH et IN2 LOW est un drive positif, et le rapport cyclique sur
EN1 fixe la vitesse.

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

### DFRobot Romeo BLE et Romeo BLE mini

M1 : direction D4, PWM D5. M2 : direction D7, PWM D6. Câblez chaque moteur aux
bornes M1+/M1- ou M2+/M2- de la carte.

```cpp
void side(int dirPin, int pwmPin, int speed) {
  digitalWrite(dirPin, speed >= 0 ? HIGH : LOW);
  analogWrite(pwmPin, min(abs(speed), 255));
}
void drive(int left, int right) { side(4, 5, left); side(7, 6, right); }   // M1 left, M2 right
```

La bibliothèque DFMobile de DFRobot (utilisée par les exemples Devastator) pilote la
broche de direction à l'état bas pour avancer avec `Robot.Direction(LOW, HIGH)`, donc un robot
qui l'utilise a besoin de **Reverse** des deux côtés.

### DFRobot Romeo ESP32-S3

Quatre drivers DRV8876 en mode PH/EN. M1 EN 12 / PH 13, M2 14 / 21, M3 9 / 10,
M4 47 / 11. PH HIGH signifie avancer.

```cpp
const int EN[4] = { 12, 14, 9, 47 }, PH[4] = { 13, 21, 10, 11 };
void motor(int i, int speed) {
  digitalWrite(PH[i], speed >= 0 ? HIGH : LOW);
  analogWrite(EN[i], min(abs(speed), 255));
}
void drive(int left, int right) { motor(0, left); motor(2, left); motor(1, right); motor(3, right); }
```

### Transistor ou MOSFET

Une seule direction : le rapport cyclique sur la broche de grille est le drive.

## Comportements

Un suiveur de ligne à trois capteurs :

```cpp
bool L = digitalRead(LINE_L) == LOW, C = digitalRead(LINE_C) == LOW, R = digitalRead(LINE_R) == LOW;
if (C && !L && !R) drive(150, 150);        // on the line
else if (L)        drive(40, 170);         // tape on the left: turn left
else if (R)        drive(170, 40);         // tape on the right: turn right
else               drive(-80, 80);         // lost: spin and look for it
```

Un éviteur d'obstacles avance, et sous 20 à 35 cm il s'arrête, recule,
et tourne vers le côté avec le plus d'espace (un sonar sur un servo peut d'abord regarder à 0
et 180 degrés). Lisez le sonar toutes les 50 à 100 ms et ne bloquez jamais longtemps
dans `loop()`.

À plein drive, un robot 2WD fait 0,55 m/s, un 4WD 0,61 m/s et le tank
0,36 m/s. Pour un suiveur de ligne sur un ruban de 22 mm, 120 à 170 sur 255 le garde
sur la ligne.
