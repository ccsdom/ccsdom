import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { onObjectFinalized } from "firebase-functions/v2/storage";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { randomUUID } from "crypto";

if (!admin.apps.length) admin.initializeApp();

const db = admin.firestore();

type PdfType = "contract" | "attestation";

function mapExtStatus(rawStatus: string): string {
  const s = String(rawStatus || "").toLowerCase();
  if (s === "success" || s === "complete" || s === "completed" || s === "done" || s === "produced") return "complete";
  if (s === "error" || s === "failed") return "error";
  if (s === "processing" || s === "working" || s === "queued") return "processing";
  return s || "pending";
}

function buildTokenUrl(bucketName: string, filePath: string, token: string): string {
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(filePath)}?alt=media&token=${token}`;
}

async function getOrCreateDownloadToken(file: any): Promise<string | null> {
  const [metadata] = await file.getMetadata();
  const tokens = metadata.metadata?.firebaseStorageDownloadTokens
    ?.split(",")
    .map((token: string) => token.trim())
    .filter(Boolean);

  if (tokens?.length) {
    return tokens[0];
  }

  const token = randomUUID();
  await file.setMetadata({
    metadata: {
      ...(metadata.metadata || {}),
      firebaseStorageDownloadTokens: token,
    },
  });
  return token;
}

function parseStorageReference(rawUrl: string): { bucketName: string; filePath: string } | null {
  if (!rawUrl) {
    return null;
  }

  if (rawUrl.startsWith("gs://")) {
    const withoutScheme = rawUrl.slice(5);
    const slashIndex = withoutScheme.indexOf("/");
    if (slashIndex === -1) {
      return null;
    }

    return {
      bucketName: withoutScheme.slice(0, slashIndex),
      filePath: withoutScheme.slice(slashIndex + 1),
    };
  }

  try {
    const url = new URL(rawUrl);

    if (url.hostname === "firebasestorage.googleapis.com") {
      const match = url.pathname.match(/^\/v0\/b\/([^/]+)\/o\/(.+)$/);
      if (match) {
        return {
          bucketName: decodeURIComponent(match[1]),
          filePath: decodeURIComponent(match[2]),
        };
      }
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
  try {
    const bucket = admin.storage().bucket(bucketName);
    const file = bucket.file(filePath);

    const [exists] = await file.exists();
    if (!exists) {
      logger.warn(`[resolveDownloadUrl] File not found: gs://${bucketName}/${filePath}`);
      return null;
    }

    try {
      const token = await getOrCreateDownloadToken(file);
      if (token) {
        return buildTokenUrl(bucketName, filePath, token);
      }
    } catch (metadataError) {
      logger.warn(
        `[resolveDownloadUrl] Token resolution failed for ${filePath}, falling back to signed URL:`,
        metadataError,
      );
    }

    const [signedUrl] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 24 * 60 * 60 * 1000,
    });
    return signedUrl;
  } catch (error) {
    logger.error(`[resolveDownloadUrl] Error resolving URL for ${filePath}:`, error);
    return null;
  }
}

async function resolveKnownPdfUrl(
  rawUrl: string | null | undefined,
  outputBucket?: string,
  outputName?: string,
): Promise<string | null> {
  if (rawUrl) {
    const parsedReference = parseStorageReference(rawUrl);
    if (parsedReference) {
      return resolveDownloadUrl(parsedReference.bucketName, parsedReference.filePath);
    }

    if (rawUrl.startsWith("http")) {
      return rawUrl;
    }
  }

  if (outputBucket && outputName) {
    return resolveDownloadUrl(outputBucket, outputName);
  }

  return rawUrl || null;
}

