# Workflow Statuses

## Appels d'offres

| Statut | Description | Transitions autorisees |
| --- | --- | --- |
| DRAFT | Brouillon non publie | PUBLISHED, CANCELLED |
| PUBLISHED | Visible pour soumission | CLOSED, CANCELLED |
| CLOSED | Soumissions terminees | AWARDED, CANCELLED |
| AWARDED | Offre retenue | ARCHIVED |
| CANCELLED | Annule | ARCHIVED |
| ARCHIVED | Archive | Aucune |

Regles :

- Un appel d'offre ne peut pas etre publie sans criteres et date limite.
- Un appel d'offre ne peut pas etre attribue sans offre retenue.

## Offres fournisseurs

| Statut | Description | Transitions autorisees |
| --- | --- | --- |
| DRAFT | Offre en preparation | SUBMITTED, CANCELLED |
| SUBMITTED | Offre soumise | UNDER_REVIEW, WITHDRAWN |
| UNDER_REVIEW | Offre en analyse | ACCEPTED, REJECTED |
| ACCEPTED | Offre retenue | ARCHIVED |
| REJECTED | Offre non retenue | ARCHIVED |
| WITHDRAWN | Offre retiree par le fournisseur | ARCHIVED |
| CANCELLED | Offre annulee avant soumission | ARCHIVED |
| ARCHIVED | Archivee | Aucune |

Regles :

- Une offre ne peut etre soumise que pour un appel d'offre publie.
- Une seule offre peut etre `ACCEPTED` pour un appel d'offre attribue.
- Une offre retiree ne peut pas etre selectionnee.

## Ressources

| Statut | Description | Transitions autorisees |
| --- | --- | --- |
| AVAILABLE | Disponible | ASSIGNED, MAINTENANCE, RETIRED |
| ASSIGNED | Affectee | AVAILABLE, MAINTENANCE |
| MAINTENANCE | En maintenance | AVAILABLE, SUPPLIER_RETURN, RETIRED |
| SUPPLIER_RETURN | Retour fournisseur | AVAILABLE, REPLACED, RETIRED |
| REPLACED | Remplacee | ARCHIVED |
| RETIRED | Reformee | ARCHIVED |
| ARCHIVED | Archivee | Aucune |

Regles :

- Une ressource en maintenance ou retour fournisseur ne peut pas etre affectee.
- Une ressource archivee ne peut pas revenir dans le cycle actif.

## Affectations

| Statut | Description | Transitions autorisees |
| --- | --- | --- |
| ACTIVE | Affectation en cours | RETURNED, CANCELLED |
| RETURNED | Ressource retournee | CLOSED |
| CANCELLED | Affectation annulee | CLOSED |
| CLOSED | Cloturee | Aucune |

Regles :

- Une ressource ne peut avoir qu'une affectation ACTIVE.
- Une affectation retournee doit renseigner une date de retour.

## Maintenance

| Statut | Description | Transitions autorisees |
| --- | --- | --- |
| REPORTED | Panne signalee | DIAGNOSIS, CANCELLED |
| DIAGNOSIS | Diagnostic en cours | IN_PROGRESS, SUPPLIER_RETURN, REJECTED |
| IN_PROGRESS | Intervention en cours | RESOLVED, SUPPLIER_RETURN, REPLACEMENT_REQUIRED |
| SUPPLIER_RETURN | Retour fournisseur | RESOLVED, REPLACEMENT_REQUIRED |
| REPLACEMENT_REQUIRED | Remplacement necessaire | RESOLVED |
| RESOLVED | Resolution effectuee | CLOSED |
| REJECTED | Signalement non retenu | CLOSED |
| CANCELLED | Annule | CLOSED |
| CLOSED | Cloture | Aucune |

Regles :

- Un ticket cloture doit contenir un resultat.
- Une maintenance active rend la ressource indisponible.

## Notifications

| Statut | Description | Transitions autorisees |
| --- | --- | --- |
| UNREAD | Non lue | READ, ARCHIVED |
| READ | Lue | ARCHIVED |
| ARCHIVED | Archivee | Aucune |

Regles :

- Une notification doit toujours avoir un destinataire.
- Une notification systeme doit indiquer un type d'evenement.
