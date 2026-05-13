# GitHub Actions Strategy

## Objectif

GitHub Actions doit automatiser les controles de qualite, securite, build et livraison progressive du projet.

## Structure workflows cible

```text
.github/workflows/
|-- pr-checks.yml
|-- backend-ci.yml
|-- frontend-ci.yml
|-- security-scan.yml
|-- sonarcloud.yml
|-- release.yml
`-- deploy-staging.yml
```

Ces fichiers ne seront crees que lors de l'initialisation technique reelle.

## PR checks

Declencheurs :

- pull_request vers `develop` ;
- pull_request vers `main` pour hotfix.

Jobs :

- install ;
- lint ;
- typecheck ;
- tests unitaires ;
- build ;
- security scan ;
- SonarCloud analysis.

## CI backend

Etapes ciblees :

- installer dependances backend ;
- executer lint ;
- executer typecheck ;
- executer tests Jest ;
- generer coverage ;
- build NestJS ;
- preparer artefact backend si necessaire.

## CI frontend

Etapes ciblees :

- installer dependances frontend ;
- executer lint ;
- executer typecheck ;
- executer tests Vitest ;
- generer coverage ;
- build React/Vite ;
- preparer artefact frontend si necessaire.

## Pipeline release

Declencheurs :

- merge dans `main` ;
- creation de tag ;
- branche `release/*` selon strategie retenue.

Etapes :

1. CI complete.
2. SonarCloud.
3. Security scans.
4. Docker build.
5. Publication artefacts.
6. Deploiement staging.
7. Validation humaine avant production.

## Jobs paralleles

Optimisation cible :

- backend CI et frontend CI en parallele ;
- security scan en parallele lorsque possible ;
- SonarCloud apres generation coverage ;
- Docker build uniquement apres tests et build reussis.

## Artefacts

Artefacts possibles :

- rapports de tests ;
- rapports de couverture ;
- build backend ;
- build frontend ;
- rapports securite ;
- logs de pipeline.

## Cache npm

Utiliser le cache npm pour :

- backend ;
- frontend ;
- monorepo root si workspace.

Objectifs :

- reduire le temps de pipeline ;
- rendre les checks PR plus rapides ;
- limiter les telechargements repetes.

## Optimisation pipeline

- Declencher les jobs selon les chemins modifies.
- Paralleliser backend et frontend.
- Garder les checks PR rapides.
- Executer les scans complets sur `develop` et `main`.
- Eviter Docker build sur chaque changement documentaire.

## Politique d'echec

Un workflow obligatoire en echec bloque le merge. Les jobs informatifs doivent etre clairement identifies et ne pas masquer les controles bloquants.
