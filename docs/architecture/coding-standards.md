# Coding Standards

## Objectif

Ces standards prepareront une implementation homogene, maintenable et testable.

## TypeScript

- Activer le mode strict.
- Eviter `any` sauf justification.
- Preferer les types explicites pour les contrats publics.
- Utiliser des enums pour les statuts metier.
- Garder les noms en anglais dans le code.

## NestJS

- Un module par domaine fonctionnel.
- Pas de logique metier dans les controllers.
- Services courts et orientes cas d'utilisation.
- DTO pour toutes les entrees API.
- Guards pour authentification et autorisation.
- Filters pour erreurs transverses.
- Interceptors pour besoins techniques transverses.

## Prisma

- Utiliser Prisma Client via un service dedie.
- Eviter les requetes brutes sans justification.
- Versionner les migrations.
- Garder les contraintes importantes au niveau schema.

## React

- Composants fonctionnels.
- Separation pages, components, services, hooks.
- Eviter la logique API directement dans les composants de presentation.
- Centraliser l'etat d'authentification.
- Utiliser des types pour les contrats API.

## Tests

- Nommer les tests selon le comportement attendu.
- Tester les regles, pas uniquement les appels.
- Isoler les dependances externes.
- Couvrir les cas d'erreur.

## Documentation

- Documenter les decisions importantes.
- Mettre a jour les diagrammes lors des changements structurants.
- Garder Swagger coherent avec les DTO.

## Git et qualite

- Commits petits et explicites lorsque valides.
- Branches dediees par sujet.
- Pull requests reliees aux issues Jira.
- Aucun secret dans le repository.
