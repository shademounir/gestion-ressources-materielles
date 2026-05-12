# Authentication Flow

## Connexion

1. L'utilisateur saisit son email et son mot de passe.
2. Le frontend envoie la demande a l'endpoint d'authentification.
3. Le backend valide le format des donnees.
4. Le service d'authentification recherche l'utilisateur.
5. Le backend verifie le hash du mot de passe.
6. Le backend verifie que le compte est actif.
7. Le backend genere un access token et un refresh token.
8. Le frontend stocke l'etat de session selon la strategie retenue.
9. L'utilisateur accede aux routes autorisees.

## Renouvellement de session

1. L'access token expire.
2. Le frontend appelle l'endpoint de refresh.
3. Le backend verifie le refresh token.
4. Le backend emet un nouvel access token.
5. Si la rotation est activee, un nouveau refresh token remplace l'ancien.

## Deconnexion

1. L'utilisateur demande la deconnexion.
2. Le frontend appelle l'endpoint de logout.
3. Le backend invalide le refresh token si la strategie serveur est retenue.
4. Le frontend supprime l'etat de session.
5. Les routes protegees deviennent inaccessibles.

## Echecs et securite

- Compte inactif : refuser la connexion.
- Mot de passe invalide : refuser avec message generique.
- Refresh token invalide : forcer la reconnexion.
- Tentatives suspectes : journaliser et prevoir limitation de debit.