async function syncJobToRequest(type: PdfType, jobId: string, jobData: any) {
  const requestUid = jobData.data?.requestUid || jobData.requestUid || jobData.ownerUid || jobData.uid;

  if (!requestUid) {
    logger.debug(`[syncJobToRequest] No requestUid for job ${jobId}. Ignored.`);
    return;
  }

  const { status, outputUrl, outputBucket, outputName, error } = jobData;
  const isComplete = mapExtStatus(status) === "complete";
  const isError = mapExtStatus(status) === "error";
  const finalUrl = isComplete ? await resolveKnownPdfUrl(outputUrl, outputBucket, outputName) : null;

  const updatedAt = admin.firestore.FieldValue.serverTimestamp();
  const pdfData = {
    jobId,
    status: isComplete ? "complete" : isError ? "error" : "processing",
    outputUrl: finalUrl,
    error: error || null,
    updatedAt: new Date().toISOString(),
  };

  const updatePayload: Record<string, any> = {
    [`pdfPublish.${type}`]: pdfData,
    updatedAt,
  };

  try {
    const requestRef = db.collection("client_requests").doc(requestUid);
    await requestRef.update(updatePayload);
    logger.info(`[syncJobToRequest] Updated ${type} for ${requestUid} (status: ${status})`);
  } catch (err: any) {
    if (err.code === 5 || err.message?.includes("NOT_FOUND")) {
      logger.warn(`[syncJobToRequest] Document client_requests/${requestUid} not found.`);
    } else if (err.message?.includes("Update() requires either a single JavaScript object")) {
      await db.collection("client_requests").doc(requestUid).set(updatePayload, { merge: true });
    } else {
      logger.error(`[syncJobToRequest] Error updating ${requestUid}:`, err);
    }
  }
}

async function syncJobToInvoice(jobId: string, jobData: any) {
  const invoiceId = jobData.data?.invoiceId || jobData.invoiceId;

  if (!invoiceId) {
    logger.debug(`[syncJobToInvoice] No invoiceId for job ${jobId}. Ignored.`);
    return;
  }

  const { status, outputUrl, outputBucket, outputName, error } = jobData;
  const isComplete = mapExtStatus(status) === "complete";
  const isError = mapExtStatus(status) === "error";
  const finalUrl = isComplete ? await resolveKnownPdfUrl(outputUrl, outputBucket, outputName) : null;
  const templateVersion =
    jobData.templateVersion || jobData.data?.templateVersion || null;
  const finalReference = finalUrl ? parseStorageReference(finalUrl) : null;

  const updatedAt = admin.firestore.FieldValue.serverTimestamp();
  const pdfData = {
    jobId,
    status: isComplete ? "complete" : isError ? "error" : "processing",
    outputUrl: finalUrl,
    fileUrl: finalUrl,
    url: finalUrl,
    storagePath: finalReference?.filePath || outputName || null,
    error: error || null,
    templateVersion,
    updatedAt: new Date().toISOString(),
  };

  const updatePayload: Record<string, any> = {
    pdf: pdfData,
    updatedAt,
  };

  try {
    const invoiceRef = db.collection("invoices").doc(invoiceId);
    await invoiceRef.update(updatePayload);
    logger.info(`[syncJobToInvoice] Updated invoice ${invoiceId} (status: ${status})`);
  } catch (err: any) {
    if (err.code === 5 || err.message?.includes("NOT_FOUND")) {
      logger.warn(`[syncJobToInvoice] Document invoices/${invoiceId} not found.`);
    } else {
      logger.error(`[syncJobToInvoice] Error updating invoice ${invoiceId}:`, err);
    }
  }
}

async function handlePdfJobUpdated(jobId: string, after: admin.firestore.DocumentData, jobType?: string) {
  const template = String(after.template || "").toLowerCase();

  if (jobType === "contract" || template.includes("contract") || template.includes("contrat")) {
    await syncJobToRequest("contract", jobId, after);
    return;
  }

  if (jobType === "attestation" || template.includes("attestation")) {
    await syncJobToRequest("attestation", jobId, after);
    return;
  }

  if (jobType === "invoice" || template.includes("invoice") || template.includes("facture") || after.invoiceId || after.data?.invoiceId) {
    await syncJobToInvoice(jobId, after);
  }
}

