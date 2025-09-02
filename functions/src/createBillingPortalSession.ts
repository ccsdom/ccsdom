// functions/src/createBillingPortalSession.ts
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret, defineString } from "firebase-functions/params";
import * as logger from "firebase-functions/logger";
import Stripe from "stripe";
import type { Request, Response } from "express";

// -- Emulator detection
const IS_EMULATOR =
  process.env.FUNCTIONS_EMULATOR === "true" || !!process.env.FIREBASE_EMULATOR_HUB;

// -- Secrets & params
const STRIPE_SECRET_KEY = defineSecret("STRIPE_SECRET_KEY");
const FRONTEND_URL_PARAM = defineString("FRONTEND_URL"); // ex: https://ccs-dom.fr

// -- CORS helper
function setCors(req: Request, res: Response, allowedOrigins: Set<string>) {
  const origin = req.headers.origin as string | undefined;
  if (origin && allowedOrigins.has(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
    res.set("Vary", "Origin");
  }
  res.set("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

// -- Safe JSON body
function ensureJsonBody<T = any>(req: Request): T {
  const b = req.body as any;
  if (b && typeof b === "object") return b as T;
  if (typeof b === "string") {
    try {
      return JSON.parse(b) as T;
    } catch {}
  }
  return {} as T;
}

export const createBillingPortalSession = onRequest(
  {
    region: "europe-west1",
    cors: false, // manual CORS
    secrets: [STRIPE_SECRET_KEY],
  },
  async (req: Request, res: Response): Promise<void> => {
    // 1) CORS + origin
    const frontendUrl = IS_EMULATOR
      ? process.env.FRONTEND_URL || "http://localhost:5173"
      : FRONTEND_URL_PARAM.value() || "https://ccs-dom.fr";

    const allowedOrigins = new Set<string>([
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://ccs-dom.fr",
      "https://www.ccs-dom.fr",
       "https://ccs-dom.web.app",     // 👈 Firebase Hosting
  "https://ccs-dom.firebaseapp.com", // 👈 Firebase Hosting
      frontendUrl,
    ]);
    setCors(req, res, allowedOrigins);

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }
    if (req.method !== "POST") {
      res.set("Allow", "POST, OPTIONS");
      res.status(405).json({ error: "Méthode non autorisée" });
      return;
    }

    // 2) Stripe key
    let stripeKey = "";
    try {
      stripeKey = IS_EMULATOR
        ? process.env.STRIPE_SECRET_KEY || ""
        : STRIPE_SECRET_KEY.value();
    } catch (e) {
      logger.error("[createBillingPortalSession] Lecture secret échouée", e);
      res.status(500).json({ error: "Secret Stripe inaccessible" });
      return;
    }
    if (!stripeKey) {
      logger.error("[createBillingPortalSession] STRIPE_SECRET_KEY manquant");
      res.status(500).json({ error: "Configuration Stripe manquante" });
      return;
    }
    const stripe = new Stripe(stripeKey);

    // 3) Parse body
    const body = ensureJsonBody<{
      userId?: string;
      email?: string;
      customerId?: string;
      returnPath?: string; // ex: "/client/abonnement"
      returnUrl?: string;  // ex: "https://ton-domaine/client/abonnement"
    }>(req);

    const userId = body.userId?.trim();
    const email = body.email?.trim()?.toLowerCase();
    const providedCustomerId = body.customerId?.trim();

    if (!userId) {
      res.status(400).json({ error: "userId requis" });
      return;
    }
    if (!email && !providedCustomerId) {
      res
        .status(400)
        .json({ error: "email ou customerId requis pour retrouver le client Stripe" });
      return;
    }

    // 4) Return URL (accepte returnUrl absolu OU returnPath relatif)
    let returnUrl = body.returnUrl?.trim();
    if (!returnUrl) {
      const base = frontendUrl.replace(/\/+$/, "");
      const returnPath = (body.returnPath || "/client/abonnement").replace(/^\/?/, "/");
      returnUrl = `${base}${returnPath}`;
    }

    try {
      // 5) Trouver (ou créer) le customer
      let customerId = providedCustomerId || "";

      if (!customerId) {
        // a) d’abord: chercher par metadata userId (plus fiable si déjà créé)
        try {
          // API de recherche Stripe (dispo par défaut sur la plupart des comptes)
          const search = await stripe.customers.search({
            query: `metadata['userId']:'${userId.replace(/'/g, "\\'")}'`,
            limit: 1,
          });
          if (search.data[0]) {
            customerId = search.data[0].id;
          }
        } catch {
          // ignore et fallback sur l’email
        }

        // b) sinon: chercher par email
        if (!customerId && email) {
          const list = await stripe.customers.list({ email, limit: 1 });
          if (list.data[0]) {
            customerId = list.data[0].id;
          }
        }

        // c) créer si toujours introuvable
        if (!customerId) {
          const created = await stripe.customers.create({
            email: email || undefined,
            metadata: { userId },
          });
          customerId = created.id;
        }
      }

      // 6) Créer la session du portail
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      logger.info("[createBillingPortalSession] Session portail créée", {
        customerId,
        sessionId: session.id,
      });

      res.status(200).json({ url: session.url, id: session.id });
      return;
    } catch (e: any) {
      logger.error("[createBillingPortalSession] Erreur", {
        message: e?.message,
        type: e?.type,
      });
      const code = e?.type?.startsWith?.("Stripe") ? 400 : 500;
      res.status(code).json({ error: e?.message || "Erreur Stripe" });
      return;
    }
  }
);
