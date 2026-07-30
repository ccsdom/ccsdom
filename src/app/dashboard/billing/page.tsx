"use client";

import * as React from "react";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import {
  CreditCard,
  Download,
  FileText,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Ban
} from "lucide-react";

import { useDb, useAuth, useFunctions } from "@/firebase";
import { httpsCallable } from "firebase/functions";
import { useToast } from "@/hooks/use-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

type Invoice = {
  id: string;
  invoiceNumber: string;
  status: string;
  amountCents: number;
  currency: string;
  type: string;
  issuedAt?: Timestamp;
  paidAt?: Timestamp;
  pdf?: {
    status: string;
    fileUrl?: string;
    outputUrl?: string;
    url?: string;
    storagePath?: string;
    templateVersion?: string;
  };
};

type ClientData = {
  paymentStatus?: "pending" | "paid" | "failed";
  status?: "active" | "suspended" | "inactive" | string;
};

const INVOICE_PDF_TEMPLATE_VERSION = "invoice-flat-v4-branded-logo-2026-04-23";

function formatCurrency(cents: number, currency = "EUR") {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency,
  }).format(cents / 100);
}

function formatDate(value?: Timestamp) {
  if (!value) return "—";
  try {
    return value.toDate().toLocaleDateString("fr-FR");
  } catch {
    return "—";
  }
}

