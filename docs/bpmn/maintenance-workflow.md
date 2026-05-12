# BPMN - Workflow maintenance

## Acteurs

- Enseignant
- Responsable des ressources
- Technicien maintenance
- Fournisseur
- Systeme de notification
- Audit

## Evenement declencheur

Une panne est signalee sur une ressource materielle.

## Processus

1. Un enseignant ou utilisateur autorise signale une panne.
2. Le systeme cree un ticket au statut `REPORTED`.
3. La ressource passe au statut `MAINTENANCE`.
4. Le responsable ou technicien consulte le ticket.
5. Le technicien realise un diagnostic.
6. Le ticket passe a `DIAGNOSIS`.
7. Validation : la panne est-elle confirmee ?
8. Si non, le ticket passe a `REJECTED`, puis `CLOSED`.
9. Si oui, le technicien choisit un traitement.
10. Si intervention interne, le ticket passe a `IN_PROGRESS`.
11. Si retour externe, le ticket passe a `SUPPLIER_RETURN`.
12. Si remplacement necessaire, le ticket passe a `REPLACEMENT_REQUIRED`.
13. Le traitement est execute.
14. Validation : la ressource est-elle remise en service ?
15. Si oui, le ticket passe a `RESOLVED`, puis `CLOSED`.
16. La ressource repasse `AVAILABLE`.
17. Si non reparable, la ressource passe `RETIRED` ou `REPLACED`.
18. Le systeme notifie le demandeur et les responsables.
19. L'audit journalise les decisions.

## Statuts maintenance

- `REPORTED`
- `DIAGNOSIS`
- `IN_PROGRESS`
- `SUPPLIER_RETURN`
- `REPLACEMENT_REQUIRED`
- `RESOLVED`
- `REJECTED`
- `CANCELLED`
- `CLOSED`

## Validations cles

- Une ressource doit exister pour creer un ticket.
- Un diagnostic est obligatoire avant intervention.
- Une cloture exige un resultat.
- Un retour fournisseur exige un fournisseur associe.
- La ressource doit changer d'etat selon la decision finale.

## Sorties

- Ticket maintenance cloture ou suivi.
- Historique d'intervention.
- Ressource mise a jour.
- Notification envoyee.
- Trace d'audit complete.
