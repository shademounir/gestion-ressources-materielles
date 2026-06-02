# Pipeline Stages

## Objectif

Ce document formalise le pipeline CI/CD cible du projet avec une etape Artifact Repository.

Pipeline cible :

```text
Clean -> Test -> Qualite de code -> Security -> Build -> Publish Artifact -> Deploy
```

## Step 1 - Clean

| Element           | Description                             |
| ----------------- | --------------------------------------- |
| Objectif          | Preparer un environnement reproductible |
| Outil cible       | GitHub Actions, npm ci                  |
| Input             | Code source, lockfiles                  |
| Output            | Workspace installe proprement           |
| Critere de succes | Installation sans erreur                |
| Blocage           | Bloquant                                |

## Step 2 - Test

| Element           | Description                         |
| ----------------- | ----------------------------------- |
| Objectif          | Verifier le comportement attendu    |
| Outil cible       | Jest, Vitest, React Testing Library |
| Input             | Code source, tests unitaires        |
| Output            | Rapports de tests                   |
| Critere de succes | Tests critiques reussis             |
| Blocage           | Bloquant                            |

## Step 3 - Qualite de code

| Element           | Description                                              |
| ----------------- | -------------------------------------------------------- |
| Objectif          | Controler lisibilite, maintenabilite et dette technique  |
| Outil cible       | ESLint, TypeScript, SonarCloud                           |
| Input             | Code source, coverage                                    |
| Output            | Rapports lint, typecheck, Sonar                          |
| Critere de succes | Aucun lint bloquant, typecheck OK, quality gate respecte |
| Blocage           | Bloquant progressivement selon release                   |

## Step 4 - Security

| Element           | Description                                         |
| ----------------- | --------------------------------------------------- |
| Objectif          | Identifier vulnerabilites et patterns dangereux     |
| Outil cible       | npm audit, Semgrep, CodeQL                          |
| Input             | Code source, dependances                            |
| Output            | Rapports de securite                                |
| Critere de succes | Aucune vulnerabilite critique non acceptee          |
| Blocage           | Informatif au debut, bloquant sur releases avancees |

## Step 5 - Build

| Element           | Description                                          |
| ----------------- | ---------------------------------------------------- |
| Objectif          | Produire les livrables applicatifs                   |
| Outil cible       | NestJS build, Vite build, Docker futur               |
| Input             | Code valide, variables de build                      |
| Output            | Build backend, build frontend, images Docker futures |
| Critere de succes | Compilation reussie                                  |
| Blocage           | Bloquant                                             |

## Step 6 - Publish Artifact

| Element           | Description                                                      |
| ----------------- | ---------------------------------------------------------------- |
| Objectif          | Publier les livrables et rapports dans un repository d'artefacts |
| Outil cible       | GitHub Actions Artifacts court terme, JFrog Artifactory cible    |
| Input             | Builds, rapports tests, coverage, securite, Sonar                |
| Output            | Artefacts versionnes et tracables                                |
| Critere de succes | Artefact disponible avec nommage et retention definis            |
| Blocage           | Non-bloquant au debut, bloquant pour releases deployables        |

Artefacts GitHub Actions court terme :

- `backend-coverage` ;
- `frontend-coverage` ;
- `backend-build` ;
- `frontend-build` ;
- `semgrep-report`.

Ces artefacts sont publies avec une retention de 14 jours et ne doivent contenir aucun secret ni fichier d'environnement.

## Step 7 - Deploy

| Element           | Description                                              |
| ----------------- | -------------------------------------------------------- |
| Objectif          | Deployer un artefact valide dans un environnement cible  |
| Outil cible       | GitHub Actions, Docker Compose futur, plateforme staging |
| Input             | Artefact promu, configuration environnement              |
| Output            | Application deployee                                     |
| Critere de succes | Healthcheck OK, rollback possible                        |
| Blocage           | Bloquant pour release staging/prod                       |

## Synthese

| Step | Nom              | Blocage cible            |
| ---- | ---------------- | ------------------------ |
| 1    | Clean            | Bloquant                 |
| 2    | Test             | Bloquant                 |
| 3    | Qualite de code  | Bloquant progressivement |
| 4    | Security         | Progressif               |
| 5    | Build            | Bloquant                 |
| 6    | Publish Artifact | Progressif puis bloquant |
| 7    | Deploy           | Bloquant sur release     |
