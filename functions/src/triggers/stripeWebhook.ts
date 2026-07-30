import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";
import { SIGNUP_REQUEST_STATUS } from "../_config/signup-constants";
import { INVOICE_STATUS, PDF_STATUS, SELLER_CONFIG } from "../_config/invoice-constants";
import {
  normalizeBillingFrequency,
  normalizeMailPlanId,
  planAmountCents,
  planFromStripePriceId,
} from "../_config/subscription-plans";
import Stripe from "stripe";

if (!admin.apps.length) admin.initializeApp();

const STRIPE_SECRET_KEY = defineSecret("STRIPE_SECRET_KEY");
const STRIPE_WEBHOOK_SECRET = defineSecret("STRIPE_WEBHOOK_SECRET");

let stripe: Stripe | null = null;
const db = admin.firestore();

function normalizeEmailLower(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function toAddressKey(value: unknown): "paris" | "orly" | null {
  const v = String(value ?? "").toLowerCase().trim();
  if (v === "paris" || v === "orly") return v;
  return null;
}

function stripeTimestamp(value: unknown): admin.firestore.Timestamp | null {
  const seconds = Number(value || 0);
  return seconds > 0 ? admin.firestore.Timestamp.fromMillis(seconds * 1000) : null;
}

function subscriptionSyncPatch(params: {
  planId?: string | null;
  frequency?: string | null;
  status?: string | null;
  customerId?: string | null;
  subscriptionId?: string | null;
  priceId?: string | null;
  currentPeriodEnd?: admin.firestore.Timestamp | null;
  cancelAtPeriodEnd?: boolean;
}) {
  const planId = normalizeMailPlanId(params.planId);
  const frequency = normalizeBillingFrequency(params.frequency);
  const now = admin.firestore.FieldValue.serverTimestamp();
  const patch: Record<string, any> = {
    subscriptionStatus: params.cancelAtPeriodEnd ? "canceling" : params.status || "active",
    subscriptionCancelAtPeriodEnd: params.cancelAtPeriodEnd === true,
    subscriptionRenewalDate: params.currentPeriodEnd || null,
    billingMode: "stripe_subscription",
    requiresRecurringPaymentSetup: false,
    recurringPaymentSetup: {
      status: "active",
      subscriptionId: params.subscriptionId || null,
      updatedAt: now,
    },
    stripeCheckout: {
      customerId: params.customerId || null,
      subscriptionId: params.subscriptionId || null,
      priceId: params.priceId || null,
      planId: planId || null,
      paymentFrequency: frequency,
      mode: "subscription",
      status: params.status || null,
      updatedAt: now,
    },
    updatedAt: now,
  };

  if (planId) {
    patch.planId = planId;
    patch.plan = planId;
    patch.mailPlanId = planId;
    patch.tier = planId === "business" ? "pro" : planId;
    patch.paymentFrequency = frequency;
    patch.subscriptionPlan = planId;
    patch.subscriptionAmountCents = planAmountCents(planId, frequency);
    patch.subscription = {
      plan: planId,
      frequency,
      status: params.cancelAtPeriodEnd ? "canceling" : params.status || "active",
      amountCents: planAmountCents(planId, frequency),
      currentPeriodEnd: params.currentPeriodEnd || null,
      cancelAtPeriodEnd: params.cancelAtPeriodEnd === true,
      updatedAt: now,
    };
  }

  return patch;
}

export const stripeWebhook = onRequest(
  {
    region: "europe-west1",
    secrets: [STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET],
    cors: false,
    minInstances: 0,
  },
  async (req: any, res: any) => {
    const sig = req.headers["stripe-signature"];
    if (!sig) {
      res.status(400).send("No signature");
      return;
    }

    const secret = STRIPE_SECRET_KEY.value();
    const webhookSecret = STRIPE_WEBHOOK_SECRET.value();

    if (!stripe) {
      stripe = new Stripe(secret, { typescript: true });
    }

    let stripeEvent: Stripe.Event;
    try {
      stripeEvent = stripe.webhooks.constructEvent(
        req.rawBody,
        sig as string | string[],
        webhookSecret
      );
    } catch (err: any) {
      logger.error("[stripeWebhook] Signature verification failed.", err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    try {
      const eventRef = db.doc(`processed_stripe_events/${stripeEvent.id}`);

      if (stripeEvent.type === 'checkout.session.completed' || stripeEvent.type === 'checkout.session.async_payment_succeeded') {
        const sessionObj = stripeEvent.data.object as any;
        
        const session = await stripe.checkout.sessions.retrieve(sessionObj.id, {
          expand: ["subscription", "payment_intent"],
        });

        const metadata = session.metadata || {};
        const uid = String(metadata.firebaseUID ?? "").trim() || String(session.client_reference_id ?? "").trim();
        const requestUid = String(metadata.requestUid ?? "").trim() || uid;

        if (!uid || !requestUid) {
          logger.warn(`[stripeWebhook] No UID or requestUid for session ${session.id}`);
          res.status(200).send("Ignored, no UID");
          return;
        }

        const paymentStatus = String(session.payment_status ?? "").trim();
        const mode = session.mode;
        const isPaid = paymentStatus === "paid" || session.status === "complete" || (!!session.subscription && paymentStatus === "no_payment_required");

        const customerEmail = normalizeEmailLower(session.customer_details?.email || session.customer_email);
        const now = admin.firestore.FieldValue.serverTimestamp();

        const requestRef = db.doc(`client_requests/${requestUid}`);
        const clientRef = db.doc(`clients/${uid}`);
        const currentYear = new Date().getFullYear();
        const counterRef = db.doc(`counters/invoices_${currentYear}`);
        const invoiceId = `inv_${session.id}`;
        const invoiceRef = db.collection("invoices").doc(invoiceId);

        await db.runTransaction(async (t) => {
          const [eventDoc, requestSnap, clientSnap, counterSnap, invoiceSnap] = await Promise.all([
            t.get(eventRef),
            t.get(requestRef),
            t.get(clientRef),
            t.get(counterRef),
            t.get(invoiceRef),
          ]);

          if (eventDoc.exists) throw new Error("ALREADY_PROCESSED");

          const requestData = (requestSnap.exists ? requestSnap.data() || {} : {}) as any;
          const clientData = (clientSnap.exists ? clientSnap.data() || {} : {}) as any;

          const finalAddressKey = toAddressKey(metadata.addressKey) || toAddressKey(requestData.addressKey) || "orly";
          const metadataPlanId = normalizeMailPlanId(metadata.mailPlanId || metadata.planId || requestData.mailPlanId);
          const metadataFrequency = normalizeBillingFrequency(metadata.paymentFrequency || requestData.paymentFrequency);
          const subscriptionObj = typeof session.subscription === "object" ? (session.subscription as any) : null;
          const subscriptionId = typeof session.subscription === "string" ? session.subscription : subscriptionObj?.id || null;
          const customerId = typeof session.customer === "string" ? session.customer : null;
          const subscriptionStatus = subscriptionObj?.status || (isPaid ? "active" : "pending");
          const subscriptionRenewalDate = stripeTimestamp(subscriptionObj?.current_period_end);
          const subscriptionPriceId =
            subscriptionObj?.items?.data?.[0]?.price?.id ||
            String(metadata.priceId || "").trim() ||
            null;

          t.set(eventRef, { processedAt: now, type: stripeEvent.type, status: "completed", sessionId: session.id });

          t.set(requestRef, {
            ownerUid: uid,
            uid,
            email: customerEmail || requestData.email || null,
            emailLower: customerEmail || requestData.emailLower || null,
            addressKey: finalAddressKey,
            ...(metadataPlanId
              ? {
                  mailPlanId: metadataPlanId,
                  paymentFrequency: metadataFrequency,
                  subscriptionStatus,
                  subscriptionPlan: metadataPlanId,
                  subscriptionAmountCents: planAmountCents(metadataPlanId, metadataFrequency),
                  subscriptionRenewalDate,
                  subscription: {
                    plan: metadataPlanId,
                    frequency: metadataFrequency,
                    status: subscriptionStatus,
                    amountCents: planAmountCents(metadataPlanId, metadataFrequency),
                    currentPeriodEnd: subscriptionRenewalDate,
                    cancelAtPeriodEnd: subscriptionObj?.cancel_at_period_end === true,
                    updatedAt: now,
                  },
                }
              : {}),
            stripeCheckout: {
              sessionId: session.id,
              customerId,
              subscriptionId,
              paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent as any)?.id || null,
              priceId: subscriptionPriceId,
              planId: metadataPlanId || null,
              paymentFrequency: metadataFrequency,
              mode: mode || null,
              status: session.status || null,
              paymentStatus: paymentStatus || null,
              verifiedAt: now,
            },
            requiresRecurringPaymentSetup: false,
            recurringPaymentSetup: {
              status: "active",
              subscriptionId,
              updatedAt: now,
            },
            invoiceId,
            paymentStatus: isPaid ? "paid" : "pending",
            status: isPaid ? (requestData.status === SIGNUP_REQUEST_STATUS.DOCS_READY ? SIGNUP_REQUEST_STATUS.DOCS_READY : requestData.status || SIGNUP_REQUEST_STATUS.PAYMENT_RECEIVED) : requestData.status || SIGNUP_REQUEST_STATUS.PAYMENT_PENDING,
            updatedAt: now,
            createdAt: requestSnap.exists ? requestData.createdAt || now : now,
          }, { merge: true });

          if (clientSnap.exists) {
            t.set(clientRef, {
              ownerUid: uid,
              uid,
              email: customerEmail || clientData.email || null,
              emailLower: customerEmail || clientData.emailLower || null,
              addressKey: finalAddressKey,
              ...(metadataPlanId
                ? subscriptionSyncPatch({
                    planId: metadataPlanId,
                    frequency: metadataFrequency,
                    status: subscriptionStatus,
                    customerId,
                    subscriptionId,
                    priceId: subscriptionPriceId,
                    currentPeriodEnd: subscriptionRenewalDate,
                    cancelAtPeriodEnd: subscriptionObj?.cancel_at_period_end === true,
                  })
                : {}),
              stripeCheckout: {
                ...(clientData.stripeCheckout || {}),
                sessionId: session.id,
                customerId,
                subscriptionId,
                paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent as any)?.id || null,
                priceId: subscriptionPriceId,
                planId: metadataPlanId || clientData.stripeCheckout?.planId || null,
                paymentFrequency: metadataFrequency || clientData.stripeCheckout?.paymentFrequency || null,
                mode: mode || null,
                status: session.status || null,
                paymentStatus: paymentStatus || null,
                verifiedAt: now,
              },
              paymentStatus: isPaid ? "paid" : clientData.paymentStatus || "pending",
              updatedAt: now,
              createdAt: clientData.createdAt || now,
            }, { merge: true });
          }

          if (!invoiceSnap.exists) {
            const nextNumber = (counterSnap.exists ? (counterSnap.data()?.lastNumber || 0) : 0) + 1;
            const invoiceNumber = `FAC-${currentYear}-${String(nextNumber).padStart(4, "0")}`;
            
            const clientSnapshot = {
              name: (requestData.companyName as string) || (requestData.contactName as string) || "Client Inconnu",
              email: (requestData.contactEmail as string) || customerEmail || "Inconnu",
              address: requestData.address || null,
              siret: (requestData.siret as string) || "En cours d'immatriculation",
            };

            const stripeBillingAddress = session.customer_details?.address ? {
              line1: session.customer_details.address.line1 || null,
              city: session.customer_details.address.city || null,
              postal_code: session.customer_details.address.postal_code || null,
              country: session.customer_details.address.country || null,
            } : null;

            t.set(invoiceRef, {
              id: invoiceId,
              invoiceNumber,
              status: INVOICE_STATUS.PAID,
              amountCents: session.amount_total || 0,
              currency: (session.currency || "eur").toUpperCase(),
              addressKey: finalAddressKey,
              planId: metadataPlanId || null,
              paymentFrequency: metadataFrequency,
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
                subscriptionId,
                priceId: subscriptionPriceId,
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

            t.set(counterRef, { lastNumber: nextNumber }, { merge: true });
          }
        });

        logger.info(`[stripeWebhook] Successfully processed payout for session ${session.id}`);
      
      } else if (stripeEvent.type === 'invoice.paid') {
        const paidInvoice = stripeEvent.data.object as any;
        
        if (paidInvoice.billing_reason === 'subscription_create') {
           await eventRef.set({ processedAt: admin.firestore.FieldValue.serverTimestamp(), type: stripeEvent.type, status: "ignored_subscription_create" });
           res.status(200).send("Handled invoice.paid (ignored create)");
           return;
        }

        const customerId = typeof paidInvoice.customer === "string" ? paidInvoice.customer : paidInvoice.customer?.id;
        if (!customerId) { res.status(200).send("No customer"); return; }

        const clientsSnap = await db.collection("clients").where("stripeCheckout.customerId", "==", customerId).limit(1).get();
        if (clientsSnap.empty) {
           logger.warn(`[stripeWebhook] invoice.paid : No client found for customer ${customerId}`);
           await eventRef.set({ processedAt: admin.firestore.FieldValue.serverTimestamp(), type: stripeEvent.type, status: "unmatched_customer" });
           res.status(200).send("Handled invoice.paid (unmatched)");
           return;
        }

        const clientRef = clientsSnap.docs[0].ref;
        const uid = clientsSnap.docs[0].id;
        const now = admin.firestore.FieldValue.serverTimestamp();

        await db.runTransaction(async (t) => {
            const eventDoc = await t.get(eventRef);
            if (eventDoc.exists) throw new Error("ALREADY_PROCESSED");
            
            const clientSnap = await t.get(clientRef);
            const clientData = (clientSnap.exists ? clientSnap.data() || {} : {}) as any;
            const priceId = paidInvoice.lines?.data?.[0]?.price?.id || null;
            const pricePlan = planFromStripePriceId(priceId);
            const planId =
              pricePlan?.planId ||
              normalizeMailPlanId(clientData.planId || clientData.mailPlanId || clientData.plan);
            const frequency =
              pricePlan?.frequency ||
              normalizeBillingFrequency(clientData.paymentFrequency || clientData.subscription?.frequency);
            const subscriptionId =
              typeof paidInvoice.subscription === "string"
                ? paidInvoice.subscription
                : paidInvoice.subscription?.id || clientData.stripeCheckout?.subscriptionId || null;
            const renewalDate = stripeTimestamp(paidInvoice.lines?.data?.[0]?.period?.end);
            
            t.set(eventRef, { processedAt: now, type: stripeEvent.type, status: "completed", invoiceId: paidInvoice.id });
            
            t.update(clientRef, {
               paymentStatus: 'paid',
               status: 'active',
               suspendedAt: admin.firestore.FieldValue.delete(),
               suspendedReason: admin.firestore.FieldValue.delete(),
               paymentFailedAt: admin.firestore.FieldValue.delete(),
               lastPaymentFailureInvoiceId: admin.firestore.FieldValue.delete(),
               lastPaymentFailureEmailQueuedAt: admin.firestore.FieldValue.delete(),
               accessBlockedReason: admin.firestore.FieldValue.delete(),
               paymentRestoredAt: now,
               ...(planId
                ? subscriptionSyncPatch({
                    planId,
                    frequency,
                    status: "active",
                    customerId,
                    subscriptionId,
                    priceId,
                    currentPeriodEnd: renewalDate,
                    cancelAtPeriodEnd: false,
                  })
                : { subscriptionStatus: 'active' }),
               updatedAt: now
            });

            t.set(db.collection("activity_logs").doc(), {
              type: "billing.payment_restored",
              action: "billing.payment_restored",
              actorUid: "stripe_webhook",
              actorRole: "system",
              targetUid: uid,
              targetEmail: clientData.email || clientData.emailLower || null,
              centerId: clientData.addressId || clientData.addressKey || null,
              addressKey: clientData.addressKey || null,
              clientId: uid,
              invoiceId: paidInvoice.id,
              status: "active",
              message: "Paiement régularisé, accès client rétabli",
              createdAt: now,
            });
            
            const currentYear = new Date().getFullYear();
            const counterRef = db.doc(`counters/invoices_${currentYear}`);
            const counterSnap = await t.get(counterRef);
            const nextNumber = (counterSnap.exists ? (counterSnap.data()?.lastNumber || 0) : 0) + 1;
            
            const invoiceNumber = `FAC-${currentYear}-${String(nextNumber).padStart(4, "0")}`;
            const internalInvoiceId = `inv_${paidInvoice.id}`;
            
            t.set(db.collection("invoices").doc(internalInvoiceId), {
              id: internalInvoiceId,
              invoiceNumber,
              status: INVOICE_STATUS.PAID,
              amountCents: paidInvoice.total || 0,
              currency: (paidInvoice.currency || "eur").toUpperCase(),
              addressKey: clientData.addressKey || "orly",
              planId: planId || null,
              paymentFrequency: frequency,
              clientId: uid,
              issuedAt: now,
              paidAt: now,
              stripeCreatedAt: admin.firestore.Timestamp.fromMillis(paidInvoice.created * 1000),
              type: "subscription",
              snapshot: {
                client: {
                   name: clientData.companyName || clientData.name || "Client",
                   email: clientData.email || "inconnu",
                   siret: clientData.siret || "N/A"
                },
                seller: SELLER_CONFIG,
              },
              stripe: {
                 invoiceId: paidInvoice.id,
                 subscriptionId,
                 priceId,
              },
              pdf: {
                 status: PDF_STATUS.PENDING,
                 createdAt: now,
                 updatedAt: now
              },
              createdAt: now,
              updatedAt: now,
            });
            t.set(counterRef, { lastNumber: nextNumber }, { merge: true });
        });
        logger.info(`[stripeWebhook] invoice.paid processed for billing renewal, client: ${uid}`);

      } else if (stripeEvent.type === 'invoice.payment_failed') {
        const failedInvoice = stripeEvent.data.object as any;
        const customerId = typeof failedInvoice.customer === "string" ? failedInvoice.customer : failedInvoice.customer?.id;
        if (!customerId) { res.status(200).send("No customer"); return; }
        
        const clientsSnap = await db.collection("clients").where("stripeCheckout.customerId", "==", customerId).limit(1).get();
        if (clientsSnap.empty) { res.status(200).send("Unmatched"); return; }
        
        const clientRef = clientsSnap.docs[0].ref;
        const uid = clientsSnap.docs[0].id;
        const now = admin.firestore.FieldValue.serverTimestamp();
        
        await db.runTransaction(async (t) => {
           const [eventDoc, clientSnap] = await Promise.all([
             t.get(eventRef),
             t.get(clientRef),
           ]);
           if (eventDoc.exists) throw new Error("ALREADY_PROCESSED");

           const clientData = (clientSnap.exists ? clientSnap.data() || {} : {}) as any;
           
           t.set(eventRef, { processedAt: now, type: stripeEvent.type, status: "completed" });
           
           const suspensionReason = "Paiement d'abonnement refusé par Stripe";
           const failureInvoiceId = String(failedInvoice.id || "");
           const clientEmail = clientData.email || clientData.emailLower;

           t.update(clientRef, {
              paymentStatus: "failed",
              subscriptionStatus: "past_due",
              status: "suspended",
              suspendedAt: now,
              suspendedReason: suspensionReason,
              paymentFailedAt: now,
              lastPaymentFailureInvoiceId: failureInvoiceId || null,
              accessBlockedReason: "payment_failed",
              ...(clientEmail ? { lastPaymentFailureEmailQueuedAt: now } : {}),
              updatedAt: now
           });

           t.set(db.collection("activity_logs").doc(), {
              type: "billing.payment_failed",
              action: "billing.payment_failed",
              actorUid: "stripe_webhook",
              actorRole: "system",
              targetUid: uid,
              targetEmail: clientData.email || clientData.emailLower || null,
              centerId: clientData.addressId || clientData.addressKey || null,
              addressKey: clientData.addressKey || null,
              clientId: uid,
              invoiceId: failureInvoiceId || null,
              status: "suspended",
              message: "Paiement échoué, accès courrier suspendu",
              createdAt: now,
           });
           
           if (clientEmail) {
             t.set(db.collection('mail_queue').doc(), {
                to: [clientEmail],
                message: {
                   subject: "CCS DOM : paiement refusé, action urgente requise",
                   html: `
                    <div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.6;max-width:620px;margin:auto;">
                      <div style="border:1px solid #fee2e2;border-radius:18px;padding:24px;background:#fff;">
                        <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#dc2626;">Incident de paiement</p>
                        <h2 style="margin:0 0 16px;color:#111827;">Votre abonnement nécessite une régularisation</h2>
                        <p>Bonjour,</p>
                        <p>Le prélèvement automatique de votre abonnement CCS DOM n'a pas pu être validé.</p>
                        <p>Par mesure de sécurité, <strong>l'accès à vos courriers et documents est temporairement suspendu</strong> jusqu'à régularisation.</p>
                        <p>Vos factures, votre abonnement et le support restent accessibles afin de mettre à jour votre moyen de paiement.</p>
                        <p style="margin:24px 0;">
                          <a href="https://ccsdom.fr/dashboard/subscription" style="display:inline-block;padding:12px 18px;background:#0284c7;color:#fff;text-decoration:none;border-radius:10px;font-weight:700;">Régulariser mon abonnement</a>
                        </p>
                        <p style="font-size:13px;color:#64748b;">Si vous avez déjà régularisé la situation, l'accès sera rétabli automatiquement après confirmation du paiement.</p>
                        <p>L'équipe CCS DOM</p>
                      </div>
                    </div>`
                },
                createdAt: now,
                source: "stripe_payment_failed",
                clientId: uid,
             });

           }
        });
        logger.info(`[stripeWebhook] invoice.payment_failed processed. Client SUSPENDED: ${uid}`);

      } else if (stripeEvent.type === 'customer.subscription.updated') {
         const subObj = stripeEvent.data.object as any;
         const customerId = typeof subObj.customer === "string" ? subObj.customer : subObj.customer?.id;
         if (!customerId) { res.status(200).send("No cx"); return; }

         const clientsSnap = await db.collection("clients").where("stripeCheckout.customerId", "==", customerId).limit(1).get();
         if (clientsSnap.empty) { res.status(200).send("Unmatched"); return; }

         const clientRef = clientsSnap.docs[0].ref;
         const priceId = subObj.items?.data?.[0]?.price?.id || null;
         const pricePlan = planFromStripePriceId(priceId);
         const metadataPlan = normalizeMailPlanId(subObj.metadata?.mailPlanId || subObj.metadata?.planId);
         const metadataFrequency = normalizeBillingFrequency(subObj.metadata?.paymentFrequency);
         const now = admin.firestore.FieldValue.serverTimestamp();

         await db.runTransaction(async (t) => {
            const eventDoc = await t.get(eventRef);
            if (eventDoc.exists) throw new Error("ALREADY_PROCESSED");

            t.set(eventRef, { processedAt: now, type: stripeEvent.type, status: "completed", subscriptionId: subObj.id });
            t.set(
              clientRef,
              subscriptionSyncPatch({
                planId: pricePlan?.planId || metadataPlan,
                frequency: pricePlan?.frequency || metadataFrequency,
                status: subObj.status || "active",
                customerId,
                subscriptionId: subObj.id,
                priceId,
                currentPeriodEnd: stripeTimestamp(subObj.current_period_end),
                cancelAtPeriodEnd: subObj.cancel_at_period_end === true,
              }),
              { merge: true }
            );
         });

         logger.info(`[stripeWebhook] customer.subscription.updated processed.`);
      } else if (stripeEvent.type === 'customer.subscription.deleted') {
         const subObj = stripeEvent.data.object as any;
         const customerId = typeof subObj.customer === "string" ? subObj.customer : subObj.customer?.id;
         if (!customerId) { res.status(200).send("No cx"); return; }
         
         const clientsSnap = await db.collection("clients").where("stripeCheckout.customerId", "==", customerId).limit(1).get();
         if (clientsSnap.empty) { res.status(200).send("Unmatched"); return; }
         
         const clientRef = clientsSnap.docs[0].ref;
         const now = admin.firestore.FieldValue.serverTimestamp();
         
         await db.runTransaction(async (t) => {
            const eventDoc = await t.get(eventRef);
            if (eventDoc.exists) throw new Error("ALREADY_PROCESSED");
            
            t.set(eventRef, { processedAt: now, type: stripeEvent.type, status: "completed" });
            
            t.update(clientRef, {
               status: 'inactive',
               paymentStatus: 'canceled',
               subscriptionStatus: 'canceled',
               subscriptionCancelAtPeriodEnd: false,
               subscriptionCancelledAt: now,
               updatedAt: now
            });
         });
         logger.info(`[stripeWebhook] customer.subscription.deleted processed. Client INACTIVE.`);
      }

      res.status(200).send("Webhook handled");

    } catch (e: any) {
        if (e.message === "ALREADY_PROCESSED") {
          logger.info(`[stripeWebhook] Event ${stripeEvent.id} already processed. Ignoring.`);
          res.status(200).send("Already processed");
          return;
        }
        logger.error(`[stripeWebhook] Error processing event ${stripeEvent.id}`, e);
        res.status(500).send("Internal Server Error");
    }
  }
);


