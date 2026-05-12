# User Stories

## Convention

Format des identifiants : `US-<DOMAINE>-<NUMERO>`.

Echelle de complexite : XS, S, M, L, XL.

## EPIC-01 - Authentification et securite

### US-AUTH-01 - Connexion utilisateur

- Identifiant logique : US-AUTH-01
- Titre : Connexion utilisateur
- Description : En tant qu'utilisateur, je veux me connecter avec mes identifiants afin d'acceder aux fonctionnalites autorisees.
- Acteur concerne : tous les utilisateurs internes
- Criteres d'acceptation : connexion acceptee avec identifiants valides ; refus avec identifiants invalides ; message d'erreur clair ; acces limite apres connexion selon le role.
- Dependances : referentiel utilisateurs.
- Priorite : P0
- Estimation complexite : M
- Strategie de test : tests unitaires sur validation des identifiants ; tests d'integration sur scenario de connexion reussie et echouee.

### US-AUTH-02 - Deconnexion utilisateur

- Identifiant logique : US-AUTH-02
- Titre : Deconnexion utilisateur
- Description : En tant qu'utilisateur connecte, je veux me deconnecter afin de fermer ma session.
- Acteur concerne : tous les utilisateurs internes
- Criteres d'acceptation : session fermee ; retour vers l'ecran de connexion ; acces aux pages protegees refuse apres deconnexion.
- Dependances : US-AUTH-01.
- Priorite : P0
- Estimation complexite : S
- Strategie de test : test fonctionnel de fin de session ; test de protection apres deconnexion.

### US-AUTH-03 - Protection des acces

- Identifiant logique : US-AUTH-03
- Titre : Protection des fonctionnalites par role
- Description : En tant qu'administrateur, je veux que chaque fonctionnalite soit protegee selon les roles afin d'eviter les actions non autorisees.
- Acteur concerne : administrateur
- Criteres d'acceptation : acces autorise pour les roles prevus ; acces refuse pour les roles non autorises ; tentative refusee tracee.
- Dependances : US-AUTH-01, US-USER-02.
- Priorite : P0
- Estimation complexite : L
- Strategie de test : tests unitaires des permissions ; tests d'integration par role.

## EPIC-02 - Gestion utilisateurs et roles

### US-USER-01 - Creation utilisateur

- Identifiant logique : US-USER-01
- Titre : Creer un utilisateur
- Description : En tant qu'administrateur, je veux creer un compte utilisateur afin de donner acces au systeme a un acteur autorise.
- Acteur concerne : administrateur
- Criteres d'acceptation : creation avec informations obligatoires ; refus si email deja utilise ; utilisateur cree avec statut actif ou inactif.
- Dependances : aucune.
- Priorite : P0
- Estimation complexite : M
- Strategie de test : tests unitaires de validation ; test d'integration de creation.

### US-USER-02 - Attribution de roles

- Identifiant logique : US-USER-02
- Titre : Attribuer un role a un utilisateur
- Description : En tant qu'administrateur, je veux attribuer un role afin d'accorder les permissions adaptees.
- Acteur concerne : administrateur
- Criteres d'acceptation : role selectionnable ; permissions appliquees ; modification tracee.
- Dependances : US-USER-01.
- Priorite : P0
- Estimation complexite : M
- Strategie de test : tests unitaires sur mapping role-permissions ; test d'integration d'acces par role.

### US-USER-03 - Desactivation utilisateur

- Identifiant logique : US-USER-03
- Titre : Desactiver un utilisateur
- Description : En tant qu'administrateur, je veux desactiver un compte afin d'empecher un ancien utilisateur d'acceder au systeme.
- Acteur concerne : administrateur
- Criteres d'acceptation : compte desactive ; connexion impossible ; historique conserve ; ressources ou demandes associees non supprimees.
- Dependances : US-USER-01, US-AUTH-01.
- Priorite : P1
- Estimation complexite : M
- Strategie de test : test de connexion refusee ; test de conservation des donnees liees.

## EPIC-03 - Gestion departements

### US-DEPT-01 - Creation departement

- Identifiant logique : US-DEPT-01
- Titre : Creer un departement
- Description : En tant qu'administrateur, je veux creer un departement afin de representer l'organisation de la faculte.
- Acteur concerne : administrateur
- Criteres d'acceptation : nom obligatoire ; nom unique ; departement consultable apres creation.
- Dependances : US-AUTH-03.
- Priorite : P1
- Estimation complexite : S
- Strategie de test : tests unitaires de validation ; test d'integration CRUD.

