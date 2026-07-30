"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Check,
  Package,
  AlertTriangle,
  Download,
  FileText,
  X,
  RotateCcw,
  Loader2,
  Crown,
  Zap,
  Star,
  CreditCard,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { mailPlans } from "@/lib/plans";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { User } from "firebase/auth";
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import type { Client } from "@/app/admin/clients/page";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useDb, useAuth, useFunctions } from "@/firebase";
import { httpsCallable } from "firebase/functions";

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
  uiStatus: InvoiceStatus;
  pdf?: {
    status: string;
    outputUrl?: string;
    fileUrl?: string;
    url?: string;
    storagePath?: string;
    templateVersion?: string;
    updatedAt?: any;
  };
};

const INVOICE_PDF_TEMPLATE_VERSION = "invoice-flat-v4-branded-logo-2026-04-23";

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

type SafeClient = Client & {
  id: string;
  joinDate?: any;
  plan?: "classic" | "starter" | "business" | "premium";
  planId?: string;
  mailPlanId?: string;
  tier?: string;
  paymentFrequency?: "monthly" | "yearly" | string;
  paymentStatus?: string;
  subscriptionStatus?: string;
  subscriptionCancelAtPeriodEnd?: boolean;
  subscriptionRenewalDate?: any;
  pendingSubscriptionChange?: {
    planId?: string;
    frequency?: "monthly" | "yearly" | string;
    effectiveAt?: any;
  };
  subscription?: {
    frequency?: "monthly" | "yearly" | string;
    currentPeriodEnd?: any;
  };
  stripeCheckout?: {
    customerId?: string | null;
    subscriptionId?: string | null;
    status?: string | null;
  };
  recurringPaymentSetup?: {
    status?: string | null;
    checkoutSessionId?: string | null;
  };
  requiresRecurringPaymentSetup?: boolean;
  status?: string;
};

