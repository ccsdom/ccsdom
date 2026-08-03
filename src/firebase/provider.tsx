'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect, useRef } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, doc, onSnapshot } from 'firebase/firestore';
import { FirebaseStorage } from 'firebase/storage';
import { Functions } from 'firebase/functions';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener'
import { GoogleAuthProvider } from 'firebase/auth';

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  storage: FirebaseStorage;
  auth: Auth;
  functions: Functions;
  googleProvider: GoogleAuthProvider;
  payments: any;
}

interface UserAuthState {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

const normalizeClaimArray = (value: unknown): string[] => {
  const raw = Array.isArray(value) ? value : value ? [value] : [];
  return Array.from(new Set(raw.map((item) => String(item).trim()).filter(Boolean))).sort();
};

export interface FirebaseContextState {
  areServicesAvailable: boolean;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  storage: FirebaseStorage | null;
  auth: Auth | null;
  functions: Functions | null;
  googleProvider: GoogleAuthProvider | null;
  payments: any | null;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface FirebaseServicesAndUser {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  storage: FirebaseStorage;
  auth: Auth;
  functions: Functions;
  googleProvider: GoogleAuthProvider;
  payments: any | null;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface UserHookResult {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  storage,
  auth,
  functions,
  googleProvider,
  payments,
}) => {
  const lastTokenRefreshProfileKey = useRef<string | null>(null);
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true,
    userError: null,
  });
  
  useEffect(() => {
    if (!auth) {
      setUserAuthState({ user: null, isUserLoading: false, userError: new Error("Auth service not provided.") });
      return;
    }

    setUserAuthState({ user: null, isUserLoading: true, userError: null });

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null });
      },
      (error) => {
        console.error("FirebaseProvider: onAuthStateChanged error:", error);
        setUserAuthState({ user: null, isUserLoading: false, userError: error });
      }
    );
    return () => unsubscribe();
  }, [auth]);

  // --- REFRESH TOKEN EFFECT ---
  // Observe le document 'users/{uid}' pour detecter un changement de role
  // et force un rafraichissement unique des Custom Claims sans reconnexion.
  useEffect(() => {
    const user = userAuthState.user;
    if (!user || !firestore) return;

    lastTokenRefreshProfileKey.current = null;

    const userDocRef = doc(firestore, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, async (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();

      try {
        const idTokenResult = await user.getIdTokenResult();
        const currentClaimRole = idTokenResult.claims.role;
        const currentClaimAddress = idTokenResult.claims.managedAddressId;
        const currentClaimCenters = normalizeClaimArray(idTokenResult.claims.managedCenterIds);
        const firestoreCenters = normalizeClaimArray(data.managedCenterIds);
        const centersChanged = currentClaimCenters.join("|") !== firestoreCenters.join("|");

        // Si divergence entre Firestore et le Token
        if (data.role !== currentClaimRole || data.managedAddressId !== currentClaimAddress || centersChanged) {
          const profileKey = [
            user.uid,
            String(data.role ?? ""),
            String(data.managedAddressId ?? ""),
            firestoreCenters.join("|"),
          ].join("::");

          if (lastTokenRefreshProfileKey.current === profileKey) return;
          lastTokenRefreshProfileKey.current = profileKey;

          console.log(`[FirebaseProvider] Role/Address update detected for ${user.uid}. Refreshing token...`);
          // Force une seule actualisation du token pour cette version du profil.
          await user.getIdToken(true);
          console.log(`[FirebaseProvider] Token refreshed successfully.`);
        }
      } catch (err) {
        console.error("[FirebaseProvider] Error checking/refreshing token claims:", err);
      }
    });

    return () => unsubscribe();
  }, [userAuthState.user, firestore]);

  const contextValue = useMemo((): FirebaseContextState => {
    const servicesAvailable = !!(firebaseApp && firestore && auth && storage && googleProvider);
    return {
      areServicesAvailable: servicesAvailable,
      firebaseApp: servicesAvailable ? firebaseApp : null,
      firestore: servicesAvailable ? firestore : null,
      storage: servicesAvailable ? storage : null,
      auth: servicesAvailable ? auth : null,
      functions: servicesAvailable ? functions : null,
      googleProvider: servicesAvailable ? googleProvider : null,
      payments: servicesAvailable ? payments : null,
      user: userAuthState.user,
      isUserLoading: userAuthState.isUserLoading,
      userError: userAuthState.userError,
    };
  }, [firebaseApp, firestore, storage, auth, functions, googleProvider, payments, userAuthState]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = (): FirebaseServicesAndUser => {
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }

  if (!context.areServicesAvailable || !context.firebaseApp || !context.firestore || !context.auth || !context.storage || !context.functions || !context.googleProvider) {
    throw new Error('Firebase core services not available. Check FirebaseProvider props.');
  }

  return {
    firebaseApp: context.firebaseApp,
    firestore: context.firestore,
    storage: context.storage,
    auth: context.auth,
    functions: context.functions!,
    googleProvider: context.googleProvider,
    payments: context.payments,
    user: context.user,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
  };
};

export const useAuth = (): Auth | null => {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within a FirebaseProvider");
    }
    return context.auth;
};

export const useDb = (): Firestore | null => {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
        throw new Error("useDb must be used within a FirebaseProvider");
    }
    return context.firestore;
};

export const useFunctions = (): Functions | null => {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
        throw new Error("useFunctions must be used within a FirebaseProvider");
    }
    return context.functions;
};

export const useStorage = (): FirebaseStorage | null => {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
        throw new Error("useStorage must be used within a FirebaseProvider");
    }
    return context.storage;
};

export const useGoogleProvider = (): GoogleAuthProvider | null => {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
        throw new Error("useGoogleProvider must be used within a FirebaseProvider");
    }
    return context.googleProvider;
};

export const usePayments = (): any | null => {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
        throw new Error("usePayments must be used within a FirebaseProvider");
    }
    return context.payments;
};


type MemoFirebase <T> = T & {__memo?: boolean};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | (MemoFirebase<T>) {
  const memoized = useMemo(factory, deps);
  
  if(typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoFirebase<T>).__memo = true;
  
  return memoized;
}

export const useUser = (): UserHookResult => {
  const { user, isUserLoading, userError } = useFirebase();
  return { user, isUserLoading, userError };
};
