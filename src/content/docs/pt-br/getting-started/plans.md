---
title: Planos gratuitos e pagos
description: "Exatamente o que Free, Maker e Pro incluem — créditos de IA, acesso a placas, limites de tempo de execução, compartilhamento, bibliotecas e cobrança."
sidebar:
  order: 8
---

O Velxio é gratuito para usar, e o plano gratuito não é uma demonstração. O
editor de circuitos, o editor de código, o catálogo de componentes, a galeria de
exemplos e projetos públicos ilimitados não custam nada, e nenhuma placa fica
oculta para você.

Os planos pagos existem para as duas coisas que custam dinheiro real para
executar — **o assistente de IA**, onde cada prompt é uma chamada de modelo, e a
**emulação no servidor**, onde as placas STM32 e Raspberry Pi rodam como
processos QEMU reais nas máquinas do Velxio — além dos recursos voltados para
pessoas que usam o Velxio para trabalhar: projetos privados, exportações,
integrações e o aplicativo desktop offline.

Os níveis são aditivos: **Pro inclui tudo do Maker, que inclui tudo do Free.**

## Os três planos

| | Free | Maker | Pro |
| --- | --- | --- | --- |
| Preço | $0 | US$ 7 / mês | US$ 19 / mês |
| Pagamento anual | — | US$ 69 / ano | US$ 189 / ano |
| Créditos de IA por dia | 20 | 500 | 2.000 |
| Teto de créditos de IA por mês | 600 | 15.000 | 60.000 |
| Modos Agente e Tutor | Não | Sim | Sim |
| Emulação STM32 e Raspberry Pi | Não | Sim | Sim |
| Visibilidade do projeto | Público | Público, não listado | Público, não listado, privado |
| Armazenamento de bibliotecas | 100 MB | 500 MB | 2 GB |

Pagar anualmente custa cerca de dois meses a menos do que pagar o mesmo plano
mensalmente. Ambas as cadências estão disponíveis no checkout com cartão
(Stripe) ou PayPal.

## O assistente de IA

O assistente tem três modos, e eles não são todos limitados da mesma forma.

| Modo | O que faz | Planos |
| --- | --- | --- |
| **Basic** | Responde perguntas com seu projeto como contexto — "por que meu LED não acende?", "o que significa este erro do compilador?" Ele lê o canvas e o código, mas não os altera. | Todos os planos, incluindo Free |
| **Agent** | Age no projeto: adiciona e conecta componentes, escreve e corrige código, executa a simulação para verificar o próprio trabalho. | Maker e Pro |
| **Tutor** | Ensina passo a passo sobre o seu próprio circuito — propõe exercícios, verifica o que você construiu, explica a teoria. | Maker e Pro |

O modo Basic no plano gratuito tem seu **próprio pool de 50 mensagens por dia**
que não consome seus créditos de IA. Portanto, uma conta gratuita não está
limitada a 20 interações de IA por dia — ela recebe 50 mensagens de chat Basic
mais 20 créditos.

### Como os créditos de IA são contabilizados

Os créditos (mostrados no contador na parte inferior do painel de chat) medem o
trabalho dos modos Agent e Tutor:

- Uma solicitação normal custa **1 crédito**.
- Uma solicitação grande — que envia mais de cerca de 30.000 tokens de
  contexto, como uma conversa longa sobre um sketch grande — custa
  proporcionalmente mais, então um único prompt pesado pode gastar vários
  créditos.
- O contador diário **é redefinido à meia-noite UTC**. Créditos não utilizados
  não são acumulados.
- O teto mensal é um segundo limite, independente, além do limite diário.
- As conclusões de código inline no editor são medidas separadamente e nunca
  gastam créditos de agente.

Consulte a [seção do assistente de IA](/docs/pt-br/ai/overview/) para saber o que cada
modo pode realmente fazer.

## Placas e simulação

**Todas as placas do catálogo são visíveis e editáveis em todos os planos**, e a
maioria delas também *executa* em todos os planos. Duas famílias são a exceção,
porque são as mais caras de hospedar:

| Família de placas | Onde executa | Free | Pago |
| --- | --- | --- | --- |
| Arduino / AVR, RP2040 / RP2350 (Pico, Badger 2350) | Seu navegador | Sim, sem limite de tempo | Sim |
| Família ESP32 (clássico, S3, C3, C6), M5Stack, XIAO | Servidores do Velxio | Sim, 1 hora por execução | Sim, sem limite por execução |
| **STM32** (Blue Pill, Black Pill, F4 Discovery…) | Servidores do Velxio | Não | Sim |
| **Raspberry Pi Linux** (Zero, 1, 2, 3, 4, 5, UNIHIKER) | Servidores do Velxio | Não | Sim |

