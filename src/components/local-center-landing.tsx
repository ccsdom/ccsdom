import Link from "next/link";
import Script from "next/script";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  FileCheck2,
  MailCheck,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import Footer from "@/components/contact";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
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
import type { Address } from "@/lib/addresses";

type LocalCenterLandingProps = {
  center: Address;
  cityLabel: string;
  intro: string;
  localBenefits: string[];
  seoSections: Array<{
    title: string;
    body: string;
  }>;
  faqItems: Array<{
    question: string;
    answer: string;
  }>;
};

const processSteps = [
  "Choisissez le centre et l'offre courrier adaptés à votre usage.",
  "Complétez votre dossier et signez le contrat de domiciliation en ligne.",
  "Recevez votre attestation après validation du dossier.",
  "Pilotez vos documents, factures et courriers depuis votre espace client.",
];

const conversionPoints = [
  "Contrat et attestation après validation",
  "Paiement sécurisé et factures centralisées",
  "Courrier adapté au forfait choisi",
  "Prix affichés hors taxes (HT)",
];

const validationPoints = [
  {
    title: "Avant validation",
    text: "Le dossier est vérifié par le centre : identité, société, signature et cohérence des informations fournies.",
  },
  {
    title: "Documents remis",
    text: "Le contrat de domiciliation et l'attestation sont accessibles dans l'espace client une fois le dossier validé.",
  },
  {
    title: "Exploitation quotidienne",
    text: "Le courrier, les factures et les documents restent centralisés, avec des services activés selon l'offre choisie.",
  },
];

