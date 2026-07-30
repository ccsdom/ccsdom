import Header from '@/components/header';
import Hero from '@/components/hero';
import Services from '@/components/services';
import Pricing from '@/components/pricing';
import Faq from '@/components/faq';
import Footer from '@/components/contact';
import HomeChatbot from '@/components/home-chatbot';
import Addresses from '@/components/addresses';
import Features from '@/components/features';
import PublicProcess from '@/components/public-process';
import PublicTrustSection from '@/components/public-trust-section';
import Script from 'next/script';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { allAddresses } from '@/lib/addresses';
import { mailPlans } from '@/lib/plans';
import { publicFaqItems } from '@/lib/public-seo';

export const metadata: Metadata = {
  title: "Domiciliation d'entreprise agréée en ligne",
  description:
    "Domiciliez votre entreprise dans un centre agréé, signez votre contrat en ligne, recevez votre attestation et pilotez votre courrier depuis un espace sécurisé.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "CCS DOM - Domiciliation d'entreprise agréée en ligne",
    description:
      "Choisissez votre centre, signez vos documents, recevez votre attestation et gérez votre courrier depuis un espace client sécurisé.",
    url: "https://ccsdom.fr/",
  },
};

const publicCenters = allAddresses.filter(
  (address) => address.status === "active" && address.publicSignupEnabled !== false
);

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://ccsdom.fr/#organization",
        name: "CCS DOM",
        url: "https://ccsdom.fr",
        logo: {
          "@type": "ImageObject",
          url: "https://ccsdom.fr/android-chrome-512x512.png",
        },
        contactPoint: [
          {
            "@type": "ContactPoint",
            telephone: "+33-1-88-27-34-10",
            email: "contact@ccsdom.fr",
            contactType: "customer service",
            areaServed: "FR",
            availableLanguage: ["fr"],
          },
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://ccsdom.fr/#website",
        name: "CCS DOM",
        url: "https://ccsdom.fr",
        inLanguage: "fr-FR",
        publisher: {
          "@id": "https://ccsdom.fr/#organization",
        },
      },
      {
        "@type": "Service",
        "@id": "https://ccsdom.fr/#service-domiciliation",
        name: "Domiciliation d'entreprise agréée",
        serviceType: "Domiciliation commerciale, gestion de courrier et documents de domiciliation",
        provider: {
          "@id": "https://ccsdom.fr/#organization",
        },
        areaServed: publicCenters.map((center) => ({
          "@type": "City",
          name: center.city,
        })),
        offers: {
          "@type": "OfferCatalog",
          name: "Offres de gestion de courrier CCS DOM",
          itemListElement: mailPlans.map((plan) => ({
            "@type": "Offer",
            name: plan.name,
            description: plan.description,
            price: plan.numericPrice,
            priceCurrency: "EUR",
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: plan.numericPrice,
              priceCurrency: "EUR",
              unitText: "MONTH",
              valueAddedTaxIncluded: false,
            },
            availability: "https://schema.org/InStock",
            url: "https://ccsdom.fr/signup",
          })),
        },
      },
      {
        "@type": "FAQPage",
        "@id": "https://ccsdom.fr/#faq",
        mainEntity: publicFaqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
      ...publicCenters.map((center) => ({
        "@type": "LocalBusiness",
        "@id": `https://ccsdom.fr/#center-${center.id}`,
        name: center.name,
        url: center.id === "orly_ville" ? "https://ccsdom.fr/domiciliation-orly" : "https://ccsdom.fr/domiciliation-paris-12",
        parentOrganization: {
          "@id": "https://ccsdom.fr/#organization",
        },
        address: {
          "@type": "PostalAddress",
          streetAddress: center.street,
          postalCode: center.zip,
          addressLocality: center.city,
          addressCountry: center.country,
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: center.lat,
          longitude: center.lng,
        },
        telephone: "+33-1-88-27-34-10",
        priceRange: "€€",
      })),
    ],
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Structured Data JSON-LD pour SEO */}
      <Script
        id="website-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Header fixe */}
      <Header />

      {/* Contenu principal */}
      <main className="flex-grow">
        <section id="hero"><Hero /></section>
        <section id="services"><Services /></section>
        <PublicProcess />
        <PublicTrustSection />
        <section id="addresses"><Addresses /></section>
        <section id="features"><Features /></section>
        <section id="pricing"><Pricing /></section>
        <section id="faq"><Faq /></section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Chatbot en suspense pour éviter le flicker */}
      <Suspense fallback={null}>
        <HomeChatbot />
      </Suspense>
    </div>
  );
}
