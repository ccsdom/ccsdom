"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Camera,
  Search,
  Send,
  ChevronsUpDown,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Building2,
  User,
  MapPin,
  Clock3,
  ShieldAlert,
  ChevronRight,
  Mail,
} from "lucide-react";
import Image from "next/image";
import { Client } from "@/app/admin/clients/page";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  Timestamp,
  query,
  where,
  setDoc,
  doc,
  type DocumentData,
  type Query as FirestoreQuery,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { ref, uploadBytes } from "firebase/storage";
import { cn } from "@/lib/utils";
import { useCenterAccess } from "@/hooks/use-center-access";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { v4 as uuidv4 } from "uuid";
import { useAuth, useDb, useStorage } from "@/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { OperationalAccessNotice } from "@/components/admin/operational-access-notice";
import {
  canAccessCenter,
  legacyCenterKey,
  managedCenterIdsFromData,
  normalizeCenterId,
  resolveRecordCenterId,
} from "@/lib/access-control";
import { CLIENT_STATUS, SIGNUP_REQUEST_STATUS } from "@/lib/constants/signup";
import { getSignupStatusLabel, getSignupStatusVariant } from "@/features/signup/status";
import { isMailScanEnabled, resolveMailPlanId, type MailPlanId } from "@/lib/plans";

const scanSchema = z.object({
  client: z.string().min(1, { message: "Veuillez sélectionner un client." }),
  document: z
    .any()
    .refine((files) => files?.[0], "Un fichier est requis.")
    .refine(
      (files) => files?.[0]?.size <= 10_000_000,
      "La taille du fichier ne doit pas dépasser 10 Mo."
    ),
});

type ScanForm = z.infer<typeof scanSchema>;

type MailRecord = {
  id: string;
  clientName?: string;
  companyName?: string;
  clientId?: string;
  fileName?: string;
  status?: string;
  centerKey?: string;
  summary?: string;
  receivedAt?: any;
  aiAnalysis?: {
    urgency?: string;
  };
};

type FollowUpRequest = {
  id: string;
  companyName?: string;
  name?: string;
  email?: string;
  status?: string;
  addressKey?: string;
  createdAt?: any;
  updatedAt?: any;
  documentsRequiredCompleted?: boolean;
};

type ClientLoadStats = {
  fetched: number;
  active: number;
  visible: number;
  digital: number;
};

function getClientCenterId(client: Partial<Client>): string {
  const data = client as Record<string, any>;

  return (
    normalizeCenterId(data.domiciliationAddressId) ||
    normalizeCenterId(data.addressId) ||
    normalizeCenterId(data.addressKey) ||
    normalizeCenterId(data.locationKey) ||
    normalizeCenterId(data.centerKey) ||
    normalizeCenterId(data.centerId) ||
    resolveRecordCenterId(data) ||
    ''
  );
}

function getClientMailPlanId(client: Partial<Client>): MailPlanId {
  return resolveMailPlanId(client as Record<string, any>);
}

function clientCanReceiveDigitalMail(client: Partial<Client>) {
  return isMailScanEnabled(getClientMailPlanId(client));
}

function getMailPlanLabel(planId: MailPlanId) {
  switch (planId) {
    case "starter":
      return "Starter";
    case "business":
      return "Business";
    case "premium":
      return "Premium";
    case "classic":
    default:
      return "Classic";
  }
}

function canSeeClientForRole(
  client: Partial<Client>,
  role: string | null | undefined,
  managedCenterIds: string[]
) {
  if (!role) return false;

  const centerId = getClientCenterId(client);
  return canAccessCenter(role, managedCenterIds, centerId);
}

function isClientAvailableForScan(client: Partial<Client>) {
  const status = String(client.status ?? CLIENT_STATUS.ACTIVE).trim().toLowerCase();
  return status === CLIENT_STATUS.ACTIVE.toLowerCase() || status === "active" || status === "approved";
}

function isPdfFile(file?: File | null) {
  return file?.type === "application/pdf";
}

