import * as admin from "firebase-admin";

export interface Invoice {
  id: string; // Document ID: inv_{stripeSessionId}
  invoiceNumber: string; // Ex: FAC-2026-0001
  type: "registration";
  status: "paid";
  requestId: string; // Extrait de metadata.requestUid (Obligatoire)
  clientId: string | null; // Extrait de metadata.firebaseUID (Nullable)
  
  issuedAt: admin.firestore.Timestamp | admin.firestore.FieldValue;
  paidAt: admin.firestore.Timestamp | admin.firestore.FieldValue;
  
  sellerSnapshot: {
    name: string;
    address: string;
    email: string;
    siret?: string;
    vat?: string;
  };
  clientSnapshot: {
    uid: string;
    companyName: string;
    fullName: string;
    address: string;
    email: string;
  };

  amount_cents: number; // Stripe amount_total
  currency: string;
  
  stripeData: {
    sessionId: string;
    paymentIntentId: string;
    customerId?: string;
  };

  pdf: {
    status: "pending" | "processing" | "complete" | "error";
    outputUrl: string | null;
    storagePath: string | null;
    error: string | null;
    updatedAt: admin.firestore.Timestamp | admin.firestore.FieldValue | null;
  };
}
