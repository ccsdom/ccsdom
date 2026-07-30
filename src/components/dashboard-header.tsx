"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Menu,
  Search,
  Moon,
  Sun,
  LogOut,
  Home,
  Settings,
} from "lucide-react";
import { User, signOut } from "firebase/auth";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
  collection,
  getDocs,
  onSnapshot,
  or,
  orderBy,
  query,
  where,
  limit,
} from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { BetaFeedbackButton } from "@/components/beta-feedback-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DashboardNav } from "./dashboard-nav";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useToast } from "@/hooks/use-toast";
import Logo from "./logo";
import { useCenterAccess } from "@/hooks/use-center-access";
import { useAuth, useDb } from "@/firebase";
import { STAFF_ROLES } from "@/lib/constants/roles";
import { normalizeCenterId } from "@/lib/access-control";
import {
  adminNotificationFromActivityLog,
  activityLogDateOrNow,
  buildActivityCenterFilters as buildSharedActivityCenterFilters,
} from "@/lib/admin-notification-events";

type HeaderNotification = {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
};

const breadcrumbNameMap: Record<string, string> = {
  dashboard: "Tableau de bord",
  admin: "Admin",
  mail: "Courrier",
  subscription: "Abonnement",
  support: "Support",
  settings: "Paramètres",
  clients: "Clients",
  scan: "Scanner",
  adresses: "Adresses",
  validation: "Validation",
  billing: "Facturation",
  notifications: "Notifications",
  documents: "Outils",
  feedback: "Retours bêta",
  recette: "Recette",
};

