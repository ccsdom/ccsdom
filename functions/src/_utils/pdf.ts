/* ==========================================================================
 * _utils/pdf.ts — extraction texte PDF
 * ========================================================================== */

import * as logger from "firebase-functions/logger";
import * as pdfParser from "pdf-parse";

export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  try {
    const data = await (pdfParser as any)(buffer);
    if (!data || typeof data !== "object" || !("text" in data)) return "";
    return (data.text || "").toString();
  } catch (e: any) {
    logger.warn("pdf-parse erreur (PDF scanné/corrompu?) :", e?.message || e);
    return "";
  }
}