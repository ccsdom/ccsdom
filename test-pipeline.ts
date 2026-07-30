import * as admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

async function runTest() {
  const uid = "xlJg4I6HC8TO68UZ98dwGoYVBFz2"; // Samy's UID
  const email = "samy.demenagement@gmail.com";
  const now = Date.now();
  const testInvoiceId = `test_e2e_invoice_${now}`;

  console.log("--- TEST 1: INVOICE PIPELINE ---");
  const mockInvoice = {
    invoiceNumber: `FAC-TEST-${now.toString().slice(-4)}`,
    status: "paid",
    amountCents: 1500,
    addressKey: "paris",
    issuedAt: admin.firestore.FieldValue.serverTimestamp(),
    paidAt: admin.firestore.FieldValue.serverTimestamp(),
    clientId: uid,
    snapshot: {
      client: {
        name: "ONYX PROTECT",
        address: "9 RUE DE WATTIGNIES 75012 PARIS",
        email: email,
        siret: "98384173500027"
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
    },
    isTest: true
  };

  console.log(`Creating test invoice: ${testInvoiceId}`);
  await db.collection("invoices").doc(testInvoiceId).set(mockInvoice);

  console.log("\n--- TEST 2: WELCOME PACK PIPELINE (SIMULATED) ---");
  // Instead of triggering a whole new registration, we'll "touch" Samy's existing request
  // to trigger the sync logic if it was stuck, or we simulate the documents being ready.
  // Actually, to test the triggers accurately, we should simulate the PDF extension's output.
  
  // We'll just wait for the invoice one first as it's cleaner.
  console.log("\nWaiting for triggers to process... (check logs manually or monitor Firestore)");
  console.log(`Monitor Invoice: invoices/${testInvoiceId}`);
  console.log(`Monitor Mails: collection('mails').where('to', '==', '${email}')`);
}

runTest().catch(console.error);
