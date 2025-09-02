export async function createStripeCheckoutSession(data: {
  userId: string;
  email: string;
  formula: string;
  amount: number; // centimes
}): Promise<string> {
  const base =
    import.meta.env.VITE_FUNCTIONS_BASE_URL ??
    "https://us-central1-ccs-dom.cloudfunctions.net";
  const endpoint = `${base}/createCheckoutSession`;

  const r = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(data),
    mode: "cors",
  });

  const raw = await r.text();
  let j: any = {};
  try { j = raw ? JSON.parse(raw) : {}; } catch { throw new Error(`Réponse non-JSON: ${raw}`); }

  if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
  if (!j.url && !j.sessionId) throw new Error("Réponse API sans url ni sessionId");

  // ✅ On privilégie l’URL de Stripe Checkout
  return j.url ?? j.sessionId;
}
