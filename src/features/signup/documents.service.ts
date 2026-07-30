import { getAuth, signInAnonymously, type User } from "firebase/auth";
import {
  getStorage,
  ref,
  uploadBytes,
  uploadBytesResumable,
  type UploadTaskSnapshot,
} from "firebase/storage";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import type { FirebaseApp } from "firebase/app";
import type { Firestore } from "firebase/firestore";

import {
  SIGNUP_ALLOWED_DOCUMENT_TYPES,
  SIGNUP_DOCUMENT_MAX_BYTES,
  type SignupDocType,
} from "@/features/signup/config";

export type UploadProgressMap = Record<SignupDocType, number>;
export type UploadBusyMap = Record<SignupDocType, boolean>;
export type UploadErrorMap = Record<SignupDocType, string | null>;
export type UploadedPathMap = Record<SignupDocType, string>;

export const INITIAL_UPLOAD_PROGRESS: UploadProgressMap = {
  kbis: 0,
  identityCard: 0,
  proofOfAddress: 0,
};

export const INITIAL_UPLOAD_BUSY: UploadBusyMap = {
  kbis: false,
  identityCard: false,
  proofOfAddress: false,
};

export const INITIAL_UPLOAD_ERRORS: UploadErrorMap = {
  kbis: null,
  identityCard: null,
  proofOfAddress: null,
};

export const INITIAL_UPLOADED_PATHS: UploadedPathMap = {
  kbis: "",
  identityCard: "",
  proofOfAddress: "",
};

export async function ensureSignupAnonymousAuth(
  firebaseApp: FirebaseApp
): Promise<User> {
  const auth = getAuth(firebaseApp);

  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }

  if (!auth.currentUser) {
    throw new Error("Session anonyme indisponible.");
  }

  return auth.currentUser;
}

export function validateSignupDocumentFile(file: File): string | null {
  if (!SIGNUP_ALLOWED_DOCUMENT_TYPES.includes(file.type as never)) {
    return "Format non supporté (PDF, PNG, JPG, WEBP uniquement).";
  }

  if (file.size > SIGNUP_DOCUMENT_MAX_BYTES) {
    return `Fichier trop volumineux (max. ${Math.round(
      SIGNUP_DOCUMENT_MAX_BYTES / 1024 / 1024
    )} Mo).`;
  }

  return null;
}

function randomId() {
  if (typeof crypto?.randomUUID === "function") return crypto.randomUUID();

  const arr = new Uint32Array(2);
  if (typeof crypto?.getRandomValues === "function") {
    crypto.getRandomValues(arr);
  }

  return `${Date.now().toString(36)}-${(arr[0] || Math.random() * 1e9).toString(
    36
  )}${(arr[1] || Math.random() * 1e9).toString(36)}`;
}

type UploadArgs = {
  firebaseApp: FirebaseApp;
  requestUid: string;
  email: string;
  docType: SignupDocType;
  file: File;
  onProgress?: (progress: number) => void;
};

export async function uploadSignupDocument({
  firebaseApp,
  requestUid,
  email,
  docType,
  file,
  onProgress,
}: UploadArgs): Promise<string> {
  const user = await ensureSignupAnonymousAuth(firebaseApp);
  await user.getIdToken(); // Force l'injection du token frais pour Storage

  if (user.uid !== requestUid) {
    throw new Error(
      `Conflit de session détecté (votre identifiant a changé). Reprenez l'inscription.`
    );
  }

  const storage = getStorage(firebaseApp);
  const baseDir = `documents/${requestUid}/${docType}`;

  const makeRef = () => {
    const safeName = file.name.replace(/\s+/g, "_");
    const unique = `${Date.now()}-${randomId()}-${safeName}`;
    const fullPath = `${baseDir}/${unique}`;

    return {
      fullPath,
      refObj: ref(storage, fullPath),
    };
  };

  const resumable = async () => {
    const { fullPath, refObj } = makeRef();
    const contentType = file.type || (file.name.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/jpeg");

    const task = uploadBytesResumable(refObj, file, {
      contentType,
      customMetadata: {
        requestUid,
        ownerUid: user.uid,
        docType,
        source: "inscription",
        uploadedBy: email || "inconnu",
        originalName: file.name,
      },
    });

    await new Promise<void>((resolve, reject) => {
      task.on(
        "state_changed",
        (snapshot: UploadTaskSnapshot) => {
          const pct = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          onProgress?.(pct);
        },
        reject,
        resolve
      );
    });

    return fullPath;
  };

  const nonResumable = async () => {
    const { fullPath, refObj } = makeRef();
    const contentType = file.type || (file.name.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/jpeg");

    await uploadBytes(refObj, file, {
      contentType,
      customMetadata: {
        requestUid,
        ownerUid: user.uid,
        docType,
        source: "inscription",
        uploadedBy: email || "inconnu",
        originalName: file.name,
      },
    });

    onProgress?.(100);
    return fullPath;
  };

  try {
    return await resumable();
  } catch (error: any) {
    const text = `${error?.serverResponse || ""} ${error?.message || ""}`;

    if (/412|Precondition/i.test(text)) {
      try {
        return await resumable();
      } catch {
        return await nonResumable();
      }
    }

    return await nonResumable();
  }
}

type PersistArgs = {
  db: Firestore;
  requestUid: string;
  ownerUid: string;
  docType: SignupDocType;
  file: File;
  uploadedPath: string;
};

export async function persistSignupDocumentMetadata({
  db,
  requestUid,
  ownerUid,
  docType,
  file,
  uploadedPath,
}: PersistArgs) {
  await setDoc(
    doc(db, "client_requests", requestUid),
    {
      ownerUid,
      documents: {
        [docType]: uploadedPath,
      },
      documentsUploadMeta: {
        [docType]: {
          contentType: file.type,
          size: file.size,
          uploadedAt: serverTimestamp(),
        },
      },
      lastUploadedDocType: docType,
      status: "documents_partial",
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

function readLegacyDocumentPath(data: Record<string, any>, docType: SignupDocType) {
  const legacyKey = `documents.${docType}`;
  const value = data?.[legacyKey];
  return typeof value === "string" ? value : "";
}

export async function loadExistingSignupDocuments(
  db: Firestore,
  requestUid: string
): Promise<UploadedPathMap> {
  const snapshot = await getDoc(doc(db, "client_requests", requestUid));

  if (!snapshot.exists()) {
    return { ...INITIAL_UPLOADED_PATHS };
  }

  const data = snapshot.data() as Record<string, any>;
  const docs =
    data?.documents && typeof data.documents === "object"
      ? (data.documents as Partial<UploadedPathMap>)
      : {};

  return {
    kbis:
      String(docs.kbis ?? "").trim() ||
      readLegacyDocumentPath(data, "kbis"),
    identityCard:
      String(docs.identityCard ?? "").trim() ||
      readLegacyDocumentPath(data, "identityCard"),
    proofOfAddress:
      String(docs.proofOfAddress ?? "").trim() ||
      readLegacyDocumentPath(data, "proofOfAddress"),
  };
}

export function areRequiredSignupDocumentsComplete(
  uploadedPath: UploadedPathMap,
  requiredTypes: SignupDocType[]
): boolean {
  return requiredTypes.every((docType) => !!uploadedPath[docType]);
}

type MarkReadyArgs = {
  db: Firestore;
  requestUid: string;
};

export async function markSignupDocumentsReady({
  db,
  requestUid,
}: MarkReadyArgs) {
  await setDoc(
    doc(db, "client_requests", requestUid),
    {
      docsRequiredCompleted: true,
      status: "docs_ready",
      docsReadyAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}