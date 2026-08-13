---
title: Simulação analógica
description: O mecanismo classe SPICE por trás do canvas — o que ele modela e como ler seu selo.
sidebar:
  order: 3
---

O Velxio não propaga apenas níveis digitais altos e baixos. As partes analógicas
do seu circuito — resistores, diodos, transistores, fontes de alimentação — são
resolvidas por um **mecanismo classe SPICE** que roda em conjunto com a simulação
digital, da mesma forma que simuladores de modo misto fazem no desktop.

## O selo SPICE

O selo amarelo acima do circuito informa sobre a rede analógica:

- **nets** — quantos nós elétricos o mecanismo está resolvendo.
- **solve time** — quanto custou a última análise.

Quando um pino da placa aciona uma rede analógica (por exemplo, um GPIO através
de um resistor em um LED), as bordas dos pinos do firmware alimentam a solução
analógica, e as tensões e correntes resultantes dirigem o que você vê — incluindo
o brilho do LED.

## O que é modelado

- **Passivos** — resistores, potenciômetros e a própria fiação.
- **Diodos e LEDs** — comportamento exponencial real de I/V com tensões de
  polarização direta por cor.
- **Transistores** — transistores bipolares (NPN/PNP) com modelos de junção
  adequados; circuitos de driver de motor e relé se comportam de forma realista.
- **Famílias lógicas** — CIs lógicos discretos (74xx e similares) modelados com
  níveis precisos por família.
- **Alimentação** — fontes, reguladores, baterias na categoria de alimentação.

O mecanismo melhora a cada versão; se um canto analógico exótico se comportar
de forma inesperada, simplifique o circuito ou pergunte na comunidade.

## O verificador de circuitos

Antes de uma execução, o Velxio verifica o circuito em busca de configurações que
danificariam componentes reais — o clássico sendo um LED ligado a uma fonte
**sem resistor em série**. No modo elétrico, o verificador bloqueia a execução e
aponta o problema; corrija a fiação e execute novamente. É um recurso: o
simulador ensina o hábito que salva LEDs reais.
----- END PAGE -----
