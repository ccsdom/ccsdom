import type { SignupFormValues } from "@/features/signup/config";
import {
  ACCOMPANIMENT_LABELS,
  ADDRESS_LABELS,
  LEGAL_STATUS_LABELS,
  MAIL_PLAN_LABELS,
  PAYMENT_FREQUENCY_LABELS,
  PROJECT_TYPE_LABELS,
} from "@/features/signup/labels";
import { resolveLegalStatus } from "@/features/signup/config";

export function getAddressLabel(addressId?: string | null) {
  if (!addressId) return "—";
  return ADDRESS_LABELS[addressId] || addressId;
}

export function getMailPlanLabel(mailPlanId?: string | null) {
  if (!mailPlanId) return "—";
  return MAIL_PLAN_LABELS[mailPlanId] || mailPlanId;
}

export function getProjectTypeLabel(projectType?: string | null) {
  if (!projectType) return "—";
  return PROJECT_TYPE_LABELS[projectType] || projectType;
}

export function getAccompanimentLabel(accompanimentType?: string | null) {
  if (!accompanimentType) return "—";
  return ACCOMPANIMENT_LABELS[accompanimentType] || accompanimentType;
}

export function getPaymentFrequencyLabel(paymentFrequency?: string | null) {
  if (!paymentFrequency) return "—";
  return PAYMENT_FREQUENCY_LABELS[paymentFrequency] || paymentFrequency;
}

export function getLegalStatusLabel(
  legalStatus?: string | null,
  otherLegalStatus?: string | null
) {
  const resolved = resolveLegalStatus(
    String(legalStatus ?? ""),
    String(otherLegalStatus ?? "")
  );

  if (!resolved) return "—";
  if (legalStatus === "autres") return resolved;

  return LEGAL_STATUS_LABELS[resolved] || resolved;
}

export function buildSignupSummary(values: SignupFormValues) {
  return {
    projectType: getProjectTypeLabel(String(values.projectType ?? "")),
    companyName: String(values.companyName ?? "").trim() || "—",
    legalStatus: getLegalStatusLabel(
      String(values.legalStatus ?? ""),
      String(values.otherLegalStatus ?? "")
    ),
    representative:
      `${values.firstName ?? ""} ${values.lastName ?? ""}`.trim() || "—",
    email: String(values.email ?? "").trim() || "—",
    phone: String(values.phone ?? "").trim() || "—",
    address: getAddressLabel(String(values.addressId ?? "")),
    mailPlan: getMailPlanLabel(String(values.mailPlanId ?? "")),
    accompaniment: getAccompanimentLabel(
      String(values.accompanimentType ?? "")
    ),
    paymentFrequency: getPaymentFrequencyLabel(
      String(values.paymentFrequency ?? "")
    ),
    siret: String(values.siret ?? "").trim() || "En cours d'immatriculation",
  };
}