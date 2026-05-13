# Code Review Strategy

## Objectif

La revue de code garantit que les changements respectent le besoin Jira, l'architecture enterprise, les standards de qualite, les tests et la securite.

## Role de Codex review

Codex intervient comme assistant de revue technique :

- identifier bugs et regressions ;
- verifier coherence avec l'architecture ;
- signaler tests manquants ;
- verifier erreurs et statuts metier ;
- reperer risques securite ;
- proposer corrections ou questions.

La review Codex est une aide. Elle ne remplace pas la validation humaine.

## Role de la review humaine

Le reviewer humain valide :

- pertinence metier ;
- lisibilite ;
- perimetre ;
- maintenabilite ;
- securite ;
- coherence Jira ;
- qualite des tests ;
- absence d'effets de bord.

## Checklist review

- La Pull Request est liee a une issue Jira.
- Le titre est clair.
- Le perimetre correspond a la story.
- Les changements hors perimetre sont absents ou justifies.
- Les tests sont adaptes au risque.
- La documentation impactee est mise a jour.
- Les erreurs sont gerees correctement.
- Les logs ne contiennent aucun secret.
- Les permissions sont verifiees cote backend.

## Securite review

Verifier :

- validation DTO ;
- RBAC ;
- absence de secret ;
- absence de fuite de donnees sensibles ;
- gestion JWT ;
- audit logs sur actions sensibles ;
- erreurs API sans details internes.

## Architecture review

Verifier :

- controller sans logique metier lourde ;
- services clairs ;
- repositories isoles ;
- DTO et mappers propres ;
- respect des modules ;
- pas de couplage frontend/backend fragile ;
- respect des conventions Prisma.

## Tests review

Verifier :

- tests unitaires des regles critiques ;
- tests d'integration pour flux multi-couches ;
- tests frontend pour rendu conditionnel ;
- cas d'erreur ;
- permissions ;
- couverture raisonnable du nouveau code.

## Regles merge

Merge autorise uniquement si :

- checks CI obligatoires au vert ;
- quality gate SonarCloud valide ;
- scans securite sans blocage ;
- review Codex traitee si demandee ;
- review humaine approuvee ;
- conflits resolus ;
- branche a jour.

## Refus de review

Une Pull Request peut etre refusee si :

- trop volumineuse ;
- sans contexte Jira ;
- sans tests pour une regle critique ;
- avec changement d'architecture non documente ;
- avec risque securite non traite.
