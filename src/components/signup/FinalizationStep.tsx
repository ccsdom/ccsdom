"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { CheckCircle2, ExternalLink, FileText, Home, Mail } from "lucide-react";

import type { SignupFormValues } from "@/features/signup/config";
import { buildSignupSummary } from "@/features/signup/display";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function FinalizationStep() {
  const { getValues } = useFormContext<SignupFormValues>();

  const values = React.useMemo(() => getValues(), [getValues]);
  const summary = React.useMemo(() => buildSignupSummary(values), [values]);

  const hasContract =
    !!String(values?.pdfJobs?.contractId ?? "").trim();
  const hasAttestation =
    !!String(values?.pdfJobs?.attestationId ?? "").trim();

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Votre dossier a bien été transmis
          </CardTitle>
          <CardDescription>
            Votre demande est enregistrée. Nos équipes vont maintenant vérifier
            vos informations et valider votre domiciliation.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Récapitulatif</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <span className="font-medium">Société :</span> {summary.companyName}
            </div>
            <div>
              <span className="font-medium">Projet :</span> {summary.projectType}
            </div>
            <div>
              <span className="font-medium">Adresse :</span> {summary.address}
            </div>
            <div>
              <span className="font-medium">Formule :</span> {summary.mailPlan}
            </div>
            <div>
              <span className="font-medium">Contact :</span> {summary.email}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Étapes suivantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex gap-3">
              <Mail className="mt-0.5 h-4 w-4 text-primary" />
              <p>
                Vous recevrez un email de confirmation et des mises à jour sur
                l’avancement de votre dossier.
              </p>
            </div>
            <div className="flex gap-3">
              <Home className="mt-0.5 h-4 w-4 text-primary" />
              <p>
                Après validation, votre espace client vous permettra de suivre
                vos documents et vos courriers.
              </p>
            </div>
            <div className="flex gap-3">
              <FileText className="mt-0.5 h-4 w-4 text-primary" />
              <p>
                {hasContract || hasAttestation
                  ? "Les identifiants des jobs PDF ont bien été générés et seront publiés selon le workflow de validation."
                  : "Les documents PDF seront finalisés dans le workflow de validation back-office."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Accès rapide</CardTitle>
          <CardDescription>
            Vous pourrez vous reconnecter à votre espace dès que nécessaire.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <a href="/login">
              <ExternalLink className="mr-2 h-4 w-4" />
              Accéder à mon espace
            </a>
          </Button>

          <Button asChild variant="outline">
            <a href="/">
              Revenir à l’accueil
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}