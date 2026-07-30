"use client";

import Link from "next/link";
import Script from "next/script";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Clock, Loader2, Mail, MapPin, Phone, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import Footer from "@/components/contact";
import Header from "@/components/header";
import { Map } from "@/components/map";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Headline } from "@/components/ui/headline";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { allAddresses } from "@/lib/addresses";

const contactSchema = z.object({
  name: z.string().min(2, { message: "Le nom est requis." }),
  email: z.string().email({ message: "L'adresse e-mail est invalide." }),
  phone: z.string().max(40).optional(),
  subject: z.string().min(5, { message: "Le sujet est requis." }),
  message: z.string().min(10, { message: "Le message doit contenir au moins 10 caractères." }),
  company: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const publicCenters = allAddresses.filter(
  (address) => address.status === "active" && address.publicSignupEnabled !== false
);

export default function ContactPage() {
  const { toast } = useToast();
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", subject: "", message: "", company: "" },
  });

  const onSubmit = async (values: ContactFormValues) => {
    try {
      const response = await fetch("/api/send-contact-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "Une erreur est survenue.");
      }

      toast({
        title: "Message envoyé",
        description: "Merci, nous vous répondrons dans les meilleurs délais.",
      });
      form.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur d'envoi",
        description:
          error instanceof Error
            ? error.message
            : "Impossible d'envoyer votre message. Veuillez réessayer plus tard.",
      });
    }
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
        name: "Contact",
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-950">
      <Script
        id="breadcrumb-structured-data-contact"
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
                <BreadcrumbPage>Contact</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <section className="relative overflow-hidden bg-slate-50 py-16 text-center md:py-24">
          <div className="pointer-events-none absolute right-[-10%] top-[-30%] h-96 w-96 rounded-full bg-primary/15 blur-[120px]" />
          <div className="container relative px-4 md:px-6">
            <div className="mx-auto mb-6 inline-flex rounded-full border border-primary/15 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary shadow-sm">
              Contact CCS DOM
            </div>
            <Headline as="h1" className="text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
              Une question ? Parlons de votre <strong>projet</strong>
            </Headline>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600 md:text-xl">
              Domiciliation, création, transfert, courrier ou accès client : envoyez-nous
              votre demande et l'équipe vous orientera vers la bonne solution.
            </p>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="container grid gap-8 px-4 md:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <Card className="border-slate-200 bg-white shadow-xl shadow-slate-900/5">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Send className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl font-black tracking-tight">
                  Envoyez-nous un message
                </CardTitle>
                <p className="text-sm leading-7 text-slate-600">
                  Donnez-nous le contexte : centre souhaité, type de projet, urgence éventuelle.
                </p>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <div className="hidden" aria-hidden="true">
                          <label htmlFor="company">Entreprise</label>
                          <Input
                            id="company"
                            tabIndex={-1}
                            autoComplete="off"
                            {...field}
                          />
                        </div>
                      )}
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom complet</FormLabel>
                            <FormControl>
                              <Input placeholder="Jean Dupont" autoComplete="name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Adresse e-mail</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="votre.email@example.com"
                                autoComplete="email"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Téléphone</FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                placeholder="+33 1 88 27 34 10"
                                autoComplete="tel"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sujet</FormLabel>
                            <FormControl>
                              <Input placeholder="Domiciliation, courrier, création..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Votre message</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Bonjour, je souhaite..."
                              className="min-h-36"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs leading-5 text-slate-500">
                        Vos informations sont utilisées uniquement pour répondre à votre demande.
                      </p>
                      <Button
                        type="submit"
                        disabled={form.formState.isSubmitting}
                        className="h-12 rounded-full px-7 font-bold"
                      >
                        {form.formState.isSubmitting && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Envoyer le message
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <div className="space-y-5">
              <Card className="border-slate-200 bg-slate-50/70 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-2xl font-black tracking-tight">
                    Coordonnées
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <a href="tel:+33188273410" className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
                    <Phone className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-black">Téléphone</p>
                      <p className="text-sm text-slate-600">+33 1 88 27 34 10</p>
                    </div>
                  </a>
                  <a href="mailto:contact@ccsdom.fr" className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
                    <Mail className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-black">Email</p>
                      <p className="text-sm text-slate-600">contact@ccsdom.fr</p>
                    </div>
                  </a>
                  <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
                    <Clock className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-black">Réponse</p>
                      <p className="text-sm text-slate-600">Traitement par l'équipe CCS DOM</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-2xl font-black tracking-tight">
                    Centres disponibles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {publicCenters.map((address) => (
                    <div key={address.id} className="rounded-3xl border border-slate-200 p-4">
                      <div className="mb-3 flex items-start gap-3">
                        <MapPin className="mt-1 h-5 w-5 shrink-0 text-primary" />
                        <div>
                          <p className="font-black">{address.name}</p>
                          <p className="text-sm leading-6 text-slate-600">
                            {address.street}, {address.zip} {address.city}
                          </p>
                        </div>
                      </div>
                      <div className="relative h-44 overflow-hidden rounded-2xl bg-slate-100">
                        <Map
                          center={{ lat: address.lat, lng: address.lng }}
                          markers={[
                            {
                              id: address.id,
                              lat: address.lat,
                              lng: address.lng,
                              title: `${address.street}, ${address.zip} ${address.city}`,
                              status: address.status,
                            },
                          ]}
                          zoom={14}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
