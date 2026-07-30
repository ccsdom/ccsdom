import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

if (!admin.apps.length) admin.initializeApp();

const VALID_ROLES = new Set([
  "client",
  "admin",
  "super_admin",
  "manager",
  "manager_paris",
  "manager_orly",
  "secretary_paris",
  "secretary_orly",
]);

function normalizeRole(value: unknown): string | null {
  const role = String(value ?? "").trim().toLowerCase();
  if (!role) return null;
  return role === "superadmin" ? "super_admin" : role;
}

function normalizeManagedAddressId(role: string, value: unknown): string | null {
  const managedAddressId = normalizeCenterId(value);

  if (managedAddressId) {
    return managedAddressId;
  }

  if (role === "manager_paris" || role === "secretary_paris") return "paris_12e";
  if (role === "manager_orly" || role === "secretary_orly") return "orly_ville";

  return null;
}

function normalizeCenterId(value: unknown): string | null {
  const centerId = String(value ?? "").trim().toLowerCase();
  if (!centerId || !/^[a-z0-9_-]{2,80}$/.test(centerId)) return null;
  if (centerId === "paris") return "paris_12e";
  if (centerId === "orly") return "orly_ville";
  return centerId;
}

function normalizeManagedCenterIds(role: string, data: any): string[] {
  const raw: unknown[] = Array.isArray(data?.managedCenterIds)
    ? data.managedCenterIds
    : data?.managedCenterIds
      ? [data.managedCenterIds]
      : [];

  const managedCenterIds = raw
    .map((value: unknown) => normalizeCenterId(value))
    .filter((value: string | null): value is string => Boolean(value));

  const managedAddressId = normalizeManagedAddressId(role, data?.managedAddressId);
  if (managedAddressId) managedCenterIds.unshift(managedAddressId);

  return Array.from(new Set(managedCenterIds)).slice(0, 25);
}

/**
 * Synchronise le role du document users/{uid} vers les custom claims Auth.
 * Les roles sont listes explicitement pour eviter toute propagation de valeur arbitraire.
 */
export const syncRoleClaim = onDocumentUpdated(
  {
    region: "europe-west9",
    document: "users/{uid}",
  },
  async (event) => {
    if (!event.data) return;

    const before = event.data.before.data();
    const after = event.data.after.data();

    const oldRole = normalizeRole(before?.role);
    const newRole = normalizeRole(after?.role);
    const oldManagedAddressId = String(before?.managedAddressId ?? "").trim();
    const newManagedAddressId = String(after?.managedAddressId ?? "").trim();
    const oldManagedCenterIds = normalizeManagedCenterIds(oldRole || "", before);
    const newManagedCenterIds = normalizeManagedCenterIds(newRole || "", after);
    const uid = event.params.uid;

    if (
      oldRole === newRole &&
      oldManagedAddressId === newManagedAddressId &&
      JSON.stringify(oldManagedCenterIds) === JSON.stringify(newManagedCenterIds)
    ) {
      return;
    }

    logger.info("[syncRoleClaim] Role/address change detected", {
      uid,
      oldRole,
      newRole,
      oldManagedAddressId,
      newManagedAddressId,
      oldManagedCenterIds,
      newManagedCenterIds,
    });

    try {
      if (!newRole || !VALID_ROLES.has(newRole)) {
        logger.warn("[syncRoleClaim] Invalid or missing role. Clearing custom claims.", {
          uid,
          newRole,
        });
        await admin.auth().setCustomUserClaims(uid, {});
        return;
      }

      const claims: Record<string, string | string[]> = { role: newRole };
      const managedAddressId = normalizeManagedAddressId(newRole, after?.managedAddressId);

      if (managedAddressId) {
        claims.managedAddressId = managedAddressId;
      }

      if (newManagedCenterIds.length > 0) {
        claims.managedCenterIds = newManagedCenterIds;
        if (!claims.managedAddressId) {
          claims.managedAddressId = newManagedCenterIds[0];
        }
      }

      await admin.auth().setCustomUserClaims(uid, claims);

      logger.info("[syncRoleClaim] Custom claims updated", {
        uid,
        role: newRole,
        managedAddressId: claims.managedAddressId || null,
        managedCenterIds: newManagedCenterIds,
      });
    } catch (error: any) {
      logger.error("[syncRoleClaim] Failed to update custom claims", {
        uid,
        message: error?.message,
        stack: error?.stack,
        newRole,
      });
    }
  }
);
