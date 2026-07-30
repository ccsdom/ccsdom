"use client";

import { Fragment, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { Bot, Loader2, MessageSquare, Send, Sparkles, User } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useFirebase } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "bot";
  content: string;
};

type AskChatbotResponse = {
  reply?: string;
  fallback?: boolean;
};

const welcomeMessage: Message = {
  role: "bot",
  content:
    [
      "Bonjour, je suis l'assistant CCS DOM.",
      "- Domiciliation d'entreprise.",
      "- Centres disponibles et tarifs.",
      "- Courrier digital, creation ou transfert de societe.",
      "Posez votre question ou choisissez un sujet ci-dessous.",
    ].join("\n"),
};

const quickQuestions = [
  "Quelles sont vos offres ?",
  "Quels centres sont disponibles ?",
  "Comment fonctionne le courrier digital ?",
];

function FormattedBotMessage({ content }: { content: string }) {
  const lines = content
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length <= 1) {
    return <p>{content}</p>;
  }

  const blocks: ReactNode[] = [];
  let bullets: string[] = [];

  const flushBullets = (key: string) => {
    if (!bullets.length) return;

    blocks.push(
      <ul key={key} className="space-y-1.5 pl-1">
        {bullets.map((bullet, index) => (
          <li key={`${key}-${index}`} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    );
    bullets = [];
  };

  lines.forEach((line, index) => {
    const bulletMatch = line.match(/^[-•]\s+(.*)$/);

    if (bulletMatch?.[1]) {
      bullets.push(bulletMatch[1]);
      return;
    }

    flushBullets(`bullets-${index}`);

    const isNextStep = /^prochaine etape\s*:/i.test(line) || /^prochaine étape\s*:/i.test(line);

    blocks.push(
      <p
        key={`line-${index}`}
        className={cn(
          "leading-relaxed",
          isNextStep &&
            "rounded-xl border border-primary/15 bg-primary/5 px-3 py-2 text-[0.82rem] font-medium text-primary"
        )}
      >
        {line}
      </p>
    );
  });

  flushBullets("bullets-end");

  return (
    <div className="space-y-2.5">
      {blocks.map((block, index) => (
        <Fragment key={index}>{block}</Fragment>
      ))}
    </div>
  );
}

export default function HomeChatbot() {
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { firebaseApp } = useFirebase();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    const cleanText = text.trim();
    if (!cleanText || isLoading) return;

    if (!firebaseApp) {
      toast({
        variant: "destructive",
        title: "Service indisponible",
        description: "Le service de chat n'est pas initialise.",
      });
      return;
    }

    const userMessage: Message = { role: "user", content: cleanText };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const functions = getFunctions(firebaseApp, "europe-west9");
      const askChatbotFunction = httpsCallable<
        { message: string; history: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> },
        AskChatbotResponse
      >(functions, "askChatbot");

      const history = messages
        .slice(-8)
        .map((message) => ({
          role: message.role === "bot" ? ("model" as const) : ("user" as const),
          parts: [{ text: message.content }],
        }));

      const result = await askChatbotFunction({ message: cleanText, history });
      const reply = result.data?.reply?.trim();

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content:
            reply ||
            "Je peux vous aider sur la domiciliation, les centres, les tarifs ou le courrier digital. Voulez-vous commencer une inscription ?",
        },
      ]);
    } catch (error) {
      console.error("Chatbot error:", error);
      toast({
        variant: "destructive",
        title: "Assistant indisponible",
        description: "Je vous propose une reponse de secours.",
      });
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content:
            [
              "Je peux encore vous orienter avec les informations essentielles.",
              "- Centres disponibles : Orly Ville et Paris 12e.",
              "- Services : domiciliation, documents, courrier digital et accompagnement.",
              "- Pour une reponse precise, contactez aussi l'equipe CCS DOM depuis la page Contact.",
            ].join("\n"),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await sendMessage(input);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-6 right-5 z-50 h-14 w-14 rounded-full shadow-2xl sm:bottom-8 sm:right-8 sm:h-16 sm:w-16"
          aria-label="Ouvrir l'assistant CCS DOM"
        >
          <MessageSquare className="h-7 w-7 sm:h-8 sm:w-8" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        className="mb-2 mr-2 w-[calc(100vw-1rem)] max-w-[440px] p-0 sm:mr-4"
      >
        <Card className="flex h-[72vh] max-h-[640px] min-h-[480px] flex-col overflow-hidden border-0 shadow-2xl">
          <CardHeader className="border-b bg-slate-50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="text-primary" />
              Assistant CCS DOM
            </CardTitle>
            <p className="text-xs font-medium text-muted-foreground">
              Questions rapides sur la domiciliation, les offres et le courrier.
            </p>
          </CardHeader>
          <CardContent className="flex-grow overflow-y-auto p-4">
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
                    <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                      <AvatarFallback>
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "max-w-[78%] rounded-2xl px-4 py-2 text-sm leading-relaxed shadow-sm",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "border border-slate-200 bg-white text-slate-800"
                    )}
                  >
                    {message.role === "bot" ? (
                      <FormattedBotMessage content={message.content} />
                    ) : (
                      message.content
                    )}
                  </div>
                  {message.role === "user" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {messages.length === 1 && (
                <div className="flex flex-wrap gap-2 pl-11">
                  {quickQuestions.map((question) => (
                    <Button
                      key={question}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-full text-xs"
                      onClick={() => sendMessage(question)}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              )}

              {isLoading && (
                <div className="flex items-start justify-start gap-3">
                  <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center rounded-2xl bg-muted px-4 py-2">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
          <CardFooter className="border-t p-4">
            <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
              <Input
                id="message"
                placeholder="Posez votre question..."
                className="flex-1"
                autoComplete="off"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Envoyer</span>
              </Button>
            </form>
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
