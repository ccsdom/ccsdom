// src/app/admin/validation/[id]/page.tsx
"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  doc,
  onSnapshot,
  type DocumentData,
  type FirestoreError,
} from "firebase/firestore";
import { httpsCallable, getFunctions } from "firebase/functions";
import {
  ArrowLeft,
  Loader2,
  FileText,
  BadgeCheck,
  BadgeX,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Mail,
  MailCheck,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

import { useDb, useFirebase } from "@/firebase";
import { useCenterAccess } from "@/hooks/use-center-access";
import { useToast } from "@/hooks/use-toast";
import { OperationalAccessNotice } from "@/components/admin/operational-access-notice";
import { cn } from "@/lib/utils";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SIGNUP_REQUEST_STATUS } from "@/lib/constants/signup";
import { getSignupStatusLabel, getSignupStatusVariant, isSignupReadyForValidation } from "@/features/signup/status";
import type { UserRole } from "@/lib/types/user";
import { canAccessCenter, resolveRecordCenterId } from "@/lib/access-control";

/* =========================
   Types
 ========================= */

export type AddressId = "paris_12e" | "orly_ville";
export type ClientRequestStatus = string;

type DocumentVerificationStatus = "processing" | "passed" | "warning" | "failed" | "unreadable" | "unsupported";

type DocumentVerificationReport = {
  status?: DocumentVerificationStatus | string;
  confidence?: number;
  summary?: string;
  reason?: string;
  warnings?: string[];
  checks?: Array<{
    key?: string;
    label?: string;
    status?: string;
    message?: string;
    expected?: string;
    actual?: string;
  }>;
  extractedData?: Record<string, unknown>;
  updatedAt?: any;
};

export interface ClientRequest {
  id?: string;

  companyName?: string;
  firstName?: string;
  lastName?: string;
  representative?: string;

  email?: string;
  emailLower?: string;

  phone?: string;
  siret?: string;

  addressId?: AddressId;
  addressKey?: string;
  locationKey?: "paris" | "orly" | string;

  createdAt?: any;
  status?: ClientRequestStatus | string;

  kbisUrl?: string | null;
  signatureUrl?: string | null;

  documents?: 
    | Array<{
        type: "kbis" | "id" | "rib" | "domicile" | "signature" | "other" | string;
        name?: string;
        url: string;
        contentType?: string;
        uploadedAt?: any;
      }>
    | Record<string, string>; // Support du format Map { kbis: "path", identityCard: "path" }
  documentsMeta?: Record<string, { contentType?: string; mime?: string; [key: string]: any }>;
  documentsUploadMeta?: Record<string, { contentType?: string; mime?: string; [key: string]: any }>;
  documentsVerification?: Record<string, DocumentVerificationReport>;

  // Provisioning
  accessProvisioned?: boolean;
  accessProvisionedAt?: any;
  accessProvisionedReason?: string;
  activationEmailSentAt?: any;
  activationEmailSent?: boolean;
  
  // PDF Jobs & Publish
  pdfJobs?: {
    contractId?: string | null;
    attestationId?: string | null;
  };
  pdfPublish?: {
    contract?: {
      jobId?: string;
      status: string;
      outputUrl?: string;
      fileUrl?: string;
      url?: string;
      storagePath?: string;
      error?: string;
      updatedAt?: any;
    };
    attestation?: {
      jobId?: string;
      status: string;
      outputUrl?: string;
      fileUrl?: string;
      url?: string;
      storagePath?: string;
      error?: string;
      updatedAt?: any;
    };
  };
}

/* =========================
   Helpers
========================= */

