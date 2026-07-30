import { Hand, LifeBuoy } from "lucide-react";

export type MailPlanId = "classic" | "starter" | "business" | "premium";

export type MailPlanFeatureValue = boolean | "mensuelle" | "hebdomadaire";

export type MailPlan = {
  id: MailPlanId;
  name: string;
  price: string;
  numericPrice: number;
  description: string;
  isRecommended?: boolean;
  stripeMonthlyPriceId: string;
  stripeYearlyPriceId: string;
  features: Record<string, MailPlanFeatureValue>;
};

export const mailPlans: MailPlan[] = [
  {
    id: "classic",
    name: "Classic",
    price: "19,99 € HT/mois",
    numericPrice: 19.99,
    description: "Retrait sur place uniquement. Aucun scan, aucune notification.",
    stripeMonthlyPriceId: "price_1S170KCam0qbdqzzQ2MbafOg",
    stripeYearlyPriceId: "price_1S171gCam0qbdqzzTngDPaSO",
    features: {
      "Retrait sur place": true,
      "Scan courrier": false,
      "Notification email": false,
      "Résumé IA": false,
      "Alerte prioritaire": false,
      "Réexpédition": false,
      "Suivi postal": false,
    },
  },
  {
    id: "starter",
    name: "Starter",
    price: "29,99 € HT/mois",
    numericPrice: 29.99,
    description: "Scan du courrier et notification email simple.",
    stripeMonthlyPriceId: "price_1S1739Cam0qbdqzzvFqXX7pc",
    stripeYearlyPriceId: "price_1S173wCam0qbdqzzWWnwQWNH",
    features: {
      "Retrait sur place": true,
      "Scan courrier": true,
      "Notification email": true,
      "Résumé IA": false,
      "Alerte prioritaire": false,
      "Réexpédition": false,
      "Suivi postal": false,
    },
  },
  {
    id: "business",
    name: "Business",
    price: "34,99 € HT/mois",
    numericPrice: 34.99,
    description: "Scan, notification email simple et réexpédition mensuelle.",
    isRecommended: true,
    stripeMonthlyPriceId: "price_1S174YCam0qbdqzzS3U4OZ2U",
    stripeYearlyPriceId: "price_1SD0JaCam0qbdqzzGRvIq8ks",
    features: {
      "Retrait sur place": true,
      "Scan courrier": true,
      "Notification email": true,
      "Résumé IA": false,
      "Alerte prioritaire": false,
      "Réexpédition": "mensuelle",
      "Suivi postal": true,
    },
  },
  {
    id: "premium",
    name: "Premium",
    price: "39,99 € HT/mois",
    numericPrice: 39.99,
    description: "Scan, résumé IA, alerte prioritaire et réexpédition hebdomadaire.",
    stripeMonthlyPriceId: "price_1SD0NCCam0qbdqzzSV1ldxBM",
    stripeYearlyPriceId: "price_1SD0OCCam0qbdqzzDsTe5gT2",
    features: {
      "Retrait sur place": true,
      "Scan courrier": true,
      "Notification email": true,
      "Résumé IA": true,
      "Alerte prioritaire": true,
      "Réexpédition": "hebdomadaire",
      "Suivi postal": true,
    },
  },
];

export function normalizeMailPlanId(value: unknown): MailPlanId {
  const planId = String(value ?? "").trim().toLowerCase();

  if (
    planId === "classic" ||
    planId === "starter" ||
    planId === "business" ||
    planId === "premium"
  ) {
    return planId;
  }

  if (planId === "pro") return "business";
  if (planId === "standard") return "classic";

  return "starter";
}

export function resolveMailPlanId(data: Record<string, any>): MailPlanId {
  const subscription =
    data.subscription && typeof data.subscription === "object"
      ? data.subscription
      : {};

  return normalizeMailPlanId(
    data.planId ||
      data.mailPlanId ||
      data.plan ||
      data.subscriptionPlan ||
      subscription.planId ||
      subscription.plan ||
      data.tier
  );
}

export function isMailScanEnabled(planId: unknown): boolean {
  return normalizeMailPlanId(planId) !== "classic";
}

export function isAiMailSummaryEnabled(planId: unknown): boolean {
  return normalizeMailPlanId(planId) === "premium";
}

export const expertAccompanimentPlans = {
  creation: {
    id: "expert_creation",
    name: "Accompagnement expert à la création",
    price: "400 € HT",
    numericPrice: 400,
    icon: LifeBuoy,
    stripePriceId: "price_1SDKhHCam0qbdqzzGV8NO114",
    features: [
      "Prise en charge complète du dossier",
      "Création 100% en ligne",
      "Assistance juridique incluse (abonnement 1 an+)",
      "Frais greffe et annonces légales à votre charge",
    ],
  },
  transfert: {
    id: "expert_transfert",
    name: "Accompagnement expert au transfert",
    price: "350 € HT",
    numericPrice: 350,
    icon: LifeBuoy,
    stripePriceId: "price_1SDKi4Cam0qbdqzzsYAfwwkI",
    features: [
      "Prise en charge complète du dossier de transfert",
      "Gestion des formalités administratives",
      "Mise à jour de l'adresse auprès des organismes",
      "Frais greffe et annonces légales à votre charge",
    ],
  },
};

export const soloAccompanimentPlan = {
  id: "solo",
  name: "Je souhaite gérer les démarches seul",
  price: "Gratuit",
  numericPrice: 0,
  icon: Hand,
  stripePriceId: null,
  features: [],
};
