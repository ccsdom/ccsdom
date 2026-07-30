"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle, Building2, Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCenterAccess } from "@/hooks/use-center-access";
import { isStaffRole } from "@/lib/access-control";
import { cn } from "@/lib/utils";

const ALLOWED_ADMIN_PATHS = ["/admin/adresses", "/admin/settings"];

function isAllowedAdminPath(pathname: string | null): boolean {
  if (!pathname) return false;

  return ALLOWED_ADMIN_PATHS.some(
    (allowedPath) => pathname === allowedPath || pathname.startsWith(`${allowedPath}/`)
  );
}

export function CenterSuspensionGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    actualRole,
    isLoading,
    isCenterAccessLoading,
    isBlockedByCenterSuspension,
    hasPartiallySuspendedCenters,
    suspendedCenters,
  } = useCenterAccess();

  const isAllowedPath = isAllowedAdminPath(pathname);

  if (isLoading || isCenterAccessLoading) {
    return children;
  }

  if (!actualRole || !isStaffRole(actualRole) || actualRole === "super_admin") {
    return children;
  }

  if (isBlockedByCenterSuspension && !isAllowedPath) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-10">
        <Card className="w-full max-w-2xl border-rose-500/20 bg-white shadow-2xl">
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10">
                <Lock className="h-6 w-6 text-rose-500" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black text-slate-950">
                  Centre suspendu, acces operationnel gele
                </CardTitle>
                <CardDescription className="text-sm text-slate-600">
                  Les operations de gestion restent bloquees tant qu&apos;au moins un centre actif
                  n&apos;est pas rattache a ce compte.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-rose-500" />
                <div className="space-y-2">
                  <p className="text-sm font-bold text-rose-950">
                    Centres actuellement suspendus
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suspendedCenters.map((center) => (
                      <Badge
                        key={center.id}
                        variant="outline"
                        className="border-rose-200 bg-white text-rose-700"
                      >
                        {center.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <Building2 className="mt-0.5 h-5 w-5 text-slate-600" />
                <div className="space-y-1 text-sm text-slate-700">
                  <p className="font-bold text-slate-950">Ce que vous pouvez encore faire</p>
                  <p>
                    Verifier l&apos;etat du centre dans le reseau, consulter vos parametres
                    d&apos;acces, puis demander au super admin la reactivation ou la regularisation
                    du contrat centre.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="flex-1">
                <Link href="/admin/adresses">Voir le centre et son statut</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/admin/settings">Ouvrir les parametres</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (hasPartiallySuspendedCenters && suspendedCenters.length > 0 && !isAllowedPath) {
    return (
      <div className="space-y-4">
        <div
          className={cn(
            "rounded-2xl border px-4 py-3 shadow-sm",
            "border-amber-200 bg-amber-50 text-amber-950"
          )}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-black">Acces partiellement restreint</p>
              <p className="text-sm text-amber-900/80">
                Certains centres rattaches a ce compte sont suspendus. Les ecrans operationnels
                sont maintenant filtres sur les centres encore actifs.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {suspendedCenters.map((center) => (
                <Badge
                  key={center.id}
                  variant="outline"
                  className="border-amber-300 bg-white text-amber-700"
                >
                  {center.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        {children}
      </div>
    );
  }

  return children;
}
