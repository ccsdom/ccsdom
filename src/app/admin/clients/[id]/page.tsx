// src/app/admin/clients/[id]/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Trash2,
  Pencil,
  Building2,
  Mail,
  Phone,
  Hash,
  Shield,
  Search,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Clock,
  AlertCircle,
  ScanLine,
  User,
  CreditCard,
  History,
  FileText,
  UploadCloud
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  doc,
  onSnapshot,
  updateDoc,
  Timestamp,
  collection,
  query,
  where,
  orderBy,
  setDoc,
  type DocumentData,
} from "firebase/firestore";

import { httpsCallable, getFunctions } from "firebase/functions";
import { getStorage, ref as storageRef, uploadBytes } from "firebase/storage";

// ✅ Auth guard (stop queries on logout)
import { getAuth, onAuthStateChanged } from "firebase/auth";

// tes hooks firebase
import { useDb, useFirebase } from "@/firebase";
import { useCenterAccess } from "@/hooks/use-center-access";
import type { UserRole } from "@/lib/types/user";
import { AiClientInsights } from "@/components/admin/ai-client-insights";
import { OperationalAccessNotice } from "@/components/admin/operational-access-notice";

/* =========================
   Types
========================= */

export type ClientStatus = "Actif" | "Inactif" | "Suspendu" | "En attente de validation";

export type AddressId = "paris_12e" | "orly_ville";

type ClientDocumentType = "identityCard" | "kbis" | "proofOfAddress";

export interface Client {
  id?: string;
  uid?: string;

  // legacy
  name?: string;
  representative?: string;
  plan?: "classic" | "starter" | "business" | "premium";
  domiciliationAddressId?: AddressId;

  // nouveau modèle
  companyName?: string;
  planId?: "classic" | "starter" | "business" | "premium";
  tier?: string;
  mailPlanId?: string;

  addressId?: AddressId;
  addressKey?: string;

  siret?: string;
  email?: string;
  emailLower?: string;
  phone?: string;
  status?: ClientStatus;

  joinDate?: any;
  createdAt?: any;
  updatedAt?: any;
  documents?: Partial<Record<ClientDocumentType, string>>;
  documentsUploadMeta?: Partial<Record<ClientDocumentType, Record<string, any>>>;
}

/* =========================
   Helpers
========================= */

type BadgeVariant = React.ComponentProps<typeof Badge>["variant"];
const STATUS_BADGE_VARIANT: Record<ClientStatus, BadgeVariant> = {
  Actif: "default",
  Inactif: "secondary",
  Suspendu: "destructive",
  "En attente de validation": "outline",
} as const;

function toDateSafe(v: any): Date | null {
  if (!v) return null;
  if (typeof v?.toDate === "function") return v.toDate();
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function displayClientName(c: Client): string {
  return (c.companyName || c.name || "—").toString();
}

function displayRepresentative(c: Client): string {
  return (c.representative || "—").toString();
}

function normalizeEmail(c: Client): string {
  const e = (c.emailLower || c.email || "").toString().trim();
  return e.toLowerCase();
}

function normalizeStatus(c: Client): ClientStatus {
  return (c.status || "Actif") as ClientStatus;
}

function normalizePlan(c: Client): "classic" | "starter" | "business" | "premium" {
  if (c.planId) return c.planId;
  if (c.plan) return c.plan;

  if (c.tier === "starter") return "starter";
  if (c.tier === "business" || c.tier === "pro") return "business";
  if (c.tier === "premium") return "premium";

  if (c.mailPlanId === "classic") return "classic";
  if (c.mailPlanId === "starter") return "starter";
  if (c.mailPlanId === "business") return "business";
  if (c.mailPlanId === "premium") return "premium";

  return "starter";
}

function addressLabel(c: Client): string {
  const id = (c.domiciliationAddressId || c.addressId || "").toString();
  if (id === "paris_12e") return "Paris 12e";
  if (id === "orly_ville") return "Orly Ville";
  const key = (c.addressKey || "").toString().toLowerCase();
  if (key === "paris") return "Paris 12e";
  if (key === "orly") return "Orly Ville";
  return "—";
}

function dateLabel(v: any): string {
  const d = toDateSafe(v);
  return d ? d.toLocaleString("fr-FR") : "—";
}

const CLIENT_DOCUMENT_TYPES: Array<{
  type: ClientDocumentType;
  label: string;
  hint: string;
}> = [
  {
    type: "kbis",
    label: "KBIS",
    hint: "Extrait KBIS ou justificatif d'immatriculation",
  },
  {
    type: "identityCard",
    label: "Pièce d'identité",
    hint: "Carte d'identité, passeport ou titre de séjour",
  },
  {
    type: "proofOfAddress",
    label: "Justificatif de domicile",
    hint: "Document récent du représentant légal",
  },
];

function sanitizeStorageFileName(fileName: string): string {
  return (fileName || "document")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120) || "document";
}

