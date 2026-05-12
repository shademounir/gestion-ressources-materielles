# Deployment Strategy

## Objectif

La strategie de deploiement cible doit permettre une livraison progressive, reproductible et rollbackable. Elle sera implementee uniquement lors de la phase CI/CD.

## Environnements

### Dev

- Usage local.
- Donnees de test.
- Logs detailles.
- Execution manuelle.

### Staging

- Validation avant livraison.
- Donnees proches du reel mais non sensibles.
- Execution via pipeline.
- Tests de non regression.

### Prod

- Environnement stable.
- Logs controles.
- Sauvegardes activees.
- Acces limite.

## Strategie de livraison

1. Verification locale.
2. Pull request.
3. CI automatique.
4. Merge apres validation.
5. Deploiement staging.
6. Validation fonctionnelle.
7. Deploiement production ou demonstration.

## Docker cible

Images ciblees :

- backend ;
- frontend ;
- database PostgreSQL pour dev et staging ;
- reverse proxy si necessaire.

## Migrations base de donnees

- Migrations versionnees.
- Execution controlee.
- Sauvegarde avant migration sensible.
- Rollback documente lorsque possible.

## Rollback applicatif

- Conserver la version precedente.
- Revenir a l'image stable si l'application echoue.
- Restaurer les variables d'environnement si besoin.
- Verifier la compatibilite base de donnees.

## Criteres de deploiement

- Tests unitaires au vert.
- Build backend et frontend reussi.
- Variables d'environnement presentes.
- Migrations validees.
- Documentation de release a jour.

## Risques

- Divergence entre dev et prod.
- Migration irreversible.
- Secret mal configure.
- Pipeline incomplet.
- Rollback non teste.
