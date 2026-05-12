# Observability Strategy

## Objectif

L'observabilite permet de comprendre l'etat du systeme, diagnostiquer les incidents et suivre la qualite des livraisons.

## Logs structures

Les logs backend doivent etre structures, idealement en JSON pour les environnements staging et production.

Champs recommandes :

- timestamp ;
- level ;
- message ;
- correlationId ;
- userId si disponible ;
- route ;
- method ;
- statusCode ;
- durationMs ;
- errorCode si applicable.

## Niveaux de logs

| Niveau | Usage |
| --- | --- |
| debug | Diagnostic local detaille |
| info | Evenements applicatifs normaux |
| warn | Situation anormale non bloquante |
| error | Echec applicatif ou technique |
| fatal | Indisponibilite critique |

## Correlation IDs

Chaque requete API doit disposer d'un correlation ID :

- genere si absent ;
- propage dans les logs ;
- retourne dans les erreurs API ;
- utile pour relier frontend, backend et pipeline.

## Health checks

Endpoints cibles :

```text
GET /health
GET /health/readiness
GET /health/liveness
```

Controles minimaux :

- API demarree ;
- connexion PostgreSQL ;
- configuration essentielle chargee ;
- etat general des dependances.

## Audit logs

Les AuditLogs sont distincts des logs techniques. Ils documentent les actions metier sensibles :

- changement de role ;
- affectation ;
- selection fournisseur ;
- cloture maintenance ;
- changement d'etat ressource.

## Pipeline monitoring

Suivi minimal GitHub Actions :

- statut des workflows ;
- duree des jobs ;
- echecs de tests ;
- echecs build ;
- echecs Docker build ;
- alertes sur audit securite.

## Metriques minimales

Metriques applicatives recommandees :

- nombre de requetes ;
- taux d'erreur ;
- duree moyenne des requetes ;
- nombre de connexions echouees ;
- nombre de tickets maintenance ouverts ;
- nombre de ressources indisponibles ;
- nombre de workflows CI en echec.

## Suivi erreurs CI/CD

Chaque echec CI/CD doit indiquer :

- job en erreur ;
- etape concernee ;
- logs utiles ;
- commit ;
- branche ;
- Pull Request ;
- lien Jira si disponible.

## Strategie debug

En development :

- logs debug autorises ;
- stack traces visibles ;
- donnees de test uniquement.

En staging :

- logs info et warn ;
- stack traces limitees ;
- correlation ID obligatoire.

En production :

- logs warn, error et fatal ;
- pas de detail sensible ;
- messages utilisateurs generiques.

## Recommandations monitoring futur

Solutions envisageables :

- tableau de bord GitHub Actions ;
- logs centralises ;
- Sentry ou equivalent pour erreurs frontend/backend ;
- Prometheus et Grafana si le projet evolue ;
- alertes sur indisponibilite API ou taux d'erreur eleve.
