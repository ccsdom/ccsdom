import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plateforme de domiciliation et courrier digital",
  description:
    "Découvrez la plateforme CCS DOM : espaces client, manager, secrétaire et super admin pour gérer domiciliation, documents, facturation et courrier.",
  alternates: {
    canonical: "/features",
  },
  openGraph: {
    title: "Plateforme de domiciliation et courrier digital | CCS DOM",
    description:
      "Une plateforme complète pour centraliser documents, courriers, factures, rôles et centres de domiciliation.",
    url: "https://ccsdom.fr/features",
  },
};

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
