# Integration Testing Strategy

## Objectif

Les tests d'integration verifient la cooperation entre API, services, repositories et base de donnees de test.

## Flux prioritaires

- Connexion et acces route protegee.
- Creation utilisateur et attribution role.
- Declaration besoin puis appel d'offre.
- Publication appel d'offre puis soumission offre.
- Selection fournisseur.
- Creation ressource puis consultation inventaire.
- Affectation puis retour ressource.
- Signalement panne, diagnostic et cloture maintenance.
- Generation audit et notification.

## Donnees de test

- Jeu minimal par role.
- Departement de reference.
- Fournisseur actif.
- Ressource disponible.
- Ressource en maintenance.

## Environnement

- Base de test isolee.
- Donnees reinitialisees entre suites critiques.
- Secrets de test sans valeur sensible.
- Execution possible en CI.

## Criteres de succes

- Les APIs retournent les bons codes.
- Les statuts sont persistants.
- Les relations sont coherentes.
- Les permissions refusent les roles non autorises.
