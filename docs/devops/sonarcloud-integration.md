# SonarCloud Integration

## Objectif

SonarCloud est integre au pipeline GitHub Actions afin d'analyser la qualite du code backend NestJS et frontend React/Vite avant merge.

Le scan couvre :

- bugs ;
- vulnerabilities ;
- code smells ;
- duplications ;
- maintainability ;
- reliability ;
- security ;
- coverage.

## Architecture

```text
Pull Request ou push develop/main
-> GitHub Actions SonarCloud
-> npm ci
-> Prisma generate
-> lint
-> typecheck
-> tests avec coverage
-> build
-> SonarCloud analysis
-> Quality Gate
```

## Configuration projet

Le fichier `sonar-project.properties` definit :

- `sonar.projectKey=shademounir_gestion-ressources-materielles` ;
- `sonar.organization=gestion-ressources-materielles` ;
- sources analysees : `backend/src`, `frontend/src` ;
- rapports coverage : `backend/coverage/lcov.info`, `frontend/coverage/lcov.info` ;
- exclusions : `dist`, `coverage`, `node_modules`, migrations Prisma generees, fichiers temporaires.

## Secret GitHub requis

Le workflow attend le secret GitHub Actions suivant :

- `SONAR_TOKEN`

Le token ne doit jamais etre affiche, copie dans les logs ou commite. Il est uniquement reference via `secrets.SONAR_TOKEN`.

## Coverage

Les rapports de couverture sont produits par :

- backend : `npm run test:cov --workspace backend` ;
- frontend : `npm run test:cov --workspace frontend` ;
- monorepo : `npm run test:cov`.

Chaque rapport genere un fichier `coverage/lcov.info` dans son workspace.

## Quality Gate

Le Quality Gate SonarCloud doit etre configure dans SonarCloud. La recommandation projet est :

- aucun bug critique sur le nouveau code ;
- aucune vulnerabilite critique ou haute sur le nouveau code ;
- maintainability rating A ;
- reliability rating A ;
- security rating A ;
- duplication maitrisee ;
- couverture suivie progressivement jusqu'a l'objectif Release 7.

## Consultation des rapports

Les resultats sont consultables dans :

- l'onglet GitHub Actions du repository ;
- le statut de Pull Request GitHub ;
- le tableau de bord SonarCloud du projet.

## Limites de TECH-01

Cette integration ne couvre pas encore :

- Semgrep ;
- CodeQL ;
- JFrog Artifactory ;
- scan Docker ;
- deploiement.
