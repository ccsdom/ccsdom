"use client";

import { usePathname } from "next/navigation";
import { Bell, Home, Lock, Mail } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { isClientRecoveryPath, useClientAccountAccess } from "@/hooks/use-client-account-access";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Accueil" },
  { href: "/dashboard/notifications", icon: Bell, label: "Alertes" },
];

function blockedLabel(label: string) {
  return `${label} indisponible jusqu'à régularisation du paiement`;
}

export function BottomNavbar() {
  const pathname = usePathname();
  const { suspended } = useClientAccountAccess();
  const mailBlocked = suspended && !isClientRecoveryPath("/dashboard/mail");

  return (
    <div className="pointer-events-none fixed bottom-0 left-0 z-50 h-16 w-full bg-transparent sm:hidden">
      <div className="relative mx-auto h-full max-w-lg pointer-events-auto">
        <div className="grid h-full grid-cols-2 border-t bg-background">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const isBlocked = suspended && !isClientRecoveryPath(item.href);
            const content = (
              <>
                <item.icon className="mb-1 h-5 w-5" />
                <span className="text-xs">{item.label}</span>
                {isBlocked ? <Lock className="absolute right-4 top-3 h-3.5 w-3.5" /> : null}
              </>
            );

            if (isBlocked) {
              return (
                <div
                  key={item.href}
                  aria-disabled="true"
                  title={blockedLabel(item.label)}
                  className="relative flex cursor-not-allowed flex-col items-center justify-center pt-1 text-slate-400 opacity-70"
                >
                  {content}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex flex-col items-center justify-center pt-1",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {content}
              </Link>
            );
          })}
        </div>

        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/3">
          {mailBlocked ? (
            <button
              type="button"
              disabled
              title={blockedLabel("Courrier")}
              className="flex h-16 w-16 cursor-not-allowed items-center justify-center rounded-full border-4 border-background bg-slate-200 text-slate-400 shadow-lg opacity-80"
            >
              <Lock className="h-6 w-6" />
              <span className="sr-only">Courrier bloqué</span>
            </button>
          ) : (
            <Button asChild className="h-16 w-16 rounded-full border-4 border-background shadow-lg">
              <Link href="/dashboard/mail">
                <Mail className="h-7 w-7" />
                <span className="sr-only">Courrier</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