function generateBreadcrumbs(pathname: string) {
  const pathSegments = pathname.split("/").filter(Boolean);
  if (pathSegments.length === 0) return null;

  const isClientDashboard = pathSegments[0] === "dashboard";
  const isClientRoot = isClientDashboard && pathSegments.length === 1;

  if (isClientRoot) return null;

  let currentPath = "";

  return (
    <Breadcrumb className="hidden md:flex">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">
              <Home className="h-4 w-4" />
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />

        {pathSegments.map((segment, index) => {
          currentPath += `/${segment}`;
          const isLast = index === pathSegments.length - 1;
          const name =
            breadcrumbNameMap[segment] ||
            segment.charAt(0).toUpperCase() + segment.slice(1);

          return (
            <React.Fragment key={currentPath}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={currentPath}>{name}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

// Logic moved to src/lib/constants/roles.ts

function toSafeDate(value: any): Date {
  if (!value) return new Date();
  if (typeof value?.toDate === "function") return value.toDate();
  if (typeof value?.seconds === "number") return new Date(value.seconds * 1000);

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function buildActivityCenterFilters(centerIds: string[]) {
  return buildSharedActivityCenterFilters(centerIds);
}

function headerNotificationFromActivity(id: string, data: any): HeaderNotification | null {
  const sharedNotification = adminNotificationFromActivityLog({ id, ...data });
  if (sharedNotification) {
    return {
      id,
      title: sharedNotification.title,
      description: sharedNotification.description,
      createdAt: activityLogDateOrNow(sharedNotification.createdAt),
    };
  }

  return null;
}

export function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { setTheme, theme } = useTheme();

  const auth = useAuth();
  const db = useDb();

  const isAdminView = pathname.startsWith("/admin");

  const [user, setUser] = useState<User | null>(null);
  const centerAccess = useCenterAccess();
  const { actualRole } = centerAccess;

  const [unreadNotifications, setUnreadNotifications] = useState<HeaderNotification[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const staffUser = useMemo(() => {
    return !!actualRole && STAFF_ROLES.includes(actualRole);
  }, [actualRole]);
  const unreadCount = unreadNotifications.length;

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = auth.onAuthStateChanged((nextUser: User | null) => {
      setUser(nextUser);
      if (!nextUser) {
        setUnreadNotifications([]);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (!user || !db || !actualRole) return;

    let unsubscribe: () => void = () => {};

    if (staffUser) {
      if (centerAccess.isLoading || centerAccess.isCenterAccessLoading) return;

      const logsCollection = collection(db, "activity_logs");
      const managedCenterIds = Array.from(
        new Set(
          (centerAccess.actualManagedCenterIds ?? centerAccess.managedCenterIds ?? [])
            .map((centerId) => normalizeCenterId(centerId))
            .filter((centerId): centerId is string => Boolean(centerId))
        )
      );
      const filters = buildActivityCenterFilters(managedCenterIds);

      if (actualRole !== "super_admin" && filters.length === 0) {
        setUnreadNotifications([]);
        return;
      }

      const activityQuery =
        actualRole === "super_admin"
          ? query(logsCollection, orderBy("createdAt", "desc"), limit(40))
          : filters.length === 1
            ? query(logsCollection, filters[0], limit(40))
            : query(logsCollection, or(...filters), limit(40));

      unsubscribe = onSnapshot(
        activityQuery,
        async (snapshot) => {
          const readDocs = await getDocs(collection(db, `users/${user.uid}/admin_notifications`));
          const readSet = new Set(
            readDocs.docs
              .filter((readDoc) => readDoc.data().isRead === true)
              .map((readDoc) => readDoc.id)
          );

          const operationalNotifs = snapshot.docs
            .filter((docSnap) => !readSet.has(docSnap.id))
            .map((docSnap) => headerNotificationFromActivity(docSnap.id, docSnap.data()))
            .filter(Boolean) as HeaderNotification[];

          operationalNotifs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          setUnreadNotifications(operationalNotifs.slice(0, 10));
        },
        (error) => {
          console.error("Error fetching admin operational notifications:", error);
          setUnreadNotifications([]);
        }
      );
    } else {
      const mailsQuery = query(
        collection(db, "mails"),
        where("ownerUid", "==", user.uid),
        limit(20)
      );

      unsubscribe = onSnapshot(
        mailsQuery,
        (snapshot) => {
          const notifs: HeaderNotification[] = snapshot.docs
            .map((docSnap) => {
              const mail = docSnap.data() as any;
              const status = String(mail?.status ?? "");
              const isUnread =
                status === "Nouveau" ||
                status === "Urgent" ||
                status === "Analyse en cours" ||
                status === "Erreur d'analyse";

              if (!isUnread) return null;

              return {
                id: docSnap.id,
                title:
                  status === "Urgent"
                    ? "Courrier urgent"
                    : status === "Erreur d'analyse"
                    ? "Analyse à vérifier"
                    : "Nouveau courrier reçu",
                description:
                  status === "Analyse en cours"
                    ? "Analyse du courrier en cours..."
                    : `De : ${mail?.analysis?.sender || "Inconnu"}`,
                createdAt: toSafeDate(mail?.scannedAt || mail?.createdAt),
              };
            })
            .filter(Boolean) as HeaderNotification[];

          notifs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          setUnreadNotifications(notifs.slice(0, 10));
        },
        (error) => {
          console.error("Error fetching client notifications:", error);
          setUnreadNotifications([]);
        }
      );
    }

    return () => unsubscribe();
  }, [
    user,
    db,
    actualRole,
    staffUser,
    centerAccess.actualManagedCenterIds,
    centerAccess.isCenterAccessLoading,
    centerAccess.isLoading,
    centerAccess.managedCenterIds,
  ]);

  const handleLogout = async () => {
    if (!auth) return;

    try {
      await signOut(auth);
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès.",
      });
      router.push("/login");
    } catch {
      toast({
        variant: "destructive",
        title: "Erreur de déconnexion",
        description: "Une erreur est survenue lors de la déconnexion.",
      });
    }
  };

  const getInitials = (email: string | null | undefined) => {
    if (!email) return "U";
    const parts = email.split("@")[0].split(/[._-]/);
    return parts.map((p) => p.charAt(0)).join("").toUpperCase();
  };

  const breadcrumbs = generateBreadcrumbs(pathname);
  const notificationsHref = staffUser
    ? "/admin/notifications"
    : "/dashboard/notifications";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 bg-white/5 px-4 backdrop-blur-xl transition-all duration-500 dark:bg-black/20 sm:gap-4 sm:px-8 border-b border-white/5">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent pointer-events-none" />

      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button size="icon" variant="ghost" className="relative z-10 shrink-0 rounded-xl hover:bg-white/10 sm:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>

        <SheetContent
          side="left"
          className="flex w-[88vw] max-w-sm flex-col border-r border-slate-200 bg-white text-slate-950 shadow-2xl dark:border-white/10 dark:bg-slate-950 dark:text-slate-50 sm:max-w-xs"
        >
          <SheetTitle className="sr-only">Menu principal</SheetTitle>

          <div className="mb-8 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold text-foreground group"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Logo />
            </Link>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              aria-label="Changer de thème"
              className="rounded-xl hover:bg-white/10"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Changer de thème</span>
            </Button>
          </div>

          <nav className="grid flex-grow content-start gap-3 text-base font-medium">
            <DashboardNav
              isAdmin={isAdminView}
              isMobile={true}
              closeSheet={() => setIsMobileMenuOpen(false)}
            />
          </nav>

          <div className="mt-auto pb-6 text-center">
            <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground/30">
                © 2026 CCS DOM - Elite Management
            </p>
          </div>
        </SheetContent>
      </Sheet>

      <div className="relative z-10 hidden min-w-0 flex-1 sm:block">
        {breadcrumbs}
      </div>

      <div className="relative z-10 ml-auto hidden flex-1 group sm:block md:grow-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30 group-focus-within:text-primary transition-all duration-300 group-hover:scale-110" />
        <Input
          type="search"
          placeholder="Rechercher..."
          className="w-full h-10 rounded-xl bg-white/5 border-white/5 pl-10 md:w-[200px] lg:w-[320px] focus:bg-white/10 focus:ring-1 focus:ring-primary/20 transition-all border-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] placeholder:text-foreground/20 text-sm font-medium"
        />
      </div>

      <div className="relative z-10 ml-auto flex shrink-0 items-center justify-end gap-2">
        <BetaFeedbackButton compact className="inline-flex sm:hidden" />
        <BetaFeedbackButton />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          aria-label="Changer de thème"
          className="hidden sm:inline-flex rounded-xl hover:bg-white/10"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Changer de thème</span>
        </Button>

        <Link href={notificationsHref}>
          <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-white/10">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-2 top-2 flex h-2 w-2 items-center justify-center rounded-full bg-primary animate-pulse shadow-glow shadow-primary" />
            )}
          </Button>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="overflow-hidden rounded-full"
            >
              <Avatar>
                <AvatarImage
                  src={user?.photoURL || undefined}
                  alt="User avatar"
                />
                <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <p>Mon Compte</p>
              <p className="text-xs font-normal text-muted-foreground">
                {user?.email}
              </p>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href={isAdminView ? "/admin/settings" : "/dashboard/settings"}>
                <Settings className="mr-2 h-4 w-4" />
                Profil & Paramètres
              </Link>
            </DropdownMenuItem>

            {!staffUser && (
              <>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/subscription">Abonnement</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/support">Support</Link>
                </DropdownMenuItem>
              </>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
