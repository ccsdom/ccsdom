import { onCall, HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import * as admin from "firebase-admin";

import { getCallerAccess, normalizeCenterId, resolveCenterIdFromData } from "../_utils/auth";

if (!admin.apps.length) admin.initializeApp();

type AddressStatus = "active" | "inactive" | "archived";

const VALID_CENTER_STATUSES: AddressStatus[] = ["active", "inactive", "archived"];
const VALID_SUBSCRIPTION_STATUSES = new Set(["", "trialing", "active", "past_due", "canceled"]);

function requireCenterId(input: unknown): string {
  const centerId = normalizeCenterId(input);
  if (!centerId) throw new HttpsError("invalid-argument", "centerId required");
  return centerId;
}

function normalizeCenterStatus(input: unknown): AddressStatus {
  const status = typeof input === "string" ? input.trim().toLowerCase() : "";
  if (!VALID_CENTER_STATUSES.includes(status as AddressStatus)) {
    throw new HttpsError("invalid-argument", "Invalid center status");
  }
  return status as AddressStatus;
}

function normalizeOptionalString(input: unknown): string {
  return typeof input === "string" ? input.trim() : "";
}

function normalizeSubscriptionStatus(input: unknown): string {
  const status = normalizeOptionalString(input).toLowerCase();
  if (!VALID_SUBSCRIPTION_STATUSES.has(status)) {
    throw new HttpsError("invalid-argument", "Invalid subscription status");
  }
  return status;
}

function normalizeOptionalPositiveNumber(input: unknown): number | null {
  if (input === null || input === undefined || input === "") return null;

  const parsed =
    typeof input === "number" ? input : typeof input === "string" ? Number(input) : Number.NaN;

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new HttpsError("invalid-argument", "Invalid quota value");
  }

  return parsed;
}

function normalizeBoolean(input: unknown): boolean {
  if (input === true || input === "true") return true;
  return false;
}

function isOperationalClient(data: FirebaseFirestore.DocumentData) {
  const status = String(data.status ?? "").trim().toLowerCase();
  return status === "active" || status === "actif" || status === "approved";
}

function centerAliases(centerId: string, data: FirebaseFirestore.DocumentData) {
  return new Set(
    [centerId, data.slug, data.addressKey, data.locationKey]
      .map((value) => normalizeCenterId(value))
      .filter((value): value is string => Boolean(value))
  );
}

async function countActiveClientsForCenter(
  db: FirebaseFirestore.Firestore,
  centerId: string,
  centerData: FirebaseFirestore.DocumentData
) {
  const aliases = centerAliases(centerId, centerData);
  const snapshot = await db.collection("clients").get();
  let activeClients = 0;

  snapshot.forEach((clientSnap) => {
    const clientData = clientSnap.data();
    const clientCenter = resolveCenterIdFromData(clientData);
    if (!clientCenter || !aliases.has(clientCenter)) return;
    if (isOperationalClient(clientData)) activeClients += 1;
  });

  return activeClients;
}

