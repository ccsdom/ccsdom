"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getFunctions, httpsCallable } from "firebase/functions";
import { ChevronRight, Loader2, MapPin, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Headline } from "@/components/ui/headline";
import { Map } from "@/components/map";
import { useFirebase } from "@/firebase";
import { allAddresses, type Address } from "@/lib/addresses";

type PublicCenter = Pick<
  Address,
  | "id"
  | "name"
  | "street"
  | "city"
  | "zip"
  | "country"
  | "status"
  | "lat"
  | "lng"
  | "publicSignupEnabled"
  | "documentsReady"
  | "billingReady"
>;

type PublicCentersResponse = {
  centers?: PublicCenter[];
};

const fallbackCenters = allAddresses.filter(
  (address) => address.status === "active" && address.publicSignupEnabled !== false
);

const centerHref = (centerId: string) => {
  if (centerId === "orly_ville") return "/domiciliation-orly";
  if (centerId === "paris_12e") return "/domiciliation-paris-12";
  return "/#addresses";
};

const signupHref = (centerId: string) => `/signup?center=${encodeURIComponent(centerId)}`;

function normalizeCenters(value: unknown): PublicCenter[] {
  const centers = Array.isArray(value) ? value : [];

  return centers
    .filter((center): center is PublicCenter => {
      const candidate = center as PublicCenter;
      return (
        !!candidate &&
        typeof candidate.id === "string" &&
        typeof candidate.name === "string" &&
        typeof candidate.street === "string" &&
        typeof candidate.city === "string" &&
        typeof candidate.zip === "string" &&
        Number.isFinite(Number(candidate.lat)) &&
        Number.isFinite(Number(candidate.lng))
      );
    })
    .map((center) => ({
      ...center,
      country: center.country || "France",
      status: "active",
      lat: Number(center.lat),
      lng: Number(center.lng),
      publicSignupEnabled: true,
      documentsReady: true,
      billingReady: true,
    }));
}

export default function Addresses() {
  const { firebaseApp } = useFirebase();
  const [centers, setCenters] = React.useState<PublicCenter[]>(fallbackCenters);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;

    async function loadCenters() {
      if (!firebaseApp) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const callable = httpsCallable<undefined, PublicCentersResponse>(
          getFunctions(firebaseApp, "europe-west9"),
          "listPublicCenters"
        );
        const response = await callable(undefined);
        const loadedCenters = normalizeCenters(response.data?.centers);

        if (!cancelled) {
          setCenters(loadedCenters.length > 0 ? loadedCenters : fallbackCenters);
        }
      } catch (error) {
        console.warn("[Home] listPublicCenters failed, using local fallback:", error);
        if (!cancelled) setCenters(fallbackCenters);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadCenters();

    return () => {
      cancelled = true;
    };
  }, [firebaseApp]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const },
    },
  };

  return (
    <section id="addresses" className="relative overflow-hidden bg-white py-20 md:py-28">
      <div className="absolute left-1/2 top-1/2 -z-10 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[120px]" />

      <div className="container px-4 md:px-6">
        <motion.div
          className="mx-auto mb-14 max-w-3xl space-y-5 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="mx-auto inline-flex rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary">
            Réseau CCS DOM
          </div>
          <Headline className="text-slate-950">
            Choisissez votre <strong>centre de domiciliation</strong>
          </Headline>
          <p className="mx-auto max-w-[760px] text-lg leading-8 text-slate-600">
            Les centres affichés sont ceux réellement ouverts à l'inscription. Quand un
            nouveau centre sera créé et activé par le super admin, il pourra apparaître
            automatiquement dans ce parcours.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="mx-auto flex max-w-md items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white p-8 text-sm font-bold text-slate-500 shadow-sm">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            Chargement des centres disponibles...
          </div>
        ) : (
          <motion.div
            className="mx-auto grid max-w-5xl grid-cols-1 gap-10 md:grid-cols-2"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {centers.map((address) => (
              <motion.div key={address.id} variants={itemVariants}>
                <Card className="group flex h-full flex-col overflow-hidden border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10">
                  <CardHeader className="relative h-72 w-full overflow-hidden p-0">
                    <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-white/25 to-transparent" />
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
                    />
                  </CardHeader>
                  <CardContent className="relative z-20 flex flex-grow flex-col p-8">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="rounded-xl bg-primary/10 p-2.5 text-primary transition-all duration-500 group-hover:bg-primary group-hover:text-white">
                        <MapPin className="h-6 w-6 shrink-0" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-black tracking-tight text-slate-950">{address.name}</CardTitle>
                        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700">
                          <ShieldCheck className="h-3 w-3" />
                          Centre actif
                        </div>
                      </div>
                    </div>

                    <p className="mb-8 text-lg leading-relaxed text-slate-600">
                      {address.street},<br />
                      {address.zip} {address.city}
                    </p>

                    <div className="mt-auto space-y-3">
                      <Button asChild className="h-12 w-full text-base font-semibold transition-all duration-300 group/btn">
                        <Link href={signupHref(address.id)} className="flex items-center justify-center gap-2">
                          Choisir ce centre
                          <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" className="h-10 w-full text-sm font-bold text-primary hover:text-primary">
                        <Link href={centerHref(address.id)}>
                          Voir la page du centre
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
