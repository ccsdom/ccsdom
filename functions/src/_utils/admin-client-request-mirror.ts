import * as admin from "firebase-admin";
import { SIGNUP_REQUEST_STATUS } from "../_config/signup-constants";
import { normalizeEmailLower, normalizeString } from "./client-mapper";

function stripUndefined<T extends Record<string, any>>(value: T): T {
  const out: Record<string, any> = {};
  Object.entries(value).forEach(([key, fieldValue]) => {
    if (fieldValue !== undefined) {
      out[key] = fieldValue;
    }
  });
  return out as T;
}

function resolveAddressId(data: Record<string, any>) {
  const raw = normalizeString(
    data.domiciliationAddressId ||
      data.addressId ||
      data.centerId ||
      data.locationKey ||
      data.addressKey
  ).toLowerCase();

  if (raw === "orly" || raw === "orly_ville") return "orly_ville";
  if (raw === "paris" || raw === "paris_12e") return "paris_12e";
  return raw || "";
}

function resolveAddressKey(data: Record<string, any>, addressId: string) {
  const raw = normalizeString(data.addressKey || data.locationKey).toLowerCase();
  if (raw === "orly" || raw === "paris") return raw;
  if (addressId === "orly_ville") return "orly";
  if (addressId === "paris_12e") return "paris";
  return raw || "";
}

function resolveLocationKey(data: Record<string, any>, addressKey: string, addressId: string) {
  const raw = normalizeString(data.locationKey || data.addressKey).toLowerCase();
  if (raw === "orly" || raw === "paris") return raw;
  if (addressKey === "orly" || addressKey === "paris") return addressKey;
  if (addressId === "orly_ville") return "orly";
  if (addressId === "paris_12e") return "paris";
  return raw || "";
}

export function isAdminClientRequestMirror(
  requestData: Record<string, any> | undefined,
  clientData: Record<string, any> | undefined
) {
  const source = normalizeString(requestData?.source).toLowerCase();
  const createdFrom = normalizeString(clientData?.createdFrom).toLowerCase();
  return source.startsWith("admin") || createdFrom === "admin";
}

export function buildAdminClientRequestMirror(options: {
  uid: string;
  now: admin.firestore.FieldValue | admin.firestore.Timestamp;
  clientData: Record<string, any>;
  requestData?: Record<string, any>;
  actorUid?: string;
}) {
  const { uid, now, actorUid, clientData } = options;
  const requestData = options.requestData ?? {};

  const addressId =
    resolveAddressId(clientData) || resolveAddressId(requestData);
  const addressKey =
    resolveAddressKey(clientData, addressId) ||
    resolveAddressKey(requestData, addressId);
  const locationKey =
    resolveLocationKey(clientData, addressKey, addressId) ||
    resolveLocationKey(requestData, addressKey, addressId);

  const email = normalizeEmailLower(
    clientData.email ||
      clientData.emailLower ||
      requestData.email ||
      requestData.emailLower
  );
  const companyName = normalizeString(
    clientData.companyName ||
      clientData.name ||
      requestData.companyName ||
      requestData.name
  );
  const representative = normalizeString(
    clientData.representative ||
      requestData.representative ||
      requestData.signatoryName
  );
  const phone = normalizeString(clientData.phone || requestData.phone);
  const siret = normalizeString(
    clientData.siret ||
      clientData.siretNorm ||
      requestData.siret ||
      requestData.siretNorm
  );
  const address = normalizeString(clientData.address || requestData.address);
  const legalStatus = normalizeString(
    clientData.legalStatus ||
      clientData.formeJuridique ||
      requestData.legalStatus ||
      requestData.formeJuridique
  );
  const quality = normalizeString(
    clientData.quality ||
      clientData.representativeQuality ||
      requestData.quality ||
      requestData.representativeQuality
  );
  const shareCapital = normalizeString(
    clientData.shareCapital ||
      clientData.capitalSocial ||
      requestData.shareCapital ||
      requestData.capitalSocial
  );
  const representativeAddress = normalizeString(
    clientData.representativeAddress ||
      clientData.personalAddress ||
      clientData.homeAddress ||
      address ||
      requestData.representativeAddress ||
      requestData.personalAddress ||
      requestData.homeAddress
  );
  const mailPlanId = normalizeString(
    clientData.planId ||
      clientData.plan ||
      requestData.mailPlanId ||
      requestData.planId ||
      requestData.plan
  );

  return stripUndefined({
    uid,
    ownerUid: uid,
    companyName: companyName || undefined,
    name: companyName || undefined,
    representative: representative || undefined,
    signatoryName:
      normalizeString(requestData.signatoryName) || representative || undefined,
    email: email || undefined,
    emailLower: email || undefined,
    phone: phone || undefined,
    siret: siret || undefined,
    address: representativeAddress || address || undefined,
    representativeAddress: representativeAddress || undefined,
    personalAddress: representativeAddress || undefined,
    homeAddress: representativeAddress || undefined,
    legalStatus: legalStatus || undefined,
    legalStatusText: legalStatus || undefined,
    formeJuridique: legalStatus || undefined,
    quality: quality || undefined,
    representativeQuality: quality || undefined,
    shareCapital: shareCapital || undefined,
    addressId: addressId || undefined,
    addressKey: addressKey || undefined,
    locationKey: locationKey || undefined,
    mailPlanId: mailPlanId || undefined,
    status: normalizeString(requestData.status) || SIGNUP_REQUEST_STATUS.APPROVED,
    source: normalizeString(requestData.source) || "admin_manual_client",
    accessProvisioned:
      typeof requestData.accessProvisioned === "boolean"
        ? requestData.accessProvisioned
        : true,
    accessProvisionedReason:
      normalizeString(requestData.accessProvisionedReason) || "admin_created",
    createdAt:
      requestData.createdAt || clientData.createdAt || clientData.joinDate || now,
    approvedAt:
      requestData.approvedAt || clientData.approvedAt || clientData.joinDate || now,
    approvedBy: normalizeString(requestData.approvedBy) || actorUid || undefined,
    accessProvisionedAt:
      requestData.accessProvisionedAt ||
      clientData.accessProvisionedAt ||
      clientData.joinDate ||
      now,
    updatedAt: now,
  });
}

