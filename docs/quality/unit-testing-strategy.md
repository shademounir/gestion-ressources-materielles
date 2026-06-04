# Strategie de tests unitaires

## Objectifs

La strategie de tests unitaires vise a securiser les regles metier critiques du projet Gestion des Ressources Materielles avant chaque integration dans `develop`.

Les objectifs principaux sont :

- detecter rapidement les regressions fonctionnelles ;
- documenter le comportement attendu des services, controllers, guards et composants frontend ;
- isoler les regles metier des dependances externes avec des mocks explicites ;
- fournir des preuves de qualite exploitables en soutenance ;
- alimenter SonarCloud avec une couverture coherente backend/frontend.

## Perimetre Backend

Les tests backend ciblent principalement les unites NestJS suivantes :

- services metier ;
- controllers REST ;
- guards et decorators de securite ;
- strategies d'authentification ;
- services transverses tels que notifications et audit logs.

Les tests backend ne doivent pas demarrer PostgreSQL, Docker ou un serveur HTTP complet. Les acces Prisma, services dependants et providers externes sont remplaces par des mocks Jest.

## Perimetre Frontend

Les tests frontend couvrent :

- parcours d'authentification ;
- routes protegees ;
- pages principales ;
- appels API via services frontend ;
- etats loading, empty, erreur et succes ;
- interactions utilisateur avec React Testing Library.

Les tests frontend n'appellent pas le backend reel. Les appels `fetch` sont mockes afin de verifier les URLs, payloads, headers et reactions UI.

## Outils

| Zone     | Outil                      | Usage                                                 |
| -------- | -------------------------- | ----------------------------------------------------- |
| Backend  | Jest                       | Tests unitaires NestJS, services, controllers, guards |
| Backend  | ts-jest                    | Execution TypeScript des specs Jest                   |
| Frontend | Vitest                     | Runner de tests React/Vite                            |
| Frontend | React Testing Library      | Tests orientes comportement utilisateur               |
| Frontend | Testing Library user-event | Simulation d'interactions utilisateur                 |
| Qualite  | Coverage lcov              | Alimentation SonarCloud et preuves CI/CD              |

## Organisation des Tests

### Backend

Les fichiers de tests sont colocalises avec le code teste :

```text
backend/src/modules/<module>/<module>.service.spec.ts
backend/src/modules/<module>/<module>.controller.spec.ts
backend/src/common/guards/*.spec.ts
backend/src/common/decorators/*.spec.ts
```

### Frontend

Les tests frontend sont organises autour des parcours applicatifs et services transverses :

```text
frontend/src/app/App.test.tsx
frontend/src/services/apiClient.test.ts
```

Cette organisation reste acceptable pour le MVP, car les pages sont encore peu nombreuses. Les futurs modules frontend plus volumineux devront introduire des tests colocalises par page ou composant.

## Conventions de Nommage

- Backend : `*.spec.ts`
- Frontend : `*.test.ts` ou `*.test.tsx`
- Nom de test : decrire un comportement observable, pas une implementation interne.
- Structure recommandee : arrange, act, assert.
- Les mocks doivent porter des noms explicites : `prisma`, `auditLogsService`, `notificationsService`, `fetchMock`.

## Niveau de Couverture Attendu

Les seuils cibles pour le projet sont :

- backend services critiques : 80 % minimum ;
- backend controllers : couverture des routes, roles et delegation service ;
- guards/securite : 80 % minimum ;
- frontend parcours critiques : login, navigation, ressources, affectations, maintenance, notifications ;
- services API frontend : erreurs HTTP, payloads, headers d'autorisation.

La couverture doit rester utile : un test qui ne verifie qu'un rendu trivial ne remplace pas un test de regle metier.

## Typologie des Tests

### Services Backend

Les services concentrent les regles metier. Ils doivent verifier :

- validations fonctionnelles ;
- erreurs `NotFoundException`, `BadRequestException`, `ConflictException`, `UnauthorizedException` ;
- appels Prisma attendus ;
- transactions lorsque necessaire ;
- appels aux services transverses, par exemple notifications ou audit.

### Controllers Backend

Les controllers doivent verifier :

- delegation vers le service ;
- recuperation de l'utilisateur authentifie ;
- roles autorises via metadata RBAC ;
- DTOs de reponse attendus au niveau Swagger lorsque pertinent.

### Guards et Decorators

Les tests securite doivent verifier :

- acceptation des roles autorises ;
- refus des roles insuffisants ;
- comportement sans role requis ;
- propagation d'erreurs standardisees.

### DTO et Validation

Les DTO critiques doivent etre couverts lorsque la validation porte une regle non triviale :

- enum obligatoire ;
- UUID ;
- pagination bornee ;
- champs obligatoires ;
- transformation de query params.

Les DTO simples peuvent etre couverts indirectement par controllers/services.

### Composants et Pages React

Les tests React doivent verifier :

- rendu initial ;
- interaction utilisateur ;
- gestion loading ;
- empty state ;
- messages d'erreur et de succes ;
- navigation ;
- appels API attendus.

### Services API Frontend

Les tests de services API doivent verifier :

- construction d'URL ;
- methode HTTP ;
- payload JSON ;
- header `Authorization` ;
- mapping des erreurs API.

## Mocks

Les mocks doivent rester explicites et proches du contrat reel :

- Prisma : mock par model (`user`, `resource`, `notification`, etc.) ;
- services transverses : mock des methodes appelees seulement ;
- `fetch` frontend : reponses JSON controlees ;
- dates : utiliser des dates fixes pour les assertions stables ;
- erreurs : simuler les exceptions NestJS ou les statuts HTTP attendus.

Un mock ne doit pas reproduire toute la logique de production. Il sert a isoler l'unite testee.

## Scripts de Test

Scripts racine verifies :

```bash
npm run test
npm run test:cov
npm run lint
npm run typecheck
npm run build
```

Scripts backend :

```bash
npm run test --workspace backend
npm run test:cov --workspace backend
```

Scripts frontend :

```bash
npm run test --workspace frontend
npm run test:cov --workspace frontend
```

## Limites Actuelles

- Les tests frontend sont concentres dans `App.test.tsx`, ce qui devient volumineux.
- Les tests DTO/validation sont principalement indirects.
- Les tests de persistence restent unitaires avec Prisma mocke, sans base PostgreSQL reelle.
- Les tests end-to-end ne sont pas encore formalises.
- Les notifications globales partageant un seul `readAt` doivent etre revues si une lecture par utilisateur est exigee.

## Strategie d'Evolution

Pour les prochaines releases :

- extraire des tests frontend par page lorsque les ecrans grossissent ;
- ajouter des tests de validation DTO pour les queries sensibles ;
- introduire des tests d'integration API avec une base de test controlee ;
- renforcer la couverture des workflows complets Resources -> Assignments -> Maintenance ;
- suivre les rapports SonarCloud pour prioriser les zones peu couvertes ;
- documenter les exceptions acceptees dans la cartographie de couverture.
