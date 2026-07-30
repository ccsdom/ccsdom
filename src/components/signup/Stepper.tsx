'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';
import Logo from '../logo';
import { ZodTypeAny } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';

interface Step {
  id: string;
  name: string;
  description: string;
  schema: ZodTypeAny;
}

interface StepperProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  steps: Step[];
}

export const Stepper = ({ currentStep, setCurrentStep, steps }: StepperProps) => {
  return (
    <div className="flex flex-col gap-10">
      <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 w-fit mb-4">
        <Logo showSlogan={false} />
      </div>

      <nav aria-label="Progress">
        <ol role="list" className="space-y-6">
          {steps.map((step, stepIdx) => {
            const isCompleted = stepIdx < currentStep;
            const isCurrent = stepIdx === currentStep;

            return (
              <li key={step.id} className="relative group">
                {stepIdx < steps.length - 1 && (
                  <div
                    className={cn(
                      "absolute left-4 top-10 -ml-px h-[calc(100%-24px)] w-[2px] transition-colors duration-500",
                      isCompleted ? "bg-primary" : "bg-white/5"
                    )}
                    aria-hidden="true"
                  />
                )}

                <div
                  className={cn(
                    'relative flex items-start transition-all duration-300',
                    isCompleted ? 'cursor-pointer hover:translate-x-1' : 'cursor-default'
                  )}
                  onClick={() => isCompleted && setCurrentStep(stepIdx)}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  <span className="h-9 flex items-center" aria-hidden="true">
                    <motion.span
                      layout
                      className={cn(
                        'relative z-10 w-9 h-9 flex items-center justify-center rounded-xl border-2 transition-all duration-500',
                        isCompleted
                          ? 'bg-primary border-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)]'
                          : isCurrent
                          ? 'border-primary text-primary shadow-[0_0_20px_rgba(var(--primary),0.2)] bg-primary/5 scale-110'
                          : 'border-white/10 bg-white/5 text-muted-foreground'
                      )}
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {isCompleted ? (
                          <motion.span
                            key="check"
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 45 }}
                          >
                            <Check className="w-5 h-5 stroke-[3px]" />
                          </motion.span>
                        ) : (
                          <motion.span
                            key="number"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-xs font-bold font-mono"
                          >
                            {String(stepIdx + 1).padStart(2, '0')}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.span>
                  </span>

                  <span className="ml-5 flex min-w-0 flex-col mt-1">
                    <motion.span
                      layout
                      className={cn(
                        'text-sm font-bold tracking-tight transition-colors duration-300',
                        isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {step.name}
                    </motion.span>
                    <AnimatePresence>
                      {isCurrent && (
                        <motion.span
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="text-[11px] text-muted-foreground/70 font-medium leading-tight overflow-hidden mt-1 pr-4"
                        >
                          {step.description}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="mt-auto pt-8 border-t border-white/5">
        <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/30">
          Plateforme Sécurisée — Elite Signature
        </p>
      </div>
    </div>
  );
};
