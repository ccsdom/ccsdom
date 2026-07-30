import { getAuth, signInAnonymously, type User } from "firebase/auth";
import { getDownloadURL, getStorage, ref, uploadString } from "firebase/storage";
import type { FirebaseApp } from "firebase/app";

import type { SignupAddressKey } from "@/features/signup/config";
import { safe } from "@/features/signup/contract.utils";

export async function ensureSignupAuth(firebaseApp: FirebaseApp): Promise<User> {
  const auth = getAuth(firebaseApp);

  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }

  if (!auth.currentUser) {
    throw new Error("Auth anonyme indisponible.");
  }

  return auth.currentUser;
}

export async function downscaleSignatureDataUrl(
  dataUrl: string,
  maxWidth = 600,
  maxHeight = 200
): Promise<string> {
  const image = new Image();
  image.src = dataUrl;
  await image.decode();

  const ratio = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
  if (ratio >= 1) return dataUrl;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * ratio);
  canvas.height = Math.round(image.height * ratio);

  const context = canvas.getContext("2d");
  if (!context) return dataUrl;

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}

type UploadSignatureArgs = {
  firebaseApp: FirebaseApp;
  signatureDataUrl: string;
  userEmail: string;
  addressKey: SignupAddressKey;
};

export async function uploadSignatureToFirebase({
  firebaseApp,
  signatureDataUrl,
  userEmail,
  addressKey,
}: UploadSignatureArgs): Promise<string> {
  const storage = getStorage(firebaseApp);
  const user = await ensureSignupAuth(firebaseApp);

  const fileName = `signatures/${addressKey}/${user.uid}/${safe(userEmail)}-${Date.now()}.png`;
  const fileRef = ref(storage, fileName);

  await uploadString(fileRef, signatureDataUrl, "data_url", {
    contentType: "image/png",
  } as any);

  return getDownloadURL(fileRef);
}