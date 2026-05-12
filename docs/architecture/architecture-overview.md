# Architecture Overview

## Objectif

Ce document presente la vision d'architecture cible du projet "Gestion des Ressources Materielles". L'objectif est de preparer une base enterprise, maintenable et progressive, sans anticiper l'implementation complete des modules metier.

## Style architectural cible

Le projet adopte une architecture monorepo avec separation claire entre backend, frontend, documentation et infrastructure.

```text
.
├── backend/
├── frontend/
├── docs/
├── infra/
├── scripts/
└── .github/
```

La cible backend suit une architecture modulaire NestJS inspiree de la Clean Architecture :

- controllers pour l'exposition API ;
- DTO pour les entrees et sorties ;
- services applicatifs pour les cas d'utilisation ;
- domaine pour les regles metier ;
- repositories pour l'acces aux donnees via Prisma ;
- guards, interceptors et pipes pour les preoccupations transverses.

## Principes directeurs

- Separation des responsabilites.
- Modularite par domaine fonctionnel.
- Typage strict TypeScript.
- Validation systematique des donnees entrantes.
- Securite par defaut.
- Testabilite des regles metier.
- Documentation API via Swagger.
- CI/CD progressive.
- Observabilite et audit des actions sensibles.

## Domaines fonctionnels

- Authentification et securite.
- Utilisateurs et roles.
- Departements.
- Fournisseurs.
- Appels d'offres.
- Ressources materielles.
- Affectations.
- Maintenance.
- Notifications.
- Audit et tracabilite.

## Vue logique

```text
Frontend React
    |
    | HTTPS / REST / JWT
    v
Backend NestJS
    |
    | Prisma ORM
    v
PostgreSQL
```

## Qualites recherchees

- Maintenabilite : modules independants et conventions homogenes.
- Evolutivite : ajout de modules sans restructuration majeure.
- Securite : JWT, RBAC, validation et audit.
- Fiabilite : tests unitaires et integration progressive.
- Livrabilite : Docker et GitHub Actions en fin de cycle.

## Hors perimetre de cette etape

- Aucun code applicatif complet.
- Aucun CRUD final.
- Aucune page frontend finale.
- Aucune base de donnees creee.
- Aucun pipeline CI/CD cree.
- Aucun conteneur Docker cree.
