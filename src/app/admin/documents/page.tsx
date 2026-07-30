"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence, type Variants } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Sparkles,
  Printer,
  Clipboard,
  ChevronsUpDown,
  Search,
  Download,
  FileText,
  Building2,
  UserCheck,
  Calendar,
  Layers,
  CheckCircle2,
  ArrowRight,
  Info,
  ShieldCheck,
  Mail
} from "lucide-react";

import type {
  GeneratedFormaliteDocument,
  GenerateDocumentsFromDataOutput,
} from "@/ai/flows/generate-documents-from-data";
import { httpsCallable, getFunctions } from "firebase/functions";
import { Separator } from "@/components/ui/separator";
import {
  collection,
  doc as firestoreDoc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";

import { Client } from "../clients/page";
import { OperationalAccessNotice } from "@/components/admin/operational-access-notice";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { allAddresses } from "@/lib/addresses";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

import jsPDF from "jspdf";
import { useDb, useFirebase } from "@/firebase";
import { useCenterAccess } from "@/hooks/use-center-access";
import { canAccessCenter, legacyCenterKey, resolveRecordCenterId } from "@/lib/access-control";

/* =========================
   Helpers (legacy + new model)
  ========================= */

function displayClientName(c: Client): string {
  return ((c as any).name || (c as any).companyName || "—").toString();
}

function normalizeClientEmail(c: Client): string {
  return (((c as any).emailLower || (c as any).email || "") as string)
    .toLowerCase()
    .trim();
}

function resolveClientAddressId(c: Client): string | undefined {
  if ((c as any).domiciliationAddressId) return (c as any).domiciliationAddressId;
  if ((c as any).addressId) return (c as any).addressId;
  const k = (c as any).addressKey;
  if (k === "paris") return "paris_12e";
  if (k === "orly") return "orly_ville";
  return undefined;
}

function resolveClientProjectType(c: Client): "creation" | "transfert" {
  const acc = (c as any).accompanimentType;
  if (acc === "expert_transfert") return "transfert";
  if (acc === "expert_creation") return "creation";
  const pt = (c as any).projectType;
  if (pt === "transfert") return "transfert";
  return "creation";
}

function resolveClientOldAddress(c: Client): string {
  return ((c as any).address || "").toString();
}

function resolveClientRepresentative(c: Client): string {
  return (((c as any).representative || "") as string).toString();
}

function resolveClientSiret(c: Client): string {
  return (((c as any).siretNorm || (c as any).siret || "") as string).toString();
}

function formatPdfFileName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "document";
}

function centerKeyForStorage(addressId?: string): string {
  if (addressId === "paris_12e" || addressId === "paris") return "paris";
  if (addressId === "orly_ville" || addressId === "orly") return "orly";
  return formatPdfFileName(addressId || "centre");
}

function pdfText(value: unknown, fallback = "À compléter"): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

/* =========================
   Framer Motion Variants
  ========================= */

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const DOCUMENT_CATEGORY_LABELS: Record<GeneratedFormaliteDocument["category"], string> = {
  creation: "Creation",
  transfert: "Transfert",
  commun: "Commun",
  checklist: "Pilotage",
};

const DOCUMENT_CATEGORY_BADGES: Record<GeneratedFormaliteDocument["category"], string> = {
  creation: "border-sky-200 bg-sky-50 text-sky-700",
  transfert: "border-amber-200 bg-amber-50 text-amber-700",
  commun: "border-emerald-200 bg-emerald-50 text-emerald-700",
  checklist: "border-violet-200 bg-violet-50 text-violet-700",
};

/* =========================
   Schema
  ========================= */

const documentSchema = z.object({
  projectType: z.enum(["creation", "transfert"]),
  companyName: z.string().min(2, "Le nom de l'entreprise est requis."),
  companyAddress: z.string().min(5, "L'adresse est requise."),
  legalRepresentativeName: z.string().min(2, "Le nom du représentant est requis."),
  legalRepresentativeEmail: z.string().email("L'adresse e-mail est invalide."),
  registrationDate: z.string().min(10, "La date est requise (YYYY-MM-DD)."),
  oldCompanyAddress: z.string().optional(),
  siret: z.string().optional(),
  addressId: z.string().optional(),
  legalStatus: z.string().optional(),
  capitalSocial: z.string().optional(),
  activityDescription: z.string().optional(),
});

type DocumentFormValues = z.infer<typeof documentSchema>;

