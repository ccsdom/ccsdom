// src/lib/pdf.ts
export function ensurePdfWorker(pdfjs: any) {
  // évite de reconfigurer 50 fois
  if (!pdfjs?.GlobalWorkerOptions) return;

  const current = pdfjs.GlobalWorkerOptions.workerSrc;
  if (typeof current === "string" && current.length > 0) return;

  // ✅ Worker ESM moderne (pdfjs-dist v4+)
  // Next/Webpack sait le bundler si on passe par entry.webpack côté react-pdf.
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
}

export function isPdfUrl(url: string) {
  return (url || "").toLowerCase().includes(".pdf");
}