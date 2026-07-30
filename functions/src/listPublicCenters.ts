import { onCall } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

if (!admin.apps.length) admin.initializeApp();

type PublicCenter = {
  id: string;
  slug: string;
  addressKey: string;
  locationKey: string;
  name: string;
  street: string;
  city: string;
  zip: string;
  country: string;
  status: "active";
  lat: number;
  lng: number;
  publicSignupEnabled: true;
  documentsReady: true;
  billingReady: true;
};

const DEFAULT_PUBLIC_CENTERS: PublicCenter[] = [
  {
    id: "paris_12e",
    slug: "paris_12e",
    addressKey: "paris",
    locationKey: "paris",
    name: "BPC - Paris 12e",
    street: "9 Rue de Wattignies",
    city: "Paris",
    zip: "75012",
    country: "France",
    status: "active",
    lat: 48.8347,
    lng: 2.3949,
    publicSignupEnabled: true,
    documentsReady: true,
    billingReady: true,
  },
  {
    id: "orly_ville",
    slug: "orly_ville",
    addressKey: "orly",
    locationKey: "orly",
    name: "CCS - Orly Ville",
    street: "25 Rue Edmond Rostand",
    city: "Orly",
    zip: "94310",
    country: "France",
    status: "active",
    lat: 48.7429,
    lng: 2.4039,
    publicSignupEnabled: true,
    documentsReady: true,
    billingReady: true,
  },
];

function cleanString(value: unknown, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function cleanNumber(value: unknown, fallback: number) {
  const parsed = typeof value === "number" ? value : Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeStatus(value: unknown) {
  return String(value ?? "active").trim().toLowerCase();
}

function normalizePublicCenter(id: string, data: Record<string, unknown>, fallback?: PublicCenter): PublicCenter | null {
  const status = normalizeStatus(data.status ?? fallback?.status);
  const publicSignupEnabled =
    data.publicSignupEnabled === true || Boolean(fallback && data.publicSignupEnabled !== false);
  const documentsReady =
    data.documentsReady === true || Boolean(fallback && data.documentsReady !== false);
  const billingReady =
    data.billingReady === true || Boolean(fallback && data.billingReady !== false);

  if (status !== "active" || !publicSignupEnabled || !documentsReady || !billingReady) return null;

  const name = cleanString(data.name, fallback?.name ?? id);
  const street = cleanString(data.street, fallback?.street ?? "");
  const city = cleanString(data.city, fallback?.city ?? "");
  const zip = cleanString(data.zip, fallback?.zip ?? "");

  if (!name || !street || !city || !zip) return null;

  return {
    id,
    slug: cleanString(data.slug, fallback?.slug ?? id),
    addressKey: cleanString(data.addressKey, fallback?.addressKey ?? id),
    locationKey: cleanString(data.locationKey, cleanString(data.addressKey, fallback?.locationKey ?? id)),
    name,
    street,
    city,
    zip,
    country: cleanString(data.country, fallback?.country ?? "France"),
    status: "active",
    lat: cleanNumber(data.lat, fallback?.lat ?? 46.603354),
    lng: cleanNumber(data.lng, fallback?.lng ?? 1.888334),
    publicSignupEnabled: true,
    documentsReady: true,
    billingReady: true,
  };
}

export const listPublicCenters = onCall({ region: "europe-west9", cors: true }, async () => {
  const db = admin.firestore();
  const byId = new Map<string, PublicCenter>();

  DEFAULT_PUBLIC_CENTERS.forEach((center) => byId.set(center.id, center));

  try {
    const snapshot = await db.collection("centers").get();

    snapshot.forEach((docSnap) => {
      const fallback = byId.get(docSnap.id);
      const center = normalizePublicCenter(docSnap.id, docSnap.data(), fallback);

      if (center) {
        byId.set(center.id, center);
      } else {
        byId.delete(docSnap.id);
      }
    });
  } catch (error) {
    logger.warn("[listPublicCenters] Falling back to default public centers", { error });
  }

  const centers = Array.from(byId.values()).sort((a, b) => {
    const cityComparison = a.city.localeCompare(b.city, "fr");
    return cityComparison || a.name.localeCompare(b.name, "fr");
  });

  return { centers };
});
