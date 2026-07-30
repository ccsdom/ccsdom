export const SIGNUP_REQUEST_STATUS = {
  DRAFT: "draft",
  PAYMENT_PENDING: "payment_pending",
  PAYMENT_RECEIVED: "payment_received",
  PENDING_VALIDATION: "pending_validation",
  APPROVED: "approved",
  REJECTED: "rejected",
  // Legacy or specific frontend states
  DOCUMENTS_PARTIAL: "documents_partial",
  DOCS_READY: "docs_ready",
  CONVERTED: "converted",
} as const;

export type SignupRequestStatus =
  (typeof SIGNUP_REQUEST_STATUS)[keyof typeof SIGNUP_REQUEST_STATUS];

export const CLIENT_STATUS = {
  ACTIVE: "Actif",
  INACTIVE: "Inactif",
  SUSPENDED: "Suspendu",
  REFUSED: "Refusé",
  PENDING: "En attente de validation",
} as const;

export type ClientStatus = (typeof CLIENT_STATUS)[keyof typeof CLIENT_STATUS];

/**
 * Labels for display in the UI
 */
export const SIGNUP_STATUS_LABELS: Record<string, string> = {
  [SIGNUP_REQUEST_STATUS.DRAFT]: "Brouillon",
  [SIGNUP_REQUEST_STATUS.DOCUMENTS_PARTIAL]: "Documents partiels",
  [SIGNUP_REQUEST_STATUS.DOCS_READY]: "Documents complets",
  [SIGNUP_REQUEST_STATUS.PAYMENT_PENDING]: "Paiement en attente",
  [SIGNUP_REQUEST_STATUS.PAYMENT_RECEIVED]: "Paiement reçu",
  [SIGNUP_REQUEST_STATUS.PENDING_VALIDATION]: "À valider",
  [SIGNUP_REQUEST_STATUS.APPROVED]: "Validé",
  [SIGNUP_REQUEST_STATUS.REJECTED]: "Refusé", // Ambiguïté : "Rejeté" ou "Refusé" ? Dans `status.ts` c'était "Refusé".
  [SIGNUP_REQUEST_STATUS.CONVERTED]: "Converti",
  [CLIENT_STATUS.ACTIVE]: "Actif",
  [CLIENT_STATUS.INACTIVE]: "Inactif",
  [CLIENT_STATUS.SUSPENDED]: "Suspendu",
  [CLIENT_STATUS.REFUSED]: "Refusé",
  [CLIENT_STATUS.PENDING]: "En attente de validation",
};