export default function GenerateDocumentsPage() {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isSavingBundle, setIsSavingBundle] = React.useState(false);
  const [generatedDocs, setGeneratedDocs] =
    React.useState<GenerateDocumentsFromDataOutput | null>(null);

  const { toast } = useToast();

  const [clients, setClients] = React.useState<Client[]>([]);
  const [isClientsLoading, setIsClientsLoading] = React.useState(true);
  const [selectedClient, setSelectedClient] = React.useState<Client | null>(null);
  const [isSelectorOpen, setIsSelectorOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  const db = useDb();
  const { firebaseApp, storage } = useFirebase();
  const { displayRole, managedCenterIds } = useCenterAccess();
  const isSuperAdminView = displayRole === "super_admin";

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      projectType: "creation",
      companyName: "",
      companyAddress: "",
      legalRepresentativeName: "",
      legalRepresentativeEmail: "",
      registrationDate: new Date().toISOString().split("T")[0],
      oldCompanyAddress: "",
      siret: "",
      addressId: "",
      legalStatus: "",
      capitalSocial: "",
      activityDescription: "",
    },
  });

  const filteredClients = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return clients;

    return clients.filter((c) => {
      const name = displayClientName(c).toLowerCase();
      const email = normalizeClientEmail(c);
      const siret = resolveClientSiret(c).toLowerCase();
      return name.includes(term) || email.includes(term) || siret.includes(term);
    });
  }, [clients, searchTerm]);

  React.useEffect(() => {
    if (isSuperAdminView) {
      setClients([]);
      setIsClientsLoading(false);
      return;
    }

    if (!db) return;

    if (!displayRole || managedCenterIds.length === 0) {
      setClients([]);
      setIsClientsLoading(false);
      return;
    }

    const centerFieldFilters = managedCenterIds
      .slice(0, 6)
      .flatMap((centerId) => {
        const legacyKey = legacyCenterKey(centerId);
        const filters = [
          where("centerId", "==", centerId),
          where("addressId", "==", centerId),
          where("domiciliationAddressId", "==", centerId),
        ];

        if (legacyKey) {
          filters.push(
            where("addressKey", "==", legacyKey),
            where("locationKey", "==", legacyKey)
          );
        }

        return filters;
      })
      .slice(0, 30);

    if (centerFieldFilters.length === 0) {
      setClients([]);
      setIsClientsLoading(false);
      return;
    }

    const querySnapshots = new Map<number, Client[]>();
    let receivedInitialSnapshots = 0;

    const publishMergedClients = () => {
      const byId = new Map<string, Client>();

      querySnapshots.forEach((clientsForQuery) => {
        clientsForQuery.forEach((client) => {
          byId.set(String((client as any).id), client);
        });
      });

      const clientsData = Array.from(byId.values()).filter((client) => {
        const accompanimentType = String((client as any).accompanimentType ?? "");
        return (
          (accompanimentType === "expert_creation" || accompanimentType === "expert_transfert") &&
          canAccessCenter(displayRole, managedCenterIds, resolveRecordCenterId(client as any))
        );
      });

      setClients(clientsData);
      setIsClientsLoading(false);
    };

    const unsubscribers = centerFieldFilters.map((filterConstraint, index) =>
      onSnapshot(
        query(collection(db, "clients"), filterConstraint),
        (snapshot) => {
          querySnapshots.set(
            index,
            snapshot.docs.map((d) => ({ ...(d.data() as any), id: d.id } as Client))
          );

          receivedInitialSnapshots = Math.min(
            centerFieldFilters.length,
            Math.max(receivedInitialSnapshots, querySnapshots.size)
          );

          if (receivedInitialSnapshots >= centerFieldFilters.length) {
            publishMergedClients();
          }
        },
        (err) => {
        console.error(err);
        setClients([]);
        setIsClientsLoading(false);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger la liste des clients.",
        });
      }
      )
    );

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [db, toast, isSuperAdminView, displayRole, managedCenterIds]);

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);

    const addressId = resolveClientAddressId(client);
    const clientAddress = allAddresses.find((a) => a.id === addressId);

    const projectType = resolveClientProjectType(client);

    form.reset({
      projectType,
      companyName: displayClientName(client),
      companyAddress: clientAddress
        ? `${clientAddress.street}, ${clientAddress.zip} ${clientAddress.city}`
        : "",
      legalRepresentativeName: resolveClientRepresentative(client),
      legalRepresentativeEmail: normalizeClientEmail(client),
      registrationDate: new Date().toISOString().split("T")[0],
      oldCompanyAddress: resolveClientOldAddress(client),
      siret: resolveClientSiret(client),
      addressId: addressId || "",
      legalStatus: ((client as any).legalStatus || "").toString(),
      capitalSocial: (((client as any).capitalSocial || (client as any).capital || "") as string).toString(),
      activityDescription: (((client as any).activityDescription || (client as any).activity || "") as string).toString(),
    });

    setIsSelectorOpen(false);
    setGeneratedDocs(null);
  };

  const onSubmit = async (values: DocumentFormValues) => {
    setIsGenerating(true);
    setGeneratedDocs(null);

    try {
      if (!firebaseApp) throw new Error("Firebase Functions not initialized");

      const functions = getFunctions(firebaseApp, "europe-west9");

      const generateDocumentsFunction = httpsCallable(
        functions,
        "generateDocumentsFromData"
      );

      const result = await generateDocumentsFunction(values);
      setGeneratedDocs(result.data as GenerateDocumentsFromDataOutput);

      toast({
        title: "Génération réussie",
        description: "Les documents de formalité ont été préparés pour ce client accompagné.",
      });
    } catch (error) {
      console.error("Document generation failed:", error);
      toast({
        variant: "destructive",
        title: "Erreur de génération",
        description: "Le générateur n'a pas pu finaliser la rédaction. Vérifiez les champs.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = (text: string | undefined) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié !",
      description: "Le texte est dans votre presse-papiers.",
    });
  };

  const projectType = form.watch("projectType");
  const documentsToRender = React.useMemo<GeneratedFormaliteDocument[]>(() => {
    if (!generatedDocs) return [];

    if (Array.isArray(generatedDocs.documents) && generatedDocs.documents.length > 0) {
      return generatedDocs.documents.filter((doc): doc is GeneratedFormaliteDocument =>
        Boolean(doc?.id && doc?.title && doc?.content)
      );
    }

    const fallbackDocs: GeneratedFormaliteDocument[] = [];

    if (projectType === "creation" && generatedDocs.statutsProjet) {
      fallbackDocs.push({
        id: "statuts-constitutifs",
        title: "Projet de statuts",
        category: "creation",
        required: true,
        content: generatedDocs.statutsProjet,
      });
    }

    if (projectType === "transfert") {
      if (generatedDocs.decisionAGE) {
        fallbackDocs.push({
          id: "decision-transfert-siege",
          title: "Décision de transfert",
          category: "transfert",
          required: true,
          content: generatedDocs.decisionAGE,
        });
      }
      if (generatedDocs.statutsMisAJour) {
        fallbackDocs.push({
          id: "statuts-mis-a-jour",
          title: "Statuts mis à jour",
          category: "transfert",
          required: true,
          content: generatedDocs.statutsMisAJour,
        });
      }
    }

    if (generatedDocs.attestationDomiciliation) {
      fallbackDocs.push({
        id: "attestation-domiciliation",
        title: "Attestation de domiciliation",
        category: "commun",
        required: true,
        content: generatedDocs.attestationDomiciliation,
      });
    }

    if (generatedDocs.checklistFormalite) {
      fallbackDocs.push({
        id: "checklist-formalite",
        title: "Checklist de dépôt",
        category: "checklist",
        required: true,
        content: generatedDocs.checklistFormalite,
      });
    }

    return fallbackDocs;
  }, [generatedDocs, projectType]);

  const buildProfessionalPdf = React.useCallback((
    docs: GeneratedFormaliteDocument[],
    options: { bundle: boolean }
  ) => {
    const values = form.getValues();
    const address =
      allAddresses.find((a) => a.id === values.addressId) ?? {
        id: values.addressId || "centre",
        name: "Centre de domiciliation",
        street: values.companyAddress,
        city: "",
        zip: "",
        country: "France",
        companyName: "CCS DOM",
        companyType: "Centre de domiciliation",
        companyCapital: "",
        companyRcs: "",
        companyApproval: "",
        companyRepresentative: "",
      };

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const marginX = 18;
    const contentWidth = pageWidth - marginX * 2;
    const bodyTop = 46;
    const bodyBottom = pageHeight - 26;
    const operationLabel = values.projectType === "transfert" ? "Transfert de siège" : "Création de société";
    const brandInitials =
      address.id === "paris_12e" ? "BPC" : address.id === "orly_ville" ? "CCS" : "CCS";
    const primary = address.id === "paris_12e"
      ? { r: 22, g: 33, b: 62 }
      : { r: 0, g: 91, b: 108 };
    const accent = { r: 190, g: 143, b: 64 };
    const muted = { r: 100, g: 116, b: 139 };

    const setFill = (color: { r: number; g: number; b: number }) =>
      pdf.setFillColor(color.r, color.g, color.b);
    const setText = (color: { r: number; g: number; b: number }) =>
      pdf.setTextColor(color.r, color.g, color.b);
    const setDraw = (color: { r: number; g: number; b: number }) =>
      pdf.setDrawColor(color.r, color.g, color.b);

    const centerLine = [address.street, [address.zip, address.city].filter(Boolean).join(" ")]
      .filter(Boolean)
      .join(", ");

    const drawBrandMark = (x: number, y: number, size: number) => {
      setFill(primary);
      pdf.roundedRect(x, y, size, size, 2.5, 2.5, "F");
      setText({ r: 255, g: 255, b: 255 });
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(size > 18 ? 16 : 10);
      pdf.text(brandInitials, x + size / 2, y + size / 2 + (size > 18 ? 2 : 1.5), {
        align: "center",
      });
    };

    const drawPageHeader = (title: string, section?: string) => {
      setFill({ r: 248, g: 250, b: 252 });
      pdf.rect(0, 0, pageWidth, 34, "F");
      setFill(primary);
      pdf.rect(0, 0, pageWidth, 3.5, "F");
      drawBrandMark(marginX, 11, 15);

      setText({ r: 15, g: 23, b: 42 });
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text(address.companyName, marginX + 20, 15);

      setText(muted);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
      pdf.text(centerLine || "Adresse du centre à compléter", marginX + 20, 20);
      pdf.text(address.companyApproval || "Agrément à compléter", marginX + 20, 25);

      setText(primary);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.text(section || operationLabel, pageWidth - marginX, 15, { align: "right" });
      setText({ r: 15, g: 23, b: 42 });
      pdf.setFontSize(9);
      pdf.text(title.slice(0, 52), pageWidth - marginX, 22, { align: "right" });

      setDraw({ r: 226, g: 232, b: 240 });
      pdf.setLineWidth(0.2);
      pdf.line(marginX, 34, pageWidth - marginX, 34);
    };

    const drawCover = () => {
      setFill({ r: 248, g: 250, b: 252 });
      pdf.rect(0, 0, pageWidth, pageHeight, "F");
      setFill(primary);
      pdf.rect(0, 0, 20, pageHeight, "F");
      setFill(accent);
      pdf.rect(20, 0, 2, pageHeight, "F");
      drawBrandMark(35, 32, 24);

      setText(primary);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text(address.companyName, 64, 40);
      setText(muted);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.text(centerLine || "Adresse du centre à compléter", 64, 46);
      pdf.text(address.companyApproval || "Agrément à compléter", 64, 51);

      setText({ r: 15, g: 23, b: 42 });
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(31);
      pdf.text("LIASSE", 35, 92);
      pdf.text("DE FORMALITÉS", 35, 106);

      setText(accent);
      pdf.setFontSize(12);
      pdf.text(operationLabel.toUpperCase(), 35, 120);

      setFill({ r: 255, g: 255, b: 255 });
      pdf.roundedRect(35, 138, 142, 56, 4, 4, "F");
      setDraw({ r: 226, g: 232, b: 240 });
      pdf.roundedRect(35, 138, 142, 56, 4, 4, "S");

      setText(muted);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7.5);
      pdf.text("SOCIÉTÉ", 45, 152);
      pdf.text("REPRÉSENTANT", 45, 166);
      pdf.text("DATE", 45, 180);

      setText({ r: 15, g: 23, b: 42 });
      pdf.setFontSize(10);
      pdf.text(pdfText(values.companyName), 78, 152, { maxWidth: 90 });
      pdf.text(pdfText(values.legalRepresentativeName), 78, 166, { maxWidth: 90 });
      pdf.text(pdfText(values.registrationDate), 78, 180);

      setFill({ r: 241, g: 245, b: 249 });
      pdf.roundedRect(35, 208, 142, 28, 3, 3, "F");
      setText({ r: 51, g: 65, b: 85 });
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      pdf.text(
        `Ce dossier contient ${docs.length} document${docs.length > 1 ? "s" : ""} de travail à relire, compléter et valider avant signature, publication ou dépôt officiel.`,
        44,
        219,
        { maxWidth: 124 }
      );
    };

    const drawToc = (entries: Array<{ title: string; page: number; required: boolean }>) => {
      drawPageHeader("Sommaire de la liasse", "Liasse complète");
      let y = bodyTop;

      setText({ r: 15, g: 23, b: 42 });
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(19);
      pdf.text("Sommaire", marginX, y);
      y += 12;

      entries.forEach((entry, index) => {
        setFill(entry.required ? { r: 236, g: 253, b: 245 } : { r: 248, g: 250, b: 252 });
        pdf.roundedRect(marginX, y - 5, contentWidth, 10, 2, 2, "F");
        setText(primary);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8.5);
        pdf.text(String(index + 1).padStart(2, "0"), marginX + 4, y + 1.5);

        setText({ r: 15, g: 23, b: 42 });
        pdf.setFontSize(9);
        pdf.text(entry.title, marginX + 18, y + 1.5, { maxWidth: 112 });

        setText(muted);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8);
        pdf.text(entry.required ? "Obligatoire" : "À vérifier", pageWidth - marginX - 26, y + 1.5);
        pdf.text(String(entry.page), pageWidth - marginX, y + 1.5, { align: "right" });
        y += 13;
      });
    };

    const writeDocument = (formalDoc: GeneratedFormaliteDocument, index: number, addNewPage: boolean) => {
      if (addNewPage) pdf.addPage();
      const startPage = pdf.getNumberOfPages();
      drawPageHeader(formalDoc.title, `Document ${index + 1}`);

      let y = bodyTop;
      setText(primary);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.text(formalDoc.title.toUpperCase(), marginX, y, { maxWidth: contentWidth });
      y += 8;

      setText(muted);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7.5);
      pdf.text(formalDoc.required ? "DOCUMENT OBLIGATOIRE" : "DOCUMENT À VÉRIFIER SELON LE DOSSIER", marginX, y);
      y += 9;

      const contentLines = formalDoc.content.split("\n");
      const ensureSpace = (needed: number) => {
        if (y + needed <= bodyBottom) return;
        pdf.addPage();
        drawPageHeader(formalDoc.title, `Document ${index + 1}`);
        y = bodyTop;
      };

      contentLines.forEach((rawLine) => {
        const line = rawLine.trimEnd();
        if (!line.trim()) {
          y += 3.5;
          return;
        }

        const isChecklist = line.trim().startsWith("[ ]");
        const isBullet = line.trim().startsWith("- ");
        const isSection =
          /^[A-ZÀ-Ÿ0-9\s'’/-]{8,}$/.test(line.trim()) ||
          /:$/.test(line.trim());
        const indent = isChecklist || isBullet ? 5 : 0;
        const maxWidth = contentWidth - indent;
        const wrapped = pdf.splitTextToSize(line, maxWidth) as string[];
        const lineHeight = isSection ? 5.2 : 4.7;

        ensureSpace(wrapped.length * lineHeight + 2);

        if (isSection) {
          y += 2;
          setText(primary);
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(9.2);
        } else {
          setText({ r: 30, g: 41, b: 59 });
          pdf.setFont("helvetica", isChecklist ? "bold" : "normal");
          pdf.setFontSize(9);
        }

        if (isChecklist) {
          setDraw(primary);
          pdf.rect(marginX, y - 3.2, 3, 3, "S");
          pdf.text(wrapped, marginX + indent, y);
        } else {
          pdf.text(wrapped, marginX + indent, y);
        }

        y += wrapped.length * lineHeight + (isSection ? 1.5 : 0.5);
      });

      return startPage;
    };

    const tocEntries: Array<{ title: string; page: number; required: boolean }> = [];

    if (options.bundle) {
      drawCover();
      pdf.addPage();
      const tocPage = pdf.getNumberOfPages();

      docs.forEach((formalDoc, index) => {
        const page = writeDocument(formalDoc, index, true);
        tocEntries.push({ title: formalDoc.title, page, required: formalDoc.required });
      });

      pdf.setPage(tocPage);
      drawToc(tocEntries);
    } else {
      writeDocument(docs[0], 0, false);
    }

    const totalPages = pdf.getNumberOfPages();
    for (let page = 1; page <= totalPages; page++) {
      pdf.setPage(page);
      setDraw({ r: 226, g: 232, b: 240 });
      pdf.setLineWidth(0.2);
      pdf.line(marginX, pageHeight - 18, pageWidth - marginX, pageHeight - 18);

      setText(muted);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.text(`${address.companyName} - ${address.companyRcs || "RCS à compléter"}`, marginX, pageHeight - 11);
      pdf.text(`Page ${page} / ${totalPages}`, pageWidth - marginX, pageHeight - 11, { align: "right" });
    }

    return pdf;
  }, [form]);

  const handleDownloadPdf = (formalDoc: GeneratedFormaliteDocument) => {
    try {
      toast({ title: "PDF en cours...", description: "Préparation du document professionnel." });
      const pdf = buildProfessionalPdf([formalDoc], { bundle: false });
      pdf.save(`${formatPdfFileName(formalDoc.title)}.pdf`);
    } catch (error) {
      console.error("PDF export failed:", error);
      toast({
        variant: "destructive",
        title: "Export impossible",
        description: "Le PDF n'a pas pu être généré. Vérifiez les informations du dossier.",
      });
    }
  };

  const handleDownloadBundlePdf = () => {
    if (documentsToRender.length === 0) {
      toast({
        variant: "destructive",
        title: "Aucune liasse",
        description: "Générez d'abord les documents de formalité.",
      });
      return;
    }

    try {
      toast({ title: "Liasse en cours...", description: "Assemblage du PDF complet avec sommaire." });
      const pdf = buildProfessionalPdf(documentsToRender, { bundle: true });
      const company = formatPdfFileName(form.getValues("companyName"));
      pdf.save(`liasse-formalite-${company}.pdf`);
    } catch (error) {
      console.error("Bundle PDF export failed:", error);
      toast({
        variant: "destructive",
        title: "Export impossible",
        description: "La liasse complète n'a pas pu être générée.",
      });
    }
  };

  const handleSaveBundleToClient = async () => {
    if (!selectedClient) {
      toast({
        variant: "destructive",
        title: "Client requis",
        description: "Sélectionnez un client accompagné avant d'enregistrer la liasse.",
      });
      return;
    }

    if (!db || !storage) {
      toast({
        variant: "destructive",
        title: "Service indisponible",
        description: "Firestore ou Storage n'est pas initialisé.",
      });
      return;
    }

    if (documentsToRender.length === 0) {
      toast({
        variant: "destructive",
        title: "Aucune liasse",
        description: "Générez d'abord les documents de formalité.",
      });
      return;
    }

    setIsSavingBundle(true);

    try {
      const values = form.getValues();
      const clientDocId = (selectedClient as any).id;
      const clientUid = (
        (selectedClient as any).uid ||
        (selectedClient as any).ownerUid ||
        clientDocId
      )?.toString();

      if (!clientDocId || !clientUid) {
        throw new Error("Identifiant client introuvable.");
      }

      const pdf = buildProfessionalPdf(documentsToRender, { bundle: true });
      const blob = pdf.output("blob");
      const bundleId = `${Date.now()}`;
      const company = formatPdfFileName(values.companyName);
      const centerKey = centerKeyForStorage(values.addressId);
      const filePath = `formalites/${centerKey}/${clientUid}/${bundleId}-liasse-formalite-${company}.pdf`;
      const fileRef = storageRef(storage, filePath);

      toast({
        title: "Enregistrement en cours...",
        description: "La liasse PDF est envoyée dans le dossier client.",
      });

      await uploadBytes(fileRef, blob, {
        contentType: "application/pdf",
        customMetadata: {
          clientDocId,
          clientUid,
          projectType: values.projectType,
          documentCount: String(documentsToRender.length),
        },
      });

      const outputUrl = await getDownloadURL(fileRef);
      const bundleMeta = {
        id: bundleId,
        status: "complete",
        path: filePath,
        outputUrl,
        fileName: `${bundleId}-liasse-formalite-${company}.pdf`,
        contentType: "application/pdf",
        size: blob.size,
        projectType: values.projectType,
        documentCount: documentsToRender.length,
        generatedAt: serverTimestamp(),
      };

      const documentsPatch = {
        "documents.formalitiesBundle": filePath,
        "documentsMeta.formalitiesBundle": {
          contentType: "application/pdf",
          size: blob.size,
          type: "formalitiesBundle",
          uploadedAt: serverTimestamp(),
          validated: true,
        },
        "formalities.latestBundle": bundleMeta,
        [`formalities.bundles.${bundleId}`]: bundleMeta,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(firestoreDoc(db, "clients", clientDocId), documentsPatch);

      const requestRef = firestoreDoc(db, "client_requests", clientUid);
      const requestSnap = await getDoc(requestRef);
      if (requestSnap.exists()) {
        await updateDoc(requestRef, documentsPatch);
      }

      toast({
        title: "Liasse enregistrée",
        description: "Le PDF complet est maintenant disponible dans le dossier client.",
      });
    } catch (error: any) {
      console.error("Bundle save failed:", error);
      toast({
        variant: "destructive",
        title: "Enregistrement impossible",
        description: error?.message || "La liasse n'a pas pu être enregistrée.",
      });
    } finally {
      setIsSavingBundle(false);
    }
  };

  const renderDocumentCard = (formalDoc: GeneratedFormaliteDocument) => {
    if (!formalDoc.content) return null;

    return (
      <motion.div variants={itemVariants} className="h-full">
        <Card className="group relative flex h-full flex-col overflow-hidden rounded-3xl border-slate-200 bg-white shadow-sm">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 group-hover:bg-primary transition-colors" />
          
          <CardHeader className="border-b border-slate-100 bg-white p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
               <div className="flex min-w-0 items-start gap-3">
                  <div className="rounded-xl bg-primary/10 p-2 transition-all group-hover:scale-105">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                <div className="min-w-0 space-y-2">
                  <CardTitle className="line-clamp-2 text-base font-black tracking-tight text-slate-950 sm:text-lg">{formalDoc.title}</CardTitle>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "border text-[9px] font-black tracking-widest uppercase",
                        DOCUMENT_CATEGORY_BADGES[formalDoc.category]
                      )}
                    >
                      {DOCUMENT_CATEGORY_LABELS[formalDoc.category]}
                    </Badge>
                    <Badge className="border-primary/20 bg-primary/10 text-[9px] font-black uppercase tracking-widest text-primary">
                      {formalDoc.required ? "Obligatoire" : "A verifier"}
                    </Badge>
                  </div>
                </div>
               </div>
               <Badge className="hidden">
                 {formalDoc.required ? "Obligatoire" : "À vérifier"}
               </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="relative flex-grow bg-slate-50 p-0">
            <ScrollArea className="h-[320px] w-full sm:h-[380px]">
              <div
                id={`doc-${formalDoc.id}`}
                className="p-5 text-[11px] font-medium leading-relaxed text-slate-700 selection:bg-primary/20 sm:p-8"
              >
                <pre className="whitespace-pre-wrap font-sans bg-transparent p-0 m-0">
                  {formalDoc.content}
                </pre>
              </div>
            </ScrollArea>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-slate-50 to-transparent" />
          </CardContent>
          
          <CardFooter className="flex flex-col gap-3 border-t border-slate-100 bg-white p-4 sm:flex-row sm:p-5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopyToClipboard(formalDoc.content || undefined)}
              className="h-11 w-full flex-1 rounded-xl border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-50"
            >
              <Clipboard className="mr-2 h-3.5 w-3.5" /> Copier
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownloadPdf(formalDoc)}
              className="h-11 w-full flex-1 rounded-xl border-primary/20 bg-primary/5 text-[10px] font-black uppercase tracking-widest text-primary transition-all hover:bg-primary hover:text-white"
            >
              <Download className="mr-2 h-3.5 w-3.5" /> Exporter PDF
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    );
  };

  if (isSuperAdminView) {
    return (
      <OperationalAccessNotice
        title="Outils documentaires reserves aux centres"
        description="La generation de documents client est une action operationnelle. Le super admin supervise les centres, leurs indicateurs, leurs quotas et leur facturation, sans intervenir sur les dossiers clients sauf en prise de role de test."
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-3 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-3 text-slate-950 sm:px-4 md:px-6 md:py-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5 sm:space-y-6">
        
        {/* Elite Header */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="mb-3 flex items-center gap-2 text-primary">
            <Layers className="h-4 w-4" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Suite documentaire</span>
          </div>
          <h1 className="mb-3 text-2xl font-black leading-tight tracking-tight text-slate-950 sm:text-3xl">
            Générateur de formalités
          </h1>
          <p className="max-w-3xl text-sm font-medium leading-6 text-slate-600">
            Générez les documents liés à la création ou au transfert de société pour les clients accompagnés.
          </p>
        </motion.div>

        <motion.div
           variants={containerVariants}
           initial="hidden"
           animate="visible"
           className="space-y-5 sm:space-y-6"
        >
          <Card className="relative overflow-hidden rounded-3xl border-slate-200 bg-white shadow-sm">
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
               <Building2 className="h-64 w-64 rotate-12" />
            </div>

            <CardHeader className="border-b border-slate-100 bg-white p-4 sm:p-5 md:p-6">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl border border-primary/10 bg-primary/10 p-3">
                    <UserCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">Client accompagné</CardTitle>
                    <CardDescription className="flex items-center gap-2 text-sm font-medium text-slate-600">
                      <Info className="h-3.5 w-3.5" /> Sélectionnez un client accompagné pour préremplir la formalité.
                    </CardDescription>
                  </div>
                </div>

                <div className="w-full lg:w-[400px]">
                  <Dialog open={isSelectorOpen} onOpenChange={setIsSelectorOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="group h-12 w-full justify-between rounded-2xl border-slate-200 bg-white shadow-sm transition-all hover:border-primary/40 active:scale-[0.98] sm:h-14"
                        disabled={isClientsLoading}
                      >
                        <div className="flex items-center gap-3">
                          <Search className="h-4 w-4 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
                          <span className="font-black text-[10px] uppercase tracking-widest text-left truncate max-w-[200px]">
                            {isClientsLoading ? "Synchronisation..." : selectedClient ? displayClientName(selectedClient) : "Sélectionner un client accompagné..."}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                           <Separator orientation="vertical" className="h-4 bg-slate-200" />
                           <ChevronsUpDown className="h-4 w-4" />
                        </div>
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="max-h-[92vh] max-w-xl overflow-hidden border-slate-200 bg-white p-0 text-slate-950 shadow-2xl">
                      <DialogHeader className="border-b border-slate-200 bg-slate-50 p-5 sm:p-6">
                        <DialogTitle className="flex items-center gap-3 text-xl font-black tracking-tight text-slate-950">
                           <div className="p-2 bg-primary/10 rounded-lg">
                              <Building2 className="h-5 w-5 text-primary" />
                           </div>
                           Clients accompagnés
                        </DialogTitle>
                      </DialogHeader>

                      <div className="border-b border-slate-100 bg-white p-4 sm:p-5">
                        <div className="relative group">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40 group-focus-within:text-primary transition-colors" />
                          <Input
                            placeholder="Rechercher par nom, e-mail, SIRET..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 h-14 bg-slate-50 border-slate-200 text-slate-950 focus:border-primary/40 rounded-2xl font-bold uppercase text-[10px] tracking-widest placeholder:text-slate-400"
                          />
                        </div>
                      </div>

                      <ScrollArea className="h-[55vh] bg-white sm:h-[450px]">
                        <div className="p-4 space-y-2">
                          {isClientsLoading ? (
                            <div className="p-20 flex flex-col items-center gap-4 text-slate-500">
                               <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                               <span className="font-black text-[10px] uppercase tracking-widest">Indexation en cours...</span>
                            </div>
                          ) : filteredClients.length > 0 ? (
                            filteredClients.map((client, idx) => {
                              const pt = resolveClientProjectType(client);
                              return (
                                <motion.div
                                  key={(client as any).id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.05 }}
                                >
                                  <Button
                                    variant="ghost"
                                    className="w-full justify-start h-20 rounded-2xl text-slate-900 hover:bg-primary/10 hover:text-primary group transition-all p-6 relative overflow-hidden border border-transparent hover:border-primary/20"
                                    onClick={() => handleClientSelect(client)}
                                  >
                                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <ArrowRight className="h-4 w-4" />
                                    </div>
                                    <div className="flex items-center justify-between w-full">
                                      <div className="text-left space-y-0.5">
                                        <p className="font-black text-sm uppercase tracking-tight group-hover:translate-x-1 transition-transform">{displayClientName(client)}</p>
                                        <div className="flex items-center gap-3">
                                           <div className="flex items-center gap-1 opacity-40 font-bold text-[9px] uppercase tracking-wide">
                                              <Mail className="h-3 w-3" /> {normalizeClientEmail(client)}
                                           </div>
                                        </div>
                                      </div>
                                      <Badge className={cn(
                                        "text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border-none shadow-sm",
                                        pt === "creation" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
                                      )}>
                                        {pt === "creation" ? "Création" : "Transfert"}
                                      </Badge>
                                    </div>
                                  </Button>
                                </motion.div>
                              );
                            })
                          ) : (
                            <div className="p-24 text-center space-y-4">
                               <Search className="h-10 w-10 mx-auto text-slate-200" />
                               <p className="text-slate-400 font-black text-xs italic uppercase tracking-[0.3em]">Aucun dossier trouvé</p>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 md:p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                    
                    {/* Section: Identité */}
                    <motion.div variants={itemVariants} className="group relative space-y-5 rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-inner transition-all hover:border-primary/20 sm:p-5">
                      <div className="flex items-center gap-3 border-l-4 border-primary pl-5">
                         <div className="p-1.5 bg-primary/20 rounded-lg">
                            <Building2 className="h-4 w-4 text-primary" />
                         </div>
                         <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">Entité principale</span>
                      </div>
                      
                      <div className="space-y-6">
                        <FormField
                          control={form.control}
                          name="companyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                                <span className="w-1 h-1 bg-primary rounded-full" /> Dénomination Sociale
                              </FormLabel>
                              <FormControl>
                                <Input {...field} className="h-11 rounded-xl border-slate-200 bg-white font-bold text-slate-950 focus:border-primary/50 sm:h-12" />
                              </FormControl>
                              <FormMessage className="text-[9px] font-bold text-red-600" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="addressId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                                <span className="h-1 w-1 rounded-full bg-slate-300" /> Identifiant de destination
                              </FormLabel>
                              <FormControl>
                                <Input {...field} disabled className="h-11 cursor-not-allowed rounded-xl border-slate-200 bg-slate-100 font-bold italic text-primary/70 opacity-80 sm:h-12" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </motion.div>

                    {/* Section: Formalite */}
                    <motion.div variants={itemVariants} className="group relative space-y-5 rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-inner transition-all hover:border-amber-500/20 sm:p-5">
                      <div className="flex items-center gap-3 border-l-4 border-amber-500 pl-5">
                         <div className="p-1.5 bg-amber-500/20 rounded-lg">
                            <ShieldCheck className="h-4 w-4 text-amber-500" />
                         </div>
                         <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-400">Paramètres juridiques</span>
                      </div>

                      <div className="space-y-6">
                        <FormField
                          control={form.control}
                          name="legalStatus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                                <span className="w-1 h-1 bg-amber-500 rounded-full" /> Forme juridique
                              </FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="SAS, SASU, SARL..." className="h-11 rounded-xl border-slate-200 bg-white font-bold sm:h-12" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="capitalSocial"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                                <span className="w-1 h-1 bg-amber-500 rounded-full" /> Capital social
                              </FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="1 000 EUR" className="h-11 rounded-xl border-slate-200 bg-white font-bold sm:h-12" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="activityDescription"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                                <span className="w-1 h-1 bg-amber-500 rounded-full" /> Activité
                              </FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Activité principale de la société" className="h-11 rounded-xl border-slate-200 bg-white font-bold sm:h-12" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </motion.div>

                    {/* Section: Localisation */}
                    <motion.div variants={itemVariants} className="group relative space-y-5 rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-inner transition-all hover:border-indigo-500/20 sm:p-5">
                      <div className="flex items-center gap-3 border-l-4 border-indigo-500 pl-5">
                         <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                            <Calendar className="h-4 w-4 text-indigo-500" />
                         </div>
                         <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400">Date et localisation</span>
                      </div>

                      <div className="space-y-6">
                        <FormField
                          control={form.control}
                          name="companyAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                                <span className="w-1 h-1 bg-indigo-500 rounded-full" /> Adresse du Siège
                              </FormLabel>
                              <FormControl>
                                <Input {...field} className="h-11 rounded-xl border-slate-200 bg-white font-bold sm:h-12" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="registrationDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                                <span className="w-1 h-1 bg-indigo-500 rounded-full" /> Date de Signature
                              </FormLabel>
                              <FormControl>
                                <Input type="date" {...field} className="h-11 rounded-xl border-slate-200 bg-white font-bold sm:h-12" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </motion.div>

                    {/* Section: Représentant */}
                    <motion.div variants={itemVariants} className="group relative space-y-5 rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-inner transition-all hover:border-emerald-500/20 sm:p-5">
                      <div className="flex items-center gap-3 border-l-4 border-emerald-500 pl-5">
                         <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                            <UserCheck className="h-4 w-4 text-emerald-500" />
                         </div>
                         <span className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">Représentant légal</span>
                      </div>

                      <div className="space-y-6">
                        <FormField
                          control={form.control}
                          name="legalRepresentativeName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                                <span className="w-1 h-1 bg-emerald-500 rounded-full" /> Nom du Représentant
                              </FormLabel>
                              <FormControl>
                                <Input {...field} className="h-11 rounded-xl border-slate-200 bg-white font-bold sm:h-12" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="legalRepresentativeEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                                <span className="w-1 h-1 bg-emerald-500 rounded-full" /> E-mail de Contact
                              </FormLabel>
                              <FormControl>
                                <Input type="email" {...field} className="h-11 rounded-xl border-slate-200 bg-white font-bold sm:h-12" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </motion.div>
                  </div>

                  {/* Supplemental for Transfert */}
                  <AnimatePresence>
                    {projectType === "transfert" && (
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="group relative overflow-hidden rounded-3xl border border-orange-200 bg-orange-50 p-4 shadow-sm sm:p-5 md:p-6"
                      >
                         <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                            <ShieldCheck className="h-32 w-32" />
                         </div>
                         <div className="mb-5 flex items-center gap-3 border-l-4 border-orange-500 pl-5">
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-orange-400">Données du transfert</span>
                         </div>
                         <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            <FormField
                              control={form.control}
                              name="oldCompanyAddress"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-40">Ancienne Adresse de Siège</FormLabel>
                                  <FormControl>
                                    <Input {...field} className="h-11 rounded-xl border-slate-200 bg-white font-bold sm:h-12" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="siret"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-40">SIRET Actuel</FormLabel>
                                  <FormControl>
                                    <Input {...field} className="h-11 rounded-xl border-slate-200 bg-white font-mono text-xs font-black tracking-[0.2em] sm:h-12" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex justify-center pt-2 sm:pt-4">
                    <Button 
                      type="submit" 
                      disabled={isGenerating}
                      className="group relative h-14 w-full overflow-hidden rounded-2xl bg-primary px-6 text-white shadow-sm shadow-primary/20 transition-all hover:bg-primary/95 active:scale-95 sm:w-auto sm:px-10"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      {isGenerating ? (
                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      ) : (
                        <Sparkles className="mr-3 h-5 w-5 transition-transform group-hover:rotate-12" />
                      )}
                      <span className="text-sm font-black uppercase tracking-wider">Générer les documents</span>
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* RESULTS AREA */}
          <AnimatePresence mode="wait">
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="relative overflow-hidden rounded-3xl border border-primary/20 bg-white py-16 text-center shadow-sm"
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
                <div className="relative z-10 space-y-8">
                   <div className="relative inline-flex items-center justify-center rounded-full bg-primary/10 p-6 shadow-sm">
                      <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-ping" />
                      <Loader2 className="h-16 w-16 animate-spin text-primary" />
                   </div>
                   <div className="space-y-3">
                      <h3 className="text-2xl font-black tracking-tight text-slate-950">Génération documentaire</h3>
                      <p className="mx-auto max-w-lg px-6 text-[10px] font-bold uppercase leading-relaxed tracking-widest text-slate-500">
                        Analyse de la formalité, reprise des informations client et génération des documents pour <span className="text-slate-950">{form.getValues("companyName")}</span>.
                      </p>
                   </div>
                </div>
              </motion.div>
            )}

            {generatedDocs && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5 sm:space-y-6"
              >
                <div className="flex flex-col items-stretch gap-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 md:flex-row md:items-end md:justify-between">
                   <div className="text-center md:text-left">
                      <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                           <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                        </div>
                        <h2 className="text-2xl font-black tracking-tight text-slate-950">Documents de formalité prêts</h2>
                      </div>
                      <p className="ml-1 text-sm font-medium text-slate-600">Documents prêts pour export ou signature.</p>
                   </div>
                   <div className="flex flex-col sm:flex-row gap-3">
                     <Button
                       onClick={handleSaveBundleToClient}
                       disabled={isSavingBundle}
                       variant="outline"
                       className="h-12 rounded-2xl border-emerald-200 bg-white px-6 text-[10px] font-black uppercase tracking-widest text-emerald-700 hover:bg-emerald-50"
                     >
                       {isSavingBundle ? (
                         <Loader2 className="mr-3 h-4 w-4 animate-spin" />
                       ) : (
                         <ShieldCheck className="mr-3 h-4 w-4" />
                       )}
                       Enregistrer au dossier
                     </Button>
                     <Button
                       onClick={handleDownloadBundlePdf}
                       className="h-12 rounded-2xl bg-primary px-6 text-[10px] font-black uppercase tracking-widest text-white shadow-sm hover:bg-primary/90"
                     >
                       <Download className="mr-3 h-4 w-4" /> Télécharger la liasse PDF
                     </Button>
                     <Button
                       onClick={() => window.print()}
                       variant="outline"
                       className="h-12 rounded-2xl border-slate-200 bg-white px-6 text-[10px] font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50"
                     >
                       <Printer className="mr-3 h-4 w-4" /> Impression écran
                     </Button>
                   </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">
                  {documentsToRender.map((doc) => renderDocumentCard(doc))}
                </div>

                <div className="flex flex-col items-stretch justify-between gap-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 md:flex-row md:items-center">
                   <div className="flex items-center gap-6">
                      <div className="rounded-2xl bg-primary/10 p-4">
                         <Info className="h-8 w-8 text-primary/60" />
                      </div>
                      <div className="space-y-1">
                         <p className="text-sm font-black uppercase tracking-widest text-slate-950">Contrôle de Conformité</p>
                         <p className="max-w-md text-xs leading-relaxed text-slate-600">
                            Le générateur a utilisé les modèles CCS DOM. Veuillez vérifier les dates, le capital social et les pièces justificatives avant toute signature officielle.
                         </p>
                      </div>
                   </div>
                   <Button className="h-12 rounded-2xl border border-slate-200 bg-white px-6 text-[10px] font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50">
                      Signaler une anomalie
                   </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      
      {/* Footer Branding */}
      <div className="mt-10 flex justify-center py-8 opacity-60 transition-opacity hover:opacity-100">
        <div className="flex flex-col items-center gap-4">
           <Separator className="w-24 bg-primary/20" />
            <p className="text-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Infrastructure administrative CCS DOM</p>
        </div>
      </div>
    </div>
  );
}
