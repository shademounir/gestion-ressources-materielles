# Cadrage du projet

## Contexte

Une faculte dispose de nombreuses ressources materielles : ordinateurs, imprimantes, videoprojecteurs, equipements reseau, mobilier technique, materiel de laboratoire et autres biens necessaires au fonctionnement des departements.

La gestion de ces ressources implique plusieurs acteurs : administration, responsables de ressources, chefs de departement, enseignants, fournisseurs et techniciens de maintenance. Sans outil centralise, le suivi des besoins, achats, affectations et maintenances devient difficile a piloter.

## Problematique

La faculte a besoin d'un systeme permettant de centraliser les demandes, l'acquisition, l'inventaire, l'affectation et la maintenance des ressources materielles. Le systeme doit ameliorer la tracabilite, reduire les pertes d'information et faciliter la prise de decision.

## Objectifs

- Centraliser les informations relatives aux ressources materielles.
- Formaliser le processus d'expression et de validation des besoins.
- Suivre les appels d'offres et les propositions fournisseurs.
- Maintenir un inventaire fiable et exploitable.
- Gerer les affectations de ressources.
- Suivre les pannes, maintenances, retours fournisseurs et remplacements.
- Fournir une base solide pour les travaux d'architecture, de tests et de CI/CD.

## Perimetre inclus

- Gestion des utilisateurs, roles et droits.
- Gestion des departements.
- Expression et suivi des besoins.
- Gestion des fournisseurs.
- Gestion des appels d'offres et offres fournisseurs.
- Gestion des ressources materielles.
- Inventaire et etat des ressources.
- Affectation des ressources.
- Signalement et suivi des pannes.
- Maintenance interne ou externe.
- Notifications metier.
- Audit et tracabilite des actions importantes.

## Perimetre exclu

- Gestion comptable complete.
- Paiement en ligne des fournisseurs.
- Integration avec un ERP existant.
- Gestion RH avancee.
- Gestion detaillee des contrats juridiques.
- Application mobile native.
- Supervision temps reel des equipements connectes.

## Hypotheses

- Les utilisateurs disposent d'un acces web a l'application.
- Les roles et responsabilites sont clairement definis par la faculte.
- Les departements expriment leurs besoins dans un format normalise.
- Les fournisseurs sont identifies et references dans le systeme.
- Les decisions d'achat suivent un circuit de validation interne.
- Les donnees sensibles doivent etre protegees par des controles d'acces.

## Risques initiaux

- Perimetre fonctionnel trop large pour une premiere version.
- Regles metier insuffisamment precisees.
- Donnees d'inventaire incompletes ou non fiables au demarrage.
- Difficultes a modeliser les workflows de validation.
- Confusion entre gestion pedagogique du projet et besoins reels de production.
- Sous-estimation des exigences de securite et de tracabilite.
