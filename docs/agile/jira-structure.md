# Structure Jira

## Projet Jira

- Key : SCRUM
- Type recommande : Scrum
- Objectif : piloter le backlog, les sprints, les releases et les livrables du projet Gestion des Ressources Materielles.

## Hierarchie recommandee

```text
Project SCRUM
├── Epic
│   ├── Story
│   │   ├── Sub-task technique
│   │   └── Sub-task test
│   └── Bug
└── Version / Release
```

## Epics Jira

| Code logique | Nom Epic Jira | Release principale |
| --- | --- | --- |
| EPIC-01 | Authentification et securite | Release 1 et 7 |
| EPIC-02 | Gestion utilisateurs et roles | Release 1 |
| EPIC-03 | Gestion departements | Release 2 |
| EPIC-04 | Gestion fournisseurs | Release 3 |
| EPIC-05 | Gestion appels d'offres | Release 3 |
| EPIC-06 | Gestion ressources materielles | Release 4 |
| EPIC-07 | Gestion affectations | Release 5 |
| EPIC-08 | Gestion maintenance | Release 6 |
| EPIC-09 | Notifications et tracabilite | Releases 2 a 7 |
| EPIC-10 | Tests qualite | Releases 1 a 8 |
| EPIC-11 | CI/CD et deploiement | Release 8 |
| EPIC-12 | Documentation et rapport final | Releases 0 a 8 |

## Versions Jira recommandees

- R0 - Cadrage et socle projet
- R1 - Authentification et utilisateurs
- R2 - Departements et besoins
- R3 - Fournisseurs et appels d'offres
- R4 - Ressources et inventaire
- R5 - Affectations
- R6 - Maintenance
- R7 - Tests, securite et qualite
- R8 - CI/CD, deploiement et rapport final

## Components Jira recommandes

- Authentification
- Utilisateurs
- Roles
- Departements
- Fournisseurs
- Appels d'offres
- Ressources
- Inventaire
- Affectations
- Maintenance
- Notifications
- Audit
- Tests
- CI/CD
- Documentation

## Labels recommandes

- `architecture`
- `backlog`
- `security`
- `functional`
- `unit-test`
- `integration-test`
- `ci-cd`
- `documentation`
- `soutenance`
- `mvp`

## Workflow Story recommande

```text
Backlog -> Ready -> In Progress -> Code Review -> Test -> Done
```

Pour les stories documentaires :

```text
Backlog -> Ready -> In Progress -> Review -> Done
```

## Workflow Bug recommande

```text
Open -> In Analysis -> In Progress -> Test -> Closed
```

## Champs utiles

- Description metier
- Criteres d'acceptation
- Dependances
- Strategie de test
- Risques
- Definition of Done
- Story Points
- Fix Version
- Component
- Priority

## Regles de nommage

Stories :

```text
[Domaine] Verbe + objet metier
```

Exemples :

- `[Auth] Se connecter`
- `[Ressources] Enregistrer une ressource`
- `[Maintenance] Rediger un constat technique`

Sous-taches :

```text
[Type] Action precise
```

Exemples :

- `[Test] Couvrir les cas d'acces refuse`
- `[Doc] Mettre a jour le diagramme de sequence`
- `[API] Ajouter la validation de statut`

## Definition d'une issue Jira exploitable

Une issue Jira doit contenir :

- un objectif clair ;
- un acteur ;
- une valeur metier ;
- des criteres d'acceptation verifiables ;
- une estimation ;
- une priorite ;
- au moins une strategie de test ;
- les dependances connues.
