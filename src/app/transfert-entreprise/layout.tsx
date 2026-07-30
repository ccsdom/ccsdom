import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transfert de siège social avec domiciliation",
  description:
    "Transférez le siège social de votre société avec CCS DOM : nouvelle adresse de domiciliation, documents, suivi et accompagnement possible.",
  alternates: {
    canonical: "/transfert-entreprise",
  },
  openGraph: {
    title: "Transfert de siège social avec domiciliation | CCS DOM",
    description:
      "Un accompagnement pour transférer votre siège social et centraliser contrat, attestation et courrier.",
    url: "https://ccsdom.fr/transfert-entreprise",
  },
};

export default function TransfertEntrepriseLayout({ children }: { children: React.ReactNode }) {
  return children;
}
