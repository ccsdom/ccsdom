import {
    onCall,
    HttpsError,
    type CallableRequest,
  } from "firebase-functions/v2/https";
  import * as admin from "firebase-admin";
  import * as logger from "firebase-functions/logger";
  
  if (!admin.apps.length) admin.initializeApp();
  
  type AddressKey = "paris" | "orly";

  export const INVOICE_PDF_TEMPLATE_VERSION = "invoice-flat-v4-branded-logo-2026-04-23";
  const INVOICE_TEMPLATE_STORAGE_VERSION = "flat_v4_branded_logo_2026_04_23";
  
  function toAddressKey(value: unknown): AddressKey | null {
    const v = String(value ?? "").toLowerCase().trim();
    if (v === "paris" || v === "orly") return v;
    return null;
  }
  
  function cleanObject<T = any>(obj: T): T {
    if (Array.isArray(obj)) return obj.map(cleanObject) as unknown as T;
  
    if (obj && typeof obj === "object") {
      return Object.fromEntries(
        Object.entries(obj as Record<string, any>).map(([key, value]) => [
          key,
          value === undefined ? null : cleanObject(value),
        ])
      ) as T;
    }
  
    return (obj === undefined ? null : obj) as T;
  }
  
  function normalizeEmailLower(value: unknown) {
    return String(value ?? "").trim().toLowerCase();
  }
  
  function normalizeSiret(value: unknown) {
    return String(value ?? "").replace(/\D/g, "");
  }
  
  function buildContractCollectionName(addressKey: AddressKey) {
    return addressKey === "paris"
      ? "pdf_requests_contrats_paris"
      : "pdf_requests_contrats_orly";
  }
  
  function buildAttestationCollectionName(addressKey: AddressKey) {
    return addressKey === "paris"
      ? "pdf_requests_attestations_paris"
      : "pdf_requests_attestations_orly";
  }

  function buildInvoiceCollectionName(addressKey: AddressKey) {
    return addressKey === "paris"
      ? "pdf_requests_invoices_paris"
      : "pdf_requests_invoices_orly";
  }
  
  function buildContractTemplatePath(addressKey: AddressKey) {
    return addressKey === "paris"
      ? "bizhome-hub.firebasestorage.app/templates/contract_paris.zip"
      : "bizhome-hub.firebasestorage.app/templates/contract_orly.zip";
  }
  
  function buildAttestationTemplatePath(addressKey: AddressKey) {
    return addressKey === "paris"
      ? "bizhome-hub.firebasestorage.app/templates/attestation_paris.zip"
      : "bizhome-hub.firebasestorage.app/templates/attestation_orly.zip";
  }

  function buildInvoiceTemplatePath(addressKey: AddressKey) {
    return addressKey === "paris"
      ? `bizhome-hub.firebasestorage.app/templates/invoice_paris_${INVOICE_TEMPLATE_STORAGE_VERSION}.zip`
      : `bizhome-hub.firebasestorage.app/templates/invoice_orly_${INVOICE_TEMPLATE_STORAGE_VERSION}.zip`;
  }
  
  function buildContractOutputName(addressKey: AddressKey, jobId: string) {
    return `contrats-${addressKey}/${jobId}.pdf`;
  }
  
  function buildAttestationOutputName(addressKey: AddressKey, jobId: string) {
    return `attestations-${addressKey}/${jobId}.pdf`;
  }

  function buildInvoiceOutputName(addressKey: AddressKey, invoiceNumber: string) {
    const cleanNumber = String(invoiceNumber).replace(/\//g, "-");
    return `invoices-${addressKey}/${cleanNumber}-invoice-${Date.now()}.pdf`;
  }

  function firstNonEmpty(...values: unknown[]): string {
    for (const value of values) {
      const text = String(value ?? "").trim();
      if (text) return text;
    }
    return "";
  }

  function getInvoiceSellerProfile(addressKey: AddressKey) {
    if (addressKey === "paris") {
      return {
        logoLabel: "BPC",
        name: "BUSINESS PARTNERS CONSULTING",
        legalLine: "SAS - Capital 10 000 EUR",
        address: "9 Rue de Wattignies, 75012 Paris",
        email: "contact.ccs75@gmail.com",
        siret: "952 131 423",
        vat: "",
        approval: "Prefet de Paris 04 - AG/DOM/2023095",
      };
    }

    return {
      logoLabel: "CCS",
      name: "CONSULTING CONSEIL SERVICES",
      legalLine: "SARL - Capital 100 000 EUR",
      address: "25 Rue Edmond Rostand, 94310 Orly",
      email: "contact.ccs94@gmail.com",
      siret: "830 278 644",
      vat: "",
      approval: "Prefet de Val-de-Marne - AG/DOM/2024-06",
    };
  }
  
  function getAddressIdFromAddressKey(addressKey: AddressKey) {
    return addressKey === "paris" ? "paris_12e" : "orly_ville";
  }
  
/**
 * Cœur de la logique de création des jobs PDF.
 * Supporte la création partielle et l'idempotence défensive.
 */
export async function performCreatePdfJobs(
  uid: string,
  clientRequestId: string,
  data: any,
  signatureUrlOverride?: string | null,
  options?: { force?: boolean }
) {
  const db = admin.firestore();
  const now = admin.firestore.FieldValue.serverTimestamp();
  const requestRef = db.doc(`client_requests/${clientRequestId}`);
  const clientDocId = String(uid || clientRequestId || "").trim();
  const clientRef = clientDocId ? db.doc(`clients/${clientDocId}`) : null;
  const force = options?.force === true;

  // 1. Récupération de l'état actuel pour l'idempotence défensive
  const requestSnap = await requestRef.get();
  if (!requestSnap.exists && !data) {
    throw new Error(`Dossier ${clientRequestId} introuvable.`);
  }

  const requestData = requestSnap.exists ? requestSnap.data() || {} : {};
  const existingPdfJobs = requestData.pdfJobs || {};
  const existingPdfPublish = requestData.pdfPublish || {};
  const clientSnap = clientRef ? await clientRef.get() : null;

  // 2. Détermination des données (priorité aux arguments, puis au document)
  const addressKey = toAddressKey(data.addressKey || requestData.addressKey);
  if (!addressKey) {
    throw new Error("addressKey invalide ou manquante.");
  }

  const payload = cleanObject(data.data || data.payload || data || {});
  // Si on est dans le trigger, certaines infos sont à la racine du document
  const emailLower = normalizeEmailLower(
    payload.email || payload.emailLower || requestData.email || requestData.emailLower
  );
  if (!emailLower) {
    throw new Error("Email manquant pour créer les PDF.");
  }

  const signatureUrl =
    signatureUrlOverride ||
    data.signatureUrl ||
    payload.signatureUrl ||
    requestData.signatureUrl ||
    null;

  // 3. Cas partiel / Idempotence.
  // force=true is an explicit operator action: create a fresh version even if a PDF already exists.
  const needsContract = force || !existingPdfJobs.contractId;
  const needsAttestation = force || !existingPdfJobs.attestationId;

  if (!needsContract && !needsAttestation) {
    logger.info("[performCreatePdfJobs] Déjà complet", { clientRequestId, force });
    return {
      ok: true,
      idempotent: true,
      contractId: existingPdfJobs.contractId,
      attestationId: existingPdfJobs.attestationId,
    };
  }

  // 4. Préparation des payloads
  const siretNorm = normalizeSiret(payload.siret || requestData.siret);
  const addressId =
    String(payload.addressId || requestData.addressId || "").trim() ||
    getAddressIdFromAddressKey(addressKey);

  const companyName = String(
    payload.companyName || requestData.companyName || ""
  ).trim();
  const firstName = String(payload.firstName || requestData.firstName || "").trim();
  const lastName = String(payload.lastName || requestData.lastName || "").trim();
  const signatoryName =
    String(payload.signatoryName || requestData.signatoryName || "").trim() ||
    `${firstName} ${lastName}`.trim() ||
    companyName ||
    "Le domicilié";

  const signedAt =
    String(payload.signedAt || requestData.signedAt || "").trim() ||
    new Date().toISOString();
  const effectiveDateDisplay =
    String(payload.effectiveDateDisplay || requestData.effectiveDateDisplay || "").trim() ||
    String(payload.A_COMPTER_DU || requestData.A_COMPTER_DU || "").trim() ||
    String(payload.today || requestData.today || "").trim() ||
    formatDate(
      requestData.approvedAt ||
      payload.approvedAt ||
      signedAt ||
      requestData.createdAt ||
      new Date().toISOString()
    );
  const signedAtDisplay =
    String(payload.signedAtDisplay || requestData.signedAtDisplay || "").trim() ||
    formatDate(signedAt);

  const commonPdfData = cleanObject({
    ...requestData, // On prend la base du document
    ...payload, // Et on surcharge avec le payload éventuel
    ownerUid: uid || requestData.ownerUid || clientRequestId,
    requestUid: clientRequestId,
    addressKey,
    addressId,
    email: emailLower,
    emailLower,
    siret: siretNorm,
    signatoryName,
    signedAt,
    signedAtDisplay,
    signatureUrl,
    today: effectiveDateDisplay,
    A_COMPTER_DU: effectiveDateDisplay,
    effectiveDateDisplay,
    outputBucket: "bizhome-hub.firebasestorage.app",
  });

  const updates: any = {
    updatedAt: now,
    pdfJobs: { ...existingPdfJobs },
    pdfPublish: { ...existingPdfPublish },
  };

  const promises: Promise<any>[] = [];

  // Création du contrat si manquant
  if (needsContract) {
    const contractCollection = buildContractCollectionName(addressKey);
    const contractRef = db.collection(contractCollection).doc();
    const contractPayload = {
      createdAt: now,
      ownerUid: uid || requestData.ownerUid || clientRequestId,
      status: "queued",
      template: buildContractTemplatePath(addressKey),
      outputBucket: "bizhome-hub.firebasestorage.app",
      outputName: buildContractOutputName(addressKey, contractRef.id),
      data: commonPdfData,
    };
    const p = contractRef
      .set(contractPayload)
      .then(() => {
        updates.pdfJobs.contractId = contractRef.id;
        updates.pdfPublish.contract = {
          ...(existingPdfPublish.contract || {}),
          jobId: contractRef.id,
          status: "processing",
          outputUrl: null,
          error: null,
          updatedAt: new Date().toISOString(),
        };
      });
    promises.push(p);
  }

  // Création de l'attestation si manquante
  if (needsAttestation) {
    const attestationCollection = buildAttestationCollectionName(addressKey);
    const attestationRef = db.collection(attestationCollection).doc();
    const attestationPayload = {
      createdAt: now,
      ownerUid: uid || requestData.ownerUid || clientRequestId,
      status: "queued",
      template: buildAttestationTemplatePath(addressKey),
      outputBucket: "bizhome-hub.firebasestorage.app",
      outputName: buildAttestationOutputName(addressKey, attestationRef.id),
      data: commonPdfData,
    };
    const p = attestationRef
      .set(attestationPayload)
      .then(() => {
        updates.pdfJobs.attestationId = attestationRef.id;
        updates.pdfPublish.attestation = {
          ...(existingPdfPublish.attestation || {}),
          jobId: attestationRef.id,
          status: "processing",
          outputUrl: null,
          error: null,
          updatedAt: new Date().toISOString(),
        };
      });
    promises.push(p);
  }

  await Promise.all(promises);

  // 5. Mise à jour du document parent (atomique)
  await requestRef.set(updates, { merge: true });
  if (clientSnap?.exists) {
    await clientRef?.set(
      {
        pdfJobs: updates.pdfJobs,
        updatedAt: now,
      },
      { merge: true }
    );
  }

  logger.info("[performCreatePdfJobs] Succès", {
    clientRequestId,
    contractId: updates.pdfJobs.contractId,
    attestationId: updates.pdfJobs.attestationId,
    added: (needsContract ? "contract " : "") + (needsAttestation ? "attestation" : ""),
  });

  return {
    ok: true,
    idempotent: false,
    contractId: updates.pdfJobs.contractId,
    attestationId: updates.pdfJobs.attestationId,
  };
}

/**
 * Formate un timestamp Firestore en JJ/MM/AAAA.
 */
function formatDate(timestamp: any): string {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Formate un montant en centimes en chaîne "123,45 €".
 */
function formatMoney(amountCents: number): string {
  return (amountCents / 100).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + " €";
}

/**
 * Prépare et crée un job PDF pour une facture.
 * Idempotent via invoice.pdf.jobId.
 */
function formatInvoiceMoney(amountCents: number): string {
  return (amountCents / 100).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + " EUR";
}

export async function performCreateInvoicePdfJob(
  invoiceId: string,
  invoiceData: any,
  options?: { force?: boolean }
) {
  const db = admin.firestore();
  const now = admin.firestore.FieldValue.serverTimestamp();
  const invoiceRef = db.doc(`invoices/${invoiceId}`);
  const force = options?.force === true;

  // 1. Idempotence
  const currentPdf = invoiceData.pdf || {};
  const currentPdfUrl = String(
    currentPdf.outputUrl || currentPdf.fileUrl || currentPdf.url || ""
  ).trim();
  const hasCompletePdf = currentPdf.status === "complete" && !!currentPdfUrl;
  const hasCurrentInvoiceTemplate =
    String(currentPdf.templateVersion || "").trim() === INVOICE_PDF_TEMPLATE_VERSION;

  if (currentPdf.jobId && hasCurrentInvoiceTemplate && (!force || hasCompletePdf)) {
    logger.info("[performCreateInvoicePdfJob] Job déjà existant", {
      invoiceId,
      jobId: currentPdf.jobId,
      force,
      hasCompletePdf,
    });
    return { ok: true, idempotent: true, jobId: currentPdf.jobId };
  }

  const addressKey = toAddressKey(invoiceData.addressKey || invoiceData.sellerSnapshot?.addressKey);
  if (!addressKey) {
    throw new Error(`addressKey manquante ou invalide pour la facture ${invoiceId}`);
  }

  // 2. Préparation du payload ENRICHI (Strict Alignment)
  const amountCents = (Number(invoiceData.amountCents) || 0) || 0;
  const isPaid = invoiceData.status === "paid" || invoiceData.status === "active";
  const invoiceNumber = String(invoiceData.invoiceNumber || invoiceId || "FAC-GEN-000").trim();
  const clientId = String(invoiceData.clientId || "admin-manual-trigger").trim();
  
  // Calculs financiers robustes (TVA 20%)
  const subtotalCents = Math.round(amountCents / 1.2);
  const vatCents = amountCents - subtotalCents;

  const snapshot = invoiceData.snapshot || {};
  const client = snapshot.client || {};
  const seller = snapshot.seller || {};
  const sellerProfile = getInvoiceSellerProfile(addressKey);
  const description =
    String(invoiceData.type || "").toLowerCase() === "subscription"
      ? "Abonnement de domiciliation"
      : "Frais de dossier et premier mois de domiciliation";
  const subtotalFormatted = formatInvoiceMoney(subtotalCents);
  const vatFormatted = formatInvoiceMoney(vatCents);
  const totalFormatted = formatInvoiceMoney(amountCents);
  const invoiceStatusLabel = isPaid ? "ACQUITTEE" : "A PAYER";

  const sellerLogoLabel = firstNonEmpty(sellerProfile.logoLabel, seller.logoLabel);
  const sellerName = firstNonEmpty(sellerProfile.name, seller.name);
  const sellerLegalLine = firstNonEmpty(sellerProfile.legalLine, seller.legalLine);
  const sellerAddress = firstNonEmpty(sellerProfile.address, seller.address);
  const sellerEmail = firstNonEmpty(sellerProfile.email, seller.email);
  const sellerSiret = firstNonEmpty(sellerProfile.siret, seller.siret, seller.siren);
  const sellerVat = firstNonEmpty(sellerProfile.vat, seller.vat, seller.tva, "Non renseignee");
  const sellerApproval = firstNonEmpty(sellerProfile.approval, seller.approval);

  const clientName = firstNonEmpty(client.name, invoiceData.clientName, invoiceData.companyName, "Client inconnu");
  const clientAddress = firstNonEmpty(client.address, invoiceData.clientAddress, "");
  const clientEmail = firstNonEmpty(client.email, invoiceData.email, "");
  const clientSiret = firstNonEmpty(client.siret, invoiceData.siret, "En cours d'immatriculation");

  const richPayload = {
    invoiceId,
    addressKey,
    templateVersion: INVOICE_PDF_TEMPLATE_VERSION,
    invoiceNumber,
    issuedAtFormatted: formatDate(invoiceData.issuedAt),
    paidAtFormatted: isPaid ? formatDate(invoiceData.paidAt) : "",
    dueDateFormatted: formatDate(invoiceData.dueDate || invoiceData.issuedAt),
    sellerLogoLabel,
    sellerName,
    sellerLegalLine,
    sellerAddress,
    sellerEmail,
    sellerSiret,
    sellerVat,
    sellerApproval,
    clientName,
    clientAddress,
    clientEmail,
    clientSiret,
    lineDescription: description,
    lineAmountFormatted: subtotalFormatted,
    invoiceStatusLabel,
    
    // Namespaces unifiés
    snapshot: {
      client: {
        name: clientName,
        address: clientAddress,
        email: clientEmail,
        siret: clientSiret,
      },
      seller: {
        logoLabel: sellerLogoLabel,
        name: sellerName,
        legalLine: sellerLegalLine,
        address: sellerAddress,
        email: sellerEmail,
        siret: sellerSiret,
        vat: sellerVat,
        approval: sellerApproval,
      }
    },
    
    // Montants formatés (zéro logique dans le template)
    subtotalFormatted,
    vatFormatted,
    totalFormatted,
    
    // Statuts
    isPaid,
    statusLabel: isPaid ? "ACQUITTÉE" : "À PAYER",
    
    // Structure items simplifiée si besoin (ici fixe pour inscription)
    items: [
      {
        description,
        amountFormatted: subtotalFormatted
      }
    ]
  };

  const invoiceCollection = buildInvoiceCollectionName(addressKey);
  const templatePath = buildInvoiceTemplatePath(addressKey);
  const outputName = buildInvoiceOutputName(addressKey, invoiceNumber);

  const outputBucket = "bizhome-hub.firebasestorage.app";

  const cleanedPayload = cleanObject(richPayload);

  const jobPayload = {
    // Some PDF extension instances render from the Firestore document root,
    // while others render from the nested `data` object. Keep both aligned.
    ...cleanedPayload,
    template: templatePath,
    data: cleanedPayload,
    outputBucket,
    outputName,
    output: `${outputBucket}/${outputName}`, // Backward compatibility
    status: "queued",
    createdAt: now,
    invoiceId, // ROOT LEVEL ID FOR STABLE SYNC
    ownerUid: clientId,
    templateVersion: INVOICE_PDF_TEMPLATE_VERSION,
  };

  logger.debug(`[performCreateInvoicePdfJob] Payload préparé pour ${invoiceId}`, { 
    invoiceCollection, 
    jobPayload: { ...jobPayload, data: "..." } 
  });

  // 3. Création atomique
  const jobRef = await db.collection(invoiceCollection).add(jobPayload);

  await invoiceRef.update({
    "pdf.jobId": jobRef.id,
    "pdf.status": "processing",
    "pdf.outputUrl": null,
    "pdf.fileUrl": null,
    "pdf.url": null,
    "pdf.error": null,
    "pdf.templateVersion": INVOICE_PDF_TEMPLATE_VERSION,
    "pdf.updatedAt": now,
  });

  logger.info("[performCreateInvoicePdfJob] Job créé", {
    invoiceId,
    jobId: jobRef.id,
  });

  return { ok: true, idempotent: false, jobId: jobRef.id };
}

const createPdfJobsHandler = async (req: CallableRequest<any>) => {
  try {
    if (!req.auth) {
      throw new HttpsError("unauthenticated", "Auth requise.");
    }

    const uid = req.auth.uid;
    const data = req.data || {};
    const clientRequestId = String(data.clientRequestId ?? "").trim() || uid;
    const force = data.force === true;
    const basePayload = data.data || data.payload || {};
    const signatureUrl =
      typeof data.signatureUrl === "string" && data.signatureUrl.trim()
        ? data.signatureUrl.trim()
        : null;
    const payload = {
      ...basePayload,
      addressKey: data.addressKey || basePayload.addressKey || null,
      signatureUrl: signatureUrl || basePayload.signatureUrl || null,
    };

    const result = await performCreatePdfJobs(
      uid,
      clientRequestId,
      payload,
      signatureUrl,
      { force }
    );

    return result;
  } catch (error: any) {
    logger.error("[createPdfJobs] ERROR", {
      message: error?.message ?? String(error),
      stack: error?.stack,
    });

    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", error?.message ?? "Erreur serveur createPdfJobs");
  }
};

export const createPdfJobs = onCall(
  { region: "europe-west9", cors: true },
  createPdfJobsHandler
);
