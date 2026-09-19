---
title: Scénarios
description: Pilotez la carte simulée depuis un fichier YAML - attendez le port série, envoyez des octets, appuyez sur un bouton, réglez un capteur, vérifiez une broche - le tout sur l'horloge simulée.
sidebar:
  order: 4
---

`--expect-text` répond à une seule question : cette ligne est-elle déjà apparue ? Un scénario répond au reste. C'est un fichier YAML listant les étapes que le runner exécute dans l'ordre, sur l'**horloge simulée** de la carte principale.

Les noms de champs sont ceux de Wokwi, donc un scénario Wokwi existant s'exécute sans modification.

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

L'exécution réussit lorsque la dernière étape réussit, et échoue à la première étape qui échoue. Chaque étape est signalée au fur et à mesure :

```
ok   wait-serial "READY" at 0.004 s
ok   delay 600 ms at 0.604 s
ok   expect-pin uno:13 expected 1 at 0.604 s
PASS in 0.60 s simulated (2.9 s wall) · billed 1 s · exit 0
```

## Étapes

| étape             | champs                                                                                      | ce qu'elle fait                                                                                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `delay`           | `500ms`, `2s`, `100us` ; un nombre seul est en millisecondes                                | attend que l'horloge simulée atteigne `t0 + n`                                                                                                                                        |
| `wait-serial`     | une chaîne, au plus 512 octets                                                              | correspondance de sous-chaîne, octet par octet, sur le port série reçu depuis le `wait-serial` précédent. Si le budget s'épuise avant, l'exécution se termine en `timeout`             |
| `write-serial`    | une chaîne UTF-8, ou une liste d'octets `0..255`                                            | écrit sur l'UART de la carte principale                                                                                                                                               |
| `expect-pin`      | `part-id`, `pin`, `expected` (`0`/`1`, `high`/`low`, `true`/`false` ; `value` aussi accepté) | lit la broche une fois, immédiatement. Une non-concordance fait échouer l'exécution et indique le niveau réellement lu                                                                |
| `set-control`     | `part-id`, `control`, `value` (nombre, chaîne ou booléen)                                   | `pressed` sur un bouton l'enfonce ou le relâche ; les autres contrôles sont les contrôles de capteur et attributs de la pièce. Un contrôle inconnu fait échouer l'exécution et liste ceux que cette pièce possède |
| `take-screenshot` | `part-id`, `save-to` et/ou `compare-with`, `tolerance`                                      | capture un PNG de cette pièce à ce moment de l'exécution                                                                                                                              |

Toute étape peut porter un `name:` à côté de sa clé, uniquement pour le journal.

Limites : 200 étapes et 20 captures d'écran par exécution.

## Tout est en temps simulé

`delay: 600ms` correspond à 600 millisecondes de l'horloge de l'invité, pas de l'horloge murale. Le même scénario prend le même temps simulé sur un runner chargé et sur un runner au repos, ce qui rend le résultat reproductible - et ce pour quoi vous êtes facturé.

:::caution
Ne calez pas un niveau de broche sur une ligne série. Les octets série sont mis en file d'attente dans l'UART et finissent d'être envoyés après le code qui les a mis en file, donc un `wait-serial` sur une ligne imprimée dans la même boucle qu'un `digitalWrite` peut tomber du mauvais côté du front - de fractions de milliseconde, à chaque fois. Utilisez `wait-serial` pour un sentinelle de démarrage, puis un `delay` qui place la lecture au milieu de la fenêtre attendue.
:::

## Piloter les entrées

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

`part-id` est l'id de votre `diagram.json` (ou du `.vlx`), jamais un id interne. Une étape nommant une pièce qui n'existe pas est refusée avant le début de l'exécution, avec `scenario_part_missing` et un code de sortie 2 - rien n'est facturé.

Les octets vont dans l'autre sens avec `write-serial`, et reviennent octet par octet, y compris les valeurs au-dessus de `0x7f` :

```yaml
steps:
  - wait-serial: ECHO READY
  - write-serial: "hi\n"
  - wait-serial: "hi"
```

## Captures d'écran

```yaml
- take-screenshot:
    part-id: oled1
    save-to: shots/oled.png
```

Le PNG de cette pièce est capturé à ce moment de l'exécution et écrit dans `save-to`, résolu par rapport au répertoire du projet. Une exécution dont la seule attente est une capture d'écran réussit dès que la dernière capture est prise.

:::note
`compare-with` est analysé et téléversé, mais la comparaison n'est **pas encore implémentée** : la capture d'écran est prise, l'exécution porte un avertissement indiquant qu'elle n'a pas été comparée, et elle ne fait jamais échouer l'exécution. Comparez le PNG dans votre propre job pour l'instant.
:::

## Options qui deviennent des étapes

Vous pouvez exprimer les cas simples sans fichier, et elles se combinent avec un fichier :

| option                                    | équivalent                                                                                                                     |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `--expect-text X`                         | un `wait-serial X` final                                                                                                       |
| `--screenshot-part P --screenshot-time T` | `delay T` puis `take-screenshot P`                                                                                             |
| `--fail-text Y`                           | pas une étape : `Y` est surveillé sur chaque morceau série de chaque carte, pendant toute l'exécution, et la termine en `failed` dès son apparition |

## Saisir au niveau de la carte

`--interactive` transmet votre stdin au port série de la carte principale, regroupé toutes les 20 ms. Il fonctionne avec un scénario : les deux écrivent sur le même UART, dans l'ordre d'arrivée. Fermer stdin met fin à l'entrée, pas à l'exécution - c'est le budget ou le scénario qui s'en charge.

## Pas encore pris en charge

- **Étapes tactiles** (`touch-press`, `touch-move`, `touch-release`). Le CLI les refuse au moment du lint plutôt que de les ignorer.
- **Comparaison de captures d'écran**, comme ci-dessus.
- **Puces personnalisées** dans une exécution CI : un `[[chip]]` dans la configuration est refusé avec `feature_unsupported`.

Voir [Codes de sortie](/docs/fr/ci/exit-codes/) pour ce que chaque échec renvoie à votre job, et [velxio.toml](/docs/fr/ci/velxio-toml/) pour la façon dont un scénario est attaché à un projet par défaut.
