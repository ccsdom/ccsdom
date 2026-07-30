'use client';
    
import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  SetOptions,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

function emitPermissionError(error: any, path: string, operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write', requestResourceData?: any) {
  if (error?.code !== 'permission-denied') {
    console.warn(`[non-blocking-updates] ${operation} failed for ${path}:`, error);
    return;
  }

  errorEmitter.emit(
    'permission-error',
    new FirestorePermissionError({
      path,
      operation,
      requestResourceData,
    })
  );
}

/**
 * Initiates a setDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function setDocumentNonBlocking(docRef: DocumentReference, data: any, options: SetOptions) {
  setDoc(docRef, data, options).catch(error => {
    emitPermissionError(error, docRef.path, 'write', data);
  })
  // Execution continues immediately
}


/**
 * Initiates an addDoc operation for a collection reference.
 * Does NOT await the write operation internally.
 * Returns the Promise for the new doc ref, but typically not awaited by caller.
 */
export function addDocumentNonBlocking(colRef: CollectionReference, data: any) {
  const promise = addDoc(colRef, data)
    .catch(error => {
      emitPermissionError(error, colRef.path, 'create', data);
    });
  return promise;
}


/**
 * Initiates an updateDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function updateDocumentNonBlocking(docRef: DocumentReference, data: any) {
  updateDoc(docRef, data)
    .catch(error => {
      emitPermissionError(error, docRef.path, 'update', data);
    });
}


/**
 * Initiates a deleteDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function deleteDocumentNonBlocking(docRef: DocumentReference) {
  deleteDoc(docRef)
    .catch(error => {
      emitPermissionError(error, docRef.path, 'delete');
    });
}
