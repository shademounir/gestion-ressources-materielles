# Security Architecture

## Objectif

La securite doit proteger les donnees, limiter les actions selon les responsabilites et assurer la tracabilite des operations sensibles.

## Authentification JWT

Strategie cible :

- access token court ;
- refresh token plus long ;
- rotation ou invalidation des refresh tokens ;
- deconnexion avec invalidation cote serveur lorsque possible ;
- stockage securise cote frontend selon le choix final d'implementation.

## RBAC

Les permissions sont basees sur les roles :

- Administrateur ;
- Responsable des ressources ;
- Chef de departement ;
- Enseignant ;
- Fournisseur ;
- Technicien maintenance ;
- Systeme de notification.

Le backend est la source d'autorisation. Le frontend applique uniquement un filtrage d'affichage.

## Protections API

- Guards d'authentification.
- Guards de roles.
- Validation DTO systematique.
- Limitation des donnees exposees.
- Gestion centralisee des erreurs.
- Protection contre les requetes invalides ou incompletes.
- Journalisation des tentatives sensibles.

## Validation des donnees

Chaque entree doit etre validee avant traitement :

- type ;
- format ;
- taille ;
- enum ;
- coherence fonctionnelle ;
- contraintes de dates.

## Audit logs

Les actions suivantes doivent etre tracees :

- connexion echouee ou comportement suspect ;
- creation, modification ou desactivation utilisateur ;
- changement de role ;
- publication ou attribution d'appel d'offre ;
- selection fournisseur ;
- changement d'etat d'une ressource ;
- affectation ou retour de ressource ;
- creation et cloture d'un ticket maintenance ;
- retour fournisseur ;
- action administrative.

## Gestion des permissions

Les permissions doivent etre declarees par domaine :

- lire ;
- creer ;
- modifier ;
- supprimer ou desactiver ;
- valider ;
- publier ;
- affecter ;
- cloturer ;
- consulter audit.

## Risques securite

- Permission trop large.
- Donnees sensibles exposees dans les reponses API.
- Token mal stocke cote frontend.
- Audit incomplet.
- Validation insuffisante des entrees.

## Mesures de mitigation

- Tests de permissions par role.
- Revue des endpoints critiques.
- DTO stricts.
- Masquage des champs sensibles.
- Logs sans secrets.
- Documentation Swagger securisee.
