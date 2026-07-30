import { getFunctions, httpsCallable } from "firebase/functions";
import type { FirebaseApp } from "firebase/app";

export type StripeCheckoutVerifyResult = {
  ok?: boolean;
  paid?: boolean;
  status?: string | null;
  mode?: string | null;
  customer?: string | null;
  subscriptionId?: string | null;
};

export function getSignupPaymentFunctions(firebaseApp: FirebaseApp) {
  return getFunctions(firebaseApp, "europe-west1");
}

export async function verifyStripeCheckoutSessionCall(args: {
  firebaseApp: FirebaseApp;
  sessionId: string;
}): Promise<StripeCheckoutVerifyResult> {
  const sessionId = String(args.sessionId ?? "").trim();

  if (!sessionId) {
    throw new Error("sessionId Stripe manquant.");
  }

  const callable = httpsCallable<
    { sessionId: string },
    StripeCheckoutVerifyResult
  >(getSignupPaymentFunctions(args.firebaseApp), "verifyStripeCheckoutSession");

  const response = await callable({ sessionId });
  return response.data;
}