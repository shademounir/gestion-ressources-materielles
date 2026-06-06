# Documentation d'architecture technique

Projet : Gestion des Ressources Materielles  
Stack : React, Vite, NestJS, Prisma, PostgreSQL, Docker, GitHub Actions  
Perimetre : architecture applicative, donnees, securite, processus metier, DevSecOps et qualite.

## 1. Presentation du projet

Le projet Gestion des Ressources Materielles est une application web de gestion du cycle de vie des ressources materielles d'un etablissement. Il couvre la gestion des utilisateurs, des departements, des besoins materiels, des fournisseurs, des appels d'offres, de l'inventaire, des affectations, de la maintenance, des notifications et de l'audit.

L'objectif principal est de fournir une application interne structuree, securisee et maintenable, capable d'accompagner les processus suivants :

- authentifier les utilisateurs et limiter les acces selon leur role ;
- administrer les utilisateurs et leurs rattachements organisationnels ;
- declarer des besoins departementaux ;
- referencer les fournisseurs et suivre leur historique ;
- creer, publier et attribuer des appels d'offres ;
- enregistrer et consulter les ressources materielles ;
- affecter et retourner une ressource ;
- signaler une panne et suivre une intervention de maintenance ;
- notifier les utilisateurs et tracer les actions sensibles.

Le perimetre actuel est oriente application interne. Les utilisateurs principaux sont :

- Administrateur : administration des utilisateurs, roles, donnees de reference et operations sensibles ;
- Responsable ressources ou Manager : gestion operationnelle des ressources, fournisseurs, affectations, maintenance et appels d'offres ;
- Utilisateur interne : destinataire potentiel de ressources et de notifications ;
- Technicien maintenance : acteur metier represente dans les interventions ;
- Fournisseur : acteur externe reference dans les offres, ressources et retours fournisseur.

Le diagramme de contexte est disponible dans [system-context.mmd](../diagrams/system-context.mmd).

## 2. Architecture globale

L'application adopte une architecture monorepo separee en plusieurs zones :

- `backend/` : API REST NestJS, logique applicative, DTO, guards, services et Prisma ;
- `frontend/` : application React TypeScript avec Vite, routing protege, pages et services API ;
- `docs/` : architecture, DevSecOps, qualite, releases, diagrammes et guides ;
- `.github/workflows/` : pipelines CI, qualite et securite ;
- `docker-compose.yml` : orchestration locale de PostgreSQL et des services de developpement.

La vue applicative est documentee dans [application-architecture.mmd](../diagrams/application-architecture.mmd).

### Frontend React

Le frontend est une application React/Vite en TypeScript. Il expose les pages principales suivantes :

- `/login` pour l'authentification ;
- `/dashboard` pour les indicateurs ;
- `/resources` et `/resources/:resourceId` pour l'inventaire ;
- `/assignments` et `/assignments/:assignmentId` pour les affectations ;
- `/maintenance` pour les tickets, constats, interventions et retours fournisseur ;
- `/notifications` pour les notifications utilisateur ;
- `/admin/users` pour l'administration des utilisateurs ;
- `/suppliers` et `/suppliers/:supplierId` pour les fournisseurs ;
- `/tenders` et `/tenders/:tenderId` pour les appels d'offres.

Les appels HTTP passent par `frontend/src/services/apiClient.ts`. Le jeton JWT est injecte dans les appels via les services fonctionnels.

### Backend NestJS

Le backend est une API REST NestJS exposee sous le prefixe `/api/v1`. Il utilise :

- controllers pour les endpoints ;
- services pour les cas d'utilisation ;
- DTO pour validation et documentation Swagger ;
- guards JWT et RBAC pour securiser les routes ;
- Prisma pour l'acces aux donnees PostgreSQL ;
- Swagger expose sur `/api/docs`.

### Prisma et PostgreSQL

Prisma represente le modele de donnees dans `backend/prisma/schema.prisma`. PostgreSQL est la base relationnelle cible. Les migrations sont versionnees dans `backend/prisma/migrations`.

### Docker

Docker Compose fournit l'environnement local PostgreSQL et permet de stabiliser les executions de developpement, de seed et de validation. Les volumes de donnees doivent etre conserves afin de maintenir les jeux de donnees de demonstration.

## 3. Architecture Backend

Les modules backend declares dans `AppModule` sont representes dans [backend-modules.mmd](../diagrams/backend-modules.mmd).

### Auth

Le module `AuthModule` gere :

- `POST /auth/login` pour la connexion ;
- `POST /auth/logout` pour la deconnexion stateless ;
- `GET /auth/me` pour recuperer l'utilisateur courant ;
- la strategie JWT ;
- la generation et validation de l'access token.

La connexion s'appuie sur bcrypt pour verifier `passwordHash` et retourne un access token compatible avec les guards.

### Users

