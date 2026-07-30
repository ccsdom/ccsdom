import { onObjectFinalized } from "firebase-functions/v2/storage";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { getStorage } from "firebase-admin/storage";

import { GEMINI_API_KEY, GENAI_MODEL_NAME, DOCAI_PROCESSOR_NAME } from "./_config/secrets";
import { analyzeIdentityDocFlow } from "./ai/flows/analyzeIdentityDoc";

if (!admin.apps.length) admin.initializeApp();

type VerificationStatus = "processing" | "passed" | "warning" | "failed" | "unreadable" | "unsupported";
type CheckStatus = "passed" | "warning" | "failed" | "missing" | "skipped";

type VerificationCheck = {
  key: string;
  label: string;
  status: CheckStatus;
  expected?: string;
  actual?: string;
  message: string;
};

type VerificationReport = {
  status: VerificationStatus;
  docType: string;
  path: string;
  fileName: string;
  contentType: string;
  size?: number;
  confidence?: number;
  summary: string;
  reason?: string;
  warnings: string[];
  checks: VerificationCheck[];
  extractedData: Record<string, unknown>;
  analyzer: "gemini_document_precheck";
  updatedAt: admin.firestore.FieldValue;
};

const SUPPORTED_CONTENT_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

const DOC_LABELS: Record<string, string> = {
  kbis: "KBIS",
  identityCard: "Piece d'identite",
  proofOfAddress: "Justificatif de domicile",
};

