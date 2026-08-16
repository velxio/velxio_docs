---
title: Tour da interface
description: O editor de relance — canvas, editor de código, barra de ferramentas, consoles e o painel de IA.
sidebar:
  order: 4
---

Este é o editor Velxio com um projeto em execução:

![O editor Velxio, anotado por região](../../../../assets/docs/getting-started/first-project-running.png)

## A barra de menus

![A barra de menus do Velxio: File, Edit, View, Account, Help](../../../../assets/docs/getting-started/interface-menu-bar.png)

**File · Edit · View · Account · Help** — operações de projeto, desfazer/refazer,
visibilidade dos painéis, sua conta e plano, e recursos de ajuda.

## A barra de ferramentas

![A barra de ferramentas do editor, dos alternadores de layout ao botão Add](../../../../assets/docs/getting-started/interface-toolbar.png)

Da esquerda para a direita:

| Controle              | O que faz                                                                                               |
| -------------------- | ---------------------------------------------------------------------------------------------------------- |
| Alternadores de layout | Mostra o editor **Code**, o canvas **Circuit**, ou **Both** lado a lado                                 |
| Seletor de linguagem    | **Arduino C++**, **MicroPython** ou **ESP-IDF** — por placa, veja [Languages](/docs/pt-br/programming/languages/) |
| **Compile** (Ctrl+B) | Compilar sem executar                                                                                      |
| **Run**              | Compilar se necessário, depois iniciar a simulação                                                               |
| **Stop** / **Reset** | Parar a simulação / reiniciar o firmware do início                                                    |
| **Libraries**        | Pesquisar e instalar bibliotecas Arduino                                                                       |
| Alternador de saída        | Mostrar/ocultar o console de saída do compilador                                                                      |
| Seletor de placa       | A qual placa o editor de código e o Run se aplicam (projetos podem ter várias)                                   |
| **Serial**           | Alternar o [serial monitor](/docs/pt-br/programming/serial-monitor/)                                             |
| **Scope**            | Alternar o [osciloscópio / analisador lógico](/docs/pt-br/instruments/oscilloscope/)                                |
| **Add**              | Abrir o [seletor de componentes](/docs/pt-br/circuit-editor/placing-components/)                                      |

## O painel do espaço de trabalho (esquerda)

![O painel do espaço de trabalho com a árvore de arquivos do projeto](../../../../assets/docs/getting-started/interface-workspace.png)

A árvore de arquivos do seu projeto: cada placa tem seus próprios arquivos (`sketch.ino`,
`libraries.json`, qualquer coisa que você adicionar). Os ícones acima criam um novo
espaço de trabalho a partir de um [modelo inicial](/docs/pt-br/getting-started/projects/), abrem
um arquivo de projeto e salvam.

## O canvas (centro)

![O canvas com um circuito de piscar LED ESP32, o selo SPICE e os controles de zoom](../../../../assets/docs/getting-started/interface-canvas.png)

Onde o circuito vive. Role para navegar, use os controles de zoom no canto inferior
direito, clique nas peças para selecioná-las, clique com o botão direito para o
[inspetor](/docs/pt-br/circuit-editor/part-inspector/). O selo amarelo **SPICE**
relata o estado do mecanismo analógico para o circuito selecionado.

## Os consoles (inferior)

![O console de saída e o serial monitor lado a lado](../../../../assets/docs/programming/serial-monitor.png)

- **Output** — mensagens do compilador e do sistema.
- **Serial monitor** — uma aba por placa em execução; caixa de entrada para enviar dados
  de volta. Veja [Serial monitor](/docs/pt-br/programming/serial-monitor/).
- **Oscilloscope** — quando ativado. Veja
  [Oscilloscope](/docs/pt-br/instruments/oscilloscope/).

## O painel de IA (direita)

![O painel de IA com as abas Basic, Agent e Tutor e o contador de créditos](../../../../assets/docs/getting-started/interface-ai-panel.png)

O assistente em seus três modos — **Basic**, **Agent**, **Tutor** — com
sua cota diária restante na parte inferior. Veja
[AI assistant](/docs/pt-br/ai/overview/). Minimize-o com o botão de seta quando
quiser o canvas inteiro.
----- END PAGE -----
