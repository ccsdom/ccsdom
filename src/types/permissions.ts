// src/types/permissions.ts
export type Permission =
  | "portal:client"
  | "docs:view"
  | "docs:upload"
  | "courier:read"
  | "billing:read"
  | "subscription:view"
  // tu peux en ajouter ici (ex: "portal:admin", etc.)
  ;

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  superadmin: ["portal:client","docs:view","docs:upload","courier:read","billing:read","subscription:view"],
  admin:      ["portal:client","docs:view","docs:upload","courier:read","billing:read","subscription:view"],
  secretary:  ["docs:upload","courier:read"],
  client:     ["portal:client","docs:view","docs:upload","courier:read","billing:read","subscription:view"],
};
