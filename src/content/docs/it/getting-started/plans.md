---
title: Piani gratuiti e a pagamento
description: Esattamente cosa includono i piani Free, Maker e Pro — crediti AI, accesso alle schede, limiti di esecuzione, condivisione, librerie e fatturazione.
sidebar:
  order: 8
---

Velxio è gratuito da usare, e il piano gratuito non è una demo. L'editor
di circuiti, l'editor di codice, il catalogo di componenti, la galleria
di esempi e i progetti pubblici illimitati non costano nulla, e nessuna
scheda ti è nascosta.

I piani a pagamento esistono per le due cose che costano davvero da
gestire — **l'assistente AI**, dove ogni prompt è una chiamata al modello,
e **l'emulazione lato server**, dove le schede STM32 e Raspberry Pi
vengono eseguite come veri processi QEMU sulle macchine di Velxio — oltre
alle funzionalità pensate per chi usa Velxio per lavoro: progetti privati,
esportazioni, integrazioni e l'app desktop offline.

I livelli sono additivi: **Pro include tutto di Maker, che include tutto
di Free.**

## I tre piani

| | Free | Maker | Pro |
| --- | --- | --- | --- |
| Prezzo | $0 | $7 / mese | $19 / mese |
| Pagamento annuale | — | $69 / anno | $189 / anno |
| Crediti AI al giorno | 20 | 500 | 2.000 |
| Tetto mensile crediti AI | 600 | 15.000 | 60.000 |
| Modalità Agent e Tutor | No | Sì | Sì |
| Emulazione STM32 e Raspberry Pi | No | Sì | Sì |
| Visibilità del progetto | Pubblico | Pubblico, non elencato | Pubblico, non elencato, privato |
| Spazio di archiviazione librerie | 100 MB | 500 MB | 2 GB |

Pagare annualmente costa circa due mesi in meno rispetto al pagamento
mensile dello stesso piano. Entrambe le cadenze sono disponibili al
checkout con carta (Stripe) o PayPal.

## L'assistente AI

L'assistente ha tre modalità, e non sono tutte limitate allo stesso modo.

| Modalità | Cosa fa | Piani |
| --- | --- | --- |
| **Basic** | Risponde alle domande usando il tuo progetto come contesto — "perché il mio LED non si accende?", "cosa significa questo errore del compilatore?" Legge la tela e il codice ma non li modifica. | Ogni piano, incluso Free |
| **Agent** | Agisce sul progetto: aggiunge e collega componenti, scrive e corregge codice, esegue la simulazione per verificare il proprio lavoro. | Maker e Pro |
| **Tutor** | Insegna passo dopo passo sul tuo circuito — propone esercizi, controlla cosa hai costruito, spiega la teoria. | Maker e Pro |

La modalità Basic nel piano gratuito ha il suo **pool di 50 messaggi al
giorno** che non tocca i tuoi crediti AI. Quindi un account gratuito non è
limitato a 20 interazioni AI al giorno — riceve 50 messaggi di chat Basic
più 20 crediti.

### Come vengono conteggiati i crediti AI

I crediti (mostrati come contatore in fondo al pannello chat) misurano il
lavoro svolto dalle modalità Agent e Tutor:

- Una richiesta normale costa **1 credito**.
- Una richiesta grande — una che supera circa 30.000 token di contesto,
  come una lunga conversazione su un grande sketch — costa
  proporzionalmente di più, quindi un singolo prompt pesante può spendere
  diversi crediti.
- Il contatore giornaliero **si azzera a mezzanotte UTC**. I crediti non
  utilizzati non si accumulano.
- Il tetto mensile è un secondo limite, indipendente, oltre a quello
  giornaliero.
- I completamenti di codice inline nell'editor sono conteggiati
  separatamente e non spendono mai crediti Agent.

Vedi la [sezione assistente AI](/docs/it/ai/overview/) per cosa può
effettivamente fare ogni modalità.

## Schede e simulazione

**Ogni scheda nel catalogo è visibile e modificabile su ogni piano**, e la
maggior parte di esse *viene eseguita* anche su ogni piano. Due famiglie
fanno eccezione, perché sono quelle più costose da ospitare:

| Famiglia di schede | Dove viene eseguita | Free | A pagamento |
| --- | --- | --- | --- |
| Arduino / AVR, RP2040 / RP2350 (Pico, Badger 2350) | Il tuo browser | Sì, senza limite di tempo | Sì |
| Famiglia ESP32 (classic, S3, C3, C6), M5Stack, XIAO | I server di Velxio | Sì, 1 ora per esecuzione | Sì, nessun limite per esecuzione |
| **STM32** (Blue Pill, Black Pill, F4 Discovery…) | I server di Velxio | No | Sì |
| **Raspberry Pi Linux** (Zero, 1, 2, 3, 4, 5, UNIHIKER) | I server di Velxio | No | Sì |

