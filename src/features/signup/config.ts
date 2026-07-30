import { z } from "zod";

export const SIGNUP_DOCUMENT_MAX_BYTES = 15 * 1024 * 1024;

export const SIGNUP_ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
] as const;

export const LEGAL_STATUS_VALUES = [
  "sasu",
  "sas",
  "sarl",
  "eurl",
  "micro",
  "autres",
] as const;

export type SignupProjectType = "creation" | "transfert";
export type SignupAddressId = string;
export type SignupAddressKey = string;
export type SignupDocType = "kbis" | "identityCard" | "proofOfAddress";
export type SignupPaymentFrequency = "monthly" | "yearly";

export type SignupPdfJobs = {
  contractId?: string | null;
  attestationId?: string | null;
};

const emptySchema = z.object({});

// ----------------------
// Schemas
// ----------------------

export const projectSchema = z.object({
  projectType: z.enum(["creation", "transfert"]),
});

export const companySearchSchema = z.object({
  companyIdentifier: z
    .string({ required_error: "Ce champ est requis" })
    .min(2, "Veuillez rechercher et sélectionner une entreprise."),
  companyName: z
    .string({ required_error: "Ce champ est requis" })
    .min(2, "Le nom de l'entreprise est requis."),
  siret: z
    .string({ required_error: "Ce champ est requis" })
    .min(14, "Le SIRET est requis."),
  address: z
    .string({ required_error: "Ce champ est requis" })
    .min(5, "L'adresse est requise."),
  legalStatus: z.string().optional(),
  otherLegalStatus: z.string().optional(),
  shareCapital: z.coerce.number().optional(),
  director: z.string().optional(),
});

export const legalStatusSchema = z
  .object({
    legalStatus: z.enum(LEGAL_STATUS_VALUES, {
      required_error: "Veuillez choisir un statut juridique.",
    }),
    otherLegalStatus: z.string().optional(),
  })
  .refine(
    (data) =>
      data.legalStatus !== "autres" ||
      (!!data.otherLegalStatus && data.otherLegalStatus.trim().length > 1),
    {
      message: "Veuillez préciser le statut juridique.",
      path: ["otherLegalStatus"],
    }
  );

export const denominationSchema = z.object({
  companyName: z
    .string({ required_error: "Ce champ est requis" })
    .min(2, "La dénomination sociale est requise."),
  activityDescription: z.string().optional(),
});

export const legalRepresentativeSchema = z.object({
  firstName: z
    .string({ required_error: "Ce champ est requis" })
    .min(2, "Le prénom est requis."),
  lastName: z
    .string({ required_error: "Ce champ est requis" })
    .min(2, "Le nom est requis."),
  address: z
    .string({ required_error: "Ce champ est requis" })
    .min(5, "L'adresse personnelle est requise."),
  phone: z
    .string({ required_error: "Ce champ est requis" })
    .min(10, "Le numéro de téléphone est requis."),
  email: z
    .string({ required_error: "Ce champ est requis" })
    .email("L'adresse e-mail est invalide."),
  password: z
    .string({ required_error: "Ce champ est requis" })
    .min(6, "Le mot de passe doit contenir au moins 6 caractères."),
  quality: z
    .string({ required_error: "Ce champ est requis" })
    .min(2, "La qualité du représentant est requise (ex: Gérant, Président)."),
});

export const domiciliationSchema = z.object({
  addressId: z
    .string({ required_error: "Veuillez choisir une adresse de domiciliation." })
    .min(1, "Veuillez choisir une adresse de domiciliation."),
  addressKey: z.string().optional(),
  locationKey: z.string().optional(),
});

export const mailManagementSchema = z.object({
  mailPlanId: z.enum(["classic", "starter", "business", "premium"], {
    required_error: "Veuillez choisir une offre de gestion de courrier.",
  }),
});

export const accompanimentSchema = z.object({
  accompanimentType: z
    .string({ required_error: "Ce champ est requis" })
    .min(1, "Veuillez choisir un type d'accompagnement."),
});

const fileSchema = z
  .any()
  .refine(
    (files) =>
      files === undefined ||
      files === null ||
      (typeof FileList !== "undefined" && files instanceof FileList),
    "Fichier invalide."
  )
  .refine(
    (files) =>
      !files ||
      files.length === 0 ||
      files?.[0]?.size <= SIGNUP_DOCUMENT_MAX_BYTES,
    `La taille du fichier doit être inférieure à ${Math.round(
      SIGNUP_DOCUMENT_MAX_BYTES / 1024 / 1024
    )} Mo.`
  )
  .refine(
    (files) =>
      !files ||
      files.length === 0 ||
      SIGNUP_ALLOWED_DOCUMENT_TYPES.includes(files?.[0]?.type),
    "Format de fichier non supporté (PDF, PNG, JPG, WEBP)."
  )
  .optional();

