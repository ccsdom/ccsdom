"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useForm, FormProvider, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import {
  useSignupFormStore,
  useSignupSteps,
} from "@/store/signup-form-store";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

import { SignupLayout } from "@/components/signup/SignupLayout";
import { ProjectStep } from "@/components/signup/ProjectStep";
import { CompanySearchStep } from "@/components/signup/CompanySearchStep";
import { LegalStatusStep } from "@/components/signup/LegalStatusStep";
import { DenominationStep } from "@/components/signup/DenominationStep";
import { RepresentativeStep } from "@/components/signup/RepresentativeStep";
import { DomiciliationStep } from "@/components/signup/DomiciliationStep";
import { MailStep } from "@/components/signup/MailStep";
import { AccompanimentStep } from "@/components/signup/AccompanimentStep";
import { DocumentsStep } from "@/components/signup/DocumentsStep";
import { SummaryStep } from "@/components/signup/SummaryStep";
import PaymentStep from "@/components/signup/PaymentStep";
import ContractStep from "@/components/signup/ContractStep";
import FinalizationStep from "@/components/signup/FinalizationStep";
import { Stepper } from "@/components/signup/Stepper";
import Logo from "@/components/logo";

import type { SignupFormValues } from "@/features/signup/config";
import { useSignupRequestPreparation } from "@/features/signup/use-signup-request-preparation";
import { allAddresses } from "@/lib/addresses";
import { normalizeMailPlanId } from "@/lib/plans";

