# BPMN - Workflow expression de besoin

## Acteurs

- Enseignant
- Chef de departement
- Responsable ressources
- Systeme de notification
- Audit

## Evenement declencheur

Un enseignant ou un chef de departement identifie un besoin materiel.

## Processus

1. L'utilisateur saisit une demande de besoin.
2. Le systeme verifie les informations obligatoires : type, quantite, justification, priorite et departement.
3. La demande est creee au statut `DRAFT` ou `SUBMITTED` selon le role.
4. Le chef de departement examine la demande.
5. Validation : le besoin est-il pertinent ?
6. Si non, la demande passe a `REJECTED` avec motif.
7. Si oui, la demande passe a `APPROVED_DEPARTMENT`.
8. Le responsable ressources consolide les besoins approuves.
9. Validation : le besoin doit-il donner lieu a acquisition ?
10. Si non, le besoin peut etre satisfait par une ressource disponible.
11. Si oui, le besoin alimente un futur appel d'offre.
12. Le systeme notifie le demandeur.
13. L'audit journalise la decision.

## Statuts proposes

- `DRAFT`
- `SUBMITTED`
- `APPROVED_DEPARTMENT`
- `REJECTED`
- `CONSOLIDATED`
- `LINKED_TO_TENDER`
- `FULFILLED`

## Validations cles

- Quantite strictement positive.
- Justification obligatoire.
- Departement obligatoire.
- Motif obligatoire en cas de refus.
- Besoin approuve obligatoire avant rattachement a un appel d'offre.

## Sorties

- Besoin accepte, refuse, satisfait ou rattache a un appel d'offre.
- Notification au demandeur.
- Trace d'audit.
