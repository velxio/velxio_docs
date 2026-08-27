---
title: Gateway de rede local
description: Execute o velxiogw na sua máquina e a placa simulada entra na sua rede real — LAN, localhost e tudo mais.
sidebar:
  order: 3
---

Por padrão, uma placa simulada acessa a internet através do gateway de
nuvem da Velxio — mas não a sua rede local. O **gateway de rede local**
(`velxiogw`) remove esse limite: um pequeno programa que você executa na
sua própria máquina, e o tráfego da placa sai de lá. Seu broker MQTT,
seu Home Assistant, a API que você está desenvolvendo no `localhost` —
tudo acessível a partir do sketch. Um plano Maker habilita o pareamento.

## Configuração

1. Baixe o gateway para a sua plataforma na
   [última versão](https://github.com/velxio/velxiogw/releases/latest)
   e execute-o:

   ```
   $ ./velxiogw
   velxiogw 0.1.2 — Velxio IoT Network Gateway
     listening on   ws://127.0.0.1:9013
     pairing code   493028
     reach scope    your LAN + localhost + internet
     host alias     host.velxio.internal -> this machine
   ```

2. No editor, abra o **painel WiFi** (o cursor ao lado do ícone
   WiFi). O painel detecta o gateway em execução automaticamente.

3. Digite o **código de pareamento** que o gateway exibiu e clique em **Connect**.
   A partir do próximo **Run**, a placa estará na sua rede.

Na primeira vez, o Chrome pede permissão para permitir que a página fale
com um dispositivo na sua rede local — clique em **Allow**. (O Safari
atualmente não suporta isso; use Chrome, Edge ou Firefox.)

## Acessando sua própria máquina

Dentro de um sketch, o nome de host `host.velxio.internal` sempre resolve
para a máquina onde o gateway está em execução:

```cpp
#include <HTTPClient.h>

HTTPClient http;
http.begin("http://host.velxio.internal:8000/api/reading");
int status = http.GET();
```

Qualquer outra coisa na sua LAN é acessível pelo IP normal ou nome de host
sem mDNS, exatamente como a partir de uma placa real no seu WiFi.

## Notas

- O gateway vincula-se apenas ao seu loopback e recusa conexões sem o
  código de pareamento, então nada mais na sua rede — ou qualquer outra
  página da web — pode usá-lo.
- O tráfego através do gateway local nunca passa pelos servidores da
  Velxio e geralmente é mais rápido por eliminar a ida e volta.
- O código-fonte é público em
  [github.com/velxio/velxiogw](https://github.com/velxio/velxiogw); os
  binários são gratuitos para download, e o fluxo de pareamento no editor
  é um recurso do plano Maker.
- No aplicativo Velxio Desktop, nada disso é necessário: a simulação já
  roda na sua máquina, então a placa está na sua rede por construção.
