"use client";

import * as React from "react";
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type Timestamp,
} from "firebase/firestore";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Filter,
  Inbox,
  MessageSquareWarning,
  Search,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useFirebase } from "@/firebase";
import { useCenterAccess } from "@/hooks/use-center-access";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type FeedbackStatus = "new" | "in_progress" | "resolved" | "ignored";
type FeedbackPriority = "normal" | "important" | "blocking";

type BetaFeedback = {
  id: string;
  category?: string;
  categoryLabel?: string;
  priority?: FeedbackPriority;
  priorityLabel?: string;
  message?: string;
  status?: FeedbackStatus;
  pagePath?: string;
  pageUrl?: string;
  createdByEmail?: string | null;
  createdByRole?: string | null;
  displayRole?: string | null;
  centerId?: string | null;
  centerIds?: string[];
  createdAt?: Timestamp | Date | string | null;
  updatedAt?: Timestamp | Date | string | null;
};

const statusLabels: Record<FeedbackStatus, string> = {
  new: "Nouveau",
  in_progress: "En cours",
  resolved: "Corrigé",
  ignored: "Écarté",
};

const priorityLabels: Record<FeedbackPriority, string> = {
  normal: "Normal",
  important: "Important",
  blocking: "Bloquant",
};

const statusClassNames: Record<FeedbackStatus, string> = {
  new: "border-amber-200 bg-amber-50 text-amber-800",
  in_progress: "border-blue-200 bg-blue-50 text-blue-800",
  resolved: "border-emerald-200 bg-emerald-50 text-emerald-800",
  ignored: "border-slate-200 bg-slate-100 text-slate-600",
};

const priorityClassNames: Record<FeedbackPriority, string> = {
  normal: "border-slate-200 bg-slate-50 text-slate-700",
  important: "border-orange-200 bg-orange-50 text-orange-800",
  blocking: "border-rose-200 bg-rose-50 text-rose-800",
};

