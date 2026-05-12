# Environment Strategy

## Objectif

Ce document definit la strategie de configuration par environnement pour le backend NestJS, le frontend React/Vite, PostgreSQL, Prisma et la securite JWT.

## Environnements

| Environnement | Usage | Donnees | Niveau de logs |
| --- | --- | --- | --- |
| development | Developpement local | Donnees de test locales | Debug |
| staging | Validation avant livraison | Donnees de validation non sensibles | Info |
| production | Production ou demonstration stable | Donnees reelles ou finales | Warn/Error |

## Variables d'environnement

Les variables doivent etre separees par application :

- backend ;
- frontend ;
- base de donnees ;
- CI/CD.

## Fichiers .env

Fichiers cibles :

```text
.env.example
.env.development
.env.staging
.env.production
```

Regles :

- `.env.example` peut etre versionne.
- Les fichiers contenant des secrets reels ne doivent pas etre versionnes.
- Les valeurs sensibles doivent etre stockees dans GitHub Secrets ou un gestionnaire de secrets.
- Les noms de variables doivent etre stables entre environnements.

## Prisma DATABASE_URL

Variable cible :

```text
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
```

Regles :

- une base distincte par environnement ;
- un utilisateur PostgreSQL limite par environnement ;
- aucune URL de production dans un fichier versionne ;
- migrations testees en staging avant production.

## JWT secrets

Variables ciblees :

```text
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=
JWT_REFRESH_EXPIRES_IN=
```

Regles :

- secrets differents par environnement ;
- rotation possible ;
- longueur suffisante ;
- aucun secret dans les logs ;
- aucun secret dans le repository.

## Frontend API URL

Variable cible Vite :

```text
VITE_API_BASE_URL=
```

Regles :

- prefixe `VITE_` obligatoire pour exposition frontend ;
- ne jamais exposer un secret cote frontend ;
- URL differente entre development, staging et production.

## Conventions securite secrets

- Ne jamais commiter `.env`.
- Ne jamais afficher les secrets dans les logs CI.
- Utiliser GitHub Secrets pour la CI/CD.
- Restreindre les droits d'acces aux secrets de production.
- Documenter les variables attendues sans leur valeur reelle.

## Validation de configuration

Au demarrage de l'application, le backend devra verifier :

- presence de `DATABASE_URL` ;
- presence des secrets JWT ;
- validite des durees d'expiration ;
- environnement courant ;
- URL frontend autorisee si CORS est configure.
