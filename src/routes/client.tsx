// src/routes/ClientRoutes.tsx
import { lazy } from "react";
import { Navigate, RouteObject } from "react-router-dom";
import Loadable from "./Loadable";
import { AuthGuard } from "@/components/auth";
import RequirePermission from "@/components/guards/RequirePermission";

// Layout client
const ClientDashboardLayout = Loadable(
  lazy(() => import("@/layouts/clientdashboard/ClientDashboardLayout"))
);

// Pages client
const ClientDashboard  = Loadable(lazy(() => import("@/pages/client/ClientDashboard")));
const ClientDocuments  = Loadable(lazy(() => import("@/pages/client/documents"))); // doit contenir <Outlet />
const UploadDocument   = Loadable(lazy(() => import("@/pages/client/documents/upload")));
const ClientCourriers  = Loadable(lazy(() => import("@/pages/client/courriers")));
const ClientFactures   = Loadable(lazy(() => import("@/pages/client/factures/FacturesPage")));
const ClientProfil     = Loadable(lazy(() => import("@/pages/client/profil/ProfilPage")));
const ClientAbonnement = Loadable(lazy(() => import("@/pages/client/abonnement/Abonnement")));

// Pages de retour Stripe (hors /client)
const CheckoutSuccess  = Loadable(lazy(() => import("@/pages/checkout/Success")));
const CheckoutCancel   = Loadable(lazy(() => import("@/pages/checkout/Cancel")));

// (optionnel) page d’erreur route-level
const ClientRouteError = Loadable(lazy(() => import("../pages/errors/ClientRouteError")));

const ClientIndexRedirect = <Navigate to="/client/dashboard" replace />;

export const ClientRoutes: RouteObject[] = [
  {
    path: "/client",
    element: (
      <AuthGuard>
        <RequirePermission anyOf={["portal:client"]}>
          <ClientDashboardLayout />
        </RequirePermission>
      </AuthGuard>
    ),
    errorElement: <ClientRouteError />,
    children: [
      { index: true, element: ClientIndexRedirect },
      { path: "dashboard", element: <ClientDashboard /> },

      {
        path: "documents",
        element: (
          <RequirePermission anyOf={["docs:view"]}>
            <ClientDocuments />
          </RequirePermission>
        ),
        children: [
          {
            path: "upload",
            element: (
              <RequirePermission anyOf={["docs:upload"]}>
                <UploadDocument />
              </RequirePermission>
            ),
          },
        ],
      },

      {
        path: "courriers",
        element: (
          <RequirePermission anyOf={["courier:read"]}>
            <ClientCourriers />
          </RequirePermission>
        ),
      },
      {
        path: "factures",
        element: (
          <RequirePermission anyOf={["billing:read"]}>
            <ClientFactures />
          </RequirePermission>
        ),
      },

      { path: "profil", element: <ClientProfil /> },

      {
        path: "abonnement",
        element: (
          <RequirePermission anyOf={["subscription:view"]}>
            <ClientAbonnement />
          </RequirePermission>
        ),
      },

      { path: "*", element: ClientIndexRedirect },
    ],
  },

  // ⚠️ Les URLs de retour Stripe sont au niveau racine
  {
    path: "/success",
    element: (
      <AuthGuard>
        <CheckoutSuccess />
      </AuthGuard>
    ),
  },
  {
    path: "/cancel",
    element: (
      <AuthGuard>
        <CheckoutCancel />
      </AuthGuard>
    ),
  },
];
