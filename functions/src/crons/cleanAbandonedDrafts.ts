import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { SIGNUP_REQUEST_STATUS } from "../_config/signup-constants";

if (!admin.apps.length) admin.initializeApp();

const db = admin.firestore();
const storage = admin.storage();

export const cleanAbandonedDrafts = onSchedule(
  {
    schedule: "0 3 * * *", // Tous les jours à 3h du matin
    timeZone: "Europe/Paris",
    region: "europe-west1",
    retryCount: 3,
  },
  async (event) => {
    try {
      const now = Date.now();
      const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
      const cutoffTime = now - THIRTY_DAYS_MS;
      const cutoffDate = admin.firestore.Timestamp.fromMillis(cutoffTime);

      logger.info(`[cleanAbandonedDrafts] Démarrage du nettoyage. Cutoff date: ${cutoffDate.toDate().toISOString()}`);

      // On recherche les drafts modifiés pour la dernière fois il y a plus de 30 jours.
      // On vérifie le statut `draft`
      const draftsSnapshot = await db.collection("client_requests")
        .where("status", "==", SIGNUP_REQUEST_STATUS.DRAFT)
        .where("updatedAt", "<=", cutoffDate)
        .limit(100)
        .get();

      if (draftsSnapshot.empty) {
         logger.info("[cleanAbandonedDrafts] Aucun draft abandonné trouvé.");
         return;
      }

      const batch = db.batch();
      let deletedCount = 0;

      for (const doc of draftsSnapshot.docs) {
         const uid = doc.id; // L'ID du brouillon correspond généralement à l'uid

         // 1. Supprimer les fichiers dans Storage
         try {
            const bucket = storage.bucket();
            const prefix = `clients/${uid}/`;
            const [files] = await bucket.getFiles({ prefix });
            
            if (files.length > 0) {
              const deletePromises = files.map(file => file.delete());
              await Promise.all(deletePromises);
              logger.debug(`[cleanAbandonedDrafts] Fichiers supprimés pour ${uid}`);
            }
         } catch (err) {
            logger.warn(`[cleanAbandonedDrafts] Erreur suppression Storage pour ${uid}:`, err);
         }

         // 2. Supprimer potentiellement l'utilisateur anonyme de Auth
         try {
            const userRecord = await admin.auth().getUser(uid);
            if (userRecord.providerData.length === 0) { // S'assure que c'est un compte anonyme
                await admin.auth().deleteUser(uid);
                logger.debug(`[cleanAbandonedDrafts] Utilisateur anonyme supprimé: ${uid}`);
            }
         } catch (err: any) {
            if (err.code !== 'auth/user-not-found') {
                logger.warn(`[cleanAbandonedDrafts] Erreur suppression Auth pour ${uid}:`, err);
            }
         }

         // 3. Préparer la suppression du document Firestore
         batch.delete(doc.ref);
         deletedCount++;
      }

      await batch.commit();
      logger.info(`[cleanAbandonedDrafts] Nettoyage terminé. ${deletedCount} brouillons supprimés.`);

    } catch (error) {
      logger.error("[cleanAbandonedDrafts] Erreur globale lors du nettoyage:", error);
    }
  }
);
