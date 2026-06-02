# Release Process

## Objectif

Ce document decrit le processus cible pour publier une release stable du projet Gestion des Ressources Materielles.

TECH-05 prepare uniquement la documentation. Le tag Git et la GitHub Release ne doivent pas etre crees automatiquement.

## Verification de `develop`

Avant toute release :

1. Verifier que toutes les Pull Requests attendues sont fusionnees dans `develop`.
2. Verifier que le working tree local est propre.
3. Recuperer la derniere version de `develop`.

```powershell
git checkout develop
git pull --ff-only origin develop
git status
```

## Pull Request `develop` vers `main`

La release doit passer par une Pull Request dediee :

- base : `main` ;
- head : `develop` ;
- titre recommande : `Release v1.0.0 - Backend and DevSecOps foundation`.

Objectif de la PR :

- valider les checks finaux ;
- relire le changelog ;
- relire les release notes ;
- confirmer le perimetre fonctionnel et technique ;
- obtenir une validation humaine avant promotion.

## Checks attendus

Checks minimum attendus avant merge :

- PR Checks ;
- Backend CI ;
- Frontend CI ;
- SonarCloud ;
- CodeQL ;
- Semgrep ;
- publication des artefacts GitHub Actions.

Commandes locales de reference :

```powershell
npm run lint
npm run typecheck
npm run test
npm run build
```

## Strategie de merge

Politique recommandee :

- aucun push direct sur `main` ;
- review humaine obligatoire ;
- checks obligatoires verts ;
- squash merge pour garder un historique lisible ;
- message de merge explicite.

Message recommande :

```text
chore(release): publish v1.0.0 backend and DevSecOps foundation
```

## Creation du tag

Apres merge de `develop` vers `main`, creer le tag localement :

```powershell
git checkout main
git pull --ff-only origin main
git tag -a v1.0.0 -m "Release v1.0.0 - Backend and DevSecOps foundation"
git push origin v1.0.0
```

## Creation de la GitHub Release

Apres push du tag :

1. Ouvrir GitHub.
2. Aller dans `Releases`.
3. Cliquer sur `Draft a new release`.
4. Selectionner le tag `v1.0.0`.
5. Utiliser le titre : `v1.0.0 - Stable Backend + DevSecOps Foundation`.
6. Copier le contenu principal de `docs/releases/v1.0.0-release-notes.md`.
7. Publier apres validation humaine.

## Rollback tag ou release

Si le tag est cree par erreur avant validation :

```powershell
git tag -d v1.0.0
git push origin :refs/tags/v1.0.0
```

Si la GitHub Release est publiee par erreur :

1. Supprimer ou convertir la release en draft depuis GitHub.
2. Supprimer le tag distant si necessaire.
3. Corriger la branche `main` selon la procedure de hotfix ou revert.
4. Documenter l'incident dans Jira ou dans une note de release corrective.

## Commandes finales preparees

Apres merge de TECH-05 dans `develop` :

1. Creer une PR `develop` vers `main`.
2. Attendre les checks.
3. Effectuer un squash merge si les checks sont OK.
4. Executer localement :

```powershell
git checkout main
git pull --ff-only origin main
git tag -a v1.0.0 -m "Release v1.0.0 - Backend and DevSecOps foundation"
git push origin v1.0.0
```

5. Creer la GitHub Release depuis le tag `v1.0.0`.
