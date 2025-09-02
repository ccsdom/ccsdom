// src/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD3E8RoBhtmEZf3ndXUWYu2D4A6mWPcOPQ",
  authDomain: "ccs-dom.firebaseapp.com",
  projectId: "ccs-dom",
  storageBucket: "ccs-dom.firebasestorage.app",
  messagingSenderId: "792909282256",
  appId: "1:792909282256:web:9d24c3f807950bfe3617d5",
  measurementId: "G-BQNP048JD4",
};

// Initialise Firebase si ce n’est pas déjà fait (évite double init)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export des services Firebase
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
