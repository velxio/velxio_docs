---
title: "BBC micro:bit"
description: "Der BBC micro:bit V2 und sieben DFRobot-Boards dafür, die die offizielle MicroPython-Firmware in deinem Browser ausführen."
sidebar:
  order: 5.5
---

Der **BBC micro:bit V2** läuft in Velxio mit seiner eigenen offiziellen
MicroPython-Firmware (2.1.1), unverändert, auf einer Browser-Engine für seinen
nRF52833-Chip. Schreibe MicroPython, drücke **Run** (Ausführen), und das
Programm läuft in deinem Browser-Tab, in jedem Tarif, auch im kostenlosen.

![Der BBC micro:bit V2 auf der Velxio-Zeichenfläche](../../../../assets/docs/boards/microbit-v2.png)

## Was läuft

- Die 5x5-LED-Matrix, die Tasten A und B und das Touch-Logo, auf einer
  Zeichnung, die du anklicken kannst.
- Der Bewegungssensor (neige das Pad unter dem Board), und der Kompasskurs,
  die Temperatur, der Lichtpegel und der Schallpegel, eingestellt über das
  Sensorpanel des Boards.
- Der Lautsprecher, sobald du den Ton in diesem Panel einschaltest, und der
  Randverbinder: verdrahte LEDs, Potentiometer, Servos oder Grove-Sensoren mit
  seinen Ringen und Leisten wie beim echten Board.
- Eine REPL im Serial Monitor, und **Upload firmware** (Firmware hochladen)
  für eine von python.microbit.org gespeicherte MicroPython-`.hex`, deren
  Dateien sich im Editor öffnen.

Vorerst **nur MicroPython**: kein Arduino/C++ und keine MakeCode-Blöcke (eine
MakeCode-`.hex` startet noch nicht). Funk zwischen zwei micro:bits und
Bluetooth werden nicht modelliert.

## Hier starten

