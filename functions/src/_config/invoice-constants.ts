/**
 * Invoice lifecycle statuses
 */
export const INVOICE_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  CANCELLED: "cancelled",
  ERROR: "error",
} as const;

/**
 * PDF generation pipeline statuses
 * Aligned with project-wide status naming (pending, processing, complete, error)
 */
export const PDF_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETE: "complete",
  ERROR: "error",
} as const;

/**
 * Static seller configuration for invoice snapshots.
 * This can be moved to a Firestore config document later if needed.
 */
export const SELLER_CONFIG = {
  name: "CCS DOM",
  address: "123 Avenue de Paris, 75012 Paris",
  email: "contact@ccsdom.fr",
  siren: "123 456 789",
  tva: "FR123456789",
};
