# DevOps Architecture

## Objectif

La strategie DevOps cible automatise les controles, securise les changements et prepare une livraison reproductible avec GitHub Actions, Docker et Docker Compose.

## Environnements

- dev : execution locale avec Docker Compose possible.
- staging : validation pre-production.
- prod : environnement stable ou demonstration finale.

## Chaine cible

```text
Pull Request -> Checks CI -> Code Review -> Merge -> Build -> Deploy staging -> Validation humaine -> Production/demo
```

## Composants DevOps

- GitHub Actions pour CI/CD.
- Dockerfile backend.
- Dockerfile frontend.
- Docker Compose pour orchestration locale.
- PostgreSQL conteneurise en dev/staging.
- Secrets GitHub pour variables sensibles.

## Qualite attendue

- Pipeline rapide sur pull request.
- Pipeline complet sur branche principale.
- Artefacts reproductibles.
- Rollback documente.
- Logs consultables.
