"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Inbox,
  MailWarning,
  AlertTriangle,
  ArrowUpRight,
  Loader2,
  Building,
  Check,
  MailOpen,
  AlertCircle,
  Mail,
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
const ClientChart = dynamic(() => import("@/components/client-chart").then(mod => mod.ClientChart), {
  ssr: false,
  loading: () => <div className="h-[250px] w-full animate-pulse bg-muted rounded-lg" />
});
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { allAddresses } from "@/lib/addresses";
import type { Client } from "@/app/admin/clients/page";
import { useAuth, useDb } from "@/firebase";
import { motion, AnimatePresence, type Variants } from "framer-motion";

interface MailAnalysis {
  sender?: string;
  summary?: string;
  category?: string;
  urgency?: "Normal" | "Urgent" | "Critique";
  actionRequired?: boolean;
  extractedData?: {
    amountDue?: number;
    dueDate?: string;
    invoiceNumber?: string;
  };
}

interface Mail {
  id: string;
  status: MailStatus;
  fileName?: string;
  storagePath?: string;
  scannedAt?: { seconds: number; nanoseconds: number };
  analysis?: MailAnalysis;
}

const getClientAddressId = (client: Client | null) => {
  return (client as any)?.domiciliationAddressId || (client as any)?.addressId || "";
};

const formatMailDate = (mail: Mail) => {
  if (!mail.scannedAt?.seconds) return "—";
  return new Date(mail.scannedAt.seconds * 1000).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
  });
};

type MailStatus =
  | "Nouveau"
  | "Urgent"
  | "Lu"
  | "Analyse en cours"
  | "Erreur d'analyse"
  | "Archivé";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20,
    },
  },
};

