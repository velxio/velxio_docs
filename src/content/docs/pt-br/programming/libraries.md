---
title: Usando bibliotecas
description: Pesquise, instale e fixe bibliotecas Arduino para o seu projeto.
sidebar:
  order: 5
---

Clique em **Libraries** (Bibliotecas) na barra de ferramentas para pesquisar o registro de bibliotecas Arduino
e adicionar bibliotecas à placa ativa.

As bibliotecas instaladas são registradas no arquivo **`libraries.json`** da placa
(visível na árvore de arquivos), então elas viajam com o projeto: qualquer pessoa que
o abrir — incluindo você no futuro — obtém as mesmas versões resolvidas no
momento da compilação. Sem pasta de bibliotecas por máquina para manter sincronizada.

## Usando uma biblioteca

Instale-a e depois use `#include` como de costume:

```cpp
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
```

O compilador em nuvem busca as bibliotecas declaradas (além de suas
dependências) antes de compilar. Se uma compilação falhar com
`No such file or directory` em um cabeçalho, a biblioteca que fornece esse
cabeçalho ainda não foi declarada — adicione-a através de **Libraries**.

## MicroPython

O firmware MicroPython vem com seus módulos padrão integrados
(`machine`, `network`, `time`, …). Módulos auxiliares em Python puro podem ser adicionados
como arquivos extras na árvore de arquivos ao lado de `main.py` e importados normalmente.

## Exemplos já vêm pré-configurados

Cada exemplo da galeria declara as bibliotecas que precisa — abrir um deles fornece
uma combinação comprovada de código + circuito + versões de bibliotecas, o que
os torna bons pontos de partida para seus próprios projetos.
----- END PAGE -----