function displayStorageFileName(path?: string): string {
  if (!path) return "";
  return decodeURIComponent(path.split("/").pop() || path);
}

/* =========================
   Edit Dialog (simple)
========================= */

type EditPayload = {
  companyName: string;
  representative: string;
  siret: string;
  phone: string;
  planId: "classic" | "starter" | "business" | "premium";
  status: ClientStatus;
};

function buildEditDefaults(c: Client): EditPayload {
  return {
    companyName: displayClientName(c),
    representative: (c.representative || "").toString(),
    siret: (c.siret || "").toString(),
    phone: (c.phone || "").toString(),
    planId: normalizePlan(c),
    status: normalizeStatus(c),
  };
}

const EditClientDialog = ({
  open,
  onOpenChange,
  client,
  onSave,
  saving,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  client: Client;
  onSave: (payload: EditPayload) => Promise<void>;
  saving: boolean;
}) => {
  const [form, setForm] = React.useState<EditPayload>(() => buildEditDefaults(client));

  React.useEffect(() => {
    if (open) setForm(buildEditDefaults(client));
  }, [open, client]);

  const canSubmit =
    form.companyName.trim().length >= 2 &&
    form.representative.trim().length >= 2;

  const updateField = (field: keyof EditPayload, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-background/80 backdrop-blur-xl border-white/10 shadow-2xl p-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 pointer-events-none" />
        
        <DialogHeader className="p-8 pb-4 relative">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold font-headline tracking-tight">
                Modifier le Profil Client
              </DialogTitle>
              <DialogDescription className="text-muted-foreground/80">
                Édition sécurisée des informations de <span className="text-foreground font-semibold uppercase">{displayClientName(client)}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 pt-2 space-y-6 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Section: Identité */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Raison Sociale</label>
                <div className="relative group">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    value={form.companyName}
                    onChange={(e) => updateField('companyName', e.target.value)}
                    className="pl-10 h-10 glass-premium border-white/10 focus:border-primary/50 transition-all shadow-sm"
                    placeholder="Ex: CCS DOM SAS"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">SIRET</label>
                <div className="relative group">
                  <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    value={form.siret}
                    onChange={(e) => updateField('siret', e.target.value)}
                    className="pl-10 h-10 glass-premium border-white/10 focus:border-primary/50 transition-all shadow-sm font-mono tracking-tighter"
                    placeholder="14 chiffres"
                  />
                </div>
              </div>
            </motion.div>

            {/* Section: Contact */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Représentant Légal</label>
                <div className="relative group">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    value={form.representative}
                    onChange={(e) => updateField('representative', e.target.value)}
                    className="pl-10 h-10 glass-premium border-white/10 focus:border-primary/50 transition-all shadow-sm"
                    placeholder="Nom du gérant"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Téléphone</label>
                <div className="relative group">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="pl-10 h-10 glass-premium border-white/10 focus:border-primary/50 transition-all shadow-sm"
                    placeholder="+33..."
                  />
                </div>
              </div>
            </motion.div>
          </div>

          <Separator className="bg-white/5" />

          {/* Section: Offre et Statut */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Abonnement</label>
              <Select value={form.planId} onValueChange={(v) => updateField('planId', v)}>
                <SelectTrigger className="h-10 glass-premium border-white/10 focus:ring-primary/20">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-3.5 w-3.5 text-primary" />
                    <SelectValue placeholder="Choisir un plan" />
                  </div>
                </SelectTrigger>
                <SelectContent className="glass-premium border-white/10 backdrop-blur-3xl">
                  <SelectItem value="classic" className="focus:bg-primary/10">Classic Pack</SelectItem>
                  <SelectItem value="starter" className="focus:bg-primary/10">Starter Pack</SelectItem>
                  <SelectItem value="business" className="focus:bg-primary/10">Business Pack</SelectItem>
                  <SelectItem value="premium" className="focus:bg-primary/10">Enterprise Pack</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">État du Compte</label>
              <Select value={form.status} onValueChange={(v) => updateField('status', v)}>
                <SelectTrigger className="h-10 glass-premium border-white/10 focus:ring-primary/20 capitalize">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "h-2 w-2 rounded-full shadow-sm",
                      form.status === "Actif" ? "bg-green-500 shadow-green-500/50" :
                      form.status === "Suspendu" ? "bg-destructive shadow-destructive/50" : "bg-amber-500 shadow-amber-500/50"
                    )} />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="glass-premium border-white/10 backdrop-blur-3xl">
                  <SelectItem value="Actif" className="focus:bg-green-500/10">Actif</SelectItem>
                  <SelectItem value="Inactif" className="focus:bg-muted/10">Inactif</SelectItem>
                  <SelectItem value="Suspendu" className="focus:bg-destructive/10">Suspendu</SelectItem>
                  <SelectItem value="En attente de validation" className="focus:bg-amber-500/10">À valider</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-2 gap-3 sm:gap-0 mt-4">
            <Button 
              type="button"
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="hover:bg-white/5 text-muted-foreground mr-auto"
              disabled={saving}
            >
              Annuler
            </Button>
            <Button 
              onClick={() => onSave(form)} 
              disabled={saving || !canSubmit}
              className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 h-10 px-8 transition-all active:scale-[0.98]"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Enregistrer les modifications
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* =========================
   Page
========================= */

export default function AdminClientDetailsPage() {
  const params = useParams<{ id: string }>();
  const clientId = (params?.id || "").toString();
  const router = useRouter();

  const { firebaseApp } = useFirebase();
  const db = useDb();
  const { toast } = useToast();

  // auth readiness
  const [authReady, setAuthReady] = React.useState(false);
  const [isSignedIn, setIsSignedIn] = React.useState(false);

  React.useEffect(() => {
    if (!firebaseApp) return;
    const auth = getAuth(firebaseApp);
    const unsub = onAuthStateChanged(auth, (u) => {
      setIsSignedIn(!!u);
      setAuthReady(true);
    });
    return () => unsub();
  }, [firebaseApp]);

  const roleState = useCenterAccess();
  const actualRole = (roleState?.actualRole ?? null) as UserRole | null;
  const displayRole = (roleState?.displayRole ?? null) as UserRole | null;
  const isRoleLoading = !!roleState?.isLoading;
  const isSuperAdminView = displayRole === "super_admin";

  const canQuery = !!db && authReady && isSignedIn && !isRoleLoading && !!actualRole && !isSuperAdminView;

  const canManage =
    actualRole === "manager" || actualRole === "manager_paris" || actualRole === "manager_orly";

  const canEdit = canManage || !!actualRole?.startsWith("secretary");

  const functions = React.useMemo(() => {
    if (!firebaseApp) return null;
    return getFunctions(firebaseApp, "europe-west9");
  }, [firebaseApp]);

  const [client, setClient] = React.useState<Client | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [notFound, setNotFound] = React.useState(false);

  React.useEffect(() => {
    if (!isSuperAdminView) return;
    setClient(null);
    setLoading(false);
    setNotFound(false);
  }, [isSuperAdminView]);

  const [editOpen, setEditOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [uploadingDocumentType, setUploadingDocumentType] =
    React.useState<ClientDocumentType | null>(null);

  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    if (!canQuery) return;
    if (!clientId) return;

    setLoading(true);
    setNotFound(false);

    const ref = doc(db!, "clients", clientId);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          setClient(null);
          setNotFound(true);
          setLoading(false);
          return;
        }
        setClient({ id: snap.id, ...(snap.data() as DocumentData) } as Client);
        setLoading(false);
      },
      (err) => {
        console.error("Client snapshot error:", err);
        setLoading(false);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger le client.",
        });
      }
    );

    return () => unsub();
  }, [db, canQuery, clientId, toast]);

  // --- Courriers ---
  const [mails, setMails] = React.useState<any[]>([]);
  const [mailsLoading, setMailsLoading] = React.useState(false);

  React.useEffect(() => {
    if (!db || !clientId || !canQuery) return;
    
    setMailsLoading(true);
    const q = query(
      collection(db, "mails"),
      where("clientId", "==", clientId),
      orderBy("receivedAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setMails(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setMailsLoading(false);
    }, (err) => {
      console.error("Mails fetch error:", err);
      setMailsLoading(false);
    });

    return () => unsub();
  }, [db, clientId, canQuery]);

  const updateMailStatus = async (mailId: string, newStatus: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "mails", mailId), {
        status: newStatus,
        updatedAt: Timestamp.now()
      });
      toast({ title: "Statut mis à jour" });
    } catch (e) {
      toast({ variant: "destructive", title: "Erreur" });
    }
  };

  const updateClient = React.useCallback(
    async (payload: EditPayload) => {
      if (!db || !clientId) return;
      setSaving(true);
      try {
        const cleanPayload = {
          companyName: payload.companyName,
          name: payload.companyName, // compat UI legacy
          representative: payload.representative,
          phone: payload.phone.trim(),
          siret: payload.siret.replace(/\D+/g, ""),
          planId: payload.planId,
          plan: payload.planId, // compat UI legacy
          status: payload.status,
        };

        if (functions && canManage) {
          const fn = httpsCallable(functions, "adminUpdateClient");
          await fn({
            clientId,
            data: {
              name: cleanPayload.companyName,
              representative: cleanPayload.representative,
              phone: cleanPayload.phone,
              siret: cleanPayload.siret,
              plan: cleanPayload.planId,
              status: cleanPayload.status,
            },
          });
        } else {
          const ref = doc(db, "clients", clientId);
          await updateDoc(ref, {
            ...cleanPayload,
            updatedAt: Timestamp.now(),
          } as any);
        }

        toast({
          title: "Client mis à jour",
          description: "Les modifications ont été enregistrées.",
        });
        setEditOpen(false);
      } catch (e: any) {
        console.error("update client error:", e);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: e?.message || "Impossible de mettre à jour le client.",
        });
      } finally {
        setSaving(false);
      }
    },
    [db, clientId, functions, canManage, toast]
  );

  const quickStatus = React.useCallback(
    async (status: ClientStatus) => {
      if (!db || !clientId) return;
      try {
        await updateDoc(doc(db, "clients", clientId), {
          status,
          updatedAt: Timestamp.now(),
        } as any);
        toast({ title: "Statut mis à jour", description: `Nouveau statut : ${status}` });
      } catch (e: any) {
        console.error("status update error:", e);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: e?.message || "Impossible de changer le statut.",
        });
      }
    },
    [db, clientId, toast]
  );

  const deleteClient = React.useCallback(async () => {
    if (!functions || !clientId) return;
    setDeleting(true);
    try {
      const fn = httpsCallable(functions, "adminDeleteClient");
      await fn({ clientId });

      toast({
        title: "Client supprimé",
        description: "Suppression effectuée (Firestore + Auth).",
      });

      router.push("/admin/clients");
    } catch (e: any) {
      console.error("delete client error:", e);
      let desc = e?.message || "Impossible de supprimer ce client.";
      if (e?.code === "functions/permission-denied") desc = "Droits insuffisants.";
      toast({ variant: "destructive", title: "Erreur", description: desc });
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  }, [functions, clientId, toast, router]);

  const uploadClientDocument = React.useCallback(
    async (docType: ClientDocumentType, file: File) => {
      if (!firebaseApp || !db || !clientId || !client) return;

      const isAllowedType = file.type === "application/pdf" || file.type.startsWith("image/");
      if (!isAllowedType) {
        toast({
          variant: "destructive",
          title: "Format non supporté",
          description: "Seuls les PDF et les images sont acceptés.",
        });
        return;
      }

      if (file.size > 15 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "Fichier trop volumineux",
          description: "La taille maximale autorisée est de 15 Mo.",
        });
        return;
      }

      setUploadingDocumentType(docType);
      try {
        const auth = getAuth(firebaseApp);
        const storage = getStorage(firebaseApp);
        const safeName = sanitizeStorageFileName(file.name);
        const storagePath = `documents/${clientId}/${docType}/${Date.now()}-${safeName}`;
        const now = Timestamp.now();
        const uploadedBy = auth.currentUser?.uid || null;

        await uploadBytes(storageRef(storage, storagePath), file, {
          contentType: file.type || "application/octet-stream",
          customMetadata: {
            uploadedBy: uploadedBy || "",
            uploadedFrom: "admin_client_detail",
            clientId,
            docType,
          },
        });

        const nextDocuments = {
          ...(client.documents || {}),
          [docType]: storagePath,
        };
        const documentsRequiredCompleted = CLIENT_DOCUMENT_TYPES.every((item) =>
          Boolean(nextDocuments[item.type])
        );

        const uploadMeta = {
          contentType: file.type || "application/octet-stream",
          size: file.size,
          uploadedAt: now,
          uploadedBy,
          source: "staff_upload",
          type: docType,
          fileName: file.name,
        };

        const sharedPatch = {
          documents: {
            [docType]: storagePath,
          },
          documentsUploadMeta: {
            [docType]: uploadMeta,
          },
          documentsMeta: {
            [docType]: {
              type: docType,
              mime: file.type || "application/octet-stream",
              ts: now,
              source: "staff_upload",
              validated: false,
            },
          },
          documentsRequiredCompleted,
          ...(documentsRequiredCompleted ? { docsReadyAt: now } : {}),
          updatedAt: now,
        };

        const centerId = client.domiciliationAddressId || client.addressId || "";
        const addressKey =
          client.addressKey ||
          (centerId === "paris_12e" ? "paris" : centerId === "orly_ville" ? "orly" : "");
        const requestContextPatch: Record<string, any> = {
          uid: clientId,
          ownerUid: clientId,
          email: normalizeEmail(client),
          emailLower: normalizeEmail(client),
          companyName: displayClientName(client),
          name: displayClientName(client),
          representative: displayRepresentative(client),
        };

        if (centerId) {
          requestContextPatch.centerId = centerId;
          requestContextPatch.addressId = centerId;
        }

        if (addressKey) {
          requestContextPatch.addressKey = addressKey;
          requestContextPatch.locationKey = addressKey;
        }

        await setDoc(doc(db, "clients", clientId), sharedPatch, { merge: true });

        let requestMirrorSynced = true;
        try {
          await setDoc(
            doc(db, "client_requests", clientId),
            {
              ...sharedPatch,
              ...requestContextPatch,
            },
            { merge: true }
          );
        } catch (mirrorError) {
          requestMirrorSynced = false;
          console.warn("client request document mirror upload skipped:", mirrorError);
        }

        toast({
          title: "Document ajouté",
          description: requestMirrorSynced
            ? "La pièce a été téléversée. L'analyse IA se lancera en arrière-plan."
            : "La pièce est attachée au client. Le miroir validation n'a pas pu être synchronisé automatiquement.",
        });
      } catch (error: any) {
        console.error("client document upload error:", error);
        toast({
          variant: "destructive",
          title: "Échec du téléversement",
          description: error?.message || "Impossible d'ajouter ce document.",
        });
      } finally {
        setUploadingDocumentType(null);
      }
    },
    [firebaseApp, db, clientId, client, toast]
  );

  if (!authReady || isRoleLoading || loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Session terminée</CardTitle>
            <CardDescription>Veuillez vous reconnecter.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isSuperAdminView) {
    return (
      <OperationalAccessNotice
        title="Detail client reserve aux equipes des centres"
        description="La fiche client est un espace de suivi operationnel. Le super admin garde une vision reseau et gouvernance, sans modifier directement les dossiers clients des centres."
      />
    );
  }

  if (notFound || !client) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/clients">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Client introuvable</CardTitle>
            <CardDescription>Ce client n’existe pas (ou a été supprimé).</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const status = normalizeStatus(client);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto"
    >
      {/* Header Elite */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button 
              variant="ghost" 
              asChild 
              className="hover:bg-accent/10 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Link href="/admin/clients">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour au tableau de bord
              </Link>
            </Button>
          </motion.div>

          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight font-headline flex items-center gap-3">
              {displayClientName(client)}
              <Badge
                variant={STATUS_BADGE_VARIANT[status]}
                className={cn(
                  "px-3 py-1 text-xs font-semibold rounded-full",
                  status === "En attente de validation" && "bg-amber-500/10 text-amber-500 border-amber-500/20"
                )}
              >
                {status}
              </Badge>
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <span className="opacity-70">ID:</span> 
              <span className="font-mono text-xs bg-muted/50 px-2 py-0.5 rounded">{client.id}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {canEdit && (
            <Button 
              variant="outline" 
              onClick={() => setEditOpen(true)}
              className="glass-premium border-primary/20 hover:bg-primary/5 shadow-sm"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Modifier le profil
            </Button>
          )}

          {canManage && (
            <Button
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
              disabled={deleting}
              className="shadow-lg shadow-destructive/20"
            >
              {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Supprimer
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Core Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* IA Copilot Section */}
          <AnimatePresence>
            {canManage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <AiClientInsights client={client} />
              </motion.div>
            )}
          </AnimatePresence>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-muted/50 p-1 glass-premium border-muted/20">
              <TabsTrigger value="overview" className="data-[state=active]:glass-premium">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="mails" className="data-[state=active]:glass-premium">Courriers</TabsTrigger>
              <TabsTrigger value="billing" className="data-[state=active]:glass-premium">Facturation</TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:glass-premium">Activité</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 outline-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glass-premium shadow-premium border-white/10">
                  <CardHeader className="pb-3 px-6">
                    <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                      <Building2 className="h-4 w-4" />
                      Informations Entreprise
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 space-y-4">
                    <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                      <span className="text-muted-foreground">Raison Sociale</span>
                      <span className="font-medium">{displayClientName(client)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                      <span className="text-muted-foreground">SIRET</span>
                      <span className="font-mono">{client.siret || "—"}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                      <span className="text-muted-foreground">Représentant</span>
                      <span className="font-medium">{displayRepresentative(client)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                      <span className="text-muted-foreground">Adresse de Domiciliation</span>
                      <Badge variant="outline" className="bg-primary/5 border-primary/10">
                        {addressLabel(client)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-premium shadow-premium border-white/10">
                  <CardHeader className="pb-3 px-6">
                    <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                      <Phone className="h-4 w-4" />
                      Contact & Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 space-y-4">
                    <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                      <span className="text-muted-foreground">Email Principal</span>
                      <span className="font-medium text-primary hover:underline cursor-pointer">
                        {normalizeEmail(client) || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                      <span className="text-muted-foreground">Téléphone</span>
                      <span className="font-medium">{client.phone || "—"}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                      <span className="text-muted-foreground">Offre de Services</span>
                      <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
                        {normalizePlan(client).toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                      <span className="text-muted-foreground">Date d'inscription</span>
                      <span className="text-muted-foreground">
                        {dateLabel(client.joinDate || client.createdAt)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions Card */}
              <Card className="glass-premium shadow-premium border-primary/10 overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Sparkles className="h-24 w-24" />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">Actions Rapides</CardTitle>
                  <CardDescription>Gérez l'accès et les services de ce client instantanément.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 glass-premium" asChild>
                    <Link href={`/admin/scan?clientId=${clientId}`}>
                      <ScanLine className="h-5 w-5 text-primary" />
                      <span className="text-xs">Nouveau Scan</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 glass-premium">
                    <Mail className="h-5 w-5 text-blue-500" />
                    <span className="text-xs">Envoyer Email</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex flex-col gap-2 glass-premium"
                    onClick={() => quickStatus(status === "Actif" ? "Suspendu" : "Actif")}
                  >
                    <Shield className={cn("h-5 w-5", status === "Actif" ? "text-amber-500" : "text-green-500")} />
                    <span className="text-xs">{status === "Actif" ? "Suspendre" : "Activer"}</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 glass-premium">
                    <ExternalLink className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs">Accès Client</span>
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass-premium shadow-premium border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Documents administratifs
                  </CardTitle>
                  <CardDescription>
                    Ajoutez les pièces du client lorsque le manager ou la secrétaire accompagne le dépôt.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {CLIENT_DOCUMENT_TYPES.map((docItem) => {
                    const storagePath = client.documents?.[docItem.type];
                    const isUploading = uploadingDocumentType === docItem.type;
                    const inputId = `client-doc-${docItem.type}`;

                    return (
                      <div
                        key={docItem.type}
                        className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{docItem.label}</span>
                            {storagePath ? (
                              <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                Déposé
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-amber-500/20 text-amber-600">
                                À fournir
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{docItem.hint}</p>
                          {storagePath ? (
                            <p className="truncate text-[11px] text-muted-foreground">
                              {displayStorageFileName(storagePath)}
                            </p>
                          ) : null}
                        </div>

                        <div className="shrink-0">
                          <input
                            id={inputId}
                            type="file"
                            accept="application/pdf,image/*"
                            className="hidden"
                            disabled={!canEdit || isUploading}
                            onChange={(event) => {
                              const file = event.currentTarget.files?.[0];
                              event.currentTarget.value = "";
                              if (file) void uploadClientDocument(docItem.type, file);
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full glass-premium sm:w-auto"
                            disabled={!canEdit || isUploading}
                            onClick={() => document.getElementById(inputId)?.click()}
                          >
                            {isUploading ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <UploadCloud className="mr-2 h-4 w-4" />
                            )}
                            {storagePath ? "Remplacer" : "Téléverser"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mails" className="space-y-6 outline-none">
              <Card className="glass-premium shadow-premium">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Historique des Courriers</CardTitle>
                    <CardDescription>{mails.length} courrier(s) enregistré(s) au total.</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild className="glass-premium">
                    <Link href={`/admin/scan?clientId=${clientId}`}>
                      <ScanLine className="mr-2 h-4 w-4" />
                      Scanner un document
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mailsLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
                    </div>
                  ) : mails.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed rounded-xl border-muted/20">
                      <Mail className="h-10 w-10 mx-auto text-muted-foreground/30 mb-4" />
                      <p className="text-muted-foreground">Aucun courrier n'a encore été scanné pour ce client.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {mails.map((mail, idx) => (
                        <motion.div
                          key={mail.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <Card className={cn(
                            "group transition-all hover:bg-white/5 border-l-4",
                            (mail.aiAnalysis?.urgency === 'high' || mail.status === 'Urgent') 
                              ? "border-l-destructive shadow-lg shadow-destructive/5" 
                              : "border-l-primary/30"
                          )}>
                            <CardContent className="p-4 flex items-center justify-between gap-4">
                              <div className="flex items-start gap-3">
                                <div className={cn(
                                  "p-2 rounded-lg",
                                  (mail.aiAnalysis?.urgency === 'high' || mail.status === 'Urgent') 
                                    ? "bg-destructive/10 text-destructive" 
                                    : "bg-primary/10 text-primary"
                                )}>
                                  <Mail className="h-5 w-5" />
                                </div>
                                <div className="space-y-1">
                                  <div className="font-medium text-sm flex items-center gap-2">
                                    {mail.fileName}
                                    {(mail.aiAnalysis?.urgency === 'high' || mail.status === 'Urgent') && (
                                      <Badge variant="destructive" className="text-[10px] uppercase h-4 px-1">Urgent</Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {dateLabel(mail.receivedAt)}
                                    </span>
                                    {mail.aiAnalysis?.category && (
                                      <span className="flex items-center gap-1 capitalize">
                                        <Sparkles className="h-3 w-3 text-amber-500" />
                                        {mail.aiAnalysis.category}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing" className="outline-none">
              <Card className="glass-premium border-dashed border-muted/50">
                <CardContent className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="p-4 bg-muted/20 rounded-full">
                    <CreditCard className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold">Historique de facturation</h3>
                    <p className="text-sm text-muted-foreground">La synchronisation avec Stripe est en cours de chargement...</p>
                  </div>
                  <Button variant="outline" size="sm" className="glass-premium mt-4">
                    Voir sur Stripe Dashboard
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="outline-none">
              <Card className="glass-premium border-dashed border-muted/50">
                <CardContent className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="p-4 bg-muted/20 rounded-full">
                    <History className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold">Journal d'activité</h3>
                    <p className="text-sm text-muted-foreground">Aucun événement récent enregistré.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: Status & Timeline Summary */}
        <div className="space-y-6">
          <Card className="glass-premium shadow-premium overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-primary to-blue-600" />
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Statut du Compte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Usage Courrier (Mois)</span>
                  <span>{mails.length} / 50</span>
                </div>
                <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((mails.length / 50) * 100, 100)}%` }}
                    className="h-full bg-primary"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Button 
                  className={cn(
                    "w-full shadow-lg shadow-primary/10",
                    status === "Actif" ? "bg-primary" : "bg-muted-foreground/20 hover:bg-muted-foreground/30"
                  )}
                  onClick={() => quickStatus("Actif")}
                  disabled={status === "Actif"}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Rétablir l'accès
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full glass-premium"
                  onClick={() => quickStatus("Suspendu")}
                  disabled={status === "Suspendu"}
                >
                  <AlertCircle className="mr-2 h-4 w-4 text-amber-500" />
                  Suspendre le client
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-premium shadow-premium">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                <Clock className="h-4 w-4" />
                Chronologie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative pl-6 border-l-2 border-muted/20 space-y-6 py-2">
                <div className="relative">
                  <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-primary border-4 border-background" />
                  <p className="text-xs font-semibold">Aujourd'hui</p>
                  <p className="text-xs text-muted-foreground">Consultation du profil par l'administration</p>
                </div>
                <div className="relative opacity-60">
                  <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-muted border-4 border-background" />
                  <p className="text-xs font-semibold">{dateLabel(client.updatedAt)}</p>
                  <p className="text-xs text-muted-foreground">Dernière mise à jour système</p>
                </div>
                <div className="relative opacity-40">
                  <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-muted border-4 border-background" />
                  <p className="text-xs font-semibold">{dateLabel(client.joinDate || client.createdAt)}</p>
                  <p className="text-xs text-muted-foreground">Création du compte client</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/10 overflow-hidden relative">
            <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
              <Building2 className="h-32 w-32" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-primary flex items-center gap-2">
                <Sparkles className="h-3 w-3" />
                NOTE INTERNE
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[11px] leading-relaxed text-primary/80 italic">
                Ce client utilise principalement le scan de courriers pour sa gestion administrative. 
                Vérifier régulièrement l'exactitude des SIRET extraits par l'IA.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <EditClientDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        client={client}
        onSave={updateClient}
        saving={saving}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le compte client, ses données Firestore
              et son accès Auth seront définitivement supprimés de BizHome Hub.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                deleteClient();
              }}
              disabled={deleting}
            >
              {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
