"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Mail,
  FileText,
  AlertTriangle,
  Loader2,
  Inbox,
  ArrowRight,
} from "lucide-react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import type { User } from "firebase/auth";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useDb } from "@/firebase";

type NotificationType = "new_mail" | "invoice" | "action_required";

interface NotificationItem {
  id: string;
  uid: string;
  type: NotificationType;
  title: string;
  description: string;
  isRead: boolean;
  createdAt: Date;
  relatedId?: string;
  status?: string;
}

function toSafeDate(value: any): Date {
  if (!value) return new Date();
  if (typeof value?.toDate === "function") return value.toDate();
  if (typeof value?.seconds === "number") return new Date(value.seconds * 1000);
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function isUnreadStatus(status: string | undefined) {
  return (
    status === "Nouveau" ||
    status === "Urgent" ||
    status === "Analyse en cours" ||
    status === "Erreur d'analyse"
  );
}

const notificationIcons: Record<NotificationType, JSX.Element> = {
  new_mail: <Mail className="h-5 w-5 text-blue-500" />,
  invoice: <FileText className="h-5 w-5 text-green-500" />,
  action_required: <AlertTriangle className="h-5 w-5 text-amber-500" />,
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const { toast } = useToast();
  const auth = useAuth();
  const db = useDb();

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = auth.onAuthStateChanged((user: User | null) => {
      setCurrentUser(user);
      if (!user) {
        setNotifications([]);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (!currentUser || !db) {
      if (!currentUser) setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setPermissionDenied(false);

    const q = query(
      collection(db, "mails"),
      where("ownerUid", "==", currentUser.uid),
      orderBy("receivedAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const mappedNotifs: NotificationItem[] = snapshot.docs.map((docSnap) => {
          const mail = docSnap.data() as any;
          const status = String(mail?.status ?? "");
          const actionRequired =
            !!mail?.analysis?.actionRequired || status === "Erreur d'analyse";

          const type: NotificationType = actionRequired
            ? "action_required"
            : "new_mail";

          return {
            id: docSnap.id,
            uid: String(mail?.uid ?? ""),
            type,
            title: actionRequired ? "Action requise" : "Nouveau courrier",
            description:
              status === "Analyse en cours"
                ? "Analyse du courrier en cours..."
                : `De : ${mail?.analysis?.sender || "Inconnu"}`,
            isRead: !isUnreadStatus(status),
            createdAt: toSafeDate(mail?.receivedAt),
            relatedId: docSnap.id,
            status,
          };
        });

        setNotifications(mappedNotifs);
        setIsLoading(false);
      },
      (error: any) => {
        console.error("Error fetching notifications:", error);
        setIsLoading(false);

        if (error?.code === "permission-denied") {
          setPermissionDenied(true);
          toast({
            variant: "destructive",
            title: "Accès refusé",
            description:
              "Le compte client n'a pas encore les permissions de lecture sur les courriers.",
          });
          return;
        }

        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger vos notifications.",
        });
      }
    );

    return () => unsubscribe();
  }, [currentUser, db, toast]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (permissionDenied) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Les événements importants de votre compte apparaîtront ici.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="rounded-lg border border-amber-500/40 bg-amber-50/60 p-4 text-amber-900 dark:bg-amber-950/20 dark:text-amber-200">
            <p className="font-medium">Lecture des courriers bloquée</p>
            <p className="mt-1 text-sm">
              Les règles Firestore n’autorisent pas encore ce client à lire la
              collection <code>mails</code>.
            </p>
            <p className="mt-2 text-sm">
              Il faut autoriser la lecture des documents dont <code>uid</code>{" "}
              est égal à l’utilisateur connecté.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Événements importants de votre compte
            </CardDescription>
          </div>

          <div className="text-sm text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} notification(s) non lue(s)`
              : "Tout est à jour"}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {notifications.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed text-center text-muted-foreground">
            <Inbox className="mb-4 h-12 w-12" />
            <h3 className="text-xl font-semibold">Aucune notification</h3>
            <p>Les nouveaux événements apparaîtront ici.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <Link
                key={notif.id}
                href={notif.type === "invoice" ? "/dashboard/subscription" : "/dashboard/mail"}
                className={cn(
                  "flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-accent/50",
                  !notif.isRead && "bg-muted/50"
                )}
              >
                <div className="mt-0.5 shrink-0">{notificationIcons[notif.type]}</div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <p className={cn("font-medium", !notif.isRead && "font-semibold")}>
                      {notif.title}
                    </p>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {notif.createdAt.toLocaleDateString("fr-FR")}
                    </span>
                  </div>

                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {notif.description}
                  </p>

                  {notif.status && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Statut : {notif.status}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!notif.isRead && (
                    <div className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}