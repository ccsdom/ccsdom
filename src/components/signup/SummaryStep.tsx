"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Edit3, CheckCircle2, FileCheck2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useSignupFormStore } from "@/store/signup-form-store";
import {
  getStepsForProjectType,
  type SignupFormValues,
  type SignupProjectType,
} from "@/features/signup/config";
import { buildSignupSummary } from "@/features/signup/display";

type SummaryStepProps = {
  setCurrentStep: (step: number) => void;
};

type SummaryRowProps = {
  label: string;
  value: React.ReactNode;
  onEdit?: () => void;
};

function SummaryRow({ label, value, onEdit }: SummaryRowProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <div className="mt-1 text-sm font-medium break-words">{value}</div>
      </div>

      {onEdit ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="shrink-0"
        >
          <Edit3 className="mr-2 h-4 w-4" />
          Modifier
        </Button>
      ) : null}
    </div>
  );
}

export function SummaryStep({ setCurrentStep }: SummaryStepProps) {
  const { formValues } = useSignupFormStore();
  const { getValues } = useFormContext<SignupFormValues>();

  const mergedValues = React.useMemo<SignupFormValues>(() => {
    return {
      ...formValues,
      ...(getValues() || {}),
    };
  }, [formValues, getValues]);

  const projectType = (mergedValues.projectType ||
    "creation") as SignupProjectType;

  const steps = React.useMemo(
    () => getStepsForProjectType(projectType),
    [projectType]
  );

  const summary = React.useMemo(
    () => buildSignupSummary(mergedValues),
    [mergedValues]
  );

  const goToStep = React.useCallback(
    (stepId: string) => {
      const index = steps.findIndex((step) => step.id === stepId);
      if (index >= 0) {
        setCurrentStep(index);
      }
    },
    [setCurrentStep, steps]
  );

  const representativeLabel =
    summary.representative !== "—"
      ? `${summary.representative}${
          summary.email !== "—" ? ` • ${summary.email}` : ""
        }${summary.phone !== "—" ? ` • ${summary.phone}` : ""}`
      : [summary.email, summary.phone].filter((v) => v !== "—").join(" • ") ||
        "—";

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Vérifiez vos informations
          </CardTitle>
          <CardDescription>
            Relisez les éléments ci-dessous avant de passer au paiement.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="border-slate-200 bg-white/80">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileCheck2 className="h-5 w-5 text-primary" />
            Après paiement
          </CardTitle>
          <CardDescription className="leading-6">
            Votre contrat et votre attestation seront préparés à partir de ces informations.
            Corrigez maintenant les éléments sensibles : société, représentant, centre et forfait.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        <SummaryRow
          label="Projet"
          value={summary.projectType}
          onEdit={() => goToStep("projet")}
        />

        {projectType === "transfert" ? (
          <SummaryRow
            label="Entreprise"
            value={
              <div className="space-y-1">
                <div>{summary.companyName}</div>
                <div className="text-xs text-muted-foreground">
                  SIRET : {summary.siret}
                </div>
              </div>
            }
            onEdit={() => goToStep("recherche")}
          />
        ) : (
          <>
            <SummaryRow
              label="Dénomination"
              value={summary.companyName}
              onEdit={() => goToStep("denomination")}
            />

            <SummaryRow
              label="Statut juridique"
              value={summary.legalStatus}
              onEdit={() => goToStep("statut")}
            />
          </>
        )}

        <SummaryRow
          label="Représentant légal"
          value={representativeLabel}
          onEdit={() => goToStep("representant")}
        />

        <SummaryRow
          label="Adresse de domiciliation"
          value={summary.address}
          onEdit={() => goToStep("domiciliation")}
        />

        <SummaryRow
          label="Gestion du courrier"
          value={summary.mailPlan}
          onEdit={() => goToStep("courrier")}
        />

        <SummaryRow
          label="Accompagnement"
          value={summary.accompaniment}
          onEdit={() => goToStep("accompagnement")}
        />

        <SummaryRow
          label="Paiement"
          value={summary.paymentFrequency}
        />
      </div>
    </div>
  );
}
