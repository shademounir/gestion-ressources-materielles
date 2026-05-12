# DevOps Architecture

## Objectif

La strategie DevOps cible vise a automatiser progressivement les controles, la qualite et la livraison, sans introduire la CI/CD avant validation de l'architecture et des premiers modules.

## Environnements

| Environnement | Usage |
| --- | --- |
| dev | Developpement local |
| staging | Validation avant livraison |
| prod | Environnement stable de demonstration ou production |

## Docker cible

La conteneurisation sera introduite en Release 8.

Composants pressentis :

- backend NestJS ;
- frontend React ;
- PostgreSQL ;
- eventuel reverse proxy selon le deploiement cible.

## GitHub Actions cible

Pipeline progressif :

1. Installation des dependances.
2. Verification TypeScript.
3. Lint.
4. Tests unitaires.
5. Tests d'integration cibles.
6. Build backend.
7. Build frontend.
8. Packaging Docker.
9. Deploiement staging.

## Strategie CI progressive

- Release 1 : tests unitaires backend.
- Release 3 : verification qualite et build backend.
- Release 5 : build frontend et tests frontend cibles.
- Release 7 : couverture et securite.
- Release 8 : pipeline complet et deploiement.

## Gestion configuration

- Variables par environnement.
- Aucun secret dans Git.
- Fichiers d'exemple documentes.
- Secrets stockes dans GitHub Secrets ou equivalent.

## Rollback

Strategie cible :

- conserver l'image precedente ;
- versionner les migrations ;
- prevoir des migrations reversibles lorsque possible ;
- documenter la procedure de retour arriere ;
- valider staging avant production.

## Observabilite

- Logs applicatifs structures.
- Logs d'erreur contextualises.
- Traces d'audit metier.
- Healthcheck backend.
- Suivi des echecs de pipeline.
