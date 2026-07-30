"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CreditCard,
  ArrowRight,
  Loader2,
  Download,
  FileText as FileTextIcon,
  Eye,
  EyeOff,
  UserCircle,
  FileUp,
  CheckCircle,
  Building,
  Phone,
  Mail,
  IdCard,
  Home,
  Shield,
  Calendar,
  Package,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import {
  doc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { useDb, useAuth, useFirebase, useFunctions } from "@/firebase";
import type { Client } from "@/app/admin/clients/page";
import { allAddresses } from "@/lib/addresses";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { mailPlans } from "@/lib/plans";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getDownloadURL, ref, uploadBytes, getStorage } from "firebase/storage";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type ClientDocumentsMap = Record<string, string>;

type SettingsClient = Client & {
  id: string;
  pdfPublish?: {
    contract?: {
      status: string;
      outputUrl?: string;
      error?: string;
    };
    attestation?: {
      status: string;
      outputUrl?: string;
      error?: string;
    };
  };
  documents?: ClientDocumentsMap;
  documentsMeta?: Record<
    string,
    {
      contentType?: string;
      size?: number;
      uploadedAt?: unknown;
    }
  >;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];

function extractFirebaseStoragePath(url: string): string | null {
  if (!url) return null;

  if (url.startsWith("gs://")) {
    return url.split("/").slice(3).join("/");
  }

  if (!url.startsWith("http")) {
    return url;
  }

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname === "firebasestorage.googleapis.com") {
      const match = parsedUrl.pathname.match(/^\/v0\/b\/[^/]+\/o\/(.+)$/);
      if (match?.[1]) {
        return decodeURIComponent(match[1]);
      }
    }

    if (parsedUrl.hostname.endsWith(".firebasestorage.app")) {
      return decodeURIComponent(parsedUrl.pathname.replace(/^\/+/, ""));
    }
  } catch {
    return null;
  }

  return null;
}

