"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { usePathname } from "next/navigation";

import { useAuth, useDb } from "@/firebase";

export const CLIENT_RECOVERY_PATHS = new Set([
  "/dashboard/billing",
  "/dashboard/settings",
  "/dashboard/subscription",
  "/dashboard/support",
]);

type ClientAccessState = {
  loading: boolean;
  suspended: boolean;
  status: string;
  paymentStatus: string;
  suspendedReason: string;
};

function normalizeStatus(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

export function useClientAccountAccess(): ClientAccessState {
  const auth = useAuth();
  const db = useDb();
  const pathname = usePathname();
  const isClientDashboard = pathname.startsWith("/dashboard");
  const [state, setState] = useState<ClientAccessState>({
    loading: isClientDashboard,
    suspended: false,
    status: "active",
    paymentStatus: "paid",
    suspendedReason: "",
  });

  useEffect(() => {
    if (!isClientDashboard) {
      setState((current) => ({ ...current, loading: false, suspended: false }));
      return;
    }

    if (!auth || !db) return;

    return auth.onAuthStateChanged((user) => {
      if (!user) {
        setState({
          loading: false,
          suspended: false,
          status: "active",
          paymentStatus: "paid",
          suspendedReason: "",
        });
        return;
      }

      const unsubscribe = onSnapshot(doc(db, "clients", user.uid), (snap) => {
        const data = snap.data();
        const status = normalizeStatus(data?.status || "active");
        const paymentStatus = normalizeStatus(data?.paymentStatus || "paid");

        setState({
          loading: false,
          suspended: status === "suspended" || paymentStatus === "failed",
          status,
          paymentStatus,
          suspendedReason: String(data?.suspendedReason || "").trim(),
        });
      });

      return () => unsubscribe();
    });
  }, [auth, db, isClientDashboard]);

  return state;
}

export function isClientRecoveryPath(pathname: string) {
  return CLIENT_RECOVERY_PATHS.has(pathname);
}
