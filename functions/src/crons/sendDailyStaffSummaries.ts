import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

import { SIGNUP_REQUEST_STATUS } from "../_config/signup-constants";
import {
  centerAliases,
  centerLabel,
  getStaffNotificationRecipients,
} from "../_utils/staff-notification-preferences";

if (!admin.apps.length) admin.initializeApp();

const db = admin.firestore();

type ActivityItem = {
  type: string;
  center: string;
  companyName: string;
  summary: string;
  urgency: string;
};

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

function escapeHtml(value: unknown) {
  return normalizeText(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof (value as any)?.toDate === "function") return (value as any).toDate();
  if (typeof (value as any)?.seconds === "number") {
    return new Date((value as any).seconds * 1000);
  }
  const date = new Date(value as any);
  return Number.isNaN(date.getTime()) ? null : date;
}

function includesCenter(data: Record<string, any>, aliases: string[]) {
  const values = [
    data.centerId,
    data.centerKey,
    data.addressId,
    data.addressKey,
    data.locationKey,
  ]
    .map((value) => normalizeText(value).toLowerCase())
    .filter(Boolean);

  return values.some((value) => aliases.includes(value));
}

async function queueEmail(to: string[], subject: string, html: string, text: string) {
  const uniqueRecipients = Array.from(new Set(to.map((email) => email.trim().toLowerCase()).filter(Boolean)));
  if (uniqueRecipients.length === 0) return null;

  const ref = db.collection("mails").doc();
  await ref.set({
    to: uniqueRecipients,
    message: { subject, html, text },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    source: "daily_staff_summary",
    metadata: {
      type: "daily_staff_summary",
    },
  });

  return ref.id;
}

async function resolveKnownCenterIds() {
  const centerIds = new Set<string>(["orly_ville", "paris_12e"]);

  try {
    const snap = await db.collection("centers").get();
    snap.forEach((docSnap) => {
      const data = docSnap.data() || {};
      const status = normalizeText(data.status).toLowerCase();
      if (status === "archived" || status === "deleted") return;

      [docSnap.id, data.centerId, data.addressId].forEach((value) => {
        const centerId = normalizeText(value).toLowerCase();
        if (centerId) centerIds.add(centerId);
      });
    });
  } catch (error: any) {
    logger.warn("[sendDailyStaffSummaries] centers lookup failed, using defaults", {
      message: error?.message || String(error),
    });
  }

  return Array.from(centerIds);
}

async function getRecentActivities(since: Date) {
  const sinceTs = admin.firestore.Timestamp.fromDate(since);
  const snap = await db
    .collection("activity_logs")
    .where("createdAt", ">=", sinceTs)
    .get();

  return snap.docs.map((docSnap) => {
    const data = docSnap.data() || {};
    return {
      type: normalizeText(data.type),
      center: normalizeText(data.centerId || data.centerKey || data.addressId || data.addressKey || data.locationKey).toLowerCase(),
      companyName: normalizeText(data.companyName || data.clientName || data.clientId || data.requestUid),
      summary: normalizeText(data.summary || data.reason || data.subject),
      urgency: normalizeText(data.urgency),
      raw: data,
      createdAt: toDate(data.createdAt),
    };
  });
}

async function getPendingValidationCount(aliases: string[]) {
  const snap = await db
    .collection("client_requests")
    .where("status", "==", SIGNUP_REQUEST_STATUS.PENDING_VALIDATION)
    .get();

  return snap.docs.filter((docSnap) => includesCenter(docSnap.data() || {}, aliases)).length;
}

function buildSummaryHtml(params: {
  centerName: string;
  since: Date;
  counts: Record<string, number>;
  urgentItems: ActivityItem[];
}) {
  const { centerName, since, counts, urgentItems } = params;
  const urgentRows = urgentItems.length
    ? urgentItems
        .slice(0, 5)
        .map(
          (item) => `
            <li>
              <strong>${escapeHtml(item.companyName || "Client")}</strong>
              ${item.summary ? ` — ${escapeHtml(item.summary)}` : ""}
            </li>`
        )
        .join("")
    : `<li>Aucun courrier urgent détecté sur la période.</li>`;

  return `
    <div style="font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.6;color:#111827">
      <p style="margin:0 0 6px;text-transform:uppercase;letter-spacing:.12em;color:#2563eb;font-size:11px;font-weight:800">Résumé quotidien CCS DOM</p>
      <h2 style="margin:0 0 14px">Centre ${escapeHtml(centerName)}</h2>
      <p>Période analysée depuis le ${escapeHtml(since.toLocaleString("fr-FR", { timeZone: "Europe/Paris" }))}.</p>
      <table style="width:100%;border-collapse:collapse;margin:18px 0">
        <tbody>
          <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb">Dossiers en attente de validation</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:800">${counts.pendingValidation}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb">Nouveaux dossiers / événements inscription</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:800">${counts.signupEvents}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb">Courriers reçus</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:800">${counts.mailReceived}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb">Courriers urgents</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:800;color:#dc2626">${counts.urgentMails}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb">Notifications courrier mises en file</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:800">${counts.mailNotificationsQueued}</td></tr>
        </tbody>
      </table>
      <h3 style="margin:18px 0 8px">Points urgents</h3>
      <ul>${urgentRows}</ul>
      <p style="margin-top:18px">
        <a href="https://ccsdom.fr/admin" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px">Ouvrir le tableau de bord</a>
      </p>
      <p style="margin-top:20px">-- <strong>CCS DOM</strong></p>
    </div>
  `;
}

