---
title: "Meus Chips: salve e reutilize seus chips"
description: Salve um chip personalizado uma vez e solte-o em qualquer projeto a partir do seletor de componentes, marcado como CUSTOM. Plano Pro.
sidebar:
  order: 4
---

Construiu um chip que vale a pena guardar? Salve-o em **Meus Chips** e ele se tornará parte
do *seu* seletor de componentes — em todos os projetos, pronto para executar, marcado com
um selo **CUSTOM** violeta. Somente você vê sua biblioteca.

:::note[Pro]
Salvar chips na sua biblioteca faz parte do plano Pro: é a única parte
dos chips personalizados que fica no servidor em vez de no seu navegador.
Escrever, compilar e executar chips, e controlar seus
[sliders ao vivo](/docs/pt-br/custom-chips/programmable-sensors/), são gratuitos em
todos os planos; "Criar com IA" é para o plano Maker e superiores.
:::

Um chip salvo mantém tudo: seu código-fonte C, seu manifesto, o
WASM compilado e sua [imagem de rosto](/docs/pt-br/custom-chips/getting-started/#giving-the-chip-a-face)
se tiver uma.

## Salvando um chip

No explorador de arquivos, cada chip personalizado tem sua própria seção. Clique no
botão **save** no cabeçalho dele (ao lado de Compile), dê um nome e uma
descrição opcional, e ele estará na sua biblioteca — compilado e pronto.
Salvar um chip com um nome que você já usou oferece a opção de atualizar a
entrada existente, para que um chip possa evoluir entre projetos.

O agente de IA também pode fazer isso: peça para *"salvar este chip nos meus chips"*
(`save_custom_chip`), liste o que você tem (`list_my_chips`) ou coloque um
chip salvo (`use_my_chip`) — e agentes externos conectados pela
[ponte MCP](/docs/pt-br/ai/connect-external-agent/) recebem as mesmas três ferramentas.

## Usando um chip salvo

Abra o seletor de componentes e seus chips estarão lá, com o selo CUSTOM no
cartão. Soltar um chip **copia** ele para o projeto — fonte, manifesto e
binário compilado — para que os projetos permaneçam totalmente autônomos: editar a
cópia nunca toca na sua biblioteca, e compartilhar o projeto compartilha um
chip funcional, não uma referência que só você pode resolver.

Chips soltos caem direto no editor com seus `chip.c` e
`chip.json` como arquivos comuns, como qualquer chip personalizado.

## Limites

- Até **100 chips** por conta.
- Código-fonte de até 64 KB, chip compilado de até ~512 KB.
- Excluir um projeto nunca exclui chips da biblioteca, e excluir um chip da
  biblioteca nunca afeta os projetos que o copiaram.
