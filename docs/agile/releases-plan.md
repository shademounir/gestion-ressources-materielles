# Plan des releases

## Objectif

Ce plan organise le projet en releases progressives, chacune apportant une valeur fonctionnelle ou pedagogique identifiable. Les releases sont compatibles avec une approche Agile Scrum et avec les objectifs d'architecture logicielle, de tests unitaires, de CI/CD et de soutenance.

## Release 0 - Cadrage, backlog, architecture et documentation

Objectif : construire le socle projet avant implementation.

Contenu :

- cadrage projet ;
- product backlog ;
- user stories ;
- structure Jira ;
- strategie de sprint ;
- premiere vision d'architecture ;
- documentation initiale.

Livrables :

- README projet ;
- documentation de cadrage ;
- backlog Agile ;
- roadmap ;
- liste des diagrammes a produire.

Critere de sortie :

- backlog valide ;
- perimetre de la Release 1 compris ;
- architecture cible pre-validee.

## Release 1 - Authentification, utilisateurs et roles

Objectif : permettre un acces controle a l'application.

Contenu :

- connexion et deconnexion ;
- gestion des utilisateurs ;
- attribution des roles ;
- premiere matrice de permissions ;
- tests unitaires des regles d'acces.

Epics concernes :

- EPIC-01 ;
- EPIC-02 ;
- EPIC-10.

Critere de sortie :

- utilisateur administrateur capable de gerer les comptes ;
- roles principaux exploitables ;
- acces non autorises bloques.

## Release 2 - Departements et expression des besoins

Objectif : permettre aux departements de formaliser leurs demandes.

Contenu :

- gestion des departements ;
- rattachement des utilisateurs ;
- expression des besoins ;
- validation ou priorisation initiale.

Epics concernes :

- EPIC-03 ;
- EPIC-09 ;
- EPIC-10.

Critere de sortie :

- un chef de departement peut declarer et suivre un besoin ;
- le responsable peut consulter les besoins consolides.

## Release 3 - Fournisseurs et appels d'offres

Objectif : structurer l'acquisition des ressources.

Contenu :

- gestion fournisseurs ;
- creation et publication des appels d'offres ;
- enregistrement des offres ;
- selection d'une offre fournisseur.

Epics concernes :

- EPIC-04 ;
- EPIC-05 ;
- EPIC-09 ;
- EPIC-10.

Critere de sortie :

- un appel d'offre peut etre cree, publie, alimente par des offres et attribue.

## Release 4 - Ressources materielles et inventaire

Objectif : centraliser l'inventaire materiel.

Contenu :

- creation de ressources ;
- identifiant unique ;
- categories, statuts et localisations ;
- consultation et filtrage de l'inventaire.

Epics concernes :

- EPIC-06 ;
- EPIC-09 ;
- EPIC-10.

Critere de sortie :

- l'inventaire est consultable et chaque ressource possede un etat fiable.

## Release 5 - Affectations

Objectif : suivre l'utilisation des ressources.

Contenu :

- affectation a un utilisateur ou departement ;
- retour de ressource ;
- historique des affectations ;
- notification des acteurs concernes.

Epics concernes :

- EPIC-07 ;
- EPIC-09 ;
- EPIC-10.

Critere de sortie :

- une ressource disponible peut etre affectee, retournee et historisee.

## Release 6 - Maintenance, pannes et constats techniques

Objectif : gerer les incidents et interventions.

Contenu :

- signalement panne ;
- diagnostic et constat technique ;
- intervention maintenance ;
- retour fournisseur ;
- reparation ou remplacement.

Epics concernes :

- EPIC-08 ;
- EPIC-09 ;
- EPIC-10.

Critere de sortie :

- une panne peut etre signalee, diagnostiquee, traitee et cloturee.

## Release 7 - Securite, tests et qualite

Objectif : renforcer la robustesse et la qualite du produit.

Contenu :

- revue des permissions ;
- durcissement securite ;
- couverture des tests metier ;
- controle qualite ;
- correction des anomalies critiques.

Epics concernes :

- EPIC-01 ;
- EPIC-09 ;
- EPIC-10 ;
- EPIC-12.

Critere de sortie :

- les scenarios critiques sont testes ;
- les controles d'acces sont verifies ;
- la documentation qualite est a jour.

## Release 8 - CI/CD, Docker, deploiement et rapport final

Objectif : finaliser la chaine de livraison et la presentation du projet.

Contenu :

- pipeline CI/CD ;
- conteneurisation Docker ;
- strategie de deploiement ;
- rollback ;
- rapport final ;
- preparation soutenance.

Epics concernes :

- EPIC-11 ;
- EPIC-12 ;
- EPIC-10.

Critere de sortie :

- le projet est livrable, documente et presentable avec une chaine qualite coherent.
