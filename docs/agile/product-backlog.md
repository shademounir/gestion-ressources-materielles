# Product Backlog

## Vue d'ensemble

Ce backlog structure le projet "Gestion des Ressources Materielles" autour des epics Jira existants du projet SCRUM. Il sert de reference fonctionnelle pour planifier les releases, preparer les sprints, prioriser les travaux et aligner les livrables avec les modules Architecture logicielle, Tests unitaires et CI/CD.

## Principes de priorisation

- Priorite P0 : indispensable pour construire le socle fonctionnel ou securitaire.
- Priorite P1 : forte valeur metier, necessaire pour une version exploitable.
- Priorite P2 : utile pour enrichir l'experience ou couvrir des cas avances.
- Priorite P3 : amelioration ou optimisation non bloquante.

## Backlog par epic

### EPIC-01 - Authentification et securite

Objectif metier : garantir que seuls les utilisateurs autorises accedent aux fonctionnalites du systeme.

Description fonctionnelle : l'epic couvre la connexion, la deconnexion, la protection des routes, la gestion de session, les regles de mot de passe et les controles de securite de base.

Dependances : aucune dependance fonctionnelle bloquante, mais dependance conceptuelle avec la gestion des utilisateurs et roles.

Risques : mauvaise gestion des permissions, exposition de donnees sensibles, sessions non maitrisees.

Priorisation : P0.

Valeur metier : conditionne la confiance, la confidentialite et l'utilisation professionnelle de l'application.

### EPIC-02 - Gestion utilisateurs et roles

Objectif metier : administrer les comptes et les responsabilites des acteurs de la faculte.

Description fonctionnelle : creation, modification, desactivation et consultation des utilisateurs, attribution de roles et application des droits.

Dependances : authentification et securite.

Risques : roles trop larges, incoherence entre responsabilites reelles et droits applicatifs.

Priorisation : P0.

Valeur metier : permet un pilotage clair des responsabilites et un acces controle aux donnees.

### EPIC-03 - Gestion departements

Objectif metier : representer l'organisation interne de la faculte.

Description fonctionnelle : gestion des departements, rattachement des utilisateurs, suivi des besoins et des ressources par departement.

Dependances : utilisateurs et roles.

Risques : modele organisationnel incomplet, departements mal rattaches, donnees difficiles a consolider.

Priorisation : P1.

Valeur metier : permet de relier les demandes et ressources a une structure administrative identifiable.

### EPIC-04 - Gestion fournisseurs

Objectif metier : centraliser les informations des fournisseurs et leur historique.

Description fonctionnelle : referencement, consultation, mise a jour, activation et desactivation des fournisseurs.

Dependances : utilisateurs et roles pour les permissions.

Risques : donnees fournisseur incompletes, doublons, faible tracabilite des relations commerciales.

Priorisation : P1.

Valeur metier : facilite les achats, les comparaisons d'offres et le suivi des garanties.

### EPIC-05 - Gestion appels d'offres

Objectif metier : structurer le processus d'acquisition de ressources materielles.

Description fonctionnelle : creation d'appels d'offres, publication, reception des offres, comparaison et selection fournisseur.

Dependances : departements, besoins, fournisseurs.

Risques : workflow de validation trop complexe, criteres de selection mal definis, manque de tracabilite.

Priorisation : P1.

Valeur metier : renforce la transparence et la justification des decisions d'achat.

### EPIC-06 - Gestion ressources materielles

Objectif metier : disposer d'un inventaire fiable des ressources de la faculte.

Description fonctionnelle : enregistrement des ressources, categories, etats, localisation, garantie, fournisseur et historique.

Dependances : fournisseurs, appels d'offres pour les ressources acquises.

Risques : inventaire incomplet, statuts incoherents, absence d'identifiant unique.

Priorisation : P0.

Valeur metier : constitue le coeur de l'application et du pilotage materiel.

### EPIC-07 - Gestion affectations

Objectif metier : suivre l'utilisation des ressources par departement, enseignant ou service.

Description fonctionnelle : affectation, retour, historique et disponibilite des ressources.

Dependances : ressources materielles, departements, utilisateurs.

Risques : affectations sans retour, conflits de disponibilite, perte de tracabilite.

Priorisation : P1.

Valeur metier : ameliore la responsabilisation et la visibilite sur l'usage du materiel.

### EPIC-08 - Gestion maintenance

Objectif metier : suivre les pannes, diagnostics, interventions et decisions de reparation ou remplacement.

Description fonctionnelle : signalement panne, creation de dossier maintenance, constat technique, intervention, retour fournisseur et cloture.

Dependances : ressources materielles, fournisseurs, utilisateurs, notifications.

Risques : statuts maintenance incomplets, delais non suivis, ressources bloquees sans decision.

Priorisation : P1.

Valeur metier : reduit l'indisponibilite des ressources et documente les incidents.

### EPIC-09 - Notifications et tracabilite

Objectif metier : informer les acteurs et conserver l'historique des actions importantes.

Description fonctionnelle : notifications applicatives, journal d'audit, suivi des changements d'etat et consultation des traces.

Dependances : authentification, utilisateurs, ressources, maintenance et appels d'offres.

Risques : surcharge de notifications, traces insuffisantes ou trop verbeuses.

Priorisation : P1.

Valeur metier : ameliore la coordination et fournit des preuves de suivi.

### EPIC-10 - Tests qualite

Objectif metier : garantir la fiabilite des regles critiques et soutenir la soutenance academique.

Description fonctionnelle : strategie de tests, tests unitaires, tests d'integration, couverture progressive et criteres qualite.

Dependances : premiers modules fonctionnels implementes.

Risques : tests tardifs, scenarios incomplets, faible couverture des cas metier.

Priorisation : P0 a partir de la Release 1.

Valeur metier : reduit les regressions et demontre une demarche professionnelle.

### EPIC-11 - CI/CD et deploiement

Objectif metier : automatiser les controles et preparer une livraison reproductible.

Description fonctionnelle : pipeline CI, controles qualite, packaging, deploiement cible et rollback.

Dependances : structure technique, tests, configuration applicative.

Risques : automatisation prematuree, pipeline instable, ecart entre environnement local et cible.

Priorisation : P2 jusqu'a stabilisation fonctionnelle, puis P0 en Release 8.

Valeur metier : assure la reproductibilite et la qualite de livraison.

### EPIC-12 - Documentation et rapport final

Objectif metier : produire une documentation utile au pilotage, a la maintenance et a la soutenance.

Description fonctionnelle : documentation projet, diagrammes, decisions d'architecture, guide utilisateur, rapport final.

Dependances : toutes les releases alimentent la documentation.

Risques : documentation decalee du reel, manque de coherence entre code, tests et livrables.

Priorisation : P1 en continu.

Valeur metier : facilite la comprehension du projet et valorise la demarche professionnelle.

## Synthese de valeur

Le backlog est organise pour livrer d'abord un socle securise et administrable, puis les flux metier principaux : departements, besoins, fournisseurs, appels d'offres, ressources, affectations et maintenance. Les tests, la qualite, la documentation et la CI/CD accompagnent progressivement la construction afin de soutenir les objectifs pedagogiques et professionnels.