export default function LocalCenterLanding({
  center,
  cityLabel,
  intro,
  localBenefits,
  seoSections,
  faqItems,
}: LocalCenterLandingProps) {
  const pageUrl =
    center.id === "orly_ville"
      ? "https://ccsdom.fr/domiciliation-orly"
      : "https://ccsdom.fr/domiciliation-paris-12";
  const signupHref = `/signup?center=${encodeURIComponent(center.id)}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": `${pageUrl}#localbusiness`,
        name: center.name,
        url: pageUrl,
        parentOrganization: {
          "@id": "https://ccsdom.fr/#organization",
        },
        address: {
          "@type": "PostalAddress",
          streetAddress: center.street,
          postalCode: center.zip,
          addressLocality: center.city,
          addressCountry: center.country,
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: center.lat,
          longitude: center.lng,
        },
        telephone: "+33-1-88-27-34-10",
        priceRange: "€€",
      },
      {
        "@type": "Service",
        "@id": `${pageUrl}#service`,
        name: `Domiciliation d'entreprise à ${cityLabel}`,
        serviceType: "Domiciliation commerciale agréée",
        provider: {
          "@id": `${pageUrl}#localbusiness`,
        },
        areaServed: {
          "@type": "City",
          name: center.city,
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
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
            name: `Domiciliation ${cityLabel}`,
            item: pageUrl,
          },
        ],
      },
      {
        "@type": "HowTo",
        "@id": `${pageUrl}#howto`,
        name: `Comment domicilier son entreprise à ${cityLabel}`,
        step: processSteps.map((step, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          text: step,
        })),
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-950">
      <Script
        id={`local-center-structured-data-${center.id}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
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
                <BreadcrumbPage>Domiciliation {cityLabel}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <section className="relative overflow-hidden bg-slate-50 py-16 md:py-24">
          <div className="pointer-events-none absolute left-[-12%] top-[-30%] h-96 w-96 rounded-full bg-primary/15 blur-[120px]" />
          <div className="container relative grid gap-12 px-4 md:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <div>
              <div className="mb-6 inline-flex rounded-full border border-primary/15 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary shadow-sm">
                Centre de domiciliation agréé
              </div>
              <Headline as="h1" className="max-w-4xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
                Domiciliation d'entreprise à <strong>{cityLabel}</strong>
              </Headline>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
                {intro}
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button asChild size="lg" className="h-12 rounded-full px-7 font-bold">
                  <Link href={signupHref} className="flex items-center gap-2">
                    Domicilier mon entreprise
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-slate-300 bg-white px-7 font-bold">
                  <Link href="/#tarifs">Comparer les offres</Link>
                </Button>
              </div>
            </div>

            <Card className="border-slate-200 bg-white shadow-xl shadow-slate-900/5">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <MapPin className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl font-black tracking-tight">
                  {center.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 text-slate-600">
                <p className="text-lg leading-8">
                  {center.street},<br />
                  {center.zip} {center.city}
                </p>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900">
                  {center.companyApproval}
                </div>
                <div className="space-y-2 text-sm">
                  <p>{center.companyName}</p>
                  <p>{center.companyType} - Capital {center.companyCapital}</p>
                  <p>{center.companyRcs}</p>
                </div>
                <div className="rounded-3xl border border-primary/15 bg-primary/5 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                    Centre présélectionné
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    En lançant l'inscription depuis cette page, ce centre sera proposé
                    automatiquement dans le parcours.
                  </p>
                  <Button asChild className="mt-4 h-11 w-full rounded-full font-bold">
                    <Link href={signupHref}>Choisir {cityLabel}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-white py-12">
          <div className="container px-4 md:px-6">
            <div className="grid gap-4 md:grid-cols-[1fr_1.1fr_auto] md:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                  Choisir mon centre
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
                  Démarrer avec {center.name}
                </h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {conversionPoints.map((point) => (
                  <div key={point} className="flex gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
              <Button asChild size="lg" className="h-12 rounded-full px-7 font-bold">
                <Link href={signupHref} className="flex items-center gap-2">
                  Commencer
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-16 md:py-20">
          <div className="container px-4 md:px-6">
            <div className="mb-8 max-w-3xl">
              <div className="mb-4 inline-flex rounded-full border border-primary/15 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary shadow-sm">
                Ce qu'il faut savoir
              </div>
              <h2 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
                Une adresse de domiciliation ne s'active qu'après contrôle du dossier
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600 md:text-lg">
                Le parcours est rapide, mais reste encadré : le centre conserve la main sur
                la validation, la conformité des pièces et la mise à disposition des documents.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {validationPoints.map((point) => (
                <Card key={point.title} className="border-slate-200 bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-black tracking-tight">
                      {point.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-7 text-slate-600">{point.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="container px-4 md:px-6">
            <div className="mb-12 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div>
                <div className="mb-4 inline-flex rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary">
                  Pourquoi ce centre ?
                </div>
                <h2 className="text-3xl font-black tracking-tight md:text-5xl">
                  Une adresse claire, des documents prêts, un courrier maîtrisé
                </h2>
              </div>
              <p className="text-lg leading-8 text-slate-600">
                CCS DOM associe l'adresse de domiciliation à un espace numérique :
                contrat, attestation, factures, courriers et notifications restent centralisés.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Building2, title: "Adresse agréée", text: "Une adresse de siège social exploitable après validation du dossier." },
                { icon: FileCheck2, title: "Documents", text: "Contrat et attestation disponibles depuis l'espace client." },
                { icon: MailCheck, title: "Courrier", text: "Scan, notification, réexpédition ou résumé IA selon l'offre choisie." },
                { icon: ShieldCheck, title: "Traçabilité", text: "Un parcours suivi par les équipes du centre et documenté dans l'application." },
              ].map((item) => (
                <Card key={item.title} className="border-slate-200 bg-slate-50/70 shadow-sm">
                  <CardHeader>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary shadow-sm ring-1 ring-slate-200">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl font-black tracking-tight">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-7 text-slate-600">{item.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white py-20 md:py-28">
          <div className="container px-4 md:px-6">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <div className="mx-auto mb-4 inline-flex rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary">
                Guide local
              </div>
              <h2 className="text-3xl font-black tracking-tight md:text-5xl">
                Bien choisir sa domiciliation à {cityLabel}
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                Une page locale doit répondre aux vraies questions : adresse, documents, courrier,
                validation, usage administratif et continuité du siège social.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {seoSections.map((section) => (
                <Card key={section.title} className="border-slate-200 bg-slate-50/70 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-black tracking-tight">
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-7 text-slate-600">{section.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-20 md:py-28">
          <div className="container grid gap-10 px-4 md:px-6 lg:grid-cols-2 lg:items-start">
            <div>
              <div className="mb-4 inline-flex rounded-full border border-primary/15 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary shadow-sm">
                Atouts locaux
              </div>
              <h2 className="text-3xl font-black tracking-tight md:text-5xl">
                Une domiciliation pensée pour votre quotidien
              </h2>
              <div className="mt-8 space-y-4">
                {localBenefits.map((benefit) => (
                  <div key={benefit} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
                    <p className="text-sm leading-7 text-slate-600">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            <Card className="border-slate-200 bg-white shadow-xl shadow-slate-900/5">
              <CardHeader>
                <CardTitle className="text-2xl font-black tracking-tight">
                  Le parcours en 4 étapes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {processSteps.map((step, index) => (
                  <div key={step} className="flex gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-black text-white">
                      {index + 1}
                    </div>
                    <p className="pt-1 text-sm leading-7 text-slate-600">{step}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="faq" className="py-20 md:py-28">
          <div className="container px-4 md:px-6">
            <div className="mx-auto mb-10 max-w-3xl text-center">
              <div className="mx-auto mb-4 inline-flex rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary">
                Questions fréquentes
              </div>
              <h2 className="text-3xl font-black tracking-tight md:text-5xl">
                Domiciliation à {cityLabel} : les réponses utiles
              </h2>
            </div>
            <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2">
              {faqItems.map((item) => (
                <Card key={item.question} className="border-slate-200 bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-black tracking-tight">
                      {item.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-7 text-slate-600">{item.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="container rounded-[2rem] bg-slate-950 px-6 py-14 text-center text-white md:px-10">
            <h2 className="text-3xl font-black tracking-tight md:text-5xl">
              Prêt à domicilier votre entreprise à {cityLabel} ?
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
              Lancez le parcours en ligne : vous pourrez choisir votre offre, compléter votre dossier et suivre la validation depuis votre espace client.
            </p>
            <Button asChild size="lg" className="mt-8 h-12 rounded-full px-7 font-bold">
              <Link href={signupHref}>Commencer maintenant</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