export const documentsSchema = z.object({
  kbis: fileSchema,
  identityCard: fileSchema,
  proofOfAddress: fileSchema,
});

export const paymentSchema = z.object({
  paymentFrequency: z.enum(["monthly", "yearly"]),
  paymentSuccess: z.boolean().optional(),
});

export const contractSchema = z.object({
  signature: z
    .string({ required_error: "La signature est requise." })
    .min(1, "La signature ne peut être vide."),
  agreedToTerms: z.literal(true, {
    errorMap: () => ({
      message: "Vous devez accepter les termes du contrat.",
    }),
  }),
});

export const finalisationSchema = emptySchema;

// ----------------------
// Step config
// ----------------------

export type SignupStepConfig = {
  id: string;
  name: string;
  description: string;
  schema: z.ZodTypeAny;
  fieldsToValidate?: string[];
};

export const creationSteps: SignupStepConfig[] = [
  {
    id: "projet",
    name: "Projet",
    description: "Commençons par le commencement.",
    schema: projectSchema,
    fieldsToValidate: ["projectType"],
  },
  {
    id: "statut",
    name: "Statut juridique",
    description: "Choisissez la forme juridique de votre future entreprise.",
    schema: legalStatusSchema,
    fieldsToValidate: ["legalStatus", "otherLegalStatus"],
  },
  {
    id: "denomination",
    name: "Dénomination",
    description: "Trouvez le nom parfait pour votre entreprise.",
    schema: denominationSchema,
    fieldsToValidate: ["companyName"],
  },
  {
    id: "representant",
    name: "Représentant légal",
    description: "Qui est aux commandes ?",
    schema: legalRepresentativeSchema,
    fieldsToValidate: [
      "firstName",
      "lastName",
      "address",
      "phone",
      "email",
      "password",
      "quality",
    ],
  },
  {
    id: "domiciliation",
    name: "Domiciliation",
    description: "Choisissez votre siège social.",
    schema: domiciliationSchema,
    fieldsToValidate: ["addressId"],
  },
  {
    id: "courrier",
    name: "Gestion du courrier",
    description: "Comment souhaitez-vous recevoir votre courrier ?",
    schema: mailManagementSchema,
    fieldsToValidate: ["mailPlanId"],
  },
  {
    id: "accompagnement",
    name: "Accompagnement",
    description: "Besoin d'un coup de main pour les démarches ?",
    schema: accompanimentSchema,
    fieldsToValidate: ["accompanimentType"],
  },
  {
    id: "documents",
    name: "Documents",
    description: "Téléversez les pièces justificatives.",
    schema: documentsSchema,
  },
  {
    id: "recapitulatif",
    name: "Récapitulatif",
    description: "Vérifiez vos informations.",
    schema: emptySchema,
  },
  {
    id: "paiement",
    name: "Paiement",
    description: "Finalisez votre commande.",
    schema: paymentSchema,
  },
  {
    id: "contrat",
    name: "Contrat",
    description: "Signez votre contrat de domiciliation.",
    schema: contractSchema,
    fieldsToValidate: ["signature", "agreedToTerms"],
  },
  {
    id: "finalisation",
    name: "Finalisation",
    description: "C'est presque fini !",
    schema: finalisationSchema,
  },
];

