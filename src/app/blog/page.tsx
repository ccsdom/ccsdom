"use client";

import Link from "next/link";
import Script from "next/script";
import Image from "next/image";
import React from "react";
import { ArrowRight, Search } from "lucide-react";

import Footer from "@/components/contact";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Headline } from "@/components/ui/headline";
import { Input } from "@/components/ui/input";
import { allArticles } from "@/lib/articles";

const quickLinks = [
  {
    title: "Domiciliation entreprise Orly",
    description: "Adresse, contrat, courrier et documents pour domicilier votre société à Orly.",
    href: "/domiciliation-orly",
  },
  {
    title: "Domiciliation Paris 12e",
    description: "Une adresse parisienne pour créer, transférer ou structurer votre siège social.",
    href: "/domiciliation-paris-12",
  },
  {
    title: "Transfert de siège social",
    description: "Les points clés pour changer d'adresse sans perdre le fil administratif.",
    href: "/transfert-entreprise",
  },
];

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const sortedArticles = [...allArticles].sort(
    (articleA, articleB) =>
      new Date(articleB.publishedAt).getTime() - new Date(articleA.publishedAt).getTime()
  );

  const filteredArticles = sortedArticles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Le Blog CCS DOM",
    url: "https://ccsdom.fr/blog",
    description: "Conseils, actualités et bonnes pratiques pour les entrepreneurs.",
    publisher: {
      "@type": "Organization",
      name: "CCS DOM",
      logo: {
        "@type": "ImageObject",
        url: "https://ccsdom.fr/favicon.svg",
      },
    },
    blogPost: allArticles.map((article) => ({
      "@type": "BlogPosting",
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `https://ccsdom.fr/blog/${article.slug}`,
      },
      headline: article.title,
      description: article.description,
      image: article.imageUrl,
      author: {
        "@type": "Organization",
        name: "L'équipe CCS DOM",
      },
      datePublished: article.publishedAt,
      dateModified: article.publishedAt,
    })),
  };

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Accueil",
        item: "https://ccsdom.fr/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Ressources",
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-950">
      <Script
        id="blog-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Script
        id="breadcrumb-structured-data-blog"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />
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
                <BreadcrumbPage>Ressources</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <section className="relative overflow-hidden bg-slate-50 py-16 text-center md:py-24">
          <div className="pointer-events-none absolute left-[-10%] top-[-30%] h-96 w-96 rounded-full bg-primary/15 blur-[120px]" />
          <div className="container relative px-4 md:px-6">
            <div className="mx-auto mb-6 inline-flex rounded-full border border-primary/15 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary shadow-sm">
              Ressources entrepreneurs
            </div>
            <Headline as="h1" className="text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
              Guides sur la <strong>domiciliation d'entreprise</strong>
            </Headline>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600 md:text-xl">
              Conseils pratiques pour choisir une adresse, gérer le courrier, créer une société
              ou transférer un siège social avec plus de clarté.
            </p>
            <div className="relative mx-auto mt-8 max-w-xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                type="search"
                placeholder="Rechercher un article..."
                className="h-14 rounded-full border-slate-200 bg-white pl-12 pr-4 text-base shadow-sm"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-white py-10">
          <div className="container px-4 md:px-6">
            <div className="grid gap-4 md:grid-cols-3">
              {quickLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white hover:shadow-lg hover:shadow-slate-900/5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-base font-black tracking-tight text-slate-950 group-hover:text-primary">
                        {item.title}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="container px-4 md:px-6">
            <div className="mb-10 max-w-3xl">
              <h2 className="text-2xl font-black tracking-tight text-slate-950 md:text-4xl">
                Ressources utiles pour entrepreneurs et dirigeants
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                Chaque article répond à une question concrète : domicilier son entreprise,
                organiser son courrier, préparer un transfert ou comprendre les documents à fournir.
              </p>
            </div>
            {filteredArticles.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredArticles.map((article) => (
                  <Card key={article.slug} className="group flex flex-col overflow-hidden border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10">
                    <Link href={`/blog/${article.slug}`} className="block">
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                        <Image
                          src={article.imageUrl}
                          alt={article.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          data-ai-hint={article.imageHint}
                        />
                      </div>
                    </Link>
                    <CardHeader>
                      <div className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-primary">
                        {new Date(article.publishedAt).toLocaleDateString("fr-FR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                      <CardTitle className="text-xl font-black tracking-tight">
                        <Link href={`/blog/${article.slug}`} className="transition-colors hover:text-primary">
                          {article.title}
                        </Link>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm leading-7 text-slate-600">{article.description}</p>
                    </CardContent>
                    <CardFooter>
                      <Button asChild variant="ghost" className="px-0 font-bold text-primary hover:bg-transparent">
                        <Link href={`/blog/${article.slug}`} className="flex items-center gap-2">
                          Lire l'article
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-600">
                <h3 className="text-xl font-black text-slate-950">Aucun article trouvé</h3>
                <p className="mt-2">Essayez avec d'autres mots-clés.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
