"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";
import {
  CheckCircle2,
  Loader2,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { useSignupFormStore } from "@/store/signup-form-store";
import { useAuth, useDb, useFirebase, usePayments } from "@/firebase";
import { redirectToCheckout } from "@/services/signup-service";
import { useToast } from "@/hooks/use-toast";
import { verifyStripeCheckoutSessionCall } from "@/features/signup/payment.service";
import type { SignupFormValues } from "@/features/signup/config";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type PaymentStepProps = {
  isProcessing: boolean;
  setIsProcessing: (isProcessing: boolean) => void;
  formValues: SignupFormValues;
};

const STRIPE_VERIFY_MAX_ATTEMPTS = 5;
const STRIPE_VERIFY_RETRY_DELAY_MS = 1500;

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function verifyStripeCheckoutSessionWithRetries(
  args: Parameters<typeof verifyStripeCheckoutSessionCall>[0]
) {
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= STRIPE_VERIFY_MAX_ATTEMPTS; attempt += 1) {
    try {
      const result = await verifyStripeCheckoutSessionCall(args);

      if (result?.paid === true || result?.status === "paid") {
        return result;
      }

      lastError = new Error(
        "Le paiement n'a pas encore été confirmé par Stripe."
      );
    } catch (error: unknown) {
      lastError = error;
      console.warn("[PaymentStep] tentative verification Stripe:", {
        attempt,
        maxAttempts: STRIPE_VERIFY_MAX_ATTEMPTS,
        error,
      });
    }

    if (attempt < STRIPE_VERIFY_MAX_ATTEMPTS) {
      await wait(STRIPE_VERIFY_RETRY_DELAY_MS);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Le paiement n'a pas été confirmé par Stripe.");
}

const PaymentStep: React.FC<PaymentStepProps> = ({
  isProcessing,
  setIsProcessing,
  formValues,
}) => {
  const { setFormData, goToNextStep } = useSignupFormStore();
  const { toast } = useToast();
  const router = useRouter();

  const auth = useAuth();
  const db = useDb();
  const { firebaseApp } = useFirebase();
  const payments = usePayments();

  const [isVerifyingReturn, setIsVerifyingReturn] = useState(false);
  const [returnError, setReturnError] = useState<string | null>(null);

  const storage = useMemo(() => {
    if (!firebaseApp) return null;
    return getStorage(firebaseApp);
  }, [firebaseApp]);

  const functions = useMemo(() => {
    if (!firebaseApp) return null;
    return getFunctions(firebaseApp, "europe-west1");
  }, [firebaseApp]);

  const confirmCheckoutSession = useCallback(
    async (sessionId: string, isCancelled: () => boolean = () => false) => {
      if (!firebaseApp || isCancelled()) return;

      try {
        setIsVerifyingReturn(true);
        setReturnError(null);

        const result = await verifyStripeCheckoutSessionWithRetries({
          firebaseApp,
          sessionId,
        });

        if (isCancelled()) return;

        if (result?.paid === true || result?.status === "paid") {
          setFormData({
            paymentSuccess: true,
            stripeSessionId: sessionId,
          });

          goToNextStep();

          toast({
            title: "Paiement réussi",
            description: "Vous pouvez maintenant finaliser votre contrat.",
          });

          router.replace("/signup", { scroll: false });
          return;
        }

        throw new Error(
          "Le paiement n'a pas été confirmé. Veuillez contacter le support."
        );
      } catch (error: unknown) {
        if (isCancelled()) return;

        console.error("[PaymentStep] verifyStripeCheckoutSession erreur:", error);

        setReturnError(
          "Impossible de confirmer votre paiement pour le moment. Merci de réessayer ou de contacter le support."
        );
      } finally {
        if (!isCancelled()) {
          setIsVerifyingReturn(false);
        }
      }
    },
    [firebaseApp, goToNextStep, router, setFormData, toast]
  );

  const handlePayment = useCallback(async () => {
    setReturnError(null);
    setIsProcessing(true);

    if (!firebaseApp || !storage || !functions) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Firebase n'est pas initialisé correctement.",
      });
      setIsProcessing(false);
      return;
    }

    if (!auth?.currentUser) {
      toast({
        variant: "destructive",
        title: "Connexion requise",
        description: "Veuillez vous connecter avant de procéder au paiement.",
      });
      setIsProcessing(false);
      return;
    }

    try {
      const checkout = await redirectToCheckout(
        formValues,
        (error: unknown) => {
          const message =
            error instanceof Error
              ? error.message
              : "Impossible de préparer Stripe Checkout.";

          toast({
            variant: "destructive",
            title: "Erreur paiement",
            description: message,
          });
        },
        {
          auth,
          db,
          functions,
          payments,
          storage,
        }
      );

      if (checkout?.checkoutUrl) {
        window.location.assign(checkout.checkoutUrl);
        return;
      }

      throw new Error("Impossible de récupérer le lien Stripe Checkout.");
    } catch (error: unknown) {
      console.error("[PaymentStep] handlePayment error:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la création de la session Stripe.";

      toast({
        variant: "destructive",
        title: "Erreur",
        description: message,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [
    auth,
    db,
    firebaseApp,
    formValues,
    functions,
    payments,
    setIsProcessing,
    storage,
    toast,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!firebaseApp) return;

    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("session_id");
    const cancelled = urlParams.get("cancelled");

    if (cancelled) {
      toast({
        variant: "destructive",
        title: "Paiement annulé",
        description: "Vous pouvez réessayer quand vous voulez.",
      });
      router.replace("/signup", { scroll: false });
      return;
    }

    if (!sessionId) return;

    let effectCancelled = false;

    void confirmCheckoutSession(sessionId, () => effectCancelled);

    return () => {
      effectCancelled = true;
    };
  }, [confirmCheckoutSession, firebaseApp, router, toast]);

  if (formValues?.paymentSuccess) {
    return (
      <Card className="text-center">
        <CardHeader>
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-primary" />
            <CardTitle>Paiement réussi</CardTitle>
          </div>
          <CardDescription>
            Votre paiement a été traité. Cliquez sur "Suivant" pour signer votre
            contrat.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isVerifyingReturn) {
    return (
      <Card className="text-center">
        <CardHeader>
          <CardTitle>Vérification du paiement...</CardTitle>
          <CardDescription>
            Nous confirmons votre paiement auprès de Stripe.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (returnError) {
    return (
      <Card className="text-center">
        <CardHeader>
          <div className="flex items-center justify-center gap-2">
            <XCircle className="h-6 w-6 text-destructive" />
            <CardTitle>Paiement non confirmé</CardTitle>
          </div>
          <CardDescription>{returnError}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-2">
          <Button onClick={handlePayment} disabled={isProcessing} size="lg">
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Réessayer le paiement
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="text-center">
      <CardHeader>
        <CardTitle>Paiement</CardTitle>
        <CardDescription>
          Vous allez être redirigé vers Stripe pour finaliser votre paiement
          sécurisé.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-3">
        <Button onClick={handlePayment} disabled={isProcessing} size="lg">
          {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Procéder au paiement
        </Button>

        <p className="max-w-md text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Montants indiqués HT • La TVA de 20% est automatiquement calculée et appliquée lors du règlement.
        </p>


        <div className="max-w-md rounded-2xl border border-primary/15 bg-primary/5 p-4 text-left">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-foreground">Paiement sécurisé via Stripe</p>
              <p className="text-xs leading-5 text-muted-foreground">
                Si la page Stripe reste grisée, désactivez temporairement l'antivirus,
                l'extension bancaire ou l'adblocker qui peut bloquer les scripts Stripe.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentStep;
