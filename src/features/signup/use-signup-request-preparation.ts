"use client";

import React from "react";
import type { UseFormReturn } from "react-hook-form";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

import { useDb, useFirebase } from "@/firebase";
import { notifySignup } from "@/lib/notifySignup";
import {
  type SignupFormValues,
  resolveAddressKeyFromForm,
} from "@/features/signup/config";
import { SIGNUP_REQUEST_STATUS } from "@/lib/constants/signup";


type Args = {
  currentStepId?: string;
  requestUid: string | null;
  setRequestUid: (value: string | null) => void;
  setRequestEmail: (value: string) => void;
  form: UseFormReturn<SignupFormValues>;
  setFormData: (data: Partial<SignupFormValues>) => void;
};

export function useSignupRequestPreparation({
  currentStepId,
  requestUid,
  setRequestUid,
  setRequestEmail,
  form,
  setFormData,
}: Args) {
  const { firebaseApp } = useFirebase();
  const db = useDb();

  const auth = React.useMemo(
    () => (firebaseApp ? getAuth(firebaseApp) : null),
    [firebaseApp]
  );

  const [isPreparingRequest, setIsPreparingRequest] = React.useState(false);

  const servicesReady = Boolean(db && auth);

  React.useEffect(() => {
    let cancelled = false;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;

    async function ensureAnonymousSession(): Promise<string | null> {
      if (!auth) return null;

      try {
        if (!auth.currentUser) {
          const credential = await signInAnonymously(auth);
          return credential.user.uid;
        }
        return auth.currentUser.uid ?? null;
      } catch (error) {
        console.error("[Signup] signInAnonymously failed:", error);
        return null;
      }
    }

    async function ensureClientRequestDraft(
      uid: string,
      values: SignupFormValues
    ) {
      if (!db) return null;

      const email = String(values.email ?? "").trim().toLowerCase();

      const companyName = String(values.companyName ?? "").trim();

      const contactName =
        `${String(values.firstName ?? "").trim()} ${String(
          values.lastName ?? ""
        ).trim()}`.trim() || "—";
      const addressId = String(values.addressId ?? "").trim();
      const addressKey = resolveAddressKeyFromForm(values, "");
      const locationKey =
        String(values.locationKey ?? "").trim() ||
        String(values.addressKey ?? "").trim() ||
        addressKey;

      await setDoc(
        doc(db, "client_requests", uid),
        {
          email,
          emailLower: email,
          companyName,
          name: companyName || contactName,
          addressId,
          addressKey,
          locationKey,
          projectType: values.projectType || "creation",
          mailPlanId: values.mailPlanId || "business",
          accompanimentType: values.accompanimentType || "solo",
          status: "draft",
          source: "public_onboarding",
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      return { email, companyName, contactName };
    }

    async function prepare() {
      if (cancelled) return;
      if (!servicesReady) return;
      if (currentStepId !== "documents") return;
      if (requestUid) return;

      try {
        setIsPreparingRequest(true);

        const uid = await ensureAnonymousSession();
        if (!uid) {
          throw new Error("Impossible d'ouvrir une session d'inscription.");
        }

        const values = form.getValues();
        const draft = await ensureClientRequestDraft(uid, values);
        const email = draft?.email ?? "";
        const companyName = draft?.companyName ?? "";
        const contactName = draft?.contactName ?? "—";

        const addressKey = resolveAddressKeyFromForm(values, "orly");

        try {
          await notifySignup({
            addressKey,
            companyName: companyName || "—",
            legalStatus: String(values.legalStatus ?? "—"),
            contactName,
            contactEmail: email || "—",
            contactPhone: String(values.phone ?? "").trim() || "—",
            planName:
              String(values.planName ?? "").trim() ||
              String(values.mailPlanId ?? "").trim() ||
              "—",
            planPrice: String(values.planPrice ?? "").trim() || "—",
            requestUid: uid,
            docsRequiredCompleted: false,
            status: SIGNUP_REQUEST_STATUS.DRAFT,
            createdAtStr: new Date().toLocaleString("fr-FR"),
            adminConsoleUrl: "",
            clientIp: "unknown",
            userAgent:
              typeof navigator !== "undefined" ? navigator.userAgent : "server",
          });
        } catch (error) {
          console.warn("[Signup] notifySignup draft failed:", error);
        }

        if (!cancelled) {
          setRequestUid(uid);
          setRequestEmail(email || "");
          setFormData({ ...values, requestUid: uid });
        }
      } catch (error) {
        console.error("[Signup] prepareRequestDoc error:", error);

        retryTimeout = setTimeout(() => {
          if (!cancelled) void prepare();
        }, 2000);
      } finally {
        if (!cancelled) {
          setIsPreparingRequest(false);
        }
      }
    }

    void prepare();

    return () => {
      cancelled = true;
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [
    auth,
    currentStepId,
    db,
    form,
    requestUid,
    servicesReady,
    setFormData,
    setRequestEmail,
    setRequestUid,
  ]);

  return { isPreparingRequest };
}
