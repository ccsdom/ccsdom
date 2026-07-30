// src/services/signup-service.ts

import { httpsCallable, Functions } from "firebase/functions";
import {
  Auth,
  User,
  signInAnonymously,
} from "firebase/auth";
import {
  Firestore,
  collection,
  addDoc,
  getDoc,
  serverTimestamp,
  doc,
  setDoc,
} from "firebase/firestore";
import type { FirebaseStorage } from "firebase/storage";

import { mailPlans, expertAccompanimentPlans } from "@/lib/plans";
import { allAddresses } from "@/lib/addresses";
import type { SignupFormValues } from "@/features/signup/config";
import {
  normalizeEmailLower,
  normalizeSiret,
} from "@/features/signup/contract.utils";
import {
  resolveAddressKeyFromForm,
  resolveLegalStatus,
} from "@/features/signup/config";

// ----------------------
// Types métiers
// ----------------------

export type CompanySearchItem = {
  address: string;
  name: string;
  siret: string;
  legalStatus?: string;
  shareCapital?: number;
  director?: string;
};

interface FirebaseServices {
  auth: Auth | null;
  db: Firestore | null;
  storage: FirebaseStorage | null;
  functions: Functions | null;
  payments?: any | null;
  onCheckoutUrl?: (url: string) => void;
}

// ----------------------
// Fonctions API AI / INSEE
// ----------------------

export async function suggestCompanyNames(
  data: { activityDescription: string },
  functions: Functions
) {
  if (!functions) {
    throw new Error("Le service des fonctions n'est pas disponible.");
  }

  const fn = httpsCallable(functions, "suggestCompanyName");
  const result = await fn(data);
  return result.data as { suggestions: string[] };
}

export async function checkCompanyName(
  data: { companyName: string },
  functions: Functions
) {
  if (!functions) {
    throw new Error("Le service des fonctions n'est pas disponible.");
  }

  const fn = httpsCallable(functions, "checkCompanyName");
  const result = await fn(data);
  return result.data as { isAvailable: boolean; reason?: string };
}

export async function searchCompany(
  data: { query: string }
): Promise<CompanySearchItem[]> {
  try {
    const response = await fetch(
      `https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(
        data.query
      )}&per_page=5`
    );

    if (!response.ok) {
      console.error(`[searchCompany] API error: ${response.statusText}`);
      return [];
    }

    const apiData = await response.json();
    const results: any[] = Array.isArray(apiData?.results) ? apiData.results : [];

    return results.map((company: any): CompanySearchItem => {
      const dirigeant = company.dirigeants?.[0];
      const directorName = dirigeant
        ? [dirigeant.prenoms, dirigeant.nom].filter(Boolean).join(" ")
        : "N/A";

      return {
        name: company.nom_complet || "N/A",
        siret: company.siege?.siret || "N/A",
        address: company.siege?.adresse || "N/A",
        legalStatus: company.forme_juridique || "N/A",
        shareCapital: company.capital_social,
        director: directorName,
      };
    });
  } catch (error) {
    console.error("[searchCompany] Failed to fetch company data:", error);
    return [];
  }
}

// ----------------------
// Helper onboarding : session auth temporaire
// - on conserve l'utilisateur anonyme pendant tout le tunnel
// - on ne crée PAS le vrai compte client ici
// ----------------------

async function ensureCheckoutAuth(
  auth: Auth
): Promise<User> {
  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }

  if (!auth.currentUser) {
    throw new Error("Impossible d'initialiser la session d'inscription.");
  }

  return auth.currentUser;
}

// ----------------------
// Legacy helper conservé pour compatibilité
// - ne crée plus clients/{uid}
// - ne crée plus de vrai compte Firebase Auth
// ----------------------

export async function handleCreateUserAndClient(
  data: SignupFormValues,
  services: Pick<FirebaseServices, "auth" | "db" | "storage" | "functions">
): Promise<User> {
  const { auth, db } = services;

  if (!auth || !db) {
    throw new Error("Firebase Auth ou Firestore indisponible.");
  }

  const user = await ensureCheckoutAuth(auth);
  const email = normalizeEmailLower(data.email);

  if (email) {
    await setDoc(
      doc(db, "customers", user.uid),
      {
        email,
        createdAt: serverTimestamp(),
        source: "public_onboarding",
      },
      { merge: true }
    );
  }

  return user;
}

// ----------------------
// Paiement : redirectToCheckout via Cloud Function Stripe
// - ne crée plus de vrai user
// - ne crée plus de doc clients/{uid}
// - écrit uniquement dans client_requests/{requestUid}
// ----------------------

