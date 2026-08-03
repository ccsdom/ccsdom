"use client";

import React, { useState, useEffect, useMemo } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  where,
  Timestamp,
  doc,
  updateDoc
} from "firebase/firestore";
import { useDb, useFirebase } from "@/firebase";
import { useCenterAccess } from "@/hooks/use-center-access";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Mail as MailIcon, 
  ExternalLink,
  Loader2,
  Sparkles,
  ArrowUpDown,
  FileText,
  ShieldAlert,
  ChevronRight,
  ClipboardCopy,
  Send,
  SlidersHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { OperationalAccessNotice } from "@/components/admin/operational-access-notice";
import { legacyCenterKey } from "@/lib/access-control";
import { SIGNUP_REQUEST_STATUS } from "@/lib/constants/signup";
import { getSignupStatusLabel, getSignupStatusVariant } from "@/features/signup/status";
import { SubscriptionPlanBadge } from "@/components/subscription-plan-badge";

/* =========================
   Types & Config
 ========================= */

interface Mail {
  id: string;
  uid?: string;
  ownerUid?: string;
  clientName?: string;
  companyName?: string;
  clientId?: string;
  clientUid?: string;
  requestId?: string;
  clientRequestId?: string;
  fileName: string;
  receivedAt: any;
  status: string;
  centerKey?: string;
  planId?: string;
  summary?: string;
  analysis?: any;
  aiAnalysis?: any;
  clientNotification?: {
    status?: string;
    urgent?: boolean;
    emailTo?: string;
    subject?: string;
  };
}

interface FollowUpRequest {
  id: string;
  companyName?: string;
  name?: string;
  email?: string;
  status?: string;
  addressKey?: string;
  updatedAt?: any;
  createdAt?: any;
  documentsRequiredCompleted?: boolean;
  documents?: Record<string, string> | Array<{ type?: string; url?: string }>;
  documentsMeta?: Record<string, { validated?: boolean; error?: string; mime?: string }>;
  paymentStatus?: string;
  followUp?: {
    lastPreparedAt?: any;
    lastPreparedBy?: string;
    lastPreparedByRole?: string;
    lastMessage?: string;
    lastReason?: string;
    lastStatus?: string;
    lastSentAt?: any;
    lastSentBy?: string;
    lastEmailTo?: string;
    preparedCount?: number;
    sentCount?: number;
    history?: Array<{
      preparedAt?: any;
      sentAt?: any;
      preparedBy?: string | null;
      role?: string | null;
      status?: string;
      requestStatus?: string | null;
      reason?: string;
      subject?: string;
      message?: string;
      to?: string;
    }>;
  };
}

type FollowUpStage = "all" | "new" | "prepared" | "sent" | "stale";

const REQUIRED_DOCUMENTS = [
  { key: "kbis", label: "Extrait Kbis" },
  { key: "identityCard", label: "Pièce d'identité" },
  { key: "proofOfAddress", label: "Justificatif de domicile" },
];

const CATEGORY_STYLES: Record<string, string> = {
  "Facture": "bg-blue-100/10 text-blue-400 border-blue-500/20",
  "Juridique": "bg-purple-100/10 text-purple-400 border-purple-500/20",
  "Banque": "bg-emerald-100/10 text-emerald-400 border-emerald-500/20",
  "Social": "bg-cyan-100/10 text-cyan-400 border-cyan-500/20",
  "Amende": "bg-red-100/10 text-red-400 border-red-500/20",
  "Contrat": "bg-amber-100/10 text-amber-400 border-amber-500/20",
  "Personnel": "bg-pink-100/10 text-pink-400 border-pink-500/20",
  "Publicité": "bg-slate-100/10 text-slate-400 border-slate-500/20",
  "Autre": "bg-zinc-100/10 text-zinc-400 border-zinc-500/20",
};

const CENTER_FILTER_OPTIONS = [
  { value: "paris_12e", label: "Paris 12e" },
  { value: "orly_ville", label: "Orly Ville" },
] as const;

const FOLLOW_UP_STALE_AFTER_MS = 1000 * 60 * 60 * 24 * 3;

const FOLLOW_UP_STAGE_META: Record<Exclude<FollowUpStage, "all">, {
  label: string;
  description: string;
  badgeClassName: string;
  panelClassName: string;
}> = {
  new: {
    label: "À relancer",
    description: "Aucune relance encore tracée.",
    badgeClassName: "border-amber-200 bg-amber-50 text-amber-950",
    panelClassName: "border-amber-200 bg-amber-50 text-amber-950",
  },
  prepared: {
    label: "Préparée",
    description: "Message préparé, envoi à finaliser.",
    badgeClassName: "border-blue-200 bg-blue-50 text-blue-950",
    panelClassName: "border-blue-200 bg-blue-50 text-blue-950",
  },
  sent: {
    label: "Envoyée",
    description: "Relance envoyée récemment.",
    badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-950",
    panelClassName: "border-emerald-200 bg-emerald-50 text-emerald-950",
  },
  stale: {
    label: "À refaire",
    description: "Dernière action ancienne, suivi à reprendre.",
    badgeClassName: "border-red-200 bg-red-50 text-red-950",
    panelClassName: "border-red-200 bg-red-50 text-red-950",
  },
};

import { Suspense } from "react";

function getRequestDisplayName(request: FollowUpRequest) {
  return request.companyName || request.name || request.email || "Dossier client";
}

