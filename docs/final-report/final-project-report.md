# Page de garde

**Titre du projet :** Gestion des Ressources Materielles  
**Auteur :** Mounir Shade  
**Formation :** Formation informatique - parcours developpement et architecture logicielle  
**Annee universitaire :** 2025-2026  
**Etablissement :** Maroc Ynov Campus  
**Depot logiciel :** `gestion-ressources-materielles`  
**Stack principale :** React, Vite, TypeScript, NestJS, Prisma, PostgreSQL, Docker, GitHub Actions, SonarCloud, CodeQL, Semgrep

Ce rapport presente la conception, la realisation, la validation et la documentation finale du projet Gestion des Ressources Materielles. Il est destine a etre utilise comme rapport academique, memoire de projet, support de soutenance et document de reference pour la maintenance future.

# Remerciements

Je tiens a remercier l'equipe pedagogique pour l'encadrement, les retours et les exigences de qualite qui ont permis de structurer ce projet de maniere progressive. Les travaux menes ont combine analyse fonctionnelle, conception logicielle, developpement incremental, securisation, automatisation CI/CD, tests, documentation et preparation de soutenance.

Je remercie egalement les personnes ayant contribue aux phases de recette, car les retours fonctionnels ont permis d'ameliorer l'experience utilisateur, notamment sur la connexion, la gestion des ressources, les affectations, les appels d'offres, les donnees de demonstration et la preparation finale du tableau de bord.

Enfin, ce projet a ete l'occasion de mettre en pratique une demarche proche d'un contexte professionnel : backlog Jira, branches Git, Pull Requests, revue de code, quality gates, correction d'anomalies SonarCloud, documentation d'architecture et generation de diagrammes exploitables dans une soutenance.

# Resume

Le projet Gestion des Ressources Materielles est une application web permettant a un etablissement de suivre son inventaire materiel, ses affectations, ses fournisseurs, ses appels d'offres et ses operations de maintenance. L'application couvre un cycle fonctionnel complet : authentification, administration des utilisateurs, rattachement aux departements, declaration de besoins departementaux, gestion de fournisseurs, creation et publication d'appels d'offres, depot et selection d'offres fournisseurs, enregistrement de ressources, consultation de l'inventaire, affectation et retour de ressources, signalement de pannes, creation de constats, suivi d'interventions, gestion de retours fournisseur, notifications et audit des actions sensibles.

La solution a ete construite dans un monorepo avec un backend NestJS en TypeScript, un frontend React/Vite en TypeScript, une base PostgreSQL et Prisma comme ORM. Le backend expose une API REST documentee via Swagger, securisee par JWT et RBAC. Le frontend propose une interface authentifiee avec dashboard, sidebar, pages metier et services API dedies. La qualite logicielle est assuree par ESLint, TypeScript strict, Jest, Vitest, React Testing Library, SonarCloud, CodeQL, Semgrep et GitHub Actions.

Le projet integre une demarche DevSecOps progressive : branches `feature/*`, Pull Requests, validations automatiques, revue humaine, quality gates, scans securite et conservation d'artefacts. Des donnees de demonstration idempotentes sont generees par le seed Prisma afin de faciliter la recette et la soutenance.

Ce rapport decrit les besoins, la methodologie, l'architecture, le modele de donnees, l'implementation backend, l'implementation frontend, la securite, les processus metier, le pipeline DevSecOps, les tests, les resultats, les difficultes rencontrees et les perspectives d'evolution.

# Abstract

The Material Resources Management project is a web application designed to help an institution manage its equipment inventory, assignments, suppliers, tenders and maintenance operations. The application covers a complete business cycle: authentication, user administration, department assignment, departmental needs, supplier management, tender creation and publication, supplier offers, winning offer selection, resource registration, inventory browsing, resource assignment and return, failure reporting, maintenance reports, interventions, supplier returns, notifications and audit logs.

The solution is implemented as a monorepo with a NestJS TypeScript backend, a React/Vite TypeScript frontend, PostgreSQL as the database and Prisma as ORM. The backend exposes a Swagger-documented REST API secured with JWT authentication and role-based access control. The frontend provides an authenticated interface with dashboard, sidebar navigation, business pages and typed API services.

The project also includes a progressive DevSecOps approach based on GitFlow, GitHub Pull Requests, GitHub Actions, SonarCloud, CodeQL, Semgrep, linting, type checking, automated tests and build validation. Idempotent Prisma seed data supports demonstrations and functional acceptance testing.

This final report describes the requirements, methodology, architecture, data model, backend implementation, frontend implementation, security model, business processes, DevSecOps pipeline, testing strategy, results, encountered difficulties and future improvements.

# Table des matieres

1. Introduction generale
2. Chapitre 1 - Analyse des besoins
3. Chapitre 2 - Methodologie projet
4. Chapitre 3 - Architecture globale
5. Chapitre 4 - Modelisation et donnees
6. Chapitre 5 - Implementation Backend
7. Chapitre 6 - Implementation Frontend
8. Chapitre 7 - Securite
9. Chapitre 8 - Processus metier
10. Chapitre 9 - DevSecOps
11. Chapitre 10 - Tests et validation
12. Chapitre 11 - Resultats
13. Chapitre 12 - Difficultes rencontrees
14. Chapitre 13 - Perspectives
15. Conclusion generale
16. Bibliographie
17. Glossaire
18. Annexes

# Introduction generale

La gestion des ressources materielles constitue un enjeu important pour tout etablissement disposant d'un parc informatique, audiovisuel, reseau ou administratif. Lorsque les ressources sont nombreuses, partagees entre plusieurs departements et soumises a des operations d'achat, d'affectation et de maintenance, une gestion manuelle devient rapidement fragile. Les fichiers disperses, les suivis informels et les informations non centralisees rendent difficile la tracabilite, la responsabilisation et la planification.

Le projet Gestion des Ressources Materielles repond a cette problematique par une application web centralisee. L'objectif est de fournir un outil permettant d'administrer les utilisateurs, de suivre les ressources, de gerer les fournisseurs, de traiter les besoins departementaux, d'organiser les appels d'offres, de suivre les affectations et de traiter les pannes. L'application vise egalement a donner une vision synthetique au travers d'un dashboard et a assurer la tracabilite par notifications et audit.

La problematique centrale peut etre formulee ainsi : comment concevoir et realiser une application web securisee, modulaire et maintenable permettant de gerer le cycle de vie complet des ressources materielles d'un etablissement, tout en respectant une demarche professionnelle de qualite logicielle et de DevSecOps ?

Les objectifs du projet sont multiples. Sur le plan fonctionnel, il s'agit de couvrir les processus essentiels : connexion, gestion utilisateurs, ressources, affectations, maintenance, fournisseurs, besoins, appels d'offres, notifications et audit. Sur le plan technique, il faut mettre en place une architecture robuste, basee sur un backend NestJS, un frontend React, Prisma et PostgreSQL. Sur le plan qualite, le projet doit etre teste, type, documente, analyse par SonarCloud, CodeQL et Semgrep, et integre dans GitHub Actions. Sur le plan pedagogique, le projet doit etre demontrable, documente et soutenable.

