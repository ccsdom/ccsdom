import { NextResponse } from "next/server";
import { Resend } from "resend";
import * as z from "zod";
import { getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FROM_ADDRESS =
  process.env.CONTACT_FORM_FROM_EMAIL || "CCS DOM <notification@ccsdom.fr>";
const CONTACT_TO = process.env.CONTACT_FORM_TO_EMAIL || "contact@ccsdom.fr";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://ccsdom.fr";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  subject: z.string().trim().min(5).max(160),
  message: z.string().trim().min(10).max(4000),
  company: z.string().optional(),
});

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatMessage(value: string) {
  return escapeHtml(value).replace(/\r?\n/g, "<br />");
}

function formatDate() {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/Paris",
  }).format(new Date());
}

function getAdminDb() {
  if (!getApps().length) {
    initializeApp();
  }

  return getFirestore();
}

async function queueEmail(params: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  metadata: Record<string, unknown>;
}) {
  const db = getAdminDb();

  await db.collection("mails").add({
    to: Array.isArray(params.to) ? params.to : [params.to],
    message: {
      subject: params.subject,
      html: params.html,
      text: params.text,
      ...(params.replyTo ? { replyTo: params.replyTo } : {}),
    },
    createdAt: FieldValue.serverTimestamp(),
    source: "contact_form",
    metadata: params.metadata,
  });
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "La demande est invalide." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Merci de vérifier les informations saisies." },
      { status: 422 }
    );
  }

  const { name, email, phone, subject, message, company } = parsed.data;

  // Honeypot anti-spam: on répond positivement sans envoyer d'e-mail.
  if (company && company.trim().length > 0) {
    return NextResponse.json({ success: true }, { status: 200 });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.error("[send-contact-email] Missing RESEND_API_KEY.");
    return NextResponse.json(
      { error: "Le service d'envoi d'e-mail n'est pas configuré." },
      { status: 503 }
    );
  }

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safePhone = phone ? escapeHtml(phone) : "Non renseigné";
  const safeSubject = escapeHtml(subject);
  const safeMessage = formatMessage(message);
  const submittedAt = formatDate();

  const resend = new Resend(resendApiKey);

  const adminSubject = `Nouveau message de contact : ${subject}`;
  const adminHtml = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
      <h1 style="margin:0 0 16px;font-size:22px">Nouveau message depuis ccsdom.fr</h1>
      <p style="margin:0 0 20px;color:#475569">Demande reçue le ${submittedAt}.</p>
      <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;font-weight:700">Nom</td><td>${safeName}</td></tr>
        <tr><td style="padding:8px 0;font-weight:700">Email</td><td>${safeEmail}</td></tr>
        <tr><td style="padding:8px 0;font-weight:700">Téléphone</td><td>${safePhone}</td></tr>
        <tr><td style="padding:8px 0;font-weight:700">Sujet</td><td>${safeSubject}</td></tr>
      </table>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:22px 0" />
      <h2 style="font-size:16px;margin:0 0 8px">Message</h2>
      <p style="margin:0">${safeMessage}</p>
    </div>
  `;

  const adminText = [
    "Nouveau message depuis ccsdom.fr",
    `Date : ${submittedAt}`,
    `Nom : ${name}`,
    `Email : ${email}`,
    `Téléphone : ${phone || "Non renseigné"}`,
    `Sujet : ${subject}`,
    "",
    message,
  ].join("\n");

  const adminEmailPayload = {
    from: FROM_ADDRESS,
    to: CONTACT_TO,
    reply_to: email,
    subject: adminSubject,
    html: adminHtml,
    text: adminText,
  };

  const { error } = await resend.emails.send(adminEmailPayload);
  if (error) {
    console.error("[send-contact-email] Resend admin email failed:", error);

    try {
      await queueEmail({
        to: CONTACT_TO,
        subject: adminSubject,
        html: adminHtml,
        text: adminText,
        replyTo: email,
        metadata: {
          type: "public_contact_request",
          senderName: name,
          senderEmail: email,
          senderPhone: phone || null,
          delivery: "firestore_fallback",
        },
      });

      await queueEmail({
        to: email,
        subject: "Votre message a bien été reçu - CCS DOM",
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
            <h1 style="margin:0 0 16px;font-size:22px">Message bien reçu</h1>
            <p>Bonjour ${safeName},</p>
            <p>Merci pour votre message. L'équipe CCS DOM revient vers vous dès que possible.</p>
            <p><strong>Sujet :</strong> ${safeSubject}</p>
            <p style="margin-top:24px">
              <a href="${APP_URL}" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700">
                Retourner sur ccsdom.fr
              </a>
            </p>
          </div>
        `,
        text: [
          `Bonjour ${name},`,
          "",
          "Merci pour votre message. L'équipe CCS DOM revient vers vous dès que possible.",
          `Sujet : ${subject}`,
          "",
          APP_URL,
        ].join("\n"),
        metadata: {
          type: "public_contact_confirmation",
          delivery: "firestore_fallback",
        },
      });

      return NextResponse.json({ success: true, queued: true }, { status: 200 });
    } catch (queueError) {
      console.error("[send-contact-email] Firestore email fallback failed:", queueError);
      return NextResponse.json(
        { error: "L'envoi du message a échoué. Merci de réessayer dans quelques instants." },
        { status: 502 }
      );
    }
  }

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: "Votre message a bien été reçu - CCS DOM",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
          <h1 style="margin:0 0 16px;font-size:22px">Message bien reçu</h1>
          <p>Bonjour ${safeName},</p>
          <p>Merci pour votre message. L'équipe CCS DOM revient vers vous dès que possible.</p>
          <p><strong>Sujet :</strong> ${safeSubject}</p>
          <p style="margin-top:24px">
            <a href="${APP_URL}" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700">
              Retourner sur ccsdom.fr
            </a>
          </p>
        </div>
      `,
      text: [
        `Bonjour ${name},`,
        "",
        "Merci pour votre message. L'équipe CCS DOM revient vers vous dès que possible.",
        `Sujet : ${subject}`,
        "",
        APP_URL,
      ].join("\n"),
    });
  } catch (confirmationError) {
    console.warn("[send-contact-email] Confirmation email failed:", confirmationError);
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
