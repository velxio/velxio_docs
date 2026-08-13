---
title: Modo Agente — constrói com você
description: O assistente posiciona componentes, conecta-os, escreve o sketch, compila e executa.
sidebar:
  order: 3
---

O modo **Agente** dá mãos ao assistente. Peça um circuito e ele
adicionará os componentes, conectará tudo, escreverá o código, compilará e
executará — direto no seu canvas, enquanto você observa:

![O painel de IA no modo Agente](../../../../assets/docs/ai/mode-agent.png)

Experimente comandos como:

- _"Construa um semáforo com 3 LEDs."_
- _"Adicione um display OLED a esta placa e mostre um contador nele."_
- _"Meus leituras do botão estão com bouncing — corrija o sketch."_
- _"Converta este projeto para MicroPython."_

## Você mantém o controle

Cada ação chega ao seu projeto normal: as peças aparecem no canvas,
as edições aparecem no editor de código e o histórico de desfazer é seu.
Inspecione o que foi feito, ajuste ou peça o próximo passo. Se uma execução
falhar, o agente lê a saída do compilador e o monitor serial da mesma forma
que você faria, e itera.

## Trabalhando bem com o agente

- **Passos pequenos vencem textos longos** — "adicione um DHT22 e imprima a temperatura"
  traz melhores resultados do que um parágrafo de requisitos.
- **Deixe-o terminar** — uma rodada do agente pode envolver várias ações (posicionar, conectar,
  codificar, compilar, executar); o painel narra enquanto avança.
- Anexe uma imagem de um circuito que você quer reproduzir — ele pode trabalhar a partir de uma
  foto ou esquemático.

Rodadas do agente custam mais **ciclos** do que respostas de chat; o contador de cota na
parte inferior do painel mostra o que resta hoje. Veja
[planos](/docs/pt-br/getting-started/plans/).
