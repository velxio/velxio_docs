---
title: モーターとセンサー
description: Worldが回路から読み取る値、センサーへ書き戻す値、そして各ドライバでロボットを動かすファームウェアについて説明します。
sidebar:
  order: 3
---

Worldはあなたのコードを実行することも、ピンに直接触れることもありません。回路が駆動している内容を読み取り、センサーが測定するはずの値を書き込みます。そのため、ファームウェアは実機のロボットで動くコードと同じものです。

## Worldが読み取るもの

| パーツ                                    | Worldが取得する値                                          |
| --------------------------------------- | ------------------------------------------------------------- |
| DCモーター、エンコーダ付きギアモーター       | `drive`、-1から1: モーターのデューティ、符号 = 方向 |
| サーボ                                   | `angle`、0から180度                                     |

モーターのdriveは、それを駆動するものを通じて読み取られます: L293D、トランジスタやMOSFET、ボード上のオンボードドライバ（Romeoボード）、またはモーターに直結したピンです。ロボットの各サイドは、そのモーターの平均driveに従い、実際のギアボックスのように少しの慣性（約80 ms）と小さなデッドバンドを持ちます。

## Worldが書き込むもの

| パーツ                                   | 値                                                     | ファームウェアでの読み取り方                                     |
| -------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------- |
| DFRobot Gravity ライントラッカー (SEN0017) | 反射率 0から1、`black`                                | 黒テープ上で `digitalRead(pin) == LOW`                 |
| DFRobot URM09、Trigモード (SEN0388)     | 距離、2から500 cm                                      | 1本のピン: 10 usのトリガ、その後 `pulseIn(pin, HIGH) / 58.0`    |
| DFRobot URM37 V5.0、PWMモード           | 距離、2から500 cm                                      | COMP/TRIGをLOWに引き、その後 `pulseIn(ECHO, LOW) / 50`            |
| HC-SR04                                | 距離、2から400 cm                                      | TRIGを10 us HIGHにし、その後 `pulseIn(ECHO, HIGH) / 58.0`            |
| MPU6050                                | 加速度（g単位）、回転（度/秒単位）          | 実チップと同様にI2C                                       |

距離センサーはロボットのバンパーから真っ直ぐ前方を見て、片側約12度の狭い円錐を持ちます。ラインセンサーはその真下のマット（またはランプ）をサンプリングします。

## ロボットを動かす: ファームウェア側

driveの符号が方向を決めます。Worldでサイドが逆に動く場合は、ファームウェアを修正するか、[シーンエディタ](/docs/ja/worlds/scene-editor/)でそのサイドの**Reverse**にチェックを入れてください。

### L293D（任意のボード）

チャネル1: EN1 (PWM) とIN1、IN2、出力はOUT1とOUT2。チャネル2: EN2とIN3、IN4。IN1 HIGHかつIN2 LOWが正のdriveで、EN1のデューティが速度を設定します。

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

### DFRobot Romeo BLEとRomeo BLE mini

M1: 方向D4、PWM D5。M2: 方向D7、PWM D6。各モーターをボードのM1+/M1-またはM2+/M2-端子に接続します。

```cpp
void side(int dirPin, int pwmPin, int speed) {
  digitalWrite(dirPin, speed >= 0 ? HIGH : LOW);
  analogWrite(pwmPin, min(abs(speed), 255));
}
void drive(int left, int right) { side(4, 5, left); side(7, 6, right); }   // M1 left, M2 right
```

DFRobotのDFMobileライブラリ（Devastatorサンプルで使用）は、前進時に方向ピンをLOWにする `Robot.Direction(LOW, HIGH)` を使うため、これで動かすロボットは両サイドとも**Reverse**が必要です。

### DFRobot Romeo ESP32-S3

PH/ENモードの4つのDRV8876ドライバ。M1 EN 12 / PH 13、M2 14 / 21、M3 9 / 10、M4 47 / 11。PH HIGHが前進です。

```cpp
const int EN[4] = { 12, 14, 9, 47 }, PH[4] = { 13, 21, 10, 11 };
void motor(int i, int speed) {
  digitalWrite(PH[i], speed >= 0 ? HIGH : LOW);
  analogWrite(EN[i], min(abs(speed), 255));
}
void drive(int left, int right) { motor(0, left); motor(2, left); motor(1, right); motor(3, right); }
```

### トランジスタまたはMOSFET

一方向のみ: ゲートピンのデューティがdriveです。

## 動作例

3センサーのライントレーサー:

```cpp
bool L = digitalRead(LINE_L) == LOW, C = digitalRead(LINE_C) == LOW, R = digitalRead(LINE_R) == LOW;
if (C && !L && !R) drive(150, 150);        // on the line
else if (L)        drive(40, 170);         // tape on the left: turn left
else if (R)        drive(170, 40);         // tape on the right: turn right
else               drive(-80, 80);         // lost: spin and look for it
```

障害物回避は前進し、20から35 cm未満で停止し、後退し、より広い方へ旋回します（サーボ上のソナーなら先に0度と180度を見ることもできます）。ソナーは50から100 msごとに読み取り、`loop()`内で長時間ブロックしないでください。

フルdriveでは、2WDロボットは0.55 m/s、4WDは0.61 m/s、タンクは0.36 m/sで進みます。22 mmテープ上のライントレーサーでは、255中120から170でライン上に保てます。