Le perimetre actuel correspond a une version complete pour soutenance. Certaines evolutions restent identifiees pour une version production avancee, notamment le refresh token complet, les permissions fines, les notifications temps reel, le reporting avance, l'observabilite centralisee et le deploiement production.

# Chapitre 1 - Analyse des besoins

L'analyse des besoins a permis d'identifier les principaux domaines fonctionnels du projet. Le systeme devait repondre a des besoins concrets : connaitre les ressources disponibles, affecter une ressource a un utilisateur, retourner une ressource, signaler une panne, suivre une intervention, referencer un fournisseur, creer un appel d'offres et selectionner une offre gagnante. Il devait aussi offrir une base d'administration et une securite suffisante.

Le contexte systeme est represente par le diagramme [system-context.mmd](../diagrams/system-context.mmd). Ce diagramme met en evidence les acteurs humains et les composants externes. Les utilisateurs interagissent avec le frontend React. Celui-ci appelle l'API NestJS. L'API utilise PostgreSQL via Prisma. Le depot GitHub, Jira, GitHub Actions, SonarCloud, CodeQL et Semgrep participent a la chaine projet et DevSecOps.

## Besoins metier

Le premier besoin est l'authentification. L'application doit permettre a un utilisateur autorise de se connecter avec email et mot de passe, puis d'acceder aux pages correspondant a son role. La deconnexion doit etre disponible depuis le layout principal.

Le deuxieme besoin concerne l'administration des utilisateurs. Un administrateur doit pouvoir creer un utilisateur, lui attribuer un role, le desactiver et consulter la liste des utilisateurs. Cette fonctionnalite est essentielle car les autres processus, notamment les affectations et les tickets de maintenance, dependent de l'existence d'utilisateurs actifs.

Le troisieme besoin concerne les departements et les besoins departementaux. Un departement represente une unite organisationnelle. Un besoin departemental permet de formaliser une demande materielle structuree, composee d'un titre, d'une justification, d'une priorite et de lignes de besoin. Ce besoin peut ensuite servir de base a un appel d'offres.

Le quatrieme besoin concerne les fournisseurs. L'application doit permettre de creer un fournisseur, consulter sa fiche, suivre son historique et le desactiver sans suppression physique. Les fournisseurs interviennent dans les ressources, les offres et les retours fournisseur.

Le cinquieme besoin est la gestion des appels d'offres. Un manager doit pouvoir creer un appel d'offres a partir d'un besoin, le publier, enregistrer des offres fournisseurs et selectionner l'offre gagnante. Le workflow doit rester coherent : un appel d'offres non publie ne peut pas recevoir d'offre exploitable, un fournisseur inactif ne doit pas etre utilise, et une seule offre gagnante doit etre retenue.

Le sixieme besoin est l'inventaire des ressources. L'application doit permettre de creer une ressource avec une reference inventaire unique, la consulter, la filtrer, la rechercher et modifier son statut. Les statuts couvrent les etats `AVAILABLE`, `ASSIGNED`, `UNDER_MAINTENANCE`, `OUT_OF_SERVICE` et `ARCHIVED`.

Le septieme besoin concerne les affectations. Une ressource disponible doit pouvoir etre affectee a un utilisateur actif. Le retour d'une ressource doit mettre a jour l'affectation et repasser la ressource disponible. L'historique doit etre consultable.

Le huitieme besoin concerne la maintenance. Il faut pouvoir signaler une panne, rediger un constat, creer une intervention et declarer un retour fournisseur. Ces actions doivent respecter des preconditions metier : ressource existante, ticket existant, constat obligatoire avant intervention, fournisseur actif pour retour fournisseur.

Le neuvieme besoin concerne les notifications et l'audit. Les notifications informent les utilisateurs d'evenements importants. L'audit trace les actions sensibles, notamment creation utilisateur, changement de role, desactivation, creation ressource, affectation, retour, maintenance et retour fournisseur.

## Acteurs

Les acteurs principaux sont l'administrateur, le manager ou responsable ressources, l'utilisateur interne, le technicien maintenance et le fournisseur. L'administrateur possede les droits les plus larges. Le manager gere les operations metier quotidiennes. L'utilisateur interne est beneficiaire des ressources. Le technicien intervient dans le domaine maintenance. Le fournisseur est represente dans les donnees, meme s'il n'a pas encore d'espace frontend dedie.

## Contraintes

Les contraintes metier imposent de conserver les historiques, d'eviter les suppressions physiques et de privilegier des statuts. Les contraintes techniques imposent TypeScript strict, NestJS modulaire, React/Vite, Prisma, PostgreSQL et Docker Compose. Les contraintes qualite imposent lint, typecheck, tests, build et quality gates. Les contraintes securite imposent JWT, RBAC, validation DTO, CORS explicite et absence de secrets dans le depot.

## Cas d'utilisation

Les cas d'utilisation principaux sont : se connecter, consulter le dashboard, administrer les utilisateurs, creer une ressource, consulter l'inventaire, modifier le statut d'une ressource, affecter une ressource, retourner une ressource, consulter l'historique d'affectation, signaler une panne, rediger un constat, suivre une intervention, gerer un retour fournisseur, creer un fournisseur, desactiver un fournisseur, declarer un besoin, creer un appel d'offres, publier un appel d'offres, enregistrer une offre fournisseur, selectionner une offre gagnante et consulter les notifications.

# Chapitre 2 - Methodologie projet

Le projet a ete mene selon une approche incrementale inspiree de Scrum. Les fonctionnalites ont ete decomposees en User Stories Jira, chacune possedant un objectif, un perimetre, des criteres d'acceptation, des contraintes et un workflow Git. Cette approche a permis de limiter les risques, d'isoler les changements et de maintenir une tracabilite claire entre besoin, branche, commit et Pull Request.

## Scrum et Jira

Jira a servi de support a la planification et au suivi. Les stories ont ete identifiees par des cles de type `SCRUM-XX`. Chaque story decrivait un increment coherent. Par exemple, les stories Auth ont d'abord mis en place la connexion, la deconnexion et la protection d'acces. Les stories Users ont ensuite ajoute la creation, la desactivation, l'attribution de role et le rattachement departement. Les stories Resources, Assignments, Maintenance, Suppliers, Tenders et Frontend ont progressivement enrichi l'application.

L'interet de cette organisation est de rendre le backlog lisible. Chaque branche correspond a une story. Chaque commit mentionne la cle Jira. Chaque PR contient un objectif, des inclus, des exclus et les validations executees. Cette discipline facilite la revue et la soutenance, car elle montre une progression professionnelle.

## GitFlow

Le projet utilise une strategie proche de GitFlow. La branche `develop` sert de branche d'integration. Les travaux sont menes dans des branches `feature/*`, par exemple `feature/SCRUM-55-resources-ui` ou `feature/SCRUM-75-architecture-diagrams`. Les branches sont poussees des leur creation afin de declencher la tracabilite Jira et GitHub. Les Pull Requests sont creees vers `develop`, mais ne sont pas mergees automatiquement par l'agent de developpement.

Cette approche evite les modifications directes sur `develop` ou `main`. Elle permet aussi de conserver l'historique pedagogique des branches et des PR.

## Pull Requests

