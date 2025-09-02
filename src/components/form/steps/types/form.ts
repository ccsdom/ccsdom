// types/form.ts

// ----------------- Données principales du formulaire -----------------
export interface FormData {
  // Représentant légal
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  adresseComplete?: string;
  numeroRue?: string;
  rue?: string;
  codePostal?: string;
  ville?: string;
  pays?: string;

  // Entreprise
  siret?: string;  
  siren?: string;
  nomEntreprise?: string;
  adresseEntreprise?: string;
  statutJuridique: string;
  autreStatut?: string;

  // Options contrat
  projet: string;                // obligatoire
  contratAccepte: boolean;
  signatureDataURL: string | null;

  // Options courrier
  optionCourrier?: string;
  courrierOption?: string;
  libelleOffreCourrier?: string;
  prixOffreCourrier?: string;
  prixOffreCourrierNum?: number;
  prixCourrier?: number;

  // Options domiciliation
  idAdresse?: string;
  prixAdresse?: number;
  optionTransfert?: string;
  statutRepr?: string;

  // Paiement
  frequencePaiement?: "mensuelle" | "annuelle" | "trimestrielle";
  amount?: number;          // montant total calculé
  currency?: string;        // ex: "EUR"
  cardInfo?: CardInfo;      // info carte bancaire (optionnel)
}

// ----------------- Données Entreprise pour Transfert -----------------
export interface EntrepriseData {
  siren?: string;           // numéro SIREN (9 chiffres)
  nom?: string;
  adresse?: string;
  codePostal?: string;
  ville?: string;
}

// Props d'une étape de transfert d'entreprise
export interface TransfertEntrepriseStepProps {
  data: Partial<EntrepriseData>;
  onChange: (data: Partial<EntrepriseData>) => void;
  onNext: () => void;
  onBack?: () => void;
}

// ----------------- Données Carte Bancaire -----------------
export interface CardInfo {
  cardNumber: string;
  expiryDate: string;       // format "MM/YY"
  cvc: string;
  cardHolderName: string;
}

// ----------------- Données de Paiement -----------------
export interface PaymentData {
  amount?: number;          // montant total
  currency?: string;        // ex: "EUR"
  cardInfo?: CardInfo;      // info carte bancaire
}

// Props pour l'étape infos paiement
export interface StepPaymentInfoProps {
  data: PaymentData;
  onBack: () => void;
  codePostal: string;       // utile pour Stripe / validation ?
  onSubmit: (cardInfo: CardInfo) => void;
}

// ----------------- Données Fréquence de Paiement -----------------
export interface PaymentFrequencyData {
  frequencePaiement?: "mensuelle" | "annuelle" | "trimestrielle";
  prixAdresse?: number;
  prixCourrier?: number;
}

// Props pour l'étape choix de fréquence
export interface StepPaymentFrequencyProps {
  data: PaymentFrequencyData;
  onChange: (values: Partial<PaymentFrequencyData>) => void;
  onBack: () => void;
  onNext: () => void;
  onEdit?: (section: SectionEditable) => void; // <-- rendu optionnel
}

// ----------------- Sections éditables pour récap -----------------
export type SectionEditable =
  | "projet"
  | "denomination"   
  | "representant"
  | "statut"
  | "siren"
  | "siret"
  | "adresse"
  | "courrier"
  | "nomEntreprise"
  | "frequencePaiement"
  | "adresseEntreprise"
  | "statutJuridique"
  | "domiciliation"
  | "optionTransfert";
