# Déploiement — gestion-hotel

Cible : serveur `192.168.10.183`, dossier `/opt/app`, derrière un reverse proxy
qui pointe vers `127.0.0.1:8080` (ou l'IP hôte `:8080`).

## Ce qui ne change jamais

- **Port** : `8080:3000`. Le reverse proxy n'est pas touché par les déploiements.
- **Nom du conteneur** : `gestion-hotel`.
- **Projet Compose** : `app` (déduit du dossier `/opt/app`, pas de `name:` dans le compose).

Un déploiement recrée uniquement le conteneur `gestion-hotel` : coupure de ~2–5 s
le temps que le nouveau conteneur passe `healthy`. Le proxy reprend seul ensuite.

## Flux

1. Push sur `master` → job `build` (GitHub-hosted) : build de l'image, push sur
   `ghcr.io/infra-bangui/gestion-hotel-service` avec deux tags :
   - `sha-<court>` (immuable, utilisé pour déployer et pour les rollbacks)
   - `latest` (confort)
2. Job `deploy` (runner `self-hosted, bangui`) : `scp` de `docker-compose.yml` +
   `deploy.sh` + `rollback.sh` vers `/opt/app/`, puis `./deploy.sh sha-<court>`.
3. `deploy.sh` écrit `/opt/app/.env` (`IMAGE_TAG=sha-<court>`), `docker compose pull`,
   `docker compose up -d --wait`. Si le healthcheck échoue → **rollback auto** vers
   le tag précédent (`.env.prev`).

## Installation unique sur le serveur

```bash
# 1. Dossier
sudo mkdir -p /opt/app && sudo chown "$USER":"$USER" /opt/app

# 2. Docker + Compose v2 (>= 2.17 pour --wait-timeout)
docker compose version

# 3. Login GHCR PERSISTANT (l'image du registre est privée).
#    PAT GitHub avec la seule portée read:packages.
echo <PAT_read_packages> | docker login ghcr.io -u <user-github> --password-stdin
#    -> écrit ~/.docker/config.json, réutilisé par tous les pulls suivants.

# 4. (option) Premier démarrage manuel avant que la CI ne tourne
cd /opt/app
# récupérer docker-compose.yml + deploy.sh (scp depuis le repo, ou copier à la main)
./deploy.sh latest
```

> Le compte SSH utilisé (`manu`) doit pouvoir lancer `docker` sans `sudo`
> (`sudo usermod -aG docker manu` puis reconnexion).

## Installation unique côté GitHub

- **Runner self-hosted** enregistré sur le repo avec les labels `self-hosted` et `bangui`.
- Sur la machine du runner : clé `/opt/github-runner/.ssh/deploy_key`, dont la clé
  publique est dans `~manu/.ssh/authorized_keys` sur `192.168.10.183`.
- (option) Environnement `production` dans *Settings → Environments* pour exiger
  une validation manuelle avant chaque déploiement.

## Opérations courantes

```bash
# État
ssh manu@192.168.10.183 'cd /opt/app && docker compose ps && cat .env'

# Rollback vers la version précédente
ssh manu@192.168.10.183 '/opt/app/rollback.sh'

# Rollback vers un tag précis
ssh manu@192.168.10.183 '/opt/app/rollback.sh sha-1a2b3c4'

# Logs
ssh manu@192.168.10.183 'docker logs -n 100 -f gestion-hotel'
```

## Note config applicative

Les variables `NEXT_PUBLIC_*` (comptes démo, timeout de session, verrouillage login)
sont **inlinées au build** par Next.js — les définir dans `docker-compose.yml` n'a
aucun effet à l'exécution. Valeurs par défaut du build : comptes démo masqués,
session 30 min, verrouillage après 5 échecs. Pour les changer il faut rebuilder
l'image (les passer en `--build-arg`, cf. `Dockerfile` / `.env.example`).
