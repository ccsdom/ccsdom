import { FC, PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

interface ProtectedRouteProps {
  allowedRoles: string[];
}

const ProtectedRoute: FC<PropsWithChildren & ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate replace to="/unauthorized" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
