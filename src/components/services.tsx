"use client";

import { motion } from "framer-motion";
import { Building2, FileCheck2, Mail, Route, ShieldCheck, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Headline } from "@/components/ui/headline";

const services = [
  {
    icon: Building2,
    title: "Domiciliation agréée",
    description:
      "Une adresse de siège social dans un centre actif, avec un parcours clair pour l'inscription et les documents obligatoires.",
  },
  {
    icon: Mail,
    title: "Courrier digitalisé",
    description:
      "Réception, scan, notification, réexpédition et suivi selon l'offre choisie, pour réduire les déplacements inutiles.",
  },
  {
    icon: Users,
    title: "Création & transfert",
    description:
      "Un accompagnement possible pour les formalités de création ou de transfert de siège, avec suivi du dossier côté manager.",
  },
  {
    icon: FileCheck2,
    title: "Documents centralisés",
    description:
      "Contrat, attestation de domiciliation, factures et documents clients réunis dans un espace sécurisé.",
  },
];

const assurances = [
  { icon: ShieldCheck, label: "Centres contrôlés" },
  { icon: Route, label: "Parcours 100% en ligne" },
  { icon: FileCheck2, label: "Documents traçables" },
];

export default function Services() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
  };

  return (
    <section id="services" className="relative overflow-hidden bg-white py-20 md:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      <div className="container relative px-4 md:px-6">
        <div className="mx-auto mb-14 max-w-3xl space-y-5 text-center">
          <div className="mx-auto inline-flex rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary">
            Une plateforme, plusieurs usages
          </div>
          <Headline className="text-slate-950">
            Tout ce qu'il faut pour <strong>domicilier</strong> et piloter votre société
          </Headline>
          <p className="text-lg leading-8 text-slate-600">
            CCS DOM réunit l'adresse, les documents, la facturation et le courrier dans
            un environnement pensé pour les entrepreneurs, les managers de centre et les équipes opérationnelles.
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {services.map((service) => (
            <motion.div key={service.title} variants={cardVariants}>
              <Card className="group relative flex h-full flex-col overflow-hidden border-slate-200 bg-slate-50/70 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:bg-white hover:shadow-xl hover:shadow-slate-900/10">
                <CardHeader className="relative z-10">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary shadow-sm ring-1 ring-slate-200 transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                    <service.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-black tracking-tight text-slate-950">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 flex-grow">
                  <p className="text-sm leading-7 text-slate-600">{service.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {assurances.map((item) => (
            <span
              key={item.label}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm"
            >
              <item.icon className="h-4 w-4 text-primary" />
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
