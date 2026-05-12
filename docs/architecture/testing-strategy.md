# Testing Strategy

## Objectif

La strategie de test garantit la fiabilite des regles metier, soutient l'architecture logicielle et fournit des preuves qualite pour la soutenance.

## Niveaux de test

| Niveau | Objectif | Outils cibles |
| --- | --- | --- |
| Tests unitaires | Verifier une regle isolee | Jest |
| Tests integration | Verifier la cooperation de plusieurs couches | Jest, environnement de test |
| Tests API | Verifier les contrats REST | Supertest ou equivalent |
| Tests frontend | Verifier composants et permissions UI | Outil a definir |
| Tests CI | Automatiser les controles | GitHub Actions |

## Priorites de couverture

1. Authentification et permissions.
2. Transitions de statut.
3. Regles d'affectation.
4. Maintenance et cloture.
5. Selection fournisseur.
6. Audit et notification.

## Strategie backend

- Tester les services applicatifs avec repositories mockes.
- Tester les policies RBAC.
- Tester les validations de statut.
- Tester les erreurs attendues.
- Couvrir les cas nominaux et les cas limites.

## Strategie frontend

- Tester les composants critiques.
- Tester le rendu conditionnel selon role.
- Tester les services API avec mocks.
- Tester les routes protegees.

## Strategie donnees

- Utiliser des jeux de donnees minimaux.
- Eviter la dependance aux donnees de production.
- Isoler les tests qui modifient l'etat.
- Reinitialiser l'environnement de test si necessaire.

## Definition of Done qualite

Une fonctionnalite critique n'est terminee que si :

- les criteres d'acceptation sont couverts ;
- les regles metier ont des tests unitaires ;
- les permissions sont verifiees ;
- les erreurs attendues sont testees ;
- la documentation impactee est mise a jour.

## Indicateurs

- Nombre de tests.
- Couverture des services critiques.
- Taux de succes CI.
- Nombre d'anomalies par release.
- Couverture des permissions.