export default function DashboardPage() {
  // ... (existing state and effects)
  const [mails, setMails] = useState<Mail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [client, setClient] = useState<Client | null>(null);

  const auth = useAuth();
  const db = useDb();

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);

      if (!user) {
        setClient(null);
        setMails([]);
        setIsLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [auth]);

  useEffect(() => {
    if (!currentUser || !db) {
      if (auth && auth.currentUser === null) {
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);

    const clientRef = doc(db, "clients", currentUser.uid);
    const mailsRef = collection(db, "clients", currentUser.uid, "mails");
    const mailsQuery = query(mailsRef, orderBy("scannedAt", "desc"), limit(20));

    let clientLoaded = false;
    let mailsLoaded = false;

    const stopLoadingIfReady = () => {
      if (clientLoaded && mailsLoaded) {
        setIsLoading(false);
      }
    };

    const unsubscribeClient = onSnapshot(
      clientRef,
      (snap) => {
        if (snap.exists()) {
          setClient({
            id: snap.id,
            ...snap.data(),
          } as Client);
        } else {
          setClient(null);
        }

        clientLoaded = true;
        stopLoadingIfReady();
      },
      (error) => {
        console.error("Error fetching client:", error);
        setClient(null);
        clientLoaded = true;
        stopLoadingIfReady();
      }
    );

    const unsubscribeMails = onSnapshot(
      mailsQuery,
      (snapshot) => {
        const fetchedMails = snapshot.docs.map(
          (docSnap) =>
            ({
              id: docSnap.id,
              ...docSnap.data(),
            } as Mail)
        );

        setMails(fetchedMails);
        mailsLoaded = true;
        stopLoadingIfReady();
      },
      (error) => {
        console.error("Error fetching mails:", error);
        setMails([]);
        mailsLoaded = true;
        stopLoadingIfReady();
      }
    );

    return () => {
      unsubscribeClient();
      unsubscribeMails();
    };
  }, [currentUser, db, auth]);

  const nonArchivedMails = useMemo(
    () => mails.filter((m) => m.status !== "Archivé"),
    [mails]
  );

  const totalMails = nonArchivedMails.length;

  const pendingMails = useMemo(
    () =>
      nonArchivedMails.filter(
        (m) =>
          m.status === "Nouveau" ||
          m.status === "Urgent" ||
          m.status === "Erreur d'analyse"
      ).length,
    [nonArchivedMails]
  );

  const actionsRequired = useMemo(
    () =>
      nonArchivedMails.filter(
        (m) => m.analysis?.actionRequired || m.status === "Erreur d'analyse"
      ).length,
    [nonArchivedMails]
  );

  const domiciliationAddress = useMemo(() => {
    const addressId = getClientAddressId(client);
    return allAddresses.find((a) => a.id === addressId) || null;
  }, [client]);

  const summaryCards = [
    {
      title: "Courriers reçus",
      value: totalMails,
      description: "Total des courriers non archivés",
      icon: Inbox,
      href: "/dashboard/mail",
    },
    {
      title: "Courriers en attente",
      value: pendingMails,
      description: "Nouveaux, urgents ou erreur d'analyse",
      icon: MailWarning,
      href: "/dashboard/mail",
    },
    {
      title: "Actions requises",
      value: actionsRequired,
      description: "Courriers nécessitant une action",
      icon: AlertTriangle,
      href: "/dashboard/mail",
    },
  ];

  const recentMails = nonArchivedMails.slice(0, 5);

  const requiredActionMails = useMemo(
    () =>
      nonArchivedMails
        .filter(
          (m) => m.analysis?.actionRequired || m.status === "Erreur d'analyse"
        )
        .slice(0, 4),
    [nonArchivedMails]
  );

  const mailsByMonth = useMemo(() => {
    const counts: Record<string, number> = {};
    const monthNames = [
      "Janvier",
      "Février",
      "Mars",
      "Avril",
      "Mai",
      "Juin",
      "Juillet",
      "Août",
      "Septembre",
      "Octobre",
      "Novembre",
      "Décembre",
    ];

    mails.forEach((mail) => {
      if (!mail?.scannedAt?.seconds) return;
      const date = new Date(mail.scannedAt.seconds * 1000);
      const month = monthNames[date.getMonth()];
      counts[month] = (counts[month] || 0) + 1;
    });

    const now = new Date();
    const lastSixMonths = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      return monthNames[date.getMonth()];
    }).reverse();

    return lastSixMonths.map((month) => ({
      month: month.substring(0, 3),
      count: counts[month] || 0,
    }));
  }, [mails]);

  if (isLoading) {
    return (
      <div className="flex min-h-64 h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="grid auto-rows-max items-start gap-6 md:gap-8 pb-10"
    >
      {/* Header Stat Cards */}
      <motion.div 
        variants={itemVariants}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {summaryCards.map((card) => {
          const cardContent = (
            <Card
              key={card.title}
              className="group relative overflow-hidden h-full border-none bg-white/5 dark:bg-black/20 backdrop-blur-xl transition-all duration-300 hover:translate-y-[-4px] hover:shadow-2xl hover:shadow-primary/10 border border-white/10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">
                  {card.title}
                </CardTitle>
                <div className="p-2 rounded-xl bg-white/5 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110 shadow-inner">
                  <card.icon className={cn(
                    "h-5 w-5 transition-colors duration-300",
                    card.title === "Actions requises" && actionsRequired > 0 ? "text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "text-primary"
                  )} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold tracking-tight text-gradient mb-1">
                  {card.value}
                </div>
                <p className="text-[10px] text-foreground/40 font-semibold uppercase tracking-widest">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );

          return card.href ? (
            <Link href={card.href} key={card.title} className="focus:outline-none">
              {cardContent}
            </Link>
          ) : (
            <div key={card.title}>{cardContent}</div>
          );
        })}

        <Link href="/dashboard/settings" className="focus:outline-none">
          <Card className="group relative overflow-hidden h-full border-none bg-white/5 dark:bg-black/20 backdrop-blur-xl transition-all duration-300 hover:translate-y-[-4px] hover:shadow-2xl hover:shadow-primary/10 border border-white/10">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">
                Votre siège social
              </CardTitle>
              <div className="p-2 rounded-xl bg-white/5 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110 shadow-inner">
                <Building className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              {domiciliationAddress ? (
                <>
                  <div className="text-xl font-bold text-gradient truncate mb-0.5">
                    {domiciliationAddress.name.split("-")[0].trim()}
                  </div>
                  <p className="text-[10px] text-foreground/40 font-semibold uppercase tracking-widest truncate">
                    {domiciliationAddress.street}
                  </p>
                </>
              ) : (
                <p className="text-xs text-foreground/40">
                  Adresse non disponible.
                </p>
              )}
            </CardContent>
          </Card>
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <motion.div variants={itemVariants} className="xl:col-span-2">
          <Card className="border-none bg-white/5 dark:bg-black/20 backdrop-blur-xl overflow-hidden border border-white/10 h-full">
            <CardHeader className="flex flex-row items-center border-b border-white/5 pb-6">
              <div className="grid gap-1">
                <CardTitle className="text-xl font-bold tracking-tight">Boîte de réception récente</CardTitle>
                <CardDescription className="text-foreground/40 text-xs font-medium">
                  Consultez vos derniers courriers en un coup d'œil.
                </CardDescription>
              </div>

              <Button asChild variant="premium" size="sm" className="ml-auto gap-2 rounded-xl h-9 px-4">
                <Link href="/dashboard/mail">
                  Voir tout
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>

            <CardContent className="pt-6">
              {recentMails.length > 0 ? (
                <div className="space-y-4">
                  {recentMails.map((mail, idx) => {
                    const isUrgent =
                      mail.status === "Urgent" || !!mail.analysis?.actionRequired;
                    const isError = mail.status === "Erreur d'analyse";

                    let icon = (
                      <Inbox
                        className={cn(
                          "h-5 w-5 transition-transform duration-300 group-hover:scale-110",
                          isUrgent ? "text-amber-500" : "text-primary"
                        )}
                      />
                    );

                    if (mail.status === "Lu") {
                      icon = (
                        <MailOpen className="h-5 w-5 text-foreground/20" />
                      );
                    }

                    if (isError) {
                      icon = (
                        <AlertCircle className="h-5 w-5 text-destructive" />
                      );
                    }

                    const senderText =
                      mail.status === "Analyse en cours"
                        ? "Analyse en cours..."
                        : mail.analysis?.sender || "Expéditeur inconnu";

                    const summaryText =
                      mail.status === "Analyse en cours"
                        ? "Le contenu est en cours de traitement par l'IA."
                        : isError
                        ? "Erreur : re-scan ou intervention nécessaire."
                        : mail.analysis?.summary || "Aucun résumé disponible.";

                    return (
                      <motion.div
                        key={mail.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * idx }}
                        className={cn(
                          "group flex items-center gap-4 rounded-2xl border border-white/5 p-4 transition-all hover:bg-white/5",
                          isUrgent && "bg-amber-500/5 border-amber-500/10",
                          isError && "bg-destructive/5 border-destructive/10"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-105 shadow-inner",
                            isUrgent
                              ? "bg-amber-500/10"
                              : isError 
                              ? "bg-destructive/10"
                              : "bg-white/5 group-hover:bg-white/10"
                          )}
                        >
                          {icon}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="font-bold text-foreground text-sm tracking-tight">
                              {senderText}
                            </p>
                            <p className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-foreground/20">
                              {formatMailDate(mail)}
                            </p>
                          </div>

                          <p className="line-clamp-1 text-xs text-foreground/40 font-medium leading-relaxed">
                            {summaryText}
                          </p>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="opacity-0 group-hover:opacity-100 transition-all rounded-xl hover:bg-white/10 h-8"
                        >
                          <Link href="/dashboard/mail">Voir</Link>
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-20 text-center text-foreground/20">
                  <Inbox className="mx-auto mb-4 h-12 w-12 opacity-10" />
                  <p className="text-sm font-semibold tracking-widest uppercase">Votre boîte de réception est vide</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <div className="space-y-6">
          <motion.div variants={itemVariants}>
            <Card className="border-none bg-white/5 dark:bg-black/20 backdrop-blur-xl overflow-hidden border border-white/10">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                  <AlertTriangle className="text-amber-500 w-5 h-5 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                  Actions requises
                </CardTitle>
                <CardDescription className="text-foreground/40 text-[11px] font-medium uppercase tracking-widest">
                  Documents nécessitant votre attention
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                {requiredActionMails.length > 0 ? (
                  requiredActionMails.map((mail, idx) => (
                    <motion.div
                      key={mail.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + 0.1 * idx }}
                    >
                      <Link
                        href="/dashboard/mail"
                        className="group block rounded-2xl border border-white/5 p-4 transition-all hover:bg-white/5 hover:border-primary/20 bg-black/10"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                            {mail.analysis?.sender || mail.fileName || "Courrier"}
                          </div>

                          <Badge
                            className={cn(
                              "rounded-lg px-2 py-0 text-[9px] font-bold uppercase tracking-widest",
                              mail.status === "Erreur d'analyse"
                                ? "bg-destructive/20 text-destructive border-none"
                                : "bg-primary/20 text-primary border-none"
                            )}
                          >
                            {mail.status}
                          </Badge>
                        </div>

                        <p className="mt-2 line-clamp-2 text-xs text-foreground/40 font-medium leading-relaxed">
                          {mail.status === "Erreur d'analyse"
                            ? "Une erreur est survenue lors du traitement automatique."
                            : mail.analysis?.summary || "Aucun résumé disponible."}
                        </p>

                        {(mail.analysis?.extractedData?.dueDate ||
                          mail.analysis?.extractedData?.amountDue != null) && (
                          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-amber-500 uppercase tracking-[0.15em]">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            {mail.analysis?.extractedData?.dueDate &&
                              `Échéance : ${mail.analysis.extractedData.dueDate}`}
                            {mail.analysis?.extractedData?.amountDue != null &&
                              ` • ${Number(
                                mail.analysis.extractedData.amountDue
                              ).toFixed(2)}€`}
                          </div>
                        )}
                      </Link>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-12 text-center text-foreground/20">
                    <Check className="mx-auto mb-4 h-10 w-10 text-green-500/30" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Tout est en ordre</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-none bg-white/5 dark:bg-black/20 backdrop-blur-xl overflow-hidden border border-white/10">
              <CardHeader className="pb-2 border-b border-white/5">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-foreground/40">Volume de courrier</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 px-2">
                <ClientChart data={mailsByMonth} />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}