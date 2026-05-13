# Security Scanning Strategy

## Objectif

La strategie de scan securite introduit progressivement les controles DevSecOps sur les dependances, le code source, les secrets et les images Docker futures.

## npm audit

Objectif :

- detecter les vulnerabilites dans les dependances npm backend et frontend.

Usage cible :

- execution sur Pull Request ;
- execution sur branche principale ;
- blocage sur vulnerabilites critiques ;
- suivi Jira pour vulnerabilites moyennes ou faibles acceptees temporairement.

Regles :

- aucune vulnerabilite critique non justifiee ;
- aucune vulnerabilite haute en Release 7 et 8 ;
- mise a jour dependances planifiee si correction disponible.

## Semgrep

Objectif :

- detecter les patterns dangereux dans le code TypeScript, NestJS, React et configuration.

Cas couverts :

- injection potentielle ;
- mauvaise validation d'entree ;
- usage dangereux de secrets ;
- erreurs d'autorisation ;
- mauvaises pratiques JWT ;
- patterns frontend dangereux.

Strategie :

- activer progressivement a partir des premiers modules ;
- commencer par un profil standard ;
- ajouter des regles specifiques si des risques projet apparaissent.

## GitHub CodeQL

Objectif :

- analyse statique securite integree a GitHub.

Usage :

- scans sur Pull Request ;
- scans planifies ;
- scans sur branche principale.

Regles :

- alertes critiques traitees avant merge ;
- alertes hautes analysees avec decision documentee ;
- alertes non pertinentes marquees comme false positive avec justification.

## Secret scanning

Objectif :

- detecter les secrets commites par erreur.

Secrets concernes :

- JWT secrets ;
- DATABASE_URL ;
- tokens GitHub ;
- tokens SonarCloud ;
- identifiants PostgreSQL ;
- cles d'API futures.

Regles :

- aucun secret dans Git ;
- rotation immediate si secret expose ;
- `.env.example` autorise sans valeur reelle ;
- `.env.*` reels ignores par Git.

## Dependances vulnerables

Processus :

1. Detection par npm audit, Dependabot, CodeQL ou Semgrep.
2. Evaluation severite.
3. Correction immediate si critique.
4. Creation d'une issue Jira si correction differee.
5. Documentation de l'acceptation temporaire si necessaire.

## Scan Docker futur

Lorsque Docker sera introduit :

- scanner les images backend ;
- scanner les images frontend ;
- scanner les images de base ;
- eviter les images non maintenues ;
- preferer des images minimales ;
- bloquer les vulnerabilites critiques.

## Strategie DevSecOps progressive

| Phase | Controles |
| --- | --- |
| Release 1 | npm audit, secret scanning |
| Release 3 | Semgrep de base |
| Release 5 | CodeQL et Dependabot |
| Release 7 | quality gates securite bloquants |
| Release 8 | scan Docker et politique complete |

## Regles de blocage securite

Bloquer le merge si :

- secret detecte ;
- vulnerabilite critique non traitee ;
- alerte CodeQL critique ;
- Semgrep detecte un risque d'authentification ou d'autorisation critique ;
- image Docker future contient une vulnerabilite critique exploitable.
