import type { Metadata } from "next";
import Link from "next/link";

import Footer from "@/components/contact";
import Header from "@/components/header";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Headline } from "@/components/ui/headline";
import { allAddresses } from "@/lib/addresses";

export const metadata: Metadata = {
  title: "Mentions légales | CCS DOM",
  description:
    "Mentions légales de CCS DOM : éditeur du site, centres de domiciliation, hébergement, propriété intellectuelle, données personnelles et contact.",
  alternates: {
    canonical: "/mentions-legales",
  },
};

const lastUpdated = "12 juin 2026";

const publisherDetails = [
  ["Dénomination", "CONSULTING CONSEIL SERVICES"],
  ["Nom commercial", "CCS DOM"],
  ["Forme juridique", "SARL"],
  ["Capital social", "100 000 EUR"],
  ["Siège social", "25 Rue Edmond Rostand, 94310 Orly, France"],
  ["RCS", "Créteil 830 278 644"],
  ["TVA intracommunautaire", "FR82830278644"],
  ["Agrément de domiciliation", "Val-de-Marne AG/DOM/2024-06"],
  ["Directeur de la publication", "M. Rabah MAHFOUF"],
  ["Contact", "contact@ccsdom.fr - +33 1 88 27 34 10"],
];

const legalSections = [
  {
    title: "Objet du site",
    body:
      "Le site ccsdom.fr présente les services de domiciliation commerciale, de gestion du courrier, de génération documentaire, d'accompagnement administratif et d'accès à une plateforme SaaS dédiée aux clients, gestionnaires de centres, secrétaires et administrateurs.",
  },
  {
    title: "Accès et disponibilité",
    body:
      "Le site et les espaces applicatifs sont accessibles sous réserve des opérations de maintenance, incidents techniques, indisponibilités de fournisseurs tiers ou cas de force majeure. CCS DOM s'efforce d'assurer un service stable, sans garantir une disponibilité absolue.",
  },
  {
    title: "Prix et informations commerciales",
    body:
      "Les prix affichés sur le site et dans l'application sont indiqués hors taxes (HT), sauf mention contraire. Les conditions contractuelles, devis, factures, contrats de domiciliation et conditions générales applicables prévalent sur toute présentation synthétique du site.",
  },
  {
    title: "Propriété intellectuelle",
    body:
      "La structure du site, les textes, interfaces, logos, éléments graphiques, composants applicatifs et contenus éditoriaux sont protégés. Toute reproduction, représentation, adaptation ou exploitation non autorisée de tout ou partie du site est interdite.",
  },
  {
    title: "Responsabilité",
    body:
      "Les informations publiées sont fournies à titre informatif et peuvent évoluer. L'utilisateur reste responsable de la vérification des informations propres à sa situation, notamment pour les formalités juridiques, fiscales, administratives ou bancaires.",
  },
];

export default function MentionsLegalesPage() {
  const activeCenters = allAddresses.filter(
    (address) => address.status === "active" && address.publicSignupEnabled !== false
  );

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-950">
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
                <BreadcrumbPage>Mentions légales</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <section className="relative overflow-hidden bg-slate-50 py-16 md:py-24">
          <div className="pointer-events-none absolute left-[-10%] top-[-35%] h-96 w-96 rounded-full bg-primary/15 blur-[120px]" />
          <div className="container relative px-4 md:px-6">
            <div className="mx-auto max-w-4xl">
              <div className="mb-6 inline-flex rounded-full border border-primary/15 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary shadow-sm">
                Informations légales
              </div>
              <Headline as="h1" className="text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
                Mentions <strong>légales</strong>
              </Headline>
              <p className="mt-6 text-lg leading-8 text-slate-600">
                Informations relatives à l'éditeur du site, aux centres de domiciliation,
                à l'hébergement et aux conditions générales d'utilisation de ccsdom.fr.
              </p>
              <p className="mt-4 text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
                Dernière mise à jour : {lastUpdated}
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container px-4 md:px-6">
            <div className="mx-auto grid max-w-5xl gap-6">
              <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 md:p-10">
                <div className="mb-6">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                    Éditeur du site
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                    CONSULTING CONSEIL SERVICES
                  </h2>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {publisherDetails.map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                        {label}
                      </p>
                      <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">{value}</p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 md:p-10">
                <div className="mb-6">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                    Centres de domiciliation
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                    Adresses actuellement ouvertes à l'inscription
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Chaque centre peut être exploité par une entité juridique identifiée.
                    Les informations ci-dessous permettent d'identifier les centres actifs
                    proposés dans le parcours d'inscription.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {activeCenters.map((center) => (
                    <div key={center.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <p className="text-lg font-black tracking-tight text-slate-950">{center.name}</p>
                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        {center.companyName}
                        <br />
                        {center.companyType} - Capital {center.companyCapital}
                        <br />
                        {center.companyRcs}
                        <br />
                        {center.street}, {center.zip} {center.city}
                        <br />
                        {center.companyApproval}
                      </p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 md:p-10">
                <div className="mb-6">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                    Hébergement
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                    Infrastructure technique
                  </h2>
                </div>
                <p className="text-sm leading-8 text-slate-600">
                  Le site et l'application sont hébergés au moyen de Firebase App Hosting
                  et de services Google Cloud.
                  <br />
                  Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irlande.
                  <br />
                  Informations fournisseur :{" "}
                  <a
                    href="https://cloud.google.com/contact"
                    className="font-bold text-primary hover:underline"
                    rel="noreferrer"
                    target="_blank"
                  >
                    cloud.google.com/contact
                  </a>
                </p>
              </article>

              <div className="grid gap-4 md:grid-cols-2">
                {legalSections.map((section) => (
                  <article key={section.title} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-black tracking-tight text-slate-950">{section.title}</h2>
                    <p className="mt-4 text-sm leading-8 text-slate-600">{section.body}</p>
                  </article>
                ))}
              </div>

              <article className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-xl shadow-slate-900/10 md:p-10">
                <h2 className="text-2xl font-black tracking-tight">Données personnelles et cookies</h2>
                <p className="mt-4 text-sm leading-8 text-slate-300">
                  Les modalités de collecte et de traitement des données personnelles sont
                  détaillées dans la{" "}
                  <Link href="/politique-de-confidentialite" className="font-bold text-primary hover:underline">
                    politique de confidentialité
                  </Link>
                  . Le site peut utiliser des cookies nécessaires au fonctionnement, à la
                  sécurité et, avec consentement lorsque requis, à l'amélioration de l'expérience.
                </p>
              </article>

              <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <h2 className="text-xl font-black tracking-tight text-slate-950">Références utiles</h2>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href="https://entreprendre.service-public.gouv.fr/vosdroits/F37351"
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:border-primary hover:text-primary"
                    rel="noreferrer"
                    target="_blank"
                  >
                    Mentions obligatoires - Service-Public
                  </a>
                  <a
                    href="https://www.cnil.fr/fr/me-mettre-en-conformite/rgpd-par-ou-commencer"
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:border-primary hover:text-primary"
                    rel="noreferrer"
                    target="_blank"
                  >
                    RGPD - CNIL
                  </a>
                  <a
                    href="https://www.cnil.fr/fr/cookies-et-autres-traceurs"
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:border-primary hover:text-primary"
                    rel="noreferrer"
                    target="_blank"
                  >
                    Cookies - CNIL
                  </a>
                </div>
              </article>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

