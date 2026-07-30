// functions/src/_utils/admin.ts
import * as admin from "firebase-admin";

/**
 * Admin SDK init (idempotent)
 */
export function ensureAdminApp() {
  if (!admin.apps.length) {
    admin.initializeApp();
  }
  return admin.app();
}

ensureAdminApp();

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export const adminStorage = admin.storage();

/**
 * Alias pratique (FieldValue)
 */
export const AdminFieldValue = admin.firestore.FieldValue;

/**
 * Helper: serverTimestamp typé
 */
export const serverTimestamp = () => admin.firestore.FieldValue.serverTimestamp();