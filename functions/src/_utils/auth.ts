// functions/src/_utils/auth.ts
import { HttpsError, type CallableRequest } from "firebase-functions/v2/https";
import { adminDb } from "./admin";
import * as admin from "firebase-admin";

export type UserRole =
  | "client"
  | "manager"
  | "manager_paris"
  | "manager_orly"
  | "secretary_paris"
  | "secretary_orly"
  | "super_admin";

export type CenterId = string;

const ALLOWED_ROLES: UserRole[] = [
  "client",
  "manager",
  "manager_paris",
  "manager_orly",
  "secretary_paris",
  "secretary_orly",
  "super_admin",
];

function normalizeRole(v: any): UserRole | null {
  const s = String(v || "").trim();
  return (ALLOWED_ROLES as string[]).includes(s) ? (s as UserRole) : null;
}

export function normalizeCenterId(value: unknown): CenterId | null {
  const centerId = String(value ?? "").trim().toLowerCase();
  if (!centerId) return null;
  if (centerId === "paris") return "paris_12e";
  if (centerId === "orly") return "orly_ville";
  return centerId;
}

function normalizeCenterIds(value: unknown): CenterId[] {
  const raw = Array.isArray(value) ? value : value ? [value] : [];
  const centers = raw
    .map(normalizeCenterId)
    .filter((centerId): centerId is CenterId => Boolean(centerId));

  return Array.from(new Set(centers));
}

export function centerIdFromRole(role: UserRole | string | null | undefined): CenterId | null {
  if (role === "manager_paris" || role === "secretary_paris") return "paris_12e";
  if (role === "manager_orly" || role === "secretary_orly") return "orly_ville";
  return null;
}

export function managedCenterIdsFromData(
  role: UserRole | string | null | undefined,
  data: any
): CenterId[] {
  const centers = new Set<CenterId>();

  normalizeCenterIds(data?.managedCenterIds).forEach((centerId) => centers.add(centerId));

  const managedAddressId = normalizeCenterId(data?.managedAddressId);
  if (managedAddressId) centers.add(managedAddressId);

  const roleCenter = centerIdFromRole(role);
  if (roleCenter) centers.add(roleCenter);

  return Array.from(centers);
}

export function canManageClientsRole(role: UserRole | string | null | undefined): boolean {
  return role === "super_admin" ||
    role === "manager" ||
    role === "manager_paris" ||
    role === "manager_orly";
}

export function canTouchCenter(
  role: UserRole | string | null | undefined,
  managedCenterIds: CenterId[],
  centerId: unknown
): boolean {
  const normalizedCenterId = normalizeCenterId(centerId);
  if (role === "super_admin") return true;
  if (!normalizedCenterId) return false;
  return managedCenterIds.includes(normalizedCenterId);
}

export function resolveCenterIdFromData(data: any): CenterId | null {
  return normalizeCenterId(data?.centerId) ||
    normalizeCenterId(data?.domiciliationAddressId) ||
    normalizeCenterId(data?.addressId) ||
    normalizeCenterId(data?.centerKey) ||
    normalizeCenterId(data?.addressKey) ||
    normalizeCenterId(data?.locationKey);
}

/**
 * Auth obligatoire
 */
export function requireAuth(req: CallableRequest) {
  const uid = String(req.auth?.uid || "").trim();
  if (!uid) throw new HttpsError("unauthenticated", "Connexion requise");
  return { uid };
}

/**
 * Récupère le rôle :
 * 1) custom claims (req.auth.token.role)
 * 2) fallback Firestore users/{uid}.role
 */
export async function getCallerRole(req: CallableRequest): Promise<UserRole | null> {
  const claimRole = normalizeRole((req.auth?.token as any)?.role);
  if (claimRole) return claimRole;

  const uid = String(req.auth?.uid || "").trim();
  if (!uid) return null;

  const snap = await adminDb.collection("users").doc(uid).get();
  return normalizeRole(snap.data()?.role);
}

export async function getCallerAccess(req: CallableRequest): Promise<{
  uid: string;
  role: UserRole | null;
  managedCenterIds: CenterId[];
}> {
  const { uid } = requireAuth(req);
  const token = (req.auth?.token as any) || {};
  const claimRole = normalizeRole(token.role);

  if (claimRole) {
    return {
      uid,
      role: claimRole,
      managedCenterIds: managedCenterIdsFromData(claimRole, token),
    };
  }

  const snap = await adminDb.collection("users").doc(uid).get();
  const data = snap.data() || {};
  const role = normalizeRole(data.role);

  return {
    uid,
    role,
    managedCenterIds: managedCenterIdsFromData(role, data),
  };
}

/**
 * Vérifie un rôle unique (STRICT claims uniquement)
 * -> utile si tu veux forcer "les claims doivent être à jour"
 */
export function requireOneOfRoles(req: CallableRequest, roles: UserRole[]) {
  const claimRole = normalizeRole((req.auth?.token as any)?.role);
  if (claimRole && roles.includes(claimRole)) return { role: claimRole };

  throw new HttpsError(
    "permission-denied",
    "Droits insuffisants (role manquant dans les claims). Reconnecte-toi ou refresh token."
  );
}

/**
 * ✅ NOUVEAU (pour corriger TS2305) :
 * Vérifie rôle(s) autorisé(s) avec fallback Firestore si le claim est absent.
 * -> C'est celui qu'attend rejectSignup.ts (requireRole).
 *
 * Usage:
 *   await requireRole(req, ["super_admin","manager_paris"]);
 *   // ou
 *   await requireRole(req, "super_admin");
 */
export async function requireRole(
  req: CallableRequest,
  allowed: UserRole[] | UserRole
): Promise<{ role: UserRole }> {
  requireAuth(req);

  const allowedList = Array.isArray(allowed) ? allowed : [allowed];

  // 1) claims
  const claimRole = normalizeRole((req.auth?.token as any)?.role);
  if (claimRole && allowedList.includes(claimRole)) return { role: claimRole };

  // 2) fallback Firestore
  const role = await getCallerRole(req);
  if (role && allowedList.includes(role)) return { role };

  throw new HttpsError("permission-denied", "Droits insuffisants.");
}

/**
 * Optionnel mais très utile :
 * Assure que le claim role est bien posé côté Auth, pour éviter que
 * requireOneOfRoles échoue en prod après une mise à jour du role.
 */
export async function setRoleClaim(uid: string, role: UserRole, managedCenterIds: string[] = []) {
  if (!admin.apps.length) admin.initializeApp();
  const claims: Record<string, string | string[]> = { role };
  const centers = Array.from(new Set(managedCenterIds.map((id) => String(id).trim()).filter(Boolean)));

  if (centers.length > 0) {
    claims.managedCenterIds = centers;
    claims.managedAddressId = centers[0];
  }

  await admin.auth().setCustomUserClaims(uid, claims);
}
