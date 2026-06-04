# Cartographie des tests existants

## Vue d'Ensemble

Etat constate au moment de SCRUM-46 :

- fichiers de tests backend : environ 27 ;
- fichiers de tests frontend : environ 2 ;
- volume de tests backend observe : environ 206 tests ;
- volume de tests frontend observe : environ 19 tests ;
- runner backend : Jest ;
- runner frontend : Vitest + React Testing Library ;
- couverture generee via `npm run test:cov`.

Cette cartographie est fonctionnelle et doit etre actualisee a chaque release majeure.

## Modules Backend Testes

| Module               | Tests presents                    | Couverture fonctionnelle principale                    | Criticite |
| -------------------- | --------------------------------- | ------------------------------------------------------ | --------- |
| Auth                 | controller, service, JWT strategy | login, logout, JWT, utilisateur actif                  | Haute     |
| RBAC                 | guard, decorator                  | roles autorises/interdits                              | Haute     |
| Users                | controller, service               | creation utilisateur, role, desactivation, departement | Haute     |
| Departments          | controller, service               | creation et unicite departement                        | Moyenne   |
| Department Needs     | controller, service               | creation besoin, items, rattachements                  | Haute     |
| Suppliers            | controller, service               | creation, historique, desactivation                    | Moyenne   |
| Tenders              | controller, service               | creation, publication, deadline, doublons              | Haute     |
| Supplier Offers      | controller, service               | depot offre, selection gagnante, transaction           | Haute     |
| Resources            | controller, service               | creation, inventaire, detail, statut                   | Haute     |
| Resource Assignments | controller, service               | affectation, retour, historique, transaction           | Haute     |
| Maintenance          | controller, service               | panne, constat, intervention, retour fournisseur       | Haute     |
| Notifications        | controller, service               | creation, consultation, compteur, lecture              | Moyenne   |
| Audit Logs           | service                           | journalisation non bloquante, actions metier           | Moyenne   |
| Health               | controller                        | endpoint technique                                     | Basse     |

## Tests Frontend Existants

| Fichier                                   | Couverture principale                                                           | Criticite |
| ----------------------------------------- | ------------------------------------------------------------------------------- | --------- |
| `frontend/src/app/App.test.tsx`           | login, session, dashboard, ressources, affectations, maintenance, notifications | Haute     |
| `frontend/src/services/apiClient.test.ts` | erreurs API, headers, parsing des messages                                      | Haute     |

Les tests frontend couvrent les parcours de demonstration principaux. La prochaine evolution recommandee consiste a separer les tests par page pour ameliorer la lisibilite.

## Regles Metier Couvertes

### Authentification et Securite

- connexion avec identifiants valides ;
- refus des identifiants invalides ;
- logout stateless ;
- session expiree cote frontend ;
- roles RBAC minimum `ADMIN`, `MANAGER`, `USER`.

### Utilisateurs

- creation utilisateur par admin ;
- unicite email ;
- hash du mot de passe ;
- changement de role ;
- desactivation logique ;
- refus des utilisateurs inactifs sur les flux sensibles.

### Ressources et Inventaire

- creation ressource ;
- unicite `inventoryCode` ;
- statut initial `AVAILABLE` ;
- listing avec pagination/filtres ;
- detail ressource ;
- changement de statut.

### Affectations

- affectation d'une ressource disponible ;
- refus des ressources non disponibles ;
- refus d'affectation vers utilisateur inactif ;
- retour d'affectation ;
- mise a jour atomique ressource + affectation ;
- historique d'affectation.

### Maintenance

- signalement panne ;
- passage ressource en maintenance ;
- creation constat ;
- creation intervention ;
- creation retour fournisseur ;
- validations des statuts interdits.

### Notifications

- creation automatique de notifications metier ;
- consultation des notifications utilisateur et globales ;
- compteur de notifications non lues ;
- marquage idempotent comme lu ;
- affichage frontend avec badge et empty state.

### Audit

- creation centralisee d'audit logs ;
- journalisation des actions users, resources, assignments et maintenance ;
- audit non bloquant en cas d'erreur d'ecriture.

## Modules Critiques

Les modules suivants doivent conserver une couverture prioritaire :

1. Auth / RBAC
2. Users
3. Resources
4. Resource Assignments
5. Maintenance
6. Notifications
7. Audit Logs

Ces modules portent les regles de securite, les transactions ou la tracabilite du projet.

## Points a Renforcer dans SCRUM-47

SCRUM-47 devra prioriser :

- tests DTO/validation explicites sur les query params complexes ;
- tests frontend separes par page pour reduire la taille de `App.test.tsx` ;
- tests de cas limites sur notifications globales et lecture par utilisateur ;
- couverture supplementaire des erreurs API frontend ;
- tests d'integration legers pour verifier les contrats REST les plus critiques ;
- analyse des rapports `coverage/lcov.info` pour cibler les fichiers faibles.

## Scripts Verifies

Scripts racine :

```bash
npm run lint
npm run typecheck
npm run test
npm run test:cov
npm run build
```

Scripts backend :

```bash
npm run test --workspace backend
npm run test:cov --workspace backend
```

Scripts frontend :

```bash
npm run test --workspace frontend
npm run test:cov --workspace frontend
```

## Regles de Maintien

- Toute User Story metier doit ajouter ou ajuster les tests de son module.
- Toute correction de bug doit ajouter un test de non-regression lorsque possible.
- Toute exception de couverture doit etre expliquee dans la PR.
- Les tests ne doivent pas dependre de donnees locales non versionnees.
- Les secrets, `.env`, volumes Docker et bases locales ne doivent jamais etre requis pour les tests unitaires.
