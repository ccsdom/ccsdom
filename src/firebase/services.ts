'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getFunctions, Functions } from 'firebase/functions';
import { initializeAppCheck, ReCaptchaV3Provider, AppCheck } from 'firebase/app-check';
import 'firebase/storage';

const storageBucket =
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET === "bizhome-hub-ccsdom" ||
  !process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    ? "bizhome-hub.firebasestorage.app"
    : process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: storageBucket || "bizhome-hub.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const mainApp: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

let appCheck: AppCheck | undefined;

const APPCHECK_SITE_KEY_PLACEHOLDER = '___REMPLACE_MOI_PAR_TA_CLE_DE_SITE_RECAPTCHA_V3___';

function getConfiguredAppCheckSiteKey(): string | null {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY?.trim();

  if (!siteKey || siteKey === APPCHECK_SITE_KEY_PLACEHOLDER) {
    return null;
  }

  return siteKey;
}

if (typeof window !== 'undefined') {
  if (process.env.NEXT_PUBLIC_APPCHECK_DEBUG === 'true') {
    // @ts-expect-error debug token
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }

  const siteKey = getConfiguredAppCheckSiteKey();

  if (siteKey) {
    appCheck = initializeAppCheck(mainApp, {
      provider: new ReCaptchaV3Provider(siteKey),
      isTokenAutoRefreshEnabled: true,
    });
  } else if (process.env.NODE_ENV !== 'production') {
    console.warn(
      '[Firebase] App Check non initialise : NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY est absente ou factice.'
    );
  }
}

const mainAuth: Auth = getAuth(mainApp);
mainAuth.languageCode = 'fr';
const mainFirestore: Firestore = getFirestore(mainApp);
const mainStorage: FirebaseStorage = getStorage(mainApp);
const mainFunctions: Functions = getFunctions(mainApp, "europe-west9");

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'select_account',
});
const payments = null;

const pdfApp: FirebaseApp =
  getApps().find((app) => app.name === 'pdfApp') || initializeApp(firebaseConfig, 'pdfApp');

const firestorePDF: Firestore = getFirestore(pdfApp);

export function initializeFirebase(): {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  storage: FirebaseStorage;
  functions: Functions;
  googleProvider: GoogleAuthProvider;
  payments: any;
  firestorePDF: Firestore;
  appCheck?: AppCheck;
} {
  return {
    firebaseApp: mainApp,
    auth: mainAuth,
    firestore: mainFirestore,
    storage: mainStorage,
    functions: mainFunctions,
    googleProvider,
    payments,
    firestorePDF,
    appCheck,
  };
}
