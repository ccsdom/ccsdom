"use client";

import * as React from "react";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  type Query,
  type DocumentData,
} from "firebase/firestore";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import { getStorageRelativePath } from "@/firebase/storage-utils";
import {
  BadgeCheck,
  Building2,
  ExternalLink,
  FileText,
  Loader2,
  Search,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import { useAuth, useDb, useFirebase } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRole } from "@/hooks/use-simulated-role";
import { UserRole, STAFF_ROLES } from "@/lib/constants/roles";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// type Role moved to src/lib/constants/roles.ts

type DocType =
  | "kbis"
  | "identityCard"
  | "proofOfAddress"
  | "contract"
  | "attestation"
  | "formalitiesBundle";

type RequestLike = {
  id: string;
  ownerUid?: string;
  uid?: string;
  companyName?: string;
  name?: string;
  email?: string;
  emailLower?: string;
  addressKey?: string;
  addressId?: string;
  status?: string;

  documents?: Partial<Record<DocType, string>>;

  // nouveau format
  documentsUploadMeta?: Record<string, any>;
  documentsAnalysis?: Record<string, any>;

  // ancien format / compat
  documentsMeta?: Record<string, any>;
  kbis?: any;
  identityCard?: any;
  proofOfAddress?: any;

  updatedAt?: Timestamp;
  createdAt?: Timestamp;

  pdfPublish?: {
    contract?: { status: string; outputUrl?: string; error?: string | null };
    attestation?: { status: string; outputUrl?: string; error?: string | null };
  };
};

type DisplayDocument = {
  type: DocType;
  label: string;
  path: string;
  contentType?: string;
  size?: number;
  uploadedAt?: Timestamp | null;
  validated?: boolean | null;
  result?: string | null;
  score?: number | null;
};

const DOC_LABELS: Record<DocType, string> = {
  kbis: "Extrait Kbis",
  identityCard: "Pièce d'identité",
  proofOfAddress: "Justificatif de domicile",
  contract: "Contrat de domiciliation",
  attestation: "Attestation de domiciliation",
  formalitiesBundle: "Liasse de formalités",
};

// isStaffRole logic moved to src/lib/constants/roles.ts

function isPlainObject(value: unknown): value is Record<string, any> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isUploadMeta(value: unknown) {
  return (
    isPlainObject(value) &&
    ("contentType" in value || "size" in value || "uploadedAt" in value)
  );
}

function isAnalysisMeta(value: unknown) {
  return (
    isPlainObject(value) &&
    ("result" in value ||
      "score" in value ||
      "validated" in value ||
      "mime" in value ||
      "ts" in value)
  );
}

function formatDate(value?: Timestamp | null) {
  if (!value) return "—";
  try {
    return value.toDate().toLocaleString("fr-FR");
  } catch {
    return "—";
  }
}

