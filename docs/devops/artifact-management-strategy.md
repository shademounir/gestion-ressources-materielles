# Artifact Management Strategy

## Objectif

La gestion des artefacts permet de conserver les resultats produits par le pipeline CI/CD afin de les tracer, les analyser, les promouvoir et les reutiliser lors des phases de deploiement ou de soutenance.

Dans ce projet, l'etape Artifact Repository s'insere dans le pipeline cible :

```text
Clean -> Test -> Qualite de code -> Security -> Build -> Artifact Repository -> Deploy
```

## Definition d'un artefact

Un artefact est un element produit par une execution de pipeline et conserve apres la fin du job.

Il peut s'agir :

- d'un livrable applicatif ;
- d'un rapport de test ;
- d'un rapport de couverture ;
- d'un rapport d'analyse qualite ;
- d'un rapport de securite ;
- d'une image Docker ;
- d'un package versionne.

Un artefact doit etre identifiable, versionne et rattache a une execution CI/CD.

## Types d'artefacts du projet

| Type                  | Exemple                                 | Usage                            |
| --------------------- | --------------------------------------- | -------------------------------- |
| Build backend         | `backend-dist`                          | Livrable NestJS compile          |
| Build frontend        | `frontend-dist`                         | Livrable React/Vite compile      |
| Docker images futures | `grm-backend:release-x`                 | Deploiement conteneurise         |
| Rapports de tests     | `jest-results`, `vitest-results`        | Preuves de validation            |
| Rapports coverage     | `coverage-backend`, `coverage-frontend` | Suivi qualite                    |
| Rapports securite     | `npm-audit`, `semgrep`, `codeql`        | Analyse DevSecOps                |
| Rapports Sonar        | `sonar-analysis`                        | Dette technique et quality gates |

## Cycle de vie artefact

1. Generation par le pipeline.
2. Publication dans un stockage temporaire ou durable.
3. Association a une branche, un commit, une Pull Request ou une release.
4. Consultation lors des reviews et soutenances.
5. Promotion eventuelle vers staging ou production.
6. Expiration ou archivage selon la politique de retention.

## Versioning artefacts

Les artefacts doivent integrer au minimum :

- le nom du projet ;
- le composant (`backend`, `frontend`, `security`, `coverage`) ;
- le numero de build GitHub Actions ;
- le hash court du commit ;
- la reference Jira lorsque disponible ;
- la release cible si applicable.

Exemples :

```text
grm-backend-build-SCRUM-24-a672931
grm-frontend-dist-release-2-a672931
grm-security-report-pr-42
```

## Tracabilite Jira, GitHub et Release

Chaque artefact doit pouvoir etre relie a :

- une User Story Jira ;
- une branche Git ;
- un commit ;
- une Pull Request ;
- une execution GitHub Actions ;
- une release applicative.

Cette tracabilite facilite :

- l'audit qualite ;
- la revue de code ;
- la demonstration en soutenance ;
- le rollback ;
- la comparaison entre environnements.

## GitHub Actions Artifacts vs JFrog Artifactory

| Critere                  | GitHub Actions Artifacts      | JFrog Artifactory                     |
| ------------------------ | ----------------------------- | ------------------------------------- |
| Usage principal          | Stockage simple de sorties CI | Repository enterprise d'artefacts     |
| Mise en place            | Rapide, integree a GitHub     | Necessite instance et configuration   |
| Retention                | Limitee et configurable       | Gouvernance avancee                   |
| Promotion environnements | Basique                       | Dev, staging, prod                    |
| Docker images            | Non cible principal           | Usage naturel via registries          |
| Build-info               | Limite                        | Natif avec metadonnees detaillees     |
| Securite                 | Selon GitHub                  | Politiques, permissions, scans futurs |

## Strategie projet

Court terme :

- utiliser GitHub Actions Artifacts pour rapports de tests, coverage et builds ;
- conserver les preuves CI/CD utiles pour les reviews et la soutenance.

Artefacts publies par TECH-04 :

| Artefact            | Source          | Contenu                         | Retention |
| ------------------- | --------------- | ------------------------------- | --------- |
| `backend-coverage`  | Backend CI, PR  | Rapports Jest coverage          | 14 jours  |
| `frontend-coverage` | Frontend CI, PR | Rapports Vitest coverage        | 14 jours  |
| `backend-build`     | Backend CI, PR  | Build NestJS compile `dist`     | 14 jours  |
| `frontend-build`    | Frontend CI, PR | Build React/Vite compile `dist` | 14 jours  |
| `semgrep-report`    | Semgrep         | Rapport JSON Semgrep            | 14 jours  |

Les artefacts publies excluent volontairement :

- `node_modules` ;
- fichiers `.env` ;
- secrets ;
- caches locaux ;
- volumes Docker ;
- fichiers temporaires non utiles a l'audit.

## Recuperation depuis GitHub Actions

Pour recuperer un artefact :

1. Ouvrir la Pull Request ou le commit concerne.
2. Aller dans l'onglet `Checks` ou `Actions`.
3. Ouvrir l'execution GitHub Actions.
4. Consulter la section `Artifacts`.
5. Telecharger l'artefact souhaite.

Ces artefacts servent de preuves pour :

- revue technique ;
- validation CI/CD ;
- analyse coverage ;
- analyse securite ;
- soutenance academique ;
- comparaison entre executions.

Cible enterprise :

- utiliser JFrog Artifactory pour les artefacts versionnes ;
- publier les images Docker futures ;
- gerer promotion, rollback et build-info ;
- preparer l'integration avec des scans de securite.