function getDateValue(value: any) {
  if (!value) return 0;
  const date = typeof value?.toDate === "function" ? value.toDate() : new Date(value);
  const timestamp = date.getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function formatDateTimeShort(value: any) {
  if (!value) return "—";
  const date = typeof value?.toDate === "function" ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function normalizeMailStatus(status?: string) {
  return String(status ?? "").trim().toLowerCase();
}

function isUrgentMail(mail: Mail) {
  const urgency = String(mail.aiAnalysis?.urgency ?? mail.analysis?.urgency ?? "").toLowerCase();
  const status = normalizeMailStatus(mail.status);
  return urgency === "high" || status === "urgent";
}

function getMailUrgencyScore(mail: Mail) {
  let score = 0;
  if (isUrgentMail(mail)) score += 2;
  if (
    mail.aiAnalysis?.actionRequired ||
    mail.analysis?.actionRequired ||
    mail.aiAnalysis?.needsAction ||
    mail.analysis?.needsAction
  ) {
    score += 1;
  }
  return score;
}

function getCenterDisplayLabel(centerKey?: string) {
  return CENTER_FILTER_OPTIONS.find((option) => option.value === centerKey)?.label ?? "Centre";
}

function firstNonEmptyString(...values: Array<unknown>) {
  for (const value of values) {
    const normalized = String(value ?? "").trim();
    if (normalized) return normalized;
  }
  return "";
}

function getMailActionRequired(mail: Mail) {
  return Boolean(
    mail.aiAnalysis?.actionRequired ||
    mail.analysis?.actionRequired ||
    mail.aiAnalysis?.needsAction ||
    mail.analysis?.needsAction
  );
}

function getNotificationBadgeMeta(status?: string) {
  switch (String(status ?? "").trim().toLowerCase()) {
    case "queued":
      return {
        label: "Email client préparé",
        className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      };
    case "failed":
      return {
        label: "Notification en erreur",
        className: "border-red-200 bg-red-50 text-red-700",
      };
    case "skipped":
      return {
        label: "Notification ignorée",
        className: "border-amber-200 bg-amber-50 text-amber-700",
      };
    default:
      return {
        label: "Notification en attente",
        className: "border-slate-200 bg-slate-50 text-slate-500",
      };
  }
}

function getRequestFollowUpNote(request: FollowUpRequest) {
  const missingDocs = getMissingDocumentLabels(request);
  if (missingDocs.length > 0) {
    return `Pièces manquantes : ${missingDocs.join(", ")}.`;
  }

  const invalidDocs = getInvalidDocumentLabels(request);
  if (invalidDocs.length > 0) {
    return `Pièces à vérifier : ${invalidDocs.join(", ")}.`;
  }

  const status = String(request.status ?? "").toLowerCase();
  if (status === SIGNUP_REQUEST_STATUS.DRAFT) {
    return "Dossier encore en brouillon, à relancer pour obtenir les pièces.";
  }
  if (status === SIGNUP_REQUEST_STATUS.DOCS_READY) {
    return "Pièces reçues mais dossier à vérifier avant validation manager.";
  }
  if (status === SIGNUP_REQUEST_STATUS.DOCUMENTS_PARTIAL) {
    return "Des documents ont été envoyés, un contrôle humain reste nécessaire.";
  }
  if (status === SIGNUP_REQUEST_STATUS.PAYMENT_PENDING) {
    return "Paiement ou formalité en attente avant passage à l'étape suivante.";
  }

  return "Dossier à suivre par le secrétariat avant transmission ou relance.";
}

function hasUploadedDocument(request: FollowUpRequest, key: string) {
  if (Array.isArray(request.documents)) {
    return request.documents.some((document) => {
      const type = String(document?.type ?? "").toLowerCase();
      return Boolean(document?.url) && (type === key.toLowerCase() || type === key);
    });
  }

  if (request.documents && typeof request.documents === "object") {
    return Boolean((request.documents as Record<string, string>)[key]);
  }

  return false;
}

function getMissingDocumentLabels(request: FollowUpRequest) {
  return REQUIRED_DOCUMENTS
    .filter((document) => !hasUploadedDocument(request, document.key))
    .map((document) => document.label);
}

function getInvalidDocumentLabels(request: FollowUpRequest) {
  const meta = request.documentsMeta ?? {};

  return REQUIRED_DOCUMENTS
    .filter((document) => {
      const docMeta = meta[document.key];
      return docMeta && (docMeta.validated === false || Boolean(docMeta.error));
    })
    .map((document) => document.label);
}

function getFollowUpReason(request: FollowUpRequest) {
  const missingDocs = getMissingDocumentLabels(request);
  if (missingDocs.length > 0) {
    return {
      label: "Pièces manquantes",
      message: `Il manque encore les pièces suivantes : ${missingDocs.join(", ")}.`,
      details: missingDocs,
    };
  }

  const invalidDocs = getInvalidDocumentLabels(request);
  if (invalidDocs.length > 0) {
    return {
      label: "Pièces à vérifier",
      message: `Certaines pièces doivent être vérifiées ou remplacées : ${invalidDocs.join(", ")}.`,
      details: invalidDocs,
    };
  }

  const status = String(request.status ?? "").toLowerCase();
  if (status === SIGNUP_REQUEST_STATUS.PAYMENT_PENDING || request.paymentStatus === "pending") {
    return {
      label: "Paiement en attente",
      message: "Le paiement ou une étape de validation reste en attente.",
      details: ["Paiement ou validation"],
    };
  }

  if (status === SIGNUP_REQUEST_STATUS.DRAFT) {
    return {
      label: "Dossier non finalisé",
      message: "Votre inscription n'est pas encore finalisée dans l'espace client.",
      details: ["Formulaire à finaliser"],
    };
  }

  return {
    label: "Vérification requise",
    message: "Le dossier nécessite encore une vérification avant transmission au manager du centre.",
    details: ["Contrôle secrétariat"],
  };
}

function buildFollowUpMessage(request: FollowUpRequest) {
  const companyName = request.companyName || request.name || "votre société";
  const status = getSignupStatusLabel(request.status).toLowerCase();
  const reason = getFollowUpReason(request);

  return [
    "Bonjour,",
    "",
    `Nous revenons vers vous concernant votre dossier de domiciliation pour ${companyName}.`,
    `À ce stade, votre dossier est indiqué comme "${status}".`,
    reason.message,
    "",
    "Merci de nous transmettre les éléments manquants ou de vérifier les documents déjà déposés depuis votre espace client.",
    "",
    "Bien cordialement,",
    "L'équipe CCS DOM",
  ].join("\n");
}

function getFollowUpStage(request: FollowUpRequest): Exclude<FollowUpStage, "all"> {
  const followUp = request.followUp;
  const lastStatus = String(followUp?.lastStatus ?? "").toLowerCase();
  const lastSentAt = getDateValue(followUp?.lastSentAt);
  const lastPreparedAt = getDateValue(followUp?.lastPreparedAt);
  const lastActionAt = Math.max(lastSentAt, lastPreparedAt);

  if (lastActionAt > 0 && Date.now() - lastActionAt > FOLLOW_UP_STALE_AFTER_MS) {
    return "stale";
  }

  if (lastStatus === "sent" || lastSentAt > 0) {
    return "sent";
  }

  if (lastStatus === "prepared" || lastPreparedAt > 0) {
    return "prepared";
  }

  return "new";
}

function getFollowUpStageMeta(stage: Exclude<FollowUpStage, "all">) {
  return FOLLOW_UP_STAGE_META[stage];
}

function getFollowUpLastActionLabel(request: FollowUpRequest) {
  const followUp = request.followUp;
  const lastStatus = String(followUp?.lastStatus ?? "").toLowerCase();
  const sentAt = followUp?.lastSentAt;
  const preparedAt = followUp?.lastPreparedAt;

  if (lastStatus === "sent" || sentAt) {
    const recipient = followUp?.lastEmailTo ? ` à ${followUp.lastEmailTo}` : "";
    return `Envoyée le ${formatDateTimeShort(sentAt || preparedAt)}${recipient}.`;
  }

  if (preparedAt) {
    return `Préparée le ${formatDateTimeShort(preparedAt)}, en attente d'envoi ou de traitement manuel.`;
  }

  return "Aucune relance tracée pour ce dossier.";
}

function getFollowUpHistoryStatus(
  entry: NonNullable<NonNullable<FollowUpRequest["followUp"]>["history"]>[number]
) {
  return String(entry.status ?? "").toLowerCase() === "sent" ? "sent" : "prepared";
}

function matchesFollowUpSearch(request: FollowUpRequest, term: string) {
  const normalizedTerm = term.trim().toLowerCase();
  if (!normalizedTerm) return true;

  return [
    request.companyName,
    request.name,
    request.email,
    request.status,
    request.followUp?.lastReason,
    request.followUp?.lastEmailTo,
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(normalizedTerm));
}

function AdminMailManagerContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams?.get("searchTerm") || "";

  const [mails, setMails] = useState<Mail[]>([]);
  const [followUpRequests, setFollowUpRequests] = useState<FollowUpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [centerFilter, setCenterFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [followUpStageFilter, setFollowUpStageFilter] = useState<FollowUpStage>("all");
  const [sortBy, setSortBy] = useState<"date" | "urgency">("date");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [followUpDialogOpen, setFollowUpDialogOpen] = useState(false);
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUpRequest | null>(null);
  const [followUpMessage, setFollowUpMessage] = useState("");
  const [isPreparingFollowUp, setIsPreparingFollowUp] = useState(false);
  const [isSendingFollowUp, setIsSendingFollowUp] = useState(false);

  const db = useDb();
  const { firebaseApp } = useFirebase();
  const { displayRole, managedCenterIds } = useCenterAccess();
  const isSuperAdminView = displayRole === "super_admin";
  const isSecretaryView =
    displayRole === "secretary_paris" || displayRole === "secretary_orly";
  const { toast } = useToast();
  const managedCenterKeySignature = managedCenterIds.join("|");
  const scopedCenterKeys = useMemo(() => managedCenterIds.slice(0, 10), [managedCenterKeySignature]);
  const centerFilterOptions = useMemo(() => {
    return CENTER_FILTER_OPTIONS.filter((option) => scopedCenterKeys.includes(option.value));
  }, [scopedCenterKeys]);
  const selectedCenterFilter = centerFilterOptions.length === 1 ? centerFilterOptions[0].value : centerFilter;

  useEffect(() => {
    if (isSuperAdminView) {
      setCenterFilter("all");
      return;
    }

    if (centerFilterOptions.length === 1) {
      const onlyCenter = centerFilterOptions[0].value;
      if (centerFilter !== onlyCenter) {
        setCenterFilter(onlyCenter);
      }
      return;
    }

    const isAllowedCenter = centerFilterOptions.some((option) => option.value === centerFilter);
    if (centerFilter !== "all" && !isAllowedCenter) {
      setCenterFilter("all");
    }
  }, [centerFilter, centerFilterOptions, isSuperAdminView]);

  useEffect(() => {
    if (isSuperAdminView) {
      setMails([]);
      setLoading(false);
      return;
    }

    if (!db || !displayRole) return;

    setLoading(true);

    if (scopedCenterKeys.length === 0) {
      setMails([]);
      setLoading(false);
      return;
    }

    let q = query(
      collection(db, "mails"),
      orderBy("receivedAt", "desc"),
      limit(100)
    );

    // Restrictions par rôle manager
    if (scopedCenterKeys.length === 1) {
      q = query(q, where("centerKey", "==", scopedCenterKeys[0]));
    } else if (scopedCenterKeys.length > 1) {
      q = query(q, where("centerKey", "in", scopedCenterKeys));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Mail));
      setMails(docs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching mails:", error);
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les courriers."
      });
    });

    return () => unsubscribe();
  }, [db, displayRole, scopedCenterKeys, toast, isSuperAdminView]);

  useEffect(() => {
    if (isSuperAdminView) {
      setFollowUpRequests([]);
      setRequestsLoading(false);
      return;
    }

    if (!db || !displayRole) return;

    setRequestsLoading(true);

    const scopedAddressKeys = managedCenterIds
      .map((centerId) => legacyCenterKey(centerId))
      .filter((centerKey): centerKey is "paris" | "orly" => Boolean(centerKey))
      .slice(0, 10);

    if (scopedAddressKeys.length === 0) {
      setFollowUpRequests([]);
      setRequestsLoading(false);
      return;
    }

    let requestsQuery = query(
      collection(db, "client_requests"),
      orderBy("updatedAt", "desc"),
      limit(30)
    );

    if (scopedAddressKeys.length === 1) {
      requestsQuery = query(requestsQuery, where("addressKey", "==", scopedAddressKeys[0]));
    } else if (scopedAddressKeys.length > 1) {
      requestsQuery = query(requestsQuery, where("addressKey", "in", scopedAddressKeys));
    }

    const unsubscribe = onSnapshot(
      requestsQuery,
      (snapshot) => {
        const nextRequests = snapshot.docs
          .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as FollowUpRequest))
          .filter((request) => {
            const status = String(request.status ?? "").toLowerCase();
            if (
              status === SIGNUP_REQUEST_STATUS.APPROVED ||
              status === SIGNUP_REQUEST_STATUS.REJECTED ||
              status === SIGNUP_REQUEST_STATUS.CONVERTED
            ) {
              return false;
            }

            return request.documentsRequiredCompleted !== true;
          });

        setFollowUpRequests(nextRequests);
        setRequestsLoading(false);
      },
      (error) => {
        console.error("Error fetching follow-up requests:", error);
        setRequestsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [db, displayRole, isSuperAdminView, managedCenterKeySignature]);

  useEffect(() => {
    if (!loading && !requestsLoading) return;

    const timeout = window.setTimeout(() => {
      setLoading(false);
      setRequestsLoading(false);
    }, 7000);

    return () => window.clearTimeout(timeout);
  }, [loading, requestsLoading]);
  const { urgentMails, regularMails } = useMemo(() => {
    const scopedCenterSet = new Set(scopedCenterKeys);

    const filtered = mails.filter(m => {
      const matchesSearch = 
        (m.clientName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.companyName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.summary || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.fileName || "").toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesScope = isSuperAdminView || scopedCenterSet.has(String(m.centerKey ?? ""));
      const matchesCenter = selectedCenterFilter === "all" || m.centerKey === selectedCenterFilter;
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "urgent"
            ? isUrgentMail(m)
            : normalizeMailStatus(m.status) === statusFilter;

      return matchesScope && matchesSearch && matchesCenter && matchesStatus;
    });

    const sorted = [...filtered].sort((left, right) => {
      if (sortBy === "urgency") {
        const scoreDiff = getMailUrgencyScore(right) - getMailUrgencyScore(left);
        if (scoreDiff !== 0) return scoreDiff;
      }

      return getDateValue(right.receivedAt) - getDateValue(left.receivedAt);
    });

    const urgent = sorted.filter((mail) => isUrgentMail(mail));
    const regular = sorted.filter((mail) => !isUrgentMail(mail));

    return { 
        urgentMails: urgent, 
        regularMails: regular 
    };
  }, [mails, searchTerm, scopedCenterKeys, selectedCenterFilter, statusFilter, sortBy, isSuperAdminView]);

  const courierKpis = useMemo(() => {
    const received = mails.filter((mail) => normalizeMailStatus(mail.status) === "received").length;
    const processed = mails.filter((mail) => normalizeMailStatus(mail.status) === "processed").length;
    const urgent = mails.filter((mail) => isUrgentMail(mail)).length;

    return {
      received,
      processed,
      urgent,
      relances: followUpRequests.length,
    };
  }, [followUpRequests.length, mails]);

  const followUpStats = useMemo(() => {
    const stats = {
      total: followUpRequests.length,
      new: 0,
      prepared: 0,
      sent: 0,
      stale: 0,
    };

    followUpRequests.forEach((request) => {
      stats[getFollowUpStage(request)] += 1;
    });

    return stats;
  }, [followUpRequests]);

  const priorityFollowUps = useMemo(() => {
    const stagePriority: Record<Exclude<FollowUpStage, "all">, number> = {
      stale: 0,
      new: 1,
      prepared: 2,
      sent: 3,
    };

    return followUpRequests
      .filter((request) => {
        const stage = getFollowUpStage(request);
        const matchesStage = followUpStageFilter === "all" || stage === followUpStageFilter;
        return matchesStage && matchesFollowUpSearch(request, searchTerm);
      })
      .sort((left, right) => {
        const stageDiff = stagePriority[getFollowUpStage(left)] - stagePriority[getFollowUpStage(right)];
        if (stageDiff !== 0) return stageDiff;

        return getDateValue(right.updatedAt || right.createdAt) - getDateValue(left.updatedAt || left.createdAt);
      });
  }, [followUpRequests, followUpStageFilter, searchTerm]);

  const updateStatus = async (mailId: string, newStatus: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "mails", mailId), {
        status: newStatus,
        updatedAt: Timestamp.now()
      });
      toast({ title: "Statut mis à jour" });
    } catch (e) {
      toast({ variant: "destructive", title: "Erreur lors de la mise à jour" });
    }
  };

  const openFollowUpDialog = (request: FollowUpRequest) => {
    setSelectedFollowUp(request);
    setFollowUpMessage(buildFollowUpMessage(request));
    setFollowUpDialogOpen(true);
  };

  const copyFollowUpMessage = async () => {
    try {
      await navigator.clipboard.writeText(followUpMessage);
      toast({
        title: "Message copié",
        description: "La relance est prête à être collée dans un email.",
      });
    } catch (error) {
      console.error("Unable to copy follow-up message:", error);
      toast({
        variant: "destructive",
        title: "Copie impossible",
        description: "Sélectionne le texte manuellement puis copie-le.",
      });
    }
  };

  const markFollowUpPrepared = async () => {
    if (!firebaseApp || !selectedFollowUp) return;

    setIsPreparingFollowUp(true);
    try {
      const functions = getFunctions(firebaseApp, "europe-west9");
      const prepareFollowUp = httpsCallable(functions, "prepareClientFollowUp");
      const reason = getFollowUpReason(selectedFollowUp);

      await prepareFollowUp({
        requestUid: selectedFollowUp.id,
        message: followUpMessage,
        reason: reason.label,
      });

      toast({
        title: "Relance préparée",
        description: "Le suivi a été enregistré sur le dossier client.",
      });
      setFollowUpDialogOpen(false);
    } catch (error: any) {
      console.error("Unable to mark follow-up as prepared:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error?.message || "Impossible d’enregistrer la relance.",
      });
    } finally {
      setIsPreparingFollowUp(false);
    }
  };

  const sendFollowUpEmail = async () => {
    if (!firebaseApp || !selectedFollowUp) return;

    setIsSendingFollowUp(true);
    try {
      const functions = getFunctions(firebaseApp, "europe-west9");
      const sendEmail = httpsCallable(functions, "sendClientFollowUpEmail");
      const reason = getFollowUpReason(selectedFollowUp);

      await sendEmail({
        requestUid: selectedFollowUp.id,
        message: followUpMessage,
        reason: reason.label,
      });

      toast({
        title: "Relance envoyée",
        description: "L’email a été placé dans la file d’envoi et l’historique a été mis à jour.",
      });
      setFollowUpDialogOpen(false);
    } catch (error: any) {
      console.error("Unable to send follow-up email:", error);
      toast({
        variant: "destructive",
        title: "Envoi impossible",
        description: error?.message || "La relance n’a pas pu être envoyée.",
      });
    } finally {
      setIsSendingFollowUp(false);
    }
  };

  const formatDate = (ts: any) => {
    if (!ts) return "—";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }).format(d);
  };

  if (isSuperAdminView) {
    return (
      <OperationalAccessNotice
        title="Gestion courrier réservée aux centres"
        description="Le courrier entrant est un flux opérationnel. Le super admin supervise le réseau et les indicateurs, sans traiter les courriers client au quotidien."
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5 overflow-x-hidden px-3 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-2 text-slate-950 sm:px-4 md:space-y-8 md:pb-20">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center md:gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-1"
        >
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            {isSecretaryView ? "Courrier & relances" : "Gestion des courriers"}
          </h1>
          <p className="flex items-center gap-2 text-sm leading-6 text-slate-600 sm:text-base">
            {isSecretaryView
              ? "Poste de production secrétaire pour trier, relancer et suivre les dossiers"
              : "Suivi et classification intelligente par IA"}
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex w-full items-center gap-3 sm:w-auto"
        >
          <Button asChild className="h-11 w-full rounded-2xl bg-primary font-bold shadow-sm hover:bg-primary/90 sm:w-auto">
            <Link href="/admin/scan">
              <MailIcon className="mr-2 h-4 w-4" />
              Nouveau Scan
            </Link>
          </Button>
        </motion.div>
      </div>

      {/* Barre de Filtres Elite */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:gap-4">
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Rechercher un client, un résumé, un fichier..."
                className="h-11 rounded-2xl border-slate-200 bg-white pl-10 text-sm font-medium shadow-sm transition-all placeholder:text-slate-400 focus:border-primary/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-2xl border-slate-200 bg-white text-sm font-bold text-slate-700 sm:hidden"
              onClick={() => setShowMobileFilters((value) => !value)}
              aria-expanded={showMobileFilters}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              {showMobileFilters ? "Masquer les filtres" : "Filtrer"}
            </Button>
          </div>
          
          <div className={cn(
            "grid grid-cols-1 gap-3 sm:grid sm:grid-cols-[1fr_1fr_auto] lg:flex lg:flex-wrap lg:items-center",
            !showMobileFilters && "hidden"
          )}>
            <Select
              value={selectedCenterFilter}
              onValueChange={setCenterFilter}
              disabled={!isSuperAdminView && centerFilterOptions.length <= 1}
            >
              <SelectTrigger className="h-11 w-full rounded-2xl border-slate-200 bg-white text-sm font-semibold sm:w-full lg:w-[160px]">
                <SelectValue placeholder="Centre" />
              </SelectTrigger>
              <SelectContent className="border-slate-200 bg-white text-slate-950 shadow-xl">
                {centerFilterOptions.length > 1 ? (
                  <SelectItem className="focus:bg-slate-100 focus:text-slate-950" value="all">
                    Tous mes centres
                  </SelectItem>
                ) : null}
                {centerFilterOptions.length === 0 ? (
                  <SelectItem className="focus:bg-slate-100 focus:text-slate-950" value="all">
                    Aucun centre actif
                  </SelectItem>
                ) : null}
                {centerFilterOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    className="focus:bg-slate-100 focus:text-slate-950"
                    value={option.value}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-11 w-full rounded-2xl border-slate-200 bg-white text-sm font-semibold sm:w-full lg:w-[160px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent className="border-slate-200 bg-white text-slate-950 shadow-xl">
                <SelectItem className="focus:bg-slate-100 focus:text-slate-950" value="all">Tous statuts</SelectItem>
                <SelectItem className="focus:bg-slate-100 focus:text-slate-950" value="received">Nouveau</SelectItem>
                <SelectItem className="focus:bg-slate-100 focus:text-slate-950" value="urgent">Urgent</SelectItem>
                <SelectItem className="focus:bg-slate-100 focus:text-slate-950" value="processed">Traité</SelectItem>
                <SelectItem className="focus:bg-slate-100 focus:text-slate-950" value="archived">Archivé</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "h-11 w-11 rounded-xl transition-all",
                sortBy === "urgency" ? "bg-primary/10 text-primary border border-primary/20" : "bg-white text-slate-500 border border-slate-200"
              )}
              onClick={() => setSortBy(s => s === "date" ? "urgency" : "date")}
              title={sortBy === "date" ? "Trier par urgence" : "Trier par date"}
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <CardHeader className="space-y-2 p-4 pb-2">
            <CardDescription className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Nouveaux courriers</CardDescription>
            <CardTitle className="flex items-center gap-2 text-2xl font-black text-slate-950 sm:text-3xl">
              <MailIcon className="h-5 w-5 text-primary" />
              {courierKpis.received}
            </CardTitle>
          </CardHeader>
          <CardContent className="hidden px-4 pb-4 sm:block">
            <p className="text-xs text-slate-600">
              Plis reçus et encore à traiter par l'équipe du centre.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-red-100 bg-red-50 shadow-sm">
          <CardHeader className="space-y-2 p-4 pb-2">
            <CardDescription className="text-[10px] font-bold uppercase tracking-[0.16em] text-red-700">Urgences courrier</CardDescription>
            <CardTitle className="flex items-center gap-2 text-2xl font-black text-red-950 sm:text-3xl">
              <AlertCircle className="h-5 w-5 text-red-600" />
              {courierKpis.urgent}
            </CardTitle>
          </CardHeader>
          <CardContent className="hidden px-4 pb-4 sm:block">
            <p className="text-xs text-red-950/80">
              Courriers signalés urgents par le flux IA ou le traitement manuel.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-amber-100 bg-amber-50 shadow-sm">
          <CardHeader className="space-y-2 p-4 pb-2">
            <CardDescription className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-700">Relances à mener</CardDescription>
            <CardTitle className="flex items-center gap-2 text-2xl font-black text-amber-950 sm:text-3xl">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
              {courierKpis.relances}
            </CardTitle>
          </CardHeader>
          <CardContent className="hidden px-4 pb-4 sm:block">
            <p className="text-xs text-amber-950/80">
              Dossiers incomplets ou à vérifier avant transmission au manager.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-emerald-100 bg-emerald-50 shadow-sm">
          <CardHeader className="space-y-2 p-4 pb-2">
            <CardDescription className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">Courriers traités</CardDescription>
            <CardTitle className="flex items-center gap-2 text-2xl font-black text-emerald-950 sm:text-3xl">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              {courierKpis.processed}
            </CardTitle>
          </CardHeader>
          <CardContent className="hidden px-4 pb-4 sm:block">
            <p className="text-xs text-emerald-950/80">
              Historique des plis déjà classés ou intégrés dans le flux client.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <CardHeader className="space-y-2">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2 text-lg text-slate-950">
                <ShieldAlert className="h-5 w-5 text-amber-600" />
                Relances prioritaires
              </CardTitle>
              <CardDescription className="text-slate-600">
                {isSecretaryView
                  ? "Vue de travail secrétaire pour reprendre les dossiers incomplets ou en attente."
                  : "Dossiers qui méritent une relance ou une vérification avant validation."}
              </CardDescription>
            </div>
            <Select value={followUpStageFilter} onValueChange={(value) => setFollowUpStageFilter(value as FollowUpStage)}>
              <SelectTrigger className="h-10 w-full rounded-xl border-slate-200 bg-white lg:w-[210px]">
                <SelectValue placeholder="Filtrer les relances" />
              </SelectTrigger>
              <SelectContent className="border-slate-200 bg-white text-slate-950 shadow-xl">
                <SelectItem className="focus:bg-slate-100 focus:text-slate-950" value="all">Toutes les relances</SelectItem>
                <SelectItem className="focus:bg-slate-100 focus:text-slate-950" value="stale">À refaire</SelectItem>
                <SelectItem className="focus:bg-slate-100 focus:text-slate-950" value="new">À relancer</SelectItem>
                <SelectItem className="focus:bg-slate-100 focus:text-slate-950" value="prepared">Préparées</SelectItem>
                <SelectItem className="focus:bg-slate-100 focus:text-slate-950" value="sent">Envoyées</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-amber-950">
              <div className="text-lg font-bold">{followUpStats.new}</div>
              <div className="text-[11px] font-medium uppercase tracking-wide">À relancer</div>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-blue-950">
              <div className="text-lg font-bold">{followUpStats.prepared}</div>
              <div className="text-[11px] font-medium uppercase tracking-wide">Préparées</div>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-950">
              <div className="text-lg font-bold">{followUpStats.sent}</div>
              <div className="text-[11px] font-medium uppercase tracking-wide">Envoyées</div>
            </div>
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-red-950">
              <div className="text-lg font-bold">{followUpStats.stale}</div>
              <div className="text-[11px] font-medium uppercase tracking-wide">À refaire</div>
            </div>
          </div>
          {requestsLoading ? (
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Chargement des relances en cours...
            </div>
          ) : priorityFollowUps.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              {followUpStats.total === 0
                ? "Aucun dossier à relancer pour vos centres actuellement."
                : "Aucune relance ne correspond aux filtres sélectionnés."}
            </div>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {priorityFollowUps.slice(0, 8).map((request) => (
                <div key={request.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  {(() => {
                    const reason = getFollowUpReason(request);
                    const stage = getFollowUpStage(request);
                    const stageMeta = getFollowUpStageMeta(stage);
                    return (
                      <>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-1">
                      <p className="font-semibold leading-tight">
                        {getRequestDisplayName(request)}
                      </p>
                      <p className="text-xs text-slate-500">
                        Mise à jour {formatDateTimeShort(request.updatedAt || request.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                      <Badge
                        variant={getSignupStatusVariant(request.status)}
                        className="text-[10px] uppercase tracking-wider"
                      >
                        {getSignupStatusLabel(request.status)}
                      </Badge>
                      <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider", stageMeta.badgeClassName)}>
                        {stageMeta.label}
                      </Badge>
                    </div>
                  </div>
                  <Badge variant="outline" className="mt-3 border-amber-200 bg-amber-50 text-amber-950">
                    {reason.label}
                  </Badge>
                  <p className="mt-3 text-sm text-slate-600">
                    {reason.message}
                  </p>
                  <div className={cn("mt-3 rounded-lg border px-3 py-2 text-xs", stageMeta.panelClassName)}>
                    <div className="font-semibold">{stageMeta.description}</div>
                    <div className="mt-1 opacity-80">
                      {getFollowUpLastActionLabel(request)}
                    </div>
                    {request.followUp?.preparedCount || request.followUp?.sentCount ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {request.followUp?.preparedCount ? (
                          <span>{request.followUp.preparedCount} préparée(s)</span>
                        ) : null}
                        {request.followUp?.sentCount ? (
                          <span>{request.followUp.sentCount} envoyée(s)</span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                  {!request.email ? (
                    <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-950">
                      Email client manquant : ouvrir le dossier avant envoi.
                    </div>
                  ) : null}
                  <div className="mt-4 grid gap-2 sm:flex sm:flex-wrap sm:justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full rounded-xl text-primary hover:text-primary sm:w-auto"
                      onClick={() => openFollowUpDialog(request)}
                    >
                      <Send className="mr-1 h-3.5 w-3.5" />
                      Préparer la relance
                    </Button>
                    <Button asChild size="sm" variant="outline" className="w-full rounded-xl sm:w-auto">
                      <Link href={`/admin/validation/${request.id}`}>
                        Ouvrir le dossier
                        <ChevronRight className="ml-1 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                      </>
                    );
                  })()}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={followUpDialogOpen}
        onOpenChange={(open) => {
          setFollowUpDialogOpen(open);
          if (!open) {
            setSelectedFollowUp(null);
            setFollowUpMessage("");
          }
        }}
      >
        <DialogContent className="max-h-[calc(100dvh-1rem)] overflow-y-auto rounded-[1.5rem] border border-slate-200 bg-white text-slate-950 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Préparer une relance</DialogTitle>
            <DialogDescription>
              Message prêt à vérifier avant envoi. Chaque action conserve une trace sur le dossier client.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm sm:grid-cols-2">
              <div>
                <div className="text-xs text-slate-500">Dossier</div>
                <div className="font-medium">
                  {selectedFollowUp ? getRequestDisplayName(selectedFollowUp) : "—"}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Email client</div>
                <div className="font-medium">
                  {selectedFollowUp?.email || "Email non renseigné"}
                </div>
              </div>
            </div>

            {selectedFollowUp ? (
              (() => {
                const stage = getFollowUpStage(selectedFollowUp);
                const stageMeta = getFollowUpStageMeta(stage);
                const reason = getFollowUpReason(selectedFollowUp);

                return (
                  <div className={cn("rounded-lg border px-4 py-3 text-sm", stageMeta.panelClassName)}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-semibold">{stageMeta.label}</div>
                      <Badge variant="outline" className={cn("text-[10px]", stageMeta.badgeClassName)}>
                        {reason.label}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs opacity-85">
                      {getFollowUpLastActionLabel(selectedFollowUp)}
                    </p>
                  </div>
                );
              })()
            ) : null}

            <Textarea
              value={followUpMessage}
              onChange={(event) => setFollowUpMessage(event.target.value)}
              className="min-h-[220px] resize-y bg-white text-slate-950"
            />

            {selectedFollowUp?.followUp?.history?.length ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold">Historique des relances</h3>
                    <p className="text-xs text-slate-500">
                      Dernières préparations conservées sur ce dossier.
                    </p>
                  </div>
                  <Badge variant="outline">
                    {selectedFollowUp.followUp.preparedCount ?? selectedFollowUp.followUp.history.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {selectedFollowUp.followUp.history.slice(0, 5).map((entry, index) => {
                    const historyStatus = getFollowUpHistoryStatus(entry);
                    const historyDate = entry.sentAt || entry.preparedAt;

                    return (
                      <div key={`${entry.preparedAt?.seconds ?? entry.sentAt?.seconds ?? index}-${index}`} className="rounded-md border border-slate-200 bg-white p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="font-medium">
                            {formatDateTimeShort(historyDate)}
                          </span>
                          <div className="flex flex-wrap gap-2">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px]",
                                historyStatus === "sent"
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                                  : "border-blue-200 bg-blue-50 text-blue-950"
                              )}
                            >
                              {historyStatus === "sent" ? "Envoyée" : "Préparée"}
                            </Badge>
                            <Badge variant="secondary" className="text-[10px]">
                              {entry.reason || "Relance"}
                            </Badge>
                          </div>
                        </div>
                        {entry.to ? (
                          <p className="mt-2 text-xs font-medium text-slate-700">
                            Destinataire : {entry.to}
                          </p>
                        ) : null}
                        <p className="mt-2 line-clamp-2 text-xs text-slate-500">
                          {entry.message || "Message non conservé"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={copyFollowUpMessage}>
                <ClipboardCopy className="mr-2 h-4 w-4" />
                Copier
              </Button>
              {selectedFollowUp ? (
                <Button type="button" variant="ghost" asChild>
                  <Link href={`/admin/validation/${selectedFollowUp.id}`}>
                    Ouvrir le dossier
                  </Link>
                </Button>
              ) : null}
            </div>
            <Button
              type="button"
              onClick={markFollowUpPrepared}
              disabled={isPreparingFollowUp || isSendingFollowUp || followUpMessage.trim().length < 20}
            >
              {isPreparingFollowUp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              Marquer préparée
            </Button>
            <Button
              type="button"
              onClick={sendFollowUpEmail}
              disabled={isPreparingFollowUp || isSendingFollowUp || followUpMessage.trim().length < 20 || !selectedFollowUp?.email}
            >
              {isSendingFollowUp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Envoyer par email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-8 md:space-y-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="font-medium">Récupération des courriers...</p>
          </div>
        ) : (
          <>
            {/* Section Priorités Smart */}
            <AnimatePresence>
              {urgentMails.length > 0 && (
                <motion.section 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 px-2">
                    <div className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                    <h2 className="text-xl font-bold font-headline text-red-500/90 tracking-wide uppercase text-xs">Priorités Smart</h2>
                  </div>
                  
                  <div className="grid gap-4">
                    {urgentMails.map((mail) => (
                      <MailCard 
                        key={mail.id} 
                        mail={mail} 
                        isUrgent 
                        onUpdateStatus={updateStatus} 
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            {/* Section Flux Standard */}
            <section className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="font-headline text-xs font-bold uppercase tracking-wide text-slate-600">Flux Standard</h2>
                <p className="text-[10px] uppercase tracking-widest text-slate-500">
                  {regularMails.length} Documents
                </p>
              </div>

              {regularMails.length === 0 && urgentMails.length === 0 ? (
                <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
                  <MailIcon className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                  <p className="font-medium text-slate-500">Aucun courrier ne correspond à vos critères.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {regularMails.map((mail, idx) => (
                    <motion.div
                      key={mail.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <MailCard 
                        mail={mail} 
                        onUpdateStatus={updateStatus} 
                        formatDate={formatDate}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {/* Footer Info */}
      {!loading && (
        <div className="hidden items-center justify-between border-t border-slate-200 pt-8 text-[10px] uppercase tracking-widest text-slate-500 sm:flex">
          <p>Indexation temps réel active</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
              <span>Urgent</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              <span>Analysé</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================
   Sous-Composants
 ========================= */

function MailCard({ mail, isUrgent = false, onUpdateStatus, formatDate }: { 
  mail: Mail, 
  isUrgent?: boolean,
  onUpdateStatus: (id: string, s: string) => void,
  formatDate: (ts: any) => string
}) {
  const category = mail.aiAnalysis?.category || mail.analysis?.category;
  const actionRequired = getMailActionRequired(mail);
  const notificationMeta = getNotificationBadgeMeta(mail.clientNotification?.status);
  const clientLinkId = firstNonEmptyString(
    mail.clientId,
    mail.clientUid,
    mail.ownerUid,
    mail.uid,
    mail.clientRequestId,
    mail.requestId
  );
  const dossierAction = clientLinkId ? (
    <Link
      href={`/admin/clients/${clientLinkId}`}
      className="inline-flex h-9 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary px-4 text-xs font-bold text-white shadow-sm shadow-primary/20 transition-colors hover:bg-primary/90"
      aria-label="Ouvrir le dossier client"
    >
      <ExternalLink className="mr-1.5 h-3 w-3" />
      Ouvrir le dossier
    </Link>
  ) : (
    <span className="inline-flex h-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-4 text-xs font-bold text-slate-500">
      Dossier indisponible
    </span>
  );
  
  return (
    <div className={cn(
      "group relative overflow-hidden rounded-3xl border bg-white shadow-sm transition-all duration-300",
      isUrgent ? "border-red-200 hover:border-red-300" : "border-slate-200 hover:border-slate-300"
    )}>
      {isUrgent && (
        <div className="absolute left-0 top-0 h-full w-1 bg-red-500" />
      )}
      
      <div className="flex flex-col gap-4 p-4 md:flex-row md:gap-6 md:p-5">
        {/* Colonne Gauche: Identité Pli */}
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-1">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <h4 className="min-w-0 truncate text-lg font-black text-slate-950 transition-colors group-hover:text-primary md:text-xl">
                  {mail.clientName || mail.companyName}
                </h4>
                {mail.status === "received" && (
                  <Badge className="bg-primary/20 text-primary border-primary/20 text-[10px] font-bold">NOUVEAU</Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <div className="flex min-w-0 items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDate(mail.receivedAt)}
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  <span className="max-w-[13rem] truncate">{mail.fileName}</span>
                </div>
                <Badge variant="outline" className="h-5 border-slate-200 bg-slate-50 py-0 text-[9px] text-slate-600">
                  {getCenterDisplayLabel(mail.centerKey)}
                </Badge>
                {mail.planId ? <SubscriptionPlanBadge planId={mail.planId} compact /> : null}
                <Badge variant="outline" className={cn("text-[9px] py-0 h-4", notificationMeta.className)}>
                  {notificationMeta.label}
                </Badge>
              </div>
            </div>
          </div>

          {/* Bloc Analyse IA */}
          {(mail.summary || mail.aiAnalysis) ? (
            <div className="relative group/ai">
              <div className="relative space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                    Analyse IA
                  </div>
                  {category && (
                    <Badge variant="outline" className={cn("text-[9px] h-4 px-2 uppercase font-bold", CATEGORY_STYLES[category] || "")}>
                      {category}
                    </Badge>
                  )}
                </div>
                <p className="line-clamp-5 text-sm font-medium leading-relaxed text-slate-700">
                  {mail.summary || mail.aiAnalysis?.summary}
                </p>
                {actionRequired && (
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-500 uppercase tracking-tighter">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Réponse ou Action Requise
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-[11px] text-slate-500">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary/50"></span>
              </div>
              Analyse prédictive en cours par CCS DOM AI...
            </div>
          )}
        </div>

        {/* Colonne Droite: Actions */}
        <div className="flex min-w-0 flex-col gap-2 border-t border-slate-200 pt-4 md:min-w-[160px] md:border-l md:border-t-0 md:pl-6 md:pt-0">
          <div className="grid w-full grid-cols-2 gap-2 md:grid-cols-1">
            {mail.status !== "processed" && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full rounded-xl text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                onClick={() => onUpdateStatus(mail.id, "processed")}
              >
                <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
                Traité
              </Button>
            )}

            {mail.status !== "archived" && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full rounded-xl text-slate-500 hover:bg-slate-100"
                onClick={() => onUpdateStatus(mail.id, "archived")}
              >
                Archiver
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-start border-t border-slate-100 bg-slate-50/80 px-4 py-3 md:justify-end md:px-5">
        {dossierAction}
      </div>
    </div>
  );
}

export default function AdminMailManagerPage() {
  return (
    <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-[10px] uppercase tracking-widest text-slate-500">Initialisation du Hub...</p>
        </div>
    }>
      <AdminMailManagerContent />
    </Suspense>
  );
}
