"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import {
  CheckCircle2,
  FileText,
  Home,
  IdCard,
  Info,
  Loader2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

import { useDb, useFirebase } from "@/firebase";
import { notifySignup } from "@/lib/notifySignup";
import type { SignupDocType, SignupFormValues } from "@/features/signup/config";
import { resolveAddressKeyFromForm } from "@/features/signup/config";
import {
  areRequiredSignupDocumentsComplete,
  ensureSignupAnonymousAuth,
  INITIAL_UPLOAD_BUSY,
  INITIAL_UPLOAD_ERRORS,
  INITIAL_UPLOADED_PATHS,
  INITIAL_UPLOAD_PROGRESS,
  loadExistingSignupDocuments,
  markSignupDocumentsReady,
  persistSignupDocumentMetadata,
  uploadSignupDocument,
  validateSignupDocumentFile,
} from "@/features/signup/documents.service";

type Props = {
  requestUid: string;
  email: string;
  onComplete?: () => void;
};

const DOCUMENT_TYPES: {
  id: SignupDocType;
  label: string;
  description: string;
  required: boolean;
  icon: React.ElementType;
}[] = [
  {
    id: "kbis",
    label: "Extrait Kbis (si existant)",
    description: "Document officiel d’immatriculation de l’entreprise.",
    required: false,
    icon: FileText,
  },
  {
    id: "identityCard",
    label: "Pièce d'identité du dirigeant",
    description: "Carte nationale ou passeport en cours de validité.",
    required: true,
    icon: IdCard,
  },
  {
    id: "proofOfAddress",
    label: "Justificatif de domicile du dirigeant (-3 mois)",
    description: "Facture récente (énergie, internet, eau, etc.).",
    required: true,
    icon: Home,
  },
];

