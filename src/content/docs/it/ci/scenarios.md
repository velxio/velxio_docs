---
title: Scenari
description: "Guida la scheda simulata da un file YAML: attendi la seriale, invia byte, premi un pulsante, imposta un sensore, controlla un pin, tutto sull'orologio simulato."
sidebar:
  order: 4
---

`--expect-text` risponde a una domanda: questa riga è mai comparsa? Uno scenario
risponde al resto. È un file YAML che elenca i passi che il runner esegue in
ordine, sull'**orologio simulato** della scheda primaria.

I nomi dei campi sono quelli di Wokwi, quindi uno scenario Wokwi esistente
funziona senza modifiche.

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

L'esecuzione passa quando passa l'ultimo passo, e fallisce al primo passo che
non passa. Ogni passo viene riportato man mano che accade:

```
ok   wait-serial "READY" at 0.004 s
ok   delay 600 ms at 0.604 s
ok   expect-pin uno:13 expected 1 at 0.604 s
PASS in 0.60 s simulated (2.9 s wall) · billed 1 s · exit 0
```

## Passi

| passo             | campi                                                                                       | cosa fa                                                                                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `delay`           | `500ms`, `2s`, `100us`; un numero nudo è in millisecondi                                     | attende che l'orologio simulato raggiunga `t0 + n`                                                                                                                            |
| `wait-serial`     | una stringa, al massimo 512 byte                                                             | corrispondenza di sottostringa, byte per byte, sulla seriale ricevuta dal precedente `wait-serial`. Se il budget si esaurisce prima, l'esecuzione termina con `timeout`        |
| `write-serial`    | una stringa UTF-8, o una lista di byte `0..255`                                              | scrive sulla UART della scheda primaria                                                                                                                                       |
| `expect-pin`      | `part-id`, `pin`, `expected` (`0`/`1`, `high`/`low`, `true`/`false`; accettato anche `value`) | legge il pin una volta, immediatamente. Una discrepanza fa fallire l'esecuzione e riporta il livello effettivamente letto                                                      |
| `set-control`     | `part-id`, `control`, `value` (numero, stringa o booleano)                                   | `pressed` su un pulsante lo preme o lo rilascia; gli altri controlli sono i controlli dei sensori e gli attributi della parte. Un controllo sconosciuto fa fallire l'esecuzione e elenca quelli disponibili per quella parte |
| `take-screenshot` | `part-id`, `save-to` e/o `compare-with`, `tolerance`                                         | cattura un PNG di quella parte in quel punto dell'esecuzione                                                                                                                  |

Qualsiasi passo può avere un `name:` accanto alla sua chiave, puramente per il log.

Limiti: 200 passi e 20 screenshot per esecuzione.

## Tutto è tempo simulato

`delay: 600ms` sono 600 millisecondi dell'orologio del guest, non di quello
reale. Lo stesso scenario impiega lo stesso tempo simulato su un runner
carico e su uno inattivo, ed è questo che rende il risultato riproducibile -
e che determina ciò per cui vieni addebitato.

:::caution
Non legare il livello di un pin a una linea seriale. I byte seriali sono in
coda nella UART e finiscono di essere inviati dopo il codice che li ha messi
in coda, quindi un `wait-serial` su una riga stampata nello stesso loop di un
`digitalWrite` può cadere dal lato sbagliato del fronte - di frazioni di
millisecondo, ogni volta. Usa `wait-serial` per un sentinella di avvio, poi un
`delay` che colloca la lettura al centro della finestra che ti aspetti.
:::

## Pilotare gli input

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

`part-id` è l'id del tuo `diagram.json` (o del `.vlx`), mai uno interno. Un
passo che nomina una parte inesistente viene rifiutato prima che l'esecuzione
inizi, con `scenario_part_missing` e uscita 2 - nulla addebitato.

I byte vanno nell'altra direzione con `write-serial`, e tornano byte per byte,
compresi i valori sopra `0x7f`:

```yaml
steps:
  - wait-serial: ECHO READY
  - write-serial: "hi\n"
  - wait-serial: "hi"
```

## Screenshot

```yaml
- take-screenshot:
    part-id: oled1
    save-to: shots/oled.png
```

Il PNG di quella parte viene catturato in quel punto dell'esecuzione e scritto
in `save-to`, risolto rispetto alla directory del progetto. Un'esecuzione la
cui unica aspettativa è uno screenshot passa una volta scattato l'ultimo
screenshot.

:::note
`compare-with` viene analizzato e caricato, ma il confronto **non è ancora
implementato**: lo screenshot viene catturato, l'esecuzione porta un avviso
che dice che non è stato confrontato, e non fallisce mai l'esecuzione. Per ora
confronta il PNG nel tuo job.
:::

## Flag che diventano passi

Puoi esprimere i casi semplici senza un file, e si combinano con uno:

| flag                                      | equivalente                                                                                                                     |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `--expect-text X`                         | un `wait-serial X` finale                                                                                                      |
| `--screenshot-part P --screenshot-time T` | `delay T` poi `take-screenshot P`                                                                                              |
| `--fail-text Y`                           | non è un passo: `Y` viene osservato su ogni blocco seriale di ogni scheda, per tutta l'esecuzione, e la termina con `failed` nel momento in cui compare |

## Digitare sulla scheda

`--interactive` inoltra il tuo stdin alla porta seriale della scheda primaria,
accorpato ogni 20 ms. Funziona insieme a uno scenario: entrambi scrivono sulla
stessa UART, in ordine di arrivo. Chiudere stdin termina l'input, non
l'esecuzione - lo fanno il budget o lo scenario.

## Non ancora supportato

- **Passi touch** (`touch-press`, `touch-move`, `touch-release`). La CLI
  li rifiuta in fase di lint invece di saltarli.
- **Confronto degli screenshot**, come sopra.
- **Chip personalizzati** in un'esecuzione CI: un `[[chip]]` nella configurazione viene rifiutato con
  `feature_unsupported`.

Vedi [Codici di uscita](/docs/it/ci/exit-codes/) per cosa restituisce ogni errore al tuo
job, e [velxio.toml](/docs/it/ci/velxio-toml/) per come uno scenario viene associato
a un progetto per impostazione predefinita.
