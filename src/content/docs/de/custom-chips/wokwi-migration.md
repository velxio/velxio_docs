---
title: Wokwi-Chips zu Velxio bringen
description: "Chips, die für die Wokwi-Custom-Chips-C-API geschrieben wurden, kompilieren unverändert auf Velxio, und Wokwi-Projekt-ZIPs werden mit ihren Chips importiert."
sidebar:
  order: 5
---

Wenn Sie benutzerdefinierte Chips für Wokwi geschrieben haben, kommen sie mit: Velxio ist
**quellkompatibel** mit der dokumentierten Wokwi-Custom-Chips-C-API.

## Gleiches C, unverändert

`#include "wokwi-api.h"` wird zu einem Clean-Room-Kompatibilitäts-Header aufgelöst,
der jedes dokumentierte Symbol zur Kompilierzeit auf Velxios native `vx_*`-API überträgt:

- `chip_init()` ist der Einstiegspunkt, genau wie bei Wokwi.
- `pin_init`, `pin_read`, `pin_write`, `pin_mode`, `pin_watch` (mit seiner
  `pin_watch_config_t`), `pin_adc_read`, `pin_dac_write` – alles vorhanden.
- `i2c_init`, `uart_init`, `spi_init` akzeptieren ihre Konfigurationsstrukturen; Felder
  (`connect`/`read`/`write`/`disconnect`, `rx_data`/`write_done`,
  `done`) werden eins zu eins übersetzt.
- `attr_init` / `attr_read` (und die `_float`- und String-Varianten),
  `timer_init` / `timer_start` (Mikrosekunden, für Sie umgerechnet) /
  `timer_start_ns` / `timer_stop`, `get_sim_nanos`,
  `framebuffer_init` / `buffer_write` / `buffer_read`.
- `INPUT`/`OUTPUT`/`INPUT_PULLUP`/`INPUT_PULLDOWN`/`ANALOG`,
  `OUTPUT_LOW`/`OUTPUT_HIGH`, `LOW`/`HIGH`, `RISING`/`FALLING`/`BOTH`,
  `NO_PIN` – identische Werte.

Kompilieren Sie es wie jeden Velxio-Chip: Fügen Sie das C in die `chip.c` eines Custom Chips ein
und drücken Sie **Run** (Ausführen).

## chip.json-Kompatibilität

`name`, das positionelle `pins`-Array (mit `""`-Slot-Überspringungen),
`attributes`, `controls` (Live-Schieberegler) und `display` funktionieren alle wie bei
Wokwi. `symbol` und benutzerdefinierte SVG-Grafiken werden ignoriert – Velxio zeichnet
seinen eigenen generischen Chip-Körper, der auf Ihre Pin-Anzahl skaliert ist.

## Projekt-ZIPs

**File → Open project** (Datei → Projekt öffnen) akzeptiert ein Wokwi-Projekt-ZIP. Ein
`chip-<name>`-Teil in `diagram.json` wird zu einem Custom Chip, dessen Quellen
aus der benachbarten `<name>.chip.c` / `<name>.chip.json` geladen werden, Drähte intakt.
Exporte schreiben dasselbe Layout zurück.

## Was nicht übernommen wird

- **Vorkompilierte `.wasm`-Binärdateien** – Velxios Import-Namespace unterscheidet sich;
  kompilieren Sie aus dem Quellcode neu (das dauert Sekunden, und der ZIP-Import erledigt
  dies beim ersten **Run**).
- Die experimentelle `_mcu_*`-Introspections-API.

## Bevorzugen Sie die native API für neue Chips

Die Kompatibilitätsschicht existiert, damit Ihre vorhandene Arbeit läuft. Für neue
Chips ist die native [`velxio-chip.h`-API](/docs/de/custom-chips/api/) die
gleiche Ideensammlung mit klareren Typen (Spannungen als `double`, Nanosekunden-
Timer) – und sie ist das, was die Beispiele, der KI-Agent und
[My Chips](/docs/de/custom-chips/my-chips/) nativ sprechen.