Le module `UsersModule` gere :

- creation d'un utilisateur par un administrateur ;
- liste des utilisateurs pour ADMIN et MANAGER ;
- detail utilisateur pour ADMIN ;
- modification de role ;
- desactivation logique ;
- rattachement a un departement.

Le module evite l'exposition de `passwordHash` dans les DTO de reponse.

### Departments

Le module `DepartmentsModule` permet la creation d'un departement. Le modele `Department` est ensuite utilise pour rattacher les utilisateurs et les besoins departementaux.

### Resources

Le module `ResourcesModule` gere :

- creation d'une ressource ;
- consultation de l'inventaire ;
- detail ressource ;
- modification de statut ;
- historique d'affectation par ressource.

Les statuts Prisma principaux sont `AVAILABLE`, `ASSIGNED`, `UNDER_MAINTENANCE`, `OUT_OF_SERVICE` et `ARCHIVED`.

### Assignments

Le module `ResourceAssignmentsModule` gere :

- affectation d'une ressource disponible ;
- retour d'une ressource ;
- consultation du detail d'une affectation ;
- compteur des affectations actives pour le dashboard.

Les operations critiques utilisent des transactions Prisma pour garantir la coherence entre `ResourceAssignment` et `Resource`.

### Maintenance

Le module `MaintenanceModule` couvre :

- signalement d'une panne ;
- creation d'un constat ;
- suivi d'une intervention ;
- retour fournisseur ;
- compteur des tickets ouverts.

Il manipule `MaintenanceTicket`, `MaintenanceReport`, `MaintenanceIntervention` et `SupplierReturn`.

### Suppliers

Le module `SuppliersModule` gere :

- creation fournisseur ;
- liste paginee ;
- detail ;
- historique ;
- desactivation logique.

Les fournisseurs sont relies aux ressources, offres fournisseur et retours fournisseur.

### Tenders

Le module `TendersModule` gere :

- lecture paginee des appels d'offres ;
- creation d'un appel d'offres a partir d'un besoin ;
- detail d'appel d'offres ;
- liste des offres d'un appel d'offres ;
- publication d'un appel d'offres.

Le module `SupplierOffersModule` complete le processus avec la creation, la lecture et la selection d'offres fournisseurs.

### Notifications

Le module `NotificationsModule` gere :

- liste des notifications de l'utilisateur connecte ;
- notifications globales ;
- compteur de notifications non lues ;
- marquage comme lu.

Le frontend affiche un badge dans le layout principal a partir de ce compteur.

### Audit

Le module `AuditLogsModule` centralise la creation de traces d'audit. Les actions tracees couvrent notamment les utilisateurs, ressources, affectations et operations de maintenance.

## 4. Architecture Frontend

Le frontend est structure autour de pages, modules de services, composants partages et routing.

### React et pages

Les pages principales sont dans `frontend/src/pages`. Elles regroupent les ecrans fonctionnels actuels :

- `LoginPage` ;
- `DashboardPage` ;
- `ResourcesPage` ;
- `AssignmentsPage` ;
- `MaintenancePage` ;
- `NotificationsPage` ;
- `AdminUsersPage` ;
- `SuppliersPage` ;
- `TendersPage`.

Certaines pages gerent a la fois la liste et le detail en fonction du parametre de route. C'est le cas notamment de `ResourcesPage`, `AssignmentsPage`, `SuppliersPage` et `TendersPage`.

### Routing

Le routing est defini dans `frontend/src/router/AppRouter.tsx`. Les routes applicatives sont encapsulees dans `ProtectedRoute`, puis certaines routes sont limitees par `RoleProtectedRoute`.

Exemples :

- `/admin/users` est reserve au role `ADMIN` ;
- `/suppliers` et `/tenders` sont reserves a `ADMIN` et `MANAGER` ;
- les routes metier principales sont inaccessibles sans session.

### AuthContext

`AuthContext` centralise la session frontend. Il stocke l'access token et les informations utilisateur dans `sessionStorage`. La deconnexion supprime la session et redirige vers `/login`.

### Services API

Chaque domaine frontend possede un service dedie :

- `authService.ts` ;
- `resourcesService.ts` ;
- `assignmentsService.ts` ;
- `maintenanceService.ts` ;
- `notificationsService.ts` ;
- `suppliersService.ts` ;
- `tendersService.ts` ;
- `usersAdminService.ts`.

Ces services encapsulent les appels REST et conservent les pages lisibles.

### Layout principal

`MainLayout` expose la sidebar, le logo, la navigation principale, l'utilisateur connecte et le bouton de deconnexion. Le menu est filtre selon les roles lorsque necessaire.

### Gestion des roles

La gestion des roles est appliquee a deux niveaux :

- frontend : masquage ou redirection via `RoleProtectedRoute` ;
- backend : enforcement reel via `JwtAuthGuard` et `RolesGuard`.

