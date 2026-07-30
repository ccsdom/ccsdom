// src/app/admin/activity/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, Search, ArrowUpDown, Info, History, Zap, Settings, Shield, Filter, LayoutGrid, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import {
  collection,
  query,
  orderBy,
  limit,
  or,
  type Timestamp,
  type Query as FsQuery,
  type DocumentData,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useFirebase, useDb, useCollection, useMemoFirebase } from "@/firebase";
import { useCenterAccess } from "@/hooks/use-center-access";
import { canManageClients } from "@/lib/access-control";
import { buildActivityCenterFilters as buildSharedActivityCenterFilters } from "@/lib/admin-notification-events";
import { cn } from "@/lib/utils";

/* =========================
   Types
========================= */

import { UserRole } from "@/lib/constants/roles";

type ActivityType =
  | "client.bulk_delete"
  | "client.bulk_status_update"
  | "client.delete"
  | "client.update"
  | string;

type BulkResults = {
  requested?: number;

  deletedClients?: number;
  deletedUserDocs?: number;
  deletedAuthUsers?: number;

  missingClientsCount?: number;
  missingAuthUidCount?: number;
  authDeleteErrorsCount?: number;

  // samples (si tu les stockes)
  missingClientsSample?: string[];
  missingAuthUidSample?: string[];
  authDeleteErrorsSample?: { clientId: string; uid: string; error: string }[];
  errorsSample?: { clientId: string; code: string; message: string }[];

  // bulk status update
  updated?: number;
  missingCount?: number;
  missing?: string[];

  // (optionnel) certains logs peuvent stocker toStatus côté results
  toStatus?: string;
};

type ActivityLog = {
  id?: string;

  type?: ActivityType;

  actorUid?: string;
  actorRole?: string | null;

  centerId?: string | null;
  centerKey?: string | null;
  centerIds?: string[];

  // logs unitaires
  clientId?: string | null;
  clientUid?: string | null;
  targetUid?: string | null;
  targetEmail?: string | null;
  fromRole?: string | null;
  toRole?: string | null;
  toStatus?: string | null;
  requestUid?: string | null;
  mailId?: string | null;
  to?: string | null;
  subject?: string | null;
  reason?: string | null;
  error?: string | null;
  preference?: string | null;
  recipientCount?: number | null;
  candidateCount?: number | null;
  emailQueueId?: string | null;
  createdAuthUser?: boolean;

  createdAt?: Timestamp | any;

  // logs bulk
  targetCount?: number;
  targetIdsSample?: string[];
  results?: BulkResults;
  bulkId?: string;
};

/* =========================
   Helpers
========================= */

