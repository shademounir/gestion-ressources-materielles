# API Design Guidelines

## Style API

L'API cible est REST, documentee avec Swagger / OpenAPI.

## Conventions d'URL

- Utiliser des noms de ressources au pluriel.
- Utiliser kebab-case si necessaire.
- Ne pas exposer les details internes de persistance.

Exemples :

```text
/api/users
/api/departments
/api/suppliers
/api/tenders
/api/resources
/api/assignments
/api/maintenance-tickets
/api/notifications
```

## Methodes HTTP

| Methode | Usage |
| --- | --- |
| GET | Lecture |
| POST | Creation ou action metier |
| PATCH | Modification partielle |
| DELETE | Suppression logique ou desactivation |

## Actions metier

Les actions metier doivent rester explicites :

```text
POST /api/tenders/{id}/publish
POST /api/tenders/{id}/award
POST /api/resources/{id}/assign
POST /api/maintenance-tickets/{id}/diagnose
POST /api/maintenance-tickets/{id}/close
```

## Reponses

Chaque reponse doit etre stable, typee et documentee.

Recommandations :

- ne pas exposer passwordHash ;
- utiliser des DTO de reponse ;
- retourner les dates au format ISO ;
- inclure les identifiants stables.

## Erreurs

Format recommande :

```json
{
  "statusCode": 400,
  "message": "Invalid resource status transition",
  "error": "Bad Request",
  "timestamp": "2026-05-12T00:00:00.000Z"
}
```

## Pagination et filtres

Les listes doivent prevoir :

- page ;
- limit ;
- sort ;
- order ;
- filtres par statut, categorie, departement ou date selon domaine.

## Versioning

Version initiale :

```text
/api/v1
```

Le versioning doit etre active si des changements de contrat incompatibles apparaissent.

## Securite API

- JWT obligatoire pour les routes protegees.
- RBAC applique par guard.
- Validation DTO pour chaque entree.
- Swagger doit indiquer les routes securisees.
- Les endpoints d'administration doivent etre explicitement reserves.
