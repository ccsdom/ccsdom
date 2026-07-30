import type { Metadata } from "next";
import { notFound } from "next/navigation";

import LocalCenterLanding from "@/components/local-center-landing";
import { allAddresses } from "@/lib/addresses";

const center = allAddresses.find((address) => address.id === "orly_ville");

export const metadata: Metadata = {
  title: "Domiciliation entreprise Orly | Centre agréé CCS DOM",
  description:
    "Domiciliez votre entreprise à Orly dans un centre agréé : adresse de siège social, contrat, attestation, courrier digital et espace client sécurisé.",
  alternates: {
    canonical: "/domiciliation-orly",
  },
  openGraph: {
    title: "Domiciliation entreprise Orly | Centre agréé CCS DOM",
    description:
      "Une adresse de siège social à Orly, avec documents en ligne, courrier digital et suivi client.",
    url: "https://ccsdom.fr/domiciliation-orly",
  },
};

export default function DomiciliationOrlyPage() {
  if (!center) notFound();

  return (
    <LocalCenterLanding
      center={center}
      cityLabel="Orly"
      intro="Installez le siège social de votre société à Orly avec un centre agréé, un parcours en ligne et une gestion de courrier adaptée à votre rythme."
      seoSections={[
        {
          title: "Pourquoi domicilier son entreprise à Orly ?",
          body: "Orly offre une adresse professionnelle en Val-de-Marne, pratique pour les entrepreneurs qui veulent une présence administrative claire sans exposer leur domicile personnel.",
        },
        {
          title: "Une adresse utile dès l'immatriculation",
          body: "La domiciliation permet d'établir le siège social de la société après validation du dossier, puis de récupérer les documents nécessaires dans l'espace client.",
        },
        {
          title: "Un courrier adapté aux usages modernes",
          body: "Selon l'offre choisie, le courrier peut être retiré sur place, scanné, notifié, réexpédié ou résumé par IA pour limiter les déplacements inutiles.",
        },
      ]}
      localBenefits={[
        "Une adresse professionnelle dans le Val-de-Marne, adaptée aux entrepreneurs qui veulent séparer domicile personnel et siège social.",
        "Un parcours digital pour obtenir les documents de domiciliation après validation du dossier.",
        "Des options de courrier évolutives : retrait sur place, scan, notification, réexpédition ou résumé IA selon l'offre.",
      ]}
      faqItems={[
        {
          question: "Puis-je utiliser l'adresse d'Orly comme siège social ?",
          answer: "Oui, après validation du dossier et signature du contrat de domiciliation. L'adresse peut ensuite figurer sur les documents administratifs de l'entreprise.",
        },
        {
          question: "Quels documents sont fournis après validation ?",
          answer: "Le contrat de domiciliation et l'attestation sont générés puis accessibles depuis l'espace client sécurisé.",
        },
        {
          question: "Le courrier peut-il être scanné ?",
          answer: "Oui, sauf sur l'offre Classic. Les offres Starter, Business et Premium activent le scan du courrier selon les règles prévues.",
        },
        {
          question: "L'offre Premium apporte quoi de plus ?",
          answer: "Premium ajoute le résumé IA, l'alerte prioritaire et une réexpédition plus régulière pour les clients qui veulent piloter leur courrier à distance.",
        },
      ]}
    />
  );
}
