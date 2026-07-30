// functions/src/_config/secrets.ts
import { defineSecret } from "firebase-functions/params";

/**
 * Secrets Firebase Functions v2 (params)
 * - Ne jamais les importer depuis index.ts
 * - Toujours importer depuis ce module
 */
export const GENAI_MODEL_NAME = defineSecret("GENAI_MODEL_NAME");
export const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");
export const DOCAI_PROCESSOR_NAME = defineSecret("DOCAI_PROCESSOR_NAME");
export const STRIPE_WEBHOOK_SECRET = defineSecret("STRIPE_WEBHOOK_SECRET");
