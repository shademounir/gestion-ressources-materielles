# Pack diagrammes UML et architecture

Ce dossier contient les diagrammes Mermaid generes a partir du depot reel du projet
Gestion des Ressources Materielles. Ils couvrent le contexte systeme, les modules
applicatifs, les flux metier principaux, le modele de donnees et le pipeline
DevSecOps.

## Fichiers

- `system-context.mmd` : contexte systeme et acteurs externes.
- `application-architecture.mmd` : architecture monorepo React, NestJS, Prisma et PostgreSQL.
- `backend-modules.mmd` : modules NestJS exposes dans `AppModule`.
- `database-erd.mmd` : entites Prisma et relations principales.
- `auth-sequence.mmd` : sequence login JWT.
- `resource-assignment-sequence.mmd` : affectation et retour de ressource.
- `maintenance-sequence.mmd` : signalement, constat, intervention et retour fournisseur.
- `tender-workflow-sequence.mmd` : besoin, appel d'offres, offre et selection gagnante.
- `resource-state-diagram.mmd` : cycle de vie d'une ressource.
- `cicd-pipeline.mmd` : pipeline GitHub Actions.
- `devsecops-flow.mmd` : flux DevSecOps Jira vers merge.

## Utilisation

Les fichiers `.mmd` peuvent etre rendus dans GitHub, VS Code avec une extension
Mermaid, Mermaid Live Editor ou `@mermaid-js/mermaid-cli`.

## Limites

Les diagrammes representent l'etat actuel du code et de `schema.prisma`. Les flux
frontend sont resumes au niveau ecran/service et les details de tests unitaires ne
sont pas tous representes pour garder des supports lisibles.
