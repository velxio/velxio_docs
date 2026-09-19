---
title: Szenarien
description: Steuere das simulierte Board aus einer YAML-Datei - warte auf Serial, sende Bytes, drücke einen Button, setze einen Sensor, prüfe einen Pin - alles auf der simulierten Uhr.
sidebar:
  order: 4
---

`--expect-text` beantwortet eine Frage: Ist diese Zeile jemals erschienen? Ein Szenario
beantwortet den Rest. Es ist eine YAML-Datei, die Schritte auflistet, die der Runner
in Reihenfolge ausführt, auf der **simulierten Uhr** des primären Boards.

Die Feldnamen stammen von Wokwi, sodass ein bestehendes Wokwi-Szenario unverändert läuft.

```yaml
# scenario.yaml
name: uno-ready boots and blinks
version: 1
steps:
  - wait-serial: READY
  - delay: 600ms
  - expect-pin:
      part-id: uno
      pin: 13
      expected: 1
```

```bash
velxio-cli run --scenario scenario.yaml .
```

Der Lauf besteht, wenn der letzte Schritt besteht, und schlägt beim ersten Schritt fehl, der
nicht besteht. Jeder Schritt wird gemeldet, sobald er geschieht:

```
ok   wait-serial "READY" at 0.004 s
ok   delay 600 ms at 0.604 s
ok   expect-pin uno:13 expected 1 at 0.604 s
PASS in 0.60 s simulated (2.9 s wall) · billed 1 s · exit 0
```

## Schritte

| step              | fields                                                                                      | was es tut                                                                                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `delay`           | `500ms`, `2s`, `100us`; eine bloße Zahl ist Millisekunden                                    | wartet, bis die simulierte Uhr `t0 + n` erreicht                                                                                                                              |
| `wait-serial`     | ein String, höchstens 512 Bytes                                                             | Substring-Match, byte-genau, über die seit dem vorherigen `wait-serial` empfangenen Serial-Daten. Wenn das Budget zuerst aufgebraucht ist, endet der Lauf mit `timeout`        |
| `write-serial`    | ein UTF-8-String oder eine Liste von Bytes `0..255`                                         | schreibt auf den UART des primären Boards                                                                                                                                     |
| `expect-pin`      | `part-id`, `pin`, `expected` (`0`/`1`, `high`/`low`, `true`/`false`; `value` wird ebenfalls akzeptiert) | liest den Pin einmal, sofort. Eine Abweichung lässt den Lauf fehlschlagen und meldet den tatsächlich gelesenen Pegel                                                          |
| `set-control`     | `part-id`, `control`, `value` (Zahl, String oder Boolean)                                   | `pressed` auf einem Button drückt oder löst ihn; andere Controls sind die Sensor-Controls und Attribute des Parts. Ein unbekanntes Control lässt den Lauf fehlschlagen und listet die auf, die dieser Part hat |
| `take-screenshot` | `part-id`, `save-to` und/oder `compare-with`, `tolerance`                                   | erfasst an diesem Punkt des Laufs ein PNG dieses Parts                                                                                                                        |

Jeder Schritt kann neben seinem Schlüssel ein `name:` tragen, rein für das Log.

Limits: 200 Schritte und 20 Screenshots pro Lauf.

## Alles ist simulierte Zeit

`delay: 600ms` sind 600 Millisekunden der Uhr des Gasts, nicht der Wanduhr.
Dasselbe Szenario benötigt dieselbe simulierte Zeit auf einem ausgelasteten Runner
und auf einem im Leerlauf, was das Ergebnis reproduzierbar macht - und wofür
du abgerechnet wirst.

:::caution
Binde keinen Pin-Pegel an eine Serial-Leitung. Serial-Bytes werden im UART
eingereiht und sind erst nach dem Code, der sie eingereiht hat, fertig gesendet, sodass ein `wait-serial` auf einer
Zeile, die in derselben Schleife wie ein `digitalWrite` ausgegeben wird, auf der falschen Seite
der Flanke landen kann - um Bruchteile einer Millisekunde, jedes Mal. Verwende `wait-serial`
für einen Boot-Sentinel, dann ein `delay`, das den Lesevorgang in die Mitte des
Fensters legt, das du erwartest.
:::

## Eingaben steuern

```yaml
steps:
  - wait-serial: READY
  - set-control:
      part-id: btn1
      control: pressed
      value: 1
  - delay: 50ms
  - set-control:
      part-id: btn1
      control: pressed
      value: 0
  - wait-serial: "pressed"
```

`part-id` ist die id aus deiner `diagram.json` (oder der `.vlx`), niemals eine
interne. Ein Schritt, der einen nicht existierenden Part benennt, wird abgelehnt, bevor
der Lauf startet, mit `scenario_part_missing` und Exit 2 - nichts abgerechnet.

Bytes gehen den anderen Weg mit `write-serial` und kommen byte-genau zurück,
einschließlich Werten über `0x7f`:

```yaml
steps:
  - wait-serial: ECHO READY
  - write-serial: "hi\n"
  - wait-serial: "hi"
```

## Screenshots

```yaml
- take-screenshot:
    part-id: oled1
    save-to: shots/oled.png
```

Das PNG dieses Parts wird an diesem Punkt des Laufs erfasst und nach
`save-to` geschrieben, aufgelöst relativ zum Projektverzeichnis. Ein Lauf, dessen einzige
Erwartung ein Screenshot ist, besteht, sobald der letzte Screenshot aufgenommen ist.

:::note
`compare-with` wird geparst und hochgeladen, aber der Vergleich ist **noch
nicht implementiert**: Der Screenshot wird erfasst, der Lauf trägt eine Warnung,
dass er nicht verglichen wurde, und er lässt den Lauf niemals fehlschlagen. Vergleiche das PNG vorerst in
deinem eigenen Job.
:::

## Flags, die zu Schritten werden

Du kannst die einfachen Fälle ohne eine Datei ausdrücken, und sie kombinieren sich mit einer:

| flag                                      | equivalent                                                                                                                     |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `--expect-text X`                         | ein abschließendes `wait-serial X`                                                                                                        |
| `--screenshot-part P --screenshot-time T` | `delay T`, dann `take-screenshot P`                                                                                             |
| `--fail-text Y`                           | kein Schritt: `Y` wird bei jedem Serial-Chunk jedes Boards überwacht, für den gesamten Lauf, und beendet ihn mit `failed`, sobald es erscheint |

## Am Board tippen

`--interactive` leitet deine stdin an den Serial-Port des primären Boards weiter,
zusammengefasst alle 20 ms. Es funktioniert zusammen mit einem Szenario: beide schreiben auf
denselben UART, in Ankunftsreihenfolge. Das Schließen von stdin beendet die Eingabe, nicht den Lauf -
das tun das Budget oder das Szenario.

## Noch nicht unterstützt

- **Touch-Schritte** (`touch-press`, `touch-move`, `touch-release`). Die CLI
  lehnt sie zur Lint-Zeit ab, anstatt sie zu überspringen.
- **Screenshot-Vergleich**, wie oben.
- **Custom Chips** in einem CI-Lauf: ein `[[chip]]` in der Konfiguration wird mit
  `feature_unsupported` abgelehnt.

Siehe [Exit codes](/docs/de/ci/exit-codes/) für das, was jeder Fehler an deinen
Job zurückgibt, und [velxio.toml](/docs/de/ci/velxio-toml/) dafür, wie ein Szenario
standardmäßig an ein Projekt angehängt wird.
