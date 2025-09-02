// src/components/guards/RequirePermission.tsx
import React from "react";
import useAuth from "@/hooks/useAuth";
import { Permission, ROLE_PERMISSIONS } from "@/types/permissions";

type Props = {
  anyOf: Permission[];
  children: React.ReactNode;
};

const RequirePermission: React.FC<Props> = ({ anyOf, children }) => {
  const { user } = useAuth();

  // Permissions explicites sur l'utilisateur (si dispo)
  const explicit = (user && (user as any).permissions) as Permission[] | undefined;

  // Permissions implicites via le rôle
  const fromRole =
    ROLE_PERMISSIONS[(user?.role as keyof typeof ROLE_PERMISSIONS) ?? ""] ?? [];

  const effective = new Set<Permission>([...(explicit ?? []), ...fromRole]);

  const allowed = anyOf.length === 0 || anyOf.some((p) => effective.has(p));

  if (!allowed) return null; // ou redirige vers une page /unauthorized
  return <>{children}</>;
};

export default RequirePermission;
