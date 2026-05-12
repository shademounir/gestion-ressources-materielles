# Frontend Architecture

## Objectif

Le frontend cible est une application React TypeScript modulaire, construite avec Vite. Il doit offrir une interface claire pour les acteurs metier, tout en respectant les permissions et les etats applicatifs.

## Structure cible

```text
frontend/src/
├── app/
├── assets/
├── components/
├── config/
├── features/
│   ├── auth/
│   ├── users/
│   ├── departments/
│   ├── suppliers/
│   ├── tenders/
│   ├── resources/
│   ├── assignments/
│   ├── maintenance/
│   ├── notifications/
│   └── audit/
├── hooks/
├── layouts/
├── pages/
├── routes/
├── services/
├── store/
├── types/
└── utils/
```

## Separation des responsabilites

- pages : composition des vues routables.
- components : elements UI reutilisables.
- features : logique fonctionnelle par domaine.
- services : appels API et adaptation des reponses.
- hooks : logique reutilisable cote React.
- routes : configuration navigation et protection.
- types : contrats TypeScript partages cote frontend.

## Gestion de l'authentification

- Stocker l'etat de session dans un module dedie.
- Attacher l'access token aux appels API.
- Gerer l'expiration via refresh token.
- Rediriger l'utilisateur non authentifie vers la page de connexion.
- Nettoyer la session lors de la deconnexion.

## Gestion des permissions frontend

Le frontend ne remplace jamais la securite backend. Il masque ou desactive les actions non autorisees pour ameliorer l'experience utilisateur, tandis que le backend reste la source d'autorisation.

Exemples :

- afficher le bouton de creation fournisseur uniquement aux roles autorises ;
- proteger les routes d'administration ;
- adapter les menus selon le role.

## Gestion des erreurs

- Afficher les erreurs fonctionnelles lisibles.
- Centraliser le traitement des erreurs API.
- Eviter d'exposer les details techniques.
- Prevoir des etats de chargement, vide et erreur.

## Tests frontend cibles

- Tests unitaires des composants critiques.
- Tests des guards de routes.
- Tests des services API avec mocks.
- Tests de rendu conditionnel selon permissions.
- Vitest pour l'execution des tests.
- React Testing Library pour tester le comportement utilisateur.

## Accessibilite et ergonomie

- Navigation coherente.
- Libelles explicites.
- Etats visuels pour chargement, succes et erreur.
- Formulaires valides avant soumission.
