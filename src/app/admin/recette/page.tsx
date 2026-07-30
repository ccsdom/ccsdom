"use client";

import * as React from "react";
import {
  BadgeCheck,
  ClipboardCheck,
  CreditCard,
  FileText,
  Mail,
  MessageSquareWarning,
  ScanLine,
  ShieldCheck,
  UserCheck,
  Users2,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCenterAccess } from "@/hooks/use-center-access";
import { cn } from "@/lib/utils";

type RecipeStep = {
  title: string;
  expected: string;
  checks: string[];
};

type RecipeBlock = {
  id: string;
  title: string;
  role: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  steps: RecipeStep[];
};

const recipeBlocks: RecipeBlock[] = [
  {
    id: "access",
    title: "Accès et rôles",
    role: "Tous les testeurs",
    icon: ShieldCheck,
    accent: "border-blue-200 bg-blue-50 text-blue-900",
    steps: [
      {
        title: "Connexion avec le bon compte",
        expected: "Chaque utilisateur arrive dans son espace : client, manager, secrétaire ou super admin.",
        checks: [
          "Le menu affiché correspond bien au rôle.",
          "Le manager Paris ne voit pas les données Orly, et inversement.",
          "La secrétaire voit les modules utiles à la production quotidienne.",
        ],
      },
      {
        title: "Déconnexion et reconnexion",
        expected: "La session se ferme proprement, puis l'utilisateur revient sur son espace sans erreur.",
        checks: [
          "Aucun écran bloqué après déconnexion.",
          "Le rôle reste correct après reconnexion.",
          "Les menus mobiles restent accessibles.",
        ],
      },
    ],
  },
  {
    id: "signup",
    title: "Inscription et validation",
    role: "Manager",
    icon: UserCheck,
    accent: "border-emerald-200 bg-emerald-50 text-emerald-900",
    steps: [
      {
        title: "Inscription publique complète",
        expected: "Un prospect choisit un centre, paie, signe, puis apparaît dans les demandes à valider.",
        checks: [
          "Le centre choisi reste cohérent jusqu'à la validation.",
          "Le contrat et l'attestation sont générés.",
          "La demande apparaît uniquement dans le bon centre.",
        ],
      },
      {
        title: "Création d'un client par manager",
        expected: "Le client est créé, son accès est préparé et ses documents peuvent être ajoutés.",
        checks: [
          "L'abonnement choisi est bien enregistré.",
          "Les coordonnées client sont modifiables si elles sont incorrectes.",
          "Le client peut ensuite accéder à son espace.",
        ],
      },
    ],
  },
  {
    id: "mail",
    title: "Courrier et scan",
    role: "Secrétaire / manager",
    icon: ScanLine,
    accent: "border-amber-200 bg-amber-50 text-amber-900",
    steps: [
      {
        title: "Scanner un courrier",
        expected: "Le courrier est rattaché au bon client et visible dans son espace.",
        checks: [
          "La liste clients affiche uniquement les clients éligibles au scan.",
          "Le courrier apparaît dans /dashboard/mail côté client.",
          "Le centre du courrier est bien isolé.",
        ],
      },
      {
        title: "Analyse IA et notification",
        expected: "La classification, le résumé et les notifications respectent le forfait du client.",
        checks: [
          "Classic : pas de scan ni notification automatique.",
          "Starter/Business : notification simple.",
          "Premium : résumé IA et priorité si nécessaire.",
        ],
      },
    ],
  },
  {
    id: "billing",
    title: "Abonnement et factures",
    role: "Client / manager",
    icon: CreditCard,
    accent: "border-indigo-200 bg-indigo-50 text-indigo-900",
    steps: [
      {
        title: "Consulter une facture",
        expected: "La facture s'ouvre dans un nouvel onglet et reste accessible au client et au centre.",
        checks: [
          "Le PDF n'écrase pas la page courante.",
          "La facture est remplie avec les bonnes informations.",
          "Les prix affichés sont indiqués HT.",
        ],
      },
      {
        title: "Changer de forfait",
        expected: "Le changement est clair, traçable et cohérent avec la période de facturation.",
        checks: [
          "Le nouveau forfait apparaît après retour Stripe.",
          "Le client comprend ce qui change dans son espace.",
          "Le manager voit le forfait actualisé.",
        ],
      },
    ],
  },
  {
    id: "documents",
    title: "Documents client",
    role: "Client / manager",
    icon: FileText,
    accent: "border-slate-200 bg-slate-50 text-slate-900",
    steps: [
      {
        title: "Documents CCS",
        expected: "Le contrat, l'attestation et les factures sont téléchargeables sans erreur de permissions.",
        checks: [
          "Le contrat s'ouvre correctement.",
          "L'attestation contient les informations client et centre.",
          "Les anciens clients importés conservent leur ancienneté.",
        ],
      },
      {
        title: "Documents uploadés",
        expected: "Les justificatifs envoyés ou ajoutés par le manager sont visibles dans l'espace documents.",
        checks: [
          "Le client retrouve ses documents déposés.",
          "Le manager peut ajouter les pièces pour un client peu à l'aise avec l'outil.",
          "L'aperçu ou l'ouverture externe fonctionne.",
        ],
      },
    ],
  },
  {
    id: "feedback",
    title: "Signalement bêta",
    role: "Tous les testeurs",
    icon: MessageSquareWarning,
    accent: "border-rose-200 bg-rose-50 text-rose-900",
    steps: [
      {
        title: "Utiliser le bouton Signaler",
        expected: "Chaque testeur peut remonter un bug ou une suggestion depuis la page concernée.",
        checks: [
          "Le message contient la page et le rôle automatiquement.",
          "Le super admin voit le retour dans /admin/feedback.",
          "Le statut peut passer à En cours, Corrigé ou Écarté.",
        ],
      },
    ],
  },
];

