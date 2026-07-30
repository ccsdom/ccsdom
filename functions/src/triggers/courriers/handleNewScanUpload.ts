import { onObjectFinalized } from "firebase-functions/v2/storage";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { getMailPlanPolicy, resolveMailPlanId } from "../../_config/mail-plan-policy";

if (!admin.apps.length) admin.initializeApp();

type ParsedPath = {
  centerKey: string;
  clientUid: string;
  fileName: string;
  fullPath: string;
};

function normalizeString(value: unknown) {
  return String(value ?? "").trim();
}

function basename(path: string) {
  const parts = path.split("/");
  return parts[parts.length - 1] || path;
}

function parseIncomingMailPath(fullPath: string): ParsedPath | null {
  const clean = normalizeString(fullPath);
  if (!clean) return null;

  const patterns = [
    /^courriers\/([^/]+)\/([^/]+)\/(.+)$/i,
    /^incoming-mails\/([^/]+)\/([^/]+)\/(.+)$/i,
    /^mailroom\/([^/]+)\/([^/]+)\/(.+)$/i,
    /^mails\/([^/]+)\/([^/]+)$/i, // Support du chemin legacy mails/{clientUid}/{fileName}
  ];

  for (const pattern of patterns) {
    const match = clean.match(pattern);
    if (match) {
      if (match.length === 4) {
        return {
          centerKey: match[1],
          clientUid: match[2],
          fileName: match[3],
          fullPath: clean,
        };
      } else if (match.length === 3) {
        return {
          centerKey: "agence", // Fallback pour les chemins à 2 niveaux comme mails/
          clientUid: match[1],
          fileName: match[2],
          fullPath: clean,
        };
      }
    }
  }

  return null;
}

export const handleNewMailUpload = onObjectFinalized(
  {
    region: "europe-west9",
    cpu: 1,
    memory: "512MiB",
    maxInstances: 3,
  },
  async (event) => {
    const object = event.data;
    const fullPath = normalizeString(object.name);
    const contentType = normalizeString(object.contentType || "application/octet-stream");

    if (!fullPath) {
      logger.info("[handleNewMailUpload] objet sans chemin, ignoré");
      return;
    }

    const parsed = parseIncomingMailPath(fullPath);
    if (!parsed) {
      logger.info("[handleNewMailUpload] chemin non concerné, ignoré", {
        fullPath,
      });
      return;
    }

    const { centerKey, clientUid, fileName } = parsed;
    const db = admin.firestore();
    const now = admin.firestore.FieldValue.serverTimestamp();

    try {
      const duplicateSnap = await db
        .collection("mails") // <-- CORRECTION ICI: on n'utilise plus courriers
        .where("storagePath", "==", fullPath)
        .limit(1)
        .get();

      if (!duplicateSnap.empty) {
        logger.info("[handleNewMailUpload] courrier déjà indexé", {
          fullPath,
          existingId: duplicateSnap.docs[0].id,
        });
        return;
      }

      const clientRef = db.doc(`clients/${clientUid}`);
      const clientSnap = await clientRef.get();
      const clientData = clientSnap.exists ? clientSnap.data() || {} : {};
      const planId = resolveMailPlanId(clientData);
      const mailPolicy = getMailPlanPolicy(planId);

      if (!mailPolicy.scanEnabled) {
        await db.collection("activity_logs").add({
          type: "mail.scan_blocked_by_plan",
          actorUid: "system",
          actorRole: "system",
          clientId: clientUid,
          centerKey,
          planId,
          storagePath: fullPath,
          fileName: basename(fileName),
          createdAt: now,
        });

        logger.warn("[handleNewMailUpload] scan ignored because plan does not include digital mail", {
          clientUid,
          centerKey,
          planId,
          storagePath: fullPath,
        });
        return;
      }

      const companyName = normalizeString(
        clientData.companyName || clientData.name || ""
      );

      const mailDoc = {
        ownerUid: clientUid,
        clientUid,
        centerKey,
        companyName: companyName || null,
        fileName: basename(fileName),
        storagePath: fullPath,
        contentType,
        size: Number(object.size || 0),
        bucket: normalizeString(object.bucket),
        generation: normalizeString(object.generation),
        status: "received",
        source: "scan_upload", // Source = Scan upload (automatique via Storage)
        planId,
        mailPolicy,
        summary:
          contentType.includes("pdf")
            ? "Courrier PDF reçu et indexé."
            : contentType.startsWith("image/")
            ? "Courrier image reçu et indexé."
            : "Nouveau courrier reçu et indexé.",
        actionRequired: false,
        receivedAt: now,
        createdAt: now,
        updatedAt: now,
      };

      const mailRef = db.collection("mails").doc(); // <-- on pousse dans "mails"
      await mailRef.set(mailDoc);                   // On set juste, le Firestore Trigger (onMailDocumentCreated) fera le reste

      logger.info("[handleNewMailUpload] courrier indexé, Firestore Event déclenché", {
        clientUid,
        centerKey,
        fileName: basename(fileName),
        storagePath: fullPath,
        mailId: mailRef.id
      });
    } catch (error: any) {
      logger.error("[handleNewMailUpload] ERROR", {
        message: error?.message || String(error),
        stack: error?.stack,
        fullPath,
        clientUid,
      });
      throw error;
    }
  }
);

// alias optionnel si tu veux garder l’ancien nom public
export const handleNewScanUpload = handleNewMailUpload;