Le schede che richiedono un piano a pagamento sono esattamente la famiglia
STM32 e la famiglia Raspberry Pi Linux — portano un **badge PRO** nel
selettore componenti. Schede di marca come la M5Stack Cardputer, la
Pimoroni Badger 2350 o la famiglia XIAO **non** sono soggette a paywall,
anche se fanno parte del catalogo ospitato.

Due limiti si applicano a tutti, inclusi i piani a pagamento:

- Una simulazione lasciata **inattiva per 2 ore** si ferma
  automaticamente.
- Una sessione Raspberry Pi ha un **tetto massimo di 2 ore** per sessione.

Anche alcune funzionalità individuali richiedono un piano a pagamento:
emulazione WiFi Pico W, caricamento di file su una microSD simulata, il
gateway IoT privato e un piccolo set di componenti premium (mostrano il
badge PRO nel selettore).

## Progetti e condivisione

| | Free | Maker | Pro |
| --- | --- | --- | --- |
| Progetti pubblici (elencati nella galleria) | Illimitati | Illimitati | Illimitati |
| Progetti non elencati (solo link, nascosti dalla galleria) | No | Sì | Sì |
| Progetti privati (solo tu) | No | No | Sì |
| Incorpora senza il badge "Powered by Velxio" | No | No | Sì |
| Cronologia e replay della simulazione | No | No | Sì |

Se un piano a pagamento scade, **nulla viene eliminato**. I progetti che
sono già privati o non elencati mantengono quella visibilità — semplicemente
non puoi crearne di nuovi o cambiare la visibilità di un progetto finché
non ti abboni di nuovo.

## Librerie e compilazione

La compilazione con `arduino-cli` e l'installazione di librerie tramite il
Library Manager funzionano su ogni piano. Ciò che cambia è lo spazio di
archiviazione e come le librerie vengono inserite:

| | Free | Maker | Pro |
| --- | --- | --- | --- |
| Library Manager + compilazione | Sì | Sì | Sì |
| Spazio per librerie installate e caricate | 100 MB | 500 MB | 2 GB |
| Carica la tua libreria come `.zip` | No | Sì | Sì |
| Coda di compilazione prioritaria nelle ore di punta | No | Sì | Sì |

Vedi [Librerie](/docs/it/programming/libraries/) per come viene conteggiata
la quota.

## Desktop, esportazioni e integrazioni

| | Free | Maker | Pro |
| --- | --- | --- | --- |
| Velxio Desktop, offline (Linux, Windows, macOS) | No | Sì | Sì |
| Gateway IoT privato | No | Sì | Sì |
| Costruttore di parti personalizzate AI — programma i tuoi chip simulabili | No | No | Sì |
| Esportazione BOM (CSV, pronto per Mouser o Digi-Key) | No | No | Sì |
| Esportazione schema (PNG) | No | No | Sì |
| [Sincronizzazione GitHub](/docs/it/getting-started/github-sync/) | No | No | Sì |
| Supporto diretto dal manutentore | No | No | Sì |

## Prova gratuita

Puoi provare le modalità Agent e Tutor **gratuitamente per 7 giorni**,
senza carta. La prova funziona con 500 crediti al giorno — la stessa
dotazione giornaliera di Maker — e sblocca il set di funzionalità Pro così
puoi valutare tutto. Una prova per account; avviala dalla
[pagina dei prezzi](https://velxio.dev/pricing).

## Fatturazione

- **Metodi di pagamento**: carta tramite Stripe Checkout, o PayPal.
  Entrambi supportano fatturazione mensile e annuale.
- **Cancella quando vuoi**, dal portale di abbonamento nel menu del tuo
  account. La cancellazione interrompe il rinnovo successivo; mantieni
  l'accesso fino alla fine del periodo già pagato.
- **Rimborsi**: entro 14 giorni dall'addebito più recente, senza fare
  domande. Scrivi a davidmonterocrespo24@gmail.com.
- **Cambio di livello**: cancella prima l'abbonamento corrente, poi
  abbònati all'altro.

Le istruzioni passo passo si trovano in
[Abbonamento e fatturazione](/docs/it/account/subscription/).

## Classi e istituzioni

[Velxio for Classroom](https://velxio.dev/for-schools) offre a ogni
studente di un corso accesso Pro completo con un unico contratto
istituzionale, a partire da $40 per studente all'anno con sconti sul
volume.

## Self-hosting

Velxio è open-source sotto licenza AGPLv3, e l'app ospitata su velxio.dev
è costruita dalla stessa fonte. Puoi eseguirlo tu stesso gratuitamente — i
piani a pagamento finanziano il servizio ospitato, i server di emulazione
e i provider AI dietro di esso.

Per i prezzi correnti e il checkout, vedi la
[pagina dei prezzi](https://velxio.dev/pricing).
