---
title: STM32
description: Blue Pill, Black Pill, F4 Discovery e amigos — emulação de ARM Cortex-M.
sidebar:
  order: 6
---

As clássicas placas STM32 para hobbyistas, emuladas no nível do SoC:

| Placa                            | MCU                  | Núcleo         |
| -------------------------------- | -------------------- | -------------- |
| **Blue Pill**                    | STM32F103C8 (64 KB)  | Cortex-M3      |
| **Blue Pill F103CB**             | STM32F103CB (128 KB) | Cortex-M3      |
| **Black Pill**                   | STM32F411CE          | Cortex-M4      |
| **Black Pill F401**              | STM32F401CE          | Cortex-M4      |
| **STM32F4 Discovery**            | STM32F407VG          | Cortex-M4      |
| **Olimex STM32-H405**            | STM32F405RG          | Cortex-M4      |
| **Netduino Plus 2 / Netduino 2** | STM32F405 / F205     | Cortex-M4 / M3 |

**Linguagem:** Arduino C++ (o núcleo STM32duino).

## Notas

- GPIO, temporizadores, UART e a superfície usual da API do Arduino funcionam; os
  exemplos de ciclo de cores RGB e de display na galeria são uma boa verificação do
  que é exercitado.
- Projetos STM32 compilam com o núcleo Arduino `stm32` real, então
  código de nível de registro (`HAL_`, acesso direto a periféricos) compila da mesma
  forma que compilaria no IDE.
- Escolha a variante exata que você possui — diferenças de tamanho de flash e pinagem
  entre o F103C8 e o F103CB, ou F401 e F411, são modeladas.
