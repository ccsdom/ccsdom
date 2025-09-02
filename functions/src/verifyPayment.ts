import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as logger from "firebase-functions/logger";
import Stripe from "stripe";

// Secret Stripe (prod via Secret Manager, dev via .env en émulateur)
export const STRIPE_SECRET_KEY = defineSecret("STRIPE_SECRET_KEY");

// CORS autorisés
const ALLOWED_ORIGINS = new Set<string>([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://ccs-dom.fr",
  "https://www.ccs-dom.fr",
]);

export const verifyPayment = onRequest(
  {
    region: "europe-west1",
    cors: [...ALLOWED_ORIGINS], // CORS restreint
    secrets: [STRIPE_SECRET_KEY],
    memory: "256MiB",
    timeoutSeconds: 60,
  },
  async (req, res): Promise<void> => {
    const method = req.method.toUpperCase();
    if (method !== "POST" && method !== "GET") {
      res.set("Allow", "GET, POST");
      res.status(405).json({ error: "Méthode non autorisée" });
      return;
    }

    // Pas de cache sur un endpoint de vérif paiement
    res.set("Cache-Control", "no-store");

    try {
      const key = STRIPE_SECRET_KEY.value() || process.env.STRIPE_SECRET_KEY;
      if (!key) {
        logger.error("STRIPE_SECRET_KEY manquant");
        res.status(500).json({ error: "Configuration serveur incomplète" });
        return;
      }

      const stripe = new Stripe(key); // pas d'apiVersion explicit pour éviter des conflits de types

      const sessionId =
        method === "GET"
          ? (req.query.session_id as string | undefined) ||
            (req.query.sessionId as string | undefined)
          : (req.body?.sessionId as string | undefined);

      if (!sessionId) {
        res.status(400).json({ error: "sessionId manquant" });
        return;
      }

      // Récupération enrichie
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["payment_intent", "payment_intent.latest_charge"],
      });

      if (session.mode !== "payment") {
        res.status(400).json({ ok: false, error: "Session invalide (mode)" });
        return;
      }

      const paymentStatus = session.payment_status; // 'paid' | 'unpaid' | 'no_payment_required'
      const amountTotal = session.amount_total ?? null;
      const currency = session.currency ?? null;

      const pi = session.payment_intent as Stripe.PaymentIntent | null;
      const latestCharge = pi?.latest_charge as Stripe.Charge | string | undefined;

      const chargeStatus =
        typeof latestCharge === "object" && latestCharge ? latestCharge.status : undefined;
      const chargeId =
        typeof latestCharge === "object" && latestCharge ? latestCharge.id : undefined;

      // Ici tu peux comparer amountTotal/currency à TA source serveur (catalogue interne)
      // pour t'assurer que le montant n'a pas été altéré côté client.

      res.status(200).json({
        ok: true,
        sessionId: session.id,
        payment_status: paymentStatus,
        amount_total: amountTotal,
        currency,
        metadata: session.metadata || {},
        payment_intent_id: pi?.id,
        charge_id: chargeId,
        charge_status: chargeStatus,
      });
    } catch (err: any) {
      const code = (err?.statusCode as number) || 500;
      logger.error("[Stripe] verifyPayment error:", err);
      res.status(code).json({ ok: false, error: err?.message ?? "Erreur serveur Stripe" });
    }
  }
);
