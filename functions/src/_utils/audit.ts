// functions/src/_utils/audit.ts
import type { firestore } from "firebase-admin";
import { AdminFieldValue } from "./admin";

export type AuditAction =
  | "signup.approve"
  | "signup.reject"
  | "signup.analyze.start"
  | "signup.analyze.done"
  | "signup.analyze.error"
  | string;

export type AuditLogPayload = {
  action: AuditAction;
  actorUid: string;
  targetId: string;
  meta?: Record<string, any>;
};

/**
 * Log audit dans une transaction (firestore Transaction)
 */
export async function logAuditTx(
  tx: firestore.Transaction,
  auditRef: firestore.DocumentReference,
  payload: AuditLogPayload
) {
  tx.set(
    auditRef,
    {
      ...payload,
      createdAt: AdminFieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}