/* ==========================================================================
 * _utils/text.ts — helpers texte (sans dépendances Firebase)
 * ========================================================================== */

export function resolveProjectId(): string {
    if (process.env.GOOGLE_CLOUD_PROJECT) return process.env.GOOGLE_CLOUD_PROJECT;
    if (process.env.GCLOUD_PROJECT) return process.env.GCLOUD_PROJECT;
    try {
      const cfg = process.env.FIREBASE_CONFIG ? JSON.parse(process.env.FIREBASE_CONFIG) : null;
      if (cfg?.projectId) return String(cfg.projectId);
    } catch {}
    return "bizhome-hub";
  }
  
  export function extractFirstJsonObject(s: string): string | null {
    let t = (s || "").trim();
  
    // strip ```json ... ```
    if (t.startsWith("```")) {
      t = t.replace(/^```[a-zA-Z0-9_-]*\n?/, "").replace(/```$/, "").trim();
    }
  
    const start = t.indexOf("{");
    if (start === -1) return null;
  
    let depth = 0;
    let inString = false;
    let esc = false;
  
    for (let i = start; i < t.length; i++) {
      const ch = t[i];
  
      if (inString) {
        if (esc) esc = false;
        else if (ch === "\\") esc = true;
        else if (ch === '"') inString = false;
        continue;
      }
  
      if (ch === '"') inString = true;
      else if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) return t.slice(start, i + 1);
      }
    }
  
    return null;
  }
  
  export function normalizeEmailLower(email?: string): string {
    return (email || "").trim().toLowerCase();
  }
  
  export function normalizeSiret(s?: string): string {
    return (s || "").replace(/\D/g, "").trim();
  }
  
  export function isValidEmail(email?: string): boolean {
    const t = normalizeEmailLower(email);
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
  }