export const transferSteps: SignupStepConfig[] = [
  {
    id: "projet",
    name: "Projet",
    description: "Indiquez-nous votre projet.",
    schema: projectSchema,
    fieldsToValidate: ["projectType"],
  },
  {
    id: "recherche",
    name: "Recherche entreprise",
    description: "Retrouvons votre entreprise.",
    schema: companySearchSchema,
    fieldsToValidate: ["companyIdentifier", "companyName", "siret", "address"],
  },
  {
    id: "representant",
    name: "Représentant légal",
    description: "Confirmez les informations du dirigeant.",
    schema: legalRepresentativeSchema,
    fieldsToValidate: [
      "firstName",
      "lastName",
      "address",
      "phone",
      "email",
      "password",
      "quality",
    ],
  },
  {
    id: "domiciliation",
    name: "Nouvelle Domiciliation",
    description: "Choisissez votre nouveau siège social.",
    schema: domiciliationSchema,
    fieldsToValidate: ["addressId"],
  },
  {
    id: "courrier",
    name: "Gestion du courrier",
    description: "Choisissez votre nouvelle gestion de courrier.",
    schema: mailManagementSchema,
    fieldsToValidate: ["mailPlanId"],
  },
  {
    id: "accompagnement",
    name: "Accompagnement",
    description: "Souhaitez-vous être accompagné ?",
    schema: accompanimentSchema,
    fieldsToValidate: ["accompanimentType"],
  },
  {
    id: "documents",
    name: "Documents",
    description: "Quelques documents sont nécessaires.",
    schema: documentsSchema,
  },
  {
    id: "recapitulatif",
    name: "Récapitulatif",
    description: "Vérifions ensemble.",
    schema: emptySchema,
  },
  {
    id: "paiement",
    name: "Paiement",
    description: "Procédez au paiement.",
    schema: paymentSchema,
  },
  {
    id: "contrat",
    name: "Contrat",
    description: "Signez votre nouveau contrat.",
    schema: contractSchema,
    fieldsToValidate: ["signature", "agreedToTerms"],
  },
  {
    id: "finalisation",
    name: "Finalisation",
    description: "Le transfert est lancé !",
    schema: finalisationSchema,
  },
];

// ----------------------
// Helpers steps / schema
// ----------------------

export const getStepsForProjectType = (
  projectType?: SignupProjectType
): SignupStepConfig[] =>
  projectType === "transfert" ? transferSteps : creationSteps;

export const getStepSchema = (
  stepId: string,
  projectType?: SignupProjectType
): z.ZodTypeAny => {
  const steps = getStepsForProjectType(projectType);
  return steps.find((step) => step.id === stepId)?.schema ?? emptySchema;
};

export const getFullSchema = (projectType?: SignupProjectType) => {
  const steps = getStepsForProjectType(projectType);
  let acc: z.ZodTypeAny = emptySchema;

  for (const step of steps) {
    acc = acc.and(step.schema);
  }

  return acc as z.ZodTypeAny;
};

// ----------------------
// Typed form values
// ----------------------

export type SignupFormValues = Partial<
  z.infer<typeof projectSchema> &
    z.infer<typeof companySearchSchema> &
    z.infer<typeof legalStatusSchema> &
    z.infer<typeof denominationSchema> &
    z.infer<typeof legalRepresentativeSchema> &
    z.infer<typeof domiciliationSchema> &
    z.infer<typeof mailManagementSchema> &
    z.infer<typeof accompanimentSchema> &
    z.infer<typeof documentsSchema> &
    z.infer<typeof paymentSchema> &
    z.infer<typeof contractSchema>
> & {
  requestUid?: string;
  stripeSessionId?: string;
  paymentStatus?: string;
  status?: string;
  location?: string;
  planName?: string;
  planPrice?: string;
  representative?: string;
  companyIdentifier?: string;
  addressKey?: string;
  locationKey?: string;
  pdfJobs?: SignupPdfJobs;
  denomination?: string;
  contactEmail?: string;
};

// ----------------------
// Business helpers
// ----------------------

export function resolveAddressKeyFromForm(
  values: Record<string, unknown>,
  fallback: SignupAddressKey = "orly"
): SignupAddressKey {
  const explicitAddressKey = String(values?.addressKey ?? "").toLowerCase().trim();
  const explicitLocationKey = String(values?.locationKey ?? "").toLowerCase().trim();
  const addressId = String(values?.addressId ?? "").toLowerCase();
  const location = String(values?.location ?? "").toLowerCase();
  const address = String(values?.address ?? "").toLowerCase();

  if (explicitAddressKey) return explicitAddressKey;
  if (explicitLocationKey) return explicitLocationKey;

  if (addressId.includes("paris")) {
    return "paris";
  }

  if (addressId.includes("orly")) {
    return "orly";
  }

  if (location === "paris") {
    return "paris";
  }

  if (location === "orly") {
    return "orly";
  }

  if (address.includes("paris")) return "paris";
  if (address.includes("orly")) return "orly";

  return fallback;
}

export function resolveLegalStatus(
  legalStatus?: string | null,
  otherLegalStatus?: string | null
): string {
  const ls = String(legalStatus ?? "").trim();
  const other = String(otherLegalStatus ?? "").trim();

  if (ls === "autres") return other || "Autre";
  return ls || other || "";
}