Chaque Pull Request joue le role de point de controle. Elle permet de verifier le perimetre, les fichiers modifies, les validations techniques et les risques. Les PR ont ete utilisees aussi bien pour le code applicatif que pour la documentation, les strategies DevSecOps, les diagrammes et le rapport final.

Les PR sont accompagnees par GitHub Actions, SonarCloud, CodeQL et Semgrep. La validation humaine reste obligatoire avant merge. Cette separation entre implementation et validation est importante, car elle reproduit un contexte professionnel.

## Gestion des stories

Les stories ont ete regroupees par grands domaines. Le socle initial a porte sur l'architecture, le bootstrap, la qualite et DevSecOps. Ensuite, les domaines fonctionnels ont ete developpes : Auth, Users, Departments, Needs, Suppliers, Tenders, SupplierOffers, Resources, Assignments, Maintenance, Notifications, Audit et Frontend. Enfin, des stories de consolidation ont permis de corriger les blocages de recette, d'ajouter les donnees demo, de produire les diagrammes et de rediger la documentation finale.

## Synthese du backlog realise

Le backlog realise couvre :

- authentification JWT ;
- deconnexion stateless ;
- protection des acces et RBAC ;
- creation, role, desactivation et rattachement utilisateur ;
- creation departement ;
- besoins departementaux ;
- fournisseurs et historique ;
- appels d'offres ;
- offres fournisseurs et selection gagnante ;
- ressources et inventaire ;
- affectations, retours et historique ;
- maintenance, constats, interventions et retours fournisseur ;
- notifications ;
- audit ;
- frontend login, dashboard, ressources, affectations, maintenance, notifications, administration, fournisseurs et appels d'offres ;
- DevSecOps avec SonarCloud, CodeQL, Semgrep, artefacts et strategie release ;
- documentation architecture, diagrammes et rapport final.

# Chapitre 3 - Architecture globale

L'architecture globale est documentee dans [application-architecture.mmd](../diagrams/application-architecture.mmd) et [backend-modules.mmd](../diagrams/backend-modules.mmd). Elle repose sur un monorepo separant clairement frontend, backend, documentation, workflows et configuration Docker.

## Frontend

Le frontend est une application React avec Vite et TypeScript. Il est organise autour de pages, services API, composants partages, hooks et routing. Le frontend n'est pas responsable de la securite definitive ; il ameliore l'experience utilisateur en masquant certaines routes selon le role, mais le backend reste l'autorite de controle.

Les services frontend encapsulent les appels HTTP. Cela evite de disperser les URLs dans les composants et facilite les tests. Par exemple, `resourcesService.ts` gere les appels a `/resources`, `assignmentsService.ts` gere les affectations, `maintenanceService.ts` gere les tickets et interventions, et `tendersService.ts` gere appels d'offres, besoins et offres fournisseurs.

## Backend

Le backend NestJS est modulaire. Chaque domaine fonctionnel possede son module, son controller, son service, ses DTO et ses tests. Cette separation facilite la maintenance. Les controllers exposent les endpoints. Les services contiennent les regles applicatives. Prisma assure l'acces aux donnees. Les guards appliquent l'authentification et l'autorisation.

`AppModule` importe les modules suivants : Config, Prisma, AuditLogs, Health, Notifications, Maintenance, Auth, Users, Departments, DepartmentNeeds, ResourceAssignments, Resources, SupplierOffers, Suppliers et Tenders. Cette liste correspond aux domaines fonctionnels reels du projet.

## Base de donnees

La base PostgreSQL est modelisee par Prisma. Les entites principales sont User, Role, Department, Need, NeedItem, Supplier, Tender, SupplierOffer, Resource, ResourceAssignment, MaintenanceTicket, MaintenanceReport, MaintenanceIntervention, SupplierReturn, Notification et AuditLog.

Les migrations sont versionnees. Le seed Prisma genere des comptes et donnees de demonstration idempotentes. Cette idempotence permet de rejouer le seed sans supprimer ni modifier les donnees existantes, ce qui est utile pour la recette et la soutenance.

## Docker

Docker Compose est utilise pour PostgreSQL et l'environnement local. Le projet a rencontre des sujets concrets autour du demarrage Docker, de la conservation des volumes et de la sante du conteneur `grm-postgres`. La regle retenue est de ne jamais supprimer les volumes dans les operations courantes afin de conserver les donnees.

## Communication entre couches

Le frontend appelle le backend via REST. Les routes backend sont prefixees par `/api/v1`. Swagger documente l'API sur `/api/docs`. Les appels authentifies ajoutent un header Bearer JWT. Le backend valide le token, verifie le role, valide les DTO, execute le service, appelle Prisma et renvoie une reponse structuree.

# Chapitre 4 - Modelisation et donnees

La modelisation est decrite par le diagramme [database-erd.mmd](../diagrams/database-erd.mmd). Elle traduit les besoins metier en entites relationnelles et relations Prisma.

## Entites identite

`Role` definit les roles applicatifs. `User` contient l'email, le hash de mot de passe, le prenom, le nom, le statut, le role et le departement optionnel. Les statuts utilisateur sont `ACTIVE`, `INACTIVE` et `LOCKED`. Le champ `passwordHash` n'est jamais expose dans les reponses frontend.

## Entites organisationnelles

`Department` represente une structure organisationnelle. Il peut contenir des utilisateurs et des besoins. Le statut permet de conserver l'historique sans suppression physique immediate.

## Entites besoins et achats

`Need` represente un besoin departemental. Il est rattache a un departement et a un createur. `NeedItem` represente les lignes du besoin, avec designation, quantite, description optionnelle et estimation de prix.

`Tender` represente un appel d'offres. Il est rattache a un besoin et a un utilisateur createur. Il possede une reference unique, un statut, une deadline, une date de publication et une date d'attribution.

`SupplierOffer` represente l'offre d'un fournisseur sur un appel d'offres. L'unicite du couple `tenderId` et `supplierId` evite qu'un fournisseur depose plusieurs offres pour le meme appel d'offres.

## Entites fournisseurs

`Supplier` contient le nom, email de contact, telephone, adresse et statut. Il est relie aux ressources, offres fournisseurs et retours fournisseur.

## Entites ressources et affectations

`Resource` est l'entite centrale de l'inventaire. Elle contient un nom, une reference inventaire unique, une categorie, des informations optionnelles, un statut et un fournisseur optionnel.

`ResourceAssignment` relie une ressource a un utilisateur. Elle contient les dates d'affectation et de retour, le statut, un commentaire et un commentaire de retour. Les statuts sont `ACTIVE`, `RETURNED` et `CANCELLED`.

## Entites maintenance

`MaintenanceTicket` represente une panne signalee. Il est rattache a une ressource et a un declarant. Son statut peut etre `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED` ou `CANCELLED`.

`MaintenanceReport` est un constat unique par ticket. Il contient diagnostic, cause probable, gravite, recommandations et auteur.

`MaintenanceIntervention` represente le suivi d'une intervention avec technicien, description, date de debut, date de fin optionnelle, cout et resultat.

`SupplierReturn` represente le retour d'une ressource vers un fournisseur dans le cadre de la maintenance.

## Notifications et audit

