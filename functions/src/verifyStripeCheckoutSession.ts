// functions/src/verifyStripeCheckoutSession.ts

import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";
import Stripe from "stripe";
import { INVOICE_STATUS, PDF_STATUS, SELLER_CONFIG } from "./_config/invoice-constants";
import { SIGNUP_REQUEST_STATUS } from "./_config/signup-constants";

if (!admin.apps.length) admin.initializeApp();

const STRIPE_SECRET_KEY = defineSecret("STRIPE_SECRET_KEY");

let stripe: Stripe | null = null;

function normalizeEmailLower(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function toAddressKey(value: unknown): "paris" | "orly" | null {
  const v = String(value ?? "").toLowerCase().trim();
  if (v === "paris" || v === "orly") return v;
  return null;
}

export const verifyStripeCheckoutSession = onCall(
  {
    region: "europe-west1",
    secrets: [STRIPE_SECRET_KEY],
    cors: true,
  },
  async (request) => {
    try {
      const secret = STRIPE_SECRET_KEY.value();

      if (!secret) {
        throw new HttpsError(
          "failed-precondition",
          "Stripe n'est pas configuré côté serveur (clé secrète manquante)."
        );
      }

      if (!stripe) {
        stripe = new Stripe(secret, { typescript: true });
      }

      const uid = request.auth?.uid;
      if (!uid) {
        throw new HttpsError("unauthenticated", "Utilisateur non authentifié.");
      }

      const sessionId = String(request.data?.sessionId ?? "").trim();
      if (!sessionId) {
        throw new HttpsError("invalid-argument", "sessionId requis.");
      }

      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["subscription", "payment_intent"],
      });

      if (!session) {
        throw new HttpsError("not-found", "Session Stripe introuvable.");
      }

      const metadata = session.metadata || {};
      const firebaseUID = String(metadata.firebaseUID ?? "").trim();
      const clientReferenceId = String(session.client_reference_id ?? "").trim();
      const requestUid =
        String(metadata.requestUid ?? "").trim() ||
        clientReferenceId ||
        uid;

      if ((firebaseUID && firebaseUID !== uid) || (!firebaseUID && clientReferenceId && clientReferenceId !== uid)) {
        throw new HttpsError(
          "permission-denied",
          "Cette session Stripe n'appartient pas à l'utilisateur connecté."
        );
      }

      const paymentStatus = String(session.payment_status ?? "").trim();
      const mode = session.mode;
      const isPaid =
        paymentStatus === "paid" ||
        session.status === "complete" ||
        (!!session.subscription && paymentStatus === "no_payment_required");

      const customerEmail = normalizeEmailLower(
        session.customer_details?.email || session.customer_email
      );

      const addressKey = toAddressKey(metadata.addressKey) || "orly";

      // Fallback: If Webhook failed or was slow, and we confirm payment here, update Firestore.
      if (isPaid) {
        const db = admin.firestore();
        const now = admin.firestore.FieldValue.serverTimestamp();
        
        await db.runTransaction(async (t) => {
          const requestRef = db.doc(`client_requests/${requestUid}`);
          const clientRef = db.collection("clients").doc(uid);
          const invoiceId = `inv_${session.id}`;
          const invoiceRef = db.collection("invoices").doc(invoiceId);
          const currentYear = new Date().getFullYear();
          const counterRef = db.doc(`counters/invoices_${currentYear}`);

          // 1. ALL READS FIRST (Strictly before any writes)
          const [requestSnap, clientSnap, invoiceSnap, counterSnap] = await Promise.all([
            t.get(requestRef),
            t.get(clientRef),
            t.get(invoiceRef),
            t.get(counterRef)
          ]);

          const requestData = requestSnap.exists ? requestSnap.data() || {} : {};
          const isInvoiceExisting = invoiceSnap.exists;

          // 2. LOGIC & PREPARATION
          let nextNumber = (counterSnap.exists ? (counterSnap.data()?.lastNumber || 0) : 0);
          let invoiceNumber = "";

          // 3. ALL WRITES AFTER (Atomic block)
          
          // Mise à jour de la demande client (toujours)
          t.set(requestRef, {
            paymentStatus: "paid",
            updatedAt: now,
            status: requestData.status === SIGNUP_REQUEST_STATUS.DOCS_READY 
              ? SIGNUP_REQUEST_STATUS.DOCS_READY 
              : requestData.status || SIGNUP_REQUEST_STATUS.PAYMENT_RECEIVED,
            stripeCheckout: {
              status: session.status || "complete",
              paymentStatus: session.payment_status || "paid",
              verifiedAt: now,
              subscriptionId: typeof session.subscription === "string" ? session.subscription : (session.subscription as any)?.id || null,
              customerId: typeof session.customer === "string" ? session.customer : null,
            }
          }, { merge: true });

          // Création de la facture si elle n'existe pas encore
          if (clientSnap.exists) {
            const clientData = clientSnap.data() || {};
            t.set(clientRef, {
              ownerUid: uid,
              uid,
              email: clientData.email || customerEmail || requestData.email || null,
              emailLower: clientData.emailLower || customerEmail || requestData.emailLower || null,
              addressKey,
              stripeCheckout: {
                ...(clientData.stripeCheckout || {}),
                status: session.status || "complete",
                paymentStatus: session.payment_status || "paid",
                verifiedAt: now,
                subscriptionId: typeof session.subscription === "string" ? session.subscription : (session.subscription as any)?.id || null,
                customerId: typeof session.customer === "string" ? session.customer : null,
              },
              paymentStatus: "paid",
              status: "active",
              updatedAt: now,
            }, { merge: true });
          }

          if (!isInvoiceExisting) {
            nextNumber += 1; // Incrément
            invoiceNumber = `FAC-${currentYear}-${String(nextNumber).padStart(4, "0")}`;

            const clientSnapshot = {
              name: requestData.companyName || requestData.contactName || "Client Inconnu",
              email: requestData.contactEmail || customerEmail || "Inconnu",
              address: requestData.address || null,
              siret: requestData.siret || "En cours d'immatriculation",
            };

            const stripeBillingAddress = session.customer_details?.address ? {
              line1: session.customer_details.address.line1 || null,
              city: session.customer_details.address.city || null,
              postal_code: session.customer_details.address.postal_code || null,
              country: session.customer_details.address.country || null,
            } : null;

            // Création Facture
            t.set(invoiceRef, {
              id: invoiceId,
              invoiceNumber,
              status: INVOICE_STATUS.PAID,
              amountCents: session.amount_total || 0,
              currency: (session.currency || "eur").toUpperCase(),
              addressKey,
              requestId: requestUid,
              clientId: uid || null,
              issuedAt: now,
              paidAt: now,
              stripeCreatedAt: admin.firestore.Timestamp.fromMillis(session.created * 1000),
              type: "registration",
              snapshot: {
                client: clientSnapshot,
                stripeBillingAddress,
                seller: SELLER_CONFIG,
              },
              stripe: {
                sessionId: session.id,
                paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent as any)?.id || null,
              },
              pdf: {
                status: PDF_STATUS.PENDING,
                createdAt: now,
                updatedAt: now,
              },
              createdAt: now,
              updatedAt: now,
            });

            // Mise à jour du compteur
            t.set(counterRef, { lastNumber: nextNumber }, { merge: true });
            
            // Lien vers la facture dans le dossier
            t.update(requestRef, { invoiceId: invoiceId });
          }
        });

        logger.info("[verifyStripeCheckoutSession] Firestore synced manually via verify function", {
          uid,
          requestUid,
          sessionId: session.id,
        });
      }

      logger.info("[verifyStripeCheckoutSession] Vérification OK", {
        uid,
        sessionId: session.id,
        requestUid,
        paid: isPaid,
        paymentStatus,
        mode,
      });

      return {
        ok: true,
        paid: isPaid,
        status: paymentStatus || session.status || null,
        mode: mode || null,
        customer:
          typeof session.customer === "string" ? session.customer : null,
        subscriptionId:
          typeof session.subscription === "string"
            ? session.subscription
            : (session.subscription as any)?.id || null,
      };
    } catch (error: any) {
      logger.error("[verifyStripeCheckoutSession] ERROR", {
        message: error?.message ?? String(error),
        stack: error?.stack,
        code: error?.code,
      });

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError(
        "internal",
        "Erreur lors de la vérification de la session Stripe",
        error?.message ?? String(error)
      );
    }
  }
);
