# Prisma Guidelines

## Objectif

Ce document definit les conventions Prisma ciblees pour garantir un schema lisible, coherent et maintenable.

## Naming

Modeles :

- utiliser PascalCase ;
- nom au singulier ;
- correspondre au vocabulaire metier.

Exemples :

```text
User
SupplierOffer
MaintenanceTicket
AuditLog
```

Champs :

- utiliser camelCase ;
- suffixer les cles etrangeres par `Id` ;
- utiliser des noms explicites.

Exemples :

```text
roleId
departmentId
resourceId
createdAt
updatedAt
```

## Enums

Les statuts metier doivent etre modelises par enums Prisma :

- UserStatus
- SupplierStatus
- TenderStatus
- SupplierOfferStatus
- ResourceStatus
- AssignmentStatus
- MaintenanceTicketStatus
- NotificationStatus

Regles :

- valeurs en UPPER_SNAKE_CASE ;
- transitions controlees par le service applicatif ;
- pas de statut libre sous forme string.

## Relations

Regles :

- definir explicitement les relations principales ;
- nommer les relations ambiguës ;
- eviter les relations circulaires non necessaires dans les DTO ;
- definir les comportements de suppression avec prudence.

Exemples de cardinalites :

- Role 1..N User ;
- Tender 1..N SupplierOffer ;
- Resource 1..N Assignment ;
- MaintenanceTicket 1..N MaintenanceIntervention.

## Soft delete strategy

Le soft delete est recommande pour les entites critiques :

- User ;
- Supplier ;
- Department ;
- Resource ;
- Tender.

Champ cible :

```text
deletedAt DateTime?
```

Regles :

- preferer `status` lorsque la notion metier est suffisante ;
- utiliser `deletedAt` pour masquer sans perdre l'historique ;
- ne pas soft-delete les AuditLogs.

## Timestamps

Champs standards :

```text
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
```

Ajouter si necessaire :

```text
createdById String?
updatedById String?
deletedAt DateTime?
```

## Migrations

Regles :

- une migration par changement coherent ;
- nom de migration explicite ;
- tester les migrations en staging ;
- eviter les migrations destructives sans sauvegarde ;
- documenter toute migration sensible.

Convention :

```text
add_resource_inventory_code
create_maintenance_ticket
add_assignment_status
```

## Contraintes

Contraintes recommandees :

- `User.email` unique ;
- `Role.name` unique ;
- `Department.name` unique ;
- `Resource.inventoryCode` unique ;
- `Tender.reference` unique ;
- index sur les statuts et dates de suivi.

## Indexes

Index prioritaires :

- `User.email` ;
- `Tender.status` ;
- `SupplierOffer.tenderId` ;
- `Resource.status` ;
- `Resource.inventoryCode` ;
- `Assignment.resourceId` ;
- `MaintenanceTicket.resourceId` ;
- `AuditLog.actorId` ;
- `AuditLog.createdAt`.

## Organisation schema.prisma

Ordre recommande :

1. datasource ;
2. generator ;
3. enums ;
4. modeles identite et securite ;
5. modeles organisation ;
6. modeles fournisseurs et appels d'offres ;
7. modeles ressources et affectations ;
8. modeles maintenance ;
9. modeles transverses : notifications et audit.

## Regles relations

- Une ressource ne peut avoir qu'une affectation active : regle applicative plus contrainte de verification si possible.
- Une offre retenue doit appartenir au Tender concerne.
- Une maintenance cloturee doit avoir un resultat.
- Les suppressions physiques doivent rester exceptionnelles.

## Strategie historique et audit

- Les changements critiques generent un AuditLog.
- Les affectations et interventions conservent leur historique.
- Les statuts ne doivent pas etre ecrases sans trace.
- Les exports ou lectures sensibles peuvent etre journalises si necessaire.
