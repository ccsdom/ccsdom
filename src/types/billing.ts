// Types partagés entre front & listeners

export type PaymentDoc = {
  id: string;
  userId?: string | null;
  amount_total?: number | null;   // en centimes TTC
  currency?: string | null;       // "eur"
  status?: string | null;         // "paid" | "succeeded" | ...
  mode?: "payment" | "subscription" | string | null;
  payment_intent?: string | null;
  invoiceId?: string | null;
  subscriptionId?: string | null;
  customer?: string | null;
  customer_email?: string | null;
  formula?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  metadata?: Record<string, any>;
};

export type InvoiceDoc = {
  id: string;
  userId?: string | null;
  status?: string | null;          // "paid" | "open" | ...
  subscriptionId?: string | null;
  customer?: string | null;
  customer_email?: string | null;
  hosted_invoice_url?: string | null;
  invoice_pdf?: string | null;
  currency?: string | null;
  subtotal?: number | null;        // HT (centimes)
  tax?: number | null;             // TVA (centimes)
  total?: number | null;           // TTC (centimes)
  number?: string | null;
  period_start?: Date | null;
  period_end?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  metadata?: Record<string, any>;
};
