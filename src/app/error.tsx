"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { getFriendlyFirebaseErrorMessage } from "@/firebase/errors";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const friendlyMessage = getFriendlyFirebaseErrorMessage(error);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="max-w-lg rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-900/5">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="mt-5 text-2xl font-black tracking-tight text-slate-950">
          Une action n'a pas abouti
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">{friendlyMessage}</p>
        <button
          onClick={() => reset()}
          className="mt-6 inline-flex items-center rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Réessayer
        </button>
      </div>
    </div>
  );
}
