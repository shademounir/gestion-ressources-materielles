# Error Handling Strategy

## Objectif

Cette strategie definit la gestion des erreurs entre frontend, backend et logs afin d'obtenir des comportements previsibles et exploitables.

## Categories d'erreurs

### Erreurs de validation

Exemples :

- champ obligatoire manquant ;
- format email invalide ;
- enum de statut invalide ;
- date incoherente.

Code HTTP recommande : `400 Bad Request`.

### Erreurs metier

Exemples :

- ressource deja affectee ;
- appel d'offre incomplet ;
- offre non selectionnable ;
- maintenance cloturable sans resultat.

Codes HTTP recommandes :

- `400 Bad Request` pour une regle metier invalide ;
- `409 Conflict` pour un conflit d'etat.

### Erreurs techniques

Exemples :

- base de donnees indisponible ;
- timeout ;
- service interne indisponible.

Code HTTP recommande : `500 Internal Server Error` ou `503 Service Unavailable`.

### Erreurs securite

Exemples :

- token absent ;
- token expire ;
- permission insuffisante ;
- tentative d'acces a une ressource interdite.

Codes HTTP recommandes :

- `401 Unauthorized` pour absence ou invalidite d'authentification ;
- `403 Forbidden` pour permission insuffisante.

## Format standard API errors

Format cible :

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Invalid resource status transition",
  "code": "RESOURCE_INVALID_STATUS_TRANSITION",
  "details": {},
  "correlationId": "req-123",
  "timestamp": "2026-05-12T10:00:00.000Z",
  "path": "/api/v1/resources/123/status"
}
```

## Codes HTTP

| Code | Usage |
| --- | --- |
| 400 | Validation ou regle metier invalide |
| 401 | Non authentifie |
| 403 | Non autorise |
| 404 | Ressource introuvable |
| 409 | Conflit d'etat ou unicite |
| 422 | Donnee comprise mais non traitable, si necessaire |
| 500 | Erreur technique interne |
| 503 | Service indisponible |

## Exceptions NestJS

Utiliser les exceptions NestJS standard :

- `BadRequestException`
- `UnauthorizedException`
- `ForbiddenException`
- `NotFoundException`
- `ConflictException`
- `InternalServerErrorException`
- `ServiceUnavailableException`

Un filtre global doit normaliser le format de reponse.

## Logging erreurs

Regles :

- journaliser les erreurs techniques avec stack trace en dev ;
- masquer les details internes en production ;
- ne jamais logger les mots de passe ou tokens ;
- ajouter le correlation ID ;
- journaliser les erreurs securite importantes.

## Mapping backend/frontend

| Erreur backend | Comportement frontend |
| --- | --- |
| 400 validation | Afficher erreurs de formulaire |
| 401 | Rediriger vers connexion ou refresh token |
| 403 | Afficher acces refuse |
| 404 | Afficher ressource introuvable |
| 409 | Afficher conflit metier explicite |
| 500 | Afficher message generique et inviter a reessayer |

## Messages utilisateur

Les messages frontend doivent etre :

- courts ;
- comprensibles ;
- non techniques ;
- sans details sensibles ;
- actionnables lorsque possible.
