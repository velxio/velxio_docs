---
title: Início rápido de CI
description: Do nada a uma execução bem-sucedida em cinco minutos. Instale a CLI, escreva dois arquivos, execute.
sidebar:
  order: 2
---

Você precisa de uma conta Velxio em um plano pago e de um arquivo de firmware compilado. O simulador nunca compila nada aqui: traga o `.hex`, `.bin`, `.uf2` ou `.elf` que sua própria toolchain produziu.

## 1. Instale a CLI

```bash
curl -fsSL https://velxio.dev/ci/install.sh | sh
```

Ele coloca um único binário em `~/.velxio/bin` e informa como adicioná-lo ao seu `PATH`. Windows: `iwr https://velxio.dev/ci/install.ps1 -useb | iex`.
Os binários ficam na [página de releases](https://github.com/velxio/velxio-cli/releases)
caso você prefira baixar um por conta própria.

## 2. Faça login

```bash
velxio-cli login
```

Ele imprime um código curto, abre seu navegador e aguarda. Aprove a solicitação e
a CLI armazena o que lhe for dado, então você nunca precisa lidar com um token na sua própria
máquina.

```
code     7XJ6-33M5
approve  https://velxio.dev/account/ci/device?code=7XJ6-33M5
waiting for approval of 7XJ6-33M5 (the code expires in 10 min)
signed in as velxio-cli on laptop
```

A página mostra o que está solicitando, de qual máquina e para quê, antes de você
aprovar qualquer coisa:

![A página do navegador que aprova um login da CLI: ela nomeia a ferramenta, a máquina em que ela roda e o que está solicitando, com botões Approve e Deny](../../../../assets/docs/ci/device-approve.png)

Um job de CI não tem navegador, então ele carrega um segredo em vez disso. O mesmo fluxo
o gera, nomeado em homenagem ao repositório que o manterá:

```bash
velxio-cli login --ci --name "my-firmware"
```

Esse imprime o token uma vez. Armazene-o como um segredo do repositório (no GitHub:
Settings, Secrets and variables, Actions) e nunca no próprio repositório.
Ambos os tipos aparecem em [velxio.dev/account/ci](https://velxio.dev/account/ci),
onde você pode revogar qualquer um deles.

## 3. Descreva o projeto

Dois arquivos ao lado do seu firmware. `velxio-cli init` escreve um par inicial, ou
escreva-os à mão:

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

Esse é o formato `diagram.json` do Wokwi, então um diagrama existente funciona como está.

## 4. Execute

```bash
velxio-cli run --expect-text "Hello, world!" --timeout 10000 .
```

O firmware inicializa, a saída serial aparece conforme acontece, e o comando
sai com 0 assim que o texto aparece, ou 42 quando os dez segundos simulados
se esgotam sem ele.

```
velxio-cli 0.2.1 · plan pro · 1998.3 of 2000 min left (resets 2026-10-01)
project blink (esp32-s3, 3 parts) · firmware build/blink.bin (ESP32 image, 912 KB)
run r_9f3c2a1b7e4d queued · budget 10.0 s simulated
Hello, world!
ok   wait-serial "Hello, world!" at 0.412 s
PASS in 0.41 s simulated (3.2 s wall) · billed 1 s · exit 0
```

## 5. Coloque no CI

```yaml
- name: Test with Velxio
  uses: velxio/velxio-ci-action@v1
  with:
    token: ${{ secrets.VELXIO_CLI_TOKEN }}
    path: firmware/blink
    timeout: 10000
    expect_text: "Hello, world!"
```

Compile em uma etapa anterior; esta apenas executa o que você compilou.

## Quando não funciona

- **`exit 2` antes de qualquer coisa rodar.** Um problema de configuração: a placa não é
  uma que o Velxio executa, o firmware não corresponde à placa, ou o cenário tem
  um passo nomeando uma peça que seu diagrama não possui. Nada foi cobrado.
  `velxio-cli lint .` encontra a maioria desses sem token e sem rede.
- **`exit 3`.** O token está ausente, revogado ou pertence a um plano sem CI.
- **`exit 4`.** Sem minutos restantes neste mês, ou mais jobs ao mesmo tempo do que seu
  plano executa.
- **O texto nunca chega.** Aumente `--timeout`, depois execute sem qualquer
  expectativa (`velxio-cli run --timeout 5000 .`) para ler o que o firmware
  realmente imprime.
