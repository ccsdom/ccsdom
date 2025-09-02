// functions/src/stripeWebhook.ts
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as logger from "firebase-functions/logger";
import Stripe from "stripe";
import type { Request, Response } from "express";
import { db } from "./firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

// Détecte l'émulateur
const IS_EMULATOR =
  process.env.FUNCTIONS_EMULATOR === "true" ||
  !!process.env.FIREBASE_EMULATOR_HUB;

// Secrets (Firebase Secrets Manager)
const STRIPE_SECRET_KEY     = defineSecret("STRIPE_SECRET_KEY");
const STRIPE_WEBHOOK_SECRET = defineSecret("STRIPE_WEBHOOK_SECRET");

/** Helpers */
function getString(v: any): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

/** Calcule la TVA depuis l’objet Invoice de Stripe, avec fallbacks. */
function computeInvoiceTax(inv: Stripe.Invoice): number | null {
  const fromTotals =
    inv.total_tax_amounts && Array.isArray(inv.total_tax_amounts)
      ? inv.total_tax_amounts.reduce((sum, t) => sum + (t?.amount ?? 0), 0)
      : null;

  const legacyTax =
    typeof (inv as any).tax === "number" ? (inv as any).tax : null;
  const legacyAmountTax =
    typeof (inv as any).amount_tax === "number"
      ? (inv as any).amount_tax
      : null;

  return fromTotals ?? legacyTax ?? legacyAmountTax ?? null;
}

/** Écriture atomique + historisation */
async function touchWithEventLog(
  event: Stripe.Event,
  collection: string,
  docId: string,
  data: Record<string, any>
) {
  const eventRef = db.collection("stripe_events").doc(event.id);
  await db.runTransaction(async (tx) => {
    // Marque event traité (anti-doublon fort)
    tx.set(eventRef, {
      type: event.type,
      created: new Date(event.created * 1000),
      insertedAt: FieldValue.serverTimestamp(),
    });

    const ref = db.collection(collection).doc(docId);
    const snap = await tx.get(ref);

    const base: Record<string, any> = {
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
      latestEventId: event.id,
    };

    if (!snap.exists) {
      base.createdAt = FieldValue.serverTimestamp();
    }

    tx.set(ref, base, { merge: true });

    // Historique granulaire de l’event
    tx.set(ref.collection("events").doc(event.id), {
      type: event.type,
      created: new Date(event.created * 1000),
      raw: event, // utile pour debug (à retirer si besoin)
    });
  });
}

