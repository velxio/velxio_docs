---
title: Sincronizzazione GitHub
description: Ogni salvataggio del progetto invia tramite commit lo sketch, lo stato del canvas e un README a un repository GitHub che controlli tu.
sidebar:
  order: 5
  badge: PRO
---

Ogni volta che salvi un progetto Velxio, **GitHub Sync** esegue il commit e il push
dello sketch, dello stato del canvas e di un README generato automaticamente su un repository GitHub
di tua proprietà. Il tuo codice continua a vivere nel tuo sistema di versionamento — Velxio è solo
l'editor che ci sta sopra.

GitHub Sync fa parte del piano **Pro** — vedi
[piani](/docs/it/getting-started/plans/).

## Cosa viene sincronizzato

A ogni salvataggio riuscito, Velxio scrive nella root del tuo repository:

- **`sketch.ino`** — più eventuali file `.ino` / `.h` / `.c` / `.py` aggiuntivi
  nel gruppo di file della scheda attiva.
- **`velxio.json`** — lo stato completo del canvas: tipo di scheda, componenti
  posizionati, collegamenti e layout per scheda. Chiunque cloni il tuo repository può
  aprire il progetto in Velxio e vedere esattamente lo stesso circuito.
- **`README.md`** — generato automaticamente, con il nome del progetto, la descrizione
  e un collegamento profondo "Open in Velxio". Puoi sovrascriverlo liberamente quando vuoi un
  README più ricco.

Velxio non tocca mai file al di fuori di questi percorsi — configurazione CI, documentazione, foto
e qualsiasi altra cosa nel repository viene lasciata intatta.

## Come abilitarlo

1. Apri un progetto salvato. Fai clic sul menu overflow **…** nella barra degli strumenti
   dell'editor e seleziona **Sync to GitHub**.
2. Solo la prima volta: fai clic su **Connect GitHub**. GitHub chiede a quali repository
   vuoi che Velxio possa scrivere — Velxio ottiene un accesso limitato all'installazione
   _solo_ a quei repository, nessun permesso generico "tutti i tuoi repository".
3. Seleziona il repository di destinazione dal menu a tendina e premi **Link & sync now**.
   Velxio esegue il push del commit iniziale e mostra lo SHA + il collegamento.
4. Questo è tutto. Ogni salvataggio successivo esegue il push di un altro commit; la finestra di Sync
   mostra l'ora dell'ultima sincronizzazione e un collegamento diretto al commit.

## Modello di sicurezza

Velxio utilizza una **GitHub App**, non un token OAuth personale:

- **Adesione per repository** — scegli al momento dell'installazione a quali repository Velxio può
  scrivere e puoi revocare o aggiungere repository in qualsiasi momento da
  [github.com/settings/installations](https://github.com/settings/installations).
- **Nessun token a lunga durata** — ogni sincronizzazione genera un nuovo token di installazione
  della durata di ~1 ora; i token OAuth utente vengono usati una sola volta (per recuperare il tuo
  profilo GitHub durante la connessione) e poi scartati.
- **Limite di velocità isolato** — l'App ha la sua quota, separata da quella dei tuoi
  strumenti personali.
- **Disconnessione pulita** — eliminando l'App Velxio dalle impostazioni GitHub
  l'accesso viene revocato immediatamente; Velxio rileva il webhook e
  si disconnette senza stati obsoleti.

## Conflitti e modifiche manuali

La sincronizzazione è attualmente **push unidirezionale**: Velxio → GitHub. Le modifiche manuali apportate su
GitHub tra un salvataggio e l'altro di Velxio vengono sovrascritte al salvataggio successivo — Velxio è
la fonte di verità per i file sincronizzati.

Vuoi sviluppare in locale in VS Code per un po'? **Scollega** il progetto
(finestra Sync → _Unlink_), lavora nel tuo clone locale, poi ricollega quando
sei pronto a riprendere il controllo da Velxio. La sincronizzazione bidirezionale è nella
roadmap.

## FAQ

**Cosa succede se una sincronizzazione fallisce?**
Gli errori vengono visualizzati nella finestra Sync con un'azione di ripristino (Reconnect
GitHub, scegli un repository diverso, riprova più tardi). Il salvataggio in sé non viene mai
bloccato — il tuo progetto viene sempre salvato all'interno di Velxio.

**Posso sincronizzare con un repository di cui non sono proprietario?**
Sì, purché la GitHub App sia installata sull'organizzazione e tu abbia
accesso in scrittura lì.

**E i repository privati?**
Pienamente supportati — qualsiasi cosa autorizzi durante l'installazione diventa scrivibile,
pubblica o privata.

**Posso personalizzare il README?**
Oggi Velxio sovrascrive `README.md` a ogni sincronizzazione. Nella roadmap:
saltare la sovrascrittura una volta che hai preso possesso del file.

----- END PAGE -----
