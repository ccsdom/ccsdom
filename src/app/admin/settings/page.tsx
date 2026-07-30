"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { User, updateProfile } from "firebase/auth";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import {
  Loader2,
  User as UserIcon,
  Bell,
  ShieldCheck,
  Mail,
  Save,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Globe,
  Lock,
  Fingerprint
} from "lucide-react";
import { useRole } from "@/hooks/use-simulated-role";
import { UserRole } from "@/lib/constants/roles";
import { useAuth, useDb } from "@/firebase";

interface UserSettings {
  notificationNewClient: boolean;
  notificationDailySummary: boolean;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

export default function AdminSettingsPage() {
  const auth = useAuth();
  const db = useDb();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [settings, setSettings] = useState<UserSettings>({
    notificationNewClient: true,
    notificationDailySummary: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { displayRole } = useRole();

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }

    let unsubscribeSettings: (() => void) | null = null;

    const unsubscribeAuth = auth.onAuthStateChanged((user: User | null) => {
      unsubscribeSettings?.();
      unsubscribeSettings = null;

      if (!user) {
        setCurrentUser(null);
        setUserName("");
        setUserEmail("");
        setIsLoading(false);
        return;
      }

      setCurrentUser(user);
      setUserName(user.displayName || "");
      setUserEmail(user.email || "");

      if (db) {
        const settingsRef = doc(db, `users/${user.uid}/settings`, "config");
        unsubscribeSettings = onSnapshot(
          settingsRef,
          (snapshot) => {
            if (snapshot.exists()) {
              setSettings((prev) => ({ ...prev, ...snapshot.data() }));
            }
            setIsLoading(false);
          },
          (err) => {
            console.error("[Settings] Error listening to settings:", err);
            setIsLoading(false);
          }
        );
        return;
      }

      setIsLoading(false);
    });

    return () => {
      unsubscribeSettings?.();
      unsubscribeAuth();
    };
  }, [auth, db]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSaving(true);

    try {
      if (currentUser.displayName !== userName) {
        await updateProfile(currentUser, { displayName: userName });
      }

      toast({
        title: "Profil mis à jour",
        description: "Le nom d'affichage du compte a été synchronisé.",
        className: "border-emerald-200 bg-white text-emerald-700 font-bold",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Échec de synchronisation",
        description: "Une erreur système a empêché la sauvegarde du profil.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSettingsChange = async (key: keyof UserSettings, value: boolean) => {
    if (!currentUser || !db) return;

    try {
      const settingsRef = doc(db, `users/${currentUser.uid}/settings`, 'config');
      await setDoc(settingsRef, { [key]: value }, { merge: true });

      toast({
        title: "Préférence synchronisée",
        description: `Configuration mise à jour avec succès.`,
        className: "border-primary/20 bg-white",
      });
    } catch (error) {
      console.error("Error updating settings:", error);
      toast({
        variant: "destructive",
        title: "Erreur de persistance",
        description: "Impossible d'enregistrer vos préférences sur le serveur.",
      });
    }
  };

  const roleLabels: Record<UserRole, string> = {
    super_admin: "Super Administrateur",
    manager: "Gestionnaire Global",
    manager_paris: "Gestionnaire Paris",
    manager_orly: "Gestionnaire Orly",
    secretary_paris: "Secrétaire Paris",
    secretary_orly: "Secrétaire Orly",
    client: "Client"
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
            <Loader2 className="h-16 w-16 animate-spin text-primary relative z-10" />
          </div>
          <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-primary animate-pulse">
            Chargement des paramètres...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 px-3 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-3 text-slate-900 sm:px-4 md:px-6 md:py-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5 sm:space-y-6">

        {/* En-tete administrateur */}
        <section className="relative">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:flex-row lg:items-end lg:justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-primary/40" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80 italic">
                  Paramètres administrateur
                </span>
              </div>
              <h1 className="text-2xl font-black leading-tight tracking-tight text-slate-950 sm:text-3xl">
                Paramètres administrateur
              </h1>
              <p className="max-w-md text-sm text-slate-600 font-medium leading-relaxed">
                Gérez les réglages utiles du tableau de bord. Les options réellement actives sont distinguées des modules planifiés.
              </p>
            </div>

            <div className="flex items-center gap-4 self-start rounded-3xl border border-slate-200 bg-slate-50 p-4 lg:self-auto">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20 shadow-inner">
                <Fingerprint className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Statut système</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Opérationnel</span>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <Tabs defaultValue="identity" className="w-full">
          <TabsList className="mb-5 flex h-auto min-h-0 w-full justify-start gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm md:mb-6 md:w-auto md:max-w-fit">
            <TabsTrigger
              value="identity"
              className="h-11 shrink-0 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all data-[state=active]:bg-primary data-[state=active]:text-white md:px-6"
            >
              <UserIcon className="mr-2.5 h-4 w-4" /> Identité
            </TabsTrigger>
            <TabsTrigger
              value="comms"
              className="h-11 shrink-0 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all data-[state=active]:bg-primary data-[state=active]:text-white md:px-6"
            >
              <Bell className="mr-2.5 h-4 w-4" /> Communications
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="h-11 shrink-0 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all data-[state=active]:bg-primary data-[state=active]:text-white md:px-6"
            >
              <Lock className="mr-2.5 h-4 w-4" /> Sécurité
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="identity" key="identity" className="mt-0 outline-none">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid gap-8"
              >
                <Card className="group relative overflow-hidden rounded-3xl border-slate-200 bg-white text-slate-950 shadow-sm">
                  <div className="absolute -top-24 -right-24 h-64 w-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-primary/20 transition-colors duration-700" />

                  <CardHeader className="relative border-b border-slate-200 p-4 sm:p-5 md:p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <CardTitle className="flex items-center gap-3 text-xl font-black tracking-tight sm:text-2xl">
                          Profil administrateur
                        </CardTitle>
                        <CardDescription className="text-xs font-semibold uppercase tracking-widest text-slate-500">Nom, rôle et adresse de connexion du compte.</CardDescription>
                      </div>
                      <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                        Niveau 4
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6 p-4 sm:p-5 md:p-6">
                    <form id="profile-form" className="grid gap-6 lg:grid-cols-2" onSubmit={handleProfileSave}>
                      <motion.div variants={itemVariants} className="space-y-6">
                        <div className="space-y-2.5">
                          <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 ml-1">Nom d'affichage</Label>
                          <div className="relative group/input">
                            <Input
                              id="name"
                              value={userName}
                              onChange={(e) => setUserName(e.target.value)}
                              placeholder="Votre nom complet"
                              className="h-14 bg-slate-50 border-slate-200 focus:border-primary/40 focus:bg-white rounded-2xl transition-all duration-300 pl-12 font-bold text-slate-950 placeholder:text-slate-400"
                            />
                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within/input:text-primary transition-colors" />
                          </div>
                        </div>

                        <div className="space-y-2.5">
                          <Label htmlFor="role" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 ml-1">Rôle Système Approuvé</Label>
                          <div className="relative group/role">
                            <div className="h-14 bg-slate-100 border border-slate-200 rounded-2xl flex items-center px-12 relative overflow-hidden">
                              <div className="absolute left-0 top-0 h-full w-1.5 bg-primary/40" />
                              <span className="font-black text-xs uppercase tracking-[0.15em] text-slate-800 italic">
                                {displayRole ? roleLabels[displayRole] : 'Chargement...'}
                              </span>
                            </div>
                            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40" />
                          </div>
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider px-1">Le rôle est défini par le Super Admin et ne peut être modifié ici.</p>
                        </div>
                      </motion.div>

                      <motion.div variants={itemVariants} className="space-y-6">
                        <div className="space-y-2.5">
                          <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 ml-1">Adresse de connexion</Label>
                          <div className="relative group/input">
                            <Input
                              id="email"
                              type="email"
                              value={userEmail}
                              readOnly
                              className="h-14 cursor-not-allowed rounded-2xl border-slate-200 bg-slate-100 pl-12 font-bold text-slate-700 shadow-sm"
                            />
                            <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                          </div>
                          <p className="px-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                            La modification d'email nécessite une vérification dédiée. Elle ne se fait pas depuis cette page.
                          </p>
                        </div>

                        <div className="pt-2">
                           <div className="group/badge relative flex items-center gap-4 overflow-hidden rounded-3xl border border-emerald-200 bg-emerald-50 p-4 sm:p-5">
                              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/badge:opacity-10 transition-opacity">
                                <CheckCircle2 className="h-16 w-16" />
                              </div>
                              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                              </div>
                              <div className="space-y-1">
                                <div className="text-xs font-black uppercase tracking-[0.1em] text-emerald-700">Compte Identifié</div>
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                                  Synchronisation Firestore Active
                                </div>
                              </div>
                           </div>
                        </div>
                      </motion.div>
                    </form>
                  </CardContent>

                  <CardFooter className="flex flex-col items-stretch gap-4 border-t border-slate-200 bg-slate-50 p-4 sm:p-5 md:flex-row md:items-center md:justify-between md:p-6">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] max-w-[200px]">
                      Dernière modification : {new Date().toLocaleDateString('fr-FR')}
                    </p>
                    <Button
                      form="profile-form"
                      type="submit"
                      disabled={isSaving}
                      className="group relative h-12 overflow-hidden rounded-2xl bg-primary px-6 text-white shadow-sm shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95 sm:h-14 sm:px-10"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <span className="relative flex items-center gap-3 font-black uppercase tracking-[0.2em] text-[11px]">
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                        ) : (
                          <Save className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                        )}
                        {isSaving ? "Persistance..." : "Enregistrer le nom"}
                      </span>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="comms" key="comms" className="mt-0 outline-none">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid gap-8"
              >
                <Card className="overflow-hidden rounded-3xl border-slate-200 bg-white text-slate-950 shadow-sm">
                  <CardHeader className="border-b border-slate-200 p-4 sm:p-5 md:p-6">
                    <div className="space-y-2">
                       <CardTitle className="flex items-center gap-3 text-xl font-black tracking-tight sm:text-2xl">
                          Notifications
                        </CardTitle>
                        <CardDescription className="text-xs font-semibold uppercase tracking-widest text-slate-500">Ces réglages pilotent réellement les emails métier envoyés aux équipes du centre.</CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 p-4 sm:p-5 md:p-6">
                    <motion.div variants={itemVariants}>
                      <div className="group relative flex flex-col gap-4 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-4 transition-all duration-300 hover:border-primary/20 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                        <div className="space-y-2 relative z-10">
                          <div className="flex items-center gap-3 mb-1">
                            <Label htmlFor="new-client-notification" className="text-sm font-black uppercase tracking-wider group-hover:text-primary transition-colors cursor-pointer">
                              Alertes nouvelles inscriptions
                            </Label>
                            <Badge className="h-4 border-none bg-emerald-500/10 text-[8px] text-emerald-600">Instantané</Badge>
                          </div>
                          <p className="text-xs text-slate-600 font-medium max-w-md leading-relaxed">
                            Si l'option est active, le manager ou la secrétaire du centre reçoit un email lorsqu'une nouvelle demande arrive ou qu'un dossier devient complet.
                          </p>
                        </div>
                        <Switch
                          id="new-client-notification"
                          checked={settings.notificationNewClient}
                          onCheckedChange={(checked) => handleSettingsChange('notificationNewClient', checked)}
                          className="data-[state=checked]:bg-primary h-7 w-12"
                        />
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <div className="group relative flex flex-col gap-4 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-4 transition-all duration-300 hover:border-primary/20 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                        <div className="space-y-2 relative z-10">
                          <div className="flex items-center gap-3 mb-1">
                            <Label htmlFor="scan-summary-notification" className="text-sm font-black uppercase tracking-wider group-hover:text-primary transition-colors cursor-pointer">
                              Résumé quotidien d'activité
                            </Label>
                            <Badge className="h-4 border-none bg-amber-500/10 text-[8px] text-amber-600">07:15</Badge>
                          </div>
                          <p className="text-xs text-slate-600 font-medium max-w-md leading-relaxed">
                            Si l'option est active, un résumé quotidien est envoyé le matin avec les dossiers à valider, courriers reçus et urgences du centre.
                          </p>
                        </div>
                        <Switch
                          id="scan-summary-notification"
                          checked={settings.notificationDailySummary}
                          onCheckedChange={(checked) => handleSettingsChange('notificationDailySummary', checked)}
                          className="data-[state=checked]:bg-primary h-7 w-12"
                        />
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="pt-4">
                      <div className="group flex items-start gap-4 rounded-3xl border border-orange-200 bg-orange-50 p-4 sm:p-5">
                        <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shrink-0">
                          <AlertCircle className="h-5 w-5 text-orange-500" />
                        </div>
                        <div className="space-y-2">
                           <p className="text-xs font-black uppercase tracking-[0.15em] text-orange-600">Raccordement actif</p>
                           <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
                            Ces préférences sont lues par les fonctions email. Si toute l'équipe d'un centre désactive une option, l'envoi staff correspondant est volontairement ignoré et tracé.
                           </p>
                        </div>
                      </div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="security" key="security" className="mt-0 outline-none">
               <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid gap-8"
              >
                <Card className="overflow-hidden rounded-3xl border-slate-200 bg-white text-slate-950 shadow-sm">
                  <CardHeader className="border-b border-slate-200 p-4 sm:p-5 md:p-6">
                    <div className="space-y-2">
                       <CardTitle className="flex items-center gap-3 text-xl font-black tracking-tight sm:text-2xl">
                          Sécurité
                        </CardTitle>
                        <CardDescription className="text-xs font-semibold uppercase tracking-widest text-slate-500">Renforcement de la sécurité d'accès au panel admin.</CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 p-4 sm:p-5 md:p-6">
                    <motion.div variants={itemVariants}>
                      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-white">
                            <AlertCircle className="h-5 w-5 text-amber-600" />
                          </div>
                          <div className="space-y-2">
                            <Badge className="w-fit border-amber-200 bg-white text-[9px] font-black uppercase tracking-[0.18em] text-amber-700">
                              Transparence produit
                            </Badge>
                            <p className="text-sm font-bold leading-relaxed text-slate-800">
                              Les modules avancés de sécurité ne sont pas encore activés depuis cette page. Ils seront raccordés uniquement via Firebase Auth/MFA et un vrai journal d'audit.
                            </p>
                            <p className="text-xs font-semibold leading-relaxed text-slate-600">
                              En attendant, les accès restent protégés par Firebase Authentication, les rôles Firestore et les règles de sécurité déployées.
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2">
                      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                            <Smartphone className="h-6 w-6 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Label className="text-sm font-black uppercase tracking-wider text-slate-900">Double authentification</Label>
                              <Badge className="border-slate-200 bg-white text-[8px] font-black uppercase tracking-widest text-slate-500">
                                À venir
                              </Badge>
                            </div>
                            <p className="text-[11px] font-semibold leading-relaxed text-slate-600">
                              Sera activée avec un parcours complet : ré-authentification, second facteur et procédure de récupération.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10">
                            <Globe className="h-6 w-6 text-amber-600" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Label className="text-sm font-black uppercase tracking-wider text-slate-900">Alertes de connexion</Label>
                              <Badge className="border-slate-200 bg-white text-[8px] font-black uppercase tracking-widest text-slate-500">
                                À raccorder
                              </Badge>
                            </div>
                            <p className="text-[11px] font-semibold leading-relaxed text-slate-600">
                              Nécessite un journal réel des connexions avant d'envoyer des alertes sur IP ou localisation inconnue.
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Sessions et appareils</p>
                            <p className="text-xs font-semibold leading-relaxed text-slate-600">
                              La gestion des appareils actifs sera affichée ici quand le suivi de sessions sera branché. Aucune donnée fictive n'est affichée.
                            </p>
                          </div>
                          <Badge className="w-fit border-slate-200 bg-slate-50 px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">
                            Module planifié
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>

        {/* Dynamic System Info Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1 }}
          className="flex flex-col items-center gap-4 pb-8 pt-6 text-center sm:pt-8"
        >
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
          <p className="text-[9px] font-black uppercase tracking-[0.6em] text-slate-500">
            Interface administrateur • Moteur v2.4.9 • <span className="text-primary italic">Session sécurisée</span>
          </p>
          <div className="flex gap-6 mt-2 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
             <div className="flex items-center gap-2">
               <Globe className="h-3 w-3" />
               <span className="text-[8px] font-bold uppercase tracking-wider">Infrastructure cloud</span>
             </div>
             <div className="flex items-center gap-2">
               <ShieldCheck className="h-3 w-3" />
               <span className="text-[8px] font-bold uppercase tracking-wider">Accès contrôlés</span>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