function toDateSafe(v: any): Date | null {
  if (!v) return null;
  if (typeof v?.toDate === "function") return v.toDate();
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDateTime(v: any) {
  const d = toDateSafe(v);
  if (!d) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

function typeLabel(t: string) {
  if (t === "client.bulk_delete") return "Suppression (bulk)";
  if (t === "client.bulk_status_update") return "Statut (bulk)";
  if (t === "client.delete") return "Suppression";
  if (t === "client.update") return "MàJ client";
  return t || "—";
}

function typeVariant(t: string): React.ComponentProps<typeof Badge>["variant"] {
  if ((t || "").includes("delete")) return "destructive";
  if ((t || "").includes("status")) return "secondary";
  return "outline";
}

function centerLabel(centerId?: string | null) {
  if (centerId === "paris_12e") return "Paris 12e";
  if (centerId === "orly_ville") return "Orly";
  if (!centerId) return "—";
  return centerId;
}

function isBulk(t?: string) {
  return (t || "").startsWith("client.bulk_");
}

function displayTypeLabel(t?: string | null) {
  const type = t || "";
  const labels: Record<string, string> = {
    "client.bulk_delete": "Suppression (bulk)",
    "client.bulk_status_update": "Statut (bulk)",
    "client.delete": "Suppression",
    "client.delete.auth_error": "Erreur Auth",
    "client.update": "Maj client",
    "center.governance_updated": "Gouvernance centre",
    "center.suspended": "Centre suspendu",
    "center.reactivated": "Centre reactive",
    "user.role_set": "Role utilisateur",
    "user.super_admin_updated": "Super admin",
    "signup.provisioned": "Acces client cree",
    "signup.provisioning_failed": "Echec acces client",
    "signup.approved": "Dossier approuve",
    "signup.rejected": "Dossier rejete",
    "signup.staff_notification_queued": "Notif inscription",
    "signup.staff_notification_skipped": "Notif inscription ignoree",
    "staff.daily_summary_queued": "Resume quotidien",
    "mail.received": "Courrier recu",
    "client.follow_up_sent": "Relance envoyee",
    "client.follow_up_prepared": "Relance preparee",
  };
  return labels[type] || type || "—";
}

function displayTypeVariant(t?: string | null): React.ComponentProps<typeof Badge>["variant"] {
  const type = t || "";
  if (type.includes("delete") || type.includes("failed") || type.includes("error")) {
    return "destructive";
  }
  if (type.includes("suspended")) {
    return "destructive";
  }
  if (type.includes("follow_up")) {
    return "secondary";
  }
  if (type.includes("status") || type.startsWith("signup.")) {
    return "secondary";
  }
  if (type.includes("reactivated") || type.includes("governance")) {
    return "outline";
  }
  return "outline";
}

function getLogCenterId(l: ActivityLog) {
  if (l.centerId) return l.centerId;
  if (l.centerKey) return l.centerKey;
  if (l.centerIds?.length === 1) return l.centerIds[0];
  if ((l.centerIds?.length || 0) > 1) return "global";
  return null;
}

function displayCenterLabel(centerId?: string | null) {
  if (centerId === "paris_12e" || centerId === "paris") return "Paris 12e";
  if (centerId === "orly_ville" || centerId === "orly") return "Orly";
  if (centerId === "global") return "Reseau";
  if (!centerId) return "—";
  return centerId;
}

function buildActivityCenterFilters(centerIds: string[]) {
  return buildSharedActivityCenterFilters(centerIds);
}

function normalizeText(v: any) {
  return String(v ?? "").toLowerCase();
}

function buildHaystack(l: ActivityLog) {
  const r = l.results || {};
  return [
    l.type,
    l.actorRole,
    l.actorUid,
    l.centerId,
    l.centerKey,
    l.centerIds?.join(" "),
    l.clientId,
    l.clientUid,
    l.targetUid,
    l.targetEmail,
    l.fromRole,
    l.toRole,
    l.toStatus,
    l.requestUid,
    l.mailId,
    l.to,
    l.subject,
    l.reason,
    l.preference,
    l.recipientCount,
    l.candidateCount,
    l.emailQueueId,
    l.error,
    l.targetCount,
    r.requested,
    r.deletedClients,
    r.deletedAuthUsers,
    r.updated,
    r.missingClientsCount,
    r.missingCount,
    r.toStatus,
  ]
    .map(normalizeText)
    .join(" ");
}

/** ✅ lecture safe: unknown -> string|null */
function getStringField(obj: unknown, key: string): string | null {
  if (!obj || typeof obj !== "object") return null;
  const v = (obj as Record<string, unknown>)[key];
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function summaryForLog(l: ActivityLog) {
  const t = l.type || "";
  const r = l.results || {};

  // Bulk delete
  if (t === "client.bulk_delete") {
    const requested = r.requested ?? l.targetCount ?? 0;
    const deletedClients = r.deletedClients ?? 0;
    const deletedAuth = r.deletedAuthUsers ?? 0;
    const missingClients = r.missingClientsCount ?? 0;
    const authErr = r.authDeleteErrorsCount ?? 0;

    return {
      primary: `Cible: ${requested} · Clients supprimés: ${deletedClients} · Auth OK: ${deletedAuth}`,
      secondary:
        missingClients || authErr
          ? `Manquants: ${missingClients} · Erreurs Auth: ${authErr}`
          : "OK (aucune anomalie)",
    };
  }

  // Bulk status update
  if (t === "client.bulk_status_update") {
    const requested = r.requested ?? l.targetCount ?? 0;
    const updated = r.updated ?? 0;
    const missingCount = r.missingCount ?? 0;

    const toStatus =
      l.toStatus ||
      r.toStatus ||
      getStringField(r, "toStatus") ||
      null;

    return {
      primary: `Cible: ${requested} · Mis à jour: ${updated}${
        toStatus ? ` · Statut → ${toStatus}` : ""
      }`,
      secondary: missingCount ? `Manquants: ${missingCount}` : "OK (aucun manquant)",
    };
  }

  // Unitaire
  if (t === "client.delete") {
    return { primary: "Suppression client", secondary: "Action unitaire" };
  }
  if (t === "client.update") {
    return {
      primary: "Mise à jour client",
      secondary: l.toStatus ? `Statut → ${l.toStatus}` : "Action unitaire",
    };
  }

  if (t === "client.delete.auth_error") {
    return {
      primary: "Compte client supprime, anomalie sur Auth",
      secondary: l.error || "Erreur Auth non detaillee",
    };
  }

  if (t === "user.role_set") {
    const fromRole = l.fromRole || "aucun";
    const toRole = l.toRole || "non renseigne";
    return {
      primary: `Role attribue : ${fromRole} -> ${toRole}`,
      secondary: l.targetEmail || l.targetUid || "Utilisateur cible non renseigne",
    };
  }

  if (t === "user.super_admin_updated") {
    return {
      primary: "Mise a jour du super administrateur",
      secondary: l.targetEmail || l.targetUid || "Compte systeme",
    };
  }

  if (t === "signup.provisioned") {
    return {
      primary: "Compte client cree / acces provisionne",
      secondary: l.clientId || l.clientUid || l.requestUid || "Dossier client",
    };
  }

  if (t === "signup.provisioning_failed") {
    return {
      primary: "Echec de provisionnement client",
      secondary: l.error || l.clientId || l.requestUid || "A investiguer",
    };
  }

  if (t === "signup.approved") {
    return {
      primary: "Dossier client approuve",
      secondary: l.clientId || l.clientUid || l.requestUid || "Demande validee",
    };
  }

  if (t === "signup.rejected") {
    return {
      primary: "Dossier client rejete",
      secondary: l.clientId || l.clientUid || l.requestUid || "Demande refusee",
    };
  }

  if (t === "signup.staff_notification_queued") {
    return {
      primary: "Alerte inscription envoyee a l'equipe du centre",
      secondary: `${l.recipientCount ?? 0} destinataire(s)${
        l.emailQueueId ? ` - file email ${l.emailQueueId}` : ""
      }`,
    };
  }

  if (t === "signup.staff_notification_skipped") {
    return {
      primary: "Alerte inscription ignoree selon les preferences",
      secondary: `${l.candidateCount ?? 0} membre(s) eligible(s), ${l.recipientCount ?? 0} destinataire actif`,
    };
  }

  if (t === "staff.daily_summary_queued") {
    return {
      primary: "Resume quotidien envoye a l'equipe du centre",
      secondary: `${l.recipientCount ?? 0} destinataire(s)${
        l.emailQueueId ? ` - file email ${l.emailQueueId}` : ""
      }`,
    };
  }

  if (t === "client.follow_up_sent") {
    return {
      primary: "Relance client envoyee",
      secondary: l.to
        ? `${l.to}${l.subject ? ` - ${l.subject}` : ""}`
        : l.requestUid || "Email place dans la file d'envoi",
    };
  }

  if (t === "client.follow_up_prepared") {
    return {
      primary: "Relance client preparee",
      secondary: l.reason || l.requestUid || l.clientId || "Dossier client",
    };
  }

  if (t === "mail.received") {
    return {
      primary: "Nouveau courrier enregistre",
      secondary: l.mailId || l.clientId || l.clientUid || "Courrier client",
    };
  }

  return { primary: "—", secondary: "—" };
}

function actorTargetLabel(l: ActivityLog) {
  const actor = l.actorRole || (l.actorUid === "system" ? "system" : "Automate");
  const target =
    l.targetEmail ||
    l.targetUid ||
    l.clientId ||
    l.clientUid ||
    l.requestUid ||
    l.mailId ||
    l.to ||
    null;

  return { actor, target };
}

/* =========================
   UI: Bulk details dialog
========================= */

function BulkDetails({ log }: { log: ActivityLog }) {
  const r = log.results || {};
  const t = log.type || "";

  const title =
    t === "client.bulk_delete"
      ? "Détails suppression (bulk)"
      : t === "client.bulk_status_update"
        ? "Détails statut (bulk)"
        : "Détails";

  const statusFromResults =
    log.toStatus ||
    r.toStatus ||
    getStringField(r, "toStatus") ||
    null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 hover:bg-primary/10 hover:text-primary transition-all gap-2 group">
          <Info className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="hidden sm:inline">Détails</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl bg-background/80 backdrop-blur-xl border-white/10 shadow-2xl p-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 pointer-events-none" />
        
        <DialogHeader className="p-8 pb-4 relative">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
              <Zap className="h-6 w-6 text-primary glow-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold font-headline tracking-tight">
                {title}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground/80">
                Action exécutée le {formatDateTime(log.createdAt)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 pt-2 space-y-6 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Section: Résumé de l'opération */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                <div className="flex items-center gap-2 mb-3">
                  <LayoutGrid className="h-4 w-4 text-primary" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary/80">Opération</h4>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cible :</span>
                    <span className="font-semibold">{r.requested ?? log.targetCount ?? "—"}</span>
                  </div>

                  {t === "client.bulk_delete" ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Clients supprimés :</span>
                        <span className="font-semibold text-destructive">{r.deletedClients ?? "—"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Auth supprimés :</span>
                        <span className="font-semibold">{r.deletedAuthUsers ?? "—"}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Mis à jour :</span>
                        <span className="font-semibold text-primary">{r.updated ?? "—"}</span>
                      </div>
                      {statusFromResults && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Nouveau statut :</span>
                          <Badge variant="outline" className="text-[10px] uppercase font-bold py-0">{statusFromResults}</Badge>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Anomalies segment */}
              {(r.missingClientsCount || r.authDeleteErrorsCount || r.missingCount) ? (
                <div className="bg-amber-500/5 rounded-xl p-4 border border-amber-500/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-4 w-4 text-amber-500" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600/80">Exceptions</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    {r.missingClientsCount ? (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Clients manquants :</span>
                        <span className="font-medium text-amber-600">{r.missingClientsCount}</span>
                      </div>
                    ) : null}
                    {r.authDeleteErrorsCount ? (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Erreurs Auth :</span>
                        <span className="font-medium text-destructive">{r.authDeleteErrorsCount}</span>
                      </div>
                    ) : null}
                     {r.missingCount ? (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Manquants :</span>
                        <span className="font-medium text-amber-600">{r.missingCount}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </motion.div>

            {/* Section: Acteur */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 h-full">
                <div className="flex items-center gap-2 mb-3">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Audit</h4>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Rôle Acteur</div>
                    <Badge variant="secondary" className="font-bold">{log.actorRole || "Automate"}</Badge>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">UID Acteur</div>
                    <div className="font-mono text-[10px] break-all bg-black/20 p-2 rounded border border-white/5">
                      {log.actorUid || "SYSTEM"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">ID Log</div>
                    <div className="font-mono text-[10px] text-muted-foreground">
                      {log.id || "—"}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Section: Échantillon (Full width) */}
          {((log.targetIdsSample?.length || 0) > 0) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-black/10 rounded-xl p-4 border border-white/5"
            >
              <h4 className="text-[10px] font-bold uppercase text-muted-foreground mb-3 flex items-center gap-2">
                <Search className="h-3 w-3" /> Échantillon des IDs ciblés
              </h4>
              <div className="font-mono text-[10px] grid grid-cols-2 sm:grid-cols-3 gap-2 opacity-70">
                {log.targetIdsSample?.slice(0, 12).map((id, idx) => (
                  <div key={idx} className="truncate">{id}</div>
                ))}
                {log.targetIdsSample && log.targetIdsSample.length > 12 && (
                  <div className="text-muted-foreground">+{log.targetIdsSample.length - 12} autres...</div>
                )}
              </div>
            </motion.div>
          )}

          <div className="flex justify-end pt-2">
            <Button 
              variant="outline" 
              onClick={(e) => {
                const diag = (e.target as HTMLElement).closest('[role="dialog"]');
                const closeBtn = diag?.querySelector('button[aria-label="Close"]');
                (closeBtn as HTMLButtonElement)?.click();
              }}
              className="glass-premium border-white/10 hover:bg-white/5"
            >
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ActivityDetails({ log }: { log: ActivityLog }) {
  const type = log.type || "";
  const summary = summaryForLog(log);
  const actorTarget = actorTargetLabel(log);
  const centerId = getLogCenterId(log);
  const isFollowUp = type.includes("follow_up");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-2 hover:bg-primary/10 hover:text-primary">
          {isFollowUp ? (
            <Send className="h-4 w-4 text-primary" />
          ) : (
            <Info className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="hidden sm:inline">Details</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl bg-background/95 backdrop-blur-xl border-white/10 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isFollowUp ? <Send className="h-5 w-5 text-primary" /> : <Info className="h-5 w-5 text-primary" />}
            {displayTypeLabel(type)}
          </DialogTitle>
          <DialogDescription>
            Evenement enregistre le {formatDateTime(log.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold">{summary.primary}</div>
            <div className="mt-1 text-xs text-muted-foreground">{summary.secondary}</div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Centre</div>
              <div className="mt-1 text-sm font-medium">{displayCenterLabel(centerId)}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Acteur</div>
              <div className="mt-1 text-sm font-medium">{actorTarget.actor}</div>
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-white/10 bg-black/10 p-4 text-xs">
            {actorTarget.target ? (
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Cible</span>
                <span className="text-right font-mono">{actorTarget.target}</span>
              </div>
            ) : null}
            {log.to ? (
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Destinataire</span>
                <span className="text-right font-medium">{log.to}</span>
              </div>
            ) : null}
            {log.subject ? (
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Sujet</span>
                <span className="text-right font-medium">{log.subject}</span>
              </div>
            ) : null}
            {log.reason ? (
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Motif</span>
                <span className="text-right font-medium">{log.reason}</span>
              </div>
            ) : null}
            {log.requestUid ? (
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Dossier</span>
                <span className="text-right font-mono">{log.requestUid}</span>
              </div>
            ) : null}
            {log.mailId ? (
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Courrier</span>
                <span className="text-right font-mono">{log.mailId}</span>
              </div>
            ) : null}
            {log.error ? (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-2 text-destructive">
                {log.error}
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* =========================
   Page
========================= */

export default function AdminActivityPage() {
  const { firebaseApp } = useFirebase();
  const db = useDb();

  // Auth readiness
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
  const actualManagedCenterIds = roleState?.actualManagedCenterIds ?? [];
  const isRoleLoading = !!roleState?.isLoading;

  const canQuery = !!db && authReady && isSignedIn && !isRoleLoading && canManageClients(actualRole);

  const logsQuery = useMemoFirebase<FsQuery<ActivityLog, DocumentData> | null>(() => {
    if (!canQuery) return null;

    const base = collection(db!, "activity_logs");

    if (actualRole !== "super_admin") {
      const centerFilters = buildActivityCenterFilters(actualManagedCenterIds);

      if (centerFilters.length === 0) return null;

      if (centerFilters.length === 1) {
        return query(base, centerFilters[0], limit(300)) as unknown as FsQuery<
          ActivityLog,
          DocumentData
        >;
      }

      return query(base, or(...centerFilters), limit(300)) as unknown as FsQuery<
        ActivityLog,
        DocumentData
      >;
    }

    // super_admin
    return query(base, orderBy("createdAt", "desc"), limit(200)) as unknown as FsQuery<
      ActivityLog,
      DocumentData
    >;
  }, [db, canQuery, actualRole, actualManagedCenterIds]);

  const { data: logs, isLoading } = useCollection<ActivityLog>(logsQuery);

  const [search, setSearch] = React.useState("");
  const [sortDesc, setSortDesc] = React.useState(true);

  const filtered = React.useMemo(() => {
    const arr = (logs || []) as ActivityLog[];
    const t = search.trim().toLowerCase();

    let out = arr;
    if (t) out = out.filter((l) => buildHaystack(l).includes(t));

    out = [...out].sort((a, b) => {
      const da = toDateSafe(a.createdAt)?.getTime() ?? 0;
      const dbb = toDateSafe(b.createdAt)?.getTime() ?? 0;
      return sortDesc ? dbb - da : da - dbb;
    });

    return out;
  }, [logs, search, sortDesc]);

  if (!authReady || isRoleLoading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="h-7 w-7 animate-spin" />
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

  if (!canManageClients(actualRole)) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Accès refusé</CardTitle>
            <CardDescription>Cette page est réservée aux managers et super-admin.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/clients" className="underline text-sm">
              Retour à l’admin
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-premium p-6 lg:p-10 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 shadow-sm">
              <History className="h-6 w-6 text-primary glow-primary" />
            </div>
            <h1 className="text-3xl font-bold font-headline tracking-tight text-gradient">
              Journal d'Activité
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl ml-1">
            Historique complet des actions administratives. Suivi des suppressions en masse, mises à jour de statuts et audits de sécurité.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="h-8 px-4 bg-background/50 backdrop-blur-md border-white/10 font-medium">
            <span className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse" />
            {logs?.length || 0} Entrées
          </Badge>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => window.location.reload()}
            className="h-9 w-9 glass-premium border-white/10"
          >
            <Loader2 className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-premium border-white/10 shadow-premium overflow-hidden backdrop-blur-2xl bg-white/40 dark:bg-black/20">
          <CardHeader className="border-b border-white/5 space-y-6 p-6">
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
              <div className="relative group w-full lg:max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filtrer par type, centre, acteur, statut..."
                  className="pl-10 h-10 glass-premium border-white/10 focus:border-primary/50 transition-all font-medium"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setSortDesc((v) => !v)}
                  className="h-10 glass-premium border-white/10 hover:bg-white/5 font-semibold gap-2"
                >
                  <ArrowUpDown className="h-4 w-4" />
                  {sortDesc ? "Plus récents" : "Plus anciens"}
                </Button>
                
                <Button variant="ghost" size="icon" className="h-10 w-10 glass-premium border-white/10">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="grid gap-3 p-4 md:hidden">
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 text-sm text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
                    Analyse du flux d'activité...
                  </div>
                ) : filtered.length ? (
                  filtered.map((l, index) => {
                    const bulk = isBulk(l.type);
                    const summary = summaryForLog(l);
                    const type = l.type || "";
                    const actorTarget = actorTargetLabel(l);
                    const centerId = getLogCenterId(l);

                    return (
                      <motion.div
                        key={l.id || `${l.type}-${String(l.createdAt)}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                      >
                        <Card className="overflow-hidden border border-slate-200 bg-white text-slate-950 shadow-lg dark:border-white/10 dark:bg-slate-950/80 dark:text-slate-50">
                          <CardHeader className="space-y-3 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-black">
                                  {toDateSafe(l.createdAt)?.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) || "--:--"}
                                </p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                  {toDateSafe(l.createdAt)?.toLocaleDateString("fr-FR") || "Date inconnue"}
                                </p>
                              </div>
                              <Badge
                                variant={displayTypeVariant(type)}
                                className={cn(
                                  "text-[10px] font-bold uppercase tracking-tight",
                                  (type.includes("delete") || type.includes("failed") || type.includes("error")) && "border-destructive/20 bg-destructive/10 text-destructive",
                                  type.includes("bulk") && "border-primary/30 ring-1 ring-primary/20",
                                  type.startsWith("signup.") && "border-blue-500/20 bg-blue-500/10 text-blue-600",
                                  type === "mail.received" && "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
                                  type.includes("follow_up") && "border-primary/20 bg-primary/10 text-primary"
                                )}
                              >
                                {displayTypeLabel(type)}
                              </Badge>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-white/10 dark:bg-white/5">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold">{actorTarget.actor}</span>
                                <Badge variant="outline" className="bg-white text-[10px] dark:bg-white/5">
                                  {displayCenterLabel(centerId)}
                                </Badge>
                              </div>
                              <p className="mt-2 font-medium text-slate-600 dark:text-slate-300">{summary.primary}</p>
                              <p className="mt-1 text-slate-500 dark:text-slate-400">{summary.secondary}</p>
                              {!bulk && actorTarget.target && (
                                <p className="mt-2 truncate rounded-lg bg-slate-100 px-2 py-1 font-mono text-[10px] text-slate-500 dark:bg-white/5">
                                  {actorTarget.target}
                                </p>
                              )}
                            </div>
                          </CardHeader>

                          <CardContent className="flex justify-end border-t border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                            {bulk ? <BulkDetails log={l} /> : <ActivityDetails log={l} />}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="flex min-h-48 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center text-muted-foreground">
                    <Filter className="h-10 w-10 opacity-20" />
                    <p className="text-sm font-medium">Aucun log ne correspond à votre recherche.</p>
                    <Button variant="link" onClick={() => setSearch("")}>Réinitialiser les filtres</Button>
                  </div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative hidden md:block">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent border-white/5">
                    <TableHead className="w-[120px] font-bold text-[10px] uppercase tracking-widest pl-6">Temps</TableHead>
                    <TableHead className="w-[180px] font-bold text-[10px] uppercase tracking-widest text-center">Opération</TableHead>
                    <TableHead className="w-[140px] font-bold text-[10px] uppercase tracking-widest text-center">Centre</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest">Acteur / Cible</TableHead>
                    <TableHead className="text-right w-[100px] pr-6 font-bold text-[10px] uppercase tracking-widest">Détails</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {isLoading ? (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={5} className="h-64 text-center">
                          <div className="flex flex-col items-center justify-center gap-3">
                            <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
                            <p className="text-sm font-medium text-muted-foreground">Analyse du flux d'activité...</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filtered.length ? (
                      filtered.map((l, index) => {
                        const bulk = isBulk(l.type);
                        const summary = summaryForLog(l);
                        const type = l.type || "";
                        const actorTarget = actorTargetLabel(l);
                        const centerId = getLogCenterId(l);

                        return (
                          <motion.tr
                            key={l.id || `${l.type}-${String(l.createdAt)}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2, delay: index * 0.03 }}
                            className="group hover:bg-primary/[0.03] transition-colors border-white/5"
                          >
                            <TableCell className="pl-6 whitespace-nowrap">
                              <div className="flex flex-col">
                                <span className="font-semibold text-sm">{toDateSafe(l.createdAt)?.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                                <span className="text-[10px] text-muted-foreground">{toDateSafe(l.createdAt)?.toLocaleDateString('fr-FR')}</span>
                              </div>
                            </TableCell>

                            <TableCell className="text-center">
                              <Badge 
                                variant={displayTypeVariant(type)}
                                className={cn(
                                  "font-bold text-[10px] uppercase tracking-tight py-0.5 px-2.5 rounded-md",
                                  (type.includes('delete') || type.includes('failed') || type.includes('error')) && "bg-destructive/10 text-destructive border-destructive/20",
                                  type.includes('bulk') && "border-primary/30 ring-1 ring-primary/20",
                                  type.startsWith('signup.') && "bg-blue-500/10 text-blue-500 border-blue-500/20",
                                  type === "mail.received" && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                                  type.includes("follow_up") && "bg-primary/10 text-primary border-primary/20"
                                )}
                              >
                                {displayTypeLabel(type)}
                              </Badge>
                            </TableCell>

                            <TableCell className="text-center">
                              <Badge variant="outline" className="bg-background/40 backdrop-blur-sm border-white/10 text-[10px] font-medium">
                                {displayCenterLabel(centerId)}
                              </Badge>
                            </TableCell>

                            <TableCell>
                              <div className="flex items-start gap-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-foreground/80">{actorTarget.actor}</span>
                                    {!bulk && l.toStatus && (
                                      <div className="flex items-center gap-1.5 opacity-60">
                                        <ArrowUpDown className="h-3 w-3" />
                                        <Badge variant="outline" className="text-[9px] h-4 py-0">{l.toStatus}</Badge>
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground/60 transition-colors">
                                    {summary.primary}
                                  </div>
                                  <div className="text-[10px] text-muted-foreground/70">
                                    {summary.secondary}
                                  </div>
                                  {!bulk && actorTarget.target && (
                                    <div className="text-[9px] font-mono text-muted-foreground/50 flex gap-2">
                                      <span className="bg-black/5 px-1.5 rounded">{actorTarget.target}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>

                            <TableCell className="text-right pr-6">
                              {bulk ? (
                                <BulkDetails log={l} />
                              ) : (
                                <div className="flex justify-end">
                                  <ActivityDetails log={l} />{/* 
                                    {summary.secondary !== "—" ? "Resume" : "—"}
                                  */}
                                </div>
                              )}
                            </TableCell>
                          </motion.tr>
                        );
                      })
                    ) : (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={5} className="h-48 text-center">
                          <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                            <Filter className="h-10 w-10 opacity-20" />
                            <p className="text-sm font-medium">Aucun log ne correspond à votre recherche.</p>
                            <Button variant="link" onClick={() => setSearch("")}>Réinitialiser les filtres</Button>
                          </div>
                         </TableCell>
                      </TableRow>
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-between text-[11px] text-muted-foreground/60 px-2"
      >
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><Shield className="h-3 w-3" /> Chiffrement TLS v1.3</span>
          <span className="flex items-center gap-1.5"><Zap className="h-3 w-3" /> Temps Réel Actif</span>
        </div>
        <div>
          CCS DOM v4.2 • Système Audit Haute Disponibilité
        </div>
      </motion.div>
    </div>
  );
}