Le backend reste l'autorite de securite. Le frontend ne fait que reduire les actions visibles.

## 5. Modele de donnees

Le modele de donnees est decrit dans [database-erd.mmd](../diagrams/database-erd.mmd) et implemente dans `backend/prisma/schema.prisma`.

### Entites principales

- `Role` et `User` : identite, role applicatif, statut et rattachement departement ;
- `Department` : structure organisationnelle ;
- `Need` et `NeedItem` : expression d'un besoin departemental multi-lignes ;
- `Supplier` : fournisseur reference ;
- `Tender` : appel d'offres rattache a un besoin ;
- `SupplierOffer` : offre fournisseur rattachee a un appel d'offres ;
- `Resource` : ressource materielle d'inventaire ;
- `ResourceAssignment` : affectation et retour d'une ressource ;
- `MaintenanceTicket` : signalement de panne ;
- `MaintenanceReport` : constat unique par ticket ;
- `MaintenanceIntervention` : suivi d'intervention ;
- `SupplierReturn` : retour fournisseur pour maintenance ;
- `Notification` : notification privee ou globale ;
- `AuditLog` : trace d'action metier importante.

### Relations structurantes

- un role possede plusieurs utilisateurs ;
- un departement possede des utilisateurs et des besoins ;
- un besoin possede plusieurs lignes et peut generer des appels d'offres ;
- un appel d'offres recoit plusieurs offres fournisseurs ;
- une ressource peut etre affectee, maintenue et reliee a un fournisseur ;
- un ticket de maintenance possede au plus un constat et plusieurs interventions ;
- les notifications peuvent etre rattachees a un utilisateur ou etre globales.

### Regles metier portees par le modele

- unicite des emails utilisateurs ;
- unicite des noms de departements et fournisseurs ;
- unicite de `inventoryCode` pour les ressources ;
- unicite de `reference` pour les appels d'offres ;
- unicite du couple `tenderId` et `supplierId` pour eviter plusieurs offres d'un meme fournisseur sur un meme appel d'offres ;
- unicite du constat par ticket de maintenance via `maintenanceTicketId`.

## 6. Securite

La sequence d'authentification est decrite dans [auth-sequence.mmd](../diagrams/auth-sequence.mmd).

### JWT

La connexion produit un access token JWT. Ce token est envoye par le frontend dans l'en-tete `Authorization: Bearer ...`. La strategie JWT valide le token et enrichit la requete avec l'utilisateur authentifie.

### RBAC

Le controle d'acces par role repose sur :

- le decorateur `@Roles(...)` ;
- `RolesGuard` ;
- `JwtAuthGuard`.

Les modules sensibles comme utilisateurs, ressources, affectations, maintenance, fournisseurs, appels d'offres et offres fournisseurs appliquent des restrictions `ADMIN` ou `MANAGER` selon le cas.

### Validation DTO

Le backend utilise des DTO NestJS pour valider les entrees. Les champs obligatoires, enums, UUID, emails, nombres et contraintes simples sont valides avant execution des services.

### Prisma

Prisma limite les acces directs a PostgreSQL, centralise les relations et fournit les transactions necessaires aux operations critiques : affectation, retour, maintenance et selection d'offre gagnante.

### Protection API

Les endpoints metier sont proteges par JWT. Les operations non autorisees retournent des erreurs standardisees. Le frontend affiche les messages d'erreur via `getApiErrorMessage`.

### CORS

La configuration CORS backend autorise explicitement les origins frontend locaux prevus, sans wildcard. Cette approche conserve une separation claire entre l'API et le client.

## 7. Processus metier

### Affectation

Le flux est documente dans [resource-assignment-sequence.mmd](../diagrams/resource-assignment-sequence.mmd).

Le manager selectionne une ressource disponible et un utilisateur actif. Le backend cree l'affectation avec le statut `ACTIVE`, puis met la ressource en `ASSIGNED`. Le retour inverse le processus : l'affectation passe en `RETURNED`, `returnedAt` est renseigne et la ressource repasse en `AVAILABLE`.

Ces operations sont transactionnelles et peuvent generer audit et notifications.

### Maintenance

Le flux est documente dans [maintenance-sequence.mmd](../diagrams/maintenance-sequence.mmd).

Le cycle actuel permet :

- signalement d'une panne avec creation de `MaintenanceTicket` ;
- passage de la ressource en `UNDER_MAINTENANCE` ;
- creation d'un constat unique ;
- creation d'une intervention ;
- declaration d'un retour fournisseur.

Le module reste extensible vers la cloture complete, le suivi avance et la notification temps reel.

### Appels d'offres

Le flux est documente dans [tender-workflow-sequence.mmd](../diagrams/tender-workflow-sequence.mmd).

