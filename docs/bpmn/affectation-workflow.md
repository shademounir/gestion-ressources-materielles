# BPMN - Workflow affectation

## Acteurs

- Responsable des ressources
- Chef de departement
- Enseignant
- Systeme de notification
- Audit

## Evenement declencheur

Une ressource disponible doit etre affectee a un utilisateur, un departement ou un usage specifique.

## Processus

1. Le responsable consulte l'inventaire.
2. Le responsable selectionne une ressource.
3. Validation : la ressource est-elle `AVAILABLE` ?
4. Si non, l'affectation est refusee.
5. Si oui, le responsable choisit le beneficiaire.
6. Validation : le beneficiaire est-il valide ?
7. Si non, correction de la demande.
8. Si oui, creation de l'affectation au statut `ACTIVE`.
9. La ressource passe au statut `ASSIGNED`.
10. Le systeme notifie le beneficiaire.
11. L'audit journalise l'affectation.
12. Lors du retour, le responsable cloture l'affectation.
13. Validation : la ressource est-elle fonctionnelle ?
14. Si oui, la ressource repasse `AVAILABLE`.
15. Si non, un ticket maintenance peut etre cree.
16. L'affectation passe a `RETURNED`, puis `CLOSED`.

## Statuts affectation

- `ACTIVE`
- `RETURNED`
- `CANCELLED`
- `CLOSED`

## Statuts ressource lies

- `AVAILABLE`
- `ASSIGNED`
- `MAINTENANCE`

## Validations cles

- Une seule affectation active par ressource.
- Ressource disponible obligatoire.
- Beneficiaire obligatoire.
- Date de retour obligatoire a la cloture.

## Sorties

- Affectation historisee.
- Ressource mise a jour.
- Notification au beneficiaire.
- Trace d'audit.
