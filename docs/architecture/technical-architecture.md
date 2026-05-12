# Technical Architecture

## Stack cible

| Couche | Technologie |
| --- | --- |
| Backend | NestJS, TypeScript strict |
| ORM | Prisma |
| Base de donnees | PostgreSQL |
| Authentification | JWT access token, refresh token |
| Autorisation | RBAC |
| Documentation API | Swagger / OpenAPI |
| Tests backend | Jest |
| Frontend | React, TypeScript, Vite |
| CI/CD | GitHub Actions |
| Conteneurisation | Docker, Docker Compose |
| Tests frontend | Vitest, React Testing Library |

## Monorepo cible

```text
.
|-- backend/
|   |-- src/
|   |-- test/
|   `-- prisma/
|-- frontend/
|   |-- src/
|   `-- public/
|-- docs/
|-- infra/
|   |-- docker/
|   `-- environments/
`-- .github/
    `-- workflows/
```

## Environnements

- dev : execution locale, donnees de test, logs verbeux.
- staging : validation fonctionnelle avant livraison.
- prod : environnement stable, securise et sauvegarde.

## Flux principal

1. L'utilisateur interagit avec le frontend React.
2. Le frontend appelle l'API REST NestJS.
3. Les guards valident l'authentification et les permissions.
4. Les DTO sont valides avant traitement.
5. Les services executent les cas d'utilisation.
6. Les repositories utilisent Prisma pour acceder a PostgreSQL.
7. Les actions sensibles sont journalisees dans AuditLog.
8. Les notifications sont creees selon les evenements metier.

## Transversalite

Les sujets suivants sont transverses a tous les modules :

- validation des entrees ;
- gestion des erreurs ;
- autorisation RBAC ;
- journalisation ;
- audit ;
- tests ;
- documentation Swagger.

## Contraintes techniques

- TypeScript strict obligatoire.
- Aucune logique metier dans les controllers.
- Aucune requete SQL brute sans justification.
- Aucune donnee sensible dans les logs.
- Les statuts metier doivent etre representes par des enums.
- Les migrations de base doivent etre versionnees lors de l'implementation.
