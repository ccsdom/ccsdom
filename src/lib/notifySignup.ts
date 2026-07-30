import { getFunctions, httpsCallable } from "firebase/functions";
import { initializeFirebase } from "@/firebase";

type NotifySignupPayload = {
  addressKey: string;
  companyName: string;
  legalStatus: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  planName: string;
  planPrice?: string;
  requestUid: string;
  docsRequiredCompleted: boolean;
  status: string;
  createdAtStr: string;
  adminConsoleUrl?: string;
  clientIp?: string;
  userAgent?: string;
};

export async function notifySignup(payload: NotifySignupPayload) {
  const fb = initializeFirebase();
  const app = (fb as any)?.firebaseApp || fb;

  if (!app) {
    throw new Error("Firebase non initialisé.");
  }

  const functions = getFunctions(app, "europe-west9");

  const callable = httpsCallable<NotifySignupPayload, { ok: boolean }>(
    functions,
    "sendSignupNotifications"
  );

  const response = await callable(payload);
  return response.data;
}
