// functions/src/admin/admin-update-client.ts
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { getFirestore } from "firebase-admin/firestore";
import * as admin from "firebase-admin";
import { CLIENT_STATUS } from "../_config/signup-constants";
import {
  buildAdminClientRequestMirror,
  isAdminClientRequestMirror,
} from "../_utils/admin-client-request-mirror";
import {
  canManageClientsRole,
  canTouchCenter,
  getCallerAccess,
  resolveCenterIdFromData,
  type CenterId,
} from "../_utils/auth";

if (!admin.apps.length) admin.initializeApp();

type ClientStatus = typeof CLIENT_STATUS[keyof typeof CLIENT_STATUS];

const VALID_STATUSES: ClientStatus[] = [
  CLIENT_STATUS.ACTIVE,
  CLIENT_STATUS.INACTIVE,
  CLIENT_STATUS.SUSPENDED,
  CLIENT_STATUS.PENDING,
];

function normalizeClientId(input: unknown): string {
  const id = typeof input === "string" ? input.trim() : "";
  if (!id) throw new HttpsError("invalid-argument", "clientId required");
  return id;
}

function normalizeStatus(input: unknown): ClientStatus | undefined {
  if (input == null) return undefined;
  const s = typeof input === "string" ? input.trim() : "";
  if (!s) return undefined;
  if (!VALID_STATUSES.includes(s as ClientStatus)) {
    throw new HttpsError("invalid-argument", "Invalid status");
  }
  return s as ClientStatus;
}

function normalizeEmail(input: unknown): string | undefined {
  if (input == null) return undefined;
  const email = typeof input === "string" ? input.trim().toLowerCase() : "";
  if (!email) return undefined;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpsError("invalid-argument", "Invalid email");
  }
  return email;
}

function isAuthUserNotFound(error: any): boolean {
  return error?.code === "auth/user-not-found" || error?.errorInfo?.code === "auth/user-not-found";
}

async function ensureEmailAvailableForClient(email: string, clientId: string) {
  try {
    const existing = await admin.auth().getUserByEmail(email);
    if (existing.uid !== clientId) {
      throw new HttpsError("already-exists", "Email already used by another account");
    }
  } catch (error: any) {
    if (error instanceof HttpsError) throw error;
    if (isAuthUserNotFound(error)) return;
    logger.error("[adminUpdateClient] Email availability check failed", {
      clientId,
      email,
      code: error?.code || error?.errorInfo?.code,
    });
    throw new HttpsError("internal", "Unable to verify email availability");
  }
}

async function syncAuthEmailIfClientAccountExists(clientId: string, email: string) {
  try {
    const user = await admin.auth().getUser(clientId);
    if (user.email?.toLowerCase() === email) return;
    await admin.auth().updateUser(clientId, {
      email,
      emailVerified: false,
    });
  } catch (error: any) {
    if (isAuthUserNotFound(error)) return;
    if (error?.code === "auth/email-already-exists" || error?.errorInfo?.code === "auth/email-already-exists") {
      throw new HttpsError("already-exists", "Email already used by another account");
    }
    logger.error("[adminUpdateClient] Auth email sync failed", {
      clientId,
      email,
      code: error?.code || error?.errorInfo?.code,
    });
    throw new HttpsError("internal", "Unable to update client authentication email");
  }
}

export const adminUpdateClient = onCall({ region: "europe-west9" }, async (req) => {
  const caller = await getCallerAccess(req);
  const actorUid = caller.uid;
  const role = caller.role;

  if (!canManageClientsRole(role)) throw new HttpsError("permission-denied", "Insufficient permissions");

  const clientId = normalizeClientId(req.data?.clientId);
  const patch = req.data?.data ?? {};

  const status = normalizeStatus(patch?.status);
  const plan = typeof patch?.plan === "string" ? patch.plan.trim() : undefined;
  const name = typeof patch?.name === "string" ? patch.name.trim() : undefined;
  const representative =
    typeof patch?.representative === "string" ? patch.representative.trim() : undefined;
  const email = normalizeEmail(patch?.email);
  const phone = typeof patch?.phone === "string" ? patch.phone.trim() : undefined;
  const siret = typeof patch?.siret === "string" ? patch.siret.trim() : undefined;

  const db = admin.firestore();
  const now = admin.firestore.FieldValue.serverTimestamp();

  const clientRef = db.collection("clients").doc(clientId);
  const snap = await clientRef.get();
  if (!snap.exists) throw new HttpsError("not-found", "Client not found");

  const clientData = snap.data() || {};
  const requestRef = db.collection("client_requests").doc(clientId);
  const requestSnap = await requestRef.get();
  const requestData = requestSnap.data() || {};
  const clientCenter = resolveCenterIdFromData(clientData);
  const effectiveCenter: CenterId | null =
    role === "super_admin" ? clientCenter : clientCenter ?? caller.managedCenterIds[0] ?? null;

  if (!canTouchCenter(role, caller.managedCenterIds, effectiveCenter)) {
    throw new HttpsError("permission-denied", "You cannot manage this center");
  }
  if (role !== "super_admin" && clientCenter && !canTouchCenter(role, caller.managedCenterIds, clientCenter)) {
    throw new HttpsError("permission-denied", "Client is not in your center");
  }

  let currentEmail: string | undefined;
  try {
    currentEmail = normalizeEmail(clientData.emailLower || clientData.email);
  } catch {
    currentEmail = undefined;
  }
  const emailChanged = Boolean(email && email !== currentEmail);
  const userRef = db.collection("users").doc(clientId);
  const customerRef = db.collection("customers").doc(clientId);
  const [userSnap, customerSnap] = emailChanged
    ? await Promise.all([userRef.get(), customerRef.get()])
    : [null, null];

  if (emailChanged && email) {
    await ensureEmailAvailableForClient(email, clientId);
    await syncAuthEmailIfClientAccountExists(clientId, email);
  }

  // Update
  const updateData: Record<string, any> = {
    updatedAt: now,
  };
  if (status) updateData.status = status;
  if (plan) {
    updateData.plan = plan;
    updateData.planId = plan;
  }
  if (name) {
    updateData.name = name;
    updateData.companyName = name;
  }
  if (representative) updateData.representative = representative;
  if (email) {
    updateData.email = email;
    updateData.emailLower = email;
    if (clientData.portalAccess && typeof clientData.portalAccess === "object") {
      updateData["portalAccess.email"] = email;
    }
  }
  if (phone) updateData.phone = phone;
  if (siret) updateData.siret = siret;

  // Log unitaire
  const logRef = db.collection("activity_logs").doc();

  const batch = db.batch();
  batch.update(clientRef, updateData);
  if (emailChanged && email && userSnap?.exists) {
    batch.set(userRef, { email, emailLower: email, updatedAt: now }, { merge: true });
  }
  if (emailChanged && email && customerSnap?.exists) {
    batch.set(customerRef, { email, emailLower: email, updatedAt: now }, { merge: true });
  }
  if (isAdminClientRequestMirror(requestData, clientData)) {
    batch.set(
      requestRef,
      buildAdminClientRequestMirror({
        uid: clientId,
        actorUid,
        now,
        clientData: {
          ...clientData,
          ...updateData,
          uid: clientId,
        },
        requestData,
      }),
      { merge: true }
    );
  }
  batch.set(logRef, {
    type: "client.update",
    createdAt: now,
    actorUid,
    actorRole: role,
    centerId: effectiveCenter ?? clientCenter ?? null,
    clientId,
    toStatus: status ?? null,
    patch: Object.keys(updateData).filter((k) => k !== "updatedAt"),
  });

  await batch.commit();

  return { ok: true, clientId };
});
