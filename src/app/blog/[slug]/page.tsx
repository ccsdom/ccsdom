
import { notFound } from 'next/navigation';
import { allArticles } from '@/lib/articles';
import Header from '@/components/header';
import Footer from '@/components/contact';
import { Headline } from '@/components/ui/headline';
import Image from 'next/image';
import { Calendar, User, ArrowRight } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Link from 'next/link';
import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';


interface ArticlePageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = allArticles.find((a) => a.slug === params.slug);

  if (!article) {
    return {
      title: "Article non trouvé",
      description: "L'article que vous cherchez n'existe pas ou a été déplacé.",
    }
  }

  return {
    title: `${article.title} | CCS DOM Blog`,
    description: article.description,
    alternates: {
      canonical: `/blog/${article.slug}`,
    },
    openGraph: {
        title: article.title,
        description: article.description,
        url: `https://ccsdom.fr/blog/${article.slug}`,
        type: 'article',
        publishedTime: article.publishedAt,
        authors: [article.author],
        images: [
            {
                url: article.imageUrl,
                width: 1200,
                height: 800,
                alt: article.title,
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: article.title,
        description: article.description,
        images: [article.imageUrl],
    },
  }
}

export async function generateStaticParams() {
  return allArticles.map((article) => ({
    slug: article.slug,
  }));
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const article = allArticles.find((a) => a.slug === params.slug);

  if (!article) {
    notFound();
  }
  
  const relatedArticles = allArticles
    .filter((relatedArticle) => relatedArticle.slug !== article.slug)
    .sort(
      (articleA, articleB) =>
        new Date(articleB.publishedAt).getTime() - new Date(articleA.publishedAt).getTime()
    )
    .slice(0, 2);


  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://ccsdom.fr/blog/${article.slug}`,
    },
    headline: article.title,
    description: article.description,
    image: article.imageUrl,
    author: {
      '@type': 'Organization',
      name: article.author,
      url: 'https://ccsdom.fr',
    },
    publisher: {
        '@type': 'Organization',
        name: 'CCS DOM',
        logo: {
            '@type': 'ImageObject',
            url: 'https://firebasestorage.googleapis.com/v0/b/bizhome-hub.firebasestorage.app/o/logo.png?alt=media&token=33433398-f7b6-4524-8968-984441584b39',
        }
    },
    datePublished: article.publishedAt,
    dateModified: article.publishedAt, // Assuming no modifications for now
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="flex-grow py-12 md:py-20">
        <div className="container px-4 md:px-6 max-w-4xl mx-auto mb-8">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/">Accueil</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/blog">Blog</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{article.title}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
        </div>
        <article className="container px-4 md:px-6 max-w-4xl mx-auto">
          <header className="mb-8 md:mb-12 text-center">
            <Headline as="h1" className="text-3xl md:text-4xl lg:text-5xl !leading-tight">
              {article.title}
            </Headline>
            <div className="mt-6 flex justify-center items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(article.publishedAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{article.author}</span>
              </div>
            </div>
          </header>

          <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden mb-8 md:mb-12 shadow-lg">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 896px"
              className="object-cover"
              data-ai-hint={article.imageHint}
              priority
            />
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none mx-auto">
            {article.content.split('### ').map((section, index) => {
              if (index === 0) {
                return section.split('\n').filter(p => p.trim() !== '').map((p, i) => <p key={i} dangerouslySetInnerHTML={{ __html: p }} />);
              }
              const [heading, ...paragraphs] = section.split('\n');
              return (
                <div key={index}>
                  <h3 className="text-2xl font-semibold mt-8 mb-4">{heading}</h3>
                  {paragraphs.filter(p => p.trim() !== '').map((p, i) => <p key={i} dangerouslySetInnerHTML={{ __html: p }} />)}
                </div>
              );
            })}
          </div>

        </article>
        
        {/* Call to Action */}
        <section className="mt-16 md:mt-24">
            <div className="container max-w-4xl mx-auto px-4 md:px-6">
                <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-white to-slate-50 shadow-xl shadow-slate-900/5">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-black tracking-tight text-slate-950">
                          Prêt à choisir votre adresse de domiciliation ?
                        </CardTitle>
                        <CardDescription className="text-base leading-7">
                          Comparez les centres, choisissez votre forfait et démarrez un dossier en ligne.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex-col justify-center gap-3 sm:flex-row">
                        <Button asChild size="lg" className="rounded-full px-7 font-bold">
                            <Link href="/signup">Commencer l'inscription</Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="rounded-full border-slate-300 bg-white px-7 font-bold">
                            <Link href="/#tarifs">Voir les offres</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </section>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
            <section className="py-16 md:py-24">
                 <div className="container max-w-4xl mx-auto px-4 md:px-6">
                    <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Continuez votre lecture</h2>
                    <div className="grid gap-8 md:grid-cols-2">
                        {relatedArticles.map((relatedArticle) => (
                           <Card key={relatedArticle.slug} className="flex flex-col overflow-hidden group">
                                <Link href={`/blog/${relatedArticle.slug}`} className="block">
                                    <div className="relative aspect-[16/10] w-full">
                                    <Image
                                        src={relatedArticle.imageUrl}
                                        alt={relatedArticle.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                        data-ai-hint={relatedArticle.imageHint}
                                    />
                                    </div>
                                </Link>
                                <CardHeader>
                                    <CardTitle className="text-xl">
                                    <Link href={`/blog/${relatedArticle.slug}`} className="hover:text-primary transition-colors">
                                        {relatedArticle.title}
                                    </Link>
                                    </CardTitle>
                                    <CardDescription>{relatedArticle.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow" />
                                <CardFooter>
                                    <Button asChild variant="ghost" size="sm" className="group-hover:text-primary">
                                    <Link href={`/blog/${relatedArticle.slug}`}>
                                        Lire la suite <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
