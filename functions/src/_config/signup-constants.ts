/**
 * Technical statuses for client_requests
 */
export const SIGNUP_REQUEST_STATUS = {
  DRAFT: "draft",
  PAYMENT_PENDING: "payment_pending",
  PAYMENT_RECEIVED: "payment_received",
  DOCS_READY: "docs_ready",
  PENDING_VALIDATION: "pending_validation",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

/**
 * Lifecycle statuses for clients
 */
export const CLIENT_STATUS = {
  ACTIVE: "Actif",
  INACTIVE: "Inactif",
  SUSPENDED: "Suspendu",
  REFUSED: "Refusé",
  PENDING: "En attente de validation",
} as const;
