---
title: Velxio CI
description: Execute seu firmware em uma placa simulada a partir de um terminal ou de um job de CI, e faça o build falhar quando o firmware se comportar mal.
sidebar:
  order: 1
  badge:
    text: Paid
    variant: tip
---

O Velxio CI executa um projeto seu em nosso simulador de fora do navegador:
seu terminal, um job do GitHub Actions, qualquer CI que consiga executar um binário. A placa
inicializa seu firmware compilado real, a saída serial é transmitida de volta, e o
comando termina com código diferente de zero quando algo que você pediu não aconteceu.

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

## Para que serve

- **Detectar uma regressão de firmware antes que o hardware detecte.** Um teste que inicializa o
  binário e espera por uma linha de serial é um comando; um teste que pressiona um
  botão, define um sensor e verifica um pino é um arquivo YAML curto.
- **Testar o que você não pode manter em uma mesa.** Todas as placas que o Velxio simula estão
  disponíveis para todos os jobs, em paralelo, sem laboratório e sem gravação.
- **Manter o toolchain que você já tem.** Compile com arduino-cli, ESP-IDF,
  PlatformIO ou cargo em uma etapa anterior; o Velxio apenas executa o que foi gerado.

## Quanto custa

O CI é cobrado em **minutos simulados**: o tempo que o firmware convidado acredita
que passou, não quanto tempo nossos servidores levaram. Um teste de 10 segundos custa 10 segundos
em todas as placas, seja o emulador mais rápido ou mais lento que o tempo real.

| Plano | Minutos de CI por mês | Jobs simultâneos | Execução mais longa |
| ----- | --------------------- | ---------------- | ------------------- |
| Free  | nenhum                | nenhum           | nenhuma             |
| Maker | 200                   | 1                | 5 min               |
| Pro   | 2.000                 | 2                | 10 min              |

Uma execução que nunca inicia (uma placa desconhecida, um firmware que não corresponde à
placa, um cenário rejeitado) não custa nada. Os minutos são reiniciados no primeiro dia do
mês, UTC. Seu saldo, seu histórico de execuções e seus tokens ficam em
[/account/ci](https://velxio.dev/account/ci):

![A página da conta de CI: minutos usados neste mês, os tokens que existem com quando cada um foi usado pela última vez, e uma tabela de execuções recentes com seu status, segundos simulados e cobrados e código de saída](../../../../assets/docs/ci/account.png)

## Como um projeto se descreve

Dois arquivos no diretório para o qual você aponta o CLI:

- `velxio.toml`: a placa e o firmware. Um `wokwi.toml` do Wokwi também funciona.
- `diagram.json`: o circuito. O formato do Wokwi, então um diagrama existente é executado
  sem alterações.

Adicione `scenario.yaml` quando uma verificação serial não for suficiente: ele pode esperar por texto,
enviar texto, esperar pelo relógio simulado, verificar um pino e definir um controle em um
componente. Veja [Cenários](/docs/pt-br/ci/scenarios/).

## Próximos passos

- [Início rápido](/docs/pt-br/ci/quickstart/): uma primeira execução bem-sucedida em cinco minutos.
- [velxio.toml](/docs/pt-br/ci/velxio-toml/): todas as chaves, e como os caminhos são resolvidos.
- [Cenários](/docs/pt-br/ci/scenarios/): os passos e o que eles significam.
- [GitHub Actions](/docs/pt-br/ci/github-action/): a action e suas entradas.
- [Códigos de saída](/docs/pt-br/ci/exit-codes/): o que cada um significa para o seu job.
- [Vindo do Wokwi CI](/docs/pt-br/ci/migrating-from-wokwi/): o que muda.