export const stripeWebhook = onRequest(
  {
    region: "europe-west1",
    cors: false, // Stripe n’a pas besoin de CORS
    secrets: [STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET],
    memory: "256MiB",
    timeoutSeconds: 60,
    maxInstances: 1,
  },
  async (req: Request, res: Response): Promise<void> => {
    // 1) Méthode
    if (req.method !== "POST") {
      res.set("Allow", "POST");
      res.status(405).send("Method Not Allowed");
      return;
    }

    // 2) Signature Stripe
    const sig = req.get("stripe-signature");
    if (!sig) {
      res.status(400).send("Missing stripe-signature header");
      return;
    }

    // 3) Récupère secrets
    const webhookSecret = IS_EMULATOR
      ? process.env.STRIPE_WEBHOOK_SECRET
      : STRIPE_WEBHOOK_SECRET.value();
    const apiKey = IS_EMULATOR
      ? process.env.STRIPE_SECRET_KEY
      : STRIPE_SECRET_KEY.value();

    if (!webhookSecret || !apiKey) {
      logger.error("[Webhook] Secrets manquants");
      res.status(500).send("Server misconfigured");
      return;
    }

    // 4) Stripe SDK
    const stripe = new Stripe(apiKey);

    // 5) Vérif de signature via le corps BRUT
    let event: Stripe.Event;
    try {
      const payload = (req as any).rawBody as Buffer; // requis pour constructEvent
      event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
    } catch (err: any) {
      logger.error("[Webhook] Signature invalid:", err?.message);
      res.status(400).send(`Webhook Error: ${err?.message ?? "invalid signature"}`);
      return;
    }

    try {
      // Anti-doublon rapide
      const eventRef  = db.collection("stripe_events").doc(event.id);
      const eventSnap = await eventRef.get();
      if (eventSnap.exists) {
        logger.info(`[Webhook] Event déjà traité: ${event.id}`);
        res.json({ received: true, duplicate: true });
        return;
      }

      switch (event.type) {
        /** === 1) Retour de Checkout (paiement ponctuel OU abonnement) === */
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;

          // ✅ Rattachement userId robuste
          const safeUserId =
            (session.metadata?.userId as string | undefined) ||
            (typeof session.client_reference_id === "string"
              ? session.client_reference_id
              : null);

          const subscriptionId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription?.id ?? null;

          const invoiceId =
            typeof session.invoice === "string"
              ? session.invoice
              : session.invoice?.id ?? null;

          await touchWithEventLog(event, "payments", session.id, {
            status: session.payment_status, // "paid" | "unpaid" | "no_payment_required"
            amount_total: session.amount_total ?? null,
            currency: session.currency ?? "eur",
            mode: session.mode, // "payment" | "subscription"
            customer:
              typeof session.customer === "string"
                ? session.customer
                : session.customer?.id ?? null,
            customer_email:
              session.customer_details?.email ??
              session.customer_email ??
              null,
            payment_intent:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : session.payment_intent?.id ?? null,
            invoiceId,
            subscriptionId,
            metadata: session.metadata ?? {},
            userId: safeUserId,
            formula: session.metadata?.formula ?? null,
          });

          logger.info("✅ checkout.session.completed", {
            sessionId: session.id,
            amount_total: session.amount_total,
            userId: safeUserId,
          });

          // 1er snapshot abonnement si existant
          if (subscriptionId) {
            try {
              const sub = await stripe.subscriptions.retrieve(subscriptionId);
              await touchWithEventLog(event, "subscriptions", subscriptionId, {
                userId:
                  (sub.metadata?.userId as string | undefined) ||
                  safeUserId ||
                  null,
                status: sub.status,
                cancel_at_period_end: sub.cancel_at_period_end,
                current_period_start: sub.current_period_start
                  ? new Date(sub.current_period_start * 1000)
                  : null,
                current_period_end: sub.current_period_end
                  ? new Date(sub.current_period_end * 1000)
                  : null,
                customer:
                  typeof sub.customer === "string"
                    ? sub.customer
                    : (sub.customer as Stripe.Customer | Stripe.DeletedCustomer)?.id ??
                      null,
                items:
                  sub.items?.data?.map((it) => ({
                    price: typeof it.price === "string" ? it.price : it.price?.id,
                    product:
                      typeof it.price?.product === "string"
                        ? (it.price?.product as string)
                        : (it.price?.product as Stripe.Product)?.id,
                    quantity: it.quantity ?? 1,
                  })) ?? [],
                default_payment_method:
                  typeof sub.default_payment_method === "string"
                    ? sub.default_payment_method
                    : sub.default_payment_method?.id ?? null,
                metadata: sub.metadata ?? {},
              });
            } catch (e: any) {
              logger.warn("[Webhook] Récup abonnement post-session impossible", {
                subscriptionId,
                msg: e?.message,
              });
            }
          }

          break;
        }

        /** === 2) Factures (abonnements ET one-shot avec facture) === */
        case "invoice.finalized":
        case "invoice.payment_succeeded":
        case "invoice.payment_failed": {
          const inv = event.data.object as Stripe.Invoice;
          const invoiceId = inv.id;

          // userId depuis metadata ; sinon tenter via subscription puis via customer
          let userId = getString(inv.metadata?.userId);

          if (!userId && inv.subscription) {
            try {
              const sub =
                typeof inv.subscription === "string"
                  ? await stripe.subscriptions.retrieve(inv.subscription)
                  : (inv.subscription as Stripe.Subscription);
              userId = getString(sub.metadata?.userId) || null;
            } catch {
              /* ignore */
            }
          }

          if (!userId && inv.customer) {
            try {
              const cust =
                typeof inv.customer === "string"
                  ? await stripe.customers.retrieve(inv.customer)
                  : (inv.customer as Stripe.Customer | Stripe.DeletedCustomer);

              if (typeof (cust as any).deleted === "boolean") {
                // DeletedCustomer -> pas de metadata
              } else {
                const c = cust as Stripe.Customer;
                userId = getString(c.metadata?.userId) || null;
              }
            } catch {
              /* ignore */
            }
          }

          const tax = computeInvoiceTax(inv);

          await touchWithEventLog(event, "invoices", invoiceId, {
            userId,
            status: inv.status, // "paid" | "open" | "uncollectible" | ...
            subscriptionId:
              typeof inv.subscription === "string"
                ? inv.subscription
                : inv.subscription?.id ?? null,
            customer:
              typeof inv.customer === "string"
                ? inv.customer
                : (inv.customer as Stripe.Customer | Stripe.DeletedCustomer)?.id ??
                  null,
            customer_email: inv.customer_email || null,
            hosted_invoice_url: inv.hosted_invoice_url || null,
            invoice_pdf: inv.invoice_pdf || null,
            currency: inv.currency || "eur",
            subtotal: inv.subtotal ?? null, // HT
            tax: tax, // TVA
            total: inv.total ?? null, // TTC
            number: inv.number || null,
            period_start: inv.period_start
              ? new Date(inv.period_start * 1000)
              : null,
            period_end: inv.period_end ? new Date(inv.period_end * 1000) : null,
            metadata: inv.metadata || {},
          });

          logger.info(`🧾 invoice handled: ${event.type}`, { invoiceId, userId });
          break;
        }

        /** === 3) Abonnements (cycle, annulation, changement…) === */
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted": {
          const sub = event.data.object as Stripe.Subscription;
          const subscriptionId = sub.id;

          await touchWithEventLog(event, "subscriptions", subscriptionId, {
            userId: getString(sub.metadata?.userId) || null,
            status: sub.status,
            cancel_at_period_end: sub.cancel_at_period_end,
            current_period_start: sub.current_period_start
              ? new Date(sub.current_period_start * 1000)
              : null,
            current_period_end: sub.current_period_end
              ? new Date(sub.current_period_end * 1000)
              : null,
            customer:
              typeof sub.customer === "string"
                ? sub.customer
                : (sub.customer as Stripe.Customer | Stripe.DeletedCustomer)?.id ??
                  null,
            items:
              sub.items?.data?.map((it) => ({
                price: typeof it.price === "string" ? it.price : it.price?.id,
                product:
                  typeof it.price?.product === "string"
                    ? (it.price?.product as string)
                    : (it.price?.product as Stripe.Product)?.id,
                quantity: it.quantity ?? 1,
              })) ?? [],
            default_payment_method:
              typeof sub.default_payment_method === "string"
                ? sub.default_payment_method
                : sub.default_payment_method?.id ?? null,
            metadata: sub.metadata || {},
          });

          logger.info(`🔁 subscription handled: ${event.type}`, { subscriptionId });
          break;
        }

        /** === 4) Intents (log simple) === */
        case "payment_intent.succeeded": {
          const pi = event.data.object as Stripe.PaymentIntent;
          logger.info("✅ payment_intent.succeeded", { id: pi.id, amount: pi.amount });
          break;
        }
        case "payment_intent.payment_failed": {
          const pi = event.data.object as Stripe.PaymentIntent;
          logger.warn("❌ payment_intent.payment_failed", { id: pi.id, last_error: pi.last_payment_error?.message });
          break;
        }

        default:
          logger.info(`ℹ️  Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (err: any) {
      logger.error("[Webhook] Handler error:", err);
      res.status(500).send("Webhook handler error");
    }
  }
);
