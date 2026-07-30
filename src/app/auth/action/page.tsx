import { Suspense } from "react";
import { Loader2 } from "lucide-react";

import { AuthActionClient } from "./reset-password-client";

function AuthActionFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-700">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-sm font-medium">Chargement du lien sécurisé...</span>
      </div>
    </div>
  );
}

export default function AuthActionPage() {
  return (
    <Suspense fallback={<AuthActionFallback />}>
      <AuthActionClient />
    </Suspense>
  );
}
