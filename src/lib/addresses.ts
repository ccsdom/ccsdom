export type AddressStatus = "active" | "inactive" | "archived";

export const LEGACY_ADDRESS_IDS = ["paris_12e", "orly_ville"] as const;
export type LegacyAddressId = (typeof LEGACY_ADDRESS_IDS)[number];

export type Address = {
  id: string;
  tenantId?: string;
  slug?: string;
  addressKey?: string;
  locationKey?: string;
  name: string;
  street: string;
  city: string;
  zip: string;
  country: string;
  status: AddressStatus;

  // ✅ coordonnées fixes
  lat: number;
  lng: number;

  companyName: string;
  companyType: string;
  companyCapital: string;
  companyRcs: string;
  companyApproval: string;
  companyRepresentative: string;
  localSurface: string;
  localDetails: string;
  publicSignupEnabled?: boolean;
  documentsReady?: boolean;
  billingReady?: boolean;
};

export type CenterGovernanceAddress = Address & {
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  subscriptionRenewalDate?: string;
  quotaClients?: number;
  quotaDocuments?: number;
  quotaStorageGb?: number;
  quotaScansMonthly?: number;
  governanceUpdatedAt?: unknown;
  governanceUpdatedBy?: string;
  statusUpdatedAt?: unknown;
  statusUpdatedBy?: string;
  statusChangeReason?: string;
  suspendedAt?: unknown;
  suspendedBy?: string;
  suspensionReason?: string;
  archivedAt?: unknown;
  archivedBy?: string;
  archiveReason?: string;
  reactivatedAt?: unknown;
  reactivatedBy?: string;
  reactivationReason?: string;
  lastStatusTransition?: string;
};

export const allAddresses: Address[] = [
  {
    id: "paris_12e",
    tenantId: "ccsdom",
    slug: "paris_12e",
    addressKey: "paris",
    locationKey: "paris",
    name: "BPC - Paris 12e",
    street: "9 Rue de Wattignies",
    city: "Paris",
    zip: "75012",
    country: "France",
    status: "active",

    // ✅ lat/lng (mets les tiennes exactes si besoin)
    lat: 48.83495,
    lng: 2.40138,

    companyName: "BUSINESS PARTNERS CONSULTING",
    companyType: "Société par Action Simplifiée",
    companyCapital: "10 000€",
    companyRcs: "Paris sous le n° 952 131 423",
    companyApproval: "Préfet de Paris 04 sous le n° AG/DOM/2023095",
    companyRepresentative: "M. Ahcene DJAOUT, agissant en qualité de président",
    localSurface: "34 m2",
    localDetails: "...",
    publicSignupEnabled: true,
    documentsReady: true,
    billingReady: true,
  },
  {
    id: "orly_ville",
    tenantId: "ccsdom",
    slug: "orly_ville",
    addressKey: "orly",
    locationKey: "orly",
    name: "CCS - Orly Ville",
    street: "25 Rue Edmond Rostand",
    city: "Orly",
    zip: "94310",
    country: "France",
    status: "active",

    // ✅ lat/lng
    lat: 48.74379,
    lng: 2.40474,

    companyName: "CONSULTING CONSEIL SERVICES",
    companyType: "Société à Responsabilité Limitée",
    companyCapital: "100 000€",
    companyRcs: "Créteil sous le n° 830 278 644",
    companyApproval: "Préfet de Val-de-Marne sous le n° AG/DOM/2024-06",
    companyRepresentative: "M. Rabah MAHFOUF, agissant en qualité de Gérant",
    localSurface: "57 m2",
    localDetails: "...",
    publicSignupEnabled: true,
    documentsReady: true,
    billingReady: true,
  },
];

const asNonEmptyString = (value: unknown, fallback: string) => {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
};

const asAddressStatus = (value: unknown, fallback: AddressStatus = "active"): AddressStatus => {
  return value === "archived" ? "archived" : value === "inactive" ? "inactive" : value === "active" ? "active" : fallback;
};

const asNumber = (value: unknown, fallback: number) => {
  const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
};

