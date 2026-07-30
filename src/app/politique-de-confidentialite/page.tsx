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

export const metadata: Metadata = {
  title: "Politique de confidentialité | CCS DOM",
  description:
    "Politique de confidentialité CCS DOM : données collectées, finalités, bases légales, prestataires, durée de conservation, droits RGPD et cookies.",
  alternates: {
    canonical: "/politique-de-confidentialite",
  },
};

const lastUpdated = "12 juin 2026";

const dataCategories = [
  {
    title: "Identité et contact",
    text: "Nom, prénom, adresse email, téléphone, adresse postale, qualité du représentant légal et informations de connexion.",
  },
  {
    title: "Entreprise et dossier",
    text: "Dénomination sociale, SIRET/SIREN, forme juridique, adresse de domiciliation, projet de création ou de transfert, justificatifs transmis.",
  },
  {
    title: "Documents et signatures",
    text: "Contrats, attestations, pièces justificatives, signatures électroniques ou manuscrites numérisées, documents générés par la plateforme.",
  },
  {
    title: "Courrier et exploitation",
    text: "Métadonnées de courrier, scans, statuts lu/non lu, archive, urgence, classification et résumé lorsque le forfait le permet.",
  },
  {
    title: "Facturation et paiement",
    text: "Forfait, fréquence de paiement, factures, statut de paiement et identifiants Stripe. CCS DOM ne stocke pas les numéros complets de carte bancaire.",
  },
  {
    title: "Données techniques",
    text: "Journaux de connexion, adresse IP, navigateur, terminal, cookies, événements de sécurité et traces nécessaires au fonctionnement du service.",
  },
];

const purposes = [
  {
    title: "Fourniture du service",
    basis: "Exécution du contrat ou mesures précontractuelles",
    text: "Créer le dossier, gérer l'inscription, générer les documents, activer l'espace client, traiter le courrier et fournir les fonctionnalités souscrites.",
  },
  {
    title: "Gestion administrative et comptable",
    basis: "Obligation légale et intérêt légitime",
    text: "Émettre les factures, suivre les paiements, conserver les justificatifs nécessaires et répondre aux obligations légales applicables.",
  },
  {
    title: "Sécurité et prévention des abus",
    basis: "Intérêt légitime",
    text: "Protéger les comptes, tracer les actions sensibles, limiter les accès non autorisés et détecter les anomalies techniques ou opérationnelles.",
  },
  {
    title: "Support et relation client",
    basis: "Exécution du contrat et intérêt légitime",
    text: "Répondre aux demandes, envoyer les notifications nécessaires, accompagner les utilisateurs et traiter les incidents signalés.",
  },
  {
    title: "Amélioration du service",
    basis: "Intérêt légitime ou consentement lorsque requis",
    text: "Mesurer l'utilisation, améliorer l'ergonomie, suivre la qualité et optimiser les parcours sans porter atteinte aux droits des utilisateurs.",
  },
];

const providers = [
  "Firebase / Google Cloud pour l'hébergement, l'authentification, la base de données, le stockage et certaines fonctions serveur.",
  "Stripe pour le paiement, la gestion des abonnements et les événements de facturation.",
  "Resend ou l'extension email Firebase pour l'envoi de messages transactionnels et de notifications.",
  "Google Maps pour l'affichage et l'aide à la localisation des centres ou adresses.",
  "Services d'IA Google, lorsque les fonctions d'analyse documentaire, d'extraction, de classification ou de résumé sont activées.",
];

const retentionRules = [
  {
    title: "Compte et dossier client",
    text: "Conservés pendant la durée de la relation contractuelle, puis archivés selon les obligations légales, probatoires ou comptables applicables.",
  },
  {
    title: "Factures et pièces comptables",
    text: "Conservées pendant les durées légales applicables, notamment jusqu'à 10 ans lorsque la réglementation comptable l'exige.",
  },
  {
    title: "Documents transmis",
    text: "Conservés le temps nécessaire à la gestion du dossier, de la domiciliation, des obligations réglementaires et des éventuels litiges.",
  },
  {
    title: "Cookies et journaux techniques",
    text: "Conservés pour des durées limitées et proportionnées à leur finalité : fonctionnement, sécurité, diagnostic ou mesure d'audience.",
  },
];

