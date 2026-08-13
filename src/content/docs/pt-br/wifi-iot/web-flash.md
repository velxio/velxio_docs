---
title: Grave hardware real a partir do navegador
description: Escreva seu projeto compilado em uma placa física via USB — sem necessidade de toolchain instalado.
sidebar:
  order: 4
---

Quando seu projeto funciona no simulador, você pode colocá-lo em uma **placa
real** sem instalar nada: o Velxio grava o firmware compilado
via USB, diretamente do navegador.

## Requisitos

- Um navegador baseado em Chromium (Chrome ou Edge) — o gravador usa a
  API de porta serial do navegador, que Firefox e Safari não possuem.
- Um cabo USB com suporte a dados para sua placa.
- Feche qualquer outra coisa que esteja usando a porta primeiro (monitores seriais, IDEs) — o
  navegador precisa de acesso exclusivo.

## Gravação

1. Abra o diálogo **Flash** no editor.
2. Selecione a porta serial USB — o diálogo detecta automaticamente os candidatos, e o
   navegador pede que você confirme qual porta deseja conceder.
3. O Velxio usa o firmware que já compilou para sua placa — o mesmo
   binário que o simulador estava executando.
4. Acompanhe o progresso; quando terminar, a placa reinicia no seu
   projeto.

Placas RP2040/RP2350 gravam seu `.uf2`, placas ESP32 gravam seu `.bin` — o
diálogo escolhe o protocolo correto para o alvo.

## Simule primeiro, grave depois

Isso fecha o ciclo que torna o Velxio útil para trabalho real: itere
rapidamente no simulador (sem cabo, sem desgaste no hardware, reinicializações
instantâneas) e depois grave exatamente o mesmo artefato de build quando ele se comportar corretamente.

----- END PAGE -----
