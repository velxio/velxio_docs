---
title: Echte Hardware aus dem Browser flashen
description: "Schreiben Sie Ihr kompiliertes Projekt über USB direkt aus dem Browser auf ein physisches Board – ohne installierte Toolchain."
sidebar:
  order: 4
---

Wenn Ihr Projekt im Simulator funktioniert, können Sie es ohne Installation auf ein **echtes Board** bringen: Velxio flasht die kompilierte Firmware über USB direkt aus dem Browser.

## Voraussetzungen

- Ein Chromium-basierter Browser (Chrome oder Edge). Der Flasher verwendet die Web Serial- und WebUSB-APIs des Browsers, die Firefox und Safari nicht enthalten. Pico-Familien-Boards erhalten dort trotzdem einen **Download .uf2**-Button (siehe unten).
- Ein datenfähiges USB-Kabel zu Ihrem Board.
- Schließen Sie zuerst alles andere, das den Port verwendet (Serielle Monitore, IDEs, picotool): Der Browser benötigt exklusiven Zugriff.

![Der Flash-Dialog zur Auswahl eines USB-Serial-Ports](../../../../assets/docs/wifi-iot/flash-modal.png)

## Flashen

1. Klicken Sie mit der rechten Maustaste auf das Board auf der Leinwand und wählen Sie **Flash to real board**.
2. Klicken Sie auf **Connect & flash**. Der Browser fragt, welches USB-Gerät gewährt werden soll; wählen Sie Ihr Board.
3. Velxio verwendet den Build, den es bereits für dieses Board erstellt hat (dasselbe Binärprogramm, das der Simulator ausgeführt hat). Wenn sich der Code seitdem geändert hat, wird zuerst neu kompiliert und die Compiler-Ausgabe wird in den Dialog gestreamt.
4. Beobachten Sie die Fortschrittsanzeige; wenn sie fertig ist, startet das Board in Ihr Projekt neu.

Der Dialog wählt das Protokoll für das Ziel:

| Familie | Wie geschrieben wird | Das Board muss |
| --- | --- | --- |
| ESP32, S3, C3, C6 | esptool über den seriellen Port, die zusammengeführte `.bin` | eingesteckt sein; BOOT gedrückt halten, wenn es nicht antwortet |
| Arduino Uno, Nano, Mega, ATtiny85 | STK500 gegen den Bootloader des Boards, die `.hex` | eingesteckt sein (ATtiny85: über einen Arduino mit ArduinoISP) |
| Raspberry Pi Pico, Pico W, Pico 2, Pimoroni RP2040 / RP2350 Boards | PICOBOOT über WebUSB, die von picotool erstellte `.uf2` | im **BOOTSEL**-Modus (nächster Abschnitt) |

## Pico-Familien-Boards: zuerst BOOTSEL

Ein RP2040 oder RP2350 wird von seinem Bootloader programmiert, einer separaten USB-Identität, die der Chip nur im **BOOTSEL**-Modus zeigt. Zwei Wege dorthin:

- **Von Hand**: Halten Sie die BOOTSEL-Taste gedrückt, während Sie das Board einstecken, und lassen Sie sie dann los. Das Board wird als USB-Laufwerk mit dem Namen `RPI-RP2` (RP2040) oder `RP2350` eingebunden.
- **Über den Dialog**: Der Flash-Dialog für diese Boards hat einen **Reboot into bootloader over USB**-Button. Er funktioniert, wenn das Board ein Sketch ausführt, das Velxio erstellt hat (der Arduino-Kern startet bei einer 1200-Baud-Öffnung neu) oder MicroPython (die REPL führt `machine.bootloader()` aus). Der Browser fragt nach dem seriellen Port des Boards, das Board trennt sich und kommt als Bootloader zurück. Klicken Sie dann auf **Connect & flash** und wählen Sie das Gerät `RP2 Boot` / `RP2350 Boot`.

Zwei Klicks, zwei Berechtigungsabfragen: der serielle Port für den Neustart und das USB-Gerät für das Schreiben. Sobald sich das Board im BOOTSEL-Modus befindet, benötigen spätere Flash-Vorgänge nur noch die zweite.

Der Dialog verweigert ein Image, das nicht zu dem Chip passt, der geantwortet hat (ein RP2350-Build auf einem RP2040, ein RISC-V-Build auf einer ARM-Konfiguration), bevor etwas gelöscht wird, überprüft nach dem Schreiben jedes Byte und startet das Board in das Programm neu.

