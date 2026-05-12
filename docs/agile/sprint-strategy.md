# Strategie Sprint

## Cadence proposee

La strategie recommandee repose sur des sprints courts de 1 a 2 semaines. Chaque sprint doit produire un increment demonstrable, meme lorsque l'increment est documentaire ou architectural.

## Definition of Ready

Une user story est prete a entrer en sprint lorsque :

- l'objectif metier est compris ;
- les criteres d'acceptation sont explicites ;
- les dependances principales sont identifiees ;
- la complexite est estimee ;
- les risques sont connus ;
- la strategie de test est definie.

## Definition of Done

Une user story est terminee lorsque :

- le comportement attendu est realise ou documente selon la nature de la story ;
- les criteres d'acceptation sont verifies ;
- les tests prevus sont executes ou planifies ;
- la documentation impactee est mise a jour ;
- aucune regression critique connue ne reste ouverte ;
- la story est reliee a son epic Jira.

## Organisation par releases

### Sprint 0 - Initialisation Agile

Objectif : valider le backlog, les releases, la structure Jira et la strategie de travail.

Contenu :

- Product Backlog ;
- User Stories ;
- Releases Plan ;
- Sprint Strategy ;
- Dependencies Map ;
- Jira Structure.

### Sprint 1 - Socle securite et utilisateurs

Objectif : preparer l'implementation de la Release 1.

Contenu :

- authentification ;
- utilisateurs ;
- roles ;
- permissions ;
- premiers cas de test.

### Sprint 2 - Departements et besoins

Objectif : lancer les premiers flux metier internes.

Contenu :

- departements ;
- rattachement utilisateur ;
- expression des besoins ;
- validation initiale.

### Sprint 3 - Fournisseurs

Objectif : mettre en place le referentiel fournisseur.

Contenu :

- fournisseurs ;
- statut actif ou inactif ;
- historique fournisseur ;
- droits d'acces associes.

### Sprint 4 - Appels d'offres

Objectif : gerer le flux d'acquisition.

Contenu :

- creation appel d'offre ;
- publication ;
- offres fournisseurs ;
- selection fournisseur.

### Sprint 5 - Ressources et inventaire

Objectif : constituer l'inventaire central.

Contenu :

- ressources ;
- categories ;
- statuts ;
- localisation ;
- consultation inventaire.

### Sprint 6 - Affectations

Objectif : suivre l'usage des ressources.

Contenu :

- affectation ;
- retour ;
- historique ;
- notifications.

### Sprint 7 - Maintenance

Objectif : couvrir le cycle panne, diagnostic et intervention.

Contenu :

- signalement panne ;
- constat technique ;
- intervention ;
- retour fournisseur ;
- cloture.

### Sprint 8 - Qualite et securite

Objectif : consolider la solution avant finalisation.

Contenu :

- tests unitaires ;
- tests d'integration cibles ;
- controle des permissions ;
- audit ;
- correction des anomalies.

### Sprint 9 - CI/CD et soutenance

Objectif : finaliser la chaine de livraison et les livrables academiques.

Contenu :

- pipeline CI/CD ;
- Docker ;
- deploiement ;
- rapport final ;
- preparation demonstration.

## Strategie de revue

Chaque sprint se termine par :

- une demonstration des livrables ;
- une verification des criteres d'acceptation ;
- une revue des risques ;
- une mise a jour du backlog ;
- une retrospective courte.

## Gestion des anomalies

Les anomalies sont classees selon leur impact :

- bloquante : empeche un flux critique ;
- majeure : degrade une fonctionnalite importante ;
- mineure : gene l'utilisation sans bloquer ;
- amelioration : suggestion non urgente.

Les anomalies bloquantes et majeures doivent etre traitees avant la cloture de la release concernee.
