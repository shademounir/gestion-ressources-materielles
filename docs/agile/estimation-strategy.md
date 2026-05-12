# Strategie d'estimation

## Objectif

Cette strategie permet d'estimer les user stories de maniere simple, coherente et exploitable dans Jira. Elle est adaptee a un projet academique professionnel ou les objectifs portent autant sur la valeur metier que sur l'architecture, les tests et la CI/CD.

## Echelle de complexite

| Taille | Signification | Indication |
| --- | --- | --- |
| XS | Tres simple | Changement documentaire ou regle tres limitee |
| S | Simple | Fonctionnalite directe avec peu de dependances |
| M | Moyenne | Fonctionnalite standard avec validation et tests |
| L | Complexe | Workflow, etats, plusieurs acteurs ou integrations internes |
| XL | Tres complexe | Epic a decouper avant sprint |

## Correspondance indicative en points

| Taille | Points |
| --- | --- |
| XS | 1 |
| S | 2 |
| M | 3 |
| L | 5 |
| XL | 8 ou plus |

Les points servent a comparer la complexite relative, pas a promettre une duree exacte.

## Criteres d'estimation

L'estimation tient compte de :

- complexite metier ;
- nombre d'acteurs concernes ;
- dependances avec d'autres modules ;
- niveau de securite attendu ;
- nombre de regles de validation ;
- impact sur les tests ;
- impact sur la documentation ;
- risques d'integration.

## Regles de decoupage

Une story doit etre decoupee si :

- elle couvre plusieurs objectifs metier ;
- elle concerne plusieurs workflows independants ;
- elle depasse une complexite XL ;
- ses criteres d'acceptation sont trop nombreux ;
- elle ne peut pas etre testee clairement.

## Priorisation

| Priorite | Usage |
| --- | --- |
| P0 | Indispensable pour le socle, la securite ou un flux critique |
| P1 | Important pour la valeur metier principale |
| P2 | Utile mais non bloquant pour la premiere version |
| P3 | Confort, optimisation ou amelioration |

## Strategie de test par niveau

| Type de story | Tests recommandes |
| --- | --- |
| Validation simple | Tests unitaires |
| Workflow avec statuts | Tests unitaires et integration |
| Permissions | Tests par role et cas d'acces refuse |
| Consultation liste | Tests de filtrage, pagination et droits |
| Notification | Tests de declenchement et destinataire |
| Audit | Tests de generation, contenu et acces |

## Gestion de l'incertitude

Lorsqu'une story contient une incertitude forte, creer une tache d'analyse ou un spike avant implementation. Le spike doit produire une decision, une option retenue ou un decoupage plus clair.

## Recommandation pour Jira

Utiliser les champs suivants :

- Epic Link ;
- Priority ;
- Story Points ;
- Component ;
- Fix Version ;
- Labels ;
- Acceptance Criteria ;
- Dependencies ;
- Test Strategy.
