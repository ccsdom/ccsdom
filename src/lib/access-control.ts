import {
  MANAGER_ROLES,
  STAFF_ROLES,
  type UserRole,
} from "@/lib/constants/roles";

export type CenterId = string;

export type AccessData = {
  role?: UserRole | string | null;
  managedAddressId?: unknown;
  managedCenterIds?: unknown;
};

export function normalizeCenterId(value: unknown): CenterId | null {
  const centerId = String(value ?? "").trim().toLowerCase();

  if (!centerId) return null;
  if (centerId === "paris") return "paris_12e";
  if (centerId === "orly") return "orly_ville";

  return centerId;
}

export function centerIdFromRole(role: UserRole | string | null | undefined): CenterId | null {
  if (role === "manager_paris" || role === "secretary_paris") return "paris_12e";
  if (role === "manager_orly" || role === "secretary_orly") return "orly_ville";
  return null;
}

function normalizeCenterArray(value: unknown): CenterId[] {
  const raw = Array.isArray(value) ? value : value ? [value] : [];
  const cleaned = raw
    .map(normalizeCenterId)
    .filter((centerId): centerId is CenterId => Boolean(centerId));

  return Array.from(new Set(cleaned));
}

export function managedCenterIdsFromData(
  data: AccessData | null | undefined,
  fallbackRole?: UserRole | string | null
): CenterId[] {
  const centers = new Set<CenterId>();
  const role = data?.role ?? fallbackRole ?? null;

  normalizeCenterArray(data?.managedCenterIds).forEach((centerId) => centers.add(centerId));

  const managedAddressId = normalizeCenterId(data?.managedAddressId);
  if (managedAddressId) centers.add(managedAddressId);

  const roleCenter = centerIdFromRole(role);
  if (roleCenter) centers.add(roleCenter);

  return Array.from(centers);
}

export function managedAddressIdFromData(
  data: AccessData | null | undefined,
  fallbackRole?: UserRole | string | null
): CenterId | null {
  return managedCenterIdsFromData(data, fallbackRole)[0] ?? null;
}

export function isStaffRole(role: UserRole | string | null | undefined): boolean {
  return STAFF_ROLES.includes(role as UserRole);
}

export function canManageClients(role: UserRole | string | null | undefined): boolean {
  return MANAGER_ROLES.includes(role as UserRole);
}

export function canAccessCenter(
  role: UserRole | string | null | undefined,
  managedCenterIds: CenterId[],
  centerId: unknown
): boolean {
  const normalizedCenterId = normalizeCenterId(centerId);

  if (role === "super_admin") return true;
  if (!normalizedCenterId) return false;

  return managedCenterIds.includes(normalizedCenterId);
}

export function resolveRecordCenterId(data: Record<string, any> | null | undefined): CenterId | null {
  if (!data) return null;

  return (
    normalizeCenterId(data.centerId) ||
    normalizeCenterId(data.domiciliationAddressId) ||
    normalizeCenterId(data.addressId) ||
    normalizeCenterId(data.centerKey) ||
    normalizeCenterId(data.addressKey) ||
    normalizeCenterId(data.locationKey)
  );
}

export function legacyCenterKey(centerId: CenterId | null | undefined): "paris" | "orly" | null {
  const normalizedCenterId = normalizeCenterId(centerId);
  if (normalizedCenterId === "paris_12e") return "paris";
  if (normalizedCenterId === "orly_ville") return "orly";
  return null;
}
