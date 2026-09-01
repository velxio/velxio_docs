---
title: "Referenz der Bedienelemente"
description: "Jedes Feld des Abschnitts controls in chip.json, der automatische Schieberegler-Fallback, wie Werte gespeichert werden und was zu prüfen ist, wenn ein Bedienelement nichts bewirkt."
sidebar:
  order: 6
---

Das `controls`-Array in `chip.json` beschreibt, was das Panel während der
Simulation anzeigt. Jeder Eintrag steuert das Attribut, dessen `name` mit
der `id` des Eintrags übereinstimmt.

## Eintragsfelder

| Feld | Gilt für | Bedeutung |
| --- | --- | --- |
| `id` | alle | **Erforderlich.** Das Attribut, das dieses Bedienelement steuert. Ein Eintrag ohne `id` wird übersprungen |
| `type` | alle | `"range"` für einen Schieberegler, `"button"` für einen Taster. Jeder andere Wert wird ignoriert und der Eintrag erzeugt nichts |
| `label` | alle | Text neben dem Bedienelement. Fällt zurück auf das `label` des Attributs, dann auf `id` |
| `min` | range | Untere Grenze. Fällt zurück auf das `min` des Attributs, dann auf `0` |
| `max` | range | Obere Grenze. Fällt zurück auf das `max` des Attributs, dann auf `100` |
| `step` | range | Schrittweite. Fällt zurück auf das `step` des Attributs, dann auf `1`, wenn die Spanne größer als 20 ist, andernfalls auf `0.01` |
| `unit` | range | Wird nach dem Wert angezeigt, z. B. `ppm` oder `%`. Standardmäßig leer |
| `scale` | range | `"log"` ergibt einen logarithmischen Schieberegler. Wird ignoriert, wenn `min` negativ ist, da die Kurve dort undefiniert ist |

Die **Startposition** eines Schiebereglers wird nicht vom Bedienelement
übernommen. Sie stammt vom `default` des Attributs und fällt auf `min`
zurück. Halten Sie den `default` des Attributs innerhalb des
Bedienelementbereichs, sonst öffnet sich das Panel mit dem Griff an einem
Ende fixiert.

## Der Panel-Titel

Wird vom `name` des Chips übernommen. Ein Chip ohne `name` zeigt
"Custom Chip".

## Der automatische Fallback

Sie müssen `controls` überhaupt nicht schreiben.

**Jedes Attribut, das sowohl `min` als auch `max` deklariert und das kein
explizites Bedienelement bereits beansprucht, erhält einen
Schieberegler.** Sein Label stammt vom `label` des Attributs, seine
Schrittweite vom `step` des Attributs oder wird abgeleitet: `1` für
`type: "int"`, andernfalls `1`, wenn die Spanne größer als 20 ist, und
`0.01`, wenn sie es nicht ist. Es erhält keine Einheit.

`controls` wird also nur benötigt, um einen Schieberegler umzubenennen,
eine Einheit hinzuzufügen, ihn logarithmisch zu machen oder einen Taster
zu deklarieren. Zwei praktische Konsequenzen:

- Chips, die vor der Einführung von Live-Bedienelementen geschrieben
  wurden, sind häufig bereits ohne Bearbeitung einstellbar.
- Ein Chip, dessen Attribute kein `min`/`max` und keinen
  `controls`-Abschnitt haben, zeigt **überhaupt kein Panel**. Das ist der
  übliche Grund, warum ein Klick auf einen Chip scheinbar nichts bewirkt.

## Taster

Ein `"button"`-Eintrag rendert einen Taster für Reset-Leitungen,
"Bewegung simulieren"-artige Ereignisse und alles andere, was eine Flanke
und keinen Pegel darstellt:

