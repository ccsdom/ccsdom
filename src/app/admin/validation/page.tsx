"use client";

import * as React from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import Link from "next/link";
import { format, isToday, isYesterday } from "date-fns";
import { fr } from "date-fns/locale";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  Mail,
  MailCheck,
  Search,
  ShieldAlert,
  ShieldCheck,
  ChevronRight,
  History,
} from "lucide-react";

import { useDb } from "@/firebase";
import { useCenterAccess } from "@/hooks/use-center-access";
import { useToast } from "@/hooks/use-toast";
import { OperationalAccessNotice } from "@/components/admin/operational-access-notice";
import { cn } from "@/lib/utils";
import {
  getSignupStatusLabel,
  getSignupStatusVariant,
} from "@/features/signup/status";
import { SIGNUP_REQUEST_STATUS } from "@/lib/constants/signup";
import { legacyCenterKey } from "@/lib/access-control";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SubscriptionPlanBadge } from "@/components/subscription-plan-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type RequestStatus = string;

type SignupRequestItem = {
  id: string;
  ownerUid?: string;
  uid?: string;
  companyName?: string;
  name?: string;
  email?: string;
  emailLower?: string;
  phone?: string;
  siret?: string;
  addressKey?: string;
  addressId?: string;
  projectType?: string;
  mailPlanId?: string;
  accompanimentType?: string;
  legalStatus?: string;
  status?: RequestStatus;
  paymentStatus?: string;
  documentsRequiredCompleted?: boolean;
  pdfJobs?: {
    contractId?: string | null;
    attestationId?: string | null;
  };
  pdfPublish?: {
    contract?: { status: string; error?: string | null };
    attestation?: { status: string; error?: string | null };
  };

  accessProvisioned?: boolean;
  accessProvisionedReason?: string;
  activationEmailSent?: boolean;
  activationEmailSentAt?: Timestamp;

  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  approvedAt?: Timestamp;
  rejectedAt?: Timestamp;
  rejectionReason?: string;
};

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

function formatDate(value?: Timestamp) {
  if (!value) return "—";
  try {
    const date = value.toDate();
    if (isToday(date)) return `Aujourd'hui à ${format(date, "HH:mm")}`;
    if (isYesterday(date)) return `Hier à ${format(date, "HH:mm")}`;
    return format(date, "d MMMM yyyy 'à' HH:mm", { locale: fr });
  } catch {
    return "—";
  }
}

function humanizeLocation(key?: string) {
  if (!key) return "—";
  const map: Record<string, string> = {
    paris: "Paris",
    paris_12e: "Paris 12e",
    orly: "Orly",
    orly_ville: "Orly-Ville",
  };
  return map[key] || key;
}

const PdfSmallStatus = ({ 
  label, 
  status, 
  error 
}: { 
  label: string; 
  status?: string; 
  error?: string | null 
}) => {
  if (!status) return null;

  const getStatusColor = (s: string) => {
    const low = s.toLowerCase();
    if (["success", "complete", "available"].includes(low)) return "text-emerald-500";
    if (["processing"].includes(low)) return "text-blue-500 font-bold";
    if (["queued"].includes(low)) return "text-orange-400";
    if (["error", "failed"].includes(low)) return "text-rose-500 font-bold";
    return "text-muted-foreground/40";
  };

  const getStatusLabel = (s: string) => {
    const low = s.toLowerCase();
    if (low === 'queued') return 'En attente';
    if (low === 'processing') return 'En cours';
    if (["success", "complete", "available"].includes(low)) return 'Disponible';
    if (["error", "failed"].includes(low)) return 'Erreur';
    return s;
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn("inline-flex transition-all hover:scale-110 active:scale-95 cursor-help", getStatusColor(status))}>
          {status.toLowerCase() === 'processing' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[200px] rounded-xl border border-slate-200 bg-white p-2 text-[10px] text-slate-950 shadow-xl">
        <p className="mb-1 border-b border-slate-100 pb-1 font-semibold">{label}</p>
        <p className="capitalize opacity-90">{getStatusLabel(status)}</p>
        {error && <p className="text-rose-400 mt-1 leading-tight line-clamp-2 italic text-[9px]">{error}</p>}
      </TooltipContent>
    </Tooltip>
  );
};

