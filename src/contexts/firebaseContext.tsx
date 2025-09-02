import React, {
  createContext,
  useEffect,
  useReducer,
  FC,
  PropsWithChildren,
  useState,
  useMemo,
} from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported as analyticsIsSupported } from "firebase/analytics";
import {
  User,
  getAuth,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
} from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

import { SplashScreen } from "@/components/splash-screen";

/** Config via .env (fallbacks inclus) */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "AIzaSyD3E8RoBhtmEZf3ndXUWYu2D4A6mWPcOPQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "ccs-dom.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "ccs-dom",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "ccs-dom.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "792909282256",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "1:792909282256:web:9d24c3f807950bfe3617d5",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? "G-BQNP048JD4",
};

// Évite la double init
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Analytics seulement si supporté (évite erreurs)
(async () => {
  try {
    if (typeof window !== "undefined" && (await analyticsIsSupported())) {
      getAnalytics(app);
    }
  } catch {
    /* ignore */
  }
})();

// Services
export const auth = getAuth(app);
const db = getFirestore(app);

/** State & Contexte */
interface INITIAL_AUTH_STATE {
  user: null | (User & { role: string; avatar?: string; name?: string });
  isInitialized: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends INITIAL_AUTH_STATE {
  method: "FIREBASE";
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<any>;
  signInWithEmail: (email: string, password: string) => Promise<any>;
  createUserWithEmail: (email: string, password: string) => Promise<any>;
  authError: string | null;
}

const initialAuthState: INITIAL_AUTH_STATE = {
  user: null,
  isInitialized: false,
  isAuthenticated: false,
};

type Action =
  | {
      type: "AUTH_STATE_CHANGED";
      payload: { isAuthenticated: boolean; user: INITIAL_AUTH_STATE["user"] };
    };

const reducer = (state: INITIAL_AUTH_STATE, action: Action): INITIAL_AUTH_STATE => {
  switch (action.type) {
    case "AUTH_STATE_CHANGED":
      return {
        ...state,
        isAuthenticated: action.payload.isAuthenticated,
        user: action.payload.user,
        isInitialized: true,
      };
    default:
      return state;
  }
};

export const AuthContext = createContext<AuthContextType>({
  ...initialAuthState,
  method: "FIREBASE",
  logout: async () => {},
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  createUserWithEmail: async () => {},
  authError: null,
});

/** Provider */

// Active l’auto-login anonyme en dev (désactive en prod si besoin)
const ENABLE_AUTO_ANON = true;

export const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialAuthState);
  const [authError, setAuthError] = useState<string | null>(null);

  const signInWithEmail = async (email: string, password: string) => {
    setAuthError(null);
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setAuthError(error.message);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    return await signInWithPopup(auth, provider);
  };

  const createUserWithEmail = async (email: string, password: string) => {
    setAuthError(null);
    try {
      return await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setAuthError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    setAuthError(null);
    return await signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      // Auto connexion anonyme en dev/test
      if (!u && ENABLE_AUTO_ANON) {
        try {
          await signInAnonymously(auth);
          return;
        } catch (e) {
          console.error("[Auth] signInAnonymously failed:", e);
        }
      }

      if (u) {
        try {
          const userDocRef = doc(db, "users", u.uid);
          const userSnap = await getDoc(userDocRef);
          const userData = userSnap.exists() ? userSnap.data() : null;
          const role = (userData as any)?.role || "client";

          dispatch({
            type: "AUTH_STATE_CHANGED",
            payload: {
              isAuthenticated: true,
              user: {
                ...u,
                role,
                email: u.email ?? null,          // ⬅️ string | null
                avatar: u.photoURL ?? undefined, // ⬅️ string | undefined (ok)
                name: u.displayName || u.email || "Utilisateur",
              },
            },
          });
        } catch (error) {
          console.error("Erreur récupération rôle utilisateur :", error);
          dispatch({
            type: "AUTH_STATE_CHANGED",
            payload: {
              isAuthenticated: true,
              user: {
                ...u,
                role: "client",
                email: u.email ?? null,          // ⬅️ string | null
                avatar: u.photoURL ?? undefined,
                name: u.displayName || u.email || "Utilisateur",
              },
            },
          });
        }
      } else {
        dispatch({
          type: "AUTH_STATE_CHANGED",
          payload: { isAuthenticated: false, user: null },
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      ...state,
      method: "FIREBASE",
      logout,
      signInWithEmail,
      signInWithGoogle,
      createUserWithEmail,
      authError,
    }),
    [state, authError]
  );

  if (!state.isInitialized) return <SplashScreen />;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
