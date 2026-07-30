"use client";

import * as React from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MoreHorizontal, Search, UserCog, ShieldCheck, MapPin, Users, Edit, Building2, Filter, Navigation, LayoutGrid, AlertCircle, Loader2, PlusCircle, PauseCircle, PlayCircle, Archive
} from "lucide-react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { AddressAutocomplete } from "@/components/address-autocomplete";
import {
  allAddresses,
  type Address,
  type AddressStatus,
  type CenterGovernanceAddress,
  isLegacyAddressId,
  mergeAddressesWithDefaults,
  normalizeCenterGovernanceFromFirestore,
} from "@/lib/addresses";
import { collection, doc, onSnapshot, query, serverTimestamp, setDoc } from "firebase/firestore";
import { Client, User } from "../clients/page";
import { useRole } from "@/hooks/use-simulated-role";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";

const Map = dynamic(() => import("@/components/map").then(mod => mod.Map), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-xl">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <MapPin className="h-10 w-10 text-primary animate-bounce" />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-1 bg-primary/20 rounded-full blur-sm" />
        </div>
        <span className="text-xs text-primary font-bold uppercase tracking-widest animate-pulse">Initialisation Cartographique...</span>
      </div>
    </div>
  )
});

import { useAuth, useDb, useFirebase } from "@/firebase";
import { getFunctions, httpsCallable } from "firebase/functions";
import { STAFF_ROLES, UserRole } from "@/lib/constants/roles";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type AddressId = Address["id"];
type CenterClientStats = {
  totalClients: number;
  activeClients: number;
};

type CenterFormState = {
  slug: string;
  name: string;
  street: string;
  city: string;
  zip: string;
  country: string;
  lat: string;
  lng: string;
  companyName: string;
  companyType: string;
  companyCapital: string;
  companyRcs: string;
  companyApproval: string;
  companyRepresentative: string;
  localSurface: string;
};

type CenterGovernanceFormState = {
  status: AddressStatus;
  subscriptionPlan: string;
  subscriptionStatus: string;
  subscriptionRenewalDate: string;
  publicSignupEnabled: string;
  documentsReady: string;
  billingReady: string;
  quotaClients: string;
  quotaDocuments: string;
  quotaStorageGb: string;
  quotaScansMonthly: string;
  transitionReason: string;
};

type CenterHealthSnapshot = {
  label: string;
  detail: string;
  badgeClassName: string;
};

const GOVERNANCE_EMPTY_VALUE = "__none__";
const CENTER_SUBSCRIPTION_PLAN_OPTIONS = [
  { value: "starter", label: "Starter" },
  { value: "growth", label: "Growth" },
  { value: "business", label: "Business" },
  { value: "enterprise", label: "Enterprise" },
] as const;
const CENTER_SUBSCRIPTION_STATUS_OPTIONS = [
  { value: "trialing", label: "Essai" },
  { value: "active", label: "Actif" },
  { value: "past_due", label: "Paiement requis" },
  { value: "canceled", label: "Resilie" },
] as const;

const initialCenterForm: CenterFormState = {
  slug: "",
  name: "",
  street: "",
  city: "",
  zip: "",
  country: "France",
  lat: "",
  lng: "",
  companyName: "",
  companyType: "",
  companyCapital: "",
  companyRcs: "",
  companyApproval: "",
  companyRepresentative: "",
  localSurface: "",
};

const slugifyCenterId = (value: string) => {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
};

