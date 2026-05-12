# Testing Strategy

## Objectif

La strategie globale de tests couvre le backend NestJS, le frontend React/Vite, les integrations API et les validations d'acceptation. Elle accompagne le developpement progressif et la CI/CD.

## Pyramide cible

```text
Acceptance tests
Integration tests
Unit tests
```

Les tests unitaires restent majoritaires, les tests d'integration couvrent les flux critiques, et les tests d'acceptation valident les scenarios metier.

## Outils cibles

- Backend : Jest.
- Frontend : Vitest et React Testing Library.
- API : tests d'integration HTTP.
- CI : GitHub Actions.

## Priorites

1. Authentification et RBAC.
2. Transitions de statut.
3. Affectations et disponibilite ressource.
4. Maintenance.
5. Appels d'offres et selection fournisseur.
6. Audit et notifications.

## Definition of Done qualite

- Criteres d'acceptation couverts.
- Cas nominaux testes.
- Cas d'erreur testes.
- Permissions verifiees si applicable.
- Documentation mise a jour.
