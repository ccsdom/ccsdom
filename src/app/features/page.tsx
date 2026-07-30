import Link from "next/link";
import Script from "next/script";
import {
  ArrowRight,
  Bot,
  Building2,
  FileCheck2,
  LayoutDashboard,
  MailCheck,
  ShieldCheck,
  UsersRound,
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

const platformFeatures = [
  {
    icon: LayoutDashboard,
    title: "Espaces par rôle",
    description:
      "Client, manager, secrétaire et super admin disposent chacun d'une interface adaptée à leurs responsabilités.",
  },
  {
    icon: MailCheck,
    title: "Courrier digital",
    description:
      "Scan, notification, classement, résumé IA et alerte prioritaire selon l'offre activée pour le client.",
  },
  {
    icon: FileCheck2,
    title: "Documents centralisés",
    description:
      "Contrats, attestations, justificatifs, factures et courriers sont regroupés dans un espace documentaire cohérent.",
  },
  {
    icon: Building2,
    title: "Réseau multi-centres",
    description:
      "Le modèle SaaS permet d'ajouter des centres, d'isoler leurs données et de suivre leur activité.",
  },
  {
    icon: ShieldCheck,
    title: "Traçabilité métier",
    description:
      "Les actions sensibles sont suivies pour renforcer la lisibilité opérationnelle et la maîtrise des accès.",
  },
  {
    icon: Bot,
    title: "Assistance augmentée",
    description:
      "L'IA aide à orienter, qualifier et résumer, tout en laissant les équipes garder la main sur les décisions importantes.",
  },
];

const roleHighlights = [
  "Le client consulte ses courriers, documents, factures et abonnement.",
  "Le manager pilote son centre, ses clients, ses validations et son équipe.",
  "La secrétaire traite les courriers, scans, relances et tâches opérationnelles.",
  "Le super admin supervise le réseau, les centres, les quotas et la facturation SaaS.",
];

export default function FeaturesPage() {
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
        name: "Plateforme",
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-950">
      <Script
        id="breadcrumb-structured-data-features"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
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
                <BreadcrumbPage>Plateforme</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <section className="relative overflow-hidden bg-slate-50 py-16 md:py-24">
          <div className="pointer-events-none absolute left-[-10%] top-[-30%] h-96 w-96 rounded-full bg-primary/15 blur-[120px]" />
          <div className="container relative px-4 md:px-6">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mx-auto mb-6 inline-flex rounded-full border border-primary/15 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary shadow-sm">
                Plateforme CCS DOM
              </div>
              <Headline as="h1" className="text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
                Plus qu'une adresse, un <strong>poste de pilotage</strong>
              </Headline>
              <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600 md:text-xl">
                CCS DOM relie la domiciliation, le courrier, les documents, la facturation
                et les rôles opérationnels dans une plateforme pensée pour le quotidien
                réel d'un centre de domiciliation.
              </p>
              <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
                <Button asChild size="lg" className="h-12 rounded-full px-7 font-bold">
                  <Link href="/signup" className="flex items-center gap-2">
                    Commencer
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-slate-300 bg-white px-7 font-bold">
                  <Link href="/#tarifs">Voir les offres</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="container px-4 md:px-6">
            <div className="mb-12 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div>
                <div className="mb-4 inline-flex rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary">
                  Fonctionnalités
                </div>
                <h2 className="text-3xl font-black tracking-tight md:text-5xl">
                  Une application construite autour des usages métier
                </h2>
              </div>
              <p className="text-lg leading-8 text-slate-600">
                Chaque module répond à une mission concrète : valider un dossier,
                scanner un courrier, envoyer une notification, retrouver une facture,
                superviser un centre ou accompagner un client.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {platformFeatures.map((feature) => (
                <Card key={feature.title} className="border-slate-200 bg-slate-50/70 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl hover:shadow-slate-900/10">
                  <CardHeader>
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary shadow-sm ring-1 ring-slate-200">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl font-black tracking-tight">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-7 text-slate-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 py-20 text-white md:py-28">
          <div className="container grid gap-10 px-4 md:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-blue-100">
                Organisation par rôle
              </div>
              <h2 className="text-3xl font-black tracking-tight md:text-5xl">
                Chacun voit ce qu'il doit voir, chacun agit au bon niveau.
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-300">
                C'est le socle d'un SaaS sérieux : moins de confusion, moins de risques,
                plus de maîtrise pour les équipes et les clients.
              </p>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/20">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary">
                <UsersRound className="h-6 w-6" />
              </div>
              <ul className="space-y-4">
                {roleHighlights.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-7 text-slate-200">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 md:py-20">
          <div className="container px-4 text-center md:px-6">
            <h2 className="text-3xl font-black tracking-tight md:text-4xl">
              Prêt à tester la plateforme côté client ?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              Lancez une inscription, choisissez un centre et découvrez le parcours complet.
            </p>
            <Button asChild size="lg" className="mt-8 h-12 rounded-full px-8 font-bold">
              <Link href="/signup">Démarrer une domiciliation</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
