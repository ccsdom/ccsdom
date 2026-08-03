'use client';

import * as React from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  PlusCircle, Loader2, Users, MoreHorizontal, Trash2, Pencil,
  ArrowUpDown, Search, Check, ChevronsUpDown,
} from 'lucide-react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter,
} from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import {
  collection, addDoc, Timestamp, doc, deleteDoc, updateDoc,
  query, where, getDoc, getDocs,
  type Query as FsQuery, type DocumentData,
} from 'firebase/firestore';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { searchCompany } from '@/ai/flows/search-company-flow';
import { useRole } from '@/hooks/use-simulated-role';
import { useCenterAccess } from '@/hooks/use-center-access';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { useAuth, useDb, useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { AddressAutocomplete } from '@/components/address-autocomplete';
import { SubscriptionPlanBadge, SubscriptionPlanLegend } from '@/components/subscription-plan-badge';
import { resolveMailPlanId, type MailPlanId } from '@/lib/plans';

/* =========================
   Types & constantes
========================= */

export type ClientStatus = 'Actif' | 'Inactif' | 'Suspendu' | 'En attente de validation';
export type UserRole =
  | 'client'
  | 'manager_paris'
  | 'manager_orly'
  | 'secretary_paris'
  | 'secretary_orly'
  | 'super_admin';

// Client Firestore
export interface Client {
  id?: string;
  uid?: string;
  name: string;
  siret: string;
  representative: string;
  email: string;
  phone: string;
  legalStatus?: string;
  representativeQuality?: string;
  representativeAddress?: string;
  personalAddress?: string;
  homeAddress?: string;
  address?: string;
  shareCapital?: string;
  plan: 'classic' | 'starter' | 'business' | 'premium';
  paymentFrequency?: 'monthly' | 'yearly';
  status: ClientStatus;
  joinDate: any;
  domiciliationAddressId: 'paris_12e' | 'orly_ville';
  documents?: {
    kbis?: string;
    identityCard?: string;
    proofOfAddress?: string;
    contract?: string;
  };
}

// User Firestore
export interface User {
  id: string;
  uid: string;
  email: string;
  role: UserRole;
  createdAt: Timestamp;
  displayName?: string;
  managedAddressId?: string;
  managedCenterIds?: string[];
}

// ClientRequest Firestore (pour l’onglet Demandes si tu l’utilises)
export type ClientRequestStatus = 'pending_validation' | 'approved' | 'rejected';
export interface ClientRequest {
  id?: string;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  representative?: string;
  email: string;
  phone?: string;
  siret?: string;
  addressId: 'paris_12e' | 'orly_ville';
  createdAt?: Timestamp;
  status: ClientRequestStatus;
  kbisUrl?: string | null;
  signatureUrl?: string | null;
}

const addresses: { id: 'paris_12e' | 'orly_ville'; name: string }[] = [
  { id: 'paris_12e' as const, name: 'CCS Partner - Paris 12e' },
  { id: 'orly_ville' as const, name: 'CCS - Orly Ville' },
];

const addressKeyForAddressId = (addressId: 'paris_12e' | 'orly_ville') =>
  addressId === 'paris_12e' ? 'paris' : 'orly';

/** ✅ Map typée pour Badge.variant (corrige TS2322) */
type BadgeVariant = React.ComponentProps<typeof Badge>['variant'];
const STATUS_BADGE_VARIANT: Record<ClientStatus, BadgeVariant> = {
  Actif: 'default',
  Inactif: 'secondary',
  Suspendu: 'destructive',
  'En attente de validation': 'outline',
} as const;

/* =========================
   Schemas formulaire
========================= */

const addClientSchema = z.object({
  email: z.string().email({ message: "L'email est invalide." }),
  password: z.string().min(6, { message: 'Le mot de passe doit faire au moins 6 caractères.' }),
  name: z.string().min(2, 'La raison sociale est requise.'),
  siret: z.string().min(14, 'Le SIRET est requis.'),
  representative: z.string().min(2, 'Le représentant est requis.'),
  representativeAddress: z.string().min(8, 'L’adresse personnelle du représentant est requise.'),
  legalStatus: z.string().min(2, 'Le statut juridique est requis.'),
  representativeQuality: z.string().min(2, 'La qualité du représentant est requise.'),
  shareCapital: z.string().optional(),
  phone: z.string().min(10, 'Le téléphone est requis.'),
  plan: z.enum(['classic', 'starter', 'business', 'premium']),
  paymentFrequency: z.enum(["monthly", "yearly"]),
  status: z.enum(['Actif', 'Inactif', 'Suspendu', 'En attente de validation']),
});

const editClientSchema = z.object({
  name: z.string().min(2, 'La raison sociale est requise.'),
  siret: z.string().min(14, 'Le SIRET est requis.'),
  representative: z.string().min(2, 'Le représentant est requis.'),
  phone: z.string().min(10, 'Le téléphone est requis.'),
  plan: z.enum(['classic', 'starter', 'business', 'premium']),
  status: z.enum(['Actif', 'Inactif', 'Suspendu', 'En attente de validation']),
});

type AddClientFormValues = z.infer<typeof addClientSchema>;
type EditClientFormValues = z.infer<typeof editClientSchema>;
type CompanySearchResult = Awaited<ReturnType<typeof searchCompany>>[number];

/* =========================
   Dialogs
========================= */

const EditClientDialog = ({
  client, onClientUpdated, isOpen, onOpenChange,
}: {
  client: Client;
  onClientUpdated: (clientId: string, data: EditClientFormValues) => Promise<void>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const form = useForm<EditClientFormValues>({
    resolver: zodResolver(editClientSchema),
    defaultValues: {
      name: client.name,
      siret: client.siret,
      representative: client.representative,
      phone: client.phone,
      plan: client.plan,
      status: client.status,
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        name: client.name,
        siret: client.siret,
        representative: client.representative,
        phone: client.phone,
        plan: client.plan,
        status: client.status,
      });
    }
  }, [form, isOpen, client]);

  const onSubmit = async (values: EditClientFormValues) => {
    if (!client.id) return;
    await onClientUpdated(client.id, values);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Modifier le client</DialogTitle>
          <DialogDescription>
            Mettez à jour les informations pour <span className="font-bold">{client.name}</span>.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} id="edit-client-form" className="space-y-4">
            <FormField name="name" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Raison sociale</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}/>
            <FormField name="siret" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>SIRET</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}/>
            <FormField name="representative" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Représentant Légal</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}/>
            <FormField name="phone" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}/>
            <div className="grid grid-cols-2 gap-4">
              <FormField name="plan" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Offre</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="classic">Classic</SelectItem>
                      <SelectItem value="starter">Starter</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField name="status" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Statut</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Actif">Actif</SelectItem>
                      <SelectItem value="Inactif">Inactif</SelectItem>
                      <SelectItem value="Suspendu">Suspendu</SelectItem>
                      <SelectItem value="En attente de validation">En attente de validation</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}/>
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button type="submit" form="edit-client-form" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const AddClientDialog = ({
  onClientAdded, addressId,
}: {
  onClientAdded: (userData: AddClientFormValues, addressId: 'paris_12e' | 'orly_ville') => Promise<void>;
  addressId: 'paris_12e' | 'orly_ville';
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState<CompanySearchResult[]>([]);
  const [isComboboxOpen, setIsComboboxOpen] = React.useState(false);
  const [selectedCompany, setSelectedCompany] = React.useState<CompanySearchResult | null>(null);

  const form = useForm<AddClientFormValues>({
    resolver: zodResolver(addClientSchema),
    defaultValues: {
      email: '', password: '', plan: 'classic', paymentFrequency: 'monthly', status: 'Actif',
      name: '', siret: '', representative: '', representativeAddress: '', legalStatus: '', representativeQuality: 'Gérant', shareCapital: '', phone: '',
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        email: '', password: '', plan: 'classic', paymentFrequency: 'monthly', status: 'Actif',
        name: '', siret: '', representative: '', representativeAddress: '', legalStatus: '', representativeQuality: 'Gérant', shareCapital: '', phone: '',
      });
      setSelectedCompany(null);
      setSearchResults([]);
    }
  }, [form, isOpen]);

  const onSubmit = async (values: AddClientFormValues) => {
    await onClientAdded(values, addressId);
    setIsOpen(false);
  };

  const handleSearchCompany = async (q: string) => {
    if (q.length < 3) { setSearchResults([]); return; }
    setIsSearching(true);
    try {
      const results = await searchCompany({ query: q });
      setSearchResults(results ?? []);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCompanySelect = (company: CompanySearchResult) => {
    setSelectedCompany(company);
    form.setValue('name', company.name || '');
    form.setValue('siret', company.siret || '');
    form.setValue('representative', company.director || '');
    form.setValue('legalStatus', (company as any).legalStatus || '');
    setIsComboboxOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-9 w-9 p-0 sm:w-auto sm:px-3 sm:py-2 sm:gap-1">
          <PlusCircle className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only">Ajouter un client</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[calc(100dvh-1rem)] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-0 text-slate-950 shadow-2xl sm:max-w-2xl">
        <DialogHeader className="flex-shrink-0 border-b border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-6">
          <DialogTitle className="text-xl font-headline text-slate-950">Ajouter un nouveau client</DialogTitle>
          <DialogDescription className="text-slate-600">Saisissez les informations utiles au compte client, au contrat et à l'attestation de domiciliation.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} id="add-client-form" className="flex-grow space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
            <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">
              Adresse:&nbsp;
              <span className="font-bold text-foreground">{addresses.find(a => a.id === addressId)?.name}</span>
            </p>

            <h3 className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-white">1. Société</h3>
            <Popover open={isComboboxOpen} onOpenChange={setIsComboboxOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button variant="outline" role="combobox" className="w-full justify-between">
                    {selectedCompany ? selectedCompany.name : 'Rechercher une entreprise...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder="Rechercher par nom ou SIRET..." onValueChange={handleSearchCompany} />
                  <CommandList>
                    {isSearching && <CommandEmpty>Recherche en cours...</CommandEmpty>}
                    <CommandEmpty>Aucune entreprise trouvée.</CommandEmpty>
                    <CommandGroup>
                      {searchResults.map(company => (
                        <CommandItem
                          value={`${company.name} ${company.siret}`}
                          key={company.siret}
                          onSelect={() => handleCompanySelect(company)}
                        >
                          <Check className="mr-2 h-4 w-4 opacity-0" />
                          <div>
                            <p>{company.name}</p>
                            <p className="text-xs text-muted-foreground">{company.address}</p>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField name="name" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Raison sociale</FormLabel>
                  <FormControl><Input {...field} value={field.value || ''} disabled={!!selectedCompany} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField name="siret" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>SIRET</FormLabel>
                  <FormControl><Input {...field} value={field.value || ''} disabled={!!selectedCompany} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
            </div>
            <FormField name="representative" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Représentant Légal</FormLabel>
                <FormControl><Input {...field} value={field.value || ''} disabled={!!selectedCompany} /></FormControl>
                <FormMessage />
              </FormItem>
            )}/>


            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField name="legalStatus" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Statut juridique</FormLabel>
                  <FormControl><Input placeholder="SARL, SAS, EURL..." {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField name="representativeQuality" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Qualité du représentant</FormLabel>
                  <FormControl><Input placeholder="Gérant, Président..." {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField name="representativeAddress" control={form.control} render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Adresse personnelle du représentant</FormLabel>
                  <FormControl><AddressAutocomplete value={field.value || ''} onChange={field.onChange} placeholder="Numéro, rue, code postal, ville" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField name="shareCapital" control={form.control} render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Capital social <span className="text-muted-foreground">(optionnel)</span></FormLabel>
                  <FormControl><Input placeholder="Ex : 1 000 EUR" {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
            </div>

            <h3 className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-white">2. Accès client</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField name="email" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" placeholder="email@example.com" {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField name="password" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe</FormLabel>
                  <FormControl><Input type="password" placeholder="********" {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
            </div>

            <h3 className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-white">3. Abonnement</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField name="plan" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Offre</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="classic">Classic</SelectItem>
                      <SelectItem value="starter">Starter</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField name="paymentFrequency" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Périodicité</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Choisir une périodicité" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="monthly">Mensuelle</SelectItem>
                      <SelectItem value="yearly">Annuelle</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField name="status" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Statut</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner un statut" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Actif">Actif</SelectItem>
                      <SelectItem value="Inactif">Inactif</SelectItem>
                      <SelectItem value="Suspendu">Suspendu</SelectItem>
                      <SelectItem value="En attente de validation">En attente de validation</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}/>
            </div>
            <FormField name="phone" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone</FormLabel>
                <FormControl><Input type="tel" {...field} value={field.value || ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )}/>
          </form>
        </Form>
        <DialogFooter className="flex-shrink-0 gap-2 border-t border-slate-100 bg-white/95 px-5 py-4 shadow-[0_-16px_40px_rgba(15,23,42,0.08)] backdrop-blur sm:px-6">
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Annuler</Button>
          <Button type="submit" form="add-client-form" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Enregistrer le client
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const addUserSchema = z.object({
  email: z.string().email({ message: "L'email est invalide." }),
  password: z.string().min(6, { message: 'Le mot de passe doit faire au moins 6 caractères.' }),
  displayName: z.string().min(2, { message: 'Le nom est requis.' }),
  role: z.enum(['manager_paris', 'manager_orly', 'secretary_paris', 'secretary_orly', 'super_admin']),
});
type AddUserFormValues = z.infer<typeof addUserSchema>;

const AddUserDialog = ({
  onUserAdded, availableRoles,
}: {
  onUserAdded: (data: AddUserFormValues) => Promise<void>;
  availableRoles: AddUserFormValues['role'][];
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const form = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      email: '', password: '', displayName: '',
      role: availableRoles.length > 0 ? availableRoles[0] : 'manager_paris',
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        email: '', password: '', displayName: '',
        role: availableRoles.length > 0 ? availableRoles[0] : 'manager_paris',
      });
    }
  }, [form, isOpen, availableRoles]);

  const onSubmit = async (values: AddUserFormValues) => {
    await onUserAdded(values);
    setIsOpen(false);
  };

  const roleLabels: Record<UserRole, string> = {
    super_admin: 'Super Administrateur',
    manager_paris: 'Gestionnaire Paris',
    manager_orly: 'Gestionnaire Orly',
    secretary_paris: 'Secrétaire Paris',
    secretary_orly: 'Secrétaire Orly',
    client: 'Client',
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-9 w-9 p-0 sm:w-auto sm:px-3 sm:py-2 sm:gap-1">
          <PlusCircle className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only">Ajouter un utilisateur</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un nouvel utilisateur</DialogTitle>
          <DialogDescription>Créez un compte pour un administrateur, gestionnaire ou secrétaire.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField name="displayName" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl><Input placeholder="Jean Dupont" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}/>
            <FormField name="email" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input type="email" placeholder="email@example.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}/>
            <FormField name="password" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Mot de passe</FormLabel>
                <FormControl><Input type="password" placeholder="********" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}/>
            <FormField name="role" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Rôle</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {availableRoles.map(role => (
                      <SelectItem key={role} value={role}>{roleLabels[role]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}/>
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Créer l'utilisateur
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

/* =========================
   Page principale
========================= */

export default function ClientsPage() {
  const { firebaseApp } = useFirebase();
  const db = useDb();
  const { toast } = useToast();

  const { displayRole, actualRole, isLoading: isRoleLoading } = useRole();
  const { managedCenterIds } = useCenterAccess();
  const [activeTab, setActiveTab] = React.useState<string>('paris_12e');

  const scopedAddressId = React.useMemo<'paris_12e' | 'orly_ville' | null>(() => {
    if (displayRole === 'super_admin') {
      return activeTab === 'orly_ville' ? 'orly_ville' : 'paris_12e';
    }

    if (managedCenterIds.includes('paris_12e') || displayRole?.includes('paris')) return 'paris_12e';
    if (managedCenterIds.includes('orly_ville') || displayRole?.includes('orly')) return 'orly_ville';

    return null;
  }, [activeTab, displayRole, managedCenterIds]);

  const allClientsQuery = useMemoFirebase<FsQuery<Client, DocumentData> | null>(
    () => (db && scopedAddressId
      ? query(
          collection(db, 'clients'),
          where('domiciliationAddressId', '==', scopedAddressId)
        ) as FsQuery<Client, DocumentData>
      : null),
    [db, scopedAddressId]
  );

  const allUsersQuery = useMemoFirebase<FsQuery<User, DocumentData> | null>(
    () => (db && displayRole
      ? query(collection(db, 'users'), where('role', '!=', 'client')) as FsQuery<User, DocumentData>
      : null),
    [db, displayRole]
  );

  const clientRequestsQuery = useMemoFirebase<FsQuery<ClientRequest, DocumentData> | null>(
    () => (db && scopedAddressId
      ? query(
          collection(db, 'client_requests'),
          where('addressId', '==', scopedAddressId)
        ) as FsQuery<ClientRequest, DocumentData>
      : null),
    [db, scopedAddressId]
  );

  const { data: allClients, isLoading: isClientsLoading } = useCollection<Client>(allClientsQuery);
  const { data: allUsers, isLoading: isUsersLoading } = useCollection<User>(allUsersQuery);
  const { data: clientRequests } = useCollection<ClientRequest>(clientRequestsQuery);

  React.useEffect(() => {
    if (!displayRole || isRoleLoading) return;

    if (displayRole === 'super_admin') {
      setActiveTab((current) => (current === 'users' || current === 'orly_ville' ? current : 'paris_12e'));
      return;
    }

    if (managedCenterIds.includes('orly_ville') || displayRole.includes('orly')) {
      setActiveTab((current) => (current === 'users' ? current : 'orly_ville'));
      return;
    }

    if (managedCenterIds.includes('paris_12e') || displayRole.includes('paris')) {
      setActiveTab((current) => (current === 'users' ? current : 'paris_12e'));
      return;
    }

    setActiveTab('paris_12e');
  }, [displayRole, isRoleLoading, managedCenterIds]);

  const handleAddClient = async (userData: AddClientFormValues, addressId: 'paris_12e' | 'orly_ville') => {
    if (!firebaseApp) {
      toast({ variant: 'destructive', title: 'Erreur', description: "Le service des fonctions n'est pas disponible." });
      return;
    }
    const functions = getFunctions(firebaseApp, 'europe-west9'); // ✅ région alignée
    try {
      const setRoleFunction = httpsCallable(functions, 'setRole');
      const clientData = {
        name: userData.name,
        siret: userData.siret,
        representative: userData.representative,
        signatoryName: userData.representative,
        legalStatus: userData.legalStatus,
        legalStatusText: userData.legalStatus,
        formeJuridique: userData.legalStatus,
        representativeQuality: userData.representativeQuality,
        quality: userData.representativeQuality,
        representativeAddress: userData.representativeAddress,
        personalAddress: userData.representativeAddress,
        homeAddress: userData.representativeAddress,
        address: userData.representativeAddress,
        ...(userData.shareCapital ? { shareCapital: userData.shareCapital } : {}),
        email: userData.email,
        phone: userData.phone,
        plan: userData.plan,
        paymentFrequency: userData.paymentFrequency,
        status: userData.status,
        centerId: addressId,
        addressId,
        domiciliationAddressId: addressId,
        addressKey: addressKeyForAddressId(addressId),
        locationKey: addressKeyForAddressId(addressId),
        joinDate: new Date(),
      };
      await setRoleFunction({
        email: userData.email,
        password: userData.password,
        newRole: 'client',
        clientData,
        displayName: userData.representative,
      });
      toast({ title: 'Client ajouté avec succès !', description: `${userData.name} a été ajouté.` });
    } catch (error: any) {
      console.error('Error adding client via cloud function: ', error);
      let description = "Impossible d'ajouter le client. Veuillez réessayer.";
      if (error.code === 'functions/already-exists') description = 'Cet email est déjà utilisé par un autre compte.';
      if (error.code === 'functions/permission-denied') description = "Vous n'avez pas la permission de créer un utilisateur.";
      toast({ variant: 'destructive', title: 'Erreur', description });
    }
  };

  const handleAddUser = async (data: AddUserFormValues) => {
    if (!firebaseApp) {
      toast({ variant: 'destructive', title: 'Erreur', description: "Le service des fonctions n'est pas disponible." });
      return;
    }
    const functions = getFunctions(firebaseApp, 'europe-west9'); // ✅
    try {
      const setRoleFunction = httpsCallable(functions, 'setRole');
      await setRoleFunction({
        email: data.email,
        newRole: data.role,
        password: data.password,
        displayName: data.displayName,
      });
      toast({ title: 'Utilisateur créé et rôle assigné avec succès' });
    } catch (error: any) {
      console.error('Error setting role:', error);
      toast({ variant: 'destructive', title: 'Erreur', description: error.message || "Impossible d'assigner le rôle." });
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'clients', clientId));
      toast({ title: 'Client supprimé', description: 'Le client a été supprimé avec succès.' });
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({ variant: 'destructive', title: 'Erreur de suppression', description: 'Impossible de supprimer le client.' });
    }
  };

  const handleUpdateClient = async (clientId: string, data: EditClientFormValues) => {
    if (!db) return;
    try {
      const clientRef = doc(db, 'clients', clientId);
      await updateDoc(clientRef, data);
      toast({ title: 'Client mis à jour', description: 'Les informations du client ont été mises à jour.' });
    } catch (error) {
      console.error('Error updating client:', error);
      toast({ variant: 'destructive', title: 'Erreur de mise à jour', description: 'Impossible de mettre à jour le client.' });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      toast({ title: 'Utilisateur supprimé', description: "L'enregistrement de l'utilisateur a été supprimé de Firestore." });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de supprimer l'utilisateur." });
    }
  };

  const currentAddressIdForAdding = React.useMemo(() => {
    if (scopedAddressId) return scopedAddressId;
    if (activeTab === 'paris_12e' || activeTab === 'orly_ville') return activeTab as 'paris_12e' | 'orly_ville';
    return 'paris_12e';
  }, [activeTab, scopedAddressId]);

  const usersForDisplay = React.useMemo(() => {
    if (!allUsers) return [];
    if (displayRole === 'super_admin') return allUsers;
    if (displayRole === 'manager_paris' || currentAddressIdForAdding === 'paris_12e') return allUsers.filter(u => u.role === 'secretary_paris');
    if (displayRole === 'manager_orly' || currentAddressIdForAdding === 'orly_ville') return allUsers.filter(u => u.role === 'secretary_orly');
    return [];
  }, [allUsers, displayRole, currentAddressIdForAdding]);

  const availableRolesForCreation: AddUserFormValues['role'][] = React.useMemo(() => {
    if (displayRole === 'super_admin') return ['super_admin', 'manager_paris', 'manager_orly', 'secretary_paris', 'secretary_orly'];
    if (displayRole === 'manager_paris' || currentAddressIdForAdding === 'paris_12e') return ['secretary_paris'];
    if (displayRole === 'manager_orly' || currentAddressIdForAdding === 'orly_ville') return ['secretary_orly'];
    return [];
  }, [displayRole, currentAddressIdForAdding]);

  const getCardTitle = () => {
    if (displayRole?.startsWith('secretary')) return 'Espace Secrétariat';
    if (displayRole === 'super_admin') return 'Gestion des Clients & Utilisateurs';
    return `Gestion - ${addresses.find(a => a.id === currentAddressIdForAdding)?.name || ''}`;
  };

  const getCardDescription = () => {
    if (displayRole?.startsWith('secretary')) return `Gérez les clients de l'adresse ${addresses.find(a => a.id === currentAddressIdForAdding)?.name || ''}.`;
    if (displayRole === 'super_admin') return 'Consultez les clients par adresse et gérez les utilisateurs.';
    return 'Gérez les clients et les utilisateurs pour votre adresse.';
  };

  if (isClientsLoading || isUsersLoading || isRoleLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  const canManageUsers = displayRole === 'super_admin' || displayRole === 'manager' || displayRole === 'manager_paris' || displayRole === 'manager_orly';
  const canAddClients = canManageUsers || displayRole?.startsWith('secretary');
  const canOnlyViewClients = displayRole?.startsWith('secretary');

  const getClientsForView = () => {
    if (!allClients) return [];
    if (displayRole === 'super_admin') {
      if (activeTab === 'paris_12e') return allClients.filter(c => c.domiciliationAddressId === 'paris_12e');
      if (activeTab === 'orly_ville') return allClients.filter(c => c.domiciliationAddressId === 'orly_ville');
      return [];
    }

    if (scopedAddressId) {
      return allClients.filter(c => c.domiciliationAddressId === scopedAddressId);
    }

    return [];
  };

  const clientsForView = getClientsForView();

  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>{getCardTitle()}</CardTitle>
            <CardDescription>{getCardDescription()}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {displayRole === 'super_admin' ? (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                <TabsList>
                  <TabsTrigger value="paris_12e">
                    Clients Paris
                  </TabsTrigger>
                  <TabsTrigger value="orly_ville">Clients Orly</TabsTrigger>
                  <TabsTrigger value="users">Utilisateurs</TabsTrigger>
                </TabsList>
              </Tabs>
            ) : canManageUsers && !canOnlyViewClients ? (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                <TabsList>
                  <TabsTrigger value={currentAddressIdForAdding}>Clients</TabsTrigger>
                  <TabsTrigger value="users">Utilisateurs</TabsTrigger>
                </TabsList>
              </Tabs>
            ) : null}

            {activeTab === 'users'
              ? (canManageUsers && <AddUserDialog onUserAdded={handleAddUser} availableRoles={availableRolesForCreation} />)
              : (canAddClients && <AddClientDialog onClientAdded={handleAddClient} addressId={currentAddressIdForAdding as 'paris_12e' | 'orly_ville'} />)}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="paris_12e">
              <ClientTable clients={clientsForView} isLoading={isClientsLoading} onDeleteClient={handleDeleteClient} onUpdateClient={handleUpdateClient} />
            </TabsContent>
            <TabsContent value="orly_ville">
              <ClientTable clients={clientsForView} isLoading={isClientsLoading} onDeleteClient={handleDeleteClient} onUpdateClient={handleUpdateClient} />
            </TabsContent>
            {canManageUsers && (
              <TabsContent value="users">
                <UsersTable users={usersForDisplay} onDeleteUser={handleDeleteUser} />
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

/* =========================
   Tables
========================= */

const UsersTable = ({
  users, onDeleteUser,
}: {
  users: User[];
  onDeleteUser: (userId: string) => Promise<void>;
}) => {
  const roleLabels: Record<UserRole, string> = {
    super_admin: 'Super Administrateur',
    manager_paris: 'Gestionnaire Paris',
    manager_orly: 'Gestionnaire Orly',
    secretary_paris: 'Secrétaire Paris',
    secretary_orly: 'Secrétaire Orly',
    client: 'Client',
  };

  return (
    <div>
      {/* Mobile */}
      <div className="grid gap-4 md:hidden">
        {users.length > 0 ? users.map(user => (
          <Card key={user.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{user.email}</CardTitle>
                  <CardDescription><Badge variant="outline">{roleLabels[user.role] || user.role}</Badge></CardDescription>
                </div>
                <AlertDialog>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="-mt-2 -mr-2">
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem disabled>Modifier</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem className="text-destructive" disabled={user.role === 'super_admin'}>
                          Supprimer
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer cet utilisateur ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action supprimera l'enregistrement de <span className="font-bold">{user.email}</span> dans Firestore.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDeleteUser(user.id)} className="bg-destructive hover:bg-destructive/90">
                        Oui, supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardHeader>
            <CardFooter>
              <span className="text-xs text-muted-foreground">
                Créé le {user.createdAt ? user.createdAt.toDate().toLocaleDateString('fr-FR') : 'N/A'}
              </span>
            </CardFooter>
          </Card>
        )) : (
          <div className="text-center p-8 text-muted-foreground">Aucun utilisateur trouvé.</div>
        )}
      </div>

      {/* Desktop */}
      <div className="border rounded-md hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Date de création</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length > 0 ? users.map(user => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.email}</TableCell>
                <TableCell><Badge variant="outline">{roleLabels[user.role] || user.role}</Badge></TableCell>
                <TableCell>{user.createdAt ? user.createdAt.toDate().toLocaleDateString('fr-FR') : 'N-A'}</TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem disabled>Modifier le rôle</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem className="text-destructive" disabled={user.role === 'super_admin'}>
                            Supprimer
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer cet utilisateur ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action supprimera l'enregistrement de l'utilisateur dans Firestore.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDeleteUser(user.id)} className="bg-destructive hover:bg-destructive/90">
                          Oui, supprimer de Firestore
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">Aucun utilisateur trouvé.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const ClientTable = ({
  clients, isLoading, onDeleteClient, onUpdateClient,
}: {
  clients: Client[];
  isLoading: boolean;
  onDeleteClient: (clientId: string) => void;
  onUpdateClient: (clientId: string, data: EditClientFormValues) => Promise<void>;
}) => {
  const [selectedClients, setSelectedClients] = React.useState<string[]>([]);
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(20);
  const [sortDescriptor, setSortDescriptor] = React.useState<{ column: keyof Client; direction: 'asc' | 'desc'; }>({ column: 'joinDate', direction: 'desc' });
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | ClientStatus>('all');
  const [planFilter, setPlanFilter] = React.useState<'all' | MailPlanId>('all');
  const [editingClient, setEditingClient] = React.useState<Client | null>(null);

  const filteredAndSortedClients = React.useMemo(() => {
    let filtered = clients;
    if (statusFilter !== 'all') filtered = filtered.filter(client => client.status === statusFilter);
    if (planFilter !== 'all') {
      filtered = filtered.filter(
        client => resolveMailPlanId(client as unknown as Record<string, any>) === planFilter
      );
    }
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      filtered = filtered.filter(client => client.name.toLowerCase().includes(t) || client.email.toLowerCase().includes(t));
    }
    return [...filtered].sort((a, b) => {
      const first = a[sortDescriptor.column] as any;
      const second = b[sortDescriptor.column] as any;
      if (!first || !second) return 0;
      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === 'desc' ? -cmp : cmp;
    });
  }, [clients, sortDescriptor, searchTerm, statusFilter, planFilter]);

  const totalPages = Math.ceil(filteredAndSortedClients.length / pageSize);
  const paginatedClients = React.useMemo(() => {
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return filteredAndSortedClients.slice(start, end);
  }, [pageIndex, pageSize, filteredAndSortedClients]);

  const handleSelectAll = (checked: boolean) => {
    setSelectedClients(checked ? filteredAndSortedClients.map(c => c.id!).filter(Boolean) : []);
  };

  const handleSelectClient = (clientId: string, checked: boolean) => {
    setSelectedClients(prev => (checked ? [...prev, clientId] : prev.filter(id => id !== clientId)));
  };

  React.useEffect(() => { setSelectedClients([]); }, [clients]);

  const handleSort = (column: keyof Client) => {
    if (sortDescriptor.column === column) {
      setSortDescriptor({ ...sortDescriptor, direction: sortDescriptor.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setSortDescriptor({ column, direction: 'desc' });
    }
  };

  const getJoinDate = (client: Client) => {
    const joinTimestamp = client.joinDate as any;
    if (joinTimestamp && typeof joinTimestamp.toDate === 'function') return joinTimestamp.toDate().toLocaleDateString('fr-FR');
    if (client.joinDate) return new Date(client.joinDate).toLocaleDateString('fr-FR');
    return 'N/A';
  };

  return (
    <div>
      {editingClient && (
        <EditClientDialog
          client={editingClient}
          onClientUpdated={onUpdateClient}
          isOpen={!!editingClient}
          onOpenChange={() => setEditingClient(null)}
        />
      )}

      <div className="flex flex-col sm:flex-row items-center py-4 gap-2">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher par nom ou email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 w-full sm:w-64" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | ClientStatus)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="Actif">Actif</SelectItem>
            <SelectItem value="Inactif">Inactif</SelectItem>
            <SelectItem value="Suspendu">Suspendu</SelectItem>
            <SelectItem value="En attente de validation">En attente de validation</SelectItem>
          </SelectContent>
        </Select>
        <Select value={planFilter} onValueChange={(v) => setPlanFilter(v as 'all' | MailPlanId)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrer par forfait" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les forfaits</SelectItem>
            <SelectItem value="classic">Classic</SelectItem>
            <SelectItem value="starter">Starter</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
          </SelectContent>
        </Select>

        {selectedClients.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto mt-2 sm:mt-0">
                Actions <MoreHorizontal className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>{selectedClients.length} client(s) sélectionné(s)</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Activer la sélection</DropdownMenuItem>
              <DropdownMenuItem>Suspendre la sélection</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Supprimer la sélection</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Repères forfaits</span>
          <SubscriptionPlanLegend />
        </div>
      </div>

      {/* Mobile */}
      <div className="grid gap-4 md:hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : paginatedClients.length > 0 ? (
          paginatedClients.map(client => (
            <Card key={client.id} data-state={client.id ? (selectedClients.includes(client.id) && 'selected') : undefined} className="data-[state=selected]:bg-muted/50">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-base">{client.name}</CardTitle>
                  <CardDescription>{client.representative}</CardDescription>
                </div>
                <AlertDialog>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingClient(client)}>
                        <Pencil className="mr-2 h-4 w-4" /> Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem>{client.status === 'Actif' ? 'Suspendre' : 'Réactiver'}</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem className="text-destructive">Supprimer</DropdownMenuItem>
                      </AlertDialogTrigger>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action est irréversible et supprimera le profil de <span className="font-bold">{client.name}</span>.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={() => client.id && onDeleteClient(client.id)} className="bg-destructive hover:bg-destructive/90">
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Offre</p>
                  <SubscriptionPlanBadge planId={client.plan} className="mt-1" />
                </div>
                <div>
                  <p className="font-medium">Statut</p>
                  <Badge
                    variant={STATUS_BADGE_VARIANT[client.status]}
                    className={cn(client.status === 'En attente de validation' && 'border-amber-500 text-amber-600')}
                  >
                    {client.status}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <p className="font-medium">Contact</p>
                  <p className="text-muted-foreground">{client.email}</p>
                  <p className="text-muted-foreground">{client.phone}</p>
                </div>
              </CardContent>
              <CardFooter>
                <span className="text-xs text-muted-foreground">Inscrit le {getJoinDate(client)}</span>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="text-center p-8 text-muted-foreground">Aucun client trouvé.</div>
        )}
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead padding="checkbox">
                  <Checkbox
                    checked={selectedClients.length > 0 && selectedClients.length === filteredAndSortedClients.length && filteredAndSortedClients.length > 0}
                    onCheckedChange={checked => handleSelectAll(checked as boolean)}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>Raison sociale</TableHead>
                <TableHead>SIRET</TableHead>
                <TableHead>Représentant</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Offre</TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('joinDate')}>
                    Date d'inscription
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                    <p>Chargement des clients...</p>
                  </TableCell>
                </TableRow>
              ) : paginatedClients.length > 0 ? (
                paginatedClients.map(client => (
                  <TableRow
                    key={client.id}
                    data-state={client.id ? (selectedClients.includes(client.id) && 'selected') : undefined}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={client.id ? selectedClients.includes(client.id) : false}
                        onCheckedChange={checked => client.id && handleSelectClient(client.id, checked as boolean)}
                        aria-label="Select client"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.siret}</TableCell>
                    <TableCell>{client.representative}</TableCell>
                    <TableCell>
                      <div className="font-normal">{client.email}</div>
                      <div className="text-xs text-muted-foreground">{client.phone}</div>
                    </TableCell>
                    <TableCell><SubscriptionPlanBadge planId={client.plan} compact /></TableCell>
                    <TableCell>{getJoinDate(client)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={STATUS_BADGE_VARIANT[client.status]}
                        className={cn(client.status === 'En attente de validation' && 'border-amber-500 text-amber-600')}
                      >
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Ouvrir le menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setEditingClient(client)}>Modifier</DropdownMenuItem>
                            <DropdownMenuItem>{client.status === 'Actif' ? 'Suspendre' : 'Réactiver'}</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem className="text-destructive">Supprimer</DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action est irréversible. Le profil client de <span className="font-bold">{client.name}</span> sera définitivement supprimé.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => client.id && onDeleteClient(client.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Oui, supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">Aucun client trouvé.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4">
        <div className="text-sm text-muted-foreground">
          {`${selectedClients.length} sur ${filteredAndSortedClients.length} ligne(s) sélectionnée(s).`}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setPageIndex(pageIndex - 1)} disabled={pageIndex === 0}>
            Précédent
          </Button>
          <div className="text-sm font-medium">Page {pageIndex + 1} sur {Math.ceil(filteredAndSortedClients.length / pageSize)}</div>
          <Button variant="outline" size="sm" onClick={() => setPageIndex(pageIndex + 1)} disabled={pageIndex >= Math.ceil(filteredAndSortedClients.length / pageSize) - 1}>
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
};
