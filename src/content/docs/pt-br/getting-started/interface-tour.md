---
title: Tour pela interface
description: O editor de relance — canvas, editor de código, barra de ferramentas, consoles e o painel de IA.
sidebar:
  order: 3
---

Este é o editor Velxio com um projeto em execução:

![O editor Velxio, anotado por região](../../../../assets/docs/getting-started/first-project-running.png)

## A barra de menus

**File · Edit · View · Account · Help** — operações de projeto, desfazer/refazer,
visibilidade de painéis, sua conta e plano, e recursos de ajuda.

## A barra de ferramentas

Da esquerda para a direita:

| Controle              | O que faz                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------- |
| Alternância de layout | Mostra o editor **Code**, o canvas **Circuit**, ou **Both** lado a lado                                 |
| Seletor de linguagem  | **Arduino C++**, **MicroPython** ou **ESP-IDF** — por placa, veja [Languages](/docs/pt-br/programming/languages/) |
| **Compile** (Ctrl+B)  | Compila sem executar                                                                                    |
| **Run**               | Compila se necessário e inicia a simulação                                                              |
| **Stop** / **Reset**  | Interrompe a simulação / reinicia o firmware do início                                                  |
| **Libraries**         | Pesquisa e instala bibliotecas Arduino                                                                  |
| Alternância de saída  | Mostra/oculta o console de saída do compilador                                                          |
| Seletor de placa      | A qual placa o editor de código e o **Run** se aplicam (projetos podem ter várias)                      |
| **Serial**            | Alterna o [serial monitor](/docs/pt-br/programming/serial-monitor/)                                           |
| **Scope**             | Alterna o [osciloscópio / analisador lógico](/docs/pt-br/instruments/oscilloscope/)                           |
| **Add**               | Abre o [seletor de componentes](/docs/pt-br/circuit-editor/placing-components/)                               |

## O painel de espaço de trabalho (esquerda)

A árvore de arquivos do seu projeto: cada placa tem seus próprios arquivos (`sketch.ino`,
`libraries.json`, qualquer coisa que você adicionar). Os ícones acima criam um novo
espaço de trabalho a partir de um [starter template](/docs/pt-br/getting-started/projects/), abrem
um arquivo de projeto e salvam.

## O canvas (centro)

Onde o circuito vive. Role para navegar, use os controles de zoom no canto inferior
direito, clique nas peças para selecioná-las, clique com o botão direito para abrir o
[inspector](/docs/pt-br/circuit-editor/part-inspector/). O selo amarelo **SPICE**
informa o estado do mecanismo analógico para o circuito selecionado.

## Os consoles (inferior)

- **Output** — mensagens do compilador e do sistema.
- **Serial monitor** — uma aba por placa em execução; caixa de entrada para enviar dados
  de volta. Veja [Serial monitor](/docs/pt-br/programming/serial-monitor/).
- **Oscilloscope** — quando ativado. Veja
  [Oscilloscope](/docs/pt-br/instruments/oscilloscope/).

## O painel de IA (direita)

O assistente em seus três modos — **Basic**, **Agent**, **Tutor** — com
sua cota diária restante na parte inferior. Veja
[AI assistant](/docs/pt-br/ai/overview/). Minimize-o com o botão de seta quando
quiser o canvas completo.
