import { onCall, HttpsError, type CallableRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { randomUUID } from "crypto";
import { INVOICE_PDF_TEMPLATE_VERSION, performCreateInvoicePdfJob } from "./pdfJobs";

if (!admin.apps.length) admin.initializeApp();

type AuthContext = NonNullable<CallableRequest["auth"]>;

const DEFAULT_STORAGE_BUCKET = "bizhome-hub.firebasestorage.app";

function normalizeText(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

function normalizeRole(auth: AuthContext): string {
  return normalizeText(auth.token.role);
}

function managedCenterIds(auth: AuthContext): string[] {
  const raw = auth.token.managedCenterIds;
  const values = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const managedAddressId = auth.token.managedAddressId;

  return Array.from(
    new Set(
      [...values, managedAddressId]
        .map((value) => normalizeText(value))
        .filter(Boolean)
    )
  );
}

function centerAliases(value: unknown): string[] {
  const center = normalizeText(value);
  if (!center) return [];
  if (center === "paris" || center === "paris_12e") return ["paris", "paris_12e"];
  if (center === "orly" || center === "orly_ville") return ["orly", "orly_ville"];
  return [center];
}

function resolveInvoiceCenter(invoice: FirebaseFirestore.DocumentData): string {
  return normalizeText(
    invoice.centerId ||
      invoice.domiciliationAddressId ||
      invoice.addressId ||
      invoice.addressKey ||
      invoice.locationKey
  );
}

function isPrivilegedRole(role: string): boolean {
  return role === "admin" || role === "super_admin" || role === "superadmin";
}

function canManageInvoice(auth: AuthContext, invoice: FirebaseFirestore.DocumentData): boolean {
  const role = normalizeRole(auth);
  if (isPrivilegedRole(role)) return true;

  const invoiceAliases = centerAliases(resolveInvoiceCenter(invoice));
  if (invoiceAliases.length === 0) return false;

  if (
    invoiceAliases.includes("paris") &&
    (role === "manager_paris" || role === "secretary_paris")
  ) {
    return true;
  }

  if (
    invoiceAliases.includes("orly") &&
    (role === "manager_orly" || role === "secretary_orly")
  ) {
    return true;
  }

  const managedAliases = managedCenterIds(auth).flatMap(centerAliases);
  return managedAliases.some((center) => invoiceAliases.includes(center));
}

function isInvoiceOwner(uid: string, invoice: FirebaseFirestore.DocumentData): boolean {
  return normalizeText(invoice.clientId) === normalizeText(uid);
}

function hasUsablePdfUrl(pdf: any): boolean {
  const url = getPdfUrl(pdf);
  if (!url) return false;
  if (url.startsWith("gs://")) return false;
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname.endsWith(".firebasestorage.app")) return false;
    if (parsedUrl.hostname === "firebasestorage.googleapis.com") {
      return parsedUrl.searchParams.has("token");
    }
    return true;
  } catch {
    return !url.includes("firebasestorage.googleapis.com/v0/b/") || url.includes("token=");
  }
}

function getPdfUrl(pdf: any): string {
  return String(pdf?.outputUrl || pdf?.url || pdf?.fileUrl || "").trim();
}

function hasCurrentInvoiceTemplate(pdf: any): boolean {
  return String(pdf?.templateVersion || "").trim() === INVOICE_PDF_TEMPLATE_VERSION;
}

function buildTokenUrl(bucketName: string, filePath: string, token: string): string {
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(filePath)}?alt=media&token=${token}`;
}

function parseStorageReference(rawValue: unknown): { bucketName: string; filePath: string } | null {
  const value = String(rawValue ?? "").trim();
  if (!value) return null;

  if (value.startsWith("gs://")) {
    const withoutScheme = value.slice(5);
    const slashIndex = withoutScheme.indexOf("/");
    if (slashIndex < 0) return null;

    return {
      bucketName: withoutScheme.slice(0, slashIndex),
      filePath: withoutScheme.slice(slashIndex + 1),
    };
  }

  if (!value.startsWith("http")) {
    return {
      bucketName: DEFAULT_STORAGE_BUCKET,
      filePath: value.replace(/^\/+/, ""),
    };
  }

  try {
    const url = new URL(value);

    if (url.hostname === "firebasestorage.googleapis.com") {
      const match = url.pathname.match(/^\/v0\/b\/([^/]+)\/o\/(.+)$/);
      if (!match) return null;

      return {
        bucketName: decodeURIComponent(match[1]),
        filePath: decodeURIComponent(match[2]),
      };
    }

    if (url.hostname.endsWith(".firebasestorage.app")) {
      return {
        bucketName: url.hostname,
        filePath: decodeURIComponent(url.pathname.replace(/^\/+/, "")),
      };
    }
  } catch {
    return null;
  }

  return null;
}

async function resolveDownloadUrl(bucketName: string, filePath: string): Promise<string | null> {
  const file = admin.storage().bucket(bucketName).file(filePath);
  const [exists] = await file.exists();

  if (!exists) {
    logger.warn("[requestInvoicePdf] Invoice PDF file not found", {
      bucketName,
      filePath,
    });
    return null;
  }

  const [metadata] = await file.getMetadata();
  const existingToken = String(metadata.metadata?.firebaseStorageDownloadTokens ?? "")
    .split(",")
    .map((token) => token.trim())
    .find(Boolean);
  const token = existingToken || randomUUID();

  if (!existingToken) {
    await file.setMetadata({
      metadata: {
        ...(metadata.metadata || {}),
        firebaseStorageDownloadTokens: token,
      },
    });
  }

  return buildTokenUrl(bucketName, filePath, token);
}

async function resolveExistingInvoicePdfUrl(pdf: any): Promise<string | null> {
  const candidates = [
    pdf?.storagePath,
    pdf?.outputName,
    pdf?.output,
    pdf?.outputUrl,
    pdf?.url,
    pdf?.fileUrl,
  ];

  const seen = new Set<string>();
  for (const candidate of candidates) {
    const reference = parseStorageReference(candidate);
    if (!reference) continue;

    const key = `${reference.bucketName}/${reference.filePath}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const url = await resolveDownloadUrl(reference.bucketName, reference.filePath);
    if (url) return url;
  }

  return null;
}

