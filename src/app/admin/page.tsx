"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  AlertTriangle,
  Building,
  Clock3,
  DollarSign,
  Users,
  CreditCard,
  Loader2,
  CheckCircle2,
  Gauge,
  Mail,
  ShieldAlert,
  FileText,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import dynamic from "next/dynamic";

const AdminChart = dynamic(() => import("@/components/admin-chart").then(mod => mod.AdminChart), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full animate-pulse bg-muted rounded-lg" />
});

const PlanDistributionChart = dynamic(() => import("@/components/plan-distribution-chart").then(mod => mod.PlanDistributionChart), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full animate-pulse bg-muted rounded-lg" />
});

import { Client } from "@/app/admin/clients/page";
import {
  allAddresses,
  type CenterGovernanceAddress,
  mergeAddressesWithDefaults,
  normalizeCenterGovernanceFromFirestore,
} from "@/lib/addresses";
import { mailPlans } from "@/lib/plans";

import { useCenterAccess } from "@/hooks/use-center-access";
import { useAuth, useDb } from "@/firebase";

import { collection, onSnapshot, query, where, or, orderBy, limit, Timestamp, type Query as FsQuery, type DocumentData } from "firebase/firestore";
import { getMonth, subMonths } from "date-fns";
import { STAFF_ROLES } from "@/lib/constants/roles";
import { legacyCenterKey } from "@/lib/access-control";
import { getSignupStatusLabel } from "@/features/signup/status";
import { SIGNUP_REQUEST_STATUS } from "@/lib/constants/signup";

/* =========================
   Helpers robustes (legacy + nouveau modèle)
========================= */

type AddressId = "paris_12e" | "orly_ville";

type SignupRequestDashboardItem = {
  id: string;
  companyName?: string;
  name?: string;
  email?: string;
  status?: string;
  addressKey?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  documentsRequiredCompleted?: boolean;
  accessProvisioned?: boolean;
};

type MailDashboardItem = {
  id: string;
  clientName?: string;
  companyName?: string;
  fileName?: string;
  centerKey?: string;
  status?: string;
  receivedAt?: Timestamp;
  summary?: string;
  aiAnalysis?: {
    urgency?: string;
  };
};

type DashboardMetricCard = {
  href: string;
  title: string;
  value: string | number;
  desc: string;
  icon: typeof Users;
  gradient: string;
  iconBg: string;
  iconColor: string;
};

type DashboardActionItem = {
  id: string;
  category: string;
  title: string;
  description: string;
  href: string;
  badge: string;
  tone: "amber" | "rose" | "emerald" | "blue";
};

type QuickAction = {
  href: string;
  label: string;
  description: string;
  icon: typeof Users;
};