export const analyzeIdentityDocuments = onObjectFinalized(
  {
    region: "europe-west9",
    memory: "512MiB",
    timeoutSeconds: 120,
    secrets: [GEMINI_API_KEY, GENAI_MODEL_NAME, DOCAI_PROCESSOR_NAME],
  },
  async (event) => {
    const path = event.data.name || "";
    const contentType = (event.data.contentType || "").toLowerCase();
    const bucket = event.data.bucket;

    if (!path.startsWith("documents/")) return;

    const [, requestUid, docType, ...fileParts] = path.split("/");
    if (!requestUid || !docType || fileParts.length === 0) return;

    const fileName = fileParts.join("/");
    const size = Number(event.data.size || 0) || undefined;
    const db = admin.firestore();
    const reqRef = db.collection("client_requests").doc(requestUid);

    logger.info("[analyzeIdentityDocuments] Pre-verification started", {
      requestUid,
      docType,
      path,
      contentType,
    });

    await reqRef.set(
      {
        documentsVerification: {
          [docType]: {
            status: "processing",
            docType,
            path,
            fileName,
            contentType,
            size,
            summary: "Analyse IA en cours.",
            analyzer: "gemini_document_precheck",
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    if (!isSupportedContentType(contentType)) {
      const report = buildUnsupportedReport({ docType, path, fileName, contentType, size });
      await persistReport(reqRef, docType, report);
      logger.warn("[analyzeIdentityDocuments] Unsupported document type", { requestUid, docType, contentType });
      return;
    }

    try {
      const reqSnap = await reqRef.get();
      const requestData = reqSnap.exists ? reqSnap.data() || {} : {};

      const storage = getStorage();
      const file = storage.bucket(bucket).file(path);
      const [buffer] = await file.download();

      const analysis = await analyzeIdentityDocFlow({
        docType,
        fileBase64: buffer.toString("base64"),
        contentType,
      });

      const report = buildVerificationReport({
        docType,
        path,
        fileName,
        contentType,
        size,
        requestData,
        analysis,
      });

      await persistReport(reqRef, docType, report);

      logger.info("[analyzeIdentityDocuments] Pre-verification completed", {
        requestUid,
        docType,
        status: report.status,
        confidence: report.confidence,
      });
    } catch (error: any) {
      logger.error("[analyzeIdentityDocuments] Pre-verification failed", {
        requestUid,
        docType,
        error: error?.message || String(error),
      });

      const report = buildFailureReport({
        docType,
        path,
        fileName,
        contentType,
        size,
        reason: error?.message || "Echec de l'analyse IA.",
      });

      await persistReport(reqRef, docType, report);
    }
  }
);

function isSupportedContentType(contentType: string) {
  return SUPPORTED_CONTENT_TYPES.includes(contentType);
}

function buildUnsupportedReport(args: {
  docType: string;
  path: string;
  fileName: string;
  contentType: string;
  size?: number;
}): VerificationReport {
  return {
    ...baseReport(args),
    status: "unsupported",
    summary: "Format non supporte par la pre-verification IA.",
    reason: `Type MIME non supporte : ${args.contentType || "inconnu"}.`,
    warnings: ["Demander un PDF, JPG, PNG ou WEBP."],
    checks: [
      {
        key: "format",
        label: "Format du fichier",
        status: "failed",
        actual: args.contentType || "inconnu",
        message: "Le format ne peut pas etre analyse automatiquement.",
      },
    ],
    extractedData: {},
  };
}

function buildFailureReport(args: {
  docType: string;
  path: string;
  fileName: string;
  contentType: string;
  size?: number;
  reason: string;
}): VerificationReport {
  return {
    ...baseReport(args),
    status: "failed",
    summary: "La pre-verification IA a echoue.",
    reason: args.reason,
    warnings: ["Controle humain requis."],
    checks: [
      {
        key: "analysis",
        label: "Analyse IA",
        status: "failed",
        message: args.reason,
      },
    ],
    extractedData: {},
  };
}

function buildVerificationReport(args: {
  docType: string;
  path: string;
  fileName: string;
  contentType: string;
  size?: number;
  requestData: admin.firestore.DocumentData;
  analysis: any;
}): VerificationReport {
  const extractedData = cleanObject(args.analysis?.extractedData || {});
  const warnings = new Set<string>(Array.isArray(args.analysis?.warnings) ? args.analysis.warnings.filter(Boolean) : []);
  const checks = buildChecks(args.docType, args.requestData, extractedData, args.analysis);

  for (const check of checks) {
    if (check.status === "warning" || check.status === "failed" || check.status === "missing") {
      warnings.add(check.message);
    }
  }

  const status = resolveReportStatus(args.analysis, checks);

  return {
    ...baseReport(args),
    status,
    confidence: normalizeConfidence(args.analysis?.confidence),
    summary: buildSummary(args.docType, status, args.analysis),
    reason: String(args.analysis?.reason || "").trim() || undefined,
    warnings: Array.from(warnings).slice(0, 8),
    checks,
    extractedData,
  };
}

function baseReport(args: {
  docType: string;
  path: string;
  fileName: string;
  contentType: string;
  size?: number;
}): Omit<VerificationReport, "status" | "summary" | "warnings" | "checks" | "extractedData"> {
  return {
    docType: args.docType,
    path: args.path,
    fileName: args.fileName,
    contentType: args.contentType,
    size: args.size,
    analyzer: "gemini_document_precheck",
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
}

function buildChecks(
  docType: string,
  requestData: admin.firestore.DocumentData,
  extractedData: Record<string, unknown>,
  analysis: any
): VerificationCheck[] {
  const checks: VerificationCheck[] = [
    {
      key: "readability",
      label: "Lisibilite",
      status: analysis?.isValid === false && normalizeConfidence(analysis?.confidence) < 0.45 ? "failed" : "passed",
      actual: `${Math.round(normalizeConfidence(analysis?.confidence) * 100)}%`,
      message:
        analysis?.isValid === false
          ? String(analysis?.reason || "Document a verifier.")
          : "Le document semble lisible.",
    },
  ];

  if (docType === "kbis") {
    checks.push(...buildKbisChecks(requestData, extractedData));
  } else if (docType === "identityCard") {
    checks.push(...buildIdentityChecks(requestData, extractedData));
  } else if (docType === "proofOfAddress") {
    checks.push(...buildProofOfAddressChecks(extractedData));
  }

  return checks;
}

function buildKbisChecks(
  requestData: admin.firestore.DocumentData,
  extractedData: Record<string, unknown>
): VerificationCheck[] {
  const expectedSiren = normalizeDigits(
    requestData.siren || requestData.siretNorm || requestData.siret || requestData.siretRaw
  ).slice(0, 9);
  const actualSiren = normalizeDigits(extractedData.siren || extractedData.siret).slice(0, 9);
  const expectedCompany = firstNonEmpty(requestData.companyName, requestData.name);
  const actualCompany = firstNonEmpty(extractedData.companyName);
  const expectedLegalStatus = firstNonEmpty(requestData.legalStatus);
  const actualLegalStatus = firstNonEmpty(extractedData.legalStatus);
  const expectedRepresentative = firstNonEmpty(
    requestData.representative,
    requestData.signatoryName,
    [requestData.firstName, requestData.lastName].filter(Boolean).join(" ")
  );
  const actualRepresentative = firstNonEmpty(extractedData.representativeName);

  return [
    compareExactDigits({
      key: "siren",
      label: "SIREN / SIRET",
      expected: expectedSiren,
      actual: actualSiren,
      missingMessage: "SIREN non extrait du KBIS.",
      mismatchMessage: "Le SIREN extrait ne correspond pas au dossier.",
      matchMessage: "SIREN coherent avec le dossier.",
    }),
    compareTextSimilarity({
      key: "companyName",
      label: "Denomination sociale",
      expected: expectedCompany,
      actual: actualCompany,
      missingMessage: "Denomination non extraite du KBIS.",
      mismatchMessage: "La denomination extraite differe de la demande.",
      matchMessage: "Denomination coherente.",
      mismatchStatus: "warning",
    }),
    compareTextSimilarity({
      key: "legalStatus",
      label: "Forme juridique",
      expected: expectedLegalStatus,
      actual: actualLegalStatus,
      missingMessage: "Forme juridique non extraite.",
      mismatchMessage: "La forme juridique extraite differe de la demande.",
      matchMessage: "Forme juridique coherente.",
      mismatchStatus: "warning",
    }),
    compareTextSimilarity({
      key: "representative",
      label: "Representant legal",
      expected: expectedRepresentative,
      actual: actualRepresentative,
      missingMessage: "Representant legal non extrait.",
      mismatchMessage: "Le representant extrait differe de la demande.",
      matchMessage: "Representant coherent.",
      mismatchStatus: "warning",
    }),
  ];
}

function buildIdentityChecks(
  requestData: admin.firestore.DocumentData,
  extractedData: Record<string, unknown>
): VerificationCheck[] {
  const expectedRepresentative = firstNonEmpty(
    requestData.representative,
    requestData.signatoryName,
    [requestData.firstName, requestData.lastName].filter(Boolean).join(" ")
  );
  const actualName = firstNonEmpty(extractedData.fullName, extractedData.representativeName);
  const expiryDate = parseFlexibleDate(firstNonEmpty(extractedData.expiryDate));

  const checks: VerificationCheck[] = [
    compareTextSimilarity({
      key: "identityName",
      label: "Nom sur piece d'identite",
      expected: expectedRepresentative,
      actual: actualName,
      missingMessage: "Nom non extrait de la piece d'identite.",
      mismatchMessage: "Le nom extrait differe du representant declare.",
      matchMessage: "Identite coherente avec le representant.",
      mismatchStatus: "warning",
    }),
  ];

  if (expiryDate) {
    const expired = expiryDate.getTime() < Date.now();
    checks.push({
      key: "identityExpiry",
      label: "Validite de la piece",
      status: expired ? "failed" : "passed",
      actual: expiryDate.toISOString().slice(0, 10),
      message: expired ? "La piece d'identite semble expiree." : "La piece d'identite semble en cours de validite.",
    });
  } else {
    checks.push({
      key: "identityExpiry",
      label: "Validite de la piece",
      status: "missing",
      message: "Date d'expiration non detectee.",
    });
  }

  return checks;
}

function buildProofOfAddressChecks(extractedData: Record<string, unknown>): VerificationCheck[] {
  const address = firstNonEmpty(extractedData.address);
  const issueDate = parseFlexibleDate(firstNonEmpty(extractedData.issueDate));
  const checks: VerificationCheck[] = [
    {
      key: "proofAddress",
      label: "Adresse extraite",
      status: address ? "passed" : "missing",
      actual: address || undefined,
      message: address ? "Adresse extraite du justificatif." : "Adresse non extraite du justificatif.",
    },
  ];

  if (issueDate) {
    const ageDays = Math.round((Date.now() - issueDate.getTime()) / 86400000);
    checks.push({
      key: "proofIssueDate",
      label: "Date du justificatif",
      status: ageDays > 180 ? "warning" : "passed",
      actual: issueDate.toISOString().slice(0, 10),
      message:
        ageDays > 180
          ? "Le justificatif semble ancien : controle humain recommande."
          : "Le justificatif semble recent.",
    });
  } else {
    checks.push({
      key: "proofIssueDate",
      label: "Date du justificatif",
      status: "missing",
      message: "Date d'emission non detectee.",
    });
  }

  return checks;
}

function compareExactDigits(args: {
  key: string;
  label: string;
  expected: string;
  actual: string;
  missingMessage: string;
  mismatchMessage: string;
  matchMessage: string;
}): VerificationCheck {
  if (!args.expected) {
    return {
      key: args.key,
      label: args.label,
      status: "skipped",
      actual: args.actual || undefined,
      message: "Reference absente dans le dossier.",
    };
  }

  if (!args.actual) {
    return {
      key: args.key,
      label: args.label,
      status: "missing",
      expected: args.expected,
      message: args.missingMessage,
    };
  }

  const matches = args.expected === args.actual;
  return {
    key: args.key,
    label: args.label,
    status: matches ? "passed" : "failed",
    expected: args.expected,
    actual: args.actual,
    message: matches ? args.matchMessage : args.mismatchMessage,
  };
}

function compareTextSimilarity(args: {
  key: string;
  label: string;
  expected: string;
  actual: string;
  missingMessage: string;
  mismatchMessage: string;
  matchMessage: string;
  mismatchStatus: "warning" | "failed";
}): VerificationCheck {
  if (!args.expected) {
    return {
      key: args.key,
      label: args.label,
      status: "skipped",
      actual: args.actual || undefined,
      message: "Reference absente dans le dossier.",
    };
  }

  if (!args.actual) {
    return {
      key: args.key,
      label: args.label,
      status: "missing",
      expected: args.expected,
      message: args.missingMessage,
    };
  }

  const matches = hasEnoughSharedTokens(args.expected, args.actual);
  return {
    key: args.key,
    label: args.label,
    status: matches ? "passed" : args.mismatchStatus,
    expected: args.expected,
    actual: args.actual,
    message: matches ? args.matchMessage : args.mismatchMessage,
  };
}

function resolveReportStatus(analysis: any, checks: VerificationCheck[]): VerificationStatus {
  const confidence = normalizeConfidence(analysis?.confidence);
  const hasFailedCheck = checks.some((check) => check.status === "failed");
  const hasWarningCheck = checks.some((check) => check.status === "warning" || check.status === "missing");

  if (analysis?.isValid === false && confidence < 0.45) return "unreadable";
  if (hasFailedCheck) return "failed";
  if (analysis?.isValid === false || confidence < 0.72 || hasWarningCheck) return "warning";
  return "passed";
}

function buildSummary(docType: string, status: VerificationStatus, analysis: any) {
  const aiSummary = String(analysis?.summary || "").trim();
  if (aiSummary) return aiSummary;

  const label = DOC_LABELS[docType] || "Document";
  if (status === "passed") return `${label} pre-verifie sans anomalie majeure.`;
  if (status === "warning") return `${label} recu, controle humain recommande.`;
  if (status === "failed") return `${label} incoherent avec le dossier.`;
  if (status === "unreadable") return `${label} illisible ou non exploitable.`;
  return `${label} a verifier.`;
}

async function persistReport(
  reqRef: admin.firestore.DocumentReference,
  docType: string,
  report: VerificationReport
) {
  await reqRef.set(
    {
      documentsVerification: {
        [docType]: report,
      },
      documentsMeta: {
        [docType]: {
          type: docType,
          mime: report.contentType,
          isValid: report.status === "passed" || report.status === "warning",
          confidence: report.confidence ?? 0,
          extractedData: report.extractedData || {},
          reason: report.reason || report.summary,
          verificationStatus: report.status,
          validated: report.status === "passed",
          error:
            report.status === "failed" || report.status === "unreadable" || report.status === "unsupported"
              ? report.reason || report.summary
              : null,
          ts: admin.firestore.FieldValue.serverTimestamp(),
        },
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

function normalizeConfidence(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function normalizeDigits(value: unknown) {
  return String(value || "").replace(/\D/g, "");
}

function normalizeText(value: unknown) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function firstNonEmpty(...values: unknown[]) {
  for (const value of values) {
    const text = String(value || "").trim();
    if (text) return text;
  }
  return "";
}

function hasEnoughSharedTokens(expected: string, actual: string) {
  const expectedTokens = normalizeText(expected).split(" ").filter((token) => token.length >= 3);
  const actualText = normalizeText(actual);

  if (expectedTokens.length === 0 || !actualText) return false;

  const matched = expectedTokens.filter((token) => actualText.includes(token)).length;
  return matched / expectedTokens.length >= 0.55;
}

function parseFlexibleDate(value: string): Date | null {
  const raw = String(value || "").trim();
  if (!raw) return null;

  const direct = new Date(raw);
  if (!Number.isNaN(direct.getTime())) return direct;

  const frMatch = raw.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})/);
  if (!frMatch) return null;

  const day = Number(frMatch[1]);
  const month = Number(frMatch[2]) - 1;
  const yearRaw = Number(frMatch[3]);
  const year = yearRaw < 100 ? 2000 + yearRaw : yearRaw;
  const parsed = new Date(year, month, day);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function cleanObject(value: Record<string, unknown>) {
  return Object.entries(value).reduce<Record<string, unknown>>((acc, [key, entry]) => {
    if (entry !== undefined && entry !== null && String(entry).trim() !== "") {
      acc[key] = entry;
    }
    return acc;
  }, {});
}
