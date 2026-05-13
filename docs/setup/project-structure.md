# Project Structure

## Vue globale

```text
.
|-- .github/
|   `-- workflows/
|-- backend/
|-- frontend/
|-- infra/
|-- docs/
|-- docker-compose.yml
|-- package.json
`-- package-lock.json
```

## Backend

```text
backend/
|-- prisma/
|   `-- schema.prisma
|-- src/
|   |-- core/
|   |-- common/
|   |-- config/
|   |-- modules/
|   |-- infrastructure/
|   |-- shared/
|   |-- app.module.ts
|   `-- main.ts
```

Roles :

- `core` : services techniques fondamentaux comme le logger.
- `common` : guards, decorators, filters et outils transverses.
- `config` : validation et configuration d'environnement.
- `modules` : modules applicatifs progressifs.
- `infrastructure` : acces techniques comme Prisma.
- `shared` : enums, types et constantes partagees backend.

## Frontend

```text
frontend/
|-- src/
|   |-- app/
|   |-- pages/
|   |-- modules/
|   |-- shared/
|   |-- services/
|   |-- hooks/
|   |-- layouts/
|   `-- router/
```

Roles :

- `app` : composition racine.
- `pages` : vues routables.
- `modules` : features fonctionnelles progressives.
- `shared` : configuration, styles, composants generiques.
- `services` : clients API.
- `hooks` : hooks reutilisables.
- `layouts` : structures de pages.
- `router` : routes et protections.

## Infrastructure

```text
infra/
|-- docker/
`-- environments/
```

Ces dossiers accueilleront les configurations d'infrastructure futures sans melanger code applicatif et deploiement.

## CI/CD

```text
.github/workflows/
|-- backend-ci.yml
|-- frontend-ci.yml
`-- pr-checks.yml
```

Les workflows actuels couvrent uniquement :

- install ;
- lint ;
- typecheck ;
- tests ;
- build.

SonarCloud, Semgrep, CodeQL et deploiement seront ajoutes plus tard.