const rights = [
  "droit d'accès",
  "droit de rectification",
  "droit d'effacement",
  "droit à la limitation",
  "droit d'opposition",
  "droit à la portabilité lorsque applicable",
  "droit de retirer votre consentement lorsque le traitement repose sur celui-ci",
  "droit d'introduire une réclamation auprès de la CNIL",
];

export default function PolitiqueConfidentialitePage() {
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
                <BreadcrumbPage>Politique de confidentialité</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <section className="relative overflow-hidden bg-slate-50 py-16 md:py-24">
          <div className="pointer-events-none absolute right-[-10%] top-[-35%] h-96 w-96 rounded-full bg-primary/15 blur-[120px]" />
          <div className="container relative px-4 md:px-6">
            <div className="mx-auto max-w-4xl">
              <div className="mb-6 inline-flex rounded-full border border-primary/15 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary shadow-sm">
                Données personnelles
              </div>
              <Headline as="h1" className="text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
                Politique de <strong>confidentialité</strong>
              </Headline>
              <p className="mt-6 text-lg leading-8 text-slate-600">
                Cette politique explique comment CCS DOM collecte, utilise, protège et
                conserve les données personnelles dans le cadre du site, de l'inscription,
                de la domiciliation, du courrier, de la facturation et de l'espace client.
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
                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                  Responsable du traitement
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                  CONSULTING CONSEIL SERVICES - CCS DOM
                </h2>
                <p className="mt-4 text-sm leading-8 text-slate-600">
                  CONSULTING CONSEIL SERVICES, SARL au capital de 100 000 EUR, dont le
                  siège social est situé 25 Rue Edmond Rostand, 94310 Orly, agit comme
                  responsable du traitement pour les données collectées via ccsdom.fr et
                  les espaces applicatifs CCS DOM, sauf indication contraire dans un contrat
                  ou une relation spécifique avec un centre partenaire.
                </p>
                <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold leading-7 text-slate-700">
                  Contact données personnelles : contact@ccsdom.fr
                  <br />
                  Adresse postale : 25 Rue Edmond Rostand, 94310 Orly, France
                </p>
              </article>

              <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 md:p-10">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                  Données traitées
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                  Les informations nécessaires au service
                </h2>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {dataCategories.map((category) => (
                    <div key={category.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <h3 className="text-lg font-black tracking-tight text-slate-950">{category.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{category.text}</p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 md:p-10">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                  Finalités et bases légales
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                  Pourquoi ces données sont utilisées
                </h2>
                <div className="mt-6 grid gap-4">
                  {purposes.map((purpose) => (
                    <div key={purpose.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <h3 className="text-lg font-black tracking-tight text-slate-950">{purpose.title}</h3>
                        <span className="rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-primary">
                          {purpose.basis}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{purpose.text}</p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 md:p-10">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                  Destinataires et prestataires
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                  Accès limité aux personnes et services utiles
                </h2>
                <p className="mt-4 text-sm leading-8 text-slate-600">
                  Les données sont accessibles aux équipes habilitées selon leur rôle :
                  super administrateur, manager de centre, secrétaire, support ou client
                  concerné. Elles peuvent également être traitées par des prestataires
                  techniques nécessaires au fonctionnement du service.
                </p>
                <ul className="mt-5 grid gap-3">
                  {providers.map((provider) => (
                    <li key={provider} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-600">
                      {provider}
                    </li>
                  ))}
                </ul>
                <p className="mt-5 text-sm leading-8 text-slate-600">
                  Certains prestataires peuvent impliquer des traitements ou accès depuis
                  des pays situés hors de l'Union européenne. Dans ce cas, CCS DOM s'appuie
                  sur les garanties contractuelles et mécanismes de conformité proposés par
                  ces prestataires.
                </p>
              </article>

              <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 md:p-10">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                  Intelligence artificielle
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                  Une aide opérationnelle, pas une décision automatique finale
                </h2>
                <p className="mt-4 text-sm leading-8 text-slate-600">
                  Lorsque les fonctionnalités le permettent, CCS DOM peut utiliser des
                  outils d'IA pour extraire des informations, pré-vérifier des documents,
                  classer un courrier ou générer un résumé. Ces traitements servent à
                  assister les équipes et les clients. Ils ne remplacent pas la validation
                  humaine lorsqu'une décision de conformité, d'approbation ou de rejet est
                  nécessaire.
                </p>
              </article>

              <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 md:p-10">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                  Conservation
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                  Des durées adaptées aux finalités
                </h2>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {retentionRules.map((rule) => (
                    <div key={rule.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <h3 className="text-lg font-black tracking-tight text-slate-950">{rule.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{rule.text}</p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 md:p-10">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                  Cookies et traceurs
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                  Fonctionnement, sécurité et expérience utilisateur
                </h2>
                <p className="mt-4 text-sm leading-8 text-slate-600">
                  Le site peut utiliser des cookies strictement nécessaires au fonctionnement
                  du service, à la sécurité, à la mémorisation de préférences et à la gestion
                  de session. Des cookies de mesure ou d'amélioration de l'expérience peuvent
                  être utilisés lorsque cela est applicable, avec consentement lorsque la loi
                  l'exige. Vous pouvez accepter ou refuser les cookies depuis le bandeau prévu
                  à cet effet et modifier certains choix via votre navigateur.
                </p>
              </article>

              <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 md:p-10">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                  Vos droits
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                  Accès, rectification, opposition et réclamation
                </h2>
                <p className="mt-4 text-sm leading-8 text-slate-600">
                  Conformément au RGPD, vous pouvez exercer les droits suivants, dans les
                  limites prévues par la réglementation :
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {rights.map((right) => (
                    <span key={right} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700">
                      {right}
                    </span>
                  ))}
                </div>
                <p className="mt-6 text-sm leading-8 text-slate-600">
                  Pour exercer vos droits, contactez :{" "}
                  <a href="mailto:contact@ccsdom.fr" className="font-bold text-primary hover:underline">
                    contact@ccsdom.fr
                  </a>
                  . Une pièce justificative peut être demandée si nécessaire pour confirmer
                  votre identité. Vous pouvez également introduire une réclamation auprès de
                  la{" "}
                  <a
                    href="https://www.cnil.fr/"
                    className="font-bold text-primary hover:underline"
                    rel="noreferrer"
                    target="_blank"
                  >
                    CNIL
                  </a>
                  .
                </p>
              </article>

              <article className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-xl shadow-slate-900/10 md:p-10">
                <h2 className="text-2xl font-black tracking-tight">Sécurité et confidentialité</h2>
                <p className="mt-4 text-sm leading-8 text-slate-300">
                  CCS DOM met en œuvre des mesures techniques et organisationnelles destinées
                  à protéger les données : authentification, règles d'accès par rôle,
                  séparation des centres, stockage sécurisé, journalisation des actions
                  sensibles et limitation des accès aux seuls utilisateurs autorisés.
                </p>
                <p className="mt-4 text-sm leading-8 text-slate-300">
                  Aucun système n'étant invulnérable, tout incident suspect peut être signalé
                  à contact@ccsdom.fr afin d'être analysé rapidement.
                </p>
              </article>

              <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <h2 className="text-xl font-black tracking-tight text-slate-950">Références utiles</h2>
                <div className="mt-4 flex flex-wrap gap-3">
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
                  <a
                    href="https://entreprendre.service-public.gouv.fr/vosdroits/F37351"
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:border-primary hover:text-primary"
                    rel="noreferrer"
                    target="_blank"
                  >
                    Obligations site professionnel
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

