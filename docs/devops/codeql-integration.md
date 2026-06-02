# CodeQL Integration

## Objectif

GitHub CodeQL ajoute une analyse statique securite native a GitHub pour le code JavaScript et TypeScript du monorepo.

Il complete le pipeline DevSecOps en detectant des vulnerabilites potentielles directement dans le code source.

## Role de CodeQL

CodeQL analyse le code comme une base de donnees interrogeable. Il permet d'identifier :

- injections potentielles ;
- flux de donnees dangereux ;
- erreurs d'autorisation ;
- mauvaises pratiques de securite ;
- patterns TypeScript ou JavaScript risques ;
- failles connues couvertes par les requetes CodeQL officielles.

## Difference avec SonarCloud

SonarCloud couvre principalement :

- qualite de code ;
- code smells ;
- duplications ;
- maintenabilite ;
- bugs ;
- couverture de tests ;
- security hotspots.

CodeQL est specialise sur :

- analyse securite statique approfondie ;
- data flow analysis ;
- alertes GitHub Security ;
- requetes de vulnerabilites maintenues par GitHub.

Les deux outils sont complementaires et ne se remplacent pas.

## Declencheurs

Le workflow `.github/workflows/codeql.yml` s'execute sur :

- Pull Request ;
- push vers `develop` ;
- push vers `main` ;
- scan planifie hebdomadaire chaque lundi a 06:00 UTC.

## Langage analyse

Le workflow analyse :

- `javascript-typescript`.

Ce choix couvre le backend NestJS, le frontend React/Vite et les scripts TypeScript du monorepo.

## Secrets

CodeQL ne necessite pas de secret projet dedie. Le workflow utilise les permissions GitHub Actions natives pour publier les resultats dans GitHub Security.

## Consultation des resultats

Les resultats CodeQL sont consultables dans :

- l'onglet `Security` du repository GitHub ;
- la section `Code scanning alerts` ;
- les checks de Pull Request ;
- l'historique GitHub Actions.

## Gestion des alertes

Processus recommande :

1. Analyser la severite de l'alerte.
2. Identifier le flux de code concerne.
3. Corriger immediatement les alertes critiques ou hautes.
4. Creer une issue Jira si la correction est differee.
5. Marquer comme false positive uniquement avec justification explicite.

## Strategie de correction

Les corrections CodeQL doivent suivre les principes suivants :

- privilegier la correction du code source plutot que la suppression d'alerte ;
- ajouter ou adapter les tests si le risque touche une regle metier ;
- documenter les exceptions ;
- ne jamais exposer de secret dans les logs ou dans Git ;
- faire valider les alertes critiques avant merge.

## Limites

TECH-02 ne couvre pas :

- Semgrep ;
- SonarCloud ;
- JFrog Artifactory ;
- scan Docker ;
- Dependabot ;
- politiques avancees de suppression d'alertes.
