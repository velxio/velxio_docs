---
title: Velxio CI
description: Esegui il tuo firmware su una scheda simulata da un terminale o da un job CI, e fai fallire la build quando il firmware si comporta male.
sidebar:
  order: 1
  badge:
    text: Paid
    variant: tip
---

Velxio CI esegue un tuo progetto sul nostro simulatore dall'esterno del browser:
il tuo terminale, un job di GitHub Actions, qualsiasi CI in grado di eseguire un binario. La scheda
avvia il tuo firmware compilato reale, l'output seriale viene trasmesso indietro, e il
comando esce con codice diverso da zero quando qualcosa che avevi richiesto non si è verificato.

```bash
curl -fsSL https://velxio.dev/ci/install.sh | sh
velxio-cli login                           # approve in the browser, once
cd firmware/blink
velxio-cli run --expect-text "Hello, world!" --timeout 10000 .
```

```
velxio-cli 0.2.1 · plan pro · 1998.3 of 2000 min left (resets 2026-10-01)
project blink (esp32-s3, 4 parts) · firmware build/blink.bin (ESP32 image, 912 KB)
run r_9f3c2a1b7e4d queued · budget 10.0 s simulated
Hello, world!
ok   wait-serial "Hello, world!" at 0.412 s
PASS in 0.41 s simulated (3.2 s wall) · billed 1 s · exit 0
```

## A cosa serve

- **Cogli una regressione del firmware prima che lo faccia l'hardware.** Un test che avvia il
  binario e attende una riga di seriale è un solo comando; un test che preme un
  pulsante, imposta un sensore e controlla un pin è un breve file YAML.
- **Testa ciò che non puoi tenere su una scrivania.** Ogni scheda che Velxio simula è
  disponibile per ogni job, in parallelo, senza laboratorio e senza flashing.
- **Mantieni la toolchain che hai già.** Compila con arduino-cli, ESP-IDF,
  PlatformIO o cargo in uno step precedente; Velxio esegue solo ciò che ne è uscito.

## Quanto costa

La CI viene fatturata in **minuti simulati**: il tempo che il firmware guest ritiene
sia trascorso, non quanto hanno impiegato i nostri server. Un test da 10 secondi costa 10 secondi
su ogni scheda, indipendentemente dal fatto che l'emulatore lo abbia eseguito più velocemente o più lentamente del tempo reale.

| Piano | Minuti CI al mese | Job contemporanei | Durata massima |
| ----- | -------------------- | ------------ | ----------- |
| Free  | nessuno                 | nessuno         | nessuna        |
| Maker | 200                  | 1            | 5 min       |
| Pro   | 2.000                | 2            | 10 min      |

Una esecuzione che non parte mai (una scheda sconosciuta, un firmware che non corrisponde alla
scheda, uno scenario rifiutato) non costa nulla. I minuti si azzerano il primo del
mese, UTC. Il tuo saldo, la cronologia delle esecuzioni e i tuoi token si trovano su
[/account/ci](https://velxio.dev/account/ci):

![La pagina dell'account CI: minuti usati questo mese, i token esistenti con quando ciascuno è stato usato l'ultima volta, e una tabella delle esecuzioni recenti con il loro stato, i secondi simulati e fatturati e il codice di uscita](../../../../assets/docs/ci/account.png)

## Come un progetto si descrive

Due file nella directory verso cui punti la CLI:

- `velxio.toml`: la scheda e il firmware. Anche un `wokwi.toml` di Wokwi funziona.
- `diagram.json`: il circuito. Il formato di Wokwi, quindi un diagramma esistente viene eseguito
  senza modifiche.

Aggiungi `scenario.yaml` quando un controllo seriale non basta: può attendere del testo,
inviare testo, attendere il clock simulato, controllare un pin e impostare un controllo su una
parte. Vedi [Scenari](/docs/it/ci/scenarios/).

## Prossimi passi

- [Avvio rapido](/docs/it/ci/quickstart/): una prima esecuzione superata in cinque minuti.
- [velxio.toml](/docs/it/ci/velxio-toml/): ogni chiave, e come si risolvono i percorsi.
- [Scenari](/docs/it/ci/scenarios/): gli step e cosa significano.
- [GitHub Actions](/docs/it/ci/github-action/): l'action e i suoi input.
- [Codici di uscita](/docs/it/ci/exit-codes/): cosa significa ciascuno per il tuo job.
- [Arrivi da Wokwi CI](/docs/it/ci/migrating-from-wokwi/): cosa cambia.
