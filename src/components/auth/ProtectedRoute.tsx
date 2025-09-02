import { FC, PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

type Role = "superadmin" | "admin" | "secretary" | "client";

interface ProtectedRouteProps {
  allowedRoles: Role[];
}

const ProtectedRoute: FC<PropsWithChildren & ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate replace to="/login" />;

  const role = user?.role as Role | undefined;
  if (!role || !allowedRoles.includes(role)) {
    return <Navigate replace to="/unauthorized" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
