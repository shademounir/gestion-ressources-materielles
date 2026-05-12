# CI/CD Strategy

## Objectif

La CI/CD sera introduite progressivement afin de soutenir les tests, la qualite et le deploiement sans complexifier trop tot le projet.

## Pull Request checks

Chaque pull request doit executer :

- installation des dependances ;
- lint backend ;
- lint frontend ;
- verification TypeScript ;
- tests unitaires backend ;
- tests unitaires frontend ;
- build backend ;
- build frontend.

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
