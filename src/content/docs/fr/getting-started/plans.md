---
title: Formules gratuites et payantes
description: "Ce que comprennent exactement les formules Free, Maker et Pro : crédits IA, accès aux cartes, limites de temps d'exécution, partage, bibliothèques et facturation."
sidebar:
  order: 8
---

Velxio est gratuit à utiliser, et la formule gratuite n'est pas une démo. L'éditeur de circuits, l'éditeur de code, le catalogue de composants, la galerie d'exemples et les projets publics illimités ne coûtent rien, et aucune carte ne vous est cachée.

Les formules payantes existent pour les deux choses qui coûtent réellement de l'argent à faire fonctionner — **l'assistant IA**, où chaque requête est un appel de modèle, et **l'émulation côté serveur**, où les cartes STM32 et Raspberry Pi s'exécutent comme de véritables processus QEMU sur les machines de Velxio — ainsi que pour les fonctionnalités destinées aux personnes qui utilisent Velxio pour le travail : projets privés, exports, intégrations et l'application de bureau hors ligne.

Les paliers sont cumulatifs : **Pro inclut tout ce qui est dans Maker, qui inclut tout ce qui est dans Free.**

## Les trois formules

| | Free | Maker | Pro |
| --- | --- | --- | --- |
| Prix | 0 $ | 7 $ / mois | 19 $ / mois |
| Paiement annuel | — | 69 $ / an | 189 $ / an |
| Crédits IA par jour | 20 | 500 | 2 000 |
| Plafond mensuel de crédits IA | 600 | 15 000 | 60 000 |
| Modes Agent et Tuteur | Non | Oui | Oui |
| Émulation STM32 et Raspberry Pi | Non | Oui | Oui |
| Visibilité des projets | Public | Public, non répertorié | Public, non répertorié, privé |
| Stockage de bibliothèques | 100 Mo | 500 Mo | 2 Go |

Payer annuellement coûte environ deux mois de moins que de payer la même formule mensuellement. Les deux rythmes sont disponibles au moment du paiement par carte (Stripe) ou PayPal.

## L'assistant IA

L'assistant a trois modes, et ils ne sont pas tous soumis aux mêmes restrictions.

| Mode | Ce qu'il fait | Formules |
| --- | --- | --- |
| **Basic** | Répond aux questions en utilisant votre projet comme contexte — « pourquoi ma LED ne s'allume-t-elle pas ? », « que signifie cette erreur du compilateur ? ». Il lit le canevas et le code mais ne les modifie pas. | Toutes les formules, y compris Free |
| **Agent** | Agit sur le projet : ajoute et câble des composants, écrit et corrige du code, exécute la simulation pour vérifier son propre travail. | Maker et Pro |
| **Tuteur** | Enseigne étape par étape sur votre propre circuit — propose des exercices, vérifie ce que vous avez construit, explique la théorie. | Maker et Pro |

Le mode Basic de la formule gratuite dispose de son **propre quota de 50 messages par jour** qui ne touche pas à vos crédits IA. Ainsi, un compte gratuit n'est pas limité à 20 interactions IA par jour — il bénéficie de 50 messages de chat Basic plus 20 crédits.

### Comment les crédits IA sont comptabilisés

Les crédits (affichés dans le compteur en bas du panneau de chat) mesurent le travail effectué par les modes Agent et Tuteur :

- Une requête normale coûte **1 crédit**.
- Une requête volumineuse — qui dépasse environ 30 000 jetons de contexte, comme une longue conversation sur un gros programme — coûte proportionnellement plus, donc une seule requête lourde peut dépenser plusieurs crédits.
- Le compteur quotidien **se réinitialise à minuit UTC**. Les crédits non utilisés ne sont pas reportés.
- Le plafond mensuel est une deuxième limite, indépendante, qui s'ajoute à la limite quotidienne.
- Les complétions de code en ligne dans l'éditeur sont comptabilisées séparément et ne dépensent jamais de crédits d'agent.

