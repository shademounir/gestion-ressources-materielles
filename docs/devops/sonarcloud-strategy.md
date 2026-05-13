# SonarCloud Strategy

## Objectif

SonarCloud fournit une analyse continue de la qualite du code, de la maintenabilite, de la dette technique, des bugs, des vulnerabilites et de la duplication. Il sera integre a GitHub Actions pendant la mise en place CI/CD progressive.

## Role de SonarCloud

- Mesurer la qualite du code backend NestJS.
- Mesurer la qualite du code frontend React/Vite.
- Suivre la couverture de tests.
- Detecter les code smells.
- Detecter les bugs potentiels.
- Detecter les vulnerabilites.
- Suivre la dette technique.
- Bloquer les merges si le quality gate echoue.

## Architecture d'integration GitHub

```text
Pull Request
-> GitHub Actions
-> Tests + coverage
-> SonarCloud scan
-> Quality Gate
-> Status check GitHub
-> Merge autorise ou bloque
```

Le scan SonarCloud doit etre lance dans GitHub Actions apres les tests afin de publier la couverture.

## Quality profiles

Profils recommandes :

- TypeScript backend ;
- TypeScript frontend ;
- JavaScript/TypeScript common rules ;
- Security rules ;
- Maintainability rules.

Les profils doivent rester proches des profils SonarCloud standards au debut, puis etre ajustes apres les premieres releases.

## Quality gates

Criteres cibles :

- 0 bug critique sur nouveau code ;
- 0 vulnerabilite critique ou haute sur nouveau code ;
- couverture nouveau code minimale : 80% a partir de Release 7 ;
- duplication nouveau code maximale : 3% ;
- maintainability rating : A sur nouveau code ;
- reliability rating : A sur nouveau code ;
- security rating : A sur nouveau code.

## Analyse backend et frontend

Backend :

- services ;
- guards ;
- policies RBAC ;
- DTO validators ;
- repositories ;
- tests Jest.

Frontend :

- components ;
- hooks ;
- services API ;
- guards de routes ;
- tests Vitest et React Testing Library.

## Couverture code

Les rapports de couverture doivent etre produits par :

- Jest pour backend ;
- Vitest pour frontend.

Les rapports seront transmis a SonarCloud via le pipeline.

## Detection code smells

SonarCloud doit signaler :

- fonctions trop longues ;
- complexite excessive ;
- duplications ;
- conditions imbriquees difficiles a maintenir ;
- code mort ;
- conventions TypeScript faibles.

## Dette technique

La dette technique doit etre suivie par release. Les dettes acceptees doivent etre documentees dans Jira avec :

- justification ;
- impact ;
- priorite ;
- release cible de correction.

## Strategie Pull Request analysis

Chaque Pull Request doit declencher :

- analyse du nouveau code ;
- commentaire ou status check SonarCloud ;
- verification du quality gate ;
- affichage de la couverture du nouveau code ;
- blocage du merge si seuils critiques non respectes.

## Prerequis

- Projet SonarCloud cree.
- Organisation SonarCloud liee a GitHub.
- Token SonarCloud configure dans GitHub Secrets.
- Workflow GitHub Actions capable de generer les rapports de couverture.
