"use client";

import * as React from "react";
import { 
  Sparkles, 
  Loader2, 
  AlertTriangle, 
  CheckCircle2, 
  Lightbulb, 
  BrainCircuit,
  ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { httpsCallable, getFunctions } from "firebase/functions";
import { useFirebase } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AiAnalysisResult {
  summary: string;
  statusInsight: string;
  warnings: string[];
  recommendations: string[];
  riskLevel: "low" | "medium" | "high";
}

interface AiClientInsightsProps {
  client: any;
  className?: string;
}

export function AiClientInsights({ client, className }: AiClientInsightsProps) {
  const { firebaseApp } = useFirebase();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<AiAnalysisResult | null>(null);

  const handleRunAnalysis = async () => {
    if (!firebaseApp) return;
    
    setLoading(true);
    setResult(null);

    try {
      const functions = getFunctions(firebaseApp, "europe-west9");
      const analyzeClientFn = httpsCallable<{ clientData: any }, AiAnalysisResult>(
        functions, 
        "analyzeClient"
      );

      const response = await analyzeClientFn({ clientData: client });
      setResult(response.data);
      
      toast({
        title: "Analyse terminée",
        description: "L'IA a terminé l'analyse du dossier client.",
      });
    } catch (error: any) {
      console.error("AI Analysis error:", error);
      toast({
        variant: "destructive",
        title: "Erreur d'analyse",
        description: error.message || "Impossible de contacter l'assistant IA.",
      });
    } finally {
      setLoading(false);
    }
  };

  const riskColor = {
    low: "bg-green-100 text-green-700 border-green-200",
    medium: "bg-amber-100 text-amber-700 border-amber-200",
    high: "bg-red-100 text-red-700 border-red-200",
  }[result?.riskLevel || "low"];

  return (
    <Card className={cn("overflow-hidden border-primary/20 bg-gradient-to-br from-background to-primary/5 shadow-xl", className)}>
      <CardHeader className="pb-3 border-b border-primary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BrainCircuit className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Copilote IA Admin</CardTitle>
              <CardDescription>Analyse intelligente du dossier client</CardDescription>
            </div>
          </div>
          
          <Button 
            onClick={handleRunAnalysis} 
            disabled={loading}
            size="sm"
            className="group relative"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2 group-hover:animate-pulse" />
            )}
            {result ? "Relancer l'Analyse" : "Lancer l'Analyse"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6 relative min-h-[100px]">
        {!result && !loading && (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <Sparkles className="h-12 w-12 mb-4 opacity-20" />
            <p className="text-sm max-w-[280px]">
              Utilisez la puissance de Gemini pour analyser les données de ce client et détecter d'éventuels points de vigilance.
            </p>
          </div>
        )}

        {loading && (
          <div className="space-y-4 py-4 animate-in fade-in duration-500">
            <div className="h-4 w-3/4 bg-primary/10 rounded animate-pulse" />
            <div className="h-20 w-full bg-primary/5 rounded animate-pulse" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-12 w-full bg-primary/5 rounded animate-pulse" />
              <div className="h-12 w-full bg-primary/5 rounded animate-pulse" />
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
            {/* Summary Block */}
            <div className="bg-background/50 backdrop-blur-sm p-4 rounded-xl border border-primary/10 shadow-sm">
              <div className="flex items-center gap-2 mb-2 font-semibold text-primary">
                <CheckCircle2 className="h-4 w-4" />
                Synthèse
              </div>
              <p className="text-sm leading-relaxed">{result.summary}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Status Insight */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  Statut & Risque
                  <Badge variant="outline" className={cn("text-[10px] py-0", riskColor)}>
                    Risque {result.riskLevel === 'high' ? 'Élevé' : result.riskLevel === 'medium' ? 'Modéré' : 'Faible'}
                  </Badge>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg text-sm italic">
                  "{result.statusInsight}"
                </div>
              </div>

              {/* Warnings */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <ShieldAlert className="h-3 w-3" />
                  Points de vigilance
                </div>
                <ul className="space-y-1">
                  {result.warnings.map((w, i) => (
                    <li key={i} className="text-sm flex items-start gap-2 text-destructive">
                      <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <span>{w}</span>
                    </li>
                  ))}
                  {result.warnings.length === 0 && (
                    <li className="text-sm text-green-600 flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Aucune anomalie détectée
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* Recommendations */}
            <div className="pt-2 border-t border-primary/10">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <Lightbulb className="h-3 w-3 text-amber-500" />
                Actions Recommandées
              </div>
              <div className="flex flex-wrap gap-2">
                {result.recommendations.map((r, i) => (
                  <Badge key={i} variant="secondary" className="bg-primary/5 hover:bg-primary/10 text-primary border-primary/20 py-1">
                    {r}
                  </Badge>
                ))}
              </div>
            </div>
            
            <p className="text-[10px] text-center text-muted-foreground pt-2 italic">
              Analyse générée par Gemini 1.5 Flash. Vérifiez toujours les informations critiques.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
