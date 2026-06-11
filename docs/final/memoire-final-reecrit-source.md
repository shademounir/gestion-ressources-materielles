# Gestion des Ressources Matérielles

## Remerciements

Je tiens à remercier l’équipe pédagogique de Maroc Ynov Campus pour l’accompagnement apporté tout au long de ce projet de fin d’études. Les exigences formulées pendant l’année m’ont conduit à aborder ce travail non comme une simple application à développer, mais comme un projet complet à concevoir, structurer, sécuriser, tester et documenter.

Je remercie également les personnes qui ont participé aux phases de recette. Leurs retours ont été déterminants, car ils ont mis en évidence des points que l’on ne perçoit pas toujours lorsque l’on est soi-même à l’origine du développement. Le remplacement d’une saisie manuelle d’identifiant par une liste déroulante, l’amélioration des messages d’erreur, la correction de la configuration CORS locale ou encore la préparation de données de démonstration sont nés de cette confrontation entre le code et l’usage réel.

Enfin, ce projet m’a permis de relier plusieurs compétences souvent abordées séparément : l’analyse fonctionnelle, la modélisation, l’architecture logicielle, le développement backend et frontend, la sécurité applicative, les tests, l’intégration continue et la documentation. C’est précisément cette articulation entre les disciplines qui donne au projet son intérêt pédagogique et professionnel.

## Résumé

Ce mémoire présente la conception et la réalisation d’une application web de gestion des ressources matérielles destinée à un établissement. L’objectif principal est de centraliser le suivi du parc matériel, depuis l’expression d’un besoin jusqu’à l’inventaire, l’affectation, la maintenance, le suivi des fournisseurs et les appels d’offres.

La solution a été construite sous forme de monorepo. Le backend repose sur NestJS, Prisma et PostgreSQL. Le frontend utilise React, Vite et TypeScript. L’authentification est assurée par JWT, les accès sont contrôlés par rôles, et l’API REST est documentée avec Swagger. Le projet intègre également une démarche DevSecOps fondée sur GitHub Actions, SonarCloud, CodeQL et Semgrep.

Au-delà du résultat fonctionnel, ce mémoire insiste sur les choix effectués, les alternatives envisageables, les compromis acceptés et les difficultés rencontrées. Il ne s’agit pas seulement de présenter une application qui fonctionne, mais de montrer comment elle a été pensée, construite, vérifiée et rendue soutenable devant un jury.

## Abstract

This thesis presents the design and implementation of a web application dedicated to material resources management in an academic institution. The main objective is to centralize equipment tracking, from departmental needs to inventory, assignments, maintenance, supplier management and tender workflows.

The solution was developed as a monorepo. The backend relies on NestJS, Prisma and PostgreSQL, while the frontend uses React, Vite and TypeScript. Authentication is handled through JWT, access is controlled through role-based authorization, and the REST API is documented with Swagger. The project also includes a DevSecOps approach based on GitHub Actions, SonarCloud, CodeQL and Semgrep.

Beyond the functional result, this report discusses technical choices, alternatives, trade-offs and lessons learned. Its purpose is not only to present a working application, but to explain how it was designed, built, verified and prepared for an academic defense.

## Introduction générale

La gestion des ressources matérielles est souvent considérée comme une activité administrative secondaire. Pourtant, dès qu’un établissement possède un parc informatique, audiovisuel ou réseau partagé entre plusieurs services, cette gestion devient un véritable enjeu d’organisation. Un équipement mal suivi peut être indisponible au moment où il est nécessaire, affecté à la mauvaise personne, oublié dans un service ou immobilisé trop longtemps en maintenance.

Dans le cadre de ce projet de fin d’études, j’ai choisi de concevoir une application interne permettant de suivre le cycle de vie des ressources matérielles. Ce sujet m’a intéressé parce qu’il dépasse le simple inventaire. Il oblige à prendre en compte des utilisateurs, des rôles, des affectations, des besoins départementaux, des fournisseurs, des appels d’offres, des pannes, des interventions, des notifications et des traces d’audit.

La problématique centrale peut être formulée ainsi : comment concevoir une application web modulaire, sécurisée et maintenable permettant de gérer le cycle de vie complet d’une ressource matérielle, tout en respectant une démarche professionnelle de qualité logicielle et de DevSecOps ?

Afin de répondre à cette problématique, j’ai adopté une démarche incrémentale. Le projet a d’abord été structuré autour d’un socle technique : monorepo, backend NestJS, frontend React, base PostgreSQL, Prisma, Docker et pipeline GitHub Actions. Les fonctionnalités ont ensuite été développées par User Stories, chacune correspondant à un périmètre précis, une branche Git, un commit conventionnel et une Pull Request.

