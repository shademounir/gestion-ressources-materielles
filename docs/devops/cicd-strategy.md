# CI/CD Strategy

## Objectif

La CI/CD sera introduite progressivement afin de soutenir les tests, la qualite et le deploiement sans complexifier trop tot le projet.

## Perimetre SCRUM-48

SCRUM-48 formalise les verifications automatisees deja mises en place dans GitHub Actions. L'objectif n'est pas de creer un nouveau pipeline parallele, mais de garantir que chaque Pull Request est controlee avant merge.

Le deploiement Render, les hooks de deploiement et la strategie par tag stable sont exclus de SCRUM-48 et traites dans SCRUM-49.

## Workflows actifs

| Workflow          | Role                                                          | Declenchement                                                          |
| ----------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `pr-checks.yml`   | Controle complet backend et frontend avant merge              | Pull Request vers `develop` ou `main`                                  |
| `backend-ci.yml`  | Controle cible du backend lorsque le backend change           | Pull Request et push sur `develop` ou `main` avec changements backend  |
| `frontend-ci.yml` | Controle cible du frontend lorsque le frontend change         | Pull Request et push sur `develop` ou `main` avec changements frontend |
| `sonarcloud.yml`  | Analyse qualite, couverture, duplication et security hotspots | Pull Request, push `develop`, push `main`                              |
| `codeql.yml`      | Analyse securite statique JavaScript/TypeScript               | Pull Request, push `develop`, push `main`, scan hebdomadaire           |
| `semgrep.yml`     | Analyse de patterns securite et qualite                       | Pull Request, push `develop`, push `main`, scan hebdomadaire           |

## Pull Request checks

Chaque pull request doit executer :

- installation des dependances ;
- generation Prisma ;
- lint backend ;
- lint frontend ;
- verification TypeScript ;
- tests unitaires backend ;
- tests unitaires frontend ;
- generation coverage ;
- build backend ;
- build frontend.

Ces controles sont portes principalement par `pr-checks.yml`. Les workflows backend et frontend specialises permettent aussi de verifier les changements par perimetre, sans executer inutilement toute la chaine lorsque seuls certains dossiers changent.

## Verification automatisee detaillee

| Etape              | Commande GitHub Actions                       | Objectif                                                    | Blocage  |
| ------------------ | --------------------------------------------- | ----------------------------------------------------------- | -------- |
| Clean install      | `npm ci`                                      | Installer les dependances depuis le lockfile                | Bloquant |
| Prisma generate    | `npm run prisma:generate --workspace backend` | Generer le client Prisma attendu par le backend             | Bloquant |
| Lint backend       | `npm run lint --workspace backend`            | Detecter erreurs de style et code invalide backend          | Bloquant |
| Lint frontend      | `npm run lint --workspace frontend`           | Detecter erreurs de style et code invalide frontend         | Bloquant |
| Typecheck backend  | `npm run typecheck --workspace backend`       | Garantir la validite TypeScript backend                     | Bloquant |
| Typecheck frontend | `npm run typecheck --workspace frontend`      | Garantir la validite TypeScript frontend                    | Bloquant |
| Tests backend      | `npm run test:cov --workspace backend`        | Verifier les regles metier backend et produire coverage     | Bloquant |
| Tests frontend     | `npm run test:cov --workspace frontend`       | Verifier les composants/pages frontend et produire coverage | Bloquant |
| Build backend      | `npm run build --workspace backend`           | Confirmer la compilation NestJS                             | Bloquant |
| Build frontend     | `npm run build --workspace frontend`          | Confirmer la compilation React/Vite                         | Bloquant |

## Artefacts de verification

Les workflows publient les artefacts utiles a la revue et a la soutenance :

- `backend-coverage` ;
- `frontend-coverage` ;
- `backend-build` ;
- `frontend-build` ;
- `semgrep-report`.

Ces artefacts sont conserves temporairement dans GitHub Actions et ne doivent pas contenir de secrets, fichiers `.env`, caches ou `node_modules`.

## Pipeline complet

Sur la branche principale :

1. Lint.
2. Tests unitaires.
3. Tests d'integration.
4. Build.
5. Audit securite.
6. Docker build.
7. Publication des artefacts si applicable.
8. Deploiement staging.
9. Validation humaine avant production.

## Audit securite

- Audit dependances.
- Verification absence de secrets.
- Analyse basique des configurations.
- Revue des permissions critiques.

## Code review automatique

Les controles automatises doivent signaler :

- tests echoues ;
- build casse ;
- erreurs TypeScript ;
- lint bloquant ;
- dependances vulnerables.

## Validation humaine

Aucun merge ne doit etre fait sans :

- checks au vert ;
- revue humaine ;
- validation du perimetre Jira ;
- absence de regression critique connue.

## Limites SCRUM-48

SCRUM-48 ne deploie pas l'application. Le pipeline valide la qualite du code, les tests et les builds. Le deploiement cible Render sera defini separement pour eviter qu'un push sur `develop` ou `main` declenche une livraison non controlee.
