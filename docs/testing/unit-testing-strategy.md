# Unit Testing Strategy

## Backend Jest

Les tests unitaires backend ciblent les services, policies, validateurs et mappers.

Priorites :

- validation des DTO critiques ;
- transitions de statut ;
- regles d'affectation ;
- selection d'offre unique ;
- cloture maintenance ;
- permissions RBAC.

## Frontend Vitest

Les tests unitaires frontend ciblent les composants, hooks et services isolables.

Priorites :

- affichage conditionnel selon role ;
- formulaires critiques ;
- services API avec mocks ;
- guards de routes ;
- composants de notification.

## Regles

- Un test doit nommer le comportement attendu.
- Les dependances externes doivent etre mockees.
- Les cas d'erreur doivent etre explicites.
- Les tests ne doivent pas dependre de l'ordre d'execution.

## Exemples de scenarios

- Refuser une affectation si la ressource n'est pas disponible.
- Refuser une publication d'appel d'offre incomplet.
- Refuser la cloture maintenance sans resultat.
- Masquer une action frontend si le role ne la permet pas.
