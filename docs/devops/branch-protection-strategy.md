# Branch Protection Strategy

## Objectif

La protection de branches empeche les changements non controles sur les branches critiques et garantit le passage par Pull Request, CI, review et validation qualite.

## Protection main

Regles recommandees :

- interdire le push direct ;
- exiger une Pull Request ;
- exiger au moins une review humaine ;
- exiger les checks CI obligatoires ;
- exiger SonarCloud quality gate ;
- exiger les security scans critiques ;
- exiger branche a jour avant merge ;
- interdire le force push ;
- interdire la suppression de branche ;
- restreindre les droits de merge.

## Protection develop

Regles recommandees :

- interdire le push direct sauf administrateur technique si necessaire ;
- exiger une Pull Request ;
- exiger les checks PR ;
- exiger au moins une review ;
- exiger resolution des conversations ;
- bloquer si tests unitaires echouent.

## Pull Request obligatoire

Tout changement applicatif ou documentaire important doit passer par Pull Request.

Exceptions possibles :

- correction documentaire mineure validee ;
- operation administrative exceptionnelle ;
- hotfix critique avec review acceleree.

## Reviews minimales

| Branche cible | Reviews minimales |
| --- | --- |
| develop | 1 |
| main | 1 a 2 selon criticite |
| hotfix vers main | 1 review acceleree |

## Checks obligatoires

Checks cibles :

- backend lint ;
- frontend lint ;
- backend tests ;
- frontend tests ;
- backend build ;
- frontend build ;
- SonarCloud quality gate ;
- security scan ;
- secret scanning.

## Interdiction push direct main

`main` represente la stabilite du projet. Toute modification doit etre :

- associee a Jira ;
- revue ;
- testee ;
- tracee ;
- mergee via Pull Request.

## Strategie tags et releases

Convention tags :

```text
v0.1.0
v1.0.0
release-r1
release-r8-final
```

Recommandations :

- taguer les releases stables ;
- documenter les changements dans une note de release ;
- relier les tags aux versions Jira ;
- ne pas taguer un build non valide.

## Gestion hotfix

Les hotfix partent de `main`, reviennent vers `main`, puis sont reintegres dans `develop`.

Flux :

```text
main -> hotfix/SCRUM-XX-description -> PR main -> merge -> tag -> PR develop
```
