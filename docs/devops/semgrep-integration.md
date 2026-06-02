# Semgrep Integration

## Objectif

Semgrep ajoute une analyse statique orientee securite et qualite sur le code TypeScript et JavaScript du monorepo.

L'objectif de TECH-03 est d'introduire un scan standard, progressif et exploitable en Pull Request sans modifier le code metier.

## Role de Semgrep

Semgrep detecte des patterns de code associes a des risques connus :

- validation insuffisante des entrees ;
- erreurs d'autorisation ;
- pratiques JWT ou authentification fragiles ;
- usages dangereux de donnees non fiables ;
- patterns React ou TypeScript risques ;
- mauvaises pratiques de securite applicative.

## Difference avec SonarCloud et CodeQL

SonarCloud est centre sur la qualite globale :

- bugs ;
- code smells ;
- duplications ;
- maintenabilite ;
- couverture de tests ;
- security hotspots.

CodeQL est centre sur l'analyse securite par flux de donnees et publie ses alertes dans GitHub Security.

Semgrep est complementaire car il applique des regles explicites, lisibles et adaptables au contexte projet. Il est utile pour faire evoluer progressivement les controles DevSecOps avec des regles standard puis des regles specifiques au projet.

## Workflow GitHub Actions

Le workflow dedie est :

- `.github/workflows/semgrep.yml`.

Il s'execute sur :

- Pull Request ;
- push vers `develop` ;
- push vers `main` ;
- scan planifie hebdomadaire chaque mardi a 07:00 UTC.

## Perimetre analyse

Le scan couvre :

- `backend/src` ;
- `frontend/src`.

Les exclusions evitent les faux positifs sur les dossiers generes ou non pertinents :

- `node_modules` ;
- `dist` ;
- `coverage` ;
- `build` ;
- `.next` ;
- `.vite` ;
- `backend/prisma/migrations`.

## Regles activees

La premiere integration utilise :

- `p/ci` pour un profil adapte a l'integration continue ;
- `p/security-audit` pour des controles securite standards.

Ces profils sont volontairement generiques afin de limiter les faux positifs au demarrage.

## Strategie de blocage

Le workflow est progressif :

- les findings sont exportes dans un rapport `semgrep-results.json` ;
- le rapport est conserve comme artifact GitHub Actions pendant 14 jours ;
- les findings de severite `ERROR` bloquent le workflow ;
- les findings `WARNING` et `INFO` sont analyses pendant la review sans blocage initial.

Cette strategie permet de traiter immediatement les risques critiques tout en evitant de bloquer le developpement sur des alertes a qualifier.

## Traitement des findings

Processus recommande :

1. Lire le rapport Semgrep dans les artifacts GitHub Actions.
2. Identifier la regle, le fichier et le niveau de severite.
3. Corriger les findings `ERROR` avant merge.
4. Evaluer les findings `WARNING` et `INFO` pendant la review.
5. Creer une issue Jira si une correction est differee.
6. Documenter toute decision de false positive.

## Faux positifs

Un finding peut etre classe false positive uniquement si :

- le flux de donnees est maitrise ;
- une validation existe en amont ;
- le contexte NestJS, React ou Prisma justifie l'alerte ;
- la decision est explicite dans la Pull Request ou dans Jira.

## Evolution cible

Les evolutions futures peuvent inclure :

- ajout de regles projet dans `.semgrep.yml` ;
- publication SARIF dans GitHub Security ;
- blocage progressif des findings `WARNING` sur zones sensibles ;
- regles specifiques RBAC, DTO validation et gestion JWT ;
- integration avec la strategie de Quality Gates Release 7 et Release 8.

## Limites

TECH-03 ne couvre pas :

- modification du code metier ;
- modification Prisma ;
- modification Docker ;
- integration JFrog ;
- remplacement de SonarCloud ou CodeQL ;
- regles Semgrep custom avancees.
