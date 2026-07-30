"use client";

import React, { useMemo, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import SignatureCanvas from "react-signature-canvas";
import { Loader2, Info } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

import { useSignupFormStore } from "@/store/signup-form-store";
import { initializeFirebase, useDb } from "@/firebase";

import { ContractPreview } from "./ContractPreview";
import type {
  SignupAddressKey,
  SignupFormValues,
} from "@/features/signup/config";
import {
  emailRegex,
  getAddressKeyFromSignupValues,
  normalizeEmailLower,
  normalizeSiret,
} from "@/features/signup/contract.utils";
import {
  buildCreatePdfJobsPayload,
  buildFinalizeSignupPayload,
  checkSignupUniquenessCall,
  createPdfJobsCall,
  finalizeSignupCall,
  verifyStripeCheckoutSessionCall,
} from "@/features/signup/finalization.service";
import {
  downscaleSignatureDataUrl,
  ensureSignupAuth,
  uploadSignatureToFirebase,
} from "@/features/signup/signature.service";

interface ContractStepProps {
  isProcessing: boolean;
  setIsProcessing: (value: boolean) => void;
  location: SignupAddressKey;
}

function stripSensitiveSignupValues(
  values: SignupFormValues
): SignupFormValues {
  const sanitized: SignupFormValues = { ...values };

  delete (sanitized as any).password;
  delete (sanitized as any).currentPassword;
  delete (sanitized as any).confirmPassword;
  delete (sanitized as any).signature;

  return sanitized;
}

export default function ContractStep({
  isProcessing,
  setIsProcessing,
  location,
}: ContractStepProps) {
  const { formValues, goToNextStep } = useSignupFormStore();
  const { control, watch, setValue, trigger, getValues } =
    useFormContext<SignupFormValues>();

  const signatureRef = useRef<any>(null);
  const contractPreviewRef = useRef<HTMLDivElement>(null);

  const [pdfStatus, setPdfStatus] = useState<"idle" | "generating" | "done">(
    "idle"
  );
  const [dbPaymentStatus, setDbPaymentStatus] = useState<string | null>(null);
  const [dbSessionId, setDbSessionId] = useState<string | null>(null);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [isWaitingForPayment, setIsWaitingForPayment] = useState(true);

  const agreedToTerms = watch("agreedToTerms");
  const signatureDataUrl = watch("signature") || "";

  const { toast } = useToast();

  const fb = initializeFirebase();
  const app = (fb as any)?.firebaseApp || (fb as any);
  const db = useDb();

  React.useEffect(() => {
    const uid = fb.auth.currentUser?.uid;
    if (!uid || !db) return;

    // Use requestUid from form if available, fallback to currentUser.uid
    const requestUid = formValues.requestUid || uid;

    const unsub = onSnapshot(doc(db, "client_requests", requestUid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const status = data?.paymentStatus;
        setDbPaymentStatus(status);
        setDbSessionId(data?.stripeCheckout?.sessionId || null);
        setIsWaitingForPayment(status !== "paid" && status !== "success");
      } else {
        // Doc might not exist yet if webhook hasn't fired at all and it's a fresh return
        // but redirectToCheckout creates it as 'pending'
        setDbPaymentStatus("pending");
        setIsWaitingForPayment(true);
      }
    }, (error) => {
      console.error("[ContractStep] Firestore listener error:", error);
    });

    return () => unsub();
  }, [fb.auth.currentUser, db, formValues.requestUid]);

  const SigPad = SignatureCanvas as unknown as React.ComponentType<any>;

  const mergedValues = useMemo<SignupFormValues>(() => {
    return {
      ...formValues,
      ...(getValues() || {}),
    };
  }, [formValues, getValues]);

  const previewValues = useMemo<SignupFormValues>(() => {
    return stripSensitiveSignupValues(mergedValues);
  }, [mergedValues]);

  const signatoryName = useMemo(() => {
    return (
      `${mergedValues?.firstName ?? ""} ${mergedValues?.lastName ?? ""}`.trim() ||
      String(mergedValues?.companyName ?? "").trim() ||
      "Le domicilié"
    );
  }, [mergedValues]);

  const handleClearSignature = () => {
    signatureRef.current?.clear();
    setValue("signature", "", { shouldValidate: true, shouldDirty: true });
  };

  const handleEndSignature = async () => {
    if (!signatureRef.current) return;

    const raw = signatureRef.current.toDataURL("image/png");
    const dataUrl = await downscaleSignatureDataUrl(raw, 600, 200);

    setValue("signature", dataUrl, {
      shouldValidate: true,
      shouldDirty: true,
    });

    await trigger("signature");
  };

  const handleValidateAndCreate = async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      setPdfStatus("generating");

      if (!app) {
        throw new Error("Firebase n’est pas initialisé.");
      }

      await ensureSignupAuth(app);

      const currentValues: SignupFormValues = {
        ...formValues,
        ...(getValues() || {}),
      };

      const sanitizedValues = stripSensitiveSignupValues(currentValues);

      const addressKey = getAddressKeyFromSignupValues(currentValues, location);
      const userEmail = normalizeEmailLower(currentValues.email);
      const siretNorm = normalizeSiret(currentValues.siret);
      const signedAt = new Date().toISOString();

      if (!userEmail || !emailRegex.test(userEmail)) {
        toast({
          variant: "destructive",
          title: "Email invalide",
          description:
            "Retournez à l’étape Contact & Connexion et corrigez l’adresse email.",
        });
        setPdfStatus("idle");
        return;
      }

      const projectType = String(currentValues.projectType ?? "").toLowerCase();

      if (projectType === "transfert") {
        if (!siretNorm || siretNorm.length !== 14) {
          toast({
            variant: "destructive",
            title: "SIRET requis",
            description: "Le SIRET est obligatoire pour un transfert (14 chiffres).",
          });
          setPdfStatus("idle");
          return;
        }
      } else {
        if (siretNorm && siretNorm.length !== 14) {
          toast({
            variant: "destructive",
            title: "SIRET invalide",
            description: "Le SIRET doit faire 14 chiffres s'il est renseigné.",
          });
          setPdfStatus("idle");
          return;
        }
      }

      if (!agreedToTerms) {
        toast({
          variant: "destructive",
          title: "Conditions non acceptées",
          description:
            "Veuillez accepter les termes et conditions du contrat.",
        });
        setPdfStatus("idle");
        return;
      }

      if (!signatureDataUrl) {
        toast({
          variant: "destructive",
          title: "Signature requise",
          description: "Veuillez signer avant de valider.",
        });
        setPdfStatus("idle");
        return;
      }

      const uniqueness = await checkSignupUniquenessCall({
        firebaseApp: app,
        siret: siretNorm,
        email: userEmail,
      });

      if (uniqueness?.siretExists) {
        toast({
          variant: "destructive",
          title: "SIRET déjà utilisé",
          description:
            "Ce SIRET est déjà associé à une autre demande ou à un client existant.",
        });
        setPdfStatus("idle");
        return;
      }

      if (uniqueness?.emailExists) {
        toast({
          variant: "destructive",
          title: "Email déjà utilisé",
          description:
            "Cet email est déjà utilisé pour une autre demande. Utilisez une autre adresse ou connectez-vous à votre espace.",
        });
        setPdfStatus("idle");
        return;
      }

      let signatureUrl: string | null = null;

      try {
        signatureUrl = await uploadSignatureToFirebase({
          firebaseApp: app,
          signatureDataUrl,
          userEmail,
          addressKey,
        });
      } catch (error) {
        console.warn(
          "[ContractStep] upload signature échoué (on continue sans URL):",
          error
        );
        signatureUrl = null;
      }

      const requestUid =
        String(currentValues.requestUid ?? "").trim() ||
        fb.auth.currentUser?.uid ||
        `contract_flow_${userEmail.replace(/[^\w.-]+/g, "_")}`;

      const createPdfPayload = buildCreatePdfJobsPayload({
        values: sanitizedValues,
        signatureDataUrl: "",
        signatureUrl,
        signatoryName,
        signedAt,
      });

      const jobs = await createPdfJobsCall({
        firebaseApp: app,
        addressKey,
        data: createPdfPayload,
        signatureUrl,
        clientRequestId: requestUid,
      });

      const finalizePayload = buildFinalizeSignupPayload({
        values: sanitizedValues,
        userEmail,
        siretNorm,
        signatureUrl,
        signatoryName,
        signedAt,
        contractId: jobs?.contractId,
        attestationId: jobs?.attestationId,
      });

      await finalizeSignupCall({
        firebaseApp: app,
        addressKey,
        signatureUrl,
        formData: finalizePayload,
      });

      setPdfStatus("done");
      goToNextStep();
    } catch (error: any) {
      console.error("[ContractStep] finalisation error:", error);

      toast({
        variant: "destructive",
        title: "Erreur lors de la finalisation",
        description:
          error?.message ||
          error?.details ||
          "Une erreur est survenue lors de la création du dossier.",
      });

      setPdfStatus("idle");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!dbSessionId || isVerifyingPayment) return;

    try {
      setIsVerifyingPayment(true);
      const res = await verifyStripeCheckoutSessionCall({
        firebaseApp: app,
        sessionId: dbSessionId,
      });

      if (res?.paid) {
        toast({
          title: "Paiement confirmé",
          description: "Le statut a été mis à jour. Vous pouvez maintenant valider.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Paiement non trouvé",
          description: "Stripe n'a pas encore confirmé le paiement pour cette session. Veuillez réessayer dans quelques instants ou vérifier votre compte Stripe.",
        });
      }
    } catch (error: any) {
      console.error("[ContractStep] check payment error:", error);
      toast({
        variant: "destructive",
        title: "Erreur de vérification",
        description: error?.message || "Impossible de vérifier le statut auprès de Stripe.",
      });
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Signature du Contrat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 w-full overflow-y-auto rounded-lg border bg-muted/30 p-4">
            <ContractPreview
              ref={contractPreviewRef}
              data={{
                ...previewValues,
                signature: signatureDataUrl,
                signatureUrl: undefined,
                signatureCaption: "Lu et approuvé",
                signatoryName,
                signedAt: new Date().toISOString(),
                signaturePlacement: "domicilie",
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Votre Signature</CardTitle>
          <CardDescription>
            Signez dans le cadre ci-dessous. Votre signature sera ajoutée au
            contrat.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <FormItem>
            <FormLabel>Signature</FormLabel>
            <FormControl>
              <div className="h-48 w-full rounded-md border bg-background">
                <SigPad
                  ref={signatureRef}
                  penColor="black"
                  onEnd={handleEndSignature}
                  canvasProps={{
                    width: 600,
                    height: 192,
                    style: {
                      width: "100%",
                      height: "100%",
                      display: "block",
                    },
                  }}
                />
              </div>
            </FormControl>

            <div className="mt-2 flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearSignature}
              >
                Effacer
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={handleValidateAndCreate}
                disabled={isProcessing || !agreedToTerms || !signatureDataUrl || isWaitingForPayment}
                title={
                  !agreedToTerms ? "Veuillez accepter les conditions" : 
                  isWaitingForPayment ? "Paiement en cours de confirmation..." : undefined
                }
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Génération des documents…
                  </>
                ) : pdfStatus === "done" ? (
                  "✅ Documents générés"
                ) : (
                  "Valider et Créer les Documents"
                )}
              </Button>

              {isWaitingForPayment && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm text-amber-600 animate-pulse">
                    <Info className="h-4 w-4" />
                    <span>Attente de confirmation du paiement par Stripe...</span>
                  </div>
                  {dbSessionId && (
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs text-muted-foreground underline"
                      onClick={handleVerifyPayment}
                      disabled={isVerifyingPayment}
                    >
                      {isVerifyingPayment ? "Vérification..." : "Vérifier manuellement le statut du paiement"}
                    </Button>
                  )}
                </div>
              )}
            </div>

            {signatureDataUrl && (
              <img
                src={signatureDataUrl}
                alt="Aperçu de votre signature"
                className="mt-2 h-32 w-64 border object-contain"
              />
            )}
          </FormItem>

          <FormField
            control={control}
            name="agreedToTerms"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    id="agreedToTerms"
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel htmlFor="agreedToTerms" className="!mt-0 text-sm">
                  J’ai lu et accepté les termes et conditions du contrat.
                </FormLabel>
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}