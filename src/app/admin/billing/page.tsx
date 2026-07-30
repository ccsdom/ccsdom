"use client";

import * as React from "react";
import Link from "next/link";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  type Query,
  type DocumentData,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import {
  DollarSign,
  Download,
  CreditCard,
  Users,
  Search,
  Loader2,
  TrendingUp,
  Receipt,
  Filter,
  ArrowUpRight,
  Building2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { Client } from "../clients/page";
import { mailPlans } from "@/lib/plans";
import {
  allAddresses,
  type CenterGovernanceAddress,
  mergeAddressesWithDefaults,
  normalizeCenterGovernanceFromFirestore,
} from "@/lib/addresses";
import { useCenterAccess } from "@/hooks/use-center-access";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useDb, useFunctions } from "@/firebase";
import { legacyCenterKey, normalizeCenterId } from "@/lib/access-control";
import { cn } from "@/lib/utils";

type InvoiceStatus = "Payée" | "En attente" | "En retard" | "En cours";

type Invoice = {
  id: string;
  invoiceNumber?: string;
  clientId: string;
  client: any;
  date: Date;
  dueDate: Date;
  amount: number;
  status: string;
  type?: string;
  pdf?: {
    status: string;
    outputUrl?: string;
    fileUrl?: string;
    url?: string;
    jobId?: string;
    storagePath?: string;
    templateVersion?: string;
    updatedAt?: any;
  };
  uiStatus: InvoiceStatus;
};

const INVOICE_PDF_TEMPLATE_VERSION = "invoice-flat-v4-branded-logo-2026-04-23";

// --- Framer Motion Variants ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const mapStatusToUI = (status: string): InvoiceStatus => {
  switch (status?.toLowerCase()) {
    case "paid":
      return "Payée";
    case "pending":
      return "En attente";
    case "overdue":
      return "En retard";
    default:
      return "En attente";
  }
};

const statusConfig: Record<
  InvoiceStatus,
  { variant: "default" | "secondary" | "destructive"; className: string }
