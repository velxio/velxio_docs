---
title: Avvio rapido CI
description: Da zero a un'esecuzione superata in cinque minuti. Installa la CLI, scrivi due file, eseguila.
sidebar:
  order: 2
---

Ti serve un account Velxio su un piano a pagamento e un file firmware compilato. Il simulatore qui non compila nulla: porta il `.hex`, `.bin`, `.uf2` o `.elf` prodotto dalla tua toolchain.

## 1. Installa la CLI

```bash
curl -fsSL https://velxio.dev/ci/install.sh | sh
```

Deposita un singolo binario in `~/.velxio/bin` e ti spiega come aggiungerlo al tuo `PATH`. Windows: `iwr https://velxio.dev/ci/install.ps1 -useb | iex`. I binari sono disponibili sulla [pagina delle release](https://github.com/velxio/velxio-cli/releases) se preferisci scaricarne uno da solo.

## 2. Accedi

```bash
velxio-cli login
```

Stampa un codice breve, apre il browser e attende. Approva la richiesta e la CLI memorizza ciò che le viene fornito, così non gestisci mai un token sulla tua macchina.

```
code     7XJ6-33M5
approve  https://velxio.dev/account/ci/device?code=7XJ6-33M5
waiting for approval of 7XJ6-33M5 (the code expires in 10 min)
signed in as velxio-cli on laptop
```

La pagina mostra cosa sta facendo la richiesta, da quale macchina e per cosa, prima che tu approvi qualsiasi cosa:

![La pagina del browser che approva un accesso alla CLI: indica lo strumento, la macchina su cui gira e cosa sta richiedendo, con i pulsanti Approve e Deny](../../../../assets/docs/ci/device-approve.png)

Un job CI non ha un browser, quindi porta con sé un solo segreto. Lo stesso flusso lo genera, con il nome del repository che lo conterrà:

```bash
velxio-cli login --ci --name "my-firmware"
```

Questo lo stampa una sola volta. Salvalo come segreto del repository (in GitHub: Settings, Secrets and variables, Actions) e mai nel repository stesso. Entrambi i tipi compaiono su [velxio.dev/account/ci](https://velxio.dev/account/ci), dove puoi revocare l'uno o l'altro.

## 3. Descrivi il progetto

Due file accanto al tuo firmware. `velxio-cli init` scrive una coppia iniziale, oppure scrivili a mano:

```toml
# velxio.toml
[velxio]
version = 1
board = "esp32-s3"
firmware = "build/blink.bin"
```

```json
{
  "version": 1,
  "parts": [
    { "type": "board-esp32-s3-devkitc-1", "id": "esp", "top": 0, "left": 0 },
    {
      "type": "wokwi-led",
      "id": "led1",
      "top": 0,
      "left": 120,
      "attrs": { "color": "red" }
    },
    {
      "type": "wokwi-resistor",
      "id": "r1",
      "top": 60,
      "left": 60,
      "attrs": { "value": "220" }
    }
  ],
  "connections": [
    ["esp:2", "r1:1", "green", []],
    ["r1:2", "led1:A", "green", []],
    ["led1:C", "esp:GND.1", "black", []]
  ]
}
```

Questo è il formato `diagram.json` di Wokwi, quindi un diagramma esistente funziona così com'è.

## 4. Eseguilo

```bash
velxio-cli run --expect-text "Hello, world!" --timeout 10000 .
```

Il firmware si avvia, l'output seriale appare man mano, e il comando esce con 0 non appena il testo compare, oppure con 42 quando i dieci secondi simulati scadono senza che compaia.

```
velxio-cli 0.2.1 · plan pro · 1998.3 of 2000 min left (resets 2026-10-01)
project blink (esp32-s3, 3 parts) · firmware build/blink.bin (ESP32 image, 912 KB)
run r_9f3c2a1b7e4d queued · budget 10.0 s simulated
Hello, world!
ok   wait-serial "Hello, world!" at 0.412 s
PASS in 0.41 s simulated (3.2 s wall) · billed 1 s · exit 0
```

## 5. Mettilo in CI

```yaml
- name: Test with Velxio
  uses: velxio/velxio-ci-action@v1
  with:
    token: ${{ secrets.VELXIO_CLI_TOKEN }}
    path: firmware/blink
    timeout: 10000
    expect_text: "Hello, world!"
```

Compila in uno step precedente; questo esegue solo ciò che hai compilato.

## Quando non funziona

- **`exit 2` prima che sia partito qualcosa.** Un problema di configurazione: la board non è una che Velxio esegue, il firmware non corrisponde alla board, oppure lo scenario ha uno step che nomina una parte che il tuo diagramma non ha. Non è stato addebitato nulla. `velxio-cli lint .` trova la maggior parte di questi senza token e senza rete.
- **`exit 3`.** Il token è mancante, revocato o appartiene a un piano senza CI.
- **`exit 4`.** Nessun minuto rimasto questo mese, oppure più job contemporanei di quanti ne esegua il tuo piano.
- **Il testo non arriva mai.** Aumenta `--timeout`, poi esegui senza alcuna aspettativa (`velxio-cli run --timeout 5000 .`) per leggere cosa stampa effettivamente il firmware.
