import { onDocumentUpdated, onDocumentCreated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { performCreatePdfJobs, performCreateInvoicePdfJob } from "../../pdfJobs";

if (!admin.apps.length) admin.initializeApp();

/**
 * Trigger de secours pour garantir la création des PDF (Contrat/Attestation)
 * dès que la demande passe en 'pending_validation'.
 */
async function handleSignupRequestPdfTrigger(uid: string, before: any, after: any) {
  // 1. Conditions de déclenchement :
  // - Transition vers pending_validation
  // - OU ajout d'une signature alors qu'on est déjà en pending_validation
  const wasPending = before?.status === "pending_validation";
  const isPending = after?.status === "pending_validation";
  const justSigned = !before?.signatureUrl && after?.signatureUrl;

  const shouldTrigger = (isPending && !wasPending) || (isPending && justSigned);

  if (!shouldTrigger) return;

  // 2. Garde-fou anti-boucle : si déjà complet (contractId + attestationId), on arrête.
  const pdfJobs = after.pdfJobs || {};
  if (pdfJobs.contractId && pdfJobs.attestationId) {
    logger.debug(`[triggerPdfJobs] Déjà complet pour ${uid}. Skipping.`);
    return;
  }

  try {
    logger.info(`[triggerPdfJobs] Déclenchement création PDF pour ${uid}`, { 
      hasContract: !!after.pdfPublish?.contract, 
      hasAttestation: !!after.pdfPublish?.attestation,
      hasSignature: !!after.signatureUrl,
      email: after.email
    });
    
    await performCreatePdfJobs(after.ownerUid || uid, uid, after);
    logger.info(`[triggerPdfJobs] Succès pour ${uid}`);
  } catch (error: any) {
    logger.error(`[triggerPdfJobs] Échec critique pour ${uid}:`, {
      message: error.message,
      stack: error.stack,
      uid
    });
  }
}

export const onSignupRequestCreated = onDocumentCreated(
  { 
    region: "europe-west9", 
    document: "client_requests/{uid}" 
  },
  async (event) => {
    if (!event.data) return;
    await handleSignupRequestPdfTrigger(event.params.uid, null, event.data.data());
  }
);

export const onSignupRequestUpdated = onDocumentUpdated(
  { 
    region: "europe-west9", 
    document: "client_requests/{uid}" 
  },
  async (event) => {
    if (!event.data) return;
    await handleSignupRequestPdfTrigger(
      event.params.uid, 
      event.data.before.data(), 
      event.data.after.data()
    );
  }
);

/**
 * Trigger automatique à la création d'une facture.
 * Si le statut PDF est 'pending', on lance la génération.
 */
export const onInvoiceCreated = onDocumentCreated(
  { 
    region: "europe-west9", 
    document: "invoices/{invoiceId}" 
  },
  async (event) => {
    if (!event.data) return;
    const invoiceData = event.data.data();
    const invoiceId = event.params.invoiceId;
    
    try {
      logger.info(`[triggerPdfJobs] Déclenchement création PDF FACTURE pour ${invoiceId}`, {
        invoiceNumber: invoiceData.invoiceNumber,
        status: invoiceData.status,
        hasPdf: !!invoiceData.pdf
      });
      
      await performCreateInvoicePdfJob(invoiceId, invoiceData);
      logger.info(`[triggerPdfJobs] Succès Facture pour ${invoiceId}`);
    } catch (error: any) {
      logger.error(`[triggerPdfJobs] Échec Facture pour ${invoiceId}:`, {
        message: error.message,
        stack: error.stack,
        invoiceId
      });
    }
  }
);

/**
 * Trigger de secours/manuel via modification du document.
 * Utilisé par le frontend en mettant pdf.status = 'pending'.
 */
export const onInvoiceUpdated = onDocumentUpdated(
  { 
    region: "europe-west9", 
    document: "invoices/{invoiceId}" 
  },
  async (event) => {
    if (!event.data) return;
    const before = event.data.before.data();
    const after = event.data.after.data();

    const wasPending = (before.pdf?.status === "pending" || before.pdf?.status === "processing");
    const isPending = (after.pdf?.status === "pending");

    if (!isPending || wasPending) return;

    logger.info(`[onInvoiceUpdated] Manuel trigger for ${event.params.invoiceId}`, { 
      addressKey: after.addressKey,
      status: after.status
    });

    logger.info(`[onInvoiceUpdated] Demande MANUELLE pour ${event.params.invoiceId}`);
    
    try {
      await performCreateInvoicePdfJob(event.params.invoiceId, after, {
        force: true,
      });
    } catch (err: any) {
      logger.error(`[onInvoiceUpdated] Échec pour ${event.params.invoiceId}`, { message: err.message });
    }
  }
);
