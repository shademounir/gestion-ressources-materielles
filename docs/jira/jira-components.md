# Composants Jira

## Objectif

Ce fichier liste les composants Jira a creer dans le projet `SCRUM` avant l'import CSV des User Stories.

## Liste des composants

| Composant | Description | Stories concernees |
| --- | --- | --- |
| Authentification | Connexion, deconnexion et protection des acces | US-AUTH-01, US-AUTH-02, US-AUTH-03 |
| Utilisateurs | Gestion des comptes utilisateurs | US-USER-01, US-USER-03 |
| Roles | Attribution des roles et permissions | US-USER-02 |
| Departements | Organisation interne et besoins departementaux | US-DEPT-01, US-DEPT-02, US-DEPT-03 |
| Fournisseurs | Referentiel et suivi fournisseur | US-SUP-01, US-SUP-02, US-SUP-03 |
| AppelsOffres | Appels d'offres et offres fournisseurs | US-TEND-01, US-TEND-02, US-TEND-03, US-TEND-04 |
| Ressources | Ressources materielles et inventaire | US-RES-01, US-RES-02, US-RES-03 |
| Affectations | Affectation, retour et historique des ressources | US-ASSIGN-01, US-ASSIGN-02, US-ASSIGN-03 |
| Maintenance | Pannes, constats, interventions et retours fournisseurs | US-MAINT-01, US-MAINT-02, US-MAINT-03, US-MAINT-04 |
| Notifications | Notifications utilisateurs | US-NOTIF-01, US-NOTIF-02 |
| Audit | Journalisation et tracabilite | US-AUDIT-01 |
| Tests | Strategie et couverture de tests | US-TEST-01, US-TEST-02 |
| CICD | Pipeline, verification et deploiement | US-CICD-01, US-CICD-02 |
| Documentation | Architecture et rapport final | US-DOC-01, US-DOC-02 |

## Regles de nommage

Les composants sont volontairement courts et sans caracteres speciaux pour faciliter l'import CSV :

- `AppelsOffres` au lieu de `Appels d'offres` ;
- `CICD` au lieu de `CI/CD` ;
- `Roles` au lieu de `Rôles`.

## Verification avant import

Avant d'importer le CSV, verifier dans Jira que les 14 composants existent exactement avec ces noms.
