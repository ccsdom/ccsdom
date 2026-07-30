"use client";

import React from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  FileWarning,
  Inbox,
  Loader2,
  Mail,
  ShieldAlert,
  UserCheck,
  UserPlus,
} from "lucide-react";
import {
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  or,
  orderBy,
  query,
  setDoc,
  writeBatch,
  type DocumentData,
  type Query as FsQuery,
} from "firebase/firestore";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth, useDb } from "@/firebase";
import { useCenterAccess } from "@/hooks/use-center-access";
import { normalizeCenterId } from "@/lib/access-control";
import {
  adminNotificationFromActivityLog,
  activityLogDate,
  buildActivityCenterFilters as buildSharedActivityCenterFilters,
  formatActivityLogDate,
  type ActivityLogNotificationSource,
} from "@/lib/admin-notification-events";
import { STAFF_ROLES, type UserRole } from "@/lib/constants/roles";
import { cn } from "@/lib/utils";

type NotificationKind =
  | "signup"
  | "mail"
  | "follow_up"
  | "daily_summary"
  | "system";

type ActivityLogNotification = {
  id: string;
  type?: string | null;
  actorRole?: string | null;
  centerId?: string | null;
  centerKey?: string | null;
  addressKey?: string | null;
  locationKey?: string | null;
  requestUid?: string | null;
  clientId?: string | null;
  clientUid?: string | null;
  mailId?: string | null;
  to?: string | null;
  subject?: string | null;
  reason?: string | null;
  error?: string | null;
  recipientCount?: number | null;
  candidateCount?: number | null;
  emailQueueId?: string | null;
  createdAt?: ActivityLogNotificationSource["createdAt"];
};

type AdminNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  description: string;
  href: string;
  isRead: boolean;
  createdAt?: ActivityLogNotification["createdAt"];
  centerLabel: string;
  tone: "blue" | "emerald" | "amber" | "rose" | "slate";
};

function toDateSafe(value: ActivityLogNotification["createdAt"]): Date | null {
  return activityLogDate(value);
}

function formatDate(value: ActivityLogNotification["createdAt"]) {
  return formatActivityLogDate(value);
}

function centerLabelFromLog(log: ActivityLogNotification) {
  const raw = log.centerId || log.centerKey || log.addressKey || log.locationKey || "";
  const centerId = normalizeCenterId(raw);
  if (centerId === "paris_12e") return "Paris 12e";
  if (centerId === "orly_ville") return "Orly";
  return raw || "Réseau";
}

function buildActivityCenterFilters(centerIds: string[]) {
  return buildSharedActivityCenterFilters(centerIds);
}

function notificationForLog(log: ActivityLogNotification): AdminNotification | null {
  const sharedNotification = adminNotificationFromActivityLog(log);
  if (sharedNotification) {
    return {
      ...sharedNotification,
      isRead: false,
    };
  }

  const type = log.type || "";
  const target = log.clientId || log.clientUid || log.requestUid || log.mailId || "Événement";
  const centerLabel = centerLabelFromLog(log);

  if (type === "signup.staff_notification_queued") {
    return {
      id: log.id,
      kind: "signup",
      title: "Alerte inscription envoyée",
      description: `${log.recipientCount ?? 0} destinataire(s) staff pour ${centerLabel}.`,
      href: "/admin/activity",
      isRead: false,
      createdAt: log.createdAt,
      centerLabel,
      tone: "blue",
    };
  }

  if (type === "signup.staff_notification_skipped") {
    return {
      id: log.id,
      kind: "signup",
      title: "Alerte inscription ignorée",
      description: `Préférence désactivée : ${log.candidateCount ?? 0} membre(s) éligible(s), aucun email staff envoyé.`,
      href: "/admin/activity",
      isRead: false,
      createdAt: log.createdAt,
      centerLabel,
      tone: "amber",
    };
  }

  if (type === "staff.daily_summary_queued") {
    return {
      id: log.id,
      kind: "daily_summary",
      title: "Résumé quotidien envoyé",
      description: `${log.recipientCount ?? 0} destinataire(s) pour le centre ${centerLabel}.`,
      href: "/admin/activity",
      isRead: false,
      createdAt: log.createdAt,
      centerLabel,
      tone: "emerald",
    };
  }

  if (type === "mail.received") {
    return {
      id: log.id,
      kind: "mail",
      title: "Nouveau courrier reçu",
      description: `Courrier ${log.mailId || target} enregistré pour ${centerLabel}.`,
      href: "/admin/mails",
      isRead: false,
      createdAt: log.createdAt,
      centerLabel,
      tone: "emerald",
    };
  }

  if (type === "client.follow_up_prepared" || type === "client.follow_up_sent") {
    return {
      id: log.id,
      kind: "follow_up",
      title: type === "client.follow_up_sent" ? "Relance envoyée" : "Relance à traiter",
      description: log.subject || log.reason || target,
      href: "/admin/clients",
      isRead: false,
      createdAt: log.createdAt,
      centerLabel,
      tone: type === "client.follow_up_sent" ? "emerald" : "amber",
    };
  }

  if (type === "signup.provisioning_failed") {
    return {
      id: log.id,
      kind: "system",
      title: "Échec de création d'accès client",
      description: log.error || target,
      href: "/admin/activity",
      isRead: false,
      createdAt: log.createdAt,
      centerLabel,
      tone: "rose",
    };
  }

  if (type === "signup.provisioned") {
    return {
      id: log.id,
      kind: "signup",
      title: "Accès client créé",
      description: target,
      href: "/admin/clients",
      isRead: false,
      createdAt: log.createdAt,
      centerLabel,
      tone: "blue",
    };
  }

  if (type === "signup.approved" || type === "signup.rejected") {
    return {
      id: log.id,
      kind: "signup",
      title: type === "signup.approved" ? "Dossier approuvé" : "Dossier rejeté",
      description: target,
      href: "/admin/validation",
      isRead: false,
      createdAt: log.createdAt,
      centerLabel,
      tone: type === "signup.approved" ? "emerald" : "rose",
    };
  }

  return null;
}

