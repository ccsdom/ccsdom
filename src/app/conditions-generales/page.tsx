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
import { expertAccompanimentPlans, mailPlans } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Conditions générales de service | CCS DOM",
  description:
    "Conditions générales de service CCS DOM : domiciliation, abonnements, courrier, facturation, obligations client, résiliation, données et litiges.",
  alternates: {
    canonical: "/conditions-generales",
  },
};

const lastUpdated = "12 juin 2026";

const providerDetails = [
  ["Éditeur", "CONSULTING CONSEIL SERVICES - CCS DOM"],
  ["Forme juridique", "SARL au capital de 100 000 EUR"],
  ["Siège social", "25 Rue Edmond Rostand, 94310 Orly, France"],
  ["RCS", "Créteil 830 278 644"],
  ["TVA intracommunautaire", "FR82830278644"],
  ["Contact", "contact@ccsdom.fr - +33 1 88 27 34 10"],
];

const serviceRules = [
  {
    title: "Domiciliation commerciale",
    text: "Le service permet de bénéficier d'une adresse de domiciliation auprès d'un centre agréé, sous réserve d'acceptation du dossier, de signature des documents requis, de paiement et de respect des obligations légales applicables.",
  },
  {
    title: "Espace client et portail SaaS",
    text: "La plateforme donne accès aux documents, factures, courriers, paramètres d'abonnement et notifications selon le rôle de l'utilisateur et le forfait souscrit.",
  },
  {
    title: "Courrier et numérisation",
    text: "La réception, le classement, la notification, la numérisation ou la réexpédition du courrier dépendent du centre concerné, du forfait actif, des délais postaux, des volumes et des contraintes opérationnelles.",
  },
  {
    title: "Accompagnement administratif",
    text: "L'accompagnement à la création ou au transfert d'entreprise consiste en une aide opérationnelle aux formalités. Il ne remplace pas un conseil juridique, fiscal ou comptable personnalisé.",
  },
];

const clientObligations = [
  "Fournir des informations exactes, à jour et vérifiables.",
  "Transmettre des justificatifs lisibles et conformes aux demandes du centre.",
  "Informer rapidement CCS DOM de tout changement d'adresse, de représentant, de statut juridique ou de coordonnées.",
  "Utiliser l'adresse de domiciliation conformément au contrat, à la réglementation et aux règles du centre choisi.",
  "Préserver la confidentialité des identifiants et signaler toute utilisation suspecte du compte.",
  "Régler les sommes dues dans les délais et maintenir un moyen de paiement valide lorsque l'abonnement est récurrent.",
];

const billingRules = [
  {
    title: "Prix hors taxes",
    text: "Les prix affichés sur ccsdom.fr et dans l'application sont indiqués hors taxes (HT), sauf mention contraire. La TVA et les éventuels frais applicables sont ajoutés lors de la facturation.",
  },
  {
    title: "Abonnements",
    text: "Les offres peuvent être souscrites en fréquence mensuelle ou annuelle selon les options disponibles. Le contenu exact du service dépend du forfait sélectionné et des éventuelles options validées.",
  },
  {
    title: "Paiement et factures",
    text: "Les paiements en ligne sont traités par Stripe. Les factures sont mises à disposition dans l'espace client ou transmises selon les procédures internes du centre.",
  },
  {
    title: "Incident de paiement",
    text: "Un défaut de paiement peut entraîner une relance, une restriction temporaire, une suspension ou une résiliation du service selon les conditions contractuelles applicables.",
  },
];

const operationRules = [
  {
    title: "Activation du dossier",
    text: "La domiciliation n'est activée qu'après validation du dossier, paiement, signature des documents nécessaires et confirmation par le centre concerné.",
  },
  {
    title: "Documents générés",
    text: "Les contrats, attestations, factures et documents de formalités sont générés à partir des données fournies. Le client doit vérifier leur exactitude avant usage.",
  },
  {
    title: "Assistance IA",
    text: "Certaines fonctionnalités peuvent utiliser l'IA pour classer, résumer ou pré-vérifier des documents. Ces résultats constituent une aide à l'exploitation et ne remplacent pas une validation humaine.",
  },
  {
    title: "Disponibilité",
    text: "CCS DOM s'efforce d'assurer la disponibilité de la plateforme, sous réserve des maintenances, incidents techniques, indisponibilités de fournisseurs tiers ou cas de force majeure.",
  },
];

