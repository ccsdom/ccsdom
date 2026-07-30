"use client";

import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { getFunctions, httpsCallable } from "firebase/functions";
import { AlertCircle, CheckCircle2, Loader2, MapPin } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Map } from "@/components/map";
import { useFirebase } from "@/firebase";
import { allAddresses, type Address } from "@/lib/addresses";
import { cn } from "@/lib/utils";
import type { SignupFormValues } from "@/features/signup/config";

type PublicSignupCenter = Pick<
  Address,
  | "id"
  | "slug"
  | "addressKey"
  | "locationKey"
  | "name"
  | "street"
  | "city"
  | "zip"
  | "country"
  | "status"
  | "lat"
  | "lng"
>;

type PublicCentersResponse = {
  centers?: PublicSignupCenter[];
};

const fallbackCenters = allAddresses.filter((address) => address.status === "active");

function normalizeCenters(value: unknown): PublicSignupCenter[] {
  const centers = Array.isArray(value) ? value : [];

  return centers
    .filter((center): center is PublicSignupCenter => {
      const candidate = center as PublicSignupCenter;
      return (
        !!candidate &&
        typeof candidate.id === "string" &&
        typeof candidate.name === "string" &&
        typeof candidate.street === "string" &&
        typeof candidate.city === "string" &&
        typeof candidate.zip === "string" &&
        candidate.status === "active" &&
        Number.isFinite(Number(candidate.lat)) &&
        Number.isFinite(Number(candidate.lng))
      );
    })
    .map((center) => ({
      ...center,
      addressKey: center.addressKey || center.id,
      locationKey: center.locationKey || center.addressKey || center.id,
      country: center.country || "France",
      lat: Number(center.lat),
      lng: Number(center.lng),
    }));
}

export const DomiciliationStep: React.FC = () => {
  const { control, setValue, watch } = useFormContext<SignupFormValues>();
  const { firebaseApp } = useFirebase();
  const selectedAddressId = watch("addressId");
  const [centers, setCenters] = React.useState<PublicSignupCenter[]>(fallbackCenters);
  const [isLoadingCenters, setIsLoadingCenters] = React.useState(true);
  const [loadError, setLoadError] = React.useState(false);
  const selectedCenter = centers.find((center) => center.id === selectedAddressId);

  React.useEffect(() => {
    let cancelled = false;

    async function loadPublicCenters() {
      if (!firebaseApp) {
        setIsLoadingCenters(false);
        return;
      }

      try {
        setIsLoadingCenters(true);
        setLoadError(false);

        const callable = httpsCallable<undefined, PublicCentersResponse>(
          getFunctions(firebaseApp, "europe-west9"),
          "listPublicCenters"
        );
        const response = await callable(undefined);
        const loadedCenters = normalizeCenters(response.data?.centers);

        if (!cancelled) {
          setCenters(loadedCenters.length > 0 ? loadedCenters : fallbackCenters);
        }
      } catch (error) {
        console.warn("[Signup] listPublicCenters failed, using local fallback:", error);
        if (!cancelled) {
          setLoadError(true);
          setCenters(fallbackCenters);
        }
      } finally {
        if (!cancelled) setIsLoadingCenters(false);
      }
    }

    void loadPublicCenters();

    return () => {
      cancelled = true;
    };
  }, [firebaseApp]);

  React.useEffect(() => {
    if (!selectedAddressId) return;
    if (centers.some((center) => center.id === selectedAddressId)) return;

    setValue("addressId", "", { shouldDirty: true, shouldValidate: true });
    setValue("addressKey", "", { shouldDirty: true, shouldValidate: true });
    setValue("locationKey", "", { shouldDirty: true, shouldValidate: true });
  }, [centers, selectedAddressId, setValue]);

  const selectCenter = React.useCallback(
    (centerId: string, onChange: (value: string) => void) => {
      const center = centers.find((item) => item.id === centerId);
      if (!center) return;

      onChange(center.id);
      setValue("addressKey", center.addressKey || center.id, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("locationKey", center.locationKey || center.addressKey || center.id, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [centers, setValue]
  );

  return (
    <div className="space-y-4">
      {selectedCenter ? (
        <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="font-bold text-foreground">
              Centre sélectionné : {selectedCenter.name}
            </p>
            <p className="mt-1 leading-6 text-muted-foreground">
              {selectedCenter.street}, {selectedCenter.zip} {selectedCenter.city}. Vous pouvez le conserver
              ou choisir un autre centre disponible.
            </p>
          </div>
        </div>
      ) : null}

      {isLoadingCenters ? (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Chargement des centres disponibles...
        </div>
      ) : loadError ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          Les centres actifs sont affiches depuis le catalogue de secours. Le service dynamique sera retente au prochain chargement.
        </div>
      ) : null}

      <Controller
        control={control}
        name="addressId"
        render={({ field }) => (
          <RadioGroup
            onValueChange={(centerId) => selectCenter(centerId, field.onChange)}
            value={field.value}
            className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2"
          >
            {centers.map((address) => {
              const isSelected = field.value === address.id;

              return (
                <Label
                  key={address.id}
                  htmlFor={`addressId-${address.id}`}
                  className="cursor-pointer"
                >
                  <RadioGroupItem
                    value={address.id}
                    id={`addressId-${address.id}`}
                    className="sr-only"
                  />

                  <Card
                    className={cn(
                      "overflow-hidden transition-all duration-200 hover:shadow-lg",
                      isSelected
                        ? "scale-[1.01] ring-2 ring-primary ring-offset-2 ring-offset-background"
                        : "hover:border-primary/50"
                    )}
                  >
                    <CardHeader className="p-0">
                      <div className="relative h-48 w-full">
                        <Map center={{ lat: address.lat, lng: address.lng }} zoom={15} />
                      </div>
                    </CardHeader>

                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="mt-1 h-5 w-5 shrink-0 text-primary" />
                        <div>
                          <p className="font-bold">{address.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {address.street}, {address.zip} {address.city}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Label>
              );
            })}
          </RadioGroup>
        )}
      />
    </div>
  );
};

export default DomiciliationStep;
