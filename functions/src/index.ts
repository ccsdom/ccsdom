// functions/src/index.ts
import { setGlobalOptions } from "firebase-functions/v2";
import * as admin from "firebase-admin";

import { GENAI_MODEL_NAME, DOCAI_PROCESSOR_NAME } from "./_config/secrets";

setGlobalOptions({
  region: "europe-west9",
  maxInstances: 5,
  // ✅ secrets globaux (dispos dans tous les modules)
  secrets: [GENAI_MODEL_NAME, DOCAI_PROCESSOR_NAME],
});

if (!admin.apps.length) admin.initializeApp();

/* ===========================
 * Exports — Callables / Triggers
 * =========================== */

export { setRole } from "./callable/roles/setRole";
export { adminDeleteUser } from "./callable/roles/adminDeleteUser";
export { analyzeClient } from "./callable/ai/analyzeClient";

export { approveSignup, rejectSignup, retryProvisioning } from "./adminSignups";

export { startRegistrationAnalysis } from "./startRegistrationAnalysis";

export { createPdfJobs } from "./pdfJobs";
export * from "./notifications";

export * from "./createStripeCheckoutSession";
export * from "./verifyStripeCheckoutSession";
export * from "./createStripePortalSession";
export * from "./manageClientSubscription";
export * from "./requestInvoicePdf";
export { listPublicCenters } from "./listPublicCenters";
export { askChatbot } from "./publicChatbot";
export { sendClientFollowUpEmail } from "./sendClientFollowUpEmail";
export { prepareClientFollowUp } from "./prepareClientFollowUp";
export * from "./triggers/stripeWebhook";

export { finalizeSignup } from "./finalizeSignup";

export { adminBulkUpdateClientsStatus } from "./admin/bulk-update-clients";
export { adminDeleteClientsBulk } from "./admin/admin-deleteclients-bulk";
export { adminUpdateClient } from "./admin/admin-update-client";
export { adminDeleteClient } from "./admin/admin-delete-client";
export { adminUpdateCenterGovernance } from "./admin/admin-update-center-governance";
export { adminInviteLegacyClient } from "./admin/admin-invite-legacy-client";

export { checkSignupUniqueness } from "./checkSignupUniqueness";
export { analyzeIdentityDocuments } from "./documentsAnalysis";
export { generateDocumentsFromData } from "./generateDocumentsFromData";
export * from "./triggers/pdf/syncPdfStatus";
export { onSignupRequestCreated, onSignupRequestUpdated, onInvoiceCreated, onInvoiceUpdated } from "./triggers/pdf/triggerPdfJobs";
export * from "./triggers/email/onDocumentReady";
export { syncRoleClaim } from "./triggers/users/syncRoleClaim";

export { testPdfGeneration } from "./testPdfGeneration";
// ✅ logs et envoi de mail centralisé pour les courriers
export { onMailDocumentCreated } from "./triggers/courriers/onMailDocumentCreated";
// ✅ alias du vrai nom exporté par le fichier (capture physique Storage)
export { handleNewMailUpload, handleNewScanUpload } from "./triggers/courriers/handleNewScanUpload";

export { cleanAbandonedDrafts } from "./crons/cleanAbandonedDrafts";
export { processManualSubscriptionRenewals } from "./crons/processManualSubscriptionRenewals";
export { sendDailyStaffSummaries } from "./crons/sendDailyStaffSummaries";
