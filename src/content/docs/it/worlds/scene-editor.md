---
title: Costruire una scena
description: Aggiungi robot, piste, rampe e ostacoli con il mouse, collegali ai tuoi motori e sensori, e leggi il formato della scena.
sidebar:
  order: 2
---

Un World creato con il kit di scene di Velxio (ogni World che **Create a world for
this circuit** genera, e l'[arena Devastator](/docs/it/worlds/example-devastator-tank/))
può essere modificato con il mouse. Le modifiche vengono salvate in `world.html`, quindi
seguono il progetto ovunque vada.

![L'editor di scene sull'arena Devastator](../../../../assets/docs/worlds/editor.png)

## Modalità modifica

Premi **Edit** (la matita) nella barra degli strumenti del World.

- **Add** posiziona un nuovo oggetto sul tappetino:

  | Gruppo     | Oggetti                                                                       |
  | ---------- | ----------------------------------------------------------------------------- |
  | Robots     | Robot 2WD, Robot 4WD, Robot tank (Devastator), Robot arm                      |
  | Tracks     | Loop, oval, figure 8, straight (nastro nero sul tappetino)                    |
  | Obstacles  | Box, wall, cylinder                                                           |
  | Terrain    | Ramp, bridge, hill                                                            |

- **Click** su un oggetto per selezionarlo e aprire le sue proprietà.
- **Drag** per spostarlo sul tappetino. **Q** ed **E** lo ruotano, **Shift** ruota
  in passi di 15 gradi, **Delete** lo rimuove.
- **Ctrl+Z** e **Ctrl+Y** annullano e ripristinano.
- **Mat settings** imposta dimensioni, colore e griglia del tappetino.

Funziona allo stesso modo nella vista 3D e 2D. Premi di nuovo Edit per tornare alla
modalità gioco.

## Collegare un robot al circuito

Un robot si muove solo con i motori che gli assegni, e riceve dati solo dai sensori che
gli assegni. Seleziona il robot e scegli, tra i componenti sulla tua area di lavoro:

| Campo                     | Cosa scegliere                                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Motors: Left / Right**  | Uno o due motori per lato. La velocità di un lato segue la media di azionamento dei suoi motori.                   |
| **Reverse left / right**  | Spunta un lato il cui "avanti" è un azionamento negativo (il suo motore è cablato o montato al contrario).         |
| **Line**                  | Sensori di linea, da sinistra a destra lungo la parte anteriore (fino a cinque, a 18 mm di distanza).              |
| **Sonar**                 | Un sensore di distanza sul paraurti anteriore (URM09, URM37 o HC-SR04).                                            |
| **Sonar servo**           | Un servo che ruota il sonar: 0 gradi guarda a destra, 90 avanti, 180 a sinistra.                                   |
| **IMU**                   | Un MPU6050 sul telaio.                                                                                             |

Un braccio robotico richiede quattro servo: base, spalla, gomito e pinza.

## Robot

| Preset | Corpo          | Velocità a pieno regime | Supera | Simile a                               |
| ------ | -------------- | ----------------------- | ------ | -------------------------------------- |
| 2WD    | 15 x 10,5 cm   | 0,55 m/s                | 1 cm   | la classica auto kit a due ruote       |
| 4WD    | 20 x 11,5 cm   | 0,61 m/s                | 1,5 cm | un'auto a quattro ruote a skid-steer   |
| Tank   | 22,5 x 22 cm   | 0,36 m/s                | 3 cm   | il DFRobot Devastator, cingolato       |

I robot si fermano contro scatole, muri, cilindri e il bordo del tappetino, e
passano sopra qualsiasi cosa non più alta della loro altezza di superamento. Su una rampa salgono
il pendio e si inclinano con esso, un po' più lentamente in salita.

## Il formato della scena

Dietro l'editor, la scena è un blocco JSON in `world.html`:

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

- Le unità sono metri e gradi. Il tappetino (`floor`, `w` per `h`) è centrato
  sull'origine: x verso destra, y in allontanamento da te, `rot` in senso antiorario da +x.
- Ogni oggetto ha un `id` univoco, una posizione `x`, `y`, e opzionalmente `rot`,
  `color` e `label`.
- `robot`: `preset` è `diff2`, `diff4` o `tank`. `bind` contiene `left`,
  `right` (liste di id dei motori), `invertLeft`, `invertRight`, `line` (id dei sensori,
  da sinistra a destra), `sonar`, `sonarServo` e `imu`.
- `track`: `shape` è `loop`, `oval`, `figure8` o `line`, con `w`, `h` e
  `tape` (la larghezza del nastro, da 0,019 a 0,025 m). `w` e `h` sono il bordo esterno
  del nastro, quindi la sua linea centrale corre a mezza larghezza di nastro all'interno. Per avviare un
  line follower sul nastro di un loop centrato sull'origine, posizionalo sul tratto rettilineo
  inferiore con direzione +x: `x: -0.3, y: -(h/2 - tape/2), rot: 0` (-0,439 per un
  loop di 0,9 m con nastro da 22 mm).
- `box` e `wall`: `w`, `d`, `h`. `cylinder`: `r`, `h`.
- `ramp`: `profile` è `wedge` (sale verso +x, poi una faccia verticale),
  `bridge` (su, piano, giù) o `hill` (una gobba morbida, attraversabile da qualsiasi lato),
  con `w`, `d`, `h`. Il sonar vede facce verticali di 3 cm o più, mai
  pendii.
- `arm`: `bind` contiene gli id dei servo `base`, `shoulder`, `elbow` e `gripper`.

Gli id in `bind` che il circuito non ha vengono ignorati, quindi una scena non
rompe mai il progetto. La [pagina Devastator](/docs/it/worlds/example-devastator-tank/)
mostra un'arena completa.
