---
title: Synchronisation GitHub
description: "Chaque sauvegarde de projet envoie le croquis, l'état du canevas et un README vers un dépôt GitHub que vous contrôlez."
sidebar:
  order: 5
  badge: PRO
---

Chaque fois que vous enregistrez un projet Velxio, **GitHub Sync** valide et
pousse le croquis, l'état du canevas et un README généré vers un dépôt GitHub
qui vous appartient. Votre code continue de vivre dans votre propre système de
contrôle de version — Velxio n'est que l'éditeur par-dessus.

GitHub Sync fait partie de l'offre **Pro** — voir
[plans](/docs/fr/getting-started/plans/).

## Ce qui est synchronisé

À chaque sauvegarde réussie, Velxio écrit à la racine de votre dépôt :

- **`sketch.ino`** — plus tous les fichiers `.ino` / `.h` / `.c` / `.py`
  supplémentaires du groupe de fichiers de la carte active.
- **`velxio.json`** — l'état complet du canevas : type de carte, composants
  placés, connexions et disposition par carte. Quiconque clone votre dépôt
  peut ouvrir le projet dans Velxio et voir exactement le même circuit.
- **`README.md`** — généré automatiquement, avec le nom du projet, la
  description et un lien profond « Ouvrir dans Velxio ». Libre à vous de le
  remplacer dès que vous souhaitez un README plus riche.

Velxio ne touche jamais aux fichiers en dehors de ces chemins — la
configuration CI, la documentation, les photos et tout le reste du dépôt
sont laissés intacts.

## Comment l'activer

1. Ouvrez un projet enregistré. Cliquez sur le menu de débordement **…**
   dans la barre d'outils de l'éditeur et sélectionnez **Sync to GitHub**.
2. Première fois uniquement : cliquez sur **Connect GitHub**. GitHub demande
   à quels dépôts vous souhaitez que Velxio écrive — Velxio obtient un accès
   limité à l'installation _uniquement_ pour ces dépôts, sans permission
   générale « tous vos dépôts ».
3. Sélectionnez le dépôt cible dans la liste déroulante et cliquez sur
   **Link & sync now**. Velxio pousse le commit initial et affiche le SHA +
   le lien.
4. C'est tout. Chaque sauvegarde suivante pousse un autre commit ; la
   fenêtre Sync affiche l'heure de la dernière synchronisation et un lien
   direct vers le commit.

## Modèle de sécurité

Velxio utilise une **GitHub App**, pas un jeton OAuth personnel :

- **Adhésion par dépôt** — vous choisissez au moment de l'installation les
  dépôts auxquels Velxio peut écrire, et vous pouvez révoquer ou ajouter des
  dépôts à tout moment depuis
  [github.com/settings/installations](https://github.com/settings/installations).
- **Aucun jeton à longue durée de vie** — chaque synchronisation génère un
  nouveau jeton d'installation d'environ 1 h ; les jetons OAuth utilisateur
  sont utilisés une seule fois (pour récupérer votre profil GitHub lors de la
  connexion) puis supprimés.
- **Limite de débit isolée** — l'App possède son propre quota, séparé de
  celui de vos outils personnels.
- **Déconnexion propre** — supprimer l'App Velxio de vos paramètres GitHub
  révoque immédiatement l'accès ; Velxio détecte le webhook et se déconnecte
  sans état obsolète.

## Conflits et modifications manuelles

La synchronisation est actuellement **unidirectionnelle** : Velxio → GitHub.
Les modifications manuelles effectuées sur GitHub entre deux sauvegardes
Velxio sont écrasées lors de la sauvegarde suivante — Velxio est la source de
vérité pour les fichiers synchronisés.

Vous souhaitez développer localement dans VS Code pendant un moment ?
**Unlink** le projet (fenêtre Sync → _Unlink_), travaillez dans votre clone
local, puis reliez-le lorsque vous êtes prêt à reprendre la main depuis
Velxio. La synchronisation bidirectionnelle est sur la feuille de route.

## FAQ

**Que se passe-t-il si une synchronisation échoue ?**
Les échecs apparaissent dans la fenêtre Sync avec une action de récupération
(Reconnect GitHub, choisir un autre dépôt, réessayer plus tard). La
sauvegarde elle-même n'est jamais bloquée — votre projet est toujours
enregistré dans Velxio.

**Puis-je synchroniser vers un dépôt dont je ne suis pas propriétaire ?**
Oui, tant que la GitHub App est installée sur l'organisation et que vous
avez un accès en écriture.

**Et les dépôts privés ?**
Entièrement pris en charge — tout ce que vous autorisez lors de
l'installation devient accessible en écriture, public ou privé.

**Puis-je personnaliser le README ?**
Velxio écrase `README.md` à chaque synchronisation pour le moment. Sur la
feuille de route : ignorer l'écrasement une fois que vous avez pris
possession du fichier.