### US-DEPT-02 - Rattachement utilisateur

- Identifiant logique : US-DEPT-02
- Titre : Rattacher un utilisateur a un departement
- Description : En tant qu'administrateur, je veux rattacher un utilisateur a un departement afin de consolider les demandes et affectations.
- Acteur concerne : administrateur
- Criteres d'acceptation : utilisateur rattache ; modification visible dans la fiche utilisateur ; historique conserve.
- Dependances : US-USER-01, US-DEPT-01.
- Priorite : P1
- Estimation complexite : M
- Strategie de test : test relation utilisateur-departement ; test de modification.

### US-DEPT-03 - Expression d'un besoin departemental

- Identifiant logique : US-DEPT-03
- Titre : Declarer un besoin departemental
- Description : En tant que chef de departement, je veux declarer un besoin materiel afin de demander une acquisition.
- Acteur concerne : chef de departement
- Criteres d'acceptation : type, quantite, justification et priorite obligatoires ; statut initial cree ; demande consultable.
- Dependances : US-DEPT-01, US-AUTH-03.
- Priorite : P1
- Estimation complexite : M
- Strategie de test : tests de validation formulaire ; test d'etat initial.

## EPIC-04 - Gestion fournisseurs

### US-SUP-01 - Referencer un fournisseur

- Identifiant logique : US-SUP-01
- Titre : Ajouter un fournisseur
- Description : En tant que responsable des ressources, je veux referencer un fournisseur afin de pouvoir le solliciter.
- Acteur concerne : responsable des ressources
- Criteres d'acceptation : informations obligatoires renseignees ; fournisseur actif par defaut ; doublon evite.
- Dependances : US-AUTH-03.
- Priorite : P1
- Estimation complexite : M
- Strategie de test : tests unitaires de validation ; test d'ajout et consultation.

### US-SUP-02 - Consulter l'historique fournisseur

- Identifiant logique : US-SUP-02
- Titre : Consulter l'historique d'un fournisseur
- Description : En tant que responsable des ressources, je veux consulter les offres et interventions liees a un fournisseur afin d'evaluer sa fiabilite.
- Acteur concerne : responsable des ressources
- Criteres d'acceptation : offres affichees ; interventions affichees ; donnees filtrees par fournisseur.
- Dependances : US-SUP-01, US-TEND-03, US-MAINT-04.
- Priorite : P2
- Estimation complexite : M
- Strategie de test : test de recuperation historique ; test de filtrage.

### US-SUP-03 - Desactiver un fournisseur

- Identifiant logique : US-SUP-03
- Titre : Desactiver un fournisseur
- Description : En tant que responsable des ressources, je veux desactiver un fournisseur afin de ne plus l'utiliser dans de nouveaux appels d'offres.
- Acteur concerne : responsable des ressources
- Criteres d'acceptation : fournisseur inactif ; non proposable dans les nouveaux appels d'offres ; historique conserve.
- Dependances : US-SUP-01.
- Priorite : P2
- Estimation complexite : S
- Strategie de test : test statut inactif ; test exclusion selection.

## EPIC-05 - Gestion appels d'offres

### US-TEND-01 - Creer un appel d'offre

- Identifiant logique : US-TEND-01
- Titre : Creer un appel d'offre
- Description : En tant que responsable des ressources, je veux creer un appel d'offre afin de consulter les fournisseurs.
- Acteur concerne : responsable des ressources
- Criteres d'acceptation : objet, besoins, criteres et date limite renseignes ; statut brouillon ; rattachement possible aux besoins valides.
- Dependances : US-DEPT-03, US-SUP-01.
- Priorite : P1
- Estimation complexite : L
- Strategie de test : tests de validation ; test de creation avec besoins rattaches.

### US-TEND-02 - Publier un appel d'offre

- Identifiant logique : US-TEND-02
- Titre : Publier un appel d'offre
- Description : En tant que responsable des ressources, je veux publier un appel d'offre afin de le rendre accessible aux fournisseurs concernes.
- Acteur concerne : responsable des ressources
- Criteres d'acceptation : seuls les appels complets sont publiables ; statut publie ; fournisseurs notifiables.
- Dependances : US-TEND-01, US-NOTIF-01.
- Priorite : P1
- Estimation complexite : M
- Strategie de test : test transition statut ; test blocage si informations incompletes.

