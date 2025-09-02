import { FC, Fragment, PropsWithChildren } from "react";
import { Navigate, Outlet, useLocation as useRRLocation } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

type Role = "superadmin" | "admin" | "secretary" | "client";

const ADMIN_DASHBOARD = "/dashboard";        // ou "/admin/dashboard"
const CLIENT_DASHBOARD = "/client/dashboard";

const GuestGuard: FC<PropsWithChildren> = ({ children }) => {
  const location = useRRLocation() as unknown as { state?: { from?: string } };
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    const from = location.state?.from;
    if (from) return <Navigate to={from} replace />;

    if (user?.role === "client") return <Navigate to={CLIENT_DASHBOARD} replace />;
    if (user?.role === "admin" || user?.role === "superadmin" || user?.role === "secretary") {
      return <Navigate to={ADMIN_DASHBOARD} replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <Fragment>{children || <Outlet />}</Fragment>;
};

export default GuestGuard;
