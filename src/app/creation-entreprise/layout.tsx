import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Création d'entreprise avec domiciliation",
  description:
    "Créez votre société avec CCS DOM : domiciliation, dossier en ligne, signature, documents et accompagnement possible selon votre besoin.",
  alternates: {
    canonical: "/creation-entreprise",
  },
  openGraph: {
    title: "Création d'entreprise avec domiciliation | CCS DOM",
    description:
      "Un parcours clair pour créer votre entreprise, choisir un centre de domiciliation et suivre vos documents.",
    url: "https://ccsdom.fr/creation-entreprise",
  },
};

export default function CreationEntrepriseLayout({ children }: { children: React.ReactNode }) {
  return children;
}
