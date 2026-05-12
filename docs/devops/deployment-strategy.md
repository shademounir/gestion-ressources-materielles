# Deployment Strategy

## Environnements

| Environnement | Usage | Declenchement |
| --- | --- | --- |
| dev | Developpement local | Manuel |
| staging | Validation fonctionnelle | Apres merge controle |
| prod | Demonstration ou production | Validation humaine |

## Docker Compose cible

Services prevus :

- frontend React/Vite ;
- backend NestJS ;
- PostgreSQL ;
- eventuel reverse proxy.

## Strategie

1. Construire les images.
2. Executer les tests.
3. Appliquer les migrations en staging.
4. Deployer backend et frontend.
5. Verifier les healthchecks.
6. Valider les scenarios critiques.
7. Promouvoir en production ou demonstration.

## Variables d'environnement

- URLs API.
- Connexion PostgreSQL.
- Secrets JWT.
- Configuration refresh token.
- Niveau de logs.

## Criteres de deploiement

- CI au vert.
- Migrations validees.
- Variables configurees.
- Tests d'acceptation critiques executes.
- Rollback possible.
