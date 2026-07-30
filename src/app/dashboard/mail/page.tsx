// src/app/dashboard/mail/page.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Download,
  Eye,
  FileWarning,
  Sparkles,
  Copy,
  Loader2,
  Bot,
  Inbox,
  Archive,
  MailOpen,
  Star,
  AlertTriangle,
  Search,
  Calendar as CalendarIcon,
  FileText,
  RotateCcw,
  CheckCircle2,
  Info,
  ChevronLeft,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth, useDb, useFirebase, useStorage } from "@/firebase";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { httpsCallable, getFunctions } from "firebase/functions";
import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  updateDoc,
  writeBatch,
  where,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { getStorageRelativePath } from "@/firebase/storage-utils";

import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

/* =============================================================================
 * Types
 * ============================================================================= */

type Category =
  | "Facture"
  | "Social"
  | "Amende"
  | "Contrat"
  | "Publicité"
  | "Banque"
  | "Juridique"
  | "Personnel"
  | "Autre";
type Status = "Nouveau" | "Lu" | "Urgent" | "Archivé" | "Erreur d'analyse" | "Analyse en cours";

type AnalyzeMailOutput = {
  sender: string;
  summary: string;
  category: Category;
  actionRequired: boolean;
  extractedData?: { amountDue?: number; dueDate?: string };
  error?: string;
};

interface Mail {
  id: string;
  uid: string;
  scannedAt: { seconds: number; nanoseconds: number };
  fileName: string;

  // ✅ recommandé: stocker le chemin réel Storage
  storagePath?: string;

  status: Status;
  analysis: AnalyzeMailOutput | null;
  documentUrl?: string;
}

/* =============================================================================
 * UI constants
 * ============================================================================= */

const MAILS_PER_PAGE = 20;

const categoryPill: Record<Category, string> = {
  Facture: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-900/60",
  Social: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-200 dark:border-cyan-900/60",
  Amende: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-900/60",
  Contrat: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900/60",
  Publicité:
    "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-200 dark:border-slate-800/60",
  Banque: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-900/60",
  Juridique: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-900/60",
  Personnel: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-200 dark:border-violet-900/60",
  Autre: "bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-900/40 dark:text-zinc-200 dark:border-zinc-800/60",
};

function statusDot(status: Status) {
  if (status === "Nouveau") return "bg-primary";
  if (status === "Urgent") return "bg-amber-500";
  if (status === "Analyse en cours") return "bg-sky-500";
  if (status === "Erreur d'analyse") return "bg-rose-500";
  return "bg-transparent";
}

