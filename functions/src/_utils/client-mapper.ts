import * as admin from "firebase-admin";
import { CLIENT_STATUS } from "../_config/signup-constants";

const SIGNUP_DOC_TYPES = ["kbis", "identityCard", "proofOfAddress"] as const;

export function normalizeString(value: unknown) {
  return String(value ?? "").trim();
}

export function normalizeEmailLower(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

export function isPlainObject(value: unknown): value is Record<string, any> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function resolveDocumentsMap(data: Record<string, any>) {
  const fromMap = isPlainObject(data.documents) ? data.documents : {};
  const result: Record<string, string> = {};

  for (const docType of SIGNUP_DOC_TYPES) {
    const fromStructured = normalizeString(fromMap[docType]);
    const fromLegacy = normalizeString(data[`documents.${docType}`]);

    const finalValue = fromStructured || fromLegacy;
    if (finalValue) {
      result[docType] = finalValue;
    }
  }

  return result;
}

function isUploadMeta(value: unknown) {
  return (
    isPlainObject(value) &&
    ("contentType" in value || "size" in value || "uploadedAt" in value)
  );
}

function isAnalysisMeta(value: unknown) {
  return (
    isPlainObject(value) &&
    ("result" in value ||
      "score" in value ||
      "validated" in value ||
      "mime" in value ||
      "ts" in value)
  );
}

function resolveDocumentsUploadMeta(data: Record<string, any>) {
  const structured = isPlainObject(data.documentsUploadMeta)
    ? data.documentsUploadMeta
    : {};

  const result: Record<string, any> = {};

  for (const docType of SIGNUP_DOC_TYPES) {
    const structuredValue = structured[docType];
    const legacyValue = data[`documentsMeta.${docType}`];

    if (isUploadMeta(structuredValue)) {
      result[docType] = structuredValue;
      continue;
    }

    if (isUploadMeta(legacyValue)) {
      result[docType] = legacyValue;
    }
  }

  return result;
}

function resolveDocumentsAnalysis(data: Record<string, any>) {
  const structured = isPlainObject(data.documentsAnalysis)
    ? data.documentsAnalysis
    : {};

  const legacyMetaMap = isPlainObject(data.documentsMeta)
    ? data.documentsMeta
    : {};

  const result: Record<string, any> = {};

  for (const docType of SIGNUP_DOC_TYPES) {
    const structuredValue = structured[docType];
    const legacyValue = legacyMetaMap[docType];

    if (isAnalysisMeta(structuredValue)) {
      result[docType] = structuredValue;
      continue;
    }

    if (isAnalysisMeta(legacyValue)) {
      result[docType] = legacyValue;
    }
  }

  return result;
}

function resolveBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function buildClientStatus(currentStatus?: unknown) {
  const s = normalizeString(currentStatus).toLowerCase();
  if (s === CLIENT_STATUS.SUSPENDED.toLowerCase()) return CLIENT_STATUS.SUSPENDED;
  return CLIENT_STATUS.ACTIVE;
}

/**
 * Maps a client_request to a client payload for approval.
 */
export function mapRequestToClient(
  requestData: Record<string, any>,
  clientData: Record<string, any>,
  options: {
    requestUid: string;
    ownerUid: string;
    actorUid: string;
    now: admin.firestore.FieldValue;
    accessProvisioned: boolean;
    accessProvisionedAt: admin.firestore.FieldValue | null;
  }
) {
  const { requestUid, ownerUid, actorUid, now, accessProvisioned, accessProvisionedAt } = options;

  const email = normalizeEmailLower(requestData.email || requestData.emailLower);
  const companyName = normalizeString(requestData.companyName || requestData.name);
  const addressKey = normalizeString(requestData.addressKey || requestData.locationKey || "orly");

  const firstName = normalizeString(requestData.firstName);
  const lastName = normalizeString(requestData.lastName);
  const representative =
    normalizeString(requestData.representative) ||
    `${firstName} ${lastName}`.trim();

  const documents = resolveDocumentsMap(requestData);
  const documentsUploadMeta = resolveDocumentsUploadMeta(requestData);
  const documentsAnalysis = resolveDocumentsAnalysis(requestData);

  const nextClientStatus = buildClientStatus(clientData.status);
  const requestStripeCheckout = isPlainObject(requestData.stripeCheckout)
    ? requestData.stripeCheckout
    : null;
  const clientStripeCheckout = isPlainObject(clientData.stripeCheckout)
    ? clientData.stripeCheckout
    : null;
  const stripeCheckout =
    requestStripeCheckout || clientStripeCheckout
      ? {
          ...(clientStripeCheckout || {}),
          ...(requestStripeCheckout || {}),
        }
      : null;
  const subscription =
    isPlainObject(requestData.subscription) || isPlainObject(clientData.subscription)
      ? {
          ...(isPlainObject(clientData.subscription) ? clientData.subscription : {}),
          ...(isPlainObject(requestData.subscription) ? requestData.subscription : {}),
        }
      : null;
  const resolvedPaymentStatus =
    requestData.paymentStatus || clientData.paymentStatus || "paid";
  const resolvedPlanId =
    requestData.mailPlanId ||
    requestData.subscriptionPlan ||
    clientData.plan ||
    clientData.mailPlanId ||
    clientData.subscriptionPlan ||
    null;

  return {
    uid: ownerUid,
    requestUid,
    ownerUid,
    email: email || clientData.email || null,
    emailLower: email || clientData.emailLower || null,

    companyName: companyName || normalizeString(clientData.companyName) || "",
    name: companyName || normalizeString(clientData.name) || "",

    firstName: firstName || normalizeString(clientData.firstName) || "",
    lastName: lastName || normalizeString(clientData.lastName) || "",
    representative:
      representative || normalizeString(clientData.representative) || "",
    phone:
      normalizeString(requestData.phone) ||
      normalizeString(clientData.phone) ||
      "",

    address:
      normalizeString(requestData.address) ||
      normalizeString(clientData.address) ||
      "",
    addressKey: addressKey || normalizeString(clientData.addressKey) || "orly",
    addressId: requestData.addressId || clientData.addressId || null,
    domiciliationAddressId:
      requestData.addressId ||
      clientData.domiciliationAddressId ||
      clientData.addressId ||
      null,

    legalStatus:
      normalizeString(requestData.legalStatus) ||
      normalizeString(clientData.legalStatus) ||
      "",
    projectType: requestData.projectType || clientData.projectType || null,
    accompanimentType:
      requestData.accompanimentType ||
      clientData.accompanimentType ||
      null,

    planId: resolvedPlanId,
    mailPlanId: requestData.mailPlanId || clientData.mailPlanId || null,
    plan: resolvedPlanId,
    planName:
      normalizeString(requestData.planName) ||
      normalizeString(clientData.planName) ||
      normalizeString(requestData.mailPlanId) ||
      normalizeString(clientData.plan) ||
      "",
    planPrice:
      normalizeString(requestData.planPrice) ||
      normalizeString(clientData.planPrice) ||
      "",

    paymentFrequency:
      requestData.paymentFrequency ||
      clientData.paymentFrequency ||
      null,
    paymentStatus: resolvedPaymentStatus,
    subscriptionStatus:
      requestData.subscriptionStatus ||
      clientData.subscriptionStatus ||
      (resolvedPaymentStatus === "paid" ? "active" : null),
    subscriptionPlan:
      requestData.subscriptionPlan ||
      requestData.mailPlanId ||
      clientData.subscriptionPlan ||
      resolvedPlanId,
    subscriptionAmountCents:
      requestData.subscriptionAmountCents ||
      clientData.subscriptionAmountCents ||
      null,
    subscriptionRenewalDate:
      requestData.subscriptionRenewalDate ||
      clientData.subscriptionRenewalDate ||
      null,
    ...(subscription ? { subscription } : {}),

    ...(stripeCheckout ? { stripeCheckout } : {}),

    signatureUrl:
      requestData.signatureUrl || clientData.signatureUrl || null,
    signatoryName:
      normalizeString(requestData.signatoryName) ||
      normalizeString(clientData.signatoryName) ||
      "",
    signedAt: requestData.signedAt || clientData.signedAt || null,

    pdfJobs: isPlainObject(requestData.pdfJobs)
      ? requestData.pdfJobs
      : isPlainObject(clientData.pdfJobs)
      ? clientData.pdfJobs
      : {},

    documents:
      Object.keys(documents).length > 0
        ? documents
        : isPlainObject(clientData.documents)
        ? clientData.documents
        : {},

    documentsUploadMeta:
      Object.keys(documentsUploadMeta).length > 0
        ? documentsUploadMeta
        : isPlainObject(clientData.documentsUploadMeta)
        ? clientData.documentsUploadMeta
        : {},

    documentsAnalysis:
      Object.keys(documentsAnalysis).length > 0
        ? documentsAnalysis
        : isPlainObject(clientData.documentsAnalysis)
        ? clientData.documentsAnalysis
        : {},

    docsRequiredCompleted: resolveBoolean(
      requestData.docsRequiredCompleted,
      resolveBoolean(clientData.docsRequiredCompleted, false)
    ),
    documentsRequiredCompleted: resolveBoolean(
      requestData.documentsRequiredCompleted,
      resolveBoolean(clientData.documentsRequiredCompleted, false)
    ),

    accessProvisioned,
    accessProvisionedAt,

    source:
      normalizeString(requestData.source) ||
      normalizeString(clientData.source) ||
      "public_onboarding",
    createdFrom:
      normalizeString(clientData.createdFrom) || "client_request",

    status: nextClientStatus,
    joinDate: clientData.joinDate || now,
    approvedAt: now,
    approvedBy: actorUid,
    updatedAt: now,
    createdAt: clientData.createdAt || now,
  };
}
