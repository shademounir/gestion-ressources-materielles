# Exigences fonctionnelles

## Authentification

- Le systeme doit permettre a un utilisateur de se connecter avec des identifiants valides.
- Le systeme doit permettre a un utilisateur de se deconnecter.
- Le systeme doit bloquer l'acces aux fonctionnalites protegees sans authentification.
- Le systeme doit permettre la reinitialisation controlee d'un mot de passe.

## Utilisateurs et roles

- Le systeme doit permettre la creation, modification, desactivation et consultation des utilisateurs.
- Le systeme doit associer un ou plusieurs roles a chaque utilisateur.
- Le systeme doit limiter les actions selon les permissions du role.
- Le systeme doit conserver l'historique des actions sensibles sur les comptes.

## Departements

- Le systeme doit permettre de gerer les departements de la faculte.
- Le systeme doit associer des utilisateurs a un departement.
- Le systeme doit permettre a un chef de departement de suivre les besoins de son departement.
- Le systeme doit permettre de consulter les ressources affectees a un departement.

## Fournisseurs

- Le systeme doit permettre de referencer les fournisseurs.
- Le systeme doit stocker les informations de contact et de suivi des fournisseurs.
- Le systeme doit conserver l'historique des offres et interventions liees a un fournisseur.
- Le systeme doit permettre d'activer ou desactiver un fournisseur.

## Appels d'offres

- Le systeme doit permettre de creer un appel d'offre a partir de besoins valides.
- Le systeme doit definir les criteres de selection d'un appel d'offre.
- Le systeme doit suivre les statuts d'un appel d'offre : brouillon, publie, cloture, attribue, annule.
- Le systeme doit associer les fournisseurs invites ou concernes.

## Offres fournisseurs

- Le systeme doit permettre d'enregistrer les offres soumises par les fournisseurs.
- Le systeme doit comparer les offres selon des criteres definis.
- Le systeme doit permettre la selection d'une offre retenue.
- Le systeme doit archiver les offres non retenues avec leur motif ou statut.

## Ressources materielles

- Le systeme doit permettre d'enregistrer une ressource dans l'inventaire.
- Le systeme doit attribuer un identifiant unique a chaque ressource.
- Le systeme doit suivre l'etat d'une ressource : disponible, affectee, en maintenance, retour fournisseur, reformee.
- Le systeme doit conserver les informations de garantie, fournisseur, categorie et localisation.

## Affectations

- Le systeme doit permettre d'affecter une ressource disponible a un utilisateur ou a un departement.
- Le systeme doit tracer la date, le beneficiaire et la localisation d'une affectation.
- Le systeme doit permettre le retour d'une ressource affectee.
- Le systeme doit conserver l'historique complet des affectations.

## Maintenance

- Le systeme doit permettre de signaler une panne.
- Le systeme doit creer une demande de maintenance a partir d'un signalement.
- Le systeme doit suivre le diagnostic, les interventions et les resultats.
- Le systeme doit permettre le retour fournisseur, la reparation ou le remplacement.
- Le systeme doit mettre a jour l'etat de la ressource selon l'avancement.

## Notifications

- Le systeme doit notifier les acteurs concernes lors des changements d'etat importants.
- Le systeme doit notifier les validations, refus, affectations, maintenances et retours fournisseurs.
- Le systeme doit permettre de consulter l'historique des notifications.
- Le systeme doit eviter les notifications redondantes ou non pertinentes.

## Audit et tracabilite

- Le systeme doit tracer les actions sensibles.
- Le systeme doit conserver l'auteur, la date, l'action et l'objet concerne.
- Le systeme doit permettre la consultation des traces par les profils autorises.
- Le systeme doit garantir que les traces critiques ne sont pas modifiables par les utilisateurs standards.
