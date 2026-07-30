"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Building2, FileCheck2, MailCheck, ShieldCheck } from "lucide-react";
import { useInView } from "react-intersection-observer";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const proofItems = [
  {
    icon: ShieldCheck,
    title: "Centres agréés",
    description: "Orly Ville et Paris 12e aujourd'hui, réseau extensible demain.",
  },
  {
    icon: FileCheck2,
    title: "Documents prêts",
    description: "Contrat, attestation et factures centralisés dans l'espace client.",
  },
  {
    icon: MailCheck,
    title: "Courrier digital",
    description: "Scan, notifications, réexpédition et résumé IA selon l'offre.",
  },
];

const heroStats = [
  { value: "2", label: "Centres actifs" },
  { value: "4", label: "Offres courrier" },
  { value: "24/7", label: "Espace client" },
];

const UnderlineSvg = ({ inView }: { inView: boolean }) => (
  <svg
    className={cn(
      "absolute -bottom-2 left-0 h-auto w-full text-primary transition-opacity duration-1000 ease-out",
      inView ? "opacity-100" : "opacity-0"
    )}
    viewBox="0 0 206 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
  >
    <path
      d="M1.5 8.9133C31.5 2.4133 118.9 -5.0867 204.5 8.9133"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      className={cn("path-animation", inView && "animate")}
    />
  </svg>
);

export default function Hero() {
  const { ref: headlineRef, inView: headlineInView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.16,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" as const },
    },
  };

  return (
    <section className="relative w-full overflow-hidden bg-slate-50 py-20 lg:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12%] top-[-20%] h-[28rem] w-[28rem] rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute right-[-10%] top-[18%] h-[22rem] w-[22rem] rounded-full bg-cyan-400/10 blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 h-px w-[80%] -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>

      <div className="container relative px-4 md:px-6">
        <motion.div
          className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="flex flex-col justify-center text-center lg:text-left">
            <motion.div variants={itemVariants}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-primary shadow-sm">
                <Building2 className="h-4 w-4" />
                Domiciliation agréée et pilotée en ligne
              </div>

              <h1
                ref={headlineRef}
                className="mx-auto max-w-4xl text-5xl font-black leading-[0.98] tracking-[-0.06em] text-slate-950 sm:text-6xl md:text-7xl lg:mx-0"
              >
                Domiciliez votre entreprise dans un{" "}
                <span className="relative inline-block font-light">
                  centre agréé
                  <UnderlineSvg inView={headlineInView} />
                </span>
                , simplement.
              </h1>

              <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl lg:mx-0">
                Choisissez votre centre, signez votre contrat, recevez votre attestation et
                pilotez votre courrier depuis un espace sécurisé. Une expérience pensée pour
                les entrepreneurs qui veulent avancer vite, sans perdre le contrôle.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="mt-9 flex flex-col justify-center gap-4 min-[420px]:flex-row lg:justify-start"
            >
              <Button asChild size="lg" className="h-14 rounded-full px-8 text-base font-bold shadow-xl shadow-primary/20">
                <Link href="/signup" className="flex items-center gap-2">
                  Commencer ma domiciliation
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-14 rounded-full border-slate-300 bg-white px-8 text-base font-bold text-slate-800 shadow-sm hover:bg-slate-50"
              >
                <a href="#tarifs">Comparer les offres</a>
              </Button>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="mt-10 grid gap-3 sm:grid-cols-3"
            >
              {proofItems.map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl border border-slate-200 bg-white/90 p-4 text-left shadow-sm"
                >
                  <item.icon className="mb-3 h-5 w-5 text-primary" />
                  <p className="text-sm font-black text-slate-950">{item.title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{item.description}</p>
                </div>
              ))}
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="mt-10 grid grid-cols-3 gap-5 border-t border-slate-200 pt-8"
            >
              {heroStats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl font-black tracking-tight text-slate-950">{stat.value}</div>
                  <div className="mt-1 text-[0.68rem] font-black uppercase tracking-[0.18em] text-slate-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            variants={{
              hidden: { opacity: 0, scale: 0.96, y: 24 },
              visible: {
                opacity: 1,
                scale: 1,
                y: 0,
                transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 },
              },
            }}
            className="relative"
          >
            <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-primary/15 via-white to-cyan-400/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2.2rem] border border-white bg-white p-3 shadow-2xl shadow-slate-900/10">
              <div className="overflow-hidden rounded-[1.7rem] bg-slate-950">
                <Image
                  src="/images/hero_3d.webp"
                  alt="Plateforme CCS DOM pour gérer domiciliation, documents et courrier"
                  width={1200}
                  height={800}
                  className="h-[26rem] w-full object-cover opacity-90 md:h-[34rem]"
                  priority
                  sizes="(min-width: 1024px) 45vw, 100vw"
                />
              </div>

              <div className="absolute left-6 top-6 rounded-2xl border border-white/20 bg-white/95 p-4 shadow-xl backdrop-blur">
                <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-primary">
                  Dossier prêt
                </p>
                <p className="mt-1 text-sm font-black text-slate-950">
                  Contrat + attestation
                </p>
              </div>

              <div className="absolute bottom-6 right-6 w-[15rem] rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <MailCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-950">Courrier suivi</p>
                    <p className="text-xs text-slate-500">Notification selon l'offre</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 rounded-full bg-slate-100" />
                  <div className="h-2 w-3/4 rounded-full bg-slate-100" />
                  <div className="h-2 w-1/2 rounded-full bg-primary/20" />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