function statusBadgeClass(status: Status) {
  switch (status) {
    case "Urgent":
      return "border-amber-300 bg-amber-100 text-amber-800 shadow-sm";
    case "Nouveau":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "Lu":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "Archivé":
      return "border-slate-200 bg-slate-100 text-slate-600";
    case "Analyse en cours":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "Erreur d'analyse":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function labelForStatus(status: Status) {
  switch (status) {
    case "Nouveau":
      return "Nouveau";
    case "Lu":
      return "Lu";
    case "Urgent":
      return "Urgent";
    case "Archivé":
      return "Archivé";
    case "Analyse en cours":
      return "Analyse";
    case "Erreur d'analyse":
      return "Erreur";
    default:
      return status;
  }
}

function formatMailDate(ts?: { seconds: number }) {
  if (!ts?.seconds) return "";
  const d = new Date(ts.seconds * 1000);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

function getMailTitle(mail: Mail) {
  return mail.analysis?.sender || (mail.status === "Analyse en cours" ? "Analyse en cours…" : "Courrier");
}

function isPdfMail(mail: Mail) {
  return mail.documentUrl?.toLowerCase().includes(".pdf") || mail.fileName.toLowerCase().endsWith(".pdf");
}

function isImageMail(mail: Mail) {
  const fileName = mail.fileName.toLowerCase();
  const documentUrl = mail.documentUrl?.toLowerCase() || "";
  return /\.(png|jpe?g|webp|gif|bmp|avif)(\?|$)/.test(fileName) || /\.(png|jpe?g|webp|gif|bmp|avif)(\?|$)/.test(documentUrl);
}

/* =============================================================================
 * Preview components
 * ============================================================================= */

const PDFPreview = ({ documentUrl, fileName }: { documentUrl: string; fileName: string }) => {
  return (
    <div className="h-96 rounded-xl border bg-muted/20 flex items-center justify-center">
      <div className="text-center px-6">
        <div className="mx-auto mb-3 h-12 w-12 rounded-2xl border bg-background flex items-center justify-center shadow-sm">
          <FileText className="h-6 w-6" />
        </div>
        <div className="font-semibold">Document PDF</div>
        <div className="text-sm text-muted-foreground mt-1 line-clamp-1">{fileName}</div>

        <div className="mt-5 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={documentUrl} target="_blank" rel="noopener noreferrer">
              <Eye className="mr-2 h-4 w-4" />
              Ouvrir
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={documentUrl} download={fileName}>
              <Download className="mr-2 h-4 w-4" />
              Télécharger
            </a>
          </Button>
        </div>

        <div className="mt-3 text-xs text-muted-foreground flex items-center justify-center gap-2">
          <Info className="h-3.5 w-3.5" />
          Prévisualisation PDF désactivée (sécurité).
        </div>
      </div>
    </div>
  );
};

const DocumentPreview = ({ mail }: { mail: Mail }) => {
  if (!mail.documentUrl) {
    return (
      <div className="h-96 rounded-xl border bg-muted/20 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          Chargement du document…
        </div>
      </div>
    );
  }

  if (isPdfMail(mail)) return <PDFPreview documentUrl={mail.documentUrl} fileName={mail.fileName} />;

  return (
    <div className="h-96 rounded-xl border bg-muted/20 relative overflow-hidden">
      <Image
        src={mail.documentUrl}
        alt="Aperçu du document"
        fill
        sizes="50vw"
        className="object-contain"
        priority={false}
      />
    </div>
  );
};

function DocumentAccessCard({
  mail,
  onPreview,
  onDownload,
}: {
  mail: Mail;
  onPreview: () => void;
  onDownload: () => void;
}) {
  const canPreview = Boolean(mail.documentUrl);
  const isImage = isImageMail(mail);

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border bg-slate-50">
          {isImage && mail.documentUrl ? (
            <Image
              src={mail.documentUrl}
              alt="Aperçu du courrier"
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <FileText className="h-7 w-7 text-slate-500" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Document original</div>
          <div className="mt-1 truncate font-semibold text-slate-950">{mail.fileName}</div>
          <div className="mt-1 text-sm text-slate-500">
            {isPdfMail(mail) ? "PDF disponible" : isImage ? "Image numérisée" : "Fichier disponible"}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" className="rounded-xl" disabled={!canPreview} onClick={onPreview}>
              <Eye className="mr-2 h-4 w-4" />
              Aperçu
            </Button>
            {mail.documentUrl ? (
              <Button size="sm" variant="outline" className="rounded-xl" asChild>
                <a href={mail.documentUrl} target="_blank" rel="noopener noreferrer">
                  <Eye className="mr-2 h-4 w-4" />
                  Ouvrir
                </a>
              </Button>
            ) : (
              <Button size="sm" variant="outline" className="rounded-xl" disabled>
                <Eye className="mr-2 h-4 w-4" />
                Ouvrir
              </Button>
            )}
            <Button size="sm" className="rounded-xl" disabled={!mail.documentUrl} onClick={onDownload}>
              <Download className="mr-2 h-4 w-4" />
              Télécharger
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =============================================================================
 * Data hooks
 * ============================================================================= */

function useMailData() {
  const [mails, setMails] = useState<Mail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const auth = useAuth();
  const db = useDb();
  const storage = useStorage();
  const { toast } = useToast();

  const currentUser = auth?.currentUser ?? null;

  const normalizeStatus = useCallback((status?: string): Status => {
    switch (String(status ?? "").trim()) {
      case "received":
        return "Nouveau";
      case "processed":
        return "Lu";
      case "archived":
        return "Archivé";
      case "Analyse en cours":
        return "Analyse en cours";
      case "Erreur d'analyse":
        return "Erreur d'analyse";
      case "Lu":
        return "Lu";
      case "Urgent":
        return "Urgent";
      case "Archivé":
        return "Archivé";
      case "Nouveau":
        return "Nouveau";
      default:
        return "Nouveau";
    }
  }, []);

  const resolveDocUrl = useCallback(
    async (mail: Mail) => {
      if (!storage) return undefined;

      const storagePath =
        mail.storagePath || `mails/${mail.uid}/${mail.id}/${mail.fileName}`;

      try {
        const effectivePath = getStorageRelativePath(storagePath);
        return await getDownloadURL(ref(storage, effectivePath));
      } catch (e) {
        console.warn("[mail] getDownloadURL failed:", {
          mailId: mail.id,
          storagePath,
        });
        return undefined;
      }
    },
    [storage]
  );

  const fetchPage = useCallback(
    async (mode: "initial" | "more") => {
      if (!currentUser || !db) return;

      if (mode === "initial") setIsLoading(true);

      try {
        const baseQuery =
          mode === "initial"
            ? query(
                collection(db, "mails"),
                where("ownerUid", "==", currentUser.uid),
                orderBy("receivedAt", "desc"),
                limit(MAILS_PER_PAGE)
              )
            : query(
                collection(db, "mails"),
                where("ownerUid", "==", currentUser.uid),
                orderBy("receivedAt", "desc"),
                startAfter(lastVisible!),
                limit(MAILS_PER_PAGE)
              );

        const snap = await getDocs(baseQuery);

        const rows = await Promise.all(
          snap.docs.map(async (d) => {
            const raw = { id: d.id, ...d.data() } as any;

            const normalized: Mail = {
              id: raw.id,
              uid: raw.uid,
              scannedAt: raw.scannedAt ?? raw.receivedAt ?? raw.createdAt,
              fileName: raw.fileName ?? "Document",
              storagePath: raw.storagePath,
              status: normalizeStatus(raw.status),
              analysis: raw.analysis ?? null,
              documentUrl: undefined,
            };

            const url = await resolveDocUrl(normalized);
            return { ...normalized, documentUrl: url };
          })
        );

        setMails((prev) => (mode === "initial" ? rows : [...prev, ...rows]));
        setLastVisible(snap.docs[snap.docs.length - 1] || null);
        setHasMore(snap.docs.length === MAILS_PER_PAGE);
      } catch (e) {
        console.error("[mail] fetch failed:", e);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les courriers.",
        });
      } finally {
        if (mode === "initial") setIsLoading(false);
      }
    },
    [currentUser, db, lastVisible, normalizeStatus, resolveDocUrl, toast]
  );

  useEffect(() => {
    fetchPage("initial");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.uid]);

  const refresh = useCallback(() => fetchPage("initial"), [fetchPage]);

  const loadMore = useCallback(async () => {
    if (!hasMore || !lastVisible) return;
    await fetchPage("more");
  }, [fetchPage, hasMore, lastVisible]);

  const denormalizeStatus = useCallback((status: Status): string => {
    switch (status) {
      case "Nouveau":
        return "received";
      case "Lu":
        return "processed";
      case "Urgent":
        return "Urgent";
      case "Archivé":
        return "archived";
      case "Analyse en cours":
        return "Analyse en cours";
      case "Erreur d'analyse":
        return "Erreur d'analyse";
      default:
        return status;
    }
  }, []);

  const updateMailStatus = useCallback(
    async (mailId: string, status: Status) => {
      if (!db || !currentUser) throw new Error("DB/Auth indisponible");
      const mailRef = doc(db, "mails", mailId);
      await updateDoc(mailRef, { status: denormalizeStatus(status) });
      setMails((prev) => prev.map((mail) => (mail.id === mailId ? { ...mail, status } : mail)));
    },
    [db, currentUser, denormalizeStatus]
  );

  const bulkUpdateMails = useCallback(
    async (mailIds: string[], status: Status) => {
      if (!db || !currentUser || mailIds.length === 0) return;

      const batch = writeBatch(db);

      mailIds.forEach((id) => {
        const refDoc = doc(db, "mails", id);
        batch.update(refDoc, { status: denormalizeStatus(status) });
      });

      await batch.commit();
      setMails((prev) =>
        prev.map((mail) => (mailIds.includes(mail.id) ? { ...mail, status } : mail))
      );
    },
    [db, currentUser, denormalizeStatus]
  );

  return {
    mails,
    isLoading,
    hasMore,
    refresh,
    loadMore,
    updateMailStatus,
    bulkUpdateMails,
  };
}

function useMailFilters(mails: Mail[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const filtered = useMemo(() => {
    let list = mails;

    // status
    if (statusFilter !== "all") list = list.filter((m) => m.status === statusFilter);
    else list = list.filter((m) => m.status !== "Archivé");

    // date
    if (dateRange?.from) {
      const from = new Date(dateRange.from);
      from.setHours(0, 0, 0, 0);
      list = list.filter((m) => new Date(m.scannedAt.seconds * 1000) >= from);
    }
    if (dateRange?.to) {
      const to = new Date(dateRange.to);
      to.setHours(23, 59, 59, 999);
      list = list.filter((m) => new Date(m.scannedAt.seconds * 1000) <= to);
    }

    // search
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      list = list.filter((m) => {
        const s = m.analysis?.sender?.toLowerCase() ?? "";
        const sum = m.analysis?.summary?.toLowerCase() ?? "";
        const cat = m.analysis?.category?.toLowerCase() ?? "";
        const fn = m.fileName?.toLowerCase() ?? "";
        return s.includes(term) || sum.includes(term) || cat.includes(term) || fn.includes(term);
      });
    }

    return list;
  }, [mails, searchTerm, statusFilter, dateRange]);

  return {
    filteredMails: filtered,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    dateRange,
    setDateRange,
  };
}

function useMailSelection() {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const clear = useCallback(() => setSelected([]), []);

  const toggleAll = useCallback((page: Mail[]) => {
    const ids = page.map((m) => m.id);
    const all = page.length > 0 && page.every((m) => selected.includes(m.id));
    setSelected((prev) => (all ? prev.filter((x) => !ids.includes(x)) : Array.from(new Set([...prev, ...ids]))));
  }, [selected]);

  const allSelectedOnPage = useCallback((page: Mail[]) => {
    if (page.length === 0) return false;
    return page.every((m) => selected.includes(m.id));
  }, [selected]);

  return { selectedMails: selected, toggle, toggleAll, allSelectedOnPage, clear };
}

/* =============================================================================
 * AI Reply (callable)
 * ============================================================================= */

function useAIReply() {
  const [isLoading, setIsLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const { toast } = useToast();
  const { firebaseApp } = useFirebase();

  const generateReply = useCallback(
    async (mailSummary: string, userRequest: string) => {
      if (!userRequest.trim() || !firebaseApp) return;

      setIsLoading(true);
      setDraft("");

      try {
        // ✅ mets la même région que tes functions (chez toi: europe-west9)
        const functions = getFunctions(firebaseApp, "europe-west9");
        const fn = httpsCallable(functions, "generateReply");

        const res = await fn({
          mailSummary,
          userRequest,
          context: "Répondre à un courrier professionnel",
        });

        setDraft(((res.data as any)?.draft ?? "").trim());
      } catch (e) {
        console.error("[mail] generateReply failed:", e);
        toast({
          variant: "destructive",
          title: "Erreur de génération",
          description: "Impossible de générer une réponse. Réessayez.",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [firebaseApp, toast]
  );

  return { generateReply, isLoading, draft, reset: () => setDraft("") };
}

/* =============================================================================
 * View components
 * ============================================================================= */

function MailAnalysisStatus({ mail }: { mail: Mail }) {
  if (mail.status === "Erreur d'analyse" && mail.analysis?.error) {
    return (
      <Alert variant="destructive" className="rounded-xl">
        <FileWarning className="h-4 w-4" />
        <AlertTitle>Erreur d’analyse</AlertTitle>
        <AlertDescription>{mail.analysis.error}</AlertDescription>
      </Alert>
    );
  }

  if (mail.status === "Analyse en cours") {
    return (
      <Alert className="rounded-xl">
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertTitle>Analyse en cours</AlertTitle>
        <AlertDescription>Le document est en traitement. Les détails apparaîtront bientôt.</AlertDescription>
      </Alert>
    );
  }

  if (!mail.analysis) return null;

  return (
    <Alert className="rounded-xl">
      <Sparkles className="h-4 w-4" />
      <AlertTitle className="font-semibold">Analyse IA</AlertTitle>
      <AlertDescription className="space-y-2 mt-2">
        <div className="text-sm">
          <span className="font-medium">Résumé :</span> {mail.analysis.summary}
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={cn("border", categoryPill[mail.analysis.category])}>
            {mail.analysis.category}
          </Badge>

          {mail.analysis.extractedData?.amountDue != null && (
            <Badge variant="secondary">Montant: {mail.analysis.extractedData.amountDue.toFixed(2)} €</Badge>
          )}
          {mail.analysis.extractedData?.dueDate && (
            <Badge variant="secondary">Échéance: {mail.analysis.extractedData.dueDate}</Badge>
          )}
        </div>

        {mail.analysis.actionRequired ? (
          <div className="flex items-center gap-2 text-amber-600 font-semibold">
            <AlertTriangle className="h-4 w-4" />
            Action requise
          </div>
        ) : (
          <div className="flex items-center gap-2 text-emerald-600 font-semibold">
            <CheckCircle2 className="h-4 w-4" />
            Aucune action immédiate
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}

function AIWritingAssistant({
  mail,
  isOpen,
  onOpenChange,
}: {
  mail: Mail;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [userRequest, setUserRequest] = useState("");
  const [tone, setTone] = useState("professionnel");
  const [action, setAction] = useState("répondre");
  const { generateReply, isLoading, draft, reset } = useAIReply();
  const { toast } = useToast();

  const quickActions = [
    { title: "Demander un délai", prompt: "Demander poliment un délai de 15 jours supplémentaires." },
    { title: "Contester", prompt: "Contester poliment ce courrier en expliquant clairement les raisons." },
    { title: "Demander des précisions", prompt: "Demander des précisions complémentaires sur ce courrier." },
    { title: "Accuser réception", prompt: "Rédiger un accusé de réception professionnel." },
  ];

  const onGenerate = async () => {
    const full = `${userRequest} — Ton: ${tone} — Action: ${action}`;
    await generateReply(mail.analysis?.summary || "", full);
  };

  const onCopy = () => {
    if (!draft) return;
    navigator.clipboard.writeText(draft);
    toast({ title: "Copié", description: "Brouillon copié dans le presse-papiers." });
  };

  const close = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      reset();
      setUserRequest("");
      setTone("professionnel");
      setAction("répondre");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="sm:max-w-3xl h-[82vh] flex flex-col rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Assistant de rédaction
          </DialogTitle>
          <DialogDescription>Génère un brouillon propre et exploitable à partir du résumé IA.</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          <div className="rounded-xl border bg-muted/10 p-3">
            <div className="text-xs text-muted-foreground mb-2">Actions rapides</div>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((qa) => (
                <Button
                  key={qa.title}
                  variant="outline"
                  size="sm"
                  className="justify-start h-auto py-2 text-xs"
                  onClick={() => setUserRequest(qa.prompt)}
                >
                  {qa.title}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="text-sm font-medium">Ton</div>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professionnel">Professionnel</SelectItem>
                  <SelectItem value="formel">Formel</SelectItem>
                  <SelectItem value="amical">Amical</SelectItem>
                  <SelectItem value="ferme">Ferme</SelectItem>
                  <SelectItem value="persuasif">Persuasif</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Objectif</div>
              <Select value={action} onValueChange={setAction}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="répondre">Répondre</SelectItem>
                  <SelectItem value="demander_info">Demander des informations</SelectItem>
                  <SelectItem value="prolonger_délai">Demander un délai</SelectItem>
                  <SelectItem value="contester">Contester</SelectItem>
                  <SelectItem value="confirmer">Accuser réception</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Votre consigne</div>
            <Textarea
              value={userRequest}
              onChange={(e) => setUserRequest(e.target.value)}
              placeholder="Ex: Réponds en demandant un échéancier, et propose un paiement en 2 fois."
              className="min-h-[110px] rounded-xl"
            />
          </div>

          <Button onClick={onGenerate} disabled={isLoading || !userRequest.trim()} className="w-full rounded-xl">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Génération…
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Générer le brouillon
              </>
            )}
          </Button>

          {(isLoading || draft) && (
            <div className="rounded-xl border bg-muted/10 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Brouillon</div>
                <Button variant="outline" size="sm" onClick={onCopy} disabled={!draft}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copier
                </Button>
              </div>

              {isLoading ? (
                <div className="space-y-2">
                  <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-full bg-muted rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
                </div>
              ) : (
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{draft}</div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MailDetailView({ mail, isDialog }: { mail: Mail; isDialog?: boolean }) {
  const [showAI, setShowAI] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const title = getMailTitle(mail);
  const receivedDate = new Date(mail.scannedAt.seconds * 1000).toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const download = () => {
    if (!mail.documentUrl) return;
    const a = document.createElement("a");
    a.href = mail.documentUrl;
    a.download = mail.fileName;
    a.click();
  };

  return (
    <>
      <div className="flex h-full flex-col bg-slate-50/70">
        <div className="border-b bg-white/90 px-5 py-4 backdrop-blur supports-[backdrop-filter]:bg-white/70">
          {isDialog ? (
            <DialogHeader className="p-0 text-left">
              <DialogTitle className="text-lg text-slate-950">{title}</DialogTitle>
              <DialogDescription>Reçu le {receivedDate}</DialogDescription>
            </DialogHeader>
          ) : (
            <div className="space-y-1">
              <div className="text-lg font-semibold text-slate-950">{title}</div>
              <div className="text-sm text-slate-500">Reçu le {receivedDate}</div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="mx-auto max-w-3xl space-y-4">
            <section className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-3">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Courrier reçu</div>
                    <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">{title}</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className={cn("rounded-full border", statusBadgeClass(mail.status))}>
                      {labelForStatus(mail.status)}
                    </Badge>
                    {mail.analysis?.category ? (
                      <Badge variant="outline" className={cn("rounded-full border", categoryPill[mail.analysis.category])}>
                        {mail.analysis.category}
                      </Badge>
                    ) : null}
                    {mail.analysis?.actionRequired ? (
                      <Badge variant="outline" className="rounded-full border-amber-200 bg-amber-50 text-amber-700">
                        Action requise
                      </Badge>
                    ) : null}
                  </div>
                </div>

                <Button className="rounded-xl" onClick={() => setShowAI(true)} disabled={!mail.analysis?.summary}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Aide rédaction
                </Button>
              </div>
            </section>

            <MailAnalysisStatus mail={mail} />

            <DocumentAccessCard mail={mail} onPreview={() => setShowPreview(true)} onDownload={download} />
          </div>
        </div>
      </div>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-h-[92vh] max-w-4xl overflow-hidden rounded-2xl p-0">
          <DialogHeader className="border-b px-5 py-4 text-left">
            <DialogTitle>Aperçu du document</DialogTitle>
            <DialogDescription className="truncate">{mail.fileName}</DialogDescription>
          </DialogHeader>
          <div className="p-5">
            <DocumentPreview mail={mail} />
          </div>
        </DialogContent>
      </Dialog>

      <AIWritingAssistant mail={mail} isOpen={showAI} onOpenChange={setShowAI} />
    </>
  );
}

function MailDetailDialog({
  mail,
  isOpen,
  onOpenChange,
}: {
  mail: Mail | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!mail) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="h-[92vh] max-w-3xl p-0 rounded-2xl overflow-hidden">
        <MailDetailView mail={mail} isDialog />
      </DialogContent>
    </Dialog>
  );
}

function MailList({
  mails,
  isLoading,
  hasMore,
  selectedMail,
  selectedMails,
  searchTerm,
  statusFilter,
  dateRange,
  allSelectedOnPage,
  onSelectMail,
  onToggleMail,
  onToggleAll,
  onBulkAction,
  onSetMailStatus,
  onSearchChange,
  onStatusFilterChange,
  onDateRangeChange,
  onLoadMore,
  onRefresh,
}: {
  mails: Mail[];
  isLoading: boolean;
  hasMore: boolean;
  selectedMail: Mail | null;
  selectedMails: string[];
  searchTerm: string;
  statusFilter: string;
  dateRange: DateRange | undefined;
  allSelectedOnPage: boolean;
  onSelectMail: (mail: Mail) => void;
  onToggleMail: (mailId: string) => void;
  onToggleAll: () => void;
  onBulkAction: (action: "archive" | "mark_read" | "mark_unread" | "mark_urgent") => void;
  onSetMailStatus: (mailId: string, status: Status) => Promise<void>;
  onSearchChange: (term: string) => void;
  onStatusFilterChange: (filter: string) => void;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onLoadMore: () => void;
  onRefresh: () => void;
}) {
  const [loadingMore, setLoadingMore] = useState(false);

  const loadMore = async () => {
    setLoadingMore(true);
    await onLoadMore();
    setLoadingMore(false);
  };

  return (
    <div className="border-r flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-5 py-4 border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">Courriers</div>
            <div className="text-sm text-muted-foreground">Boîte de réception sécurisée.</div>
          </div>

          <Button variant="outline" size="sm" className="rounded-xl" onClick={onRefresh} disabled={isLoading}>
            <RotateCcw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Actualiser
          </Button>
        </div>

        {/* Filters row */}
        <div className="mt-4 grid grid-cols-1 gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un courrier..."
              className="pl-9 rounded-xl"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full rounded-xl justify-start text-left font-normal sm:w-auto",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "d MMM", { locale: fr })} –{" "}
                        {format(dateRange.to, "d MMM", { locale: fr })}
                      </>
                    ) : (
                      format(dateRange.from, "d MMM yyyy", { locale: fr })
                    )
                  ) : (
                    <span>Période</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={onDateRangeChange}
                  numberOfMonths={1}
                  locale={fr}
                />
              </PopoverContent>
            </Popover>

            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-full rounded-xl sm:w-[190px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Non archivés</SelectItem>
                <SelectItem value="Nouveau">Nouveau</SelectItem>
                <SelectItem value="Lu">Lu</SelectItem>
                <SelectItem value="Urgent">Urgent</SelectItem>
                <SelectItem value="Analyse en cours">Analyse en cours</SelectItem>
                <SelectItem value="Erreur d'analyse">Erreur d'analyse</SelectItem>
                <SelectItem value="Archivé">Archivé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Bulk actions */}
      <div className="px-5 py-3 border-b flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Checkbox checked={allSelectedOnPage} onCheckedChange={onToggleAll} aria-label="Sélectionner tout" />
          <div className="text-sm text-muted-foreground">
            {selectedMails.length > 0 ? (
              <span>
                <span className="font-medium text-foreground">{selectedMails.length}</span> sélectionné(s)
              </span>
            ) : (
              "Aucune sélection"
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-xl" disabled={selectedMails.length === 0}>
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onBulkAction("mark_read")}>
              <MailOpen className="mr-2 h-4 w-4" />
              Marquer comme lu
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onBulkAction("mark_unread")}>
              <Inbox className="mr-2 h-4 w-4" />
              Marquer non lu
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onBulkAction("mark_urgent")}>
              <Star className="mr-2 h-4 w-4" />
              Marquer comme urgent
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onBulkAction("archive")}>
              <Archive className="mr-2 h-4 w-4" />
              Archiver
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : mails.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground px-6">
            <div className="h-14 w-14 rounded-2xl border bg-muted/20 flex items-center justify-center mb-4">
              <Inbox className="h-7 w-7" />
            </div>
            <div className="font-semibold">Boîte vide</div>
            <div className="text-sm">Aucun courrier ne correspond à vos filtres.</div>
          </div>
        ) : (
          <>
            <div className="divide-y">
              {mails.map((mail) => {
                const isSelected = selectedMail?.id === mail.id;
                const isChecked = selectedMails.includes(mail.id);
                const dot = statusDot(mail.status);

                return (
                  <div
                    key={mail.id}
                    className={cn(
                      "px-5 py-3 cursor-pointer hover:bg-muted/40 transition-colors",
                      isSelected && "bg-muted/60",
                      isChecked && "bg-primary/5"
                    )}
                    onClick={() => onSelectMail(mail)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="pt-1 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Checkbox checked={isChecked} onCheckedChange={() => onToggleMail(mail.id)} />
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            await onSetMailStatus(mail.id, mail.status === "Urgent" ? "Lu" : "Urgent");
                          }}
                          aria-label={mail.status === "Urgent" ? "Retirer l'urgence" : "Marquer urgent"}
                          className="rounded-md p-1 hover:bg-muted"
                        >
                          <Star
                            className={cn(
                              "h-4 w-4 text-muted-foreground",
                              mail.status === "Urgent" && "text-amber-500 fill-amber-500"
                            )}
                          />
                        </button>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={cn("h-2 w-2 rounded-full", dot)} />
                              <div className="font-semibold truncate">
                                {mail.analysis?.sender || (mail.status === "Analyse en cours" ? "Analyse en cours…" : "Courrier")}
                              </div>

                              <Badge variant="outline" className={cn("text-xs rounded-full border", statusBadgeClass(mail.status))}>
                                {labelForStatus(mail.status)}
                              </Badge>
                            </div>

                            <div className="text-sm text-muted-foreground truncate mt-1">
                              {mail.analysis?.summary || "—"}
                            </div>

                            {mail.analysis?.category ? (
                              <div className="mt-2">
                                <Badge
                                  variant="outline"
                                  className={cn("text-xs rounded-full border", categoryPill[mail.analysis.category])}
                                >
                                  {mail.analysis.category}
                                </Badge>
                              </div>
                            ) : null}
                          </div>

                          <div className="text-xs text-muted-foreground shrink-0 pt-1">
                            {formatMailDate(mail.scannedAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {hasMore && (
              <div className="p-5 border-t flex justify-center">
                <Button variant="outline" className="rounded-xl" onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Chargement…
                    </>
                  ) : (
                    "Charger plus"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* =============================================================================
 * Page
 * ============================================================================= */

export default function MailPage() {
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const [selectedMail, setSelectedMail] = useState<Mail | null>(null);

  const { mails, isLoading, hasMore, refresh, loadMore, updateMailStatus, bulkUpdateMails } = useMailData();
  const { filteredMails, searchTerm, setSearchTerm, statusFilter, setStatusFilter, dateRange, setDateRange } =
    useMailFilters(mails);
  const { selectedMails, toggle, toggleAll, allSelectedOnPage, clear } = useMailSelection();

  const setMailStatus = useCallback(
    async (mailId: string, status: Status) => {
      await updateMailStatus(mailId, status);
      setSelectedMail((current) => (current?.id === mailId ? { ...current, status } : current));
    },
    [updateMailStatus]
  );

  const selectMail = useCallback(
    async (mail: Mail) => {
      const nextMail = mail.status === "Nouveau" || mail.status === "Urgent" ? { ...mail, status: "Lu" as Status } : mail;
      setSelectedMail(nextMail);

      // auto: marquer lu
      if (mail.status === "Nouveau" || mail.status === "Urgent") {
        try {
          await setMailStatus(mail.id, "Lu");
        } catch (e) {
          console.warn("[mail] update status failed:", e);
          setSelectedMail(mail);
        }
      }
    },
    [setMailStatus]
  );

  const bulkAction = useCallback(
    async (action: "archive" | "mark_read" | "mark_unread" | "mark_urgent") => {
      const map = {
        archive: "Archivé",
        mark_read: "Lu",
        mark_unread: "Nouveau",
        mark_urgent: "Urgent",
      } as const;
      const feedback = {
        archive: { title: "Courriers archivés", description: "Les courriers sélectionnés sont masqués de la boîte active." },
        mark_read: { title: "Courriers marqués comme lus", description: "Le statut lu est maintenant visible dans la liste." },
        mark_unread: { title: "Courriers remis en non lu", description: "Ils repassent en nouveau dans votre boîte de réception." },
        mark_urgent: { title: "Courriers marqués urgents", description: "Le badge urgence est affiché immédiatement." },
      } as const;

      try {
        await bulkUpdateMails(selectedMails, map[action]);
        setSelectedMail((current) =>
          current && selectedMails.includes(current.id) ? { ...current, status: map[action] } : current
        );
        toast({
          title: feedback[action].title,
          description: `${selectedMails.length} courrier(s) mis à jour. ${feedback[action].description}`,
        });
        clear();
      } catch (e) {
        toast({
          variant: "destructive",
          title: "Action non appliquée",
          description: "Les courriers n'ont pas été modifiés. Vérifiez votre connexion puis réessayez.",
        });
      }
    },
    [bulkUpdateMails, clear, selectedMails, toast]
  );

  const allOnPage = allSelectedOnPage(filteredMails);

  if (isMobile) {
    return (
      <>
        <MailDetailDialog
          mail={selectedMail}
          isOpen={!!selectedMail}
          onOpenChange={(open) => !open && setSelectedMail(null)}
        />

        <MailList
          mails={filteredMails}
          isLoading={isLoading}
          hasMore={hasMore}
          selectedMail={selectedMail}
          selectedMails={selectedMails}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          dateRange={dateRange}
          allSelectedOnPage={allOnPage}
          onSelectMail={selectMail}
          onToggleMail={toggle}
          onToggleAll={() => toggleAll(filteredMails)}
          onBulkAction={bulkAction}
          onSetMailStatus={setMailStatus}
          onSearchChange={setSearchTerm}
          onStatusFilterChange={setStatusFilter}
          onDateRangeChange={setDateRange}
          onLoadMore={loadMore}
          onRefresh={refresh}
        />
      </>
    );
  }

  return (
    <div className="grid h-[calc(100vh-8rem)] grid-cols-[minmax(520px,_1fr)_minmax(360px,_480px)] overflow-hidden rounded-2xl border bg-background">
      <MailList
        mails={filteredMails}
        isLoading={isLoading}
        hasMore={hasMore}
        selectedMail={selectedMail}
        selectedMails={selectedMails}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        dateRange={dateRange}
        allSelectedOnPage={allOnPage}
        onSelectMail={selectMail}
        onToggleMail={toggle}
        onToggleAll={() => toggleAll(filteredMails)}
        onBulkAction={bulkAction}
        onSetMailStatus={setMailStatus}
        onSearchChange={setSearchTerm}
        onStatusFilterChange={setStatusFilter}
        onDateRangeChange={setDateRange}
        onLoadMore={loadMore}
        onRefresh={refresh}
      />

      <div className="h-full">
        {selectedMail ? (
          <MailDetailView mail={selectedMail} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground px-8">
            <div className="h-16 w-16 rounded-2xl border bg-muted/20 flex items-center justify-center mb-4">
              <Inbox className="h-8 w-8" />
            </div>
            <div className="font-semibold text-foreground">Sélectionnez un courrier</div>
            <div className="text-sm">Choisissez un élément dans la liste pour voir les détails.</div>
          </div>
        )}
      </div>
    </div>
  );
}
