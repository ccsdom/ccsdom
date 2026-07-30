'use client';

import { useEffect, useState } from 'react';
import {
  DocumentReference,
  onSnapshot,
  DocumentData,
  FirestoreError,
  DocumentSnapshot,
} from 'firebase/firestore';

import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export type WithId<T> = T & { id: string };

export interface UseDocResult<T> {
  data: WithId<T> | null;
  isLoading: boolean;
  error: FirestoreError | Error | null;
}

/**
 * Subscribe à un document Firestore (temps réel).
 * IMPORTANT: docRef doit être memoized (useMemo / useMemoFirebase)
 */
export function useDoc<T = any>(
  docRef: DocumentReference<T> | null | undefined,
): UseDocResult<T> {
  const [data, setData] = useState<WithId<T> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    let alive = true;

    if (!docRef) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      docRef as any,
      (snapshot: DocumentSnapshot<DocumentData>) => {
        if (!alive) return;

        if (snapshot.exists()) {
          setData({ ...(snapshot.data() as T), id: snapshot.id });
        } else {
          setData(null);
        }

        setError(null);
        setIsLoading(false);
      },
      (err: FirestoreError) => {
        if (!alive) return;

        setData(null);
        setIsLoading(false);

        if (err?.code === 'permission-denied') {
          const contextualError = new FirestorePermissionError({
            operation: 'get',
            path: docRef.path,
          });

          setError(contextualError);
          errorEmitter.emit('permission-error', contextualError);
          return;
        }

        setError(err);
      }
    );

    return () => {
      alive = false;
      unsubscribe();
    };
  }, [docRef]);

  return { data, isLoading, error };
}