`Notification` permet de creer des notifications privees ou globales. Une notification peut etre rattachee a un utilisateur ou avoir `recipientId` null pour etre visible par tous.

`AuditLog` trace les actions importantes. Il contient l'utilisateur optionnel, l'action, le type d'entite, l'identifiant d'entite, les details JSON et la date.

## Choix Prisma

Prisma apporte plusieurs benefices : typage, migrations, relations explicites, transactions, generation client et reduction des requetes SQL manuelles. Les transactions sont particulierement importantes pour les affectations, retours, signalements de panne et selections d'offres gagnantes.

# Chapitre 5 - Implementation Backend

L'implementation backend repose sur NestJS. La structure suit une logique modulaire. Chaque module contient controller, service, DTO et tests. Le backend expose une API REST et centralise les regles metier critiques.

## Auth

Le module Auth implemente la connexion par email et mot de passe. Le service recherche l'utilisateur, verifie qu'il est actif, compare le mot de passe avec bcrypt et produit un JWT. La deconnexion est stateless. L'endpoint `/auth/me` permet de recuperer l'utilisateur courant.

## RBAC

Le RBAC repose sur un decorateur `@Roles` et un guard `RolesGuard`. Les routes indiquent explicitement les roles autorises. Par exemple, l'administration utilisateur est limitee a ADMIN, alors que ressources, affectations, maintenance, fournisseurs et appels d'offres sont generalement accessibles a ADMIN et MANAGER.

## Resources

Le module Resources gere l'inventaire. La creation verifie l'unicite de `inventoryCode` et l'existence du fournisseur optionnel. La lecture permet recherche, filtres et pagination. La modification de statut est preparee pour les futurs flux d'audit et de maintenance.

## Assignments

Le module ResourceAssignments implemente l'affectation et le retour. L'affectation verifie que la ressource existe, qu'elle est disponible, que l'utilisateur existe et qu'il est actif. Elle cree l'affectation et met la ressource en `ASSIGNED` dans une transaction. Le retour passe l'affectation en `RETURNED`, renseigne `returnedAt` et repasse la ressource en `AVAILABLE`.

## Maintenance

Le module Maintenance gere le signalement d'une panne, le constat, l'intervention et le retour fournisseur. Le signalement met la ressource en `UNDER_MAINTENANCE`. Le constat est unique par ticket. L'intervention exige un constat prealable. Le retour fournisseur exige un ticket, un constat, une intervention, une ressource en maintenance et un fournisseur actif.

## Suppliers

Le module Suppliers permet la creation, la lecture, l'historique et la desactivation. Les doublons sont evites sur le nom et l'email lorsque l'email est present. La desactivation conserve le fournisseur en base.

## Tenders et SupplierOffers

Le module Tenders gere les appels d'offres. La creation part d'un besoin existant, la publication exige un statut `DRAFT` et une deadline future. Le module SupplierOffers gere les offres. Il verifie que le tender est publie, non expire et que le fournisseur est actif. La selection gagnante utilise une transaction : offre selectionnee en `SELECTED`, autres offres en `REJECTED`, tender en `AWARDED`.

## Notifications

Le module Notifications expose la liste, le compteur non lu et le marquage comme lu. Il prend en compte les notifications privees et globales. Le frontend consomme ce compteur dans la sidebar.

## Audit

Le module AuditLogs centralise les traces. L'objectif est de tracer sans bloquer l'action metier. Les actions sensibles sont journalisees avec details JSON pour conserver le contexte.

# Chapitre 6 - Implementation Frontend

Le frontend React/Vite a ete construit pour offrir une experience sobre, moderne et institutionnelle. La charte visuelle utilise un fond clair, une sidebar sombre, un accent turquoise et des cartes blanches.

## React et Vite

React fournit la structure composant. Vite apporte un demarrage rapide, un build optimise et une experience de developpement fluide. TypeScript strict renforce la fiabilite du frontend.

## Routing

Le routing est centralise dans `AppRouter`. Les routes protegees sont encapsulees par `ProtectedRoute`. Les routes reservees a certains roles utilisent `RoleProtectedRoute`. Le frontend redirige vers `/login` en absence de session et vers `/dashboard` si l'utilisateur tente d'acceder a une route non autorisee.

## AuthContext

`AuthContext` stocke la session, l'access token et l'utilisateur. Il utilise `sessionStorage`, ce qui permet de conserver la session pendant la navigation sans persistance excessive. Le logout supprime la session et redirige vers la page de connexion.

## Pages

`LoginPage` gere la connexion, les erreurs et le chargement. `DashboardPage` affiche les indicateurs dynamiques : ressources totales, ressources disponibles, notifications non lues, affectations actives et tickets maintenance ouverts.

`ResourcesPage` gere la liste, les filtres, la creation et la modification de statut. `AssignmentsPage` gere les affectations et remplace la saisie UUID par une liste d'utilisateurs actifs. `MaintenancePage` gere le signalement, les constats, les interventions et les retours fournisseur. `SuppliersPage` gere les fournisseurs. `TendersPage` gere les appels d'offres, besoins, offres et selection gagnante. `NotificationsPage` gere les notifications et leur lecture. `AdminUsersPage` gere les utilisateurs.

## Experience utilisateur

Les ecrans utilisent des messages de chargement, empty states, messages d'erreur et messages de succes. Les formulaires utilisent des validations simples cote frontend, mais les validations definitives restent cote backend. Les badges de statut rendent les donnees lisibles. La navigation principale donne acces aux domaines metier.

# Chapitre 7 - Securite

La securite est structuree autour de JWT, RBAC, validation DTO, CORS et gestion standardisee des erreurs. La sequence de connexion est documentee dans [auth-sequence.mmd](../diagrams/auth-sequence.mmd).

## JWT

Le JWT est produit a la connexion et stocke cote frontend dans la session. Il est envoye avec chaque appel protege. Cote backend, la strategie JWT valide le token et injecte l'utilisateur dans la requete.

## RBAC

Le RBAC est applique au backend. Le frontend peut masquer des routes, mais ne constitue pas la barriere de securite principale. Les roles minimum utilises fonctionnellement sont ADMIN, MANAGER et USER, meme si le schema prevoit d'autres roles pour evolution future.

## Validation DTO

Les DTO limitent les entrees incorrectes. Les validations couvrent emails, UUID, enums, champs obligatoires, chaines minimales, nombres positifs et structures imbriquees. Cette validation reduit les erreurs applicatives et ameliore les reponses API.

## CORS

La configuration CORS a ete ajustee pour les ports frontend locaux, notamment `localhost:5173` et `localhost:8080`. L'objectif est d'autoriser explicitement les origins connus sans wildcard, afin de conserver une posture de securite claire.

## Gestion des erreurs

Les erreurs backend utilisent les exceptions NestJS : UnauthorizedException, ForbiddenException, NotFoundException, BadRequestException, ConflictException. Le frontend extrait les messages API via un helper afin d'afficher des messages utiles a l'utilisateur.

# Chapitre 8 - Processus metier

Les processus metier sont documentes par les diagrammes SCRUM-75.

## Affectation

