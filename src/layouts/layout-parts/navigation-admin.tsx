// src/layouts/layout-parts/navigation-admin.ts
import duotone from "@/icons/duotone";
import type { Navigations } from "./navigation-types";

/**
 * Menu ADMIN (et SUPER ADMIN)
 * - complet : clients, courriers, dossiers, factures, statistiques, profil, paramètres
 */
export const adminNavigations: Navigations[] = [
  { type: "label", label: "Administration" },

  { name: "Tableau de bord", path: "/admin", icon: duotone.PersonChalkboard },

  { name: "Clients",   icon: duotone.UserList, path: "/admin/clients" },
  { name: "Courriers", icon: duotone.Folder,   path: "/admin/courriers" },
  { name: "Dossiers",  icon: duotone.Folder,   path: "/admin/dossiers" },

  { name: "Factures",  icon: duotone.Invoice,  path: "/admin/factures" },

  {
    name: "Statistiques",
    icon: duotone.DataTable,
    path: "/admin/statistiques",
    children: [
      { name: "Clients",            path: "/admin/statistiques/clients" },
      { name: "Factures",           path: "/admin/statistiques/factures" },
      { name: "Courriers",          path: "/admin/statistiques/courriers" },
      { name: "Chiffre d'affaires", path: "/admin/statistiques/chiffre-affaires" },
    ],
  },

  { name: "Profil",     icon: duotone.Session,  path: "/admin/profil" },
  { name: "Paramètres", icon: duotone.Settings, path: "/admin/settings" },
];

/**
 * Menu SECRÉTAIRE
 * - accès limité : tableau de bord, courriers, dossiers, factures (lecture/traitement),
 *   clients (consultation si besoin), profil
 * - pas de paramètres ni de statistiques globales
 */
export const secretaryNavigations: Navigations[] = [
  { type: "label", label: "Secrétariat" },

  { name: "Tableau de bord", path: "/admin", icon: duotone.PersonChalkboard },

  // Priorités du secrétariat
  { name: "Courriers", icon: duotone.Folder,   path: "/admin/courriers" },
  { name: "Dossiers",  icon: duotone.Folder,   path: "/admin/dossiers" },
  { name: "Factures",  icon: duotone.Invoice,  path: "/admin/factures" },

  // (optionnel) lecture simple des clients
  { name: "Clients",   icon: duotone.UserList, path: "/admin/clients" },

  { name: "Profil",    icon: duotone.Session,  path: "/admin/profil" },
];
