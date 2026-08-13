---
title: FAQ
description: Häufig gestellte Fragen zu Velxio.
sidebar:
  order: 8
---

### Muss ich etwas installieren?

Nein. Velxio läuft vollständig im Browser — der Editor, der Compiler (in der
Cloud) und die Simulation. Ein aktueller Chrome, Edge oder Firefox auf einem
Desktop bietet die beste Erfahrung.

### Führt es wirklich meinen Code aus?

Ja. Ihr Sketch wird mit denselben Toolchains kompiliert, die auch die echten
Boards verwenden (arduino-cli, ESP-IDF, MicroPython), und das resultierende
**echte Binärprogramm** wird von einer emulierten CPU ausgeführt — nicht
eine zeilenweise Interpretation Ihres Quellcodes. Boot-Logs,
Timing-Eigenheiten, Registerverhalten: Was Sie sehen, ist das, was der
Silizium-Chip tun würde.

### Ist Velxio kostenlos?

Der Kern-Simulator ist kostenlos, einschließlich des offenen Board-Katalogs
und der Beispielgalerie. Pro-Boards, der KI-Assistent und private Projekte
erfordern einen kostenpflichtigen Plan — siehe [Pläne](/docs/de/getting-started/plans/).

### Kann ich meine Wokwi-Projekte importieren?

Ja — die Schaltfläche **Open Project** akzeptiert Wokwi-`.zip`-Archive
neben Velxios eigenen `.vlx`-Dateien. Siehe
[Projekte speichern und öffnen](/docs/de/getting-started/projects/).

### Welche Boards werden unterstützt?

Arduino UNO/Nano/Mega, die ESP32-Familie (Classic, S3, C3), Raspberry Pi
Pico und Pico W, STM32, vollwertiges Linux-Raspberry-Pi, ATtiny85 und mehr —
die vollständige Liste mit Details finden Sie unter [Boards](/docs/de/boards/overview/).

### Funktioniert WiFi im Simulator?

Bei ESP32-Boards: Ja — die simulierte Station verbindet sich, erhält eine IP
über DHCP und kann das Internet-Gateway für MQTT/HTTP-Projekte erreichen.
Siehe [WiFi & IoT](/docs/de/wifi-iot/overview/).

### Kann ich mein Projekt auf echte Hardware übertragen?

Ja. Für ESP32-Projekte schreibt **Web Flash** die kompilierte Firmware über
USB direkt aus dem Browser auf ein echtes Board. Siehe
[Web Flash](/docs/de/wifi-iot/overview/).

### Wo melde ich einen Fehler oder fordere eine Funktion an?

Über das Menü **Help** im Editor, die Velxio
[Discord-Community](https://velxio.dev) oder die GitHub-Organisation —
ganz wie Sie bevorzugen.
