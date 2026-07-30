import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ressources entrepreneurs",
  description:
    "Guides pratiques CCS DOM sur la domiciliation d'entreprise, la gestion de courrier, la création et le transfert de siège social.",
  openGraph: {
    title: "Ressources entrepreneurs | CCS DOM",
    description:
      "Conseils et bonnes pratiques pour domicilier, créer, transférer et piloter votre société.",
    url: "https://ccsdom.fr/blog",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
