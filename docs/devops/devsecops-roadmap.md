# DevSecOps Roadmap

## Objectif

Cette roadmap introduit progressivement les pratiques DevSecOps afin de ne pas surcharger les premieres releases tout en construisant une chaine qualite professionnelle.

## Release 1 - Authentification, utilisateurs et roles

Objectifs DevSecOps :

- mettre en place les premieres conventions Git ;
- preparer les checks lint et tests unitaires ;
- activer npm audit en mode informatif ;
- documenter les secrets JWT et variables d'environnement ;
- commencer les tests de permissions.

## Release 2 - Departements et besoins

Objectifs DevSecOps :

- renforcer les Pull Request checks ;
- lier systematiquement Jira et GitHub ;
- suivre les tests unitaires des validations ;
- documenter les decisions d'architecture ;
- preparer l'integration SonarCloud ;
- introduire GitHub Actions Artifacts pour conserver les rapports CI/CD utiles a la soutenance.

## Release 3 - Fournisseurs et appels d'offres

Objectifs DevSecOps :

- activer SonarCloud sur Pull Request ;
- activer Semgrep en mode informatif ;
- suivre la duplication et la complexite ;
- tester les transitions d'appel d'offre ;
- renforcer les criteres d'acceptation.

## Release 4 - Ressources et inventaire

Objectifs DevSecOps :

- rendre certains checks SonarCloud bloquants ;
- ajouter tests d'integration sur inventaire ;
- renforcer audit logs ;
- verifier les contraintes Prisma ;
- suivre la couverture du nouveau code.

## Release 5 - Affectations

Objectifs DevSecOps :

- activer CodeQL ;
- rendre les tests critiques bloquants ;
- tester les conflits d'affectation ;
- verifier RBAC par role ;
- surveiller les erreurs CI/CD.

## Release 6 - Maintenance

Objectifs DevSecOps :

- ajouter tests d'integration maintenance ;
- renforcer Semgrep sur patterns securite ;
- verifier logs et correlation IDs ;
- revoir la gestion erreurs ;
- verifier la tracabilite des decisions.

## Release 7 - Tests, securite et qualite

Objectifs DevSecOps :

- rendre les quality gates bloquants ;
- viser 80% de couverture sur nouveau code ;
- bloquer vulnerabilites critiques et hautes ;
- finaliser la review securite ;
- nettoyer la dette technique majeure ;
- structurer les artefacts de preuves : tests, coverage, securite, SonarCloud.

## Release 8 - CI/CD, Docker, deploiement et rapport final

Objectifs DevSecOps :

- finaliser GitHub Actions ;
- activer Docker build ;
- publier les images Docker dans un repository d'artefacts cible ;
- ajouter scan Docker ;
- verifier rollback ;
- preparer deploiement staging ;
- produire preuves de pipeline pour soutenance ;
- definir JFrog Artifactory comme cible enterprise pour les artefacts deployables.

## Strategie Artifact Repository

Court terme :

- utiliser GitHub Actions Artifacts pour les rapports de tests ;
- conserver les rapports coverage ;
- archiver les rapports de securite ;
- conserver les builds backend/frontend lorsque pertinent ;
- produire des preuves CI/CD exploitables en soutenance.

Cible enterprise :

- introduire JFrog Artifactory comme repository d'artefacts ;
- publier les images Docker futures ;
- tracer les build-info ;
- promouvoir les artefacts entre dev, staging et prod ;
- faciliter rollback et audit.

## Synthese progressive

| Release | Qualite                  | Securite             | Pipeline                      |
| ------- | ------------------------ | -------------------- | ----------------------------- |
| R1      | Tests unitaires initiaux | npm audit informatif | CI minimale                   |
| R2      | Rapports CI conserves    | Audit informatif     | GitHub Actions Artifacts      |
| R3      | SonarCloud PR            | Semgrep informatif   | Checks PR                     |
| R5      | Couverture suivie        | CodeQL               | Jobs paralleles               |
| R7      | Gates bloquants          | Scans bloquants      | Pipeline complet              |
| R8      | Rapport final            | Scan Docker          | JFrog cible et deploy staging |