const smokeChecklist = [
  "Connexion manager Orly, manager Paris, secrétaire et client.",
  "Vérifier l'isolation des données par centre.",
  "Créer une demande d'inscription complète.",
  "Valider un dossier et ouvrir les PDF générés.",
  "Scanner un courrier et vérifier sa réception côté client.",
  "Tester les factures et les changements d'abonnement.",
  "Envoyer au moins un retour bêta depuis chaque rôle.",
];

export default function AdminRecettePage() {
  const { displayRole, actualRole } = useCenterAccess();
  const isSuperAdmin = actualRole === "super_admin";

  return (
    <div className="space-y-6 text-slate-950">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5 md:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-primary">
              <ClipboardCheck className="h-3.5 w-3.5" />
              Pré-recette terrain
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
              Checklist de recette
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
              Guide opérationnel pour faire tester CCS DOM par les managers, secrétaires et clients pilotes.
              L'objectif est simple : vérifier les parcours essentiels et centraliser les retours.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="outline" className="border-slate-200 bg-white text-slate-700">
              <Link href="/admin/feedback">
                Voir les retours
                <MessageSquareWarning className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              type="button"
              onClick={() => window.print()}
              className="bg-primary text-primary-foreground"
            >
              Imprimer la checklist
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardDescription>Phase actuelle</CardDescription>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <BadgeCheck className="h-5 w-5 text-emerald-500" />
              Bêta terrain
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardDescription>Profil connecté</CardDescription>
            <CardTitle className="text-2xl">{displayRole ?? actualRole ?? "Utilisateur"}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardDescription>Pilotage</CardDescription>
            <CardTitle className="text-2xl">
              {isSuperAdmin ? "Super admin" : "Centre"}
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5 md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <Users2 className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-2xl font-black tracking-tight">Scénario rapide obligatoire</h2>
            <p className="text-sm text-slate-500">
              À faire au moins une fois avant de demander un retour global aux utilisateurs.
            </p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {smokeChecklist.map((item, index) => (
            <div key={item} className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-black text-white">
                {index + 1}
              </span>
              <p className="text-sm font-semibold leading-6 text-slate-700">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5">
        {recipeBlocks.map((block) => (
          <article key={block.id} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex gap-4">
                <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border", block.accent)}>
                  <block.icon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-950">{block.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">À tester par : {block.role}</p>
                </div>
              </div>
              <Badge variant="outline" className={cn("w-fit", block.accent)}>
                {block.steps.length} scénario{block.steps.length > 1 ? "s" : ""}
              </Badge>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {block.steps.map((step) => (
                <div key={step.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-lg font-black tracking-tight text-slate-950">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    <span className="font-bold text-slate-950">Résultat attendu : </span>
                    {step.expected}
                  </p>
                  <div className="mt-4 space-y-2">
                    {step.checks.map((check) => (
                      <div key={check} className="flex gap-2 text-sm leading-6 text-slate-700">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{check}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-slate-950 p-5 text-white shadow-xl shadow-slate-900/10 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-primary">
              <Mail className="h-3.5 w-3.5" />
              Consigne aux testeurs
            </div>
            <h2 className="text-2xl font-black tracking-tight">Comment remonter un problème</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
              Quand un testeur observe un blocage, une incohérence ou une gêne visuelle, il doit rester sur la page,
              cliquer sur <span className="font-bold text-white">Signaler</span>, décrire ce qu'il vient de faire,
              puis choisir la priorité. Cela évite les retours dispersés par SMS ou e-mail.
            </p>
          </div>
          <Button asChild className="bg-white text-slate-950 hover:bg-slate-100">
            <Link href="/admin/feedback">Ouvrir le cockpit bêta</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
