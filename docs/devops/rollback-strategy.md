# Rollback Strategy

## Objectif

Le rollback permet de revenir rapidement a une version stable en cas d'echec de deploiement.

## Rollback applicatif

- Conserver l'image Docker precedente.
- Identifier la version stable.
- Redeployer l'image precedente.
- Verifier les healthchecks.
- Documenter l'incident.

## Rollback base de donnees

- Sauvegarde avant migration sensible.
- Migrations Prisma versionnees.
- Script de retour arriere lorsque possible.
- Validation staging avant production.

## Scenarios

### Build defectueux

Le pipeline s'arrete avant deploiement. Aucun rollback necessaire.

### Deploiement echoue

Revenir a l'image precedente et verifier les variables.

### Migration problematique

Restaurer la sauvegarde ou appliquer la migration inverse si elle existe.

### Regression fonctionnelle

Bloquer la promotion, creer une anomalie Jira et redeployer la version stable.

## Responsabilites

- L'equipe projet valide le rollback.
- Le responsable technique execute ou supervise.
- Les decisions sont tracees dans Jira et dans la documentation de release.
