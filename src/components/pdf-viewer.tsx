"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ExternalLink, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export type PdfViewerKind = "pdf" | "img" | "other";

export type PdfViewerProps = {
  url: string | null | undefined;
  kind?: PdfViewerKind; // ✅ IMPORTANT
  className?: string;
};

function guessKindFromUrl(url: string): PdfViewerKind {
  const u = url.toLowerCase();
  if (u.includes(".pdf")) return "pdf";
  if (u.includes(".png") || u.includes(".jpg") || u.includes(".jpeg") || u.includes(".webp")) return "img";
  return "other";
}

export function PdfViewer({ url, kind, className }: PdfViewerProps) {
  if (!url) {
    return (
      <div className={cn("rounded-lg border bg-background p-3 text-sm text-muted-foreground", className)}>
        Aucun document à afficher.
      </div>
    );
  }

  const finalKind = kind ?? guessKindFromUrl(url);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
          {finalKind === "pdf" ? <FileText className="h-4 w-4" /> : finalKind === "img" ? <ImageIcon className="h-4 w-4" /> : null}
          <span className="truncate">{finalKind === "pdf" ? "PDF" : finalKind === "img" ? "Image" : "Document"}</span>
        </div>

        <Button asChild variant="outline" size="sm">
          <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2">
            Ouvrir <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>

      <div className="w-full overflow-hidden rounded-lg border bg-background">
        {finalKind === "img" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="w-full object-contain max-h-[70vh] min-h-[420px]" />
        ) : finalKind === "pdf" ? (
          <iframe src={url} title="Prévisualisation PDF" className="w-full h-[70vh] min-h-[420px]" loading="lazy" />
        ) : (
          <div className="p-4 text-sm text-muted-foreground">
            Type non prévisualisable ici. Utilise “Ouvrir”.
          </div>
        )}
      </div>
    </div>
  );
}