import * as admin from "firebase-admin";

/**
 * Récupère et incrémente un compteur annuel atomique pour les factures.
 * Format: FAC-YYYY-XXXX
 */
export async function getNextInvoiceNumber(
  transaction: admin.firestore.Transaction,
  db: admin.firestore.Firestore
): Promise<string> {
  const year = new Date().getFullYear();
  const counterRef = db.doc(`metadata/counters/invoices/${year}`);
  
  const counterSnap = await transaction.get(counterRef);
  let nextValue = 1;

  if (counterSnap.exists) {
    const current = counterSnap.data()?.value || 0;
    nextValue = current + 1;
  }

  transaction.set(counterRef, { value: nextValue }, { merge: true });

  const sequence = String(nextValue).padStart(4, "0");
  return `FAC-${year}-${sequence}`;
}
