# Local Development

## Prerequis

- Node.js 22 ou superieur recommande.
- npm 10 ou superieur.
- Docker Desktop pour PostgreSQL et Docker Compose.
- Git.

## Installation

Depuis la racine du repository :

```bash
npm install
```

Le projet utilise npm workspaces :

- `backend`
- `frontend`

## Variables d'environnement

Copier le fichier d'exemple :

```bash
cp .env.example .env
```

Variables principales :

- `DATABASE_URL` : connexion PostgreSQL utilisee par Prisma.
- `JWT_ACCESS_SECRET` : secret access token JWT.
- `JWT_REFRESH_SECRET` : secret refresh token JWT.
- `FRONTEND_URL` : origine autorisee CORS backend.
- `VITE_API_BASE_URL` : URL API consommee par le frontend.

## Lancer le backend

```bash
npm run start:dev --workspace backend
```

Endpoints utiles :

- API : `http://localhost:3000/api/v1`
- Healthcheck : `http://localhost:3000/api/v1/health`
- Swagger : `http://localhost:3000/api/docs`

## Lancer le frontend

```bash
npm run dev --workspace frontend
```

URL locale :

```text
http://localhost:5173
```

## Lancer PostgreSQL avec Docker

```bash
docker compose up postgres -d
```

## Lancer toute la stack Docker

```bash
docker compose up --build
```

URLs ciblees :

- frontend Docker : `http://localhost:8080`
- backend Docker : `http://localhost:3000`
- PostgreSQL : `localhost:5432`

## Prisma

Generer le client :

```bash
npm run prisma:generate --workspace backend
```

Creer une migration en developpement :

```bash
npm run prisma:migrate --workspace backend
```

Ouvrir Prisma Studio :

```bash
npm run prisma:studio --workspace backend
```

## Workflow Git

1. Choisir une User Story Jira.
2. Creer une branche `feature/SCRUM-XX-description`.
3. Implementer un perimetre limite.
4. Executer lint, tests et build.
5. Pousser la branche.
6. Ouvrir une Pull Request.
7. Attendre CI, review Codex et review humaine.
