// functions/src/createCheckoutSession.ts
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret, defineString } from "firebase-functions/params";
import * as logger from "firebase-functions/logger";
import Stripe from "stripe";
import type { Request, Response } from "express";

// --- Emulator detection ---
const IS_EMULATOR =
  process.env.FUNCTIONS_EMULATOR === "true" ||
  !!process.env.FIREBASE_EMULATOR_HUB;

// --- Secrets & runtime params ---
const STRIPE_SECRET_KEY = defineSecret("STRIPE_SECRET_KEY");
const FRONTEND_URL_PARAM = defineString("FRONTEND_URL"); // ex: https://ccs-dom.fr

// Optionnel : ID d'une TaxRate FR 20% déjà créée (sinon on en crée/cherche une)
const STRIPE_TAX_RATE_FR20 = defineString("STRIPE_TAX_RATE_FR20");

// Optionnel : chemins de redirection
const CHECKOUT_SUCCESS_PATH = defineString("CHECKOUT_SUCCESS_PATH");
const CHECKOUT_CANCEL_PATH  = defineString("CHECKOUT_CANCEL_PATH");

// --- CORS helper ---
function setCors(req: Request, res: Response, allowedOrigins: Set<string>) {
  const origin = req.headers.origin as string | undefined;
  if (origin && allowedOrigins.has(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
    res.set("Vary", "Origin");
  }
  res.set("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Idempotency-Key"
  );
}

// --- Safe JSON body helper ---
function ensureJsonBody<T = any>(req: Request): T {
  const b = req.body as any;
  if (b && typeof b === "object") return b as T;
  if (typeof b === "string") {
    try { return JSON.parse(b) as T; } catch {}
  }
  return {} as T;
}

// --- Stripe metadata must be string-only ---
function toStringRecord(obj: Record<string, any> | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!obj || typeof obj !== "object") return out;
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    out[k] = typeof v === "string" ? v : JSON.stringify(v);
  }
  return out;
}

// --- Ensure a FR 20% tax rate exists (use preconfigured ID if available) ---
async function ensureFr20TaxRate(stripe: Stripe, preconfiguredId?: string): Promise<string | null> {
  if (preconfiguredId) {
    try {
      const tr = await stripe.taxRates.retrieve(preconfiguredId);
      if (!("deleted" in tr) && tr.active !== false) return tr.id;
    } catch { /* ignore */ }
  }
  const list = await stripe.taxRates.list({ active: true, limit: 100 });
  const found = list.data.find(
    (t) =>
      t.percentage === 20 &&
      t.inclusive === false &&
      (t.jurisdiction || "").toUpperCase() === "FR" &&
      (t.display_name || "").toUpperCase() === "TVA"
  );
  if (found) return found.id;

  const created = await stripe.taxRates.create({
    display_name: "TVA",
    description: "TVA France 20%",
    jurisdiction: "FR",
    percentage: 20,
    inclusive: false,
    active: true,
  });
  return created.id;
}

