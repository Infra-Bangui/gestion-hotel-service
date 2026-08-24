# Contrôle National Hôtelier — RCA

**Version 2.0.0** — Prototype Next.js du registre national des entrées/sorties hôtelières (Police Nationale / RCA).

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
| Police | `police`    | `police`     |
| Hôtel  | `ledger`    | `hotel`      |
| Admin  | `admin`     | `admin`      |

## Nouveautés v2

- Blocage de connexion si l’établissement hôtelier est **suspendu**
- **Rapport périodique PDF** (7 / 30 / 90 jours) depuis le tableau de bord police/admin
- Exports PDF des listes (présents, historique, recherche nationale)
- Affichage de la version dans l’UI

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
