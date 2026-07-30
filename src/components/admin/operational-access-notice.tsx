"use client";

import Link from "next/link";
import { Building2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function OperationalAccessNotice({
  title = "Espace operationnel reserve aux centres",
  description = "Le super admin pilote le reseau, les centres, les quotas et les acces. Le traitement client quotidien reste reserve aux managers et equipes des centres.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center p-6">
      <Card className="w-full border-slate-200 bg-white text-slate-950 shadow-xl">
        <CardHeader className="space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">{title}</CardTitle>
            <CardDescription className="mt-2 text-base text-slate-600">
              {description}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Button asChild className="h-11 rounded-xl font-bold">
            <Link href="/admin/adresses">
              <Building2 className="mr-2 h-4 w-4" />
              Piloter les centres
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-xl border-slate-200 font-bold">
            <Link href="/admin">Retour console super admin</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
