
"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/logo";
import { Loader2, Moon, Sun, Eye, EyeOff, ArrowRight, Shield, User as UserIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import Image from "next/image";
import {
  getIdTokenResult,
  getRedirectResult,
  GoogleAuthProvider,
  linkWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type OAuthCredential,
  User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useAuth, useDb, useGoogleProvider } from "@/firebase";
import { normalizeRole, STAFF_ROLES } from "@/lib/constants/roles";
import { UserRole } from "@/lib/types/user";

type AccountAccess = {
  hasBusinessAccount: boolean;
  role: UserRole;
};

type LoginProvider = "password" | "google";

const STAFF_GOOGLE_BLOCKED_DESCRIPTION =
  "Les comptes managers et collaborateurs doivent se connecter avec e-mail et mot de passe. La connexion Google reste réservée aux clients.";

function isStaffRole(role: UserRole) {
  return STAFF_ROLES.includes(role);
}

const GoogleIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1">
        <title>Google</title>
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.86 2.11-4.4 2.11-3.37 0-6.13-2.8-6.13-6.13s2.76-6.13 6.13-6.13c1.91 0 3.1.79 3.8 1.5l2.6-2.6C16.99 3.2 14.98 2 12.48 2c-5.4 0-9.8 4.4-9.8 9.8s4.4 9.8 9.8 9.8c5.6 0 9.4-3.8 9.4-9.5 0-.58-.05-1.12-.14-1.68H12.48z" fill="currentColor"></path>
    </svg>
);

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
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


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [pendingGoogleCredential, setPendingGoogleCredential] =
    useState<OAuthCredential | null>(null);
  const [pendingGoogleEmail, setPendingGoogleEmail] = useState("");
  const { setTheme, theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const auth = useAuth();
  const db = useDb();
  const googleProvider = useGoogleProvider();

  const loginSchema = z.object({
    email: z
      .string()
      .email({ message: "Veuillez saisir une adresse e-mail valide." }),
    password: z
      .string()
      .min(1, { message: "Le mot de passe est requis." }),
  });

  type LoginFormValues = z.infer<typeof loginSchema>;

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
 },
  });

  const resolveAccountAccess = useCallback(
    async (user: User): Promise<AccountAccess> => {
      const idTokenResult = await getIdTokenResult(user, true);
      const claimRole = normalizeRole(idTokenResult.claims.role);
      let resolvedRole = claimRole || ("client" as UserRole);
      let hasBusinessAccount = !!claimRole && STAFF_ROLES.includes(claimRole);

      if (db) {
        const [userSnap, clientSnap] = await Promise.all([
          getDoc(doc(db, "users", user.uid)).catch(() => null),
          getDoc(doc(db, "clients", user.uid)).catch(() => null),
        ]);

        const userData = userSnap?.exists() ? userSnap.data() : null;
        const userRole = normalizeRole(userData?.role);

        if (userSnap?.exists()) {
          hasBusinessAccount = true;
          resolvedRole = userRole || resolvedRole || "client";
        }

        if (clientSnap?.exists()) {
          hasBusinessAccount = true;
          resolvedRole = resolvedRole || "client";
        }
      }

      return {
        hasBusinessAccount,
        role: resolvedRole || "client",
      };
    },
    [db]
  );

  const handleLoginSuccess = useCallback(async (
    user: User,
    options: {
      provider?: LoginProvider;
      requireExistingBusinessAccount?: boolean;
    } = {}
  ) => {
    try {
        toast({
            title: "Vérification de l'accès",
            description: "Vérification de votre rôle...",
        });

        const accountAccess = await resolveAccountAccess(user);

        if (
          options.requireExistingBusinessAccount &&
          !accountAccess.hasBusinessAccount
        ) {
          if (auth) {
            await signOut(auth);
          }

          toast({
            variant: "destructive",
            title: "Aucun compte CCS DOM associé",
            description:
              "Cette adresse Google n'est pas encore rattachée à un compte client ou collaborateur. Veuillez vous inscrire ou contacter votre gestionnaire.",
          });

          return;
        }

        if (options.provider === "google" && isStaffRole(accountAccess.role)) {
          if (auth) {
            await signOut(auth);
          }

          toast({
            variant: "destructive",
            title: "Connexion Google non autorisée",
            description: STAFF_GOOGLE_BLOCKED_DESCRIPTION,
          });

          return;
        }

        if (isStaffRole(accountAccess.role)) {
            router.push('/admin');
        } else {
            router.push('/dashboard');
        }
    } catch (error) {
        console.error("Erreur lors de la récupération du rôle utilisateur via les claims:", error);
        toast({
            variant: "destructive",
            title: "Erreur de redirection",
            description: "Impossible de vérifier votre rôle. Redirection vers le tableau de bord client.",
        });
        router.push('/dashboard'); // Safe fallback
    }
  }, [auth, resolveAccountAccess, router, toast]);


    const handleLoginError = useCallback((error: any) => {
        let title = "Erreur de connexion";
        let description = "Une erreur est survenue. Veuillez réessayer.";

        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            description = "L'adresse e-mail ou le mot de passe est incorrect.";
        } else if (error.code === 'auth/invalid-email') {
            description = "L'adresse e-mail est invalide.";
        } else if (error.code === 'auth/popup-closed-by-user') {
            title = "Connexion Google interrompue";
            description = "La fenêtre Google a été fermée avant la fin de la connexion.";
        } else if (error.code === 'auth/cancelled-popup-request') {
            title = "Connexion Google déjà ouverte";
            description = "Une demande de connexion Google est déjà en cours.";
        } else if (error.code === 'auth/unauthorized-domain') {
            title = "Domaine non autorisé";
            description = "Ajoutez ce domaine dans Firebase Authentication > Paramètres > Domaines autorisés.";
        } else if (error.code === 'auth/operation-not-allowed') {
            title = "Google non activé";
            description = "Le fournisseur Google doit être activé dans Firebase Authentication.";
        } else if (error.code === 'auth/account-exists-with-different-credential') {
            title = "Compte déjà existant";
            description = "Ce compte existe déjà avec un autre mode de connexion. Saisissez votre mot de passe pour associer Google.";
        }

        toast({ variant: "destructive", title, description });
    }, [toast]);

  const prepareGoogleAccountLinking = useCallback(
    (error: any) => {
      const credential = GoogleAuthProvider.credentialFromError(error);
      const email = String(error?.customData?.email ?? form.getValues("email") ?? "")
        .trim()
        .toLowerCase();

      if (!credential || !email) {
        return false;
      }

      setPendingGoogleCredential(credential);
      setPendingGoogleEmail(email);
      form.setValue("email", email, { shouldValidate: true });

      toast({
        title: "Compte CCS DOM trouvé",
        description:
          "Saisissez votre mot de passe. Si votre compte est éligible, Google pourra être associé.",
      });

      return true;
    },
    [form, toast]
  );

  useEffect(() => {
    if (!auth) return;

    let isMounted = true;

    getRedirectResult(auth)
      .then(async (result) => {
        if (!isMounted || !result?.user) return;
        await handleLoginSuccess(result.user, {
          provider: "google",
          requireExistingBusinessAccount: true,
        });
      })
      .catch((error: any) => {
        if (!isMounted) return;

        if (
          error?.code === "auth/account-exists-with-different-credential" &&
          prepareGoogleAccountLinking(error)
        ) {
          return;
        }

        handleLoginError(error);
      })
      .finally(() => {
        if (isMounted) {
          setIsGoogleLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [auth, handleLoginError, handleLoginSuccess, prepareGoogleAccountLinking]);

  const onSubmit = async (data: LoginFormValues) => {
    if (!auth) return;
    setIsLoading(true);
    try {
        const email = data.email.trim().toLowerCase();
        if (pendingGoogleCredential && pendingGoogleEmail && pendingGoogleEmail !== email) {
          toast({
            variant: "destructive",
            title: "Adresse e-mail différente",
            description: `Pour associer Google, utilisez l'adresse ${pendingGoogleEmail}.`,
          });
          return;
        }

        const userCredential = await signInWithEmailAndPassword(auth, email, data.password);

        if (pendingGoogleCredential) {
          const accountAccess = await resolveAccountAccess(userCredential.user);

          if (isStaffRole(accountAccess.role)) {
            toast({
              variant: "destructive",
              title: "Association Google refusée",
              description: STAFF_GOOGLE_BLOCKED_DESCRIPTION,
            });
          } else {
            try {
              await linkWithCredential(userCredential.user, pendingGoogleCredential);
              toast({
                title: "Google associé",
                description: "Vous pourrez désormais vous connecter avec Google.",
              });
            } catch (linkError: any) {
              if (linkError?.code === "auth/provider-already-linked") {
                toast({
                  title: "Google déjà associé",
                  description: "Ce compte peut déjà utiliser la connexion Google.",
                });
              } else if (linkError?.code === "auth/credential-already-in-use") {
                toast({
                  variant: "destructive",
                  title: "Compte Google déjà utilisé",
                  description:
                    "Cette identité Google est déjà liée à un autre compte. La connexion classique reste active.",
                });
              } else {
                throw linkError;
              }
            }
          }

          setPendingGoogleCredential(null);
          setPendingGoogleEmail("");
        }

        await handleLoginSuccess(userCredential.user, { provider: "password" });
    } catch (error) {
        handleLoginError(error);
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    if (!auth || !googleProvider) return;
    setIsGoogleLoading(true);
    setPendingGoogleCredential(null);
    setPendingGoogleEmail("");
    try {
        const result = await signInWithPopup(auth, googleProvider);
        await handleLoginSuccess(result.user, {
          provider: "google",
          requireExistingBusinessAccount: true,
        });
    } catch (error: any) {
        if (
          error?.code === "auth/account-exists-with-different-credential" &&
          prepareGoogleAccountLinking(error)
        ) {
          return;
        }

        if (
          error?.code === "auth/popup-blocked" ||
          error?.code === "auth/operation-not-supported-in-this-environment"
        ) {
          toast({
            title: "Ouverture de Google",
            description:
              "Votre navigateur bloque la fenêtre. Redirection vers Google en cours...",
          });
          await signInWithRedirect(auth, googleProvider);
          return;
        }

        handleLoginError(error);
    } finally {
        setIsGoogleLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!auth) return;
    const email = form.getValues("email").trim().toLowerCase();
    if (!email) {
      toast({
        variant: "destructive",
        title: "Adresse e-mail manquante",
        description: "Veuillez saisir votre adresse e-mail avant de demander une réinitialisation.",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "https://ccsdom.fr";

      await sendPasswordResetEmail(auth, email, {
        url: `${origin}/login`,
        handleCodeInApp: false,
      });
      toast({
        title: "E-mail de réinitialisation envoyé",
        description: `Un lien pour réinitialiser votre mot de passe a été envoyé à ${email}.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'envoyer l'e-mail de réinitialisation. Veuillez vérifier l'adresse e-mail.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute right-[-10rem] top-[-10rem] h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-[-12rem] left-1/3 h-96 w-96 rounded-full bg-sky-400/10 blur-3xl" />
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-4 z-50 rounded-full border border-slate-200 bg-white/80 text-slate-700 shadow-sm backdrop-blur hover:bg-white dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-900"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        aria-label="Changer de thème"
      >
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Changer de thème</span>
      </Button>

      {/* Left Panel: sober brand reassurance */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative hidden overflow-hidden border-r border-slate-900 bg-slate-950 text-white lg:flex lg:w-[46%]"
      >
        <Image
          src="/images/login-hero.webp"
          alt="Architecture de bureaux moderne"
          fill
          priority
          sizes="46vw"
          className="absolute inset-0 object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/45" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-950/60 to-slate-950/15" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.24),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.18),transparent_32%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:46px_46px] opacity-30" />
        
        <div className="relative z-10 flex h-full w-full flex-col justify-between p-14">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <div className="mb-8 w-fit rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
              <Logo dark={true} />
            </div>
            <h1 className="max-w-md text-5xl font-extrabold leading-tight tracking-tight">
              Votre espace CCS DOM, simple, sécurisé, maîtrisé.
            </h1>
            <p className="mt-6 max-w-sm text-lg font-light leading-relaxed text-slate-300">
              Clients, gestionnaires et secrétariat accèdent ici à leurs dossiers, courriers, documents et factures.
            </p>
          </motion.div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="grid gap-3 text-sm text-slate-300"
          >
            <div className="rounded-2xl border border-white/15 bg-slate-950/55 p-4 shadow-lg shadow-black/20">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <p className="font-semibold text-white">Accès protégé par rôles</p>
              </div>
              <p className="mt-2 font-medium leading-relaxed text-slate-200">Chaque profil rejoint automatiquement son espace : client, manager, secrétaire ou super admin.</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-slate-950/50 p-4 shadow-lg shadow-black/20">
              <div className="flex items-center gap-3">
                <UserIcon className="h-5 w-5 text-primary" />
                <p className="font-semibold text-white">Une plateforme de production</p>
              </div>
              <p className="mt-2 font-medium leading-relaxed text-slate-200">Courriers, validation, facturation et documents restent centralisés dans un même hub.</p>
            </div>
          </motion.div>
          
          <p className="text-sm font-semibold text-slate-300">© {new Date().getFullYear()} CCS DOM. Plateforme SaaS sécurisée.</p>
        </div>
      </motion.div>

      {/* Right Panel: clear login card */}
      <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-5 py-10 sm:px-8 lg:w-[54%] lg:px-16">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          <motion.div variants={itemVariants} className="mb-8 text-center lg:text-left">
            <div className="mb-6 flex justify-center lg:hidden">
              <Logo showSlogan={false} />
            </div>
            <div className="mb-4 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Shield className="mr-1 h-3 w-3" /> Connexion sécurisée
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Accéder à mon espace</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Connectez-vous pour retrouver vos documents, courriers, factures et outils de gestion.
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="relative overflow-hidden border border-slate-200 bg-white shadow-xl shadow-slate-200/70 dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-black/30">
              <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-primary via-sky-400 to-primary/50" />
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-slate-950 dark:text-white">Identifiants</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Utilisez l’e-mail associé à votre compte CCS DOM.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="email"
                                placeholder="votre.email@domain.com"
                                autoComplete="email"
                                className="h-11 border-slate-200 bg-white text-slate-950 transition-all duration-300 focus:border-primary/50 focus:ring-primary/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mot de passe</FormLabel>
                            <Button
                                type="button"
                                variant="link"
                                className="h-auto p-0 text-[11px] font-semibold text-primary/80 transition-colors hover:text-primary"
                                onClick={handlePasswordReset}
                            >
                                Mot de passe oublié ?
                            </Button>
                          </div>
                          <div className="relative">
                            <FormControl>
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                className="h-11 border-slate-200 bg-white pr-11 text-slate-950 transition-all duration-300 focus:border-primary/50 focus:ring-primary/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                                {...field}
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                              onClick={() => setShowPassword((prev) => !prev)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                    {pendingGoogleCredential && (
                      <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3 text-xs leading-relaxed text-slate-700 dark:text-slate-200">
                        <p className="font-semibold text-primary">
                          Association Google en attente
                        </p>
                        <p className="mt-1">
                          Entrez le mot de passe du compte{" "}
                          <span className="font-semibold">{pendingGoogleEmail}</span>{" "}
                          pour continuer. Les accès internes restent limités à
                          e-mail et mot de passe.
                        </p>
                      </div>
                    )}
                    <Button 
                      type="submit" 
                      className="group h-11 w-full bg-primary font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:bg-primary/90" 
                      disabled={isLoading || isGoogleLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <span className="flex items-center">
                          {pendingGoogleCredential
                            ? "Continuer la connexion"
                            : "Se connecter"}{" "}
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                      )}
                    </Button>
                  </form>
                </Form>
                
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200 dark:border-slate-800" />
                  </div>
                  <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
                    <span className="bg-white px-4 text-slate-400 dark:bg-slate-900 dark:text-slate-500">
                      ou continuer avec
                    </span>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="group h-11 w-full border-slate-200 bg-white text-slate-800 transition-all duration-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900" 
                  onClick={handleGoogleSignIn} 
                  disabled={isLoading || isGoogleLoading}
                >
                  {isGoogleLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <span className="flex items-center">
                      <GoogleIcon /> Poursuivre avec Google
                    </span>
                  )}
                </Button>

                <div className="mt-8 text-center text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Première visite ?</span>{" "}
                  <Link
                    href="/signup"
                    className="font-bold text-primary underline decoration-2 underline-offset-4 transition-all hover:text-primary/80"
                  >
                    Créer mon compte
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            variants={itemVariants} 
            className="mt-10 text-center text-[10px] font-medium uppercase tracking-widest text-slate-400 transition-opacity duration-300 dark:text-slate-600"
          >
            © {new Date().getFullYear()} CCS DOM — Domiciliation & services administratifs
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