function getRequestDisplayName(request: FollowUpRequest) {
  return request.companyName || request.name || request.email || "Dossier client";
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

function requestNeedsFollowUp(request: FollowUpRequest) {
  const status = String(request.status ?? "").toLowerCase();
  if (
    status === SIGNUP_REQUEST_STATUS.APPROVED ||
    status === SIGNUP_REQUEST_STATUS.REJECTED ||
    status === SIGNUP_REQUEST_STATUS.CONVERTED
  ) {
    return false;
  }

  return request.documentsRequiredCompleted !== true;
}

export default function ScanMailPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isPreviewPdf, setIsPreviewPdf] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [recentMails, setRecentMails] = useState<MailRecord[]>([]);
  const [followUpRequests, setFollowUpRequests] = useState<FollowUpRequest[]>([]);
  const [isFetchingClients, setIsFetchingClients] = useState(true);
  const [isFetchingMails, setIsFetchingMails] = useState(true);
  const [isFetchingRequests, setIsFetchingRequests] = useState(true);
  const [isClientSelectorOpen, setIsClientSelectorOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [staffManagedCenterIds, setStaffManagedCenterIds] = useState<string[]>([]);
  const [isStaffAccessLoading, setIsStaffAccessLoading] = useState(true);
  const [clientLoadStats, setClientLoadStats] = useState<ClientLoadStats>({
    fetched: 0,
    active: 0,
    visible: 0,
    digital: 0,
  });
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams?.get("clientId");

  const { toast } = useToast();
  const { displayRole, managedCenterIds, isLoading: isRoleLoading } = useCenterAccess();
  const isSuperAdminView = displayRole === "super_admin";
  const auth = useAuth();
  const db = useDb();
  const storage = useStorage();

  const getCenterName = (id: string) => {
    if (id === "paris_12e") return "Paris 12e";
    if (id === "orly_ville") return "Orly Ville";
    return id;
  };

  useEffect(() => {
    if (!auth || !db) {
      setStaffManagedCenterIds([]);
      setIsStaffAccessLoading(false);
      return;
    }

    setIsStaffAccessLoading(true);

    let unsubscribeUserDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeUserDoc?.();
      unsubscribeUserDoc = null;

      if (!user) {
        setStaffManagedCenterIds([]);
        setIsStaffAccessLoading(false);
        return;
      }

      unsubscribeUserDoc = onSnapshot(
        doc(db, "users", user.uid),
        (snapshot) => {
          const data = snapshot.exists() ? snapshot.data() : {};
          setStaffManagedCenterIds(managedCenterIdsFromData(data, displayRole));
          setIsStaffAccessLoading(false);
        },
        (error) => {
          console.error("[ScanMailPage] Failed to load staff access profile:", error);
          setStaffManagedCenterIds([]);
          setIsStaffAccessLoading(false);
        }
      );
    });

    return () => {
      unsubscribeUserDoc?.();
      unsubscribeAuth();
    };
  }, [auth, db, displayRole]);

  const effectiveManagedCenterIds = useMemo(() => {
    const centers = new Set<string>();

    managedCenterIds
      .map((centerId) => normalizeCenterId(centerId))
      .filter((centerId): centerId is string => Boolean(centerId))
      .forEach((centerId) => centers.add(centerId));

    staffManagedCenterIds
      .map((centerId) => normalizeCenterId(centerId))
      .filter((centerId): centerId is string => Boolean(centerId))
      .forEach((centerId) => centers.add(centerId));

    return Array.from(centers);
  }, [managedCenterIds, staffManagedCenterIds]);

  const scopedAddressKeys = useMemo(
    () =>
      effectiveManagedCenterIds
        .map((centerId) => legacyCenterKey(centerId))
        .filter((centerKey): centerKey is "paris" | "orly" => Boolean(centerKey))
        .slice(0, 10),
    [effectiveManagedCenterIds]
  );

  const effectiveManagedCenterIdsKey = useMemo(
    () => [...effectiveManagedCenterIds].sort().join("|"),
    [effectiveManagedCenterIds]
  );
  const scopedAddressKeysKey = useMemo(
    () => [...scopedAddressKeys].sort().join("|"),
    [scopedAddressKeys]
  );
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        form.setValue("document", e.dataTransfer.files, { 
          shouldValidate: true,
          shouldDirty: true 
        });
    }
  };

  const form = useForm<ScanForm>({
    resolver: zodResolver(scanSchema),
    defaultValues: {
      client: "",
      document: undefined,
    },
    mode: "onChange",
  });

  const documentFile = form.watch('document');
  const selectedClientId = form.watch("client");

  useEffect(() => {
    if (isSuperAdminView) {
      setClients([]);
      setClientLoadStats({ fetched: 0, active: 0, visible: 0, digital: 0 });
      setIsFetchingClients(false);
      return;
    }

    if (!db) {
      setIsFetchingClients(false);
      return;
    }

    if (isRoleLoading || isStaffAccessLoading) {
      setIsFetchingClients(true);
      return;
    }

    setIsFetchingClients(true);

    const scopedCenterIds = effectiveManagedCenterIds.filter(Boolean).slice(0, 10);
    if (scopedCenterIds.length === 0 || !displayRole) {
      setClients([]);
      setClientLoadStats({ fetched: 0, active: 0, visible: 0, digital: 0 });
      setIsFetchingClients(false);
      return;
    }

    const clientsCollection = collection(db, "clients");
    const queryByLabel = new Map<string, FirestoreQuery<DocumentData>>();

    scopedCenterIds.forEach((centerId) => {
      const centerKey = legacyCenterKey(centerId);
      queryByLabel.set(`centerId:${centerId}`, query(clientsCollection, where("centerId", "==", centerId)));
      queryByLabel.set(
        `domiciliationAddressId:${centerId}`,
        query(clientsCollection, where("domiciliationAddressId", "==", centerId))
      );
      queryByLabel.set(`addressId:${centerId}`, query(clientsCollection, where("addressId", "==", centerId)));

      if (centerKey) {
        queryByLabel.set(`addressKey:${centerKey}`, query(clientsCollection, where("addressKey", "==", centerKey)));
        queryByLabel.set(`locationKey:${centerKey}`, query(clientsCollection, where("locationKey", "==", centerKey)));
        queryByLabel.set(`centerKey:${centerKey}`, query(clientsCollection, where("centerKey", "==", centerKey)));
      }
    });

    const scopedQueries = Array.from(queryByLabel.entries());
    const sourceDocs = new Map<string, Map<string, Client>>();
    const settledSources = new Set<string>();
    const failedSources = new Set<string>();
    let hasShownLoadError = false;

    const publishClients = () => {
      const byId = new Map<string, Client>();
      sourceDocs.forEach((docsById) => {
        docsById.forEach((client, id) => byId.set(id, client));
      });

      const allClients = Array.from(byId.values());
      const activeClients = allClients.filter((client) => isClientAvailableForScan(client));
      const visibleClients = activeClients.filter((client) =>
        canSeeClientForRole(client, displayRole, scopedCenterIds)
      );
      const digitalMailClients = visibleClients.filter((client) =>
        clientCanReceiveDigitalMail(client)
      );

      setClientLoadStats({
        fetched: allClients.length,
        active: activeClients.length,
        visible: visibleClients.length,
        digital: digitalMailClients.length,
      });

      visibleClients.sort((a, b) =>
        String(a.name ?? "").localeCompare(String(b.name ?? ""), "fr", {
          sensitivity: "base",
        })
      );

      setClients(visibleClients);
      setIsFetchingClients(false);
    };

    const unsubscribers = scopedQueries.map(([label, scopedQuery]) =>
      onSnapshot(
        scopedQuery,
        (snapshot) => {
          settledSources.add(label);
          failedSources.delete(label);

          const nextDocs = new Map<string, Client>();
          snapshot.docs.forEach((docSnap) => {
            nextDocs.set(docSnap.id, { id: docSnap.id, ...docSnap.data() } as Client);
          });

          sourceDocs.set(label, nextDocs);
          publishClients();
        },
        (error) => {
          console.error(`Error fetching scan clients for ${label}:`, error);
          settledSources.add(label);
          failedSources.add(label);
          sourceDocs.delete(label);

          if (
            !hasShownLoadError &&
            settledSources.size === scopedQueries.length &&
            failedSources.size === scopedQueries.length
          ) {
            hasShownLoadError = true;
            setIsFetchingClients(false);
            toast({
              variant: "destructive",
              title: "Erreur",
              description: "Impossible de charger la liste des clients.",
            });
            return;
          }

          if (sourceDocs.size > 0 || settledSources.size === scopedQueries.length) {
            publishClients();
          }
        }
      )
    );

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [
    displayRole,
    effectiveManagedCenterIdsKey,
    db,
    toast,
    isSuperAdminView,
    isRoleLoading,
    isStaffAccessLoading,
  ]);

  useEffect(() => {
    if (isSuperAdminView) {
      setRecentMails([]);
      setIsFetchingMails(false);
      return;
    }

    if (!db || !displayRole) return;

    setIsFetchingMails(true);

    const scopedCenterKeys = effectiveManagedCenterIds.slice(0, 10);
    if (scopedCenterKeys.length === 0) {
      setRecentMails([]);
      setIsFetchingMails(false);
      return;
    }

    let mailsQuery = query(
      collection(db, "mails"),
      orderBy("receivedAt", "desc"),
      limit(8)
    );

    if (scopedCenterKeys.length === 1) {
      mailsQuery = query(mailsQuery, where("centerKey", "==", scopedCenterKeys[0]));
    } else if (scopedCenterKeys.length > 1) {
      mailsQuery = query(mailsQuery, where("centerKey", "in", scopedCenterKeys));
    }

    let hasSettled = false;
    const loadingTimeout = window.setTimeout(() => {
      if (!hasSettled) setIsFetchingMails(false);
    }, 5000);

    const unsubscribe = onSnapshot(
      mailsQuery,
      (snapshot) => {
        hasSettled = true;
        window.clearTimeout(loadingTimeout);
        setRecentMails(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as MailRecord)));
        setIsFetchingMails(false);
      },
      (error) => {
        hasSettled = true;
        window.clearTimeout(loadingTimeout);
        console.error("Error fetching recent mails:", error);
        setIsFetchingMails(false);
      }
    );

    return () => {
      window.clearTimeout(loadingTimeout);
      unsubscribe();
    };
  }, [db, displayRole, isSuperAdminView, effectiveManagedCenterIdsKey]);

  useEffect(() => {
    if (isSuperAdminView) {
      setFollowUpRequests([]);
      setIsFetchingRequests(false);
      return;
    }

    if (!db || !displayRole) return;

    setIsFetchingRequests(true);

    if (scopedAddressKeys.length === 0) {
      setFollowUpRequests([]);
      setIsFetchingRequests(false);
      return;
    }

    let requestsQuery = query(
      collection(db, "client_requests"),
      orderBy("updatedAt", "desc"),
      limit(12)
    );

    if (scopedAddressKeys.length === 1) {
      requestsQuery = query(requestsQuery, where("addressKey", "==", scopedAddressKeys[0]));
    } else if (scopedAddressKeys.length > 1) {
      requestsQuery = query(requestsQuery, where("addressKey", "in", scopedAddressKeys));
    }

    let hasSettled = false;
    const loadingTimeout = window.setTimeout(() => {
      if (!hasSettled) setIsFetchingRequests(false);
    }, 5000);

    const unsubscribe = onSnapshot(
      requestsQuery,
      (snapshot) => {
        hasSettled = true;
        window.clearTimeout(loadingTimeout);
        const nextRequests = snapshot.docs
          .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as FollowUpRequest))
          .filter((request) => requestNeedsFollowUp(request))
          .slice(0, 6);
        setFollowUpRequests(nextRequests);
        setIsFetchingRequests(false);
      },
      (error) => {
        hasSettled = true;
        window.clearTimeout(loadingTimeout);
        console.error("Error fetching follow-up requests:", error);
        setIsFetchingRequests(false);
      }
    );

    return () => {
      window.clearTimeout(loadingTimeout);
      unsubscribe();
    };
  }, [db, displayRole, isSuperAdminView, scopedAddressKeysKey]);

  // Pre-select client if ID is in URL
  useEffect(() => {
    if (preselectedClientId && clients.length > 0 && !form.getValues("client")) {
      const exists = clients.some(c => c.id === preselectedClientId);
      if (exists) {
        form.setValue("client", preselectedClientId);
      }
    }
  }, [preselectedClientId, clients, form]);

  const filteredClients = clients.filter((client) => {
    const lowercasedTerm = searchTerm.toLowerCase().trim();
    if (!lowercasedTerm) return true;

    return (
      String(client.name ?? '').toLowerCase().includes(lowercasedTerm) ||
      String(client.email ?? '').toLowerCase().includes(lowercasedTerm) ||
      String((client as any).companyName ?? '')
        .toLowerCase()
        .includes(lowercasedTerm) ||
      String((client as any).representative ?? '')
        .toLowerCase()
        .includes(lowercasedTerm)
    );
  });

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === selectedClientId) || null,
    [clients, selectedClientId]
  );
  const selectedClientCanReceiveDigitalMail = selectedClient
    ? clientCanReceiveDigitalMail(selectedClient)
    : true;

  const urgentRecentMails = useMemo(
    () =>
      recentMails.filter((mail) => {
        const urgency = String(mail.aiAnalysis?.urgency ?? "").toLowerCase();
        const status = String(mail.status ?? "").toLowerCase();
        return urgency === "high" || status === "urgent";
      }),
    [recentMails]
  );

  useEffect(() => {
    if (documentFile && documentFile.length > 0) {
      const file = documentFile[0];
      const previewUrl = URL.createObjectURL(file);
      setFilePreview(previewUrl);
      setIsPreviewPdf(isPdfFile(file));

      return () => URL.revokeObjectURL(previewUrl);
    } else {
      setFilePreview(null);
      setIsPreviewPdf(false);
    }
  }, [documentFile]);

  const resetFileField = () => {
    form.setValue('document', undefined, {
      shouldDirty: true,
      shouldValidate: false,
    });
    setFilePreview(null);
    setIsPreviewPdf(false);
    setFileInputKey((prev) => prev + 1);
  };

  const onSubmit = async (values: ScanForm) => {
    setIsSubmitting(true);

    if (!storage || !auth || !db) {
      toast({
        variant: 'destructive',
        title: "Erreur d'initialisation",
        description:
          'Les services Firebase ne sont pas disponibles. Veuillez rafraîchir la page.',
      });
      setIsSubmitting(false);
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      toast({
        variant: 'destructive',
        title: "Erreur d'authentification",
        description:
          "L'utilisateur n'est pas authentifié. Veuillez vous reconnecter.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const file = values.document?.[0];
      if (!file) {
        throw new Error('Fichier manquant.');
      }

      const client = clients.find((c) => c.id === values.client);
      if (!client) {
        throw new Error('Client non trouvé.');
      }

      const planId = getClientMailPlanId(client);
      if (!clientCanReceiveDigitalMail(client)) {
        throw new Error("Ce client est en formule Classic : le scan et les notifications courrier ne sont pas inclus.");
      }

      const clientUid = String((client as any).uid ?? '').trim();
      if (!clientUid) {
        throw new Error("L'UID du client est introuvable.");
      }

      const mailId = uuidv4();
      const filePath = `mails/${clientUid}/${mailId}/${file.name}`;
      const mailDocRef = doc(db, 'mails', mailId);

      const clientCenterKey = getClientCenterId(client);

      toast({
        title: 'Envoi du fichier...',
        description: 'Le document est en cours de téléversement.',
      });

      await setDoc(mailDocRef, {
        uid: clientUid,
        ownerUid: clientUid,
        clientUid: clientUid,
        clientId: client.id,
        centerKey: clientCenterKey,
        planId,
        clientName: client.name ?? (client as any).companyName ?? '',
        companyName: (client as any).companyName ?? client.name ?? '',
        scannedAt: Timestamp.now(),
        receivedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
        fileName: file.name,
        storagePath: filePath,
        contentType: file.type || null,
        size: file.size || null,
        status: 'received',
        source: 'scan_manager',
        analysis: null,
        uploadedByUid: user.uid,
      });

      const storageRef = ref(storage, filePath);
      await uploadBytes(storageRef, file);

      toast({
        title: 'Document envoyé avec succès',
        description: `Le courrier pour ${
          client.name ?? (client as any).companyName ?? 'ce client'
        } est en cours de traitement.`,
      });

      form.reset({ client: '', document: undefined });
      setFilePreview(null);
      setIsPreviewPdf(false);
      setSearchTerm('');
      setFileInputKey((prev) => prev + 1);
    } catch (error: any) {
      console.error('Error uploading mail:', error);
      toast({
        variant: 'destructive',
        title: "Erreur lors de l'envoi",
        description: error?.message || 'Une erreur est survenue.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuperAdminView) {
    return (
      <OperationalAccessNotice
        title="Scan courrier reserve aux equipes des centres"
        description="Le scan et l'affectation de courrier sont des actions operationnelles. Le super admin conserve une vue reseau, mais ne traite pas le courrier client au quotidien."
      />
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto grid max-w-7xl gap-5 overflow-x-hidden px-3 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-2 text-slate-950 sm:gap-8 sm:px-4 lg:pb-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
        <Badge variant="outline" className="w-fit border-primary/20 bg-primary/10 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
          Mode terrain
        </Badge>
        <h1 className="text-3xl font-bold font-headline text-gradient sm:text-4xl">
          Scanner un courrier
        </h1>
        <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
          Affectez un pli au bon client, ajoutez le document, puis déclenchez le traitement numérique du centre.
        </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
          <Badge variant="outline" className="justify-center border-slate-200 bg-white px-3 py-2 text-[10px] uppercase tracking-widest text-slate-600">
            {clients.length} clients centre
          </Badge>
          <Badge variant="outline" className="justify-center border-red-200 bg-red-50 px-3 py-2 text-[10px] uppercase tracking-widest text-red-700">
            {urgentRecentMails.length} urgent(s)
          </Badge>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="p-4 sm:p-6 md:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
              
              {/* Étape 1 : Sélection Client */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-sm">
                    1
                  </div>
                  <h3 className="text-lg font-semibold font-headline">Client destinataire</h3>
                </div>

                <FormField
                  control={form.control}
                  name="client"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <Dialog
                        open={isClientSelectorOpen}
                        onOpenChange={setIsClientSelectorOpen}
                      >
                        <DialogTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                'min-h-[4.5rem] w-full justify-between rounded-2xl border-slate-200 bg-white px-4 py-3 text-left text-slate-950 shadow-sm transition-all hover:bg-slate-50 sm:h-14 sm:min-h-0',
                                !field.value && 'text-slate-500'
                              )}
                              disabled={isFetchingClients}
                            >
                              <div className="flex items-center gap-3 overflow-hidden">
                                {field.value ? (
                                  <>
                                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                      <User className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                      <span className="font-semibold truncate">
                                        {clients.find((c) => c.id === field.value)?.name ||
                                          (clients.find((c) => c.id === field.value) as any)?.companyName}
                                      </span>
                                      <span className="truncate text-xs text-slate-500">
                                        {clients.find((c) => c.id === field.value)?.email}
                                      </span>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <Search className="h-4 w-4 opacity-50" />
                                    <span>Sélectionner le destinataire...</span>
                                  </>
                                )}
                              </div>
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </DialogTrigger>

                        <DialogContent className="max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] overflow-hidden rounded-3xl border-none bg-white p-0 text-slate-900 shadow-2xl sm:max-w-[540px]">
                          <DialogHeader className="border-b border-slate-100 bg-slate-50/50 p-4 pb-3 sm:p-6 sm:pb-2">
                            <DialogTitle className="text-xl font-headline text-slate-900">Rechercher un client</DialogTitle>
                            <DialogDescription className="text-sm text-slate-500">
                              Sélectionnez un client actif rattaché à votre centre. La formule indique si le scan numérique est inclus.
                            </DialogDescription>
                          </DialogHeader>

                          <div className="p-4 pt-4 sm:p-6 sm:pt-4">
                            <div className="relative mb-4">
                              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                              <Input
                                placeholder="Nom, email, entreprise..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 h-11 bg-slate-100 border-slate-200 focus:bg-white focus:ring-2 focus:ring-primary/20 rounded-xl text-slate-900 placeholder:text-slate-400 transition-all"
                              />
                            </div>

                            <ScrollArea className="h-[55dvh] max-h-[420px] pr-3 sm:pr-4">
                              <div className="space-y-2">
                                {isFetchingClients ? (
                                  <div className="flex flex-col items-center justify-center py-10 gap-3 text-slate-400">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                    <p className="text-sm">Chargement de la base clients...</p>
                                  </div>
                                ) : filteredClients.length > 0 ? (
                                  filteredClients.map((client) => {
                                    const planId = getClientMailPlanId(client);
                                    const canReceiveDigitalMail = clientCanReceiveDigitalMail(client);

                                    return (
                                      <button
                                        key={client.id}
                                        type="button"
                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all text-left group border border-transparent hover:border-slate-100"
                                        onClick={() => {
                                          form.setValue('client', client.id!, {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                          });
                                          setIsClientSelectorOpen(false);
                                        }}
                                      >
                                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                          <Building2 className="h-5 w-5 text-slate-400 group-hover:text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="font-semibold text-sm text-slate-900 truncate">
                                            {client.name || (client as any).companyName}
                                          </p>
                                          <div className="flex flex-wrap items-center gap-2 mt-0.5">
                                            <Badge variant="outline" className="text-[10px] h-4 px-1 border-slate-200 bg-white text-slate-500">
                                              {getCenterName(getClientCenterId(client))}
                                            </Badge>
                                            <Badge
                                              variant="outline"
                                              className={cn(
                                                "text-[10px] h-4 px-1",
                                                canReceiveDigitalMail
                                                  ? "border-primary/20 bg-primary/5 text-primary"
                                                  : "border-amber-200 bg-amber-50 text-amber-700"
                                              )}
                                            >
                                              {canReceiveDigitalMail
                                                ? getMailPlanLabel(planId)
                                                : "Classic - retrait"}
                                            </Badge>
                                            <span className="text-[10px] text-slate-400 truncate">
                                              {client.email}
                                            </span>
                                          </div>
                                        </div>
                                      </button>
                                    );
                                  })
                                ) : (
                                  <div className="text-center py-10 text-slate-400">
                                    <p className="text-sm">Aucun client trouvé.</p>
                                    {effectiveManagedCenterIds.length === 0 ? (
                                      <p className="mx-auto mt-2 max-w-sm text-xs text-amber-600">
                                        Aucun centre actif n&apos;est détecté pour ce compte. Vérifiez le rôle et le centre assigné au profil utilisateur.
                                      </p>
                                    ) : searchTerm.trim() ? (
                                      <p className="mx-auto mt-2 max-w-sm text-xs text-slate-500">
                                        Aucun résultat pour cette recherche. Effacez le filtre pour voir les clients actifs du centre.
                                      </p>
                                    ) : (
                                      <div className="mx-auto mt-2 max-w-sm space-y-1 text-xs text-slate-500">
                                        <p>Centres pris en compte : {effectiveManagedCenterIds.map(getCenterName).join(", ")}.</p>
                                        <p>
                                          Diagnostic : {clientLoadStats.fetched} lu(s), {clientLoadStats.active} actif(s), {clientLoadStats.visible} visible(s), {clientLoadStats.digital} avec scan numérique.
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </ScrollArea>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <FormMessage className="mt-1 text-red-600" />
                    </FormItem>
                  )}
                />

                {selectedClient ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Client selectionne</p>
                        <p className="text-lg font-bold">
                          {selectedClient.name || (selectedClient as any).companyName || "—"}
                        </p>
                        <p className="text-sm text-slate-600">{selectedClient.email || "—"}</p>
                      </div>
                      <div className="flex flex-wrap justify-end gap-2">
                        <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                          {getCenterName(getClientCenterId(selectedClient))}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn(
                            selectedClientCanReceiveDigitalMail
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-amber-200 bg-amber-50 text-amber-700"
                          )}
                        >
                          {selectedClientCanReceiveDigitalMail
                            ? getMailPlanLabel(getClientMailPlanId(selectedClient))
                            : "Classic - retrait"}
                        </Badge>
                      </div>
                    </div>
                    {!selectedClientCanReceiveDigitalMail ? (
                      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
                        Ce client est en formule Classic : le scan numérique et la notification email ne sont pas inclus.
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>

              {/* Étape 2 : Le Document */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-sm">
                    2
                  </div>
                  <h3 className="text-lg font-semibold font-headline">Importation du courrier</h3>
                </div>

                <FormField
                  control={form.control}
                  name="document"
                  render={({ field: { onChange, value, ref: _ref, ...rest } }) => (
                    <FormItem>
                      <FormControl>
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={cn(
                            "relative flex min-h-[260px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300 sm:min-h-[300px]",
                            isDragging
                              ? "scale-[1.01] border-primary bg-primary/10 shadow-[0_0_20px_rgba(var(--primary),0.2)]"
                              : "border-slate-200 bg-slate-50 hover:border-primary/40 hover:bg-white",
                            value?.[0] && "border-primary/50 bg-primary/5"
                          )}
                          onClick={() => {
                            const input = document.getElementById('file-upload') as HTMLInputElement;
                            if (input) input.click();
                          }}
                        >
                          <input
                            key={`file-${fileInputKey}`}
                            id="file-upload"
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={(e) => onChange(e.target.files)}
                            {...rest}
                          />

                          <AnimatePresence mode="wait">
                            {!value?.[0] ? (
                              <motion.div 
                                key="upload-prompt"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex flex-col items-center text-center p-6"
                              >
                                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                  <UploadCloud className="h-8 w-8 text-primary" />
                                </div>
                                <p className="text-lg font-semibold mb-1">
                                  Déposez le fichier ici
                                </p>
                                <p className="max-w-xs text-sm text-slate-500">
                                  Supporte les images et PDF (max 10 Mo)
                                </p>
                                <div className="mt-5 grid w-full max-w-xs grid-cols-2 gap-2">
                                  <Button type="button" variant="secondary" size="sm" className="h-11 rounded-2xl">
                                    Parcourir
                                  </Button>
                                  <div>
                                    <Button 
                                      type="button" 
                                      variant="outline" 
                                      size="sm" 
                                      className="h-11 w-full rounded-2xl"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const input = document.getElementById('camera-upload') as HTMLInputElement;
                                        if (input) input.click();
                                      }}
                                    >
                                      <Camera className="h-4 w-4 mr-2" />
                                      Caméra
                                    </Button>
                                    <input
                                      key={`camera-${fileInputKey}`}
                                      id="camera-upload"
                                      type="file"
                                      accept="image/*"
                                      capture="environment"
                                      className="hidden"
                                      onChange={(e) => onChange(e.target.files)}
                                    />
                                  </div>
                                </div>
                              </motion.div>
                            ) : (
                              <motion.div 
                                key="file-selected"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center p-6 w-full h-full"
                              >
                                {isPreviewPdf ? (
                                  <div className="flex flex-col items-center justify-center py-6">
                                    <div className="h-20 w-16 rounded-lg border border-red-200 bg-red-50 flex items-center justify-center mb-3">
                                      <FileText className="h-10 w-10 text-red-600" />
                                    </div>
                                    <p className="font-semibold text-center truncate max-w-[200px]">
                                      {value[0].name}
                                    </p>
                                    <Badge variant="outline" className="mt-2 border-red-200 bg-red-50 text-xs text-red-700">
                                      Document PDF
                                    </Badge>
                                  </div>
                                ) : (
                                  <div className="relative group/image">
                                    {filePreview && (
                                      <div className="relative h-48 w-48 overflow-hidden rounded-xl border border-slate-200 shadow-xl">
                                        <Image
                                          src={filePreview}
                                          alt="Aperçu"
                                          fill
                                          className="bg-slate-100 object-contain"
                                        />
                                      </div>
                                    )}
                                    <div className="mt-3 text-center">
                                      <p className="font-semibold text-sm truncate max-w-[200px]">
                                        {value[0].name}
                                      </p>
                                      <p className="text-[10px] text-slate-500">
                                        {(value[0].size / 1024 / 1024).toFixed(2)} Mo
                                      </p>
                                    </div>
                                  </div>
                                )}
                                
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    resetFileField();
                                  }}
                                  className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-red-600 transition-colors hover:text-red-700"
                                >
                                  <AlertCircle className="h-3.5 w-3.5" />
                                  Changer de fichier
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-600" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="sticky bottom-24 z-20 -mx-1 flex flex-col items-center rounded-3xl border border-slate-200 bg-white/95 p-2 pt-3 shadow-2xl shadow-black/10 backdrop-blur-xl sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:pt-4 sm:shadow-none">
                <Button
                  type="submit"
                  disabled={isSubmitting || !form.formState.isValid || !selectedClientCanReceiveDigitalMail}
                  className={cn(
                    "w-full h-14 rounded-2xl text-lg font-bold shadow-lg transition-all duration-300 shadow-primary/20",
                    form.formState.isValid && selectedClientCanReceiveDigitalMail
                      ? "bg-gradient-to-r from-primary to-blue-600 hover:scale-[1.02] hover:shadow-primary/40 active:scale-[0.98]" 
                      : "bg-slate-100 text-slate-500"
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                      Envoi du courrier...
                    </>
                  ) : !selectedClientCanReceiveDigitalMail ? (
                    <>
                      <ShieldAlert className="mr-3 h-5 w-5" />
                      Formule Classic non compatible
                    </>
                  ) : (
                    <>
                      <Send className="mr-3 h-5 w-5" />
                      Envoyer au client
                    </>
                  )}
                </Button>
                <p className="mt-4 max-w-sm text-center text-[11px] text-slate-500">
                  Selon la formule du client, le courrier sera notifié par email et, en Premium, enrichi par résumé IA et détection d&apos;urgence.
                </p>
              </div>
            </form>
          </Form>
          </div>
        </div>

        <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <CardHeader className="space-y-2 p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg text-slate-950">
                <ShieldAlert className="h-5 w-5 text-amber-600" />
                Relances terrain
              </CardTitle>
              <CardDescription className="text-slate-500">
                Dossiers qui attendent encore des pieces ou une action du secretariat.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-4 pt-0 sm:p-6 sm:pt-0">
              {isFetchingRequests ? (
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Chargement des relances...
                </div>
              ) : followUpRequests.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  Aucun dossier en attente de relance pour vos centres.
                </div>
              ) : (
                followUpRequests.map((request) => (
                  <div key={request.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-semibold leading-tight">{getRequestDisplayName(request)}</p>
                        <p className="text-xs text-slate-500">
                          Mise a jour {formatDateTimeShort(request.updatedAt || request.createdAt)}
                        </p>
                      </div>
                      <Badge variant={getSignupStatusVariant(request.status)} className="text-[10px] uppercase tracking-wider">
                        {getSignupStatusLabel(request.status)}
                      </Badge>
                    </div>
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-slate-600">
                        Pieces manquantes ou dossier a completer avant transmission.
                      </p>
                      <Button asChild size="sm" variant="outline" className="min-h-10 rounded-xl">
                        <Link href={`/admin/validation/${request.id}`}>
                          Ouvrir
                          <ChevronRight className="ml-1 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <CardHeader className="space-y-2 p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg text-slate-950">
                <Mail className="h-5 w-5 text-primary" />
                Derniers scans
              </CardTitle>
              <CardDescription className="text-slate-500">
                Historique recent du courrier recu, avec mise en avant des urgences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-4 pt-0 sm:p-6 sm:pt-0 lg:max-h-[calc(100dvh-31rem)] lg:overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">
                  {recentMails.length} scans recents
                </Badge>
                <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
                  {urgentRecentMails.length} urgents
                </Badge>
              </div>

              {isFetchingMails ? (
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Chargement des scans...
                </div>
              ) : recentMails.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  Aucun scan recent a afficher pour vos centres.
                </div>
              ) : (
                recentMails.map((mail) => {
                  const isUrgent =
                    String(mail.aiAnalysis?.urgency ?? "").toLowerCase() === "high" ||
                    String(mail.status ?? "").toLowerCase() === "urgent";

                  return (
                    <div key={mail.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="font-semibold leading-tight">
                            {mail.clientName || mail.companyName || "Courrier client"}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Clock3 className="h-3.5 w-3.5" />
                            <span>{formatDateTimeShort(mail.receivedAt)}</span>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] uppercase tracking-wider",
                            isUrgent ? "border-red-200 bg-red-50 text-red-700" : "border-slate-200 bg-white text-slate-600"
                          )}
                        >
                          {isUrgent ? "Urgent" : "Courrier"}
                        </Badge>
                      </div>
                      <p className="mt-2 overflow-hidden text-xs leading-relaxed text-slate-600 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                        {mail.summary || mail.fileName || "Courrier recu"}
                      </p>
                      <div className="mt-3 flex justify-end">
                        <Button asChild size="sm" variant="ghost" className="min-h-10 rounded-xl text-primary hover:text-primary">
                          <Link href={`/admin/mails?searchTerm=${encodeURIComponent(mail.clientName || mail.companyName || mail.fileName || "")}`}>
                            Voir le flux
                            <ChevronRight className="ml-1 h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