const asOptionalPositiveNumber = (value: unknown): number | undefined => {
  const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

const asBoolean = (value: unknown, fallback = false) => {
  return typeof value === "boolean" ? value : fallback;
};

export const isLegacyAddressId = (id: string): id is LegacyAddressId => {
  return (LEGACY_ADDRESS_IDS as readonly string[]).includes(id);
};

export const normalizeAddressFromFirestore = (
  id: string,
  data: Record<string, unknown>
): Address => {
  const fallback = allAddresses.find((address) => address.id === id);
  const addressKey = asNonEmptyString(data.addressKey, fallback?.addressKey ?? id);
  const locationKey = asNonEmptyString(data.locationKey, fallback?.locationKey ?? addressKey);

  return {
    id,
    tenantId: asNonEmptyString(data.tenantId, fallback?.tenantId ?? "ccsdom"),
    slug: asNonEmptyString(data.slug, fallback?.slug ?? id),
    addressKey,
    locationKey,
    name: asNonEmptyString(data.name, fallback?.name ?? id),
    street: asNonEmptyString(data.street, fallback?.street ?? ""),
    city: asNonEmptyString(data.city, fallback?.city ?? ""),
    zip: asNonEmptyString(data.zip, fallback?.zip ?? ""),
    country: asNonEmptyString(data.country, fallback?.country ?? "France"),
    status: asAddressStatus(data.status, fallback?.status ?? "active"),
    lat: asNumber(data.lat, fallback?.lat ?? 46.603354),
    lng: asNumber(data.lng, fallback?.lng ?? 1.888334),
    companyName: asNonEmptyString(data.companyName, fallback?.companyName ?? "Non renseigne"),
    companyType: asNonEmptyString(data.companyType, fallback?.companyType ?? "Non renseigne"),
    companyCapital: asNonEmptyString(data.companyCapital, fallback?.companyCapital ?? "Non renseigne"),
    companyRcs: asNonEmptyString(data.companyRcs, fallback?.companyRcs ?? "Non renseigne"),
    companyApproval: asNonEmptyString(data.companyApproval, fallback?.companyApproval ?? "Non renseigne"),
    companyRepresentative: asNonEmptyString(data.companyRepresentative, fallback?.companyRepresentative ?? "Non renseigne"),
    localSurface: asNonEmptyString(data.localSurface, fallback?.localSurface ?? "Non renseigne"),
    localDetails: asNonEmptyString(data.localDetails, fallback?.localDetails ?? ""),
    publicSignupEnabled: asBoolean(data.publicSignupEnabled, fallback?.publicSignupEnabled ?? false),
    documentsReady: asBoolean(data.documentsReady, fallback?.documentsReady ?? false),
    billingReady: asBoolean(data.billingReady, fallback?.billingReady ?? false),
  };
};

export const normalizeCenterGovernanceFromFirestore = (
  id: string,
  data: Record<string, unknown>
): CenterGovernanceAddress => {
  const normalized = normalizeAddressFromFirestore(id, data) as CenterGovernanceAddress;
  const subscription = (data.subscription && typeof data.subscription === "object" ? data.subscription : {}) as Record<string, unknown>;
  const quotas = (data.quotas && typeof data.quotas === "object" ? data.quotas : {}) as Record<string, unknown>;

  normalized.subscriptionPlan = asNonEmptyString(
    data.subscriptionPlan,
    asNonEmptyString(subscription.plan, "")
  );
  normalized.subscriptionStatus = asNonEmptyString(
    data.subscriptionStatus,
    asNonEmptyString(subscription.status, "")
  );
  normalized.subscriptionRenewalDate = asNonEmptyString(
    data.subscriptionRenewalDate,
    asNonEmptyString(subscription.renewalDate, "")
  );
  normalized.quotaClients = asOptionalPositiveNumber(data.quotaClients ?? quotas.clients);
  normalized.quotaDocuments = asOptionalPositiveNumber(data.quotaDocuments ?? quotas.documents);
  normalized.quotaStorageGb = asOptionalPositiveNumber(data.quotaStorageGb ?? quotas.storageGb);
  normalized.quotaScansMonthly = asOptionalPositiveNumber(data.quotaScansMonthly ?? quotas.scansMonthly);
  normalized.governanceUpdatedAt = data.governanceUpdatedAt;
  normalized.governanceUpdatedBy = asNonEmptyString(data.governanceUpdatedBy, "");
  normalized.statusUpdatedAt = data.statusUpdatedAt;
  normalized.statusUpdatedBy = asNonEmptyString(data.statusUpdatedBy, "");
  normalized.statusChangeReason = asNonEmptyString(data.statusChangeReason, "");
  normalized.suspendedAt = data.suspendedAt;
  normalized.suspendedBy = asNonEmptyString(data.suspendedBy, "");
  normalized.suspensionReason = asNonEmptyString(data.suspensionReason, "");
  normalized.archivedAt = data.archivedAt;
  normalized.archivedBy = asNonEmptyString(data.archivedBy, "");
  normalized.archiveReason = asNonEmptyString(data.archiveReason, "");
  normalized.reactivatedAt = data.reactivatedAt;
  normalized.reactivatedBy = asNonEmptyString(data.reactivatedBy, "");
  normalized.reactivationReason = asNonEmptyString(data.reactivationReason, "");
  normalized.lastStatusTransition = asNonEmptyString(data.lastStatusTransition, "");

  return normalized;
};

export const mergeAddressesWithDefaults = <T extends Address>(remoteAddresses: T[]): T[] => {
  const byId = new Map<string, Address | T>();
  allAddresses.forEach((address) => byId.set(address.id, address));
  remoteAddresses.forEach((address) => {
    byId.set(address.id, { ...(byId.get(address.id) ?? {}), ...address });
  });
  return Array.from(byId.values())
    .sort((a, b) => a.name.localeCompare(b.name, "fr")) as T[];
};