export const DocumentsStep: React.FC<Props> = ({
  requestUid,
  email,
  onComplete,
}) => {
  const { control, getValues } = useFormContext<SignupFormValues>();
  const { toast } = useToast();
  const db = useDb();
  const { firebaseApp } = useFirebase();

  const [progress, setProgress] = React.useState({ ...INITIAL_UPLOAD_PROGRESS });
  const [uploadedPath, setUploadedPath] = React.useState({
    ...INITIAL_UPLOADED_PATHS,
  });
  const [errorByType, setErrorByType] = React.useState({
    ...INITIAL_UPLOAD_ERRORS,
  });
  const [busy, setBusy] = React.useState({ ...INITIAL_UPLOAD_BUSY });
  const [sentDocsReadyNotif, setSentDocsReadyNotif] = React.useState(false);

  const servicesReady = Boolean(firebaseApp && db && requestUid);

  React.useEffect(() => {
    let cancelled = false;

    async function checkSessionConsistency() {
      if (!firebaseApp || !requestUid) return;
      try {
        const user = await ensureSignupAnonymousAuth(firebaseApp);
        if (!cancelled && user.uid !== requestUid) {
          setErrorByType((state) => ({
            ...state,
            kbis: "Session expirée ou invalide. Veuillez recharger la page.",
            identityCard: "Session expirée ou invalide. Veuillez recharger la page.",
            proofOfAddress: "Session expirée ou invalide. Veuillez recharger la page.",
          }));
        }
      } catch (err) {
        console.warn("[DocumentsStep] Consistency check failed:", err);
      }
    }

    async function hydrateExistingDocuments() {
      if (!db || !requestUid) return;

      try {
        const docs = await loadExistingSignupDocuments(db, requestUid);
        if (!cancelled) {
          setUploadedPath(docs);
        }
      } catch {
        // silence volontaire
      }
    }

    void checkSessionConsistency();
    void hydrateExistingDocuments();

    return () => {
      cancelled = true;
    };
  }, [db, firebaseApp, requestUid]);

  const maybeFinalizeDocs = React.useCallback(
    async (
      nextUploadedPath: typeof uploadedPath
    ) => {
      if (!db) return;

      const requiredTypes = DOCUMENT_TYPES.filter((d) => d.required).map(
        (d) => d.id
      );

      const allUploaded = areRequiredSignupDocumentsComplete(
        nextUploadedPath,
        requiredTypes
      );

      if (!allUploaded) return;

      await markSignupDocumentsReady({
        db,
        requestUid,
      });

      if (!sentDocsReadyNotif) {
        try {
          const values = getValues() as SignupFormValues;
          const addressKey = resolveAddressKeyFromForm(values, "orly");

          const companyName =
            String(values.companyName ?? "").trim() || "—";

          const contactName =
            `${String(values.firstName ?? "").trim()} ${String(
              values.lastName ?? ""
            ).trim()}`.trim() || "—";

          const contactEmail =
            String(email ?? "").trim().toLowerCase() ||
            String(values.email ?? "").trim().toLowerCase() ||
            "—";

          const contactPhone = String(values.phone ?? "").trim() || "—";
          const legalStatus = String(values.legalStatus ?? "").trim() || "—";
          const planName =
            String(values.planName ?? "").trim() ||
            String(values.mailPlanId ?? "").trim() ||
            "—";

          await notifySignup({
            addressKey,
            companyName,
            legalStatus,
            contactName,
            contactEmail,
            contactPhone,
            planName,
            planPrice: String(values.planPrice ?? "").trim() || "—",
            requestUid,
            docsRequiredCompleted: true,
            status: "docs_ready",
            createdAtStr: new Date().toLocaleString("fr-FR"),
            adminConsoleUrl: "",
            clientIp: "unknown",
            userAgent:
              typeof navigator !== "undefined" ? navigator.userAgent : "server",
          });

          setSentDocsReadyNotif(true);

          toast({
            title: "Documents complétés",
            description: "Nous avons notifié nos équipes. Merci !",
          });
        } catch (error) {
          console.warn(
            "[DocumentsStep] notifySignup docs_ready échoué (non bloquant):",
            error
          );
        }
      }

      if (onComplete) {
        setTimeout(() => onComplete(), 900);
      }
    },
    [db, email, getValues, onComplete, requestUid, sentDocsReadyNotif, toast]
  );

  async function handleUpload(file: File, docType: SignupDocType) {
    if (!firebaseApp || !db || !servicesReady) {
      toast({
        variant: "destructive",
        title: "Service indisponible",
        description: "Veuillez réessayer dans quelques secondes.",
      });
      return;
    }

    const validationError = validateSignupDocumentFile(file);
    if (validationError) {
      setErrorByType((state) => ({ ...state, [docType]: validationError }));
      return;
    }

    setErrorByType((state) => ({ ...state, [docType]: null }));
    setBusy((state) => ({ ...state, [docType]: true }));
    setProgress((state) => ({ ...state, [docType]: 0 }));

    try {
      const user = await ensureSignupAnonymousAuth(firebaseApp);

      if (user.uid !== requestUid) {
        throw new Error(
          "Votre session ne correspond pas au dossier. Reprenez l’inscription depuis le début."
        );
      }

      const finalPath = await uploadSignupDocument({
        firebaseApp,
        requestUid,
        email,
        docType,
        file,
        onProgress: (pct) => {
          setProgress((state) => ({ ...state, [docType]: pct }));
        },
      });

      await persistSignupDocumentMetadata({
        db,
        requestUid,
        ownerUid: user.uid,
        docType,
        file,
        uploadedPath: finalPath,
      });

      const nextUploadedPath = {
        ...uploadedPath,
        [docType]: finalPath,
      };

      setUploadedPath(nextUploadedPath);

      toast({
        title: "Fichier enregistré",
        description: `« ${file.name} » prêt pour l’analyse.`,
      });

      await maybeFinalizeDocs(nextUploadedPath);
    } catch (error: any) {
      console.error("[DocumentsStep] upload error:", error);

      setErrorByType((state) => ({
        ...state,
        [docType]: error?.message || "Échec du téléversement.",
      }));

      toast({
        variant: "destructive",
        title: "Échec",
        description: error?.message || "Téléversement impossible.",
      });
    } finally {
      setBusy((state) => ({ ...state, [docType]: false }));
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-secondary/40 p-4">
        <h3 className="flex items-center gap-2 font-semibold">
          <Info className="h-5 w-5 text-primary" />
          Pièces justificatives requises
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Téléversez les documents demandés. Ils seront stockés en sécurité et
          analysés automatiquement.
        </p>
      </div>

      <div className="space-y-4">
        {DOCUMENT_TYPES.map((documentType) => (
          <FormField
            key={documentType.id}
            control={control}
            name={documentType.id}
            render={({ field }) => {
              const okPath = uploadedPath[documentType.id];
              const pct = progress[documentType.id] ?? 0;
              const isBusy = Boolean(busy[documentType.id]);
              const errMsg = errorByType[documentType.id];

              return (
                <Card
                  className={cn(
                    "rounded-xl border-2 transition-all",
                    okPath
                      ? "border-green-500/70 bg-green-50/50 dark:bg-green-950/20"
                      : "border-dashed"
                  )}
                >
                  <CardContent className="p-4">
                    <FormItem>
                      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                        <div
                          className={cn(
                            "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg",
                            okPath
                              ? "bg-green-100 dark:bg-green-900"
                              : "bg-muted"
                          )}
                        >
                          <documentType.icon
                            className={cn(
                              "h-6 w-6",
                              okPath
                                ? "text-green-700 dark:text-green-300"
                                : "text-muted-foreground"
                            )}
                          />
                        </div>

                        <div className="flex-1">
                          <FormLabel
                            htmlFor={documentType.id}
                            className="cursor-pointer font-semibold"
                          >
                            {documentType.label}{" "}
                            {documentType.required && (
                              <span className="text-destructive">*</span>
                            )}
                          </FormLabel>

                          <p className="text-xs text-muted-foreground">
                            {documentType.description}
                          </p>

                          {okPath && (
                            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-300">
                              <CheckCircle2 className="h-4 w-4" />
                              Fichier enregistré — prêt pour analyse
                            </p>
                          )}

                          {isBusy && (
                            <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Téléversement… {pct} %
                            </p>
                          )}

                          {errMsg && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                              <XCircle className="h-4 w-4" />
                              {errMsg}
                            </p>
                          )}

                          <FormMessage className="mt-1 text-xs" />
                        </div>

                        <FormControl>
                          <Input
                            id={documentType.id}
                            type="file"
                            className="sr-only"
                            accept="application/pdf,image/*"
                            disabled={isBusy}
                            onChange={(event) => {
                              const files = event.target.files;
                              field.onChange(files);
                              const file = files?.[0];
                              if (file) {
                                void handleUpload(file, documentType.id);
                              }
                            }}
                          />
                        </FormControl>

                        <label
                          htmlFor={documentType.id}
                          className={cn(
                            buttonVariants({
                              variant: okPath ? "outline" : "default",
                            }),
                            "w-full cursor-pointer sm:w-auto"
                          )}
                        >
                          {okPath ? "Remplacer le fichier" : "Choisir un fichier"}
                        </label>
                      </div>
                    </FormItem>
                  </CardContent>
                </Card>
              );
            }}
          />
        ))}
      </div>
    </div>
  );
};