- [Hallo, Welt! auf der LED-Matrix](https://velxio.dev/example/microbit-v2-hello)
- [Tasten A und B](https://velxio.dev/example/microbit-v2-buttons)
- [Wasserwaage](https://velxio.dev/example/microbit-v2-spirit-level), auf dem
  Beschleunigungssensor
- [Thermometer](https://velxio.dev/example/microbit-v2-thermometer), auf der
  eigenen Temperatur des Chips

## DFRobot-Boards für den micro:bit

Sieben DFRobot-Boards sind in Velxio, jedes ein eigenes Board auf der
Zeichenfläche: platziere es, und der micro:bit sitzt in seinem Sockel, mit
der Matrix und den Tasten weiterhin in Reichweite. Ein Board mit Chips öffnet
mit einem MicroPython-Treiber neben `main.py` (`maqueen.py`, `maqueen_v5.py`,
`microdriver.py`, `microiobox.py`), der dieselben Bytes schreibt wie DFRobots
eigene MakeCode-Blöcke.

![Der micro:bit V2 in einem DFRobot Maqueen Lite auf der Velxio-Zeichenfläche](../../../../assets/docs/boards/microbit-v2-maqueen-lite.png)

### Maqueen Lite

DFRobots kleiner zweirädriger Roboter (ROB0148-EN): zwei Motoren hinter einem
Treiber auf I2C, zwei Scheinwerfer, zwei Liniensensoren, vier RGB-LEDs und
ein Ultraschall-Sockel. In einer 3D World ist der Maqueen selbst der Roboter.
[Linienfolger](https://velxio.dev/example/microbit-v2-maqueen-lite-line) ·
[Fahren und Scheinwerfer blinken lassen](https://velxio.dev/example/microbit-v2-maqueen-lite-drive) ·
[DFRobot-Shop](https://www.dfrobot.com/product-1783.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-maqueen-lite)

### Maqueen Lite V5

Der aktuelle Maqueen Lite (MBT0046): RGB-Scheinwerfer, drei Liniensensoren,
zwei Lichtsensoren und ein Batteriestand hinter seinem eigenen Controller auf
I2C.
[Farbige Scheinwerfer und Lichtsensoren](https://velxio.dev/example/microbit-v2-maqueen-lite-v5-lights) ·
[DFRobot-Shop](https://www.dfrobot.com/product-2937.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-maqueen-lite-v5)

### micro:Driver

Vier DC-Motorausgänge und acht Servo-Anschlüsse von einem PCA9685-Chip auf
I2C (DFR0548), plus neun micro:bit-Pins auf 3-poligen Anschlüssen.
[Zwei Servos und ein DC-Motor](https://velxio.dev/example/microbit-v2-micro-driver-servos) ·
[DFRobot-Shop](https://www.dfrobot.com/product-1738.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-micro-driver)

### micro:IO-BOX

Ein kompakter Roboter-Controller (MBT0005): ein Zweiwege-Motortreiber auf
I2C, neun IO-Anschlüsse, I2C- und UART-Ports und ein Buzzer auf P0.
[Zwei Motoren vorwärts und rückwärts](https://velxio.dev/example/microbit-v2-io-box-motors) ·
[DFRobot-Shop](https://www.dfrobot.com/product-1847.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-io-box)

### IO Extender

Ein Breakout (MBT0008) mit jedem Pin des Randverbinders auf einem 3-poligen
Anschluss (Signal, 3,3 V, Masse), drei I2C-Ports und einem Buzzer auf P0 mit
einem Schalter.
[Ein Lichtsensor auf P1](https://velxio.dev/example/microbit-v2-io-extender-light) ·
[DFRobot-Shop](https://www.dfrobot.com/product-1867.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-io-extender)

### micro:Mate

Ein Board in der Größe des micro:bit (DFR0518), das auf seiner Vorderseite
verschraubt wird, mit sechs 3-poligen Gravity-Anschlüssen: P0, P1 und P2 mit
3,3 V, P8, P12 und P16 mit 5 V.
[Ein Lichtsensor auf P0](https://velxio.dev/example/microbit-v2-micro-mate-light) ·
[DFRobot-Shop](https://www.dfrobot.com/product-1699.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-micro-mate)

### Robotics & Power IO Extender

Ein vollständiges Breakout für den micro:bit (DFR1231) mit den Anschlüssen
des IO Extender in derselben Reihenfolge und mit denselben Pin-Namen, sodass
ein Projekt zwischen beiden wechselt, ohne ein Kabel umzubenennen.
[Ein Lichtsensor auf P1](https://velxio.dev/example/microbit-v2-robotics-io-extender-light) ·
[DFRobot-Shop](https://www.dfrobot.com/product-2963.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-robotics-io-extender)

_Shop-Links auf dieser Seite sind Affiliate-Links: Velxio erhält eine kleine Provision, ohne zusätzliche Kosten für dich._

## Board-Grafiken und Pinbelegungen

Die Zeichenflächen-Grafik und die vollständige Pinbelegung jedes Boards,
generiert aus dem Simulator:

[BBC micro:bit V2](/docs/de/boards/reference/microbit-v2/) ·
[Maqueen Lite](/docs/de/boards/reference/microbit-v2-maqueen-lite/) ·
[Maqueen Lite V5](/docs/de/boards/reference/microbit-v2-maqueen-lite-v5/) ·
[micro:Driver](/docs/de/boards/reference/microbit-v2-micro-driver/) ·
[micro:IO-BOX](/docs/de/boards/reference/microbit-v2-io-box/) ·
[IO Extender](/docs/de/boards/reference/microbit-v2-io-extender/) ·
[micro:Mate](/docs/de/boards/reference/microbit-v2-micro-mate/) ·
[Robotics & Power IO Extender](/docs/de/boards/reference/microbit-v2-robotics-io-extender/)

---

BBC micro:bit ist eine Marke der Micro:bit Educational Foundation. Velxio
arbeitet mit dem micro:bit; es wird nicht von der Foundation hergestellt oder
unterstützt. Der micro:bit selbst wird über die Wiederverkäufer verkauft, die
die Foundation unter [microbit.org](https://microbit.org/buy/) auflistet.
