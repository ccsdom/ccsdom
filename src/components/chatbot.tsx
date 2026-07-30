"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, Send, User } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "bot";
  content: string;
};

export type SupportAssistantContext = {
  companyName?: string;
  centerLabel?: string;
  supportEmail?: string;
  supportPhone?: string;
  subscriptionStatus?: string;
  paymentStatus?: string;
  contractStatus?: string;
  attestationStatus?: string;
  hasContract?: boolean;
  hasAttestation?: boolean;
  accessProvisioned?: boolean;
};

type ChatbotProps = {
  className?: string;
  context?: SupportAssistantContext;
  suggestedPrompts?: string[];
};

const defaultPrompts = [
  "Je ne vois pas ma facture",
  "J'ai recu un courrier urgent",
  "Je veux mon attestation",
  "Probleme de connexion",
];

function statusLabel(value?: string) {
  const normalized = String(value || "").trim().toLowerCase();

  if (!normalized) return "non renseigne";
  if (normalized === "complete") return "disponible";
  if (normalized === "processing" || normalized === "queued" || normalized === "pending") {
    return "en generation";
  }
  if (normalized === "error") return "en erreur";
  if (normalized === "paid" || normalized === "active") return "actif";

  return value || "non renseigne";
}

function buildGreeting(context?: SupportAssistantContext): string {
  const center = context?.centerLabel ? `Centre detecte : ${context.centerLabel}. ` : "";
  const company = context?.companyName ? `Societe : ${context.companyName}. ` : "";

  return `${center}${company}Choisissez une demande ci-dessous ou posez votre question. Je vous oriente vers la bonne action.`;
}

function buildSupportReply(rawInput: string, context?: SupportAssistantContext): string {
  const input = rawInput.toLowerCase();
  const supportLine = context?.supportEmail
    ? `ecrivez au support : ${context.supportEmail}`
    : "ecrivez au support depuis le bouton de la page";

  if (input.includes("facture") || input.includes("paiement") || input.includes("abonnement")) {
    const payment = statusLabel(context?.paymentStatus);
    const subscription = statusLabel(context?.subscriptionStatus);

    return `Votre paiement est indique "${payment}" et votre abonnement "${subscription}". Ouvrez Facturation pour telecharger les factures, ou Abonnement pour modifier la formule. Si le PDF ne s'ouvre pas, ${supportLine}.`;
  }

  if (input.includes("courrier") || input.includes("mail") || input.includes("recommand")) {
    const phone = context?.supportPhone ? ` au ${context.supportPhone}` : "";

    return `Ouvrez Courrier pour consulter le resume, telecharger le fichier et verifier son statut. En cas de recommande ou de delai, appelez le centre${phone}, puis envoyez un e-mail recapitulatif.`;
  }

  if (input.includes("contrat") || input.includes("attestation") || input.includes("document")) {
    const contract = context?.hasContract
      ? "contrat disponible"
      : `contrat ${statusLabel(context?.contractStatus)}`;
    const attestation = context?.hasAttestation
      ? "attestation disponible"
      : `attestation ${statusLabel(context?.attestationStatus)}`;

    return `Etat detecte : ${contract}, ${attestation}. Ouvrez Documents pour les consulter. Si un fichier reste absent ou en erreur, ${supportLine}.`;
  }

  if (input.includes("urgent") || input.includes("urgence") || input.includes("delai")) {
    const phone = context?.supportPhone ? ` au ${context.supportPhone}` : "";

    return `Pour une urgence, appelez le centre${phone}, puis envoyez un e-mail avec le nom de la societe, l'objet, la date limite et le document concerne.`;
  }

  if (input.includes("mot de passe") || input.includes("connexion") || input.includes("acces")) {
    const access = context?.accessProvisioned === false ? "semble encore a verifier" : "semble provisionne";

    return `Votre acces ${access}. Utilisez d'abord le lien de reinitialisation du mot de passe sur la page de connexion. Si l'acces reste bloque, ${supportLine}.`;
  }

  return `Je peux vous orienter sur les sujets courants : courrier, facture, abonnement, contrat, attestation, documents ou acces. Si la demande est specifique, ${supportLine}.`;
}

export function Chatbot({ className, context, suggestedPrompts }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prompts = suggestedPrompts?.length ? suggestedPrompts : defaultPrompts;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setMessages([{ role: "bot", content: buildGreeting(context) }]);
  }, [context?.centerLabel, context?.companyName]);

  const submitQuestion = (question: string) => {
    const cleanQuestion = question.trim();
    if (!cleanQuestion || isLoading) return;

    setMessages((prev) => [...prev, { role: "user", content: cleanQuestion }]);
    setInput("");
    setIsLoading(true);

    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: buildSupportReply(cleanQuestion, context) },
      ]);
      setIsLoading(false);
    }, 350);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    submitQuestion(input);
  };

  return (
    <Card
      className={cn(
        "flex h-[min(620px,calc(100dvh-10rem))] flex-col border-slate-200 bg-white shadow-sm",
        className
      )}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-950">
          <Bot className="h-5 w-5 text-primary" />
          CCSBot - Support Client
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto pr-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={cn(
                "flex items-start gap-3",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "bot" && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "max-w-sm rounded-2xl px-4 py-2 text-sm font-medium leading-6",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-slate-100 text-slate-800"
                )}
              >
                {message.content}
              </div>
              {message.role === "user" && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-slate-100 text-slate-700">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start justify-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex rounded-2xl bg-slate-100 px-4 py-3">
                <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-3 border-t border-slate-200 pt-4">
        <div className="flex flex-wrap gap-2">
          {prompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => submitQuestion(prompt)}
              disabled={isLoading}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-primary/30 hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {prompt}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
          <Input
            id="message"
            placeholder="Ex : Je ne vois pas ma facture..."
            className="h-11 flex-1 rounded-xl border-slate-200 bg-white text-slate-950 placeholder:text-slate-400"
            autoComplete="off"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            className="h-11 w-11 rounded-xl"
            disabled={isLoading || !input.trim()}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Envoyer</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