Ce mémoire présente donc à la fois le produit obtenu et la démarche qui l’a rendu possible. Il expose les choix techniques, les raisons de ces choix, les limites identifiées, les difficultés rencontrées et les enseignements tirés. L’objectif est que le lecteur puisse comprendre non seulement ce qui a été développé, mais aussi pourquoi cela a été développé de cette manière.

## Chapitre 1 - Contexte et analyse des besoins

Le contexte du projet est celui d’un établissement qui doit gérer des ressources partagées entre plusieurs utilisateurs et départements. Les équipements peuvent être disponibles, affectés, en maintenance, hors service ou archivés. Ils peuvent provenir de fournisseurs différents, être liés à des achats, faire l’objet d’interventions et générer des notifications.

Une gestion manuelle, fondée sur des fichiers dispersés ou des échanges informels, atteint rapidement ses limites. Elle rend difficile la traçabilité, fragilise la responsabilité des utilisateurs et complique la planification des acquisitions. Le projet répond à ce problème par une application centralisée.

Les acteurs principaux sont l’administrateur, le manager ou responsable ressources, l’utilisateur interne, le technicien de maintenance et le fournisseur. L’administrateur possède les droits les plus larges. Le manager pilote les opérations quotidiennes. L’utilisateur interne peut recevoir une ressource et consulter ses notifications. Le technicien intervient dans le suivi de maintenance. Le fournisseur est un acteur externe représenté dans les données d’achat et de retour fournisseur.

Les besoins fonctionnels se structurent autour de plusieurs domaines. Le premier est l’authentification : un utilisateur doit pouvoir se connecter, être reconnu par le système et accéder uniquement aux modules autorisés. Le deuxième est l’administration des utilisateurs : création de comptes, attribution de rôles et désactivation logique. Le troisième est l’inventaire des ressources : création, recherche, filtrage, consultation et changement de statut.

Les affectations constituent un autre besoin central. Une ressource disponible doit pouvoir être affectée à un utilisateur actif. Cette opération doit modifier le statut de la ressource et créer un historique. Le retour d’une ressource doit annuler l’affectation active et rendre la ressource à nouveau disponible.

La maintenance représente un processus plus long. Il faut pouvoir signaler une panne, rédiger un constat, suivre une intervention et éventuellement déclarer un retour fournisseur. Chaque étape porte une information différente : le ticket décrit l’incident, le constat formalise le diagnostic, l’intervention décrit l’action réalisée, et le retour fournisseur trace un transfert externe.

Le domaine achat est représenté par les fournisseurs, les besoins départementaux, les appels d’offres et les offres fournisseurs. Un besoin départemental permet de formaliser une demande. L’appel d’offres organise la consultation. Les offres fournisseurs représentent les propositions, et la sélection d’une offre gagnante clôture la décision.

Les besoins non fonctionnels sont tout aussi importants. L’application devait être sécurisée, testable, maintenable, documentée et compatible avec un pipeline CI/CD. J’ai également cherché à éviter les suppressions physiques lorsque l’historique devait être conservé. Les statuts et les désactivations logiques ont donc été privilégiés dans plusieurs modules.

Cette analyse m’a permis de comprendre qu’une ressource matérielle n’est pas un simple enregistrement. Elle traverse des états, des responsabilités et des décisions. Le modèle devait donc être suffisamment riche pour représenter cette réalité, sans devenir trop complexe pour une version soutenable.

## Chapitre 2 - Analyse et conception

La conception a commencé par l’identification des entités principales. Les plus structurantes sont User, Role, Department, Resource, ResourceAssignment, MaintenanceTicket, MaintenanceReport, MaintenanceIntervention, Supplier, Need, Tender, SupplierOffer, Notification et AuditLog. Ces entités traduisent les grands domaines fonctionnels du projet.

J’ai choisi une modélisation relationnelle parce que les données sont fortement liées. Une ressource peut être rattachée à un fournisseur, affectée à un utilisateur, concernée par un ticket de maintenance et apparaître dans un historique. Un appel d’offres dépend d’un besoin et reçoit plusieurs offres. Ces relations sont plus naturellement représentées dans PostgreSQL que dans une base orientée document.

