---
title: Mondi 3D
description: Metti il tuo circuito in una scena 3D o 2D. Il firmware della scheda guida il robot, e i sensori del robot leggono la scena.
sidebar:
  order: 1
---

Un **World** mette il tuo circuito in una scena fisica. Il firmware viene eseguito sulla scheda emulata esattamente come farebbe su quella reale: i motori che aziona muovono un robot, i servo che imposta fanno girare un braccio o un sensore, e i sensori di linea, di distanza e di movimento leggono ciò che si trova sotto e davanti al robot. Lo stesso codice viene poi eseguito sull'hardware reale.

![Il line follower Romeo ESP32-S3 nel suo World, accanto al circuito in esecuzione](../../../../assets/docs/worlds/romeo-running.png)

## Apri il World

Ogni progetto con una scheda ha un pulsante **3D** nell'intestazione della tela, accanto al selettore della scheda:

![Il pulsante 3D accanto al selettore della scheda](../../../../assets/docs/worlds/3d-button.png)

La prima volta, si apre un'introduzione con tre modi per iniziare:

![L'introduzione al World 3D](../../../../assets/docs/worlds/intro.png)

- **Start from a robot**: apri un progetto robot completo (scheda, motori e sensori cablati, firmware e World) e premi **Run**. Ce ne sono cinque: il [line follower Romeo ESP32-S3](/docs/it/worlds/example-romeo-line-follower/), il [carro armato Devastator](/docs/it/worlds/example-devastator-tank/), un [line follower Arduino Uno](https://velxio.dev/example/uno-l293d-line-follower-3d) con un L293D, un [evita-ostacoli ESP32](https://velxio.dev/example/esp32-obstacle-avoider-3d) con un HC-SR04, e un [braccio robotico ESP32](https://velxio.dev/example/esp32-servo-arm-3d) i cui quattro servo seguono quattro manopole.
- **Create a world for this circuit**: Velxio costruisce una scena iniziale da ciò che è presente sulla tua tela. I motori diventano un robot (due o quattro ruote), i sensori di linea ricevono una pista adesiva sotto di loro, un sensore di distanza riceve ostacoli davanti a sé, e i servo da soli diventano un braccio robotico su un piccolo tavolo.
- **Copy AI prompt**: copia un brief con le tue schede, componenti, cablaggio e firmware per ChatGPT, Claude o Gemini, così un'IA può scrivere qualsiasi World tu descriva. Vedi [Scrivi il tuo World](/docs/it/worlds/write-your-own/).

Una volta che il progetto ha un World, il pulsante 3D alterna tra il World e il tuo codice.

## Premi Run

Quando la simulazione inizia, l'area dell'editor mostra il World e la tela resta accanto, così puoi vedere i motori accendersi sul circuito mentre il robot si muove. Il ciclo si chiude circa 125 volte al secondo:

1. Il firmware imposta i pin: una direzione e un duty PWM per ogni motore, un impulso per ogni servo.
2. Velxio legge l'azionamento di ogni motore (attraverso qualunque driver usi il circuito) e l'angolo di ogni servo, e li invia al World.
3. Il World muove il robot e misura la scena: il nastro sotto ogni sensore di linea, l'ostacolo più vicino davanti a ogni sensore di distanza, l'accelerazione e la velocità di rotazione del robot per un IMU.
4. Velxio scrive quelle letture nei componenti sensore, e il firmware le legge alla sua successiva `digitalRead()`, `pulseIn()` o trasferimento I2C.

Il World funziona sul **clock simulato** della scheda, non sul tempo reale. Se il tuo computer esegue la simulazione a metà velocità, anche il robot si muove a metà velocità, e resta comunque coerente con `millis()` del firmware.

## La barra del World

| Controllo          | Cosa fa                                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------------------------- |
| **World / HTML**   | Mostra la scena, o il sorgente `world.html` che vi sta dietro.                                            |
| **Guide**          | Una breve spiegazione del World, sopra la scena.                                                          |
| **Copy AI prompt** | Copia il brief per una chat IA esterna (vedi [Scrivi il tuo World](/docs/it/worlds/write-your-own/)).        |
| **Reload**         | Riavvia il World dal suo file.                                                                            |
| **Full screen**    | Mostra solo il World. Premi Esc per tornare indietro.                                                     |

I World creati con il kit di scene di Velxio aggiungono una propria barra degli strumenti all'interno della scena: **Edit**, **Add**, **3D / 2D**, **Camera** (orbita, segui il robot, dall'alto) e **Reset** (riporta i robot al loro punto di partenza). Vedi [Costruisci una scena](/docs/it/worlds/scene-editor/).

## 3D o 2D

La vista 3D richiede WebGL. La vista dall'alto **2D** disegna la stessa scena ed esegue la stessa fisica senza scheda grafica, quindi funziona su qualsiasi computer scolastico, ed è il fallback quando il 3D non è disponibile.

![L'arena Devastator nella vista dall'alto 2D](../../../../assets/docs/worlds/view-2d.png)

## Con cosa funziona un World

- **Legge**: motori DC e motoriduttori (dietro un L293D, un transistor o MOSFET, un driver integrato della scheda, o direttamente su un pin), servo e LED.
- **Alimenta**: il line tracker DFRobot Gravity, i sensori a ultrasuoni URM09 e URM37, l'HC-SR04 e l'IMU MPU6050.

Ogni altro componente (display, buzzer, LED RGB) continua a funzionare sulla tela. Dettagli e ricette per il firmware: [Motori e sensori](/docs/it/worlds/motors-and-sensors/).

## È un file

Un World è un singolo file, `world.html`, nel gruppo di file della scheda accanto allo sketch. Viene salvato, condiviso ed esportato con il progetto, e non viene mai inviato alla scheda: non viene compilato, non viene scritto nella flash e non viene copiato sulla scheda microSD. Elimina il file e il progetto non avrà più un World.
