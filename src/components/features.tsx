"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Bot, FileText, LayoutDashboard, ScanLine } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Headline } from "@/components/ui/headline";

const featureHighlights = [
  {
    icon: ScanLine,
    title: "Courrier qualifié",
    description:
      "Le courrier peut être scanné, classé, résumé et signalé comme prioritaire selon le forfait du client.",
  },
  {
    icon: LayoutDashboard,
    title: "Espaces par rôle",
    description:
      "Client, manager, secrétaire et super admin disposent chacun d'une interface dédiée à leur mission.",
  },
  {
    icon: FileText,
    title: "Documents & factures",
    description:
      "Contrats, attestations, justificatifs et factures restent accessibles dans un hub documentaire cohérent.",
  },
  {
    icon: Bot,
    title: "Assistance augmentée",
    description:
      "Le chatbot public oriente les visiteurs, tandis que les équipes gardent la main pour les sujets sensibles.",
  },
];

export default function Features() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section id="features" className="relative overflow-hidden bg-slate-50 py-20 md:py-28">
      <div className="absolute left-1/2 top-0 h-64 w-[80%] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
      <div className="container relative px-4 md:px-6">
        <div className="mx-auto mb-14 max-w-3xl space-y-5 text-center">
          <div className="mx-auto inline-flex rounded-full border border-primary/15 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary shadow-sm">
            SaaS métier
          </div>
          <Headline className="text-slate-950">
            Une plateforme pensée pour la <strong>production quotidienne</strong>
          </Headline>
          <p className="mx-auto max-w-[760px] text-lg leading-8 text-slate-600">
            CCS DOM ne se limite pas à vendre une adresse : l'application organise les
            opérations, les droits, les documents, les courriers et la relation client.
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {featureHighlights.map((feature) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <Card className="group flex h-full flex-col border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10">
                <CardHeader>
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-black tracking-tight text-slate-950">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm leading-7 text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-14 text-center"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-slate-300 bg-white px-8 font-bold">
            <Link href="/features" className="flex items-center gap-2">
              Découvrir la plateforme
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
