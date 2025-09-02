import { Role } from "./roles";

export interface Permissions {
  canViewCAStats: boolean;
  canManageClients: boolean;
  canManageInvoices: boolean;
  // Ajoute d'autres permissions selon ton besoin
}

export const PERMISSIONS: Record<Role, Permissions> = {
  admin: {
    canViewCAStats: true,
    canManageClients: true,
    canManageInvoices: true,
  },
  secretary: {
    canViewCAStats: false, // Pas accès aux stats chiffre d'affaires
    canManageClients: true,
    canManageInvoices: true,
  },
  client: {
    canViewCAStats: false,
    canManageClients: false,
    canManageInvoices: false,
  },
};
