# Guide d'import Jira Cloud - User Stories

## Objectif

Ce guide explique comment importer dans Jira Cloud les User Stories du projet `SCRUM` a partir du fichier CSV :

```text
docs/jira/jira-import-user-stories.csv
```

Le fichier ne cree pas les Epics. Les Epics doivent deja exister dans Jira.

## Prerequis Jira

Avant l'import, verifier que :

- le projet Jira `SCRUM` existe ;
- les 12 Epics ont ete crees manuellement ;
- le type d'issue `Story` est disponible ;
- les priorites `P0`, `P1`, `P2`, `P3` existent ou sont mappees vers les priorites Jira disponibles ;
- le champ `Story Points` est disponible sur les stories ;
- le champ `Acceptance Criteria` existe, ou peut etre mappe vers un champ texte equivalent ;
- les composants cibles existent dans Jira ;
- les versions de release existent dans Jira.

## Fichier CSV

Colonnes fournies :

| Colonne CSV | Mapping Jira recommande |
| --- | --- |
| Issue Type | Issue Type |
| Summary | Summary |
| Description | Description |
| Priority | Priority |
| Story Points | Story Points |
| Labels | Labels |
| Component | Component/s |
| Epic Link | Epic Link, Parent ou champ Epic selon configuration Jira |
| Fix Version | Fix Version/s |
| Acceptance Criteria | Acceptance Criteria ou champ texte equivalent |

## Procedure d'import

1. Ouvrir Jira Cloud.
2. Aller dans l'administration d'import CSV ou dans l'import issues depuis CSV.
3. Selectionner le projet cible `SCRUM`.
4. Importer le fichier `docs/jira/jira-import-user-stories.csv`.
5. Choisir le separateur virgule.
6. Verifier l'encodage UTF-8.
7. Mapper chaque colonne CSV vers son champ Jira correspondant.
8. Verifier le mapping des valeurs de priorite.
9. Verifier le mapping des composants.
10. Verifier le mapping des versions.
11. Verifier le mapping du champ `Epic Link`.
12. Lancer la simulation ou validation si Jira la propose.
13. Importer les issues.

## Point important sur Epic Link

Selon la configuration Jira Cloud, le champ peut attendre :

- le nom exact de l'Epic ;
- la cle issue de l'Epic, par exemple `SCRUM-12` ;
- le champ `Parent` dans certains projets.

Le CSV utilise les noms exacts des Epics existants pour rester lisible. Si votre import Jira exige les cles d'Epics, remplacer les valeurs de la colonne `Epic Link` par les cles Jira correspondantes avant import.

## Validation post-import

Apres import, verifier :

- 35 stories creees ;
- toutes les stories dans le projet `SCRUM` ;
- aucun doublon ;
- chaque story rattachee a un Epic ;
- chaque story rattachee a une Fix Version ;
- les Story Points correctement importes ;
- les labels presents ;
- les composants presents ;
- les criteres d'acceptation visibles.

## Erreurs courantes

### Priorite inconnue

Cause : Jira ne connait pas `P0`, `P1`, `P2` ou `P3`.

Solution : creer ces priorites dans Jira ou mapper vers Highest, High, Medium et Low.

### Epic Link non reconnu

Cause : Jira attend une cle d'Epic au lieu du nom.

Solution : exporter ou relever les cles des Epics, puis remplacer la colonne `Epic Link`.

### Story Points non importe

Cause : le champ n'est pas disponible sur l'ecran Story ou son nom differe.

Solution : activer le champ dans la configuration Jira ou mapper vers le champ equivalent.

### Acceptance Criteria absent

Cause : le champ personnalise n'existe pas.

Solution : creer un champ texte `Acceptance Criteria` ou importer les criteres dans `Description`.

### Composant inconnu

Cause : le composant n'existe pas dans le projet.

Solution : creer les composants listes dans `docs/jira/jira-components.md`.

## Recommandation

Faire un premier import de test dans un projet Jira temporaire ou avec un petit extrait CSV de 2 ou 3 stories avant d'importer les 35 stories completes.
