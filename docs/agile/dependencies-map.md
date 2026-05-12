# Carte des dependances fonctionnelles

## Objectif

Cette carte identifie les dependances entre domaines fonctionnels afin de planifier les releases, eviter les blocages et justifier l'ordre de developpement.

## Vue globale

```text
Authentification
└── Utilisateurs et roles
    ├── Departements
    │   └── Expression des besoins
    │       └── Appels d'offres
    ├── Fournisseurs
    │   ├── Appels d'offres
    │   └── Maintenance externe
    └── Ressources materielles
        ├── Inventaire
        ├── Affectations
        └── Maintenance

Notifications et audit accompagnent tous les modules critiques.
Tests qualite accompagnent chaque release fonctionnelle.
CI/CD intervient apres stabilisation de la structure technique.
Documentation accompagne toutes les releases.
```

## Dependances par module

| Module | Depend de | Justification |
| --- | --- | --- |
| Authentification | Aucun module fonctionnel | Socle d'acces |
| Utilisateurs et roles | Authentification | Les droits reposent sur les comptes |
| Departements | Utilisateurs et roles | Les acteurs doivent etre rattaches |
| Expression besoins | Departements, roles | Les besoins sont portes par des acteurs autorises |
| Fournisseurs | Roles | Gestion reservee aux profils autorises |
| Appels d'offres | Besoins, fournisseurs | Les appels d'offres partent de besoins et ciblent des fournisseurs |
| Offres fournisseurs | Appels d'offres, fournisseurs | Une offre repond a un appel d'offre |
| Ressources materielles | Fournisseurs, appels d'offres | Les ressources peuvent provenir d'une acquisition |
| Inventaire | Ressources materielles | L'inventaire expose les ressources |
| Affectations | Ressources, utilisateurs, departements | Une affectation a besoin d'un bien et d'un beneficiaire |
| Maintenance | Ressources, utilisateurs, fournisseurs | Une panne concerne une ressource et peut impliquer un fournisseur |
| Notifications | Modules declencheurs, utilisateurs | Les notifications ciblent des acteurs |
| Audit | Authentification, modules critiques | Les traces doivent identifier l'auteur |
| Tests qualite | Modules implementes | Les tests couvrent les comportements reels |
| CI/CD | Tests, structure technique | Le pipeline automatise les controles |
| Documentation finale | Toutes les releases | Le rapport consolide les livrables |

## Dependances critiques

### Securite avant metier

Les modules metier doivent s'appuyer sur l'authentification et les roles afin d'eviter de produire des fonctionnalites non protegees.

### Ressources avant affectations et maintenance

Une affectation ou une maintenance n'a de sens que si la ressource existe dans l'inventaire avec un statut fiable.

### Fournisseurs avant appels d'offres complets

La selection fournisseur et l'historique des offres necessitent un referentiel fournisseur exploitable.

### Audit transversal

Les actions critiques doivent etre tracees des les premieres releases afin d'eviter d'ajouter la tracabilite trop tard.

### Tests en continu

Les tests ne doivent pas etre reserves a la fin du projet. Chaque release doit introduire les tests adaptes aux regles produites.

## Risques de dependances

- Blocage si les roles ne sont pas stabilises avant les modules metier.
- Retard si les statuts de ressource ne sont pas clairement definis avant maintenance.
- Incoherence si les workflows d'appel d'offre et d'achat ne sont pas valides metier.
- Dette qualite si les tests arrivent uniquement en Release 7.
- Documentation incomplete si les decisions ne sont pas notees au fil de l'eau.

## Ordre recommande

1. Cadrage, backlog et architecture.
2. Authentification, utilisateurs et roles.
3. Departements et besoins.
4. Fournisseurs et appels d'offres.
5. Ressources et inventaire.
6. Affectations.
7. Maintenance.
8. Notifications, audit et securite renforcee.
9. Tests qualite consolides.
10. CI/CD, Docker, deploiement et rapport final.