export const onPdfJobUpdated = onDocumentUpdated("pdf_requests/{jobId}", (e) => (e.data && handlePdfJobUpdated(e.params.jobId, e.data.after.data()!)));
export const onInvoicePdfParisUpdated = onDocumentUpdated("pdf_requests_invoices_paris/{jobId}", (e) => (e.data && handlePdfJobUpdated(e.params.jobId, e.data.after.data()!, "invoice")));
export const onInvoicePdfOrlyUpdated = onDocumentUpdated("pdf_requests_invoices_orly/{jobId}", (e) => (e.data && handlePdfJobUpdated(e.params.jobId, e.data.after.data()!, "invoice")));
export const onContractPdfParisUpdated = onDocumentUpdated("pdf_requests_contrats_paris/{jobId}", (e) => (e.data && handlePdfJobUpdated(e.params.jobId, e.data.after.data()!, "contract")));
export const onContractPdfOrlyUpdated = onDocumentUpdated("pdf_requests_contrats_orly/{jobId}", (e) => (e.data && handlePdfJobUpdated(e.params.jobId, e.data.after.data()!, "contract")));
export const onAttestationPdfParisUpdated = onDocumentUpdated("pdf_requests_attestations_paris/{jobId}", (e) => (e.data && handlePdfJobUpdated(e.params.jobId, e.data.after.data()!, "attestation")));
export const onAttestationPdfOrlyUpdated = onDocumentUpdated("pdf_requests_attestations_orly/{jobId}", (e) => (e.data && handlePdfJobUpdated(e.params.jobId, e.data.after.data()!, "attestation")));

export const onPdfFileUploaded = onObjectFinalized({
  bucket: "bizhome-hub.firebasestorage.app",
}, async (event) => {
  const filePath = event.data.name;
  if (!filePath || !filePath.endsWith(".pdf")) return;

  let collectionName = "";
  let type: "invoice" | "contract" | "attestation" | "" = "";

  if (filePath.startsWith("invoices-")) {
    collectionName = filePath.includes("-paris/") ? "pdf_requests_invoices_paris" : "pdf_requests_invoices_orly";
    type = "invoice";
  } else if (filePath.startsWith("contrats-")) {
    collectionName = filePath.includes("-paris/") ? "pdf_requests_contrats_paris" : "pdf_requests_contrats_orly";
    type = "contract";
  } else if (filePath.startsWith("attestations-")) {
    collectionName = filePath.includes("-paris/") ? "pdf_requests_attestations_paris" : "pdf_requests_attestations_orly";
    type = "attestation";
  }

  if (!collectionName || !type) return;

  const jobId = filePath.split("/").pop()?.replace(".pdf", "");
  if (!jobId) return;

  logger.info(`[onPdfFileUploaded] Storage event detected for job ${jobId} (${type}) in ${collectionName}`);

  try {
    const jobRef = db.collection(collectionName).doc(jobId);
    const jobDoc = await jobRef.get();

    if (!jobDoc.exists) {
      logger.warn(`[onPdfFileUploaded] Job document ${jobId} not found in ${collectionName}`);
      return;
    }

    const jobData = jobDoc.data()!;

    const resolvedUrl = await resolveDownloadUrl(event.data.bucket, filePath);

    logger.info(`[onPdfFileUploaded] Syncing ${type} for job ${jobId}`, {
      alreadySuccessful: jobData.status === "success" || jobData.status === "complete",
      resolvedUrl: !!resolvedUrl,
    });

    const updatedJobData = {
      ...jobData,
      status: "success",
      outputBucket: event.data.bucket,
      outputName: filePath,
      outputUrl: resolvedUrl || jobData.outputUrl || null,
    };

    if (type === "invoice") {
      await syncJobToInvoice(jobId, updatedJobData);
    } else {
      await syncJobToRequest(type as PdfType, jobId, updatedJobData);
    }

    await jobRef.update({
      status: "success",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      outputBucket: event.data.bucket,
      outputName: filePath,
      outputUrl: resolvedUrl,
    });
  } catch (err) {
    logger.error(`[onPdfFileUploaded] Error sync job ${jobId}:`, err);
  }
});
