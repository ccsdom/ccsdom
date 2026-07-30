import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez CCS DOM pour une domiciliation d'entreprise, un transfert de siège, une création de société ou une question sur votre courrier.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact | CCS DOM",
    description:
      "Une question sur la domiciliation, les documents, le courrier ou votre espace client ? Contactez l'équipe CCS DOM.",
    url: "https://ccsdom.fr/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