### US-TEND-03 - Enregistrer une offre fournisseur

- Identifiant logique : US-TEND-03
- Titre : Enregistrer une offre fournisseur
- Description : En tant que responsable des ressources, je veux enregistrer une offre afin de comparer les propositions recues.
- Acteur concerne : responsable des ressources
- Criteres d'acceptation : fournisseur associe ; montant, delai, garantie et description renseignes ; offre rattachee a l'appel d'offre.
- Dependances : US-TEND-02, US-SUP-01.
- Priorite : P1
- Estimation complexite : M
- Strategie de test : test association offre-appel d'offre ; test validation champs.

### US-TEND-04 - Selectionner une offre

- Identifiant logique : US-TEND-04
- Titre : Selectionner une offre fournisseur
- Description : En tant que responsable des ressources, je veux selectionner l'offre retenue afin de finaliser l'acquisition.
- Acteur concerne : responsable des ressources
- Criteres d'acceptation : une seule offre retenue ; justification saisie ; appel d'offre attribue ; offres non retenues archivees.
- Dependances : US-TEND-03.
- Priorite : P1
- Estimation complexite : L
- Strategie de test : test unicite offre retenue ; test transition statut ; test audit.

## EPIC-06 - Gestion ressources materielles

### US-RES-01 - Enregistrer une ressource

- Identifiant logique : US-RES-01
- Titre : Enregistrer une ressource materielle
- Description : En tant que responsable des ressources, je veux enregistrer une ressource afin de l'integrer a l'inventaire.
- Acteur concerne : responsable des ressources
- Criteres d'acceptation : identifiant unique ; categorie, etat, localisation et fournisseur renseignes ; ressource consultable.
- Dependances : US-SUP-01.
- Priorite : P0
- Estimation complexite : L
- Strategie de test : test generation identifiant ; test validation inventaire.

### US-RES-02 - Consulter l'inventaire

- Identifiant logique : US-RES-02
- Titre : Consulter l'inventaire
- Description : En tant que responsable des ressources, je veux consulter l'inventaire afin de connaitre les ressources disponibles et leur etat.
- Acteur concerne : responsable des ressources
- Criteres d'acceptation : liste paginee ; filtre par categorie, statut et departement ; detail accessible.
- Dependances : US-RES-01.
- Priorite : P0
- Estimation complexite : M
- Strategie de test : tests de filtrage ; test pagination ; test consultation detail.

### US-RES-03 - Modifier l'etat d'une ressource

- Identifiant logique : US-RES-03
- Titre : Modifier l'etat d'une ressource
- Description : En tant que responsable des ressources, je veux mettre a jour l'etat d'une ressource afin de refleter sa disponibilite.
- Acteur concerne : responsable des ressources
- Criteres d'acceptation : etats autorises controles ; changement trace ; historique conserve.
- Dependances : US-RES-01, US-AUDIT-01.
- Priorite : P1
- Estimation complexite : M
- Strategie de test : test transitions autorisees ; test trace d'audit.

## EPIC-07 - Gestion affectations

### US-ASSIGN-01 - Affecter une ressource

- Identifiant logique : US-ASSIGN-01
- Titre : Affecter une ressource disponible
- Description : En tant que responsable des ressources, je veux affecter une ressource a un utilisateur ou departement afin d'en suivre l'utilisation.
- Acteur concerne : responsable des ressources
- Criteres d'acceptation : seule une ressource disponible est affectable ; beneficiaire obligatoire ; statut ressource mis a jour ; historique cree.
- Dependances : US-RES-01, US-DEPT-01, US-USER-01.
- Priorite : P1
- Estimation complexite : L
- Strategie de test : test indisponibilite apres affectation ; test historique.

### US-ASSIGN-02 - Retourner une ressource

- Identifiant logique : US-ASSIGN-02
- Titre : Enregistrer le retour d'une ressource
- Description : En tant que responsable des ressources, je veux enregistrer le retour d'une ressource afin de la rendre disponible ou de signaler un probleme.
- Acteur concerne : responsable des ressources
- Criteres d'acceptation : affectation cloturee ; etat ressource mis a jour ; commentaire possible ; historique conserve.
- Dependances : US-ASSIGN-01.
- Priorite : P1
- Estimation complexite : M
- Strategie de test : test cloture affectation ; test remise a disposition.