### Windows und ein RP2040: WinUSB einmal installieren

Der RP2040-Bootloader enthält keinen Windows-Treiberdeskriptor, daher kann der Browser ihn nicht beanspruchen, bis WinUSB daran gebunden ist. Einmalige Einrichtung:

1. Versetzen Sie das Board in den BOOTSEL-Modus und stecken Sie es ein.
2. Laden Sie [Zadig](https://zadig.akeo.ie) herunter und führen Sie es aus.
3. Wählen Sie `RP2 Boot (Interface 1)` aus der Liste (Optionen, Alle Geräte auflisten, wenn es ausgeblendet ist), wählen Sie **WinUSB** als Treiber und klicken Sie auf **Install Driver**.

RP2350-Boards (Pico 2, Pico 2 W, die Pimoroni "Pico 2 W Aboard"-Unicorns, Badger 2350) benötigen nichts: Ihr Bootloader trägt den Deskriptor und Windows bindet WinUSB von selbst. macOS benötigt bei keinem der Chips etwas.

### Linux: eine udev-Regel

Linux gibt USB-Geräte standardmäßig an root. Erstellen Sie `/etc/udev/rules.d/99-velxio-rp2.rules` mit:

```
SUBSYSTEM=="usb", ATTRS{idVendor}=="2e8a", MODE="0666", TAG+="uaccess"
```

dann `sudo udevadm control --reload-rules && sudo udevadm trigger` und stecken Sie das Board neu ein. Der für den Neustart verwendete serielle Port benötigt zusätzlich die übliche `dialout`-Gruppenmitgliedschaft.

### Jeder Browser: die .uf2 herunterladen

Der Flash-Dialog für ein Pico-Familien-Board bietet immer **Download .uf2** an (bei Firefox und Safari, wo der Browser nicht flashen kann, ist das der gesamte Dialog). Speichern Sie die Datei, versetzen Sie das Board in den BOOTSEL-Modus und legen Sie die Datei auf dem `RPI-RP2` / `RP2350`-Laufwerk ab: Das Board startet in dem Moment, in dem das Kopieren endet, in Ihr Sketch neu.

### MicroPython-Projekte auf einem Pico

Der Dialog lädt die `.py`-Dateien des Projekts über die REPL hoch und startet in `main.py` neu. MicroPython selbst muss zuerst auf dem Board sein:

- **Pico und Pico W**: Der Dialog installiert es. Wenn keine REPL antwortet, werden Sie aufgefordert, das Board in den BOOTSEL-Modus zu versetzen und auf Retry zu klicken; dieser Klick schreibt denselben MicroPython-Build, den der Simulator ausführt, und ein weiterer Retry lädt Ihre Dateien hoch.
- **Pimoroni RP2350-Boards** (Badger 2350, Pico Plus 2W): Sie werden mit Pimoronis eigenem MicroPython ausgeliefert. Wenn Ihres es verloren hat, laden Sie die `.uf2` von [pimoroni-pico-rp2350](https://github.com/pimoroni/pimoroni-pico-rp2350/releases) herunter und legen Sie sie einmal auf dem BOOTSEL-Laufwerk ab, dann flashen Sie über den Dialog.

## Fehlerbehebung

- **"No board in BOOTSEL mode was found"**: Die Geräteauswahl war leer. Verwenden Sie den Neustart-Button oder halten Sie BOOTSEL beim Einstecken gedrückt, und verbinden Sie sich dann erneut.
- **"The board in BOOTSEL is an RP2040 but this project is built for RP2350"**: Pimoroni verkaufte den Stellar und Galactic Unicorn bis Januar 2025 mit einem Pico W (RP2040) und seitdem mit einem Pico 2 W (RP2350). Überprüfen Sie das Etikett auf Ihrem Gerät und wählen Sie das passende Board im Editor.
- **"Could not claim the USB device"** unter Windows mit einem RP2040: der Zadig-Schritt oben. Unter Linux: die udev-Regel oben.
- **Der serielle Neustart hat nichts bewirkt**: Ein Sketch, das mit deaktiviertem USB-Stack erstellt wurde, kann nicht über USB neu gestartet werden. Halten Sie BOOTSEL beim Einstecken gedrückt.

## Erst simulieren, dann flashen

Dies schließt den Kreislauf, der Velxio für echte Arbeit nützlich macht: Schnell im Simulator iterieren (kein Kabel, kein Verschleiß an der Hardware, sofortige Resets), dann genau dasselbe Build-Artefakt flashen, wenn es sich richtig verhält.