Le flux [resource-assignment-sequence.mmd](../diagrams/resource-assignment-sequence.mmd) decrit l'affectation et le retour. Une ressource doit etre disponible. L'utilisateur doit exister et etre actif. Une transaction cree l'affectation et met la ressource en `ASSIGNED`. Lors du retour, une transaction met l'affectation en `RETURNED` et la ressource en `AVAILABLE`.

Ce flux garantit la coherence entre inventaire et affectations. Il evite de creer une affectation active sur une ressource deja affectee ou indisponible.

## Maintenance

Le flux [maintenance-sequence.mmd](../diagrams/maintenance-sequence.mmd) couvre quatre etapes. D'abord, un manager signale une panne sur une ressource non archivee et non deja en maintenance. Ensuite, un constat est redige pour un ticket ouvert ou en cours. Puis une intervention est creee, avec technicien, dates, cout et resultat optionnel. Enfin, un retour fournisseur peut etre declare si un constat et une intervention existent.

Ce processus respecte les preconditions metier et laisse une trace exploitable pour le suivi.

## Appels d'offres

Le flux [tender-workflow-sequence.mmd](../diagrams/tender-workflow-sequence.mmd) part d'un besoin departemental. Un appel d'offres est cree en brouillon, puis publie si sa deadline est future. Des offres fournisseurs peuvent etre deposees sur un tender publie. La selection d'une offre gagnante est atomique : l'offre choisie devient `SELECTED`, les autres sont rejetees et le tender passe en `AWARDED`.

# Chapitre 9 - DevSecOps

Le pipeline est represente par [cicd-pipeline.mmd](../diagrams/cicd-pipeline.mmd) et le flux global par [devsecops-flow.mmd](../diagrams/devsecops-flow.mmd).

## GitHub Actions

Les workflows GitHub Actions executent les controles backend et frontend. Les etapes principales sont installation, lint, typecheck, tests et build. Des workflows specialises executent SonarCloud, CodeQL et Semgrep.

## SonarCloud

SonarCloud analyse la qualite du code : bugs, vulnerabilities, code smells, duplications et couverture. Plusieurs corrections ont ete menees pour satisfaire les quality gates, notamment sur des duplications DTO, du tri frontend, des warnings et la couverture frontend.

## CodeQL

CodeQL fournit une analyse securite semantique. Il complete SonarCloud en recherchant des patterns de vulnerabilites dans le code JavaScript/TypeScript.

## Semgrep

Semgrep apporte une analyse par regles. Son integration est progressive afin d'eviter les faux positifs trop bloquants au demarrage. Il renforce la detection de patterns a risque.

## Strategie qualite

La strategie qualite impose de ne pas merger sans validation. Les PR doivent rester lisibles, limitees au perimetre et accompagnees de tests. Les corrections CI/Sonar sont traitees dans la branche concernee sans ouvrir inutilement une nouvelle PR.

# Chapitre 10 - Tests et validation

Les tests et validations constituent une part importante du projet. Les commandes principales sont `npm run lint`, `npm run typecheck`, `npm run test`, `npm run test:cov` et `npm run build`.

## Tests backend

Le backend utilise Jest. Les tests couvrent les controllers, services, guards, strategies et regles metier. Les modules critiques ont ete renforces : Auth, RBAC, Resources, Assignments, Maintenance, Notifications et Audit Logs.

## Tests frontend

Le frontend utilise Vitest et React Testing Library. Les tests simulent des parcours utilisateur : connexion, dashboard, ressources, affectations, maintenance, notifications, fournisseurs, appels d'offres et administration utilisateurs. Ces tests valident la presence des messages, les appels API, les formulaires et les actions principales.

## Couverture

La couverture est suivie localement et par SonarCloud. Des travaux specifiques ont ete menes sur SCRUM-65 pour augmenter la couverture frontend, notamment autour de `ResourcesPage`, `apiClient` et `AuthContext`.

## Lint et typecheck

ESLint verifie les conventions et detecte des erreurs potentielles. TypeScript strict garantit que les objets, DTO, services et composants respectent les contrats attendus. Une correction specifique a ete necessaire pour inclure les fichiers de configuration TypeScript dans le `tsconfig.eslint.json` sans desactiver le lint type-aware.

## Build

Le build confirme que le backend NestJS compile et que le frontend Vite produit un bundle valide. Il s'agit d'un controle important avant soutenance, car il prouve que le projet n'est pas seulement fonctionnel en mode developpement.

# Chapitre 11 - Resultats

Le projet aboutit a une application complete et demontrable. Les fonctionnalites principales sont realisees.

## Fonctionnalites realisees

L'application permet de se connecter avec des comptes de demonstration, d'acceder au dashboard, de gerer l'inventaire, de creer des ressources, de changer leur statut, d'affecter des ressources a des utilisateurs, de retourner une ressource, de consulter les historiques, de signaler des pannes, de rediger des constats, de suivre des interventions, de declarer des retours fournisseur, de gerer les fournisseurs, de gerer les appels d'offres, de deposer des offres fournisseurs, de selectionner une offre gagnante, de consulter les notifications et d'administrer les utilisateurs.

## Captures attendues

Les captures a integrer dans une version mise en page du rapport peuvent inclure :

- ecran de connexion avec logo ;
- dashboard avec KPI dynamiques ;
- page ressources avec tableau, filtres et formulaire ;
- detail ressource ;
- page affectations avec select utilisateur ;
- page maintenance ;
- page fournisseurs ;
- page appels d'offres ;
- page notifications ;
- page administration utilisateurs ;
- Swagger API ;
- Pull Request GitHub avec checks ;
- dashboard SonarCloud.

## Benefices

Le premier benefice est la centralisation. Les informations ne sont plus dispersees. Le deuxieme est la tracabilite : affectations, maintenance, notifications et audit permettent de suivre les evenements importants. Le troisieme est la securite : les roles limitent les actions sensibles. Le quatrieme est la qualite : tests, CI, SonarCloud, CodeQL et Semgrep structurent le cycle de livraison. Le cinquieme est la demontrabilite : le seed Prisma fournit des donnees realistes.

# Chapitre 12 - Difficultes rencontrees

Plusieurs difficultes ont ete rencontrees et resolues au cours du projet.

## CORS localhost

Le frontend a ete lance selon les phases sur `localhost:5173` et `localhost:8080`. Le backend autorisait initialement une origin differente, ce qui bloquait les appels depuis le navigateur malgre le bon fonctionnement direct de l'API. La correction a consiste a aligner explicitement les origins locales sans utiliser de wildcard.

## Docker

Docker Desktop n'etait pas toujours demarre. Certaines validations Prisma ou seed echouaient lorsque PostgreSQL n'etait pas accessible sur `localhost:5432`. La procedure retenue consiste a verifier Docker, demarrer `docker compose up -d postgres`, attendre le healthcheck et ne jamais supprimer les volumes.

## Ports 3000 et 8080

Les serveurs NestJS et Vite utilisent respectivement les ports 3000 et 8080. Des processus anciens pouvaient rester actifs. Des procedures d'arret propre ont ete mises en place pour eviter de tuer des processus non lies au projet.

## SonarCloud

SonarCloud a signale des duplications, warnings et hotspots. Les corrections ont porte sur des DTO, des fichiers frontend, le pinning d'action SonarCloud et la suppression de valeurs par defaut faibles dans Docker Compose.

