# Pull Request Workflow

## Objectif

Le workflow Pull Request garantit que chaque changement est relie a Jira, controle par CI/CD, analyse par les outils qualite/securite, revu par Codex et valide humainement avant merge.

## Flux final cible

```text
Jira Story
-> Branche Git
-> Codex implementation
-> Push GitHub
-> Pull Request
-> GitHub Actions
-> SonarCloud
-> Security Scan
-> Codex Review
-> Human Review
-> Merge
-> Deploy
```

## Creation de branche

Chaque branche doit partir de `develop`, sauf hotfix.

Convention :

```text
feature/SCRUM-35-auth-module
bugfix/SCRUM-44-resource-status
docs/SCRUM-12-architecture-update
```

Hotfix :

```text
hotfix/SCRUM-88-login-production-fix
```

## Conventions Pull Request

Titre recommande :

```text
SCRUM-35 - Implement auth module foundation
```

Description minimale :

- lien Jira ;
- objectif ;
- changements principaux ;
- tests executes ;
- impacts architecture ;
- risques ;
- captures ou preuves si interface ;
- checklist Definition of Done.

## Review automatique Codex

Codex peut etre utilise pour :

- revue de coherence avec l'architecture ;
- detection de bugs ;
- verification tests manquants ;
- revue securite initiale ;
- verification documentation impactee.

La review Codex ne remplace pas la review humaine.

## Review humaine

La review humaine valide :

- besoin metier ;
- coherence avec Jira ;
- choix techniques ;
- lisibilite ;
- tests ;
- securite ;
- absence de changements hors perimetre.

## Validation pipeline avant merge

Checks obligatoires :

- lint ;
- tests unitaires ;
- tests d'integration si concernes ;
- build ;
- SonarCloud quality gate ;
- scans securite ;
- absence de secrets.

## Strategie squash merge

Le squash merge est recommande pour garder un historique propre.

Message de merge :

```text
feat(auth): implement login foundation [SCRUM-35]
```

## Strategie hotfix

1. Creer une branche `hotfix/*` depuis `main`.
2. Corriger uniquement le probleme critique.
3. Ouvrir une Pull Request vers `main`.
4. Executer les checks rapides et critiques.
5. Merger apres review.
6. Reporter le correctif vers `develop`.
7. Taguer si necessaire.

## Conditions de refus merge

- Pas de cle Jira.
- Pipeline en echec.
- Quality gate SonarCloud en echec.
- Alerte securite critique.
- Review humaine absente.
- Tests manquants sur une regle critique.
- Changement hors perimetre non justifie.
