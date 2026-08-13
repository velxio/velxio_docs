---
title: Compilar e executar
description: O que acontece quando você pressiona Play — compilação em nuvem, firmware real e como ler erros.
sidebar:
  order: 3
---

## O que o Run faz

O **Run** compila o código da placa ativa (se necessário) e inicia o resultado
na placa emulada. Não há "simulação do seu código-fonte" —
o Velxio cria um **binário de firmware real** com o toolchain real
(arduino-cli / ESP-IDF / MicroPython) e o executa instrução por
instrução.

- **Compile** (Ctrl+B) compila sem executar — útil para verificar erros
  rapidamente.
- **Stop** interrompe a simulação; **Reset** reinicia o firmware do
  início.

## O console de saída

O painel **OUTPUT** no canto inferior esquerdo transmite a compilação: resolução
de bibliotecas, invocações do compilador, uso de memória e, finalmente,
`Compilation successful`. É a mesma saída que o Arduino IDE ou
`idf.py build` forneceriam.

## Lendo erros de compilação

Os erros chegam exatamente como o compilador os emite, com arquivo e linha:

- `'foo' was not declared in this scope` — erro de digitação ou `#include` ausente.
- `No such file or directory` para um cabeçalho — a biblioteca não está instalada;
  adicione-a via **Libraries** ([como](/docs/pt-br/programming/libraries/)).
- Erros de linker/seção em sketches grandes — o binário não cabe na
  flash da placa selecionada.

Corrija e pressione **Run** novamente. Compilações após a primeira são muito mais rápidas graças ao
cache.

> **Tip:** cole um erro de compilação no [assistente de IA](/docs/pt-br/ai/overview/)
> — explicar erros em contexto é o que o modo Basic dele faz de melhor.

## Enquanto está em execução

- O **status dot** ao lado do nome da placa na árvore de arquivos mostra
  Idle / Compiled / Running.
- O **serial monitor** é anexado automaticamente —
  veja [Serial monitor](/docs/pt-br/programming/serial-monitor/).
- Interaja com o circuito ao vivo: pressione botões, gire potenciômetros,
  altere valores de sensores a partir de seus painéis de controle.
----- END PAGE -----
