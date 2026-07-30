"use client";

import React from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { isClientRecoveryPath, useClientAccountAccess } from "@/hooks/use-client-account-access";

export function SuspensionGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { loading, suspended, suspendedReason } = useClientAccountAccess();

  if (loading) return children;

  if (isClientRecoveryPath(pathname) || !suspended) {
    return children;
  }

  return (
    <div className="relative min-h-[50vh]">
      <div className="pointer-events-none select-none blur-sm">{children}</div>
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/70 p-6 backdrop-blur-[2px]">
        <div className="w-full max-w-md space-y-6 rounded-2xl border border-red-200 bg-white p-8 text-center shadow-2xl animate-in fade-in zoom-in duration-300">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <Lock className="h-8 w-8 text-red-600" />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-600">Régularisation requise</p>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">Accès courrier temporairement suspendu</h2>
            <p className="text-sm leading-6 text-slate-600">
              Nous n'avons pas pu valider le dernier paiement de votre abonnement. Par sécurité, l'accès aux courriers,
              documents et services associés est suspendu jusqu'à régularisation.
            </p>
            {suspendedReason ? (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{suspendedReason}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <Button asChild className="w-full">
              <Link href="/dashboard/subscription">Mettre à jour mon moyen de paiement</Link>
            </Button>
            <Button asChild variant="secondary" className="w-full">
              <Link href="/dashboard/billing">Consulter mes factures</Link>
            </Button>
            <Button asChild variant="outline" className="w-full border-slate-200">
              <Link href="/dashboard/support">Contacter le support</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