## Seed

Le seed devait etre idempotent, ne pas modifier les utilisateurs existants, ne pas supprimer de donnees et ne pas creer de doublons. Cette contrainte a impose une logique de verification avant creation pour les comptes, ressources, fournisseurs, besoins, affectations, maintenance, notifications, appels d'offres et offres.

## UX affectations

L'ecran affectations demandait initialement un UUID utilisateur manuel. Cette approche etait peu acceptable pour une demonstration. L'amelioration a consiste a consommer `GET /users` et a proposer un select d'utilisateurs actifs avec prenom, nom, email et role.

## Appels d'offres

La creation d'un appel d'offres depend d'un besoin departemental. En absence de besoin, l'ecran etait difficile a demontrer. L'UX a ete amelioree avec un message clair, et le seed fournit des besoins exploitables.

# Chapitre 13 - Perspectives

Le projet est complet pour la soutenance, mais plusieurs evolutions permettraient de le rapprocher d'un environnement production.

## Refresh token

L'authentification actuelle repose sur un access token JWT. Une evolution pertinente serait d'ajouter un refresh token avec rotation, stockage securise, revocation et expiration controlee.

## Permissions avancees

Le RBAC actuel est statique. Une version avancee pourrait introduire des permissions dynamiques par action, domaine, departement ou ressource.

## Notifications temps reel

Les notifications sont actuellement consultees par appels API. Des WebSockets ou Server-Sent Events permettraient d'actualiser les notifications en temps reel.

## Reporting

Le dashboard pourrait etre enrichi avec des graphiques, tendances, repartitions par departement, couts de maintenance, taux d'utilisation, fournisseurs les plus sollicites et indicateurs d'achat.

## Observabilite

Une observabilite plus avancee pourrait inclure logs structures, correlation IDs, traces distribuees, metriques Prometheus, dashboards Grafana et alerting.

## Deploiement production

Le projet pourrait evoluer vers un deploiement staging/production avec images Docker publiees dans un registre, migrations automatisees, secrets geres par plateforme cloud et rollback documente.

# Approfondissement technique et retour d'experience

Cette section complete le rapport avec une analyse plus detaillee des choix realises, de leur justification et de leur impact sur la maintenabilite du projet. Elle permet aussi d'expliciter certains arbitrages qui ne sont pas toujours visibles dans le code, mais qui structurent fortement la qualite finale d'une application.

## Coherence entre architecture et implementation

Un point important du projet est la coherence entre les documents d'architecture et le depot reel. Les premieres documentations ont defini une cible : monorepo, backend NestJS, frontend React, base PostgreSQL, Prisma, JWT, RBAC, tests, Docker et CI/CD. Au fil du developpement, cette cible a ete concretisee par des modules et fichiers existants. Le backend n'est pas reste une abstraction : `AppModule` importe effectivement les modules metier attendus, les controllers exposent les endpoints prevus, les DTO encadrent les payloads, et `schema.prisma` porte les entites principales.

Cette coherence est essentielle dans un rapport final. Une documentation d'architecture trop eloignee du code perd rapidement sa valeur. A l'inverse, une documentation basee sur le depot reel permet de comprendre le systeme, de le maintenir et de le presenter de maniere credible. C'est pour cette raison que SCRUM-75 a produit des diagrammes a partir des modules existants, puis que SCRUM-50 a formalise une documentation d'architecture exploitant ces diagrammes. Le present rapport reprend cette meme logique : il ne decrit pas une architecture ideale, mais l'application effectivement construite.

## Modularite backend

Le choix de NestJS a facilite la separation en modules. Chaque domaine dispose de son propre espace : Auth, Users, Departments, DepartmentNeeds, Resources, ResourceAssignments, Maintenance, Suppliers, Tenders, SupplierOffers, Notifications et AuditLogs. Cette organisation permet d'isoler les responsabilites.

Par exemple, le module Resources ne gere pas directement l'affectation. Il connait les ressources, leur creation, leur lecture, leur statut et leur historique. Le module ResourceAssignments gere quant a lui les regles d'affectation et de retour. Cette separation evite qu'un service devienne trop large. Elle permet aussi de tester les regles metier dans le module le plus approprie.

Le module Maintenance illustre un cas plus riche. Il regroupe plusieurs operations liees au meme domaine : tickets, constats, interventions et retours fournisseur. Il aurait ete possible de creer quatre modules separes, mais le choix de les regrouper reste coherent, car ces objets partagent un workflow commun et des preconditions imbriquees. Le constat depend d'un ticket, l'intervention depend d'un constat, et le retour fournisseur depend du ticket, de la ressource, du fournisseur et d'au moins une intervention.

## Services applicatifs et transactions

Les services backend jouent un role central. Ils ne se contentent pas d'appeler Prisma ; ils verifient les regles metier. Par exemple, lors d'une affectation, le service doit s'assurer que la ressource existe, qu'elle est disponible, que l'utilisateur existe, qu'il est actif, et qu'une affectation active concurrente n'est pas creee. Ensuite seulement, la ressource et l'affectation sont mises a jour.

Les transactions Prisma sont un choix important pour les operations atomiques. Une affectation modifie deux objets : `ResourceAssignment` et `Resource`. Si une erreur survenait entre ces deux operations, le systeme pourrait etre incoherent. La transaction garantit que l'ensemble reussit ou echoue. Le meme principe s'applique a la selection d'une offre gagnante, qui doit selectionner l'offre retenue, rejeter les autres et attribuer l'appel d'offres.

Cette logique montre que l'application ne repose pas uniquement sur des CRUD simples. Les services portent des regles de coherence et assurent la stabilite du domaine.

## DTO et validation

Les DTO occupent une place importante. Ils permettent de decrire les donnees entrantes et sortantes, de documenter Swagger et de valider les payloads. Le backend attend par exemple des emails valides, des UUID, des enums, des chaines obligatoires, des quantites positives et des structures imbriquees pour les besoins departementaux.

Une partie du travail de qualite a consiste a eviter les duplications dans les DTO. SonarCloud a signale certains fichiers trop similaires. Les corrections ont permis de factoriser ou simplifier les reponses sans changer le comportement fonctionnel. Cette experience montre qu'un outil de qualite ne se limite pas a detecter des erreurs : il influence aussi la maniere d'ecrire un code plus maintenable.

Les DTO ont aussi une valeur de contrat. Le frontend sait quels champs attendre. Le backend sait quels champs accepter. Cette stabilite est importante dans une application monorepo, car elle evite les decalages entre pages React et API NestJS.

## Frontend et experience utilisateur

Le frontend a evolue progressivement. La premiere etape a ete l'ecran de connexion, qui a valide la communication avec `POST /auth/login`. Ensuite, le dashboard a fourni une page d'accueil authentifiee. Puis les pages metier ont ete ajoutees : ressources, affectations, maintenance, fournisseurs, notifications, administration utilisateurs et appels d'offres.

Le travail frontend n'a pas consiste uniquement a afficher des formulaires. Plusieurs ajustements UX ont ete necessaires. Le cas des affectations est parlant : demander a l'utilisateur de saisir un UUID etait techniquement possible, mais fonctionnellement mauvais. La correction a consiste a utiliser `GET /users` pour afficher une liste d'utilisateurs actifs. Cette evolution transforme une interface technique en interface utilisable.

