import Link from "next/link";
import { Building2, CheckCircle2, FileCheck2, ReceiptText, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Headline } from "@/components/ui/headline";
import { allAddresses } from "@/lib/addresses";

const activeCenters = allAddresses.filter(
  (address) => address.status === "active" && address.publicSignupEnabled !== false
);

const trustCards = [
  {
    icon: ShieldCheck,
    title: "Centres encadrés",
    text: "Chaque adresse affichée est rattachée à un centre actif, avec informations légales et agrément visibles avant l'inscription.",
  },
  {
    icon: FileCheck2,
    title: "Documents après validation",
    text: "Le contrat et l'attestation sont générés après paiement, signature et validation du dossier par l'équipe du centre.",
  },
  {
    icon: ReceiptText,
    title: "Tarifs transparents",
    text: "Les prix affichés sont hors taxes (HT), avec factures centralisées dans l'espace client et suivi de l'abonnement.",
  },
];

export default function PublicTrustSection() {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-20 text-white md:py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-20%] h-96 w-96 rounded-full bg-primary/25 blur-[120px]" />
        <div className="absolute bottom-[-30%] right-[-8%] h-96 w-96 rounded-full bg-cyan-400/15 blur-[120px]" />
      </div>

      <div className="container relative px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary-foreground/90">
              Confiance & conformité
            </div>
            <Headline className="text-white">
              Une domiciliation claire avant, pendant et après <strong>l'inscription</strong>
            </Headline>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              CCS DOM met en avant les informations qui comptent : centre choisi,
              documents attendus, validation du dossier, courrier et facturation. Le
              client sait ce qu'il achète, l'équipe sait ce qu'elle doit traiter.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 rounded-full px-7 font-bold">
                <Link href="/#addresses">Choisir un centre</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-white/20 bg-white/10 px-7 font-bold text-white hover:bg-white hover:text-slate-950"
              >
                <Link href="/contact">Parler à l'équipe</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            <Card className="border-white/10 bg-white/[0.06] text-white shadow-2xl shadow-black/20 backdrop-blur">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary">
                  <Building2 className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl font-black tracking-tight">
                  Centres actuellement ouverts
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                {activeCenters.map((center) => (
                  <div key={center.id} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
                      <div>
                        <p className="font-black text-white">{center.name}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-300">
                          {center.street}, {center.zip} {center.city}
                        </p>
                        <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                          {center.companyApproval}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              {trustCards.map((card) => (
                <Card key={card.title} className="border-white/10 bg-white/[0.06] text-white shadow-sm backdrop-blur">
                  <CardHeader>
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
                      <card.icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base font-black tracking-tight text-white">
                      {card.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-7 text-slate-300">{card.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

