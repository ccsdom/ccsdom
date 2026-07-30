// src/lib/email.ts
// ✅ Compatible avec l’extension "Trigger Email from Firestore"
// Collection: "mails", Champs: { to, templateId, data, createdAt }

'use client';

import { addDoc, collection, serverTimestamp, Firestore } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

// --------- Routing emails admin selon l’agence ----------
export type AddressKey = 'paris' | 'orly';

export function getAdminEmail(addressKey: AddressKey): string {
  if (addressKey === 'orly') return 'contact.ccs94@gmail.com';
  if (addressKey === 'paris') return 'contact.ccs75@gmail.com';
  return 'contact@ccsdom.fr'; // défaut
}

// --------- Helper générique pour pousser un email ----------
export async function queueMail(
  templateId: string,            // ex: "newSignupClient" | "newSignupAdmin"
  to: string,                    // destinataire
  data: Record<string, any> = {} // variables du template
) {
  const { firestore } = initializeFirebase();
  return await addDoc(collection(firestore, 'mails'), {
    to,
    templateId,
    data,
    createdAt: serverTimestamp(),
  });
}

/* ---------------------------------------------------------
   ✅ Templates prêts à l’emploi
   - Appel depuis ContractStep juste après la création des jobs PDF
   --------------------------------------------------------- */

type SignupData = {
  addressKey: AddressKey;
  companyName: string;
  legalStatus?: string;
  contactName?: string;
  contactEmail: string;
  contactPhone?: string;
  planName?: string;
  planPrice?: string;
  requestUid: string;
  status?: string;          // ex: SIGNUP_REQUEST_STATUS.PENDING_VALIDATION
  createdAt: string;        // ex: "10/11/2025 17:05"
  year?: number;            // ex: 2025
  adminConsoleUrl?: string; // lien back-office
  docsRequiredCompleted?: boolean;
  docs?: {
    identityCard?: { status: string; path?: string };
    proofOfAddress?: { status: string; path?: string };
    kbis?: { status: string; path?: string };
  };
  clientIp?: string;
  userAgent?: string;
};

// Email au CLIENT (template "newSignupClient")
export async function sendNewSignupClientEmail(payload: SignupData) {
  const { contactEmail } = payload;
  if (!contactEmail) return;
  await queueMail('newSignupClient', contactEmail, {
    ...payload,
    year: payload.year ?? new Date().getFullYear(),
  });
}

// Email à l’ADMIN (template "newSignupAdmin")
export async function sendNewSignupAdminEmail(payload: SignupData) {
  const adminTo = getAdminEmail(payload.addressKey);
  await queueMail('newSignupAdmin', adminTo, {
    ...payload,
    year: payload.year ?? new Date().getFullYear(),
  });
}

/* ---------------------------------------------------------
   🔁 Compatibilité avec tes anciennes fonctions (optionnel)
   --------------------------------------------------------- */

// Ancien: file d’attente arbitraire "mail_queue" (conservé si utilisé ailleurs)
export async function queueMailForSending(
  db: Firestore,
  { clientName, clientEmail, mailSender, mailSummary }: {
    clientName: string; clientEmail: string; mailSender: string; mailSummary: string;
  }
) {
  if (!clientEmail) {
    console.error(`Client ${clientName} has no email address. Skipping.`);
    return;
  }
  await addDoc(collection(db, 'mail_queue'), {
    to: clientEmail,
    message: {
      subject: 'Vous avez reçu un nouveau courrier',
      html: `
        <h1>Nouveau courrier pour ${clientName}</h1>
        <p>Bonjour,</p>
        <p>Un nouveau courrier a été scanné et ajouté à votre espace client.</p>
        <ul>
          <li><strong>Expéditeur :</strong> ${mailSender}</li>
          <li><strong>Résumé :</strong> ${mailSummary}</li>
        </ul>
        <p>Connectez-vous à votre <a href="https://ccsdom.fr/dashboard/mail">tableau de bord</a>.</p>
        <br/>
        <p>L'équipe CCS DOM</p>
      `,
    },
    createdAt: new Date(),
  });
}

// Ancien: envoi de bienvenue (collection "mail" → non utilisée par l’extension)
export async function sendWelcomeEmail(
  db: Firestore,
  { clientName, clientEmail }: { clientName: string; clientEmail: string; }
) {
  if (!clientEmail) {
    console.error(`Client ${clientName} has no email. Skipping welcome email.`);
    return;
  }
  await addDoc(collection(db, 'mail'), {
    to: clientEmail,
    message: {
      subject: 'Bienvenue chez CCS DOM ! Votre compte est créé.',
      html: `
        <h1>Bienvenue, ${clientName} !</h1>
        <p>Votre compte a été créé avec succès. Votre dossier est en cours de validation.</p>
        <a href="https://ccsdom.fr/login"
           style="display:inline-block;padding:12px 24px;font-size:16px;color:#fff;background:#2563eb;text-decoration:none;border-radius:6px;margin-top:20px;">
           Accéder à mon espace client
        </a>
        <br/><br/>
        <p>Merci de votre confiance.</p>
        <p>L'équipe CCS DOM</p>
      `,
    },
  });
}
