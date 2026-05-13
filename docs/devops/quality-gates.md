# Quality Gates

## Objectif

Les quality gates definissent les criteres minimaux a respecter avant de merger une Pull Request ou de promouvoir une release. Ils soutiennent la qualite logicielle, les tests, la securite et la soutenance professionnelle.

## Regles de validation CI

Une Pull Request ne peut etre mergee que si les controles suivants sont au vert :

- installation des dependances reussie ;
- lint backend reussi ;
- lint frontend reussi ;
- verification TypeScript backend reussie ;
- verification TypeScript frontend reussie ;
- tests unitaires backend reussis ;
- tests unitaires frontend reussis ;
- build backend reussi ;
- build frontend reussi ;
- analyse SonarCloud sans blocage ;
- scans securite sans vulnerabilite bloquante.

## Seuils de couverture tests

Seuils progressifs recommandes :

| Release | Couverture minimale cible |
| --- | --- |
| Release 1 | 50% sur services critiques |
| Release 3 | 60% sur logique metier implementee |
| Release 5 | 70% sur services backend et composants critiques |
| Release 7 | 80% sur regles metier critiques |
| Release 8 | 80% maintenu avant livraison finale |

Les modules critiques comme authentification, RBAC, affectations, maintenance et transitions de statut doivent etre prioritaires.

## Seuils SonarCloud

Quality gate cible :

- bugs : 0 nouveau bug critique ou majeur ;
- vulnerabilities : 0 nouvelle vulnerabilite critique ou majeure ;
- security hotspots : 100% revus avant merge si critiques ;
- code smells : aucun code smell bloquant ;
- coverage on new code : minimum 80% a partir de Release 7 ;
- duplicated lines on new code : maximum 3%.

## Duplication maximale

- Code duplique global : maximum 5% cible.
- Nouveau code duplique : maximum 3%.
- Duplication dans les DTO simples toleree si elle evite une abstraction artificielle.
- Duplication metier non toleree sur les regles critiques.

## Regles lint

- Aucune erreur lint bloquante.
- Warnings toleres uniquement temporairement et justifies.
- Pas de `any` non justifie en TypeScript strict.
- Pas de variables inutilisees.
- Pas de secrets, tokens ou URLs sensibles en dur.

## Blocage merge

Le merge est bloque si :

- un job CI obligatoire echoue ;
- SonarCloud quality gate echoue ;
- un scan securite detecte une vulnerabilite critique ou haute non acceptee ;
- la couverture minimale sur nouveau code n'est pas respectee ;
- une review humaine est manquante ;
- la Pull Request n'est pas liee a une issue Jira.

## Definition of Done technique

Une User Story est techniquement terminee si :

- le code respecte l'architecture cible ;
- les tests unitaires pertinents sont presents ;
- les tests d'integration sont ajoutes si le flux traverse plusieurs couches ;
- les DTO et validations sont couverts ;
- les erreurs sont gerees selon la strategie standard ;
- les logs ne contiennent aucun secret ;
- la documentation impactee est mise a jour ;
- la Pull Request est reliee a Jira ;
- les checks CI, SonarCloud et securite sont au vert ;
- la review Codex et la review humaine sont traitees.
