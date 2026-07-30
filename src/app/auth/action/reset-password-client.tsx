"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  applyActionCode,
  confirmPasswordReset,
  verifyPasswordResetCode,
} from "firebase/auth";
import { ArrowRight, CheckCircle2, Loader2, LockKeyhole, ShieldAlert } from "lucide-react";

import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/firebase";

type ScreenState = "checking" | "ready" | "submitting" | "success" | "error";

function getFirebaseActionErrorMessage(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String((error as any).code) : "";

  if (code === "auth/expired-action-code") {
    return "Ce lien a expiré. Veuillez demander un nouvel e-mail de réinitialisation.";
  }

  if (code === "auth/invalid-action-code") {
    return "Ce lien est invalide ou a déjà été utilisé.";
  }

  if (code === "auth/weak-password") {
    return "Le nouveau mot de passe est trop faible. Utilisez au moins 8 caractères.";
  }

  return "Impossible de traiter ce lien. Veuillez réessayer ou demander un nouveau lien.";
}

export function AuthActionClient() {
  const searchParams = useSearchParams();
  const auth = useAuth();
  const { toast } = useToast();

  const mode = searchParams.get("mode") || "";
  const oobCode = searchParams.get("oobCode") || "";
  const continueUrl = searchParams.get("continueUrl") || "/login";

  const [screenState, setScreenState] = useState<ScreenState>("checking");
  const [accountEmail, setAccountEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isResetPassword = mode === "resetPassword";

  const safeContinueUrl = useMemo(() => {
    try {
      const url = new URL(continueUrl, window.location.origin);
      return url.origin === window.location.origin ? `${url.pathname}${url.search}` : "/login";
    } catch {
      return "/login";
    }
  }, [continueUrl]);

  useEffect(() => {
    if (!auth) return;

    const authInstance = auth;
    let cancelled = false;

    async function validateActionCode() {
      if (!oobCode) {
        setErrorMessage("Le lien de sécurité est incomplet.");
        setScreenState("error");
        return;
      }

      try {
        if (isResetPassword) {
          const email = await verifyPasswordResetCode(authInstance, oobCode);
          if (cancelled) return;
          setAccountEmail(email);
          setScreenState("ready");
          return;
        }

        if (mode === "verifyEmail" || mode === "recoverEmail") {
          await applyActionCode(authInstance, oobCode);
          if (cancelled) return;
          setSuccessMessage(
            mode === "verifyEmail"
              ? "Votre adresse e-mail a été vérifiée avec succès."
              : "Votre adresse e-mail a été restaurée avec succès."
          );
          setScreenState("success");
          return;
        }

        setErrorMessage("Cette action n'est pas prise en charge.");
        setScreenState("error");
      } catch (error) {
        if (cancelled) return;
        setErrorMessage(getFirebaseActionErrorMessage(error));
        setScreenState("error");
      }
    }

    validateActionCode();

    return () => {
      cancelled = true;
    };
  }, [auth, isResetPassword, mode, oobCode]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!auth || !oobCode) return;

    if (newPassword.length < 8) {
      setErrorMessage("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setScreenState("submitting");
    setErrorMessage("");

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccessMessage("Votre mot de passe a été mis à jour. Vous pouvez maintenant vous connecter.");
      setScreenState("success");
      toast({
        title: "Mot de passe réinitialisé",
        description: "Vous pouvez vous connecter avec votre nouveau mot de passe.",
      });
    } catch (error) {
      setErrorMessage(getFirebaseActionErrorMessage(error));
      setScreenState("ready");
    }
  };

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-slate-50 text-slate-950">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute right-[-10rem] top-[-10rem] h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-[-12rem] left-1/3 h-96 w-96 rounded-full bg-sky-400/10 blur-3xl" />
      </div>

      <section className="relative hidden min-h-screen w-[42%] overflow-hidden bg-slate-950 text-white lg:block">
        <Image
          src="/images/login-hero.webp"
          alt="Architecture de bureaux moderne"
          fill
          priority
          sizes="42vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/45" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-950/60 to-slate-950/20" />
        <div className="relative z-10 flex h-full flex-col justify-between p-14">
          <Logo dark showSlogan={false} />
          <div>
            <p className="mb-4 inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
              Sécurité du compte
            </p>
            <h1 className="max-w-md text-5xl font-extrabold leading-tight tracking-tight">
              Réinitialisation protégée, expérience CCS DOM.
            </h1>
            <p className="mt-5 max-w-sm text-base font-medium leading-relaxed text-slate-200">
              Votre nouveau mot de passe est traité par Firebase Auth, avec une interface claire sur notre domaine.
            </p>
          </div>
          <p className="text-sm font-semibold text-slate-300">© {new Date().getFullYear()} CCS DOM</p>
        </div>
      </section>

      <section className="relative z-10 flex min-h-screen flex-1 items-center justify-center px-5 py-10 sm:px-8">
        <Card className="w-full max-w-md overflow-hidden border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
          <div className="h-1 w-full bg-gradient-to-r from-primary via-sky-400 to-primary/50" />
          <CardHeader className="space-y-5">
            <div className="lg:hidden">
              <Logo showSlogan={false} />
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              {screenState === "success" ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : screenState === "error" ? (
                <ShieldAlert className="h-6 w-6" />
              ) : (
                <LockKeyhole className="h-6 w-6" />
              )}
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-slate-950">
                {isResetPassword ? "Créer un nouveau mot de passe" : "Action de sécurité"}
              </CardTitle>
              <CardDescription className="mt-2 text-slate-600">
                {screenState === "checking"
                  ? "Nous vérifions la validité de votre lien sécurisé."
                  : isResetPassword
                    ? "Choisissez un mot de passe robuste pour protéger votre espace CCS DOM."
                    : "Votre demande de sécurité est traitée sur le domaine CCS DOM."}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            {screenState === "checking" && (
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-700">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                Vérification du lien en cours...
              </div>
            )}

            {(screenState === "ready" || screenState === "submitting") && (
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Compte concerné</p>
                  <p className="mt-1 break-all text-sm font-semibold text-slate-900">{accountEmail}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">Nouveau mot de passe</Label>
                  <Input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    placeholder="Au moins 8 caractères"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Confirmez le nouveau mot de passe"
                    required
                  />
                </div>

                {errorMessage && (
                  <p className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                    {errorMessage}
                  </p>
                )}

                <Button
                  type="submit"
                  className="h-11 w-full font-semibold"
                  disabled={screenState === "submitting"}
                >
                  {screenState === "submitting" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Mettre à jour le mot de passe
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            )}

            {screenState === "success" && (
              <div className="space-y-5">
                <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium leading-relaxed text-emerald-800">
                  {successMessage}
                </p>
                <Button asChild className="h-11 w-full font-semibold">
                  <Link href={safeContinueUrl}>
                    Retour à la connexion
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}

            {screenState === "error" && (
              <div className="space-y-5">
                <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium leading-relaxed text-red-700">
                  {errorMessage}
                </p>
                <Button asChild className="h-11 w-full font-semibold">
                  <Link href="/login">Demander un nouveau lien</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
