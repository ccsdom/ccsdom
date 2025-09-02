// src/hooks/useBilling.ts
import { useEffect, useMemo, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  FirestoreError,
} from "firebase/firestore";

// Adapte l'import si ton "db" est ailleurs
import { db } from "../config/firebase"; // export const db = getFirestore(app)

export type PaymentDoc = {
  id: string;
  userId?: string | null;
  amount_total?: number | null;   // en centimes
  currency?: string;              // "eur"
  status?: string;                // "paid" | ...
  updatedAt?: Date | null;        // pour tri
  createdAt?: Date | null;
  invoiceId?: string | null;
  formula?: string | null;
};

export type InvoiceDoc = {
  id: string;
  userId?: string | null;
  status?: string;                 // "paid" | "open" | ...
  currency?: string;               // "eur"
  total?: number | null;           // TTC en centimes
  tax?: number | null;             // TVA en centimes (si appliquée)
  hosted_invoice_url?: string | null;
  invoice_pdf?: string | null;
  updatedAt?: Date | null;
  createdAt?: Date | null;
  number?: string | null;
  period_start?: Date | null;
  period_end?: Date | null;
};

function docToDate(v: any): Date | null {
  // Firestore Timestamp → Date
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return v?.toDate ? v.toDate() : v ? new Date(v) : null;
}

export function useUserPayments(uid?: string) {
  const [items, setItems] = useState<PaymentDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    if (!uid) {
      setItems([]);
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, "payments"),
      where("userId", "==", uid),
      // On trie sur updatedAt (toujours écrit par le webhook)
      orderBy("updatedAt", "desc"),
      limit(50)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const arr: PaymentDoc[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            userId: data.userId ?? null,
            amount_total: data.amount_total ?? null,
            currency: data.currency ?? "eur",
            status: data.status ?? "unknown",
            updatedAt: docToDate(data.updatedAt),
            createdAt: docToDate(data.createdAt),
            invoiceId: data.invoiceId ?? null,
            formula: data.formula ?? null,
          };
        });
        setItems(arr);
        setLoading(false);
      },
      (e) => {
        setError(e);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [uid]);

  return { items, loading, error };
}

export function useUserInvoices(uid?: string) {
  const [items, setItems] = useState<InvoiceDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    if (!uid) {
      setItems([]);
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, "invoices"),
      where("userId", "==", uid),
      orderBy("updatedAt", "desc"),
      limit(100)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const arr: InvoiceDoc[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            userId: data.userId ?? null,
            status: data.status ?? "unknown",
            currency: data.currency ?? "eur",
            total: data.total ?? null,
            tax: data.tax ?? null,
            hosted_invoice_url: data.hosted_invoice_url ?? null,
            invoice_pdf: data.invoice_pdf ?? null,
            updatedAt: docToDate(data.updatedAt),
            createdAt: docToDate(data.createdAt),
            number: data.number ?? null,
            period_start: docToDate(data.period_start),
            period_end: docToDate(data.period_end),
          };
        });
        setItems(arr);
        setLoading(false);
      },
      (e) => {
        setError(e);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [uid]);

  return { items, loading, error };
}

export function useBilling(uid?: string) {
  const payments = useUserPayments(uid);
  const invoices = useUserInvoices(uid);

  const invoiceMap = useMemo(() => {
    const m = new Map<string, InvoiceDoc>();
    invoices.items.forEach((inv) => m.set(inv.id, inv));
    return m;
  }, [invoices.items]);

  return {
    payments: payments.items,
    paymentsLoading: payments.loading,
    paymentsError: payments.error,
    invoices: invoices.items,
    invoicesLoading: invoices.loading,
    invoicesError: invoices.error,
    invoiceMap,
    loading: payments.loading || invoices.loading,
  };
}
