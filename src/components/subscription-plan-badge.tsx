import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  mailPlans,
  normalizeMailPlanId,
  type MailPlanId,
} from "@/lib/plans";

const PLAN_STYLES: Record<MailPlanId, { badge: string; dot: string }> = {
  classic: {
    badge: "border-slate-300 bg-slate-100 text-slate-700",
    dot: "bg-slate-500",
  },
  starter: {
    badge: "border-sky-200 bg-sky-50 text-sky-800",
    dot: "bg-sky-500",
  },
  business: {
    badge: "border-amber-300 bg-amber-50 text-amber-900",
    dot: "bg-amber-500",
  },
  premium: {
    badge: "border-emerald-300 bg-emerald-50 text-emerald-900",
    dot: "bg-emerald-500",
  },
};

type SubscriptionPlanBadgeProps = {
  planId: unknown;
  className?: string;
  compact?: boolean;
  suffix?: string;
};

export function SubscriptionPlanBadge({
  planId,
  className,
  compact = false,
  suffix,
}: SubscriptionPlanBadgeProps) {
  const normalizedPlanId = normalizeMailPlanId(planId);
  const plan = mailPlans.find((item) => item.id === normalizedPlanId);
  const styles = PLAN_STYLES[normalizedPlanId];

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full font-bold shadow-none",
        compact ? "h-5 px-2 text-[10px]" : "h-6 px-2.5 text-xs",
        styles.badge,
        className
      )}
      title={`Forfait ${plan?.name ?? normalizedPlanId}`}
    >
      <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} />
      <span>{plan?.name ?? normalizedPlanId}</span>
      {suffix ? <span className="font-medium opacity-75">{suffix}</span> : null}
    </Badge>
  );
}

export function SubscriptionPlanLegend({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)} aria-label="Code couleur des forfaits">
      {mailPlans.map((plan) => (
        <SubscriptionPlanBadge key={plan.id} planId={plan.id} compact />
      ))}
    </div>
  );
}