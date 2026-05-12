# Backend Architecture

## Objectif

Le backend cible est une API REST NestJS modulaire, testable et documentee. Il expose les cas d'utilisation metier sans coupler les controllers aux details de persistance.

## Structure cible

```text
backend/src/
├── main.ts
├── app.module.ts
├── common/
│   ├── guards/
│   ├── decorators/
│   ├── filters/
│   ├── interceptors/
│   └── pipes/
├── config/
├── prisma/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── departments/
│   ├── suppliers/
│   ├── tenders/
│   ├── resources/
│   ├── assignments/
│   ├── maintenance/
│   ├── notifications/
│   └── audit/
└── shared/
```

## Structure interne d'un module

```text
modules/<domain>/
├── controllers/
├── dto/
├── services/
├── repositories/
├── entities/
├── policies/
├── mappers/
└── <domain>.module.ts
```

## Responsabilites

- Controller : recevoir les requetes, appliquer les guards, retourner les reponses.
- DTO : definir et valider le contrat d'entree ou sortie.
- Service : orchestrer le cas d'utilisation.
- Repository : isoler l'acces aux donnees.
- Policy : centraliser les regles d'autorisation fines.
- Mapper : convertir les objets persistence, domaine et reponse API.

## Clean Architecture adaptee

```text
Controller -> Application Service -> Domain Rules -> Repository -> Prisma
```

Les dependances vont vers l'interieur : les regles metier ne dependent pas de NestJS, de Prisma ou du transport HTTP lorsque cela est possible.

## Gestion des erreurs

- Utiliser des exceptions HTTP standardisees.
- Ne pas exposer les details internes.
- Journaliser les erreurs techniques exploitables.
- Retourner des messages fonctionnels clairs pour les erreurs attendues.

## Validation

Les DTO doivent valider :

- presence des champs obligatoires ;
- formats ;
- bornes numeriques ;
- enums de statut ;
- coherence minimale des dates.

## Documentation API

Swagger doit decrire :

- endpoints ;
- DTO ;
- codes de retour ;
- schemas d'erreur ;
- exigences d'authentification.

## Tests backend

- Tests unitaires des services et policies.
- Tests unitaires des validations metier.
- Tests d'integration pour les flux critiques.
- Mocks des repositories pour isoler les regles.
