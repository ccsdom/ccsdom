import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import {
  creationSteps,
  getFullSchema,
  getStepSchema,
  getStepsForProjectType,
  type SignupFormValues,
  type SignupProjectType,
} from "@/features/signup/config";

interface SignupFormState {
  currentStep: number;
  formValues: SignupFormValues;
  setCurrentStep: (step: number) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  setFormData: (data: Partial<SignupFormValues>) => void;
  reset: () => void;
}

const initialState: Pick<SignupFormState, "currentStep" | "formValues"> = {
  currentStep: 0,
  formValues: {
    projectType: "creation",
    legalStatus: "sas",
    mailPlanId: "business",
    accompanimentType: "expert_creation",
    paymentFrequency: "monthly",
  },
};

export const useSignupFormStore = create<SignupFormState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCurrentStep: (step) => {
        const projectType = get().formValues.projectType as SignupProjectType;
        const steps = getStepsForProjectType(projectType);
        const safeStep = Math.max(0, Math.min(step, steps.length - 1));
        set({ currentStep: safeStep });
      },

      goToNextStep: () =>
        set((state) => {
          const projectType = state.formValues.projectType as SignupProjectType;
          const steps = getStepsForProjectType(projectType);
          return {
            currentStep:
              state.currentStep < steps.length - 1
                ? state.currentStep + 1
                : state.currentStep,
          };
        }),

      goToPreviousStep: () =>
        set((state) => ({
          currentStep: state.currentStep > 0 ? state.currentStep - 1 : 0,
        })),

      setFormData: (data) => {
        const oldValues = get().formValues;
        const newValues: SignupFormValues = { ...oldValues, ...data };

        if (
          data.projectType &&
          data.projectType !== oldValues.projectType
        ) {
          const accompanimentType = String(
            newValues.accompanimentType ?? ""
          );

          newValues.accompanimentType = accompanimentType.startsWith("expert_")
            ? (`expert_${data.projectType}` as SignupFormValues["accompanimentType"])
            : "solo";

          const nextSteps = getStepsForProjectType(
            data.projectType as SignupProjectType
          );

          set({
            formValues: newValues,
            currentStep: Math.min(get().currentStep, nextSteps.length - 1),
          });
          return;
        }

        set({ formValues: newValues });
      },

      reset: () => {
        set(initialState);
        localStorage.removeItem("signup-form-storage");
      },
    }),
    {
      name: "signup-form-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const useSignupSteps = () => {
  const projectType = useSignupFormStore(
    (state) => state.formValues.projectType
  ) as SignupProjectType | undefined;

  const steps = getStepsForProjectType(projectType);
  const currentStep = useSignupFormStore((state) => state.currentStep);
  const currentStepConfig = steps[currentStep] ?? creationSteps[0];
  const currentStepId = currentStepConfig?.id;
  const currentSchema = getStepSchema(currentStepId, projectType);

  return {
    steps,
    currentStepId,
    currentSchema,
    currentStepConfig,
    isFirstStep: currentStep <= 0,
    isLastStep: currentStep >= steps.length - 1,
  };
};

export { getFullSchema };