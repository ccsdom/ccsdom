import { z } from "zod";
import { ai } from "../config";
import { logger } from "genkit/logging";

export const IdentityDocAnalysisOutputSchema = z.object({
  docType: z.enum(["kbis", "identityCard", "proofOfAddress", "contract", "attestation", "other"]),
  isValid: z.boolean().describe("Indique si le document semble authentique, lisible et valide."),
  confidence: z.number().min(0).max(1).describe("Score de confiance entre 0 et 1."),
  reason: z.string().optional().describe("Explication en cas de document invalide ou douteux."),
  summary: z.string().optional().describe("Resume court et exploitable du controle effectue."),
  detectedDocumentType: z.string().optional().describe("Type de document detecte si different du type attendu."),
  warnings: z.array(z.string()).optional().describe("Points de vigilance detectes par l'IA."),
  extractedData: z.object({
    siren: z.string().optional().describe("Pour KBIS : numéro SIREN à 9 chiffres."),
    companyName: z.string().optional().describe("Pour KBIS : dénomination sociale."),
    siret: z.string().optional().describe("Pour KBIS : numero SIRET si present."),
    legalStatus: z.string().optional().describe("Pour KBIS : forme juridique detectee."),
    representativeName: z.string().optional().describe("Nom du representant legal si present."),
    address: z.string().optional().describe("Adresse extraite du document."),
    fullName: z.string().optional().describe("Pour Identité : Nom et Prénom."),
    expiryDate: z.string().optional().describe("Pour Identité : Date de fin de validité."),
    issueDate: z.string().optional().describe("Pour Justificatif : Date d'émission."),
  }).optional(),
});

export const analyzeIdentityDocFlow = ai.defineFlow(
  {
    name: "analyzeIdentityDocFlow",
    inputSchema: z.object({
      docType: z.string(),
      fileBase64: z.string(),
      contentType: z.string(),
    }),
    outputSchema: IdentityDocAnalysisOutputSchema,
  },
  async ({ docType, fileBase64, contentType }) => {
    logger.info(`Démarrage de l'analyse IA pour le document de type: ${docType}`);

    const promptText = `
      Tu es un expert en conformité KYC (Know Your Customer) pour CCS DOM.
      Analyse ce document de type "${docType}" (Image ou PDF) et extrais les informations demandées.

      CONSIGNES SPÉCIFIQUES POUR "${docType}":
      ${docType === 'kbis' ? `
      - Vérifie le numéro SIREN (9 chiffres).
      - Extrais le nom de la société.
      - Vérifie l'adresse du siège social.` : ''}
      ${docType === 'identityCard' ? `
      - Vérifie le nom complet.
      - Vérifie la date d'expiration. Le document ne doit pas être expiré.
      - Vérifie si c'est bien une carte d'identité ou un passeport.` : ''}
      ${docType === 'proofOfAddress' ? `
      - Vérifie la date d'émission (idéalement < 3 mois).
      - Extrais l'adresse complète.` : ''}

      RÈGLES GÉNÉRALES :
      - Si le document est illisible, flou ou ne correspond pas au type "${docType}", mets isValid = false et explique pourquoi dans "reason".
      - Donne un score de confiance (confidence).
      - Ajoute un resume court dans "summary".
      - Liste les points a verifier dans "warnings" si un controle humain est necessaire.
      - Réponds uniquement en Français.
    `;

    const { output } = await ai.generate({
      prompt: [
        { text: promptText },
        { media: { url: `data:${contentType};base64,${fileBase64}`, contentType } },
      ],
      output: { schema: IdentityDocAnalysisOutputSchema },
    });

    if (!output) {
      throw new Error("L'IA n'a pas pu analyser le document.");
    }

    return output;
  }
);
