# Gestion des ressources materielles d'une faculte

## Presentation du projet

Ce projet vise a concevoir une application de gestion des ressources materielles d'une faculte. Il couvre le cycle de vie des besoins materiels, depuis l'expression d'un besoin par un departement jusqu'a l'acquisition, l'inventaire, l'affectation, la maintenance et le suivi des ressources.

L'application servira de support progressif pour trois modules pedagogiques :

- Architecture logicielle
- Tests unitaires
- CI/CD

## Etat du projet

Le projet dispose maintenant d'un socle backend et DevSecOps stable prepare pour la release `v1.0.0`.

Release actuelle preparee :

- `v1.0.0 - Stable Backend + DevSecOps Foundation`

Perimetre stabilise :

- Auth / Users ;
- Departments ;
- Needs ;
- Suppliers ;
- Tenders ;
- Supplier Offers ;
- Winner Selection ;
- CI/CD et controles DevSecOps.

Pipeline DevSecOps disponible :

- GitHub Actions ;
- SonarCloud ;
- CodeQL ;
- Semgrep ;
- GitHub Actions Artifacts.

## Comptes de démonstration

Des comptes de démonstration peuvent être créés avec le seed Prisma :

```bash
npm run prisma:seed --workspace backend
```

Administrateur

- Email : [admin@grm.local](mailto:admin@grm.local)
- Mot de passe : `Admin123!`

Manager

- Email : [manager@grm.local](mailto:manager@grm.local)
- Mot de passe : `Manager123!`

## Donnees de demonstration et recette

Les donnees de demonstration sont generees automatiquement par le seed Prisma et peuvent etre reexecutees sans creer de doublons :

```bash
npm run prisma:seed --workspace backend
```

Comptes principaux :

- Administrateur : `admin@grm.local` / `Admin123!`
- Manager : `manager@grm.local` / `Manager123!`

Comptes metier crees si absents :

- `technicien@grm.local` / `Technicien123!`
- `employe1@grm.local` / `Employe123!`
- `employe2@grm.local` / `Employe123!`

Le seed prepare aussi un jeu de donnees minimal pour la soutenance : departement, besoins departementaux, ressources, fournisseurs, affectations, tickets de maintenance, notifications, appels d'offres et offres fournisseurs.

## Objectifs pedagogiques

- Formaliser un besoin metier realiste avant le developpement.
- Structurer un projet logiciel selon une demarche professionnelle.
- Preparer une architecture evolutive et testable.
- Introduire progressivement les tests unitaires, l'automatisation qualite et les pipelines CI/CD.
- Documenter les decisions, les processus et les exigences du projet.

## Perimetre fonctionnel

Le perimetre cible inclut la gestion :

- des utilisateurs, roles et droits d'acces ;
- des departements de la faculte ;
- des besoins en ressources materielles ;
- des fournisseurs et appels d'offres ;
- des offres fournisseurs et selections ;
- des ressources materielles et de leur inventaire ;
- des affectations aux departements ou utilisateurs ;
- des pannes, maintenances, reparations et remplacements ;
- des notifications et traces d'audit.

## Stack cible envisagee

La stack technique sera confirmee lors des prochaines etapes. A ce stade, les choix envisages sont :

- Backend : API REST structuree en couches ou architecture modulaire.
- Frontend : interface web de gestion.
- Base de donnees : systeme relationnel.
- Tests : tests unitaires, tests d'integration et couverture progressive.
- CI/CD : pipeline automatise pour verification, qualite et deploiement.
- Documentation : Markdown, diagrammes UML et BPMN.

## Organisation future du repository

L'organisation cible pourra evoluer vers une structure de ce type :

```text
.
├── docs/
│   ├── diagrams/
│   └── *.md
├── backend/
├── frontend/
├── tests/
├── scripts/
├── .github/
├── .gitignore
└── README.md
```

Pour cette premiere etape, seul le socle documentaire initial est cree. Aucun code applicatif, aucune dependance, aucune configuration Docker et aucun pipeline CI/CD ne sont ajoutes.
