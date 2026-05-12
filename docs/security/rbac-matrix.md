# RBAC Matrix

## Roles couverts

- Administrateur
- Responsable ressources
- Chef de departement
- Enseignant
- Fournisseur
- Technicien maintenance

## Matrice des droits

| Domaine / Action | Administrateur | Responsable ressources | Chef departement | Enseignant | Fournisseur | Technicien maintenance |
| --- | --- | --- | --- | --- | --- | --- |
| Utilisateurs - lire | Oui | Non | Non | Non | Non | Non |
| Utilisateurs - creer/modifier/desactiver | Oui | Non | Non | Non | Non | Non |
| Roles - gerer | Oui | Non | Non | Non | Non | Non |
| Departements - lire | Oui | Oui | Oui | Oui | Non | Oui |
| Departements - gerer | Oui | Non | Non | Non | Non | Non |
| Besoins - declarer | Non | Oui | Oui | Oui | Non | Non |
| Besoins - valider/prioriser | Non | Oui | Oui | Non | Non | Non |
| Fournisseurs - lire | Oui | Oui | Non | Non | Oui partiel | Non |
| Fournisseurs - gerer | Non | Oui | Non | Non | Non | Non |
| Appels d'offres - creer/publier | Non | Oui | Non | Non | Non | Non |
| Appels d'offres - consulter | Oui | Oui | Oui | Non | Oui limite | Non |
| Offres - soumettre | Non | Non | Non | Non | Oui | Non |
| Offres - selectionner | Non | Oui | Non | Non | Non | Non |
| Ressources - lire | Oui | Oui | Oui | Oui limite | Non | Oui |
| Ressources - gerer | Non | Oui | Non | Non | Non | Non |
| Affectations - creer/retour | Non | Oui | Non | Non | Non | Non |
| Affectations - consulter | Oui | Oui | Oui | Oui limite | Non | Oui limite |
| Maintenance - signaler | Non | Oui | Oui | Oui | Non | Oui |
| Maintenance - diagnostiquer/intervenir | Non | Non | Non | Non | Non | Oui |
| Maintenance - retour fournisseur | Non | Oui | Non | Non | Oui limite | Oui |
| Notifications - consulter | Oui | Oui | Oui | Oui | Oui | Oui |
| Audit - consulter | Oui | Oui limite | Non | Non | Non | Non |

## Regles

- Le backend reste l'autorite finale.
- Les droits partiels doivent etre filtres par perimetre : departement, ressource ou appel d'offre concerne.
- Les actions critiques doivent produire une trace `AuditLog`.
- Toute evolution RBAC doit etre testee par role.