### US-ASSIGN-03 - Consulter l'historique d'affectation

- Identifiant logique : US-ASSIGN-03
- Titre : Consulter l'historique d'affectation
- Description : En tant que responsable des ressources, je veux consulter l'historique d'une ressource afin de connaitre ses utilisations successives.
- Acteur concerne : responsable des ressources
- Criteres d'acceptation : historique chronologique ; beneficiaires affiches ; dates d'affectation et retour visibles.
- Dependances : US-ASSIGN-01.
- Priorite : P2
- Estimation complexite : M
- Strategie de test : test ordre chronologique ; test exhaustivite historique.

## EPIC-08 - Gestion maintenance

### US-MAINT-01 - Signaler une panne

- Identifiant logique : US-MAINT-01
- Titre : Signaler une panne
- Description : En tant qu'enseignant, je veux signaler une panne afin qu'une ressource defectueuse soit prise en charge.
- Acteur concerne : enseignant
- Criteres d'acceptation : ressource identifiee ; description obligatoire ; niveau d'urgence renseignable ; dossier cree.
- Dependances : US-RES-01, US-AUTH-03.
- Priorite : P1
- Estimation complexite : M
- Strategie de test : test creation signalement ; test champs obligatoires.

### US-MAINT-02 - Rediger un constat technique

- Identifiant logique : US-MAINT-02
- Titre : Rediger un constat technique
- Description : En tant que technicien maintenance, je veux renseigner un diagnostic afin de decider du traitement adapte.
- Acteur concerne : technicien maintenance
- Criteres d'acceptation : diagnostic obligatoire ; statut mis a jour ; decision initiale indiquee.
- Dependances : US-MAINT-01.
- Priorite : P1
- Estimation complexite : M
- Strategie de test : test transition vers diagnostic ; test conservation du constat.

### US-MAINT-03 - Suivre une intervention

- Identifiant logique : US-MAINT-03
- Titre : Suivre une intervention de maintenance
- Description : En tant que technicien maintenance, je veux suivre une intervention afin de connaitre son avancement et son resultat.
- Acteur concerne : technicien maintenance
- Criteres d'acceptation : statut intervention ; dates de debut et fin ; resultat renseigne ; ressource mise a jour.
- Dependances : US-MAINT-02.
- Priorite : P1
- Estimation complexite : L
- Strategie de test : test cycle de vie maintenance ; test mise a jour etat ressource.

### US-MAINT-04 - Gerer un retour fournisseur

- Identifiant logique : US-MAINT-04
- Titre : Gerer un retour fournisseur
- Description : En tant que responsable des ressources, je veux creer un retour fournisseur afin de suivre une reparation ou un remplacement externe.
- Acteur concerne : responsable des ressources
- Criteres d'acceptation : fournisseur associe ; motif renseigne ; statut retour suivi ; decision finale tracee.
- Dependances : US-MAINT-02, US-SUP-01.
- Priorite : P2
- Estimation complexite : L
- Strategie de test : test creation retour ; test cloture par reparation ou remplacement.

## EPIC-09 - Notifications et tracabilite

### US-NOTIF-01 - Notification de changement d'etat

- Identifiant logique : US-NOTIF-01
- Titre : Notifier un changement d'etat
- Description : En tant qu'utilisateur concerne, je veux etre notifie lorsqu'une demande ou une ressource change d'etat afin de rester informe.
- Acteur concerne : utilisateurs concernes
- Criteres d'acceptation : notification creee lors d'un changement important ; destinataire coherent ; notification consultable.
- Dependances : modules declencheurs.
- Priorite : P1
- Estimation complexite : M
- Strategie de test : test creation notification ; test destinataire.

### US-AUDIT-01 - Journaliser les actions sensibles

- Identifiant logique : US-AUDIT-01
- Titre : Journaliser les actions sensibles
- Description : En tant qu'administrateur, je veux consulter les traces des actions sensibles afin d'assurer la responsabilite des acteurs.
- Acteur concerne : administrateur
- Criteres d'acceptation : auteur, date, action et objet traces ; consultation reservee aux roles autorises ; traces non modifiables par utilisateurs standards.
- Dependances : US-AUTH-03.
- Priorite : P0
- Estimation complexite : L
- Strategie de test : test generation trace ; test autorisation lecture.