As placas que precisam de um plano pago são exatamente a família STM32 e a
família Raspberry Pi Linux — elas carregam um **selo PRO** no seletor de
componentes. Placas de marca como M5Stack Cardputer, Pimoroni Badger 2350 ou a
família XIAO **não** são bloqueadas por paywall, mesmo fazendo parte do catálogo
hospedado.

Dois limites se aplicam a todos, inclusive aos pagantes:

- Uma simulação deixada **ociosa por 2 horas** é interrompida automaticamente.
- Uma sessão Raspberry Pi tem um **teto rígido de 2 horas** por sessão.

Alguns recursos individuais também precisam de um plano pago: emulação WiFi do
Pico W, upload de arquivos para um cartão microSD simulado, o gateway IoT
privado e um pequeno conjunto de componentes premium (eles mostram o selo PRO no
seletor).

## Projetos e compartilhamento

| | Free | Maker | Pro |
| --- | --- | --- | --- |
| Projetos públicos (listados na galeria) | Ilimitados | Ilimitados | Ilimitados |
| Projetos não listados (somente link, ocultos da galeria) | Não | Sim | Sim |
| Projetos privados (somente você) | Não | Não | Sim |
| Incorporação sem o selo "Powered by Velxio" | Não | Não | Sim |
| Histórico e reprodução de simulação | Não | Não | Sim |

Se um plano pago expirar, **nada é excluído**. Projetos que já são privados ou
não listados mantêm essa visibilidade — você simplesmente não pode criar novos
ou alterar a visibilidade de um projeto até assinar novamente.

## Bibliotecas e compilação

Compilar com `arduino-cli` e instalar bibliotecas pelo Gerenciador de
Bibliotecas funciona em todos os planos. O que muda é o armazenamento e como as
bibliotecas são adicionadas:

| | Free | Maker | Pro |
| --- | --- | --- | --- |
| Gerenciador de Bibliotecas + compilação | Sim | Sim | Sim |
| Armazenamento para bibliotecas instaladas e enviadas | 100 MB | 500 MB | 2 GB |
| Enviar sua própria biblioteca como `.zip` | Não | Sim | Sim |
| Fila de compilação prioritária em horários de pico | Não | Sim | Sim |

Consulte [Bibliotecas](/docs/pt-br/programming/libraries/) para saber como a cota é
calculada.

## Desktop, exportações e integrações

| | Free | Maker | Pro |
| --- | --- | --- | --- |
| Velxio Desktop, offline (Linux, Windows, macOS) | Não | Sim | Sim |
| Gateway IoT privado | Não | Sim | Sim |
| Construtor de peças personalizadas com IA — programe seus próprios chips simuláveis | Não | Não | Sim |
| Exportação de BOM (CSV, pronto para Mouser ou Digi-Key) | Não | Não | Sim |
| Exportação de esquemático (PNG) | Não | Não | Sim |
| [Sincronização com GitHub](/docs/pt-br/getting-started/github-sync/) | Não | Não | Sim |
| Suporte direto do mantenedor | Não | Não | Sim |

## Teste gratuito

Você pode experimentar os modos Agent e Tutor **gratuitamente por 7 dias**, sem
cartão. O teste oferece 500 créditos por dia — a mesma cota diária do Maker — e
desbloqueia o conjunto de recursos do Pro para que você possa avaliar tudo. Um
teste por conta; inicie-o na [página de preços](https://velxio.dev/pricing).

## Cobrança

- **Métodos de pagamento**: cartão via Stripe Checkout, ou PayPal. Ambos
  suportam cobrança mensal e anual.
- **Cancele quando quiser**, pelo portal de assinatura no menu da sua conta.
  Cancelar interrompe a próxima renovação; você mantém o acesso até o final do
  período que já pagou.
- **Reembolsos**: dentro de 14 dias após a cobrança mais recente, sem fazer
  perguntas. Envie um e-mail para davidmonterocrespo24@gmail.com.
- **Mudança de plano**: cancele a assinatura atual primeiro e depois assine o
  outro plano.

Instruções passo a passo estão em
[Assinatura e cobrança](/docs/pt-br/account/subscription/).

## Salas de aula e instituições

[Velxio for Classroom](https://velxio.dev/for-schools) dá a cada aluno de um
curso acesso Pro completo sob um único contrato institucional, a partir de
US$ 40 por aluno por ano, com descontos por volume.

## Autohospedagem

O Velxio é open-source sob a licença AGPLv3, e o aplicativo hospedado em
velxio.dev é construído a partir desse mesmo código-fonte. Você pode executá-lo
você mesmo gratuitamente — os planos pagos financiam o serviço hospedado, os
servidores de emulação e os provedores de IA por trás dele.

Para preços atuais e checkout, consulte a
[página de preços](https://velxio.dev/pricing).
