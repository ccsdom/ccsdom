import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import * as admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();

/* ---------------- Types ---------------- */

type AnalyzeOutput = {
  overallRecommendation: "approve" | "review_needed" | "reject";
  summary: string;
  documentAnalyses: Array<{
    documentType: string;
    isValid: boolean;
    findings: string[];
    mismatches: string[];
  }>;
};

/* ---------------- Helpers ---------------- */

function requireString(v: any, name: string) {
  if (!v || typeof v !== "string") {
    throw new HttpsError("invalid-argument", `${name} requis`);
  }
  return v;
}

function getRoleFromClaims(claims: any): string | null {
  if (!claims) return null;
  if (typeof claims.role === "string") return claims.role;

  if (Array.isArray(claims.roles) && claims.roles.length) {
    const first = claims.roles.find((r: any) => typeof r === "string");
    return first ?? null;
  }

  if (claims.isAdmin === true) return "super_admin";
  return null;
}

function canStartAnalysis(claims: any) {
  const role = getRoleFromClaims(claims);
  return (
    role === "super_admin" ||
    role === "manager_paris" ||
    role === "manager_orly" ||
    role === "secretary_paris" ||
    role === "secretary_orly"
  );
}

function pickDocs(data: any): Record<string, string> | null {
  const docs = data?.documents;
  const uploads = data?.uploads;

  const get = (obj: any, key: string) =>
    obj && typeof obj[key] === "string" ? obj[key] : null;

  const out: Record<string, string> = {};

  const kbis =
    get(docs, "kbis") ??
    get(uploads, "kbis") ??
    (typeof data?.["documents.kbis"] === "string" ? data["documents.kbis"] : null) ??
    (typeof data?.["uploads.kbis"] === "string" ? data["uploads.kbis"] : null);

  const identityCard =
    get(docs, "identityCard") ??
    get(uploads, "identityCard") ??
    (typeof data?.["documents.identityCard"] === "string" ? data["documents.identityCard"] : null) ??
    (typeof data?.["uploads.identityCard"] === "string" ? data["uploads.identityCard"] : null);

  const proofOfAddress =
    get(docs, "proofOfAddress") ??
    get(uploads, "proofOfAddress") ??
    (typeof data?.["documents.proofOfAddress"] === "string"
      ? data["documents.proofOfAddress"]
      : null) ??
    (typeof data?.["uploads.proofOfAddress"] === "string"
      ? data["uploads.proofOfAddress"]
      : null);

  if (kbis) out.kbis = kbis;
  if (identityCard) out.identityCard = identityCard;
  if (proofOfAddress) out.proofOfAddress = proofOfAddress;

  return Object.keys(out).length ? out : null;
}

async function downloadAsBase64(path: string, maxBytes = 6_000_000) {
  const bucket = getStorage().bucket();
  const file = bucket.file(path);

  const [meta] = await file.getMetadata();
  const size = Number(meta.size || 0);

  if (Number.isFinite(size) && size > maxBytes) {
    throw new Error(`Fichier trop volumineux (${size} bytes). Limite ${maxBytes}.`);
  }

  const [buf] = await file.download();
  return {
    base64: buf.toString("base64"),
    contentType: String(meta.contentType || "application/octet-stream"),
    size,
  };
}

/* ---------------- Mock analyse ---------------- */

async function analyzeServerSide(payload: {
  requestUid: string;
  companyName?: string;
  signatoryName?: string;
  docs: Array<{ type: string; dataBase64: string; contentType: string }>;
}): Promise<AnalyzeOutput> {
  return {
    overallRecommendation: "review_needed",
    summary: `Analyse serveur simulée (${payload.docs.length} document(s)).`,
    documentAnalyses: payload.docs.map((d) => ({
      documentType: d.type,
      isValid: true,
      findings: [`Document reçu (${d.contentType})`],
      mismatches: [],
    })),
  };
}

/* ---------------- Firestore safe updater ---------------- */

async function setAnalysis(
  ref: FirebaseFirestore.DocumentReference,
  patch: Record<string, any>
) {
  // ✅ IMPORTANT: jamais de "analysis: { ... }" ici.
  // uniquement des champs "analysis.xxx"
  await ref.update({
    ...patch,
    "analysis.updatedAt": admin.firestore.FieldValue.serverTimestamp(),
  });
}

/* ---------------- Function ---------------- */

export const startRegistrationAnalysis = onCall(
  { region: "europe-west9" },
  async (req) => {
    console.log("[startRegistrationAnalysis] called", {
      authed: !!req.auth,
      uid: req.auth?.uid,
      role: getRoleFromClaims(req.auth?.token),
      requestUid: req.data?.requestUid,
    });

    if (!req.auth) throw new HttpsError("unauthenticated", "Connexion requise.");

    const requestUid = requireString(req.data?.requestUid, "requestUid");

    const db = getFirestore();
    const ref = db.collection("client_requests").doc(requestUid);

    if (!canStartAnalysis(req.auth.token)) {
      // visibilité côté doc (best effort)
      try {
        await setAnalysis(ref, {
          "analysis.status": "error",
          "analysis.error": "permission-denied: rôle insuffisant",
          "analysis.updatedBy": req.auth.uid,
        });
      } catch {}
      throw new HttpsError("permission-denied", "Rôle insuffisant.");
    }

    const snap = await ref.get();
    if (!snap.exists) throw new HttpsError("not-found", "Dossier introuvable.");

    const data = snap.data() || {};

    if (data?.analysis?.status === "processing") {
      return { ok: true, status: "processing", message: "Analyse déjà en cours." };
    }

    const docsMap = pickDocs(data);
    if (!docsMap) {
      await setAnalysis(ref, {
        "analysis.status": "error",
        "analysis.error": "Aucun document éligible (kbis/identityCard/proofOfAddress).",
        "analysis.updatedBy": req.auth.uid,
      });
      throw new HttpsError("failed-precondition", "Aucun document éligible.");
    }

    // ✅ processing
    await setAnalysis(ref, {
      "analysis.status": "processing",
      "analysis.updatedBy": req.auth.uid,
      // ✅ suppression correcte: delete top-level
      "analysis.error": admin.firestore.FieldValue.delete(),
    });

    console.log("[startRegistrationAnalysis] processing set", { requestUid });

    try {
      const docsPayload: Array<{ type: string; dataBase64: string; contentType: string }> = [];

      for (const [type, path] of Object.entries(docsMap)) {
        const { base64, contentType } = await downloadAsBase64(path);
        docsPayload.push({ type, dataBase64: base64, contentType });
      }

      const result = await analyzeServerSide({
        requestUid,
        companyName: data.companyName ?? data.name ?? "",
        signatoryName: data.signatoryName ?? data.legalRepresentative ?? "",
        docs: docsPayload,
      });

      await setAnalysis(ref, {
        "analysis.status": "done",
        "analysis.result": result,
        "analysis.updatedBy": req.auth.uid,
      });

      console.log("[startRegistrationAnalysis] done", { requestUid });
      return { ok: true, status: "done" };
    } catch (e: any) {
      const msg = e?.message ? String(e.message) : "Erreur inconnue";

      await setAnalysis(ref, {
        "analysis.status": "error",
        "analysis.error": msg,
        "analysis.updatedBy": req.auth.uid,
      });

      console.error("[startRegistrationAnalysis] error", { requestUid, msg });
      throw new HttpsError("internal", msg);
    }
  }
);