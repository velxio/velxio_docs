---
title: Sensori programmabili
description: Costruisci un sensore il cui valore modifichi con uno slider mentre la simulazione è in esecuzione, e capisci esattamente come lo slider raggiunge il tuo chip in esecuzione.
sidebar:
  order: 3
---

Un **sensore programmabile** è un normale chip personalizzato i cui valori
vengono guidati da uno slider *mentre la simulazione è in esecuzione*. Un
sensore di CO2 di cui vari i ppm per testare una soglia di allarme. Una
sonda di temperatura che spingi oltre 85 °C per vedere cosa fa il firmware.
Un sensore di luce che regoli a mano.

Nulla cambia nel chip: è lo stesso componente WebAssembly descritto in
[Per iniziare](/docs/it/custom-chips/getting-started/). Ciò che questa pagina
aggiunge è il filo che porta il valore di uno slider in un chip già in
esecuzione, senza ricompilare o riavviare nulla.

## Il contratto, in tre parti

Ogni sensore programmabile è composto da queste tre parti e nient'altro.

**1. Un attributo** contiene il valore regolabile.

```c
S.ppm = vx_attr_register("ppm", 1000);
```

**2. Una voce `controls`** in `chip.json` mette uno slider sullo schermo.
Fa riferimento all'attributo **con lo stesso id**:

```json
"controls": [
  { "id": "ppm", "label": "CO2 (ppm)", "type": "range",
    "min": 400, "max": 5000, "step": 10, "unit": "ppm" }
]
```

**3. Il tuo codice rilegge l'attributo** ogni volta che gli serve il valore:

```c
double ppm = vx_attr_read(S.ppm);   /* il valore dello slider in questo momento */
```

Premi **Run** (Esegui), fai clic sul chip e si apre:

![Il pannello di controllo live di un chip sensore di CO2 in esecuzione: uno slider da 400 a 5000 ppm](../../../../../assets/docs/custom-chips/sensor-slider-panel.png)

Il terzo punto è quello che mette in difficoltà le persone. Leggi
l'attributo una volta in `chip_setup()` e mettilo in cache in una
variabile, e lo slider apparirà, si muoverà e non farà assolutamente
nulla. `vx_attr_read` è economico; chiamalo all'interno del tuo callback
timer, del tuo gestore di lettura I2C, ovunque il valore sia realmente
necessario.

:::tip[Potresti avere già degli slider]
Se salti del tutto la sezione `controls`, **qualsiasi attributo che
dichiara sia `min` che `max` riceve comunque uno slider**. I chip che hai
scritto prima che questo esistesse sono spesso già regolabili. `controls`
è il modo per rinominare uno slider, assegnargli un'unità, renderlo
logaritmico o trasformarlo in un pulsante.
:::

## Come il valore raggiunge il tuo chip

Vale la pena capirlo, perché i due motori di simulazione seguono percorsi
diversi e le modalità di errore differiscono.

| Passaggio | Cosa succede |
| --- | --- |
| Trascini lo slider | Il pannello scrive nel registro di aggiornamento del sensore, con chiave basata su questa istanza del chip |
| Motore browser (AVR, RP2040, ESP32 nel browser) | Il valore viene scritto direttamente nella mappa degli attributi che il WebAssembly in esecuzione legge a ogni `vx_attr_read`. Nessun passaggio di messaggi, nessun riavvio |
| ESP32 sotto QEMU | Il chip vive in un worker, quindi il valore viene inoltrato ad esso come aggiornamento dell'attributo e applicato lì |
| Ogni 250 ms di inattività | Gli ultimi valori vengono rispecchiati nelle proprietà salvate del componente, quindi la posizione dello slider sopravvive a un salvataggio e a un ricaricamento |

Due conseguenze che vale la pena conoscere:

- **Non esiste un passaggio "Applica".** La successiva `vx_attr_read`
  restituisce il nuovo valore. Se il tuo chip legge l'attributo solo una
  volta al secondo, è questo il tempo che impiega lo slider a produrre un
  effetto visibile.
- **Il pannello è per istanza.** Due copie dello stesso chip su una
  tela hanno slider indipendenti, perché i controlli sono sintetizzati dal
  manifest di ciascuna istanza.

## Valori predefiniti in fase di progettazione rispetto a valori live

Sono superfici diverse e le persone le confondono:

- **Fermo**: fai clic con il pulsante destro sul chip per aprire
  l'ispettore dei componenti. Ciò che imposti lì è il valore predefinito
  salvato dell'attributo, il valore con cui il chip parte.
- **In esecuzione**: fai clic sul chip. Si apre il pannello dello slider.
  Ciò che imposti lì è il valore live, applicato immediatamente.

## Provane uno prima

Ogni pattern ha un circuito eseguibile nella galleria. Premi Run (Esegui),
poi fai clic sul chip:

| Esempio | Cosa insegna |
| --- | --- |
| [Sensore CO2 (slider live)](https://velxio.dev/example/co2-sensor-live-slider) | La ricetta analogica: slider a tensione a `analogRead` |
| [Sensore ambientale I2C (slider live)](https://velxio.dev/example/i2c-env-sensor-live-sliders) | Due slider dietro una mappa di registri a `0x44` |
| [Sensore di movimento (pulsante simulato)](https://velxio.dev/example/motion-sensor-sim-button) | Il controllo `button`: trigger momentaneo più uno slider di mantenimento |
| [Luce notturna (slider lux logaritmico)](https://velxio.dev/example/night-light-log-slider) | `scale: "log"`: cinque decadi di lux su un solo slider, la lampada scatta sotto i 50 lx |
| [Termometro SPI (slider live)](https://velxio.dev/example/spi-thermometer-live-slider) | Temporizzazione slave SPI: latch sul fronte di discesa di CS |
| [Sensore aria UART (slider live)](https://velxio.dev/example/uart-air-sensor-live-slider) | Sensore seriale push-style in SoftwareSerial |

## Dove andare dopo

- [Tutorial: un sensore di CO2 analogico](/docs/it/custom-chips/programmable-sensors/co2-analog/)
  — l'esempio completo più breve, dal chip vuoto al tracciamento di uno
  slider con `analogRead`.
- [Tutorial: temperatura e umidità su I2C](/docs/it/custom-chips/programmable-sensors/i2c-env/)
  — il pattern per qualsiasi sensore a protocollo digitale, con due slider
  e una mappa di registri.
- [Riferimento `controls`](/docs/it/custom-chips/programmable-sensors/reference/)
  — ogni campo, le regole di fallback automatiche e cosa controllare
  quando uno slider non fa nulla.

:::note[Gratuito]
Tutto in questa pagina è gratuito, su ogni piano: scrivere un chip,
compilarlo, eseguirlo e trascinare i suoi slider. Ciò che è a pagamento è
far scrivere un chip all'IA (Maker e versioni superiori) e la libreria
server-side [My Chips](/docs/it/custom-chips/my-chips/) (Pro).
:::
