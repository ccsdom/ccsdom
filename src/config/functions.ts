// src/config/functions.ts
const REGION = "europe-west9";
const PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID || "ccs-dom";

const BASE =
  import.meta.env.VITE_FUNCTIONS_BASE_URL
  || `https://${REGION}-${PROJECT_ID}.cloudfunctions.net`;

export const endpoints = {
  // ✅ si tu renseignes VITE_FN_CREATE_CHECKOUT = URL a.run.app, on la prend
  createCheckoutSession:
    import.meta.env.VITE_FN_CREATE_CHECKOUT
    || `${BASE}/createCheckoutSession`,

  createBillingPortalSession:
    import.meta.env.VITE_FN_CREATE_BILLING_PORTAL
    || `${BASE}/createBillingPortalSession`,
} as const;
