// src/components/dashboard-nav.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  Settings,
  Users2,
  Mail,
  Package,
  ScanLine,
  Building,
  UserCheck,
  LifeBuoy,
  CreditCard,
  Wrench,
  FileText,
  ScrollText,
  MessageSquareWarning,
  ClipboardCheck,
  Lock,
  type LucideIcon,
} from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { isClientRecoveryPath, useClientAccountAccess } from "@/hooks/use-client-account-access";
import { useRole } from "@/hooks/use-simulated-role";

type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  highlight?: boolean;
  badge?: string;
};

function blockedLabel(title: string) {
  return `${title} indisponible jusqu'à régularisation du paiement`;
}

export function DashboardNav({
  isAdmin = false,
  isMobile = false,
  closeSheet,
}: {
  isAdmin?: boolean;
  isMobile?: boolean;
  closeSheet?: () => void;
}) {
  const pathname = usePathname();
  const { displayRole } = useRole();
  const { suspended } = useClientAccountAccess();

  const clientNav: NavItem[] = [
    { title: "Tableau de Bord", href: "/dashboard", icon: Home },
    { title: "Courrier", href: "/dashboard/mail", icon: Mail, highlight: true },
    { title: "Documents", href: "/dashboard/documents", icon: FileText },
    { title: "Abonnement", href: "/dashboard/subscription", icon: Package },
    { title: "Support", href: "/dashboard/support", icon: LifeBuoy },
  ];

  const baseAdminNav: NavItem[] = [{ title: "Tableau de Bord", href: "/admin", icon: Home }];
  const operationalNav: NavItem[] = [
    { title: "Scanner courrier", href: "/admin/scan", icon: ScanLine, highlight: true },
    { title: "Gestion courriers", href: "/admin/mails", icon: Mail },
    { title: "Clients", href: "/admin/clients", icon: Users2 },
  ];
  const activityNav: NavItem[] = [
    { title: "Activité", href: "/admin/activity", icon: ScrollText, highlight: true, badge: "Logs" },
  ];
  const recipeNav: NavItem[] = [
    { title: "Recette", href: "/admin/recette", icon: ClipboardCheck, badge: "Test" },
  ];
  const managementNav: NavItem[] = [
    { title: "Adresses", href: "/admin/adresses", icon: Building },
    { title: "Validation", href: "/admin/validation", icon: UserCheck },
    { title: "Facturation", href: "/admin/billing", icon: CreditCard },
    { title: "Outils", href: "/admin/documents", icon: Wrench },
  ];

  let adminNav: NavItem[] = [];
  if (displayRole === "super_admin") {
    adminNav = [
      ...baseAdminNav,
      { title: "Centres", href: "/admin/adresses", icon: Building },
      { title: "Facturation centres", href: "/admin/billing", icon: CreditCard },
      ...activityNav,
      ...recipeNav,
      { title: "Retours bêta", href: "/admin/feedback", icon: MessageSquareWarning, badge: "Bêta" },
    ];
  } else if (displayRole === "manager" || displayRole === "manager_paris" || displayRole === "manager_orly") {
    adminNav = [...baseAdminNav, ...operationalNav, ...activityNav, ...recipeNav, ...managementNav];
  } else if (displayRole === "secretary_paris" || displayRole === "secretary_orly") {
    adminNav = [
      ...baseAdminNav,
      { title: "Clients", href: "/admin/clients", icon: Users2 },
      { title: "Scanner courrier", href: "/admin/scan", icon: ScanLine, highlight: true },
      { title: "Gestion courriers", href: "/admin/mails", icon: Mail },
      ...recipeNav,
    ];
  } else {
    adminNav = [...baseAdminNav, ...operationalNav, ...activityNav, ...managementNav];
  }

  const navItems = isAdmin ? adminNav : clientNav;

  if (isMobile) {
    return (
      <>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isBlocked = !isAdmin && suspended && !isClientRecoveryPath(item.href);
          const itemContent = (
            <>
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </div>

              {isBlocked ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                  <Lock className="h-3 w-3" /> Bloqué
                </span>
              ) : item.badge ? (
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[10px]",
                    isActive ? "border-primary-foreground/30 text-primary-foreground/90" : "border-primary/30 text-primary"
                  )}
                >
                  {item.badge}
                </span>
              ) : null}
            </>
          );

          if (isBlocked) {
            return (
              <div
                key={item.href}
                aria-disabled="true"
                title={blockedLabel(item.title)}
                className="flex min-h-12 cursor-not-allowed items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-400 opacity-75 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-500"
              >
                {itemContent}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeSheet}
              className={cn(
                "flex min-h-12 items-center justify-between gap-4 rounded-2xl border border-transparent px-4 py-3 text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white",
                isActive && "border-primary/20 bg-primary/10 text-primary shadow-sm",
                item.highlight && !isActive && "border-primary/10 bg-primary/5 text-primary",
                isActive && item.highlight && "bg-primary text-primary-foreground"
              )}
            >
              {itemContent}
            </Link>
          );
        })}

        <Link
          href={isAdmin ? "/admin/settings" : "/dashboard/settings"}
          onClick={closeSheet}
          className={cn(
            "flex min-h-12 items-center gap-4 rounded-2xl px-4 py-3 text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white",
            pathname.startsWith(isAdmin ? "/admin/settings" : "/dashboard/settings") && "bg-primary/10 text-primary"
          )}
        >
          <Settings className="h-5 w-5" /> Paramètres
        </Link>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const isBlocked = !isAdmin && suspended && !isClientRecoveryPath(item.href);
        const content = (
          <>
            {isActive && !isBlocked ? (
              <motion.div
                layoutId="activeNav"
                className="absolute inset-0 z-0 bg-gradient-to-r from-primary to-primary/80"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            ) : null}

            <item.icon
              className={cn(
                "relative z-10 h-5 w-5 shrink-0 transition-all duration-500",
                isActive && !isBlocked
                  ? "scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                  : "group-hover:scale-110 group-hover:rotate-6"
              )}
            />

            <span
              className={cn(
                "relative z-10 truncate text-sm font-semibold opacity-0 transition-all duration-500 lg:opacity-100",
                isActive && !isBlocked ? "translate-x-0" : "translate-x-0 group-hover:translate-x-1"
              )}
            >
              {item.title}
            </span>

            {isBlocked ? <Lock className="relative z-10 ml-auto hidden h-3.5 w-3.5 text-slate-400 lg:block" /> : null}
            {item.highlight && !isActive && !isBlocked ? (
              <div className="absolute right-1 top-1 z-10 h-1.5 w-1.5 animate-pulse rounded-full bg-primary blur-[1px]" />
            ) : null}
          </>
        );

        return (
          <Tooltip key={item.href}>
            <TooltipTrigger asChild>
              {isBlocked ? (
                <div
                  aria-disabled="true"
                  title={blockedLabel(item.title)}
                  className="group relative flex h-10 w-full cursor-not-allowed items-center gap-3 overflow-hidden rounded-xl border border-slate-200/70 bg-slate-100/70 px-2.5 text-slate-400 opacity-80 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-500"
                >
                  {content}
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "group relative flex h-10 w-full items-center gap-3 overflow-hidden rounded-xl border border-transparent px-2.5 transition-all duration-300",
                    isActive
                      ? "border-white/10 bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-foreground/50 hover:bg-white/5 hover:text-foreground",
                    !isActive && item.highlight && "border-primary/10 bg-primary/5 text-primary"
                  )}
                >
                  {content}
                </Link>
              )}
            </TooltipTrigger>
            <TooltipContent side="right" className="lg:hidden">
              {isBlocked ? blockedLabel(item.title) : item.title}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
