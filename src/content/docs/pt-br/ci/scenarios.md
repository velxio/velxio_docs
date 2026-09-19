---
title: Cenários
description: Controle a placa simulada a partir de um arquivo YAML - aguarde a serial, envie bytes, pressione um botão, defina um sensor, verifique um pino - tudo no relógio simulado.
sidebar:
  order: 4
---

`--expect-text` responde a uma pergunta: essa linha chegou a aparecer? Um cenário
responde ao resto. É um arquivo YAML que lista passos que o runner executa em
ordem, no **relógio simulado** da placa primária.

Os nomes dos campos são os do Wokwi, então um cenário Wokwi existente roda sem
alterações.

```yaml
# scenario.yaml
name: uno-ready boots and blinks
version: 1
steps:
  - wait-serial: READY
  - delay: 600ms
  - expect-pin:
      part-id: uno
      pin: 13
      expected: 1
```

```bash
velxio-cli run --scenario scenario.yaml .
```

A execução passa quando o último passo passa, e falha no primeiro passo que
não passa. Cada passo é reportado conforme acontece:

```
ok   wait-serial "READY" at 0.004 s
ok   delay 600 ms at 0.604 s
ok   expect-pin uno:13 expected 1 at 0.604 s
PASS in 0.60 s simulated (2.9 s wall) · billed 1 s · exit 0
```

## Passos

| passo             | campos                                                                                      | o que faz                                                                                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `delay`           | `500ms`, `2s`, `100us`; um número puro é milissegundos                                       | aguarda até o relógio simulado atingir `t0 + n`                                                                                                                               |
| `wait-serial`     | uma string, no máximo 512 bytes                                                             | correspondência de substring, byte a byte, sobre a serial recebida desde o `wait-serial` anterior. Se o orçamento acabar antes, a execução termina com `timeout`              |
| `write-serial`    | uma string UTF-8, ou uma lista de bytes `0..255`                                            | escreve na UART da placa primária                                                                                                                                             |
| `expect-pin`      | `part-id`, `pin`, `expected` (`0`/`1`, `high`/`low`, `true`/`false`; `value` também aceito)  | lê o pino uma vez, imediatamente. Uma divergência falha a execução e reporta o nível que realmente leu                                                                        |
| `set-control`     | `part-id`, `control`, `value` (número, string ou booleano)                                  | `pressed` em um botão o pressiona ou solta; outros controles são os controles de sensor e atributos da peça. Um controle desconhecido falha a execução e lista os que a peça tem |
| `take-screenshot` | `part-id`, `save-to` e/ou `compare-with`, `tolerance`                                       | captura um PNG daquela peça naquele ponto da execução                                                                                                                         |

Qualquer passo pode carregar um `name:` junto à sua chave, apenas para o log.

Limites: 200 passos e 20 capturas de tela por execução.

## Tudo é tempo simulado

`delay: 600ms` são 600 milissegundos do relógio do guest, não do relógio de
parede. O mesmo cenário leva o mesmo tempo simulado em um runner carregado
e em um ocioso, o que torna o resultado reproduzível - e é o que você paga.

:::caution
Não vincule um nível de pino a uma linha serial. Os bytes seriais são
enfileirados na UART e terminam de ser enviados depois do código que os
enfileirou, então um `wait-serial` em uma linha impressa no mesmo loop que um
`digitalWrite` pode cair no lado errado da borda - por frações de milissegundo,
toda vez. Use `wait-serial` para um sentinela de boot, depois um `delay` que
coloque a leitura no meio da janela que você espera.
:::

## Acionando entradas

```yaml
steps:
  - wait-serial: READY
  - set-control:
      part-id: btn1
      control: pressed
      value: 1
  - delay: 50ms
  - set-control:
      part-id: btn1
      control: pressed
      value: 0
  - wait-serial: "pressed"
```

`part-id` é o id do seu `diagram.json` (ou do `.vlx`), nunca um interno. Um
passo que nomeia uma peça que não existe é recusado antes da execução começar,
com `scenario_part_missing` e exit 2 - nada cobrado.

Bytes vão no sentido inverso com `write-serial`, e voltam byte a byte,
incluindo valores acima de `0x7f`:

```yaml
steps:
  - wait-serial: ECHO READY
  - write-serial: "hi\n"
  - wait-serial: "hi"
```

## Capturas de tela

```yaml
- take-screenshot:
    part-id: oled1
    save-to: shots/oled.png
```

O PNG daquela peça é capturado naquele ponto da execução e gravado em
`save-to`, resolvido em relação ao diretório do projeto. Uma execução cuja única
expectativa é uma captura de tela passa assim que a última captura é feita.

:::note
`compare-with` é analisado e enviado, mas a comparação **ainda não está
implementada**: a captura de tela é feita, a execução carrega um aviso
dizendo que não foi comparada, e ela nunca falha a execução. Compare o PNG no
seu próprio job por enquanto.
:::

## Flags que viram passos

Você pode expressar os casos simples sem um arquivo, e eles se combinam com um:

| flag                                      | equivalente                                                                                                                    |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `--expect-text X`                         | um `wait-serial X` final                                                                                                       |
| `--screenshot-part P --screenshot-time T` | `delay T` e então `take-screenshot P`                                                                                          |
| `--fail-text Y`                           | não é um passo: `Y` é observado em cada trecho serial de cada placa, durante toda a execução, e a encerra como `failed` no momento em que aparece |

## Digitando na placa

`--interactive` encaminha sua stdin para a porta serial da placa primária,
coalescida a cada 20 ms. Funciona junto com um cenário: ambos escrevem na
mesma UART, na ordem de chegada. Fechar a stdin encerra a entrada, não a
execução - o orçamento ou o cenário fazem isso.

## Ainda não suportado

- **Passos de toque** (`touch-press`, `touch-move`, `touch-release`). A CLI
  os recusa no momento do lint em vez de pulá-los.
- **Comparação de capturas de tela**, como acima.
- **Chips personalizados** em uma execução de CI: um `[[chip]]` na configuração é recusado com
  `feature_unsupported`.

Veja [Códigos de saída](/docs/pt-br/ci/exit-codes/) para o que cada falha retorna ao seu
job, e [velxio.toml](/docs/pt-br/ci/velxio-toml/) para como um cenário é anexado
a um projeto por padrão.
