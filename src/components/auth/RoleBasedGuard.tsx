import { PropsWithChildren } from "react";
import { Outlet, Navigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

type Role = "superadmin" | "admin" | "secretary" | "client";

interface Props extends PropsWithChildren {
  roles: Role[];
}

const RoleBasedGuard = ({ children, roles }: Props) => {
  const { user } = useAuth();
  const role = user?.role as Role | undefined;

  if (role && roles.includes(role)) return <>{children || <Outlet />}</>;
  return <Navigate to="/unauthorized" replace />;
};

export default RoleBasedGuard;
