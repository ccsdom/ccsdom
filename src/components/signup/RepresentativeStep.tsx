'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
  FormField,
} from '@/components/ui/form';
import {
  Eye,
  EyeOff,
  Info,
  UserCircle,
  Contact,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

import { initializeFirebase } from '@/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useToast } from '@/hooks/use-toast';
import { getLegalStatusLabel } from '@/features/signup/display';

// Définition complète des champs du formulaire
export interface SignupFormValues {
  projectType?: 'creation' | 'transfert';
  firstName?: string;
  lastName?: string;
  address?: string;
  quality?: string;
  legalStatus?: string;
  phone?: string;
  email?: string;
  password?: string;
  otherLegalStatus?: string;
}

export const RepresentativeStep = () => {
  const {
    control,
    getValues,
    setValue,
    setError,
    clearErrors,
    watch,
  } = useFormContext<SignupFormValues>();

  const legalStatus = watch('legalStatus');
  const otherLegalStatus = watch('otherLegalStatus');
  const legalStatusLabel = getLegalStatusLabel(legalStatus, otherLegalStatus);

  const autocompleteInputRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const { toast } = useToast();

  // --- Firebase Functions (callable) ---
  const fb = initializeFirebase();
  const app = (fb as any)?.firebaseApp || (fb as any);
  const functions = getFunctions(app, 'europe-west9');
  const checkSignupUniqueness = httpsCallable<
    { email?: string },
    { ok: boolean; emailExists?: boolean; siretExists?: boolean }
  >(functions, 'checkSignupUniqueness');

  // Autocomplete Google Places pour l'adresse perso
  useEffect(() => {
    if (autocompleteInputRef.current && (window as any).google?.maps?.places) {
      const autocomplete = new (window as any).google.maps.places.Autocomplete(
        autocompleteInputRef.current,
        { types: ['address'], componentRestrictions: { country: 'fr' } }
      );
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.formatted_address) {
          setValue('address', place.formatted_address, {
            shouldValidate: true,
            shouldDirty: true,
          });
        }
      });
    }
  }, [setValue]);

  // 🔎 Vérif d'unicité de l'email (appel Cloud Function)
  const handleCheckEmail = async (rawEmail: string) => {
    const email = rawEmail.trim().toLowerCase();

    if (!email) {
      clearErrors('email');
      return;
    }

    // Vérif format basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('email', {
        type: 'manual',
        message: 'Format d’email invalide.',
      });
      return;
    }

    try {
      setIsCheckingEmail(true);
      clearErrors('email');

      const res = await checkSignupUniqueness({ email });
      const data = (res.data || {}) as any;
      const emailExists = !!data.emailExists;

      if (emailExists) {
        setError('email', {
          type: 'manual',
          message:
            'Cet email est déjà utilisé pour un autre compte. Vous pouvez vous connecter ou utiliser une autre adresse.',
        });

        toast({
          variant: 'destructive',
          title: 'Email déjà utilisé',
          description:
            'Un compte existe déjà avec cette adresse email. Connectez-vous à votre espace CCS-DOM ou choisissez une autre adresse.',
        });
      } else {
        clearErrors('email');
      }
    } catch (e) {
      console.error('[RepresentativeStep] Erreur vérif email', e);
      toast({
        variant: 'destructive',
        title: 'Erreur de vérification',
        description:
          "Impossible de vérifier l’unicité de l’adresse email pour le moment. Merci de réessayer dans quelques instants.",
      });
    } finally {
      setIsCheckingEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      {getValues('projectType') === 'transfert' && (
        <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-4 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 mt-0.5 shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold">
                Veuillez vérifier les informations pré-remplies.
              </h3>
              <p className="text-sm">
                Les informations sur l&apos;entreprise et son représentant ont été extraites des données publiques.
                Complétez les champs restants.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Informations sur le représentant légal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserCircle className="h-5 w-5 text-primary" />
            Représentant Légal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {getValues('projectType') === 'transfert' && (
            legalStatus === 'autres' ? (
              <FormField
                control={control}
                name="otherLegalStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut juridique récupéré</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex. SCI, SNC, association..."
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Statut récupéré depuis les données publiques. Vous pouvez le corriger si nécessaire.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormItem>
                <FormLabel>Statut juridique récupéré</FormLabel>
                <FormControl>
                  <Input value={legalStatusLabel} disabled />
                </FormControl>
                <FormDescription>
                  Statut identifié automatiquement depuis les données publiques.
                </FormDescription>
              </FormItem>
            )
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prénom</FormLabel>
                  <FormControl>
                    <Input placeholder="Jean" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input placeholder="Dupont" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adresse personnelle</FormLabel>
                <FormControl>
                  <Input
                    placeholder="123 Rue de la République, 75001 Paris"
                    {...field}
                    ref={autocompleteInputRef}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="quality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Qualité (ex: Gérant, Président)</FormLabel>
                <FormControl>
                  <Input placeholder="Gérant" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Informations de contact et de connexion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Contact className="h-5 w-5 text-primary" />
            Contact & Connexion
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Téléphone</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="06 12 34 56 78" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email de connexion</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="email"
                        placeholder="jean.dupont@email.com"
                        {...field}
                        onBlur={async (e) => {
                          field.onBlur();
                          await handleCheckEmail(e.target.value);
                        }}
                      />
                      {isCheckingEmail && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          Vérification...
                        </span>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mot de passe</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...field}
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showPassword ? 'Masquer' : 'Afficher'} le mot de passe
                    </span>
                  </Button>
                </div>
                <FormDescription>
                  Au moins 6 caractères. Vous utiliserez cet email et ce mot de passe pour vous connecter.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
};
