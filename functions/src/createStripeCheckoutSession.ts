// functions/src/createStripeCheckoutSession.ts

import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";
import Stripe from "stripe";

if (!admin.apps.length) admin.initializeApp();

const STRIPE_SECRET_KEY = defineSecret("STRIPE_SECRET_KEY");

let stripe: Stripe | null = null;

const ALLOWED_STRIPE_PRICE_IDS = new Set([
  "price_1S170KCam0qbdqzzQ2MbafOg",
  "price_1S171gCam0qbdqzzTngDPaSO",
  "price_1S1739Cam0qbdqzzvFqXX7pc",
  "price_1S173wCam0qbdqzzWWnwQWNH",
  "price_1S174YCam0qbdqzzS3U4OZ2U",
  "price_1SD0JaCam0qbdqzzGRvIq8ks",
  "price_1SD0NCCam0qbdqzzSV1ldxBM",
  "price_1SD0OCCam0qbdqzzDsTe5gT2",
  "price_1SDKhHCam0qbdqzzGV8NO114",
  "price_1SDKi4Cam0qbdqzzsYAfwwkI",
]);

function normalizeEmailLower(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function toAddressKey(value: unknown): "paris" | "orly" | null {
  const v = String(value ?? "").toLowerCase().trim();
  if (v === "paris" || v === "orly") return v;
  return null;
}

function isAllowedRedirectUrl(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl);
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

export const createStripeCheckoutSession = onCall(
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
        stripe = new Stripe(secret, {
          typescript: true,
        });
      }

      const uid = request.auth?.uid;
      if (!uid) {
        throw new HttpsError(
          "unauthenticated",
          "Utilisateur non authentifié (UID manquant)."
        );
      }

      const {
        lineItems,
        successUrl,
        cancelUrl,
        mode,
        customerEmail,
        metadata,
      } = (request.data || {}) as {
        lineItems?: { price: string; quantity: number }[];
        successUrl?: string;
        cancelUrl?: string;
        mode?: "subscription" | "payment";
        customerEmail?: string;
        metadata?: Record<string, string>;
      };

      if (!Array.isArray(lineItems) || lineItems.length === 0) {
        throw new HttpsError(
          "invalid-argument",
          "lineItems est requis et doit contenir au moins un élément."
        );
      }

      const invalidItem = lineItems.find(
        (item) =>
          !item ||
          typeof item.price !== "string" ||
          typeof item.quantity !== "number" ||
          !Number.isFinite(item.quantity) ||
          item.quantity !== 1 ||
          !ALLOWED_STRIPE_PRICE_IDS.has(item.price)
      );

      if (invalidItem) {
        throw new HttpsError(
          "invalid-argument",
          "Chaque lineItem doit utiliser un prix Stripe autorise avec une quantite egale a 1."
        );
      }

      if (!successUrl || !cancelUrl) {
        throw new HttpsError(
          "invalid-argument",
          "successUrl et cancelUrl sont requis."
        );
      }

      try {
        new URL(successUrl);
        new URL(cancelUrl);
      } catch {
        throw new HttpsError(
          "invalid-argument",
          "successUrl et cancelUrl doivent être des URLs valides."
        );
      }

      if (!isAllowedRedirectUrl(successUrl) || !isAllowedRedirectUrl(cancelUrl)) {
        throw new HttpsError(
          "invalid-argument",
          "Les URLs de retour Stripe ne sont pas autorisees pour ce domaine."
        );
      }

      const finalMode: "subscription" | "payment" = mode || "subscription";
      const requestUid = String(metadata?.requestUid ?? "").trim() || uid;
      const emailLower = normalizeEmailLower(customerEmail);
      const addressKey = toAddressKey(metadata?.addressKey) || "orly";

      logger.info(`[createStripeCheckoutSession] Preparing session`, { 
        uid, 
        requestUid, 
        addressKey, 
        mode: finalMode 
      });

      const baseMetadata: Record<string, string> = {
        ...(metadata || {}),
        firebaseUID: uid,
        requestUid,
        addressKey,
      };

      const session = await stripe.checkout.sessions.create({
        mode: finalMode,
        line_items: lineItems,
        success_url: successUrl,
        cancel_url: cancelUrl,
        payment_method_types: ["card"],
        client_reference_id: uid,
        metadata: baseMetadata,
        automatic_tax: { enabled: true },
        subscription_data:
          finalMode === "subscription"
            ? { metadata: baseMetadata }
            : undefined,
        payment_intent_data:
          finalMode === "payment"
            ? { metadata: baseMetadata }
            : undefined,
        billing_address_collection: "required",
        allow_promotion_codes: true,
      });


      const db = admin.firestore();
      const now = admin.firestore.FieldValue.serverTimestamp();

      const requestRef = db.doc(`client_requests/${requestUid}`);
      const requestSnap = await requestRef.get();

      await requestRef.set(
        {
          ownerUid: uid,
          uid,
          email: emailLower || null,
          emailLower: emailLower || null,
          addressKey,
          stripeCheckout: {
            sessionId: session.id,
            url: session.url || null,
            mode: finalMode,
            status: "created",
          },
          paymentStatus: "checkout_created",
          updatedAt: now,
          ...(requestSnap.exists ? {} : { createdAt: now }),
        },
        { merge: true }
      );

      logger.info("[createStripeCheckoutSession] Session créée", {
        sessionId: session.id,
        uid,
        requestUid,
        mode: finalMode,
        addressKey,
      });

      return {
        url: session.url,
        sessionId: session.id,
      };
    } catch (error: any) {
      logger.error("[createStripeCheckoutSession] Erreur Stripe", {
        message: error?.message ?? String(error),
        stack: error?.stack,
        code: error?.code,
      });

      throw error instanceof HttpsError
        ? error
        : new HttpsError(
            "internal",
            "Erreur lors de la création de la session Stripe",
            error?.message ?? String(error)
          );
    }
  }
);
