---
title: CI-Schnellstart
description: "Von null zu einem bestandenen Lauf in fünf Minuten. Installiere die CLI, schreibe zwei Dateien, führe sie aus."
sidebar:
  order: 2
---

Du brauchst ein Velxio-Konto mit einem kostenpflichtigen Tarif und eine kompilierte Firmware-Datei. Der Simulator kompiliert hier nie etwas: Bringe die `.hex`-, `.bin`-, `.uf2`- oder `.elf`-Datei mit, die deine eigene Toolchain erzeugt hat.

## 1. Installiere die CLI

```bash
curl -fsSL https://velxio.dev/ci/install.sh | sh
```

Sie legt eine einzelne Binärdatei in `~/.velxio/bin` ab und erklärt dir, wie du sie zu deinem `PATH` hinzufügst. Windows: `iwr https://velxio.dev/ci/install.ps1 -useb | iex`. Die Binärdateien findest du auf der [Releases-Seite](https://github.com/velxio/velxio-cli/releases), falls du lieber selbst eine herunterladen möchtest.

## 2. Anmelden

```bash
velxio-cli login
```

Sie gibt einen kurzen Code aus, öffnet deinen Browser und wartet. Bestätige die Anfrage, und die CLI speichert, was ihr gegeben wird, sodass du nie selbst einen Token auf deinem eigenen Rechner handhaben musst.

```
code     7XJ6-33M5
approve  https://velxio.dev/account/ci/device?code=7XJ6-33M5
waiting for approval of 7XJ6-33M5 (the code expires in 10 min)
signed in as velxio-cli on laptop
```

Die Seite zeigt, was anfragt, von welchem Rechner und wofür, bevor du irgendetwas bestätigst:

![Die Browserseite, die eine CLI-Anmeldung bestätigt: Sie nennt das Tool, den Rechner, auf dem es läuft, und was es anfragt, mit den Schaltflächen Approve und Deny](../../../../assets/docs/ci/device-approve.png)

Ein CI-Job hat keinen Browser, also trägt er stattdessen ein Secret mit sich. Derselbe Ablauf erzeugt es, benannt nach dem Repository, das es aufbewahren wird:

```bash
velxio-cli login --ci --name "my-firmware"
```

Dieser gibt den Token einmalig aus. Speichere ihn als Repository-Secret (in GitHub: Settings, Secrets and variables, Actions) und niemals im Repository selbst. Beide Arten erscheinen unter [velxio.dev/account/ci](https://velxio.dev/account/ci), wo du beide widerrufen kannst.

## 3. Beschreibe das Projekt

Zwei Dateien neben deiner Firmware. `velxio-cli init` schreibt ein Startpaar, oder schreibe sie von Hand:

```toml
# velxio.toml
[velxio]
version = 1
board = "esp32-s3"
firmware = "build/blink.bin"
```

```json
{
  "version": 1,
  "parts": [
    { "type": "board-esp32-s3-devkitc-1", "id": "esp", "top": 0, "left": 0 },
    {
      "type": "wokwi-led",
      "id": "led1",
      "top": 0,
      "left": 120,
      "attrs": { "color": "red" }
    },
    {
      "type": "wokwi-resistor",
      "id": "r1",
      "top": 60,
      "left": 60,
      "attrs": { "value": "220" }
    }
  ],
  "connections": [
    ["esp:2", "r1:1", "green", []],
    ["r1:2", "led1:A", "green", []],
    ["led1:C", "esp:GND.1", "black", []]
  ]
}
```

Das ist Wokwis `diagram.json`-Format, also funktioniert ein vorhandenes Diagramm unverändert.

## 4. Führe es aus

```bash
velxio-cli run --expect-text "Hello, world!" --timeout 10000 .
```

Die Firmware startet, die serielle Ausgabe erscheint, während sie geschieht, und der Befehl beendet sich mit 0, sobald der Text auftaucht, oder mit 42, wenn die zehn simulierten Sekunden ohne ihn ablaufen.

```
velxio-cli 0.2.1 · plan pro · 1998.3 of 2000 min left (resets 2026-10-01)
project blink (esp32-s3, 3 parts) · firmware build/blink.bin (ESP32 image, 912 KB)
run r_9f3c2a1b7e4d queued · budget 10.0 s simulated
Hello, world!
ok   wait-serial "Hello, world!" at 0.412 s
PASS in 0.41 s simulated (3.2 s wall) · billed 1 s · exit 0
```

## 5. Packe es in CI

```yaml
- name: Test with Velxio
  uses: velxio/velxio-ci-action@v1
  with:
    token: ${{ secrets.VELXIO_CLI_TOKEN }}
    path: firmware/blink
    timeout: 10000
    expect_text: "Hello, world!"
```

Kompiliere in einem früheren Schritt; dieser führt nur aus, was du gebaut hast.

## Wenn es nicht funktioniert

- **`exit 2` bevor irgendetwas lief.** Ein Konfigurationsproblem: Das Board ist keines, das Velxio ausführt, die Firmware passt nicht zum Board, oder das Szenario hat einen Schritt, der ein Teil benennt, das dein Diagramm nicht hat. Nichts wurde berechnet. `velxio-cli lint .` findet die meisten davon ohne Token und ohne Netzwerk.
- **`exit 3`.** Der Token fehlt, wurde widerrufen oder gehört zu einem Tarif ohne CI.
- **`exit 4`.** Keine Minuten mehr in diesem Monat, oder mehr Jobs gleichzeitig, als dein Tarif ausführt.
- **Der Text kommt nie an.** Erhöhe `--timeout`, dann führe ohne jegliche Erwartung aus (`velxio-cli run --timeout 5000 .`), um zu lesen, was die Firmware tatsächlich ausgibt.
