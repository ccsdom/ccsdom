'use client';

import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormField,
} from '@/components/ui/form';
import { Search, Building, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { searchCompany } from '@/ai/flows/search-company-flow';
import type { CompanySearchResult } from '@/ai/flows/search-company-flow';

import { initializeFirebase } from '@/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getLegalStatusLabel } from '@/features/signup/display';

const LEGAL_STATUS_MAP: Record<string, string> = {
  SASU: 'sasu',
  SAS: 'sas',
  SARL: 'sarl',
  EURL: 'eurl',
};

function resolveLegalStatusCode(apiStatus?: string | null) {
  const rawStatus = String(apiStatus ?? '').trim();
  const upperStatus = rawStatus.toUpperCase();
  const matchingKey = Object.keys(LEGAL_STATUS_MAP).find((key) =>
    upperStatus.includes(key)
  );

  return matchingKey ? LEGAL_STATUS_MAP[matchingKey] : 'autres';
}

function inferRepresentativeQuality(
  legalStatus: string,
  apiQuality?: string | null
) {
  const rawQuality = String(apiQuality ?? '').trim();
  if (rawQuality && rawQuality.toLowerCase() !== 'n/a') return rawQuality;

  if (legalStatus === 'sarl' || legalStatus === 'eurl') return 'Gérant';
  if (legalStatus === 'sas' || legalStatus === 'sasu') return 'Président';
  if (legalStatus === 'micro') return 'Entrepreneur individuel';
  return 'Représentant légal';
}

export const CompanySearchStep = () => {
  const {
    control,
    setValue,
    trigger,
    getValues,
    setError,
    clearErrors,
  } = useFormContext<any>();

  const { toast } = useToast();

  const [isSearching, setIsSearching] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [searchResults, setSearchResults] = useState<CompanySearchResult>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] =
    useState<CompanySearchResult[number] | null>(null);

  // --- Firebase Functions (callable) ---
  const fb = initializeFirebase();
  const app = (fb as any)?.firebaseApp || (fb as any);
  const functions = getFunctions(app, 'europe-west9');

  const checkSignupUniqueness = httpsCallable<
    { siret?: string; email?: string },
    { ok: boolean; siretExists?: boolean; emailExists?: boolean }
  >(functions, 'checkSignupUniqueness');

  const handleSearchCompany = async () => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await searchCompany({ query: searchQuery });
      setSearchResults(results);
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Erreur de recherche',
        description: "Impossible de rechercher l'entreprise.",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleCompanySelect = async (company: CompanySearchResult[number]) => {
    try {
      setIsChecking(true);

      // email éventuellement déjà saisi dans l’étape suivante
      const currentEmail =
        (getValues('email') as string | undefined)?.trim().toLowerCase() || '';

      // 1) Vérif unicité SIRET / email via Cloud Function
      const res = await checkSignupUniqueness({
        siret: company.siret,
        email: currentEmail || undefined,
      });

      const data = res.data || {};
      const siretExists = !!(data as any).siretExists;
      const emailExists = !!(data as any).emailExists;

      // 🔴 SIRET déjà utilisé → on bloque ici
      if (siretExists) {
        setError('siret', {
          type: 'manual',
          message:
            'Ce SIRET est déjà associé à une autre demande ou à un client existant.',
        });

        // on évite d’appliquer la sélection
        toast({
          variant: 'destructive',
          title: 'SIRET déjà utilisé',
          description:
            "Ce SIRET est déjà associé à une autre demande ou un client existant. Vérifiez vos informations ou contactez-nous.",
        });
        return;
      } else {
        // SIRET OK → on nettoie une éventuelle erreur précédente
        clearErrors('siret');
      }

      // 🟠 Email déjà utilisé (si fourni à ce stade) → info mais non bloquant ici
      if (emailExists) {
        toast({
          variant: 'destructive',
          title: 'Email déjà utilisé',
          description:
            "Cet email est déjà utilisé pour une autre demande. Il sera bloqué à l'étape Représentant légal si vous le conservez.",
        });
        // On NE bloque pas ici : la vraie vérif bloquante de l'email
        // est dans RepresentativeStep.
      }

      // 2) ✅ Tout est OK côté SIRET → on applique la sélection
      setSelectedCompany(company);

      const directorName = company.director || '';
      const nameParts = directorName.split(' ').filter((p) => p);
      const lastName = nameParts.pop() || '';
      const firstName = nameParts.join(' ');

      setValue('companyIdentifier', company.siret);
      setValue('companyName', company.name);
      setValue('siret', company.siret);
      setValue('address', company.address);
      if (company.shareCapital !== undefined)
        setValue('shareCapital', company.shareCapital);
      setValue('firstName', firstName);
      setValue('lastName', lastName);

      const apiStatus = company.legalStatus || '';
      const formStatus = resolveLegalStatusCode(apiStatus);
      const representativeQuality = inferRepresentativeQuality(
        formStatus,
        company.directorQuality
      );

      setValue('legalStatus', formStatus, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue('otherLegalStatus', formStatus === 'autres' ? apiStatus : '', {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue('quality', representativeQuality, {
        shouldDirty: true,
        shouldValidate: true,
      });

      // on revalide l’étape
      trigger(['siret', 'companyName', 'address']);
    } catch (e) {
      console.error('[CompanySearchStep] Erreur vérif unicité', e);
      toast({
        variant: 'destructive',
        title: 'Erreur de vérification',
        description:
          "Impossible de vérifier l’unicité de l’entreprise. Merci de réessayer dans quelques instants.",
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="space-y-6">
      <FormItem>
        <FormLabel>
          Rechercher votre entreprise par nom ou SIRET
        </FormLabel>
        <div className="flex gap-2">
          <Input
            placeholder="Nom ou SIRET..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearchCompany();
              }
            }}
          />
          <Button
            type="button"
            onClick={handleSearchCompany}
            disabled={isSearching}
          >
            {isSearching ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Search />
            )}
            <span className="sr-only">Rechercher</span>
          </Button>
        </div>
      </FormItem>

      <div className="space-y-3">
        {isSearching && (
          <div className="text-center text-muted-foreground">
            Recherche en cours...
          </div>
        )}

        {isChecking && !isSearching && (
          <div className="text-center text-muted-foreground text-xs">
            Vérification de l&apos;unicité de l&apos;entreprise...
          </div>
        )}

        {!isSearching && searchResults.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Sélectionnez votre entreprise parmi les résultats :
          </p>
        )}

        {searchResults.map((company) => (
          <Button
            key={company.siret}
            variant="outline"
            className="w-full h-auto justify-start text-left p-4"
            onClick={() => handleCompanySelect(company)}
            disabled={isChecking}
          >
            <Building className="mr-4 h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold">{company.name}</p>
              <p className="text-xs text-muted-foreground">
                {company.address}
              </p>
            </div>
          </Button>
        ))}
      </div>

      {selectedCompany && (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              Informations sur l&apos;entreprise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dénomination</FormLabel>
                    <Input {...field} disabled />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="siret"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SIRET</FormLabel>
                    <Input {...field} disabled />
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
                  <FormLabel>Adresse du siège</FormLabel>
                  <Input {...field} disabled />
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name="otherLegalStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut Juridique</FormLabel>
                    <Input
                      value={getLegalStatusLabel(
                        getValues('legalStatus'),
                        field.value
                      )}
                      disabled
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="shareCapital"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capital Social</FormLabel>
                    <Input type="number" {...field} disabled />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
