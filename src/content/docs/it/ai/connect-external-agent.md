---
title: Connetti Claude Code o Codex
description: "Guida un progetto salvato dal tuo agente AI personale (Claude Code / Codex) tramite MCP: costruisce il circuito e scrive il firmware in tempo reale sulla tua canvas."
sidebar:
  order: 5
  badge:
    text: Pro
    variant: tip
---

La modalità [Agent](/docs/it/ai/agent-mode/) integrata di Velxio esegue l'assistente
_all'interno_ dell'app. **Connect AI agent** fa l'opposto: permette al tuo
agente personale — **Claude Code** o **OpenAI Codex** nel tuo terminale — di
accedere a un progetto Velxio salvato e costruirlo per te. Il circuito e il codice
appaiono sulla tua canvas in pochi secondi, esattamente come se li avesse creati
l'agente integrato nell'app.

Funziona tramite [MCP](https://modelcontextprotocol.io) (il Model Context
Protocol): Velxio espone i suoi strumenti per circuito e codice come server MCP,
e tu punti il tuo agente su di esso con un token specifico per progetto.

![La finestra Connect AI agent, che mostra le schede Claude Code / Codex, il comando di configurazione e la connessione attiva](../../../../assets/docs/ai/connect-agent.png)

:::note
La connessione di un agente esterno è una funzionalità **Pro**. I piani Free e Maker
usano invece le modalità [Agent](/docs/it/ai/agent-mode/) e [Tutor](/docs/it/ai/tutor-mode/)
integrate nell'app. Vedi [piani](/docs/it/getting-started/plans/).
:::

## Il modo più rapido: il plugin Claude Code

Se usi Claude Code, installa il plugin: include gli strumenti, un comando
`/velxio:build` e le conoscenze di cablaggio in un unico passaggio:

```
/plugin marketplace add velxio/velxio-plugin
/plugin install velxio@velxio
```

Poi genera un token (passaggi sotto), esportalo e riavvia Claude Code:

```bash
export VELXIO_MCP_TOKEN="vlxmcp_...il tuo token..."
```

Ora `/velxio:build un HC-SR04 che stampa la distanza su seriale` fa tutto il
lavoro. `/velxio:check` valida e compila ciò che è già presente.

## Connetti manualmente, in tre passaggi

1. **Salva prima il progetto.** L'agente si connette a un progetto salvato, quindi
   dagli un nome e salvalo se non l'hai ancora fatto.
2. **Apri il connettore.** Nell'editor, vai su **File → Connect AI agent
   (Claude/Codex)**, scegli la scheda **Claude Code** o **Codex CLI**, e clicca
   su **Generate connection token**.
3. **Esegui il comando di configurazione** che ti mostra, nel tuo terminale:

   **Claude Code**

   ```bash
   claude mcp add --transport http velxio https://velxio.dev/api/pro/mcp \
     --header "Authorization: Bearer vlxmcp_il_tuo_token_qui"
   ```

   **Codex** — aggiungi a `~/.codex/config.toml`:

   ```toml
   [mcp_servers.velxio]
   url = "https://velxio.dev/api/pro/mcp"
   http_headers = { "Authorization" = "Bearer vlxmcp_il_tuo_token_qui" }
   ```

Questo è tutto. Avvia `claude` (o `codex`) e chiedigli di costruire qualcosa:

> _"Usando gli strumenti velxio, collega un HC-SR04 alla scheda e scrivi il
> firmware che stampa la distanza su seriale."_

La riga di stato nella finestra passa a **Connected** nel momento in cui il tuo
agente effettua la prima chiamata, e i componenti, i fili e il codice arrivano
sulla tua canvas in tempo reale.

## Cosa può fare l'agente

Il tuo agente riceve lo stesso set di strumenti dell'agente integrato: può leggere
il progetto, aggiungere e collegare componenti, aggiungere schede, posizionare
parti su una breadboard, scrivere e modificare lo sketch e validare il circuito.
Ha anche le **skills** specifiche per componente di Velxio — nomi esatti dei pin,
ricette di cablaggio e insidie del simulatore — quindi collega un SSD1306 o un
DHT22 correttamente invece di tirare a indovinare.

Può anche **compilare**: `compile_sketch` compila il firmware sul server Velxio
e consegna all'agente l'output del compilatore, così può correggere i propri
errori invece di darti codice che non compila. Eseguire la simulazione e leggere
il monitor seriale richiedono ancora l'emulatore live nella tua scheda — quando
la build è verde, premi **Run** in Velxio.

## Accesso senza token

I client che supportano OAuth (tra cui Claude Code) possono connettersi con il tuo
account Velxio invece di un token incollato: puntali a `https://velxio.dev/api/pro/mcp`
senza credenziali, e scopriranno il flusso di accesso, apriranno un browser e ti
chiederanno di approvare. La schermata di consenso indica il nome del client e
dell'account, e il token di accesso ricevuto è vincolato esclusivamente
all'endpoint MCP di Velxio.

I token restano il percorso più semplice, e nulla cambia per loro.

## Sicurezza

Il token di connessione è una **capacità ristretta e specifica per progetto**,
progettata per essere incollata in una CLI di terze parti:

- **Limitato a un progetto.** Un token tocca solo il singolo progetto per cui è
  stato creato — mai gli altri tuoi progetti o il tuo account.
- **Archiviato come hash, mostrato una volta.** Velxio conserva solo un hash del
  token; il testo in chiaro viene mostrato una sola volta quando lo generi.
- **Revocabile.** La finestra elenca ogni connessione attiva con un pulsante
  **Revoke**, e un'azione **Revoke all** le termina tutte in una volta. La
  revoca ha effetto immediato.
- **Scadenza.** Ogni token smette di funzionare dopo 90 giorni; generane uno
  nuovo per continuare.

Se incolli un token da qualche parte dove non avresti dovuto, apri la finestra e
premi **Revoke** — il vecchio token è morto nell'istante in cui lo fai.

## Note e limiti

- Le modifiche dell'agente vengono salvate nel tuo progetto come qualsiasi altra
  modifica, quindi la normale cronologia di annullamento e il salvataggio
  automatico continuano a funzionare.
- Se il progetto è collegato a [GitHub Sync](/docs/it/getting-started/github-sync/), anche
  le modifiche dell'agente vengono rispecchiate nel tuo repository (in batch,
  così un'esplosione di modifiche non inonda di commit).
- Compilare, eseguire e leggere il monitor seriale avvengono nel browser, quindi
  tieni aperta la scheda Velxio mentre guidi il progetto dal tuo agente.

----- END PAGE -----
