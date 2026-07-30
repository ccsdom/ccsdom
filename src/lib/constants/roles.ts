/**
 * Source de vérité unique pour les rôles utilisateur dans CCS DOM.
 * Toutes les références aux rôles dans le frontend doivent utiliser ces constantes.
 */

export const ROLES = [
  "client",
  "manager",
  "manager_paris",
  "manager_orly",
  "secretary_paris",
  "secretary_orly",
  "super_admin",
] as const;

export type UserRole = (typeof ROLES)[number];

/**
 * Groupes de rôles pour faciliter les vérifications d'accès.
 */
export const STAFF_ROLES: readonly UserRole[] = [
  "manager",
  "manager_paris",
  "manager_orly",
  "secretary_paris",
  "secretary_orly",
  "super_admin",
] as const;

export const MANAGER_ROLES: readonly UserRole[] = [
  "manager",
  "manager_paris",
  "manager_orly",
  "super_admin",
] as const;

export const ADMIN_ROLES: readonly UserRole[] = [
  "super_admin",
] as const;

/**
 * Utilitaires de normalisation (pour gérer les legacy strings "admin" ou "superadmin").
 */
export function normalizeRole(value: unknown): UserRole | null {
  const role = String(value ?? "").trim().toLowerCase();

  if (role === "superadmin" || role === "admin") {
    return "super_admin";
  }

  return (ROLES as readonly string[]).includes(role)
    ? (role as UserRole)
    : null;
}