function NotificationIcon({ kind }: { kind: NotificationKind }) {
  if (kind === "signup") return <UserPlus className="h-5 w-5" />;
  if (kind === "mail") return <Mail className="h-5 w-5" />;
  if (kind === "follow_up") return <FileWarning className="h-5 w-5" />;
  if (kind === "daily_summary") return <UserCheck className="h-5 w-5" />;
  return <ShieldAlert className="h-5 w-5" />;
}

function toneClass(tone: AdminNotification["tone"]) {
  if (tone === "emerald") return "border-emerald-500/20 bg-emerald-500/10 text-emerald-600";
  if (tone === "amber") return "border-amber-500/20 bg-amber-500/10 text-amber-600";
  if (tone === "rose") return "border-rose-500/20 bg-rose-500/10 text-rose-600";
  if (tone === "blue") return "border-blue-500/20 bg-blue-500/10 text-blue-600";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = React.useState<AdminNotification[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);
  const auth = useAuth();
  const db = useDb();
  const roleState = useCenterAccess();

  React.useEffect(() => {
    if (!auth) return;
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setCurrentUserId(user?.uid ?? null);
    });
    return () => unsubscribeAuth();
  }, [auth]);

  React.useEffect(() => {
    const actualRole = roleState.actualRole as UserRole | null;

    if (!db || !currentUserId) {
      if (auth === null) setIsLoading(false);
      return;
    }

    if (roleState.isLoading || roleState.isCenterAccessLoading) {
      setIsLoading(true);
      return;
    }

    if (!actualRole || !STAFF_ROLES.includes(actualRole)) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    const logsCollection = collection(db, "activity_logs");
    let logsQuery: FsQuery<ActivityLogNotification, DocumentData> | null = null;

    if (actualRole === "super_admin") {
      logsQuery = query(
        logsCollection,
        orderBy("createdAt", "desc"),
        limit(120)
      ) as FsQuery<ActivityLogNotification, DocumentData>;
    } else {
      const managedCenterIds = Array.from(
        new Set(
          (roleState.actualManagedCenterIds ?? roleState.managedCenterIds ?? [])
            .map((centerId) => normalizeCenterId(centerId))
            .filter((centerId): centerId is string => Boolean(centerId))
        )
      );
      const filters = buildActivityCenterFilters(managedCenterIds);

      if (filters.length === 0) {
        setNotifications([]);
        setIsLoading(false);
        return;
      }

      logsQuery =
        filters.length === 1
          ? (query(logsCollection, filters[0], limit(120)) as FsQuery<
              ActivityLogNotification,
              DocumentData
            >)
          : (query(logsCollection, or(...filters), limit(120)) as FsQuery<
              ActivityLogNotification,
              DocumentData
            >);
    }

    setIsLoading(true);
    const unsubscribe = onSnapshot(
      logsQuery,
      async (snapshot) => {
        const readDocs = await getDocs(collection(db, `users/${currentUserId}/admin_notifications`));
        const readMap = new Map(readDocs.docs.map((readDoc) => [readDoc.id, readDoc.data().isRead === true]));

        const next = snapshot.docs
          .map((docSnap) => {
            const data = docSnap.data() as Omit<ActivityLogNotification, "id">;
            return notificationForLog({ ...data, id: docSnap.id });
          })
          .filter((item): item is AdminNotification => Boolean(item))
          .map((item) => ({
            ...item,
            isRead: readMap.get(item.id) ?? false,
          }))
          .sort((a, b) => {
            const dateA = toDateSafe(a.createdAt)?.getTime() ?? 0;
            const dateB = toDateSafe(b.createdAt)?.getTime() ?? 0;
            return dateB - dateA;
          })
          .slice(0, 60);

        setNotifications(next);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching operational notifications:", error);
        setNotifications([]);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [
    auth,
    currentUserId,
    db,
    roleState.actualManagedCenterIds,
    roleState.actualRole,
    roleState.isCenterAccessLoading,
    roleState.isLoading,
    roleState.managedCenterIds,
  ]);

  const handleMarkAllAsRead = async () => {
    if (!currentUserId || !db) return;
    const batch = writeBatch(db);
    notifications.forEach((notification) => {
      if (!notification.isRead) {
        batch.set(
          doc(db, `users/${currentUserId}/admin_notifications`, notification.id),
          { isRead: true },
          { merge: true }
        );
      }
    });
    await batch.commit();
    setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
  };

  const handleNotificationClick = async (notification: AdminNotification) => {
    if (notification.isRead || !currentUserId || !db) return;

    await setDoc(
      doc(db, `users/${currentUserId}/admin_notifications`, notification.id),
      { isRead: true },
      { merge: true }
    );
    setNotifications((current) =>
      current.map((item) => (item.id === notification.id ? { ...item, isRead: true } : item))
    );
  };

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 p-4 pb-24 sm:p-6 lg:p-8">
      <Card className="overflow-hidden border-slate-200 bg-white text-slate-950 shadow-sm">
        <CardHeader className="border-b border-slate-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <Badge className="w-fit border-blue-500/20 bg-blue-500/10 text-blue-600">
                Centre de signaux
              </Badge>
              <CardTitle className="flex items-center gap-2 text-2xl font-black tracking-tight">
                <Bell className="h-6 w-6 text-primary" />
                Notifications opérationnelles
              </CardTitle>
              <CardDescription>
                Événements réels issus de l'activité : inscriptions, courriers, relances et résumés quotidiens.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-full border-slate-200 px-3 py-1">
                {unreadCount} non lue(s)
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0 || isLoading}
                className="rounded-xl"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Tout marquer lu
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center gap-3 text-sm text-slate-500">
              <Loader2 className="h-6 w-6 animate-spin" />
              Chargement des signaux...
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center border-2 border-dashed border-slate-200 p-8 text-center text-slate-500">
              <Inbox className="mb-4 h-12 w-12" />
              <h3 className="text-xl font-semibold text-slate-800">Aucun signal récent</h3>
              <p className="mt-1 max-w-md text-sm">
                Les événements utiles apparaîtront ici dès qu'un dossier, courrier ou résumé sera traité.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((notification) => (
                <Link
                  href={notification.href}
                  key={notification.id}
                  className="block"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div
                    className={cn(
                      "flex gap-4 p-4 transition-colors hover:bg-slate-50 sm:p-5",
                      !notification.isRead && "bg-blue-50/50"
                    )}
                  >
                    <div
                      className={cn(
                        "mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border",
                        toneClass(notification.tone)
                      )}
                    >
                      <NotificationIcon kind={notification.kind} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className={cn("font-bold text-slate-900", !notification.isRead && "font-black")}>
                            {notification.title}
                          </p>
                          <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                            {notification.description}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2 text-xs text-slate-500">
                          <Badge variant="outline" className="rounded-full border-slate-200 bg-white">
                            {notification.centerLabel}
                          </Badge>
                          <span>{formatDate(notification.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    {!notification.isRead ? (
                      <div className="mt-4 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
