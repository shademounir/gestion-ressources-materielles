# Acceptance Testing Strategy

## Objectif

Les tests d'acceptation valident que les scenarios metier repondent aux criteres du backlog et sont demonstrables en soutenance.

## Scenarios d'acceptation

### Authentification

- Un utilisateur valide se connecte.
- Un utilisateur inactif est refuse.
- Un role non autorise ne voit pas les actions reservees.

### Appel d'offre

- Un responsable cree un appel d'offre.
- Un fournisseur soumet une offre.
- Le responsable selectionne une offre unique.

### Ressource et affectation

- Une ressource est creee dans l'inventaire.
- Une ressource disponible est affectee.
- Une ressource affectee ne peut pas etre affectee une seconde fois.
- Une ressource retournee redevient disponible ou part en maintenance.

### Maintenance

- Une panne est signalee.
- Un technicien ajoute un constat.
- Une intervention est cloturee avec resultat.
- La ressource change d'etat selon la decision.

## Validation

- Chaque scenario doit etre rattache a une User Story Jira.
- Les preuves de test peuvent etre captures, logs ou demonstration.
- Les ecarts doivent creer des anomalies Jira.
