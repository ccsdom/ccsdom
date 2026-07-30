import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { SIGNUP_REQUEST_STATUS } from "../../_config/signup-constants";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage();
const bucket = storage.bucket("bizhome-hub.firebasestorage.app");

/**
 * Gets a secure HTTPS download URL for a file in Storage.
 * Tries to get a signed URL, falls back to the persistent download token in metadata if signing fails.
 */
async function getSecureDownloadUrl(filePath: string): Promise<string> {
    const file = bucket.file(filePath);
    try {
        // Attempt to get a signed URL (expires in 24 hours)
        const [url] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 24 * 60 * 60 * 1000,
        });
        return url;
    } catch (err) {
        logger.warn(`[getSecureDownloadUrl] Failed to sign URL for ${filePath}, falling back to metadata token:`, err);
        
        // Fallback: Use the permanent download token from metadata
        const [metadata] = await file.getMetadata();
        const token = metadata.metadata?.firebaseStorageDownloadTokens;
        
        if (token) {
            const encodedPath = encodeURIComponent(filePath);
            return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${token}`;
        }
        
        return `gs://${bucket.name}/${filePath}`;
    }
}

/**
 * Trigger pour l'envoi de la facture par email.
 */
export const onInvoiceReadyForEmail = onDocumentUpdated({ region: "europe-west9", document: "invoices/{invoiceId}" }, async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();

    if (!after) return;

    const prevStatus = before?.pdf?.status;
    const currStatus = after?.pdf?.status;
    const pdfUrl =
      after?.pdf?.outputUrl ||
      after?.pdf?.fileUrl ||
      after?.pdf?.url ||
      after?.fileUrl;
    const clientEmail = after?.clientEmail || after?.snapshot?.client?.email;

    logger.info("onInvoiceReadyForEmail Triggered", {
      invoiceId: event.params.invoiceId,
      prevStatus,
      currStatus,
      pdfUrl,
      clientEmail,
      emailSent: after.emailSent
    });

    // On déclenche si le status passe à 'complete' et qu'on a une URL
    if (currStatus === "complete" && prevStatus !== "complete" && pdfUrl && clientEmail) {
        
        // Anti-doublon interne au document
        if (after.emailSent) {
            logger.debug(`[onInvoiceReadyForEmail] Email déjà envoyé pour la facture ${event.params.invoiceId}`);
            return;
        }

        let finalPdfUrl = pdfUrl;
        if (!pdfUrl.startsWith("http")) {
            try {
                finalPdfUrl = await getSecureDownloadUrl(pdfUrl);
                logger.info(`[onInvoiceReadyForEmail] Invoice PDF resolved to: ${finalPdfUrl}`);
            } catch (err) {
                logger.error(`[onInvoiceReadyForEmail] Erreur signature URL pour ${pdfUrl}:`, err);
            }
        }

        const mailDoc = {
            to: clientEmail,
            message: {
                subject: `Votre facture CCS DOM (${after.invoiceNumber})`,
                html: `
                    <p>Bonjour,</p>
                    <p>Merci pour votre confiance. Vous trouverez ci-joint votre facture <strong>${after.invoiceNumber}</strong> concernant votre inscription chez CCS DOM.</p>
                    <p>Vous pouvez également la retrouver à tout moment dans votre espace client.</p>
                    <p>L'équipe CCS DOM</p>
                `,
                attachments: [
                    {
                        filename: `facture-${after.invoiceNumber}.pdf`,
                        path: finalPdfUrl
                    }
                ]
            },
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            metadata: {
                invoiceId: event.params.invoiceId,
                type: "invoice"
            }
        };

        try {
            await db.collection("mails").add(mailDoc);
            await event.data?.after.ref.update({ emailSent: true });
            logger.info(`[onInvoiceReadyForEmail] Mail de facture créé pour ${clientEmail} (Invoice: ${after.invoiceNumber})`);
        } catch (err) {
            logger.error(`[onInvoiceReadyForEmail] Erreur création mail pour ${event.params.invoiceId}:`, err);
        }
    }
});

