---
title: "Meus Chips: salve e reutilize seus chips"
description: Salve um chip personalizado uma vez e coloque-o em qualquer projeto a partir do seletor de componentes, marcado como CUSTOM. Plano Pro.
sidebar:
  order: 4
---

Construiu um chip que vale a pena guardar? Salve-o em **Meus Chips** e ele se torna parte
do *seu* seletor de componentes — em todos os projetos, pronto para executar, marcado com
um selo **CUSTOM** violeta. Somente você vê sua biblioteca.

:::note[Pro]
Salvar chips faz parte do plano Pro (o mesmo benefício que possibilita
"Criar com IA"). Editar e compilar chips dentro de um projeto funciona em
todos os planos.
:::

## Salvando um chip

No explorador de arquivos, cada chip personalizado tem sua própria seção. Clique no
botão **save** (salvar) em seu cabeçalho (ao lado de Compile), dê a ele um nome e uma
descrição opcional, e ele estará na sua biblioteca — compilado e pronto.
Salvar um chip com um nome que você já usou oferece a opção de atualizar a
entrada existente, para que um chip possa evoluir entre projetos.

O agente de IA também pode fazer isso: peça para *"salvar este chip nos meus chips"*
(`save_custom_chip`), liste o que você tem (`list_my_chips`), ou coloque um
chip salvo (`use_my_chip`) — e agentes externos conectados através da
[ponte MCP](/docs/pt-br/ai/connect-external-agent/) recebem as mesmas três ferramentas.

## Usando um chip salvo

Abra o seletor de componentes e seus chips estarão lá, com o selo CUSTOM no
cartão. Arrastar um **copia** ele para o projeto — fonte, manifesto e
binário compilado — para que os projetos permaneçam totalmente autônomos: editar a
cópia nunca altera sua biblioteca, e compartilhar o projeto compartilha um
chip funcional, não uma referência que só você pode resolver.

Chips arrastados caem direto no editor com seus `chip.c` e
`chip.json` como arquivos comuns, como qualquer chip personalizado.

## Limites

- Até **100 chips** por conta.
- Fonte de até 64 KB, chip compilado de até ~512 KB.
- Excluir um projeto nunca exclui chips da biblioteca, e excluir um chip
  da biblioteca nunca afeta os projetos que o copiaram.