Le cas des appels d'offres est similaire. La creation d'un tender depend d'un besoin departemental. Si aucun besoin n'existe, un formulaire vide devient incomprehensible. L'interface doit donc expliquer la situation : aucun besoin disponible, il faut creer un besoin ou executer le seed de demonstration. Cette attention aux empty states rend l'application plus professionnelle.

Le dashboard a aussi ete ameliore. Des KPI statiques ou marques "A connecter" peuvent suffire au debut, mais ils affaiblissent une demonstration finale. L'ajout des endpoints de comptage et leur integration frontend rendent le tableau de bord plus credible.

## Donnees de demonstration

Le seed Prisma est un element important du projet final. Sans donnees de demonstration, la recette devient lente : il faut creer des utilisateurs, ressources, fournisseurs, besoins, appels d'offres, offres, affectations et tickets avant de pouvoir montrer les ecrans. Le seed resout ce probleme en creant un jeu coherent.

La contrainte principale etait l'idempotence. Un seed dangereux pourrait supprimer des donnees ou creer des doublons. Ici, l'objectif etait inverse : conserver l'existant, ne jamais modifier les utilisateurs deja presents et creer uniquement les donnees absentes. Cette approche permet de rejouer le seed avant une soutenance, une recette ou un test local sans compromettre la base.

Le jeu de donnees couvre les principaux modules : ressources visibles, fournisseurs actifs, besoins departementaux, affectations actives et retournee, tickets de maintenance, constats, interventions, notifications, appels d'offres et offres fournisseurs. Il alimente le dashboard et rend les pages demonstrables immediatement.

## Documentation et soutenance

La documentation finale est organisee en plusieurs niveaux. Le README sert au demarrage rapide. Les documents DevSecOps expliquent les pipelines et standards. Les diagrammes Mermaid donnent une vision visuelle. La documentation d'architecture SCRUM-50 sert de reference technique. Le present rapport assemble ces elements dans une narration academique.

Cette separation est utile. Un developpeur qui veut lancer le projet lit le README. Un evaluateur qui veut comprendre l'architecture lit SCRUM-50. Une personne qui prepare la soutenance utilise les diagrammes SCRUM-75. Le rapport final, lui, relie les besoins, la methode, l'implementation, la qualite et les perspectives.

L'integration des diagrammes est particulierement importante. Les diagrammes de sequence permettent d'expliquer les flux metier sans entrer directement dans le code. Le diagramme ERD donne une vision du modele relationnel. Le diagramme backend modules montre la structure NestJS. Le diagramme DevSecOps relie Jira, GitHub, CI, scans et revue humaine.

## Qualite et discipline de livraison

La qualite du projet repose autant sur les outils que sur la discipline. Les outils sont nombreux : ESLint, TypeScript, Jest, Vitest, React Testing Library, SonarCloud, CodeQL, Semgrep, GitHub Actions. Mais leur efficacite depend de leur utilisation systematique.

Chaque story importante a suivi un cycle : branche depuis `develop`, push initial, implementation limitee au perimetre, tests, lint, typecheck, build, commit, push, PR, validation humaine. Cette repetition peut sembler lourde, mais elle reduit les risques. Elle permet de savoir quelle story a introduit quel changement. Elle facilite le retour arriere et la revue.

Le projet a egalement montre l'interet des corrections ciblees. Lorsqu'une PR etait bloquee par SonarCloud, la correction ne devait pas devenir un refactor global. Il fallait corriger le finding, conserver le comportement et pousser sur la meme branche. Cette rigueur est caracteristique d'un environnement professionnel.

## Limites pedagogiques et realisme

Le projet a ete realise dans un cadre pedagogique. Certaines decisions privilegient donc la lisibilite et la demonstration. Par exemple, les roles avances existent dans le schema, mais les controles fonctionnels principaux se concentrent sur ADMIN, MANAGER et USER. De meme, les notifications sont pull-based plutot que temps reel, ce qui suffit pour demontrer le cycle complet sans introduire WebSocket.

Le frontend regroupe parfois liste et detail dans une meme page. Cette approche accelere la livraison et reste coherent avec la taille du projet. Dans une version plus grande, il serait pertinent de separer davantage certaines pages detail.

Ces limites ne diminuent pas la valeur du projet. Elles montrent plutot que l'architecture a ete dimensionnee en fonction du contexte, avec des points d'evolution clairement identifies.

## Bilan d'apprentissage

Ce projet a permis de mettre en pratique plusieurs competences. La premiere est l'analyse fonctionnelle : transformer un besoin general en backlog, acteurs, cas d'utilisation et regles metier. La deuxieme est l'architecture logicielle : choisir une stack, separer les responsabilites, modeliser les donnees et securiser l'API. La troisieme est le developpement fullstack : creer des endpoints backend et des ecrans frontend coherents. La quatrieme est la qualite : tester, typer, analyser, corriger et documenter. La cinquieme est la demarche DevSecOps : integrer securite et qualite dans le pipeline, pas uniquement a la fin.

Le projet montre aussi l'importance de la recette. Plusieurs ameliorations finales viennent de tests manuels : CORS, comptes demo, affichage des erreurs, chargement de l'inventaire, select utilisateur, dashboard dynamique et donnees demo. Ces elements rappellent qu'une application n'est pas terminee lorsqu'elle compile ; elle est terminee lorsqu'elle peut etre utilisee, expliquee et maintenue.

## Synthese operationnelle pour la soutenance

Pour une demonstration orale, le scenario le plus lisible consiste a partir de la connexion administrateur, puis a montrer le dashboard dynamique. Ce premier ecran permet de prouver que le backend, le frontend, la base de donnees et les donnees de demonstration sont connectes. Ensuite, la navigation peut suivre le cycle metier naturel : consulter les ressources, creer ou selectionner une ressource disponible, l'affecter a un utilisateur actif, verifier l'historique, puis retourner la ressource. Ce parcours illustre la coherence entre inventaire et affectations.

Le second scenario fort concerne la maintenance. Il permet de montrer qu'une ressource peut passer en maintenance, recevoir un ticket, un constat, une intervention et un retour fournisseur. Cette demonstration est interessante car elle mobilise plusieurs entites et plusieurs preconditions metier. Elle montre aussi que le projet ne se limite pas a une liste de ressources, mais traite un vrai cycle operationnel.

Le troisieme scenario porte sur les achats. A partir d'un besoin departemental, l'utilisateur cree un appel d'offres, le publie, ajoute des offres fournisseurs et selectionne l'offre gagnante. Ce flux montre la relation entre besoins, fournisseurs, appels d'offres et offres. Il met aussi en valeur les transactions Prisma, car la selection gagnante modifie plusieurs lignes de maniere atomique.

Enfin, la soutenance peut se conclure par les aspects transverses : notifications, audit, Swagger, tests, Pull Requests, SonarCloud, CodeQL, Semgrep et diagrammes. Cette conclusion technique permet de montrer que l'application a ete pensee comme un produit maintenable, pas seulement comme un prototype fonctionnel.

