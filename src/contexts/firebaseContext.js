import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useEffect, useReducer, useState, } from "react";
import { initializeApp, getApps, getApp, } from "firebase/app";
import { getAnalytics, } from "firebase/analytics";
import { getAuth, signOut, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { SplashScreen } from "@/components/splash-screen";
// ✅ CONFIGURATION DIRECTE
const firebaseConfig = {
    apiKey: "AIzaSyD3E8RoBhtmEZf3ndXUWYu2D4A6mWPcOPQ",
    authDomain: "ccs-dom.firebaseapp.com",
    projectId: "ccs-dom",
    storageBucket: "ccs-dom.firebasestorage.app",
    messagingSenderId: "792909282256",
    appId: "1:792909282256:web:9d24c3f807950bfe3617d5",
    measurementId: "G-BQNP048JD4",
};
// ✅ Initialisation sans duplication
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
getAnalytics(app);
export const auth = getAuth(app);
const db = getFirestore(app);
const initialAuthState = {
    user: null,
    isInitialized: false,
    isAuthenticated: false,
};
const reducer = (state, action) => {
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
// ✅ Création du Contexte avec valeur par défaut
export const AuthContext = createContext({
    ...initialAuthState,
    method: "FIREBASE",
    logout: async () => { },
    signInWithGoogle: async () => { },
    signInWithEmail: async () => { },
    createUserWithEmail: async () => { },
    authError: null,
});
// ✅ Provider principal
export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialAuthState);
    const [authError, setAuthError] = useState(null);
    const signInWithEmail = async (email, password) => {
        setAuthError(null);
        try {
            return await signInWithEmailAndPassword(auth, email, password);
        }
        catch (error) {
            setAuthError(error.message);
            throw error;
        }
    };
    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        return await signInWithPopup(auth, provider);
    };
    const createUserWithEmail = async (email, password) => {
        setAuthError(null);
        try {
            return await createUserWithEmailAndPassword(auth, email, password);
        }
        catch (error) {
            setAuthError(error.message);
            throw error;
        }
    };
    const logout = async () => {
        setAuthError(null);
        return await signOut(auth);
    };
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    // Récupérer rôle Firestore
                    const userDocRef = doc(db, "users", user.uid);
                    const userDocSnap = await getDoc(userDocRef);
                    const userData = userDocSnap.exists() ? userDocSnap.data() : null;
                    const role = userData?.role || "client"; // rôle par défaut client
                    const payload = {
                        isAuthenticated: true,
                        user: {
                            ...user,
                            id: user.uid,
                            role,
                            email: user.email,
                            avatar: user.photoURL ?? undefined,
                            name: user.displayName || user.email || "Utilisateur",
                        },
                    };
                    dispatch({ type: "AUTH_STATE_CHANGED", payload });
                }
                catch (error) {
                    console.error("Erreur récupération rôle utilisateur :", error);
                    // Même si erreur, on authentifie avec rôle client par défaut
                    dispatch({
                        type: "AUTH_STATE_CHANGED",
                        payload: {
                            isAuthenticated: true,
                            user: {
                                ...user,
                                id: user.uid,
                                role: "client",
                                email: user.email,
                                avatar: user.photoURL ?? undefined,
                                name: user.displayName || user.email || "Utilisateur",
                            },
                        },
                    });
                }
            }
            else {
                dispatch({
                    type: "AUTH_STATE_CHANGED",
                    payload: { isAuthenticated: false, user: null },
                });
            }
        });
        return () => unsubscribe();
    }, []);
    if (!state.isInitialized)
        return _jsx(SplashScreen, {});
    return (_jsx(AuthContext.Provider, { value: {
            ...state,
            method: "FIREBASE",
            logout,
            signInWithEmail,
            signInWithGoogle,
            createUserWithEmail,
            authError,
        }, children: children }));
};