function toDateSafe(v: any): Date | null {
  if (!v) return null;
  if (typeof v?.toDate === "function") return v.toDate();
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function requestEmail(r: ClientRequest): string {
  return (r.emailLower || r.email || "").toString().toLowerCase().trim();
}

function requestRep(r: ClientRequest): string {
  const rep = r.representative || [r.firstName, r.lastName].filter(Boolean).join(" ").trim();
  return rep || "—";
}

function requestCreatedAtLabel(r: ClientRequest): string {
  const d = toDateSafe(r.createdAt);
  return d ? d.toLocaleString("fr-FR") : "—";
}

function requestAddressLabel(r: ClientRequest): string {
  const addrId = (r.addressId || "").toString().toLowerCase();
  if (addrId === "paris_12e") return "Paris 12e";
  if (addrId === "orly_ville") return "Orly Ville";

  const k = (r.locationKey || r.addressKey || "").toString().toLowerCase();
  if (k === "paris") return "Paris 12e";
  if (k === "orly") return "Orly Ville";

  return "—";
}

function canAccessValidation(role: UserRole | null) {
  return (
    role === "manager" ||
    role === "manager_paris" ||
    role === "manager_orly" ||
    role === "secretary_paris" ||
    role === "secretary_orly"
  );
}

function isSecretaryValidationRole(role: UserRole | null) {
  return role === "secretary_paris" || role === "secretary_orly";
}

function buildDocsList(r: ClientRequest) {
  const docs: Array<{ type: string; url: string; name?: string; contentType?: string }> = [];
  const uploadMeta = r.documentsUploadMeta ?? {};
  const analysisMeta = r.documentsMeta ?? {};
  const getContentType = (type: string) =>
    uploadMeta[type]?.contentType ||
    uploadMeta[type]?.mime ||
    analysisMeta[type]?.contentType ||
    analysisMeta[type]?.mime;

  // 1. Standard documents[] (Array legacy)
  if (Array.isArray(r.documents)) {
    r.documents.forEach((d) => {
      if (d?.url) docs.push({ type: d.type || "other", url: d.url, name: d.name, contentType: d.contentType || getContentType(d.type) });
    });
  } 
  // 2. Map structure (New format)
  else if (r.documents && typeof r.documents === "object") {
    Object.entries(r.documents as Record<string, string>).forEach(([type, urlOrPath]) => {
      if (urlOrPath && typeof urlOrPath === "string") {
        const normalizedType = type === "identityCard" ? "id" : (type === "proofOfAddress" ? "domicile" : type);
        docs.push({ 
          type: normalizedType, 
          url: urlOrPath,
          name: prettyDocType(type),
          contentType: getContentType(type) || getContentType(normalizedType)
        });
      }
    });
  }

  // 3. Legacy fallback keys
  if (r.kbisUrl && !docs.some((d) => d.type === "kbis" && d.url === r.kbisUrl)) {
    docs.push({ type: "kbis", url: r.kbisUrl, name: "KBIS", contentType: getContentType("kbis") });
  }
  if (r.signatureUrl && !docs.some((d) => d.type === "signature" && d.url === r.signatureUrl)) {
    docs.push({ type: "signature", url: r.signatureUrl, name: "Signature", contentType: getContentType("signature") });
  }

  return docs;
}

function prettyDocType(t: string) {
  const key = (t || "other").toLowerCase();
  if (key === "kbis") return "KBIS";
  if (key === "id") return "Pièce d’identité";
  if (key === "rib") return "RIB";
  if (key === "domicile") return "Justificatif de domicile";
  if (key === "signature") return "Signature";
  return "Document";
}

function isLikelyPdf(url: string, contentType?: string) {
  if (contentType === "application/pdf") return true;
  return decodeURIComponent(url.split("?")[0] || url).toLowerCase().includes(".pdf");
}

function isLikelyImage(url: string, contentType?: string) {
  if (contentType?.startsWith("image/")) return true;
  return /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(decodeURIComponent(url.split("?")[0] || url));
}

function inferContentType(url: string, contentType?: string) {
  if (contentType) return contentType;
  if (isLikelyPdf(url)) return "application/pdf";
  if (isLikelyImage(url)) return "image/*";
  return "";
}

function findDocumentVerification(
  request: ClientRequest,
  docType: string
): DocumentVerificationReport | undefined {
  const map = request.documentsVerification ?? {};
  const aliases: Record<string, string[]> = {
    id: ["identityCard"],
    identityCard: ["id"],
    domicile: ["proofOfAddress"],
    proofOfAddress: ["domicile"],
  };

  const keys = [docType, ...(aliases[docType] ?? [])];
  for (const key of keys) {
    if (map[key]) return map[key];
  }

  return undefined;
}

function verificationStatusLabel(status?: string) {
  const normalized = String(status ?? "").toLowerCase();
  if (normalized === "processing") return "Analyse en cours";
  if (normalized === "passed") return "Pre-verifie";
  if (normalized === "warning") return "A verifier";
  if (normalized === "failed") return "Incoherent";
  if (normalized === "unreadable") return "Illisible";
  if (normalized === "unsupported") return "Non supporte";
  return "Analyse en attente";
}

function verificationStatusClassName(status?: string) {
  const normalized = String(status ?? "").toLowerCase();
  if (normalized === "passed") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (normalized === "warning") return "border-amber-200 bg-amber-50 text-amber-700";
  if (normalized === "failed" || normalized === "unreadable" || normalized === "unsupported") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }
  if (normalized === "processing") return "border-blue-200 bg-blue-50 text-blue-700";
  return "border-slate-200 bg-slate-50 text-slate-500";
}

