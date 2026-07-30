import Link from "next/link";
import Script from "next/script";
import { Award, Check, FileText, Landmark, Send, ShieldCheck, Users } from "lucide-react";

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

const timelineSteps = [
  {
    icon: FileText,
    title: "Dossier en ligne",
    description:
      "Vous renseignez les informations essentielles, choisissez le centre et préparez les pièces nécessaires.",
  },
  {
    icon: Users,
    title: "Contrôle du dossier",
    description:
      "L'équipe vérifie la cohérence des informations et signale les éléments à compléter avant transmission.",
  },
  {
    icon: Send,
    title: "Formalités préparées",
    description:
      "Les documents utiles sont constitués pour faciliter les démarches d'immatriculation.",
  },
  {
    icon: Award,
    title: "Suivi jusqu'à validation",
    description:
      "Vous suivez l'avancement et retrouvez vos documents dans l'espace client sécurisé.",
  },
];

const legalForms = [
  "SASU",
  "SAS",
  "SARL",
  "EURL",
  "Micro-entreprise",
];

const requiredDocuments = [
  "Pièce d'identité du dirigeant en cours de validité.",
  "Justificatif de domicile récent du dirigeant.",
  "Informations sur l'activité, la dénomination et les associés si nécessaire.",
  "Éléments complémentaires selon la forme juridique retenue.",
];

const faqItems = [
  {
    question: "Puis-je choisir uniquement la domiciliation ?",
    answer:
      "Oui. L'accompagnement à la création est optionnel. Vous pouvez choisir une offre de domiciliation et gérer vous-même vos formalités.",
  },
  {
    question: "Les frais de greffe ou d'annonce légale sont-ils inclus ?",
    answer:
      "Non, ces frais dépendent du dossier et des organismes concernés. Ils restent à la charge du client, sauf mention spécifique dans une offre future.",
  },
  {
    question: "Combien de temps prend la création ?",
    answer:
      "Le délai dépend de la complétude du dossier, des organismes compétents et de la période. CCS DOM peut faciliter la préparation, mais ne garantit pas un délai légal fixe.",
  },
  {
    question: "Quels statuts pouvez-vous accompagner ?",
    answer:
      "Les formes courantes comme SASU, SAS, SARL, EURL ou micro-entreprise peuvent être étudiées. Les cas complexes doivent être vérifiés avec l'équipe.",
  },
];

export default function CreationEntreprisePage() {
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
        name: "Création d'entreprise",
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
    serviceType: "Accompagnement à la création d'entreprise",
    provider: {
      "@type": "Organization",
      name: "CCS DOM",
    },
    name: "Accompagnement à la création d'entreprise",
    description:
      "Préparation du dossier, domiciliation et accompagnement administratif pour la création d'entreprise.",
    url: "https://ccsdom.fr/creation-entreprise",
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-950">
      <Script
        id="breadcrumb-structured-data-creation"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />
      <Script
        id="faq-structured-data-creation"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <Script
        id="service-structured-data-creation"
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
                <BreadcrumbPage>Création d'entreprise</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <section className="relative overflow-hidden bg-slate-50 py-16 text-center md:py-24">
          <div className="pointer-events-none absolute right-[-10%] top-[-30%] h-96 w-96 rounded-full bg-primary/15 blur-[120px]" />
          <div className="container relative px-4 md:px-6">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-primary shadow-sm ring-1 ring-slate-200">
              <Landmark className="h-8 w-8" />
            </div>
            <Headline as="h1" className="text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
              Créez votre entreprise avec un <strong>dossier mieux cadré</strong>
            </Headline>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600 md:text-xl">
              Domiciliation, documents, justificatifs et accompagnement : CCS DOM vous aide
              à structurer votre création sans transformer les formalités en labyrinthe.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="h-12 rounded-full px-7 font-bold">
                <Link href="/signup">Lancer ma création</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-slate-300 bg-white px-7 font-bold">
                <Link href="/contact">Parler à l'équipe</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="container px-4 md:px-6">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <div className="mx-auto mb-4 inline-flex rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary">
                Méthode
              </div>
              <h2 className="text-3xl font-black tracking-tight md:text-5xl">
                Un parcours simple, sans promesse artificielle
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                L'objectif est de produire un dossier propre, vérifiable et exploitable.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-4">
              {timelineSteps.map((step, index) => (
                <Card key={step.title} className="border-slate-200 bg-slate-50/70 shadow-sm">
                  <CardHeader>
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary shadow-sm ring-1 ring-slate-200">
                        <step.icon className="h-6 w-6" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-300">
                        0{index + 1}
                      </span>
                    </div>
                    <CardTitle className="text-lg font-black tracking-tight">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-7 text-slate-600">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-20 md:py-28">
          <div className="container grid gap-8 px-4 md:px-6 lg:grid-cols-2">
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl font-black tracking-tight">
                  Formes juridiques courantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-5 text-sm leading-7 text-slate-600">
                  Le bon choix dépend de votre projet, de vos associés, de votre régime
                  social et de vos objectifs. Les cas sensibles doivent être vérifiés.
                </p>
                <div className="flex flex-wrap gap-2">
                  {legalForms.map((form) => (
                    <span key={form} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold">
                      {form}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <FileText className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl font-black tracking-tight">
                  Pièces à préparer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {requiredDocuments.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-7 text-slate-600">
                      <Check className="mt-1 h-5 w-5 shrink-0 text-emerald-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="container px-4 md:px-6">
            <div className="mx-auto mb-10 max-w-3xl text-center">
              <h2 className="text-3xl font-black tracking-tight md:text-4xl">
                Questions fréquentes sur la création
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
