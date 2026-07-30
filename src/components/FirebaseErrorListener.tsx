'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Button } from '@/components/ui/button';

/**
 * An invisible component that listens for globally emitted 'permission-error' events.
 * It throws any received error to be caught by Next.js's global-error.tsx.
 */
export function FirebaseErrorListener() {
  // Use the specific error type for the state for type safety.
  const [error, setError] = useState<FirestorePermissionError | null>(null);

  useEffect(() => {
    // The callback now expects a strongly-typed error, matching the event payload.
    const handleError = (error: FirestorePermissionError) => {
      // Set error in state to trigger a re-render.
      setError(error);
    };

    // The typed emitter will enforce that the callback for 'permission-error'
    // matches the expected payload type (FirestorePermissionError).
    errorEmitter.on('permission-error', handleError);

    // Unsubscribe on unmount to prevent memory leaks.
    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  useEffect(() => {
    if (!error) return;
    console.warn('[FirebaseErrorListener] Permission issue:', error.debugMessage || error.message);
  }, [error]);

  if (error) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-[70] mx-auto max-w-xl rounded-2xl border border-amber-200 bg-white p-4 text-slate-950 shadow-2xl shadow-slate-900/20 sm:left-auto sm:right-6 sm:mx-0">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-slate-950">Accès non autorisé</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">{error.message}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-950"
            onClick={() => setError(null)}
            aria-label="Fermer l'alerte"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // This component renders nothing.
  return null;
}
