---
title: Sincronização com GitHub
description: Cada salvamento de projeto envia o sketch, o estado do canvas e um README para um repositório GitHub que você controla.
sidebar:
  order: 5
  badge: PRO
---

Toda vez que você salva um projeto Velxio, a **Sincronização com GitHub** faz commit e push
do sketch, do estado do canvas e de um README gerado para um repositório GitHub que você
possui. Seu código continua vivendo no seu próprio controle de versão — o Velxio é apenas
o editor por cima.

A Sincronização com GitHub faz parte do plano **Pro** — veja
[planos](/docs/pt-br/getting-started/plans/).

## O que é sincronizado

A cada salvamento bem-sucedido, o Velxio grava na raiz do seu repositório:

- **`sketch.ino`** — além de quaisquer arquivos extras `.ino` / `.h` / `.c` / `.py` no
  grupo de arquivos da placa ativa.
- **`velxio.json`** — o estado completo do canvas: tipo de placa, componentes
  posicionados, fios e layout por placa. Quem clonar seu repositório pode
  abrir o projeto no Velxio e ver exatamente o mesmo circuito.
- **`README.md`** — gerado automaticamente, com o nome do projeto, descrição
  e um link profundo "Abrir no Velxio". Fique à vontade para sobrescrever quando quiser um
  README mais completo.

O Velxio nunca toca em arquivos fora desses caminhos — configuração de CI, documentação, fotos
e qualquer outra coisa no repositório permanece intacta.

## Como ativar

1. Abra qualquer projeto salvo. Clique no menu de estouro **…** na barra de ferramentas
   do editor e escolha **Sync to GitHub** (Sincronizar com GitHub).
2. Somente na primeira vez: clique em **Connect GitHub** (Conectar GitHub). O GitHub pergunta
   em quais repositórios você quer que o Velxio grave — o Velxio recebe acesso restrito à instalação
   _apenas_ nesses repositórios, sem permissão genérica de "todos os seus repositórios".
3. Escolha o repositório de destino no menu suspenso e clique em **Link & sync now**
   (Vincular e sincronizar agora). O Velxio envia o commit inicial e mostra o SHA + link.
4. Pronto. Cada salvamento subsequente envia outro commit; o modal de Sincronização
   mostra o horário da última sincronização e um link direto para o commit.

## Modelo de segurança

O Velxio usa um **GitHub App**, não um token OAuth pessoal:

- **Adesão por repositório** — você escolhe no momento da instalação em quais repositórios
  o Velxio pode gravar, e pode revogar ou adicionar repositórios a qualquer momento em
  [github.com/settings/installations](https://github.com/settings/installations).
- **Sem tokens de longa duração** — cada sincronização gera um token de instalação novo
  com validade de ~1 h; tokens OAuth de usuário são usados exatamente uma vez (para buscar
  seu perfil do GitHub durante a conexão) e descartados.
- **Limite de taxa isolado** — o App tem sua própria cota, separada das suas
  ferramentas pessoais.
- **Desconexão limpa** — excluir o Velxio App das suas configurações do GitHub
  revoga o acesso imediatamente; o Velxio detecta o webhook e
  desconecta sem estado obsoleto.

## Conflitos e edições manuais

A sincronização é atualmente um **push unidirecional**: Velxio → GitHub. Edições manuais feitas no
GitHub entre salvamentos do Velxio são sobrescritas no próximo salvamento — o Velxio é
a fonte da verdade para os arquivos sincronizados.

Quer desenvolver localmente no VS Code por um tempo? **Desvincule** o projeto
(modal de Sincronização → _Unlink_), trabalhe no seu clone local e depois vincule novamente
quando estiver pronto para voltar a usar o Velxio. Sincronização bidirecional está no
roadmap.

## Perguntas frequentes

**E se uma sincronização falhar?**
As falhas aparecem no modal de Sincronização com uma ação de recuperação (Reconectar
GitHub, escolher outro repositório, tentar novamente mais tarde). O salvamento em si nunca é
bloqueado — seu projeto sempre salva dentro do Velxio.

**Posso sincronizar com um repositório que não é meu?**
Sim, desde que o GitHub App esteja instalado na organização e você
tenha acesso de escrita lá.

**E repositórios privados?**
Totalmente suportados — o que você autorizar durante a instalação se torna gravável,
público ou privado.

**Posso personalizar o README?**
Hoje o Velxio sobrescreve o `README.md` a cada sincronização. No roadmap:
pular a sobrescrita depois que você assumir a propriedade do arquivo.
