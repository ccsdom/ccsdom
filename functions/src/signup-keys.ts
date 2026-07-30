// functions/src/signup-keys.ts
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

export const checkSignupUniqueness = onCall(
  { region: "europe-west9", cors: true, enforceAppCheck: false },
  async (req) => {
    const { siret, email } = (req.data || {}) as {
      siret?: string;
      email?: string;
    };

    if (!siret && !email) {
      throw new HttpsError(
        "invalid-argument",
        "Vous devez fournir au moins un SIRET ou un email."
      );
    }

    const db = admin.firestore();

    // ✅ On vérifie maintenant dans *les deux* collections
    const collectionsToCheck = ["client_requests", "clients"];

    const result: { siretExists: boolean; emailExists: boolean } = {
      siretExists: false,
      emailExists: false,
    };

    // ---- Vérif SIRET ----
    if (siret) {
      const siretClean = String(siret).trim();

      for (const col of collectionsToCheck) {
        const snap = await db
          .collection(col)
          .where("siret", "==", siretClean)
          .limit(1)
          .get();

        if (!snap.empty) {
          result.siretExists = true;
          break; // pas la peine de continuer
        }
      }
    }

    // ---- Vérif Email ----
    if (email) {
      const emailClean = String(email).trim().toLowerCase();

      for (const col of collectionsToCheck) {
        const snap = await db
          .collection(col)
          .where("email", "==", emailClean)
          .limit(1)
          .get();

        if (!snap.empty) {
          result.emailExists = true;
          break;
        }
      }
    }

    return result;
  }
);
