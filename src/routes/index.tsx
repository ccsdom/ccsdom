// src/routes/index.tsx
import { RouteObject, Navigate } from "react-router-dom";

import { AuthRoutes } from "./auth";
import { PublicRoutes } from "./public";
// import { DashboardRoutes } from "./dashboard";
import { AdminRoutes } from "./dashboard"; // ✅ Nouvelles routes admin sous /admin
import { ComponentRoutes } from "./components";
import { ClientRoutes } from "./client";

import Loadable from "./Loadable";
import { lazy } from "react";

const ErrorPage = Loadable(lazy(() => import("@/pages/404")));
const Landing   = Loadable(lazy(() => import("@/pages/landing")));

// ✅ Pages Stripe Checkout
const CheckoutSuccess = Loadable(lazy(() => import("@/pages/checkout/Success")));
const CheckoutCancel  = Loadable(lazy(() => import("@/pages/checkout/Cancel")));

export const routes = (): RouteObject[] => [
  // Accueil public
  {
    path: "/",
    element: <Landing />,
  },

  // Compat anciens liens /dashboard → /admin/dashboard
  {
    path: "/dashboard/*",
    element: <Navigate to="/admin/dashboard" replace />,
  },

  // ✅ Routes de redirection Stripe (publiques)
  {
    path: "/checkout/success",
    element: <CheckoutSuccess />,
  },
  {
    path: "/checkout/cancel",
    element: <CheckoutCancel />,
  },

  // Groupes existants
  ...AuthRoutes,
  ...ComponentRoutes,
  ...AdminRoutes,
  ...PublicRoutes, // si ces routes les redéclarent aussi, gardez une seule des deux déclarations
  ...ClientRoutes,

  // 404
  {
    path: "*",
    element: <ErrorPage />,
  },
];
