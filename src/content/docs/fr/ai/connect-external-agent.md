---
title: Connecter Claude Code ou Codex
description: Pilotez un projet enregistré depuis votre propre agent IA (Claude Code / Codex) via MCP — il construit le circuit et écrit le firmware en direct sur votre canvas.
sidebar:
  order: 5
  badge:
    text: Pro
    variant: tip
---

Le [mode Agent](/docs/fr/ai/agent-mode/) intégré de Velxio exécute l'assistant
_à l'intérieur_ de l'application. **Connect AI agent** fait l'inverse : il permet à votre
propre agent — **Claude Code** ou **OpenAI Codex** dans votre terminal — d'accéder à un
projet Velxio enregistré et de le construire pour vous. Le circuit et le code apparaissent sur
votre canvas en quelques secondes, exactement comme si l'agent intégré l'avait fait.

Cela fonctionne via [MCP](https://modelcontextprotocol.io) (le Model Context
Protocol) : Velxio expose ses outils de circuit et de code comme un serveur MCP, et vous
pointez votre agent vers celui-ci avec un jeton par projet.

![La fenêtre modale Connect AI agent, montrant les onglets Claude Code / Codex, la commande de configuration et la connexion active](../../../../assets/docs/ai/connect-agent.png)

:::note
La connexion d'un agent externe est une fonctionnalité **Pro**. Les formules Free et Maker utilisent
les modes [Agent](/docs/fr/ai/agent-mode/) et [Tutor](/docs/fr/ai/tutor-mode/) intégrés
à la place. Voir [plans](/docs/fr/getting-started/plans/).
:::

## Le moyen le plus rapide : le plugin Claude Code

Si vous utilisez Claude Code, installez le plugin — il apporte les outils, une
commande `/velxio:build` et le savoir-faire en matière de câblage en une seule étape :

```
/plugin marketplace add velxio/velxio-plugin
/plugin install velxio@velxio
```

Ensuite, générez un jeton (étapes ci-dessous), exportez-le, et redémarrez Claude Code :

```bash
export VELXIO_MCP_TOKEN="vlxmcp_...votre jeton..."
```

Maintenant, `/velxio:build an HC-SR04 that prints distance over serial` fait tout le
travail. `/velxio:check` valide et compile ce qui est déjà là.

## Connexion manuelle, en trois étapes

1. **Enregistrez d'abord le projet.** L'agent se connecte à un projet enregistré, alors
   donnez-lui un nom et enregistrez-le si ce n'est pas déjà fait.
2. **Ouvrez le connecteur.** Dans l'éditeur, allez dans **File → Connect AI agent
   (Claude/Codex)**, choisissez l'onglet **Claude Code** ou **Codex CLI**, et cliquez sur
   **Generate connection token**.
3. **Exécutez la commande en une ligne** qu'il vous montre, dans votre terminal :

   **Claude Code**

   ```bash
   claude mcp add --transport http velxio https://velxio.dev/api/pro/mcp \
     --header "Authorization: Bearer vlxmcp_votre_jeton_ici"
   ```

   **Codex** — ajoutez à `~/.codex/config.toml` :

   ```toml
   [mcp_servers.velxio]
   url = "https://velxio.dev/api/pro/mcp"
   http_headers = { "Authorization" = "Bearer vlxmcp_votre_jeton_ici" }
   ```

C'est tout. Lancez `claude` (ou `codex`) et demandez-lui de construire quelque chose :

> _"Using the velxio tools, wire an HC-SR04 to the board and write the
> firmware that prints the distance over serial."_

La ligne d'état dans la fenêtre modale passe à **Connected** dès que votre agent effectue
son premier appel, et les pièces, les fils et le code arrivent sur votre canvas en direct.

## Ce que l'agent peut faire

Votre agent dispose du même ensemble d'outils que l'agent intégré : il peut lire le projet,
ajouter et câbler des composants, ajouter des cartes, placer des pièces sur une breadboard, écrire et modifier
l'esquisse, et valider le circuit. Il dispose également des **skills** par composant de Velxio —
noms de broches exacts, recettes de câblage et pièges du simulateur — afin qu'il câble
un SSD1306 ou un DHT22 correctement au lieu de deviner.

Il peut aussi **compiler** : `compile_sketch` construit le firmware sur le serveur
Velxio et transmet à l'agent la sortie du compilateur, afin qu'il puisse corriger ses propres erreurs
au lieu de vous donner du code qui ne compile pas. L'exécution de la simulation et la
lecture du moniteur série nécessitent toujours l'émulateur en direct dans votre onglet — lorsque la
compilation est réussie, appuyez sur **Run** dans Velxio.

## Connexion sans jeton

Les clients qui prennent en charge OAuth (Claude Code entre autres) peuvent se connecter avec votre compte
Velxio au lieu d'un jeton collé : pointez-les vers `https://velxio.dev/api/pro/mcp`
sans informations d'identification, et ils découvriront le flux de connexion, ouvriront un navigateur, et
vous demanderont d'approuver. L'écran de consentement nomme le client et le compte, et le
jeton d'accès qu'il reçoit est lié uniquement au point de terminaison MCP de Velxio.

Les jetons restent le chemin le plus simple, et rien ne change à leur sujet.

## Sécurité

Le jeton de connexion est une **capacité étroite, par projet**, conçue pour être
collée dans un CLI tiers :

- **Limité à un seul projet.** Un jeton ne touche jamais que le seul projet pour lequel il a été
  créé — jamais vos autres projets ni votre compte.
- **Stocké haché, affiché une seule fois.** Velxio ne conserve qu'un hachage du jeton ; le
  texte en clair n'est affiché qu'une seule fois lors de sa génération.
- **Révocable.** La fenêtre modale liste chaque connexion active avec un bouton **Revoke**,
  et une action **Revoke all** les tue toutes d'un coup. La révocation prend effet
  immédiatement.
- **Expiration.** Chaque jeton cesse de fonctionner après 90 jours ; générez-en un nouveau pour
  continuer.

Si vous avez déjà collé un jeton là où vous n'auriez pas dû, ouvrez la fenêtre modale et cliquez sur
**Revoke** — l'ancien jeton est mort à l'instant même où vous le faites.

## Remarques et limites

- Les modifications de l'agent sont enregistrées dans votre projet comme toute autre modification, donc votre
  historique d'annulation et la sauvegarde automatique habituels s'appliquent toujours.
- Si le projet est lié à [GitHub Sync](/docs/fr/getting-started/github-sync/), les modifications de l'agent
  sont également répercutées sur votre dépôt (par lots, afin qu'une rafale de modifications ne spamme pas
  les commits).
- La compilation, l'exécution et la lecture du moniteur série se font dans le navigateur, alors
  gardez l'onglet Velxio ouvert pendant que vous pilotez le projet depuis votre agent.
