# RBAC Matrix

## Roles

- ADM : Administrateur
- RES : Responsable des ressources
- HOD : Chef de departement
- TEA : Enseignant
- SUP : Fournisseur
- TEC : Technicien maintenance
- SYS : Systeme de notification

## Matrice des permissions

| Domaine / Action | ADM | RES | HOD | TEA | SUP | TEC | SYS |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Utilisateurs - lire | Oui | Non | Non | Non | Non | Non | Non |
| Utilisateurs - creer/modifier/desactiver | Oui | Non | Non | Non | Non | Non | Non |
| Roles - gerer | Oui | Non | Non | Non | Non | Non | Non |
| Departements - lire | Oui | Oui | Oui | Oui | Non | Oui | Non |
| Departements - gerer | Oui | Non | Non | Non | Non | Non | Non |
| Besoins - declarer | Non | Oui | Oui | Oui | Non | Non | Non |
| Besoins - valider/prioriser | Non | Oui | Oui | Non | Non | Non | Non |
| Fournisseurs - lire | Oui | Oui | Non | Non | Oui partiel | Non | Non |
| Fournisseurs - gerer | Non | Oui | Non | Non | Non | Non | Non |
| Appels d'offres - creer/publier | Non | Oui | Non | Non | Non | Non | Non |
| Appels d'offres - consulter | Oui | Oui | Oui | Non | Oui limite | Non | Non |
| Offres - soumettre | Non | Non | Non | Non | Oui | Non | Non |
| Offres - selectionner | Non | Oui | Non | Non | Non | Non | Non |
| Ressources - lire | Oui | Oui | Oui | Oui limite | Non | Oui | Non |
| Ressources - gerer | Non | Oui | Non | Non | Non | Non | Non |
| Affectations - creer/retour | Non | Oui | Non | Non | Non | Non | Non |
| Affectations - consulter | Oui | Oui | Oui | Oui limite | Non | Oui limite | Non |
| Maintenance - signaler | Non | Oui | Oui | Oui | Non | Oui | Non |
| Maintenance - diagnostiquer/intervenir | Non | Non | Non | Non | Non | Oui | Non |
| Maintenance - retour fournisseur | Non | Oui | Non | Non | Oui limite | Oui | Non |
| Notifications - consulter | Oui | Oui | Oui | Oui | Oui | Oui | Non |
| Notifications - emettre systeme | Non | Non | Non | Non | Non | Non | Oui |
| Audit - consulter | Oui | Oui limite | Non | Non | Non | Non | Non |

## Regles importantes

- Les roles frontend ne sont qu'un confort d'affichage.
- Toute permission critique est verifiee cote backend.
- Les actions sensibles doivent generer un AuditLog.
- Les permissions fournisseurs doivent rester limitees aux appels d'offres et retours qui les concernent.

## Evolutions possibles

- Ajouter des permissions fines par departement.
- Ajouter des roles composites.
- Ajouter une table Permission si le RBAC devient plus dynamique.
