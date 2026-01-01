# Urgences

Ce dépôt contient l'interface cliente d'une application dédiée aux informations et à la gestion des flux d'urgences hospitalières.

## Sommaire

- Installation
- Structure du projet
- Branches Git et workflow
- Développement (scripts utiles)
- CI / Déploiement
- Conventions de commit
- Contribution

## Installation

1. Clonez le dépôt et installez les dépendances du client :

```bash
git clone <repository-url>
cd Urgences/client
npm install
```

2. Pendant le développement, démarrez l'application côté client :

```bash
npm run dev
```

## Structure du projet

Arborescence principale :

```
Urgences/
├── client/                # Application frontend (Next.js)
├── .github/workflows/     # Actions GitHub (CI, déploiement)
├── .commitlintrc.json     # Règles Conventional Commits
└── README.md              # Documentation du projet
```

## Branches Git et workflow

Le projet utilise une branche de développement et une branche de production :

- `dev` : branche principale de développement. C'est ici que sont intégrées les nouvelles fonctionnalités et corrections après revue.
- `main` : branche de production. Les mises en production doivent provenir d'un merge depuis `dev`.

Workflow recommandé :

```bash
git checkout dev
git pull origin dev
git checkout -b feature/ma-fonctionnalite
# faire les modifications
git add .
git commit -m "feat(scope): description courte"
git push origin feature/ma-fonctionnalite
# ouvrir une Pull Request vers dev
```

Après validation et tests, mergez la PR dans `dev`. Une fois prêt pour la production, mergez `dev` dans `main`.

## Développement (scripts)

Dans le dossier `client/`, les scripts les plus utiles :

```bash
# démarrer le serveur de développement
npm run dev

# lancer ESLint sur le projet
npm run lint

# vérifier les types TypeScript
npm run typecheck

# builder pour la production
npm run build

# prévisualiser le build de production
npm run preview
```

## CI / Déploiement

Le pipeline CI (GitHub Actions) s'exécute sur les pushes et les PRs ciblant `dev` et `main`. Il inclut notamment :

- vérification du format des messages de commit (Conventional Commits),
- linting du code (ESLint),
- vérification des types TypeScript,
- scans de sécurité npm,
- build.

Le déploiement vers l'environnement de production est automatisé depuis la branche `main` (via Vercel dans la configuration actuelle).

## Conventions de commit

Nous utilisons le format Conventional Commits. Exemples valides :

```bash
git commit -m "feat(auth): ajouter l'authentification OAuth"
git commit -m "fix(client): corriger le bug d'affichage"
git commit -m "docs: mise à jour du README"
```

Messages invalides :

```bash
git commit -m "ajouter fonctionnalité"    # manque le type
git commit -m "Fix bug"                   # type en majuscule
```

Le pipeline CI peut refuser une PR si les commits ne respectent pas ces règles.

## Contribution

1. Travaillez depuis `dev` et créez une branche de fonctionnalité :

```bash
git checkout dev
git pull origin dev
git checkout -b feature/ma-fonctionnalite
```

2. Respectez les conventions suivantes :

- utilisez Conventional Commits pour les messages,
- assurez-vous que le code passe `npm run lint` et `npm run typecheck`,
- ajoutez des tests si applicable.

3. Poussez la branche et ouvrez une Pull Request vers `dev`.

4. Attendez la validation du pipeline CI et des relectures avant de merger.

## Déploiement

Le déploiement automatique est déclenché depuis la branche `main` (configuration Vercel). Pour un déploiement manuel :

```bash
# installer l'interface en ligne de commande Vercel
npm install -g vercel

# se connecter
vercel login

# déployer en production
vercel --prod
```

## Remarques

- Ne poussez pas directement sur `main`. Passez toujours par `dev` et une PR.
- Assurez-vous que le pipeline CI est vert avant de demander le merge.

## Liens utiles

- Conventional Commits : https://www.conventionalcommits.org/
- Vercel : https://vercel.com/docs
- GitHub Actions : https://docs.github.com/actions
