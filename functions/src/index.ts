// functions/src/index.ts
import { onRequest, onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import type { Request, Response } from "express";

// === Emulateur seulement ===
const IS_EMULATOR =
  process.env.FUNCTIONS_EMULATOR === "true" ||
  !!process.env.FIREBASE_EMULATOR_HUB;

// Charge .env uniquement en local, sans casser la prod si dotenv n'est pas installé
if (IS_EMULATOR) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("dotenv").config();
  } catch {
    // pas grave en émulateur si dotenv n'est pas présent
  }
}

// --- Initialisation Admin SDK (une seule fois) ---
admin.initializeApp();

// expose les autres fonctions (Stripe, etc.)
export { createCheckoutSession } from "./createCheckoutSession";
export { verifyPayment } from "./verifyPayment";
export { stripeWebhook } from "./stripeWebhook";
export { getCheckoutSession } from "./getCheckoutSession";

// ===== Secrets Firebase (Secrets Manager) =====
const INSEE_CLIENT_ID = defineSecret("INSEE_CLIENT_ID");
const INSEE_CLIENT_SECRET = defineSecret("INSEE_CLIENT_SECRET");
const SUPER_ADMIN_PASS = defineSecret("SUPER_ADMIN_PASS");

// ===== CORS autorisés =====
const ALLOWED_ORIGINS = new Set<string>([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://ccs-dom.fr",
  "https://www.ccs-dom.fr",
]);

function setCors(req: Request, res: Response) {
  const origin = req.headers.origin as string | undefined;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
    res.set("Vary", "Origin");
  }
  res.set("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

// ====== Token OAuth2 INSEE (cache mémoire) ======
let cachedToken: string | null = null;
let tokenExpiry = 0;

function isInseeEndpointSuspended(bodyText: string): boolean {
  return /SUSPENDED/i.test(bodyText) || /Address endpoint.*SUSPENDED/i.test(bodyText);
}

async function getAccessToken(clientId: string, clientSecret: string): Promise<string> {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry) return cachedToken;

  if (!clientId || !clientSecret) {
    logger.error("[INSEE token] clientId/clientSecret manquants");
    const err = new Error("Secrets INSEE manquants");
    (err as any).statusCode = 500;
    throw err;
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const resp = await fetch("https://api.insee.fr/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: "grant_type=client_credentials",
  });

  const raw = await resp.text();
  const ct = resp.headers.get("content-type") || "";

  if (!resp.ok) {
    if (isInseeEndpointSuspended(raw)) {
      logger.warn("[INSEE token] Endpoint suspendu (WSO2)");
      const err = new Error("INSEE indisponible");
      (err as any).statusCode = 503;
      throw err;
    }
    logger.error("[INSEE token] HTTP", resp.status, "- body:", raw);
    const err = new Error("Erreur token INSEE");
    (err as any).statusCode = resp.status;
    throw err;
  }

  if (!/application\/json/i.test(ct)) {
    logger.error(`[INSEE token] 2xx mais non-JSON ct=${ct} body=${raw.slice(0, 300)}...`);
    const err = new Error("Réponse token INSEE invalide");
    (err as any).statusCode = 502;
    throw err;
  }

  let json: any;
  try {
    json = JSON.parse(raw);
  } catch {
    logger.error("[INSEE token] Réponse non-JSON:", raw);
    const err = new Error("Réponse token INSEE invalide");
    (err as any).statusCode = 502;
    throw err;
  }

  if (!json?.access_token || !json?.expires_in) {
    logger.error("[INSEE token] JSON mal formé:", raw);
    const err = new Error("Réponse token INSEE invalide");
    (err as any).statusCode = 502;
    throw err;
  }

  cachedToken = json.access_token;
  tokenExpiry = now + Number(json.expires_in) * 1000 - 60_000; // refresh 1 min avant
  return cachedToken!;
}

