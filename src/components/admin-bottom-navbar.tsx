"use client";

import { usePathname } from "next/navigation";
import { Building, CheckCircle2, CreditCard, Home, Mail, MessageSquareWarning, ScanLine, Users2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useRole } from "@/hooks/use-simulated-role";

export function AdminBottomNavbar() {
  const pathname = usePathname();
  const { displayRole } = useRole();
  const isSuperAdmin = displayRole === "super_admin";
  const isSecretary = displayRole === "secretary_paris" || displayRole === "secretary_orly";
  const isManager =
    displayRole === "manager" ||
    displayRole === "manager_paris" ||
    displayRole === "manager_orly";

  const navItems = isSuperAdmin
    ? [
        { href: "/admin", icon: Home, label: "Accueil" },
        { href: "/admin/adresses", icon: Building, label: "Centres" },
        { href: "/admin/billing", icon: CreditCard, label: "SaaS" },
        { href: "/admin/feedback", icon: MessageSquareWarning, label: "Retours" },
      ]
    : isSecretary
      ? [
          { href: "/admin", icon: Home, label: "Accueil" },
          { href: "/admin/clients", icon: Users2, label: "Clients" },
          { href: "/admin/scan", icon: ScanLine, label: "Scanner" },
          { href: "/admin/mails", icon: Mail, label: "Courrier" },
        ]
    : isManager
      ? [
          { href: "/admin", icon: Home, label: "Accueil" },
          { href: "/admin/validation", icon: CheckCircle2, label: "Valider" },
          { href: "/admin/clients", icon: Users2, label: "Clients" },
          { href: "/admin/scan", icon: ScanLine, label: "Scanner" },
          { href: "/admin/mails", icon: Mail, label: "Courrier" },
        ]
    : [
        { href: "/admin", icon: Home, label: "Accueil" },
        { href: "/admin/clients", icon: Users2, label: "Clients" },
        { href: "/admin/scan", icon: ScanLine, label: "Scanner" },
        { href: "/admin/mails", icon: Mail, label: "Courrier" },
      ];

  const gridClass =
    navItems.length === 5
      ? "grid-cols-5"
      : navItems.length === 4
        ? "grid-cols-4"
        : "grid-cols-3";

  return (
    <nav
      aria-label="Navigation principale administrateur"
      className="fixed bottom-0 left-0 z-50 w-full border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-18px_45px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:hidden dark:border-white/10 dark:bg-slate-950/95"
    >
      <div className={cn("mx-auto grid h-[4.75rem] max-w-lg px-1", gridClass)}>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[10px] font-bold transition-all",
                isActive
                  ? "text-primary"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-2xl transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-slate-100 group-hover:bg-slate-200 dark:bg-white/5 dark:group-hover:bg-white/10"
                )}
              >
                <item.icon className="h-[18px] w-[18px]" />
              </span>
              <span className="max-w-full truncate leading-none">{item.label}</span>
            </Link>
          );
        })}
        </div>
    </nav>
  );
}