# Conclusion generale

Le projet Gestion des Ressources Materielles a permis de concevoir et realiser une application web complete, structuree et securisee. Il couvre les principaux processus d'un parc materiel : utilisateurs, departements, besoins, fournisseurs, appels d'offres, ressources, affectations, maintenance, notifications et audit.

Sur le plan technique, le projet met en oeuvre une architecture moderne et maintenable : React/Vite cote frontend, NestJS cote backend, Prisma et PostgreSQL cote donnees, Docker pour l'environnement local et GitHub Actions pour la validation continue. Sur le plan securite, JWT, RBAC, validation DTO, CORS explicite et audit renforcent la maitrise des acces et des actions. Sur le plan qualite, ESLint, TypeScript strict, Jest, Vitest, SonarCloud, CodeQL et Semgrep apportent des garanties importantes.

La demarche projet a ete aussi importante que le resultat applicatif. Le travail par User Stories Jira, branches feature, commits conventionnels, Pull Requests, corrections CI et documentation progressive montre une logique proche d'un contexte professionnel. Les diagrammes SCRUM-75, la documentation d'architecture SCRUM-50 et le present rapport SCRUM-51 fournissent un ensemble coherent pour la soutenance et la maintenance future.

Le projet atteint ainsi son objectif : fournir une application fonctionnelle, demontrable, documentee et techniquement solide pour la gestion des ressources materielles.

# Bibliographie

- Documentation officielle NestJS : https://docs.nestjs.com
- Documentation officielle React : https://react.dev
- Documentation officielle Vite : https://vite.dev
- Documentation Prisma : https://www.prisma.io/docs
- Documentation PostgreSQL : https://www.postgresql.org/docs
- Documentation GitHub Actions : https://docs.github.com/actions
- Documentation SonarCloud : https://docs.sonarsource.com/sonarcloud
- Documentation CodeQL : https://codeql.github.com/docs
- Documentation Semgrep : https://semgrep.dev/docs
- Documentation Mermaid : https://mermaid.js.org

# Glossaire

**API REST** : interface HTTP permettant au frontend de communiquer avec le backend.  
**AuditLog** : trace persistante d'une action metier importante.  
**CI/CD** : integration continue et livraison continue.  
**CodeQL** : outil d'analyse securite semantique du code.  
**DTO** : Data Transfer Object, objet de validation et transfert de donnees.  
**JWT** : JSON Web Token, jeton d'authentification.  
**NestJS** : framework backend Node.js structure autour de modules, controllers et services.  
**Prisma** : ORM TypeScript utilise pour acceder a PostgreSQL.  
**RBAC** : Role-Based Access Control, controle d'acces base sur les roles.  
**Semgrep** : outil d'analyse statique par regles.  
**SonarCloud** : plateforme d'analyse qualite et securite du code.  
**Vite** : outil de build frontend rapide utilise avec React.

# Annexes

## Annexe A - Liste des diagrammes

- [system-context.mmd](../diagrams/system-context.mmd)
- [application-architecture.mmd](../diagrams/application-architecture.mmd)
- [backend-modules.mmd](../diagrams/backend-modules.mmd)
- [database-erd.mmd](../diagrams/database-erd.mmd)
- [auth-sequence.mmd](../diagrams/auth-sequence.mmd)
- [resource-assignment-sequence.mmd](../diagrams/resource-assignment-sequence.mmd)
- [maintenance-sequence.mmd](../diagrams/maintenance-sequence.mmd)
- [tender-workflow-sequence.mmd](../diagrams/tender-workflow-sequence.mmd)
- [resource-state-diagram.mmd](../diagrams/resource-state-diagram.mmd)
- [cicd-pipeline.mmd](../diagrams/cicd-pipeline.mmd)
- [devsecops-flow.mmd](../diagrams/devsecops-flow.mmd)

## Annexe B - Liste des modules backend

- `AuthModule`
- `UsersModule`
- `DepartmentsModule`
- `DepartmentNeedsModule`
- `ResourcesModule`
- `ResourceAssignmentsModule`
- `MaintenanceModule`
- `SuppliersModule`
- `TendersModule`
- `SupplierOffersModule`
- `NotificationsModule`
- `AuditLogsModule`
- `HealthModule`
- `PrismaModule`

## Annexe C - Liste des endpoints principaux

### Auth

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

### Users

- `GET /api/v1/users`
- `GET /api/v1/users/:id`
- `POST /api/v1/users`
- `PATCH /api/v1/users/:id/role`
- `PATCH /api/v1/users/:id/deactivate`
- `PATCH /api/v1/users/:id/department`

### Resources

- `GET /api/v1/resources`
- `GET /api/v1/resources/:id`
- `POST /api/v1/resources`
- `PATCH /api/v1/resources/:id/status`
- `GET /api/v1/resources/:id/assignments`

### Assignments

- `GET /api/v1/resource-assignments/active-count`
- `GET /api/v1/resource-assignments/:id`
- `POST /api/v1/resource-assignments`
- `PATCH /api/v1/resource-assignments/:id/return`

### Maintenance

- `GET /api/v1/maintenance-tickets/open-count`
- `POST /api/v1/maintenance-tickets`
- `POST /api/v1/maintenance-tickets/:id/report`
- `POST /api/v1/maintenance-tickets/:id/intervention`
- `POST /api/v1/maintenance-tickets/:id/supplier-return`

### Suppliers

- `GET /api/v1/suppliers`
- `GET /api/v1/suppliers/:id`
- `POST /api/v1/suppliers`
- `GET /api/v1/suppliers/:id/history`
- `PATCH /api/v1/suppliers/:id/deactivate`

### Department Needs

- `GET /api/v1/department-needs`
- `GET /api/v1/department-needs/:id`
- `POST /api/v1/department-needs`

### Tenders

- `GET /api/v1/tenders`
- `GET /api/v1/tenders/:id`
- `POST /api/v1/tenders`
- `GET /api/v1/tenders/:id/offers`
- `PATCH /api/v1/tenders/:id/publish`

### Supplier Offers

- `GET /api/v1/supplier-offers`
- `GET /api/v1/supplier-offers/:id`
- `POST /api/v1/supplier-offers`
- `PATCH /api/v1/supplier-offers/:id/select`

### Notifications

- `GET /api/v1/notifications`
- `GET /api/v1/notifications/unread-count`
- `PATCH /api/v1/notifications/:id/read`

## Annexe D - Documents de reference internes

- [Documentation d'architecture](../architecture/architecture-documentation.md)
- [README projet](../../README.md)
- [Strategie de tests unitaires](../quality/unit-testing-strategy.md)
- [Cartographie de couverture](../quality/test-coverage-map.md)
- [Strategie DevSecOps](../devops/devsecops-roadmap.md)
- [Strategie SonarCloud](../devops/sonarcloud-strategy.md)
- [Strategie security scanning](../devops/security-scanning-strategy.md)

## Annexe E - Commandes de validation

```bash
npm run lint
npm run typecheck
npm run test
npm run test:cov
npm run build
npm run prisma:generate --workspace backend
npm run prisma:seed --workspace backend
```

Ces commandes constituent le socle de validation locale avant Pull Request et soutenance.
