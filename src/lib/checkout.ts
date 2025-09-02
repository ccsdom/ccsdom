// src/lib/checkout.ts
import { endpoints } from "@/config/functions";
import type { BeginCheckoutInput } from "@/lib/payments";

/** Petit nonce pour clé d’idempotence par clic */
function makeClickNonce(): string {
  const g: any = globalThis as any;
  if (g?.crypto?.randomUUID) {
    try { return g.crypto.randomUUID(); } catch {}
  }
  if (g?.crypto?.getRandomValues) {
    const buf = new Uint8Array(16);
    g.crypto.getRandomValues(buf);
    return Array.from(buf).map(b => b.toString(16).padStart(2, "0")).join("");
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Appelle la CF et renvoie { id, url } */
export async function createCheckoutSession(
  input: BeginCheckoutInput
): Promise<{ id: string; url: string }> {
  const url = endpoints.createCheckoutSession; // ✅ plus de getCheckoutSession
  const idem = `cko:${makeClickNonce()}`;

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Idempotency-Key": idem,
    },
    credentials: "omit",
    body: JSON.stringify(input),
  });

  if (!resp.ok) {
    let msg = "Paiement indisponible";
    try { msg = (await resp.json())?.error || msg; } catch {}
    throw new Error(msg);
  }

  const data = (await resp.json()) as { id?: string; url?: string };
  if (!data?.id || !data?.url) throw new Error("Réponse Checkout invalide");
  return { id: data.id, url: data.url };
}

/** Crée la session et redirige l’utilisateur */
export async function redirectToCheckout(
  input: BeginCheckoutInput,
  { newTab = true }: { newTab?: boolean } = {}
): Promise<void> {
  const { url } = await createCheckoutSession(input);
  if (newTab) window.open(url, "_blank", "noopener,noreferrer");
  else window.location.assign(url);
}
