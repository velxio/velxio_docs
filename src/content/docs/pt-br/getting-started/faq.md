---
title: FAQ
description: Perguntas frequentes sobre o Velxio.
sidebar:
  order: 8
---

### Preciso instalar algo?

Não. O Velxio funciona inteiramente no navegador — o editor, o compilador (na
nuvem) e a simulação. Um Chrome, Edge ou Firefox recente em um desktop é a
melhor experiência.

### Ele está realmente executando meu código?

Sim. Seu sketch é compilado pelas mesmas toolchains que as placas reais usam
(arduino-cli, ESP-IDF, MicroPython), e o **binário real** resultante é
executado por uma CPU emulada — não uma interpretação linha por linha do seu
código-fonte. Logs de inicialização, peculiaridades de temporização, comportamento
dos registradores: o que você vê é o que o silício faria.

### O Velxio é gratuito?

O simulador principal é gratuito, incluindo o catálogo aberto de placas e a
galeria de exemplos. Placas Pro, o assistente de IA e projetos privados exigem
um plano pago — veja [planos](/docs/pt-br/getting-started/plans/).

### Posso importar meus projetos do Wokwi?

Sim — o botão **open project** (abrir projeto) aceita arquivos `.zip` do Wokwi
junto com os arquivos `.vlx` do próprio Velxio. Veja
[Salvando e abrindo projetos](/docs/pt-br/getting-started/projects/).

### Quais placas são suportadas?

Arduino UNO/Nano/Mega, a família ESP32 (classic, S3, C3), Raspberry Pi
Pico e Pico W, STM32, Raspberry Pi Linux completo, ATtiny85 e mais — a
lista completa com detalhes está em [Placas](/docs/pt-br/boards/overview/).

### O WiFi funciona no simulador?

Em placas ESP32, sim — a estação simulada se associa, obtém um IP via
DHCP e pode acessar o gateway da internet para projetos MQTT/HTTP. Veja
[WiFi e IoT](/docs/pt-br/wifi-iot/overview/).

### Posso levar meu projeto para hardware real?

Sim. Para projetos ESP32, o **web flash** (gravação via web) grava o firmware
compilado em uma placa real via USB, diretamente do navegador. Veja
[Web flash](/docs/pt-br/wifi-iot/overview/).

### Onde reporto um bug ou peço um recurso?

Através do menu **Help** (Ajuda) no editor, na comunidade
[Discord do Velxio](https://velxio.dev), ou na organização do GitHub —
como preferir.
