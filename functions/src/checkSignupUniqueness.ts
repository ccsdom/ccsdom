// functions/src/checkSignupUniqueness.ts

import { onCall, HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { adminDb } from "./_utils/admin";
import { SIGNUP_REQUEST_STATUS } from "./_config/signup-constants";
import * as admin from "firebase-admin";

const normalizeSiret = (value: unknown) =>
  String(value ?? "").replace(/\D/g, "");

const normalizeEmailLower = (value: unknown) =>
  String(value ?? "").trim().toLowerCase();

function isRejected(status: unknown) {
  const s = String(status ?? "").toLowerCase().trim();
  return s === SIGNUP_REQUEST_STATUS.REJECTED;
}

export const checkSignupUniqueness = onCall(
  { region: "europe-west9", cors: true },
  async (req) => {
    try {
      const data = req.data || {};
      const siret = normalizeSiret(data.siret);
      const emailLower = normalizeEmailLower(data.email);

      if (!siret && !emailLower) {
        throw new HttpsError(
          "invalid-argument",
          "Au moins un SIRET ou un email doit être fourni."
        );
      }

      const currentUid = req.auth?.uid || null;
      const db = admin.firestore();

      let siretExists = false;
      let emailExists = false;

      // -------------------------
      // Vérification SIRET
      // -------------------------
      if (siret) {
        const [clientsSiretSnap, requestsSiretSnap] = await Promise.all([
          db.collection("clients").where("siret", "==", siret).limit(10).get(),
          db.collection("client_requests").where("siret", "==", siret).limit(10).get(),
        ]);

        siretExists =
          clientsSiretSnap.docs.some((docSnap) => docSnap.id !== currentUid) ||
          requestsSiretSnap.docs.some(
            (docSnap) =>
              docSnap.id !== currentUid &&
              !isRejected(docSnap.data()?.status)
          );
      }

      // -------------------------
      // Vérification email
      // -------------------------
      if (emailLower) {
        const [clientsEmailSnap, requestsEmailSnap] = await Promise.all([
          db.collection("clients").where("emailLower", "==", emailLower).limit(10).get(),
          db.collection("client_requests").where("emailLower", "==", emailLower).limit(10).get(),
        ]);

        emailExists =
          clientsEmailSnap.docs.some((docSnap) => docSnap.id !== currentUid) ||
          requestsEmailSnap.docs.some(
            (docSnap) =>
              docSnap.id !== currentUid &&
              !isRejected(docSnap.data()?.status)
          );
      }

      logger.info("[checkSignupUniqueness] OK", {
        currentUid,
        siretChecked: !!siret,
        emailChecked: !!emailLower,
        siretExists,
        emailExists,
      });

      return {
        ok: true,
        siretExists,
        emailExists,
      };
    } catch (error: any) {
      logger.error("[checkSignupUniqueness] ERROR", {
        message: error?.message ?? String(error),
        stack: error?.stack,
      });

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError("internal", "Erreur serveur checkSignupUniqueness", {
        details: error?.message ?? String(error),
      });
    }
  }
);