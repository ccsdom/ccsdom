"use client";

import * as React from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { MessageSquareWarning, SendHorizonal } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useFirebase } from "@/firebase";
import { useCenterAccess } from "@/hooks/use-center-access";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type FeedbackCategory = "bug" | "ui" | "data" | "idea" | "other";
type FeedbackPriority = "normal" | "important" | "blocking";

const categoryLabels: Record<FeedbackCategory, string> = {
  bug: "Bug ou erreur",
  ui: "Lisibilité / interface",
  data: "Donnée incorrecte",
  idea: "Suggestion",
  other: "Autre",
};

const priorityLabels: Record<FeedbackPriority, string> = {
  normal: "Normal",
  important: "Important",
  blocking: "Bloquant",
};

export function BetaFeedbackButton({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const pathname = usePathname();
  const { firestore, user } = useFirebase();
  const centerAccess = useCenterAccess();
  const { toast } = useToast();

  const [open, setOpen] = React.useState(false);
  const [category, setCategory] = React.useState<FeedbackCategory>("bug");
  const [priority, setPriority] = React.useState<FeedbackPriority>("normal");
  const [message, setMessage] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const canSubmit = message.trim().length >= 10 && !isSubmitting;

  const handleSubmit = async () => {
    if (!user || !firestore || !canSubmit) return;

    setIsSubmitting(true);

    try {
      const now = serverTimestamp();
      const centerIds = centerAccess.actualManagedCenterIds ?? centerAccess.managedCenterIds ?? [];

      await addDoc(collection(firestore, "beta_feedback"), {
        category,
        categoryLabel: categoryLabels[category],
        priority,
        priorityLabel: priorityLabels[priority],
        message: message.trim(),
        status: "new",
        source: "in_app_beta_feedback",
        pagePath: pathname,
        pageUrl: typeof window !== "undefined" ? window.location.href : pathname,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
        createdByUid: user.uid,
        createdByEmail: user.email ?? null,
        createdByRole: centerAccess.actualRole ?? "client",
        displayRole: centerAccess.displayRole ?? centerAccess.actualRole ?? "client",
        centerId: centerIds[0] ?? centerAccess.actualManagedAddressId ?? centerAccess.managedAddressId ?? null,
        centerIds,
        createdAt: now,
        updatedAt: now,
      });

      toast({
        title: "Retour transmis",
        description: "Merci, le super admin pourra le suivre dans le cockpit bêta.",
      });

      setMessage("");
      setCategory("bug");
      setPriority("normal");
      setOpen(false);
    } catch (error) {
      console.error("[BetaFeedbackButton] Failed to submit feedback:", error);
      toast({
        variant: "destructive",
        title: "Envoi impossible",
        description: "Le retour n'a pas pu être enregistré. Réessayez dans quelques instants.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size={compact ? "icon" : "sm"}
          className={cn(
            "border-amber-200 bg-amber-50 text-amber-800 shadow-sm hover:bg-amber-100 hover:text-amber-900",
            compact ? "h-10 w-10 rounded-xl" : "hidden rounded-xl px-3 font-bold sm:inline-flex",
            className
          )}
          aria-label="Signaler un problème"
        >
          <MessageSquareWarning className={cn("h-4 w-4", !compact && "mr-2")} />
          {!compact ? "Signaler" : null}
        </Button>
      </DialogTrigger>

      <DialogContent className="border-slate-200 bg-white text-slate-950 shadow-2xl sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight">
            Signaler un problème
          </DialogTitle>
          <DialogDescription className="leading-6 text-slate-600">
            Décrivez ce que vous venez de constater. La page actuelle, votre rôle et le contexte
            seront joints automatiquement pour faciliter le diagnostic.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                Type de retour
              </label>
              <Select value={category} onValueChange={(value) => setCategory(value as FeedbackCategory)}>
                <SelectTrigger className="h-11 border-slate-200 bg-white text-slate-950">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white text-slate-950">
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                Priorité
              </label>
              <Select value={priority} onValueChange={(value) => setPriority(value as FeedbackPriority)}>
                <SelectTrigger className="h-11 border-slate-200 bg-white text-slate-950">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white text-slate-950">
                  {Object.entries(priorityLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
              Description
            </label>
            <Textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={1800}
              placeholder="Exemple : sur mobile, le bouton de validation déborde de l'écran après avoir filtré les dossiers Paris..."
              className="min-h-36 border-slate-200 bg-white text-slate-950 placeholder:text-slate-400"
            />
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Minimum 10 caractères.</span>
              <span>{message.length}/1800</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            Page : <span className="font-bold text-slate-950">{pathname}</span>
            <br />
            Rôle :{" "}
            <span className="font-bold text-slate-950">
              {centerAccess.displayRole ?? centerAccess.actualRole ?? "client"}
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            className="border-slate-200 bg-white text-slate-700"
            onClick={() => setOpen(false)}
          >
            Annuler
          </Button>
          <Button type="button" disabled={!canSubmit} onClick={handleSubmit}>
            <SendHorizonal className="mr-2 h-4 w-4" />
            {isSubmitting ? "Envoi..." : "Envoyer le retour"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
