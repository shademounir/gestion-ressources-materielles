# Database Architecture

## Objectif

La base de donnees cible est PostgreSQL, accedee via Prisma ORM. Le modele doit garantir la coherence des donnees, tracer les actions importantes et permettre l'evolution des modules.

## Entites principales

- User
- Role
- Department
- Supplier
- Tender
- SupplierOffer
- Resource
- Assignment
- MaintenanceTicket
- MaintenanceIntervention
- Notification
- AuditLog

## Relations principales

| Relation | Cardinalite |
| --- | --- |
| Role -> User | 1 role peut etre associe a plusieurs users |
| Department -> User | 1 departement peut contenir plusieurs users |
| Department -> Tender | 1 departement peut porter plusieurs besoins ou appels d'offres |
| Supplier -> SupplierOffer | 1 fournisseur peut soumettre plusieurs offres |
| Tender -> SupplierOffer | 1 appel d'offre peut recevoir plusieurs offres |
| Supplier -> Resource | 1 fournisseur peut fournir plusieurs ressources |
| Resource -> Assignment | 1 ressource peut avoir plusieurs affectations dans le temps |
| User -> Assignment | 1 utilisateur peut recevoir plusieurs affectations |
| Department -> Assignment | 1 departement peut recevoir plusieurs affectations |
| Resource -> MaintenanceTicket | 1 ressource peut avoir plusieurs tickets de maintenance |
| MaintenanceTicket -> MaintenanceIntervention | 1 ticket peut avoir plusieurs interventions |
| User -> Notification | 1 utilisateur peut recevoir plusieurs notifications |
| User -> AuditLog | 1 utilisateur peut produire plusieurs traces |

## Contraintes recommandees

- Email utilisateur unique.
- Nom de role unique.
- Nom de departement unique.
- Identifiant inventaire Resource unique.
- Tender reference unique.
- Une seule offre retenue par Tender.
- Une affectation active maximum par Resource.
- Les suppressions physiques doivent etre limitees.
- Les entites critiques doivent privilegier un statut actif/inactif.

## Statuts metier

Les statuts doivent etre modelises par enums afin d'eviter les valeurs libres.

- TenderStatus
- ResourceStatus
- AssignmentStatus
- MaintenanceTicketStatus
- NotificationStatus

## Regles de coherence

- Une ressource affectee ne peut pas etre affectee une seconde fois sans retour.
- Une ressource en maintenance ne peut pas etre affectee.
- Une offre ne peut etre retenue que si l'appel d'offre est publie ou cloture.
- Un ticket de maintenance ne peut etre cloture que si une decision finale est renseignee.
- Une notification doit avoir un destinataire.
- Une trace d'audit doit avoir une action, une date et une cible.

## Donnees temporelles

Chaque table importante doit prevoir :

- createdAt ;
- updatedAt ;
- createdBy lorsque pertinent ;
- deletedAt uniquement si soft delete necessaire.

## Index recommandees

- User.email
- Resource.inventoryCode
- Resource.status
- Tender.status
- SupplierOffer.tenderId
- Assignment.resourceId
- MaintenanceTicket.resourceId
- AuditLog.actorId
- AuditLog.createdAt
