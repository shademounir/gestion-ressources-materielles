# Render Deployment Strategy

## Objectif

Ce document decrit l'architecture cible Render pour le projet Gestion des Ressources Materielles.

L'objectif est de deployer une version stable uniquement apres creation d'un tag Git `v*` depuis `main`.

## Architecture cible

```text
GitHub tag v*
-> GitHub Actions
-> Render Web Service Backend
-> Render Static Site Frontend
-> Render PostgreSQL
```

## Services Render

| Composant                  | Service Render    |
| -------------------------- | ----------------- |
| Backend NestJS             | Web Service       |
| Frontend React/Vite        | Static Site       |
| Base de donnees PostgreSQL | Render PostgreSQL |

## Backend Render

Type de service :

```text
Web Service
```

Root directory :

```text
.
```

Build Command :

```bash
npm ci && npm run prisma:generate --workspace backend && npm run build --workspace backend
```

Start Command :

```bash
npm run start --workspace backend
```

Health Check Path :

```text
/api/v1/health
```

Variables d'environnement backend :

```text
NODE_ENV=production
DATABASE_URL=<Render Internal Database URL>
JWT_ACCESS_SECRET=<secret fort configure dans Render>
JWT_REFRESH_SECRET=<secret fort configure dans Render>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=https://<frontend-render-url>
```

`PORT` peut etre laisse a Render. Le backend NestJS lit `PORT` si la variable est presente.

## Frontend Render

Type de service :

```text
Static Site
```

Root directory :

```text
.
```

Build Command :

```bash
npm ci && npm run build --workspace frontend
```

Publish Directory :

```text
frontend/dist
```

Variable d'environnement frontend :

```text
VITE_API_BASE_URL=https://<backend-render-url>/api/v1
```

Cette variable est injectee au build Vite. Elle doit donc etre configuree avant le build frontend.

## PostgreSQL Render

Creer une base Render PostgreSQL.

Utiliser l'Internal Database URL pour le backend Render :

```text
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

Cette valeur doit etre configuree uniquement dans Render Environment Variables et GitHub Secrets si necessaire.

Elle ne doit jamais etre commitee.

## Prisma

Le projet utilise Prisma avec :

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

La configuration est compatible avec Render PostgreSQL.

## Migrations production

Les migrations doivent etre appliquees avec :

```bash
npm run prisma:migrate:deploy --workspace backend
```

Le script associe est :

```json
"prisma:migrate:deploy": "node scripts/prisma-cli.cjs migrate deploy"
```

Cette commande est non destructive et adaptee aux environnements de production.

## Seed

Le seed Prisma peut etre utilise pour initialiser les comptes et donnees de demonstration, mais il ne doit pas etre execute automatiquement en production sans validation humaine.

Commande manuelle possible :

```bash
npm run prisma:seed --workspace backend
```

## Secrets GitHub Actions

Pour declencher Render depuis GitHub Actions, utiliser des Deploy Hooks Render.

Secrets GitHub attendus :

```text
RENDER_BACKEND_DEPLOY_HOOK_URL
RENDER_FRONTEND_DEPLOY_HOOK_URL
```

Ces valeurs sont configurees dans :

```text
GitHub Repository
-> Settings
-> Secrets and variables
-> Actions
-> New repository secret
```

## Verification apres deploiement

Backend :

```text
https://<backend-render-url>/api/v1/health
```

Swagger :

```text
https://<backend-render-url>/api/docs
```

Frontend :

```text
https://<frontend-render-url>
```

Parcours minimal :

1. Ouvrir le frontend.
2. Se connecter avec un compte de demonstration si le seed est present.
3. Verifier le dashboard.
4. Verifier une page metier.
5. Verifier l'absence d'erreur CORS.

## CORS

Le backend autorise l'origine definie par `FRONTEND_URL`.

En production Render, `FRONTEND_URL` doit correspondre exactement a l'URL publique du frontend Render.

Aucun wildcard CORS ne doit etre utilise.

## Accompagnement manuel

Toute valeur Render ou GitHub necessaire au deploiement doit etre recuperee manuellement et configuree hors depot.

Avant chaque action manuelle, il faut identifier :

1. l'information necessaire ;
2. pourquoi elle est necessaire ;
3. ou la recuperer ;
4. comment la recuperer et la configurer ;
5. quelle validation effectuer avant de continuer.

Aucune URL, cle ou secret ne doit etre suppose.

## Limites

Cette strategie ne cree pas d'infrastructure via `render.yaml`. Les services Render sont crees manuellement afin de garder le controle pedagogique sur chaque composant.

Le deploiement automatique est limite au declenchement par tag Git `v*`.
