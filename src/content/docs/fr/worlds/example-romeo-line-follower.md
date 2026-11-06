---
title: "Exemple : suiveur de ligne Romeo ESP32-S3"
description: Un robot à quatre roues DFRobot Romeo ESP32-S3 suit une boucle de ruban adhésif avec trois capteurs de ligne et s'arrête devant les obstacles grâce à un URM09, dans un Monde 3D.
sidebar:
  order: 5
---

Un robot à quatre roues basé sur le DFRobot Romeo ESP32-S3 suit une boucle de
ruban adhésif avec trois capteurs de ligne Gravity, et s'arrête devant un
obstacle grâce à un capteur à ultrasons URM09. Le firmware est du code Arduino
classique ; le Monde dessine le robot sur son tapis et alimente les quatre
capteurs.

**Pour l'ouvrir :** [velxio.dev/example/dfrobot-romeo-esp32s3-line-robot-3d](https://velxio.dev/example/dfrobot-romeo-esp32s3-line-robot-3d)
puis appuyez sur **Run** (Exécuter).

![Le suiveur de ligne Romeo en fonctionnement, le Monde à côté de son circuit](../../../../assets/docs/worlds/romeo-running.png)

## Pièces

| Id                                       | Pièce                                        |
| ---------------------------------------- | -------------------------------------------- |
| `dfrobot-romeo-esp32s3`                  | DFRobot Romeo ESP32-S3 (quatre pilotes moteur DRV8876 intégrés) |
| `motorFL`, `motorFR`, `motorRL`, `motorRR` | Moteur à engrenages avec encodeur, 50:1     |
| `lineL`, `lineC`, `lineR`                | Capteur de ligne DFRobot Gravity (SEN0017)   |
| `urm09`                                  | DFRobot Gravity URM09 à ultrasons, mode Trig (SEN0388) |

## Câblage

| De                  | Vers (Romeo ESP32-S3) |
| ------------------- | --------------------- |
| `motorFL` M1 / M2   | M1+ / M1-             |
| `motorFR` M1 / M2   | M2+ / M2-             |
| `motorRL` M1 / M2   | M3+ / M3-             |
| `motorRR` M1 / M2   | M4+ / M4-             |
| `lineL` OUT         | GPIO 4                |
| `lineC` OUT         | GPIO 5                |
| `lineR` OUT         | GPIO 6                |
| `urm09` TRIG        | GPIO 16               |
| chaque capteur VCC / GND | 3V3 / GND        |

## Firmware

```cpp
// DFRobot Romeo ESP32-S3 line-following robot (4WD) with a URM09 bumper.
// Motors on the onboard DRV8876 drivers, PH/EN mode:
//   M1 front-left, M2 front-right, M3 rear-left, M4 rear-right.
const int EN[4] = { 12, 14, 9, 47 };   // speed (PWM)
const int PH[4] = { 13, 21, 10, 11 };  // direction (HIGH = forward)

// Gravity line trackers (SEN0017): LOW over the black tape, HIGH on white.
const int LINE_L = 4, LINE_C = 5, LINE_R = 6;
// Gravity URM09 Trig (SEN0388): one pin for trigger and echo.
const int URM09 = 16;

const int CRUISE = 150;               // 0-255
const int TURN_FAST = 170, TURN_SLOW = 40;
const float STOP_CM = 15;

void side(bool left, int speed) {     // speed -255..255
  int a = left ? 0 : 1, b = left ? 2 : 3;
  bool fwd = speed >= 0;
  int s = min(abs(speed), 255);
  digitalWrite(PH[a], fwd ? HIGH : LOW); analogWrite(EN[a], s);
  digitalWrite(PH[b], fwd ? HIGH : LOW); analogWrite(EN[b], s);
}

void drive(int left, int right) { side(true, left); side(false, right); }

float readCm() {
  pinMode(URM09, OUTPUT);
  digitalWrite(URM09, LOW);  delayMicroseconds(2);
  digitalWrite(URM09, HIGH); delayMicroseconds(10);
  digitalWrite(URM09, LOW);
  pinMode(URM09, INPUT);
  unsigned long us = pulseIn(URM09, HIGH, 40000);
  return us == 0 ? 500 : us / 58.0;
}

int lastTurn = -1;                    // -1 left, +1 right
unsigned long lastPing = 0, lastPrint = 0;
float cm = 500;

void setup() {
  Serial.begin(115200);
  for (int i = 0; i < 4; i++) pinMode(PH[i], OUTPUT);
  pinMode(LINE_L, INPUT);
  pinMode(LINE_C, INPUT);
  pinMode(LINE_R, INPUT);
  drive(0, 0);
  Serial.println("Romeo line robot ready");
}

void loop() {
  if (millis() - lastPing >= 50) { lastPing = millis(); cm = readCm(); }

  bool L = digitalRead(LINE_L) == LOW;
  bool C = digitalRead(LINE_C) == LOW;
  bool R = digitalRead(LINE_R) == LOW;

  if (cm < STOP_CM) {
    drive(0, 0);                                   // something ahead: wait
  } else if (L && !R) {
    drive(TURN_SLOW, TURN_FAST); lastTurn = -1;    // tape on the left
  } else if (R && !L) {
    drive(TURN_FAST, TURN_SLOW); lastTurn = +1;    // tape on the right
  } else if (C) {
    drive(CRUISE, CRUISE);                         // centred
  } else if (lastTurn < 0) {
    drive(-80, 150);                               // lost: search left
  } else {
    drive(150, -80);                               // lost: search right
  }

  if (millis() - lastPrint >= 500) {
    lastPrint = millis();
    Serial.printf("line %d%d%d  distance %.0f cm\n", L, C, R, cm);
  }
  delay(2);
}
```

## Le Monde

Le fichier `world.html` de cet exemple est un Monde libre écrit pour ce robot
(voir [Écrire votre propre Monde](/docs/fr/worlds/write-your-own/)) : un tapis de
2,4 x 1,6 m avec une boucle de 2,1 x 0,9 m en ruban adhésif noir de 22 mm, et
une modélisation du robot avec ses quatre roues, trois capteurs de ligne
espacés de 18 mm sur l'avant, et l'URM09 sur le pare-chocs.

Dans le Monde :

- **Camera** (Caméra) fait défiler les vues orbite, suivi du robot et vue du
  dessus.
- **Obstacle** dépose une boîte sur la ligne droite opposée. L'URM09 la
  détecte et le firmware arrête le robot juste avant ; appuyez à nouveau pour
  retirer la boîte et le robot repart.
- **Reset robot** (Réinitialiser le robot) le replace au point de départ.
- Le panneau affiche le temps simulé, la vitesse, les trois capteurs de ligne,
  la distance de l'URM09, les tours et la commande de chaque moteur.

Ce à quoi s'attendre, mesuré lors de la vérification de cet exemple par Velxio
lui-même : un tour de boucle en environ 16 secondes de temps simulé, jamais à
plus de 8 mm du ruban, et un arrêt à 8 à 11 cm avant la boîte. Le firmware
décide à 15 cm ; l'intervalle de ping de 50 ms et l'inertie des moteurs
expliquent le reste, comme sur un vrai robot.

## Pour aller plus loin

- Modifiez `CRUISE` et les deux vitesses de virage et observez le robot couper
  ou dépasser les virages.
- Modifiez `STOP_CM`, appuyez sur **Obstacle**, et vérifiez où il s'arrête.
- Affichez `millis()` à côté des relevés de ligne dans le moniteur série et
  comparez-le au temps simulé du panneau du Monde : ils concordent.
