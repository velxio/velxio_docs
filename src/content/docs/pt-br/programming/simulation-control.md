---
title: Controlando a simulação
description: Execute, pare, reinicie e interaja com um circuito ao vivo.
sidebar:
  order: 6
---

## Executar / Parar / Reiniciar

Os três botões de transporte na barra de ferramentas:

- **Run** (Executar) — compila se necessário, inicia o firmware e inicia o mundo.
- **Stop** (Parar) — interrompe a simulação. O circuito mantém seu desenho, mas
  nada é executado.
- **Reset** (Reiniciar) — reinicia o firmware do início sem recompilar.

O ponto de status ao lado do nome da placa na árvore de arquivos acompanha o estado:
Ocioso, Compilado, Em execução.

## Interagindo durante a execução

O canvas está ativo durante a simulação:

- **Botões e interruptores** respondem a cliques.
- **Potenciômetros, encoders e sensores** expõem controles para alterar seus
  valores — a temperatura de um DHT22, o nível de luz de um LDR — e o firmware
  vê a mudança imediatamente.
- **Displays, LEDs e motores** renderizam seu estado real de acionamento.

Edições de propriedades do [inspetor de partes](/docs/pt-br/circuit-editor/part-inspector/)
também são aplicadas ao vivo.

## Múltiplas placas

Um projeto pode conter **mais de uma placa**, cada uma com seu próprio código, aba
serial e estado de execução — o seletor de placas na barra de ferramentas escolhe qual
o editor de código e os botões de transporte têm como alvo. As placas podem conversar entre
si através de barramentos com fio, que é como os exemplos de múltiplos chips funcionam.

## O mecanismo analógico

A atividade dos pinos digitais e as partes analógicas são resolvidas juntas: o
**selo SPICE** amarelo sobre o circuito mostra o tamanho da rede analógica e o tempo
de solução. Quando um circuito danificaria uma parte (um LED sem resistor em série,
no modo elétrico), o verificador sinaliza antes do início da execução — corrija a
fiação ou o valor e execute **Run** novamente.