function formatSize(bytes?: number) {
  if (!bytes || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function getUploadMeta(item: RequestLike, docType: DocType) {
  const fromNew = item.documentsUploadMeta?.[docType];
  if (isUploadMeta(fromNew)) return fromNew;

  const fromLegacy = item.documentsMeta?.[docType];
  if (isUploadMeta(fromLegacy)) return fromLegacy;

  return {};
}

function getAnalysisMeta(item: RequestLike, docType: DocType) {
  const fromNew = item.documentsAnalysis?.[docType];
  if (isAnalysisMeta(fromNew)) return fromNew;

  const fromLegacyTopLevel = (item as any)?.[docType];
  if (isAnalysisMeta(fromLegacyTopLevel)) return fromLegacyTopLevel;

  const fromLegacyMap = item.documentsMeta?.[docType];
  if (isAnalysisMeta(fromLegacyMap)) return fromLegacyMap;

  return {};
}

function extractDocuments(item: RequestLike): DisplayDocument[] {
  const paths = item.documents || {};
  const docs: DisplayDocument[] = [];

  (Object.keys(DOC_LABELS) as DocType[]).forEach((docType) => {
    const path = paths[docType];
    if (!path) return;

    const uploadMeta = getUploadMeta(item, docType);
    const analysisMeta = getAnalysisMeta(item, docType);

    docs.push({
      type: docType,
      label: DOC_LABELS[docType],
      path,
      contentType:
        uploadMeta.contentType || analysisMeta.mime || undefined,
      size:
        typeof uploadMeta.size === "number"
          ? uploadMeta.size
          : typeof analysisMeta.size === "number"
          ? analysisMeta.size
          : undefined,
      uploadedAt: uploadMeta.uploadedAt ?? null,
      validated:
        typeof analysisMeta.validated === "boolean"
          ? analysisMeta.validated
          : null,
      result:
        typeof analysisMeta.result === "string"
          ? analysisMeta.result
          : null,
      score:
        typeof analysisMeta.score === "number"
          ? analysisMeta.score
          : null,
    });
  });
  
  // Ajout des documents générés (Contrat et Attestation) si disponibles
  if (item.pdfPublish) {
    if (item.pdfPublish.contract?.status === "complete" && item.pdfPublish.contract.outputUrl) {
      docs.push({
        type: "contract",
        label: "Contrat de domiciliation",
        path: item.pdfPublish.contract.outputUrl,
        contentType: "application/pdf",
        uploadedAt: item.updatedAt || item.createdAt || null,
        validated: true,
        result: "OK",
      });
    }
    if (item.pdfPublish.attestation?.status === "complete" && item.pdfPublish.attestation.outputUrl) {
      docs.push({
        type: "attestation",
        label: "Attestation de domiciliation",
        path: item.pdfPublish.attestation.outputUrl,
        contentType: "application/pdf",
        uploadedAt: item.updatedAt || item.createdAt || null,
        validated: true,
        result: "OK",
      });
    }
  }

  return docs;
}

function mergePdfPublish(
  requestPdfPublish?: RequestLike["pdfPublish"],
  clientPdfPublish?: RequestLike["pdfPublish"]
): RequestLike["pdfPublish"] | undefined {
  if (!requestPdfPublish && !clientPdfPublish) return undefined;

  return {
    ...(requestPdfPublish || {}),
    ...(clientPdfPublish || {}),
    contract: clientPdfPublish?.contract || requestPdfPublish?.contract,
    attestation: clientPdfPublish?.attestation || requestPdfPublish?.attestation,
  };
}

function mergeDocumentSources(
  requestItem: RequestLike | null,
  clientItem: RequestLike | null,
  uid: string
): RequestLike {
  return {
    ...(requestItem || {}),
    ...(clientItem || {}),
    id: uid,
    ownerUid: clientItem?.ownerUid || requestItem?.ownerUid || uid,
    uid: clientItem?.uid || requestItem?.uid || uid,
    companyName: clientItem?.companyName || requestItem?.companyName,
    name: clientItem?.name || requestItem?.name,
    email: clientItem?.email || requestItem?.email,
    emailLower: clientItem?.emailLower || requestItem?.emailLower,
    addressKey: clientItem?.addressKey || requestItem?.addressKey,
    addressId: clientItem?.addressId || requestItem?.addressId,
    status: clientItem?.status || requestItem?.status,
    documents: {
      ...(requestItem?.documents || {}),
      ...(clientItem?.documents || {}),
    },
    documentsUploadMeta: {
      ...(requestItem?.documentsUploadMeta || {}),
      ...(clientItem?.documentsUploadMeta || {}),
    },
    documentsAnalysis: {
      ...(requestItem?.documentsAnalysis || {}),
      ...(clientItem?.documentsAnalysis || {}),
    },
    documentsMeta: {
      ...(requestItem?.documentsMeta || {}),
      ...(clientItem?.documentsMeta || {}),
    },
    pdfPublish: mergePdfPublish(requestItem?.pdfPublish, clientItem?.pdfPublish),
    updatedAt: clientItem?.updatedAt || requestItem?.updatedAt,
    createdAt: clientItem?.createdAt || requestItem?.createdAt,
  };
}

function ValidationBadge({
  validated,
  result,
}: {
  validated?: boolean | null;
  result?: string | null;
}) {
  if (validated === true || result === "OK") {
    return (
      <Badge variant="default" className="gap-1">
        <ShieldCheck className="h-3.5 w-3.5" />
        Validé
      </Badge>
    );
  }

  if (validated === false) {
    return (
      <Badge variant="destructive" className="gap-1">
        <ShieldAlert className="h-3.5 w-3.5" />
        À revoir
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1">
      <BadgeCheck className="h-3.5 w-3.5" />
      Reçu
    </Badge>
  );
}

export default function DocumentsPage() {
  const db = useDb();
  const auth = useAuth();
  const { firebaseApp } = useFirebase();
  const { toast } = useToast();
  const { actualRole, displayRole } = useRole();

  const storage = React.useMemo(() => {
    if (!firebaseApp) return null;
    return getStorage(firebaseApp);
  }, [firebaseApp]);

  const [items, setItems] = React.useState<RequestLike[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [openingPath, setOpeningPath] = React.useState<string | null>(null);
  const [currentUserUid, setCurrentUserUid] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUserUid(user?.uid ?? null);
      if (!user) {
        setItems([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  React.useEffect(() => {
    let unsub: (() => void) | null = null;

    async function boot() {
      if (!db || !currentUserUid) {
        if (!currentUserUid) setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // Condition hybride : on affiche la vue Staff SEULEMENT si actualRole ET displayRole sont autorisés.
        // Cela permet à un admin de simuler la vue restreinte d'un client.
        const canSeeStaffData = actualRole && STAFF_ROLES.includes(actualRole);
        const shouldShowStaffView = displayRole && STAFF_ROLES.includes(displayRole as any);

        if (canSeeStaffData && shouldShowStaffView) {
          const q: Query<DocumentData> = query(
            collection(db, "client_requests"),
            orderBy("updatedAt", "desc")
          );

          unsub = onSnapshot(
            q,
            (snapshot) => {
              const next = snapshot.docs
                .map((docSnap) => ({
                  id: docSnap.id,
                  ...(docSnap.data() as Omit<RequestLike, "id">),
                }))
                .filter((item) => extractDocuments(item).length > 0);

              setItems(next);
              setLoading(false);
            },
            (error) => {
              console.error("[DocumentsPage] staff snapshot error:", error);
              toast({
                variant: "destructive",
                title: "Erreur",
                description: "Impossible de charger les documents.",
              });
              setLoading(false);
            }
          );
        } else {
          const requestRef = doc(db, "client_requests", currentUserUid);

          unsub = onSnapshot(
            requestRef,
            async (snap) => {
              try {
                const requestItem = snap.exists()
                  ? {
                      id: snap.id,
                      ...(snap.data() as Omit<RequestLike, "id">),
                    }
                  : null;

                const clientRef = doc(db, "clients", currentUserUid);
                const clientSnap = await getDoc(clientRef);
                const clientItem = clientSnap.exists()
                  ? {
                      id: clientSnap.id,
                      ...(clientSnap.data() as Omit<RequestLike, "id">),
                    }
                  : null;

                const merged = mergeDocumentSources(
                  requestItem,
                  clientItem,
                  currentUserUid
                );

                setItems(extractDocuments(merged).length > 0 ? [merged] : []);
                setLoading(false);
              } catch (fallbackError) {
                console.error(
                  "[DocumentsPage] client merge error:",
                  fallbackError
                );
                setItems([]);
                setLoading(false);
              }
            },
            async (error) => {
              console.error("[DocumentsPage] client request snapshot error:", error);

              try {
                const clientRef = doc(db, "clients", currentUserUid);
                const clientSnap = await getDoc(clientRef);

                const clientItem = clientSnap.exists()
                  ? {
                      id: clientSnap.id,
                      ...(clientSnap.data() as Omit<RequestLike, "id">),
                    }
                  : null;

                const fallback = mergeDocumentSources(null, clientItem, currentUserUid);

                setItems(
                  extractDocuments(fallback).length > 0 ? [fallback] : []
                );
              } catch (clientError) {
                console.error("[DocumentsPage] client doc fallback error:", clientError);
                toast({
                  variant: "destructive",
                  title: "Erreur",
                  description: "Impossible de charger vos documents.",
                });
                setItems([]);
              } finally {
                setLoading(false);
              }
            }
          );
        }
      } catch (error) {
        console.error("[DocumentsPage] boot error:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible d'initialiser la page Documents.",
        });
        setLoading(false);
      }
    }

    void boot();

    return () => {
      if (unsub) unsub();
    };
  }, [db, currentUserUid, displayRole, toast]);

  const isStaffView =
    !!displayRole && STAFF_ROLES.includes(displayRole as UserRole);

  const filteredItems = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;

    return items.filter((item) => {
      const docs = extractDocuments(item)
        .map((document) => document.label)
        .join(" ");

      const haystack = [
        item.companyName,
        item.name,
        item.email,
        item.addressKey,
        item.status,
        docs,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [items, search]);

  const openDocument = React.useCallback(
    async (path: string) => {
      if (!storage || !path) return;

      try {
        setOpeningPath(path);
        
        // Si c'est déjà une URL (Signed URL générée par le backend), on l'ouvre directement
        if (path.startsWith("http")) {
          window.open(path, "_blank", "noopener,noreferrer");
          return;
        }

        const effectivePath = getStorageRelativePath(path);
        const url = await getDownloadURL(ref(storage, effectivePath));
        window.open(url, "_blank", "noopener,noreferrer");
      } catch (error) {
        console.error("[DocumentsPage] openDocument error:", error);
        toast({
          variant: "destructive",
          title: "Ouverture impossible",
          description: "Le document n’a pas pu être ouvert.",
        });
      } finally {
        setOpeningPath(null);
      }
    },
    [storage, toast]
  );

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {isStaffView ? "Documents clients" : "Mes documents"}
          </CardTitle>
          <CardDescription>
            {isStaffView
              ? "Consultez les pièces déposées dans le parcours d’inscription."
              : "Retrouvez ici vos documents déposés lors de votre inscription."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {isStaffView && (
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher une entreprise, un document..."
                className="pl-9"
              />
            </div>
          )}

          {filteredItems.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                <FileText className="h-10 w-10 text-muted-foreground" />
                <div>
                  <p className="font-medium">Aucun document disponible</p>
                  <p className="text-sm text-muted-foreground">
                    Les documents téléversés ou générés apparaîtront ici.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredItems.map((item) => {
                const docs = extractDocuments(item);

                return (
                  <Card key={item.id}>
                    <CardHeader className="pb-3">
                      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <CardTitle className="text-base">
                            {item.companyName ||
                              item.name ||
                              item.email ||
                              "Dossier client"}
                          </CardTitle>
                          <CardDescription>
                            {item.emailLower || item.email || "Client connecté"}
                          </CardDescription>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {item.addressKey && (
                            <Badge variant="outline">
                              <Building2 className="mr-1 h-3 w-3" />
                              {item.addressKey}
                            </Badge>
                          )}
                          {item.status && <Badge>{item.status}</Badge>}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="grid gap-3">
                      {docs.map((document) => (
                        <div
                          key={`${document.type}-${document.path}`}
                          className="flex flex-col gap-3 rounded-xl border bg-card p-4 md:flex-row md:items-center md:justify-between"
                        >
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-primary" />
                              <span className="font-medium">{document.label}</span>
                              {document.validated === true ? (
                                <Badge
                                  variant="outline"
                                  className="border-emerald-200 bg-emerald-50 text-emerald-700"
                                >
                                  <ShieldCheck className="mr-1 h-3 w-3" />
                                  Validé
                                </Badge>
                              ) : document.validated === false ? (
                                <Badge
                                  variant="outline"
                                  className="border-amber-200 bg-amber-50 text-amber-700"
                                >
                                  <ShieldAlert className="mr-1 h-3 w-3" />
                                  À vérifier
                                </Badge>
                              ) : null}
                            </div>

                            <div className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-3">
                              <div>
                                <span className="font-medium text-foreground">
                                  Type :
                                </span>{" "}
                                {document.contentType || "—"}
                              </div>
                              <div>
                                <span className="font-medium text-foreground">
                                  Taille :
                                </span>{" "}
                                {formatSize(document.size)}
                              </div>
                              <div>
                                <span className="font-medium text-foreground">
                                  Déposé le :
                                </span>{" "}
                                {formatDate(document.uploadedAt)}
                              </div>
                              <div>
                                <span className="font-medium text-foreground">
                                  Score :
                                </span>{" "}
                                {document.score != null ? document.score : "—"}
                              </div>
                              <div className="sm:col-span-2">
                                <span className="font-medium text-foreground">
                                  Analyse :
                                </span>{" "}
                                {document.result || "—"}
                              </div>
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDocument(document.path)}
                            disabled={openingPath === document.path}
                            className="shrink-0"
                          >
                            {openingPath === document.path ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <ExternalLink className="mr-2 h-4 w-4" />
                            )}
                            Ouvrir
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* Legacy block removed below */
/*
                if (snap.exists()) {
                if (snap.exists()) {
                  const current = {
                    id: snap.id,
                    ...(snap.data() as Omit<RequestLike, "id">),
                  };

                  if (extractDocuments(current).length > 0) {
                    setItems([current]);
                    setLoading(false);
                    return;
                  }
                }

                const clientRef = doc(db, "clients", currentUserUid);
                const clientSnap = await getDoc(clientRef);

                if (clientSnap.exists()) {
                  const fallback = {
                    id: clientSnap.id,
                    ...(clientSnap.data() as Omit<RequestLike, "id">),
                  };

                  setItems(
                    extractDocuments(fallback).length > 0 ? [fallback] : []
                  );
                } else {
                  setItems([]);
                }

                setLoading(false);
              } catch (fallbackError) {
                console.error(
                  "[DocumentsPage] client fallback error:",
                  fallbackError
                );
                setItems([]);
                setLoading(false);
              }
            },
            async (error) => {
              console.error("[DocumentsPage] client request snapshot error:", error);

              try {
                const clientRef = doc(db, "clients", currentUserUid);
                const clientSnap = await getDoc(clientRef);

                if (clientSnap.exists()) {
                  const fallback = {
                    id: clientSnap.id,
                    ...(clientSnap.data() as Omit<RequestLike, "id">),
                  };

                  setItems(
                    extractDocuments(fallback).length > 0 ? [fallback] : []
                  );
                } else {
                  setItems([]);
                }
              } catch (clientError) {
                console.error("[DocumentsPage] client doc fallback error:", clientError);
                toast({
                  variant: "destructive",
                  title: "Erreur",
                  description: "Impossible de charger vos documents.",
                });
                setItems([]);
              } finally {
                setLoading(false);
              }
            }
          );
        }
      } catch (error) {
        console.error("[DocumentsPage] boot error:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible d'initialiser la page Documents.",
        });
        setLoading(false);
      }
    }

    void boot();

    return () => {
      if (unsub) unsub();
    };
  }, [actualRole, displayRole, currentUserUid, db, toast]);

  const filteredItems = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;

    return items.filter((item) => {
      const docs = extractDocuments(item)
        .map((document) => document.label)
        .join(" ");

      const haystack = [
        item.companyName,
        item.name,
        item.email,
        item.addressKey,
        item.addressId,
        item.status,
        docs,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [items, search]);

  const openDocument = React.useCallback(
    async (path: string) => {
      if (!storage || !path) return;

      try {
        setOpeningPath(path);
        
        // Si c'est déjà une URL (Signed URL générée par le backend), on l'ouvre directement
        if (path.startsWith("http")) {
          window.open(path, "_blank", "noopener,noreferrer");
          return;
        }

        const effectivePath = getStorageRelativePath(path);
        const url = await getDownloadURL(ref(storage, effectivePath));
        window.open(url, "_blank", "noopener,noreferrer");
      } catch (error) {
        console.error("[DocumentsPage] openDocument error:", error);
        toast({
          variant: "destructive",
          title: "Ouverture impossible",
          description: "Le document n’a pas pu être ouvert.",
        });
      } finally {
        setOpeningPath(null);
      }
    },
    [storage, toast]
  );

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // On utilise displayRole pour les labels UI
  const isStaffView = displayRole && STAFF_ROLES.includes(displayRole as any);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {isStaffView ? "Documents clients" : "Mes documents"}
          </CardTitle>
          <CardDescription>
            {isStaffView
              ? "Consultez les pièces déposées dans le parcours d’inscription."
              : "Retrouvez ici vos documents déposés lors de votre inscription."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {isStaffView && (
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher une société, un email, un document..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          )}

          {filteredItems.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="mb-3 h-10 w-10 text-muted-foreground" />
                <p className="font-medium">Aucun document trouvé</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Aucun document n’est encore disponible pour ce compte.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredItems.map((item) => {
                const docs = extractDocuments(item);

                return (
                  <Card key={item.id}>
                    <CardHeader className="pb-3">
                      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <CardTitle className="text-base">
                            {item.companyName ||
                              item.name ||
                              "Société non renseignée"}
                          </CardTitle>
                          <CardDescription>
                            {item.email || "—"} • {item.addressKey || item.addressId || "—"} • Dernière mise à jour{" "}
                            {formatDate(item.updatedAt || item.createdAt)}
                          </CardDescription>
                        </div>

                        {isStaffView && (
                          <Badge variant="outline" className="w-fit">
                            <Building2 className="mr-1 h-3.5 w-3.5" />
                            {item.id}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>


                    <CardContent>
                      <div className="grid gap-3">
                        {docs.map((document) => (
                          <div
                            key={document.type}
                            className="flex flex-col gap-3 rounded-xl border p-4 lg:flex-row lg:items-center lg:justify-between"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="font-medium">{document.label}</div>
                                <ValidationBadge
                                  validated={document.validated}
                                  result={document.result}
                                />
                              </div>

                              <div className="mt-2 grid gap-1 text-sm text-muted-foreground md:grid-cols-2 xl:grid-cols-4">
                                <div>
                                  <span className="font-medium text-foreground">
                                    Type :
                                  </span>{" "}
                                  {document.contentType || "—"}
                                </div>
                                <div>
                                  <span className="font-medium text-foreground">
                                    Taille :
                                  </span>{" "}
                                  {formatSize(document.size)}
                                </div>
                                <div>
                                  <span className="font-medium text-foreground">
                                    Déposé le :
                                  </span>{" "}
                                  {formatDate(document.uploadedAt)}
                                </div>
                                <div>
                                  <span className="font-medium text-foreground">
                                    Score :
                                  </span>{" "}
                                  {document.score != null ? document.score : "—"}
                                </div>
                              </div>

                              <div className="mt-2 break-all text-xs text-muted-foreground">
                                {document.path}
                              </div>
                            </div>

                            <div className="flex shrink-0 gap-2">
                              <Button
                                type="button"
                                onClick={() => openDocument(document.path)}
                                disabled={openingPath === document.path}
                              >
                                {openingPath === document.path ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                )}
                                Ouvrir
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
*/
