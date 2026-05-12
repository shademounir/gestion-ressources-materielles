# Domain Model

## Entites

### User

Represente un utilisateur interne ou externe autorise.

Attributs principaux : id, email, passwordHash, firstName, lastName, status, roleId, departmentId, createdAt, updatedAt.

Relations :

- appartient a un Role ;
- peut appartenir a un Department ;
- peut recevoir des Assignments ;
- peut creer des AuditLogs ;
- peut recevoir des Notifications.

### Role

Represente un ensemble de permissions.

Attributs principaux : id, name, description, permissions, createdAt, updatedAt.

Relations :

- possede plusieurs Users.

### Department

Represente une entite organisationnelle de la faculte.

Attributs principaux : id, name, description, status, createdAt, updatedAt.

Relations :

- possede plusieurs Users ;
- peut recevoir plusieurs Assignments ;
- peut porter des besoins et demandes d'acquisition.

### Supplier

Represente un fournisseur.

Attributs principaux : id, name, contactEmail, phone, address, status, createdAt, updatedAt.

Relations :

- soumet plusieurs SupplierOffers ;
- fournit plusieurs Resources ;
- peut etre concerne par des retours maintenance.

### Tender

Represente un appel d'offre.

Attributs principaux : id, reference, title, description, status, deadline, departmentId, selectedOfferId, createdAt, updatedAt.

Relations :

- contient plusieurs SupplierOffers ;
- peut etre rattache a un Department ;
- peut avoir une offre retenue.

### SupplierOffer

Represente une proposition fournisseur.

Attributs principaux : id, tenderId, supplierId, amount, deliveryDelay, warranty, status, submittedAt.

Relations :

- appartient a un Tender ;
- appartient a un Supplier.

### Resource

Represente une ressource materielle inventoriee.

Attributs principaux : id, inventoryCode, name, category, status, location, supplierId, warrantyEndDate, createdAt, updatedAt.

Relations :

- peut venir d'un Supplier ;
- possede plusieurs Assignments ;
- possede plusieurs MaintenanceTickets.

### Assignment

Represente l'affectation d'une ressource.

Attributs principaux : id, resourceId, userId, departmentId, status, assignedAt, returnedAt, comment.

Relations :

- concerne une Resource ;
- peut concerner un User ou un Department.

### MaintenanceTicket

Represente un dossier de panne ou maintenance.

Attributs principaux : id, resourceId, reportedById, status, priority, description, diagnosis, decision, createdAt, closedAt.

Relations :

- concerne une Resource ;
- est signale par un User ;
- possede plusieurs MaintenanceInterventions.

### MaintenanceIntervention

Represente une action de maintenance.

Attributs principaux : id, ticketId, technicianId, type, status, startedAt, endedAt, result.

Relations :

- appartient a un MaintenanceTicket ;
- peut etre realisee par un technicien.

### Notification

Represente une notification destinee a un utilisateur.

Attributs principaux : id, recipientId, type, title, message, status, createdAt, readAt.

Relations :

- appartient a un User destinataire.

### AuditLog

Represente une trace d'action.

Attributs principaux : id, actorId, action, targetType, targetId, metadata, createdAt.

Relations :

- peut etre associe a un User acteur.

## Regles de coherence

- Un utilisateur desactive ne peut pas se connecter.
- Une ressource ne peut pas avoir deux affectations actives.
- Une ressource en maintenance est indisponible.
- Un appel d'offre attribue doit avoir une offre retenue.
- Une offre retenue doit appartenir a l'appel d'offre concerne.
- Une maintenance cloturee doit avoir une decision finale.
- Un audit log ne doit pas etre modifie par un utilisateur standard.

## Cardinalites detaillees

| Entite source | Relation | Entite cible | Cardinalite |
| --- | --- | --- | --- |
| Role | attribue a | User | 1..N |
| Department | regroupe | User | 0..N |
| Department | porte | Tender | 0..N |
| Supplier | soumet | SupplierOffer | 0..N |
| Tender | recoit | SupplierOffer | 0..N |
| Tender | retient | SupplierOffer | 0..1 |
| Supplier | fournit | Resource | 0..N |
| Resource | possede historique | Assignment | 0..N |
| User | beneficie de | Assignment | 0..N |
| Department | beneficie de | Assignment | 0..N |
| Resource | concerne | MaintenanceTicket | 0..N |
| MaintenanceTicket | contient | MaintenanceIntervention | 0..N |
| User | recoit | Notification | 0..N |
| User | produit | AuditLog | 0..N |

## Contraintes principales

- `User.email` doit etre unique.
- `Role.name` doit etre unique.
- `Department.name` doit etre unique.
- `Resource.inventoryCode` doit etre unique.
- `Tender.reference` doit etre unique.
- `SupplierOffer` doit etre unique par couple `tenderId` et `supplierId` si une seule offre active est autorisee.
- `Assignment` ne doit autoriser qu'une affectation active par ressource.
- `AuditLog` doit etre en ajout seul dans le comportement applicatif.

## Statuts par entite

- User : ACTIVE, INACTIVE, LOCKED.
- Supplier : ACTIVE, INACTIVE.
- Tender : DRAFT, PUBLISHED, CLOSED, AWARDED, CANCELLED, ARCHIVED.
- SupplierOffer : DRAFT, SUBMITTED, UNDER_REVIEW, ACCEPTED, REJECTED, WITHDRAWN, CANCELLED, ARCHIVED.
- Resource : AVAILABLE, ASSIGNED, MAINTENANCE, SUPPLIER_RETURN, REPLACED, RETIRED, ARCHIVED.
- Assignment : ACTIVE, RETURNED, CANCELLED, CLOSED.
- MaintenanceTicket : REPORTED, DIAGNOSIS, IN_PROGRESS, SUPPLIER_RETURN, REPLACEMENT_REQUIRED, RESOLVED, REJECTED, CANCELLED, CLOSED.
- Notification : UNREAD, READ, ARCHIVED.