export default function ConditionsGeneralesPage() {
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
                <BreadcrumbPage>Conditions générales</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <section className="relative overflow-hidden bg-slate-50 py-16 md:py-24">
          <div className="pointer-events-none absolute right-[-12%] top-[-35%] h-96 w-96 rounded-full bg-primary/15 blur-[120px]" />
          <div className="container relative px-4 md:px-6">
            <div className="mx-auto max-w-4xl">
              <div className="mb-6 inline-flex rounded-full border border-primary/15 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary shadow-sm">
                Cadre contractuel
              </div>
              <Headline as="h1" className="text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
                Conditions générales <strong>de service</strong>
              </Headline>
              <p className="mt-6 text-lg leading-8 text-slate-600">
                Ces conditions présentent le cadre général applicable à l'utilisation
                de ccsdom.fr, aux services de domiciliation, au traitement du courrier,
                aux abonnements et aux outils numériques CCS DOM.
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
              <article className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 shadow-sm md:p-8">
                <h2 className="text-2xl font-black tracking-tight text-amber-950">
                  Note importante
                </h2>
                <p className="mt-4 text-sm leading-8 text-amber-900">
                  Cette page constitue une base d'information contractuelle publique.
                  Le contrat de domiciliation signé, les devis, factures, conditions
                  particulières, annexes et éventuels documents validés par le centre
                  prévalent sur toute présentation synthétique du site. Une validation
                  juridique finale reste recommandée avant lancement commercial complet.
                </p>
              </article>

              <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 md:p-10">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                  Prestataire
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                  CONSULTING CONSEIL SERVICES - CCS DOM
                </h2>
                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  {providerDetails.map(([label, value]) => (
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
                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                  Centres concernés
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                  Un réseau appelé à évoluer
                </h2>
                <p className="mt-4 text-sm leading-8 text-slate-600">
                  Les services sont fournis via les centres de domiciliation actifs
                  proposés dans le parcours d'inscription. À l'avenir, de nouveaux
                  centres pourront être ajoutés après configuration et validation.
                </p>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {activeCenters.map((center) => (
                    <div key={center.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <p className="text-lg font-black tracking-tight text-slate-950">{center.name}</p>
                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        {center.companyName}
                        <br />
                        {center.street}, {center.zip} {center.city}
                      </p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 md:p-10">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                  Services
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                  Ce que couvre CCS DOM
                </h2>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {serviceRules.map((rule) => (
                    <div key={rule.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <h3 className="text-lg font-black tracking-tight text-slate-950">{rule.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{rule.text}</p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-xl shadow-slate-900/10 md:p-10">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                  Abonnements courrier
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight">
                  Offres affichées hors taxes
                </h2>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {mailPlans.map((plan) => (
                    <div key={plan.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg font-black tracking-tight text-white">{plan.name}</h3>
                        {plan.isRecommended ? (
                          <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white">
                            Recommandé
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm font-black text-primary">{plan.price}</p>
                      <p className="mt-3 text-sm leading-7 text-slate-300">{plan.description}</p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 md:p-10">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                  Accompagnement
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                  Création et transfert d'entreprise
                </h2>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {Object.values(expertAccompanimentPlans).map((plan) => (
                    <div key={plan.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <h3 className="text-lg font-black tracking-tight text-slate-950">{plan.name}</h3>
                      <p className="mt-2 text-sm font-black text-primary">{plan.price}</p>
                      <ul className="mt-4 space-y-2 text-sm leading-7 text-slate-600">
                        {plan.features.map((feature) => (
                          <li key={feature}>- {feature}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </article>

              <div className="grid gap-4 md:grid-cols-2">
                {billingRules.map((rule) => (
                  <article key={rule.title} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-black tracking-tight text-slate-950">{rule.title}</h2>
                    <p className="mt-4 text-sm leading-8 text-slate-600">{rule.text}</p>
                  </article>
                ))}
              </div>

              <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 md:p-10">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                  Obligations du client
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                  Une collaboration fiable et vérifiable
                </h2>
                <div className="mt-6 grid gap-3">
                  {clientObligations.map((obligation) => (
                    <div key={obligation} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold leading-7 text-slate-700">
                      {obligation}
                    </div>
                  ))}
                </div>
              </article>

              <div className="grid gap-4 md:grid-cols-2">
                {operationRules.map((rule) => (
                  <article key={rule.title} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-black tracking-tight text-slate-950">{rule.title}</h2>
                    <p className="mt-4 text-sm leading-8 text-slate-600">{rule.text}</p>
                  </article>
                ))}
              </div>

              <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 md:p-10">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                  Résiliation et changement d'offre
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                  Gestion du cycle de vie du service
                </h2>
                <p className="mt-4 text-sm leading-8 text-slate-600">
                  Les demandes de changement d'offre, d'annulation ou de résiliation
                  peuvent être effectuées depuis l'espace client lorsque la fonctionnalité
                  est disponible, ou en contactant contact@ccsdom.fr. Les effets sur le
                  service, la facturation et les documents dépendent de la période en cours,
                  du contrat signé et des obligations légales liées à la domiciliation.
                </p>
              </article>

              <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 md:p-10">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                  Données, litiges et contact
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                  Transparence et recours
                </h2>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="text-lg font-black tracking-tight text-slate-950">
                      Données personnelles
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      Les traitements de données sont détaillés dans la{" "}
                      <Link href="/politique-de-confidentialite" className="font-bold text-primary hover:underline">
                        politique de confidentialité
                      </Link>
                      .
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="text-lg font-black tracking-tight text-slate-950">
                      Réclamation
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      Toute réclamation doit d'abord être adressée à contact@ccsdom.fr.
                      En cas de litige, le droit français s'applique, sous réserve des
                      règles impératives applicables au client.
                    </p>
                  </div>
                </div>
              </article>

              <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <h2 className="text-xl font-black tracking-tight text-slate-950">
                  Références utiles
                </h2>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href="https://entreprendre.service-public.gouv.fr/vosdroits/F37351"
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:border-primary hover:text-primary"
                    rel="noreferrer"
                    target="_blank"
                  >
                    Obligations site professionnel - Service-Public
                  </a>
                  <a
                    href="https://www.economie.gouv.fr/mediation-conso"
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:border-primary hover:text-primary"
                    rel="noreferrer"
                    target="_blank"
                  >
                    Médiation de la consommation
                  </a>
                  <Link
                    href="/mentions-legales"
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:border-primary hover:text-primary"
                  >
                    Mentions légales CCS DOM
                  </Link>
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
