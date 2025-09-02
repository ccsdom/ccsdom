export type Status =
  | "pending"
  | "approved"
  | "rejected"
  | "active"
  | "inactive"
  | "draft"
  | "sent"
  | "paid"
  | "unpaid"
  | "archived";

export const STATUS_LABELS_FR: Record<Status, string> = {
  pending: "En attente",
  approved: "Approuvé",
  rejected: "Rejeté",
  active: "Actif",
  inactive: "Inactif",
  draft: "Brouillon",
  sent: "Envoyé",
  paid: "Payé",
  unpaid: "Non payé",
  archived: "Archivé",
};
