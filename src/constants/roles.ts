export type Role = "admin" | "secretary" | "client";

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrateur",
  secretary: "Secrétaire",
  client: "Client",
};
