# Mapping Releases Jira

## Releases cible

Les versions Jira recommandees sont les suivantes :

| Fix Version | Objectif |
| --- | --- |
| R0 - Cadrage et socle projet | Cadrage, backlog, architecture et documentation |
| R1 - Authentification et utilisateurs | Authentification, utilisateurs, roles et premiers tests |
| R2 - Departements et besoins | Departements, rattachements et expression des besoins |
| R3 - Fournisseurs et appels d'offres | Fournisseurs, appels d'offres et offres fournisseurs |
| R4 - Ressources et inventaire | Ressources materielles et inventaire |
| R5 - Affectations | Affectation, retour et historique |
| R6 - Maintenance | Pannes, constats techniques et interventions |
| R7 - Tests, securite et qualite | Tests, securite et qualite |
| R8 - CI/CD, deploiement et rapport final | CI/CD, deploiement et rapport final |

## Stories par release

### R0 - Cadrage et socle projet

- US-DOC-01 Documenter architecture

### R1 - Authentification et utilisateurs

- US-AUTH-01 Connexion utilisateur
- US-AUTH-02 Deconnexion utilisateur
- US-AUTH-03 Protection des acces
- US-USER-01 Creer un utilisateur
- US-USER-02 Attribuer un role
- US-USER-03 Desactiver un utilisateur
- US-AUDIT-01 Journaliser les actions
- US-TEST-01 Strategie tests unitaires

### R2 - Departements et besoins

- US-DEPT-01 Creer un departement
- US-DEPT-02 Rattacher un utilisateur
- US-DEPT-03 Declarer un besoin
- US-NOTIF-01 Notifier un changement

### R3 - Fournisseurs et appels d'offres

- US-SUP-01 Ajouter un fournisseur
- US-SUP-02 Historique fournisseur
- US-SUP-03 Desactiver un fournisseur
- US-TEND-01 Creer un appel d'offre
- US-TEND-02 Publier un appel d'offre
- US-TEND-03 Enregistrer une offre
- US-TEND-04 Selectionner une offre

### R4 - Ressources et inventaire

- US-RES-01 Enregistrer une ressource
- US-RES-02 Consulter l'inventaire
- US-RES-03 Modifier l'etat d'une ressource

### R5 - Affectations

- US-ASSIGN-01 Affecter une ressource
- US-ASSIGN-02 Retourner une ressource
- US-ASSIGN-03 Historique affectation
- US-NOTIF-02 Consulter notifications

### R6 - Maintenance

- US-MAINT-01 Signaler une panne
- US-MAINT-02 Rediger un constat
- US-MAINT-03 Suivre une intervention
- US-MAINT-04 Gerer un retour fournisseur

### R7 - Tests, securite et qualite

- US-TEST-02 Tester regles critiques

### R8 - CI/CD, deploiement et rapport final

- US-CICD-01 Automatiser verifications
- US-CICD-02 Definir deploiement cible
- US-DOC-02 Preparer rapport final

## Ordre recommande des sprints

| Sprint | Release dominante | Objectif |
| --- | --- | --- |
| Sprint 0 | R0 | Finaliser l'architecture, l'import Jira et la preparation projet |
| Sprint 1 | R1 | Authentification, utilisateurs, roles et securite de base |
| Sprint 2 | R2 | Departements et expression des besoins |
| Sprint 3 | R3 | Fournisseurs et debut appels d'offres |
| Sprint 4 | R3 | Publication, offres et selection fournisseur |
| Sprint 5 | R4 | Ressources materielles et inventaire |
| Sprint 6 | R5 | Affectations, retours et historique |
| Sprint 7 | R6 | Maintenance, pannes et constats |
| Sprint 8 | R7 | Tests, securite et qualite |
| Sprint 9 | R8 | CI/CD, deploiement et rapport final |

## Remarques

- Les stories transverses comme audit, notifications et tests sont positionnees dans les releases ou elles apportent la premiere valeur exploitable.
- Le mapping respecte les releases deja definies dans le backlog Agile.
- Les releases ne doivent pas etre renommees sans mettre a jour le CSV avant import.
