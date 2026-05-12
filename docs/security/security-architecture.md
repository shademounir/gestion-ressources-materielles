# Security Architecture

## Objectif

La securite cible protege les comptes, les donnees metier, les actions sensibles et les flux API. Elle repose sur une combinaison JWT, refresh token, RBAC, validation stricte des donnees et audit systematique.

## Principes

- Authentification obligatoire pour les routes protegees.
- Autorisation verifiee cote backend.
- Permissions frontend utilisees uniquement pour l'ergonomie.
- Validation DTO systematique.
- Audit des actions critiques.
- Aucun secret dans le repository.
- Logs sans mot de passe, token ou information sensible inutile.

## Couches de securite

| Couche | Controle |
| --- | --- |
| Frontend | Routes protegees, affichage selon permissions |
| API | Guards JWT, guards RBAC, validation DTO |
| Domaine | Regles de coherence et transitions autorisees |
| Donnees | Contraintes d'unicite, relations, statuts |
| Audit | Journalisation des actions sensibles |
| DevOps | Secrets, scans, validations PR |

## JWT et refresh token

- Access token court pour les appels API.
- Refresh token plus long pour renouveler la session.
- Refresh token stocke et invalidable cote serveur lorsque possible.
- Rotation recommandee des refresh tokens.
- Deconnexion avec invalidation du refresh token.

## Protections API

- Validation des payloads entrants.
- Filtrage des champs de sortie.
- Gestion standardisee des erreurs.
- RBAC par endpoint.
- Rate limiting a prevoir pour les endpoints d'authentification.
- Swagger protege ou limite en production.

## Risques principaux

- Role trop permissif.
- Token expose cote navigateur.
- DTO incomplet.
- Audit insuffisant.
- Donnees sensibles exposees dans une reponse API.

## Mesures de reduction

- Tests de permissions par role.
- Revue des endpoints critiques.
- Masquage des champs sensibles.
- Politique de mots de passe.
- Journalisation des tentatives d'acces refusees.
