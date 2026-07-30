import * as admin from "firebase-admin";

import {
  managedCenterIdsFromData,
  normalizeCenterId,
  type CenterId,
} from "./auth";

if (!admin.apps.length) admin.initializeApp();

const db = admin.firestore();

export type StaffNotificationPreference =
  | "notificationNewClient"
  | "notificationDailySummary";

export type StaffNotificationRecipient = {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  managedCenterIds: CenterId[];
};

export type StaffNotificationLookup = {
  centerId: CenterId | null;
  candidateCount: number;
  recipients: StaffNotificationRecipient[];
};

const STAFF_NOTIFICATION_ROLES = [
  "manager",
  "manager_paris",
  "manager_orly",
  "secretary_paris",
  "secretary_orly",
];

const DEFAULT_PREFERENCE: Record<StaffNotificationPreference, boolean> = {
  notificationNewClient: true,
  notificationDailySummary: false,
};

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeEmail(value: unknown) {
  return normalizeText(value).toLowerCase();
}

function normalizeRole(value: unknown) {
  return normalizeText(value).toLowerCase();
}

export function centerLabel(centerId: unknown) {
  const normalized = normalizeCenterId(centerId);
  if (normalized === "paris_12e") return "Paris 12e";
  if (normalized === "orly_ville") return "Orly";
  return normalizeText(centerId) || "Centre";
}

export function centerContactEmail(centerId: unknown) {
  const normalized = normalizeCenterId(centerId);
  if (normalized === "paris_12e") return "contact.ccs75@gmail.com";
  if (normalized === "orly_ville") return "contact.ccs94@gmail.com";
  return "contact@ccsdom.fr";
}

export function centerAliases(centerId: unknown) {
  const normalized = normalizeCenterId(centerId);
  if (normalized === "paris_12e") return ["paris_12e", "paris"];
  if (normalized === "orly_ville") return ["orly_ville", "orly"];
  return normalized ? [normalized] : [];
}

async function preferenceEnabled(uid: string, preference: StaffNotificationPreference) {
  const snap = await db.doc(`users/${uid}/settings/config`).get();
  const value = snap.data()?.[preference];
  return typeof value === "boolean" ? value : DEFAULT_PREFERENCE[preference];
}

export async function getStaffNotificationRecipients(
  centerIdInput: unknown,
  preference: StaffNotificationPreference
): Promise<StaffNotificationLookup> {
  const centerId = normalizeCenterId(centerIdInput);
  if (!centerId) {
    return { centerId: null, candidateCount: 0, recipients: [] };
  }

  const usersSnap = await db
    .collection("users")
    .where("role", "in", STAFF_NOTIFICATION_ROLES)
    .get();

  const candidates = usersSnap.docs
    .map((docSnap) => {
      const data = docSnap.data() || {};
      const role = normalizeRole(data.role);
      const managedCenterIds = managedCenterIdsFromData(role, data);
      const email = normalizeEmail(data.emailLower || data.email);

      return {
        uid: docSnap.id,
        email,
        displayName: normalizeText(data.displayName || data.name || email),
        role,
        managedCenterIds,
      };
    })
    .filter((user) => {
      if (!user.email) return false;
      return user.managedCenterIds.includes(centerId);
    });

  const checks = await Promise.all(
    candidates.map(async (candidate) => ({
      candidate,
      enabled: await preferenceEnabled(candidate.uid, preference),
    }))
  );

  const byEmail = new Map<string, StaffNotificationRecipient>();
  checks.forEach(({ candidate, enabled }) => {
    if (!enabled) return;
    if (!byEmail.has(candidate.email)) {
      byEmail.set(candidate.email, candidate);
    }
  });

  return {
    centerId,
    candidateCount: candidates.length,
    recipients: Array.from(byEmail.values()),
  };
}
