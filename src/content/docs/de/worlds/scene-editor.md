---
title: Eine Szene erstellen
description: Füge Roboter, Strecken, Rampen und Hindernisse mit der Maus hinzu, verbinde sie mit deinen Motoren und Sensoren und lies das Szenenformat.
sidebar:
  order: 2
---

Eine World, die mit Velxios Szenen-Kit erstellt wurde (jede World, die **Create a world for
this circuit** erzeugt, und die [Devastator-Arena](/docs/de/worlds/example-devastator-tank/)),
kann mit der Maus bearbeitet werden. Änderungen werden in `world.html` gespeichert, sodass sie
überallhin mitwandern, wohin das Projekt geht.

![Der Szeneneditor auf der Devastator-Arena](../../../../assets/docs/worlds/editor.png)

## Bearbeitungsmodus

Drücke **Edit** (der Stift) in der Symbolleiste der World.

- **Add** platziert ein neues Objekt auf der Matte:

  | Gruppe     | Objekte                                                                       |
  | ---------- | ----------------------------------------------------------------------------- |
  | Roboter    | Robot 2WD, Robot 4WD, Robot tank (Devastator), Robot arm                      |
  | Strecken   | Loop, oval, figure 8, straight (schwarzes Klebeband auf der Matte)            |
  | Hindernisse| Box, wall, cylinder                                                           |
  | Gelände    | Ramp, bridge, hill                                                            |

- **Klicke** auf ein Objekt, um es auszuwählen und seine Eigenschaften zu öffnen.
- **Ziehe** es, um es auf der Matte zu bewegen. **Q** und **E** drehen es, **Shift** dreht
  in 15-Grad-Schritten, **Delete** entfernt es.
- **Ctrl+Z** und **Ctrl+Y** machen rückgängig und stellen wieder her.
- **Mat settings** legt Größe, Farbe und Raster der Matte fest.

Es funktioniert in der 3D- und der 2D-Ansicht gleich. Drücke erneut Edit, um zum
Wiedergabemodus zurückzukehren.

## Einen Roboter mit der Schaltung verbinden

Ein Roboter bewegt sich nur mit den Motoren, die du ihm gibst, und liefert nur die Sensoren,
die du ihm gibst. Wähle den Roboter aus und wähle aus den Bauteilen auf deiner Arbeitsfläche:

| Feld                     | Was auszuwählen ist                                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| **Motors: Left / Right** | Ein oder zwei Motoren pro Seite. Die Geschwindigkeit einer Seite folgt dem durchschnittlichen Antrieb ihrer Motoren. |
| **Reverse left / right** | Aktiviere eine Seite, deren "vorwärts" ein negativer Antrieb ist (ihr Motor ist andersherum verdrahtet oder montiert). |
| **Line**                 | Linienverfolger, von links nach rechts über die Front (bis zu fünf, 18 mm Abstand).                                |
| **Sonar**                | Ein Abstandssensor an der vorderen Stoßstange (URM09, URM37 oder HC-SR04).                                         |
| **Sonar servo**          | Ein Servo, der das Sonar dreht: 0 Grad blickt nach rechts, 90 nach vorn, 180 nach links.                           |
| **IMU**                  | Ein MPU6050 am Chassis.                                                                                            |

Ein Roboterarm nimmt vier Servos: Basis, Schulter, Ellbogen und Greifer.

## Roboter

| Preset | Körper         | Geschwindigkeit bei Vollantrieb | Steigt über | Wie                                    |
| ------ | -------------- | ------------------------------- | ----------- | -------------------------------------- |
| 2WD    | 15 x 10,5 cm   | 0,55 m/s                        | 1 cm        | das klassische zweirädrige Kit-Auto    |
| 4WD    | 20 x 11,5 cm   | 0,61 m/s                        | 1,5 cm      | ein vierrädriges Skid-Steer-Auto       |
| Tank   | 22,5 x 22 cm   | 0,36 m/s                        | 3 cm        | der DFRobot Devastator, mit Ketten     |

Roboter stoppen an Boxen, Wänden, Zylindern und dem Rand der Matte und
fahren über alles, was nicht höher ist als ihre Steighöhe. Auf einer Rampe fahren sie
die Steigung hinauf und neigen sich mit ihr, bergauf etwas langsamer.

## Das Szenenformat

Hinter dem Editor ist die Szene ein JSON-Block in `world.html`:

```html
<!doctype html>
<html><body>
<script type="application/json" id="velxio-scene">
{ "version": 1, "view": "3d", "floor": { "w": 2.4, "h": 1.6, "grid": true },
  "objects": [
    { "id": "track1", "type": "track", "shape": "loop", "x": 0, "y": 0, "w": 2.1, "h": 0.9, "tape": 0.022 },
    { "id": "robot1", "type": "robot", "preset": "diff2", "x": -0.3, "y": -0.439, "rot": 0,
      "bind": { "left": ["motorL"], "right": ["motorR"], "line": ["lineL", "lineC", "lineR"] } },
    { "id": "box1", "type": "box", "x": 0.7, "y": 0.05, "w": 0.15, "d": 0.15, "h": 0.15, "color": "#c0392b" }
  ] }
</script>
<script>velxio.kit.start();</script>
</body></html>
```

- Die Einheiten sind Meter und Grad. Die Matte (`floor`, `w` mal `h`) ist auf
  den Ursprung zentriert: x nach rechts, y von dir weg, `rot` gegen den Uhrzeigersinn von +x.
- Jedes Objekt hat eine eindeutige `id`, eine Position `x`, `y` und optional `rot`,
  `color` und `label`.
- `robot`: `preset` ist `diff2`, `diff4` oder `tank`. `bind` enthält `left`,
  `right` (Listen von Motor-Ids), `invertLeft`, `invertRight`, `line` (Sensor-
  Ids, von links nach rechts), `sonar`, `sonarServo` und `imu`.
- `track`: `shape` ist `loop`, `oval`, `figure8` oder `line`, mit `w`, `h` und
  `tape` (die Bandbreite, 0,019 bis 0,025 m). `w` und `h` sind die Außenkante
  des Bands, sodass seine Mittellinie eine halbe Bandbreite weiter innen verläuft. Um einen
  Linienfolger auf dem Band einer um den Ursprung zentrierten Schleife zu starten, setze ihn auf die untere
  Gerade mit Richtung +x: `x: -0.3, y: -(h/2 - tape/2), rot: 0` (-0,439 für eine
  0,9 m große Schleife mit 22 mm Band).
- `box` und `wall`: `w`, `d`, `h`. `cylinder`: `r`, `h`.
- `ramp`: `profile` ist `wedge` (steigt in Richtung +x an, dann eine vertikale Fläche),
  `bridge` (hinauf, flach, hinunter) oder `hill` (eine sanfte Erhebung, von jeder Seite überquerbar),
  mit `w`, `d`, `h`. Das Sonar sieht vertikale Flächen von 3 cm oder mehr, niemals
  Steigungen.
- `arm`: `bind` enthält die Servo-Ids `base`, `shoulder`, `elbow` und `gripper`.

Ids in `bind`, die die Schaltung nicht hat, werden ignoriert, sodass eine Szene niemals
das Projekt beschädigt. Die [Devastator-Seite](/docs/de/worlds/example-devastator-tank/)
zeigt eine vollständige Arena.