Consultez la [section sur l'assistant IA](/docs/fr/ai/overview/) pour savoir ce que chaque mode peut réellement faire.

## Cartes et simulation

**Chaque carte du catalogue est visible et modifiable sur toutes les formules**, et la plupart d'entre elles *fonctionnent* également sur toutes les formules. Deux familles font exception, car elles sont les plus coûteuses à héberger :

| Famille de cartes | Où elle s'exécute | Free | Payant |
| --- | --- | --- | --- |
| Arduino / AVR, RP2040 / RP2350 (Pico, Badger 2350) | Votre navigateur | Oui, sans limite de temps | Oui |
| Famille ESP32 (classique, S3, C3, C6), M5Stack, XIAO | Serveurs de Velxio | Oui, 1 heure par exécution | Oui, sans limite par exécution |
| **STM32** (Blue Pill, Black Pill, F4 Discovery…) | Serveurs de Velxio | Non | Oui |
| **Raspberry Pi Linux** (Zero, 1, 2, 3, 4, 5, UNIHIKER) | Serveurs de Velxio | Non | Oui |

Les cartes qui nécessitent une formule payante sont exactement la famille STM32 et la famille Raspberry Pi Linux — elles portent un **badge PRO** dans le sélecteur de composants. Les cartes de marque comme la M5Stack Cardputer, la Pimoroni Badger 2350 ou la famille XIAO ne sont **pas** soumises à un paywall, même si elles font partie du catalogue hébergé.

Deux limites s'appliquent à tout le monde, y compris aux formules payantes :

- Une simulation laissée **inactive pendant 2 heures** s'arrête automatiquement.
- Une session Raspberry Pi a un **plafond strict de 2 heures** par session.

Quelques fonctionnalités individuelles nécessitent également une formule payante : l'émulation WiFi Pico W, le téléchargement de fichiers vers une carte microSD simulée, la passerelle IoT privée, et un petit ensemble de composants premium (ils affichent le badge PRO dans le sélecteur).

## Projets et partage

| | Free | Maker | Pro |
| --- | --- | --- | --- |
| Projets publics (répertoriés dans la galerie) | Illimité | Illimité | Illimité |
| Projets non répertoriés (lien uniquement, masqués de la galerie) | Non | Oui | Oui |
| Projets privés (vous seul) | Non | Non | Oui |
| Intégration sans le badge « Powered by Velxio » | Non | Non | Oui |
| Historique et relecture de simulation | Non | Non | Oui |

Si une formule payante expire, **rien n'est supprimé**. Les projets déjà privés ou non répertoriés conservent cette visibilité — vous ne pouvez simplement pas en créer de nouveaux ni modifier la visibilité d'un projet tant que vous n'êtes pas réabonné.

## Bibliothèques et compilation

La compilation avec `arduino-cli` et l'installation de bibliothèques via le gestionnaire de bibliothèques fonctionnent sur toutes les formules. Ce qui change, c'est le stockage et la façon dont les bibliothèques sont ajoutées :

| | Free | Maker | Pro |
| --- | --- | --- | --- |
| Gestionnaire de bibliothèques + compilation | Oui | Oui | Oui |
| Stockage pour les bibliothèques installées et téléchargées | 100 Mo | 500 Mo | 2 Go |
| Téléchargement de votre propre bibliothèque en `.zip` | Non | Oui | Oui |
| File d'attente de compilation prioritaire aux heures de pointe | Non | Oui | Oui |

Consultez [Bibliothèques](/docs/fr/programming/libraries/) pour savoir comment le quota est comptabilisé.

## Bureau, exports et intégrations

| | Free | Maker | Pro |
| --- | --- | --- | --- |
| Velxio Desktop, hors ligne (Linux, Windows, macOS) | Non | Oui | Oui |
| Passerelle IoT privée | Non | Oui | Oui |
| Générateur de composants personnalisés IA — programmez vos propres puces simulables | Non | Non | Oui |
| Export de nomenclature (CSV, prêt pour Mouser ou Digi-Key) | Non | Non | Oui |
| Export de schéma (PNG) | Non | Non | Oui |
| [Synchronisation GitHub](/docs/fr/getting-started/github-sync/) | Non | Non | Oui |
| Support direct du mainteneur | Non | Non | Oui |

## Essai gratuit

Vous pouvez essayer les modes Agent et Tuteur **gratuitement pendant 7 jours**, sans carte bancaire. L'essai fonctionne avec 500 crédits par jour — la même allocation quotidienne que Maker — et débloque l'ensemble des fonctionnalités Pro afin que vous puissiez tout évaluer. Un essai par compte ; démarrez-le depuis la [page de tarification](https://velxio.dev/pricing).

## Facturation

- **Moyens de paiement** : carte via Stripe Checkout, ou PayPal. Les deux prennent en charge la facturation mensuelle et annuelle.
- **Annulation à tout moment**, depuis le portail d'abonnement dans le menu de votre compte. L'annulation arrête le prochain renouvellement ; vous conservez l'accès jusqu'à la fin de la période déjà payée.
- **Remboursements** : sous 14 jours après le dernier paiement, sans poser de questions. Écrivez à davidmonterocrespo24@gmail.com.
- **Changement de formule** : annulez d'abord l'abonnement actuel, puis abonnez-vous à l'autre.

Les instructions pas à pas se trouvent dans [Abonnement et facturation](/docs/fr/account/subscription/).

## Salles de classe et institutions

[Velxio for Classroom](https://velxio.dev/for-schools) donne à chaque étudiant d'un cours un accès Pro complet dans le cadre d'un contrat institutionnel unique, à partir de 40 $ par étudiant et par an avec des remises sur volume.

## Auto-hébergement

Velxio est open-source sous licence AGPLv3, et l'application hébergée sur velxio.dev est construite à partir de cette même source. Vous pouvez l'exécuter vous-même gratuitement — les formules payantes financent le service hébergé, les serveurs d'émulation et les fournisseurs d'IA qui le sous-tendent.

Pour les prix actuels et le paiement, consultez la [page de tarification](https://velxio.dev/pricing).