function toDateSafe(v: any): Date | null {
  if (!v) return null;
  if (typeof v?.toDate === "function") return v.toDate();
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function isManagerRole(role: string | null | undefined): boolean {
  return role === "manager" || role === "manager_paris" || role === "manager_orly";
}

function isWithinLastDays(value: unknown, days: number): boolean {
  const date = toDateSafe(value);
  if (!date) return false;
  return date.getTime() >= Date.now() - days * 24 * 60 * 60 * 1000;
}

function formatDateTimeShort(value: unknown): string {
  const date = toDateSafe(value);
  if (!date) return "-";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function humanizeLocation(key?: string | null) {
  if (!key) return "-";

  const map: Record<string, string> = {
    paris: "Paris",
    paris_12e: "Paris 12e",
    orly: "Orly",
    orly_ville: "Orly Ville",
  };

  return map[key] || key;
}

function getRequestDisplayName(item: SignupRequestDashboardItem): string {
  return item.companyName || item.name || item.email || item.id;
}

function getMailDisplayName(item: MailDashboardItem): string {
  return item.companyName || item.clientName || item.fileName || item.id;
}

function resolveClientAddressId(c: Client): AddressId | null {
  // legacy
  const legacy = (c as any).domiciliationAddressId;
  if (legacy === "paris_12e" || legacy === "orly_ville") return legacy;

  // nouveau
  const addrId = (c as any).addressId;
  if (addrId === "paris_12e" || addrId === "orly_ville") return addrId;

  // mapping via addressKey
  const key = (c as any).addressKey;
  if (key === "paris") return "paris_12e";
  if (key === "orly") return "orly_ville";

  return null;
}

function displayClientName(c: Client): string {
  return ((c as any).name || (c as any).companyName || "—").toString();
}

function normalizePlanIdForPricing(c: Client): string | null {
  // 1) legacy: plan pourrait être "classic|starter|business|premium" OU "Standard"
  const legacyPlan = (c as any).plan;
  if (typeof legacyPlan === "string" && legacyPlan.trim()) {
    const p = legacyPlan.trim().toLowerCase();
    // mapping si tes importés utilisent Standard
    if (p === "standard") return "classic"; // ajuste si besoin
    if (p === "classic" || p === "starter" || p === "business" || p === "premium") return p;
  }

  // 2) nouveau: mailPlanId
  const mailPlanId = (c as any).mailPlanId;
  if (typeof mailPlanId === "string" && mailPlanId.trim()) {
    const p = mailPlanId.trim().toLowerCase();
    if (p === "classic" || p === "starter" || p === "business" || p === "premium") return p;
  }

  // 3) nouveau: tier (souvent starter)
  const tier = (c as any).tier;
  if (typeof tier === "string" && tier.trim()) {
    const t = tier.trim().toLowerCase();
    if (t === "starter") return "starter";
    if (t === "business" || t === "pro") return "business";
    if (t === "premium") return "premium";
  }

  return null;
}

function getJoinDateLabel(client: Client): string {
  const d = toDateSafe((client as any).joinDate);
  return d ? d.toLocaleDateString("fr-FR") : "N/A";
}

function isActiveClient(c: Client): boolean {
  const status = String((c as any).status ?? "").toLowerCase();
  return status === "actif" || status === "active";
}

function resolveClientCenterKey(c: Client): string | null {
  const raw =
    (c as any).centerId ??
    (c as any).managedCenterId ??
    (c as any).domiciliationAddressId ??
    (c as any).addressId ??
    (c as any).locationKey ??
    (c as any).addressKey ??
    "";

  const key = String(raw).trim().toLowerCase();
  if (!key) return null;
  if (key === "paris") return "paris_12e";
  if (key === "orly") return "orly_ville";
  return key;
}

function centerAliases(center: CenterGovernanceAddress): string[] {
  return [center.id, center.slug, center.addressKey, center.locationKey]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .map((value) => value.toLowerCase());
}

function getCenterClients(center: CenterGovernanceAddress, clients: Client[]): Client[] {
  const aliases = new Set(centerAliases(center));
  return clients.filter((client) => {
    const key = resolveClientCenterKey(client);
    return key ? aliases.has(key) : false;
  });
}

function getPlanPrice(client: Client): number {
  const planId = normalizePlanIdForPricing(client);
  const plan = planId ? mailPlans.find((item) => item.id === planId) : null;
  return plan?.numericPrice || 0;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " EUR";
}

function getSubscriptionLabel(center: CenterGovernanceAddress): string {
  return center.subscriptionPlan || "À configurer";
}

function getSubscriptionStatusLabel(center: CenterGovernanceAddress): string {
  const status = String(center.subscriptionStatus ?? "").toLowerCase();
  if (status === "active") return "Actif";
  if (status === "trialing" || status === "trial") return "Essai";
  if (status === "past_due") return "Paiement requis";
  if (status === "canceled" || status === "cancelled") return "Résilié";
  return "À configurer";
}

function SuperAdminNetworkDashboard({
  centers,
  clients,
}: {
  centers: CenterGovernanceAddress[];
  clients: Client[];
}) {
  const centerRows = React.useMemo(() => {
    return centers.map((center) => {
      const centerClients = getCenterClients(center, clients);
      const activeClients = centerClients.filter(isActiveClient);
      const mrr = activeClients.reduce((total, client) => total + getPlanPrice(client), 0);
      const quotaUsage = center.quotaClients
        ? Math.min(100, Math.round((activeClients.length / center.quotaClients) * 100))
        : null;

      return {
        center,
        activeClients: activeClients.length,
        totalClients: centerClients.length,
        mrr,
        arr: mrr * 12,
        quotaUsage,
        subscriptionLabel: getSubscriptionLabel(center),
        subscriptionStatusLabel: getSubscriptionStatusLabel(center),
      };
    });
  }, [centers, clients]);

  const totals = centerRows.reduce(
    (acc, row) => ({
      activeCenters: acc.activeCenters + (row.center.status === "active" ? 1 : 0),
      configuredSubscriptions: acc.configuredSubscriptions + (row.subscriptionStatusLabel !== "À configurer" ? 1 : 0),
      activeClients: acc.activeClients + row.activeClients,
      mrr: acc.mrr + row.mrr,
      arr: acc.arr + row.arr,
    }),
    { activeCenters: 0, configuredSubscriptions: 0, activeClients: 0, mrr: 0, arr: 0 }
  );

  const betaSignals = React.useMemo(() => {
    const activeCenterCount = centerRows.filter((row) => row.center.status === "active").length;
    const centersWithoutClients = centerRows.filter(
      (row) => row.center.status === "active" && row.activeClients === 0
    ).length;
    const quotaWarnings = centerRows.filter(
      (row) => typeof row.quotaUsage === "number" && row.quotaUsage >= 80
    ).length;
    const unconfiguredSubscriptions = centerRows.filter(
      (row) => row.subscriptionStatusLabel === "À configurer"
    ).length;

    return [
      {
        label: "Centres actifs",
        value: `${activeCenterCount}/${centerRows.length}`,
        detail: activeCenterCount === centerRows.length ? "Réseau opérationnel" : "Centre à vérifier",
        tone: activeCenterCount === centerRows.length ? "emerald" : "amber",
      },
      {
        label: "Contrats centres",
        value: `${totals.configuredSubscriptions}/${centerRows.length}`,
        detail: unconfiguredSubscriptions === 0 ? "Abonnements renseignés" : `${unconfiguredSubscriptions} à compléter`,
        tone: unconfiguredSubscriptions === 0 ? "emerald" : "amber",
      },
      {
        label: "Quotas à risque",
        value: quotaWarnings,
        detail: quotaWarnings === 0 ? "Capacité saine" : "Capacité à surveiller",
        tone: quotaWarnings === 0 ? "emerald" : "rose",
      },
      {
        label: "Centres vides",
        value: centersWithoutClients,
        detail: centersWithoutClients === 0 ? "Données présentes" : "Import ou activation à contrôler",
        tone: centersWithoutClients === 0 ? "emerald" : "amber",
      },
    ];
  }, [centerRows, totals.configuredSubscriptions]);

  const networkCards = [
    {
      href: "/admin/adresses",
      title: "Centres actifs",
      value: totals.activeCenters,
      desc: "Centres opérationnels",
      icon: Building,
      gradient: "from-orange-500/20 to-amber-500/5",
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-500",
    },
    {
      href: "/admin/adresses",
      title: "Abonnements centres",
      value: `${totals.configuredSubscriptions}/${centers.length}`,
      desc: "Contrats centres suivis",
      icon: CheckCircle2,
      gradient: "from-emerald-500/20 to-teal-500/5",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
    },
    {
      href: "/admin/billing",
      title: "MRR consolidé",
      value: formatCurrency(totals.mrr),
      desc: "Lecture réseau",
      icon: DollarSign,
      gradient: "from-blue-500/20 to-indigo-500/5",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-500",
    },
    {
      href: "/admin/billing",
      title: "ARR consolidé",
      value: formatCurrency(totals.arr),
      desc: "Projection annuelle",
      icon: CreditCard,
      gradient: "from-primary/20 to-purple-500/5",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
  ];

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden p-4 pb-28 sm:p-6 md:p-10">
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mx-auto flex w-full max-w-7xl flex-col gap-5 sm:gap-8"
      >
        <div className="flex flex-col gap-1">
          <Badge variant="outline" className="w-fit mb-2 glass-premium border-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            Gouvernance réseau
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-gradient leading-none">
            Console Super Admin
          </h1>
          <p className="text-muted-foreground/60 font-medium mt-2">
            Pilotage des centres, des quotas, des abonnements et de la santé globale du réseau.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {networkCards.map((kpi, i) => (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i + 0.2 }}
            >
              <Link href={kpi.href} className="group block focus:outline-none">
                <Card className="relative overflow-hidden h-full border-white/5 glass-premium transition-all duration-500 hover:translate-y-[-4px] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] hover:border-white/10">
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-700", kpi.gradient)} />
                  <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
                      {kpi.title}
                    </CardTitle>
                    <div className={cn("p-2.5 rounded-2xl transition-all duration-500 group-hover:scale-110", kpi.iconBg, kpi.iconColor)}>
                      <kpi.icon className="h-5 w-5" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="text-3xl font-black tracking-tighter text-gradient mb-1">
                      {kpi.value}
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">
                      {kpi.desc}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        <Card className="border-white/5 glass-premium overflow-hidden">
          <CardHeader className="flex flex-row items-center border-b border-white/5 pb-6 px-8">
            <div className="grid gap-1">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                Cockpit des centres
              </CardTitle>
              <CardDescription className="text-foreground/40">
                Vue agrégée par centre : clients, revenus, quotas et abonnement. Les dossiers clients restent côté manager.
              </CardDescription>
            </div>
            <Button asChild variant="premium" size="sm" className="ml-auto flex items-center gap-2 h-10 px-6 rounded-2xl group transition-all hover:scale-105 active:scale-95">
              <Link href="/admin/adresses">
                Piloter les centres
                <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent bg-white/5">
                  <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 h-10 px-8">Centre</TableHead>
                  <TableHead className="hidden md:table-cell text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 h-10">Clients / quota</TableHead>
                  <TableHead className="hidden lg:table-cell text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 h-10">Abonnement centre</TableHead>
                  <TableHead className="hidden sm:table-cell text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 h-10">MRR estimé</TableHead>
                  <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 h-10 px-8">Santé</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {centerRows.map((row) => (
                  <TableRow key={row.center.id} className="border-white/5 hover:bg-white/5 transition-all group">
                    <TableCell className="py-6 px-8">
                      <div className="font-bold text-foreground group-hover:text-primary transition-colors text-base">{row.center.name}</div>
                      <div className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest mt-1">
                        {row.center.street}, {row.center.zip} {row.center.city}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 md:hidden">
                        <Badge variant="outline" className="border-primary/20 bg-primary/5 text-[10px]">
                          {row.activeClients} actifs
                        </Badge>
                        <Badge variant="outline" className="border-blue-500/20 bg-blue-500/5 text-[10px]">
                          {formatCurrency(row.mrr)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black">{row.activeClients}</span>
                          <span className="text-xs text-muted-foreground">actifs / {row.totalClients} total</span>
                        </div>
                        <div className="h-2 w-full max-w-[180px] overflow-hidden rounded-full bg-white/10">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              row.quotaUsage === null
                                ? "w-0 bg-slate-400"
                                : row.quotaUsage >= 90
                                  ? "bg-rose-500"
                                  : row.quotaUsage >= 70
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                            )}
                            style={{ width: row.quotaUsage === null ? "0%" : `${row.quotaUsage}%` }}
                          />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                          {row.center.quotaClients ? `Quota ${row.center.quotaClients} clients` : "Quota clients à configurer"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-col gap-2">
                        <span className="text-sm font-bold">{row.subscriptionLabel}</span>
                        <div className="flex flex-wrap gap-1.5">
                          <Badge
                            variant="outline"
                            className={cn(
                              "w-fit text-[10px] font-black uppercase tracking-widest",
                              row.subscriptionStatusLabel === "Actif"
                                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                                : row.subscriptionStatusLabel === "Paiement requis"
                                  ? "border-rose-500/20 bg-rose-500/10 text-rose-500"
                                  : "border-amber-500/20 bg-amber-500/10 text-amber-500"
                            )}
                          >
                            {row.subscriptionStatusLabel}
                          </Badge>
                          {row.center.quotaStorageGb && (
                            <Badge variant="outline" className="text-[10px]">
                              {row.center.quotaStorageGb} Go
                            </Badge>
                          )}
                          {row.center.quotaScansMonthly && (
                            <Badge variant="outline" className="text-[10px]">
                              {row.center.quotaScansMonthly} scans/mois
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="font-black text-primary">{formatCurrency(row.mrr)}</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                        ARR {formatCurrency(row.arr)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={row.center.status === "active" ? "default" : "destructive"} className="uppercase text-[10px] font-black tracking-widest">
                          {row.center.status === "active" ? "Actif" : "Inactif"}
                        </Badge>
                        {row.quotaUsage !== null && row.quotaUsage >= 90 && (
                          <span className="text-[10px] font-bold uppercase tracking-widest text-rose-500">
                            Quota à surveiller
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <div className="border-t border-white/5 bg-white/5 p-4">
            <p className="text-xs text-muted-foreground">
              Les champs d'abonnement et de quota proviennent du document <span className="font-mono">centers/&lbrace;centerId&rbrace;</span>. Tant qu'ils ne sont pas renseignés, le cockpit garde un statut clair "À configurer".
            </p>
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="border-white/5 glass-premium lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Gauge className="h-5 w-5 text-primary" />
                Pilotage bêta terrain
              </CardTitle>
              <CardDescription>
                Les signaux clés pour ouvrir la recette aux managers, secrétaires et clients pilotes sans naviguer à l'aveugle.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {betaSignals.map((signal) => (
                  <div key={signal.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">
                      {signal.label}
                    </div>
                    <div className="mt-2 text-2xl font-black tracking-tight">{signal.value}</div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "mt-3 rounded-full border text-[9px] font-black uppercase tracking-widest",
                        signal.tone === "emerald" && "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
                        signal.tone === "amber" && "border-amber-500/20 bg-amber-500/10 text-amber-500",
                        signal.tone === "rose" && "border-rose-500/20 bg-rose-500/10 text-rose-500"
                      )}
                    >
                      {signal.detail}
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2 rounded-2xl border border-primary/10 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-black">Recette pilotée</div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Suivre l'activité, les centres et la facturation avant d'élargir la bêta.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline" className="rounded-xl">
                    <Link href="/admin/activity">Activité</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="rounded-xl">
                    <Link href="/admin/adresses">Centres</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="rounded-xl">
                    <Link href="/admin/billing">Facturation</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 glass-premium">
            <CardHeader>
              <CardDescription>Clients actifs agrégés</CardDescription>
              <CardTitle className="text-4xl font-black">{totals.activeClients}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Lecture réseau uniquement. Le super admin ne gère pas les dossiers clients depuis cette vue.
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}

/* =========================
   Page
========================= */

export default function AdminDashboardPage() {
  const [clients, setClients] = React.useState<Client[]>([]);
  const [centers, setCenters] = React.useState<CenterGovernanceAddress[]>(allAddresses);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isCentersLoading, setIsCentersLoading] = React.useState(true);
  const [requests, setRequests] = React.useState<SignupRequestDashboardItem[]>([]);
  const [isRequestsLoading, setIsRequestsLoading] = React.useState(true);
  const [mails, setMails] = React.useState<MailDashboardItem[]>([]);
  const [isMailsLoading, setIsMailsLoading] = React.useState(true);

  const router = useRouter();
  const { displayRole, managedCenterIds, isLoading: isRoleLoading } = useCenterAccess();
  const isManagerView = isManagerRole(displayRole);

  const auth = useAuth();
  const db = useDb();

  // Guard auth
  React.useEffect(() => {
    if (!auth) return;
    const unsub = auth.onAuthStateChanged((user) => {
      if (!user) router.replace("/login");
    });
    return () => unsub();
  }, [router, auth]);

  // Load centers for the super admin cockpit and manager address labels.
  React.useEffect(() => {
    if (isRoleLoading || !displayRole || !STAFF_ROLES.includes(displayRole) || !db) {
      if (!isRoleLoading) setIsCentersLoading(false);
      return;
    }

    setIsCentersLoading(true);
    const unsubscribe = onSnapshot(
      query(collection(db, "centers")),
      (snapshot) => {
        const remoteCenters = snapshot.docs.map((centerDoc) =>
          normalizeCenterGovernanceFromFirestore(centerDoc.id, centerDoc.data())
        );
        setCenters(mergeAddressesWithDefaults(remoteCenters));
        setIsCentersLoading(false);
      },
      (error) => {
        console.error("Error fetching centers for dashboard:", error);
        setCenters(allAddresses);
        setIsCentersLoading(false);
      }
    );

    return () => unsubscribe();
  }, [displayRole, isRoleLoading, db]);

  // Load clients
  React.useEffect(() => {
    if (isRoleLoading || !displayRole || !STAFF_ROLES.includes(displayRole) || !db) {
      // si pas de user, on stop le loader
      if (!isRoleLoading && auth && !auth.currentUser) setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const baseCol = collection(db, "clients");
    let q: FsQuery = query(baseCol);

    if (displayRole !== "super_admin") {
      const centerFilters = managedCenterIds
        .slice(0, 6)
        .flatMap((centerId) => {
          const legacyKey = legacyCenterKey(centerId);
          const filters = [
            where("centerId", "==", centerId),
            where("addressId", "==", centerId),
            where("domiciliationAddressId", "==", centerId),
          ];

          if (legacyKey) {
            filters.push(
              where("locationKey", "==", legacyKey),
              where("addressKey", "==", legacyKey)
            );
          }

          return filters;
        })
        .slice(0, 30);

      if (centerFilters.length === 0) {
        setClients([]);
        setIsLoading(false);
        return;
      }

      q = query(
        baseCol,
        or(...centerFilters)
      ) as FsQuery<Client, DocumentData>;
    }

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const all: Client[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as any),
        }));

        // Tri récents
        all.sort((a, b) => {
          const da = toDateSafe((a as any).joinDate)?.getTime() ?? 0;
          const dbb = toDateSafe((b as any).joinDate)?.getTime() ?? 0;
          return dbb - da;
        });

        // Filtrage par rôle (adresse) côté UI
        const filterByRole = (list: Client[]) => {
          if (displayRole !== "super_admin") {
            return list.filter((c) => {
              const centerId = resolveClientAddressId(c);
              return Boolean(centerId && managedCenterIds.includes(centerId));
            });
          }
          return list;
        };

        setClients(filterByRole(all));
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching clients for dashboard:", error);
        setIsLoading(false);
      }
    );

    return () => unsub();
  }, [displayRole, managedCenterIds, isRoleLoading, auth, db]);

  const scopedAddressKeys = React.useMemo(() => {
    return managedCenterIds
      .map((centerId) => legacyCenterKey(centerId))
      .filter((centerKey): centerKey is "paris" | "orly" => Boolean(centerKey))
      .slice(0, 10);
  }, [managedCenterIds]);

  React.useEffect(() => {
    if (isRoleLoading) return;

    if (displayRole === "super_admin") {
      setRequests([]);
      setIsRequestsLoading(false);
      return;
    }

    if (!db || !displayRole || !STAFF_ROLES.includes(displayRole)) {
      if (!isRoleLoading) setIsRequestsLoading(false);
      return;
    }

    if (scopedAddressKeys.length === 0) {
      setRequests([]);
      setIsRequestsLoading(false);
      return;
    }

    setIsRequestsLoading(true);

    let requestsQuery = query(
      collection(db, "client_requests"),
      orderBy("updatedAt", "desc"),
      limit(30)
    );

    if (scopedAddressKeys.length === 1) {
      requestsQuery = query(requestsQuery, where("addressKey", "==", scopedAddressKeys[0]));
    } else {
      requestsQuery = query(requestsQuery, where("addressKey", "in", scopedAddressKeys));
    }

    const unsubscribe = onSnapshot(
      requestsQuery,
      (snapshot) => {
        const next = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<SignupRequestDashboardItem, "id">),
        }));
        setRequests(next);
        setIsRequestsLoading(false);
      },
      (error) => {
        console.error("Error fetching dashboard requests:", error);
        setRequests([]);
        setIsRequestsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [db, displayRole, isRoleLoading, scopedAddressKeys]);

  React.useEffect(() => {
    if (isRoleLoading) return;

    if (displayRole === "super_admin") {
      setMails([]);
      setIsMailsLoading(false);
      return;
    }

    if (!db || !displayRole || !STAFF_ROLES.includes(displayRole)) {
      if (!isRoleLoading) setIsMailsLoading(false);
      return;
    }

    const scopedCenterIds = managedCenterIds.slice(0, 10);

    if (scopedCenterIds.length === 0) {
      setMails([]);
      setIsMailsLoading(false);
      return;
    }

    setIsMailsLoading(true);

    let mailsQuery = query(
      collection(db, "mails"),
      orderBy("receivedAt", "desc"),
      limit(24)
    );

    if (scopedCenterIds.length === 1) {
      mailsQuery = query(mailsQuery, where("centerKey", "==", scopedCenterIds[0]));
    } else {
      mailsQuery = query(mailsQuery, where("centerKey", "in", scopedCenterIds));
    }

    const unsubscribe = onSnapshot(
      mailsQuery,
      (snapshot) => {
        const next = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<MailDashboardItem, "id">),
        }));
        setMails(next);
        setIsMailsLoading(false);
      },
      (error) => {
        console.error("Error fetching dashboard mails:", error);
        setMails([]);
        setIsMailsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [db, displayRole, isRoleLoading, managedCenterIds]);

  // Charts: nouveaux clients sur 6 mois
  const chartData = React.useMemo(() => {
    const monthNames = ["Jan", "Fev", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();

    const data: { name: string; clients: number }[] = Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(now, 5 - i);
      return { name: monthNames[getMonth(d)], clients: 0 };
    });

    for (const c of clients) {
      const d = toDateSafe((c as any).joinDate);
      if (!d) continue;
      if (d < subMonths(now, 6)) continue;

      const m = monthNames[getMonth(d)];
      const bucket = data.find((x) => x.name === m);
      if (bucket) bucket.clients += 1;
    }

    return data;
  }, [clients]);

  // Plan distribution (clients actifs)
  const planDistributionData = React.useMemo(() => {
    const distribution: Record<string, number> = {};
    for (const plan of mailPlans) distribution[plan.name] = 0;

    const active = clients.filter(isActiveClient);
    for (const c of active) {
      const planId = normalizePlanIdForPricing(c);
      const plan = planId ? mailPlans.find((p) => p.id === planId) : null;
      if (plan) distribution[plan.name] += 1;
    }

    return Object.entries(distribution).map(([planName, clientCount]) => ({
      plan: planName,
      clients: clientCount,
    }));
  }, [clients]);

  // KPI
  const kpiData = React.useMemo(() => {
    const active = clients.filter(isActiveClient);

    const mrr = active.reduce((total, c) => {
      const planId = normalizePlanIdForPricing(c);
      const plan = planId ? mailPlans.find((p) => p.id === planId) : null;
      return total + (plan?.numericPrice || 0);
    }, 0);

    return { mrr, arr: mrr * 12, activeClients: active.length };
  }, [clients]);

  const activeAddressesCount = centers.filter((a) => a.status === "active").length;

  const managerAddress = React.useMemo(() => {
    const primaryCenterId = managedCenterIds[0];
    if (primaryCenterId) {
      return centers.find((a) => a.id === primaryCenterId) || null;
    }
    return null;
  }, [managedCenterIds, centers]);

  const recentClients = clients.slice(0, 5);

  const readyForValidationRequests = React.useMemo(() => {
    return requests.filter(
      (item) =>
        item.status === SIGNUP_REQUEST_STATUS.PENDING_VALIDATION ||
        item.status === SIGNUP_REQUEST_STATUS.DOCS_READY
    );
  }, [requests]);

  const provisioningPendingRequests = React.useMemo(() => {
    return requests.filter(
      (item) =>
        item.status === SIGNUP_REQUEST_STATUS.APPROVED &&
        item.accessProvisioned !== true
    );
  }, [requests]);

  const incompleteRequests = React.useMemo(() => {
    return requests.filter((item) => {
      const status = String(item.status ?? "").toLowerCase();
      if (
        status === SIGNUP_REQUEST_STATUS.APPROVED ||
        status === SIGNUP_REQUEST_STATUS.REJECTED ||
        status === SIGNUP_REQUEST_STATUS.CONVERTED
      ) {
        return false;
      }

      return item.documentsRequiredCompleted !== true;
    });
  }, [requests]);

  const recentRequestsCount = React.useMemo(() => {
    return requests.filter((item) => isWithinLastDays(item.createdAt ?? item.updatedAt, 7)).length;
  }, [requests]);

  const urgentMails = React.useMemo(() => {
    return mails.filter((item) => {
      const urgency = String(item.aiAnalysis?.urgency ?? "").toLowerCase();
      const status = String(item.status ?? "").toLowerCase();
      return urgency === "high" || status === "urgent";
    });
  }, [mails]);

  const recentMailsCount = React.useMemo(() => {
    return mails.filter((item) => isWithinLastDays(item.receivedAt, 7)).length;
  }, [mails]);

  const operationalMetrics = React.useMemo<DashboardMetricCard[]>(() => {
    if (isManagerView) {
      return [
        {
          href: "/admin/validation",
          title: "Dossiers à valider",
          value: readyForValidationRequests.length,
          desc: "Instruction manager",
          icon: CheckCircle2,
          gradient: "from-amber-500/20 to-orange-500/5",
          iconBg: "bg-amber-500/10",
          iconColor: "text-amber-500",
        },
        {
          href: "/admin/validation",
          title: "Accès à provisionner",
          value: provisioningPendingRequests.length,
          desc: "Ouverture des accès",
          icon: ShieldAlert,
          gradient: "from-rose-500/20 to-red-500/5",
          iconBg: "bg-rose-500/10",
          iconColor: "text-rose-500",
        },
        {
          href: "/admin/mails",
          title: "Courriers urgents",
          value: urgentMails.length,
          desc: "Traitement prioritaire",
          icon: Mail,
          gradient: "from-blue-500/20 to-cyan-500/5",
          iconBg: "bg-blue-500/10",
          iconColor: "text-blue-500",
        },
        {
          href: "/admin/clients",
          title: "Clients actifs",
          value: kpiData.activeClients,
          desc: "Portefeuille du centre",
          icon: Users,
          gradient: "from-emerald-500/20 to-teal-500/5",
          iconBg: "bg-emerald-500/10",
          iconColor: "text-emerald-500",
        },
      ];
    }

    return [
      {
        href: "/admin/clients",
        title: "Dossiers incomplets",
        value: incompleteRequests.length,
        desc: "Pieces a relancer",
        icon: AlertTriangle,
        gradient: "from-amber-500/20 to-orange-500/5",
        iconBg: "bg-amber-500/10",
        iconColor: "text-amber-500",
      },
      {
        href: "/admin/clients",
        title: "Dossiers complets",
        value: readyForValidationRequests.length,
        desc: "Prêt à transmettre",
        icon: CheckCircle2,
        gradient: "from-blue-500/20 to-indigo-500/5",
        iconBg: "bg-blue-500/10",
        iconColor: "text-blue-500",
      },
      {
        href: "/admin/clients",
        title: "Clients actifs",
        value: kpiData.activeClients,
        desc: "Suivi du centre",
        icon: Users,
        gradient: "from-emerald-500/20 to-teal-500/5",
        iconBg: "bg-emerald-500/10",
        iconColor: "text-emerald-500",
      },
      {
        href: "/admin/scan",
        title: "Courriers 7 jours",
        value: recentMailsCount,
        desc: "Flux à distribuer",
        icon: FileText,
        gradient: "from-primary/20 to-purple-500/5",
        iconBg: "bg-primary/10",
        iconColor: "text-primary",
      },
    ];
  }, [
    incompleteRequests.length,
    isManagerView,
    kpiData.activeClients,
    provisioningPendingRequests.length,
    readyForValidationRequests.length,
    recentMailsCount,
    urgentMails.length,
  ]);

  const quickActions = React.useMemo<QuickAction[]>(() => {
    const actions: QuickAction[] = [
      {
        href: "/admin/scan",
        label: "Scanner un courrier",
        description: "Associer un document a un client",
        icon: FileText,
      },
      {
        href: "/admin/clients",
        label: "Ouvrir les clients",
        description: "Retrouver un dossier et agir",
        icon: Users,
      },
    ];

    if (isManagerView) {
      actions.unshift(
        {
          href: "/admin/validation",
          label: "Verifier les dossiers",
          description: "Traiter les validations en attente",
          icon: CheckCircle2,
        },
        {
          href: "/admin/mails",
          label: "Traiter le courrier",
          description: "Prioriser les urgences du centre",
          icon: Mail,
        }
      );

      actions.push({
        href: "/admin/billing",
        label: "Voir la facturation",
        description: "Controle des revenus du centre",
        icon: CreditCard,
      });
    }

    return actions;
  }, [isManagerView]);

  const priorityQueue = React.useMemo<DashboardActionItem[]>(() => {
    if (isManagerView) {
      const validationItems = readyForValidationRequests.slice(0, 3).map((item) => ({
        id: `validation-${item.id}`,
        category: "Validation",
        title: getRequestDisplayName(item),
        description: `${getSignupStatusLabel(item.status)} • ${humanizeLocation(item.addressKey)} • mise a jour ${formatDateTimeShort(item.updatedAt ?? item.createdAt)}`,
        href: "/admin/validation",
        badge: "À vérifier",
        tone: "amber" as const,
      }));

      const provisioningItems = provisioningPendingRequests.slice(0, 2).map((item) => ({
        id: `provisioning-${item.id}`,
        category: "Accès",
        title: getRequestDisplayName(item),
        description: `Dossier approuvé sans accès provisionné • ${humanizeLocation(item.addressKey)}`,
        href: "/admin/validation",
        badge: "Provisionner",
        tone: "rose" as const,
      }));

      const urgentMailItems = urgentMails.slice(0, 3).map((item) => ({
        id: `mail-${item.id}`,
        category: "Courrier urgent",
        title: getMailDisplayName(item),
        description: `${item.summary || item.fileName || "Courrier a traiter"} • recu ${formatDateTimeShort(item.receivedAt)}`,
        href: "/admin/mails",
        badge: "Urgent",
        tone: "blue" as const,
      }));

      return [...validationItems, ...provisioningItems, ...urgentMailItems].slice(0, 6);
    }

    const incompleteItems = incompleteRequests.slice(0, 4).map((item) => ({
      id: `incomplete-${item.id}`,
      category: "Dossier incomplet",
      title: getRequestDisplayName(item),
      description: `${humanizeLocation(item.addressKey)} • ${getSignupStatusLabel(item.status)} • mise a jour ${formatDateTimeShort(item.updatedAt ?? item.createdAt)}`,
      href: "/admin/clients",
      badge: "Pieces manquantes",
      tone: "amber" as const,
    }));

    const readyItems = readyForValidationRequests.slice(0, 2).map((item) => ({
      id: `ready-${item.id}`,
      category: "Transmission manager",
      title: getRequestDisplayName(item),
      description: `Dossier complet prêt pour revue • ${humanizeLocation(item.addressKey)}`,
      href: "/admin/clients",
      badge: "Complet",
      tone: "emerald" as const,
    }));

    return [...incompleteItems, ...readyItems].slice(0, 6);
  }, [
    incompleteRequests,
    isManagerView,
    provisioningPendingRequests,
    readyForValidationRequests,
    urgentMails,
  ]);

  const operationalHeadline = React.useMemo(() => {
    if (isManagerView) {
      if (readyForValidationRequests.length > 0 || urgentMails.length > 0) {
        return `Priorité du jour : ${readyForValidationRequests.length} dossier(s) à valider et ${urgentMails.length} courrier(s) urgent(s).`;
      }

      return "Aucune alerte bloquante détectée. Le centre est prêt pour un traitement fluide.";
    }

    if (incompleteRequests.length > 0) {
      return `Priorité du jour : ${incompleteRequests.length} dossier(s) attendent encore des pièces ou une relance.`;
    }

    return "Les dossiers sont a jour. Vous pouvez vous concentrer sur le courrier et l'accompagnement client.";
  }, [incompleteRequests.length, isManagerView, readyForValidationRequests.length, urgentMails.length]);

  if (isLoading || isRoleLoading || (displayRole === "super_admin" && isCentersLoading)) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!displayRole || !STAFF_ROLES.includes(displayRole as any)) {
    return <p>Accès non autorisé.</p>;
  }

  if (displayRole === "super_admin") {
    return (
      <SuperAdminNetworkDashboard
        centers={centers}
        clients={clients}
      />
    );
  }

  const getDashboardTitle = () => {
    switch (displayRole) {
      case "manager_paris":
        return "Tableau de Bord - Paris";
      case "manager_orly":
        return "Tableau de Bord - Orly";
      case "secretary_paris":
        return "Tableau de Bord - Secrétariat Paris";
      case "secretary_orly":
        return "Tableau de Bord - Secrétariat Orly";
      default:
        return managerAddress
          ? `Tableau de Bord - ${managerAddress.city || managerAddress.name}`
          : "Tableau de Bord Administrateur";
    }
  };

  const getClientPlanPrice = (client: Client) => {
    const planId = normalizePlanIdForPricing(client);
    const plan = planId ? mailPlans.find((p) => p.id === planId) : null;
    return plan?.numericPrice || 0;
  };

  const getClientPlanLabel = (client: Client) => {
    const planId = normalizePlanIdForPricing(client);
    return planId || "—";
  };

  return (
    <div className="relative min-h-screen flex flex-col p-6 md:p-10 overflow-hidden">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col gap-8 max-w-7xl mx-auto w-full"
      >
        <div className="flex flex-col gap-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Badge variant="outline" className="w-fit mb-2 glass-premium border-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              {isManagerView ? "Cockpit manager" : "Cockpit secrétariat"}
            </Badge>
            <h1 className="text-[2rem] font-black leading-none tracking-tighter text-gradient sm:text-4xl md:text-5xl">
              {getDashboardTitle()}
            </h1>
            <p className="mt-2 text-sm font-medium text-muted-foreground/60 sm:text-base">
              {isManagerView
                ? "Pilotage quotidien du centre : validations, accès, courrier et portefeuille client."
                : "Poste de travail terrain : scans, dossiers à compléter et coordination avec les clients."}
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              href: isManagerView ? "/admin/validation" : "/admin/clients",
              title: isManagerView ? "Dossiers à valider" : "Dossiers incomplets",
              value: isManagerView ? readyForValidationRequests.length : incompleteRequests.length,
              desc: isManagerView ? "Instruction manager" : "Pieces a relancer",
              icon: isManagerView ? CheckCircle2 : AlertTriangle,
              gradient: "from-amber-500/20 to-orange-500/5",
              iconBg: "bg-amber-500/10",
              iconColor: "text-amber-500"
            },
            {
              href: isManagerView ? "/admin/validation" : "/admin/clients",
              title: isManagerView ? "Accès à provisionner" : "Dossiers complets",
              value: isManagerView ? provisioningPendingRequests.length : readyForValidationRequests.length,
              desc: isManagerView ? "Ouverture des accès" : "Prêt à transmettre",
              icon: isManagerView ? ShieldAlert : CheckCircle2,
              gradient: isManagerView ? "from-rose-500/20 to-red-500/5" : "from-blue-500/20 to-indigo-500/5",
              iconBg: isManagerView ? "bg-rose-500/10" : "bg-blue-500/10",
              iconColor: isManagerView ? "text-rose-500" : "text-blue-500"
            },
            {
              href: "/admin/clients",
              title: "Clients Actifs",
              value: kpiData.activeClients,
              desc: isManagerView ? "Portefeuille du centre" : "Suivi du centre",
              icon: Users,
              gradient: "from-emerald-500/20 to-teal-500/5",
              iconBg: "bg-emerald-500/10",
              iconColor: "text-emerald-500"
            },
            ...(String(displayRole) === "super_admin"
              ? [{
                  href: "/admin/adresses",
                  title: "Adresses Actives",
                  value: activeAddressesCount,
                  desc: "Réseau CCS DOM",
                  icon: Building,
                  gradient: "from-orange-500/20 to-amber-500/5",
                  iconBg: "bg-orange-500/10",
                  iconColor: "text-orange-500"
                }]
              : [{
                  href: isManagerView ? "/admin/mails" : "/admin/scan",
                  title: isManagerView ? "Courriers urgents" : "Courriers 7 jours",
                  value: isManagerView ? urgentMails.length : recentMailsCount,
                   desc: isManagerView ? "Traitement prioritaire" : "Flux à distribuer",
                  icon: isManagerView ? Mail : FileText,
                  gradient: isManagerView ? "from-blue-500/20 to-cyan-500/5" : "from-primary/20 to-purple-500/5",
                  iconBg: isManagerView ? "bg-blue-500/10" : "bg-primary/10",
                  iconColor: isManagerView ? "text-blue-500" : "text-primary"
                }]
            )
          ].map((kpi, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i + 0.3 }}
            >
              <Link href={kpi.href} className="group block focus:outline-none">
                <Card className={cn(
                  "relative h-full min-h-[126px] overflow-hidden border-white/5 glass-premium transition-all duration-500",
                  "hover:translate-y-[-4px] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] hover:border-white/10"
                )}>
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-700", kpi.gradient)} />
                  <CardHeader className="relative flex flex-row items-start justify-between gap-2 p-4 pb-1 sm:p-6 sm:pb-2">
                    <CardTitle className="text-[9px] font-black uppercase leading-tight tracking-[0.14em] text-foreground/40 sm:text-[10px] sm:tracking-[0.2em]">
                      {kpi.title}
                    </CardTitle>
                    <div className={cn("rounded-2xl p-2 transition-all duration-500 group-hover:scale-110 sm:p-2.5", kpi.iconBg, kpi.iconColor)}>
                      <kpi.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative p-4 pt-1 sm:p-6 sm:pt-2">
                    <div className="mb-1 text-2xl font-black tracking-tighter text-gradient sm:text-3xl">
                      {kpi.value}
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="flex h-1 w-8 rounded-full bg-white/5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "60%" }}
                            transition={{ duration: 1, delay: 1 }}
                            className={cn("h-full", kpi.iconBg.replace("bg-", "bg-").replace("/10", ""))}
                          />
                       </div>
                       <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">
                        {kpi.desc}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-5 sm:gap-8 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="lg:col-span-2"
          >
            <Card className="overflow-hidden border-white/5 glass-premium">
              <CardHeader className="border-b border-white/5 p-4 sm:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <Clock3 className="h-5 w-5 text-primary" />
                      Priorités du jour
                    </CardTitle>
                    <CardDescription className="text-foreground/50">
                      {operationalHeadline}
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "w-fit rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest",
                      priorityQueue.length > 0
                        ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
                        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                    )}
                  >
                    {priorityQueue.length > 0 ? `${priorityQueue.length} action(s)` : "Flux stable"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {(isRequestsLoading || isMailsLoading) ? (
                  <div className="flex min-h-[220px] items-center justify-center gap-3 text-sm text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Chargement des priorités terrain...
                  </div>
                ) : priorityQueue.length > 0 ? (
                  <div className="divide-y divide-white/5">
                    {priorityQueue.map((item) => (
                      <Link
                        key={item.id}
                        href={item.href}
                        className="group flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-white/5 sm:px-8 sm:py-5 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              variant="outline"
                              className={cn(
                                "rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest",
                                item.tone === "amber" && "border-amber-500/20 bg-amber-500/10 text-amber-500",
                                item.tone === "rose" && "border-rose-500/20 bg-rose-500/10 text-rose-500",
                                item.tone === "blue" && "border-blue-500/20 bg-blue-500/10 text-blue-500",
                                item.tone === "emerald" && "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                              )}
                            >
                              {item.category}
                            </Badge>
                            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/30">
                              {item.badge}
                            </span>
                          </div>
                          <div className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                            {item.title}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                          Ouvrir
                          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 px-4 text-center sm:min-h-[220px] sm:px-8">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                    <div className="space-y-1">
                      <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-500">
                        Rien de bloquant
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Le centre ne remonte aucune urgence immédiate. Vous pouvez avancer sereinement sur le flux quotidien.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <Card className="h-full border-white/5 glass-premium">
              <CardHeader className="space-y-4 p-4 sm:p-6">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Gauge className="h-5 w-5 text-primary" />
                    Actions rapides
                  </CardTitle>
                  <CardDescription>
                    Raccourcis utiles pour garder le centre fluide.
                  </CardDescription>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">
                    Centre principal
                  </div>
                  <div className="mt-2 text-lg font-bold text-foreground">
                    {managerAddress?.name || "Centre non renseigné"}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {managerAddress ? `${managerAddress.street}, ${managerAddress.zip} ${managerAddress.city}` : "Aucune fiche centre active"}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                      {recentRequestsCount} demande(s) / 7 jours
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        managerAddress?.status === "active"
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                          : "border-rose-500/20 bg-rose-500/10 text-rose-500"
                      )}
                    >
                      {managerAddress?.status === "active" ? "Centre actif" : "Centre inactif"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 p-4 pt-0 sm:p-6 sm:pt-0">
                {quickActions.map((action) => (
                  <Button
                    key={action.href}
                    asChild
                    variant="outline"
                    className="h-auto w-full justify-start rounded-2xl border-white/10 bg-white/5 px-3 py-3 text-left hover:bg-white/10 sm:px-4 sm:py-4"
                  >
                    <Link href={action.href} className="flex w-full items-start gap-3">
                      <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                        <action.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-foreground">{action.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {action.description}
                        </div>
                      </div>
                    </Link>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid gap-5 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="lg:col-span-2"
          >
            <Card className="border-white/5 glass-premium overflow-hidden group">
              <CardHeader className="border-b border-white/5 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      Acquisition Client
                    </CardTitle>
                    <CardDescription className="text-foreground/40">Nouveaux inscrits sur les 6 derniers mois.</CardDescription>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-6 sm:pl-2 sm:pt-8">
                <AdminChart data={chartData} />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
          >
            <PlanDistributionChart data={planDistributionData} totalClients={kpiData.activeClients} />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="border-white/5 glass-premium overflow-hidden">
            <CardHeader className="flex flex-col gap-4 border-b border-white/5 p-4 sm:flex-row sm:items-center sm:px-8 sm:pb-6">
              <div className="grid gap-1">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Clients Récents
                </CardTitle>
                <CardDescription className="text-foreground/40">Les 5 dernières inscriptions sur ce site.</CardDescription>
              </div>
              <Button asChild variant="premium" size="sm" className="flex h-10 w-full items-center gap-2 rounded-2xl px-6 transition-all hover:scale-105 active:scale-95 sm:ml-auto sm:w-auto group">
                <Link href="/admin/clients">
                  Explorer Tout
                  <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              <div className="grid gap-3 p-4 md:hidden">
                {recentClients.length > 0 ? (
                  recentClients.map((client) => (
                    <Link
                      key={(client as any).id}
                      href="/admin/clients"
                      className="group rounded-2xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-black text-foreground group-hover:text-primary">
                            {displayClientName(client)}
                          </div>
                          <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                            {getJoinDateLabel(client)} - {getClientPlanLabel(client)}
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-base font-black text-primary">
                            {getClientPlanPrice(client).toFixed(2)} EUR HT
                          </div>
                          <div
                            className={cn(
                              "mt-1 text-[9px] font-black uppercase tracking-widest",
                              (client as any).status === "Actif" ? "text-emerald-500" : "text-rose-500"
                            )}
                          >
                            {(client as any).status || "-"}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="flex min-h-36 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 bg-white/5 text-center text-muted-foreground">
                    <Users className="h-8 w-8 opacity-30" />
                    <p className="text-xs font-bold uppercase tracking-[0.18em]">Aucun mouvement récent</p>
                  </div>
                )}
              </div>

              <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent bg-white/5">
                    <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 h-10 px-8">Client</TableHead>
                    <TableHead className="hidden sm:table-cell text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 h-10">Offre</TableHead>
                    <TableHead className="hidden sm:table-cell text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 h-10">Statut</TableHead>
                    <TableHead className="hidden md:table-cell text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 h-10">Inscription</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 h-10 px-8">MRR</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {recentClients.length > 0 ? (
                    recentClients.map((client, idx) => (
                      <TableRow
                        key={(client as any).id}
                        className="border-white/5 hover:bg-white/5 transition-all group"
                      >
                        <TableCell className="py-6 px-8 relative">
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-primary group-hover:h-full transition-all duration-300" />
                          <div className="font-bold text-foreground group-hover:text-primary transition-colors text-base">{displayClientName(client)}</div>
                          <div className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest md:hidden mt-1">
                            {getJoinDateLabel(client)} • {getClientPlanLabel(client)}
                          </div>
                        </TableCell>

                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline" className="glass-premium border-primary/20 text-primary rounded-lg px-2.5 py-1 text-[10px] uppercase font-black tracking-widest">
                            {getClientPlanLabel(client)}
                          </Badge>
                        </TableCell>

                        <TableCell className="hidden sm:table-cell">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              (client as any).status === "Actif" ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                            )} />
                            <span className={cn(
                              "text-[10px] font-black uppercase tracking-widest",
                              (client as any).status === "Actif" ? "text-emerald-500" : "text-rose-500"
                            )}>
                              {(client as any).status || "—"}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="hidden md:table-cell text-[11px] font-bold uppercase text-foreground/30 tracking-wider">
                          {getJoinDateLabel(client)}
                        </TableCell>

                        <TableCell className="text-right px-8">
                          <span className="font-black text-lg text-gradient">
                            {getClientPlanPrice(client).toFixed(2)}€ HT
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-40 text-center">
                         <div className="flex flex-col items-center gap-2 opacity-20">
                           <Users className="h-12 w-12" />
                           <p className="text-sm font-bold uppercase tracking-[0.2em]">Aucun mouvement récent</p>
                         </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer info */}
        <div className="py-6 flex justify-center opacity-20 hover:opacity-100 transition-opacity">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-foreground">Elite Dashboard v3.5 • CCS DOM Systems</p>
        </div>
      </motion.div>
    </div>
  );
}