function SignupPageContent() {
  const searchParams = useSearchParams();
  const {
    currentStep,
    setCurrentStep,
    formValues,
    setFormData,
    goToNextStep,
    goToPreviousStep,
  } = useSignupFormStore();

  const { steps, currentStepId, currentSchema, currentStepConfig, isFirstStep } =
    useSignupSteps();

  const [isProcessing, setIsProcessing] = React.useState(false);
  const [requestUid, setRequestUid] = React.useState<string | null>(null);
  const [requestEmail, setRequestEmail] = React.useState("");
  const currentSchemaRef = React.useRef(currentSchema);
  currentSchemaRef.current = currentSchema;

  React.useEffect(() => {
    const requestedCenter = searchParams.get("center");
    const requestedPlan = searchParams.get("plan");
    const requestedBilling = searchParams.get("billing");
    const nextData: Partial<SignupFormValues> = {};

    if (requestedCenter) {
      const selectedCenter = allAddresses.find(
        (address) =>
          address.status === "active" &&
          [
            address.id,
            address.slug,
            address.addressKey,
            address.locationKey,
          ].includes(requestedCenter)
      );

      if (selectedCenter) {
        nextData.addressId = selectedCenter.id;
        nextData.addressKey = selectedCenter.addressKey || selectedCenter.id;
        nextData.locationKey =
          selectedCenter.locationKey || selectedCenter.addressKey || selectedCenter.id;
      }
    }

    if (requestedPlan) {
      nextData.mailPlanId = normalizeMailPlanId(requestedPlan);
    }

    if (requestedBilling === "monthly" || requestedBilling === "yearly") {
      nextData.paymentFrequency = requestedBilling;
    }

    if (Object.keys(nextData).length > 0) {
      setFormData(nextData);
    }
  }, [searchParams, setFormData]);

  const currentStepResolver = React.useCallback<Resolver<SignupFormValues>>(
    (values, context, options) =>
      zodResolver(currentSchemaRef.current)(values, context, options),
    []
  );

  const form = useForm<SignupFormValues>({
    resolver: currentStepResolver,
    mode: "onTouched",
    defaultValues: formValues,
  });

  React.useEffect(() => {
    form.reset(formValues, {
      keepDirty: false,
      keepErrors: false,
      keepIsSubmitted: false,
      keepTouched: false,
    });
    form.clearErrors();
  }, [currentStep, formValues, form]);

  const { isPreparingRequest } = useSignupRequestPreparation({
    currentStepId,
    requestUid,
    setRequestUid,
    setRequestEmail,
    form,
    setFormData,
  });

  const processStep = async () => {
    const fieldsToValidate = currentStepConfig?.fieldsToValidate;

    const isValid = fieldsToValidate?.length
      ? await form.trigger(fieldsToValidate as never)
      : true;

    if (!isValid) return;

    setFormData(form.getValues());

    if (currentStep < steps.length - 1) {
      goToNextStep();
    }
  };

  const handleGoBack = () => {
    setFormData(form.getValues());
    goToPreviousStep();
  };

  const stepComponents: Record<string, React.ReactNode> = {
    projet: <ProjectStep />,
    recherche: <CompanySearchStep />,
    statut: <LegalStatusStep />,
    denomination: <DenominationStep />,
    representant: <RepresentativeStep />,
    domiciliation: <DomiciliationStep />,
    courrier: <MailStep />,
    accompagnement: <AccompanimentStep />,
    documents: requestUid ? (
      <DocumentsStep requestUid={requestUid} email={requestEmail} />
    ) : (
      <div className="mt-4 flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <p className="text-sm">Préparation du dossier…</p>
        <p className="text-xs text-muted-foreground">
          Cette étape ne prend que quelques secondes.
        </p>
      </div>
    ),
    recapitulatif: <SummaryStep setCurrentStep={setCurrentStep} />,
    paiement: (
      <PaymentStep
        isProcessing={isProcessing}
        setIsProcessing={setIsProcessing}
        formValues={form.getValues()}
      />
    ),
    contrat: (
      <ContractStep
        isProcessing={isProcessing}
        setIsProcessing={setIsProcessing}
        location="orly"
      />
    ),
    finalisation: <FinalizationStep />,
  };

  const currentStepInfo = steps[currentStep];

  return (
    <SignupLayout>
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="hidden border-r bg-white/5 backdrop-blur-3xl p-10 print:hidden lg:flex lg:flex-col lg:justify-between h-screen overflow-y-auto sticky top-0"
      >
        <Stepper
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          steps={steps}
        />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        className="flex w-full flex-col items-center p-6 lg:p-12 overflow-y-auto"
      >
        <div className="w-full max-w-2xl mb-8 lg:hidden print:hidden flex justify-between items-center">
            <Logo showSlogan={false} />
        </div>

        <FormProvider {...form}>
          <form
            id="signup-form"
            className="w-full max-w-2xl relative"
            onSubmit={(event) => {
              event.preventDefault();
              void processStep();
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStepId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="w-full"
              >
                {currentStepInfo && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="mb-10"
                  >
                    <div className="flex items-center gap-2 mb-2">
                       <div className="h-1 w-8 bg-primary rounded-full" />
                       <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary/60">Étape {currentStep + 1} sur {steps.length}</span>
                    </div>
                    <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                      {currentStepInfo.name}
                    </h2>
                    {currentStepInfo.description && (
                      <p className="text-muted-foreground mt-3 text-lg font-medium leading-relaxed max-w-lg">
                        {currentStepInfo.description}
                      </p>
                    )}
                  </motion.div>
                )}

                <div className="min-h-[300px]">
                  {stepComponents[currentStepId]}
                </div>

                {currentStepId !== "contrat" && currentStepId !== "finalisation" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-12 flex w-full justify-between items-center print:hidden border-t border-white/5 pt-8"
                  >
                    <Button
                      variant="ghost"
                      type="button"
                      className="text-muted-foreground hover:text-foreground hover:bg-white/5 px-6"
                      onClick={handleGoBack}
                      disabled={isFirstStep || isProcessing || isPreparingRequest}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Précédent
                    </Button>

                    <Button
                      type="submit"
                      form="signup-form"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-11 shadow-lg shadow-primary/20"
                      disabled={isProcessing || isPreparingRequest}
                    >
                      {currentStepId === "recapitulatif"
                        ? "Continuer vers le paiement"
                        : "Suivant"}
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </form>
        </FormProvider>

        <div className="mt-20 pb-8 text-center">
            <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground/30">
                © 2026 CCS DOM — Haute Domiciliation & Business Services
            </p>
        </div>
      </motion.div>
    </SignupLayout>
  );
}

const SignupPageWithSuspense: React.FC = () => (
  <Suspense
    fallback={
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }
  >
    <SignupPageContent />
  </Suspense>
);

export default function Page() {
  return (
    <TooltipProvider>
      <SignupPageWithSuspense />
    </TooltipProvider>
  );
}
