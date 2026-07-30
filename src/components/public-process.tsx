"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Building2, FileSignature, MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Headline } from "@/components/ui/headline";

const steps = [
  {
    icon: Building2,
    label: "01",
    title: "Choisir le centre",
    description: "Sélectionnez une adresse active parmi les centres ouverts à l'inscription.",
  },
  {
    icon: FileSignature,
    label: "02",
    title: "Signer le contrat",
    description: "Complétez le dossier, signez en ligne et transmettez les justificatifs requis.",
  },
  {
    icon: BadgeCheck,
    label: "03",
    title: "Recevoir l'attestation",
    description: "Le contrat et l'attestation sont générés puis accessibles dans l'espace client.",
  },
  {
    icon: MailCheck,
    label: "04",
    title: "Piloter le courrier",
    description: "Suivez vos courriers, notifications, scans et réexpéditions selon votre offre.",
  },
];

export default function PublicProcess() {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-20 text-white md:py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-primary/25 blur-[110px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyan-400/15 blur-[100px]" />
      </div>

      <div className="container relative px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-blue-100">
              Parcours maîtrisé
            </div>
            <Headline className="text-white">
              Une inscription claire, de la demande à la <strong>mise en service</strong>
            </Headline>
            <p className="max-w-xl text-lg leading-8 text-slate-300">
              Le site vitrine n'est pas une simple façade : il ouvre directement sur un
              parcours opérationnel connecté au SaaS, aux documents, aux rôles et au courrier.
            </p>
            <Button asChild size="lg" className="h-12 rounded-full px-7 font-bold">
              <Link href="/signup" className="flex items-center gap-2">
                Démarrer maintenant
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/10 backdrop-blur"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-primary">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.25em] text-white/40">
                    {step.label}
                  </span>
                </div>
                <h3 className="text-lg font-black tracking-tight">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
