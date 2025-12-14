# Urgences

Application web pour la gestion des urgences.

## 📋 Table des matières

- [Installation](#installation)
- [Structure du projet](#structure-du-projet)
- [Branches Git](#branches-git)
- [Développement](#développement)
- [CI/CD](#cicd)
- [Conventional Commits](#conventional-commits)
- [Déploiement](#déploiement)
- [Contribution](#contribution)

## Installation

```bash
# Cloner le dépôt
git clone <repository-url>
cd Urgences

# Installer les dépendances du client
cd client
npm install
```

## Structure du projet

```
Urgences/
├── client/              # Application frontend
├── .github/
│   └── workflows/      # Workflows CI/CD
│       ├── ci.yml       # Pipeline CI
│       └── deploy-vercel.yml  # Déploiement Vercel
├── .commitlintrc.json  # Configuration Conventional Commits
└── README.md
```

## Branches Git

Le projet utilise deux branches principales :

### `dev` - Branche de développement
- **Usage** : Tous les développements et modifications de code
- **Workflow** : C'est sur cette branche que vous codez et testez vos fonctionnalités
- **CI** : Le pipeline CI s'exécute automatiquement sur chaque push

### `main` - Branche de production
- **Usage** : Uniquement pour le déploiement sur Vercel
- **Workflow** : Mergez `dev` dans `main` uniquement quand le code est prêt pour la production
- **Déploiement** : Déploiement automatique sur Vercel à chaque push

### Workflow recommandé

```bash
# 1. Travailler sur la branche dev
git checkout dev
git pull origin dev

# 2. Créer une nouvelle branche de fonctionnalité
git checkout -b feature/ma-fonctionnalite

# 3. Faire vos modifications et commits
git add .
git commit -m "feat: ajouter ma fonctionnalité"

# 4. Pousser et créer une Pull Request vers dev
git push origin feature/ma-fonctionnalite

# 5. Après validation, merger dans dev
git checkout dev
git merge feature/ma-fonctionnalite
git push origin dev

# 6. Quand prêt pour la production, merger dev dans main
git checkout main
git merge dev
git push origin main  # Déclenche le déploiement automatique
```

## Développement

### Scripts disponibles

Dans le dossier `client/` :

```bash
# Démarrer le serveur de développement
npm run dev

# Linter le code
npm run lint

# Vérifier les types TypeScript
npm run typecheck

# Build de production
npm run build

# Prévisualiser le build de production
npm run preview
```

## CI/CD

Le projet utilise GitHub Actions pour l'intégration et le déploiement continus.

### Pipeline CI (`.github/workflows/ci.yml`)

Le pipeline CI s'exécute automatiquement sur :
- Push sur les branches `dev` et `main`
- Pull Requests vers `dev` et `main`

#### Étapes du pipeline :

1. **Lint Commits** : Vérifie que les messages de commit respectent le format Conventional Commits
2. **Lint Code** : Exécute ESLint pour vérifier la qualité du code
3. **Type Check** : Vérifie les types TypeScript
4. **Security Scan** : Audit de sécurité npm (détecte les vulnérabilités CRITICAL et HIGH)
5. **Build** : Compile l'application avec Vite

Toutes ces étapes doivent réussir pour que le pipeline soit validé.

### Pipeline de déploiement (`.github/workflows/deploy-vercel.yml`)

Le déploiement s'exécute automatiquement uniquement sur la branche `main` :
- Build de production
- Déploiement sur Vercel

## Conventional Commits

Le projet utilise le format [Conventional Commits](https://www.conventionalcommits.org/) pour standardiser les messages de commit.

### Format

```
<type>(<scope>): <subject>

[body optionnel]

[footer optionnel]
```

### Types autorisés

- `feat` : Nouvelle fonctionnalité
- `fix` : Correction de bug
- `docs` : Documentation
- `style` : Formatage, point-virgules manquants, etc. (pas de changement de code)
- `refactor` : Refactoring du code
- `perf` : Amélioration des performances
- `test` : Ajout ou modification de tests
- `build` : Changements du système de build
- `ci` : Changements de configuration CI
- `chore` : Tâches de maintenance
- `revert` : Annulation d'un commit précédent

### Exemples en ligne de commande par terminal

```bash
# ✅ Valides
git commit -m "feat: ajouter la fonctionnalité de connexion"
git commit -m "fix(client): corriger le bug de chargement"
git commit -m "docs: mettre à jour le README"
git commit -m "refactor: réorganiser le code d'authentification"
git commit -m "feat(auth): ajouter l'authentification OAuth

Implémente l'authentification via Google et GitHub"

# ❌ Invalides
git commit -m "ajouter fonctionnalité"  # Manque le type
git commit -m "Fix bug"  # Type en majuscule
git commit -m "feat: Ajouter fonctionnalité"  # Sujet en majuscule
```

Le workflow CI vérifie automatiquement le format des commits et bloque le merge si le format n'est pas respecté.

## Déploiement

### Déploiement automatique

Le déploiement sur Vercel se fait automatiquement à chaque push sur la branche `main`.

### Déploiement manuel

```bash
# Installer Vercel CLI globalement
npm install -g vercel

# Se connecter à Vercel
vercel login

# Déployer
vercel --prod
```

## Contribution

1. Créer une branche depuis `dev`
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/ma-fonctionnalite
   ```

2. Faire les modifications en respectant les conventions commmit :
   - Format Conventional Commits pour les messages
   - Code linté et sans erreurs TypeScript
   - Tests passants

3. Pousser et créer une Pull Request vers `dev`
   ```bash
   git push origin feature/ma-fonctionnalite
   ```

4. Attendre la validation du pipeline CI

5. Après review et validation, la PR sera mergée dans `dev`

6. Pour déployer en production, créer une PR de `dev` vers `main`

## 📝 Notes

- Le pipeline CI doit passer avant tout merge
- Les commits doivent respecter le format Conventional Commits
- Ne jamais push directement sur `main` sans passer par `dev`
- Le déploiement sur Vercel se fait uniquement depuis `main`

## 🔗 Liens utiles

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Actions](https://docs.github.com/en/actions)
