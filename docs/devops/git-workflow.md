# Git Workflow

## Objectif

Ce document definit la strategie Git cible pour le projet "Gestion des Ressources Materielles". Elle doit assurer une collaboration propre, une tracabilite Jira/GitHub et une integration progressive avec la CI/CD.

## Strategie Git

Le projet adopte une strategie inspiree de Git Flow, adaptee a un projet academique professionnel :

- `main` : branche stable, protegee, contenant uniquement du code valide.
- `develop` : branche d'integration des travaux valides avant release.
- `feature/*` : branches de developpement liees aux User Stories Jira.
- `release/*` : branches de stabilisation d'une release.
- `hotfix/*` : corrections urgentes a partir de `main`.

## Branches

### main

- Contient les versions stables.
- Doit etre protegee.
- Aucun commit direct.
- Merge uniquement via Pull Request validee.

### develop

- Branche d'integration principale.
- Recoit les features terminees.
- Sert de base aux branches `release/*`.

### feature/*

Utilisee pour une User Story ou une tache technique limitee.

Convention :

```text
feature/SCRUM-35-auth-module
feature/SCRUM-42-resource-inventory
```

### release/*

Utilisee pour stabiliser une release.

Convention :

```text
release/R1-auth-users
release/R4-resources-inventory
```

### hotfix/*

Utilisee pour corriger rapidement une anomalie critique en production.

Convention :

```text
hotfix/SCRUM-88-fix-login-regression
```

## Conventions de nommage

Format recommande :

```text
<type>/<JIRA-KEY>-<short-description>
```

Types autorises :

- `feature`
- `bugfix`
- `hotfix`
- `release`
- `docs`
- `test`
- `chore`

Exemples :

```text
feature/SCRUM-35-auth-module
docs/SCRUM-12-update-architecture
test/SCRUM-61-maintenance-rules
```

## Conventions commits

Format recommande :

```text
<type>(<scope>): <message> [JIRA-KEY]
```

Types :

- `feat`
- `fix`
- `docs`
- `test`
- `refactor`
- `chore`
- `ci`

Exemples :

```text
feat(auth): add login use case [SCRUM-35]
test(resources): cover assignment availability rule [SCRUM-52]
docs(devops): define git workflow [SCRUM-10]
```

## Workflow Pull Request

1. Creer une branche depuis `develop`.
2. Associer la branche a une issue Jira.
3. Developper un perimetre limite.
4. Mettre a jour la documentation si necessaire.
5. Ouvrir une Pull Request vers `develop`.
6. Verifier que les checks CI sont au vert.
7. Demander une review.
8. Corriger les remarques.
9. Merger apres validation.

## Lien Jira vers GitHub

Chaque branche, commit et Pull Request doit contenir la cle Jira :

```text
SCRUM-35
```

Objectifs :

- relier le code a la User Story ;
- faciliter le suivi en sprint ;
- justifier les livrables en soutenance ;
- permettre la tracabilite Jira/GitHub.

## Strategie review

- Au moins une review humaine avant merge.
- Priorite aux risques : securite, tests, coherence metier, lisibilite.
- Les commentaires bloquants doivent etre resolus avant merge.
- Les remarques non bloquantes peuvent devenir des issues Jira.

## Merge policy

- Merge vers `develop` uniquement apres checks au vert.
- Merge vers `main` uniquement depuis une branche `release/*` ou `hotfix/*`.
- Preferer squash merge pour garder un historique lisible.
- Ne pas merger une Pull Request qui contient des changements hors perimetre.

## Protection de main

Regles recommandees :

- interdire les commits directs ;
- exiger une Pull Request ;
- exiger au moins une review ;
- exiger les checks CI obligatoires ;
- exiger une branche a jour avant merge ;
- bloquer les secrets detectes ;
- limiter les droits de merge.
