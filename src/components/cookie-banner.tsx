
"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Cookie } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie_consent", "declined");
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className={cn(
      "fixed bottom-[calc(env(safe-area-inset-bottom)+5.25rem)] left-0 right-0 z-[60] px-4 transition-transform duration-500 sm:bottom-0 sm:p-4",
      showBanner ? "translate-y-0" : "translate-y-full"
    )}>
      <Card className="mx-auto max-h-[42dvh] max-w-4xl overflow-y-auto rounded-3xl border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-950 sm:max-h-none">
        <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-black leading-tight text-slate-950 sm:text-xl dark:text-slate-50">
            <Cookie className="h-4 w-4 shrink-0 sm:h-5 sm:w-5"/>
            <span>Ce site utilise des cookies</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3 pt-0 sm:px-6">
          <CardDescription className="text-xs leading-relaxed text-slate-600 sm:text-sm dark:text-slate-300">
            Nous utilisons des cookies pour assurer le bon fonctionnement de notre site, analyser le trafic et améliorer votre expérience utilisateur. En cliquant sur "Accepter", vous consentez à l'utilisation de tous les cookies. Vous pouvez en savoir plus en consultant notre <Link href="/politique-de-confidentialite" className="underline hover:text-primary">politique de confidentialité</Link>.
          </CardDescription>
        </CardContent>
        <div className="grid grid-cols-2 gap-2 p-4 pt-0 sm:flex sm:p-6 sm:pt-0">
          <Button onClick={handleAccept} className="min-h-11 flex-1 rounded-2xl">Accepter</Button>
          <Button onClick={handleDecline} variant="outline" className="min-h-11 flex-1 rounded-2xl bg-white dark:bg-transparent">Refuser</Button>
        </div>
      </Card>
    </div>
  );
}