export default function AdminValidationPage() {
  const db = useDb();
  const { toast } = useToast();
  const { displayRole, managedCenterIds, isLoading: roleLoading } = useCenterAccess();
  const isSuperAdminView = displayRole === "super_admin";
  const isSecretaryView =
    displayRole === "secretary_paris" || displayRole === "secretary_orly";

  const [items, setItems] = React.useState<SignupRequestItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");

  const managedCenterIdsKey = React.useMemo(
    () => [...managedCenterIds].sort().join("|"),
    [managedCenterIds]
  );
  React.useEffect(() => {
    if (isSuperAdminView) {
      setItems([]);
      setLoading(false);
      return;
    }

    if (!db || !displayRole) return;

    const scopedAddressKeys = managedCenterIds
      .map((centerId) => legacyCenterKey(centerId))
      .filter((centerKey): centerKey is "paris" | "orly" => Boolean(centerKey))
      .slice(0, 10);

    if (scopedAddressKeys.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }

    let q = query(
      collection(db, "client_requests"),
      orderBy("updatedAt", "desc")
    );

    if (scopedAddressKeys.length === 1) {
      q = query(q, where("addressKey", "==", scopedAddressKeys[0]));
    } else if (scopedAddressKeys.length > 1) {
      q = query(q, where("addressKey", "in", scopedAddressKeys));
    }

    let hasSettled = false;
    const loadingTimeout = window.setTimeout(() => {
      if (!hasSettled) setLoading(false);
    }, 5000);

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        hasSettled = true;
        window.clearTimeout(loadingTimeout);
        const next: SignupRequestItem[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<SignupRequestItem, "id">),
        }));
        setItems(next);
        setLoading(false);
      },
      (error) => {
        hasSettled = true;
        window.clearTimeout(loadingTimeout);
        console.error("[AdminValidationPage] onSnapshot error:", error);
        toast({
          variant: "destructive",
          title: "Erreur de chargement",
          description: "Impossible de charger les demandes.",
        });
        setLoading(false);
      }
    );

    return () => {
      window.clearTimeout(loadingTimeout);
      unsub();
    };
  }, [db, toast, displayRole, managedCenterIdsKey, isSuperAdminView]);

  React.useEffect(() => {
    if (!loading) return;

    const timeout = window.setTimeout(() => setLoading(false), 7000);
    return () => window.clearTimeout(timeout);
  }, [loading]);
  const filteredItems = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;

    return items.filter((item) => {
      const haystack = [
        item.companyName,
        item.name,
        item.email,
        item.phone,
        item.siret,
        item.addressKey,
        item.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [items, search]);

  const pendingCount = React.useMemo(
    () =>
      items.filter(
        (item) =>
          item.status === SIGNUP_REQUEST_STATUS.PENDING_VALIDATION || item.status === SIGNUP_REQUEST_STATUS.DOCS_READY
      ).length,
    [items]
  );

  const preparationCount = React.useMemo(
    () =>
      items.filter(
        (item) =>
          item.status === SIGNUP_REQUEST_STATUS.DRAFT ||
          item.status === SIGNUP_REQUEST_STATUS.DOCUMENTS_PARTIAL ||
          item.status === SIGNUP_REQUEST_STATUS.PAYMENT_PENDING ||
          item.status === SIGNUP_REQUEST_STATUS.PAYMENT_RECEIVED
      ).length,
    [items]
  );

  const approvedCount = React.useMemo(
    () => items.filter((item) => item.status === SIGNUP_REQUEST_STATUS.APPROVED).length,
    [items]
  );

  if (loading || roleLoading) {
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
    return (
      <OperationalAccessNotice
        title="Validation client reservee aux centres"
        description="La validation des dossiers est une responsabilite operationnelle des centres. Le super admin supervise le reseau, les centres, les quotas et les indicateurs sans traiter les demandes client au quotidien."
      />
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 px-3 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-3 text-slate-950 sm:p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-2"
        >
          <div className="flex items-center gap-2 text-primary">
            <div className="h-1 w-6 rounded-full bg-primary" />
            <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary/80">Validation</span>
          </div>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            {isSecretaryView ? "Préparation des dossiers" : "Validation des dossiers"}
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            {isSecretaryView
              ? "Contrôlez les pièces et préparez les dossiers du centre."
              : "Vérifiez les demandes de domiciliation avant activation."}
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-3 sm:grid-cols-3"
        >
          <motion.div variants={itemVariants}>
            <Card className="relative overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm">
              <CardHeader className="space-y-2 p-4">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-600">
                  {isSecretaryView ? "Dossiers à préparer" : "Demandes à traiter"}
                  </CardDescription>
                  <Clock3 className="h-4 w-4 text-orange-500" />
                </div>
                <CardTitle className="flex items-baseline gap-2 text-3xl font-black text-slate-950">
                  {isSecretaryView ? preparationCount : pendingCount}
                  {(isSecretaryView ? preparationCount : pendingCount) > 0 && <span className="text-xs font-bold text-orange-600">À traiter</span>}
                </CardTitle>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <CardHeader className="space-y-2 p-4">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary/70">Total dossiers</CardDescription>
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-3xl font-black text-slate-950">
                  {items.length}
                </CardTitle>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
              <CardHeader className="space-y-2 p-4">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-600">
                  {isSecretaryView ? "Prêts pour revue" : "Validés"}
                  </CardDescription>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </div>
                <CardTitle className="text-3xl font-black text-slate-950">
                  {isSecretaryView ? pendingCount : approvedCount}
                </CardTitle>
              </CardHeader>
            </Card>
          </motion.div>
        </motion.div>

        {/* Priority Banner */}
        <TooltipProvider>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {(isSecretaryView ? preparationCount + pendingCount : pendingCount) > 0 ? (
              <div className="flex items-start gap-3 rounded-3xl border border-orange-100 bg-orange-50 p-4 text-orange-950 shadow-sm">
                <div className="rounded-2xl bg-orange-500 p-2">
                  <AlertTriangle className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold">Action requise</h3>
                  <p className="text-sm leading-6 text-orange-900/70">
                    {isSecretaryView ? (
                      <>
                        Il reste <strong>{preparationCount} dossier{preparationCount > 1 ? "s" : ""}</strong> à compléter et <strong>{pendingCount} dossier{pendingCount > 1 ? "s" : ""}</strong> prêt{pendingCount > 1 ? "s" : ""} pour relecture manager.
                      </>
                    ) : (
                      <>
                        Il reste <strong>{pendingCount} dossier{pendingCount > 1 ? "s" : ""}</strong> à vérifier pour garantir une fluidité d'embarquement.
                      </>
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-3xl border border-emerald-100 bg-emerald-50 p-4 text-emerald-950 shadow-sm">
                <div className="rounded-2xl bg-emerald-500 p-2">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold">File à jour</h3>
                  <p className="text-sm leading-6 text-emerald-900/70">
                    {isSecretaryView
                      ? "Aucun dossier n'attend de préparation ou de relecture. La file secrétariat est propre."
                      : "Aucun dossier n'est en attente de validation. Votre file d'attente est vide !"}
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Table Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-4 lg:flex-row lg:items-center sm:p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-2">
                  <History className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-950 sm:text-xl">
                    {isSecretaryView ? "Dossiers à préparer" : "Demandes de domiciliation"}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {isSecretaryView ? "Préparation et transmission au manager" : "Vue d'ensemble et contrôle des dossiers"}
                  </p>
                </div>
              </div>
              
              <div className="relative w-full lg:max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Rechercher un dossier..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-11 rounded-2xl border-slate-200 bg-white pl-10 text-sm font-medium shadow-sm placeholder:text-slate-400 focus:border-primary/40"
                />
              </div>
            </div>

            <div className="grid w-full min-w-0 gap-3 overflow-visible p-3 pb-32 lg:hidden">
              <AnimatePresence mode="popLayout">
                {filteredItems.length === 0 ? (
                  <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-8 text-center text-sm font-medium text-slate-500">
                    Aucun dossier ne correspond à votre recherche.
                  </div>
                ) : (
                  filteredItems.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      className="min-w-0"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                    >
                      <Card className="w-full max-w-full overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-950 shadow-sm">
                        <CardHeader className="space-y-3 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 space-y-1">
                              <CardTitle className="truncate font-headline text-lg font-black tracking-tight">
                                {item.companyName || item.name || "Dossier client"}
                              </CardTitle>
                              <CardDescription className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                                {item.siret || "SIRET non renseigné"}
                              </CardDescription>
                              {item.mailPlanId ? <SubscriptionPlanBadge planId={item.mailPlanId} compact /> : null}
                            </div>
                            <Badge
                              variant={getSignupStatusVariant(item.status)}
                              className="shrink-0 border-transparent text-[10px] font-bold uppercase tracking-wider"
                            >
                              {getSignupStatusLabel(item.status)}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs">
                            <div className="min-w-0">
                              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Email</p>
                              <p className="truncate font-semibold">{item.email || "—"}</p>
                              <p className="truncate text-slate-500">{item.phone || "—"}</p>
                            </div>
                            <div className="min-w-0 text-right">
                              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Centre</p>
                              <p className="truncate font-semibold text-primary">{humanizeLocation(item.addressKey)}</p>
                              <p className="truncate text-slate-500">{formatDate(item.updatedAt)}</p>
                            </div>
                          </div>

                          {(item.pdfPublish || item.pdfJobs?.contractId || item.pdfJobs?.attestationId || item.status === SIGNUP_REQUEST_STATUS.APPROVED) && (
                            <div className="flex flex-wrap items-center gap-2">
                              {(item.pdfPublish || item.pdfJobs?.contractId || item.pdfJobs?.attestationId) && (
                                <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 py-1">
                                  <PdfSmallStatus
                                    label="Contrat"
                                    status={item.pdfPublish?.contract?.status || (item.pdfJobs?.contractId ? "queued" : undefined)}
                                    error={item.pdfPublish?.contract?.error}
                                  />
                                  <div className="h-3 w-px bg-slate-200" />
                                  <PdfSmallStatus
                                    label="Attestation"
                                    status={item.pdfPublish?.attestation?.status || (item.pdfJobs?.attestationId ? "queued" : undefined)}
                                    error={item.pdfPublish?.attestation?.error}
                                  />
                                </div>
                              )}

                              {item.status === SIGNUP_REQUEST_STATUS.APPROVED && (
                                <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 py-1">
                                  <span className={cn("rounded-full p-1", item.accessProvisioned ? "bg-emerald-500/10 text-emerald-600" : "bg-orange-500/10 text-orange-600")}>
                                    {item.accessProvisioned ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
                                  </span>
                                  <span className={cn("rounded-full p-1", item.activationEmailSent ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-100 text-slate-400")}>
                                    {item.activationEmailSent ? <MailCheck className="h-3.5 w-3.5" /> : <Mail className="h-3.5 w-3.5" />}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </CardHeader>

                        <CardContent className="flex justify-start border-t border-slate-200 bg-slate-50 px-4 py-3">
                          <Link
                            href={`/admin/validation/${item.id}`}
                            className="inline-flex h-9 max-w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                          >
                            <span>Ouvrir</span>
                            <ChevronRight className="h-4 w-4 shrink-0" />
                          </Link>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            <div className="hidden overflow-x-auto lg:block">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow className="border-slate-200 hover:bg-transparent">
                    <TableHead className="py-4 pl-6 text-xs font-bold uppercase tracking-widest text-slate-500">Société / SIRET</TableHead>
                    <TableHead className="py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Contact client</TableHead>
                    <TableHead className="py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Établissement</TableHead>
                    <TableHead className="py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Statut</TableHead>
                    <TableHead className="py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Mise à jour</TableHead>
                    <TableHead className="py-4 pr-6 text-right text-xs font-bold uppercase tracking-widest text-slate-500">Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {filteredItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-12 text-center text-slate-400">
                          <Search className="h-8 w-8 mx-auto mb-2 opacity-10" />
                          Aucun dossier ne correspond à votre recherche.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredItems.map((item, idx) => (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + idx * 0.03 }}
                          className="group cursor-default border-slate-100 transition-colors hover:bg-slate-50"
                        >
                          <TableCell className="pl-6 py-4">
                            <div className="font-bold leading-tight text-slate-950 transition-colors group-hover:text-primary">
                              {item.companyName || item.name || "—"}
                            </div>
                            <div className="mt-1 w-fit rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
                              {item.siret || "SANS SIRET"}
                            </div>
                            {item.mailPlanId ? <SubscriptionPlanBadge planId={item.mailPlanId} compact className="mt-1.5" /> : null}
                          </TableCell>

                          <TableCell>
                            <div className="text-sm font-medium text-slate-700">{item.email || "—"}</div>
                            <div className="text-xs font-medium text-slate-500">
                              {item.phone || "—"}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="text-sm font-bold text-primary/80">{humanizeLocation(item.addressKey)}</div>
                            <div className="text-[10px] font-bold uppercase tracking-tight text-slate-400">
                              {humanizeLocation(item.addressId)}
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge variant={getSignupStatusVariant(item.status)} className="shadow-none border-transparent px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                              {getSignupStatusLabel(item.status)}
                            </Badge>

                            {/* Documents & Provisioning Indicators */}
                            <div className="flex items-center gap-2 mt-2">
                              {/* PDF Status */}
                              {(item.pdfPublish || item.pdfJobs?.contractId || item.pdfJobs?.attestationId) && (
                                <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white p-1 px-2 shadow-inner">
                                  <PdfSmallStatus 
                                    label="Contrat" 
                                    status={item.pdfPublish?.contract?.status || (item.pdfJobs?.contractId ? 'queued' : undefined)} 
                                    error={item.pdfPublish?.contract?.error} 
                                  />
                                  <div className="mx-0.5 h-3 w-px bg-slate-200" />
                                  <PdfSmallStatus 
                                    label="Attestation" 
                                    status={item.pdfPublish?.attestation?.status || (item.pdfJobs?.attestationId ? 'queued' : undefined)} 
                                    error={item.pdfPublish?.attestation?.error} 
                                  />
                                </div>
                              )}

                              {/* Provisioning Status */}
                              {item.status === SIGNUP_REQUEST_STATUS.APPROVED && (
                                <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white p-1 px-2 shadow-inner">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className={cn(
                                        "p-0.5 rounded-full transition-all",
                                        item.accessProvisioned ? "text-emerald-500 bg-emerald-500/10" : "text-orange-500 bg-orange-500/10"
                                      )}>
                                        {item.accessProvisioned ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="rounded-xl border border-slate-200 bg-white text-[10px] font-bold text-slate-950 shadow-xl">
                                      Accès Client : {item.accessProvisioned ? "Provisionné" : "Erreur"}
                                    </TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className={cn(
                                        "p-0.5 rounded-full transition-all",
                                        item.activationEmailSent ? "text-emerald-500 bg-emerald-500/10" : "text-slate-400 bg-slate-100"
                                      )}>
                                        {item.activationEmailSent ? <MailCheck className="h-3.5 w-3.5" /> : <Mail className="h-3.5 w-3.5" />}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="rounded-xl border border-slate-200 bg-white text-[10px] font-bold text-slate-950 shadow-xl">
                                      Email Activation : {item.activationEmailSent ? "Envoyé" : "En attente"}
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              )}
                            </div>

                            {item.rejectionReason && (
                              <div className="mt-2 text-[9px] leading-tight text-rose-500 font-bold bg-rose-500/5 px-2 py-1 rounded-md border border-rose-500/20 max-w-[200px]">
                                <span className="uppercase mr-1">Motif :</span> {item.rejectionReason}
                              </div>
                            )}
                          </TableCell>

                          <TableCell className="whitespace-nowrap text-[11px] font-medium text-slate-500">
                            <div className="flex items-center gap-1.5">
                              <History className="h-3 w-3" />
                              {formatDate(item.updatedAt)}
                            </div>
                          </TableCell>

                          <TableCell className="pr-6">
                            <div className="flex justify-end">
                              <Button asChild size="sm" variant="outline" className="h-9 rounded-xl border-slate-200 bg-white px-4 font-bold shadow-none transition-all duration-300 hover:border-transparent hover:bg-primary hover:text-white group/btn">
                                <Link href={`/admin/validation/${item.id}`} className="flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  <span className="font-bold">Ouvrir</span>
                                  <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
                                </Link>
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </motion.div>
        </TooltipProvider>
      </div>
    </div>
  );
}
