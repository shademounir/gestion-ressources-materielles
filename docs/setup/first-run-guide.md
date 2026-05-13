# First Run Guide

## 1. Installer les dependances

```bash
npm install
```

## 2. Creer le fichier d'environnement

```bash
cp .env.example .env
```

Adapter les valeurs si necessaire.

## 3. Demarrer PostgreSQL

```bash
docker compose up postgres -d
```

## 4. Generer Prisma Client

```bash
npm run prisma:generate --workspace backend
```

## 5. Creer la premiere migration locale

```bash
npm run prisma:migrate --workspace backend
```

Nom de migration recommande :

```text
init_identity_foundation
```

## 6. Lancer le backend

```bash
npm run start:dev --workspace backend
```

Verifier :

```text
http://localhost:3000/api/v1/health
http://localhost:3000/api/docs
```

## 7. Lancer le frontend

Dans un deuxieme terminal :

```bash
npm run dev --workspace frontend
```

Verifier :

```text
http://localhost:5173
```

## 8. Executer les controles qualite

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## 9. Lancer la stack Docker complete

```bash
docker compose up --build
```

Verifier :

```text
http://localhost:8080
http://localhost:3000/api/v1/health
```

## Notes

- Le bouton de connexion frontend est une foundation locale, pas le vrai flux metier.
- Les modules `auth` et `users` backend sont des foundations.
- Aucun CRUD metier complet n'est encore implemente.
- Les prochains developpements doivent partir d'une User Story Jira.