export const requestInvoicePdf = onCall(
  { region: "europe-west9", cors: true },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentification requise.");
    }

    const invoiceId = String(request.data?.invoiceId ?? "").trim();
    const force = request.data?.force === true;

    if (!invoiceId) {
      throw new HttpsError("invalid-argument", "invoiceId est requis.");
    }

    const invoiceRef = admin.firestore().collection("invoices").doc(invoiceId);
    const invoiceSnap = await invoiceRef.get();

    if (!invoiceSnap.exists) {
      throw new HttpsError("not-found", "Facture introuvable.");
    }

    const invoice = invoiceSnap.data() || {};
    const uid = request.auth.uid;

    if (!isInvoiceOwner(uid, invoice) && !canManageInvoice(request.auth, invoice)) {
      throw new HttpsError("permission-denied", "Acces refuse a cette facture.");
    }

    const currentPdf = invoice.pdf || {};
    const isCurrentTemplate = hasCurrentInvoiceTemplate(currentPdf);

    if (currentPdf.status === "complete" && isCurrentTemplate) {
      const resolvedUrl = await resolveExistingInvoicePdfUrl(currentPdf);
      if (resolvedUrl) {
        const resolvedReference = parseStorageReference(resolvedUrl);
        await invoiceRef.update({
          "pdf.outputUrl": resolvedUrl,
          "pdf.fileUrl": resolvedUrl,
          "pdf.url": resolvedUrl,
          "pdf.storagePath": resolvedReference?.filePath || currentPdf.storagePath || null,
          "pdf.requestedBy": uid,
          "pdf.requestedAt": admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        logger.info("[requestInvoicePdf] Existing invoice PDF URL resolved", {
          invoiceId,
          requestedBy: uid,
          role: normalizeRole(request.auth),
          center: resolveInvoiceCenter(invoice),
          storagePath: currentPdf.storagePath || null,
        });

        return {
          ok: true,
          status: "complete",
          url: resolvedUrl,
        };
      }
    }

    if (currentPdf.status === "complete" && isCurrentTemplate && hasUsablePdfUrl(currentPdf)) {
      return {
        ok: true,
        status: "complete",
        url: getPdfUrl(currentPdf),
      };
    }

    if (!force && currentPdf.status === "processing" && isCurrentTemplate) {
      return {
        ok: true,
        status: "processing",
        jobId: currentPdf.jobId || null,
      };
    }

    const needsTemplateRefresh = currentPdf.status === "complete" && !isCurrentTemplate;
    const shouldForce =
      force ||
      needsTemplateRefresh ||
      currentPdf.status === "pending" ||
      currentPdf.status === "error" ||
      currentPdf.status === "complete" ||
      Boolean(currentPdf.jobId && !hasUsablePdfUrl(currentPdf));

    try {
      const invoiceForJob =
        currentPdf.status === "complete"
          ? {
              ...invoice,
              pdf: {
                ...currentPdf,
                status: "error",
                outputUrl: null,
                fileUrl: null,
                url: null,
              },
            }
          : invoice;

      const result = await performCreateInvoicePdfJob(invoiceId, invoiceForJob, {
        force: shouldForce,
      });

      await invoiceRef.update({
        "pdf.requestedBy": uid,
        "pdf.requestedAt": admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      logger.info("[requestInvoicePdf] Invoice PDF job requested", {
        invoiceId,
        requestedBy: uid,
        role: normalizeRole(request.auth),
        center: resolveInvoiceCenter(invoice),
        force: shouldForce,
        jobId: result.jobId || null,
        idempotent: result.idempotent === true,
      });

      return {
        ok: true,
        status: result.idempotent && isCurrentTemplate && hasUsablePdfUrl(currentPdf) ? "complete" : "processing",
        url: result.idempotent && isCurrentTemplate && hasUsablePdfUrl(currentPdf) ? getPdfUrl(currentPdf) : null,
        jobId: result.jobId || null,
        idempotent: result.idempotent === true,
      };
    } catch (error: any) {
      logger.error("[requestInvoicePdf] Failed to create invoice PDF job", {
        invoiceId,
        requestedBy: uid,
        message: error?.message ?? String(error),
      });

      throw new HttpsError(
        "internal",
        error?.message ?? "Impossible de lancer la generation PDF."
      );
    }
  }
);