/**
 * Trigger pour l'envoi du pack de bienvenue (Contrat + Attestation).
 */
export const onDocsReadyForEmail = onDocumentUpdated({ region: "europe-west9", document: "client_requests/{uid}" }, async (event) => {
    const after = event.data?.after.data();
    if (!after) return;

    logger.debug("[onDocsReadyForEmail] Raw data:", JSON.stringify(after));

    const contract = after.pdfPublish?.contract;
    const attestation = after.pdfPublish?.attestation;
    const clientEmail = after.clientEmail || after.email;
    const isApproved = after.status === SIGNUP_REQUEST_STATUS.APPROVED;
    const isProvisioned = after.accessProvisioned === true;
    const suppressDocumentReadyEmail = after.suppressDocumentReadyEmail === true;

    logger.info("onDocsReadyForEmail Triggered", {
      requestId: event.params.uid,
      contractStatus: contract?.status,
      attestationStatus: attestation?.status,
      clientEmail,
      welcomeEmailSent: after.welcomeEmailSent,
      status: after.status,
      accessProvisioned: after.accessProvisioned,
      suppressDocumentReadyEmail
    });

    if (suppressDocumentReadyEmail) {
        logger.info(`[onDocsReadyForEmail] Email documents supprime pour ${event.params.uid}`);
        return;
    }

    // Conditions : Les deux documents doivent être 'complete'
    const bothReady = contract?.status === "complete" && 
                      attestation?.status === "complete" &&
                      contract?.outputUrl && 
                      attestation?.outputUrl;

    if (!bothReady || !clientEmail) {
        return;
    }

    if (!isApproved || !isProvisioned) {
        logger.info(`[onDocsReadyForEmail] Waiting for approval/provisioning for ${event.params.uid}`, {
            status: after.status,
            accessProvisioned: after.accessProvisioned,
        });
        return;
    }

    // Anti-doublon
    if (after.welcomeEmailSent) {
        return;
    }

        let contractUrl = contract.outputUrl;
        let attestationUrl = attestation.outputUrl;

        try {
            if (contractUrl && !contractUrl.startsWith("http")) {
                contractUrl = await getSecureDownloadUrl(contractUrl);
            }
            if (attestationUrl && !attestationUrl.startsWith("http")) {
                attestationUrl = await getSecureDownloadUrl(attestationUrl);
            }
        } catch (err) {
            logger.error("[onDocsReadyForEmail] Erreur signature URLs:", err);
        }

        const mailDoc = {
            to: clientEmail,
            message: {
                subject: "Bienvenue chez CCS DOM - Vos documents contractuels",
                html: `
                    <p>Bonjour ${after.firstName || ""},</p>
                    <p>Nous avons le plaisir de vous confirmer la validation de votre dossier de domiciliation.</p>
                    <p>Veuillez trouver ci-joint votre <strong>contrat signé</strong> ainsi que votre <strong>attestation de domiciliation</strong>.</p>
                    <p>Ces documents sont également disponibles dans votre espace personnel.</p>
                    <p>Bienvenue parmi nous !</p>
                    <p>L'équipe CCS DOM</p>
                `,
                attachments: [
                    {
                        filename: "Contrat_Domiciliation.pdf",
                        path: contractUrl
                    },
                    {
                        filename: "Attestation_Domiciliation.pdf",
                        path: attestationUrl
                    }
                ]
            },
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            metadata: {
                uid: event.params.uid,
                type: "welcome_pack"
            }
        };

        try {
            await db.collection("mails").add(mailDoc);
            await event.data?.after.ref.update({ welcomeEmailSent: true });
            logger.info(`[onDocsReadyForEmail] Mail de bienvenue créé pour ${clientEmail}`);
        } catch (err) {
            logger.error(`[onDocsReadyForEmail] Erreur création mail de bienvenue pour ${event.params.uid}:`, err);
        }
});
