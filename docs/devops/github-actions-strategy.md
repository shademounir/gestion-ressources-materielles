# GitHub Actions Strategy

## Objectif

GitHub Actions doit automatiser les controles de qualite, securite, build et livraison progressive du projet.

## Structure workflows cible

```text
.github/workflows/
|-- pr-checks.yml
|-- backend-ci.yml
|-- frontend-ci.yml
|-- sonarcloud.yml
|-- codeql.yml
`-- semgrep.yml
```

Cette structure est active dans le depot. Les workflows de deploiement ne sont pas inclus dans SCRUM-48 afin de garder une separation nette entre verification CI et livraison applicative.

## Automatisation SCRUM-48

SCRUM-48 s'appuie sur les workflows existants plutot que sur un nouveau fichier CI. Cette decision evite la duplication des jobs et reduit le risque de divergence entre plusieurs pipelines.

Chaine de verification actuelle :

1. `npm ci`.
2. `npm run prisma:generate --workspace backend`.
3. Lint backend et frontend.
4. Typecheck backend et frontend.
5. Tests avec couverture backend et frontend.
6. Build backend et frontend.
7. Publication des artefacts de coverage et build.
8. Analyses SonarCloud, CodeQL et Semgrep.

## PR checks

Declencheurs :

- pull_request vers `develop` ;
- pull_request vers `main` pour hotfix.

Jobs :

- install ;
- Prisma generate ;
- lint ;
- typecheck ;
- tests unitaires avec coverage ;
- build ;
- publication artefacts ;
- analyses qualite et securite via workflows dedies.

`pr-checks.yml` est le workflow de reference pour les Pull Requests. Il execute deux jobs separes, backend et frontend, afin de garder une lecture claire des echecs.

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

## Analyses qualite et securite

Les controles transverses sont separes des jobs de build pour faciliter la lecture des resultats :

| Workflow         | Outil         | Role                                                                        |
| ---------------- | ------------- | --------------------------------------------------------------------------- |
| `sonarcloud.yml` | SonarCloud    | Quality Gate, coverage, duplication, maintainability, reliability, security |
| `codeql.yml`     | GitHub CodeQL | Analyse statique de securite JavaScript/TypeScript                          |
| `semgrep.yml`    | Semgrep       | Detection de patterns securite et qualite                                   |

Cette separation permet d'identifier rapidement si un echec vient du build, des tests, de la qualite de code ou de la securite.

## Pipeline release

Declencheurs :

- merge dans `main` ;
- creation de tag ;
- branche `release/*` selon strategie retenue.

La strategie finale retenue pour Render sera documentee dans SCRUM-49. Le principe cible est un deploiement uniquement depuis un tag stable `v*`, jamais depuis un simple push `develop`.

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