![Ein Taster-Bedienelement und ein Haltezeit-Schieberegler auf dem Panel des Bewegungssensors](../../../../../assets/docs/custom-chips/motion-button-panel.png) Ein Druck darauf treibt das Attribut auf `1` und etwa 150 ms später
zurück auf `0`. Ihr Chip sollte daher einen Nicht-Null-Wert als "das
Ereignis ist eingetreten" behandeln, anstatt zu versuchen, einen
bestimmten Zeitpunkt zu erfassen.

## Wo Werte gespeichert werden

Schiebereglerpositionen werden etwa 250 ms nach dem Loslassen in die
gespeicherten Eigenschaften der Komponente (unter `attrs`) gespiegelt,
wobei die ausstehenden Werte zusammengeführt werden. Deshalb schreibt das
Ziehen eines Schiebereglers nicht bei jedem Pixel in das Projekt, und
deshalb überlebt die Position auch ein Speichern und Neuladen.

Der Spiegel ist eine *Kopie*. Der Wert, den der laufende Chip liest, ist
der Live-Wert, der in dem Moment angewendet wird, in dem sich das
Bedienelement bewegt.

## Engines

| Engine | Wie der Wert ankommt |
| --- | --- |
| AVR, RP2040, ESP32 im Browser | Direkt in den Attributspeicher geschrieben, den WebAssembly bei jedem `vx_attr_read` liest |
| ESP32 auf dem QEMU-Backend | An den Worker weitergeleitet und dort im Attributspeicher der Chip-Laufzeit angewendet |

Beide sind live: kein Neukompilieren, kein Neustart, kein
"Anwenden"-Button. Die einzige Latenz ist, wie oft Ihr eigener Code
`vx_attr_read` aufruft.

## Tarif

Live-Bedienelemente sind **kostenlos**, in jedem Tarif, ebenso wie das
Schreiben, Kompilieren und Ausführen des Chips, der sie deklariert. Zwei
benachbarte Funktionen sind kostenpflichtig: das Erstellen eines Chips
oder Sensors durch KI (Maker und höher) sowie die
[My Chips](/docs/de/custom-chips/my-chips/)-Bibliothek, die einen Chip auf
dem Server für die Wiederverwendung über Projekte hinweg speichert (Pro).

## Wenn ein Bedienelement nichts bewirkt

| Symptom | Ursache |
| --- | --- |
| Ein Klick auf den Chip öffnet kein Panel | Kein `controls`-Eintrag und kein Attribut mit sowohl `min` als auch `max`, oder die Simulation ist gestoppt |
| Ein bestimmter Eintrag fehlt im Panel | Sein `type` ist weder `range` noch `button`, oder er hat keine `id` |
| Der Schieberegler bewegt sich, aber nichts ändert sich | Der Chip hat `vx_attr_read` gecacht, anstatt es dort aufzurufen, wo der Wert verwendet wird |
| Der Schieberegler startet am falschen Ende | Der `default` des Attributs liegt außerhalb des `min`/`max` des Bedienelements |
| Der Wert springt in ganzen Zahlen | `step` wurde als `1` abgeleitet, weil die Spanne größer als 20 ist; setzen Sie `step` explizit |
| Ein logarithmischer Schieberegler ist linear | `scale: "log"` wird ignoriert, wenn `min` negativ ist |

## Siehe auch

- [Tutorial: ein analoger CO2-Sensor](/docs/de/custom-chips/programmable-sensors/co2-analog/)
- [Tutorial: Temperatur und Luftfeuchtigkeit über I2C](/docs/de/custom-chips/programmable-sensors/i2c-env/)
- [Referenz der Custom-Chip-API](/docs/de/custom-chips/api/)
- Laufende Beispiele für jedes Feld hier: der
  [Taster](https://velxio.dev/example/motion-sensor-sim-button), der
  [Log-Schieberegler](https://velxio.dev/example/night-light-log-slider), ein
  [SPI](https://velxio.dev/example/spi-thermometer-live-slider)- und ein
  [UART](https://velxio.dev/example/uart-air-sensor-live-slider)-Sensor