const parseCoordinate = (value: string, fallback: number) => {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseOptionalQuota = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed.replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const getLegacyManagerRole = (addressId: string): UserRole | null => {
  if (!isLegacyAddressId(addressId)) return null;
  return addressId === "paris_12e" ? "manager_paris" : "manager_orly";
};

const normalizeCenterId = (centerId: string): string => {
  const normalized = centerId.trim().toLowerCase();
  if (normalized === "paris") return "paris_12e";
  if (normalized === "orly") return "orly_ville";
  return normalized;
};

const normalizeClientCenterId = (client: Client): string | null => {
  const rawCenter =
    (client as any).centerId ??
    (client as any).managedCenterId ??
    (client as any).domiciliationAddressId ??
    (client as any).addressId ??
    (client as any).locationKey ??
    (client as any).addressKey ??
    "";
  const key = String(rawCenter).trim().toLowerCase();
  return key ? normalizeCenterId(key) : null;
};

const isOperationalClient = (client: Client) => {
  const status = String((client as any).status ?? "").trim().toLowerCase();
  return status === "active" || status === "actif" || status === "approved";
};

const centerAliases = (address: CenterGovernanceAddress) => {
  return [address.id, address.slug, address.addressKey, address.locationKey]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .map((value) => normalizeCenterId(value));
};

const booleanToSelectValue = (value?: boolean) => (value ? "true" : "false");

const selectValueToBoolean = (value: string) => value === "true";

const isCenterPublicationReady = (
  center: Pick<
    CenterGovernanceAddress,
    "status" | "publicSignupEnabled" | "documentsReady" | "billingReady"
  >
) => {
  return (
    center.status === "active" &&
    center.publicSignupEnabled === true &&
    center.documentsReady === true &&
    center.billingReady === true
  );
};

const getMissingPublicationSteps = (
  center: Pick<
    CenterGovernanceAddress,
    "status" | "publicSignupEnabled" | "documentsReady" | "billingReady"
  >
) => {
  const missing: string[] = [];
  if (center.status !== "active") missing.push("centre actif");
  if (center.publicSignupEnabled !== true) missing.push("publication inscription");
  if (center.documentsReady !== true) missing.push("documents");
  if (center.billingReady !== true) missing.push("facturation");
  return missing;
};

const buildGovernanceForm = (address: CenterGovernanceAddress): CenterGovernanceFormState => ({
  status: address.status,
  subscriptionPlan: address.subscriptionPlan || GOVERNANCE_EMPTY_VALUE,
  subscriptionStatus: address.subscriptionStatus || GOVERNANCE_EMPTY_VALUE,
  subscriptionRenewalDate: address.subscriptionRenewalDate || "",
  publicSignupEnabled: booleanToSelectValue(address.publicSignupEnabled),
  documentsReady: booleanToSelectValue(address.documentsReady),
  billingReady: booleanToSelectValue(address.billingReady),
  quotaClients: address.quotaClients ? String(address.quotaClients) : "",
  quotaDocuments: address.quotaDocuments ? String(address.quotaDocuments) : "",
  quotaStorageGb: address.quotaStorageGb ? String(address.quotaStorageGb) : "",
  quotaScansMonthly: address.quotaScansMonthly ? String(address.quotaScansMonthly) : "",
  transitionReason: "",
});

const getCenterSubscriptionLabel = (address: CenterGovernanceAddress) => {
  if (!address.subscriptionPlan) return "A configurer";
  const knownPlan = CENTER_SUBSCRIPTION_PLAN_OPTIONS.find((option) => option.value === address.subscriptionPlan);
  return knownPlan?.label ?? address.subscriptionPlan;
};

const getCenterSubscriptionStatusLabel = (address: CenterGovernanceAddress) => {
  const status = String(address.subscriptionStatus ?? "").trim().toLowerCase();
  const knownStatus = CENTER_SUBSCRIPTION_STATUS_OPTIONS.find((option) => option.value === status);
  return knownStatus?.label ?? (status ? status : "A configurer");
};

const getCenterStatusLabel = (status: AddressStatus) => {
  if (status === "active") return "Actif";
  if (status === "inactive") return "Suspendu";
  return "Archive";
};

const getCenterStatusClassName = (status: AddressStatus) => {
  if (status === "active") return "text-emerald-600";
  if (status === "inactive") return "text-rose-600";
  return "text-slate-500";
};

const getCenterStatusDotClassName = (status: AddressStatus) => {
  if (status === "active") return "bg-emerald-500 shadow-emerald-500/50";
  if (status === "inactive") return "bg-rose-500 shadow-rose-500/50";
  return "bg-slate-400 shadow-slate-400/50";
};

const formatRenewalDateLabel = (value?: string) => {
  if (!value) return "A planifier";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("fr-FR");
};

const formatTimestampLabel = (value: unknown) => {
  if (!value) return "Aucune trace";
  if (typeof value === "object" && value !== null && "toDate" in (value as any)) {
    try {
      return (value as any).toDate().toLocaleString("fr-FR");
    } catch {
      return "Aucune trace";
    }
  }
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return "Aucune trace";
  return parsed.toLocaleString("fr-FR");
};

const getLifecycleSnapshot = (address: CenterGovernanceAddress) => {
  if (address.status === "archived") {
    return {
      label: "Centre archive",
      detail: address.archiveReason || address.statusChangeReason || "Archivage sans motif renseigne.",
      changedAt: address.archivedAt || address.statusUpdatedAt,
      changedBy: address.archivedBy || address.statusUpdatedBy || "",
    };
  }

  if (address.status === "inactive") {
    return {
      label: "Centre suspendu",
      detail: address.suspensionReason || address.statusChangeReason || "Suspension sans motif renseigne.",
      changedAt: address.suspendedAt || address.statusUpdatedAt,
      changedBy: address.suspendedBy || address.statusUpdatedBy || "",
    };
  }

  if (address.lastStatusTransition === "reactivated" || address.reactivatedAt) {
    return {
      label: "Centre reactive",
      detail:
        address.reactivationReason ||
        address.statusChangeReason ||
        "Reactivation sans motif renseigne.",
      changedAt: address.reactivatedAt || address.statusUpdatedAt,
      changedBy: address.reactivatedBy || address.statusUpdatedBy || "",
    };
  }

  return {
    label: "Centre actif",
    detail: "Aucune suspension en cours sur ce centre.",
    changedAt: address.statusUpdatedAt,
    changedBy: address.statusUpdatedBy || "",
  };
};

const getCenterHealthSnapshot = (
  address: CenterGovernanceAddress,
  manager: User | undefined,
  stats: CenterClientStats
): CenterHealthSnapshot => {
  if (address.status !== "active") {
    if (address.status === "archived") {
      return {
        label: "Centre archive",
        detail: "Le centre est masque du reseau actif. Les donnees restent conservees pour audit et historique.",
        badgeClassName: "border-slate-200 bg-slate-50 text-slate-700",
      };
    }

    return {
      label: "Centre suspendu",
      detail: "Le centre est desactive et ne doit plus produire de nouveaux dossiers.",
      badgeClassName: "border-rose-200 bg-rose-50 text-rose-700",
    };
  }

  if (!manager) {
    return {
      label: "Gestionnaire manquant",
      detail: "Aucun gestionnaire principal n'est encore affecte a ce centre.",
      badgeClassName: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  if (!isCenterPublicationReady(address)) {
    const missingSteps = getMissingPublicationSteps(address);
    return {
      label: "Centre non publiable",
      detail: `Le centre reste masque de l'inscription publique. A finaliser : ${missingSteps.join(", ")}.`,
      badgeClassName: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  const subscriptionStatus = String(address.subscriptionStatus ?? "").trim().toLowerCase();
  if (!address.subscriptionPlan || !subscriptionStatus || subscriptionStatus === GOVERNANCE_EMPTY_VALUE) {
    return {
      label: "Abonnement a configurer",
      detail: "Le centre est actif mais la gouvernance SaaS n'est pas encore renseignee.",
      badgeClassName: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  if (subscriptionStatus === "past_due" || subscriptionStatus === "canceled") {
    return {
      label: "Contrat a risque",
      detail: "Le statut d'abonnement demande une action de facturation ou de renouvellement.",
      badgeClassName: "border-rose-200 bg-rose-50 text-rose-700",
    };
  }

  if (address.quotaClients && stats.activeClients >= address.quotaClients) {
    return {
      label: "Quota clients atteint",
      detail: "Le centre a atteint sa capacite active autorisee.",
      badgeClassName: "border-rose-200 bg-rose-50 text-rose-700",
    };
  }

  if (address.quotaClients && stats.activeClients / address.quotaClients >= 0.85) {
    return {
      label: "Quota sous tension",
      detail: "La capacite client approche la limite contractuelle du centre.",
      badgeClassName: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  return {
    label: "Centre sous controle",
    detail: "Abonnement, manager et capacite client sont coherents.",
    badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };
};

const centersForUser = (user?: User | null): string[] => {
  if (!user) return [];
  const centers = new Set<string>();

  if (Array.isArray(user.managedCenterIds)) {
    user.managedCenterIds.forEach((centerId) => {
      if (typeof centerId === "string" && centerId.trim()) centers.add(normalizeCenterId(centerId));
    });
  }

  if (user.managedAddressId) centers.add(normalizeCenterId(user.managedAddressId));
  if (user.role === "manager_paris" || user.role === "secretary_paris") centers.add("paris_12e");
  if (user.role === "manager_orly" || user.role === "secretary_orly") centers.add("orly_ville");

  return Array.from(centers);
};

const PARIS_REGION_CENTER = { lat: 48.8566, lng: 2.3522 };
const PARIS_REGION_ZOOM = 10;
const DEFAULT_FRANCE_COORDINATES = { lat: 46.603354, lng: 1.888334 };

const hasReliableMapCoordinates = (address: Address) => {
  const hasFiniteCoordinates = Number.isFinite(address.lat) && Number.isFinite(address.lng);
  const isDefaultFallback =
    Math.abs(address.lat - DEFAULT_FRANCE_COORDINATES.lat) < 0.00001 &&
    Math.abs(address.lng - DEFAULT_FRANCE_COORDINATES.lng) < 0.00001;

  return hasFiniteCoordinates && !isDefaultFallback;
};

const getPlaceComponent = (place: any, type: string, useShortName = false) => {
  const components = place?.address_components ?? place?.addressComponents ?? [];
  const component = Array.isArray(components)
    ? components.find((entry: any) => Array.isArray(entry?.types) && entry.types.includes(type))
    : null;

  if (!component) return "";
  if (useShortName) return component.short_name ?? component.shortText ?? component.shortName ?? "";
  return component.long_name ?? component.longText ?? component.longName ?? component.short_name ?? "";
};

const getPlaceCoordinates = (place: any) => {
  const location = place?.geometry?.location ?? place?.location;
  const lat = typeof location?.lat === "function" ? location.lat() : location?.lat;
  const lng = typeof location?.lng === "function" ? location.lng() : location?.lng;

  return {
    lat: typeof lat === "number" && Number.isFinite(lat) ? String(lat) : "",
    lng: typeof lng === "number" && Number.isFinite(lng) ? String(lng) : "",
  };
};

const getStreetFromPlace = (place: any) => {
  const streetNumber = getPlaceComponent(place, "street_number");
  const route = getPlaceComponent(place, "route");
  const street = [streetNumber, route].filter(Boolean).join(" ").trim();
  return street || place?.formatted_address || place?.formattedAddress || place?.name || "";
};

/* =========================
   UI Components
 ========================= */

const CenterTextField = ({
  form,
  id,
  label,
  placeholder,
  className,
  onChange,
}: {
  form: CenterFormState;
  id: keyof CenterFormState;
  label: string;
  placeholder?: string;
  className?: string;
  onChange: (field: keyof CenterFormState, value: string) => void;
}) => (
  <div className={cn("space-y-2", className)}>
    <Label htmlFor={`center-${id}`} className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
      {label}
    </Label>
    <Input
      id={`center-${id}`}
      value={form[id]}
      onChange={(event) => onChange(id, event.target.value)}
      placeholder={placeholder}
      className="h-10 border-slate-200 bg-white text-slate-950 placeholder:text-slate-400 focus-visible:ring-primary/30"
    />
  </div>
);

const AssignManagerDialog = ({
  address,
  managers,
  onAssign,
}: {
  address: Address;
  managers: User[];
  onAssign: (addressId: AddressId, managerId: string, newRole: UserRole) => void;
}) => {
  const [selectedManagerId, setSelectedManagerId] = React.useState("");

  const handleAssign = () => {
    if (!selectedManagerId) return;
    onAssign(address.id, selectedManagerId, "manager");
  };

  return (
    <DialogContent className="border-slate-200 bg-white text-slate-950 shadow-2xl">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold font-headline tracking-tight text-slate-950">
          Assigner un gestionnaire
        </DialogTitle>
        <DialogDescription className="text-slate-600">
          Sélectionnez un membre de l&apos;équipe pour l&apos;adresse{" "}
          <span className="font-bold text-slate-950">{address.name}</span>.
        </DialogDescription>
      </DialogHeader>

      <div className="py-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="manager-select" className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Gestionnaires disponibles
          </Label>
          <Select onValueChange={setSelectedManagerId} value={selectedManagerId}>
            <SelectTrigger id="manager-select" className="h-12 border-slate-200 bg-white text-slate-950">
              <SelectValue placeholder="Sélectionnez un utilisateur" />
            </SelectTrigger>
            <SelectContent className="border-slate-200 bg-white text-slate-950 shadow-xl">
              {managers.map((manager) => (
                <SelectItem key={manager.id} value={manager.id} className="focus:bg-slate-100">
                  <div className="flex flex-col">
                    <span className="font-medium">{manager.displayName || "Sans nom"}</span>
                    <span className="text-[10px] text-slate-500">{manager.email}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter>
        <Button 
          onClick={handleAssign} 
          disabled={!selectedManagerId}
          className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20"
        >
          Confirmer l'Assignation
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

const CreateCenterDialog = ({
  form,
  isSubmitting,
  onChange,
  onSubmit,
}: {
  form: CenterFormState;
  isSubmitting: boolean;
  onChange: (field: keyof CenterFormState, value: string) => void;
  onSubmit: () => void;
}) => {
  const requiredFieldsReady = Boolean(
    form.name.trim() &&
    form.street.trim() &&
    form.city.trim() &&
    form.zip.trim() &&
    form.companyName.trim()
  );

  return (
    <DialogContent className="max-h-[92vh] max-w-3xl overflow-hidden border-slate-200 bg-white p-0 text-slate-950 shadow-2xl">
      <div className="border-b border-slate-200 bg-white px-6 py-5">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold font-headline tracking-tight text-slate-950">
          Ajouter un centre
        </DialogTitle>
        <DialogDescription className="text-slate-600">
          Créez une nouvelle adresse de domiciliation. Le centre sera disponible dans le référentiel Firestore, sans modifier les centres historiques.
        </DialogDescription>
      </DialogHeader>
      </div>

      <form
        className="max-h-[calc(92vh-112px)] overflow-y-auto px-6 py-5"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className="grid md:grid-cols-2 gap-3">
          <CenterTextField form={form} id="name" label="Nom du centre" placeholder="Ex: CCS - Lyon Part-Dieu" onChange={onChange} />
          <CenterTextField form={form} id="slug" label="Identifiant technique" placeholder="Auto si vide, ex: lyon_part_dieu" onChange={onChange} />
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="center-street" className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
              Adresse du centre
            </Label>
            <AddressAutocomplete
              id="center-street"
              value={form.street}
              onChange={(value) => onChange("street", value)}
              onPlaceSelected={(place) => {
                if (!place) return;
                const coordinates = getPlaceCoordinates(place);
                const city =
                  getPlaceComponent(place, "locality") ||
                  getPlaceComponent(place, "postal_town") ||
                  getPlaceComponent(place, "administrative_area_level_2");
                const zip = getPlaceComponent(place, "postal_code", true);
                const country = getPlaceComponent(place, "country");

                onChange("street", getStreetFromPlace(place));
                if (city) onChange("city", city);
                if (zip) onChange("zip", zip);
                if (country) onChange("country", country);
                if (coordinates.lat) onChange("lat", coordinates.lat);
                if (coordinates.lng) onChange("lng", coordinates.lng);
              }}
              placeholder="Commencez à saisir l'adresse du centre..."
              inputClassName="h-10 border-slate-200 bg-white text-slate-950 placeholder:text-slate-400 focus-visible:ring-primary/30"
            />
          </div>
          <CenterTextField form={form} id="city" label="Ville" placeholder="Ex: Lyon" onChange={onChange} />
          <CenterTextField form={form} id="zip" label="Code postal" placeholder="Ex: 69003" onChange={onChange} />
          <CenterTextField form={form} id="country" label="Pays" placeholder="France" onChange={onChange} />
          <CenterTextField form={form} id="lat" label="Latitude" placeholder="Optionnel" onChange={onChange} />
          <CenterTextField form={form} id="lng" label="Longitude" placeholder="Optionnel" onChange={onChange} />
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">Société exploitante</h3>
            <p className="text-xs text-slate-600 mt-1">
              Ces informations alimenteront ensuite les modèles de contrat et d'attestation.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <CenterTextField form={form} id="companyName" label="Raison sociale" placeholder="Ex: CONSULTING CONSEIL SERVICES" onChange={onChange} />
            <CenterTextField form={form} id="companyType" label="Forme juridique" placeholder="Ex: SARL" onChange={onChange} />
            <CenterTextField form={form} id="companyCapital" label="Capital social" placeholder="Ex: 100 000 EUR" onChange={onChange} />
            <CenterTextField form={form} id="companyRcs" label="RCS" placeholder="Ex: RCS Créteil 830 278 644" onChange={onChange} />
            <CenterTextField form={form} id="companyApproval" label="Agrément" placeholder="Ex: AG/DOM/2024-06" onChange={onChange} />
            <CenterTextField form={form} id="companyRepresentative" label="Représentant" placeholder="Ex: M. Rabah MAHFOUF, gérant" onChange={onChange} />
            <CenterTextField form={form} id="localSurface" label="Surface du local" placeholder="Ex: 57 m2" onChange={onChange} />
          </div>
        </div>

        <DialogFooter className="sticky bottom-0 -mx-6 mt-5 border-t border-slate-200 bg-white/95 px-6 py-4 backdrop-blur">
          <Button
            type="submit"
            disabled={!requiredFieldsReady || isSubmitting}
            className="w-full md:w-auto h-11 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création...
              </>
            ) : (
              <>
                <PlusCircle className="mr-2 h-4 w-4" />
                Créer le centre
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

const CenterGovernanceDialog = ({
  address,
  form,
  isOpen,
  isSubmitting,
  manager,
  stats,
  readOnly,
  onOpenChange,
  onChange,
  onSubmit,
}: {
  address: CenterGovernanceAddress | null;
  form: CenterGovernanceFormState | null;
  isOpen: boolean;
  isSubmitting: boolean;
  manager?: User;
  stats: CenterClientStats;
  readOnly: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (field: keyof CenterGovernanceFormState, value: string) => void;
  onSubmit: () => void;
}) => {
  if (!address || !form) return null;

  const health = getCenterHealthSnapshot(address, manager, stats);
  const lifecycle = getLifecycleSnapshot(address);
  const statusTransitionMode =
    form.status !== address.status
      ? form.status === "archived"
        ? "archive"
        : form.status === "inactive"
          ? "suspend"
          : "reactivate"
      : null;
  const requiresTransitionReason = statusTransitionMode !== null;
  const transitionReasonReady = !requiresTransitionReason || form.transitionReason.trim().length >= 6;
  const archiveBlockedByActiveClients = statusTransitionMode === "archive" && stats.activeClients > 0;
  const submitDisabled = isSubmitting || archiveBlockedByActiveClients;
  const formPublicationReady =
    form.status === "active" &&
    form.publicSignupEnabled === "true" &&
    form.documentsReady === "true" &&
    form.billingReady === "true";
  const publicationMissingSteps = getMissingPublicationSteps({
    status: form.status,
    publicSignupEnabled: selectValueToBoolean(form.publicSignupEnabled),
    documentsReady: selectValueToBoolean(form.documentsReady),
    billingReady: selectValueToBoolean(form.billingReady),
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-hidden border-slate-200 bg-white p-0 text-slate-950 shadow-2xl">
        <div className="border-b border-slate-200 bg-white px-6 py-5">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold font-headline tracking-tight text-slate-950">
              Pilotage du centre
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Abonnement, quotas et statut reseau pour <span className="font-bold text-slate-950">{address.name}</span>.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form
          className="max-h-[calc(92vh-112px)] overflow-y-auto px-6 py-5"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Centre</p>
                    <h3 className="text-lg font-bold text-slate-950">{address.name}</h3>
                    <p className="text-xs text-slate-600">
                      {address.street}, {address.zip} {address.city}
                    </p>
                  </div>
                  <Badge className={cn("border text-[10px] font-bold uppercase tracking-widest", health.badgeClassName)}>
                    {health.label}
                  </Badge>
                </div>
                <p className="mt-3 text-xs text-slate-600">{health.detail}</p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="center-status" className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                    Statut du centre
                  </Label>
                  <Select
                    disabled={readOnly}
                    onValueChange={(value) => onChange("status", value)}
                    value={form.status}
                  >
                    <SelectTrigger id="center-status" className="h-11 border-slate-200 bg-white text-slate-950">
                      <SelectValue placeholder="Selectionnez un statut" />
                    </SelectTrigger>
                    <SelectContent className="border-slate-200 bg-white text-slate-950 shadow-xl">
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="inactive">Suspendu</SelectItem>
                      <SelectItem value="archived">Archive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="center-plan" className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                    Plan centre
                  </Label>
                  <Select
                    disabled={readOnly}
                    onValueChange={(value) => onChange("subscriptionPlan", value)}
                    value={form.subscriptionPlan}
                  >
                    <SelectTrigger id="center-plan" className="h-11 border-slate-200 bg-white text-slate-950">
                      <SelectValue placeholder="Selectionnez un plan" />
                    </SelectTrigger>
                    <SelectContent className="border-slate-200 bg-white text-slate-950 shadow-xl">
                      <SelectItem value={GOVERNANCE_EMPTY_VALUE}>A configurer</SelectItem>
                      {CENTER_SUBSCRIPTION_PLAN_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="center-subscription-status" className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                    Statut abonnement
                  </Label>
                  <Select
                    disabled={readOnly}
                    onValueChange={(value) => onChange("subscriptionStatus", value)}
                    value={form.subscriptionStatus}
                  >
                    <SelectTrigger id="center-subscription-status" className="h-11 border-slate-200 bg-white text-slate-950">
                      <SelectValue placeholder="Selectionnez un statut" />
                    </SelectTrigger>
                    <SelectContent className="border-slate-200 bg-white text-slate-950 shadow-xl">
                      <SelectItem value={GOVERNANCE_EMPTY_VALUE}>A configurer</SelectItem>
                      {CENTER_SUBSCRIPTION_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="center-renewal-date" className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                    Prochain renouvellement
                  </Label>
                  <Input
                    id="center-renewal-date"
                    type="date"
                    value={form.subscriptionRenewalDate}
                    onChange={(event) => onChange("subscriptionRenewalDate", event.target.value)}
                    disabled={readOnly}
                    className="h-11 border-slate-200 bg-white text-slate-950"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">
                      Publication inscription
                    </h3>
                    <p className="mt-1 text-xs text-slate-600">
                      Le centre apparait dans l'inscription uniquement s'il est actif et si les documents
                      ainsi que la facturation sont prets.
                    </p>
                  </div>
                  <Badge
                    className={cn(
                      "border text-[10px] font-bold uppercase tracking-widest",
                      formPublicationReady
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-amber-200 bg-amber-50 text-amber-700"
                    )}
                  >
                    {formPublicationReady ? "Publication active" : "Non publiable"}
                  </Badge>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="public-signup-enabled" className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                      Publie dans l'inscription
                    </Label>
                    <Select
                      disabled={readOnly}
                      onValueChange={(value) => onChange("publicSignupEnabled", value)}
                      value={form.publicSignupEnabled}
                    >
                      <SelectTrigger id="public-signup-enabled" className="h-11 border-slate-200 bg-white text-slate-950">
                        <SelectValue placeholder="Non" />
                      </SelectTrigger>
                      <SelectContent className="border-slate-200 bg-white text-slate-950 shadow-xl">
                        <SelectItem value="false">Non</SelectItem>
                        <SelectItem value="true">Oui</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="documents-ready" className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                      Contrats / attestations prets
                    </Label>
                    <Select
                      disabled={readOnly}
                      onValueChange={(value) => onChange("documentsReady", value)}
                      value={form.documentsReady}
                    >
                      <SelectTrigger id="documents-ready" className="h-11 border-slate-200 bg-white text-slate-950">
                        <SelectValue placeholder="Non" />
                      </SelectTrigger>
                      <SelectContent className="border-slate-200 bg-white text-slate-950 shadow-xl">
                        <SelectItem value="false">Non</SelectItem>
                        <SelectItem value="true">Oui</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="billing-ready" className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                      Facturation prete
                    </Label>
                    <Select
                      disabled={readOnly}
                      onValueChange={(value) => onChange("billingReady", value)}
                      value={form.billingReady}
                    >
                      <SelectTrigger id="billing-ready" className="h-11 border-slate-200 bg-white text-slate-950">
                        <SelectValue placeholder="Non" />
                      </SelectTrigger>
                      <SelectContent className="border-slate-200 bg-white text-slate-950 shadow-xl">
                        <SelectItem value="false">Non</SelectItem>
                        <SelectItem value="true">Oui</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {!formPublicationReady ? (
                  <p className="mt-3 text-xs font-medium text-amber-700">
                    Avant publication : {publicationMissingSteps.join(", ")}.
                  </p>
                ) : (
                  <p className="mt-3 text-xs font-medium text-emerald-700">
                    Ce centre est pret a etre propose dans le parcours d'inscription.
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">
                      Action d&apos;exploitation
                    </h3>
                    <p className="mt-1 text-xs text-slate-600">
                      La suspension coupe l&apos;acces operationnel. L&apos;archivage masque le centre
                      du reseau actif, sans supprimer les donnees ni l&apos;historique.
                    </p>
                  </div>
                  {statusTransitionMode === "suspend" ? (
                    <Badge className="border-rose-200 bg-rose-50 text-rose-700">
                      <PauseCircle className="mr-1 h-3.5 w-3.5" />
                      Suspension en preparation
                    </Badge>
                  ) : statusTransitionMode === "archive" ? (
                    <Badge className="border-slate-200 bg-slate-50 text-slate-700">
                      <Archive className="mr-1 h-3.5 w-3.5" />
                      Archivage en preparation
                    </Badge>
                  ) : statusTransitionMode === "reactivate" ? (
                    <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                      <PlayCircle className="mr-1 h-3.5 w-3.5" />
                      Reactivation en preparation
                    </Badge>
                  ) : (
                    <Badge className="border-slate-200 bg-slate-50 text-slate-700">
                      Aucun changement de statut
                    </Badge>
                  )}
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Impact equipe
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">
                      {manager?.displayName || manager?.email || "Aucun gestionnaire principal"}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      {statusTransitionMode === "suspend"
                        ? "Les collaborateurs rattaches perdront l'acces aux ecrans operationnels."
                        : statusTransitionMode === "archive"
                          ? "Le centre sortira du reseau actif. Il restera recuperable via le filtre Archives."
                        : statusTransitionMode === "reactivate"
                          ? "Les collaborateurs rattaches retrouveront l'acces aux ecrans operationnels."
                          : "Aucun impact d'acces supplementaire tant que le statut reste identique."}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Impact portefeuille
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">
                      {stats.activeClients} client(s) actif(s)
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      {statusTransitionMode === "archive"
                        ? "Archivage autorise seulement si aucun client actif n'est rattache au centre."
                        : "Les dossiers, PDFs et historiques restent conserves ; seule la prise en charge operationnelle est restreinte."}
                    </p>
                  </div>
                </div>

                {archiveBlockedByActiveClients ? (
                  <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    <div className="flex gap-3">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <p>
                        Archivage bloque : ce centre compte encore {stats.activeClients} client(s) actif(s).
                        Suspendez, transferez ou cloturez ces clients avant d&apos;archiver le centre.
                      </p>
                    </div>
                  </div>
                ) : null}

                <div className="mt-4 space-y-2">
                  <Label
                    htmlFor="center-transition-reason"
                    className="text-[10px] font-bold uppercase tracking-widest text-slate-600"
                  >
                    Motif de la transition
                  </Label>
                  <Textarea
                    id="center-transition-reason"
                    value={form.transitionReason}
                    onChange={(event) => onChange("transitionReason", event.target.value)}
                    disabled={readOnly}
                    placeholder={
                      statusTransitionMode === "suspend"
                        ? "Expliquez pourquoi le centre est suspendu (ex: impaye, audit, gel operationnel)."
                        : statusTransitionMode === "archive"
                          ? "Expliquez pourquoi le centre est archive (ex: doublon, fermeture definitive, migration terminee)."
                        : statusTransitionMode === "reactivate"
                          ? "Expliquez pourquoi le centre peut etre reactive."
                          : "Optionnel si vous mettez seulement a jour les quotas ou l'abonnement."
                    }
                    className={cn(
                      "min-h-[110px] bg-white text-slate-950",
                      requiresTransitionReason && !transitionReasonReady
                        ? "border-rose-300 ring-1 ring-rose-200 focus-visible:ring-rose-300"
                        : "border-slate-200"
                    )}
                  />
                  <p
                    className={cn(
                      "text-[11px]",
                      requiresTransitionReason && !transitionReasonReady
                        ? "font-semibold text-rose-600"
                        : "text-slate-500"
                    )}
                  >
                    {requiresTransitionReason
                      ? "Un motif d'au moins 6 caracteres est obligatoire pour suspendre, archiver ou reactiver un centre."
                      : "Le motif reste optionnel tant que vous ne changez pas le statut du centre."}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">Quotas d'exploitation</h3>
                  <p className="mt-1 text-xs text-slate-600">
                    Laissez vide pour signaler qu'un quota n'est pas encore contractualise.
                  </p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="quota-clients" className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                      Clients actifs max
                    </Label>
                    <Input
                      id="quota-clients"
                      inputMode="numeric"
                      value={form.quotaClients}
                      onChange={(event) => onChange("quotaClients", event.target.value)}
                      disabled={readOnly}
                      placeholder="Ex: 120"
                      className="h-11 border-slate-200 bg-white text-slate-950"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quota-documents" className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                      Documents mensuels
                    </Label>
                    <Input
                      id="quota-documents"
                      inputMode="numeric"
                      value={form.quotaDocuments}
                      onChange={(event) => onChange("quotaDocuments", event.target.value)}
                      disabled={readOnly}
                      placeholder="Ex: 450"
                      className="h-11 border-slate-200 bg-white text-slate-950"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quota-storage" className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                      Stockage (Go)
                    </Label>
                    <Input
                      id="quota-storage"
                      inputMode="decimal"
                      value={form.quotaStorageGb}
                      onChange={(event) => onChange("quotaStorageGb", event.target.value)}
                      disabled={readOnly}
                      placeholder="Ex: 40"
                      className="h-11 border-slate-200 bg-white text-slate-950"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quota-scans" className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                      Scans mensuels
                    </Label>
                    <Input
                      id="quota-scans"
                      inputMode="numeric"
                      value={form.quotaScansMonthly}
                      onChange={(event) => onChange("quotaScansMonthly", event.target.value)}
                      disabled={readOnly}
                      placeholder="Ex: 250"
                      className="h-11 border-slate-200 bg-white text-slate-950"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">Lecture gouvernance</h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Gestionnaire principal</p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">{manager?.displayName || manager?.email || "Aucun gestionnaire"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Abonnement actuel</p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">
                      {getCenterSubscriptionLabel(address)} - {getCenterSubscriptionStatusLabel(address)}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">Renouvellement : {formatRenewalDateLabel(address.subscriptionRenewalDate)}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Inscription publique
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">
                      {isCenterPublicationReady(address) ? "Visible" : "Masquee"}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      {isCenterPublicationReady(address)
                        ? "Centre publie dans le parcours public."
                        : `A finaliser : ${getMissingPublicationSteps(address).join(", ")}.`}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Dernier etat reseau
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">{lifecycle.label}</p>
                    <p className="mt-1 text-xs text-slate-600">{lifecycle.detail}</p>
                    <p className="mt-2 text-[11px] text-slate-500">
                      {formatTimestampLabel(lifecycle.changedAt)}
                      {lifecycle.changedBy ? ` - ${lifecycle.changedBy}` : ""}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Derniere mise a jour de gouvernance
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">
                      {formatTimestampLabel(address.governanceUpdatedAt)}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      {address.governanceUpdatedBy || "Aucun auteur renseigne"}
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Clients</p>
                      <p className="mt-1 text-xl font-bold text-slate-950">{stats.activeClients}</p>
                      <p className="text-xs text-slate-600">{stats.totalClients} dossiers provisionnes</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Capacite client</p>
                      <p className="mt-1 text-xl font-bold text-slate-950">{address.quotaClients ?? "—"}</p>
                      <p className="text-xs text-slate-600">Quota contractuel</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Documents</p>
                      <p className="mt-1 text-xl font-bold text-slate-950">{address.quotaDocuments ?? "—"}</p>
                      <p className="text-xs text-slate-600">Quota mensuel</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Stockage / scans</p>
                      <p className="mt-1 text-xl font-bold text-slate-950">
                        {(address.quotaStorageGb ?? "—")}/{(address.quotaScansMonthly ?? "—")}
                      </p>
                      <p className="text-xs text-slate-600">Go / scans mensuels</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 -mx-6 mt-5 border-t border-slate-200 bg-white/95 px-6 py-4 backdrop-blur">
            {readOnly ? (
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-11 border-slate-200 bg-white text-slate-950">
                Fermer
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={submitDisabled}
                className="h-11 bg-primary text-white hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    {statusTransitionMode === "suspend" ? (
                      <PauseCircle className="mr-2 h-4 w-4" />
                    ) : statusTransitionMode === "archive" ? (
                      <Archive className="mr-2 h-4 w-4" />
                    ) : statusTransitionMode === "reactivate" ? (
                      <PlayCircle className="mr-2 h-4 w-4" />
                    ) : (
                      <ShieldCheck className="mr-2 h-4 w-4" />
                    )}
                    {statusTransitionMode === "suspend"
                      ? "Suspendre le centre"
                      : statusTransitionMode === "archive"
                        ? "Archiver le centre"
                      : statusTransitionMode === "reactivate"
                        ? "Reactiver le centre"
                        : "Enregistrer la gouvernance"}
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

/* =========================
   SuperAdmin View
 ========================= */

const SuperAdminView = ({
  canEditNetwork = true,
  visibleCenterIds,
}: {
  canEditNetwork?: boolean;
  visibleCenterIds?: string[];
}) => {
  const [addresses, setAddresses] = React.useState<CenterGovernanceAddress[]>(allAddresses);
  const [filteredAddresses, setFilteredAddresses] = React.useState<CenterGovernanceAddress[]>(allAddresses);
  const [cityFilter, setCityFilter] = React.useState("");
  const [showArchived, setShowArchived] = React.useState(false);
  const [users, setUsers] = React.useState<User[]>([]);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [isCentersLoading, setIsCentersLoading] = React.useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [isCreatingCenter, setIsCreatingCenter] = React.useState(false);
  const [centerForm, setCenterForm] = React.useState<CenterFormState>(initialCenterForm);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = React.useState(false);
  const [addressToAssign, setAddressToAssign] = React.useState<CenterGovernanceAddress | null>(null);
  const [focusedAddress, setFocusedAddress] = React.useState<CenterGovernanceAddress | null>(null);
  const [isGovernanceDialogOpen, setIsGovernanceDialogOpen] = React.useState(false);
  const [addressToGovern, setAddressToGovern] = React.useState<CenterGovernanceAddress | null>(null);
  const [isSavingGovernance, setIsSavingGovernance] = React.useState(false);
  const [governanceForm, setGovernanceForm] = React.useState<CenterGovernanceFormState | null>(null);

  const db = useDb();
  const { firebaseApp } = useFirebase();
  const { toast } = useToast();
  const adminFunctions = React.useMemo(
    () => (firebaseApp ? getFunctions(firebaseApp, "europe-west9") : null),
    [firebaseApp]
  );
  const fnSetRole = React.useMemo(
    () => (adminFunctions ? httpsCallable(adminFunctions, "setRole") : null),
    [adminFunctions]
  );
  const fnUpdateCenterGovernance = React.useMemo(
    () =>
      adminFunctions ? httpsCallable(adminFunctions, "adminUpdateCenterGovernance") : null,
    [adminFunctions]
  );

  React.useEffect(() => {
    if (!db) {
      setIsCentersLoading(false);
      return;
    }

    setIsCentersLoading(true);
    const unsubscribe = onSnapshot(
      query(collection(db, "centers")),
      (snapshot) => {
        const firestoreAddresses = snapshot.docs.map((centerDoc) =>
          normalizeCenterGovernanceFromFirestore(centerDoc.id, centerDoc.data())
        );
        setAddresses(mergeAddressesWithDefaults(firestoreAddresses));
        setIsCentersLoading(false);
      },
      (error) => {
        console.error("Failed to load centers:", error);
        setAddresses(allAddresses);
        setIsCentersLoading(false);
      }
    );

    return () => unsubscribe();
  }, [db]);

  React.useEffect(() => {
    if (!db) return;
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersData = snapshot.docs.map((d) => ({
        ...(d.data() as any),
        id: d.id,
      })) as User[];
      setUsers(usersData);
    });
    return () => unsubscribe();
  }, [db]);

  React.useEffect(() => {
    if (!db) return;
    const unsubscribe = onSnapshot(collection(db, "clients"), (snapshot) => {
      const clientsData = snapshot.docs.map((entry) => ({
        id: entry.id,
        ...(entry.data() as any),
      })) as Client[];
      setClients(clientsData);
    });
    return () => unsubscribe();
  }, [db]);

  React.useEffect(() => {
    const lower = cityFilter.toLowerCase();
    const allowed = visibleCenterIds ? new Set(visibleCenterIds) : null;
    setFilteredAddresses(
      addresses.filter((a) => {
        const isVisible = !allowed || allowed.has(a.id);
        const matchesCity = a.city.toLowerCase().includes(lower);
        const matchesArchiveScope = showArchived || a.status !== "archived";
        return isVisible && matchesCity && matchesArchiveScope;
      })
    );
  }, [cityFilter, addresses, showArchived, visibleCenterIds]);

  React.useEffect(() => {
    if (!filteredAddresses.length) {
      setFocusedAddress(null);
      return;
    }

    setFocusedAddress((current) => {
      if (current && filteredAddresses.some((address) => address.id === current.id)) {
        return current;
      }
      return filteredAddresses[0];
    });
  }, [filteredAddresses]);

  const getManagerForAddress = (addressId: AddressId): User | undefined => {
    const byManagedCenters = users.find((u) => centersForUser(u).includes(addressId));
    if (byManagedCenters) return byManagedCenters;
    const byManaged = users.find((u: any) => u.managedAddressId === addressId);
    if (byManaged) return byManaged;
    const role = getLegacyManagerRole(addressId);
    return role ? users.find((u: any) => u.role === role) : undefined;
  };

  const handleAssignManager = async (addressId: AddressId, managerId: string, newRole: UserRole) => {
    if (!fnSetRole) return;
    if (newRole !== "manager") return;
    try {
      const oldManager = getManagerForAddress(addressId);

      if (oldManager?.email && oldManager.id !== managerId) {
        const remainingCenters = centersForUser(oldManager).filter((centerId) => centerId !== addressId);
        await fnSetRole({
          email: oldManager.email,
          newRole: remainingCenters.length > 0 ? "manager" : "client",
          managedCenterIds: remainingCenters,
          displayName: oldManager.displayName || oldManager.email,
        });
      }

      const newManager = users.find((u) => u.id === managerId);
      if (!newManager?.email) throw new Error("Manager sans email");

      const nextCenters = Array.from(new Set([...centersForUser(newManager), addressId]));

      await fnSetRole({
        email: newManager.email,
        newRole: "manager",
        managedCenterIds: nextCenters,
        displayName: newManager.displayName || newManager.email,
      });
      setIsAssignDialogOpen(false);
      setAddressToAssign(null);
      toast({
        title: "Gestionnaire mis a jour",
        description: `Le centre ${addressId} est maintenant rattache a ${newManager.displayName || newManager.email}.`,
      });
    } catch (error) {
      console.error("Failed to assign manager:", error);
      toast({
        variant: "destructive",
        title: "Assignation impossible",
        description: "La mise a jour du gestionnaire a echoue. Verifiez les droits et recommencez.",
      });
    }
  };

  const handleCreateCenter = async () => {
    if (!db) return;

    const centerId = slugifyCenterId(centerForm.slug || centerForm.name);
    const name = centerForm.name.trim();
    const street = centerForm.street.trim();
    const city = centerForm.city.trim();
    const zip = centerForm.zip.trim();
    const companyName = centerForm.companyName.trim();

    if (!centerId || !name || !street || !city || !zip || !companyName) return;

    setIsCreatingCenter(true);
    try {
      await setDoc(
        doc(db, "centers", centerId),
        {
          id: centerId,
          tenantId: "ccsdom",
          slug: centerId,
          name,
          street,
          city,
          zip,
          country: centerForm.country.trim() || "France",
          status: "active",
          lat: parseCoordinate(centerForm.lat, 46.603354),
          lng: parseCoordinate(centerForm.lng, 1.888334),
          companyName,
          companyType: centerForm.companyType.trim() || "Non renseigne",
          companyCapital: centerForm.companyCapital.trim() || "Non renseigne",
          companyRcs: centerForm.companyRcs.trim() || "Non renseigne",
          companyApproval: centerForm.companyApproval.trim() || "Non renseigne",
          companyRepresentative: centerForm.companyRepresentative.trim() || "Non renseigne",
          localSurface: centerForm.localSurface.trim() || "Non renseigne",
          localDetails: "",
          publicSignupEnabled: false,
          documentsReady: false,
          billingReady: false,
          readiness: {
            publicSignupEnabled: false,
            documentsReady: false,
            billingReady: false,
          },
          subscriptionPlan: "",
          subscriptionStatus: "",
          subscriptionRenewalDate: "",
          quotaClients: null,
          quotaDocuments: null,
          quotaStorageGb: null,
          quotaScansMonthly: null,
          subscription: {
            plan: "",
            status: "",
            renewalDate: "",
          },
          quotas: {
            clients: null,
            documents: null,
            storageGb: null,
            scansMonthly: null,
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          source: "admin_adresses",
        },
        { merge: true }
      );
      setCenterForm(initialCenterForm);
      setIsCreateDialogOpen(false);
      toast({
        title: "Centre cree",
        description: `${name} a ete ajoute au reseau. Pensez a lui affecter un gestionnaire et une gouvernance SaaS.`,
      });
    } catch (error) {
      console.error("Failed to create center:", error);
      toast({
        variant: "destructive",
        title: "Creation impossible",
        description: "Le centre n'a pas pu etre cree. Verifiez les champs puis recommencez.",
      });
    } finally {
      setIsCreatingCenter(false);
    }
  };

  const openGovernanceDialog = (address: CenterGovernanceAddress) => {
    setAddressToGovern(address);
    setGovernanceForm(buildGovernanceForm(address));
    setIsGovernanceDialogOpen(true);
  };

  const handleSaveGovernance = async () => {
    if (!addressToGovern || !governanceForm || !fnUpdateCenterGovernance) return;

    const requiresTransitionReason = governanceForm.status !== addressToGovern.status;
    if (requiresTransitionReason && governanceForm.transitionReason.trim().length < 6) {
      document.getElementById("center-transition-reason")?.focus();
      toast({
        variant: "destructive",
        title: "Motif requis",
        description:
          "Merci de renseigner un motif d'au moins 6 caracteres pour suspendre, archiver ou reactiver ce centre.",
      });
      return;
    }

    const currentStats = centerStatsById.get(addressToGovern.id) ?? { totalClients: 0, activeClients: 0 };
    if (governanceForm.status === "archived" && currentStats.activeClients > 0) {
      toast({
        variant: "destructive",
        title: "Archivage bloque",
        description: `Ce centre compte encore ${currentStats.activeClients} client(s) actif(s).`,
      });
      return;
    }

    const subscriptionPlan =
      governanceForm.subscriptionPlan === GOVERNANCE_EMPTY_VALUE ? "" : governanceForm.subscriptionPlan;
    const subscriptionStatus =
      governanceForm.subscriptionStatus === GOVERNANCE_EMPTY_VALUE ? "" : governanceForm.subscriptionStatus;
    const quotaClients = parseOptionalQuota(governanceForm.quotaClients);
    const quotaDocuments = parseOptionalQuota(governanceForm.quotaDocuments);
    const quotaStorageGb = parseOptionalQuota(governanceForm.quotaStorageGb);
    const quotaScansMonthly = parseOptionalQuota(governanceForm.quotaScansMonthly);
    const publicSignupEnabled = selectValueToBoolean(governanceForm.publicSignupEnabled);
    const documentsReady = selectValueToBoolean(governanceForm.documentsReady);
    const billingReady = selectValueToBoolean(governanceForm.billingReady);

    setIsSavingGovernance(true);
    try {
      await fnUpdateCenterGovernance({
        centerId: addressToGovern.id,
        data: {
          status: governanceForm.status,
          subscriptionPlan,
          subscriptionStatus,
          subscriptionRenewalDate: governanceForm.subscriptionRenewalDate || "",
          publicSignupEnabled,
          documentsReady,
          billingReady,
          quotaClients,
          quotaDocuments,
          quotaStorageGb,
          quotaScansMonthly,
          transitionReason: governanceForm.transitionReason,
        },
      });

      toast({
        title:
          governanceForm.status !== addressToGovern.status
            ? governanceForm.status === "archived"
              ? "Centre archive"
              : governanceForm.status === "inactive"
              ? "Centre suspendu"
              : "Centre reactive"
            : "Gouvernance enregistree",
        description:
          governanceForm.status !== addressToGovern.status
            ? governanceForm.status === "archived"
              ? `Le centre ${addressToGovern.name} est archive et masque du reseau actif.`
              : governanceForm.status === "inactive"
              ? `Le centre ${addressToGovern.name} est maintenant suspendu et les acces operationnels seront bloques.`
              : `Le centre ${addressToGovern.name} est de nouveau actif pour les equipes rattachees.`
            : `Le pilotage SaaS du centre ${addressToGovern.name} a ete mis a jour.`,
      });
      setIsGovernanceDialogOpen(false);
      setAddressToGovern(null);
      setGovernanceForm(null);
    } catch (error) {
      console.error("Failed to save center governance:", error);
      toast({
        variant: "destructive",
        title: "Enregistrement impossible",
        description: "La gouvernance du centre n'a pas pu etre sauvegardee.",
      });
    } finally {
      setIsSavingGovernance(false);
    }
  };

  const selectableManagers = React.useMemo(
    () => users.filter((u: any) => STAFF_ROLES.includes(u.role as UserRole) && u.role !== "super_admin"),
    [users]
  );

  const centerStatsById = React.useMemo(() => {
    const stats = new globalThis.Map<string, CenterClientStats>();

    addresses.forEach((address) => {
      const aliases = new Set(centerAliases(address));
      let totalClients = 0;
      let activeClients = 0;

      clients.forEach((client) => {
        const normalizedClientCenter = normalizeClientCenterId(client);
        if (!normalizedClientCenter || !aliases.has(normalizedClientCenter)) return;
        totalClients += 1;
        if (isOperationalClient(client)) activeClients += 1;
      });

      stats.set(address.id, { totalClients, activeClients });
    });

    return stats;
  }, [addresses, clients]);

  const selectedCenter = focusedAddress ?? filteredAddresses[0] ?? null;
  const selectedManager = selectedCenter ? getManagerForAddress(selectedCenter.id) : undefined;
  const selectedCenterStats = selectedCenter
    ? centerStatsById.get(selectedCenter.id) ?? { totalClients: 0, activeClients: 0 }
    : { totalClients: 0, activeClients: 0 };
  const selectedCenterHealth = selectedCenter
    ? getCenterHealthSnapshot(selectedCenter, selectedManager, selectedCenterStats)
    : null;

  const mapMarkers = React.useMemo(() => {
    return filteredAddresses
      .filter(hasReliableMapCoordinates)
      .map(a => ({
        id: a.id,
        lat: a.lat,
        lng: a.lng,
        title: a.name,
        status: a.status
      }));
  }, [filteredAddresses]);

  const focusedMappableAddress =
    focusedAddress && hasReliableMapCoordinates(focusedAddress) ? focusedAddress : null;

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 sm:space-y-6">
      <CenterGovernanceDialog
        address={addressToGovern}
        form={governanceForm}
        isOpen={isGovernanceDialogOpen}
        isSubmitting={isSavingGovernance}
        manager={addressToGovern ? getManagerForAddress(addressToGovern.id) : undefined}
        stats={addressToGovern ? centerStatsById.get(addressToGovern.id) ?? { totalClients: 0, activeClients: 0 } : { totalClients: 0, activeClients: 0 }}
        readOnly={!canEditNetwork}
        onOpenChange={(open) => {
          setIsGovernanceDialogOpen(open);
          if (!open) {
            setAddressToGovern(null);
            setGovernanceForm(null);
          }
        }}
        onChange={(field, value) => setGovernanceForm((current) => (current ? { ...current, [field]: value } : current))}
        onSubmit={handleSaveGovernance}
      />

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:flex-row lg:items-end lg:justify-between"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-primary/20 bg-primary/10 p-2.5 shadow-sm">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              {canEditNetwork ? "Réseau CCS DOM" : "Mes centres"}
            </h1>
          </div>
          <p className="ml-1 max-w-3xl text-sm leading-6 text-slate-600">
            {canEditNetwork
              ? "Visualisation et gestion des établissements de domiciliation. Assignez des gestionnaires et suivez le statut de chaque site en temps réel."
              : "Vue limitée aux centres qui vous sont assignés. La gouvernance réseau reste réservée au super admin."}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:justify-end">
          {canEditNetwork && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="h-10 rounded-xl bg-primary font-bold text-white shadow-sm shadow-primary/20 hover:bg-primary/90">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Ajouter un centre
                </Button>
              </DialogTrigger>
              <CreateCenterDialog
                form={centerForm}
                isSubmitting={isCreatingCenter}
                onChange={(field, value) => setCenterForm((current) => ({ ...current, [field]: value }))}
                onSubmit={handleCreateCenter}
              />
            </Dialog>
          )}
          {canEditNetwork && (
            <Button
              type="button"
              variant={showArchived ? "default" : "outline"}
              className={cn(
                "h-10 rounded-xl font-bold",
                showArchived
                  ? "bg-slate-900 text-white hover:bg-slate-800"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              )}
              onClick={() => setShowArchived((current) => !current)}
            >
              <Archive className="mr-2 h-4 w-4" />
              {showArchived ? "Masquer archives" : "Afficher archives"}
            </Button>
          )}
          <div className="relative group w-full sm:min-w-[300px]">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-primary" />
            <Input
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              placeholder="Filtrer par ville..."
              className="h-10 rounded-xl border-slate-200 bg-white pl-10 font-medium focus:border-primary/50"
            />
          </div>
          <Badge variant="outline" className="h-10 justify-center border-slate-200 bg-slate-50 px-4 font-bold uppercase tracking-wider text-slate-700">
            {isCentersLoading
              ? "Chargement..."
              : `${filteredAddresses.length} centre${filteredAddresses.length > 1 ? "s" : ""}${showArchived ? " archives incluses" : ""}`}
          </Badge>
        </div>
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-5 lg:gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-5 lg:col-span-3 lg:space-y-6"
        >
          <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-white p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg font-black text-slate-950">
                  <LayoutGrid className="h-4 w-4 text-primary" />
                  Établissements
                </CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:bg-slate-100">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid gap-3 p-3 sm:grid-cols-2 xl:hidden">
                <AnimatePresence mode="popLayout">
                  {filteredAddresses.map((address, idx) => {
                    const manager = getManagerForAddress(address.id);
                    const stats = centerStatsById.get(address.id) ?? { totalClients: 0, activeClients: 0 };
                    const health = getCenterHealthSnapshot(address, manager, stats);
                    const isFocused = focusedAddress?.id === address.id;

                    return (
                      <motion.div
                        key={address.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                      >
                        <Card
                          className={cn(
                            "overflow-hidden border bg-white text-slate-950 shadow-lg transition-all",
                            isFocused ? "border-primary/40 ring-2 ring-primary/15" : "border-slate-200"
                          )}
                        >
                          <CardHeader className="space-y-3 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <CardTitle className="truncate text-base font-black">{address.name}</CardTitle>
                                <CardDescription className="flex items-center gap-1 text-xs text-slate-500">
                                  <MapPin className="h-3 w-3" />
                                  {address.city} • {address.zip}
                                </CardDescription>
                              </div>
                              <Badge className={cn("shrink-0 border text-[9px] font-bold uppercase tracking-widest", health.badgeClassName)}>
                                {health.label}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs">
                              <div>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Gestionnaire</p>
                                <p className="truncate font-semibold">{manager?.email || "Non assigné"}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Statut</p>
                                <p className={cn("font-black", getCenterStatusClassName(address.status))}>
                                  {getCenterStatusLabel(address.status)}
                                </p>
                              </div>
                              {canEditNetwork && (
                                <>
                                  <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Abonnement</p>
                                    <p className="truncate font-semibold">{getCenterSubscriptionLabel(address)}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Clients</p>
                                    <p className="font-semibold">{stats.activeClients} / {address.quotaClients ?? "—"}</p>
                                  </div>
                                </>
                              )}
                            </div>
                          </CardHeader>

                          <CardContent className="grid grid-cols-2 gap-2 border-t border-slate-200 bg-slate-50 p-4">
                            <Button
                              type="button"
                              variant="outline"
                              className="h-11 rounded-2xl bg-white"
                              onClick={() => setFocusedAddress(address)}
                            >
                              Voir
                            </Button>
                            <Button
                              type="button"
                              className="h-11 rounded-2xl"
                              onClick={() => openGovernanceDialog(address)}
                            >
                              {canEditNetwork ? "Piloter" : "Détails"}
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              <div className="hidden overflow-x-auto xl:block">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow className="border-slate-100 hover:bg-transparent">
                    <TableHead className="pl-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">Nom / Ville</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Gestionnaire</TableHead>
                    {canEditNetwork && (
                      <TableHead className="hidden text-[10px] font-bold uppercase tracking-widest text-slate-500 xl:table-cell">Abonnement</TableHead>
                    )}
                    <TableHead className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">Statut</TableHead>
                    {canEditNetwork && (
                      <TableHead className="hidden text-center text-[10px] font-bold uppercase tracking-widest text-slate-500 xl:table-cell">Sante</TableHead>
                    )}
                    <TableHead className="w-[80px] pr-6 text-right text-[10px] font-bold uppercase tracking-widest text-slate-500">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {filteredAddresses.map((address, idx) => {
                      const manager = getManagerForAddress(address.id);
                      const stats = centerStatsById.get(address.id) ?? { totalClients: 0, activeClients: 0 };
                      const health = getCenterHealthSnapshot(address, manager, stats);
                      const isFocused = focusedAddress?.id === address.id;
                      return (
                        <motion.tr
                          key={address.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => setFocusedAddress(address)}
                          className={cn(
                            "group cursor-pointer border-slate-100 transition-all",
                            isFocused ? "bg-primary/[0.08]" : "hover:bg-slate-50/80"
                          )}
                        >
                          <TableCell className="pl-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold tracking-tight text-slate-950">{address.name}</span>
                              <span className="flex items-center gap-1 text-[10px] uppercase text-slate-500">
                                <MapPin className="h-2.5 w-2.5" /> {address.city} • {address.zip}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {manager ? (
                              <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                  <Users className="h-3 w-3 text-primary" />
                                </div>
                                <span className="text-xs font-semibold text-slate-700">{manager.email}</span>
                              </div>
                            ) : (
                              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-[9px] font-bold uppercase tracking-wider text-amber-700">Non assigné</Badge>
                            )}
                          </TableCell>
                          {canEditNetwork && (
                            <TableCell className="hidden xl:table-cell">
                              <div className="space-y-1">
                                <div className="text-xs font-semibold text-slate-900">
                                  {getCenterSubscriptionLabel(address)}
                                </div>
                                <div className="text-[10px] uppercase tracking-widest text-slate-500">
                                  {getCenterSubscriptionStatusLabel(address)}
                                </div>
                                <div className="text-[10px] text-slate-500">
                                  {stats.activeClients} actif(s) / quota {address.quotaClients ?? "—"}
                                </div>
                              </div>
                            </TableCell>
                          )}
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className={cn("h-1.5 w-1.5 rounded-full shadow-glow", getCenterStatusDotClassName(address.status))} />
                              <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                                {getCenterStatusLabel(address.status)}
                              </span>
                            </div>
                          </TableCell>
                          {canEditNetwork && (
                            <TableCell className="hidden xl:table-cell text-center">
                              <Badge className={cn("border text-[9px] font-bold uppercase tracking-widest", health.badgeClassName)}>
                                {health.label}
                              </Badge>
                            </TableCell>
                          )}
                          <TableCell className="text-right pr-6">
                            <Dialog
                              open={isAssignDialogOpen && addressToAssign?.id === address.id}
                              onOpenChange={(isOpen) => {
                                if (!isOpen) setAddressToAssign(null);
                                setIsAssignDialogOpen(isOpen);
                              }}
                            >
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-all">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="border-slate-200 bg-white">
                                  <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Centre : {address.id}</DropdownMenuLabel>
                                  {canEditNetwork ? (
                                    <DialogTrigger asChild>
                                      <DropdownMenuItem onClick={() => setAddressToAssign(address)} className="focus:bg-primary/10">
                                        <UserCog className="mr-2 h-4 w-4" /> Assigner Gestionnaire
                                      </DropdownMenuItem>
                                    </DialogTrigger>
                                  ) : (
                                    <DropdownMenuItem disabled className="opacity-40">
                                      <UserCog className="mr-2 h-4 w-4" /> Lecture seule
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem onClick={() => openGovernanceDialog(address)} className="focus:bg-primary/10">
                                    <Edit className="mr-2 h-4 w-4" /> {canEditNetwork ? "Piloter centre" : "Voir gouvernance"}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                              {addressToAssign && (
                                <AssignManagerDialog address={addressToAssign} managers={selectableManagers} onAssign={handleAssignManager} />
                              )}
                            </Dialog>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>

          {selectedCenter && selectedCenterHealth && (
            <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
              <CardHeader className="border-b border-slate-100 bg-white p-4 sm:p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2 text-lg font-black text-slate-950">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      Cockpit centre
                    </CardTitle>
                    <CardDescription className="text-sm text-slate-600">
                      Pilotage rapide de {selectedCenter.name}, avec abonnement, quotas et sante reseau.
                    </CardDescription>
                  </div>
                  <Badge className={cn("w-fit border text-[10px] font-bold uppercase tracking-widest", selectedCenterHealth.badgeClassName)}>
                    {selectedCenterHealth.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-5">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Gestionnaire</p>
                    <p className="mt-2 text-sm font-semibold text-slate-950">
                      {selectedManager?.displayName || selectedManager?.email || "Aucun gestionnaire"}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-500">Affectation principale du centre</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Abonnement</p>
                    <p className="mt-2 text-sm font-semibold text-slate-950">
                      {getCenterSubscriptionLabel(selectedCenter)}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      {getCenterSubscriptionStatusLabel(selectedCenter)} - {formatRenewalDateLabel(selectedCenter.subscriptionRenewalDate)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Inscription publique</p>
                    <p className="mt-2 text-sm font-semibold text-slate-950">
                      {isCenterPublicationReady(selectedCenter) ? "Visible" : "Masquee"}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      {isCenterPublicationReady(selectedCenter)
                        ? "Prete pour les nouveaux clients"
                        : getMissingPublicationSteps(selectedCenter).join(", ")}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Clients</p>
                    <p className="mt-2 text-sm font-semibold text-slate-950">
                      {selectedCenterStats.activeClients} actifs / {selectedCenterStats.totalClients} total
                    </p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      Quota : {selectedCenter.quotaClients ?? "A configurer"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Capacites</p>
                    <p className="mt-2 text-sm font-semibold text-slate-950">
                      Docs {selectedCenter.quotaDocuments ?? "—"} / Stockage {selectedCenter.quotaStorageGb ?? "—"} Go
                    </p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      Scans : {selectedCenter.quotaScansMonthly ?? "A configurer"}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Lecture super admin</p>
                  <p className="mt-2 text-sm text-slate-700">{selectedCenterHealth.detail}</p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <Button
                    type="button"
                    onClick={() => openGovernanceDialog(selectedCenter)}
                    className="h-10 rounded-xl bg-primary text-white hover:bg-primary/90"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    {canEditNetwork ? "Mettre a jour la gouvernance" : "Consulter la gouvernance"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFocusedAddress(selectedCenter)}
                    className="h-10 rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  >
                    <Navigation className="mr-2 h-4 w-4" />
                    Recentrer la carte
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="h-[420px] min-h-[360px] lg:sticky lg:top-24 lg:col-span-2 lg:h-[calc(100vh-200px)] lg:min-h-[500px]"
        >
          <Card className="group flex h-full flex-col overflow-hidden border-slate-200 bg-white p-0 shadow-sm">
            <div className="absolute top-4 left-4 z-20 pointer-events-none">
              <Badge className="flex items-center gap-2 border-slate-200 bg-white/90 p-2 px-3 text-primary shadow-lg backdrop-blur-md">
                <Navigation className="h-3.5 w-3.5 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Région parisienne • {mapMarkers.length} repère{mapMarkers.length > 1 ? "s" : ""}
                </span>
              </Badge>
            </div>
            
            <div className="flex-1 relative">
              <Map 
                markers={mapMarkers} 
                center={focusedMappableAddress ? { lat: focusedMappableAddress.lat, lng: focusedMappableAddress.lng } : PARIS_REGION_CENTER}
                zoom={focusedMappableAddress ? 14 : PARIS_REGION_ZOOM}
                className="transition-all duration-700"
              />
              
              {focusedAddress && (
                <div className="absolute bottom-6 left-6 right-6 z-20">
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur"
                  >
                    <div>
                      <h4 className="text-sm font-black text-slate-950">{focusedAddress.name}</h4>
                      <p className="text-[10px] text-slate-500">{focusedAddress.street}, {focusedAddress.city}</p>
                    </div>
                    <Button size="sm" variant="outline" className="h-8 gap-2 border-slate-200 bg-white text-[10px] font-bold uppercase" asChild>
                      <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${focusedAddress.street}, ${focusedAddress.zip} ${focusedAddress.city}`)}`} target="_blank" rel="noopener noreferrer">
                        Itinéraire <Navigation className="h-3 w-3" />
                      </a>
                    </Button>
                  </motion.div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

/* =========================
   Manager View
 ========================= */

const ManagerView = ({ addressId }: { addressId: Address["id"] }) => {
  const address = allAddresses.find((a) => a.id === addressId);
  const [clientCount, setClientCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const db = useDb();

  React.useEffect(() => {
    if (!db) return;
    setIsLoading(true);
    const qAll = query(collection(db, "clients"));
    const unsubscribe = onSnapshot(qAll, (snapshot) => {
      let count = 0;
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as any;
        const resolved = data?.domiciliationAddressId || data?.addressId || (data?.addressKey === "paris" ? "paris_12e" : data?.addressKey === "orly" ? "orly_ville" : null);
        if (resolved === addressId) count++;
      });
      setClientCount(count);
      setIsLoading(false);
    }, () => setIsLoading(false));
    return () => unsubscribe();
  }, [addressId, db]);

  if (!address) return <p>Adresse non trouvée.</p>;

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 sm:space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:flex-row lg:items-end lg:justify-between"
      >
        <div className="space-y-4">
          <Badge variant="outline" className="w-fit border-primary/20 bg-primary/5 px-3 py-1 font-bold text-primary">
            GESTION ÉTABLISSEMENT
          </Badge>
          <div className="space-y-1">
            <h1 className="text-2xl font-black leading-tight tracking-tight text-slate-950 sm:text-3xl">
              {address.name}
            </h1>
            <p className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="h-4 w-4 text-primary" /> {address.street}, {address.zip} {address.city}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="flex h-14 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-6">
             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Statut</span>
             <Badge
               variant={address.status === "active" ? "default" : "destructive"}
               className={cn(
                 "mt-0.5 shadow-glow",
                 address.status === "archived" && "bg-slate-700 text-white hover:bg-slate-700"
               )}
             >
                {address.status === "active" ? "Opérationnel" : getCenterStatusLabel(address.status)}
             </Badge>
           </div>
        </div>
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-3 lg:gap-8">
        <div className="space-y-5 lg:col-span-1 lg:space-y-8">
           <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.1 }}
           >
            <Card className="group overflow-hidden border-slate-200 bg-white shadow-sm">
              <CardHeader className="border-b border-slate-100 bg-white pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-tighter text-slate-600">
                  <Users className="h-4 w-4 text-primary" /> Volume Clients
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black tracking-tighter text-slate-950">
                    {isLoading ? "..." : clientCount}
                  </span>
                  <span className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-500">Entités Domiciliées</span>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-6">
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase text-slate-500">Capacité Locale</p>
                      <p className="text-sm font-bold text-slate-950">{address.localSurface}</p>
                   </div>
                   <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                   </div>
                </div>
              </CardContent>
            </Card>
           </motion.div>

           <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.2 }}
           >
            <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                  <AlertCircle className="h-3.5 w-3.5" /> Informations Légales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-1">
                   <p className="text-[10px] font-bold uppercase text-slate-500">Entité Juridique</p>
                   <p className="text-xs font-semibold leading-relaxed text-slate-950">{address.companyName}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-bold uppercase text-slate-500">Agrément Préfectoral</p>
                   <p className="text-xs font-medium italic text-slate-600">{address.companyApproval}</p>
                </div>
              </CardContent>
            </Card>
           </motion.div>
        </div>

        <motion.div 
           initial={{ opacity: 0, scale: 0.98 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.3 }}
           className="group relative h-[420px] min-h-[360px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:col-span-2 lg:aspect-video lg:min-h-[500px]"
        >
          <Map
            markers={[{
              id: address.id,
              lat: address.lat,
              lng: address.lng,
              title: address.name,
              status: address.status,
            }]}
            center={{ lat: address.lat, lng: address.lng }}
            zoom={14}
            className="grayscale-[0.2] contrast-[1.1]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          
          <div className="absolute top-6 left-6 z-20">
             <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 px-4 shadow-xl backdrop-blur">
               <div className="rounded-lg bg-primary p-2 shadow-lg shadow-primary/30">
                 <Building2 className="h-4 w-4 text-white" />
               </div>
               <div>
                 <p className="text-xs font-bold uppercase tracking-tighter text-slate-950">Site Opérationnel</p>
                 <p className="text-[10px] font-medium text-slate-500">Géolocalisation vérifiée</p>
               </div>
             </div>
          </div>

          <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col gap-3 sm:bottom-8 sm:left-8 sm:right-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="rounded-2xl border border-slate-200 bg-white/95 p-3 px-5 shadow-2xl backdrop-blur transition-transform duration-500 group-hover:scale-105">
               <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Coordonnées Réelles</p>
               <p className="font-mono text-xs font-bold text-slate-950">{address.lat.toFixed(4)}, {address.lng.toFixed(4)}</p>
            </div>
            
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address.street}, ${address.zip} ${address.city}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group/btn flex items-center justify-center gap-3 rounded-2xl bg-primary p-3 px-5 text-white shadow-2xl shadow-primary/30 transition-all hover:translate-y-[-2px] hover:bg-primary/90 active:scale-95"
            >
              <MapPin className="w-5 h-5 group-hover/btn:scale-125 transition-transform" />
              <span className="text-sm font-bold tracking-tight">Ouvrir Google Maps</span>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default function AdressesPage() {
  const { displayRole } = useRole();
  const auth = useAuth();
  const db = useDb();
  const [currentStaffUser, setCurrentStaffUser] = React.useState<User | null>(null);
  const [isCurrentStaffLoading, setIsCurrentStaffLoading] = React.useState(true);

  React.useEffect(() => {
    if (!auth || !db) {
      setIsCurrentStaffLoading(false);
      return;
    }

    let unsubscribeUser: (() => void) | null = null;

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      unsubscribeUser?.();
      unsubscribeUser = null;

      if (!user) {
        setCurrentStaffUser(null);
        setIsCurrentStaffLoading(false);
        return;
      }

      setIsCurrentStaffLoading(true);
      unsubscribeUser = onSnapshot(
        doc(db, "users", user.uid),
        (snapshot) => {
          setCurrentStaffUser(
            snapshot.exists()
              ? ({ id: snapshot.id, uid: snapshot.id, ...(snapshot.data() as any) } as User)
              : null
          );
          setIsCurrentStaffLoading(false);
        },
        (error) => {
          console.error("Failed to load current staff user:", error);
          setCurrentStaffUser(null);
          setIsCurrentStaffLoading(false);
        }
      );

    });

    return () => {
      unsubscribeUser?.();
      unsubscribeAuth();
    };
  }, [auth, db]);

  const renderContent = () => {
    if (!displayRole) return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Synchronisation Équipe...</p>
      </div>
    );
    switch (displayRole) {
      case "super_admin":
        return <SuperAdminView />;
      case "manager":
        if (isCurrentStaffLoading) {
          return (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
              <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Chargement du centre assigné...</p>
            </div>
          );
        }

        const managedCenterIds = centersForUser(currentStaffUser);

        if (managedCenterIds.length === 1) {
          return <ManagerView addressId={managedCenterIds[0]} />;
        }

        if (managedCenterIds.length > 1) {
          return <SuperAdminView canEditNetwork={false} visibleCenterIds={managedCenterIds} />;
        }

        return (
          <div className="m-3 flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-10 shadow-sm sm:m-10 sm:p-20">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-bold text-slate-950">Aucun centre assigné</h2>
            <p className="mt-2 max-w-sm text-center text-slate-600">
              Ce compte manager n'a pas encore de centre associé. Le super admin doit lui affecter un centre.
            </p>
          </div>
        );
      case "manager_paris":
        return <ManagerView addressId="paris_12e" />;
      case "manager_orly":
        return <ManagerView addressId="orly_ville" />;
      default:
        return (
          <div className="m-3 flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-10 shadow-sm sm:m-10 sm:p-20">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-bold text-slate-950">Accès Restreint</h2>
            <p className="mt-2 max-w-sm text-center text-slate-600">Vous n'avez pas les autorisations nécessaires pour accéder à la console de gestion du réseau.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen space-y-5 overflow-x-hidden bg-slate-50 px-3 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-3 text-slate-950 sm:px-4 md:px-6 md:py-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-2 flex w-fit items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm"
      >
        <ShieldCheck className="h-4 w-4 text-primary" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
          {displayRole === "super_admin" ? "SÉCURITÉ ARCHITECTE • SUPER ADMIN" : "CONSOLE OPÉRATIONNELLE • GESTIONNAIRE"}
        </span>
      </motion.div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={displayRole || "loading"}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: "circOut" }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex flex-wrap items-center justify-center gap-3 pt-6 text-[10px] font-bold uppercase tracking-widest text-slate-400 sm:gap-6"
      >
        <span>Système Réseau CCS DOM v4.5</span>
        <div className="h-1 w-1 rounded-full bg-current" />
        <span>Géo-Fencing Actif</span>
        <div className="h-1 w-1 rounded-full bg-current" />
        <span>Audit Sécurisé</span>
      </motion.div>
    </div>
  );
}
