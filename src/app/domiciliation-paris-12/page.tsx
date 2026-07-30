import type { Metadata } from "next";
import { notFound } from "next/navigation";

import LocalCenterLanding from "@/components/local-center-landing";
import { allAddresses } from "@/lib/addresses";

const center = allAddresses.find((address) => address.id === "paris_12e");

export const metadata: Metadata = {
  title: "Domiciliation entreprise Paris 12e | Centre agréé CCS DOM",
  description:
    "Domiciliez votre entreprise à Paris 12e dans un centre agréé : adresse de siège social, contrat, attestation, courrier digital et espace client sécurisé.",
  alternates: {
    canonical: "/domiciliation-paris-12",
  },
  openGraph: {
    title: "Domiciliation entreprise Paris 12e | Centre agréé CCS DOM",
    description:
      "Une adresse de domiciliation à Paris 12e avec documents en ligne, courrier digital et espace client sécurisé.",
    url: "https://ccsdom.fr/domiciliation-paris-12",
  },
};

export default function DomiciliationParis12Page() {
  if (!center) notFound();

  return (
    <LocalCenterLanding
      center={center}
      cityLabel="Paris 12e"
      intro="Domiciliez votre société à Paris 12e avec une adresse professionnelle, des documents centralisés et un espace client pensé pour gérer votre courrier sans friction."
      seoSections={[
        {
          title: "Pourquoi choisir une domiciliation à Paris 12e ?",
          body: "Paris 12e offre une adresse parisienne lisible et professionnelle, utile pour renforcer l'image administrative de l'entreprise et centraliser son siège social.",
        },
        {
          title: "Une solution adaptée aux entrepreneurs mobiles",
          body: "Le parcours en ligne permet de signer, payer, suivre les documents et consulter les courriers sans multiplier les échanges manuels avec le centre.",
        },
        {
          title: "Une gestion du courrier évolutive",
          body: "Le client peut démarrer simplement, puis évoluer vers le scan, la réexpédition ou le résumé IA selon son besoin réel de suivi à distance.",
        },
      ]}
      localBenefits={[
        "Une adresse parisienne pour renforcer l'image administrative et commerciale de votre entreprise.",
        "Un centre adapté aux entrepreneurs qui souhaitent un suivi clair du contrat, de l'attestation et des factures.",
        "Une gestion de courrier modulable selon l'offre : notification simple, scan, réexpédition ou résumé IA.",
      ]}
      faqItems={[
        {
          question: "La domiciliation à Paris 12e convient-elle à une création d'entreprise ?",
          answer: "Oui. Le centre peut être choisi dans le parcours d'inscription, avec signature du contrat et génération des documents après validation.",
        },
        {
          question: "Puis-je transférer le siège social de ma société à Paris 12e ?",
          answer: "Oui, le parcours couvre aussi les projets de transfert. Les informations de la société et du représentant sont collectées dans le dossier.",
        },
        {
          question: "Comment suivre les factures et documents ?",
          answer: "Les factures, documents de domiciliation et courriers sont centralisés dans l'espace client, avec accès selon le rôle et l'offre choisie.",
        },
        {
          question: "Le résumé IA du courrier est-il inclus dans toutes les offres ?",
          answer: "Non. Le résumé IA est réservé à l'offre Premium, afin de conserver une différence claire entre notification simple et analyse avancée.",
        },
      ]}
    />
  );
}