// ====== Greffes par département ======
const departementGreffeMap: Record<string, string> = {
  "01": "Greffe de Bourg-en-Bresse",
  "02": "Greffe de Laon",
  "03": "Greffe de Moulins",
  "04": "Greffe de Digne-les-Bains",
  "05": "Greffe de Gap",
  "06": "Greffe de Grasse",
  "07": "Greffe de Privas",
  "08": "Greffe de Charleville-Mézières",
  "09": "Greffe de Foix",
  "10": "Greffe de Troyes",
  "11": "Greffe de Carcassonne",
  "12": "Greffe de Rodez",
  "13": "Greffe de Marseille",
  "14": "Greffe de Caen",
  "15": "Greffe de Saint-Flour",
  "16": "Greffe d'Angoulême",
  "17": "Greffe de La Rochelle",
  "18": "Greffe de Bourges",
  "19": "Greffe de Tulle",
  "21": "Greffe de Dijon",
  "22": "Greffe de Saint-Brieuc",
  "23": "Greffe de Guéret",
  "24": "Greffe de Périgueux",
  "25": "Greffe de Besançon",
  "26": "Greffe de Valence",
  "27": "Greffe d'Évreux",
  "28": "Greffe de Chartres",
  "29": "Greffe de Brest",
  "2A": "Greffe d'Ajaccio",
  "2B": "Greffe de Bastia",
  "30": "Greffe de Nîmes",
  "31": "Greffe de Toulouse",
  "32": "Greffe d'Auch",
  "33": "Greffe de Bordeaux",
  "34": "Greffe de Montpellier",
  "35": "Greffe de Rennes",
  "36": "Greffe de Châteauroux",
  "37": "Greffe de Tours",
  "38": "Greffe de Grenoble",
  "39": "Greffe de Lons-le-Saunier",
  "40": "Greffe de Mont-de-Marsan",
  "41": "Greffe de Blois",
  "42": "Greffe de Saint-Étienne",
  "43": "Greffe du Puy-en-Velay",
  "44": "Greffe de Nantes",
  "45": "Greffe d'Orléans",
  "46": "Greffe de Cahors",
  "47": "Greffe d'Agen",
  "48": "Greffe de Mende",
  "49": "Greffe d'Angers",
  "50": "Greffe de Coutances",
  "51": "Greffe de Châlons-en-Champagne",
  "52": "Greffe de Chaumont",
  "53": "Greffe de Laval",
  "54": "Greffe de Nancy",
  "55": "Greffe de Bar-le-Duc",
  "56": "Greffe de Vannes",
  "57": "Greffe de Metz",
  "58": "Greffe de Nevers",
  "59": "Greffe de Lille",
  "60": "Greffe de Beauvais",
  "61": "Greffe d'Alençon",
  "62": "Greffe de Boulogne-sur-Mer",
  "63": "Greffe de Clermont-Ferrand",
  "64": "Greffe de Pau",
  "65": "Greffe de Tarbes",
  "66": "Greffe de Perpignan",
  "67": "Greffe de Strasbourg",
  "68": "Greffe de Colmar",
  "69": "Greffe de Lyon",
  "70": "Greffe de Vesoul",
  "71": "Greffe de Mâcon",
  "72": "Greffe du Mans",
  "73": "Greffe de Chambéry",
  "74": "Greffe d'Annecy",
  "75": "Greffe de Paris",
  "76": "Greffe de Rouen",
  "77": "Greffe de Melun",
  "78": "Greffe de Versailles",
  "79": "Greffe de Niort",
  "80": "Greffe d'Amiens",
  "81": "Greffe d'Albi",
  "82": "Greffe de Montauban",
  "83": "Greffe de Toulon",
  "84": "Greffe d'Avignon",
  "85": "Greffe de La Roche-sur-Yon",
  "86": "Greffe de Poitiers",
  "87": "Greffe de Limoges",
  "88": "Greffe d'Épinal",
  "89": "Greffe d'Auxerre",
  "90": "Greffe de Belfort",
  "91": "Greffe d'Évry",
  "92": "Greffe de Nanterre",
  "93": "Greffe de Bobigny",
  "94": "Greffe de Créteil",
  "95": "Greffe de Pontoise",
  "971": "Greffe de Basse-Terre (Guadeloupe)",
  "972": "Greffe de Fort-de-France (Martinique)",
  "973": "Greffe de Cayenne (Guyane)",
  "974": "Greffe de Saint-Denis (La Réunion)",
  "976": "Greffe de Mayotte",
};

