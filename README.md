# Gestion des ressources materielles d'une faculte

## Presentation du projet

Ce projet vise a concevoir une application de gestion des ressources materielles d'une faculte. Il couvre le cycle de vie des besoins materiels, depuis l'expression d'un besoin par un departement jusqu'a l'acquisition, l'inventaire, l'affectation, la maintenance et le suivi des ressources.

L'application servira de support progressif pour trois modules pedagogiques :

- Architecture logicielle
- Tests unitaires
- CI/CD

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
