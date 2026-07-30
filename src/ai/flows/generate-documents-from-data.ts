// Types partages par l'interface du generateur documentaire.
// La generation reelle est executee par la Cloud Function generateDocumentsFromData.

export type GeneratedFormaliteDocument = {
  id: string;
  title: string;
  category: "creation" | "transfert" | "commun" | "checklist";
  required: boolean;
  content: string;
};

export type GenerateDocumentsFromDataOutput = {
  status: "ok" | "error";
  message?: string;
  details?: unknown;
  projectType?: "creation" | "transfert";
  documents?: GeneratedFormaliteDocument[];

  // Cles historiques conservees pour compatibilite avec l'UI.
  statutsProjet?: string | null;
  decisionAGE?: string | null;
  statutsMisAJour?: string | null;
  attestationDomiciliation?: string | null;
  checklistFormalite?: string | null;

  [key: string]: unknown;
};

export async function generateDocumentsFromData(
  _input: unknown
): Promise<GenerateDocumentsFromDataOutput> {
  return {
    status: "ok",
    message: "Generation executee cote Cloud Function.",
    documents: [],
  };
}
