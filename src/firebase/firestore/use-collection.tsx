'use client';

import { useEffect, useState } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  CollectionReference,
} from 'firebase/firestore';

import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export type WithId<T> = T & { id: string };

export interface UseCollectionResult<T> {
  data: WithId<T>[] | null;
  isLoading: boolean;
  error: FirestoreError | Error | null;
}

// Interne Firestore (best-effort) — on l’utilise uniquement si dispo
type InternalQuery = Query<DocumentData> & {
  _query?: {
    path?: {
      canonicalString?: () => string;
      toString?: () => string;
    };
  };
};

function getTargetPath(target: Query<DocumentData> | CollectionReference<DocumentData>): string {
  const anyTarget = target as any;
  if (typeof anyTarget?.path === 'string') return anyTarget.path;

  const iq = target as InternalQuery;
  const canonical = iq?._query?.path?.canonicalString?.();
  if (canonical) return canonical;

  const toStr = iq?._query?.path?.toString?.();
  if (toStr) return toStr;

  return 'unknown';
}

/**
 * Subscribe Firestore query/collection en temps réel.
 * IMPORTANT: le target DOIT être memoized (useMemoFirebase / useMemo),
 * sinon resubscribe en boucle.
 */
export function useCollection<T = any>(
  target: Query<T> | CollectionReference<T> | null | undefined,
): UseCollectionResult<T> {
  const [data, setData] = useState<WithId<T>[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    let alive = true;

    // ✅ reset propre si target null (ex: logout)
    if (!target) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      target as any,
      (snapshot: QuerySnapshot<DocumentData>) => {
        if (!alive) return;

        const results: WithId<T>[] = snapshot.docs.map((d) => ({
          ...(d.data() as T),
          id: d.id,
        }));

        setData(results);
        setError(null);
        setIsLoading(false);
      },
      (err: FirestoreError) => {
        if (!alive) return;

        setIsLoading(false);

        // ✅ Permission denied -> contextual error + emit
        if (err?.code === 'permission-denied') {
          const path = getTargetPath(target as any);
          const contextualError = new FirestorePermissionError({
            operation: 'list',
            path,
          });

          setError(contextualError);
          setData(null);

          errorEmitter.emit('permission-error', contextualError);
          return;
        }

        // ✅ Autres erreurs -> remonter brut (debug)
        setError(err);
        setData(null);
      }
    );

    return () => {
      alive = false;
      unsubscribe();
    };
  }, [target]);

  return { data, isLoading, error };
}
