import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { z } from "zod";

import { GEMINI_API_KEY, GENAI_MODEL_NAME } from "./_config/secrets";
import { ai } from "./ai/config";

const ChatbotMessageSchema = z.object({
  role: z.enum(["user", "model"]).optional(),
  parts: z
    .array(
      z.object({
        text: z.string().max(1200).optional(),
      })
    )
    .optional(),
});

const AskChatbotInputSchema = z.object({
  message: z.string().trim().min(2).max(700),
  history: z.array(ChatbotMessageSchema).max(8).optional(),
});

function sanitizeHistory(history: z.infer<typeof ChatbotMessageSchema>[]) {
  return history
    .map((message) => {
      const text = message.parts?.map((part) => part.text || "").join("\n").trim();
      if (!text) return null;
      return `${message.role === "model" ? "Assistant" : "Utilisateur"}: ${text.slice(0, 700)}`;
    })
    .filter(Boolean)
    .join("\n");
}

function fallbackReply(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("tarif") || normalized.includes("prix") || normalized.includes("offre")) {
    return [
      "Nos offres s'adaptent au niveau de service souhaite.",
      "- Classic : retrait sur place, sans scan ni notification.",
      "- Starter : scan du courrier et notification email simple.",
      "- Business : scan, notification et reexpedition mensuelle.",
      "- Premium : resume IA, alerte prioritaire et reexpedition hebdomadaire.",
      "Prochaine etape : consultez les tarifs ou lancez l'inscription pour choisir l'offre adaptee.",
    ].join("\n");
  }

  if (normalized.includes("adresse") || normalized.includes("centre") || normalized.includes("orly") || normalized.includes("paris")) {
    return [
      "CCS DOM propose actuellement deux centres actifs.",
      "- Orly Ville.",
      "- Paris 12e.",
      "Le reseau est evolutif : chaque nouveau centre ouvert apparaitra automatiquement dans le parcours d'inscription.",
    ].join("\n");
  }

  if (normalized.includes("courrier") || normalized.includes("scan") || normalized.includes("ia")) {
    return [
      "La gestion du courrier depend de l'offre choisie.",
      "- Scan et archivage numerique selon le forfait.",
      "- Notification email a partir de Starter.",
      "- Resume IA et alerte prioritaire avec Premium.",
      "Prochaine etape : choisissez l'offre qui correspond a votre rythme de courrier.",
    ].join("\n");
  }

  return [
    "Je peux vous aider a avancer sur CCS DOM.",
    "- Domiciliation d'entreprise.",
    "- Choix du centre et de l'offre.",
    "- Gestion digitale du courrier.",
    "- Creation ou transfert de societe.",
    "Prochaine etape : cliquez sur Domicilier mon entreprise ou contactez l'equipe CCS DOM.",
  ].join("\n");
}

export const askChatbot = onCall(
  {
    region: "europe-west9",
    cors: true,
    secrets: [GEMINI_API_KEY, GENAI_MODEL_NAME],
    maxInstances: 3,
    timeoutSeconds: 45,
  },
  async (request) => {
    const parsed = AskChatbotInputSchema.safeParse(request.data);

    if (!parsed.success) {
      throw new HttpsError("invalid-argument", "Question invalide.");
    }

    const { message, history = [] } = parsed.data;
    const safeHistory = sanitizeHistory(history);

    const prompt = `
Tu es l'assistant public de CCS DOM.

Mission:
- Repondre aux visiteurs du site sur la domiciliation d'entreprise, les centres disponibles, les offres, le courrier, l'inscription, la creation d'entreprise et le transfert de siege.
- Rester concis, rassurant, professionnel et commercial.
- Repondre en francais.

Informations CCS DOM:
- Promesse: domicilier une entreprise dans un centre agree, en ligne et en quelques minutes.
- Centres actuellement disponibles: Orly Ville et Paris 12e.
- Le reseau est evolutif: de nouveaux centres pourront etre ajoutes.
- Offres courrier:
  - Classic: retrait sur place, pas de scan, pas de notification.
  - Starter: scan courrier et notification email simple.
  - Business: scan, notification et reexpedition mensuelle.
  - Premium: scan, notification, resume IA, alerte prioritaire et reexpedition hebdomadaire.
- Services: domiciliation, contrat et attestation, espace client, gestion digitale du courrier, accompagnement creation/transfert.

Regles:
- Ne promets pas un delai legal garanti.
- Ne donne pas de conseil juridique personnalise; invite a contacter l'equipe pour les cas sensibles.
- Si la question sort du perimetre, recentre poliment sur CCS DOM.
- Termine par une action utile quand c'est naturel: consulter les tarifs, choisir un centre, commencer l'inscription ou contacter l'equipe.
- Structure toujours la reponse pour une lecture mobile:
  - 1 phrase d'introduction courte.
  - 2 a 4 puces maximum si la reponse contient plusieurs informations.
  - 1 phrase de prochaine etape si utile.
  - Utilise des retours a la ligne.
  - Pas de gros paragraphe compact.
  - Pas de tableau.
  - Pas de Markdown complexe; seulement des lignes simples et des puces commencant par "- ".

Historique recent:
${safeHistory || "Aucun historique."}

Question visiteur:
${message}
`;

    try {
      const response = await ai.generate({ prompt });
      const reply = response.text?.trim();

      if (!reply) {
        return { reply: fallbackReply(message), fallback: true };
      }

      return { reply: reply.slice(0, 1600), fallback: false };
    } catch (error) {
      logger.error("[askChatbot] AI generation failed", error);
      return { reply: fallbackReply(message), fallback: true };
    }
  }
);
