// functions/src/firebase-admin.ts
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  // En local, l'émulateur fournit les creds via les variables d'env
  // En prod, GCP fournit les creds au runtime
  admin.initializeApp();
}

export const db = admin.firestore();
// Option pratique pour éviter les erreurs quand un champ vaut `undefined`
db.settings({ ignoreUndefinedProperties: true });

export { admin };
