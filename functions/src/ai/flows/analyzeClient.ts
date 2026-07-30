import { z } from "zod";
import { ai } from "../config";

export const ClientAnalysisOutputSchema = z.object({
  summary: z.string().describe("Bref résumé de la situation du client."),
  statusInsight: z.string().describe("Analyse du statut actuel (Actif, En attente, etc.)."),
  warnings: z.array(z.string()).describe("Liste des points d'attention ou anomalies détectées."),
  recommendations: z.array(z.string()).describe("Actions suggérées pour le gestionnaire."),
  riskLevel: z.enum(["low", "medium", "high"]).describe("Niveau de risque estimé du dossier."),
});

export const analyzeClientFlow = ai.defineFlow(
  {
    name: "analyzeClientFlow",
    inputSchema: z.any(), // On accepte l'objet Client brut
    outputSchema: ClientAnalysisOutputSchema,
  },
  async (client) => {
    const prompt = `
      Tu es un expert en gestion de domiciliation commerciale pour l'entreprise CCS DOM.
      Analyse les données suivantes pour le client : ${client.companyName || client.name}.

      Données Client :
      ${JSON.stringify(client, null, 2)}

      Ta mission :
      1. Résumer la situation actuelle du client.
      2. Identifier s'il manque des informations critiques (Email, Téléphone, SIRET).
      3. Analyser la cohérence entre le statut ("${client.status}") et les données présentes.
      4. Détecter si le client est rattaché à une adresse valide (Paris 12e ou Orly).
      5. Suggérer des actions concrètes pour le gestionnaire.

      Réponds en français, avec un ton professionnel et constructif.
    `;

    const { output } = await ai.generate({
      prompt,
      output: { schema: ClientAnalysisOutputSchema },
    });

    if (!output) {
      throw new Error("L'IA n'a pas pu générer d'analyse.");
    }

    return output;
  }
);
