import {
  collection, query, where, orderBy, limit, onSnapshot, Unsubscribe,
} from "firebase/firestore";
import { db } from "@/firebase"; // ⚠️ importe bien depuis src/firebase.ts
import type { PaymentDoc, InvoiceDoc } from "@/types/billing";

// Timestamp Firestore -> Date
function asDate(v: any): Date | null {
  
  return v?.toDate ? v.toDate() : (typeof v === "number" ? new Date(v) : v ?? null);
}

/** Écoute temps-réel des paiements d’un utilisateur */
export function listenUserPayments(
  uid: string,
  cb: (docs: PaymentDoc[]) => void,
  onError?: (e: any) => void
): Unsubscribe {
  const q = query(
    collection(db, "payments"),
    where("userId", "==", uid),
    orderBy("updatedAt", "desc"),
    limit(50)
  );
  return onSnapshot(
    q,
    (snap) => {
      const arr: PaymentDoc[] = snap.docs.map((d) => {
        const x: any = d.data();
        return {
          id: d.id,
          userId: x.userId ?? null,
          amount_total: x.amount_total ?? null,
          currency: x.currency ?? "eur",
          status: x.status ?? null,
          mode: x.mode ?? null,
          payment_intent: x.payment_intent ?? null,
          invoiceId: x.invoiceId ?? null,
          subscriptionId: x.subscriptionId ?? null,
          customer: x.customer ?? null,
          customer_email: x.customer_email ?? null,
          formula: x.formula ?? null,
          createdAt: asDate(x.createdAt),
          updatedAt: asDate(x.updatedAt),
          metadata: x.metadata ?? {},
        };
      });
      cb(arr);
    },
    (e) => onError?.(e)
  );
}

/** Écoute temps-réel des factures d’un utilisateur */
export function listenUserInvoices(
  uid: string,
  cb: (docs: InvoiceDoc[]) => void,
  onError?: (e: any) => void
): Unsubscribe {
  const q = query(
    collection(db, "invoices"),
    where("userId", "==", uid),
    orderBy("updatedAt", "desc"),
    limit(100)
  );
  return onSnapshot(
    q,
    (snap) => {
      const arr: InvoiceDoc[] = snap.docs.map((d) => {
        const x: any = d.data();
        return {
          id: d.id,
          userId: x.userId ?? null,
          status: x.status ?? null,
          subscriptionId: x.subscriptionId ?? null,
          customer: x.customer ?? null,
          customer_email: x.customer_email ?? null,
          hosted_invoice_url: x.hosted_invoice_url ?? null,
          invoice_pdf: x.invoice_pdf ?? null,
          currency: x.currency ?? "eur",
          subtotal: x.subtotal ?? null,
          tax: x.tax ?? null,
          total: x.total ?? null,
          number: x.number ?? null,
          period_start: asDate(x.period_start),
          period_end: asDate(x.period_end),
          createdAt: asDate(x.createdAt),
          updatedAt: asDate(x.updatedAt),
          metadata: x.metadata ?? {},
        };
      });
      cb(arr);
    },
    (e) => onError?.(e)
  );
}
