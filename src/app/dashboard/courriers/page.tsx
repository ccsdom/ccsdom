"use client";

import * as React from "react";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  where,
  Timestamp,
  type Query,
  type DocumentData,
} from "firebase/firestore";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import { getStorageRelativePath } from "@/firebase/storage-utils";
import {
  AlertCircle,
  Building2,
  ExternalLink,
  FileText,
  Inbox,
  Loader2,
  Mail,
  RefreshCcw,
  Search,
} from "lucide-react";

import { useDb, useFirebase, useAuth } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRole } from "@/hooks/use-simulated-role";
import { STAFF_ROLES, normalizeRole } from "@/lib/constants/roles";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type MailStatus = "received" | "processed" | "archived" | string;

type MailItem = {
  id: string;
  ownerUid?: string;
  clientUid?: string;
  centerKey?: string;
  companyName?: string | null;
  fileName?: string;
  storagePath?: string;
  contentType?: string;
  size?: number;
  status?: MailStatus;
  source?: string;
  summary?: string;
  actionRequired?: boolean;
  receivedAt?: Timestamp;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

function formatDate(value?: Timestamp) {
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

function statusLabel(status?: string) {
  switch (status) {
    case "received":
      return "Reçu";
    case "processed":
      return "Traité";
    case "archived":
      return "Archivé";
    default:
      return status || "—";
  }
}

function statusVariant(
  status?: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "received":
      return "secondary";
    case "processed":
      return "default";
    case "archived":
      return "outline";
    default:
      return "outline";
  }
}

// isStaffRole logic moved to src/lib/constants/roles.ts

export default function CourriersPage() {
  const db = useDb();
  const auth = useAuth();
  const { firebaseApp } = useFirebase();
  const { toast } = useToast();

  const storage = React.useMemo(() => {
    if (!firebaseApp) return null;
    return getStorage(firebaseApp);
  }, [firebaseApp]);

  const [items, setItems] = React.useState<MailItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const { actualRole, displayRole, isLoading: isRoleLoading } = useRole();
  const [openingId, setOpeningId] = React.useState<string | null>(null);

  React.useEffect(() => {
    let unsub: (() => void) | null = null;

    async function boot() {
      if (!db || !auth?.currentUser) {
        setLoading(false);
        return;
      }

      try {
        const uid = auth.currentUser.uid;

        let q: Query<DocumentData>;

        // Condition hybride : on affiche la vue Staff SEULEMENT si actualRole ET displayRole sont autorisés.
        // Cela permet à un admin de simuler la vue restreinte d'un client.
        const canSeeStaffData = actualRole && STAFF_ROLES.includes(actualRole);
        const shouldShowStaffView = displayRole && STAFF_ROLES.includes(displayRole as any);

        if (canSeeStaffData && shouldShowStaffView) {
          q = query(
            collection(db, "mails"),
            orderBy("receivedAt", "desc")
          );
        } else {
          q = query(
            collection(db, "mails"),
            where("ownerUid", "==", uid),
            orderBy("receivedAt", "desc")
          );
        }

        unsub = onSnapshot(
          q,
          (snapshot) => {
            const next: MailItem[] = snapshot.docs.map((docSnap) => ({
              id: docSnap.id,
              ...(docSnap.data() as Omit<MailItem, "id">),
            }));

            setItems(next);
            setLoading(false);
          },
          (error) => {
            console.error("[CourriersPage] onSnapshot error:", error);
            toast({
              variant: "destructive",
              title: "Erreur",
              description: "Impossible de charger les courriers.",
            });
            setLoading(false);
          }
        );
      } catch (error) {
        console.error("[CourriersPage] boot error:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible d'initialiser la page Courriers.",
        });
        setLoading(false);
      }
    }

    void boot();

    return () => {
      if (unsub) unsub();
    };
  }, [auth?.currentUser, db, toast, actualRole, displayRole]);

  const filteredItems = React.useMemo(() => {
    const q = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesStatus =
        statusFilter === "all" ? true : item.status === statusFilter;

      const haystack = [
        item.companyName,
        item.fileName,
        item.centerKey,
        item.summary,
        item.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = q ? haystack.includes(q) : true;

      return matchesStatus && matchesSearch;
    });
  }, [items, search, statusFilter]);

  const openFile = React.useCallback(
    async (item: MailItem) => {
      if (!storage || !item.storagePath) {
        toast({
          variant: "destructive",
          title: "Impossible d’ouvrir le document",
          description: "Chemin Storage introuvable.",
        });
        return;
      }

      try {
        setOpeningId(item.id);
        const effectivePath = getStorageRelativePath(item.storagePath);
        const url = await getDownloadURL(ref(storage, effectivePath));
        window.open(url, "_blank", "noopener,noreferrer");
      } catch (error) {
        console.error("[CourriersPage] openFile error:", error);
        toast({
          variant: "destructive",
          title: "Ouverture impossible",
          description: "Le document n’a pas pu être ouvert.",
        });
      } finally {
        setOpeningId(null);
      }
    },
    [storage, toast]
  );

  // On utilise displayRole pour les labels UI
  const isStaffView = !!displayRole && STAFF_ROLES.includes(displayRole as any);

  if (loading || isRoleLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total courriers</CardDescription>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Inbox className="h-5 w-5 text-primary" />
              {items.length}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Nouveaux</CardDescription>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Mail className="h-5 w-5 text-primary" />
              {items.filter((item) => item.status === "received").length}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Action requise</CardDescription>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <AlertCircle className="h-5 w-5 text-primary" />
              {items.filter((item) => !!item.actionRequired).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isStaffView ? "Gestion des courriers" : "Mes courriers"}
          </CardTitle>
          <CardDescription>
            {isStaffView
              ? "Consultez les courriers entrants indexés pour les clients."
              : "Retrouvez ici les courriers reçus pour votre société."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un courrier, une société, une agence..."
                className="pl-9"
              />
            </div>

            <div className="w-full md:w-[220px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="received">Reçu</SelectItem>
                  <SelectItem value="processed">Traité</SelectItem>
                  <SelectItem value="archived">Archivé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Réinitialiser
            </Button>
          </div>

          {filteredItems.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Inbox className="mb-3 h-10 w-10 text-muted-foreground" />
                <p className="font-medium">Aucun courrier trouvé</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ajustez vos filtres ou revenez plus tard.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={statusVariant(item.status)}>
                            {statusLabel(item.status)}
                          </Badge>

                          {item.actionRequired ? (
                            <Badge variant="destructive">Action requise</Badge>
                          ) : null}

                          {item.centerKey ? (
                            <Badge variant="outline">{item.centerKey}</Badge>
                          ) : null}
                        </div>

                        <div>
                          <h3 className="flex items-center gap-2 text-base font-semibold">
                            <FileText className="h-4 w-4 text-primary" />
                            {item.fileName || "Document sans nom"}
                          </h3>

                          {isStaffView && (
                            <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                              <Building2 className="h-4 w-4" />
                              {item.companyName || "Société non renseignée"}
                            </p>
                          )}
                        </div>

                        <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2 xl:grid-cols-4">
                          <div>
                            <span className="font-medium text-foreground">
                              Reçu le :
                            </span>{" "}
                            {formatDate(item.receivedAt || item.createdAt)}
                          </div>
                          <div>
                            <span className="font-medium text-foreground">
                              Taille :
                            </span>{" "}
                            {formatSize(item.size)}
                          </div>
                          <div>
                            <span className="font-medium text-foreground">
                              Type :
                            </span>{" "}
                            {item.contentType || "—"}
                          </div>
                          <div>
                            <span className="font-medium text-foreground">
                              Source :
                            </span>{" "}
                            {item.source || "—"}
                          </div>
                        </div>

                        {item.summary ? (
                          <div className="rounded-lg bg-muted/50 p-3 text-sm">
                            {item.summary}
                          </div>
                        ) : null}
                      </div>

                      <div className="flex shrink-0 flex-col gap-2">
                        <Button
                          type="button"
                          onClick={() => openFile(item)}
                          disabled={!item.storagePath || openingId === item.id}
                        >
                          {openingId === item.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <ExternalLink className="mr-2 h-4 w-4" />
                          )}
                          Ouvrir
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}