import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { logger } from "firebase-functions";
import Stripe from "stripe";

// Utilisation du secret Stripe Checkout deja configure
const STRIPE_SECRET_KEY = "STRIPE_SECRET_KEY";

function asPlainObject(value: unknown): Record<string, any> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, any>)
    : null;
}

function isAllowedReturnUrl(rawUrl: unknown): boolean {
  const value = String(rawUrl ?? "").trim();
  if (!value) return true;

  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();

    return (
      url.protocol === "https:" &&
      (host === "ccsdom.fr" ||
        host === "www.ccsdom.fr" ||
        host.endsWith(".hosted.app") ||
        host.endsWith(".cloudworkstations.dev"))
    ) || (
      url.protocol === "http:" &&
      (host === "localhost" || host === "127.0.0.1")
    );
  } catch {
    return false;
  }
}

export const createStripePortalSession = onCall(
  {
    secrets: [STRIPE_SECRET_KEY],
    region: "europe-west9",
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "L'utilisateur doit etre connecte.");
    }

    const uid = request.auth.uid;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2023-10-16" as any,
    });

    try {
      const db = admin.firestore();
      const clientRef = db.collection("clients").doc(uid);
      const clientDoc = await clientRef.get();

      if (!clientDoc.exists) {
        throw new HttpsError("not-found", "Profil client non trouve.");
      }

      const clientData = clientDoc.data() || {};
      const clientStripeCheckout = asPlainObject(clientData.stripeCheckout);
      let customerId = String(clientStripeCheckout?.customerId ?? "").trim();

      if (!customerId) {
        const requestUid = String(clientData.requestUid ?? uid).trim();
        const requestDoc = await db.collection("client_requests").doc(requestUid).get();
        const requestData = requestDoc.data() || {};
        const requestStripeCheckout = asPlainObject(requestData.stripeCheckout);
        const fallbackCustomerId = String(requestStripeCheckout?.customerId ?? "").trim();

        if (fallbackCustomerId) {
          customerId = fallbackCustomerId;

          await clientRef.set(
            {
              stripeCheckout: {
                ...(clientStripeCheckout || {}),
                ...(requestStripeCheckout || {}),
                customerId: fallbackCustomerId,
              },
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
          );

          logger.info(
            `[createStripePortalSession] Backfilled Stripe customerId from request ${requestUid} for ${uid}`
          );
        }
      }

      if (!customerId) {
        throw new HttpsError(
          "failed-precondition",
          "Aucun compte client Stripe associe a ce profil."
        );
      }

      const returnUrl = request.data.returnUrl || "https://ccsdom.fr/dashboard/subscription";
      if (!isAllowedReturnUrl(returnUrl)) {
        throw new HttpsError(
          "invalid-argument",
          "URL de retour non autorisee pour le portail Stripe."
        );
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      logger.info(
        `[createStripePortalSession] Portal session created for ${uid} (Customer: ${customerId})`
      );

      return { url: session.url };
    } catch (err: any) {
      logger.error("[createStripePortalSession] Error:", err);
      if (err instanceof HttpsError) {
        throw err;
      }
      throw new HttpsError(
        "internal",
        err.message || "Erreur lors de la creation de la session Stripe."
      );
    }
  }
);