export const createCheckoutSession = onRequest(
  {
    region: "europe-west1",
    cors: false, // handled manually
    secrets: [STRIPE_SECRET_KEY],
  },
  async (req: Request, res: Response): Promise<void> => {
    // 1) FRONTEND URL + CORS
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

    if (req.method === "OPTIONS") { res.status(204).send(""); return; }
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
      logger.error("[createCheckoutSession] Lecture secret échouée", e);
      res.status(500).json({ error: "Secret Stripe inaccessible" });
      return;
    }
    if (!stripeKey) {
      logger.error("[createCheckoutSession] STRIPE_SECRET_KEY manquant/vide");
      res.status(500).json({ error: "Configuration Stripe manquante" });
      return;
    }
    const stripe = new Stripe(stripeKey);

    // 3) Parse + validation
    const body = ensureJsonBody<{
      userId?: string;
      email?: string;
      formula?: string;
      amount?: number;
      priceId?: string;
      quantity?: number;
      currency?: string;
      metadata?: Record<string, any>;
      successPath?: string;
      cancelPath?: string;
    }>(req);

    const userId   = body.userId?.trim();
    const email    = body.email?.trim().toLowerCase();
    const formula  = body.formula?.trim();
    const amount   = body.amount;
    const priceId  = body.priceId?.trim();
    const quantity = Number.isFinite(body.quantity) && (body.quantity as number) > 0 ? Math.floor(body.quantity as number) : 1;
    const currency = (body.currency || "eur").toLowerCase();
    const metadata = toStringRecord(body.metadata);

    if (!userId) { res.status(400).json({ error: "userId requis" }); return; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { res.status(400).json({ error: "email invalide" }); return; }
    if (!priceId && !formula) { res.status(400).json({ error: "priceId ou formula requis" }); return; }
    if (!priceId) {
      if (typeof amount !== "number" || !Number.isInteger(amount) || amount <= 0) {
        res.status(400).json({ error: "amount doit être un entier > 0 (centimes) si priceId est absent" });
        return;
      }
    }

    // 4) URLs retour — sanitize + défauts /checkout/success et /checkout/cancel
    const base = frontendUrl.replace(/\/+$/, "");
    const withLeadingSlash = (p?: string) => (!p ? "" : p.startsWith("/") ? p : `/${p}`);

    const successPath =
      IS_EMULATOR
        ? withLeadingSlash(body.successPath || process.env.CHECKOUT_SUCCESS_PATH || "/checkout/success")
        : withLeadingSlash(body.successPath || CHECKOUT_SUCCESS_PATH.value() || "/checkout/success");

    const cancelPath =
      IS_EMULATOR
        ? withLeadingSlash(body.cancelPath || process.env.CHECKOUT_CANCEL_PATH || "/checkout/cancel")
        : withLeadingSlash(body.cancelPath || CHECKOUT_CANCEL_PATH.value() || "/checkout/cancel");

    const successUrl = `${base}${successPath}?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl  = `${base}${cancelPath}`;

    // 5) Idempotency
    const idempotencyKey =
      (req.headers["x-idempotency-key"] as string | undefined) ||
      `${userId}:${priceId || formula}:${amount || "na"}:${quantity}`;

    try {
      // 6) TVA FR 20% (try param first, else find/create)
      const preconfTax =
        IS_EMULATOR ? (process.env.STRIPE_TAX_RATE_FR20 || "") : (STRIPE_TAX_RATE_FR20.value() || "");
      let taxRateId: string | null = null;
      try {
        taxRateId = await ensureFr20TaxRate(stripe, preconfTax);
      } catch (e: any) {
        logger.warn("[createCheckoutSession] Impossible d’assurer la TVA FR 20%:", e?.message);
      }
      const taxRates = taxRateId ? [taxRateId] as string[] : [];

      // 7) Construire la session (payment vs subscription)
      let sessionParams: Stripe.Checkout.SessionCreateParams;

      if (priceId) {
        // Vérifie le Price
        let price: Stripe.Price;
        try {
          price = await stripe.prices.retrieve(priceId);
        } catch (e: any) {
          logger.warn("[createCheckoutSession] priceId introuvable chez Stripe", { priceId, msg: e?.message });
          res.status(400).json({ error: "priceId invalide" });
          return;
        }
        if ((price as any).deleted || price.active === false) {
          res.status(400).json({ error: "priceId désactivé/supprimé" });
          return;
        }

        const isRecurring = !!price.recurring;

        sessionParams = {
          mode: isRecurring ? "subscription" : "payment",
          client_reference_id: userId,
          customer_email: email,
          line_items: isRecurring
            ? [{ price: priceId, quantity }]                   // taxes via subscription_data
            : [{ price: priceId, quantity, tax_rates: taxRates }], // taxes sur one-shot
          success_url: successUrl,
          cancel_url: cancelUrl,
          allow_promotion_codes: true,
          metadata: { userId, formula: formula || "", ...metadata },
          ...(isRecurring
            ? {
                subscription_data: {
                  default_tax_rates: taxRates,                 // TVA 20% pour l’abonnement
                  metadata: { userId, formula: formula || "", ...metadata },
                },
              }
            : {
                invoice_creation: { enabled: true },           // facture PDF pour one-shot
              }),
        };
      } else {
        // Montant ponctuel sans Price (one-shot)
        sessionParams = {
          mode: "payment",
          client_reference_id: userId,
          customer_email: email,
          line_items: [
            {
              quantity,
              price_data: {
                currency,
                unit_amount: amount!, // validé plus haut
                product_data: { name: `Abonnement ${formula || "—"}` },
              },
              tax_rates: taxRates, // TVA 20%
            },
          ],
          success_url: successUrl,
          cancel_url: cancelUrl,
          allow_promotion_codes: true,
          invoice_creation: { enabled: true }, // facture PDF
          metadata: { userId, formula: formula || "", ...metadata },
        };
      }

      const session = await stripe.checkout.sessions.create(sessionParams, { idempotencyKey });

      logger.info("[createCheckoutSession] Session créée", {
        sessionId: session.id,
        mode: session.mode,
      });

      res.status(200).json({ id: session.id, url: session.url });
      return;
    } catch (e: any) {
      const code = e?.type?.startsWith?.("Stripe") ? 400 : 500;
      logger.error("[createCheckoutSession] Erreur Stripe", {
        message: e?.message,
        type: e?.type,
        raw: e?.raw,
      });
      res.status(code).json({ error: e?.message || "Erreur Stripe" });
      return;
    }
  }
);