function normalizeClientStatus(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

function isClientActive(client: SafeClient | null): boolean {
  const status = normalizeClientStatus(client?.status);
  const paymentStatus = normalizeClientStatus(client?.paymentStatus);

  return (
    status === "actif" ||
    status === "active" ||
    (paymentStatus === "paid" && !["inactive", "inactif", "suspended", "suspendu"].includes(status))
  );
}

function resolveClientPlanId(client: SafeClient | null): string {
  return String(
    client?.planId ||
      client?.plan ||
      client?.mailPlanId ||
      (client?.tier === "pro" ? "business" : client?.tier) ||
      ""
  ).trim();
}

function resolveClientFrequency(client: SafeClient | null): "monthly" | "yearly" {
  const value = String(client?.paymentFrequency || client?.subscription?.frequency || "").trim().toLowerCase();
  return value === "yearly" || value === "annual" ? "yearly" : "monthly";
}

function toDateOrNull(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value?.toDate === "function") return value.toDate();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatPlanPrice(plan: (typeof mailPlans)[number], frequency: "monthly" | "yearly") {
  if (frequency === "yearly") {
    const yearlyTotal = plan.numericPrice * 12 * 0.9;
    return {
      total: yearlyTotal,
      perMonth: yearlyTotal / 12,
      label: `${yearlyTotal.toFixed(2)}€ HT/an`,
      helper: `soit ${(yearlyTotal / 12).toFixed(2)}€ HT/mois`,
    };
  }

  return {
    total: plan.numericPrice,
    perMonth: plan.numericPrice,
    label: `${plan.numericPrice.toFixed(2)}€ HT/mois`,
    helper: "facturation mensuelle",
  };
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

function openPdfInNewTab(pdfUrl: string): boolean {
  const newTab = window.open(pdfUrl, "_blank", "noopener,noreferrer");
  if (newTab) newTab.opener = null;
  return Boolean(newTab);
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

  const handleDownload = async () => {
    if (!functions || !invoice.id) return;

    if (hasUsablePdfUrl) {
      const opened = openPdfInNewTab(pdfUrl);
      if (!opened) {
        toast({
          variant: "destructive",
          title: "Ouverture bloquée",
          description: "Autorisez les nouveaux onglets pour consulter la facture.",
        });
      }
      return;
    }

    if (invoice.pdf?.status === "processing") {
      toast({
        title: "Génération en cours",
        description: "Veuillez patienter quelques instants...",
      });
      return;
    }

    setIsGenerating(true);

    try {
      toast({
        title: "Initialisation du PDF...",
        description: "La génération de votre facture a commencé.",
      });

      const requestInvoicePdf = httpsCallable(functions, "requestInvoicePdf");
      const response = await requestInvoicePdf({ invoiceId: invoice.id });
      const data = response.data as { url?: string | null };
      if (data.url) {
        const opened = openPdfInNewTab(data.url);
        if (!opened) {
          toast({
            variant: "destructive",
            title: "Ouverture bloquée",
            description: "Autorisez les nouveaux onglets pour consulter la facture.",
          });
        }
        setIsGenerating(false);
        return;
      }

      setTimeout(() => {
        setIsGenerating(false);
      }, 10000);

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de lancer la génération du PDF.",
      });
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
      className="gap-2"
    >
      {isActuallyGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {pdfUrl ? "Télécharger" : "Préparer le PDF"}
    </Button>
  );
};

const PlanCard = ({
  plan,
  isCurrent = false,
  onSelect,
  currentPlan,
  frequency,
  isBusy,
}: {
  plan: (typeof mailPlans)[number];
  isCurrent?: boolean;
  onSelect: (planId: string) => void;
  currentPlan: (typeof mailPlans)[number];
  frequency: "monthly" | "yearly";
  isBusy?: boolean;
}) => {
  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case "premium":
        return <Crown className="h-5 w-5" />;
      case "business":
        return <Zap className="h-5 w-5" />;
      default:
        return <Star className="h-5 w-5" />;
    }
  };

  const calculateProratedAmount = () => {
    if (isCurrent || !currentPlan) return 0;

    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const daysInMonth = endOfMonth.getDate();
    const daysUsed = now.getDate();
    const daysRemaining = daysInMonth - daysUsed;

    const currentDailyRate = currentPlan.numericPrice / daysInMonth;
    const newDailyRate = plan.numericPrice / daysInMonth;

    const credit = currentDailyRate * daysRemaining;
    const debit = newDailyRate * daysRemaining;

    return Math.max(0, debit - credit);
  };

  const proratedAmount = calculateProratedAmount();
  const isUpgrade = plan.numericPrice > currentPlan.numericPrice;
  const priceDetails = formatPlanPrice(plan, frequency);

  const getPriceDescription = () => {
    if (isCurrent) return "Votre offre actuelle";
    if (proratedAmount > 0) {
      return `Ajustement estimé : +${proratedAmount.toFixed(2)}€ ce mois`;
    }
    return "Aucun ajustement estimé";
  };

  return (
    <div
      className={cn(
        "group relative rounded-xl border p-6 transition-all duration-300 hover:shadow-lg",
        isCurrent
          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
          : "border-border bg-card/50 hover:border-primary/50"
      )}
    >
      {isCurrent && (
        <div className="absolute -right-2 -top-2">
          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
            Actuel
          </Badge>
        </div>
      )}

      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "rounded-lg p-2",
              isCurrent
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {getPlanIcon(plan.id)}
          </div>
          <div>
            <h3 className="text-lg font-bold">{plan.name}</h3>
            <p className="text-sm text-muted-foreground">{plan.description}</p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-3xl font-bold">{priceDetails.label}</div>
        <div className="text-sm text-muted-foreground">{priceDetails.helper}</div>
        {!isCurrent && (
          <div
            className={cn(
              "mt-1 text-xs",
              proratedAmount > 0 ? "text-amber-600" : "text-muted-foreground"
            )}
          >
            {getPriceDescription()}
          </div>
        )}
      </div>

      <ul className="mb-6 space-y-3">
        {Object.entries(plan.features)
          .slice(0, 4)
          .map(([feature, value]) => (
            <li key={feature} className="flex items-center text-sm">
              {value ? (
                <Check className="mr-3 h-4 w-4 flex-shrink-0 text-green-500" />
              ) : (
                <X className="mr-3 h-4 w-4 flex-shrink-0 text-muted-foreground" />
              )}
              <span className={cn(!value && "text-muted-foreground line-through")}>
                {feature}
              </span>
            </li>
          ))}
      </ul>

      {!isCurrent && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant={isUpgrade ? "default" : "outline"}
              className="w-full gap-2"
              disabled={isBusy}
            >
              {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
              {isUpgrade ? "Upgrader" : "Downgrader"}
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer le changement d'offre</AlertDialogTitle>
              <AlertDialogDescription>
                <div className="mt-2 space-y-3">
                  <p>
                    Vous allez passer de <strong>{currentPlan.name}</strong> à{" "}
                    <strong>{plan.name}</strong>.
                  </p>

                  {proratedAmount > 0 && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                      <strong>
                        Ajustement estimé : {proratedAmount.toFixed(2)}€
                      </strong>
                      <p className="mt-1 text-xs">
                        Ce montant est indicatif. Le calcul réel doit être fait
                        côté serveur.
                      </p>
                    </div>
                  )}

                  <p className="text-sm">
                    La demande sera traitée côté serveur : mise à jour Stripe si
                    un abonnement existe déjà, ou redirection vers Checkout si
                    aucun abonnement Stripe n'est encore rattaché à votre compte.
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={() => onSelect(plan.id)} disabled={isBusy}>
                {isBusy ? "Traitement..." : "Continuer"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default function SubscriptionPage() {
  const { toast } = useToast();
  const auth = useAuth();
  const db = useDb();

  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [client, setClient] = React.useState<SafeClient | null>(null);
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [paymentFrequency, setPaymentFrequency] = React.useState<"monthly" | "yearly">("monthly");
  const [changingPlan, setChangingPlan] = React.useState<string | null>(null);
  const [isPortalLoading, setIsPortalLoading] = React.useState(false);
  const functions = useFunctions();

  const handleOpenPortal = async () => {
    if (!functions) return;
    setIsPortalLoading(true);
    try {
      const createPortalSession = httpsCallable(functions, "createStripePortalSession");
      const result = await createPortalSession({
        returnUrl: window.location.href
      });
      const data = result.data as { url: string };
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error("Error opening portal:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible d'ouvrir le portail de gestion.",
      });
    } finally {
      setIsPortalLoading(false);
    }
  };

  React.useEffect(() => {
    if (!client) return;
    setPaymentFrequency(resolveClientFrequency(client));
  }, [client]);

  React.useEffect(() => {
    if (!auth) return;

    const unsubscribeAuth = auth.onAuthStateChanged((user: User | null) => {
      setCurrentUser(user);
      if (!user) {
        setClient(null);
        setInvoices([]);
        setIsLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [auth]);

  React.useEffect(() => {
    if (!currentUser || !db) return;

    setIsLoading(true);

    const clientRef = doc(db, "clients", currentUser.uid);

    const unsubscribe = onSnapshot(
      clientRef,
      (snap) => {
        if (!snap.exists()) {
          setClient(null);
          setInvoices([]);
          setIsLoading(false);
          return;
        }

        const clientData = { id: snap.id, ...snap.data() } as SafeClient;
        setClient(clientData);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching client subscription:", error);
        setIsLoading(false);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger votre abonnement.",
        });
      }
    );

    const invoicesQuery = query(
      collection(db, "invoices"),
      where("clientId", "==", currentUser.uid),
      orderBy("issuedAt", "desc"),
      limit(50)
    );

    const unsubscribeInvoices = onSnapshot(invoicesQuery, (snapshot) => {
      const fetchedInvoices = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.issuedAt?.toDate ? data.issuedAt.toDate() : new Date(data.issuedAt),
          dueDate: (data.dueDate || data.issuedAt)?.toDate ? (data.dueDate || data.issuedAt).toDate() : new Date(data.dueDate || data.issuedAt),
          amount: (data.amountCents || 0) / 100,
          uiStatus: mapStatusToUI(data.status),
        } as any;
      });
      setInvoices(fetchedInvoices);
    });

    return () => {
      unsubscribe();
      unsubscribeInvoices();
    };
  }, [currentUser, db, toast]);

  const currentPlanDetails = React.useMemo(() => {
    const planId = resolveClientPlanId(client);
    return mailPlans.find((p) => p.id === planId) || null;
  }, [client]);

  const allPlans = mailPlans;

  const nextBillingDate = React.useMemo(() => {
    const explicitRenewalDate =
      toDateOrNull(client?.subscriptionRenewalDate) ||
      toDateOrNull(client?.subscription?.currentPeriodEnd);
    if (explicitRenewalDate) return explicitRenewalDate;

    const d = new Date();
    if (paymentFrequency === "monthly") {
      d.setMonth(d.getMonth() + 1);
    } else {
      d.setFullYear(d.getFullYear() + 1);
    }
    return d;
  }, [client, paymentFrequency]);

  const pendingChangeDetails = React.useMemo(() => {
    if (!client?.pendingSubscriptionChange) return null;
    const plan = mailPlans.find((item) => item.id === client.pendingSubscriptionChange?.planId);
    const effectiveAt = toDateOrNull(client.pendingSubscriptionChange.effectiveAt);
    const pendingFrequency =
      client.pendingSubscriptionChange.frequency === "yearly" ? "yearly" : "monthly";
    const frequency = resolveClientFrequency({
      ...client,
      paymentFrequency: pendingFrequency,
    });

    return {
      planName: plan?.name || "nouvelle offre",
      frequencyLabel: frequency === "yearly" ? "annuelle" : "mensuelle",
      effectiveAt,
    };
  }, [client]);

  const handleChangePlan = async (newPlanId: string) => {
    if (!functions) return;
    setChangingPlan(newPlanId);
    try {
      const updateClientSubscription = httpsCallable(functions, "updateClientSubscription");
      const result = await updateClientSubscription({
        planId: newPlanId,
        frequency: paymentFrequency,
        returnUrl: window.location.href,
      });
      const data = result.data as {
        url?: string;
        mode?: string;
        planId?: string;
        frequency?: "monthly" | "yearly";
        amountCents?: number;
        invoiceId?: string | null;
        effectiveAt?: string | null;
      };

      if (data.url) {
        window.location.assign(data.url);
        return;
      }

      if (data.mode === "manual_scheduled_change") {
        setClient((prev) =>
          prev
            ? {
                ...prev,
                pendingSubscriptionChange: {
                  ...(prev as any).pendingSubscriptionChange,
                  planId: data.planId || newPlanId,
                  frequency: data.frequency || paymentFrequency,
                  effectiveAt: data.effectiveAt || null,
                },
              } as SafeClient
            : prev
        );
        toast({
          title: "Changement programmé",
          description: "Le nouveau forfait prendra effet à la prochaine échéance pour préserver la période déjà payée.",
        });
        return;
      }

      setClient((prev) =>
        prev
          ? {
              ...prev,
              planId: data.planId || newPlanId,
              plan: (data.planId || newPlanId) as SafeClient["plan"],
              mailPlanId: data.planId || newPlanId,
              paymentFrequency: data.frequency || paymentFrequency,
              subscriptionStatus: "active",
              paymentStatus: "paid",
              subscriptionCancelAtPeriodEnd: false,
            }
          : prev
      );

      const amountLabel =
        typeof data.amountCents === "number" && data.amountCents > 0
          ? ` Facture de régularisation : ${(data.amountCents / 100).toFixed(2)}€.`
          : "";

      toast({
        title: "Abonnement mis à jour",
        description: `Votre nouvelle offre est prise en compte.${amountLabel}`,
      });
    } catch (error: any) {
      console.error("[SubscriptionPage] updateClientSubscription failed", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error?.message || "Impossible de modifier l'abonnement.",
      });
    } finally {
      setChangingPlan(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!functions) return;
    setIsPortalLoading(true);
    try {
      const cancelClientSubscription = httpsCallable(functions, "cancelClientSubscription");
      await cancelClientSubscription({});
      toast({
        title: "Annulation enregistrée",
        description: "Votre abonnement sera arrêté selon les conditions de facturation applicables.",
      });
    } catch (error: any) {
      console.error("[SubscriptionPage] cancelClientSubscription failed", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error?.message || "Impossible d'annuler l'abonnement.",
      });
    } finally {
      setIsPortalLoading(false);
    }
  };

  const getPriceDetails = (
    plan: (typeof currentPlanDetails),
    frequency: "monthly" | "yearly"
  ) => {
    if (!plan) return { total: 0, perMonth: 0, period: "mois" };

    if (frequency === "yearly") {
      const yearlyPrice = plan.numericPrice * 12 * 0.9;
      return {
        total: yearlyPrice,
        perMonth: yearlyPrice / 12,
        period: "an",
      };
    }

    return {
      total: plan.numericPrice,
      perMonth: plan.numericPrice,
      period: "mois",
    };
  };

  const currentPriceDetails = getPriceDetails(currentPlanDetails, paymentFrequency);
  const isCancelled = !isClientActive(client);
  const currentPlanId = resolveClientPlanId(client) || "starter";
  const hasStripeSubscription = Boolean(String(client?.stripeCheckout?.subscriptionId || "").trim());
  const needsRecurringPaymentSetup = Boolean(
    client &&
      !isCancelled &&
      (client.requiresRecurringPaymentSetup === true || !hasStripeSubscription)
  );
  const isActivatingRecurringPayment = changingPlan === currentPlanId;

  if (isLoading) {
    return (
      <div className="flex h-full min-h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!client || !currentPlanDetails) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Erreur</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Impossible de charger les informations de votre abonnement. Veuillez
            contacter le support.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl auto-rows-max gap-8">
      {/* Info contextuelle sur l'activation progressive des fonctionnalités */}

      <div className="grid gap-8 lg:grid-cols-3">
        <Card
          className={cn(
            "border-l-4 lg:col-span-2",
            !isCancelled ? "border-l-primary" : "border-l-amber-500"
          )}
        >
          <CardHeader className="border-b pb-4">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold">
              <Package className="h-6 w-6 text-primary" />
              Votre Abonnement
            </CardTitle>
            <CardDescription className="text-base">
              {isCancelled
                ? "Votre abonnement est actuellement inactif."
                : `Vous êtes abonné à l'offre ${currentPlanDetails.name}.`}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            {isCancelled ? (
              <Alert className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <AlertTitle className="font-bold text-amber-900 dark:text-amber-200">
                  Abonnement Inactif
                </AlertTitle>
                <AlertDescription className="text-amber-800 dark:text-amber-300">
                  Vous êtes sur une offre inactive ou de base. Réactivez un plan
                  payant pour retrouver toutes les fonctionnalités.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {client.subscriptionCancelAtPeriodEnd ? (
                  <Alert className="border-amber-500/50 bg-amber-50/60">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <AlertTitle>Annulation programmée</AlertTitle>
                    <AlertDescription>
                      Votre abonnement reste actif jusqu'au{" "}
                      {nextBillingDate.toLocaleDateString("fr-FR")}. Vous pouvez
                      choisir une offre pour réactiver la facturation automatique.
                    </AlertDescription>
                  </Alert>
                ) : null}

                {pendingChangeDetails ? (
                  <Alert className="border-blue-500/50 bg-blue-50/70">
                    <AlertTriangle className="h-5 w-5 text-blue-600" />
                    <AlertTitle>Changement programmé</AlertTitle>
                    <AlertDescription>
                      Le passage vers l'offre {pendingChangeDetails.planName} en
                      facturation {pendingChangeDetails.frequencyLabel} prendra
                      effet{" "}
                      {pendingChangeDetails.effectiveAt
                        ? `le ${pendingChangeDetails.effectiveAt.toLocaleDateString("fr-FR")}`
                        : "à la prochaine échéance"}
                      .
                    </AlertDescription>
                  </Alert>
                ) : null}

                {needsRecurringPaymentSetup ? (
                  <Alert className="border-sky-500/50 bg-sky-50/80">
                    <CreditCard className="h-5 w-5 text-sky-700" />
                    <AlertTitle className="font-bold text-sky-950">
                      Prelevement recurrent a activer
                    </AlertTitle>
                    <AlertDescription className="space-y-3 text-sky-900">
                      <p>
                        Votre espace est actif, mais aucun abonnement Stripe
                        recurrent n'est encore rattache a ce compte. Activez le
                        prelevement pour automatiser les prochaines factures.
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleChangePlan(currentPlanId)}
                        disabled={Boolean(changingPlan)}
                      >
                        {isActivatingRecurringPayment ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CreditCard className="h-4 w-4" />
                        )}
                        Activer le prelevement recurrent
                      </Button>
                    </AlertDescription>
                  </Alert>
                ) : null}

                <Tabs
                  value={paymentFrequency}
                  onValueChange={(value) =>
                    setPaymentFrequency(value as "monthly" | "yearly")
                  }
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="monthly">Mensuel</TabsTrigger>
                    <TabsTrigger value="yearly">Annuel (-10%)</TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="rounded-2xl border bg-gradient-to-r from-primary/10 to-primary/5 p-8">
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-foreground">
                      {currentPriceDetails.total.toFixed(2)}€
                    </span>
                    <span className="ml-3 text-xl text-muted-foreground">
                      /{currentPriceDetails.period} (HT)
                    </span>
                  </div>
                </div>

                {paymentFrequency === "yearly" && (
                  <div className="text-center text-sm text-muted-foreground">
                    Soit{" "}
                    <span className="font-bold text-foreground">
                      {currentPriceDetails.perMonth.toFixed(2)}€
                    </span>{" "}
                    par mois
                  </div>
                )}
              </>
            )}

            <div>
              <h3 className="mb-4 text-lg font-semibold">
                Fonctionnalités incluses :
              </h3>
              <div className="grid gap-3">
                {Object.entries(currentPlanDetails.features).map(
                  ([feature, value]) => (
                    <div
                      key={feature}
                      className="flex items-center rounded-lg bg-muted/30 p-3"
                    >
                      {value ? (
                        <Check className="mr-3 h-5 w-5 flex-shrink-0 text-green-500" />
                      ) : (
                        <X className="mr-3 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                      )}
                      <span
                        className={cn(
                          "text-sm",
                          !value && "text-muted-foreground line-through"
                        )}
                      >
                        {feature} {typeof value === "string" ? `(${value})` : ""}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex-col items-start gap-4 border-t pt-6">
            {isCancelled ? (
              <div className="flex w-full justify-center">
                <Button
                  size="lg"
                  onClick={() => handleChangePlan(resolveClientPlanId(client) || "starter")}
                  disabled={Boolean(changingPlan)}
                  className="gap-2"
                >
                  {changingPlan ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <RotateCcw className="h-5 w-5" />
                  )}
                  Réactiver cette offre
                </Button>
              </div>
            ) : (
              <>
                <div className="w-full text-center text-sm text-muted-foreground">
                  {needsRecurringPaymentSetup ? (
                    <p>
                      Le renouvellement automatique sera confirme apres
                      activation du prelevement Stripe.
                    </p>
                  ) : (
                    <p>
                      Renouvellement automatique le{" "}
                      <span className="font-semibold text-foreground">
                        {nextBillingDate.toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                    </p>
                  )}
                </div>

                <div className="flex w-full justify-center gap-3">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        Annuler l'abonnement
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Confirmer l'annulation
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Votre demande sera enregistrée côté serveur. Si votre
                          abonnement est géré par Stripe, l'arrêt sera programmé
                          à la fin de la période déjà payée.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Conserver</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancelSubscription}>
                          Continuer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </>
            )}
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold">Toutes les Offres</CardTitle>
              <CardDescription>Comparez les plans disponibles</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {allPlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  isCurrent={plan.id === resolveClientPlanId(client)}
                  onSelect={handleChangePlan}
                  currentPlan={currentPlanDetails}
                  frequency={paymentFrequency}
                  isBusy={changingPlan === plan.id}
                />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b pb-4">
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <FileText className="h-5 w-5 text-primary" />
            Historique de Facturation
          </CardTitle>
          <CardDescription className="text-base">
            Consultez et téléchargez vos factures passées
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid gap-4 md:hidden">
            {invoices.map((invoice) => (
              <Card key={invoice.id} className="p-4">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground">{invoice.id}</h4>
                    <p className="text-sm text-muted-foreground">
                      {invoice.date.toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <Badge
                    variant={invoice.uiStatus === "Payée" ? "default" : "secondary"}
                    className={cn(invoice.uiStatus === "Payée" && "bg-green-600 hover:bg-green-700")}
                  >
                    {invoice.uiStatus}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">
                    {invoice.amount.toFixed(2)}€ HT
                  </span>
                  <DownloadInvoiceButton invoice={invoice} />
                </div>
              </Card>
            ))}
          </div>

          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">N° Facture</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Montant (HT)</TableHead>
                  <TableHead className="font-semibold">Statut</TableHead>
                  <TableHead className="text-right font-semibold">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id} className="group hover:bg-muted/50">
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>
                      {invoice.date.toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {invoice.amount.toFixed(2)}€ HT
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={invoice.uiStatus === "Payée" ? "default" : "secondary"}
                        className={cn(invoice.uiStatus === "Payée" && "bg-green-600 hover:bg-green-700")}
                      >
                        {invoice.uiStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DownloadInvoiceButton invoice={invoice} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {invoices.length === 0 && !isLoading && (
            <div className="py-12 text-center text-muted-foreground">
              <FileText className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p className="mb-2 text-lg font-semibold">
                Aucun historique de facturation
              </p>
              <p className="text-sm">Vos futures factures apparaîtront ici</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
