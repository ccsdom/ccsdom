"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Clock3,
  CreditCard,
  FileText,
  Inbox,
  LifeBuoy,
  Mail,
  MessageSquareText,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";

import { Chatbot, type SupportAssistantContext } from "@/components/chatbot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuth, useDb } from "@/firebase";

type SupportClientProfile = {
  companyName?: string;
  name?: string;
  email?: string;
  addressKey?: string;
  locationKey?: string;
  addressId?: string;
  centerId?: string;
  domiciliationAddressId?: string;
  subscriptionStatus?: string;
  paymentStatus?: string;
  accessProvisioned?: boolean;
  pdfPublish?: {
    contract?: { status?: string; outputUrl?: string | null };
    attestation?: { status?: string; outputUrl?: string | null };
  };
};

type CenterSupportContact = {
  key: "orly" | "paris" | "default";
  label: string;
  company: string;
  email: string;
  phone: string;
  phoneHref: string;
  accent: string;
};

const CENTER_CONTACTS: Record<CenterSupportContact["key"], CenterSupportContact> = {
  orly: {
    key: "orly",
    label: "Centre Orly",
    company: "Consulting Conseil Services",
    email: "contact.ccs94@gmail.com",
    phone: "+33 1 88 27 34 10",
    phoneHref: "tel:+33188273410",
    accent: "from-sky-500 to-cyan-500",
  },
  paris: {
    key: "paris",
    label: "Centre Paris 12e",
    company: "Business Partners Consulting",
    email: "contact.ccs75@gmail.com",
    phone: "+33 1 88 27 34 10",
    phoneHref: "tel:+33188273410",
    accent: "from-blue-600 to-indigo-500",
  },
  default: {
    key: "default",
    label: "Support CCS DOM",
    company: "CCS DOM",
    email: "contact@ccsdom.fr",
    phone: "+33 1 88 27 34 10",
    phoneHref: "tel:+33188273410",
    accent: "from-primary to-sky-500",
  },
};

const quickActions = [
  {
    title: "Courrier reçu",
    description: "Consulter, télécharger ou archiver un courrier scanné.",
    href: "/dashboard/mail",
    icon: Inbox,
  },
  {
    title: "Facture ou paiement",
    description: "Retrouver vos factures et vérifier votre abonnement.",
    href: "/dashboard/billing",
    icon: CreditCard,
  },
  {
    title: "Documents CCS",
    description: "Contrat, attestation et documents téléversés.",
    href: "/dashboard/documents",
    icon: FileText,
  },
  {
    title: "Profil société",
    description: "Mettre à jour vos informations et justificatifs.",
    href: "/dashboard/settings",
    icon: Building2,
  },
];

const faqItems = [
  {
    title: "Je ne vois pas mon contrat ou mon attestation",
    answer:
      "Vérifiez d'abord l'onglet Documents. Si le fichier reste indisponible, contactez le support avec le nom de votre société.",
  },
  {
    title: "Je viens de recevoir un courrier urgent",
    answer:
      "Appelez le centre puis envoyez un e-mail avec la référence du courrier. Les courriers urgents doivent rester traçables.",
  },
  {
    title: "Ma facture n'est pas téléchargeable",
    answer:
      "Rafraîchissez la page Facturation. Si le PDF ne s'ouvre toujours pas, le support peut relancer la génération.",
  },
  {
    title: "Je souhaite changer de formule",
    answer:
      "Rendez-vous dans Abonnement. Les changements doivent conserver la période déjà payée et rester visibles dans la facturation.",
  },
];