function normalizeClientStatus(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

function isClientActive(clientData: ClientData | null): boolean {
  const status = normalizeClientStatus(clientData?.status);
  const paymentStatus = normalizeClientStatus(clientData?.paymentStatus);

  return (
    status === "actif" ||
    status === "active" ||
    (paymentStatus === "paid" && !["inactive", "inactif", "suspended", "suspendu"].includes(status))
  );
}

function isClientSuspended(clientData: ClientData | null): boolean {
  const status = normalizeClientStatus(clientData?.status);
  const paymentStatus = normalizeClientStatus(clientData?.paymentStatus);
  return status === "suspended" || status === "suspendu" || paymentStatus === "failed";
}

function getInvoicePdfUrl(invoice: Invoice): string {
  return String(
    invoice.pdf?.outputUrl || invoice.pdf?.url || invoice.pdf?.fileUrl || ""
  ).trim();
}

function needsInvoicePdfRefresh(pdfUrl: string): boolean {
  if (!pdfUrl) return false;
  if (pdfUrl.startsWith("gs://")) return true;
  try {
    const parsedUrl = new URL(pdfUrl);
    if (parsedUrl.hostname.endsWith(".firebasestorage.app")) return true;
    if (parsedUrl.hostname === "firebasestorage.googleapis.com") {
      return !parsedUrl.searchParams.has("token");
    }
    return false;
  } catch {
    return pdfUrl.includes("firebasestorage.googleapis.com/v0/b/") && !pdfUrl.includes("token=");
  }
}

function extractFirebaseStoragePath(pdfUrl: string): string | null {
  try {
    const parsedUrl = new URL(pdfUrl);
    if (parsedUrl.hostname !== "firebasestorage.googleapis.com") return null;
    const match = parsedUrl.pathname.match(/^\/v0\/b\/[^/]+\/o\/(.+)$/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

function isInvoicePdfUrlAligned(invoice: Invoice, pdfUrl: string): boolean {
  const storagePath = String(invoice.pdf?.storagePath || "").trim();
  if (!storagePath) return true;
  return extractFirebaseStoragePath(pdfUrl) === storagePath;
}

function InvoiceDownloadButton({ invoice }: { invoice: Invoice }) {
  const functions = useFunctions();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = React.useState(false);
  const pdfUrl = getInvoicePdfUrl(invoice);
  const hasUsablePdfUrl =
    Boolean(pdfUrl) &&
    invoice.pdf?.templateVersion === INVOICE_PDF_TEMPLATE_VERSION &&
    !needsInvoicePdfRefresh(pdfUrl) &&
    isInvoicePdfUrlAligned(invoice, pdfUrl);

  const handleClick = async () => {
    if (hasUsablePdfUrl) {
      window.location.assign(pdfUrl);
      return;
    }

    if (!functions || !invoice.id) return;

    if (invoice.pdf?.status === "processing") {
      toast({
        title: "Generation en cours",
        description: "Votre facture est deja en cours de preparation.",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const requestInvoicePdf = httpsCallable(functions, "requestInvoicePdf");
      const response = await requestInvoicePdf({ invoiceId: invoice.id });
      const data = response.data as { url?: string | null };
      if (data.url) {
        window.location.assign(data.url);
        setIsGenerating(false);
        return;
      }
      toast({
        title: "Generation lancee",
        description: "La facture sera disponible dans quelques instants.",
      });
      setTimeout(() => setIsGenerating(false), 10000);
    } catch (error) {
      console.error("[InvoiceDownloadButton] requestInvoicePdf failed", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de lancer la generation de la facture.",
      });
      setIsGenerating(false);
    }
  };

  const isWorking = isGenerating || invoice.pdf?.status === "processing";

  return (
    <Button size="sm" variant="outline" onClick={handleClick} disabled={isWorking}>
      {isWorking ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      {hasUsablePdfUrl ? "Telecharger" : "Generer PDF"}
    </Button>
  );
}

export default function BillingPage() {
  const db = useDb();
  const auth = useAuth();
  const { toast } = useToast();

  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [clientData, setClientData] = React.useState<ClientData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isPortalLoading, setIsPortalLoading] = React.useState(false);
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

  React.useEffect(() => {
    let unsubInvoices: (() => void) | null = null;
    let unsubClient: (() => void) | null = null;

    async function boot() {
      if (!db || !auth?.currentUser) {
        setLoading(false);
        return;
      }
      const uid = auth.currentUser.uid;

      try {
        // 1. Listen to Client Data for Subscription status
        unsubClient = onSnapshot(doc(db, "clients", uid), (docSnap) => {
          if (docSnap.exists()) {
            setClientData(docSnap.data() as ClientData);
          }
        });

        // 2. Listen to Invoices
        const q = query(
          collection(db, "invoices"),
          where("clientId", "==", uid),
          orderBy("issuedAt", "desc")
        );

        unsubInvoices = onSnapshot(
          q,
          (snapshot) => {
            const next = snapshot.docs.map((d) => ({
              id: d.id,
              ...(d.data() as Omit<Invoice, "id">),
            }));
            setInvoices(next);
            setLoading(false);
          },
          (error) => {
            console.error("[BillingPage] Error loading invoices", error);
            toast({
              variant: "destructive",
              title: "Erreur",
              description: "Impossible de charger les factures.",
            });
            setLoading(false);
          }
        );
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }

    void boot();

    return () => {
      if (unsubInvoices) unsubInvoices();
      if (unsubClient) unsubClient();
    };
  }, [db, auth?.currentUser, toast]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isSuspended = isClientSuspended(clientData);
  const isFailed = normalizeClientStatus(clientData?.paymentStatus) === "failed";
  const isActive = isClientActive(clientData);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-3xl font-bold tracking-tight">Facturation</h1>

      {/* Subscription Alert */}
      {isSuspended || isFailed ? (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Abonnement suspendu ou en défaut de paiement
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <p className="text-destructive/80">
              Votre dernière tentative de paiement a échoué. Afin de rétablir vos services de domiciliation (réception et numérisation du courrier), veuillez régulariser votre situation.
            </p>
            <Button 
              onClick={handleOpenPortal} 
              disabled={isPortalLoading} 
              variant="destructive" 
              className="shrink-0 w-full md:w-auto gap-2"
            >
              {isPortalLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Mettre à jour ma carte & Payer
            </Button>
          </CardContent>
        </Card>
      ) : isActive ? (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle2 className="h-5 w-5" />
              Abonnement actif
            </CardTitle>
            <CardDescription className="text-green-700/80 dark:text-green-400/80">
              Votre abonnement et vos prélèvements sont en règle. Merci pour votre confiance !
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleOpenPortal}
              disabled={isPortalLoading}
              variant="outline" 
              size="sm" 
              className="gap-2"
            >
              {isPortalLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="h-4 w-4" />
              )}
              Gérer mes paiements sur Stripe
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground">
              <Ban className="h-5 w-5" />
              Abonnement inactif
            </CardTitle>
          </CardHeader>
        </Card>
      )}

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Historique des factures</CardTitle>
              <CardDescription>
                Consultez et téléchargez vos factures d'acquisition et vos factures mensuelles.
              </CardDescription>
            </div>
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-primary hover:text-primary hover:bg-primary/5 gap-2"
              onClick={handleOpenPortal}
              disabled={isPortalLoading}
            >
              {isPortalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
              Historique complet sur Stripe
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground border border-dashed rounded-lg">
              <FileText className="mb-2 h-10 w-10 text-muted-foreground/50" />
              <p>Aucune facture disponible pour le moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <div className="p-2 bg-primary/10 text-primary rounded-full">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        {inv.invoiceNumber || "Facture en cours..."}
                        {inv.status === "paid" && (
                          <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">Payée</Badge>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {inv.type === "registration" ? "Création / Souscription" : "Abonnement mensuel"} • {formatDate(inv.issuedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center w-full md:w-auto justify-between md:justify-end gap-6">
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(inv.amountCents, inv.currency)}</p>
                    </div>

                    <InvoiceDownloadButton invoice={inv} />
                    {inv.pdf?.status === "complete" && getInvoicePdfUrl(inv) ? (
                      <Button asChild size="sm" variant="outline" className="hidden">
                        <a href={getInvoicePdfUrl(inv)} target="_blank" rel="noreferrer">
                          <Download className="mr-2 h-4 w-4" />
                          Télécharger
                        </a>
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" disabled className="hidden">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Génération...
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
