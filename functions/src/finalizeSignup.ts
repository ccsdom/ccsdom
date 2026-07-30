// functions/src/finalizeSignup.ts

import { onCall, HttpsError, CallableRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { SIGNUP_REQUEST_STATUS } from "./_config/signup-constants";

if (!admin.apps.length) admin.initializeApp();

type AddressKey = "paris" | "orly";

const normalizeSiret = (value: unknown) => String(value ?? "").replace(/\D/g, "");
const normalizeEmailLower = (value: unknown) =>
  String(value ?? "").trim().toLowerCase();

function isEmail(value?: string | null) {
  return !!value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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

function toAddressKey(value: unknown): AddressKey | null {
  const v = String(value ?? "").toLowerCase().trim();
  if (v === "paris" || v === "orly") return v;
  return null;
}

function isRejectedStatus(status: unknown) {
  const s = String(status ?? "").toLowerCase().trim();
  return s === SIGNUP_REQUEST_STATUS.REJECTED;
}

function resolveLegalStatus(formData: Record<string, any>): string {
  const legalStatus = String(formData.legalStatus ?? "").trim();
  const otherLegalStatus = String(formData.otherLegalStatus ?? "").trim();

  if (legalStatus === "autres" || legalStatus === "other") {
    return otherLegalStatus || "Autre";
  }

  return legalStatus || otherLegalStatus || "";
}

function sanitizeIncomingFormData(input: Record<string, any>) {
  const data = { ...input };

  delete data.password;
  delete data.currentPassword;
  delete data.confirmPassword;
  delete data.signature;

  return data;
}


export const finalizeSignup = onCall(
  { region: "europe-west9", cors: true },
  async (req: CallableRequest<any>) => {
    try {
      if (!req.auth) {
        throw new HttpsError("unauthenticated", "Auth requise.");
      }

      const uid = req.auth.uid;
      const data = req.data || {};

      const addressKey = toAddressKey(data.addressKey);
      if (!addressKey) {
        throw new HttpsError("invalid-argument", "addressKey invalide.");
      }

      const signatureUrl =
        typeof data.signatureUrl === "string" && data.signatureUrl.trim()
          ? data.signatureUrl.trim()
          : null;

      const rawFormData = (data.formData || data.formValues || {}) as Record<string, any>;
      const formData = sanitizeIncomingFormData(rawFormData);

      const emailLower = normalizeEmailLower(formData.email || formData.emailLower);
      const siretNorm = normalizeSiret(formData.siret);

      if (!emailLower || !isEmail(emailLower)) {
        throw new HttpsError("invalid-argument", "Email invalide.");
      }

      const projectType = String(formData.projectType ?? "").toLowerCase();

      if (projectType === "transfert") {
        if (!siretNorm || siretNorm.length !== 14) {
          throw new HttpsError("invalid-argument", "Le SIRET est obligatoire pour un transfert (14 chiffres).");
        }
      } else {
        // En création, le SIRET n'est pas encore disponible
        if (!siretNorm) {
            // On laisse passer
        } else if (siretNorm.length !== 14) {
             throw new HttpsError("invalid-argument", "Le SIRET doit faire 14 chiffres s'il est renseigné.");
        }
      }

      const db = admin.firestore();
      const now = admin.firestore.FieldValue.serverTimestamp();

      const requestRef = db.doc(`client_requests/${uid}`);
      const requestSnap = await requestRef.get();
      const requestExists = requestSnap.exists;
      const requestData = requestExists
        ? ((requestSnap.data() || {}) as Record<string, any>)
        : {};

      // -------------------------
      // 1) Vérification unicité
      //    - clients existants
      //    - autres demandes non rejetées
      // -------------------------
      const [clientsSiretSnap, clientsEmailSnap, reqSiretSnap, reqEmailSnap] =
        await Promise.all([
          siretNorm 
            ? db.collection("clients").where("siret", "==", siretNorm).limit(5).get()
            : Promise.resolve({ docs: [] } as any),
          db.collection("clients").where("emailLower", "==", emailLower).limit(5).get(),
          siretNorm
            ? db.collection("client_requests").where("siret", "==", siretNorm).limit(5).get()
            : Promise.resolve({ docs: [] } as any),
          db.collection("client_requests").where("emailLower", "==", emailLower).limit(5).get(),
        ]);

      const siretExistsInClients = clientsSiretSnap.docs.some(
        (docSnap: admin.firestore.QueryDocumentSnapshot) => docSnap.id !== uid
      );
      const emailExistsInClients = clientsEmailSnap.docs.some(
        (docSnap: admin.firestore.QueryDocumentSnapshot) => docSnap.id !== uid
      );

      const siretExistsInRequests = reqSiretSnap.docs.some(
        (docSnap: admin.firestore.QueryDocumentSnapshot) =>
          docSnap.id !== uid && !isRejectedStatus(docSnap.data()?.status)
      );

      const emailExistsInRequests = reqEmailSnap.docs.some(
        (docSnap: admin.firestore.QueryDocumentSnapshot) =>
          docSnap.id !== uid && !isRejectedStatus(docSnap.data()?.status)
      );

      const hasSiret = !!siretNorm;

      if (hasSiret && (siretExistsInClients || siretExistsInRequests)) {
        throw new HttpsError("already-exists", "SIRET déjà utilisé.");
      }

      if (emailExistsInClients || emailExistsInRequests) {
        throw new HttpsError("already-exists", "Email déjà utilisé.");
      }

      // -------------------------
      // 2) Payload métier
      // -------------------------
      const legalStatus = resolveLegalStatus(formData);

      const pdfJobs =
        formData.pdfJobs && typeof formData.pdfJobs === "object"
          ? {
              contractId: formData.pdfJobs.contractId || null,
              attestationId: formData.pdfJobs.attestationId || null,
            }
          : {
              contractId: null,
              attestationId: null,
            };

      const firstName = String(formData.firstName ?? "").trim();
      const lastName = String(formData.lastName ?? "").trim();
      const representative =
        String(formData.representative ?? "").trim() ||
        `${firstName} ${lastName}`.trim();

      const companyName = String(formData.companyName ?? "").trim();
      const signedAt =
        String(formData.signedAt ?? "").trim() || new Date().toISOString();

      const docsRequiredCompleted =
        requestData.docsRequiredCompleted === true ||
        requestData.documentsRequiredCompleted === true;

      const paymentConfirmed =
        (requestData.paymentStatus === "paid" ||
          requestData.stripeCheckout?.paymentStatus === "paid") &&
        !!requestData.stripeCheckout?.verifiedAt;

      if (!docsRequiredCompleted) {
        throw new HttpsError(
          "failed-precondition",
          "Les documents requis ne sont pas complets."
        );
      }

      if (!paymentConfirmed) {
        throw new HttpsError(
          "failed-precondition",
          "Le paiement n'est pas encore confirmé."
        );
      }

      // -------------------------
      // 3) Upsert client_requests/{uid} uniquement
      // -------------------------
      const requestPayload = cleanObject({
        ownerUid: uid,
        uid,

        firstName,
        lastName,
        representative,
        companyName,
        name: representative || companyName,

        siret: siretNorm || "En cours d'immatriculation",
        siretNorm: siretNorm || "En cours d'immatriculation",
        siretRaw: formData.siret || "En cours d'immatriculation",

        legalStatus,

        addressId: String(formData.addressId ?? requestData.addressId ?? ""),
        address: String(formData.address ?? requestData.address ?? ""),
        addressKey,
        locationKey: addressKey,

        mailPlanId: String(formData.mailPlanId ?? requestData.mailPlanId ?? ""),
        paymentFrequency: String(
          formData.paymentFrequency ?? requestData.paymentFrequency ?? "monthly"
        ),
        projectType: String(formData.projectType ?? requestData.projectType ?? ""),
        accompanimentType: String(
          formData.accompanimentType ?? requestData.accompanimentType ?? ""
        ),

        phone: String(formData.phone ?? requestData.phone ?? ""),
        email: emailLower,
        emailLower,

        signatureUrl,
        signedAt,
        signatoryName:
          String(formData.signatoryName ?? "").trim() ||
          representative ||
          companyName ||
          "Le domicilié",

        pdfJobs,

        status: SIGNUP_REQUEST_STATUS.PENDING_VALIDATION,
        source: "public_onboarding",
        docsRequiredCompleted,
        documentsRequiredCompleted: docsRequiredCompleted,
        paymentStatus: "paid",

        updatedAt: now,
        ...(requestExists ? {} : { createdAt: now }),
      });

      await requestRef.set(requestPayload, { merge: true });

      logger.info("[finalizeSignup] OK", {
        uid,
        addressKey,
        emailLower,
        hasPdfJobs: !!(pdfJobs.contractId || pdfJobs.attestationId),
        requestOnly: true,
      });

      return {
        ok: true,
        uid,
        requestUid: uid,
      };
    } catch (error: any) {
      logger.error("[finalizeSignup] ERROR", {
        message: error?.message ?? String(error),
        stack: error?.stack,
        code: error?.code,
      });

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError("internal", "Erreur serveur finalizeSignup", {
        details: error?.message ?? String(error),
      });
    }
  }
);