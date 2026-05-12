# BPMN - Workflow appel d'offre

## Acteurs

- Chef de departement
- Responsable des ressources
- Fournisseur
- Systeme de notification
- Audit

## Evenement declencheur

Un besoin materiel valide necessite une acquisition externe.

## Processus

1. Le chef de departement exprime ou valide un besoin.
2. Le responsable des ressources consolide les besoins.
3. Le responsable cree un appel d'offre au statut `DRAFT`.
4. Le responsable complete les criteres, delais et fournisseurs cibles.
5. Validation : l'appel d'offre est-il complet ?
6. Si non, l'appel reste `DRAFT`.
7. Si oui, l'appel passe a `PUBLISHED`.
8. Le systeme notifie les fournisseurs concernes.
9. Les fournisseurs soumettent leurs offres.
10. A la date limite, l'appel passe a `CLOSED`.
11. Le responsable compare les offres.
12. Validation : une offre est-elle recevable ?
13. Si non, l'appel peut passer a `CANCELLED` ou rester a analyser.
14. Si oui, une offre est selectionnee.
15. L'appel passe a `AWARDED`.
16. Le systeme notifie le fournisseur retenu.
17. L'audit journalise la decision.

## Statuts

- `DRAFT`
- `PUBLISHED`
- `CLOSED`
- `AWARDED`
- `CANCELLED`
- `ARCHIVED`

## Validations cles

- Criteres de selection obligatoires avant publication.
- Date limite obligatoire.
- Fournisseur actif obligatoire.
- Une seule offre retenue.
- Justification obligatoire lors de l'attribution.

## Sorties

- Offre fournisseur retenue.
- Historique des offres.
- Trace d'audit.
- Notification aux acteurs concernes.