const profileSchema = z.object({
  name: z.string().min(2, "Le nom de l'entreprise est requis.").max(100),
  siret: z.string().min(14, "Le SIRET doit contenir 14 chiffres.").max(14),
  representative: z
    .string()
    .min(2, "Le nom du représentant est requis.")
    .max(100),
  email: z.string().email("L'email est invalide."),
  phone: z.string().min(10, "Le numéro de téléphone est requis.").max(20),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Le mot de passe actuel est requis."),
    newPassword: z
      .string()
      .min(8, "Le nouveau mot de passe doit faire au moins 8 caractères.")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "Le nouveau mot de passe doit être différent de l'actuel.",
    path: ["newPassword"],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

const fileSchema = z
  .any()
  .refine(
    (file) => !file || file.length === 0 || file[0]?.size <= MAX_FILE_SIZE,
    "Fichier trop volumineux (max 5MB)"
  )
  .refine(
    (file) =>
      !file || file.length === 0 || ALLOWED_FILE_TYPES.includes(file[0]?.type),
    "Format non supporté (JPEG, PNG, PDF uniquement)"
  );

const documentsSchema = z.object({
  kbis: fileSchema.optional(),
  identityCard: fileSchema.optional(),
  proofOfAddress: fileSchema.optional(),
  contract: fileSchema.optional(),
  attestation: fileSchema.optional(),
});

type DocumentsFormValues = z.infer<typeof documentsSchema>;

const ProfileTab = ({
  client,
  profileForm,
  onProfileSubmit,
}: {
  client: SettingsClient;
  profileForm: ReturnType<typeof useForm<z.infer<typeof profileSchema>>>;
  onProfileSubmit: (values: z.infer<typeof profileSchema>) => Promise<void>;
}) => {
  const domiciliationAddress = useMemo(() => {
    const addressId = String(
      (client as any)?.domiciliationAddressId ??
        (client as any)?.addressId ??
        ""
    );
    return allAddresses.find((a) => a.id === addressId) || null;
  }, [client]);

  return (
    <Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100 p-4 sm:p-5">
        <CardTitle className="flex items-center gap-3 text-xl font-black text-slate-950 sm:text-2xl">
          <UserCircle className="h-6 w-6 text-primary" />
          Profil de l'entreprise
        </CardTitle>
        <CardDescription className="text-sm text-slate-600">
          Mettez à jour les informations de votre entreprise et de votre
          représentant légal.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 md:p-6">
        <Form {...profileForm}>
          <form
            onSubmit={profileForm.handleSubmit(onProfileSubmit)}
            className="space-y-5"
          >
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <Building className="h-5 w-5" />
                Informations de l'entreprise
              </h3>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <FormField
                  control={profileForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de l'entreprise</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Nom de votre entreprise"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="siret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro de SIRET</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="12345678901234" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormItem>
                <FormLabel>Adresse de domiciliation</FormLabel>
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">{domiciliationAddress?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {domiciliationAddress?.street}
                    </p>
                  </div>
                </div>
                <CardDescription className="mt-2 text-xs">
                  Pour modifier l'adresse, veuillez nous contacter.
                </CardDescription>
              </FormItem>
            </div>

            <div className="space-y-4 border-t border-slate-100 pt-5">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <IdCard className="h-5 w-5" />
                Représentant légal
              </h3>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <FormField
                  control={profileForm.control}
                  name="representative"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom et Prénom</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Jean Dupont" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <Input
                            type="email"
                            {...field}
                            placeholder="jean.dupont@entreprise.fr"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={profileForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <Input
                          type="tel"
                          {...field}
                          placeholder="06 12 34 56 78"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={
                profileForm.formState.isSubmitting ||
                !profileForm.formState.isDirty
              }
              size="lg"
            >
              {profileForm.formState.isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Enregistrer les modifications
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

const PasswordTab = ({
  currentUser,
  passwordForm,
  onPasswordSubmit,
  handlePasswordReset,
}: {
  currentUser: User | null;
  passwordForm: ReturnType<typeof useForm<z.infer<typeof passwordSchema>>>;
  onPasswordSubmit: (values: z.infer<typeof passwordSchema>) => Promise<void>;
  handlePasswordReset: () => void;
}) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const watchedNewPassword = passwordForm.watch("newPassword");

  const passwordStrength = useMemo(() => {
    const password = watchedNewPassword || "";
    if (password.length === 0) return { strength: 0, label: "" };

    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 25;

    const labels = ["Faible", "Moyen", "Fort", "Très fort"];
    const index = Math.max(0, Math.floor(strength / 25) - 1);

    return {
      strength,
      label: labels[index] || "Très fort",
    };
  }, [watchedNewPassword]);

  return (
    <Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100 p-4 sm:p-5">
        <CardTitle className="flex items-center gap-3 text-xl font-black text-slate-950 sm:text-2xl">
          <Shield className="h-6 w-6 text-blue-500" />
          Sécurité du compte
        </CardTitle>
        <CardDescription className="text-sm text-slate-600">
          Changez votre mot de passe et sécurisez votre accès.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 md:p-6">
        <Form {...passwordForm}>
          <form
            onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
            className="max-w-xl space-y-5"
          >
            <FormField
              control={passwordForm.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe actuel</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        {...field}
                        placeholder="••••••••"
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShowCurrentPassword((prev) => !prev)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={passwordForm.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nouveau mot de passe</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        {...field}
                        placeholder="••••••••"
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {field.value && (
                    <div className="mt-2 space-y-2">
                      <Progress value={passwordStrength.strength} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        Force du mot de passe :{" "}
                        <span
                          className={cn(
                            passwordStrength.strength >= 75
                              ? "font-medium text-green-600"
                              : passwordStrength.strength >= 50
                              ? "font-medium text-yellow-600"
                              : "font-medium text-red-600"
                          )}
                        >
                          {passwordStrength.label}
                        </span>
                      </p>
                    </div>
                  )}

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={passwordForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmer le mot de passe</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        {...field}
                        placeholder="••••••••"
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col items-stretch justify-between gap-3 pt-4 sm:flex-row sm:items-center">
              <Button
                type="submit"
                disabled={passwordForm.formState.isSubmitting}
                className="w-full sm:w-auto"
                size="lg"
              >
                {passwordForm.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Changer le mot de passe
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    type="button"
                    className="w-full sm:w-auto"
                  >
                    Mot de passe oublié ?
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Réinitialiser le mot de passe
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Un lien de réinitialisation sera envoyé à :
                      <br />
                      <span className="font-bold text-primary">
                        {currentUser?.email}
                      </span>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handlePasswordReset}>
                      Envoyer le lien
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

const DocumentsTab = ({
  client,
  documentsForm,
  handleDocumentsUpload,
  documentUrls,
  isUploading,
}: {
  client: SettingsClient;
  documentsForm: ReturnType<typeof useForm<DocumentsFormValues>>;
  handleDocumentsUpload: (data: DocumentsFormValues) => Promise<void>;
  documentUrls: Record<string, string>;
  isUploading: boolean;
}) => {
  const { toast } = useToast();
  const { firebaseApp } = useFirebase();
  const [openingPath, setOpeningPath] = useState<string | null>(null);

  const handleOpenDocument = async (url: string) => {
    if (!url || !firebaseApp) return;

    const hasDownloadToken = url.startsWith("http") && url.includes("token=");
    const storagePath = extractFirebaseStoragePath(url);

    try {
      setOpeningPath(url);

      // Les PDF publies par nos fonctions portent deja un token Firebase.
      // Les ouvrir directement evite un getDownloadURL bloque par d'anciens noms de fichiers.
      if (hasDownloadToken) {
        window.open(url, "_blank", "noopener,noreferrer");
        return;
      }

      // Re-resolve Firebase Storage documents on each click so we don't rely
      // on a token that may have changed after the URL was stored in Firestore.
      if (storagePath) {
        const storage = getStorage(firebaseApp);
        const storageRef = ref(storage, storagePath);
        const downloadUrl = await getDownloadURL(storageRef);
        window.open(downloadUrl, "_blank", "noopener,noreferrer");
        return;
      }
      
      // Si c'est déjà une URL signée Firebase Storage avec un token, on l'ouvre directement
      if (hasDownloadToken) {
        window.open(url, "_blank", "noopener,noreferrer");
        return;
      }

      // Sinon, on essaie de générer une URL de téléchargement via le SDK
      const storage = getStorage(firebaseApp);
      
      // Extraire le chemin si c'est une URL GCS ou une URL sans token
      let path = url;
      if (url.startsWith("gs://")) {
        path = url.split("/").slice(3).join("/");
      } else if (url.startsWith("https://firebasestorage.googleapis.com")) {
        // Extraire le chemin de l'URL firebasestorage
        // Format: https://firebasestorage.googleapis.com/v0/b/BUCKET/o/PATH?alt=media
        const match = url.match(/\/o\/(.+?)\?/);
        if (match && match[1]) {
          path = decodeURIComponent(match[1]);
        }
      }

      const storageRef = ref(storage, path);
      const downloadUrl = await getDownloadURL(storageRef);
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Erreur lors de l'ouverture du document:", error);
      if (hasDownloadToken) {
        window.open(url, "_blank", "noopener,noreferrer");
        return;
      }
      // Fallback: ouvrir l'URL d'origine au cas où
      if (!storagePath) {
        window.open(url, "_blank", "noopener,noreferrer");
        return;
      }

      toast({
        variant: "destructive",
        title: "Téléchargement impossible",
        description:
          "Le document n'a pas pu être ouvert. Nous pouvons le régénérer si besoin.",
      });
    } finally {
      setOpeningPath(null);
    }
  };

  const documentTypes: {
    id: keyof DocumentsFormValues;
    label: string;
    description: string;
    required: boolean;
  }[] = [
    {
      id: "kbis",
      label: "Extrait Kbis",
      description: "Document officiel d'immatriculation de votre entreprise",
      required: true,
    },
    {
      id: "identityCard",
      label: "Pièce d'identité",
      description: "Carte d'identité ou passeport du représentant légal",
      required: true,
    },
    {
      id: "proofOfAddress",
      label: "Justificatif de domicile",
      description: "Facture de moins de 3 mois",
      required: true,
    },
  ];

  const documentsToUpload = documentTypes.filter(
    (docType) => docType.required && !documentUrls[docType.id]
  );

  const documentsSaved = Object.entries(documentUrls)
    .map(([key, url]) => {
      const docTypeInfo = documentTypes.find((d) => d.id === key);
      return {
        key,
        url,
        label: docTypeInfo?.label || key,
        description: docTypeInfo?.description,
      };
    })
    .filter((docItem) => docItem.label);

  const pdfDocuments = useMemo(() => {
    const docs = [];
    if (client.pdfPublish?.contract?.outputUrl) {
      docs.push({
        key: "contract",
        label: "Contrat de Domiciliation",
        description: "Document officiel signé.",
        url: client.pdfPublish.contract.outputUrl,
      });
    }
    if (client.pdfPublish?.attestation?.outputUrl) {
      docs.push({
        key: "attestation",
        label: "Attestation de Domiciliation",
        description: "Justificatif d'adresse commerciale.",
        url: client.pdfPublish.attestation.outputUrl,
      });
    }
    return docs;
  }, [client.pdfPublish]);

  const completionPercentage = Math.round(
    ((documentsSaved.length + (pdfDocuments.length > 0 ? 1 : 0)) / (documentTypes.filter((d) => d.required).length + 1)) * 100
  );

  return (
    <Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100 p-4 sm:p-5">
        <CardTitle className="flex items-center gap-3 text-xl font-black text-slate-950 sm:text-2xl">
          <FileTextIcon className="h-6 w-6 text-green-500" />
          Gestion des Documents
        </CardTitle>
        <CardDescription className="text-sm text-slate-600">
          Consultez vos documents contractuels et gérez vos justificatifs.
        </CardDescription>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Progression du dossier</span>
            <span className="text-sm text-muted-foreground">
              {completionPercentage}%
            </span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-4 sm:p-5 md:p-6">
        {pdfDocuments.length > 0 && (
          <section className="animate-in fade-in slide-in-from-top-4 duration-500">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-primary">
              <Shield className="h-5 w-5" />
              Documents Officiels (CCS-DOM)
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {pdfDocuments.map(({ key, url, label, description }) => (
                <Card key={key} className="rounded-2xl border-primary/20 bg-primary/5 p-4 shadow-sm transition-all hover:bg-primary/10">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-md bg-primary/10 p-2 text-primary">
                        <FileTextIcon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold truncate">{label}</p>
                        <p className="text-xs text-muted-foreground">{description}</p>
                      </div>
                    </div>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="w-full gap-2 shadow-none" 
                      onClick={() => handleOpenDocument(url)}
                      disabled={openingPath === url}
                    >
                      {openingPath === url ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      Télécharger PDF
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        <section>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <FileUp className="h-5 w-5" />
            Documents à fournir
          </h3>

          <Form {...documentsForm}>
            <form
              onSubmit={documentsForm.handleSubmit(handleDocumentsUpload)}
              className="space-y-4"
            >
              {documentsToUpload.length > 0 ? (
                documentsToUpload.map((docType) => (
                  <Card
                    key={docType.id}
                    className="border-2 border-dashed border-muted-foreground/20 p-4 transition-colors hover:border-primary/50"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="font-semibold">{docType.label}</span>
                          <Badge variant="destructive" className="text-xs">
                            Requis
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {docType.description}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Formats acceptés : PDF, JPG, PNG (max 5MB)
                        </p>
                      </div>

                      <div className="lg:w-64">
                        <FormField
                          control={documentsForm.control}
                          name={docType.id}
                          render={({ field }) => (
                            <FormItem className="space-y-0">
                              <FormControl>
                                <Input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  className="cursor-pointer"
                                  onChange={(e) => field.onChange(e.target.files)}
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-green-700 sm:p-5">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6" />
                    <div>
                      <p className="font-semibold">
                        Tous les documents requis ont été téléversés !
                      </p>
                      <p className="mt-1 text-sm">Votre dossier est complet.</p>
                    </div>
                  </div>
                </div>
              )}

              {documentsToUpload.length > 0 && (
                <Button type="submit" disabled={isUploading} className="mt-4 w-full sm:w-auto" size="lg">
                  {isUploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileUp className="mr-2 h-4 w-4" />
                  )}
                  Téléverser les documents sélectionnés
                </Button>
              )}
            </form>
          </Form>
        </section>

        {documentsSaved.length > 0 && (
          <>
            <hr className="opacity-50" />
            <section>
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-green-700">
                <CheckCircle className="h-5 w-5" />
                Justificatifs enregistrés
              </h3>
              <div className="grid gap-3">
                {documentsSaved.map(({ key, url, label, description }) => (
                  <Card
                    key={key}
                    className="rounded-2xl border-green-200 bg-green-50/30 p-4 shadow-none transition-colors hover:bg-green-50"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded text-green-700">
                          <FileTextIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{label}</p>
                          <p className="text-xs text-muted-foreground">
                            {description}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-2 text-green-700 hover:text-green-800 hover:bg-green-100" 
                        onClick={() => handleOpenDocument(url)}
                        disabled={openingPath === url}
                      >
                        {openingPath === url ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                        Consulter
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          </>
        )}
      </CardContent>
    </Card>
  );
};

const SubscriptionTab = ({ client }: { client: SettingsClient }) => {
  const { toast } = useToast();
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const functions = useFunctions();

  const handleOpenPortal = async () => {
    if (!functions) return;
    setIsPortalLoading(true);
    try {
      const createPortalSession = httpsCallable(functions, "createStripePortalSession");
      const result = await createPortalSession({ 
        returnUrl: window.location.href 
      });
      const data = result.data as { url: string };
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error("Error opening portal:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible d'ouvrir le portail de gestion.",
      });
    } finally {
      setIsPortalLoading(false);
    }
  };

  const currentPlan = client
    ? mailPlans.find((p) => p.id === (client as any).plan)
    : null;

  const nextBillingDate = new Date();
  nextBillingDate.setDate(nextBillingDate.getDate() + 30);

  return (
    <Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100 p-4 sm:p-5">
        <CardTitle className="flex items-center gap-3 text-xl font-black text-slate-950 sm:text-2xl">
          <Package className="h-6 w-6 text-purple-500" />
          Gestion de l'abonnement
        </CardTitle>
        <CardDescription className="text-sm text-slate-600">
          Consultez et gérez votre offre et vos informations de facturation.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 p-4 sm:p-5 md:p-6">
        <Card className="rounded-3xl border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-primary text-primary-foreground">
                    Offre actuelle
                  </Badge>
                  <span className="text-lg font-bold text-primary">
                    {currentPlan?.name ?? "Non définie"}
                  </span>
                </div>

                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Prochaine facture le {nextBillingDate.toLocaleDateString("fr-FR")}
                </p>

                {currentPlan && (
                  <div>
                    <p className="text-2xl font-bold">{currentPlan.price}</p>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Montant affiche hors taxes (HT)
                    </p>
                  </div>
                )}
              </div>

              <Button 
                onClick={handleOpenPortal} 
                className="w-full gap-2 sm:w-auto"
                disabled={isPortalLoading}
              >
                {isPortalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                Gérer l'abonnement <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <span className="font-semibold">Moyen de paiement</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Gérez vos moyens de paiement en toute sécurité.
                </p>
              </div>

              <Button 
                variant="outline" 
                className="w-full gap-2 sm:w-auto"
                onClick={handleOpenPortal}
                disabled={isPortalLoading}
              >
                {isPortalLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                Gérer mes cartes
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Historique des factures</CardTitle>
            <CardDescription>
              Consultez et téléchargez vos dernières factures
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">Facture #INV-2024-08</p>
                  <p className="text-sm text-muted-foreground">26 juillet 2024</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-green-200 bg-green-50 text-green-700"
                  >
                    Payée
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">Facture #INV-2024-07</p>
                  <p className="text-sm text-muted-foreground">26 juin 2024</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-green-200 bg-green-50 text-green-700"
                  >
                    Payée
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <Button variant="outline" className="mt-4 w-full" asChild>
              <Link href="/dashboard/billing">Voir tout l'historique</Link>
            </Button>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default function SettingsPage() {
  const { toast } = useToast();
  const auth = useAuth();
  const db = useDb();
  const { firebaseApp } = useFirebase();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [client, setClient] = useState<SettingsClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [documentUrls, setDocumentUrls] = useState<Record<string, string>>({});

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      siret: "",
      representative: "",
      email: "",
      phone: "",
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const documentsForm = useForm<DocumentsFormValues>({
    resolver: zodResolver(documentsSchema),
  });

  const fetchClientProfile = useCallback(
    (user: User) => {
      if (!db || !firebaseApp) return () => {};

      const storage = getStorage(firebaseApp);
      setIsLoading(true);

      const clientRef = doc(db, "clients", user.uid);
      const requestRef = doc(db, "client_requests", user.uid);

      let clientSnap: any = null;
      let requestSnap: any = null;

      const updateState = async () => {
        if (!clientSnap?.exists()) return;

        const clientData = {
          id: clientSnap.id,
          ...clientSnap.data(),
          // Merge pdfPublish from request if available
          pdfPublish: requestSnap?.exists() ? requestSnap.data()?.pdfPublish : undefined,
        } as SettingsClient;

        setClient(clientData);

        profileForm.reset({
          name: clientData.name || "",
          siret: clientData.siret || "",
          representative: clientData.representative || "",
          email: user.email || "",
          phone: clientData.phone || "",
        });

        const docsMap = clientData.documents || {};
        const urls: Record<string, string> = {};

        for (const key of Object.keys(docsMap)) {
          const path = docsMap[key];
          if (path) {
            try {
              const storageRef = ref(storage, path);
              urls[key] = await getDownloadURL(storageRef);
            } catch (error) {
              console.warn(`Document invalide pour ${key}: ${path}`, error);
            }
          }
        }

        setDocumentUrls(urls);
        setIsLoading(false);
      };

      const unsubClient = onSnapshot(clientRef, (snap) => {
        clientSnap = snap;
        updateState();
      }, (error) => {
        console.error("Error fetching client profile:", error);
        setIsLoading(false);
      });

      const unsubRequest = onSnapshot(requestRef, (snap) => {
        requestSnap = snap;
        updateState();
      });

      return () => {
        unsubClient();
        unsubRequest();
      };
    },
    [profileForm, toast, db, firebaseApp]
  );

  useEffect(() => {
    if (!auth) return;

    const unsubscribeAuth = auth.onAuthStateChanged((user: User | null) => {
      setCurrentUser(user);
      if (!user && auth.currentUser === null) {
        setIsLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [auth]);

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = fetchClientProfile(currentUser);
    return () => unsubscribe?.();
  }, [currentUser, fetchClientProfile]);

  const onProfileSubmit = async (values: z.infer<typeof profileSchema>) => {
    if (!client?.id || !db) return;

    try {
      const clientDocRef = doc(db, "clients", client.id);
      await updateDoc(clientDocRef, {
        name: values.name,
        siret: values.siret,
        representative: values.representative,
        phone: values.phone,
        lastUpdated: serverTimestamp(),
      });

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été enregistrées avec succès.",
      });
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le profil.",
      });
    }
  };

  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    if (!currentUser?.email || !auth) return;

    try {
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        values.currentPassword
      );

      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, values.newPassword);

      toast({
        title: "Mot de passe modifié",
        description: "Votre mot de passe a été mis à jour avec succès.",
      });

      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Password change error:", error);
      toast({
        variant: "destructive",
        title: "Erreur de modification",
        description:
          error.message ||
          "Le mot de passe actuel est incorrect ou la session est expirée.",
      });
    }
  };

  const handlePasswordReset = () => {
    if (currentUser?.email && auth) {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "https://ccsdom.fr";

      sendPasswordResetEmail(auth, currentUser.email, {
        url: `${origin}/login`,
        handleCodeInApp: false,
      })
        .then(() => {
          toast({
            title: "Email de réinitialisation envoyé",
            description: "Veuillez consulter votre boîte de réception.",
          });
        })
        .catch((error) => {
          console.error("Password reset error:", error);
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible d'envoyer l'email de réinitialisation.",
          });
        });
    }
  };

  const handleDocumentsUpload = async (data: DocumentsFormValues) => {
    if (!client || !currentUser || !db || !firebaseApp) return;

    const storage = getStorage(firebaseApp);
    setIsUploading(true);

    const uploadedDocuments: Record<string, string> = {};
    const documentTypes: (keyof DocumentsFormValues)[] = [
      "kbis",
      "identityCard",
      "proofOfAddress",
      "contract",
      "attestation",
    ];

    let filesToUpload = false;

    try {
      for (const docType of documentTypes) {
        const fileList = data[docType];
        if (fileList && fileList.length > 0) {
          filesToUpload = true;
          const file = fileList[0];
          const safeName = file.name.replace(/\s+/g, "_");
          const filePath = `documents/${currentUser.uid}/${docType}/${Date.now()}_${safeName}`;
          const storageRef = ref(storage, filePath);

          await uploadBytes(storageRef, file);
          uploadedDocuments[docType] = filePath;

          const newUrl = await getDownloadURL(storageRef);
          setDocumentUrls((prev) => ({ ...prev, [docType]: newUrl }));
        }
      }

      if (!filesToUpload) {
        toast({
          variant: "destructive",
          title: "Aucun fichier",
          description: "Veuillez sélectionner au moins un fichier à téléverser.",
        });
        return;
      }

      const clientDocRef = doc(db, "clients", client.id);
      await updateDoc(clientDocRef, {
        documents: {
          ...(client.documents || {}),
          ...uploadedDocuments,
        },
        updatedAt: serverTimestamp(),
      });

      toast({
        title: "Documents téléversés",
        description: "Vos documents ont été sauvegardés avec succès.",
      });

      documentsForm.reset({
        kbis: undefined,
        identityCard: undefined,
        proofOfAddress: undefined,
        contract: undefined,
        attestation: undefined,
      });
    } catch (error: any) {
      console.error("Error uploading documents:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description:
          error.message || "Le téléversement des documents a échoué.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 text-lg text-muted-foreground">
          Chargement des paramètres...
        </p>
      </div>
    );
  }

  if (!client || !currentUser) {
    return (
      <Card className="mx-auto mt-8 max-w-2xl border-l-4 border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-6 w-6" /> Erreur de Profil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Impossible de charger les informations de votre profil client.
            Veuillez vous reconnecter ou contacter le support.
          </p>
          <Button className="mt-4" asChild>
            <Link href="/auth/login">Se reconnecter</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-3 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-3 sm:px-4 md:px-6 md:py-6">
      <div className="mb-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h1 className="mb-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Paramètres du compte</h1>
        <p className="text-sm leading-6 text-slate-600">
          Gérez les informations de votre entreprise, votre sécurité et vos
          documents.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-5 sm:space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
          <TabsList className="flex h-auto w-full justify-start gap-1 overflow-x-auto rounded-none bg-transparent p-0">
            <TabsTrigger
              value="profile"
              className="h-11 shrink-0 rounded-xl border-0 px-4 text-sm font-bold transition-colors duration-200 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-none"
            >
              <UserCircle className="mr-2 h-5 w-5" />
              Profil
            </TabsTrigger>

            <TabsTrigger
              value="documents"
              className="h-11 shrink-0 rounded-xl border-0 px-4 text-sm font-bold transition-colors duration-200 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-none"
            >
              <FileTextIcon className="mr-2 h-5 w-5" />
              Documents
            </TabsTrigger>

            <TabsTrigger
              value="password"
              className="h-11 shrink-0 rounded-xl border-0 px-4 text-sm font-bold transition-colors duration-200 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-none"
            >
              <Shield className="mr-2 h-5 w-5" />
              Sécurité
            </TabsTrigger>

            <TabsTrigger
              value="subscription"
              className="h-11 shrink-0 rounded-xl border-0 px-4 text-sm font-bold transition-colors duration-200 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-none"
            >
              <Package className="mr-2 h-5 w-5" />
              Abonnement
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="profile">
          <ProfileTab
            client={client}
            profileForm={profileForm}
            onProfileSubmit={onProfileSubmit}
          />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentsTab
            client={client}
            documentsForm={documentsForm}
            handleDocumentsUpload={handleDocumentsUpload}
            documentUrls={documentUrls}
            isUploading={isUploading}
          />
        </TabsContent>

        <TabsContent value="password">
          <PasswordTab
            currentUser={currentUser}
            passwordForm={passwordForm}
            onPasswordSubmit={onPasswordSubmit}
            handlePasswordReset={handlePasswordReset}
          />
        </TabsContent>

        <TabsContent value="subscription">
          <SubscriptionTab client={client} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
