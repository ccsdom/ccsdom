import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

import { analyzeMailFlow } from "../../ai/flows/analyzeMail";
import { DOCAI_PROCESSOR_NAME, GEMINI_API_KEY, GENAI_MODEL_NAME } from "../../_config/secrets";
import { getMailPlanPolicy, resolveMailPlanId } from "../../_config/mail-plan-policy";

if (!admin.apps.length) admin.initializeApp();

const db = admin.firestore();
const EMAIL_QUEUE_SOURCE = "email_queue";
const CLIENT_MAIL_URL = "https://ccsdom.fr/dashboard/mail";

type MailAnalysis = {
  sender?: string;
  category?: string;
  urgency?: "low" | "medium" | "high";
  summary?: string;
  actionRequired?: boolean;
  extractedData?: {
    amountDue?: number;
    dueDate?: string;
    invoiceNumber?: string;
  };
};

function normalizeString(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeEmail(value: unknown) {
  return normalizeString(value).toLowerCase();
}

function escapeHtml(value: unknown) {
  return normalizeString(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isEmailQueueDocument(data: Record<string, any>) {
  return Boolean(data.message && data.to && !data.clientUid && !data.ownerUid && !data.storagePath);
}

function formatCenterLabel(centerKey: string) {
  const normalized = centerKey.toLowerCase();
  if (normalized === "paris" || normalized === "paris_12e") return "Paris 12e";
  if (normalized === "orly" || normalized === "orly_ville") return "Orly";
  return centerKey || "Votre centre";
}

function isUrgentAnalysis(analysis: MailAnalysis | null) {
  return analysis?.urgency === "high" || analysis?.actionRequired === true;
}

function buildSubject(companyName: string, analysis: MailAnalysis | null) {
  if (isUrgentAnalysis(analysis)) {
    return `URGENT CCS DOM - Courrier a traiter pour ${companyName || "votre societe"}`;
  }

  return `CCS DOM - Nouveau courrier disponible pour ${companyName || "votre societe"}`;
}

function buildHtml(title: string, body: string, ctaText?: string, ctaUrl?: string) {
  const cta =
    ctaText && ctaUrl
      ? `<p style="margin-top:16px"><a href="${ctaUrl}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px">${escapeHtml(ctaText)}</a></p>`
      : "";

  return `
    <div style="font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.6;color:#111827">
      <h2 style="margin:0 0 12px">${escapeHtml(title)}</h2>
      <div style="font-size:14px">${body}</div>
      ${cta}
      <p style="margin-top:20px">-- <strong>CCS DOM</strong></p>
    </div>
  `;
}

function buildNotificationBody(params: {
  companyName: string;
  centerLabel: string;
  fileName: string;
  analysis: MailAnalysis | null;
}) {
  const { companyName, centerLabel, fileName, analysis } = params;
  const urgent = isUrgentAnalysis(analysis);
  const summary = normalizeString(analysis?.summary);
  const sender = normalizeString(analysis?.sender);
  const category = normalizeString(analysis?.category);
  const amountDue = analysis?.extractedData?.amountDue;
  const dueDate = normalizeString(analysis?.extractedData?.dueDate);
  const invoiceNumber = normalizeString(analysis?.extractedData?.invoiceNumber);

  return `
    <p>Bonjour,</p>
    <p>Un nouveau courrier a ete recu pour <strong>${escapeHtml(companyName || "votre societe")}</strong>.</p>
    ${
      urgent
        ? `<p style="padding:10px 12px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;color:#991b1b"><strong>Attention :</strong> ce courrier semble necessiter une action rapide.</p>`
        : ""
    }
    <ul style="padding-left:18px">
      <li><strong>Centre :</strong> ${escapeHtml(centerLabel)}</li>
      <li><strong>Document :</strong> ${escapeHtml(fileName || "Document scanne")}</li>
      ${sender ? `<li><strong>Expediteur detecte :</strong> ${escapeHtml(sender)}</li>` : ""}
      ${category ? `<li><strong>Type de document :</strong> ${escapeHtml(category)}</li>` : ""}
      ${summary ? `<li><strong>Resume IA :</strong> ${escapeHtml(summary)}</li>` : ""}
      ${amountDue ? `<li><strong>Montant detecte :</strong> ${escapeHtml(`${amountDue} EUR`)}</li>` : ""}
      ${dueDate ? `<li><strong>Date limite detectee :</strong> ${escapeHtml(dueDate)}</li>` : ""}
      ${invoiceNumber ? `<li><strong>Reference :</strong> ${escapeHtml(invoiceNumber)}</li>` : ""}
    </ul>
    <p>Vous pouvez consulter le courrier dans votre espace client.</p>
  `;
}

function buildNotificationText(params: {
  companyName: string;
  centerLabel: string;
  fileName: string;
  analysis: MailAnalysis | null;
}) {
  const { companyName, centerLabel, fileName, analysis } = params;
  const lines = [
    "Bonjour,",
    "",
    `Un nouveau courrier a ete recu pour ${companyName || "votre societe"}.`,
    `Centre : ${centerLabel}`,
    `Document : ${fileName || "Document scanne"}`,
  ];

  if (isUrgentAnalysis(analysis)) lines.push("Attention : ce courrier semble necessiter une action rapide.");
  if (analysis?.sender) lines.push(`Expediteur detecte : ${analysis.sender}`);
  if (analysis?.category) lines.push(`Type de document : ${analysis.category}`);
  if (analysis?.summary) lines.push(`Resume IA : ${analysis.summary}`);
  if (analysis?.extractedData?.amountDue) lines.push(`Montant detecte : ${analysis.extractedData.amountDue} EUR`);
  if (analysis?.extractedData?.dueDate) lines.push(`Date limite detectee : ${analysis.extractedData.dueDate}`);
  if (analysis?.extractedData?.invoiceNumber) lines.push(`Reference : ${analysis.extractedData.invoiceNumber}`);

  lines.push("", "Consultez votre espace client : https://ccsdom.fr/dashboard/mail", "", "CCS DOM");
  return lines.join("\n");
}

async function queueEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
  mailId: string;
  clientUid: string;
  urgent: boolean;
}) {
  const ref = db.collection("mails").doc();

  await ref.set({
    to: [params.to],
    message: {
      subject: params.subject,
      html: params.html,
      text: params.text,
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    source: EMAIL_QUEUE_SOURCE,
    metadata: {
      type: "client_mail_notification",
      mailId: params.mailId,
      ownerUid: params.clientUid,
      urgent: params.urgent,
    },
  });

  return ref.id;
}

async function waitForStorageFile(storagePath: string) {
  const bucket = admin.storage().bucket();
  const file = bucket.file(storagePath);

  for (let attempt = 1; attempt <= 6; attempt += 1) {
    const [exists] = await file.exists();
    if (exists) return true;
    await sleep(attempt * 750);
  }

  return false;
}

export const onMailDocumentCreated = onDocumentCreated(
  {
    document: "mails/{mailId}",
    region: "europe-west9",
    cpu: 1,
    memory: "1GiB",
    secrets: [GEMINI_API_KEY, GENAI_MODEL_NAME, DOCAI_PROCESSOR_NAME],
    timeoutSeconds: 300,
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const data = snap.data() || {};
    const mailId = event.params.mailId;

    if (isEmailQueueDocument(data)) {
      logger.debug("[onMailDocumentCreated] email queue document ignored", { mailId });
      return;
    }

    const clientUid = normalizeString(data.clientUid || data.ownerUid || data.uid);
    if (!clientUid) {
      logger.warn("[onMailDocumentCreated] mail without clientUid ignored", { mailId });
      return;
    }

    const centerKey = normalizeString(data.centerKey || data.centerId || "agence");
    const fileName = normalizeString(data.fileName || mailId);
    const storagePath = normalizeString(data.storagePath);
    const contentType = normalizeString(data.contentType || "application/pdf");
    const dbNow = admin.firestore.FieldValue.serverTimestamp();
    const clientRef = db.doc(`clients/${clientUid}`);
    const mailRef = db.doc(`mails/${mailId}`);

    try {
      const clientSnap = await clientRef.get();
      const clientData = clientSnap.exists ? clientSnap.data() || {} : {};
      const companyName = normalizeString(data.companyName || clientData.companyName || clientData.name);
      const clientEmail = normalizeEmail(clientData.emailLower || clientData.email || data.clientEmail || data.email);
      const centerLabel = formatCenterLabel(centerKey);
      const planId = resolveMailPlanId({ ...clientData, ...data });
      const mailPolicy = getMailPlanPolicy(planId);

      if (!mailPolicy.scanEnabled) {
        await mailRef.set({
          planId,
          mailPolicy,
          analysisStatus: "skipped",
          analysisSkippedReason: "plan_without_digital_mail",
          clientNotification: {
            status: "skipped",
            reason: "plan_without_notification",
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          summary: "Courrier recu hors offre digitale.",
          status: "scan_not_included",
          updatedAt: dbNow,
        }, { merge: true });

        await db.collection("activity_logs").add({
          type: "mail.digital_processing_skipped",
          actorUid: "system",
          actorRole: "system",
          clientId: clientUid,
          centerKey,
          mailId,
          planId,
          reason: "plan_without_digital_mail",
          createdAt: dbNow,
        });

        logger.info("[onMailDocumentCreated] digital mail processing skipped by plan", {
          mailId,
          clientUid,
          planId,
        });
        return;
      }

      let aiAnalysis: MailAnalysis | null = null;
      let analysisStatus: "skipped" | "complete" | "failed" = "skipped";
      let analysisSkippedReason: string | null = mailPolicy.aiSummaryEnabled
        ? storagePath && contentType
          ? null
          : "missing_storage_file"
        : "plan_without_ai_summary";

      if (mailPolicy.aiSummaryEnabled && storagePath && contentType) {
        try {
          const fileReady = await waitForStorageFile(storagePath);
          if (!fileReady) {
            throw new Error(`Storage file not available after retry: ${storagePath}`);
          }

          logger.info("[onMailDocumentCreated] AI analysis started", { mailId, storagePath });
          aiAnalysis = await analyzeMailFlow({ storagePath, contentType });
          analysisStatus = "complete";
          analysisSkippedReason = null;
        } catch (aiError: any) {
          analysisStatus = "failed";
          analysisSkippedReason = null;
          logger.error("[onMailDocumentCreated] AI analysis failed", {
            mailId,
            error: aiError?.message || String(aiError),
          });
        }
      }

      const notificationAnalysis = mailPolicy.aiSummaryEnabled ? aiAnalysis : null;
      const urgent = mailPolicy.priorityAlertEnabled && isUrgentAnalysis(aiAnalysis);
      const status = urgent ? "Urgent" : "received";
      const batch = db.batch();

      batch.set(clientRef, { lastMailAt: dbNow, updatedAt: dbNow }, { merge: true });

      batch.set(mailRef, {
        planId,
        mailPolicy,
        aiAnalysis: mailPolicy.aiSummaryEnabled ? aiAnalysis || null : null,
        analysis: mailPolicy.aiSummaryEnabled ? aiAnalysis || null : null,
        analysisStatus,
        analysisSkippedReason,
        summary: notificationAnalysis?.summary || data.summary || "Nouveau courrier recu et indexe.",
        sender: notificationAnalysis?.sender || null,
        category: notificationAnalysis?.category || null,
        mailType: notificationAnalysis?.category || null,
        urgency: urgent ? notificationAnalysis?.urgency || "high" : "low",
        actionRequired: urgent,
        extractedData: notificationAnalysis?.extractedData || null,
        status,
        updatedAt: dbNow,
      }, { merge: true });

      batch.set(db.collection("activity_logs").doc(), {
        type: "mail.received",
        actorUid: "system",
        actorRole: "system",
        clientId: clientUid,
        centerKey,
        mailId,
        planId,
        category: notificationAnalysis?.category || null,
        urgency: notificationAnalysis?.urgency || null,
        summary: notificationAnalysis?.summary || null,
        createdAt: dbNow,
      });

      batch.set(db.collection("audit_logs").doc(), {
        event: "mail_received",
        ownerUid: clientUid,
        centerKey,
        companyName: companyName || null,
        fileName,
        storagePath: storagePath || null,
        planId,
        category: notificationAnalysis?.category || null,
        urgency: notificationAnalysis?.urgency || null,
        analysisStatus,
        analysisSkippedReason,
        ts: dbNow,
      });

      await batch.commit();

      if (!mailPolicy.emailNotificationEnabled) {
        await mailRef.set({
          clientNotification: {
            status: "skipped",
            reason: "plan_without_notification",
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
        }, { merge: true });
        return;
      }

      if (!clientEmail) {
        await mailRef.set({
          clientNotification: {
            status: "skipped",
            reason: "missing_client_email",
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
        }, { merge: true });
        return;
      }

      const subject = buildSubject(companyName, notificationAnalysis);
      const html = buildHtml(
        urgent ? "Courrier urgent disponible" : "Nouveau courrier disponible",
        buildNotificationBody({ companyName, centerLabel, fileName, analysis: notificationAnalysis }),
        "Acceder a mon espace",
        CLIENT_MAIL_URL
      );
      const text = buildNotificationText({ companyName, centerLabel, fileName, analysis: notificationAnalysis });

      try {
        const emailQueueId = await queueEmail({
          to: clientEmail,
          subject,
          html,
          text,
          mailId,
          clientUid,
          urgent,
        });

        await mailRef.set({
          clientNotification: {
            status: "queued",
            queuedAt: admin.firestore.FieldValue.serverTimestamp(),
            emailTo: clientEmail,
            emailQueueId,
            subject,
            urgent,
          },
        }, { merge: true });

        await db.collection("activity_logs").add({
          type: "mail.notification_queued",
          actorUid: "system",
          actorRole: "system",
          clientId: clientUid,
          centerKey,
          mailId,
          to: clientEmail,
          subject,
          urgent,
          planId,
          summary: notificationAnalysis?.summary || null,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        logger.info("[onMailDocumentCreated] client notification queued", {
          mailId,
          clientUid,
          clientEmail,
          urgent,
          emailQueueId,
        });
      } catch (mailError: any) {
        await mailRef.set({
          clientNotification: {
            status: "failed",
            error: mailError?.message || String(mailError),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
        }, { merge: true });

        logger.warn("[onMailDocumentCreated] client notification failed", {
          mailId,
          clientUid,
          message: mailError?.message || String(mailError),
        });
      }
    } catch (error: any) {
      logger.error("[onMailDocumentCreated] ERROR", {
        message: error?.message || String(error),
        mailId,
        clientUid,
      });
    }
  }
);