Le modèle de données repose également sur des statuts. Les statuts permettent d’exprimer l’évolution d’un objet sans le supprimer. Une ressource peut être AVAILABLE, ASSIGNED, UNDER_MAINTENANCE, OUT_OF_SERVICE ou ARCHIVED. Une affectation peut être ACTIVE, RETURNED ou CANCELLED. Un fournisseur peut être ACTIVE ou INACTIVE. Ces statuts facilitent la conservation de l’historique.

Une attention particulière a été portée aux opérations qui modifient plusieurs objets à la fois. Par exemple, affecter une ressource ne consiste pas uniquement à créer une affectation. Il faut aussi passer la ressource au statut ASSIGNED. Ces deux changements doivent réussir ensemble. Pour cette raison, les transactions Prisma ont été utilisées sur les opérations critiques.

Les diagrammes UML ont été utiles pour vérifier la cohérence de la conception. Le diagramme de cas d’utilisation permet de relier les acteurs aux fonctionnalités. Le diagramme de classes donne une vue d’ensemble du domaine. Les diagrammes de séquence aident à comprendre les opérations sensibles, notamment l’authentification, la création d’une ressource et l’affectation.

Cette étape m’a également obligé à faire des choix de périmètre. Par exemple, les notifications sont consultables mais ne sont pas temps réel. L’audit est enregistré côté backend mais ne possède pas encore d’écran de consultation. Ces décisions évitent de surcharger le projet tout en préparant des évolutions crédibles.

## Chapitre 3 - Architecture technique et justification des choix

Le backend repose sur NestJS. Ce choix s’explique par la structure qu’il impose naturellement : modules, controllers, services, DTO, guards et providers. Une alternative aurait été Express, plus léger et plus direct. Cependant, Express aurait demandé de définir manuellement une architecture et une discipline de séparation. Pour un projet comportant plusieurs domaines métier, NestJS offre un cadre plus adapté.

J’ai choisi TypeScript sur l’ensemble du projet afin d’unifier le langage côté backend et frontend. TypeScript strict demande parfois plus d’effort, notamment lors de la manipulation de DTO ou de réponses API, mais il réduit les erreurs silencieuses. Dans un projet long, cette sécurité devient un avantage réel.

Le frontend utilise React avec Vite. React permet de construire des interfaces par composants et de séparer les pages, les services et les éléments réutilisables. Vite apporte une expérience de développement rapide. Angular aurait offert un cadre plus complet, mais aussi plus lourd. Vue aurait été une alternative intéressante, mais React correspondait mieux à l’écosystème de test et à l’organisation retenue.

Prisma a été retenu comme ORM. Son principal avantage est la lisibilité du schéma et la génération d’un client typé. Cela m’a permis de travailler avec un modèle de données explicite et de conserver des migrations versionnées. TypeORM aurait pu être utilisé, notamment avec NestJS, mais Prisma m’a semblé plus clair pour un projet où la base relationnelle joue un rôle central.

PostgreSQL a été choisi pour sa robustesse et sa capacité à gérer des relations fortes. Une base NoSQL aurait pu convenir pour des données peu reliées, mais elle aurait compliqué la cohérence entre utilisateurs, ressources, affectations, fournisseurs, besoins et appels d’offres. PostgreSQL correspond mieux à un système de gestion structuré.

L’authentification repose sur JWT. Ce choix permet une API stateless et s’intègre bien avec un frontend React. Une session serveur aurait permis une invalidation plus immédiate, mais aurait ajouté un état côté backend. Le refresh token complet n’a pas été implémenté dans cette version ; il constitue une perspective réaliste pour une version production.

Le contrôle d’accès est basé sur les rôles. Les rôles ADMIN, MANAGER et USER couvrent les principaux besoins de la version actuelle. Une matrice de permissions plus fine aurait été possible, mais elle aurait introduit une complexité prématurée. J’ai donc privilégié un RBAC clair et extensible.

GitHub Actions a été retenu pour l’intégration continue. Jenkins ou GitLab CI auraient pu remplir le même rôle, mais GitHub Actions s’intègre directement au dépôt utilisé. SonarCloud, CodeQL et Semgrep complètent cette chaîne en apportant des contrôles qualité et sécurité. Leur intérêt n’est pas de remplacer la revue humaine, mais d’ajouter un filet de sécurité systématique.

## Chapitre 4 - Réalisation backend

Le backend a été développé de manière modulaire. Chaque domaine possède son controller, son service, ses DTO et ses tests lorsque le périmètre le justifie. Cette organisation rend le code plus lisible et limite les effets de bord entre modules.

