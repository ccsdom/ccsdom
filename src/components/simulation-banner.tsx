"use client";

import React from "react";
import { ShieldAlert, X } from "lucide-react";
import { useRole } from "@/hooks/use-simulated-role";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Composant de bandeau d'avertissement affiché lorsqu'un super_admin
 * simule un autre rôle. Fournit un bouton pour quitter la simulation.
 */
export function SimulationBanner() {
  const { actualRole, simulatedRole, setSimulatedRole } = useRole();

  // On n'affiche le bandeau que si l'utilisateur est réellement super_admin
  // et qu'une simulation est active.
  if (actualRole !== "super_admin" || !simulatedRole) {
    return null;
  }

  const handleReset = () => {
    setSimulatedRole(null);
  };

  return (
    <div
      className={cn(
        "z-50 flex w-full items-center border-b px-4 py-2",
        "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
      )}
    >
      {/* Spacer pour équilibrer le bouton à droite et centrer le texte */}
      <div className="hidden w-[80px] sm:block" />

      <div className="flex flex-1 items-center justify-center gap-2 text-xs font-medium sm:text-sm">
        <ShieldAlert className="h-4 w-4 shrink-0" />
        <span>
          Mode simulation actif :{" "}
          <span className="font-bold underline uppercase">
            {simulatedRole.replace("_", " ")}
          </span>
        </span>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleReset}
        className="h-7 px-2 hover:bg-amber-500/20 hover:text-amber-700 dark:hover:text-amber-300 ml-auto"
      >
        <span className="hidden sm:inline mr-1">Quitter</span>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