Le processus part d'un besoin departemental. Un `Tender` est cree en `DRAFT`, puis publie en `PUBLISHED` si sa deadline est future. Les offres fournisseurs sont ensuite creees, puis une offre gagnante peut etre selectionnee. La selection met l'offre gagnante en `SELECTED`, rejette les autres offres et passe l'appel d'offres en `AWARDED`.

## 8. DevSecOps

Le pipeline CI/CD est decrit dans [cicd-pipeline.mmd](../diagrams/cicd-pipeline.mmd). Le flux DevSecOps complet est decrit dans [devsecops-flow.mmd](../diagrams/devsecops-flow.mmd).

### GitFlow

Le projet suit un workflow par branches :

- `develop` pour l'integration ;
- `feature/*` pour les stories Jira ;
- Pull Request obligatoire vers `develop` ;
- merge apres validations techniques et humaines.

Les branches suivent le format pedagogique `feature/SCRUM-XX-description`.

### Pull Requests

Chaque PR contient :

- reference Jira ;
- objectif ;
- inclus ;
- exclus ;
- validations executees ;
- risques ou limites.

Les PR ne sont pas mergees automatiquement par Codex. La validation humaine reste obligatoire.

### GitHub Actions

Les workflows presents couvrent :

- CI backend ;
- CI frontend ;
- checks PR ;
- SonarCloud ;
- CodeQL ;
- Semgrep.

Les etapes principales sont l'installation, le lint, le typecheck, les tests, le build et la conservation d'artefacts lorsque configuree.

### SonarCloud

SonarCloud controle la qualite : bugs, code smells, duplications, couverture et maintenabilite. Les corrections SCRUM precedentes ont deja reduit plusieurs duplications et warnings frontend/backend.

### CodeQL

CodeQL analyse les risques de securite dans le code JavaScript/TypeScript et remonte les alertes dans GitHub Security.

### Semgrep

Semgrep apporte une analyse complementaire par patterns de securite et qualite, notamment sur les modules TypeScript, NestJS et React.

## 9. Qualite

La qualite repose sur des validations locales et CI coherentes :

- `npm run lint` pour ESLint backend/frontend ;
- `npm run typecheck` pour TypeScript strict ;
- `npm run test` pour Jest et Vitest ;
- `npm run test:cov` pour la couverture ;
- `npm run build` pour compiler backend et frontend ;
- `npm run prisma:generate --workspace backend` apres evolution Prisma.

### Tests

Le backend utilise Jest. Les tests couvrent les services, controllers, guards, RBAC et regles metier critiques.

Le frontend utilise Vitest et React Testing Library. Les tests couvrent les parcours utilisateur principaux : login, dashboard, ressources, affectations, maintenance, notifications, fournisseurs, appels d'offres et administration.

### Couverture

La couverture est suivie par les scripts de test et par SonarCloud. Les zones les plus critiques sont Auth/RBAC, Resources, Assignments, Maintenance, Notifications et Audit Logs.

### Lint et typecheck

ESLint et TypeScript strict limitent les regressions de style, d'import, de typage et de fiabilite. La configuration conserve le type-aware linting avec un `tsconfig.eslint.json` adapte.

### Build

Le build valide :

- compilation NestJS ;
- compilation TypeScript frontend ;
- bundle Vite de production.

## 10. Limites et perspectives

### Limites actuelles

- le frontend regroupe parfois liste et detail dans une meme page plutot que des pages detail dediees ;
- l'authentification utilise un access token JWT sans refresh token complet ;
- les permissions restent basees sur des roles statiques, sans permissions dynamiques fines ;
- les notifications sont pull-based et non temps reel ;
- les workflows metier ne couvrent pas encore toutes les etapes possibles, comme reception finale fournisseur ou cloture maintenance complete ;
- l'audit est trace cote backend mais ne dispose pas encore d'interface de consultation.

### Evolutions futures

- ajouter refresh token et rotation securisee ;
- introduire une matrice de permissions plus fine si le besoin fonctionnel augmente ;
- creer des pages detail separees pour les grands domaines ;
- ajouter des endpoints de reporting et dashboard plus riches ;
- exposer une interface d'audit pour les administrateurs ;
- completer le workflow maintenance jusqu'a cloture, reception fournisseur et remise en service ;
- renforcer l'observabilite avec logs structures, correlation IDs et monitoring applicatif ;
- industrialiser le deploiement staging/production ;
- publier les images Docker vers un registre cible type JFrog Artifactory.

### Optimisations d'architecture

- factoriser certains composants frontend recurrentiels ;
- isoler davantage les services par sous-domaine, par exemple `supplierOffersService` separe ;
- ajouter des tests d'integration API avec base de test ;
- renforcer les contraintes metier transactionnelles au niveau service et, lorsque pertinent, au niveau base ;
- completer la documentation OpenAPI avec des exemples de payloads de recette.
