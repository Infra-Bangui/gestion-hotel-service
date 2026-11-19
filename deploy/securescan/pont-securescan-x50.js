#!/usr/bin/env node
/* ============================================================
   PONT SECURESCAN X50 -> SIGCH (Controle National Hotelier)
   Republique Centrafricaine - Ministere de la Securite Publique
   ------------------------------------------------------------
   Role : relayer chaque lecture du lecteur de passeport Plustek
   SecureScan X50 vers l'application web, en WebSocket local
   (ws://127.0.0.1:8288).  Voir le fichier LISEZ-MOI-lecteur-passeport.md
   ============================================================ */

const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");
const chokidar = require("chokidar");

const PORT = 8288;                                   // meme adresse que dans l'application
const DOSSIER_EXPORT = "C:\\SecureScan\\Export";     // dossier d'export du logiciel Plustek

/* ---------- Serveur WebSocket ---------- */
const wss = new WebSocket.Server({ host: "127.0.0.1", port: PORT });
const clients = new Set();
wss.on("connection", (ws) => {
  clients.add(ws);
  console.log(`[pont] Application connectee (${clients.size} client-s).`);
  ws.on("close", () => clients.delete(ws));
});
console.log(`[pont] SecureScan X50 -> SIGCH - en ecoute sur ws://127.0.0.1:${PORT}`);

function diffuser(message) {
  const data = JSON.stringify(message);
  let n = 0;
  for (const ws of clients) if (ws.readyState === WebSocket.OPEN) { ws.send(data); n++; }
  console.log(`[pont] Lecture diffusee a ${n} client-s - ${message.mrz ? message.mrz.split("\n")[0].slice(0, 20) + "..." : "(sans MRZ)"}`);
}

/* ---------- Source 1 : dossier d'export du logiciel Plustek ---------- */
if (fs.existsSync(DOSSIER_EXPORT)) {
  console.log(`[pont] Surveillance du dossier : ${DOSSIER_EXPORT}`);
  const enAttente = new Map();
  chokidar.watch(DOSSIER_EXPORT, { ignoreInitial: true, awaitWriteFinish: { stabilityThreshold: 400 } })
    .on("add", (fichier) => {
      const ext = path.extname(fichier).toLowerCase();
      const base = path.basename(fichier, ext).replace(/_(mrz|face|portrait|image|vis)$/i, "");
      const grp = enAttente.get(base) || { mrz: null, portrait: null, image: null, timer: null };
      try {
        if (ext === ".txt" || ext === ".mrz") grp.mrz = fs.readFileSync(fichier, "utf-8").trim();
        else if ([".jpg", ".jpeg", ".png", ".bmp"].includes(ext)) {
          const b64 = fs.readFileSync(fichier).toString("base64");
          if (/face|portrait/i.test(fichier)) grp.portrait = b64; else grp.image = b64;
        } else return;
      } catch (e) { console.error(`[pont] Lecture impossible : ${fichier}`); return; }
      clearTimeout(grp.timer);
      grp.timer = setTimeout(() => { enAttente.delete(base); if (grp.mrz || grp.image) diffuser(grp); }, 700);
      enAttente.set(base, grp);
    });
} else {
  console.log(`[pont] Dossier d'export absent (${DOSSIER_EXPORT}) - mode saisie console seulement.`);
}

/* ---------- Source 2 : saisie console (tests) ---------- */
let tampon = [];
process.stdin.setEncoding("utf-8");
process.stdin.on("data", (chunk) => {
  for (const ligne of chunk.split(/\r?\n/)) {
    const l = ligne.trim().toUpperCase();
    if (!l) { if (tampon.length >= 2) { diffuser({ mrz: tampon.join("\n"), portrait: null, image: null }); tampon = []; } continue; }
    if (/^[A-Z0-9<]{28,44}$/.test(l)) {
      tampon.push(l);
      if ((tampon.length === 2 && tampon[0].startsWith("P")) || tampon.length === 3) {
        diffuser({ mrz: tampon.join("\n"), portrait: null, image: null });
        tampon = [];
      }
    }
  }
});