export const adminUpdateCenterGovernance = onCall({ region: "europe-west9" }, async (req) => {
  const caller = await getCallerAccess(req);
  if (caller.role !== "super_admin") {
    throw new HttpsError("permission-denied", "Only super admins can manage center governance");
  }

  const centerId = requireCenterId(req.data?.centerId);
  const payload = (req.data?.data ?? {}) as Record<string, unknown>;
  const nextStatus = normalizeCenterStatus(payload.status);
  const subscriptionPlan = normalizeOptionalString(payload.subscriptionPlan);
  const subscriptionStatus = normalizeSubscriptionStatus(payload.subscriptionStatus);
  const subscriptionRenewalDate = normalizeOptionalString(payload.subscriptionRenewalDate);
  const quotaClients = normalizeOptionalPositiveNumber(payload.quotaClients);
  const quotaDocuments = normalizeOptionalPositiveNumber(payload.quotaDocuments);
  const quotaStorageGb = normalizeOptionalPositiveNumber(payload.quotaStorageGb);
  const quotaScansMonthly = normalizeOptionalPositiveNumber(payload.quotaScansMonthly);
  const publicSignupEnabled = normalizeBoolean(payload.publicSignupEnabled);
  const documentsReady = normalizeBoolean(payload.documentsReady);
  const billingReady = normalizeBoolean(payload.billingReady);
  const transitionReason = normalizeOptionalString(payload.transitionReason);

  const db = admin.firestore();
  const now = admin.firestore.FieldValue.serverTimestamp();
  const centerRef = db.collection("centers").doc(centerId);
  const centerSnap = await centerRef.get();
  const currentData = centerSnap.data() || {};
  const previousStatus = normalizeCenterStatus(currentData.status ?? "active");
  const statusChanged = previousStatus !== nextStatus;

  if (statusChanged && transitionReason.length < 6) {
    throw new HttpsError(
      "invalid-argument",
      "A transition reason of at least 6 characters is required"
    );
  }

  if (statusChanged && nextStatus === "archived") {
    const activeClients = await countActiveClientsForCenter(db, centerId, currentData);
    if (activeClients > 0) {
      throw new HttpsError(
        "failed-precondition",
        `Archivage impossible: ${activeClients} client(s) actif(s) rattache(s) a ce centre`
      );
    }
  }

  const updateData: Record<string, unknown> = {
    id: centerId,
    status: nextStatus,
    subscriptionPlan,
    subscriptionStatus,
    subscriptionRenewalDate,
    quotaClients,
    quotaDocuments,
    quotaStorageGb,
    quotaScansMonthly,
    publicSignupEnabled,
    documentsReady,
    billingReady,
    readiness: {
      publicSignupEnabled,
      documentsReady,
      billingReady,
    },
    subscription: {
      plan: subscriptionPlan,
      status: subscriptionStatus,
      renewalDate: subscriptionRenewalDate,
    },
    quotas: {
      clients: quotaClients,
      documents: quotaDocuments,
      storageGb: quotaStorageGb,
      scansMonthly: quotaScansMonthly,
    },
    updatedAt: now,
    governanceUpdatedAt: now,
    governanceUpdatedBy: caller.uid,
  };

  let activityType = "center.governance_updated";

  if (statusChanged) {
    activityType =
      nextStatus === "archived"
        ? "center.archived"
        : nextStatus === "inactive"
          ? "center.suspended"
          : "center.reactivated";

    updateData.statusUpdatedAt = now;
    updateData.statusUpdatedBy = caller.uid;
    updateData.statusChangeReason = transitionReason;
    updateData.lastStatusTransition =
      nextStatus === "archived" ? "archived" : nextStatus === "inactive" ? "suspended" : "reactivated";

    if (nextStatus === "archived") {
      updateData.archivedAt = now;
      updateData.archivedBy = caller.uid;
      updateData.archiveReason = transitionReason;
    } else if (nextStatus === "inactive") {
      updateData.suspendedAt = now;
      updateData.suspendedBy = caller.uid;
      updateData.suspensionReason = transitionReason;
    } else {
      updateData.reactivatedAt = now;
      updateData.reactivatedBy = caller.uid;
      updateData.reactivationReason = transitionReason;
    }
  }

  const logRef = db.collection("activity_logs").doc();
  const batch = db.batch();
  batch.set(centerRef, updateData, { merge: true });
  batch.set(logRef, {
    type: activityType,
    createdAt: now,
    actorUid: caller.uid,
    actorRole: caller.role,
    centerId,
    fromStatus: previousStatus,
    toStatus: nextStatus,
    reason: statusChanged ? transitionReason : null,
    subscriptionPlan,
    subscriptionStatus,
    subscriptionRenewalDate,
    readiness: {
      publicSignupEnabled,
      documentsReady,
      billingReady,
    },
    quotas: {
      clients: quotaClients,
      documents: quotaDocuments,
      storageGb: quotaStorageGb,
      scansMonthly: quotaScansMonthly,
    },
  });

  await batch.commit();

  logger.info("[adminUpdateCenterGovernance] Center governance updated", {
    centerId,
    actorUid: caller.uid,
    statusChanged,
    fromStatus: previousStatus,
    toStatus: nextStatus,
    activityType,
  });

  return {
    ok: true,
    centerId,
    status: nextStatus,
    statusChanged,
    activityType,
  };
});
