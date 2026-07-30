"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, ChevronsUpDown, Moon, Settings, ShieldCheck, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { DashboardNav } from "./dashboard-nav";
import Logo from "./logo";
import { useRole } from "@/hooks/use-simulated-role";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const roleOptions = [
  { value: "super_admin", label: "Super administrateur", short: "Super admin", hint: "Pilotage SaaS" },
  { value: "manager", label: "Gestionnaire multi-centres", short: "Multi-centres", hint: "Simulation opérationnelle" },
  { value: "manager_paris", label: "Gestionnaire Paris", short: "Paris", hint: "Centre Paris" },
  { value: "manager_orly", label: "Gestionnaire Orly", short: "Orly", hint: "Centre Orly" },
] as const;

const RoleSwitcher = () => {
  const { actualRole, simulatedRole, setSimulatedRole } = useRole();

  if (actualRole !== "super_admin") {
    return null;
  }

  const activeRole = simulatedRole || "super_admin";
  const activeOption = roleOptions.find((option) => option.value === activeRole) ?? roleOptions[0];

  return (
    <div className="w-full">
      <div className="mb-2 hidden px-1 text-[10px] font-black uppercase tracking-[0.22em] text-foreground/40 lg:block">
        Changer de vue
      </div>

      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                aria-label={`Changer de vue, vue active : ${activeOption.label}`}
                className={cn(
                  "h-10 w-10 rounded-xl border border-white/10 bg-white/5 px-0 text-foreground/70 hover:bg-white/10 hover:text-foreground lg:w-full lg:justify-start lg:gap-3 lg:px-2.5",
                  simulatedRole && "border-amber-300/40 bg-amber-400/10 text-amber-700 dark:text-amber-200"
                )}
              >
                <ShieldCheck className="h-5 w-5 shrink-0" />
                <span className="hidden min-w-0 flex-1 text-left lg:block">
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-foreground/40">
                    Vue active
                  </span>
                  <span className="block truncate text-sm font-semibold leading-tight">
                    {activeOption.short}
                  </span>
                </span>
                <ChevronsUpDown className="hidden h-4 w-4 shrink-0 text-foreground/40 lg:block" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="right" className="lg:hidden">
            Changer de vue : {activeOption.label}
          </TooltipContent>
        </Tooltip>

        <DropdownMenuContent
          side="right"
          align="end"
          sideOffset={12}
          className="w-64 rounded-2xl border border-slate-200 bg-white p-2 text-slate-950 shadow-2xl dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
        >
          {roleOptions.map((option) => {
            const isActive = option.value === activeRole;

            return (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setSimulatedRole(option.value === "super_admin" ? null : (option.value as any))}
                className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold focus:bg-slate-100 dark:focus:bg-slate-900"
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                    isActive
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-900"
                  )}
                >
                  {isActive ? <Check className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{option.label}</span>
                  <span className="block text-xs font-medium text-slate-500">{option.hint}</span>
                </span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export function DashboardSidebar() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const { setTheme, theme } = useTheme();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-14 flex-col border-r border-white/5 bg-white/5 backdrop-blur-xl transition-all duration-500 ease-in-out dark:bg-black/20 sm:flex lg:w-64">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />

      <TooltipProvider delayDuration={0}>
        <div className="relative z-10 mb-4 flex h-16 items-center border-b border-white/5 px-4">
          <Link href="/" className="group flex items-center gap-3 overflow-hidden">
            <Logo
              showSlogan={false}
              iconWrapperClassName="w-8 h-8 group-hover:scale-110 transition-transform duration-500"
              iconClassName="w-5 h-5"
              titleClassName="font-headline font-bold text-lg text-gradient truncate opacity-0 lg:opacity-100 transition-all duration-500"
            />
          </Link>
        </div>

        <nav className="custom-scrollbar relative z-10 flex flex-grow flex-col gap-2 overflow-y-auto px-3 py-4">
          <DashboardNav isAdmin={isAdmin} />
        </nav>

        <div className="relative z-10 mt-auto flex flex-col gap-2 border-t border-white/5 px-2 py-6 lg:px-3">
          {isAdmin && (
            <div className="mb-6">
              <RoleSwitcher />
            </div>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={isAdmin ? "/admin/settings" : "/dashboard/settings"}
                className={cn(
                  "flex h-10 w-10 items-center gap-3 rounded-xl px-2.5 text-foreground/40 transition-all hover:bg-white/10 hover:text-foreground lg:w-full",
                  pathname.includes("settings") && "border border-primary/20 bg-primary/10 text-primary"
                )}
              >
                <Settings className="h-5 w-5 shrink-0 transition-transform duration-500 hover:rotate-45" />
                <span className="hidden truncate text-sm font-semibold lg:inline">Paramètres</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="lg:hidden">
              Paramètres
            </TooltipContent>
          </Tooltip>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label="Changer de thème"
            className="h-10 w-10 rounded-xl transition-all hover:bg-white/10 lg:w-full lg:justify-start lg:gap-3 lg:px-2.5"
          >
            <div className="relative h-5 w-5 shrink-0">
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all group-hover:text-amber-400 dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute inset-0 h-5 w-5 rotate-90 scale-0 transition-all group-hover:text-blue-400 dark:rotate-0 dark:scale-100" />
            </div>
            <span className="hidden truncate text-sm font-semibold lg:inline">
              {theme === "dark" ? "Mode clair" : "Mode sombre"}
            </span>
          </Button>
        </div>
      </TooltipProvider>
    </aside>
  );
}
