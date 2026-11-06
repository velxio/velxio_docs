---
title: "Пример: робот-следопыт Romeo ESP32-S3"
description: Четырёхколёсный робот DFRobot Romeo ESP32-S3 следует по замкнутой трассе из ленты с тремя датчиками линии и останавливается перед препятствиями с помощью URM09 в 3D-мире.
sidebar:
  order: 5
---

Четырёхколёсный робот на DFRobot Romeo ESP32-S3 следует по замкнутой трассе из ленты с тремя датчиками линии Gravity и останавливается перед препятствием с помощью ультразвукового датчика URM09. Прошивка написана на чистом Arduino-коде; Мир рисует робота на его коврике и передаёт показания четырёх датчиков.

**Открыть:** [velxio.dev/example/dfrobot-romeo-esp32s3-line-robot-3d](https://velxio.dev/example/dfrobot-romeo-esp32s3-line-robot-3d)
и нажмите **Run** (Запуск).

![Робот-следопыт Romeo в работе, Мир рядом со своей схемой](../../../../assets/docs/worlds/romeo-running.png)

## Компоненты

| Id                                       | Компонент                                    |
| ---------------------------------------- | -------------------------------------------- |
| `dfrobot-romeo-esp32s3`                  | DFRobot Romeo ESP32-S3 (четыре драйвера двигателей DRV8876 на плате) |
| `motorFL`, `motorFR`, `motorRL`, `motorRR` | Редукторный двигатель с энкодером, 50:1     |
| `lineL`, `lineC`, `lineR`                | DFRobot Gravity line tracker (SEN0017)       |
| `urm09`                                  | DFRobot Gravity URM09 ультразвуковой, режим Trig (SEN0388) |

## Подключение

| От                  | К (Romeo ESP32-S3)  |
| ------------------- | ------------------- |
| `motorFL` M1 / M2   | M1+ / M1-           |
| `motorFR` M1 / M2   | M2+ / M2-           |
| `motorRL` M1 / M2   | M3+ / M3-           |
| `motorRR` M1 / M2   | M4+ / M4-           |
| `lineL` OUT         | GPIO 4              |
| `lineC` OUT         | GPIO 5              |
| `lineR` OUT         | GPIO 6              |
| `urm09` TRIG        | GPIO 16             |
| каждый датчик VCC / GND | 3V3 / GND        |

## Прошивка

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

## Мир

Файл `world.html` этого примера — это свободный Мир, написанный для данного робота (см.
[Напишите свой Мир](/docs/ru/worlds/write-your-own/)): коврик 2,4 x 1,6 м с
замкнутой трассой 2,1 x 0,9 м из чёрной ленты шириной 22 мм и модель робота с его
четырьмя колёсами, тремя датчиками линии на расстоянии 18 мм друг от друга по фронту
и URM09 на бампере.

Внутри Мира:

- **Camera** (Камера) переключает режимы: облёт по орбите, слежение за роботом и вид сверху.
- **Obstacle** (Препятствие) ставит коробку на дальнем прямом участке. URM09 видит её, и
  прошивка останавливает робота перед ней; нажмите ещё раз, чтобы убрать коробку,
  и робот поедет дальше.
- **Reset robot** (Сброс робота) возвращает его на старт.
- Панель показывает модельное время, скорость, три датчика линии, расстояние
  по URM09, круги и привод каждого двигателя.

Что ожидать, по результатам собственной проверки этого примера в Velxio: один круг
по трассе примерно за 16 секунд модельного времени, отклонение от ленты не более 8 мм
и остановка в 8–11 см перед коробкой. Прошивка принимает решение на 15 см;
интервал опроса 50 мс и выбег двигателей объясняют остальное, как и на
реальном роботе.

## Что попробовать дальше

- Измените `CRUISE` и две скорости поворота и посмотрите, как робот срезает или
  проскакивает повороты.
- Измените `STOP_CM`, нажмите **Obstacle** и проверьте, где он остановится.
- Выведите `millis()` рядом с показаниями датчиков линии в мониторе порта и сравните
  с модельным временем на панели Мира: они совпадают.
