export type MailPlanId = "classic" | "starter" | "business" | "premium";
export type BillingFrequency = "monthly" | "yearly";

export const MAIL_PLAN_CATALOG: Record<
  MailPlanId,
  {
    name: string;
    monthlyAmountCents: number;
    stripeMonthlyPriceId: string;
    stripeYearlyPriceId: string;
  }
> = {
  classic: {
    name: "Classic",
    monthlyAmountCents: 1999,
    stripeMonthlyPriceId: "price_1S170KCam0qbdqzzQ2MbafOg",
    stripeYearlyPriceId: "price_1S171gCam0qbdqzzTngDPaSO",
  },
  starter: {
    name: "Starter",
    monthlyAmountCents: 2999,
    stripeMonthlyPriceId: "price_1S1739Cam0qbdqzzvFqXX7pc",
    stripeYearlyPriceId: "price_1S173wCam0qbdqzzWWnwQWNH",
  },
  business: {
    name: "Business",
    monthlyAmountCents: 3499,
    stripeMonthlyPriceId: "price_1S174YCam0qbdqzzS3U4OZ2U",
    stripeYearlyPriceId: "price_1SD0JaCam0qbdqzzGRvIq8ks",
  },
  premium: {
    name: "Premium",
    monthlyAmountCents: 3999,
    stripeMonthlyPriceId: "price_1SD0NCCam0qbdqzzSV1ldxBM",
    stripeYearlyPriceId: "price_1SD0OCCam0qbdqzzDsTe5gT2",
  },
};

export function normalizeMailPlanId(value: unknown): MailPlanId | null {
  const planId = String(value ?? "").trim().toLowerCase();
  if (planId === "classic" || planId === "starter" || planId === "business" || planId === "premium") {
    return planId;
  }
  if (planId === "pro") return "business";
  return null;
}

export function normalizeBillingFrequency(value: unknown): BillingFrequency {
  const frequency = String(value ?? "").trim().toLowerCase();
  return frequency === "yearly" || frequency === "annual" || frequency === "annually"
    ? "yearly"
    : "monthly";
}

export function stripePriceIdForPlan(planId: MailPlanId, frequency: BillingFrequency): string {
  const plan = MAIL_PLAN_CATALOG[planId];
  return frequency === "yearly" ? plan.stripeYearlyPriceId : plan.stripeMonthlyPriceId;
}

export function planFromStripePriceId(priceId: unknown): { planId: MailPlanId; frequency: BillingFrequency } | null {
  const value = String(priceId ?? "").trim();
  for (const [planId, plan] of Object.entries(MAIL_PLAN_CATALOG) as Array<[MailPlanId, typeof MAIL_PLAN_CATALOG[MailPlanId]]>) {
    if (plan.stripeMonthlyPriceId === value) return { planId, frequency: "monthly" };
    if (plan.stripeYearlyPriceId === value) return { planId, frequency: "yearly" };
  }
  return null;
}

export function planAmountCents(planId: MailPlanId, frequency: BillingFrequency): number {
  const monthlyAmount = MAIL_PLAN_CATALOG[planId].monthlyAmountCents;
  return frequency === "yearly" ? Math.round(monthlyAmount * 12 * 0.9) : monthlyAmount;
}