Le module Auth gère la connexion, la déconnexion stateless et la récupération du profil courant. La vérification du mot de passe repose sur bcrypt. Le token JWT contient les informations nécessaires pour identifier l’utilisateur et son rôle. Une règle importante a été ajoutée : un compte inactif ne doit plus pouvoir se connecter.

Le module Users permet de créer un utilisateur, de modifier son rôle, de le désactiver, de le rattacher à un département et de consulter la liste des utilisateurs. J’ai veillé à ne jamais exposer passwordHash dans les réponses. Cette règle est simple, mais elle est essentielle pour une application sécurisée.

Le module Resources gère l’inventaire. La référence inventaire est obligatoire et unique. Les endpoints de lecture supportent la pagination, la recherche et les filtres. Le changement de statut est séparé de la création afin de mieux contrôler les évolutions futures, notamment l’audit.

Le module ResourceAssignments illustre l’usage des transactions. Lorsqu’une ressource est affectée, l’application crée une affectation active et met à jour la ressource. Lorsqu’elle est retournée, l’affectation est clôturée et la ressource repasse disponible. Cette cohérence est indispensable pour éviter qu’une ressource soit disponible et affectée en même temps.

Le module Maintenance couvre le signalement de panne, le constat, l’intervention et le retour fournisseur. J’ai choisi de séparer ces étapes en modèles distincts, car elles ne portent pas la même information. Cette séparation rend le processus plus lisible et prépare des évolutions futures comme les notifications avancées ou le reporting.

Les modules Suppliers, Tenders et SupplierOffers structurent la partie achat. Un fournisseur peut être référencé, consulté et désactivé. Un besoin départemental peut conduire à un appel d’offres. Des offres fournisseurs peuvent être déposées, puis une offre gagnante peut être sélectionnée. Cette chaîne complète le cycle de vie de la ressource avant même son entrée en inventaire.

Les notifications et l’audit complètent le dispositif. Les notifications s’adressent aux utilisateurs et indiquent des événements importants. L’audit, lui, conserve la trace backend des actions sensibles. Cette distinction m’a paru importante : une notification peut être traitée par l’utilisateur, tandis qu’une entrée d’audit doit rester une preuve.

## Chapitre 5 - Réalisation frontend et expérience utilisateur

Le frontend a été construit autour d’un layout authentifié. La sidebar sombre donne accès aux modules principaux : dashboard, ressources, affectations, maintenance, notifications, administration, fournisseurs et appels d’offres. Ce choix crée une continuité visuelle et fonctionnelle.

L’écran de connexion a été conçu comme une entrée sobre dans l’application. Il ne s’agit pas d’une page marketing, mais d’un formulaire opérationnel. Le logo Maroc Ynov Campus ancre le projet dans son contexte, tandis que la carte blanche et le bouton principal respectent la charte graphique définie.

Le dashboard a évolué pendant le projet. Dans une première version, certains indicateurs étaient statiques. Après la recette, j’ai relié les KPI aux endpoints disponibles ou ajoutés. Cette amélioration change la perception du produit : le tableau de bord devient un outil de pilotage plutôt qu’une simple page d’accueil.

Sur les pages métier, j’ai cherché à éviter que les contraintes techniques apparaissent directement à l’utilisateur. L’exemple le plus parlant est celui des affectations. Une première approche demandait de saisir un UUID utilisateur. Techniquement, cela fonctionnait. Mais fonctionnellement, ce n’était pas acceptable. L’interface a donc été améliorée pour charger les utilisateurs actifs et proposer une sélection lisible.

Les pages ressources, fournisseurs, administration et appels d’offres suivent une logique commune : liste, filtres, panneau de détail ou formulaire, messages de succès et d’erreur. Cette homogénéité est volontaire. Dans une application de gestion, l’utilisateur doit pouvoir transférer ses habitudes d’un module à l’autre.

Le style visuel reste sobre. Le fond clair, les cartes blanches, la sidebar noire et l’accent turquoise donnent une identité professionnelle sans surcharger l’écran. J’ai évité les effets graphiques inutiles, car le projet doit être lu comme un outil institutionnel et non comme une vitrine commerciale.

## Chapitre 6 - Qualité logicielle et DevSecOps

La qualité logicielle a été traitée comme un sujet à part entière. Le projet ne devait pas seulement fonctionner en local ; il devait aussi passer des contrôles automatisés. Les commandes de validation couvrent le lint, le typecheck, les tests et le build. Ces contrôles ont accompagné les User Stories tout au long du projet.

GitHub Actions a permis d’automatiser ces validations. Chaque branche et chaque Pull Request peuvent déclencher les workflows nécessaires. Cette organisation limite le risque d’intégrer une régression et permet de conserver une trace des contrôles effectués.

