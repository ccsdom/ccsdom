import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { performCreateInvoicePdfJob } from "./pdfJobs";

if (!admin.apps.length) admin.initializeApp();

export const testPdfGeneration = onCall({ region: "europe-west9" }, async (request) => {
  const db = admin.firestore();
  const invoiceId = "test_cloud_inv_" + Date.now();
  
  const mockInvoice = {
    invoiceNumber: "FAC-CLOUD-TEST-" + Date.now().toString().slice(-4),
    status: "paid",
    amountCents: 24000,
    addressKey: "paris",
    issuedAt: admin.firestore.Timestamp.now(),
    paidAt: admin.firestore.Timestamp.now(),
    clientId: "test_cloud_user",
    snapshot: {
      client: {
        name: "Cloud Test Client",
        address: "1 Cloud St, 75000 Paris",
        email: "cloud@test.com",
        siret: "12345678901234"
      },
      seller: {
        name: "CCS DOM",
        address: "123 Avenue de Paris",
        email: "contact@ccsdom.fr",
        siren: "123456789",
        tva: "FR123456789"
      }
    },
    pdf: {
      status: "pending"
    }
  };

  try {
    // 1. Create mock invoice
    await db.doc(`invoices/${invoiceId}`).set(mockInvoice);
    
    // 2. Trigger job creation
    const result = await performCreateInvoicePdfJob(invoiceId, mockInvoice);
    
    return {
      message: "Test initiated perfectly",
      invoiceId,
      jobId: result.jobId,
      result
    };
  } catch (error: any) {
    throw new HttpsError("internal", error.message);
  }
});
