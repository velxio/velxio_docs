## What is emulated

The M5Stack Core Basic is an all-in-one ESP32 device, so its projects need
**no wiring at all** — place the board, press Run. It runs on the in-browser
esp32js engine.

| Peripheral               | In the emulator                                                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2" ILI9342C LCD, 320x240 | Rendered live on the board art; drive it with `M5.Lcd` (M5GFX)                                                                                    |
| Front buttons A / B / C  | GPIO 39 / 38 / 37, active-low — click them on the board art                                                                                       |
| Speaker (GPIO 25)        | Plays through your computer at the sketch's real pitch, from `tone()` and from `M5.Speaker` alike                                                 |
| microSD                  | On CS 4, sharing the LCD's VSPI bus. A real FAT image that Velxio fills with your workspace files automatically; the SD Card panel loads your own |
| Battery and power        | The IP5306 power manager answers, so `M5.Power`'s battery APIs work; the canvas-header battery slider sets what they read                         |
| M-Bus header             | All four edges are wireable — see the pin card below                                                                                              |

The board runs on the **free plan**, in all three ESP32 languages
(Arduino C++, MicroPython, ESP-IDF).

:::note[Use M5Unified, not the classic M5Stack library]
Every example here is written against **M5Unified**, M5Stack's own
replacement. The classic `M5Stack` library needs arduino-esp32 2.x and no
longer compiles on the 3.x core — in the Arduino IDE too, not just here.
:::

## Reading the pin card

The pin table at the bottom of this page has 51 rows for a board with far
fewer signals, and that is the real device's doing: M5 prints the M-Bus card
on all four edges of the case, naming the same bus twice.

- The **left and top** strips name signals by **GPIO number** — `3`, `16`,
  `21`, `22`.
- The **right and bottom** strips name **the same signals by function** —
  `R0` is RXD0 (GPIO 3), `R2` is GPIO 16, `SDA` is GPIO 21, `SCL` is GPIO 22,
  `MO` / `MI` / `SCK` are the SPI bus on GPIO 23 / 19 / 18, `DA25` and `DA26`
  are the two DACs, `AD35` and `AD36` the ADC-only inputs.

Both sides are wireable because they are the same M-Bus net, reachable from
either side of the stack connector. A `.1`-style suffix on a name (`GND.1`,
`5V.2`) just distinguishes repeated power rails.

The tail of the bottom strip — `12`, `13`, `15`, `0`, `34` — carries M-Bus
signals the printed card leaves out (the I2S lines and HPWR), kept wireable
so nothing on the bus is unreachable.

## Run your first example

The gallery ships nine ready-to-run M5Stack Core projects. Start with
**Hello LCD + Buttons**: it does the two things every Core project builds on
— draw on the LCD, read the three front buttons.

### 1. Open it

