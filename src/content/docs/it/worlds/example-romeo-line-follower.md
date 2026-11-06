---
title: "Esempio: robot seguilinea Romeo ESP32-S3"
description: Un robot a quattro ruote DFRobot Romeo ESP32-S3 segue un percorso circolare tracciato con nastro adesivo usando tre sensori di linea e si ferma davanti agli ostacoli grazie a un URM09, in un World 3D.
sidebar:
  order: 5
---

Un robot a quattro ruote basato su DFRobot Romeo ESP32-S3 segue un percorso circolare tracciato con nastro adesivo usando tre sensori di linea Gravity, e si ferma davanti a un ostacolo grazie a un sensore a ultrasuoni URM09. Il firmware è semplice codice Arduino; il World disegna il robot sul suo tappetino e alimenta i quattro sensori.

**Aprilo:** [velxio.dev/example/dfrobot-romeo-esp32s3-line-robot-3d](https://velxio.dev/example/dfrobot-romeo-esp32s3-line-robot-3d)
e premi **Run**.

![Il seguilinea Romeo in esecuzione, il World accanto al suo circuito](../../../../assets/docs/worlds/romeo-running.png)

## Componenti

| Id                                       | Componente                                   |
| ---------------------------------------- | -------------------------------------------- |
| `dfrobot-romeo-esp32s3`                  | DFRobot Romeo ESP32-S3 (quattro driver motore DRV8876 a bordo) |
| `motorFL`, `motorFR`, `motorRL`, `motorRR` | Motore con encoder, rapporto 50:1          |
| `lineL`, `lineC`, `lineR`                | DFRobot Gravity line tracker (SEN0017)       |
| `urm09`                                  | DFRobot Gravity URM09 a ultrasuoni, modalità Trig (SEN0388) |

## Cablaggio

| Da                  | A (Romeo ESP32-S3)  |
| ------------------- | ------------------- |
| `motorFL` M1 / M2   | M1+ / M1-           |
| `motorFR` M1 / M2   | M2+ / M2-           |
| `motorRL` M1 / M2   | M3+ / M3-           |
| `motorRR` M1 / M2   | M4+ / M4-           |
| `lineL` OUT         | GPIO 4              |
| `lineC` OUT         | GPIO 5              |
| `lineR` OUT         | GPIO 6              |
| `urm09` TRIG        | GPIO 16             |
| ogni sensore VCC / GND | 3V3 / GND        |

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

## Il World

Il file `world.html` di questo esempio è un World libero scritto appositamente per questo robot (vedi
[Scrivi il tuo World](/docs/it/worlds/write-your-own/)): un tappetino di 2,4 x 1,6 m con
un percorso circolare di 2,1 x 0,9 m tracciato con nastro adesivo nero da 22 mm, e un modello del robot con le sue
quattro ruote, tre sensori di linea distanziati di 18 mm lungo la parte anteriore, e l'URM09
sul paraurti.

All'interno del World:

- **Camera** alterna la vista orbitale, l'inseguimento del robot e la vista dall'alto.
- **Obstacle** fa cadere una scatola sul rettilineo opposto. L'URM09 la rileva e il
  firmware ferma il robot poco prima; premilo di nuovo per rimuovere la scatola
  e il robot riparte.
- **Reset robot** lo riporta al punto di partenza.
- Il pannello mostra il tempo simulato, la velocità, i tre sensori di linea, la distanza
  misurata dall'URM09, i giri e l'azionamento di ciascun motore.

Cosa aspettarsi, misurato sul controllo interno di Velxio per questo esempio: un giro del
percorso in circa 16 secondi di tempo simulato, mai più di 8 mm fuori dal
nastro, e un arresto da 8 a 11 cm prima della scatola. Il firmware decide a 15 cm;
l'intervallo di ping di 50 ms e l'inerzia dei motori spiegano la differenza, come su un
robot reale.

## Prova adesso

- Cambia `CRUISE` e le due velocità di sterzata e osserva il robot tagliare o superare
  le curve.
- Cambia `STOP_CM`, premi **Obstacle** e controlla dove si ferma.
- Stampa `millis()` accanto alle letture di linea nel monitor seriale e confrontalo
  con il tempo simulato nel pannello del World: coincidono.
