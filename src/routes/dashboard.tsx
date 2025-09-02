// src/routes/admin.tsx
import React, { lazy } from "react";
import { Navigate, Outlet, RouteObject } from "react-router-dom";
import Loadable from "./Loadable";
import { AuthGuard } from "@/components/auth";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";

const DashboardAdmin      = Loadable(lazy(() => import("@/pages/dashboard/DashboardAdmin")));
const ClientsPage         = Loadable(lazy(() => import("@/pages/dashboard/ClientsPage")));
const FacturesPage        = Loadable(lazy(() => import("@/pages/dashboard/FacturesPage")));
const DossiersClientsPage = Loadable(lazy(() => import("@/pages/dashboard/DossiersClientsPage")));
const CourriersPage       = Loadable(lazy(() => import("@/pages/dashboard/CourriersPage")));
const ProfilPage          = Loadable(lazy(() => import("@/pages/dashboard/ProfilPage")));
const SettingsPage        = Loadable(lazy(() => import("@/pages/dashboard/SettingsPage")));

// Stats
const StatisticsPage   = Loadable(lazy(() => import("@/pages/dashboard/statistiques/index")));
const ClientsStatsPage = Loadable(lazy(() => import("@/pages/dashboard/statistiques/ClientsStatsPage")));
const FacturesStatsPage= Loadable(lazy(() => import("@/pages/dashboard/statistiques/FacturesStatsPage")));
const CourriersStatsPage=Loadable(lazy(() => import("@/pages/dashboard/statistiques/CourriersStatsPage")));
const CAStatsPage      = Loadable(lazy(() => import("@/pages/dashboard/statistiques/CAStatsPage")));

export const AdminRoutes: RouteObject[] = [
  {
    path: "/admin",
    element: (
      <AuthGuard>
        <DashboardLayout>
          <Outlet />
        </DashboardLayout>
      </AuthGuard>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <DashboardAdmin /> },
      { path: "clients", element: <ClientsPage /> },
      { path: "factures", element: <FacturesPage /> },
      { path: "dossiers", element: <DossiersClientsPage /> },
      { path: "courriers", element: <CourriersPage /> },
      { path: "profil", element: <ProfilPage /> },
      { path: "settings", element: <SettingsPage /> },
      {
        path: "statistiques",
        element: <Outlet />,
        children: [
          { index: true, element: <StatisticsPage /> },
          { path: "clients", element: <ClientsStatsPage /> },
          { path: "factures", element: <FacturesStatsPage /> },
          { path: "courriers", element: <CourriersStatsPage /> },
          { path: "chiffre-affaires", element: <CAStatsPage /> },
        ],
      },
      // filet de sécurité interne à /admin
      { path: "*", element: <Navigate to="dashboard" replace /> },
    ],
  },
];