export async function redirectToCheckout(
  data: SignupFormValues,
  onError: (error: unknown) => void,
  services: FirebaseServices
): Promise<{ checkoutUrl: string; sessionId: string | null } | null> {
  const { auth, db, functions } = services;

  if (!auth || !db) {
    onError(new Error("Firebase Auth ou Firestore n'est pas disponible."));
    return null;
  }

  try {
    if (!functions) {
      throw new Error("Cloud Functions non disponible.");
    }

    const currentUser = await ensureCheckoutAuth(auth);

    const mailPlanId = String(data.mailPlanId ?? "business");
    const accompanimentType = String(data.accompanimentType ?? "");
    const paymentFrequency = (data.paymentFrequency || "monthly") as
      | "monthly"
      | "yearly";
    const projectType = (data.projectType || "creation") as
      | "creation"
      | "transfert";

    const mailPlan = mailPlans.find((plan) => plan.id === mailPlanId);

    const accomPlan =
      accompanimentType.startsWith("expert_") &&
      expertAccompanimentPlans[
        projectType === "transfert" ? "transfert" : "creation"
      ]
        ? expertAccompanimentPlans[
            projectType === "transfert" ? "transfert" : "creation"
          ]
        : null;

    const lineItems: Array<{ price: string; quantity: number }> = [];

    if (mailPlan?.stripeMonthlyPriceId) {
      const priceId =
        paymentFrequency === "yearly"
          ? mailPlan.stripeYearlyPriceId
          : mailPlan.stripeMonthlyPriceId;

      if (priceId) {
        lineItems.push({ price: priceId, quantity: 1 });
      }
    }

    if (accomPlan?.stripePriceId) {
      lineItems.push({ price: accomPlan.stripePriceId, quantity: 1 });
    }

    if (lineItems.length === 0) {
      throw new Error(
        "Aucun prix Stripe n'est configuré pour cette offre. Vérifiez les price IDs Stripe des plans."
      );
    }

    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://ccsdom.fr";

    const successUrl = `${origin}/signup?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/signup?cancelled=1`;

    const createSessionFn = httpsCallable(
      functions,
      "createStripeCheckoutSession"
    );

    const email = normalizeEmailLower(data.email);
    const requestUid = String(data.requestUid ?? "").trim() || currentUser.uid;
    const addressKey = resolveAddressKeyFromForm(data, "orly");
    const addressId = String(data.addressId ?? "");
    const legalStatus = resolveLegalStatus(
      String(data.legalStatus ?? ""),
      String(data.otherLegalStatus ?? "")
    );

    const requestRef = doc(db, "client_requests", requestUid);
    const requestSnap = await getDoc(requestRef);

    await setDoc(
      requestRef,
      {
        ownerUid: currentUser.uid,
        uid: currentUser.uid,
        email,
        emailLower: email,
        siret: normalizeSiret(data.siret),
        centerId: addressId,
        addressId,
        address: String(data.address ?? ""),
        addressKey,
        locationKey: addressKey,
        companyName: String(data.companyName ?? ""),
        firstName: String(data.firstName ?? ""),
        lastName: String(data.lastName ?? ""),
        phone: String(data.phone ?? ""),
        projectType,
        legalStatus,
        paymentFrequency,
        mailPlanId,
        accompanimentType,
        status: "payment_pending",
        paymentStatus: "pending",
        updatedAt: serverTimestamp(),
        ...(requestSnap.exists() ? {} : { createdAt: serverTimestamp() }),
      },
      { merge: true }
    );

    const result = await createSessionFn({
      lineItems,
      successUrl,
      cancelUrl,
      customerEmail: email,
      clientReferenceId: currentUser.uid,
      metadata: {
        requestUid,
        centerId: addressId,
        addressId,
        addressKey,
        mailPlanId,
        paymentFrequency,
        accompanimentType,
        projectType,
        uid: currentUser.uid,
      },
    });

    const response = result.data as any;

    if (!response?.url) {
      throw new Error("createStripeCheckoutSession n'a pas renvoyé d'URL.");
    }

    const checkoutUrl = String(response.url);
    const sessionId = String(response.sessionId ?? "").trim() || null;
    services.onCheckoutUrl?.(checkoutUrl);

    return { checkoutUrl, sessionId };
  } catch (error) {
    console.error("[redirectToCheckout] erreur globale:", error);
    onError(error);
    return null;
  }
}

// ----------------------
// Génération du contrat (ancien flux PDF extension)
// ----------------------

export async function handleContractAndUserCreation(
  data: SignupFormValues,
  onError: (error: unknown) => void,
  onSuccess: () => void,
  services: Pick<FirebaseServices, "auth" | "db" | "storage">
) {
  const { auth, db, storage } = services;
  if (!auth || !db) return;

  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("Utilisateur non authentifié.");
    }
    if (!storage) {
      throw new Error("Storage requis pour sauvegarder le contrat.");
    }

    const selectedAddress = allAddresses.find(
      (address) => address.id === String(data.addressId ?? "")
    );
    if (!selectedAddress) {
      throw new Error("Adresse de domiciliation non trouvée.");
    }

    const pdfRequestData = {
      template: "contract-template.html",
      outputName: `contrat_domiciliation_${String(data.companyName ?? "")
        .replace(/ /g, "_")
        .toLowerCase()}_${Date.now()}.pdf`,
      data: { ...data },
      pdfOptions: {
        headerTemplate: `<div style="width:100%; text-align:center; padding: 10px; font-size:10px;"><img src="https://firebasestorage.googleapis.com/v0/b/bizhome-hub.firebasestorage.app/o/logo.png?alt=media&token=33433398-f7b6-4524-8968-984441584b39" style="height: 30px; margin: auto;" alt="logo"/></div>`,
        footerTemplate: `<div style="width:100%; text-align:center; padding: 10px; font-size:8px;">${selectedAddress.companyName} - ${selectedAddress.companyRcs} - Page <span class="pageNumber"></span> / <span class="totalPages"></span></div>`,
        displayHeaderFooter: true,
        margin: {
          top: "50px",
          bottom: "50px",
          left: "25px",
          right: "25px",
        },
      },
      storage: {
        path: `contracts/${user.uid}/contract_${user.uid}.pdf`,
        metadata: {
          contentType: "application/pdf",
          customMetadata: {
            userId: user.uid,
            clientId: String((data as any).id ?? user.uid),
          },
        },
      },
    };

    await addDoc(collection(db, "pdf_generation_requests"), pdfRequestData);
    onSuccess();
  } catch (error) {
    console.error("[handleContractAndUserCreation] erreur:", error);
    onError(error);
  }
}
