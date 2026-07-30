import { 
  SIGNUP_REQUEST_STATUS, 
  SIGNUP_STATUS_LABELS 
} from "@/lib/constants/signup";

export type SignupRequestStatus =
  | "draft"
  | "documents_partial"
  | "docs_ready"
  | "payment_pending"
  | "pending_validation"
  | "approved"
  | "rejected"
  | "converted";

export function getSignupStatusLabel(status?: string | null) {
  if (!status) return "—";
  return SIGNUP_STATUS_LABELS[status] || status;
}

export function getSignupStatusVariant(
  status?: string | null
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case SIGNUP_REQUEST_STATUS.APPROVED:
    case SIGNUP_REQUEST_STATUS.CONVERTED:
      return "default";
    case SIGNUP_REQUEST_STATUS.DOCS_READY:
    case SIGNUP_REQUEST_STATUS.PENDING_VALIDATION:
      return "secondary";
    case SIGNUP_REQUEST_STATUS.REJECTED:
      return "destructive";
    default:
      return "outline";
  }
}

export function isSignupReadyForValidation(status?: string | null) {
  return (
    status === SIGNUP_REQUEST_STATUS.DOCS_READY || 
    status === SIGNUP_REQUEST_STATUS.PENDING_VALIDATION
  );
}