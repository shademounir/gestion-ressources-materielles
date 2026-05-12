# Exigences non fonctionnelles

## Securite

- Les acces doivent etre controles par authentification et autorisation.
- Les mots de passe doivent etre stockes de maniere securisee.
- Les droits doivent etre appliques selon les roles et responsabilites.
- Les donnees sensibles doivent etre protegees contre les acces non autorises.
- Les actions critiques doivent etre tracees.

## Performance

- Les pages principales doivent repondre dans un delai acceptable pour un usage administratif courant.
- Les recherches dans l'inventaire doivent rester fluides avec un volume croissant de ressources.
- Les traitements de liste doivent prevoir pagination, tri et filtrage.
- Les operations longues doivent pouvoir etre suivies par l'utilisateur.

## Disponibilite

- L'application doit etre disponible durant les heures d'activite de la faculte.
- Les erreurs applicatives doivent etre gerees sans interruption globale du service.
- Les operations critiques doivent eviter les pertes de donnees en cas d'echec partiel.

## Maintenabilite

- Le code futur devra etre organise en modules coherents.
- Les responsabilites techniques devront etre clairement separees.
- Les regles metier devront etre testables.
- La documentation devra evoluer avec les decisions d'architecture.
- Les conventions de nommage et de structure devront etre homogenes.

## Scalabilite

- L'architecture devra permettre l'ajout de nouveaux modules.
- Le modele de donnees devra pouvoir supporter plusieurs departements, fournisseurs et categories de ressources.
- Les fonctionnalites de recherche, filtrage et reporting devront rester extensibles.

## Observabilite

- Le systeme devra produire des logs exploitables pour le diagnostic.
- Les erreurs techniques devront etre identifiables et contextualisees.
- Les evenements importants devront pouvoir etre suivis.
- Des indicateurs pourront etre ajoutes pour mesurer l'usage et la qualite de service.

## Tracabilite

- Les changements d'etat des ressources devront etre historises.
- Les validations et refus devront conserver l'auteur et la date.
- Les affectations et maintenances devront etre auditables.
- Les traces devront permettre de reconstituer le cycle de vie d'une ressource.

## Conformite minimale

- Les donnees personnelles devront etre limitees au strict necessaire.
- Les utilisateurs devront disposer uniquement des acces utiles a leur role.
- Les journaux devront eviter de contenir des informations sensibles inutiles.
- Les procedures devront tenir compte des obligations internes de la faculte.

## Sauvegarde et rollback

- Les donnees importantes devront pouvoir etre sauvegardees regulierement.
- Une strategie de restauration devra etre definie avant la mise en production.
- Les migrations futures devront prevoir un mecanisme de retour arriere lorsque possible.
- Les deploiements devront pouvoir etre annules ou corriges rapidement en cas d'anomalie.
