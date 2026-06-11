# Release Strategy

## Objectif

Cette strategie definit le processus de publication stable du projet Gestion des Ressources Materielles vers l'environnement cible Render.

Le deploiement ne doit jamais etre declenche par une branche de developpement ou par un simple push. Il doit uniquement partir d'un tag Git stable cree depuis `main`.

## Workflow Git cible

```text
feature/*
-> Pull Request vers develop
-> merge develop
-> Pull Request develop vers main
-> merge main
-> creation tag v*
-> GitHub Actions
-> Render Backend
-> Render Frontend
-> PostgreSQL Render
```

## Regle de deploiement

Aucun deploiement automatique n'est autorise depuis :

- `feature/*` ;
- `develop` ;
- `main` ;
- une Pull Request ;
- un commit non tague.

Le deploiement est autorise uniquement lors du push d'un tag respectant le pattern :

```text
v*
```

Exemples valides :

```text
v1.0.0
v1.0.1
v1.1.0
```

Exemples non deployes :

```text
feature/SCRUM-49-render-deployment
develop
main
release/v1.0.0
```

## Pourquoi deployer uniquement par tag

Ce choix apporte trois garanties :

1. Le code de production provient de `main`, apres validation humaine.
2. Le deploiement est associe a une version identifiable.
3. Le rollback peut s'appuyer sur une version precedente connue.

## Creation d'une release

Apres merge de `develop` vers `main` et validation des checks :

```powershell
git checkout main
git pull --ff-only origin main
git tag -a v1.0.0 -m "Release v1.0.0 - Gestion des Ressources Materielles"
git push origin v1.0.0
```

Le push du tag declenche le workflow GitHub Actions de deploiement Render.

## Controle avant tag

Avant de creer un tag stable, executer :

```powershell
npm run lint
npm run typecheck
npm run test
npm run build
```

Verifier aussi :

- Pull Request `develop -> main` mergee ;
- checks GitHub Actions verts ;
- SonarCloud Quality Gate OK ;
- CodeQL OK ;
- Semgrep OK ;
- variables Render configurees ;
- secrets GitHub Actions configures.

## Rollback

Trois strategies sont possibles :

1. Redeployer un ancien deploy Render depuis l'interface Render.
2. Revenir a un ancien tag stable si l'artefact est encore disponible.
3. Revert Git, creation d'un nouveau tag correctif, puis redeploiement.

Exemple de correction par tag :

```powershell
git checkout main
git pull --ff-only origin main
git revert <commit>
git tag -a v1.0.1 -m "Release v1.0.1 - Rollback corrective release"
git push origin main
git push origin v1.0.1
```

## Limites

Le tag ne resout pas seul les problemes de migration base de donnees. Toute migration Prisma doit etre compatible avec `prisma migrate deploy` et eviter les operations destructives non validees.

Les secrets ne doivent jamais etre stockes dans le depot.