function buildSummaryText(params: {
  centerName: string;
  since: Date;
  counts: Record<string, number>;
  urgentItems: ActivityItem[];
}) {
  const { centerName, since, counts, urgentItems } = params;
  const lines = [
    `Résumé quotidien CCS DOM - ${centerName}`,
    `Depuis le ${since.toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}`,
    "",
    `Dossiers en attente de validation : ${counts.pendingValidation}`,
    `Nouveaux dossiers / événements inscription : ${counts.signupEvents}`,
    `Courriers reçus : ${counts.mailReceived}`,
    `Courriers urgents : ${counts.urgentMails}`,
    `Notifications courrier mises en file : ${counts.mailNotificationsQueued}`,
    "",
    "Points urgents :",
  ];

  if (urgentItems.length === 0) {
    lines.push("- Aucun courrier urgent détecté.");
  } else {
    urgentItems.slice(0, 5).forEach((item) => {
      lines.push(`- ${item.companyName || "Client"}${item.summary ? ` : ${item.summary}` : ""}`);
    });
  }

  lines.push("", "Tableau de bord : https://ccsdom.fr/admin", "", "CCS DOM");
  return lines.join("\n");
}

export const sendDailyStaffSummaries = onSchedule(
  {
    schedule: "every day 07:15",
    timeZone: "Europe/Paris",
    region: "europe-west1",
    memory: "256MiB",
    timeoutSeconds: 180,
  },
  async () => {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const centers = await resolveKnownCenterIds();
    const recentActivities = await getRecentActivities(since);

    for (const centerId of centers) {
      const lookup = await getStaffNotificationRecipients(centerId, "notificationDailySummary");
      if (lookup.recipients.length === 0) {
        logger.info("[sendDailyStaffSummaries] skipped by preferences", {
          centerId: lookup.centerId || centerId,
          preference: "notificationDailySummary",
          candidateCount: lookup.candidateCount,
          recipientCount: lookup.recipients.length,
        });
        continue;
      }

      const aliases = centerAliases(lookup.centerId || centerId);
      const activities = recentActivities.filter((activity) => aliases.includes(activity.center));
      const pendingValidation = await getPendingValidationCount(aliases);
      const urgentItems = activities.filter(
        (activity) =>
          activity.type === "mail.received" &&
          (activity.urgency === "high" || activity.raw?.urgent === true || activity.raw?.actionRequired === true)
      );

      const counts = {
        pendingValidation,
        signupEvents: activities.filter((activity) => activity.type.startsWith("signup.")).length,
        mailReceived: activities.filter((activity) => activity.type === "mail.received").length,
        urgentMails: urgentItems.length,
        mailNotificationsQueued: activities.filter((activity) => activity.type === "mail.notification_queued").length,
      };

      const centerName = centerLabel(lookup.centerId || centerId);
      const subject = `Résumé quotidien CCS DOM - ${centerName}`;
      const html = buildSummaryHtml({ centerName, since, counts, urgentItems });
      const text = buildSummaryText({ centerName, since, counts, urgentItems });
      const emailQueueId = await queueEmail(
        lookup.recipients.map((recipient) => recipient.email),
        subject,
        html,
        text
      );

      await db.collection("activity_logs").add({
        type: "staff.daily_summary_queued",
        actorUid: "system",
        actorRole: "system",
        centerId: lookup.centerId || centerId,
        recipientCount: lookup.recipients.length,
        emailQueueId,
        counts,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      logger.info("[sendDailyStaffSummaries] summary queued", {
        centerId: lookup.centerId || centerId,
        recipientCount: lookup.recipients.length,
        emailQueueId,
        counts,
      });
    }
  }
);