### US-NOTIF-02 - Consulter ses notifications

- Identifiant logique : US-NOTIF-02
- Titre : Consulter ses notifications
- Description : En tant qu'utilisateur, je veux consulter mes notifications afin de suivre les evenements qui me concernent.
- Acteur concerne : tous les utilisateurs internes
- Criteres d'acceptation : liste des notifications personnelles ; statut lu ou non lu ; tri chronologique.
- Dependances : US-NOTIF-01.
- Priorite : P2
- Estimation complexite : M
- Strategie de test : test isolation par utilisateur ; test marquage lu.

## EPIC-10 - Tests qualite

### US-TEST-01 - Strategie de tests unitaires

- Identifiant logique : US-TEST-01
- Titre : Definir la strategie de tests unitaires
- Description : En tant qu'equipe projet, je veux definir les regles de tests unitaires afin de garantir les comportements critiques.
- Acteur concerne : equipe projet
- Criteres d'acceptation : conventions de nommage ; criteres de couverture ; priorite sur regles metier critiques.
- Dependances : cadrage technique.
- Priorite : P0
- Estimation complexite : S
- Strategie de test : revue documentaire ; validation par l'equipe.

### US-TEST-02 - Couvrir les regles metier critiques

- Identifiant logique : US-TEST-02
- Titre : Tester les regles metier critiques
- Description : En tant qu'equipe projet, je veux tester les validations et transitions d'etat afin de limiter les regressions.
- Acteur concerne : equipe projet
- Criteres d'acceptation : cas nominaux ; cas d'erreur ; transitions d'etat couvertes.
- Dependances : modules fonctionnels implementes.
- Priorite : P0
- Estimation complexite : L
- Strategie de test : tests unitaires automatises et tests d'integration cibles.

## EPIC-11 - CI/CD et deploiement

### US-CICD-01 - Pipeline de verification

- Identifiant logique : US-CICD-01
- Titre : Automatiser les verifications
- Description : En tant qu'equipe projet, je veux lancer automatiquement les tests et controles qualite afin de securiser les changements.
- Acteur concerne : equipe projet
- Criteres d'acceptation : pipeline declenche sur changement ; tests executes ; resultat visible.
- Dependances : US-TEST-01, structure technique.
- Priorite : P2 puis P0 en Release 8
- Estimation complexite : M
- Strategie de test : execution volontaire du pipeline ; verification des echecs et succes.

### US-CICD-02 - Strategie de deploiement

- Identifiant logique : US-CICD-02
- Titre : Definir le deploiement cible
- Description : En tant qu'equipe projet, je veux definir une strategie de deploiement afin de livrer l'application de maniere reproductible.
- Acteur concerne : equipe projet
- Criteres d'acceptation : environnement cible documente ; variables identifiees ; rollback decrit.
- Dependances : architecture stabilisee.
- Priorite : P2
- Estimation complexite : M
- Strategie de test : revue documentaire ; simulation de scenario de livraison.

## EPIC-12 - Documentation et rapport final

### US-DOC-01 - Documenter l'architecture

- Identifiant logique : US-DOC-01
- Titre : Documenter l'architecture logicielle
- Description : En tant qu'equipe projet, je veux documenter l'architecture afin d'expliquer les choix techniques et fonctionnels.
- Acteur concerne : equipe projet
- Criteres d'acceptation : diagrammes prevus ; decisions argumentees ; liens avec les exigences.
- Dependances : cadrage, backlog, choix techniques.
- Priorite : P1
- Estimation complexite : M
- Strategie de test : revue croisee ; coherence avec implementation future.

### US-DOC-02 - Prepararer le rapport final

- Identifiant logique : US-DOC-02
- Titre : Preparer le rapport final
- Description : En tant qu'equipe projet, je veux produire un rapport final afin de presenter la demarche, les choix, les tests et la CI/CD.
- Acteur concerne : equipe projet
- Criteres d'acceptation : contexte ; architecture ; backlog ; tests ; CI/CD ; bilan et limites.
- Dependances : toutes les releases.
- Priorite : P1
- Estimation complexite : L
- Strategie de test : revue finale ; controle de coherence avec les livrables.
