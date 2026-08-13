---
title: Projetos MQTT e HTTP
description: Fale com brokers e APIs reais a partir da sua placa simulada.
sidebar:
  order: 3
---

Com o [WiFi conectado](/docs/pt-br/wifi-iot/esp32-wifi/), seu ESP32 simulado
pode executar cargas de trabalho reais de IoT. A galeria de exemplos tem
uma categoria **ESP32 MQTT** inteira pronta para abrir e executar.

## MQTT

O fluxo clássico do PubSubClient funciona sem alterações: conecte-se ao
`Velxio-GUEST`, conecte-se a um broker público, publique e assine. Abra
os exemplos de MQTT na galeria para ver:

- publicação de leituras de sensores em um temporizador,
- assinatura de um tópico e acionamento de uma saída a partir de mensagens recebidas,
- uma troca completa de painel bidirecional contra um broker público.

Como o broker é real, você pode ver as mensagens da sua placa simulada
chegarem no seu celular ou notebook com qualquer cliente MQTT — e publicar
de volta para ela.

## HTTP

`HTTPClient` (Arduino) e `urequests` (MicroPython) funcionam com
endpoints reais: busque uma API REST, baixe um arquivo, envie um webhook.
Mantenha os payloads razoáveis — o chip emulado tem os mesmos limites de
RAM que o chip real.

## Notas e limites

- O AP é **aberto** (sem senha) e fornece acesso à internet via NAT —
  não há acesso de entrada à sua placa simulada a partir da internet.
- DNS, TCP, UDP e TLS se comportam como no hardware; handshakes TLS
  pesados custam tempo real de CPU emulada, então espere que demorem um
  pouco.
- Se uma conexão falhar, verifique o monitor serial primeiro — as linhas
  de log da própria pilha WiFi (`wifi:connected`, `got ip`) indicam qual
  etapa não aconteceu.
