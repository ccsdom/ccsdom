"use client";

import Link from "next/link";
import { FileCheck2, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";

import Logo from "./logo";
import { allAddresses } from "@/lib/addresses";

const footerCenters = allAddresses.filter(
  (address) => address.status === "active" && address.publicSignupEnabled !== false
);

const trustItems = [
  { icon: ShieldCheck, label: "Centres agréés" },
  { icon: Mail, label: "Courrier digital" },
  { icon: FileCheck2, label: "Documents sécurisés" },
];

const centerHref = (centerId: string) => {
  if (centerId === "orly_ville") return "/domiciliation-orly";
  if (centerId === "paris_12e") return "/domiciliation-paris-12";
  return "/#addresses";
};

export default function Footer() {
  return (
    <footer id="contact" className="relative border-t border-slate-200 bg-slate-950 text-white">
      <div className="container px-4 py-20 md:px-6">
        <div className="grid grid-cols-1 gap-12 border-b border-white/10 pb-16 lg:grid-cols-4 lg:gap-8">
          <div className="space-y-6">
            <Logo showSlogan={false} className="w-44" />
            <p className="max-w-sm text-base leading-relaxed text-slate-300">
              CCS DOM accompagne les entrepreneurs avec une domiciliation en
              centre agréé, un espace client sécurisé et une gestion moderne du
              courrier.
            </p>
            <div className="flex flex-wrap gap-2">
              {trustItems.map((item) => (
                <span
                  key={item.label}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-blue-100"
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-lg font-black">Navigation</h4>
            <nav className="flex flex-col space-y-3">
              {[
                { href: "/#services", label: "Services" },
                { href: "/#addresses", label: "Centres" },
                { href: "/#tarifs", label: "Tarifs" },
                { href: "/#faq", label: "FAQ" },
                { href: "/creation-entreprise", label: "Création d'entreprise" },
                { href: "/transfert-entreprise", label: "Transfert d'entreprise" },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-base text-slate-300 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="space-y-6">
            <h4 className="text-lg font-black">Espace client</h4>
            <nav className="flex flex-col space-y-3">
              {[
                { href: "/login", label: "Connexion" },
                { href: "/signup", label: "Inscription" },
                { href: "/contact", label: "Aide & support" },
                { href: "/blog", label: "Conseils entrepreneurs" },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-base text-slate-300 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="space-y-6">
            <h4 className="text-lg font-black">Centres disponibles</h4>
            <div className="flex flex-col space-y-4">
              {footerCenters.map((center) => (
                <div key={center.id} className="flex items-start gap-3">
                  <MapPin className="mt-1 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <Link
                      href={centerHref(center.id)}
                      className="font-bold text-white transition-colors hover:text-blue-100"
                    >
                      {center.name}
                    </Link>
                    <p className="text-sm leading-relaxed text-slate-300">
                      {center.street},<br />
                      {center.zip} {center.city}
                    </p>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 shrink-0 text-primary" />
                <a
                  href="mailto:contact@ccsdom.fr"
                  className="text-slate-300 transition-colors hover:text-white"
                >
                  contact@ccsdom.fr
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 shrink-0 text-primary" />
                <a
                  href="tel:+33188273410"
                  className="text-slate-300 transition-colors hover:text-white"
                >
                  +33 1 88 27 34 10
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-6 pt-10 text-sm text-slate-400 md:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/mentions-legales" className="transition-colors hover:text-white">
              Mentions légales
            </Link>
            <Link href="/conditions-generales" className="transition-colors hover:text-white">
              Conditions générales
            </Link>
            <Link href="/politique-de-confidentialite" className="transition-colors hover:text-white">
              Politique de confidentialité
            </Link>
          </div>
          <p>&copy; {new Date().getFullYear()} CCS DOM. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