function resolveCenterContact(profile: SupportClientProfile | null): CenterSupportContact {
  const raw = [
    profile?.addressKey,
    profile?.locationKey,
    profile?.addressId,
    profile?.centerId,
    profile?.domiciliationAddressId,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (raw.includes("paris")) return CENTER_CONTACTS.paris;
  if (raw.includes("orly")) return CENTER_CONTACTS.orly;
  return CENTER_CONTACTS.default;
}

function buildSupportMailHref(contact: CenterSupportContact, profile: SupportClientProfile | null) {
  const company = profile?.companyName || profile?.name || "Client CCS DOM";
  const subject = encodeURIComponent(`Support client - ${company}`);
  const body = encodeURIComponent(
    [
      "Bonjour,",
      "",
      "Je souhaite obtenir de l'aide concernant mon espace client CCS DOM.",
      "",
      `Société : ${company}`,
      `Centre : ${contact.label}`,
      profile?.email ? `Email du compte : ${profile.email}` : "",
      "",
      "Objet de ma demande :",
    ]
      .filter(Boolean)
      .join("\n")
  );

  return `mailto:${contact.email}?subject=${subject}&body=${body}`;
}

export default function SupportPage() {
  const auth = useAuth();
  const db = useDb();
  const [profile, setProfile] = React.useState<SupportClientProfile | null>(null);
  const [requestProfile, setRequestProfile] = React.useState<SupportClientProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = React.useState(true);

  React.useEffect(() => {
    if (!auth || !db) {
      setIsProfileLoading(false);
      return;
    }

    let unsubscribeClient: () => void = () => {};
    let unsubscribeRequest: () => void = () => {};
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      unsubscribeClient();
      unsubscribeRequest();
      unsubscribeClient = () => {};
      unsubscribeRequest = () => {};

      if (!user) {
        setProfile(null);
        setRequestProfile(null);
        setIsProfileLoading(false);
        return;
      }

      setIsProfileLoading(true);
      unsubscribeClient = onSnapshot(
        doc(db, "clients", user.uid),
        (snapshot) => {
          const data = snapshot.exists() ? (snapshot.data() as SupportClientProfile) : {};
          setProfile({
            ...data,
            email: data.email || user.email || undefined,
          });
          setIsProfileLoading(false);
        },
        () => {
          setProfile({ email: user.email || undefined });
          setIsProfileLoading(false);
        }
      );

      unsubscribeRequest = onSnapshot(
        doc(db, "client_requests", user.uid),
        (snapshot) => {
          setRequestProfile(snapshot.exists() ? (snapshot.data() as SupportClientProfile) : null);
          setIsProfileLoading(false);
        },
        () => {
          setRequestProfile(null);
          setIsProfileLoading(false);
        }
      );
    });

    return () => {
      unsubscribeClient();
      unsubscribeRequest();
      unsubscribeAuth();
    };
  }, [auth, db]);

  const supportProfile = React.useMemo<SupportClientProfile | null>(() => {
    if (!profile && !requestProfile) return null;

    return {
      ...(requestProfile || {}),
      ...(profile || {}),
      pdfPublish: profile?.pdfPublish || requestProfile?.pdfPublish,
      accessProvisioned:
        typeof profile?.accessProvisioned === "boolean"
          ? profile.accessProvisioned
          : requestProfile?.accessProvisioned,
    };
  }, [profile, requestProfile]);

  const contact = React.useMemo(() => resolveCenterContact(supportProfile), [supportProfile]);
  const mailHref = React.useMemo(
    () => buildSupportMailHref(contact, supportProfile),
    [contact, supportProfile]
  );
  const companyName = supportProfile?.companyName || supportProfile?.name || "Votre espace client";
  const contractStatus = supportProfile?.pdfPublish?.contract?.status;
  const attestationStatus = supportProfile?.pdfPublish?.attestation?.status;
  const contractStatusKey = String(contractStatus || "").toLowerCase();
  const attestationStatusKey = String(attestationStatus || "").toLowerCase();
  const supportContext = React.useMemo<SupportAssistantContext>(
    () => ({
      companyName,
      centerLabel: contact.label,
      supportEmail: contact.email,
      supportPhone: contact.phone,
      subscriptionStatus: supportProfile?.subscriptionStatus,
      paymentStatus: supportProfile?.paymentStatus,
      contractStatus,
      attestationStatus,
      hasContract:
        contractStatusKey === "complete" &&
        Boolean(supportProfile?.pdfPublish?.contract?.outputUrl),
      hasAttestation:
        attestationStatusKey === "complete" &&
        Boolean(supportProfile?.pdfPublish?.attestation?.outputUrl),
      accessProvisioned: supportProfile?.accessProvisioned,
    }),
    [attestationStatus, attestationStatusKey, companyName, contact, contractStatus, contractStatusKey, supportProfile]
  );
  const assistantPrompts = React.useMemo(
    () => [
      "Je ne vois pas ma facture",
      supportContext.hasAttestation ? "Telecharger mon attestation" : "Je veux mon attestation",
      supportContext.hasContract ? "Telecharger mon contrat" : "Je veux mon contrat",
      "J'ai recu un courrier urgent",
      "Probleme de connexion",
    ],
    [supportContext.hasAttestation, supportContext.hasContract]
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 text-slate-950">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6 p-5 sm:p-7 lg:p-9">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="rounded-full bg-primary/10 px-3 py-1 text-primary hover:bg-primary/10">
                <LifeBuoy className="mr-1.5 h-3.5 w-3.5" />
                Support client
              </Badge>
              <Badge variant="outline" className="rounded-full border-slate-200 bg-slate-50 text-slate-700">
                {isProfileLoading ? "Identification du centre..." : contact.label}
              </Badge>
            </div>

            <div className="max-w-3xl space-y-3">
              <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Besoin d'aide ?
              </h1>
              <p className="text-base font-medium leading-7 text-slate-600 sm:text-lg">
                Retrouvez ici les bons raccourcis, le contact de votre centre et un assistant
                pour débloquer rapidement vos demandes courantes.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-11 rounded-xl bg-primary px-5 font-bold text-white shadow-sm hover:bg-primary/90">
                <a href={mailHref}>
                  <Mail className="mr-2 h-4 w-4" />
                  Écrire au support
                </a>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-xl border-slate-200 bg-white px-5 font-bold text-slate-800 hover:bg-slate-50">
                <a href={contact.phoneHref}>
                  <Phone className="mr-2 h-4 w-4" />
                  Appeler le centre
                </a>
              </Button>
            </div>
          </div>

          <div className={cn("relative min-h-[260px] overflow-hidden bg-gradient-to-br p-5 text-white sm:p-7 lg:p-9", contact.accent)}>
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-slate-950/20 blur-3xl" />
            <div className="relative flex h-full flex-col justify-between gap-8">
              <div className="space-y-2">
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/70">
                  Centre de rattachement
                </p>
                <h2 className="text-2xl font-black">{contact.company}</h2>
                <p className="text-sm font-semibold text-white/80">{companyName}</p>
              </div>

              <div className="grid gap-3">
                <a href={contact.phoneHref} className="rounded-2xl border border-white/20 bg-white/15 p-4 backdrop-blur transition hover:bg-white/20">
                  <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/70">
                    <Phone className="h-4 w-4" />
                    Téléphone
                  </span>
                  <span className="mt-1 block text-lg font-black">{contact.phone}</span>
                </a>
                <a href={mailHref} className="rounded-2xl border border-white/20 bg-white/15 p-4 backdrop-blur transition hover:bg-white/20">
                  <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/70">
                    <Mail className="h-4 w-4" />
                    E-mail
                  </span>
                  <span className="mt-1 block break-all text-sm font-bold">{contact.email}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl font-black text-slate-950">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Actions rapides
              </CardTitle>
              <CardDescription className="font-medium text-slate-600">
                Accédez directement au module qui correspond à votre demande.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white hover:shadow-sm"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm ring-1 ring-slate-200">
                    <action.icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2 text-sm font-black text-slate-950">
                      {action.title}
                      <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-primary" />
                    </span>
                    <span className="mt-1 block text-xs font-semibold leading-5 text-slate-600">
                      {action.description}
                    </span>
                  </span>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-black text-amber-950">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                Demande urgente
              </CardTitle>
              <CardDescription className="font-semibold text-amber-800">
                Courrier administratif critique, délai légal, banque, impôt ou recommandé important.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm font-semibold leading-6 text-amber-900">
              <p>
                Appelez le centre puis envoyez un e-mail avec votre société, l'objet et la date limite.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button asChild size="sm" className="rounded-xl bg-amber-600 font-bold text-white hover:bg-amber-700">
                  <a href={contact.phoneHref}>Appeler</a>
                </Button>
                <Button asChild size="sm" variant="outline" className="rounded-xl border-amber-300 bg-white font-bold text-amber-900 hover:bg-amber-100">
                  <a href={mailHref}>Envoyer les détails</a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl font-black text-slate-950">
                <Clock3 className="h-5 w-5 text-primary" />
                Engagement de réponse
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm font-semibold text-slate-700">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-black text-slate-950">Urgent</p>
                <p className="mt-1">Traitement prioritaire après appel téléphonique.</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-black text-slate-950">Standard</p>
                <p className="mt-1">Réponse par e-mail dans les meilleurs délais ouvrés.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl font-black text-slate-950">
                <Sparkles className="h-5 w-5 text-primary" />
                Assistant CCS DOM
              </CardTitle>
              <CardDescription className="font-medium text-slate-600">
                Posez une question simple : courrier, facture, documents, abonnement ou accès.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-600 sm:grid-cols-3">
                <div>
                  <span className="block uppercase tracking-widest text-slate-400">Centre</span>
                  <span className="mt-1 block text-slate-900">{contact.label}</span>
                </div>
                <div>
                  <span className="block uppercase tracking-widest text-slate-400">Contrat</span>
                  <span className="mt-1 block text-slate-900">
                    {supportContext.hasContract ? "Disponible" : contractStatus || "A verifier"}
                  </span>
                </div>
                <div>
                  <span className="block uppercase tracking-widest text-slate-400">Attestation</span>
                  <span className="mt-1 block text-slate-900">
                    {supportContext.hasAttestation ? "Disponible" : attestationStatus || "A verifier"}
                  </span>
                </div>
              </div>
              <Chatbot
                className="h-[540px] max-h-[calc(100dvh-12rem)] min-h-[440px]"
                context={supportContext}
                suggestedPrompts={assistantPrompts}
              />
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl font-black text-slate-950">
                <MessageSquareText className="h-5 w-5 text-primary" />
                Questions fréquentes
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {faqItems.map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-sm font-black text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{item.answer}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
