---
title: Cablaggio
description: Collega i pin con fili, instradali e codificali a colori come un vero kit di jumper.
sidebar:
  order: 3
---

## Creare una connessione

Fai clic su un **pin** su qualsiasi componente: un filo inizia a seguire il cursore. Fai clic
sul pin di destinazione per terminarlo. I fili vengono instradati ortogonalmente (curve
ad angolo retto), nel modo in cui gli schemi e le foto delle breadboard si leggono meglio.

- Premi **Escape** per annullare un filo che hai iniziato.
- Fai clic su un filo per selezionarlo; **Delete** lo rimuove.
- Puoi anche iniziare il cablaggio dall'[ispettore dei componenti](/docs/it/circuit-editor/part-inspector/):
  fai clic con il tasto destro su un componente e "tocca un pin per cablare".

## Colori dei fili

Mentre un filo è in corso (o con un filo selezionato), premi un tasto per impostare
il suo colore — la stessa convenzione di palette che gli utenti Wokwi conoscono:

| Tasto | Colore | Tasto                        | Colore                                  |
| ----- | ------ | ---------------------------- | --------------------------------------- |
| `0`   | Nero   | `6`                          | Blu                                     |
| `1`   | Marrone| `7`                          | Viola                                   |
| `2`   | Rosso  | `8`                          | Grigio                                  |
| `3`   | Arancione | `9`                       | Bianco                                  |
| `4`   | Oro    | `c` / `l` / `m` / `p` / `y`  | Ciano / Lime / Magenta / Viola / Giallo |
| `5`   | Verde  |                              |                                         |

I nuovi fili ricevono una colorazione automatica da kit di jumper: i fili vicini scelgono
colori visibilmente diversi, con rosso e nero riservati alle barre di alimentazione.

## Breadboard

Quando i pin di un componente si trovano nei fori della breadboard, **punti verdi** appaiono sui
pin inseriti — "collegato e connesso" è visibile a colpo d'occhio, senza
passare il mouse sopra. Le barre interne della breadboard (righe e strisce di alimentazione) conducono
esattamente come quelle reali.

## Realtà elettrica

I fili non sono solo disegni: il motore analogico risolve il circuito che hai
effettivamente cablato. Una resistenza di serie mancante, un cortocircuito, un ingresso flottante — tutto
si comporta (e si comporta male) come sul banco di lavoro. Se una connessione brucerebbe un
componente in modalità elettrica, il verificatore del circuito ti avvisa prima di **Run**.
