# Audit Strategy

## Objectif

L'audit assure la tracabilite des decisions, changements d'etat et actions sensibles du systeme.

## Actions a journaliser

- Connexion echouee ou tentative suspecte.
- Creation, modification ou desactivation utilisateur.
- Changement de role.
- Publication d'un appel d'offre.
- Selection d'une offre fournisseur.
- Creation ou modification d'une ressource.
- Changement d'etat d'une ressource.
- Affectation et retour de ressource.
- Signalement, diagnostic et cloture maintenance.
- Retour fournisseur.
- Consultation ou export sensible.

## Structure AuditLog

- id
- actorId
- action
- targetType
- targetId
- metadata
- createdAt
- ipAddress si disponible
- userAgent si disponible

## Regles

- Les traces doivent etre append-only au niveau applicatif.
- Les donnees sensibles ne doivent pas etre stockees en clair dans `metadata`.
- Les utilisateurs standards ne peuvent pas modifier ou supprimer les traces.
- Les administrateurs peuvent consulter les traces selon leur perimetre.

## Exploitation

- Filtrer par acteur.
- Filtrer par type de cible.
- Filtrer par date.
- Filtrer par action critique.
- Utiliser l'audit pour expliquer les decisions en soutenance.
