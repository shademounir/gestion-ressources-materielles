# JFrog Artifactory Strategy

## Objectif

JFrog Artifactory est la cible enterprise pour stocker, versionner et gouverner les artefacts produits par le pipeline CI/CD.

Il ne remplace pas les checks GitHub Actions, SonarCloud ou les scans securite. Il intervient apres le build afin de conserver les livrables validables et deployables.

## Position dans le pipeline

Pipeline cible :

```text
Clean -> Test -> Qualite de code -> Security -> Build -> Artifact Repository -> Deploy
```

Artifactory intervient a l'etape `Artifact Repository`, apres validation des tests, de la qualite de code et des scans securite.

## Role JFrog Artifactory

Artifactory permet de :

- centraliser les artefacts ;
- versionner les livrables ;
- tracer les builds ;
- promouvoir des artefacts entre environnements ;
- faciliter le rollback ;
- separer les artefacts temporaires des artefacts deployables ;
- preparer l'analyse de securite des artefacts.

## Usage pour Docker images

En Release 8, lorsque Docker sera pleinement active :

- construire les images backend et frontend ;
- taguer les images avec commit, release et environnement ;
- publier les images dans un registry Artifactory ;
- promouvoir les images de `dev` vers `staging`, puis `prod`.

Exemples de tags cibles :

```text
grm-backend:SCRUM-24-a672931
grm-backend:release-8.0.0
grm-frontend:staging-2026-06-02
```

## Usage pour packages et builds

Artifactory pourra stocker :

- builds backend NestJS compiles ;
- builds frontend Vite ;
- rapports de tests ;
- rapports coverage ;
- rapports de securite ;
- packages ou bundles internes si le projet evolue.

## Build-info

Le build-info doit contenir :

- identifiant du workflow ;
- numero de run GitHub Actions ;
- commit SHA ;
- branche ;
- auteur ;
- date ;
- reference Jira ;
- versions des dependances ;
- liste des artefacts produits.

Cette information soutient l'audit, la review et la soutenance.

## Promotion dev, staging, prod

Principe cible :

1. `dev` : artefact produit par une branche ou Pull Request.
2. `staging` : artefact valide apres merge et quality gates.
3. `prod` : artefact promu apres validation humaine.

La promotion ne reconstruit pas l'application. Elle deplace ou marque un artefact deja valide.

## Rollback

Le rollback consiste a redeployer un artefact precedemment valide.

Prerequis :

- artefacts conserves ;
- tags explicites ;
- build-info disponible ;
- versions deployees tracees ;
- procedure de retour documentee.

## Securite et scan futur

Artifactory pourra etre couple a des scans futurs :

- analyse de vulnerabilites d'images Docker ;
- controle des dependances ;
- verification licences ;
- politiques de blocage sur artefacts critiques.

Dans l'etape actuelle, cette strategie reste documentaire et n'active pas encore de scan Artifactory.

## Prerequis eventuels

Pour une mise en oeuvre reelle :

- compte JFrog ;
- repository Docker ;
- repository generique pour rapports ;
- secrets GitHub Actions ;
- droits de publication ;
- conventions de nommage ;
- politique de retention ;
- environnement staging cible.

## Position pedagogique

Pour le projet academique, Artifactory sert a montrer une demarche enterprise :

- separation build/deploy ;
- gouvernance des artefacts ;
- tracabilite DevSecOps ;
- preuves de pipeline ;
- capacite de rollback.
