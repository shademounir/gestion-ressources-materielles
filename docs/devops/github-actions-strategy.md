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

## GitHub Actions Artifacts

GitHub Actions Artifacts est l'option court terme pour conserver les sorties CI/CD sans introduire immediatement une plateforme enterprise.

Usages cibles :

- `upload-artifact` pour les rapports Jest ;
- `upload-artifact` pour les rapports Vitest ;
- stockage des dossiers coverage backend et frontend ;
- conservation du build frontend `dist` lorsque necessaire ;
- conservation du build backend compile lorsque necessaire ;
- archivage des rapports security scan ;
- conservation des preuves de pipeline pour la soutenance.

Ces artefacts doivent rester lies a :

- la Pull Request ;
- le commit ;
- la branche ;
- la User Story Jira ;
- la release cible.

Integration TECH-04 :

| Workflow          | Artefact            | Source                 |
| ----------------- | ------------------- | ---------------------- |
| `backend-ci.yml`  | `backend-coverage`  | `backend/coverage`     |
| `backend-ci.yml`  | `backend-build`     | `backend/dist`         |
| `frontend-ci.yml` | `frontend-coverage` | `frontend/coverage`    |
| `frontend-ci.yml` | `frontend-build`    | `frontend/dist`        |
| `pr-checks.yml`   | `backend-coverage`  | job backend PR         |
| `pr-checks.yml`   | `backend-build`     | job backend PR         |
| `pr-checks.yml`   | `frontend-coverage` | job frontend PR        |
| `pr-checks.yml`   | `frontend-build`    | job frontend PR        |
| `semgrep.yml`     | `semgrep-report`    | `semgrep-results.json` |

La retention initiale est fixee a 14 jours pour limiter le stockage tout en conservant assez de preuves pour les reviews et la soutenance.

Regles de securite :

- ne jamais uploader `.env` ;
- ne jamais uploader de secret ;
- ne pas uploader `node_modules` ;
- ne pas uploader de caches npm ;
- limiter les chemins publies a `coverage`, `dist` et rapports de scan explicitement generes.

## Strategie de nommage artefacts

Convention cible :

```text
grm-<composant>-<type>-<jira-ou-release>-<sha-court>
```

Exemples :

```text
grm-backend-tests-SCRUM-24-a672931
grm-frontend-coverage-release-2-a672931
grm-security-report-pr-42
grm-frontend-dist-release-8
```

## Publication future vers JFrog

Lorsque la strategie enterprise sera activee, GitHub Actions pourra publier vers JFrog Artifactory apres l'etape Build.

Flux cible :

1. Generer les builds et rapports.
2. Publier les rapports simples dans GitHub Actions Artifacts.
3. Publier les artefacts deployables dans JFrog Artifactory.
4. Attacher le build-info.
5. Promouvoir les artefacts vers staging ou production apres validation.

Cette publication JFrog n'est pas activee dans les workflows actuels.

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