function toDate(value: BetaFeedback["createdAt"]): Date | null {
  if (!value) return null;
  if (typeof (value as Timestamp).toDate === "function") return (value as Timestamp).toDate();
  const parsed = new Date(value as string);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDate(value: BetaFeedback["createdAt"]) {
  const date = toDate(value);
  if (!date) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function centerLabel(centerId?: string | null) {
  if (centerId === "orly_ville" || centerId === "orly") return "Orly";
  if (centerId === "paris_12e" || centerId === "paris") return "Paris 12e";
  if (!centerId) return "—";
  return centerId;
}

function normalizeStatus(status?: string | null): FeedbackStatus {
  if (status === "in_progress" || status === "resolved" || status === "ignored") return status;
  return "new";
}

function normalizePriority(priority?: string | null): FeedbackPriority {
  if (priority === "important" || priority === "blocking") return priority;
  return "normal";
}

export default function AdminFeedbackPage() {
  const { firestore, user } = useFirebase();
  const { actualRole, isLoading } = useCenterAccess();
  const { toast } = useToast();

  const [feedbacks, setFeedbacks] = React.useState<BetaFeedback[]>([]);
  const [isFeedbackLoading, setIsFeedbackLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | FeedbackStatus>("all");
  const [priorityFilter, setPriorityFilter] = React.useState<"all" | FeedbackPriority>("all");
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!firestore || actualRole !== "super_admin") {
      setFeedbacks([]);
      setIsFeedbackLoading(false);
      return;
    }

    setIsFeedbackLoading(true);
    const feedbackQuery = query(
      collection(firestore, "beta_feedback"),
      orderBy("createdAt", "desc"),
      limit(200)
    );

    const unsubscribe = onSnapshot(
      feedbackQuery,
      (snapshot) => {
        setFeedbacks(
          snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<BetaFeedback, "id">),
          }))
        );
        setIsFeedbackLoading(false);
      },
      (error) => {
        console.error("[AdminFeedbackPage] Failed to load beta feedback:", error);
        setFeedbacks([]);
        setIsFeedbackLoading(false);
        toast({
          variant: "destructive",
          title: "Retours bêta indisponibles",
          description: "Impossible de charger les retours pour le moment.",
        });
      }
    );

    return () => unsubscribe();
  }, [actualRole, firestore, toast]);

  const filteredFeedbacks = React.useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return feedbacks.filter((feedback) => {
      const status = normalizeStatus(feedback.status);
      const priority = normalizePriority(feedback.priority);

      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (priorityFilter !== "all" && priority !== priorityFilter) return false;

      if (!normalizedSearch) return true;

      const haystack = [
        feedback.message,
        feedback.categoryLabel,
        feedback.createdByEmail,
        feedback.displayRole,
        feedback.createdByRole,
        feedback.pagePath,
        feedback.centerId,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [feedbacks, priorityFilter, searchTerm, statusFilter]);

  const stats = React.useMemo(() => {
    return feedbacks.reduce(
      (acc, feedback) => {
        const status = normalizeStatus(feedback.status);
        const priority = normalizePriority(feedback.priority);
        acc.total += 1;
        acc[status] += 1;
        if (priority === "blocking") acc.blocking += 1;
        return acc;
      },
      {
        total: 0,
        new: 0,
        in_progress: 0,
        resolved: 0,
        ignored: 0,
        blocking: 0,
      }
    );
  }, [feedbacks]);

  const handleStatusChange = async (feedbackId: string, status: FeedbackStatus) => {
    if (!firestore || !user) return;

    setUpdatingId(feedbackId);
    try {
      await updateDoc(doc(firestore, "beta_feedback", feedbackId), {
        status,
        updatedAt: serverTimestamp(),
        handledAt: serverTimestamp(),
        handledByUid: user.uid,
        handledByEmail: user.email ?? null,
      });
      toast({
        title: "Retour mis à jour",
        description: `Statut passé à « ${statusLabels[status]} ».`,
      });
    } catch (error) {
      console.error("[AdminFeedbackPage] Failed to update feedback:", error);
      toast({
        variant: "destructive",
        title: "Mise à jour impossible",
        description: "Le statut du retour n'a pas pu être modifié.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  if (!isLoading && actualRole !== "super_admin") {
    return (
      <div className="mx-auto max-w-3xl">
        <Card className="border-amber-200 bg-amber-50 text-amber-950">
          <CardHeader>
            <CardTitle>Accès réservé</CardTitle>
            <CardDescription className="text-amber-800">
              Le cockpit des retours bêta est réservé au super administrateur.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-950">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5 md:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-primary">
              <MessageSquareWarning className="h-3.5 w-3.5" />
              Recette terrain
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
              Retours bêta
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
              Centralisez les bugs, gênes d'interface et suggestions remontés par les
              managers, secrétaires et clients pendant la phase de test.
            </p>
          </div>
          <Button asChild variant="outline" className="border-slate-200 bg-white text-slate-700">
            <Link href="/admin/activity">
              Voir l'activité
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Total</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-amber-200 bg-amber-50 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-amber-800">Nouveaux</CardDescription>
            <CardTitle className="text-3xl text-amber-950">{stats.new}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-blue-200 bg-blue-50 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-blue-800">En cours</CardDescription>
            <CardTitle className="text-3xl text-blue-950">{stats.in_progress}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-rose-200 bg-rose-50 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-rose-800">Bloquants</CardDescription>
            <CardTitle className="text-3xl text-rose-950">{stats.blocking}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card className="border-slate-200 bg-white shadow-xl shadow-slate-900/5">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl font-black">
                <Inbox className="h-5 w-5 text-primary" />
                File des retours
              </CardTitle>
              <CardDescription>
                Traitez les retours un par un et marquez l'avancement pour garder une recette nette.
              </CardDescription>
            </div>
            <div className="grid gap-2 sm:grid-cols-3 lg:w-[720px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Rechercher..."
                  className="h-11 border-slate-200 bg-white pl-9 text-slate-950"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
                <SelectTrigger className="h-11 border-slate-200 bg-white text-slate-950">
                  <Filter className="mr-2 h-4 w-4 text-slate-400" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white text-slate-950">
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as typeof priorityFilter)}>
                <SelectTrigger className="h-11 border-slate-200 bg-white text-slate-950">
                  <AlertTriangle className="mr-2 h-4 w-4 text-slate-400" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white text-slate-950">
                  <SelectItem value="all">Toutes priorités</SelectItem>
                  {Object.entries(priorityLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isFeedbackLoading ? (
            <div className="flex min-h-48 items-center justify-center text-sm font-semibold text-slate-500">
              Chargement des retours...
            </div>
          ) : filteredFeedbacks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
              <p className="mt-4 text-lg font-black text-slate-950">Aucun retour à traiter</p>
              <p className="mt-2 text-sm text-slate-500">
                Les retours apparaîtront ici dès qu'un utilisateur les enverra depuis l'application.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-hidden rounded-2xl border border-slate-200 md:block">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Retour</TableHead>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Page</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFeedbacks.map((feedback) => {
                      const status = normalizeStatus(feedback.status);
                      const priority = normalizePriority(feedback.priority);

                      return (
                        <TableRow key={feedback.id}>
                          <TableCell className="whitespace-nowrap text-xs text-slate-500">
                            {formatDate(feedback.createdAt)}
                          </TableCell>
                          <TableCell className="min-w-[320px]">
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className={priorityClassNames[priority]}>
                                {priorityLabels[priority]}
                              </Badge>
                              <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
                                {feedback.categoryLabel ?? feedback.category ?? "Retour"}
                              </Badge>
                            </div>
                            <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-700">
                              {feedback.message}
                            </p>
                          </TableCell>
                          <TableCell className="text-sm">
                            <p className="font-bold text-slate-950">{feedback.createdByEmail ?? "—"}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              {feedback.displayRole ?? feedback.createdByRole ?? "client"} · {centerLabel(feedback.centerId)}
                            </p>
                          </TableCell>
                          <TableCell className="max-w-[220px] text-sm">
                            {feedback.pageUrl ? (
                              <a
                                href={feedback.pageUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="line-clamp-2 font-semibold text-primary hover:underline"
                              >
                                {feedback.pagePath ?? feedback.pageUrl}
                              </a>
                            ) : (
                              feedback.pagePath ?? "—"
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusClassNames[status]}>
                              {statusLabels[status]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Select
                              value={status}
                              onValueChange={(value) => handleStatusChange(feedback.id, value as FeedbackStatus)}
                              disabled={updatingId === feedback.id}
                            >
                              <SelectTrigger className="ml-auto h-10 w-[150px] border-slate-200 bg-white text-slate-950">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white text-slate-950">
                                {Object.entries(statusLabels).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="grid gap-4 md:hidden">
                {filteredFeedbacks.map((feedback) => {
                  const status = normalizeStatus(feedback.status);
                  const priority = normalizePriority(feedback.priority);

                  return (
                    <article key={feedback.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2">
                          <Badge variant="outline" className={statusClassNames[status]}>
                            {statusLabels[status]}
                          </Badge>
                          <Badge variant="outline" className={priorityClassNames[priority]}>
                            {priorityLabels[priority]}
                          </Badge>
                        </div>
                        <span className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                          <Clock3 className="h-3.5 w-3.5" />
                          {formatDate(feedback.createdAt)}
                        </span>
                      </div>
                      <p className="mt-4 text-sm font-bold text-slate-950">
                        {feedback.categoryLabel ?? feedback.category ?? "Retour"}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-slate-700">{feedback.message}</p>
                      <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-6 text-slate-500">
                        {feedback.createdByEmail ?? "Utilisateur inconnu"}
                        <br />
                        {feedback.displayRole ?? feedback.createdByRole ?? "client"} · {centerLabel(feedback.centerId)}
                        <br />
                        {feedback.pagePath ?? "Page inconnue"}
                      </div>
                      <Select
                        value={status}
                        onValueChange={(value) => handleStatusChange(feedback.id, value as FeedbackStatus)}
                        disabled={updatingId === feedback.id}
                      >
                        <SelectTrigger className="mt-4 h-11 border-slate-200 bg-white text-slate-950">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-slate-950">
                          {Object.entries(statusLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
