// src/components/auth/AuthGuard.tsx
import { FC, PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

type Role = "superadmin" | "admin" | "secretary" | "client";

const ADMIN_DASHBOARD = "/admin/dashboard";   // <- ICI, on fige l’URL admin
const CLIENT_DASHBOARD = "/client/dashboard";

const isAdminish = (role?: Role) =>
  role === "superadmin" || role === "admin" || role === "secretary";

const AuthGuard: FC<PropsWithChildren> = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, isInitialized, user } = useAuth();

  if (!isInitialized) return null;

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  // Redirection par défaut UNIQUEMENT depuis la racine
  if (location.pathname === "/") {
    if (user?.role === "client") return <Navigate to={CLIENT_DASHBOARD} replace />;
    if (isAdminish(user?.role)) return <Navigate to={ADMIN_DASHBOARD} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
