// src/config/pricing.ts

/** Plans disponibles */
export type PlanKey = "classic" | "starter" | "business" | "premium";

/** ⚠️ Intervalle en clair attendu par ton UI */
export type BillingInterval = "monthly" | "yearly";

/** IDs de prix Stripe pour chaque plan/intervalle */
export const PRICE_IDS: Record<PlanKey, Record<BillingInterval, string>> = {
  classic: {
    monthly: "price_1S170KCam0qbdqzzQ2MbafOg", // ← remplace par ton vrai ID Stripe
    yearly:  "price_1S171gCam0qbdqzzTngDPaSO",  // ← remplace par ton vrai ID Stripe
  },
  starter: {
    monthly: "price_1S1739Cam0qbdqzzvFqXX7pc",
    yearly:  "price_1S173wCam0qbdqzzWWnwQWNH",
  },
  business: {
    monthly: "price_1S174YCam0qbdqzzS3U4OZ2U",
    yearly:  "price_1S175LCam0qbdqzzdyV987WP",
  },
  premium: {
    monthly: "price_1S176RCam0qbdqzzcsIuqOgS",
    yearly:  "price_1S177NCam0qbdqzz2kFVdmkr",
  },
};

/** Métadonnées d’affichage (HT) + features */
export const PLAN_META: Record<
  PlanKey,
  {
    label: string;
    monthlyHT: number;
    yearlyHT: number;
    features: string[];
    popular?: boolean;
  }
> = {
  classic: {
    label: "Classic",
    monthlyHT: 19.99,
    yearlyHT: +(19.99 * 12 * 0.9).toFixed(2),
    features: [
      "Retrait sur place",
      "Scan du courrier",
      "Notification email",
      "Suivi postal",
      "Stockage 3 mois",
    ],
  },
  starter: {
    label: "Starter",
    monthlyHT: 29.99,
    yearlyHT: +(29.99 * 12 * 0.9).toFixed(2),
    features: [
      "Retrait sur place",
      "Scan du courrier",
      "Notification email",
      "Suivi postal",
      "Stockage 6 mois",
    ],
    popular: true, // Recommandé
  },
  business: {
    label: "Business",
    monthlyHT: 34.99,
    yearlyHT: +(34.99 * 12 * 0.9).toFixed(2),
    features: [
      "Retrait sur place",
      "Scan du courrier",
      "Réexpédition (mensuelle)",
      "Notification email",
      "Suivi postal",
      "Stockage 12 mois",
      "Support prioritaire",
    ],
  },
  premium: {
    label: "Premium",
    monthlyHT: 39.99,
    yearlyHT: +(39.99 * 12 * 0.9).toFixed(2),
    features: [
      "Retrait sur place",
      "Scan du courrier",
      "Réexpédition (hebdomadaire)",
      "Notification email",
      "Suivi postal",
      "Stockage illimité",
      "Support prioritaire",
      "Numérisation avancée",
    ],
  },
};

/** Helper pour récupérer l’ID Stripe */
export function priceIdFor(plan: PlanKey, interval: BillingInterval): string {
  return PRICE_IDS[plan][interval];
}
