export async function getCheckoutUrl(
  payments: unknown,
  lineItems: { price: string; quantity: number }[],
  options: { successUrl: string; cancelUrl: string }
): Promise<string> {
  void payments;
  void options;

  if (!Array.isArray(lineItems) || lineItems.length === 0) {
    throw new Error(
      "Aucun line item Stripe fourni. Impossible de créer une session de paiement."
    );
  }

  throw new Error(
    "getCheckoutUrl est un placeholder désactivé. Utilise createStripeCheckoutSession via Cloud Function."
  );
}