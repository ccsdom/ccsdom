import * as admin from "firebase-admin";
import { performCreateInvoicePdfJob } from "./pdfJobs";

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: "bizhome-hub"
  });
}

async function runTest() {
  const invoiceId = "test_inv_" + Date.now();
  const mockInvoice = {
    invoiceNumber: "FAC-TEST-2026-0001",
    status: "paid",
    amountCents: 24000, // 240.00 € TTC
    addressKey: "paris",
    issuedAt: admin.firestore.Timestamp.now(),
    paidAt: admin.firestore.Timestamp.now(),
    clientId: "test_user_123",
    snapshot: {
      client: {
        name: "Test Client SARL",
        address: "1 Rue du Test, 75001 Paris",
        email: "test@client.com",
        siret: "12345678901234"
      },
      seller: {
        name: "CCS DOM",
        address: "123 Avenue de Paris, 75012 Paris",
        email: "contact@ccsdom.fr",
        siren: "123 456 789",
        tva: "FR123456789"
      }
    },
    pdf: {
      status: "pending"
    }
  };

  console.log("--- Début du Test PDF Facture ---");
  console.log("Invoice ID:", invoiceId);

  try {
    // 1. Créer la facture fictive
    await admin.firestore().doc(`invoices/${invoiceId}`).set(mockInvoice);
    console.log("Facture créée dans Firestore.");

    // 2. Appeler le dispatcher manuellement
    const result = await performCreateInvoicePdfJob(invoiceId, mockInvoice);
    console.log("Résultat du dispatcher:", JSON.stringify(result, null, 2));

    // 3. Vérifier le job créé
    const invoiceSnap = await admin.firestore().doc(`invoices/${invoiceId}`).get();
    const updatedInvoice = invoiceSnap.data();
    console.log("Statut PDF mis à jour:", updatedInvoice?.pdf?.status);
    console.log("Job ID:", updatedInvoice?.pdf?.jobId);

    if (updatedInvoice?.pdf?.jobId) {
      const jobSnap = await admin.firestore().doc(`pdf_requests_invoices_paris/${updatedInvoice.pdf.jobId}`).get();
      const jobData = jobSnap.data();
      console.log("Données du Job enrichies (extrait):");
      console.log("- Total Formatté:", jobData?.data?.totalFormatted);
      console.log("- TVA Formattée:", jobData?.data?.vatFormatted);
      console.log("- Client:", jobData?.data?.snapshot?.client?.name);
      console.log("- Seller SIRET (remap):", jobData?.data?.snapshot?.seller?.siret);
    }

    console.log("--- Fin du Test ---");
  } catch (error) {
    console.error("Erreur durant le test:", error);
  }
}

runTest();
