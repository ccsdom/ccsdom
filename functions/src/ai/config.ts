import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";

function normalizeSecretEnv(name: string) {
  const rawValue = process.env[name];
  if (!rawValue) return;

  const trimmedValue = rawValue.trim();
  if (!trimmedValue.includes("\n") && !trimmedValue.includes(`${name}=`)) {
    process.env[name] = trimmedValue;
    return;
  }

  const lines = trimmedValue.split(/\r?\n/);
  const matchingLine = [...lines].reverse().find((line) => line.trim().startsWith(`${name}=`));
  const extractedValue = matchingLine?.slice(name.length + 1).trim();

  if (extractedValue) {
    process.env[name] = extractedValue.replace(/^['"]|['"]$/g, "");
  }
}

normalizeSecretEnv("GEMINI_API_KEY");
normalizeSecretEnv("GOOGLE_API_KEY");
normalizeSecretEnv("GENAI_MODEL_NAME");

function resolveGeminiModelName() {
  const configuredModel = process.env.GENAI_MODEL_NAME?.trim();
  if (configuredModel && configuredModel !== "gemini-1.5-flash") {
    return configuredModel;
  }

  return "gemini-2.5-flash";
}

export const ai = genkit({
  plugins: [googleAI()],
  model: googleAI.model(resolveGeminiModelName()),
});
