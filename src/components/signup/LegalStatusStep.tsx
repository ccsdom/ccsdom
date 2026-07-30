"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Building2, CheckCircle2 } from "lucide-react";

import type { SignupFormValues } from "@/features/signup/config";
import { LEGAL_STATUS_LABELS } from "@/features/signup/labels";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "sasu", description: "Société par actions simplifiée unipersonnelle" },
  { value: "sas", description: "Société par actions simplifiée" },
  { value: "sarl", description: "Société à responsabilité limitée" },
  { value: "eurl", description: "Entreprise unipersonnelle à responsabilité limitée" },
  { value: "micro", description: "Micro-entreprise / auto-entrepreneur" },
  { value: "autres", description: "Autre forme juridique à préciser" },
] as const;

export function LegalStatusStep() {
  const { control, watch, setValue } = useFormContext<SignupFormValues>();

  const selectedStatus = watch("legalStatus");

  React.useEffect(() => {
    if (selectedStatus !== "autres") {
      setValue("otherLegalStatus", "", {
        shouldValidate: false,
        shouldDirty: true,
      });
    }
  }, [selectedStatus, setValue]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Choisissez la forme juridique</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Cette information nous permet de préparer correctement votre
              dossier et vos documents contractuels.
            </p>
          </div>
        </div>
      </div>

      <FormField
        control={control}
        name="legalStatus"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Statut juridique</FormLabel>
            <FormControl>
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="grid gap-3 md:grid-cols-2"
              >
                {STATUS_OPTIONS.map((option) => {
                  const selected = field.value === option.value;

                  return (
                    <FormItem key={option.value}>
                      <FormControl>
                        <label className="block cursor-pointer">
                          <RadioGroupItem
                            value={option.value}
                            className="sr-only"
                          />
                          <Card
                            className={cn(
                              "border-2 transition-all hover:border-primary/50",
                              selected
                                ? "border-primary bg-primary/5"
                                : "border-border"
                            )}
                          >
                            <CardContent className="flex items-start justify-between gap-3 p-4">
                              <div className="min-w-0">
                                <div className="font-medium">
                                  {LEGAL_STATUS_LABELS[option.value]}
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {option.description}
                                </p>
                              </div>

                              {selected ? (
                                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                              ) : null}
                            </CardContent>
                          </Card>
                        </label>
                      </FormControl>
                    </FormItem>
                  );
                })}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {selectedStatus === "autres" && (
        <FormField
          control={control}
          name="otherLegalStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Précisez votre statut juridique</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex. SCI, association, SNC..."
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}