> = {
  Payée: { variant: "default", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  "En attente": { variant: "secondary", className: "border-orange-200 bg-orange-50 text-orange-700" },
  "En retard": { variant: "destructive", className: "border-rose-200 bg-rose-50 text-rose-700" },
  "En cours": { variant: "secondary", className: "border-blue-200 bg-blue-50 text-blue-700" },
};

function getClientName(client: Partial<Client> | null | undefined) {
  return String(client?.name ?? "").trim() || "Client sans nom";
}

function getClientEmail(client: Partial<Client> | null | undefined) {
  return String(client?.email ?? "").trim() || "Email non renseigné";
}

function toDateSafe(value: unknown): Date {
  if (value instanceof Date) return value;
  if (value && typeof value === "object" && "toDate" in (value as any)) {
    try {
      return (value as any).toDate();
    } catch {
      return new Date();
    }
  }
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date();
}

function getInvoicePdfUrl(invoice: Invoice): string {
  return String(
    invoice.pdf?.outputUrl || invoice.pdf?.url || invoice.pdf?.fileUrl || ""
  ).trim();
}

function needsInvoicePdfRefresh(pdfUrl: string): boolean {
  if (!pdfUrl) return false;
  if (pdfUrl.startsWith("gs://")) return true;
  try {
    const parsedUrl = new URL(pdfUrl);
    if (parsedUrl.hostname.endsWith(".firebasestorage.app")) return true;
    if (parsedUrl.hostname === "firebasestorage.googleapis.com") {
      return !parsedUrl.searchParams.has("token");
    }
    return false;
  } catch {
    return pdfUrl.includes("firebasestorage.googleapis.com/v0/b/") && !pdfUrl.includes("token=");
  }
}

function extractFirebaseStoragePath(pdfUrl: string): string | null {
  try {
    const parsedUrl = new URL(pdfUrl);
    if (parsedUrl.hostname !== "firebasestorage.googleapis.com") return null;
    const match = parsedUrl.pathname.match(/^\/v0\/b\/[^/]+\/o\/(.+)$/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

function isInvoicePdfUrlAligned(invoice: Invoice, pdfUrl: string): boolean {
  const storagePath = String(invoice.pdf?.storagePath || "").trim();
  if (!storagePath) return true;
  return extractFirebaseStoragePath(pdfUrl) === storagePath;
}

function resolveClientCenterId(client: Partial<Client>): string {
  const directCenterId = normalizeCenterId(
    (client as any).centerId ??
      (client as any).managedCenterId ??
      (client as any).domiciliationAddressId ??
      (client as any).addressId
  );
  if (directCenterId) return directCenterId;

  const fallbackKey = normalizeCenterId(
    (client as any).locationKey ??
      (client as any).addressKey
  );
  if (fallbackKey) return fallbackKey;

  return "unassigned";
}

function isActiveCenterClient(client: Partial<Client>): boolean {
  const status = String((client as any).status ?? "").toLowerCase().trim();
  const paymentStatus = String((client as any).paymentStatus ?? "").toLowerCase().trim();

  return (
    status === "actif" ||
    status === "active" ||
    (paymentStatus === "paid" && !["inactive", "inactif", "suspended", "suspendu"].includes(status))
  );
}

function resolvePlanMonthlyPrice(client: Partial<Client>): number {
  const planId = String(
    (client as any).planId ??
      (client as any).plan ??
      (client as any).mailPlanId ??
      ((client as any).tier === "pro" ? "business" : (client as any).tier) ??
      ""
  ).trim();

  return mailPlans.find((plan) => plan.id === planId)?.numericPrice ?? 0;
}

type CenterBillingHealth = {
  label: string;
  detail: string;
  badgeClassName: string;
  priority: number;
};

function formatCenterPlan(plan?: string): string {
  const normalized = String(plan ?? "").trim().toLowerCase();
  if (!normalized) return "A configurer";
  if (normalized === "starter") return "Starter";
  if (normalized === "growth") return "Growth";
  if (normalized === "business") return "Business";
  if (normalized === "enterprise") return "Enterprise";
  return normalized;
}

function formatCenterSubscriptionStatus(status?: string): string {
  const normalized = String(status ?? "").trim().toLowerCase();
  if (!normalized) return "A configurer";
  if (normalized === "active") return "Actif";
  if (normalized === "trialing" || normalized === "trial") return "Essai";
  if (normalized === "past_due") return "Paiement requis";
  if (normalized === "canceled" || normalized === "cancelled") return "Resilie";
  return normalized;
}

function daysUntil(value?: string): number | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTarget = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((startOfTarget.getTime() - startOfToday.getTime()) / 86400000);
}

function formatRenewalLabel(value?: string): string {
  const raw = String(value ?? "").trim();
  if (!raw) return "A planifier";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleDateString("fr-FR");
}

function getCenterBillingHealth(
  center: CenterGovernanceAddress,
  activeClients: number
): CenterBillingHealth {
  const subscriptionStatus = String(center.subscriptionStatus ?? "").trim().toLowerCase();
  const renewalInDays = daysUntil(center.subscriptionRenewalDate);

  if (center.status !== "active") {
    return {
      label: "Centre suspendu",
      detail: "Le centre est inactif et ne doit plus accueillir de nouveaux clients.",
      badgeClassName: "border-slate-200 bg-slate-100 text-slate-700",
      priority: 5,
    };
  }

  if (!center.subscriptionPlan || !subscriptionStatus) {
    return {
      label: "Contrat a configurer",
      detail: "Le centre n'a pas encore de plan ou de statut contractuel renseigne.",
      badgeClassName: "border-amber-200 bg-amber-50 text-amber-700",
      priority: 4,
    };
  }

  if (subscriptionStatus === "past_due" || subscriptionStatus === "canceled" || subscriptionStatus === "cancelled") {
    return {
      label: "Facturation a traiter",
      detail: "Le contrat centre demande une action immediate sur la facturation ou le renouvellement.",
      badgeClassName: "border-rose-200 bg-rose-50 text-rose-700",
      priority: 5,
    };
  }

  if (center.quotaClients && activeClients >= center.quotaClients) {
    return {
      label: "Quota atteint",
      detail: "Le centre a atteint sa capacite client contractuelle.",
      badgeClassName: "border-rose-200 bg-rose-50 text-rose-700",
      priority: 5,
    };
  }

  if (center.quotaClients && activeClients / center.quotaClients >= 0.85) {
    return {
      label: "Quota sous tension",
      detail: "La capacite client approche la limite contractuelle.",
      badgeClassName: "border-amber-200 bg-amber-50 text-amber-700",
      priority: 3,
    };
  }

  if (renewalInDays !== null && renewalInDays < 0) {
    return {
      label: "Renouvellement depasse",
      detail: "La date de renouvellement est depassee et doit etre regularisee.",
      badgeClassName: "border-rose-200 bg-rose-50 text-rose-700",
      priority: 5,
    };
  }

  if (renewalInDays !== null && renewalInDays <= 30) {
    return {
      label: "Renouvellement proche",
      detail: `Le contrat centre arrive a echeance dans ${renewalInDays} jour(s).`,
      badgeClassName: "border-blue-200 bg-blue-50 text-blue-700",
      priority: 2,
    };
  }

  return {
    label: "Sous controle",
    detail: "Centre actif, contrat sain et capacite exploitable.",
    badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
    priority: 1,
  };
}

function SuperAdminCenterBillingView({
  centers,
  clients,
}: {
  centers: CenterGovernanceAddress[];
  clients: (Client & { id: string })[];
}) {
  const rows = centers.map((center) => {
    const centerClients = clients.filter(
      (client) => resolveClientCenterId(client) === center.id
    );
    const activeClients = centerClients.filter(isActiveCenterClient);
    const mrr = activeClients.reduce(
      (total, client) => total + resolvePlanMonthlyPrice(client),
      0
    );

    return {
      id: center.id,
      name: center.name,
      companyName: center.companyName,
      status: center.status,
      activeClients: activeClients.length,
      totalClients: centerClients.length,
      mrr,
      arr: mrr * 12,
      quotaClients: center.quotaClients,
      subscriptionPlan: center.subscriptionPlan,
      subscriptionStatus: center.subscriptionStatus,
      subscriptionRenewalDate: center.subscriptionRenewalDate,
      health: getCenterBillingHealth(center, activeClients.length),
    };
  });

  const totals = rows.reduce(
    (acc, row) => ({
      activeCenters: acc.activeCenters + (row.status === "active" ? 1 : 0),
      activeClients: acc.activeClients + row.activeClients,
      mrr: acc.mrr + row.mrr,
      arr: acc.arr + row.arr,
    }),
    { activeCenters: 0, activeClients: 0, mrr: 0, arr: 0 }
  );

  const actionableCenters = rows.filter((row) => row.health.priority >= 4);
  const renewalsSoon = rows.filter((row) => {
    const remainingDays = daysUntil(row.subscriptionRenewalDate);
    return remainingDays !== null && remainingDays >= 0 && remainingDays <= 30;
  });
  const quotaTensionCenters = rows.filter((row) => {
    if (!row.quotaClients) return false;
    return row.activeClients / row.quotaClients >= 0.85;
  });
  const configuredContracts = rows.filter((row) => String(row.subscriptionStatus ?? "").trim().length > 0).length;

  return (
    <div className="min-h-screen bg-slate-50 px-3 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-3 text-slate-950 sm:px-4 md:px-6 md:py-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5 sm:space-y-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="flex items-center gap-2 text-primary">
            <Building2 className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Gouvernance reseau
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Facturation des centres
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Vue consolidee par centre : abonnements, revenus recurrents, volume actif et capacite de pilotage. Aucune facture client individuelle n'est exposee ici.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Card className="border-orange-200 bg-white shadow-sm">
            <CardHeader className="p-4">
              <CardDescription className="text-xs font-semibold text-slate-500">Centres actifs</CardDescription>
              <CardTitle className="text-2xl font-black text-slate-950">{totals.activeCenters}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-primary/20 bg-white shadow-sm">
            <CardHeader className="p-4">
              <CardDescription className="text-xs font-semibold text-slate-500">MRR reseau</CardDescription>
              <CardTitle className="text-2xl font-black text-slate-950">
                {totals.mrr.toLocaleString("fr-FR")} EUR
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-indigo-200 bg-white shadow-sm">
            <CardHeader className="p-4">
              <CardDescription className="text-xs font-semibold text-slate-500">ARR projete</CardDescription>
              <CardTitle className="text-2xl font-black text-slate-950">
                {totals.arr.toLocaleString("fr-FR")} EUR
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-emerald-200 bg-white shadow-sm">
            <CardHeader className="p-4">
              <CardDescription className="text-xs font-semibold text-slate-500">Clients actifs</CardDescription>
              <CardTitle className="text-2xl font-black text-slate-950">{totals.activeClients}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="p-4">
              <CardDescription className="text-xs font-semibold text-slate-500">Contrats configures</CardDescription>
              <CardTitle className="text-2xl font-black text-slate-950">{configuredContracts}/{rows.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-amber-200 bg-white shadow-sm">
            <CardHeader className="p-4">
              <CardDescription className="text-xs font-semibold text-slate-500">Centres a traiter</CardDescription>
              <CardTitle className="text-2xl font-black text-slate-950">{actionableCenters.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-blue-200 bg-white shadow-sm">
            <CardHeader className="p-4">
              <CardDescription className="text-xs font-semibold text-slate-500">Renouvellements &lt; 30j</CardDescription>
              <CardTitle className="text-2xl font-black text-slate-950">{renewalsSoon.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-rose-200 bg-white shadow-sm">
            <CardHeader className="p-4">
              <CardDescription className="text-xs font-semibold text-slate-500">Tension capacite</CardDescription>
              <CardTitle className="text-2xl font-black text-slate-950">{quotaTensionCenters.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100 p-4 sm:p-5">
            <CardTitle className="flex items-center gap-2 text-lg text-slate-950">
              <AlertCircle className="h-5 w-5 text-primary" />
              Vigie reseau
            </CardTitle>
            <CardDescription className="text-sm text-slate-600">
              Centres qui demandent une action super admin sur le contrat, le renouvellement ou la capacite.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {actionableCenters.length > 0 ? (
              actionableCenters
                .sort((a, b) => b.health.priority - a.health.priority)
                .map((row) => (
                  <div key={row.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-black text-slate-950">{row.name}</h3>
                        <p className="mt-1 truncate text-[10px] uppercase tracking-widest text-slate-500">{row.companyName}</p>
                      </div>
                      <Badge className={cn("shrink-0 border", row.health.badgeClassName)}>
                        {row.health.label}
                      </Badge>
                    </div>
                    <p className="mt-3 text-xs leading-5 text-slate-600">{row.health.detail}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      <span>{formatCenterPlan(row.subscriptionPlan)}</span>
                      <span>•</span>
                      <span>{formatCenterSubscriptionStatus(row.subscriptionStatus)}</span>
                      <span>•</span>
                      <span>{row.activeClients} actifs</span>
                    </div>
                  </div>
                ))
            ) : (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:col-span-2 xl:col-span-3">
                <div className="flex items-start gap-3 text-emerald-700">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="text-sm font-black">Aucune alerte prioritaire</p>
                    <p className="text-xs leading-5 text-emerald-700/80">
                      La gouvernance economique des centres est saine a cet instant.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100 p-4 sm:p-5">
            <CardTitle className="flex items-center gap-2 text-lg text-slate-950">
              <Receipt className="h-5 w-5 text-primary" />
              Centres et abonnements
            </CardTitle>
            <CardDescription className="text-sm text-slate-600">
              Pilotage par entite de domiciliation. Les donnees client restent agregees.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid gap-3 p-3 sm:grid-cols-2 xl:hidden">
              {rows.map((row) => (
                <div key={row.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-black text-slate-950">{row.name}</h3>
                      <p className="mt-1 truncate text-xs text-slate-500">{row.companyName}</p>
                    </div>
                    <Badge className={cn("shrink-0 border", row.health.badgeClassName)}>
                      {row.health.label}
                    </Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Contrat</p>
                      <p className="mt-1 font-black text-slate-950">{formatCenterPlan(row.subscriptionPlan)}</p>
                      <p className="text-xs text-slate-500">{formatCenterSubscriptionStatus(row.subscriptionStatus)}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">MRR estime</p>
                      <p className="mt-1 font-black text-primary">{row.mrr.toLocaleString("fr-FR")} EUR</p>
                      <p className="text-xs text-slate-500">{row.activeClients}/{row.totalClients} actifs</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Renouvellement</p>
                      <p className="mt-1 font-black text-slate-950">{formatRenewalLabel(row.subscriptionRenewalDate)}</p>
                      <p className="text-xs text-slate-500">
                        {daysUntil(row.subscriptionRenewalDate) === null
                          ? "A planifier"
                          : `${daysUntil(row.subscriptionRenewalDate)} jour(s)`}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Quota</p>
                      <p className="mt-1 font-black text-slate-950">{row.quotaClients ?? "—"}</p>
                      <p className="text-xs text-slate-500">capacite centre</p>
                    </div>
                  </div>
                  <Button asChild size="sm" variant="outline" className="mt-4 w-full border-primary/20 bg-primary/5 text-primary hover:bg-primary/10">
                    <Link href="/admin/adresses">
                      Piloter
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
            <div className="hidden overflow-x-auto xl:block">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow className="border-slate-100 hover:bg-transparent">
                  <TableHead className="pl-6 text-xs font-bold uppercase text-slate-500">Centre</TableHead>
                  <TableHead className="text-xs font-bold uppercase text-slate-500">Societe exploitante / contrat</TableHead>
                  <TableHead className="text-center text-xs font-bold uppercase text-slate-500">Renouvellement</TableHead>
                  <TableHead className="text-center text-xs font-bold uppercase text-slate-500">Clients actifs</TableHead>
                  <TableHead className="text-center text-xs font-bold uppercase text-slate-500">MRR estime</TableHead>
                  <TableHead className="text-center text-xs font-bold uppercase text-slate-500">Sante</TableHead>
                  <TableHead className="pr-6 text-right text-xs font-bold uppercase text-slate-500">Pilotage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id} className="border-slate-100 hover:bg-slate-50/70">
                    <TableCell className="pl-6">
                      <div className="font-black text-slate-950">{row.name}</div>
                      <div className="text-xs text-slate-500">{row.id}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-900">{row.companyName}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-widest text-slate-500">
                        <span>{formatCenterPlan(row.subscriptionPlan)}</span>
                        <span>•</span>
                        <span>{formatCenterSubscriptionStatus(row.subscriptionStatus)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-black">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-black text-slate-950">
                          {formatRenewalLabel(row.subscriptionRenewalDate)}
                        </span>
                        <span className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
                          {daysUntil(row.subscriptionRenewalDate) === null
                            ? "A planifier"
                            : `${daysUntil(row.subscriptionRenewalDate)} jour(s)`}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-black text-slate-950">
                      {row.activeClients}
                      <span className="ml-1 text-xs font-medium text-slate-500">
                        / {row.totalClients}
                      </span>
                      <div className="mt-1 text-[10px] font-medium uppercase tracking-widest text-slate-500">
                        Quota {row.quotaClients ?? "—"}
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-black text-primary">
                      {row.mrr.toLocaleString("fr-FR")} EUR
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={cn("border", row.health.badgeClassName)}>
                        {row.health.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button asChild size="sm" variant="outline" className="border-primary/20 bg-primary/5 text-primary hover:bg-primary/10">
                        <Link href="/admin/adresses">
                          Piloter
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </CardContent>
          <CardFooter className="border-t border-slate-100 bg-slate-50 p-4">
            <p className="text-xs leading-5 text-slate-500">
              Cette vue lit maintenant la gouvernance contractuelle des centres depuis Firestore. L'etape suivante est d'ajouter la suspension/reactivation pilotee des centres avec impact controle sur les acces.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

const DownloadInvoiceButton = ({ invoice }: { invoice: Invoice }) => {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const { toast } = useToast();
  const functions = useFunctions();
  const pdfUrl = getInvoicePdfUrl(invoice);
  const hasUsablePdfUrl =
    Boolean(pdfUrl) &&
    invoice.pdf?.templateVersion === INVOICE_PDF_TEMPLATE_VERSION &&
    !needsInvoicePdfRefresh(pdfUrl) &&
    isInvoicePdfUrlAligned(invoice, pdfUrl);

  const openPdfInNewTab = React.useCallback((url: string) => {
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (!opened) {
      toast({
        title: "Ouverture bloquee",
        description: "Autorisez l'ouverture des nouveaux onglets pour consulter la facture.",
      });
    }
  }, [toast]);

  const handleDownload = async () => {
    if (!functions || !invoice.id) return;
    if (hasUsablePdfUrl) {
      openPdfInNewTab(pdfUrl);
      return;
    }
    if (invoice.pdf?.status === "processing") {
      toast({ title: "Génération en cours", description: "Veuillez patienter..." });
      return;
    }
    setIsGenerating(true);
    try {
      toast({ title: "Initialisation PDF", description: "Lancement de la génération..." });
      const requestInvoicePdf = httpsCallable(functions, "requestInvoicePdf");
      const response = await requestInvoicePdf({ invoiceId: invoice.id });
      const data = response.data as { url?: string | null };
      if (data.url) {
        openPdfInNewTab(data.url);
        setIsGenerating(false);
        return;
      }
      setTimeout(() => setIsGenerating(false), 10000);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erreur", description: "Échec du lancement PDF." });
      setIsGenerating(false);
    }
  };

  const isActuallyGenerating = isGenerating || invoice.pdf?.status === "processing";

  return (
    <Button
      variant={hasUsablePdfUrl ? "default" : "outline"}
      size="sm"
      onClick={handleDownload}
      disabled={isActuallyGenerating}
      className={cn(
        "h-9 rounded-xl px-3 text-xs font-bold transition-all",
        hasUsablePdfUrl
          ? "bg-primary text-white shadow-sm shadow-primary/20 hover:bg-primary/90"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      )}
    >
      {isActuallyGenerating ? (
        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
      ) : (
        <Download className="mr-2 h-3.5 w-3.5" />
      )}
      <span className="font-bold">
        {pdfUrl ? "Télécharger" : "Générer PDF"}
      </span>
    </Button>
  );
};

export default function BillingPage() {
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = React.useState<Invoice[]>([]);
  const [clients, setClients] = React.useState<(Client & { id: string })[]>([]);
  const [centers, setCenters] = React.useState<CenterGovernanceAddress[]>(allAddresses);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isCentersLoading, setIsCentersLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");

  const { displayRole, managedCenterIds } = useCenterAccess();
  const isSuperAdminView = displayRole === "super_admin";
  const auth = useAuth();
  const db = useDb();

  React.useEffect(() => {
    if (!db) {
      setCenters(allAddresses);
      setIsCentersLoading(false);
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
        console.error("Error fetching centers for billing:", error);
        setCenters(allAddresses);
        setIsCentersLoading(false);
      }
    );

    return () => unsubscribe();
  }, [db]);

  React.useEffect(() => {
    if (!displayRole || !db || !auth) {
      if (!auth?.currentUser) setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const scopedAddressKeys = managedCenterIds
      .map((centerId) => legacyCenterKey(centerId) ?? centerId)
      .slice(0, 10);

    if (isSuperAdminView) {
      const clientsQuery = query(collection(db, "clients"));
      const unsubscribeClients = onSnapshot(
        clientsQuery,
        (snap) => {
          setClients(snap.docs.map(d => ({ id: d.id, ...d.data() }) as any));
          setInvoices([]);
          setFilteredInvoices([]);
          setIsLoading(false);
        },
        (error) => {
          console.error("Error fetching center billing aggregates:", error);
          setClients([]);
          setIsLoading(false);
        }
      );

      return () => unsubscribeClients();
    }

    if (scopedAddressKeys.length === 0) {
      setInvoices([]);
      setFilteredInvoices([]);
      setClients([]);
      setIsLoading(false);
      return;
    }

    let invoicesQuery: Query<DocumentData> = query(
      collection(db, "invoices"),
      orderBy("issuedAt", "desc"),
      limit(200)
    );

    if (scopedAddressKeys.length === 1) {
      invoicesQuery = query(invoicesQuery, where("addressKey", "==", scopedAddressKeys[0]));
    } else {
      invoicesQuery = query(invoicesQuery, where("addressKey", "in", scopedAddressKeys));
    }

    const unsubscribe = onSnapshot(
      invoicesQuery,
      (snapshot) => {
        const invoicesData = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            date: toDateSafe(data.issuedAt),
            dueDate: toDateSafe(data.dueDate || data.issuedAt),
            amount: (data.amountCents || 0) / 100,
            client: data.snapshot?.client || {},
            uiStatus: mapStatusToUI(data.status),
          } as any;
        });
        setInvoices(invoicesData);
        setFilteredInvoices(invoicesData);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching invoices:", error);
        setIsLoading(false);
      }
    );

    let clientsQuery: Query<DocumentData> = query(collection(db, "clients"));
    if (scopedAddressKeys.length === 1) {
      clientsQuery = query(clientsQuery, where("addressKey", "==", scopedAddressKeys[0]));
    } else {
      clientsQuery = query(clientsQuery, where("addressKey", "in", scopedAddressKeys));
    }
    const unsubscribeClients = onSnapshot(clientsQuery, (snap) => {
      setClients(
        snap.docs
          .map(d => ({ id: d.id, ...d.data() }) as any)
          .filter(isActiveCenterClient)
      );
    });

    return () => {
      unsubscribe();
      unsubscribeClients();
    };
  }, [displayRole, managedCenterIds, db, auth, isSuperAdminView]);

  React.useEffect(() => {
    let filtered = invoices;
    if (statusFilter !== "all") {
      filtered = filtered.filter((invoice) => invoice.uiStatus === statusFilter);
    }
    if (searchTerm.trim()) {
      const lowercasedTerm = searchTerm.toLowerCase();
      filtered = filtered.filter((invoice) => {
        const clientName = String(invoice.client?.name ?? "").toLowerCase();
        const clientEmail = String(invoice.client?.email ?? "").toLowerCase();
        const invoiceId = String(invoice.id ?? "").toLowerCase();
        return clientName.includes(lowercasedTerm) || clientEmail.includes(lowercasedTerm) || invoiceId.includes(lowercasedTerm);
      });
    }
    setFilteredInvoices(filtered);
  }, [searchTerm, statusFilter, invoices]);

  const kpiData = React.useMemo(() => {
    const activeClients = clients.length;
    const mrr = clients.reduce((total, client) => total + resolvePlanMonthlyPrice(client), 0);
    const arr = mrr * 12;
    return { mrr, arr, activeClients };
  }, [clients]);

  if (isLoading || (isSuperAdminView && isCentersLoading)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50">
        <div className="relative">
          <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
          </div>
        </div>
      </div>
    );
  }

  if (isSuperAdminView) {
    return <SuperAdminCenterBillingView centers={centers} clients={clients} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 px-3 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-3 text-slate-950 sm:px-4 md:px-6 md:py-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5 sm:space-y-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="flex items-center gap-2 text-primary">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Pilotage centre</span>
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Facturation du centre
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Suivez les factures du centre, les paiements clients et les indicateurs HT utiles au pilotage opérationnel.
          </p>
        </motion.div>

        {/* STATS SECTION */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {/* MRR Card */}
          <motion.div variants={itemVariants}>
            <Card className="relative h-full overflow-hidden border-primary/20 bg-white shadow-sm">
              <div className="absolute right-3 top-3 opacity-10">
                <DollarSign className="h-12 w-12 text-primary" />
              </div>
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-slate-500">MRR mensuel</CardDescription>
                <CardTitle className="flex items-baseline gap-1 text-2xl font-black text-slate-950">
                  {kpiData.mrr.toLocaleString("fr-FR")} <span className="text-sm font-medium opacity-60">€ HT</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-[10px] font-medium text-slate-500">
                  Calculé sur les abonnements actifs du centre
                </div>
              </CardContent>
              <div className="h-1 w-full bg-gradient-to-r from-primary/0 via-primary/40 to-primary/0" />
            </Card>
          </motion.div>

          {/* ARR Card */}
          <motion.div variants={itemVariants}>
            <Card className="relative h-full overflow-hidden border-indigo-200 bg-white shadow-sm">
              <div className="absolute right-3 top-3 opacity-10">
                <CreditCard className="h-12 w-12 text-indigo-500" />
              </div>
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-slate-500">ARR annuel</CardDescription>
                <CardTitle className="flex items-baseline gap-1 text-2xl font-black text-slate-950">
                  {kpiData.arr.toLocaleString("fr-FR")} <span className="text-sm font-medium opacity-60">€ HT</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-[10px] font-medium text-slate-500">Projection basée sur le MRR actuel</div>
              </CardContent>
              <div className="h-1 w-full bg-gradient-to-r from-indigo-500/0 via-indigo-500/40 to-indigo-500/0" />
            </Card>
          </motion.div>

          {/* Active Clients Card */}
          <motion.div variants={itemVariants}>
            <Card className="relative h-full overflow-hidden border-emerald-200 bg-white shadow-sm">
              <div className="absolute right-3 top-3 opacity-10">
                <Users className="h-12 w-12 text-emerald-500" />
              </div>
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Clients actifs</CardDescription>
                <CardTitle className="text-2xl font-black text-slate-950">
                  {kpiData.activeClients}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Souscriptions validées
                </div>
              </CardContent>
              <div className="h-1 w-full bg-gradient-to-r from-emerald-500/0 via-emerald-500/40 to-emerald-500/0" />
            </Card>
          </motion.div>
        </motion.div>

        {/* BILLING HISTORY TABLE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          {/* Table Header / Controls */}
          <div className="flex flex-col gap-4 border-b border-slate-100 bg-white p-4 md:flex-row md:items-center md:justify-between sm:p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-primary/10 bg-primary/10 p-2">
                <Receipt className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight text-slate-950">Historique de facturation</h2>
                <p className="text-xs font-medium text-slate-500">Gestion et audit des factures clients</p>
              </div>
            </div>

            <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row md:w-auto">
              <div className="relative w-full sm:w-[300px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Facture, client, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10 rounded-xl border-slate-200 bg-white pl-10 font-medium focus:border-primary/40 focus:ring-primary/20"
                />
              </div>

              <div className="relative w-full sm:w-[200px]">
                <Filter className="pointer-events-none absolute left-3 top-1/2 z-10 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-white pl-9 text-[11px] font-bold uppercase tracking-wider focus:border-primary/40 focus:ring-primary/20">
                    <SelectValue placeholder="STATUT" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 bg-white">
                    <SelectItem value="all" className="font-bold text-[11px] uppercase">Tous les statuts</SelectItem>
                    <SelectItem value="Payée" className="text-emerald-500 font-bold text-[11px] uppercase">Payée</SelectItem>
                    <SelectItem value="En attente" className="text-orange-500 font-bold text-[11px] uppercase">En attente</SelectItem>
                    <SelectItem value="En retard" className="text-rose-500 font-bold text-[11px] uppercase">En retard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <CardContent className="p-0">
            {/* Mobile View */}
            <div className="grid gap-3 p-3 sm:grid-cols-2 xl:hidden">
              {filteredInvoices.map((invoice, idx) => (
                <motion.div
                  key={invoice.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-start justify-between gap-3">
                        <span className="min-w-0 truncate rounded border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          {invoice.invoiceNumber || invoice.id}
                        </span>
                        <Badge
                          variant={statusConfig[invoice.uiStatus as InvoiceStatus]?.variant || "secondary"}
                          className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest", statusConfig[invoice.uiStatus as InvoiceStatus]?.className)}
                        >
                          {invoice.uiStatus}
                        </Badge>
                      </div>
                      <CardTitle className="mt-3 line-clamp-2 text-base font-black text-slate-950">
                        {getClientName(invoice.client)}
                      </CardTitle>
                      <p className="truncate text-xs text-slate-500">{getClientEmail(invoice.client)}</p>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-3 px-4 py-2">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Montant HT</p>
                        <p className="text-sm font-black text-primary">
                          {invoice.amount.toFixed(2)}€ HT
                        </p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Échéance</p>
                        <p className="text-sm font-bold text-slate-900">
                          {invoice.dueDate.toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Émission</p>
                        <p className="text-sm font-bold text-slate-900">
                          {invoice.date.toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Type</p>
                        <p className="truncate text-sm font-bold text-slate-900">
                          {invoice.type || "Facture"}
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-start border-t border-slate-100 bg-slate-50/80 p-4">
                      <DownloadInvoiceButton invoice={invoice} />
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Desktop View */}
            <div className="hidden overflow-x-auto xl:block">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow className="border-slate-100 hover:bg-transparent">
                    <TableHead className="py-4 pl-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">Facture N°</TableHead>
                    <TableHead className="py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Titulaire / Email</TableHead>
                    <TableHead className="py-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">Émission</TableHead>
                    <TableHead className="py-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">Échéance</TableHead>
                    <TableHead className="py-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">Montant HT</TableHead>
                    <TableHead className="py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Statut</TableHead>
                    <TableHead className="py-4 pr-6 text-right text-[10px] font-bold uppercase tracking-widest text-slate-500">Option</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {filteredInvoices.map((invoice, idx) => (
                      <motion.tr
                        key={invoice.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + idx * 0.03 }}
                        className="group h-16 cursor-default border-slate-100 transition-colors hover:bg-slate-50/70"
                      >
                        <TableCell className="pl-6">
                           <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-500 transition-colors group-hover:text-primary">
                            {invoice.invoiceNumber || invoice.id}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="font-black leading-tight text-slate-950">
                            {getClientName(invoice.client)}
                          </div>
                          <div className="text-[10px] font-medium text-slate-500">
                            {getClientEmail(invoice.client)}
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-[11px] font-bold text-slate-500">
                          {invoice.date.toLocaleDateString("fr-FR")}
                        </TableCell>
                        <TableCell className="text-center text-[11px] font-bold text-slate-700">
                          {invoice.dueDate.toLocaleDateString("fr-FR")}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-black text-slate-950 transition-colors group-hover:text-primary">
                            {invoice.amount.toFixed(2)}€ HT
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={statusConfig[invoice.uiStatus as InvoiceStatus]?.variant || "secondary"}
                            className={cn("rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider shadow-none capitalize", statusConfig[invoice.uiStatus as InvoiceStatus]?.className)}
                          >
                            {invoice.uiStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <DownloadInvoiceButton invoice={invoice} />
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>

            {filteredInvoices.length === 0 && !isLoading && (
              <div className="flex flex-col items-center gap-3 p-10 text-center text-slate-500 sm:p-16">
                <Search className="mb-2 h-10 w-10 opacity-30" />
                <p className="text-sm font-bold tracking-tight">Aucune transaction ne correspond à vos filtres actuels.</p>
              </div>
            )}
          </CardContent>
          <div className="flex justify-center border-t border-slate-100 bg-slate-50 p-4">
             <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Journal financier sécurisé</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