function getGreffeByCodePostal(codePostal?: string): string | null {
  if (!codePostal || codePostal.length < 2) return null;
  const code = codePostal.trim().replace(/\s+/g, "").toUpperCase();
  const prefix3 = code.length >= 3 ? code.substring(0, 3) : null;
  const prefix2 = code.substring(0, 2);
  if (prefix3 && departementGreffeMap[prefix3]) return departementGreffeMap[prefix3];
  if (departementGreffeMap[prefix2]) return departementGreffeMap[prefix2];
  return null;
}

// ====== HTTP Function : API Entreprise (INSEE) ======
export const apiEntreprise = onRequest(
  {
    region: "europe-west9",
    cors: false, // géré manuellement
    secrets: [INSEE_CLIENT_ID, INSEE_CLIENT_SECRET],
  },
  async (req: Request, res: Response): Promise<void> => {
    setCors(req, res);

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }
    if (req.method !== "GET") {
      res.status(405).json({ error: "Méthode non autorisée" });
      return;
    }

    try {
      const siret = String(req.query.siret || "");
      if (!/^\d{14}$/.test(siret)) {
        res.status(400).json({ error: "Paramètre 'siret' invalide (14 chiffres requis)" });
        return;
      }
      const siren = siret.substring(0, 9);

      // ⚠️ En PROD: secrets via Secret Manager ; en EMULATEUR: .env
      const clientId = IS_EMULATOR ? (process.env.INSEE_CLIENT_ID || "") : INSEE_CLIENT_ID.value();
      const clientSecret = IS_EMULATOR ? (process.env.INSEE_CLIENT_SECRET || "") : INSEE_CLIENT_SECRET.value();

      let token: string;
      try {
        token = await getAccessToken(clientId, clientSecret);
      } catch (e: any) {
        const status = e?.statusCode || 500;
        res.status(status).json({ error: e?.message || "INSEE indisponible" });
        return;
      }

      const etabResp = await fetch(`https://api.insee.fr/entreprises/sirene/V3.11/siret/${siret}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Accept-Language": "fr-FR,fr;q=0.9",
        },
      });

      const etabRaw = await etabResp.text();
      if (!etabResp.ok) {
        if (isInseeEndpointSuspended(etabRaw)) {
          res.status(503).json({ error: "INSEE indisponible (endpoint suspendu)" });
          return;
        }
        logger.error("[INSEE établissement] HTTP", etabResp.status, "- body:", etabRaw);
        res.status(etabResp.status).json({ error: etabRaw || "Erreur INSEE" });
        return;
      }

      let etabJson: any;
      try {
        etabJson = JSON.parse(etabRaw);
      } catch {
        logger.error("[INSEE établissement] Réponse non-JSON:", etabRaw);
        res.status(502).json({ error: "Réponse INSEE invalide" });
        return;
      }

      const dirigeants: any[] = []; // SIRENE ne fournit pas les dirigeants
      const cp: string | undefined =
        etabJson?.etablissement?.adresseEtablissement?.codePostalEtablissement;
      const greffeImmatriculation =
        getGreffeByCodePostal((cp || "").replace(/\s+/g, "")) || "Non renseigné";

      res.json({
        etablissement: { ...etabJson?.etablissement, greffeImmatriculation },
        dirigeants,
        siren,
      });
      return;
    } catch (error: any) {
      logger.error("Erreur interne apiEntreprise", error);
      res.status(500).json({ error: "Erreur serveur interne" });
      return;
    }
  }
);

// ====== Callable Function : attribuer le rôle SUPER ADMIN ======
export const makeSuperAdmin = onCall(
  {
    region: "europe-west9",
    secrets: [SUPER_ADMIN_PASS],
  },
  async (request) => {
    const { email, passcode } = (request.data || {}) as {
      email?: string;
      passcode?: string;
    };

    if (!email) {
      throw new HttpsError("invalid-argument", "Email requis");
    }

    // En PROD: Secret Manager ; en EMULATEUR: .env
    const expected = IS_EMULATOR ? process.env.SUPER_ADMIN_PASS : SUPER_ADMIN_PASS.value();
    if (!expected || passcode !== expected) {
      throw new HttpsError("permission-denied", "Passcode invalide");
    }

    const user = await admin.auth().getUserByEmail(email);
    const currentClaims = (user.customClaims || {}) as Record<string, unknown>;

    await admin.auth().setCustomUserClaims(user.uid, {
      ...currentClaims,
      role: "super_admin",
    });

    return { ok: true, uid: user.uid, role: "super_admin" };
  }
);
