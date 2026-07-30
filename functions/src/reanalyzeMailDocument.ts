import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

import { analyzeMailFlow } from "./ai/flows/analyzeMail";
import { DOCAI_PROCESSOR_NAME, GEMINI_API_KEY, GENAI_MODEL_NAME } from "./_config/secrets";
import {
  canTouchCenter,
  getCallerAccess,
  resolveCenterIdFromData,
} from "./_utils/auth";

if (!admin.apps.length) admin.initializeApp();

const db = admin.firestore();

const STAFF_ROLES = new Set([
  "super_admin",
  "manager",
  "manager_paris",
  "manager_orly",
  "secretary_paris",
  "secretary_orly",
]);

function normalizeString(input: unknown): string {
  return typeof input === "string" ? input.trim() : "";
}

function isUrgentAnalysis(analysis: any) {
  return analysis?.urgency === "high" || analysis?.actionRequired === true;
}

export const reanalyzeMailDocument = onCall(
  {
    region: "europe-west9",
    cors: true,
    timeoutSeconds: 300,
    memory: "1GiB",
    secrets: [GEMINI_API_KEY, GENAI_MODEL_NAME, DOCAI_PROCESSOR_NAME],
  },
  async (req) => {
    const caller = await getCallerAccess(req);

    if (!caller.role || !STAFF_ROLES.has(caller.role)) {
      throw new HttpsError("permission-denied", "Droits insuffisants pour relancer l'analyse.");
    }

    const mailId = normalizeString(req.data?.mailId);
    if (!mailId) {
      throw new HttpsError("invalid-argument", "mailId requis.");
    }

    const mailRef = db.collection("mails").doc(mailId);
    const mailSnap = await mailRef.get();

    if (!mailSnap.exists) {
      throw new HttpsError("not-found", "Courrier introuvable.");
    }

    const mailData = mailSnap.data() || {};
    const clientUid = normalizeString(mailData.clientUid || mailData.ownerUid || mailData.uid);
    const centerId = resolveCenterIdFromData(mailData);
    const storagePath = normalizeString(mailData.storagePath);
    const contentType = normalizeString(mailData.contentType || "application/pdf");

    if (!clientUid) {
      throw new HttpsError("failed-precondition", "Courrier sans client rattache.");
    }

    if (!canTouchCenter(caller.role, caller.managedCenterIds, centerId)) {
      throw new HttpsError("permission-denied", "Centre non autorise pour ce courrier.");
    }

    if (!storagePath) {
      throw new HttpsError("failed-precondition", "Le fichier du courrier est introuvable.");
    }

    const now = admin.firestore.FieldValue.serverTimestamp();
    const retryCount = Number(mailData.analysisRetryCount || 0) + 1;

    await mailRef.set({
      analysisStatus: "running",
      analysisError: null,
      analysisRetriedAt: now,
      analysisRetriedBy: caller.uid,
      analysisRetriedByRole: caller.role,
      analysisRetryCount: retryCount,
      updatedAt: now,
    }, { merge: true });

    try {
      logger.info("[reanalyzeMailDocument] AI analysis retry started", {
        mailId,
        storagePath,
        actorUid: caller.uid,
        centerId,
      });

      const analysis = await analyzeMailFlow({ storagePath, contentType });
      const urgent = isUrgentAnalysis(analysis);
      const nextStatus = urgent ? "Urgent" : (normalizeString(mailData.status) || "received");
      const completedAt = admin.firestore.FieldValue.serverTimestamp();

      await db.runTransaction(async (tx) => {
        tx.set(mailRef, {
          aiAnalysis: analysis,
          analysis,
          analysisStatus: "complete",
          analysisError: null,
          summary: analysis.summary || "Analyse IA terminee.",
          sender: analysis.sender || null,
          category: analysis.category || null,
          mailType: analysis.category || null,
          urgency: analysis.urgency || "low",
          actionRequired: analysis.actionRequired === true,
          extractedData: analysis.extractedData || null,
          status: nextStatus,
          analysisCompletedAt: completedAt,
          updatedAt: completedAt,
        }, { merge: true });

        tx.set(db.collection("activity_logs").doc(), {
          type: "mail.analysis_retried",
          createdAt: completedAt,
          actorUid: caller.uid,
          actorRole: caller.role,
          clientId: clientUid,
          centerKey: centerId,
          mailId,
          category: analysis.category || null,
          urgency: analysis.urgency || null,
          summary: analysis.summary || null,
        });
      });

      logger.info("[reanalyzeMailDocument] AI analysis retry complete", {
        mailId,
        actorUid: caller.uid,
        centerId,
        category: analysis.category,
        urgency: analysis.urgency,
      });

      return {
        ok: true,
        mailId,
        analysisStatus: "complete",
        category: analysis.category,
        urgency: analysis.urgency,
      };
    } catch (error: any) {
      const message = error?.message || String(error);

      await mailRef.set({
        analysisStatus: "failed",
        analysisError: message,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      logger.error("[reanalyzeMailDocument] AI analysis retry failed", {
        mailId,
        actorUid: caller.uid,
        centerId,
        error: message,
      });

      throw new HttpsError("internal", "L'analyse IA a echoue. Reessaie plus tard.", {
        mailId,
        reason: message,
      });
    }
  }
);
