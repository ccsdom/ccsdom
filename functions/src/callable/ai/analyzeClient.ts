import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { analyzeClientFlow } from "../../ai/flows/analyzeClient";

/**
 * Analyse un client via l'IA Genkit.
 * Accessible uniquement aux administrateurs et gestionnaires.
 */
export const analyzeClient = onCall({ region: "europe-west9" }, async (request) => {
  // 1. Vérification de l'authentification
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "L'utilisateur doit être authentifié.");
  }

  // 2. Vérification des rôles (Security RBAC)
  const token = request.auth.token;
  const role = token.role as string;
  const allowedRoles = ["super_admin", "manager_paris", "manager_orly", "secretary_paris", "secretary_orly"];
  
  if (!allowedRoles.includes(role)) {
    throw new HttpsError("permission-denied", "Droits insuffisants pour lancer une analyse IA.");
  }

  const { clientData } = request.data;
  if (!clientData) {
    throw new HttpsError("invalid-argument", "Données client manquantes.");
  }

  try {
    logger.info(`[analyzeClient] Lancement de l'analyse pour: ${clientData.companyName || clientData.name}`);
    
    // 3. Exécution du flux Genkit
    const result = await analyzeClientFlow(clientData);
    
    return result;
  } catch (error: any) {
    logger.error("[analyzeClient] Erreur lors de l'analyse IA:", error);
    throw new HttpsError("internal", "Une erreur est survenue lors de l'analyse IA.");
  }
});
