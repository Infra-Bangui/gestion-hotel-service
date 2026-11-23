# Contrôle National Hôtelier — RCA

**Version 4.0.0** — Prototype Next.js du registre national des entrées/sorties hôtelières (Police Nationale / RCA).

## Démarrage local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

### Comptes démo (développement)

| Rôle   | Identifiant | Mot de passe |
|--------|-------------|--------------|
| Police | `police`    | `police123`  |
| Hôtel  | `ledger`    | `hotel123`   |
| Hôtel  | `oubangui`  | `hotel123`   |
| Admin  | `admin`     | `admin123`   |

## Nouveautés v4

- **Lecteur SecureScan X50** : connexion WebSocket locale (`ws://127.0.0.1:8288`) ou mode émulation clavier ; remplissage auto MRZ, photo et scan
- **Pont Windows** : voir [`deploy/securescan/LISEZ-MOI-lecteur-passeport.md`](deploy/securescan/LISEZ-MOI-lecteur-passeport.md)
- **Paramètres** : thème clair/sombre, couleur d’accent, densité, sons, animations
- **Mémoire locale** du navigateur + export/import JSON et synchronisation serveur (tests)
- Blocage de connexion si l’établissement hôtelier est **suspendu**
- **Rapport périodique PDF** (7 / 30 / 90 jours) depuis le tableau de bord police/admin
- Exports PDF des listes (présents, historique, recherche nationale)

### Pont SecureScan X50 (poste réception Windows)

```bash
cd deploy/securescan
npm install
node pont-securescan-x50.js
```

Dans l’application, onglet **Nouvelle entrée** → panneau **SecureScan X50** → **Connecter le scanner**.

## Sécurité

- En-têtes HTTP : CSP, HSTS, `X-Frame-Options: DENY`, `nosniff`, Referrer-Policy, Permissions-Policy
- Mot de passe retiré de la session après connexion
- Verrouillage temporaire après échecs de login
- Expiration de session après inactivité (30 min)
- Comptes démo masqués en production

## Déploiement Vercel

```bash
npx vercel --prod
```
