import { jsx as _jsx } from "react/jsx-runtime";
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
        element: _jsx(GuestGuard, {}),
        children: [
            { path: "login", element: _jsx(Login, {}) },
            { path: "register", element: _jsx(Register, {}) },
            { path: "forget-password", element: _jsx(ForgetPassword, {}) },
            { path: "verify-code", element: _jsx(VerifyCode, {}) },
        ],
    },
    {
        element: _jsx(AuthGuard, {}), // Routes nécessitant une authentification
        children: [
            {
                path: "admin/*",
                element: (_jsx(RoleBasedGuard, { roles: ["admin", "secretary"], children: _jsx(AdminDashboardLayout, {}) })),
                children: [
                    { path: "", element: _jsx(AdminDashboard, {}) },
                    // Ajoute ici d’autres routes admin si besoin
                ],
            },
            {
                path: "client/*",
                element: (_jsx(RoleBasedGuard, { roles: ["client"], children: _jsx(ClientDashboardLayout, {}) })),
                children: [
                    { path: "", element: _jsx(ClientDashboard, {}) },
                    // Ajoute ici d’autres routes client si besoin
                ],
            },
            {
                path: "unauthorized",
                element: _jsx(UnauthorizedPage, {}),
            },
        ],
    },
    // Démo Firebase (non protégées)
    { path: "firebase/login", element: _jsx(LoginDemoWithFirebase, {}) },
    { path: "firebase/register", element: _jsx(RegisterDemoWithFirebase, {}) },
];
