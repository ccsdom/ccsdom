// src/lib/payments.ts
import { endpoints } from "@/config/functions"; // expose createCheckoutSession & createBillingPortalSession
import type { PlanKey, BillingInterval } from "@/config/pricing";

/** Données envoyées à la Cloud Function */
export type BeginCheckoutInput =
  | {
      userId: string;
      email: string;
      /** Recommandé : utiliser un priceId Stripe */
      priceId: string;
      metadata?: Record<string, string>;
      /** Optionnel : override des chemins de redirection sur le front */
      successPath?: string; // ex: "/client/abonnement/success"
      cancelPath?: string;  // ex: "/client/abonnement/cancel"
    }
  | {
      userId: string;
      email: string;
      /** Alternative si pas de priceId : libellé + montant en centimes */
      formula: string;
      amount: number; // centimes
      metadata?: Record<string, string>;
      successPath?: string;
      cancelPath?: string;
    };

export type BeginCheckoutOptions = { newTab?: boolean };

/** Petit identifiant unique (évite de réutiliser une ancienne session Stripe) */
function makeClickNonce(): string {
  const g: any = globalThis as any;

  // 1) randomUUID si dispo
  if (g?.crypto?.randomUUID && typeof g.crypto.randomUUID === "function") {
    try {
      return g.crypto.randomUUID();
    } catch {
      /* fallback */
    }
  }
  // 2) getRandomValues si dispo
  if (g?.crypto?.getRandomValues && typeof g.crypto.getRandomValues === "function") {
    const buf = new Uint8Array(16);
    g.crypto.getRandomValues(buf);
    return Array.from(buf).map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  // 3) dernier recours
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Lance la création de la session Checkout côté serveur et redirige l'utilisateur.
 * Utilise une clé d’idempotence unique par clic pour éviter de réouvrir une ancienne session expirée.
 */
export async function beginCheckoutRedirect(
  input: BeginCheckoutInput,
  opts?: BeginCheckoutOptions
): Promise<void> {
  const url = endpoints.createCheckoutSession;

  // ❗ Idempotency Key unique par tentative
  const idem = `cko:${makeClickNonce()}`;

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Idempotency-Key": idem,
    },
    body: JSON.stringify(input),
    credentials: "omit",
  });

  if (!resp.ok) {
    let msg = "Paiement indisponible";
    try {
      const j = await resp.json();
      msg = (j as any)?.error || msg;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }

  const data = (await resp.json()) as { id: string; url?: string };
  if (!data?.url) throw new Error("URL Checkout manquante");

  if (opts?.newTab) {
    window.open(data.url, "_blank", "noopener,noreferrer");
  } else {
    window.location.assign(data.url);
  }
}

/** Helper pratique si tu veux lancer via (plan, intervalle) et un mapping PRICE_IDS */
export async function checkoutByPlan({
  userId,
  email,
  plan,
  interval,
  priceIdResolver,
  metadata,
  newTab,
  successPath,
  cancelPath,
}: {
  userId: string;
  email: string;
  plan: PlanKey;
  interval: BillingInterval;
  priceIdResolver: (plan: PlanKey, interval: BillingInterval) => string;
  metadata?: Record<string, string>;
  newTab?: boolean;
  successPath?: string;
  cancelPath?: string;
}) {
  const priceId = priceIdResolver(plan, interval);
  if (!priceId) throw new Error("priceId introuvable pour ce plan/intervalle");

  return beginCheckoutRedirect(
    { userId, email, priceId, metadata, successPath, cancelPath },
    { newTab }
  );
}

/**
 * Ouvre le portail client Stripe (gestion carte, adresse, factures).
 * Nécessite la Cloud Function `createBillingPortalSession` (côté serveur elle lit `returnPath`).
 */
export async function openCustomerPortal({
  userId,
  email,
  returnPath = "/client/abonnement",
  newTab,
}: {
  userId: string;
  email: string;
  /** Chemin local où revenir après le portail (ex: "/client/abonnement") */
  returnPath?: string;
  /** Ouvrir dans un nouvel onglet */
  newTab?: boolean;
}) {
  const url = endpoints.createBillingPortalSession;

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "omit",
    body: JSON.stringify({
      userId,
      email,
      returnPath, // 👈 reste un chemin, la fonction serveur préfixe avec FRONTEND_URL
    }),
  });

  if (!resp.ok) {
    let msg = "Portail indisponible";
    try {
      const j = await resp.json();
      msg = (j as any)?.error || msg;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }

  const { url: portalUrl } = (await resp.json()) as { url?: string };
  if (!portalUrl) throw new Error("URL du portail manquante");

  if (newTab) {
    window.open(portalUrl, "_blank", "noopener,noreferrer");
  } else {
    window.location.assign(portalUrl);
  }
}
