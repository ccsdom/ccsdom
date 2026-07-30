'use client';

import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FormControl, FormItem, FormLabel, FormMessage, FormField } from '@/components/ui/form';
import { Loader2, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { suggestCompanyNames, checkCompanyName } from '@/services/signup-service';
import { useFirebase } from '@/firebase';
import { getFunctions } from 'firebase/functions';

interface SignupFormValues {
  companyName: string;
  activityDescription: string;
  quality: string;
  legalStatus: string;
  otherLegalStatus?: string;
}

interface NameAvailability {
  isAvailable: boolean;
  reason?: string;
}

export const DenominationStep = () => {
  const { control, watch, setValue, setError, getValues } = useFormContext<SignupFormValues>();
  const { toast } = useToast();
  const { firebaseApp } = useFirebase();

  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [nameAvailability, setNameAvailability] = useState<NameAvailability | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const watchedCompanyName = watch('companyName');

  useEffect(() => {
    setNameAvailability(null);
  }, [watchedCompanyName]);

  const handleSuggestNames = async () => {
    const activityDescription = getValues('activityDescription');
    if (!activityDescription) {
      setError('activityDescription', {
        type: 'manual',
        message: 'Veuillez décrire votre activité pour obtenir des suggestions.',
      });
      return;
    }
    if (!firebaseApp) return;
    const functions = getFunctions(firebaseApp, 'europe-west1');
    setIsSuggesting(true);
    setSuggestions([]);
    try {
      const result = await suggestCompanyNames({ activityDescription }, functions);
      setSuggestions(result.suggestions);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erreur de suggestion',
        description: 'Impossible de générer des suggestions.',
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleCheckName = async () => {
    const companyName = getValues('companyName');
    if (!companyName) {
      setError('companyName', {
        type: 'manual',
        message: "Veuillez entrer un nom d'entreprise.",
      });
      return;
    }
    if (!firebaseApp) return;
    const functions = getFunctions(firebaseApp, 'europe-west1');
    setIsCheckingName(true);
    setNameAvailability(null);
    try {
      const result = await checkCompanyName({ companyName }, functions);
      setNameAvailability(result);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erreur de vérification',
        description: 'Impossible de vérifier la disponibilité du nom.',
      });
    } finally {
      setIsCheckingName(false);
    }
  };

  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="companyName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Dénomination sociale ou Nom de l'entreprise</FormLabel>
            <FormControl>
              <div className="relative">
                <Input placeholder="Ex: CCS DOM" {...field} />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7"
                  onClick={handleCheckName}
                  disabled={isCheckingName || !field.value}
                  aria-label="Vérifier la disponibilité du nom"
                >
                  {isCheckingName ? <Loader2 className="animate-spin" /> : 'Vérifier'}
                </Button>
              </div>
            </FormControl>
            {nameAvailability && (
              <div
                className={cn(
                  'flex items-center gap-2 text-sm mt-2',
                  nameAvailability.isAvailable ? 'text-green-600' : 'text-destructive'
                )}
              >
                {nameAvailability.isAvailable ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <span>
                  {nameAvailability.isAvailable
                    ? 'Ce nom est probablement disponible.'
                    : `Ce nom n'est probablement pas disponible. ${
                        nameAvailability.reason || ''
                      }`}
                </span>
              </div>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <FormField
            control={control}
            name="activityDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Besoin d'inspiration ? Décrivez votre activité.</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Ex: Une entreprise de conseil en stratégie digitale pour les PME"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="button"
            onClick={handleSuggestNames}
            disabled={isSuggesting}
            className="mt-4"
            aria-label="Suggérer des noms d'entreprise"
          >
            {isSuggesting ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2" />}
            Suggérer des noms
          </Button>

          {suggestions.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="font-medium">Suggestions :</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestions.map((name, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start"
                    onClick={() =>
                      setValue('companyName', name, { shouldValidate: true })
                    }
                    aria-label={`Choisir la suggestion ${name}`}
                  >
                    {name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
