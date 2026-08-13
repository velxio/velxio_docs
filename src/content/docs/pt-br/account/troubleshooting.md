---
title: Solução de Problemas
description: As verificações que resolvem a maioria dos problemas, em ordem.
sidebar:
  order: 4
---

## A simulação não inicia

1. Verifique o **console de saída** — se a compilação falhou, o erro está
   lá, com arquivo e linha. Veja
   [como ler erros de compilação](/docs/pt-br/programming/compile-and-run/).
2. Um aviso do **verificador de circuito** (por exemplo, um LED sem resistor
   em série no modo elétrico) bloqueia a execução de propósito — corrija a
   fiação sinalizada.
3. A primeira execução de uma sessão compila a frio e pode demorar um pouco
   nas grandes toolchains (ESP-IDF); as execuções seguintes são muito mais
   rápidas. Dê tempo à primeira antes de presumir que travou.

## Está rodando, mas nada acontece

- O **board correto** está selecionado no seletor de board da barra de ferramentas?
- Abra o **monitor serial** — um firmware que travou ou está aguardando
  entrada informa isso lá.
- Clique com o botão direito nas peças para confirmar suas **propriedades**
  (uma tira de NeoPixel configurada com 0 LEDs não desenha absolutamente nada).

## A página em si se comporta mal

- O Velxio quer um **Chromium ou Firefox de desktop**, razoavelmente atual.
- Recarregue forçadamente (Ctrl+Shift+R) após atualizações — um bundle em cache
  desatualizado pode combinar mal com um backend novo.
- Extensões de navegador que interferem em WebAssembly, canvas ou WebSockets
  (bloqueadores de privacidade agressivos) podem quebrar os emuladores — tente
  uma janela anônima.

## O flash via web não vê minha placa

- Use **Chrome ou Edge** — Firefox/Safari não incluem a API serial do navegador.
- Feche todos os outros programas que usam a porta (monitores seriais, IDEs).
- Tente outro cabo — cabos USB apenas para carga são a armadilha clássica.

## Exemplos WiFi não conseguem conectar

- O SSID é exatamente **`Velxio-GUEST`**, aberto, sem senha.
- Observe o monitor serial para as linhas de progresso da pilha WiFi
  (`wifi:connected`, `got ip`) para ver qual etapa falha.

## Ainda travado?

Pergunte ao [assistente de IA](/docs/pt-br/ai/overview/) com seu projeto aberto — ele
lê os mesmos erros que você. Para bugs, entre em contato com a equipe pelo menu
**Help**, Discord ou GitHub.
