import { z } from "zod";
import { ai } from "../config";
import * as admin from "firebase-admin";

export const MailAnalysisOutputSchema = z.object({
  sender: z.string().describe("Nom de l'expéditeur détecté sur le courrier."),
  category: z.enum(["Facture", "Social", "Amende", "Contrat", "Publicité", "Banque", "Juridique", "Personnel", "Autre"]).describe("Catégorie du document."),
  urgency: z.enum(["low", "medium", "high"]).describe("Niveau d'urgence estimé."),
  summary: z.string().describe("Résumé d'une phrase du contenu."),
  actionRequired: z.boolean().describe("Indique si une action immédiate du client est nécessaire."),
  extractedData: z.object({
    amountDue: z.number().optional().describe("Montant à payer extrait du document (ex: facture)."),
    dueDate: z.string().optional().describe("Date limite de paiement ou de réponse."),
    invoiceNumber: z.string().optional().describe("Numéro de facture ou référence."),
  }).optional(),
});

export const analyzeMailFlow = ai.defineFlow(
  {
    name: "analyzeMailFlow",
    inputSchema: z.object({
      storagePath: z.string(),
      contentType: z.string(),
    }),
    outputSchema: MailAnalysisOutputSchema,
  },
  async ({ storagePath, contentType }) => {
    // 1. Récupération du fichier depuis Firebase Storage
    const bucket = admin.storage().bucket();
    const [fileBuffer] = await bucket.file(storagePath).download();

    // 2. Préparation du prompt multimodal
    const promptText = `
      Tu es un assistant administratif expert pour CCS DOM, un centre de domiciliation commerciale.
      Analyse ce courrier scanné et extrais les informations clés de manière TRÈS PRÉCISE.

      CONSIGNES :
      1. IDENTITÉ : Identifie l'expéditeur (ex: "Orange", "URSSAF", "Trésor Public", etc.).
      2. CATÉGORIE : Choisis la plus proche (Facture, Amende, Social, Juridique...).
      3. URGENCE : 
         - "high" pour : Amendes, Mises en demeure, Factures impayées, Courriers du Tribunal.
         - "medium" pour : Factures classiques, Relances sociales.
         - "low" pour : Publicités, Informations générales.
      4. EXTRACTION FINANCIÈRE : Si c'est une facture ou une amende, extrais ABSOLUMENT le montant TTC et la date limite.
      5. RÉSUMÉ : Une seule phrase claire et professionnelle (ex: "Facture Internet Orange du mois d'Avril").

      Réponds uniquement avec le format structuré JSON demandé.
    `;

    // 3. Appel à Gemini 1.5 Flash
    const { output } = await ai.generate({
      prompt: [
        { text: promptText },
        { media: { url: `data:${contentType};base64,${fileBuffer.toString("base64")}`, contentType } },
      ],
      output: { schema: MailAnalysisOutputSchema },
    });

    if (!output) {
      throw new Error("L'IA n'a pas pu analyser le courrier.");
    }

    return output;
  }
);
