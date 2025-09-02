import { lazy } from "react";
import Loadable from "./Loadable";
import { GuestGuard, AuthGuard, RoleBasedGuard } from "@/components/auth";

// Pages publiques (sessions)
const Login = Loadable(lazy(() => import("@/pages/sessions/login")));
const Register = Loadable(lazy(() => import("@/pages/sessions/register")));
const VerifyCode = Loadable(lazy(() => import("@/pages/sessions/verify-code")));
const ForgetPassword = Loadable(lazy(() => import("@/pages/sessions/forget-password")));

// Démo Firebase
const LoginDemoWithFirebase = Loadable(lazy(() => import("@/pages/auth-demo/firebase/login")));
const RegisterDemoWithFirebase = Loadable(lazy(() => import("@/pages/auth-demo/firebase/register")));

// Layouts Dashboard — chemins corrigés selon ta structure
const AdminDashboardLayout = Loadable(lazy(() => import("@/pages/dashboard/DashboardAdmin")));
const ClientDashboardLayout = Loadable(lazy(() => import("@/pages/client/ClientDashboard")));

// Pages spécifiques dashboards
const AdminDashboard = Loadable(lazy(() => import("@/pages/dashboard/DashboardAdmin")));
const ClientDashboard = Loadable(lazy(() => import("@/pages/client/ClientDashboard")));

// Page erreur accès interdit
const UnauthorizedPage = Loadable(lazy(() => import("@/pages/errors/unauthorized")));

export const AuthRoutes = [
  {
    element: <GuestGuard />,
    children: [
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "forget-password", element: <ForgetPassword /> },
      { path: "verify-code", element: <VerifyCode /> },
    ],
  },

  {
    element: <AuthGuard />, // Routes nécessitant une authentification
    children: [
      {
        path: "admin/*",
        element: (
          <RoleBasedGuard roles={["admin", "secretary"]}>
            <AdminDashboardLayout />
          </RoleBasedGuard>
        ),
        children: [
          { path: "", element: <AdminDashboard /> },
          // Ajoute ici d’autres routes admin si besoin
        ],
      },
      {
        path: "client/*",
        element: (
          <RoleBasedGuard roles={["client"]}>
            <ClientDashboardLayout />
          </RoleBasedGuard>
        ),
        children: [
          { path: "", element: <ClientDashboard /> },
          // Ajoute ici d’autres routes client si besoin
        ],
      },
      {
        path: "unauthorized",
        element: <UnauthorizedPage />,
      },
    ],
  },

  // Démo Firebase (non protégées)
  { path: "firebase/login", element: <LoginDemoWithFirebase /> },
  { path: "firebase/register", element: <RegisterDemoWithFirebase /> },
];
