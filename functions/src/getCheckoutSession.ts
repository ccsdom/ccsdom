// functions/src/getCheckoutSession.ts
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret, defineString } from "firebase-functions/params";
import * as logger from "firebase-functions/logger";
import Stripe from "stripe";
import type { Request, Response } from "express";

const IS_EMULATOR = process.env.FUNCTIONS_EMULATOR === "true" || !!process.env.FIREBASE_EMULATOR_HUB;
const STRIPE_SECRET_KEY = defineSecret("STRIPE_SECRET_KEY");
const FRONTEND_URL_PARAM = defineString("FRONTEND_URL");

function setCors(req: Request, res: Response, allowed: Set<string>) {
  const origin = req.headers.origin as string | undefined;
  if (origin && allowed.has(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
    res.set("Vary", "Origin");
  }
  res.set("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
}

export const getCheckoutSession = onRequest(
  {
    region: "europe-west1",
    cors: false,
    secrets: [STRIPE_SECRET_KEY],
  },
  async (req: Request, res: Response): Promise<void> => {
    const frontendUrl = IS_EMULATOR
      ? process.env.FRONTEND_URL || "http://localhost:5173"
      : FRONTEND_URL_PARAM.value() || "https://ccs-dom.fr";
    const allowed = new Set([
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://ccs-dom.fr",
      "https://www.ccs-dom.fr",
      frontendUrl,
    ]);
    setCors(req, res, allowed);
    if (req.method === "OPTIONS") { res.status(204).send(""); return; }
    if (req.method !== "GET") { res.set("Allow","GET, OPTIONS"); res.status(405).json({error:"Méthode non autorisée"}); return; }

    const apiKey = IS_EMULATOR ? process.env.STRIPE_SECRET_KEY : STRIPE_SECRET_KEY.value();
    if (!apiKey) { res.status(500).json({ error: "Stripe non configuré" }); return; }

    const sessionId = (req.query.session_id as string | undefined)?.trim();
    if (!sessionId) { res.status(400).json({ error: "session_id requis" }); return; }

    try {
      const stripe = new Stripe(apiKey);
      const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["invoice"] });

      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id ?? null;

      const invoice: any = session.invoice;
      const out = {
        id: session.id,
        mode: session.mode,
        payment_status: session.payment_status,     // "paid" | "unpaid" | ...
        amount_total: session.amount_total,
        currency: session.currency,
        customer_email: session.customer_details?.email || session.customer_email || null,
        hosted_invoice_url: invoice?.hosted_invoice_url || null,
        invoice_pdf: invoice?.invoice_pdf || null,
        invoice_id: typeof session.invoice === "string" ? session.invoice : invoice?.id || null,
        subscription_id: subscriptionId,
        metadata: session.metadata || {},
      };

      res.status(200).json(out);
    } catch (e: any) {
      logger.error("[getCheckoutSession] error", { message: e?.message });
      res.status(400).json({ error: e?.message || "Session introuvable" });
    }
  }
);