Go straight to
[velxio.dev/example/m5stack-core-hello](https://velxio.dev/example/m5stack-core-hello),
or open the [examples gallery](https://velxio.dev/examples) and pick
**M5Stack Core** in the boards dropdown:

![The examples gallery filtered to the nine M5Stack Core projects](../../../../assets/docs/boards/m5stack-core-gallery.png)

### 2. Look around the editor

The sketch is on the left, the board on the canvas, and there is nothing to
wire — the board is the whole circuit. The Workspace tree shows `sketch.ino`
next to a `libraries.json` holding the two the sketch needs (`M5Unified` and
`M5GFX`), so the first build already has them.

![The Hello LCD + Buttons example loaded in the editor](../../../../assets/docs/boards/m5stack-core-editor.png)

### 3. Press Run

Velxio compiles the sketch with the real ESP32 Arduino toolchain in the cloud
— the Output console streams the compiler — and then boots the firmware. The
first build of a session takes the longest; after that, builds come from
cache. When it boots, the LCD draws the title and `Count: 0`:

![The example running, with the title screen on the 320x240 LCD](../../../../assets/docs/boards/m5stack-core-running.png)

### 4. Press the buttons

Click **A**, **B** and **C** on the board art. A adds one, B adds ten, C
resets — the counter below reads 13 after three A presses and one B:

![The on-screen counter after pressing the front buttons](../../../../assets/docs/boards/m5stack-core-buttons.png)

That is the whole loop. From here, edit the sketch and press Run again — the
[first project tutorial](/docs/getting-started/first-project/) covers the
editor workflow in more depth.

## How the sketch works

```cpp
// M5Stack Core Basic — built-in LCD + 3 buttons (M5Unified)
#include <M5Unified.h>

void draw(int count) {
  M5.Lcd.fillRect(10, 165, 300, 50, TFT_BLACK);
  M5.Lcd.setTextColor(TFT_GREEN, TFT_BLACK);
  M5.Lcd.setTextSize(3);
  M5.Lcd.setCursor(10, 175);
  M5.Lcd.printf("Count: %d", count);
}

int count = 0;

void setup() {
  auto cfg = M5.config();
  // Force the Core Basic profile — QEMU can't run M5Unified's HW autodetect.
  cfg.fallback_board = m5::board_t::board_M5Stack;
  M5.begin(cfg);

  M5.Lcd.setRotation(1);           // landscape 320x240
  M5.Lcd.fillScreen(TFT_BLACK);
  M5.Lcd.setTextColor(TFT_WHITE, TFT_BLACK);
  M5.Lcd.setTextSize(3);
  M5.Lcd.setCursor(10, 25);
  M5.Lcd.print("Velxio x M5Stack");
  M5.Lcd.setTextSize(2);
  M5.Lcd.setCursor(10, 90);
  M5.Lcd.print("Core Basic (ESP32)");
  M5.Lcd.setCursor(10, 120);
  M5.Lcd.print("Press BtnA / B / C");
  draw(0);
}

void loop() {
  M5.update();
  if (M5.BtnA.wasPressed()) draw(++count);
  if (M5.BtnB.wasPressed()) draw(count += 10);
  if (M5.BtnC.wasPressed()) draw(count = 0);
  delay(10);
}
```

Piece by piece:

- **`cfg.fallback_board = m5::board_t::board_M5Stack`** is the one line worth
  copying into every sketch of your own. M5Unified normally sniffs which
  M5Stack device it is running on; naming the board outright skips that and
  lands on the Core Basic profile every time.
- **`M5.begin(cfg)`** brings up the display, buttons, speaker and power
  manager in one call.
- **`M5.Lcd`** is a full M5GFX surface. `setRotation(1)` puts the panel
  landscape at 320x240; the second colour argument to `setTextColor` is the
  background, which lets text overwrite itself without flicker.
- **`M5.update()`** at the top of `loop()` polls the buttons — without it,
  `BtnA` and friends never change.
- **`wasPressed()`** fires once per press, which is what makes the counter
  step instead of racing while you hold a button. `isPressed()` is the
  held-down variant.
- **`fillRect` then `printf`** is the simplest redraw: blank the strip the
  number lives in, then print the new one.

## All Core examples in the gallery

Five of the nine are M5Stack's **official examples**, ported to M5Unified and
otherwise unchanged, so they double as a conformance check for the emulation:

| Example                                                                        | What it shows                                                        |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| [Hello LCD + Buttons](https://velxio.dev/example/m5stack-core-hello)           | The starter above — LCD plus the three buttons                       |
| [HelloWorld (official)](https://velxio.dev/example/m5stack-core-m5-helloworld) | The canonical first sketch on the 320x240 panel                      |
| [Button (official)](https://velxio.dev/example/m5stack-core-m5-button)         | A, B and C printing to the screen; hold B to clear                   |
| [Display (official)](https://velxio.dev/example/m5stack-core-m5-display)       | The vendor's own tour of the LCD — sweeps, text, shapes              |
| [Speaker (official)](https://velxio.dev/example/m5stack-core-m5-speaker)       | Real pitch through your computer: a 661 Hz beep, a held 112 Hz tone  |
| [Button piano](https://velxio.dev/example/m5stack-core-piano)                  | The three buttons as an instrument, with the note drawn on screen    |
| [LCD with Adafruit_ILI9341](https://velxio.dev/example/m5stack-core-tft)       | The same panel driven by the generic Adafruit stack instead of M5GFX |
| [TFCard (official)](https://velxio.dev/example/m5stack-core-m5-tfcard)         | Mount the card on CS 4, read and write `hello.txt`                   |
| [microSD + LCD](https://velxio.dev/example/m5stack-core-sd)                    | Lists the card's files on the screen — no card component to wire     |

## Start your own project

Two ways to begin a Core project of your own:

- **New workspace** in the toolbar, then pick the **M5Stack Core** starter —
  it loads the official HelloWorld sketch as your starting point.
- Or **Add Component**, search for `M5Stack`, and place the board on any
  canvas yourself, then add `M5Unified` and `M5GFX` from the
  [library manager](/docs/programming/libraries/).

Save with the toolbar's Save button and the project — code, board and the
microSD contents — lands in [your projects](/docs/getting-started/projects/).
