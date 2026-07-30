import Link from "next/link";
import Script from "next/script";
import { Building2, Check, FileSignature, Handshake, RefreshCcw, ShieldCheck, Zap } from "lucide-react";

import Footer from "@/components/contact";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Headline } from "@/components/ui/headline";

const benefits = [
  {
    icon: ShieldCheck,
    title: "Dossier sécurisé",
    description:
      "Les éléments sensibles sont vérifiés avant transmission pour limiter les erreurs de forme.",
  },
  {
    icon: Zap,
    title: "Processus cadré",
    description:
      "Chaque étape est structurée : décision, pièces, documents, dépôt et suivi du changement d'adresse.",
  },
  {
    icon: Handshake,
    title: "Accompagnement humain",
    description:
      "Les cas particuliers sont traités avec l'équipe afin d'éviter une automatisation aveugle.",
  },
];

const includedItems = [
  "Analyse des informations utiles au transfert.",
  "Préparation des documents de suivi et de formalités.",
  "Mise à jour de l'adresse de domiciliation dans le parcours CCS DOM.",
  "Centralisation des justificatifs et pièces dans l'espace client.",
  "Suivi du dossier jusqu'à validation opérationnelle.",
  "Accès aux courriers et documents depuis le tableau de bord.",
];

const faqItems = [
  {
    question: "Pourquoi transférer son siège avec accompagnement ?",
    answer:
      "Le transfert implique des formalités précises. Un accompagnement permet de cadrer les pièces, les documents et les étapes pour réduire les risques d'oubli.",
  },
  {
    question: "Le numéro SIRET change-t-il ?",
    answer:
      "Le SIREN reste le même, mais le SIRET peut changer car il dépend de l'établissement et de l'adresse. Les démarches doivent être vérifiées selon le cas.",
  },
  {
    question: "Quels documents faut-il prévoir ?",
    answer:
      "Il faut généralement un Kbis récent, les statuts, une pièce d'identité du dirigeant et les éléments liés à la décision de transfert. La liste exacte dépend de la situation.",
  },
];

export default function TransfertEntreprisePage() {
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Accueil",
        item: "https://ccsdom.fr/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Transfert d'entreprise",
      },
    ],
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const serviceStructuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Transfert de siège social",
    provider: {
      "@type": "Organization",
      name: "CCS DOM",
    },
    name: "Accompagnement au transfert de siège social",
    description:
      "Accompagnement administratif et documentaire pour transférer le siège social d'une entreprise.",
    url: "https://ccsdom.fr/transfert-entreprise",
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-950">
      <Script
        id="breadcrumb-structured-data-transfert"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />
      <Script
        id="faq-structured-data-transfert"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <Script
        id="service-structured-data-transfert"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceStructuredData) }}
      />
      <Header />
      <main className="flex-grow">
        <div className="container mt-8 px-4 md:px-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Accueil</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Transfert d'entreprise</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <section className="relative overflow-hidden bg-slate-50 py-16 text-center md:py-24">
          <div className="pointer-events-none absolute left-[-10%] top-[-25%] h-96 w-96 rounded-full bg-primary/15 blur-[120px]" />
          <div className="container relative px-4 md:px-6">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-primary shadow-sm ring-1 ring-slate-200">
              <RefreshCcw className="h-8 w-8" />
            </div>
            <Headline as="h1" className="text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
              Transférez votre siège social avec <strong>méthode</strong>
            </Headline>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600 md:text-xl">
              Changer d'adresse ne doit pas désorganiser votre activité. CCS DOM vous aide
              à cadrer le transfert, la domiciliation et les documents associés.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="h-12 rounded-full px-7 font-bold">
                <Link href="/signup">Lancer mon transfert</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-slate-300 bg-white px-7 font-bold">
                <Link href="/contact">Demander un avis</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="container px-4 md:px-6">
            <div className="grid gap-5 md:grid-cols-3">
              {benefits.map((benefit) => (
                <Card key={benefit.title} className="border-slate-200 bg-slate-50/70 shadow-sm">
                  <CardHeader>
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary shadow-sm ring-1 ring-slate-200">
                      <benefit.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl font-black tracking-tight">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-7 text-slate-600">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 py-20 text-white md:py-28">
          <div className="container grid gap-10 px-4 md:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-blue-100">
                Prestation structurée
              </div>
              <h2 className="text-3xl font-black tracking-tight md:text-5xl">
                Un transfert suivi, documenté et relié à votre espace client.
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-300">
                L'enjeu n'est pas seulement de changer une adresse : il faut conserver
                la continuité documentaire, le courrier et la traçabilité.
              </p>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/20">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary">
                <FileSignature className="h-6 w-6" />
              </div>
              <ul className="grid gap-4 sm:grid-cols-2">
                {includedItems.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-7 text-slate-200">
                    <Check className="mt-1 h-5 w-5 shrink-0 text-emerald-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="container px-4 md:px-6">
            <div className="mx-auto mb-10 max-w-3xl text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Building2 className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-black tracking-tight md:text-4xl">
                Questions fréquentes sur le transfert
              </h2>
            </div>
            <div className="mx-auto max-w-4xl rounded-[2rem] border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/5 md:p-8">
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                  <AccordionItem value={`item-${index}`} key={item.question} className="border-slate-200 last:border-0">
                    <AccordionTrigger className="py-6 text-left text-lg font-black text-slate-950 hover:text-primary">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="pb-6 text-base leading-8 text-slate-600">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
