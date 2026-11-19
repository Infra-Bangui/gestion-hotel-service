# LISEZ-MOI — Connexion du lecteur de passeport au SIGCH

**Système Intégré de Gestion du Contrôle Hôtelier (SIGCH)**
République Centrafricaine — Ministère de la Sécurité Publique — Police Nationale

Ce document explique comment relier un lecteur de passeport **Plustek SecureScan X50**
(conforme à la norme OACI 9303, lecture MRZ) à l'application SIGCH, de sorte qu'un
simple passage du document **remplisse automatiquement** la fiche de police du client
(nom, prénom, sexe, date de naissance, nationalité, type et numéro de document).

---

## 1. Les deux modes de connexion

L'application accepte le lecteur de deux façons. Choisissez celle adaptée à votre poste.

| Mode | Principe | Quand l'utiliser |
|------|----------|------------------|
| **A — Service local (pont)** | Un petit programme tourne sur le poste de la réception, lit les exports du logiciel du X50 et les transmet à l'application. Transmet aussi la **photo** et l'**image du document**. | Déploiement réel. Recommandé. |
| **B — Émulation clavier** | Le lecteur est réglé pour « taper » la bande MRZ comme un clavier. L'application capte la frappe. | Poste simple, sans installation, ou test rapide. |

---

## 2. Mode A — Service local (recommandé)

### 2.1 Pré-requis
- Poste **Windows** où le lecteur SecureScan X50 est branché en USB.
- **Node.js LTS** installé — à télécharger sur https://nodejs.org (version « LTS »).
- Le **logiciel Plustek** du X50 installé et fonctionnel.
- Le fichier **`pont-securescan-x50.js`** (fourni avec ce document).

### 2.2 Configurer le logiciel du lecteur
Dans le logiciel Plustek du X50, activez l'**export automatique** de chaque lecture
vers un dossier, par exemple `C:\SecureScan\Export`. L'export doit contenir au
minimum la **bande MRZ** en fichier texte (`.txt` ou `.mrz`). S'il peut aussi
exporter la **photo du visage** et l'**image du document** (`.jpg`/`.png`), elles
seront jointes automatiquement à la fiche.

> Nommage conseillé des fichiers d'une même lecture :
> `lecture001.txt` (MRZ), `lecture001_face.jpg` (portrait), `lecture001.jpg` (document).
> Le pont regroupe les fichiers portant le même nom de base.

### 2.3 Installer et lancer le pont
1. Placez `pont-securescan-x50.js` dans un dossier, par exemple `C:\SIGCH\`.
2. Ouvrez l'**invite de commandes** dans ce dossier et installez les dépendances :
   ```
   npm install ws chokidar
   ```
3. Si votre dossier d'export n'est pas `C:\SecureScan\Export`, ouvrez le fichier
   `pont-securescan-x50.js` et modifiez la ligne `DOSSIER_EXPORT` en haut.
4. Lancez le pont :
   ```
   node pont-securescan-x50.js
   ```
   Le message `en écoute sur ws://127.0.0.1:8288` confirme qu'il fonctionne.
   **Laissez cette fenêtre ouverte** pendant le service.

### 2.4 Connecter l'application
1. Dans le SIGCH, espace **Hôtel**, onglet **Nouvelle entrée**.
2. Dans le panneau **« Scanner de passeport — SecureScan X50 »**, cliquez
   **« 🔌 Connecter le scanner »** (l'adresse `ws://127.0.0.1:8288` est déjà pré-remplie).
3. Le voyant passe au **vert** : « Scanner connecté — en attente de document… ».
4. Posez un passeport ou une CNI sur le lecteur : les champs se remplissent seuls,
   un **bip** confirme la lecture. **Vérifiez toujours** les données avant d'enregistrer.

### 2.5 Démarrage automatique avec Windows (optionnel)
Pour que le pont se lance tout seul à l'ouverture de session :
1. Créez un fichier `demarrer-pont.bat` dans `C:\SIGCH\` contenant :
   ```
   @echo off
   cd /d C:\SIGCH
   node pont-securescan-x50.js
   ```
2. Appuyez sur **Windows + R**, tapez `shell:startup`, validez.
3. Placez un **raccourci** vers `demarrer-pont.bat` dans le dossier qui s'ouvre.

---

## 3. Mode B — Émulation clavier (sans installation)

1. Dans le logiciel du X50, réglez la sortie sur **« clavier » / « keyboard wedge »**
   (le lecteur envoie alors la MRZ comme une frappe clavier, suivie d'Entrée).
2. Dans le SIGCH, panneau du scanner, cliquez **« ⌨ Mode émulation clavier »**.
   Le message « En écoute — passez le document… » s'affiche.
3. Passez le document : la frappe rapide est captée, analysée, et les champs
   se remplissent. Appuyez sur **Échap** pour arrêter l'écoute.

> En mode clavier, seule la **MRZ** est transmise (pas la photo ni l'image).
> Pour la photo du client, utilisez le bloc « Photo du client » du module de scan.

---

## 4. Format des messages (pour les intégrateurs)

Le pont envoie à l'application, par WebSocket, un objet JSON par lecture :

```json
{
  "mrz":      "P<CAFKOSSI<<JEAN<BAPTISTE<<<<<<<<<<<<<<<<<<<\nCA1234567<8CAF8503121M3101012<<<<<<<<<<<<<<02",
  "portrait": "<image du visage en base64, ou null>",
  "image":    "<image du document en base64, ou null>"
}
```

- `mrz` : les 2 lignes (passeport, format TD3) ou 3 lignes (CNI, format TD1),
  séparées par un retour à la ligne. Un texte MRZ brut (sans JSON) est aussi accepté.
- Tout autre lecteur conforme OACI 9303 peut être branché de la même manière :
  il suffit que son pont envoie ce format à `ws://127.0.0.1:8288`.

---

## 5. Dépannage

| Symptôme | Cause probable | Solution |
|----------|----------------|----------|
| Voyant **rouge**, « service introuvable » | Le pont n'est pas lancé | Lancez `node pont-securescan-x50.js` et réessayez |
| Rien ne se remplit après le scan | Le logiciel X50 n'exporte pas, ou mauvais dossier | Vérifiez l'export et la ligne `DOSSIER_EXPORT` |
| « MRZ non reconnue » | Document mal positionné ou abîmé | Repositionnez le document et relisez |
| `npm` ou `node` inconnu | Node.js non installé | Installez Node.js LTS puis rouvrez l'invite |
| Mode clavier sans effet | Lecteur pas en mode « clavier » | Réglez la sortie du X50, ou utilisez le mode A |

### Test sans lecteur
Avec le pont lancé, tapez dans sa fenêtre les 2 lignes d'une MRZ puis Entrée :
le pont les envoie immédiatement à l'application (utile pour vérifier la liaison).

---

## 6. Sécurité

- Le pont n'écoute **que** sur l'adresse locale `127.0.0.1` : il n'est pas accessible
  depuis le réseau, seulement depuis l'application ouverte sur le même poste.
- Aucune donnée n'est envoyée sur Internet par le pont ; il ne fait que relayer
  la lecture vers l'application.
- En production, les images de documents et les portraits sont à conserver selon
  les durées fixées par le cadre juridique du SIGCH.

---

*Document d'accompagnement du connecteur `pont-securescan-x50.js` — SIGCH v4.*
