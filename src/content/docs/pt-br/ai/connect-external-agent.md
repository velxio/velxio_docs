---
title: Conecte o Claude Code ou Codex
description: Conduza um projeto salvo a partir do seu próprio agente de IA (Claude Code / Codex) via MCP — ele constrói o circuito e escreve o firmware ao vivo no seu canvas.
sidebar:
  order: 5
  badge:
    text: Pro
    variant: tip
---

O [modo Agente](/docs/pt-br/ai/agent-mode/) integrado do Velxio executa o assistente
_dentro_ do aplicativo. **Connect AI agent** faz o oposto: ele permite que seu
próprio agente — **Claude Code** ou **OpenAI Codex** no seu terminal — acesse um
projeto Velxio salvo e o construa para você. O circuito e o código aparecem no
seu canvas em poucos segundos, exatamente como se o agente integrado tivesse feito.

Isso funciona via [MCP](https://modelcontextprotocol.io) (Model Context
Protocol): o Velxio expõe suas ferramentas de circuito e código como um servidor MCP, e você
aponta seu agente para ele com um token por projeto.

![O modal Connect AI agent, mostrando as abas Claude Code / Codex, o comando de configuração e a conexão ativa](../../../../assets/docs/ai/connect-agent.png)

:::note
Conectar um agente externo é um recurso **Pro**. Os planos Free e Maker usam os
modos [Agente](/docs/pt-br/ai/agent-mode/) e [Tutor](/docs/pt-br/ai/tutor-mode/) integrados
como alternativa. Consulte [planos](/docs/pt-br/getting-started/plans/).
:::

## A maneira mais rápida: o plugin do Claude Code

Se você usa o Claude Code, instale o plugin — ele traz as ferramentas, um
comando `/velxio:build` e o conhecimento de conexão em uma única etapa:

```
/plugin marketplace add velxio/velxio-plugin
/plugin install velxio@velxio
```

Em seguida, gere um token (etapas abaixo), exporte-o e reinicie o Claude Code:

```bash
export VELXIO_MCP_TOKEN="vlxmcp_...your token..."
```

Agora, `/velxio:build an HC-SR04 that prints distance over serial` faz todo o
trabalho. `/velxio:check` valida e compila o que já está lá.

## Conecte manualmente, em três etapas

1. **Salve o projeto primeiro.** O agente se conecta a um projeto salvo, então dê
   um nome a ele e salve-o se ainda não o fez.
2. **Abra o conector.** No editor, vá em **File → Connect AI agent
   (Claude/Codex)**, escolha a aba **Claude Code** ou **Codex CLI** e clique em
   **Generate connection token**.
3. **Execute a configuração de uma linha** que ele mostra, no seu terminal:

   **Claude Code**

   ```bash
   claude mcp add --transport http velxio https://velxio.dev/api/pro/mcp \
     --header "Authorization: Bearer vlxmcp_your_token_here"
   ```

   **Codex** — adicione ao `~/.codex/config.toml`:

   ```toml
   [mcp_servers.velxio]
   url = "https://velxio.dev/api/pro/mcp"
   http_headers = { "Authorization" = "Bearer vlxmcp_your_token_here" }
   ```

É isso. Inicie o `claude` (ou `codex`) e peça para ele construir algo:

> _"Using the velxio tools, wire an HC-SR04 to the board and write the
> firmware that prints the distance over serial."_

A linha de status no modal muda para **Connected** no momento em que seu agente
faz a primeira chamada, e as peças, fios e código chegam ao seu canvas ao vivo.

## O que o agente pode fazer

Seu agente obtém o mesmo conjunto de ferramentas que o agente integrado usa: ele pode ler o projeto,
adicionar e conectar componentes, adicionar placas, posicionar peças em uma matriz de contatos, escrever e editar
o sketch e validar o circuito. Ele também tem as **skills** por componente do Velxio — nomes exatos de pinos, receitas de conexão e pegadinhas do simulador — para que ele conecte
um SSD1306 ou um DHT22 corretamente em vez de adivinhar.

Ele também pode **compilar**: `compile_sketch` compila o firmware no servidor
Velxio e entrega a saída do compilador ao agente, para que ele possa corrigir seus próprios erros
em vez de lhe dizer um código que não compila. Executar a simulação e
ler o monitor serial ainda exigem o emulador ao vivo na sua aba — quando o
build estiver verde, pressione **Run** no Velxio.

## Entrando sem um token

Clientes que falam OAuth (entre eles o Claude Code) podem se conectar com sua conta
Velxio em vez de um token colado: aponte-os para `https://velxio.dev/api/pro/mcp`
sem credenciais, e eles descobrirão o fluxo de login, abrirão um navegador e
pedirão sua aprovação. A tela de consentimento nomeia o cliente e a conta, e o
token de acesso que ele recebe está vinculado apenas ao endpoint MCP do Velxio.

Os tokens continuam sendo o caminho mais simples, e nada muda sobre eles.

## Segurança

O token de conexão é uma **capacidade estreita, por projeto**, projetada para
ser colada em uma CLI de terceiros:

- **Escopo limitado a um projeto.** Um token só toca o único projeto para o qual foi
  criado — nunca seus outros projetos ou sua conta.
- **Armazenado com hash, mostrado uma vez.** O Velxio mantém apenas um hash do token; o
  texto simples é mostrado uma única vez quando você o gera.
- **Revogável.** O modal lista cada conexão ativa com um botão **Revoke**,
  e uma ação **Revoke all** as encerra todas de uma vez. A revogação tem efeito
  imediato.
- **Expira.** Todo token para de funcionar após 90 dias; gere um novo para
  continuar.

Se você colar um token em algum lugar onde não deveria, abra o modal e clique em
**Revoke** — o token antigo morre no instante em que você fizer isso.

## Notas e limites

- As edições do agente são salvas no seu projeto como qualquer outra alteração, então seu
  histórico normal de desfazer e salvamento automático continuam valendo.
- Se o projeto estiver vinculado ao [GitHub Sync](/docs/pt-br/getting-started/github-sync/), as edições
  do agente também são espelhadas no seu repositório (em lote, para que uma rajada de edições não inunde
  os commits).
- Compilar, executar e ler o monitor serial acontecem no navegador, então
  mantenha a aba do Velxio aberta enquanto você conduz o projeto a partir do seu agente.
----- END PAGE -----
