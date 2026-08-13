---
title: Visão geral dos chips personalizados
description: Crie seus próprios componentes com a API de chips personalizados do Velxio.
sidebar:
  order: 1
---

Quando a peça que você precisa não está no catálogo, você pode construí-la você mesmo. Um
**custom chip** é um pequeno programa (compilado para WebAssembly) que define
os pinos e o comportamento do seu componente: ele pode acionar e ler GPIOs, falar I2C,
SPI ou UART, expor atributos ao painel de propriedades e até mesmo desenhar em um
framebuffer.

Nesta seção:

- **Getting started** — crie seu primeiro custom chip a partir do editor.
- **Tutorial** — construa um chip completo passo a passo.
- **API reference** — todas as funções em `velxio-chip.h`: GPIO, I2C, SPI,
  UART, tempo, atributos e framebuffer.
