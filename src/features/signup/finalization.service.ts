import { getFunctions, httpsCallable } from "firebase/functions";
import type { FirebaseApp } from "firebase/app";

import type {
  SignupAddressKey,
  SignupFormValues,
} from "@/features/signup/config";
import {
  cleanObject,
  getResolvedLegalStatus,
  normalizeEmailLower,
  normalizeSiret,
  stripFiles,
} from "@/features/signup/contract.utils";

type CheckSignupUniquenessResponse = {
  ok: boolean;
  siretExists?: boolean;
  emailExists?: boolean;
};

type CreatePdfJobsResponse = {
  ok: boolean;
  contractId?: string;
  attestationId?: string;
  idempotent?: boolean;
};

type FinalizeSignupResponse = {
  ok: boolean;
  uid: string;
  requestUid: string;
};

function getSignupFunctions(firebaseApp: FirebaseApp) {
  return getFunctions(firebaseApp, "europe-west9");
}

function sanitizeSignupPayload(values: SignupFormValues) {
  const jsonSafe = stripFiles(values as Record<string, any>);
  const sanitized = { ...jsonSafe };

  delete sanitized.password;
  delete sanitized.currentPassword;
  delete sanitized.confirmPassword;
  delete sanitized.signature;

  return sanitized;
}

export async function checkSignupUniquenessCall(args: {
  firebaseApp: FirebaseApp;
  siret?: string;
  email?: string;
}) {
  const callable = httpsCallable<
    { siret?: string; email?: string },
    CheckSignupUniquenessResponse
  >(getSignupFunctions(args.firebaseApp), "checkSignupUniqueness");

  const response = await callable({
    siret: args.siret || undefined,
    email: args.email || undefined,
  });

  return response.data;
}

export async function createPdfJobsCall(args: {
  firebaseApp: FirebaseApp;
  addressKey: SignupAddressKey;
  data: Record<string, any>;
  signatureUrl?: string | null;
  clientRequestId: string;
}) {
  const callable = httpsCallable<
    {
      addressKey: SignupAddressKey;
      data: Record<string, any>;
      signatureUrl?: string | null;
      clientRequestId: string;
    },
    CreatePdfJobsResponse
  >(getSignupFunctions(args.firebaseApp), "createPdfJobs");

  const response = await callable({
    addressKey: args.addressKey,
    data: args.data,
    signatureUrl: args.signatureUrl || "",
    clientRequestId: args.clientRequestId,
  });

  return response.data;
}

export async function verifyStripeCheckoutSessionCall(args: {
  firebaseApp: FirebaseApp;
  sessionId: string;
}) {
  const stripeFunctions = getFunctions(args.firebaseApp, "europe-west1");
  const callable = httpsCallable<
    { sessionId: string },
    { ok: boolean; paid: boolean; status?: string }
  >(stripeFunctions, "verifyStripeCheckoutSession");

  const response = await callable({
    sessionId: args.sessionId,
  });

  return response.data;
}

export async function finalizeSignupCall(args: {
  firebaseApp: FirebaseApp;
  addressKey: SignupAddressKey;
  signatureUrl?: string | null;
  formData: Record<string, any>;
}) {
  const callable = httpsCallable<
    {
      addressKey: SignupAddressKey;
      signatureUrl?: string | null;
      formData: Record<string, any>;
    },
    FinalizeSignupResponse
  >(getSignupFunctions(args.firebaseApp), "finalizeSignup");

  const response = await callable({
    addressKey: args.addressKey,
    signatureUrl: args.signatureUrl || "",
    formData: args.formData,
  });

  return response.data;
}

export function buildCreatePdfJobsPayload(args: {
  values: SignupFormValues;
  signatureDataUrl: string;
  signatureUrl?: string | null;
  signatoryName: string;
  signedAt: string;
}) {
  const sanitized = sanitizeSignupPayload(args.values);

  return cleanObject({
    ...sanitized,
    signatureUrl: args.signatureUrl || "",
    signatureCaption: "Lu et approuvé",
    signatoryName: args.signatoryName,
    signedAt: args.signedAt,
    signaturePlacement: "domicilie",
    legalStatus: getResolvedLegalStatus(args.values),
  });
}

export function buildFinalizeSignupPayload(args: {
  values: SignupFormValues;
  userEmail: string;
  siretNorm: string;
  signatureUrl?: string | null;
  signatoryName: string;
  signedAt: string;
  contractId?: string | null;
  attestationId?: string | null;
}) {
  const sanitized = sanitizeSignupPayload(args.values);

  return cleanObject({
    ...sanitized,
    email: normalizeEmailLower(args.userEmail),
    emailLower: normalizeEmailLower(args.userEmail),
    siret: normalizeSiret(args.siretNorm),
    legalStatus: getResolvedLegalStatus(args.values),
    signatureUrl: args.signatureUrl || null,
    signedAt: args.signedAt,
    signatoryName: args.signatoryName,
    pdfJobs: {
      contractId: args.contractId || null,
      attestationId: args.attestationId || null,
    },
  });
}