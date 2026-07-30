'use client';
import { getAuth, type User } from 'firebase/auth';

type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

interface FirebaseAuthToken {
  name: string | null;
  email: string | null;
  email_verified: boolean;
  phone_number: string | null;
  sub: string;
  firebase: {
    identities: Record<string, string[]>;
    sign_in_provider: string;
    tenant: string | null;
  };
}

interface FirebaseAuthObject {
  uid: string;
  token: FirebaseAuthToken;
}

interface SecurityRuleRequest {
  auth: FirebaseAuthObject | null;
  method: string;
  path: string;
  resource?: {
    data: any;
  };
}

/**
 * Builds a security-rule-compliant auth object from the Firebase User.
 * @param currentUser The currently authenticated Firebase user.
 * @returns An object that mirrors request.auth in security rules, or null.
 */
function buildAuthObject(currentUser: User | null): FirebaseAuthObject | null {
  if (!currentUser) {
    return null;
  }

  const token: FirebaseAuthToken = {
    name: currentUser.displayName,
    email: currentUser.email,
    email_verified: currentUser.emailVerified,
    phone_number: currentUser.phoneNumber,
    sub: currentUser.uid,
    firebase: {
      identities: currentUser.providerData.reduce((acc, p) => {
        if (p.providerId) {
          acc[p.providerId] = [p.uid];
        }
        return acc;
      }, {} as Record<string, string[]>),
      sign_in_provider: currentUser.providerData[0]?.providerId || 'custom',
      tenant: currentUser.tenantId,
    },
  };

  return {
    uid: currentUser.uid,
    token: token,
  };
}

/**
 * Builds the complete, simulated request object for the error message.
 * It safely tries to get the current authenticated user.
 * @param context The context of the failed Firestore operation.
 * @returns A structured request object.
 */
function buildRequestObject(context: SecurityRuleContext): SecurityRuleRequest {
  let authObject: FirebaseAuthObject | null = null;
  try {
    // Safely attempt to get the current user.
    const firebaseAuth = getAuth();
    const currentUser = firebaseAuth.currentUser;
    if (currentUser) {
      authObject = buildAuthObject(currentUser);
    }
  } catch {
    // This will catch errors if the Firebase app is not yet initialized.
    // In this case, we'll proceed without auth information.
  }

  return {
    auth: authObject,
    method: context.operation,
    path: `/databases/(default)/documents/${context.path}`,
    resource: context.requestResourceData ? { data: context.requestResourceData } : undefined,
  };
}

/**
 * Builds the final, formatted error message for the LLM.
 * @param requestObject The simulated request object.
 * @returns A string containing the error message and the JSON payload.
 */
function buildErrorMessage(requestObject: SecurityRuleRequest): string {
  return `Missing or insufficient permissions: The following request was denied by Firestore Security Rules:
${JSON.stringify(requestObject, null, 2)}`;
}

export function getFriendlyFirebaseErrorMessage(error: unknown): string {
  const code = typeof error === 'object' && error && 'code' in error ? String((error as any).code) : '';
  const name = typeof error === 'object' && error && 'name' in error ? String((error as any).name) : '';
  const message =
    typeof error === 'object' && error && 'message' in error ? String((error as any).message) : '';

  if (
    error instanceof FirestorePermissionError ||
    code === 'permission-denied' ||
    code === 'functions/permission-denied' ||
    message.includes('Missing or insufficient permissions')
  ) {
    return "Vous n'avez pas accès à cette information avec ce compte. Vérifiez votre rôle ou contactez le super administrateur si l'accès devrait être autorisé.";
  }

  if (code === 'not-found' || code === 'functions/not-found') {
    return "L'élément demandé est introuvable ou n'est plus disponible.";
  }

  if (code === 'unavailable' || code === 'deadline-exceeded' || code === 'functions/unavailable') {
    return "Le service est momentanément indisponible. Réessayez dans quelques instants.";
  }

  if (code === 'unauthenticated' || code === 'auth/user-token-expired') {
    return "Votre session a expiré. Reconnectez-vous pour continuer.";
  }

  if (name === 'FirebaseError' && message) {
    return "Une opération Firebase n'a pas abouti. Réessayez, puis signalez le problème si cela persiste.";
  }

  return "Une erreur inattendue est survenue. Réessayez, puis signalez le problème si cela persiste.";
}

/**
 * A custom error class designed to be consumed by an LLM for debugging.
 * It structures the error information to mimic the request object
 * available in Firestore Security Rules.
 */
export class FirestorePermissionError extends Error {
  public readonly request: SecurityRuleRequest;
  public readonly debugMessage: string;

  constructor(context: SecurityRuleContext) {
    const requestObject = buildRequestObject(context);
    const debugMessage = buildErrorMessage(requestObject);
    super(getFriendlyFirebaseErrorMessage({ message: debugMessage }));
    this.name = 'FirebaseError';
    this.request = requestObject;
    this.debugMessage = debugMessage;
  }
}
