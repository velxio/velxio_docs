## What is emulated

The Cardputer ADV is self-contained: every peripheral lives on the board
itself, so its projects need **no wiring at all** — you place the board and
press Run.

| Peripheral                  | In the emulator                                                                                                            |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| 1.14" ST7789 LCD, 240x135   | Rendered live on the board art; drive it with `M5Cardputer.Display` (M5GFX)                                                |
| 56-key keyboard (TCA8418)   | Click the keycaps, or click the board once and type on your own keyboard                                                   |
| Speaker (ES8311 codec, I2S) | Plays through your computer's audio — the exact samples the firmware writes                                                |
| Microphone (I2S RX)         | Real sample stream — see the live level meter in the [hardware tour](https://velxio.dev/example/cardputer-adv-diagnostics) |
| microSD                     | A real FAT image holding the project's own files; load yours from the SD Card panel                                        |
| BMI270 IMU + battery gauge  | Tilt the board and set the charge from the Sensors popover in the canvas header                                            |
| RGB LED                     | Rendered on the board                                                                                                      |
| IR transmitter (G44)        | Sends NEC frames; the board flashes the decoded address and command                                                        |

The board runs on the **free plan**, in all three ESP32 languages
(Arduino C++, MicroPython, ESP-IDF).

## Run your first example

The gallery ships thirteen ready-to-run Cardputer ADV projects. Start with
**LCD + keyboard echo** — it does the two things almost every Cardputer
project builds on: draw on the LCD and read the keyboard.

### 1. Open it

Go straight to
[velxio.dev/example/cardputer-adv-hello](https://velxio.dev/example/cardputer-adv-hello),
or browse the [examples gallery](https://velxio.dev/examples) and type
`cardputer` in the search box:

![The examples gallery filtered to the Cardputer ADV projects](../../../../assets/docs/boards/cardputer-adv-gallery.png)

### 2. Look around the editor

The project loads with the sketch on the left and the board on the canvas.
There is nothing to wire — the board is the whole circuit. The example also
brings its libraries with it: the Workspace tree on the left shows
`sketch.ino` next to a `libraries.json` holding the three the sketch needs
(`M5Cardputer`, `M5Unified` and `M5GFX`), so the first build already has
them.

![The LCD + keyboard echo example loaded in the editor](../../../../assets/docs/boards/cardputer-adv-editor.png)

### 3. Press Run

Velxio compiles the sketch with the real ESP32-S3 Arduino toolchain in the
cloud (the Output console streams the compiler), then boots the firmware on
the emulated board. The first build of a session takes the longest; after
that, builds come from cache. When it boots, the LCD draws the title and the
`Type:` prompt:

![The example running: the sketch's title screen on the ST7789 LCD](../../../../assets/docs/boards/cardputer-adv-running.png)

### 4. Type on the keyboard

Click the board once so it owns keyboard focus, then type on your real
keyboard — or click the individual keycaps on the board art. Every key you
press appears on the LCD; Backspace deletes the last character and Enter
clears the line. The emulated TCA8418 controller reports up to three
simultaneous keys, exactly as the hardware does.

![Text typed on the emulated keyboard echoed on the LCD](../../../../assets/docs/boards/cardputer-adv-typing.png)

That is the whole loop. From here, edit the sketch and press Run again —
the [first project tutorial](/docs/getting-started/first-project/) covers
the editor workflow in more depth.

## How the sketch works

The complete example is about forty lines:

{{example:cardputer-adv-hello}}

Piece by piece:

- **`M5Cardputer.begin(cfg, true)`** brings up the board; the second
  argument initialises the keyboard controller. Every Cardputer sketch
  starts this way.
- **`M5Cardputer.Display`** is a full M5GFX surface. `setRotation(1)` turns
  the panel landscape (240x135); `setCursor` / `setTextColor` / `print` work
  like every Adafruit-GFX-style API. The second color argument to
  `setTextColor` is the background, which lets text overwrite itself without
  flicker.
- **`M5Cardputer.update()`** at the top of `loop()` polls the keyboard —
  without it, `Keyboard` never changes.
- **`keysState()`** returns everything held right now: `st.word` is the
  printable characters, `st.del` and `st.enter` flag Backspace and Enter.
  The sketch appends, trims or clears `line` accordingly.
- The **`fillRect` + `print`** pair is the simplest redraw: blank the text
  area, then print the new line. For flicker-free full-screen drawing, the
  gallery's [text terminal](https://velxio.dev/example/cardputer-adv-terminal)
  shows the next step — an off-screen `M5Canvas` sprite pushed in one go.

## All Cardputer examples in the gallery

Ten of the thirteen are M5Stack's **official examples, unmodified** — they
double as a conformance check for the emulation. In rough learning order:

| Example                                                                               | What it shows                                                                      |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [LCD + keyboard echo](https://velxio.dev/example/cardputer-adv-hello)                 | The starter above — display plus keyboard in 40 lines                              |
| [Button (official)](https://velxio.dev/example/cardputer-adv-m5-button)               | The G0 button, with a beep on press and release                                    |
| [Single key press (official)](https://velxio.dev/example/cardputer-adv-m5-key-single) | Watch one key via `isKeyPressed('a')`                                              |
| [Multi key press (official)](https://velxio.dev/example/cardputer-adv-m5-key-multi)   | Up to three simultaneous keys from the TCA8418                                     |
| [Display test (official)](https://velxio.dev/example/cardputer-adv-m5-display)        | The LCD path at full tilt — random shapes and text forever                         |
| [Buzzer (official)](https://velxio.dev/example/cardputer-adv-m5-buzzer)               | I2S speaker tones you can hear through your own audio                              |
| [Text input (official)](https://velxio.dev/example/cardputer-adv-m5-key-input)        | Line editing with modifiers and an off-screen canvas                               |
| [Text terminal (official)](https://velxio.dev/example/cardputer-adv-terminal)         | Scrolling sprite log with a vector font — the end-to-end LCD + keyboard check      |
| [microSD (official)](https://velxio.dev/example/cardputer-adv-m5-sdcard)              | Mount, list, create, rename, delete, throughput — on a FAT image you control       |
| [IR NEC send (official)](https://velxio.dev/example/cardputer-adv-m5-ir-nec)          | NEC frames out of the G44 IR diode, visualised on the board                        |
| [REPL guessing game (official)](https://velxio.dev/example/cardputer-adv-m5-repl)     | A three-file project: console, prompt and command loop                             |
| [Hardware tour](https://velxio.dev/example/cardputer-adv-diagnostics)                 | Six diagnostic pages — keys, microSD, IMU tilt bubble, RGB LED, battery, mic meter |
| [Brick Blaster](https://velxio.dev/example/cardputer-adv-brick-blaster)               | A complete game: sprite rendering, keyboard steering, pentatonic sound             |

## Start your own project

Two ways to begin a Cardputer project of your own:

- **New workspace** in the toolbar, then pick the **M5 Cardputer ADV**
  starter — it loads the LCD + keyboard echo example above as your starting
  point.
- Or **Add Component** and search for `Cardputer` to place the board on any
  canvas yourself, then add `M5Cardputer` from the
  [library manager](/docs/programming/libraries/).

Save with the toolbar's Save button and the project — code, board and the
microSD contents — lands in [your projects](/docs/getting-started/projects/).