SonarCloud a joué un rôle structurant. Certains retours ont obligé à revoir du code qui fonctionnait, mais qui présentait des duplications ou des avertissements. J’ai ainsi corrigé des DTO, renforcé des tests frontend et amélioré la configuration des workflows. Le résultat final montre un Quality Gate passé, une couverture de 83,2 % et 0 % de duplication.

CodeQL et Semgrep apportent une lecture complémentaire. CodeQL analyse le code pour détecter des vulnérabilités potentielles. Semgrep repère des patterns de sécurité ou de qualité. Ces outils ne remplacent pas l’analyse humaine, mais ils rendent la démarche plus robuste.

Les tests ont été répartis entre backend et frontend. Côté backend, Jest vérifie les services, controllers, guards et règles métier sensibles. Côté frontend, Vitest et React Testing Library testent les pages, services API et comportements utilisateur. J’ai appris à privilégier les tests à forte valeur : une règle d’affectation ou une erreur d’authentification vaut davantage qu’un test purement cosmétique.

## Chapitre 7 - Analyse critique et difficultés rencontrées

Une première difficulté a concerné la configuration CORS locale. Le backend acceptait plusieurs origins dans une même variable d’environnement, mais le navigateur recevait un header invalide. L’API répondait correctement en appel direct, tandis que le frontend échouait. Cette situation m’a rappelé qu’un test technique isolé ne suffit pas : il faut valider le parcours complet dans le navigateur.

Une autre difficulté a été la gestion des ports et des processus locaux. Entre PostgreSQL, Docker, le backend NestJS et le frontend Vite, il est facile de lancer deux services concurrents. J’ai donc appris à vérifier les ports 3000, 5173, 8080 et 5432, à identifier les processus et à arrêter uniquement ceux liés au projet, sans supprimer les volumes Docker.

La recette a également révélé des problèmes d’ergonomie. Certaines fonctionnalités étaient correctes côté backend, mais difficiles à démontrer. L’absence de données, les champs techniques et les messages génériques donnaient une impression d’inachèvement. Les données de démonstration idempotentes ont été ajoutées pour résoudre ce problème.

Les retours SonarCloud ont parfois été exigeants. Une duplication mineure ou un avertissement sur une action GitHub pouvait bloquer la validation. Sur le moment, ces corrections peuvent sembler secondaires. Avec du recul, elles ont renforcé la discipline du projet et m’ont obligé à produire un code plus propre.

La principale limite actuelle concerne l’industrialisation complète. Le projet dispose d’un socle solide, mais une version production devrait aller plus loin : refresh token, gestion fine des permissions, observabilité, déploiement cloud, sauvegardes automatisées et monitoring. Ces limites ne remettent pas en cause le projet ; elles ouvrent des perspectives réalistes.

## Conclusion générale

Ce projet m’a permis de concevoir et de développer une application complète de gestion des ressources matérielles, en partant d’un besoin métier réel et en allant jusqu’à une version démontrable, documentée et contrôlée par des outils qualité.

Sur le plan technique, j’ai consolidé mes compétences en NestJS, React, TypeScript, Prisma et PostgreSQL. J’ai également approfondi des sujets plus transverses : authentification JWT, RBAC, transactions, validation DTO, Swagger, tests unitaires, CI/CD et analyse de qualité.

Sur le plan méthodologique, le projet m’a appris l’importance d’une progression maîtrisée. Les User Stories, les branches Git, les Pull Requests, les commits conventionnels et les validations automatisées ont structuré le développement. Cette discipline donne de la lisibilité au projet et facilite sa défense devant un jury.

Sur le plan personnel, ce travail m’a surtout appris qu’une application professionnelle ne se résume pas à une interface ou à une base de données. Elle doit être cohérente, sécurisée, testée, documentée et capable d’évoluer. Les choix techniques doivent être assumés, les limites identifiées et les perspectives formulées avec réalisme.

Les évolutions possibles sont nombreuses : refresh token complet, permissions dynamiques, notifications temps réel, reporting avancé, observabilité, déploiement cloud et intégration plus poussée avec une stratégie d’artefacts. Ces perspectives s’appuient sur un socle existant qui a été pensé pour rester extensible.

En définitive, ce projet constitue pour moi une synthèse de compétences d’ingénierie logicielle. Il montre ma capacité à analyser un besoin, concevoir une architecture, développer des modules cohérents, sécuriser les accès, automatiser la qualité et produire une documentation soutenable.
