export type MailPlanId = "classic" | "starter" | "business" | "premium";

export type MailPlanPolicy = {
  scanEnabled: boolean;
  emailNotificationEnabled: boolean;
  aiSummaryEnabled: boolean;
  priorityAlertEnabled: boolean;
  forwarding: false | "monthly" | "weekly";
};

const MAIL_PLAN_POLICIES: Record<MailPlanId, MailPlanPolicy> = {
  classic: {
    scanEnabled: false,
    emailNotificationEnabled: false,
    aiSummaryEnabled: false,
    priorityAlertEnabled: false,
    forwarding: false,
  },
  starter: {
    scanEnabled: true,
    emailNotificationEnabled: true,
    aiSummaryEnabled: false,
    priorityAlertEnabled: false,
    forwarding: false,
  },
  business: {
    scanEnabled: true,
    emailNotificationEnabled: true,
    aiSummaryEnabled: false,
    priorityAlertEnabled: false,
    forwarding: "monthly",
  },
  premium: {
    scanEnabled: true,
    emailNotificationEnabled: true,
    aiSummaryEnabled: true,
    priorityAlertEnabled: true,
    forwarding: "weekly",
  },
};

export function normalizeMailPlanId(value: unknown): MailPlanId {
  const planId = String(value ?? "").trim().toLowerCase();

  if (planId === "classic" || planId === "starter" || planId === "business" || planId === "premium") {
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

export function getMailPlanPolicy(planId: unknown): MailPlanPolicy {
  return MAIL_PLAN_POLICIES[normalizeMailPlanId(planId)];
}