function DocumentVerificationSummary({
  verification,
}: {
  verification?: DocumentVerificationReport;
}) {
  const status = String(verification?.status ?? "").toLowerCase();
  const isProcessing = status === "processing";
  const confidence =
    typeof verification?.confidence === "number"
      ? Math.round(verification.confidence * 100)
      : null;
  const warning = verification?.warnings?.find(Boolean);
  const summary =
    verification?.summary ||
    verification?.reason ||
    (verification ? "Rapport IA disponible." : "La pre-verification IA se lancera en arriere-plan.");

  return (
    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="outline"
          className={cn(
            "gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
            verificationStatusClassName(verification?.status)
          )}
        >
          {isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
          {verificationStatusLabel(verification?.status)}
        </Badge>
        {confidence !== null ? (
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Score {confidence}%
          </span>
        ) : null}
      </div>
      <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">{summary}</p>
      {warning ? (
        <p className="mt-1 line-clamp-2 text-[11px] font-medium leading-4 text-amber-700">
          Point de vigilance : {warning}
        </p>
      ) : null}
    </div>
  );
}

function DocPreview({
  url,
  contentType,
}: {
  url: string;
  contentType?: string;
}) {
  const { firebaseApp } = useFirebase();
  const [resolvedUrl, setResolvedUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const isStoragePath = url && !url.startsWith("http") && !url.startsWith("data:");

  React.useEffect(() => {
    if (!isStoragePath) {
      setResolvedUrl(url);
      return;
    }

    if (!firebaseApp) return;

    let cancelled = false;
    async function resolve() {
      setLoading(true);
      setError(null);
      try {
        const storage = getStorage(firebaseApp);
        const fileRef = ref(storage, url);
        const downloadUrl = await getDownloadURL(fileRef);
        if (!cancelled) setResolvedUrl(downloadUrl);
      } catch (err: any) {
        console.error("[DocPreview] Resolution failed:", err);
        if (!cancelled) setError("Impossible de charger le document (accès refusé ou inexistant).");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void resolve();
    return () => { cancelled = true; };
  }, [url, isStoragePath, firebaseApp]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border rounded-md bg-muted/20 gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium italic">Récupération sécurisée du document...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border rounded-md bg-destructive/5 text-destructive text-sm flex items-center gap-2">
        <ShieldAlert className="h-4 w-4" />
        {error}
      </div>
    );
  }

  if (!resolvedUrl) return null;

  const resolvedContentType = inferContentType(resolvedUrl, contentType);
  const isImg = isLikelyImage(resolvedUrl, resolvedContentType);
  const isPdf = isLikelyPdf(resolvedUrl, resolvedContentType);

  const openLink = (
    <div className="flex flex-col gap-2 rounded-md border bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-xs text-muted-foreground">
        Apercu securise depuis Firebase Storage.
      </div>
      <Button variant="outline" size="sm" asChild className="h-8 w-full gap-2 sm:w-auto">
        <a href={resolvedUrl} target="_blank" rel="noreferrer">
          Ouvrir le document dans un nouvel onglet <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </Button>
    </div>
  );

  if (isImg) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <div className="space-y-3">
        {openLink}
        <img src={resolvedUrl} alt="" className="w-full rounded-md border bg-white shadow-sm" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {openLink}
      <iframe
        src={resolvedUrl}
        title="Apercu du document"
        loading="lazy"
        className="h-[70vh] min-h-[520px] w-full rounded-md border bg-white shadow-sm"
      />
      {!isPdf ? (
        <p className="text-xs text-muted-foreground">
          Si l'apercu reste vide, utilisez le bouton d'ouverture dans un nouvel onglet.
        </p>
      ) : null}
    </div>
  );
}

/* =========================
   Forms (Approve/Reject)
========================= */

const approveSchema = z.object({
  tier: z.enum(["starter", "pro", "premium"]).default("starter"),
});
type ApproveForm = z.infer<typeof approveSchema>;

const rejectSchema = z.object({
  reason: z.string().min(3, "Motif requis (min 3 caractères).").max(500, "Motif trop long (max 500)."),
});
type RejectForm = z.infer<typeof rejectSchema>;

function PdfStatusCard({ 
  label, 
  data 
}: { 
  label: string; 
  data?: { status: string; outputUrl?: string; fileUrl?: string; url?: string; error?: string; updatedAt?: any } 
}) {
  if (!data) return null;

  const status = (data.status || "").toLowerCase();
  const documentUrl = data.outputUrl || data.fileUrl || data.url;
  
  const getStatusConfig = () => {
    switch (status) {
      case "complete":
      case "success":
        return { label: "Disponible", variant: "success", icon: CheckCircle2 };
      case "processing":
        return { label: "Génération...", variant: "default", icon: Loader2 };
      case "error":
      case "failed":
        return { label: "Échec", variant: "destructive", icon: ShieldAlert };
      default:
        return { label: "En attente", variant: "secondary", icon: FileText };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Card className="hover:bg-muted/5 transition border-dashed shadow-none">
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn(
            "p-2 rounded-full",
            config.variant === "success" ? "bg-green-100 text-green-700" : 
            config.variant === "destructive" ? "bg-red-100 text-red-700" :
            "bg-muted text-muted-foreground"
          )}>
             <Icon className={cn("h-4 w-4", status === "processing" && "animate-spin")} />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">{label}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge 
                variant={config.variant === "success" ? "outline" : (config.variant as any)} 
                className={cn(
                  "text-[10px] px-1.5 h-4 uppercase tracking-wider font-bold",
                  config.variant === "success" && "border-green-300 text-green-700 bg-green-50"
                )}
              >
                {config.label}
              </Badge>
              {data.updatedAt && (
                <span className="text-[10px] text-muted-foreground italic">
                  — {toDateSafe(data.updatedAt)?.toLocaleDateString("fr-FR")}
                </span>
              )}
            </div>
            {data.error && (
              <div className="text-[10px] text-destructive mt-1 font-medium italic truncate max-w-[250px]">
                {data.error}
              </div>
            )}
          </div>
        </div>

        {documentUrl ? (
          <Button variant="outline" size="sm" asChild className="shrink-0 h-8 gap-2 border-primary/20 hover:border-primary/50 text-xs shadow-none">
            <a href={documentUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
              Ouvrir
            </a>
          </Button>
        ) : (
          <Button variant="ghost" size="sm" disabled className="shrink-0 h-8 text-xs italic">
            Patienter
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/* =========================
   Page
========================= */

export default function ValidationRequestDetailPage() {
  const params = useParams<{ id: string }>();
  const requestId = (params?.id || "").toString();

  const router = useRouter();
  const db = useDb();
  const { firebaseApp } = useFirebase();
  const { toast } = useToast();

  const roleState = useCenterAccess();
  const displayRole = (roleState?.displayRole ?? null) as UserRole | null;
  const managedCenterIds = roleState?.managedCenterIds ?? [];
  const isRoleLoading = !!roleState?.isLoading;
  const isSuperAdminView = displayRole === "super_admin";

  const [req, setReq] = React.useState<ClientRequest | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<FirestoreError | Error | null>(null);

  const [approveOpen, setApproveOpen] = React.useState(false);
  const [rejectOpen, setRejectOpen] = React.useState(false);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [activeDoc, setActiveDoc] = React.useState<{ type: string; url: string; name?: string; contentType?: string } | null>(null);

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isGeneratingPdfs, setIsGeneratingPdfs] = React.useState(false);

  const functions = React.useMemo(() => {
    if (!firebaseApp) return null;
    return getFunctions(firebaseApp, "europe-west9");
  }, [firebaseApp]);

  const approveForm = useForm<ApproveForm>({
    resolver: zodResolver(approveSchema),
    defaultValues: { tier: "starter" },
  });

  const rejectForm = useForm<RejectForm>({
    resolver: zodResolver(rejectSchema),
    defaultValues: { reason: "Dossier incomplet" },
  });

  // Subscribe request doc
  React.useEffect(() => {
    let alive = true;

    if (isSuperAdminView) {
      setReq(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Évite les erreurs au logout / role inconnu
    // On utilise actualRole pour l'accès aux données (sécurité réelle)
    if (!db || !requestId || !displayRole || !canAccessValidation(displayRole)) {
      setReq(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const ref = doc(db, "client_requests", requestId);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!alive) return;
        if (!snap.exists()) {
          setReq(null);
          setIsLoading(false);
          setError(new Error("Demande introuvable."));
          return;
        }
        const requestData = snap.data() as ClientRequest;

        if (
          !canAccessCenter(
            displayRole,
            managedCenterIds,
            resolveRecordCenterId(requestData as Record<string, any>)
          )
        ) {
          setReq(null);
          setIsLoading(false);
          setError(new Error("Acces refuse pour ce centre."));
          return;
        }

        setReq({ ...requestData, id: snap.id });
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        if (!alive) return;
        setReq(null);
        setIsLoading(false);
        setError(err);
      }
    );

    return () => {
      alive = false;
      unsub();
    };
  }, [db, requestId, displayRole, managedCenterIds, isSuperAdminView]);

  const docs = React.useMemo(() => (req ? buildDocsList(req) : []), [req]);

  const canManageRequests =
    displayRole === "manager" ||
    displayRole === "manager_paris" ||
    displayRole === "manager_orly";
  const isSecretaryView = isSecretaryValidationRole(displayRole);
  const canRetryProvisioning = canManageRequests;
  const canManagePdfJobs = canManageRequests || isSecretaryView;

  const statusBadgeVariant = (s?: string) => {
    return getSignupStatusVariant(s);
  };

  const openPreview = (d: { type: string; url: string; name?: string; contentType?: string }) => {
    setActiveDoc(d);
    setPreviewOpen(true);
  };

  const doApprove = async (v: ApproveForm) => {
    if (!canManageRequests) {
      toast({ variant: "destructive", title: "Acces refuse", description: "Seul un manager peut approuver ce dossier." });
      return;
    }
    if (!functions) {
      toast({ variant: "destructive", title: "Erreur", description: "Fonctions indisponibles." });
      return;
    }
    if (!req?.id) return;

    setIsSubmitting(true);
    try {
      const fn = httpsCallable(functions, "approveSignup");
      await fn({ requestUid: req.id, tier: v.tier });

      toast({ title: "Demande approuvée", description: "Le client a été créé/activé et la demande validée." });
      setApproveOpen(false);
      approveForm.reset({ tier: "starter" });
    } catch (e: any) {
      console.error("approveSignup error:", e);
      toast({ variant: "destructive", title: "Erreur", description: e?.message || "Impossible d'approuver la demande." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const doReject = async (v: RejectForm) => {
    if (!canManageRequests) {
      toast({ variant: "destructive", title: "Acces refuse", description: "Seul un manager peut rejeter ce dossier." });
      return;
    }
    if (!functions) {
      toast({ variant: "destructive", title: "Erreur", description: "Fonctions indisponibles." });
      return;
    }
    if (!req?.id) return;

    setIsSubmitting(true);
    try {
      const fn = httpsCallable(functions, "rejectSignup");
      await fn({ requestUid: req.id, reason: v.reason });

      toast({ title: "Demande rejetée", description: "Le dossier a été rejeté." });
      setRejectOpen(false);
      rejectForm.reset({ reason: "Dossier incomplet" });
    } catch (e: any) {
      console.error("rejectSignup error:", e);
      toast({ variant: "destructive", title: "Erreur", description: e?.message || "Impossible de rejeter la demande." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const doRetryProvisioning = async () => {
    if (!canRetryProvisioning) {
      toast({ variant: "destructive", title: "Acces refuse", description: "La relance du provisionnement est reservee au manager du centre." });
      return;
    }
    if (!functions) {
      toast({ variant: "destructive", title: "Erreur", description: "Fonctions indisponibles." });
      return;
    }
    if (!req?.id) return;

    setIsSubmitting(true);
    try {
      const fn = httpsCallable(functions, "retryProvisioning");
      const result: any = await fn({ requestUid: req.id });

      if (result.data?.ok) {
        toast({ 
          title: "Provisionnement terminé", 
          description: result.data.accessProvisioned 
            ? "Le compte client a été créé et l'accès configuré." 
            : `Le processus a été relancé mais l'accès reste en attente (${result.data.accessProvisionedReason || "vérifiez les logs"}).` 
        });
      }
    } catch (e: any) {
      console.error("retryProvisioning error:", e);
      toast({ variant: "destructive", title: "Erreur", description: e?.message || "Impossible de relancer le provisionnement." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const doCreatePdfJobs = async (options: { force?: boolean } = {}) => {
    if (!canManagePdfJobs) {
      toast({ variant: "destructive", title: "Acces refuse", description: "Vous ne pouvez pas lancer cette generation." });
      return;
    }
    if (!functions) {
      toast({ variant: "destructive", title: "Erreur", description: "Fonctions indisponibles." });
      return;
    }
    if (!req?.id) return;

    const force = options.force === true;
    setIsGeneratingPdfs(true);
    try {
      const fn = httpsCallable(functions, "createPdfJobs");
      const result: any = await fn({ clientRequestId: req.id, force });

      if (result.data?.ok) {
        toast({ 
          title: force ? "Régénération lancée" : "Génération lancée", 
          description: force
            ? "Une nouvelle version du contrat et de l'attestation a été mise en file d'attente."
            : "La création du contrat et de l'attestation a été mise en file d'attente."
        });
      }
    } catch (e: any) {
      console.error("createPdfJobs error:", e);
      toast({ variant: "destructive", title: "Erreur", description: e?.message || "Impossible de lancer la génération des PDF." });
    } finally {
      setIsGeneratingPdfs(false);
    }
  };

  // UI states
  if (isRoleLoading || isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isSuperAdminView) {
    return (
      <OperationalAccessNotice
        title="Detail de validation reserve aux centres"
        description="L'instruction d'un dossier client appartient aux equipes operationnelles du centre concerne. Le super admin supervise la performance et la gouvernance du reseau."
      />
    );
  }

  // On utilise actualRole pour le rendu conditionnel de l'accès à la page
  if (!displayRole || !canAccessValidation(displayRole)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Accès refusé</CardTitle>
          <CardDescription>Vous n&apos;avez pas la permission d&apos;accéder à ce dossier.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild variant="outline">
            <Link href="/admin/validation">Retour</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (error || !req) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dossier introuvable</CardTitle>
          <CardDescription>{error?.message || "La demande n'existe pas ou n'est plus accessible."}</CardDescription>
        </CardHeader>
        <CardFooter className="gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/validation">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
          <Button variant="secondary" onClick={() => router.refresh()}>
            Recharger
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Button asChild variant="outline" className="w-fit">
          <Link href="/admin/validation">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux dossiers
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          <Badge variant={statusBadgeVariant(req.status)}>
            Statut : {getSignupStatusLabel(req.status)}
          </Badge>
          <Badge variant="outline">Centre : {requestAddressLabel(req)}</Badge>
        </div>
      </div>

      {/* Infos demande */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {req.companyName || "Demande de domiciliation"}
          </CardTitle>
          <CardDescription>
            Créée le {requestCreatedAtLabel(req)} — Contact : {requestEmail(req) || "—"}
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-6">
          {isSecretaryView ? (
            <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">
              <div className="flex items-start gap-3">
                <ShieldAlert className="mt-0.5 h-4 w-4 text-sky-600" />
                <p>
                  Mode secretariat actif : vous pouvez controler les pieces, verifier le statut du dossier et lancer les documents contractuels.
                  L'approbation finale, le rejet et la relance du provisionnement restent reserves au manager du centre.
                </p>
              </div>
            </div>
          ) : null}

          {/* Infos principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoLine label="Entreprise" value={req.companyName || "—"} />
            <InfoLine label="SIRET" value={req.siret || "—"} />
            <InfoLine label="Représentant" value={requestRep(req)} />
            <InfoLine label="Téléphone" value={req.phone || "—"} />
            <InfoLine label="Email" value={requestEmail(req) || "—"} />
            <InfoLine label="Centre" value={requestAddressLabel(req)} />
          </div>

          {req.status === SIGNUP_REQUEST_STATUS.APPROVED && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-base font-semibold">Compte & accès</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-md border p-4 bg-muted/20">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-full",
                        req.accessProvisioned ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                      )}>
                        {req.accessProvisioned ? <ShieldCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
                      </div>
                      <div>
                        <div className="text-sm font-medium">
                          {req.accessProvisioned ? "Accès client provisionné" : "Erreur de provisionnement"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {req.accessProvisionedAt ? `Le ${toDateSafe(req.accessProvisionedAt)?.toLocaleString("fr-FR")}` : "Action requise"}
                        </div>
                      </div>
                    </div>
                    {req.status === SIGNUP_REQUEST_STATUS.APPROVED && req.accessProvisioned === false && (
                      <div className="mt-3 space-y-3">
                        {req.accessProvisionedReason && (
                          <div className="text-xs p-3 bg-red-50 text-red-800 rounded-md border border-red-100 shadow-sm">
                            <div className="flex items-center gap-1.5 font-bold mb-1 text-red-900 uppercase tracking-tight">
                              <ShieldAlert className="h-3.5 w-3.5" />
                              Échec du provisionnement
                            </div>
                            <p className="leading-relaxed opacity-90">{req.accessProvisionedReason}</p>
                          </div>
                        )}
                        {canRetryProvisioning ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full h-9 text-xs gap-2 border-orange-200 bg-orange-50/50 hover:bg-orange-100 hover:text-orange-800 hover:border-orange-300 transition-all font-semibold shadow-sm"
                            onClick={doRetryProvisioning}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                            Relancer le provisionnement manuel
                          </Button>
                        ) : (
                          <div className="text-xs p-3 bg-amber-50 text-amber-900 rounded-md border border-amber-100">
                            Le provisionnement doit etre relance par le manager du centre.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="rounded-md border p-4 bg-muted/20">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-full",
                        req.activationEmailSent ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      )}>
                        {req.activationEmailSent ? <MailCheck className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
                      </div>
                      <div>
                        <div className="text-sm font-medium">
                          {req.activationEmailSent ? "Email d'activation envoyé" : "Email non envoyé"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {req.activationEmailSentAt ? `Le ${toDateSafe(req.activationEmailSentAt)?.toLocaleString("fr-FR")}` : "En attente"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Docs */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold">Documents envoyés</h3>
                <p className="text-sm text-muted-foreground">
                  Clique sur un document pour le prévisualiser (PDF / image).
                </p>
              </div>
              <Badge variant="secondary">{docs.length}</Badge>
            </div>

            {docs.length === 0 ? (
              <div className="text-sm text-muted-foreground border rounded-md p-4">
                Aucun document n&apos;est disponible sur cette demande.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {docs.map((d, idx) => (
                  <Card key={`${d.type}-${idx}`} className="hover:bg-muted/30 transition">
                    <CardContent className="p-4 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{d.name || prettyDocType(d.type)}</div>
                        <div className="text-xs text-muted-foreground">
                          {prettyDocType(d.type)}
                          {d.contentType ? ` · ${d.contentType}` : ""}
                        </div>
                        <DocumentVerificationSummary verification={findDocumentVerification(req, d.type)} />
                      </div>

                      <Button variant="outline" size="sm" onClick={() => openPreview(d)} className="shrink-0">
                        Voir
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Documents contractuels (générés) */}
          {(req.pdfPublish?.contract || req.pdfPublish?.attestation || req.pdfJobs?.contractId || req.pdfJobs?.attestationId) ? (
            <>
              <Separator />
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Documents contractuels (générés)
                  </h3>
                  {canManagePdfJobs ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[10px] uppercase tracking-wider font-bold text-muted-foreground hover:text-primary"
                          disabled={isGeneratingPdfs}
                        >
                          {isGeneratingPdfs ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <RotateCcw className="h-3 w-3 mr-1" />}
                          Régénérer
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-background text-foreground">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Régénérer les documents contractuels ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action crée une nouvelle version du contrat et de l'attestation. Les liens actuels seront remplacés lorsque les nouveaux PDF seront prêts.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => void doCreatePdfJobs({ force: true })}>
                            Confirmer la régénération
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : null}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <PdfStatusCard 
                    label="Contrat de domiciliation" 
                    data={req.pdfPublish?.contract || (req.pdfJobs?.contractId ? { status: 'queued' } : undefined)} 
                  />
                  <PdfStatusCard 
                    label="Attestation de domiciliation" 
                    data={req.pdfPublish?.attestation || (req.pdfJobs?.attestationId ? { status: 'queued' } : undefined)} 
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <Separator />
              <div className="py-2">
                <div className="flex flex-col items-center justify-center p-6 border border-dashed rounded-lg bg-muted/30 text-center gap-3">
                  <div className="p-3 rounded-full bg-background border shadow-sm text-muted-foreground/30">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Documents contractuels manquants</h4>
                    <p className="text-xs text-muted-foreground max-w-[280px] mt-1">
                      Le contrat et l'attestation n'ont pas encore été générés pour ce dossier.
                    </p>
                  </div>
                  {canManagePdfJobs ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-1 h-9 px-4 gap-2 border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all font-medium"
                      onClick={() => void doCreatePdfJobs({ force: false })}
                      disabled={isGeneratingPdfs}
                    >
                      {isGeneratingPdfs ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                      {isGeneratingPdfs ? "Génération en cours..." : "Générer le contrat & l'attestation"}
                    </Button>
                  ) : null}
                </div>
              </div>
            </>
          )}
        </CardContent>

        <CardFooter className={cn("flex flex-col sm:flex-row gap-2 sm:justify-end", !canManageRequests && "justify-start")}>
          {!canManageRequests ? (
            <div className="text-sm text-muted-foreground">
              Vous pouvez preparer le dossier, verifier les pieces et gerer les documents contractuels, mais l&apos;approbation, le rejet et le provisionnement restent reserves aux managers du centre.
            </div>
          ) : (
            <>
              {/* Only show actions if pending */}
              {isSignupReadyForValidation(req.status) ? (
                <>
                  {/* Reject */}
                  <Dialog
                    open={rejectOpen}
                    onOpenChange={(open) => {
                      setRejectOpen(open);
                      if (!open) rejectForm.reset({ reason: "Dossier incomplet" });
                    }}
                  >
                    <Button variant="destructive" onClick={() => setRejectOpen(true)} disabled={isSubmitting}>
                      <BadgeX className="mr-2 h-4 w-4" />
                      Rejeter
                    </Button>

                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Rejeter la demande</DialogTitle>
                        <DialogDescription>Indique un motif (enregistré et potentiellement communiqué).</DialogDescription>
                      </DialogHeader>

                      <Form {...rejectForm}>
                        <form id="reject-form" className="space-y-4" onSubmit={rejectForm.handleSubmit(doReject)}>
                          <FormField
                            name="reason"
                            control={rejectForm.control}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Motif</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Ex : KBIS illisible, pièce manquante..." />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </form>
                      </Form>

                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setRejectOpen(false)} disabled={isSubmitting}>
                          Annuler
                        </Button>
                        <Button type="submit" form="reject-form" variant="destructive" disabled={isSubmitting}>
                          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Confirmer le rejet
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Approve */}
                  <Dialog
                    open={approveOpen}
                    onOpenChange={(open) => {
                      setApproveOpen(open);
                      if (!open) approveForm.reset({ tier: "starter" });
                    }}
                  >
                    <Button onClick={() => setApproveOpen(true)} disabled={isSubmitting}>
                      <BadgeCheck className="mr-2 h-4 w-4" />
                      Approuver
                    </Button>

                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Approuver la demande</DialogTitle>
                        <DialogDescription>
                          Choisis l&apos;offre (tier) à appliquer au client lors de la création/activation.
                        </DialogDescription>
                      </DialogHeader>

                      <Form {...approveForm}>
                        <form id="approve-form" className="space-y-4" onSubmit={approveForm.handleSubmit(doApprove)}>
                          <FormField
                            name="tier"
                            control={approveForm.control}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Offre (tier)</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Sélectionner une offre" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="starter">Starter</SelectItem>
                                    <SelectItem value="pro">Pro</SelectItem>
                                    <SelectItem value="premium">Premium</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </form>
                      </Form>

                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setApproveOpen(false)} disabled={isSubmitting}>
                          Annuler
                        </Button>
                        <Button type="submit" form="approve-form" disabled={isSubmitting}>
                          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Confirmer l&apos;approbation
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground italic border rounded-md px-3 py-1 bg-muted/20">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Dossier déjà traité ({getSignupStatusLabel(req.status)})
                </div>
              )}
            </>
          )}
        </CardFooter>
      </Card>

      {/* Preview dialog */}
      <Dialog
        open={previewOpen}
        onOpenChange={(open) => {
          setPreviewOpen(open);
          if (!open) setActiveDoc(null);
        }}
      >
        <DialogContent className="sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Prévisualisation</DialogTitle>
            <DialogDescription>
              {activeDoc ? `${prettyDocType(activeDoc.type)} — ${activeDoc.name || ""}` : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {activeDoc ? (
              <>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{prettyDocType(activeDoc.type)}</Badge>
                </div>
                <DocPreview url={activeDoc.url} contentType={activeDoc.contentType} />
              </>
            ) : (
              <div className="text-sm text-muted-foreground">Aucun document sélectionné.</div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPreviewOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* =========================
   Small UI
========================= */

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium break-words">{value}</div>
    </div>
  );
}
