import { onCall, HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import {
  canTouchCenter,
  getCallerAccess,
  normalizeCenterId,
  type CenterId,
  type UserRole,
} from "./_utils/auth";
import { AdminFieldValue, adminDb } from "./_utils/admin";

type ProjectType = "creation" | "transfert";
type DocumentCategory = "creation" | "transfert" | "commun" | "checklist";
type LegalForm = "sasu" | "sas" | "sarl" | "eurl" | "sci" | "generic";

type FormaliteInput = {
  projectType?: unknown;
  companyName?: unknown;
  companyAddress?: unknown;
  legalRepresentativeName?: unknown;
  legalRepresentativeEmail?: unknown;
  registrationDate?: unknown;
  oldCompanyAddress?: unknown;
  siret?: unknown;
  addressId?: unknown;
  legalStatus?: unknown;
  capitalSocial?: unknown;
  activityDescription?: unknown;
};

export type GeneratedFormaliteDocument = {
  id: string;
  title: string;
  category: DocumentCategory;
  required: boolean;
  content: string;
};

type CenterDetails = {
  id: string;
  name: string;
  street: string;
  city: string;
  zip: string;
  country: string;
  companyName: string;
  companyType: string;
  companyCapital: string;
  companyRcs: string;
  companyApproval: string;
  companyRepresentative: string;
};

const STAFF_ROLES: UserRole[] = [
  "manager",
  "manager_paris",
  "manager_orly",
  "secretary_paris",
  "secretary_orly",
  "super_admin",
];

const DEFAULT_CENTERS: Record<string, CenterDetails> = {
  paris_12e: {
    id: "paris_12e",
    name: "BPC - Paris 12e",
    street: "9 Rue de Wattignies",
    city: "Paris",
    zip: "75012",
    country: "France",
    companyName: "BUSINESS PARTNERS CONSULTING",
    companyType: "Société par actions simplifiée",
    companyCapital: "10 000 EUR",
    companyRcs: "Paris sous le n° 952 131 423",
    companyApproval: "Préfecture de Paris sous le n° AG/DOM/2023095",
    companyRepresentative: "M. Ahcene DJAOUT, agissant en qualité de président",
  },
  orly_ville: {
    id: "orly_ville",
    name: "CCS - Orly Ville",
    street: "25 Rue Edmond Rostand",
    city: "Orly",
    zip: "94310",
    country: "France",
    companyName: "CONSULTING CONSEIL SERVICES",
    companyType: "Société à responsabilité limitée",
    companyCapital: "100 000 EUR",
    companyRcs: "Créteil sous le n° 830 278 644",
    companyApproval: "Préfecture du Val-de-Marne sous le n° AG/DOM/2024-06",
    companyRepresentative: "M. Rabah MAHFOUF, agissant en qualité de gérant",
  },
};

const LEGAL_NOTICE =
  "Document de travail généré par CCS DOM. À relire, compléter et valider avant signature, publication ou dépôt sur le guichet unique.";

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function asCompleted(value: unknown, fallback = "À compléter"): string {
  return asString(value, fallback);
}

function getProjectType(value: unknown): ProjectType {
  return value === "transfert" ? "transfert" : "creation";
}

function formatDateFr(value: unknown): string {
  const raw = asString(value);
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) return `${match[3]}/${match[2]}/${match[1]}`;
  return raw || "À compléter";
}

function centerAddress(center: CenterDetails): string {
  return `${center.street}, ${center.zip} ${center.city}`;
}

function compactLines(lines: Array<string | false | null | undefined>): string {
  return lines.filter(Boolean).join("\n");
}

async function resolveCenter(addressId: unknown): Promise<CenterDetails | null> {
  const normalized = normalizeCenterId(addressId);
  if (!normalized) return null;

  const fallback = DEFAULT_CENTERS[normalized];

  try {
    const snap = await adminDb.collection("centers").doc(normalized).get();
    if (!snap.exists) return fallback ?? null;

    const data = snap.data() || {};
    return {
      id: normalized,
      name: asString(data.name, fallback?.name ?? normalized),
      street: asString(data.street, fallback?.street ?? ""),
      city: asString(data.city, fallback?.city ?? ""),
      zip: asString(data.zip, fallback?.zip ?? ""),
      country: asString(data.country, fallback?.country ?? "France"),
      companyName: asString(data.companyName, fallback?.companyName ?? "Centre de domiciliation"),
      companyType: asString(data.companyType, fallback?.companyType ?? "Forme juridique à compléter"),
      companyCapital: asString(data.companyCapital, fallback?.companyCapital ?? "Capital à compléter"),
      companyRcs: asString(data.companyRcs, fallback?.companyRcs ?? "RCS à compléter"),
      companyApproval: asString(data.companyApproval, fallback?.companyApproval ?? "Agrément à compléter"),
      companyRepresentative: asString(
        data.companyRepresentative,
        fallback?.companyRepresentative ?? "Représentant du centre à compléter"
      ),
    };
  } catch (error) {
    logger.warn("Failed to resolve center for document generation", { addressId: normalized, error });
    return fallback ?? null;
  }
}

function buildContext(input: FormaliteInput, center: CenterDetails | null) {
  const companyName = asCompleted(input.companyName, "Dénomination sociale à compléter");
  const legalRepresentativeName = asCompleted(input.legalRepresentativeName, "Représentant légal à compléter");
  const legalRepresentativeEmail = asCompleted(input.legalRepresentativeEmail, "E-mail à compléter");
  const companyAddress = asCompleted(
    input.companyAddress,
    center ? centerAddress(center) : "Adresse du siège à compléter"
  );

  return {
    projectType: getProjectType(input.projectType),
    companyName,
    companyAddress,
    legalRepresentativeName,
    legalRepresentativeEmail,
    registrationDate: formatDateFr(input.registrationDate),
    oldCompanyAddress: asCompleted(input.oldCompanyAddress, "Ancienne adresse à compléter"),
    siret: asCompleted(input.siret, "SIRET à compléter"),
    legalStatus: asCompleted(input.legalStatus, "Forme juridique à compléter"),
    capitalSocial: asCompleted(input.capitalSocial, "Capital social à compléter"),
    activityDescription: asCompleted(input.activityDescription, "Activité à compléter"),
    center,
  };
}

type FormaliteContext = ReturnType<typeof buildContext>;

function normalizeLegalForm(value: unknown): LegalForm {
  const raw = asString(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (raw.includes("sasu")) return "sasu";
  if (raw.includes("sas")) return "sas";
  if (raw.includes("sarl")) return "sarl";
  if (raw.includes("eurl")) return "eurl";
  if (raw.includes("sci") || raw.includes("societe civile immobiliere")) return "sci";
  return "generic";
}

function legalFormLabel(form: LegalForm, fallback: string): string {
  const labels: Record<LegalForm, string> = {
    sasu: "Société par actions simplifiée unipersonnelle",
    sas: "Société par actions simplifiée",
    sarl: "Société à responsabilité limitée",
    eurl: "Entreprise unipersonnelle à responsabilité limitée",
    sci: "Société civile immobilière",
    generic: fallback,
  };
  return labels[form];
}

function unitsLabel(form: LegalForm): string {
  if (form === "sarl" || form === "eurl" || form === "sci") return "parts sociales";
  return "actions";
}

function unitSingularLabel(form: LegalForm): string {
  if (form === "sarl" || form === "eurl" || form === "sci") return "part sociale";
  return "action";
}

function holderLabel(form: LegalForm): string {
  if (form === "sasu") return "associé unique";
  if (form === "eurl") return "associé unique";
  if (form === "sas") return "actionnaires";
  return "associés";
}

function leaderTitle(form: LegalForm): string {
  if (form === "sarl" || form === "eurl" || form === "sci") return "gérant";
  if (form === "sas" || form === "sasu") return "président";
  return "représentant légal";
}

function decisionBody(form: LegalForm): string {
  if (form === "sasu" || form === "eurl") return "l'associé unique";
  if (form === "sas") return "la collectivité des actionnaires";
  if (form === "sarl" || form === "sci") return "la collectivité des associés";
  return "l'organe compétent selon les statuts";
}

function isSingleMemberForm(form: LegalForm): boolean {
  return form === "sasu" || form === "eurl";
}

function enrichedContext(ctx: FormaliteContext) {
  const form = normalizeLegalForm(ctx.legalStatus);
  const label = legalFormLabel(form, ctx.legalStatus);
  return {
    ...ctx,
    legalForm: form,
    legalFormLabel: label,
    leaderTitle: leaderTitle(form),
    unitsLabel: unitsLabel(form),
    unitSingularLabel: unitSingularLabel(form),
    holderLabel: holderLabel(form),
    decisionBody: decisionBody(form),
    singleMember: isSingleMemberForm(form),
  };
}

function buildAttestation(ctx: FormaliteContext): GeneratedFormaliteDocument {
  const center = ctx.center;
  const centerName = center?.companyName ?? "Centre de domiciliation à compléter";
  const centerLegal = center
    ? `${center.companyType} - Capital ${center.companyCapital}\n${centerAddress(center)}\nRCS ${center.companyRcs} - Agrément ${center.companyApproval}`
    : "Informations du centre à compléter";

  return {
    id: "attestation-domiciliation",
    title: "Attestation de domiciliation",
    category: "commun",
        required: false,
        content: compactLines([
      centerName.toUpperCase(),
      centerLegal,
      "",
      "ATTESTATION DE DOMICILIATION",
      "",
      `Je soussigné, ${center?.companyRepresentative ?? "représentant du centre à compléter"}, représentant ${centerName}, atteste que la société ci-dessous bénéficie d'une domiciliation dans nos locaux.`,
      "",
      "Société domiciliée :",
      `Dénomination : ${ctx.companyName}`,
      `Forme juridique : ${ctx.legalStatus}`,
      `Capital social : ${ctx.capitalSocial}`,
      `Représentant légal : ${ctx.legalRepresentativeName}`,
      `Immatriculation / SIRET : ${ctx.siret}`,
      "",
      "Adresse de domiciliation :",
      ctx.companyAddress,
      "",
      "Cette attestation est établie pour servir et valoir ce que de droit dans le cadre des formalités administratives, bancaires et juridiques de la société domiciliée.",
      "",
      `Date d'effet de la domiciliation : ${ctx.registrationDate}`,
      "",
      `Fait à ${center?.city ?? "ville à compléter"}, le ${ctx.registrationDate}`,
      "",
      "Signature et cachet du centre",
      "",
      LEGAL_NOTICE,
    ]),
  };
}

function buildCreationStatuts(ctx: FormaliteContext): string {
  const c = enrichedContext(ctx);

  const governanceClause = (() => {
    if (c.legalForm === "sas" || c.legalForm === "sasu") {
      return [
        "Article 12 - Président",
        `La société est représentée à l'égard des tiers par un président. Le premier président pressenti est : ${c.legalRepresentativeName}.`,
        "Le président dispose des pouvoirs les plus étendus pour agir en toute circonstance au nom de la société, dans la limite de l'objet social et sous réserve des pouvoirs attribués par la loi ou les statuts aux associés.",
        "",
        "Article 13 - Directeurs généraux",
        "Un ou plusieurs directeurs généraux peuvent être nommés par décision des associés ou de l'associé unique. Leurs pouvoirs, leur rémunération et la durée de leurs fonctions sont fixés dans l'acte de nomination.",
      ];
    }

    if (c.legalForm === "sarl" || c.legalForm === "eurl") {
      return [
        "Article 12 - Gérance",
        `La société est administrée par un ou plusieurs gérants, personnes physiques, associés ou non. Le premier gérant pressenti est : ${c.legalRepresentativeName}.`,
        "Le gérant engage la société à l'égard des tiers par les actes entrant dans l'objet social, sous réserve des limitations de pouvoirs prévues dans les statuts ou décidées par les associés.",
        "",
        "Article 13 - Rémunération de la gérance",
        "La rémunération éventuelle du gérant est fixée par décision des associés ou de l'associé unique. Les frais engagés dans l'intérêt de la société peuvent être remboursés sur justificatifs.",
      ];
    }

    if (c.legalForm === "sci") {
      return [
        "Article 12 - Gérance",
        `La société est gérée par un ou plusieurs gérants, associés ou non. Le premier gérant pressenti est : ${c.legalRepresentativeName}.`,
        "Le gérant accomplit les actes entrant dans l'objet civil de la société. Les actes d'acquisition, de vente, d'emprunt ou de constitution de garantie peuvent être soumis à autorisation préalable des associés selon les présents statuts.",
        "",
        "Article 13 - Responsabilité des associés",
        "Les associés répondent indéfiniment des dettes sociales à proportion de leur part dans le capital social, conformément au régime applicable aux sociétés civiles.",
      ];
    }

    return [
      "Article 12 - Direction",
      `La société est dirigée par ${c.legalRepresentativeName}, en qualité de ${c.leaderTitle}, sous réserve de validation de la forme sociale et des statuts définitifs.`,
    ];
  })();

  const decisionClause = c.singleMember
    ? [
        "Article 16 - Décisions de l'associé unique",
        "L'associé unique exerce les pouvoirs dévolus à la collectivité des associés. Ses décisions sont constatées par écrit et conservées dans le registre prévu à cet effet.",
      ]
    : [
        "Article 16 - Décisions collectives",
        "Les décisions collectives sont prises selon les modalités prévues par la loi et les présents statuts. Les décisions ordinaires et extraordinaires sont constatées par procès-verbal.",
        "Les règles de quorum, majorité, convocation, consultation écrite ou électronique sont à compléter selon l'organisation souhaitée par les associés.",
      ];

  const transferClause = (() => {
    if (c.legalForm === "sas" || c.legalForm === "sasu") {
      return [
        "Article 10 - Transmission des actions",
        "Les actions sont librement cessibles entre associés, sauf clause contraire. Toute cession à un tiers peut être soumise à agrément préalable selon les modalités à compléter.",
        "Une clause de préemption, d'inaliénabilité ou d'exclusion peut être ajoutée si le projet le nécessite.",
      ];
    }

    if (c.legalForm === "sarl" || c.legalForm === "eurl") {
      return [
        "Article 10 - Cession des parts sociales",
        "Les parts sociales ne peuvent être cédées à des tiers étrangers à la société qu'avec le consentement de la majorité prévue par la loi ou par les statuts définitifs.",
        "Les cessions entre associés, conjoints, ascendants ou descendants sont à encadrer selon les choix des associés.",
      ];
    }

    if (c.legalForm === "sci") {
      return [
        "Article 10 - Cession des parts sociales",
        "Les parts sociales ne peuvent être cédées à des tiers qu'après agrément des associés. Les modalités d'agrément, de notification et de rachat sont à compléter selon la stratégie patrimoniale retenue.",
      ];
    }

    return [
      "Article 10 - Transmission des titres",
      "La transmission des titres est encadrée par les règles applicables à la forme sociale retenue et par les clauses statutaires définitives.",
    ];
  })();

  return compactLines([
    "PROJET DE STATUTS CONSTITUTIFS",
    "",
    `Dénomination : ${c.companyName}`,
    `Forme : ${c.legalFormLabel}`,
    `Capital social : ${c.capitalSocial}`,
    `Siège social : ${c.companyAddress}`,
    "",
    "Article 1 - Forme",
    `Il est constitué une société de forme ${c.legalFormLabel}, régie par les lois et règlements en vigueur ainsi que par les présents statuts.`,
    "",
    "Article 2 - Dénomination sociale",
    `La société prend la dénomination suivante : ${c.companyName}.`,
    "Tous les actes, factures, annonces, publications et autres documents émanant de la société doivent indiquer la dénomination sociale précédée ou suivie de la forme juridique et du montant du capital social.",
    "",
    "Article 3 - Objet social",
    `La société a pour objet, en France et à l'étranger : ${c.activityDescription}.`,
    "Elle peut réaliser toutes opérations industrielles, commerciales, financières, civiles, mobilières ou immobilières se rattachant directement ou indirectement à l'objet social, sous réserve de compatibilité avec la forme sociale retenue.",
    "",
    "Article 4 - Siège social",
    `Le siège social est fixé à : ${c.companyAddress}.`,
    "Il pourra être transféré conformément aux règles de décision prévues par les présents statuts et aux formalités légales applicables.",
    "",
    "Article 5 - Durée",
    "La durée de la société est fixée à 99 années à compter de son immatriculation au registre compétent, sauf dissolution anticipée ou prorogation.",
    "",
    "Article 6 - Apports",
    "Les apports en numéraire, en nature ou en industrie sont à détailler dans les statuts définitifs.",
    "Apports en numéraire : À compléter",
    "Apports en nature : À compléter ou indiquer néant",
    "Apports en industrie : À compléter ou indiquer néant",
    "",
    "Article 7 - Capital social",
    `Le capital social est fixé à ${c.capitalSocial}. Il est divisé en ${c.unitsLabel} à compléter, entièrement souscrites et libérées selon les modalités à préciser.`,
    "",
    "Article 8 - Libération des apports",
    "Les apports en numéraire sont libérés selon les exigences légales et les choix des associés. L'attestation de dépôt des fonds devra être jointe lorsque le capital est déposé auprès d'un établissement habilité.",
    "",
    "Article 9 - Droits attachés aux titres",
    `Chaque ${c.unitSingularLabel} donne droit à une quote-part des bénéfices, de l'actif social et du boni de liquidation proportionnelle à la participation détenue, sauf clause particulière à compléter.`,
    "",
    ...transferClause,
    "",
    "Article 11 - Exercice social",
    "Chaque exercice social a une durée de douze mois. Il commence le 1er janvier et se termine le 31 décembre, sauf premier exercice qui pourra être clos à une date différente à compléter.",
    "",
    ...governanceClause,
    "",
    "Article 14 - Conventions réglementées",
    "Les conventions intervenant directement ou par personne interposée entre la société et ses dirigeants ou associés sont soumises au régime applicable à la forme sociale retenue.",
    "",
    "Article 15 - Comptes sociaux et affectation du résultat",
    "À la clôture de chaque exercice, les comptes annuels sont établis conformément aux règles comptables applicables. Le résultat est affecté selon les décisions des associés ou de l'associé unique.",
    "",
    ...decisionClause,
    "",
    "Article 17 - Dissolution et liquidation",
    "La dissolution et la liquidation de la société sont effectuées conformément aux dispositions légales et réglementaires applicables.",
    "",
    "Article 18 - Frais et pouvoirs",
    "Les frais, droits et honoraires des présents statuts et de leurs suites seront supportés par la société après immatriculation. Tous pouvoirs sont donnés au porteur d'un original, d'une copie ou d'un extrait pour accomplir les formalités.",
    "",
    "Signatures",
    `${c.singleMember ? "L'associé unique" : "Les associés"} : À compléter`,
    `${c.leaderTitle[0].toUpperCase()}${c.leaderTitle.slice(1)} pressenti : ${c.legalRepresentativeName}`,
    "",
    LEGAL_NOTICE,
  ]);
}

function buildConstitutionDecision(ctx: FormaliteContext): GeneratedFormaliteDocument {
  const c = enrichedContext(ctx);
  const title = c.singleMember ? "Décision de constitution de l'associé unique" : "Procès-verbal d'assemblée constitutive";

  return {
    id: "decision-constitution",
    title,
    category: "creation",
    required: true,
    content: compactLines([
      title.toUpperCase(),
      "",
      `Société : ${c.companyName}`,
      `Forme : ${c.legalFormLabel}`,
      `Siège : ${c.companyAddress}`,
      "",
      `Le ${c.registrationDate}, ${c.decisionBody} constate la volonté de constituer la société ${c.companyName}.`,
      "",
      "Décisions",
      `1. Adoption des statuts de la société ${c.companyName}.`,
      `2. Fixation du siège social à l'adresse suivante : ${c.companyAddress}.`,
      `3. Nomination de ${c.legalRepresentativeName} en qualité de ${c.leaderTitle}.`,
      "4. Pouvoirs donnés pour accomplir les formalités de constitution et d'immatriculation sur le guichet unique.",
      "5. Autorisation de reprise des actes accomplis pour le compte de la société en formation, le cas échéant.",
      "",
      "Pièces à annexer si disponibles",
      "- Statuts signés",
      "- Attestation de dépôt des fonds",
      "- Justificatif de domiciliation",
      "- Déclaration de non-condamnation et filiation du dirigeant",
      "",
      `Fait le ${c.registrationDate}.`,
      "",
      "Signature",
      "",
      LEGAL_NOTICE,
    ]),
  };
}

function buildCapitalDepositMemo(ctx: FormaliteContext): GeneratedFormaliteDocument {
  const c = enrichedContext(ctx);
  return {
    id: "memo-depot-capital",
    title: "Mémo dépôt de capital",
    category: "creation",
    required: false,
    content: compactLines([
      "MÉMO DE PRÉPARATION - DÉPÔT DU CAPITAL SOCIAL",
      "",
      `Société en formation : ${c.companyName}`,
      `Capital social prévu : ${c.capitalSocial}`,
      `Titres : ${c.unitsLabel}`,
      "",
      "Informations à transmettre à l'établissement dépositaire",
      "- Dénomination sociale",
      "- Forme juridique",
      "- Adresse du siège social",
      "- Identité complète des associés ou actionnaires",
      "- Répartition du capital et montants libérés",
      "- Projet de statuts",
      "",
      "À joindre au dossier de création",
      "- Attestation de dépôt des fonds",
      "- Liste des souscripteurs / associés cohérente avec les statuts",
      "",
      "Ce mémo ne remplace pas l'attestation officielle délivrée par l'établissement dépositaire.",
      "",
      LEGAL_NOTICE,
    ]),
  };
}

function creationLegalIdLine(ctx: FormaliteContext): string {
  const siret = asString(ctx.siret);
  if (!siret || siret === "A completer" || siret === "SIRET a completer") {
    return "SIREN / SIRET : en cours d'immatriculation";
  }
  return `SIRET : ${siret}`;
}

function buildBeneficialOwnersDeclaration(ctx: FormaliteContext): GeneratedFormaliteDocument {
  const c = enrichedContext(ctx);

  return {
    id: "declaration-beneficiaires-effectifs",
    title: "Declaration des beneficiaires effectifs",
    category: "creation",
    required: true,
    content: compactLines([
      "DECLARATION DES BENEFICIAIRES EFFECTIFS",
      "",
      `Societe : ${c.companyName}`,
      `Forme juridique : ${c.legalFormLabel}`,
      `Siege social : ${c.companyAddress}`,
      creationLegalIdLine(ctx),
      "",
      "Beneficiaire effectif ndeg1",
      "Nom de naissance : A completer",
      "Nom d'usage : A completer",
      "Prenoms : A completer",
      "Date et lieu de naissance : A completer",
      "Nationalite : A completer",
      "Adresse personnelle : A completer",
      "Modalite du controle : detention du capital / droits de vote / pouvoir de controle / representant legal a defaut",
      "Pourcentage de capital detenu : A completer",
      "Pourcentage de droits de vote detenu : A completer",
      "Date a laquelle la personne est devenue beneficiaire effectif : A completer",
      "",
      "Beneficiaire effectif ndeg2",
      "Nom de naissance : A completer",
      "Nom d'usage : A completer",
      "Prenoms : A completer",
      "Date et lieu de naissance : A completer",
      "Nationalite : A completer",
      "Adresse personnelle : A completer",
      "Modalite du controle : A completer",
      "Pourcentage de capital detenu : A completer",
      "Pourcentage de droits de vote detenu : A completer",
      "Date a laquelle la personne est devenue beneficiaire effectif : A completer",
      "",
      "Attestation",
      `Je soussigne(e), ${c.legalRepresentativeName}, ${c.leaderTitle} de ${c.companyName}, certifie l'exactitude des informations renseignees ci-dessus pour la declaration effectuee sur le guichet unique.`,
      "",
      `Fait le ${c.registrationDate}.`,
      "",
      "Signature du representant legal",
      "",
      "Ce modele sert de trame de travail pour preparer la declaration obligatoire des beneficiaires effectifs a saisir lors de l'immatriculation.",
      "",
      LEGAL_NOTICE,
    ]),
  };
}

function buildBeneficialOwnersUpdateDeclaration(ctx: FormaliteContext): GeneratedFormaliteDocument {
  const c = enrichedContext(ctx);

  return {
    id: "declaration-modificative-beneficiaires-effectifs",
    title: "Declaration modificative des beneficiaires effectifs",
    category: "transfert",
    required: false,
    content: compactLines([
      "DECLARATION MODIFICATIVE DES BENEFICIAIRES EFFECTIFS",
      "",
      `Societe : ${c.companyName}`,
      `Forme juridique : ${c.legalFormLabel}`,
      `Siege social apres transfert : ${c.companyAddress}`,
      `Ancien siege social : ${c.oldCompanyAddress}`,
      `SIRET : ${c.siret}`,
      "",
      "A utiliser uniquement si le transfert de siege s'accompagne d'une modification des beneficiaires effectifs ou des modalites de controle.",
      "",
      "Beneficiaire effectif concerne",
      "Nom et prenoms : A completer",
      "Adresse personnelle : A completer",
      "Ancienne situation declaree : A completer",
      "Nouvelle situation declaree : A completer",
      "Date d'effet de la modification : A completer",
      "",
      "Motif de la mise a jour",
      "- changement de detenteur de plus de 25 % du capital ou des droits de vote",
      "- changement de modalite de controle",
      "- changement d'adresse personnelle",
      "- autre motif a preciser",
      "",
      `Je soussigne(e), ${c.legalRepresentativeName}, ${c.leaderTitle} de ${c.companyName}, certifie l'exactitude des informations declarees ci-dessus.`,
      "",
      `Fait le ${c.registrationDate}.`,
      "",
      "Signature du representant legal",
      "",
      LEGAL_NOTICE,
    ]),
  };
}

function buildDepositPacketMemo(ctx: FormaliteContext): GeneratedFormaliteDocument {
  const c = enrichedContext(ctx);

  const generatedLines =
    c.projectType === "creation"
      ? [
          "- Statuts constitutifs",
          "- Decision de constitution ou PV constitutif",
          "- Acte de nomination du dirigeant si necessaire",
          "- Declaration de non-condamnation et filiation",
          "- Liste des souscripteurs et apports",
          "- Texte d'annonce legale",
          "- Declaration des beneficiaires effectifs",
          "- Mandat de formalites",
          "- Attestation de domiciliation",
        ]
      : [
          "- Decision de transfert de siege",
          "- Statuts mis a jour",
          "- Certification conforme des statuts",
          "- Texte d'annonce legale de transfert",
          "- Liste des sieges successifs",
          "- Attestation de domiciliation",
          "- Mandat de formalites",
          "- Declaration modificative des beneficiaires effectifs si necessaire",
        ];

  const externalLines =
    c.projectType === "creation"
      ? [
          "- Justificatif de domiciliation signe ou titre d'occupation lisible",
          "- Attestation de parution de l'avis de constitution dans un support d'annonces legales",
          "- Certificat ou attestation de depot des fonds",
          "- Piece d'identite du dirigeant",
          "- Autorisation, diplome ou titre si activite reglementee",
          "- Toute piece complementaire demandee par le guichet selon le dossier",
        ]
      : [
          "- Justificatif de jouissance des nouveaux locaux",
          "- Attestation de parution de l'avis de transfert dans un support d'annonces legales",
          "- Kbis recent si necessaire pour le controle du dossier",
          "- Declaration BE sur le guichet unique uniquement si une modification concerne les beneficiaires effectifs",
          "- Toute piece complementaire demandee par le guichet selon le ressort et l'activite",
        ];

  return {
    id: `memo-dossier-depot-${c.projectType}`,
    title: "Memo dossier de depot",
    category: "checklist",
    required: false,
    content: compactLines([
      "MEMO DOSSIER DE DEPOT - GUICHET UNIQUE",
      "",
      `Operation : ${c.projectType === "creation" ? "Creation de societe" : "Transfert de siege social"}`,
      `Societe : ${c.companyName}`,
      "",
      "Documents generes dans la liasse CCS DOM",
      ...generatedLines,
      "",
      "Pieces externes a obtenir ou joindre en plus",
      ...externalLines,
      "",
      "Controle interne avant depot",
      "- coherence denomination / forme / capital / representant legal",
      "- dates identiques entre la decision, les statuts, la domiciliation et l'annonce legale",
      "- fichiers PDF lisibles, signes et dates",
      "- verification finale sur le guichet unique car les justificatifs exigibles varient selon la forme sociale, l'activite et le declarant",
      "",
      LEGAL_NOTICE,
    ]),
  };
}

function creationDocuments(ctx: FormaliteContext): GeneratedFormaliteDocument[] {
  const c = enrichedContext(ctx);
  return [
    {
      id: "statuts-constitutifs",
      title: `Statuts constitutifs ${c.legalForm === "generic" ? "" : c.legalFormLabel}`.trim(),
      category: "creation",
      required: true,
      content: buildCreationStatuts(ctx),
    },
    buildConstitutionDecision(ctx),
    {
      id: "nomination-dirigeant",
      title: "Acte de nomination du dirigeant",
      category: "creation",
      required: true,
      content: compactLines([
        "ACTE DE NOMINATION DU DIRIGEANT",
        "",
        `Société en formation : ${ctx.companyName}`,
        `Forme juridique : ${ctx.legalStatus}`,
        `Siège social : ${ctx.companyAddress}`,
        "",
        `${c.decisionBody} décide de nommer ${ctx.legalRepresentativeName} en qualité de ${c.leaderTitle} de la société, pour la durée prévue par les statuts ou jusqu'à décision contraire de l'organe compétent.`,
        "",
        `${ctx.legalRepresentativeName} déclare accepter ces fonctions et ne faire l'objet d'aucune interdiction de gérer, administrer ou diriger une personne morale.`,
        "",
        `Fait le ${ctx.registrationDate}.`,
        "",
        "Signature du dirigeant précédée de la mention manuscrite d'acceptation des fonctions.",
        "",
        LEGAL_NOTICE,
      ]),
    },
    {
      id: "declaration-non-condamnation",
      title: "Déclaration de non-condamnation et filiation",
      category: "creation",
      required: true,
      content: compactLines([
        "DÉCLARATION DE NON-CONDAMNATION ET DE FILIATION",
        "",
        `Je soussigné(e), ${ctx.legalRepresentativeName}, pressenti(e) pour exercer les fonctions de représentant légal de ${ctx.companyName}, déclare sur l'honneur n'avoir fait l'objet d'aucune condamnation pénale ni sanction civile ou administrative de nature à m'interdire de gérer, administrer ou diriger une personne morale.`,
        "",
        "Filiation :",
        "Nom et prénoms du père : À compléter",
        "Nom de naissance et prénoms de la mère : À compléter",
        "Date et lieu de naissance : À compléter",
        "Nationalité : À compléter",
        "Adresse personnelle : À compléter",
        "",
        `Fait le ${ctx.registrationDate}.`,
        "",
        "Signature du déclarant",
        "",
        LEGAL_NOTICE,
      ]),
    },
    {
      id: "liste-souscripteurs-apports",
      title: "Liste des souscripteurs et apports",
      category: "creation",
      required: true,
      content: compactLines([
        "LISTE DES SOUSCRIPTEURS / ASSOCIÉS ET APPORTS",
        "",
        `Société : ${ctx.companyName}`,
        `Capital social : ${ctx.capitalSocial}`,
        `Titres concernés : ${c.unitsLabel}`,
        "",
        `${c.holderLabel[0].toUpperCase()}${c.holderLabel.slice(1)} :`,
        "1. Nom / Dénomination : À compléter",
        "   Adresse : À compléter",
        `   Nombre de ${c.unitsLabel} : À compléter`,
        "   Montant souscrit : À compléter",
        "   Montant libéré : À compléter",
        "",
        "Total souscrit : À compléter",
        "Total libéré : À compléter",
        "",
        "Ce document doit être cohérent avec l'attestation de dépôt des fonds, les statuts et les justificatifs d'identité des associés.",
        "",
        LEGAL_NOTICE,
      ]),
    },
    {
      id: "avis-constitution",
      title: "Avis de constitution",
      category: "creation",
      required: true,
      content: compactLines([
        "AVIS DE CONSTITUTION",
        "",
        `Aux termes d'un acte sous signature privée en date du ${ctx.registrationDate}, il a été constitué une société présentant les caractéristiques suivantes :`,
        "",
        `Dénomination : ${ctx.companyName}`,
        `Forme : ${c.legalFormLabel}`,
        `Capital : ${ctx.capitalSocial}`,
        `Siège : ${ctx.companyAddress}`,
        `Objet : ${ctx.activityDescription}`,
        "Durée : 99 ans à compter de son immatriculation",
        `${c.leaderTitle[0].toUpperCase()}${c.leaderTitle.slice(1)} : ${ctx.legalRepresentativeName}`,
        "Immatriculation : Registre du commerce et des sociétés compétent selon le siège social.",
        "",
        "Pour avis",
        "",
        LEGAL_NOTICE,
      ]),
    },
    {
      id: "fiche-beneficiaires-effectifs",
      title: "Fiche préparatoire bénéficiaires effectifs",
      category: "creation",
      required: true,
      content: compactLines([
        "FICHE PRÉPARATOIRE - BÉNÉFICIAIRES EFFECTIFS",
        "",
        `Société : ${ctx.companyName}`,
        "",
        "Bénéficiaire effectif n°1 :",
        "Nom et prénoms : À compléter",
        "Date et lieu de naissance : À compléter",
        "Nationalité : À compléter",
        "Adresse personnelle : À compléter",
        "Modalités de contrôle : détention directe / indirecte / pouvoir de contrôle à préciser",
        "Pourcentage de détention : À compléter",
        "",
        "Cette fiche sert à préparer la déclaration des bénéficiaires effectifs sur le guichet unique.",
        "",
        LEGAL_NOTICE,
      ]),
    },
    {
      id: "mandat-formaliste",
      title: "Mandat de formalités",
      category: "commun",
      required: true,
      content: buildMandat(ctx),
    },
    buildCapitalDepositMemo(ctx),
    {
      id: "annexe-actes-formation",
      title: "Annexe des actes accomplis pour la société en formation",
      category: "creation",
      required: false,
      content: compactLines([
        "ANNEXE DES ACTES ACCOMPLIS POUR LE COMPTE DE LA SOCIÉTÉ EN FORMATION",
        "",
        `Société en formation : ${ctx.companyName}`,
        "",
        "Les associés déclarent que les actes suivants ont été accomplis pour le compte de la société en formation :",
        "- Contrat de domiciliation : à confirmer",
        "- Ouverture de compte bancaire / dépôt de capital : à confirmer",
        "- Engagements commerciaux éventuels : à compléter",
        "",
        "Après immatriculation, ces engagements pourront être repris par la société selon les règles applicables.",
        "",
        LEGAL_NOTICE,
      ]),
    },
    buildBeneficialOwnersDeclaration(ctx),
    buildAttestation(ctx),
    buildDepositPacketMemo(ctx),
    buildGuichetSummary(ctx),
    buildChecklist(ctx),
  ];
}

function buildTransferDecision(ctx: FormaliteContext): string {
  const c = enrichedContext(ctx);
  return compactLines([
    "DÉCISION DE TRANSFERT DE SIÈGE SOCIAL",
    "",
    `Société : ${c.companyName}`,
    `Forme : ${c.legalFormLabel}`,
    `Capital social : ${c.capitalSocial}`,
    `SIRET : ${c.siret}`,
    "",
    `Le ${c.registrationDate}, ${c.decisionBody} constate que le siège social actuel est situé :`,
    c.oldCompanyAddress,
    "",
    "Après examen de l'intérêt social et des conditions de domiciliation, il est décidé ce qui suit :",
    "",
    "Première décision - Transfert du siège social",
    `Le siège social de la société est transféré à compter du ${c.registrationDate} à l'adresse suivante : ${c.companyAddress}.`,
    "",
    "Deuxième décision - Modification corrélative des statuts",
    "L'article des statuts relatif au siège social est modifié en conséquence. Les autres clauses statutaires demeurent inchangées, sauf mention contraire dans les statuts mis à jour.",
    "",
    "Troisième décision - Formalités",
    "Tous pouvoirs sont donnés au porteur d'un original, d'une copie ou d'un extrait du présent acte pour accomplir les formalités de publicité, de dépôt et de modification auprès du guichet unique.",
    "",
    "Observation de conformité",
    "Lorsque les statuts attribuent la compétence de transfert à un organe particulier ou exigent une ratification, la présente décision doit être adaptée à ces règles statutaires.",
    "",
    `Fait le ${c.registrationDate}.`,
    "",
    "Signature",
    "",
    LEGAL_NOTICE,
  ]);
}

function buildUpdatedStatuts(ctx: FormaliteContext): string {
  const c = enrichedContext(ctx);
  return compactLines([
    "STATUTS MIS À JOUR APRÈS TRANSFERT DE SIÈGE SOCIAL",
    "",
    `Dénomination : ${c.companyName}`,
    `Forme : ${c.legalFormLabel}`,
    `Capital social : ${c.capitalSocial}`,
    `SIRET : ${c.siret}`,
    "",
    "Article relatif au siège social - Nouvelle rédaction",
    `Le siège social est fixé à : ${c.companyAddress}.`,
    "",
    "Il peut être transféré en tout autre lieu selon les modalités prévues par les statuts et les dispositions légales applicables à la forme sociale de la société.",
    "",
    "Mention de mise à jour",
    `Les présents statuts sont mis à jour à la suite de la décision de transfert du siège social en date du ${c.registrationDate}.`,
    "",
    "Clauses inchangées",
    "Toutes les autres clauses des statuts demeurent inchangées, sous réserve des modifications supplémentaires expressément décidées par l'organe compétent.",
    "",
    "Certification",
    `Je soussigné(e), ${c.legalRepresentativeName}, agissant en qualité de ${c.leaderTitle} de ${c.companyName}, certifie les présents statuts conformes à la décision de transfert de siège.`,
    "",
    `Fait le ${c.registrationDate}.`,
    "",
    "Signature du représentant légal",
    "",
    LEGAL_NOTICE,
  ]);
}

function buildTransferNotice(ctx: FormaliteContext): string {
  const c = enrichedContext(ctx);
  return compactLines([
    "AVIS DE TRANSFERT DE SIÈGE SOCIAL",
    "",
    `${c.companyName}`,
    `${c.legalFormLabel} au capital de ${c.capitalSocial}`,
    `Siège social ancien : ${c.oldCompanyAddress}`,
    `SIRET : ${c.siret}`,
    "",
    `Aux termes d'une décision en date du ${c.registrationDate}, ${c.decisionBody} a décidé de transférer le siège social à l'adresse suivante : ${c.companyAddress}, à compter du ${c.registrationDate}.`,
    "",
    "L'article des statuts relatif au siège social a été modifié en conséquence.",
    "",
    "Ancienne mention :",
    `Siège social : ${c.oldCompanyAddress}`,
    "",
    "Nouvelle mention :",
    `Siège social : ${c.companyAddress}`,
    "",
    `${c.leaderTitle[0].toUpperCase()}${c.leaderTitle.slice(1)} : ${c.legalRepresentativeName}`,
    "Mention au RCS compétent : À compléter selon le ressort de l'ancien et du nouveau siège.",
    "",
    "Pour avis",
    "",
    LEGAL_NOTICE,
  ]);
}

function transfertDocuments(ctx: FormaliteContext): GeneratedFormaliteDocument[] {
  const c = enrichedContext(ctx);
  return [
    {
      id: "decision-transfert-siege",
      title: `Décision de transfert de siège ${c.legalForm === "generic" ? "" : c.legalFormLabel}`.trim(),
      category: "transfert",
      required: true,
      content: buildTransferDecision(ctx),
    },
    {
      id: "statuts-mis-a-jour",
      title: "Statuts mis à jour",
      category: "transfert",
      required: true,
      content: buildUpdatedStatuts(ctx),
    },
    {
      id: "certification-conforme-statuts",
      title: "Certification conforme des statuts",
      category: "transfert",
      required: true,
      content: compactLines([
        "CERTIFICATION CONFORME",
        "",
        `Je soussigné(e), ${ctx.legalRepresentativeName}, représentant légal de ${ctx.companyName}, certifie conforme à l'original le présent exemplaire des statuts mis à jour à la suite du transfert de siège social décidé le ${ctx.registrationDate}.`,
        "",
        `Fait le ${ctx.registrationDate}.`,
        "",
        "Signature du représentant légal",
        "",
        LEGAL_NOTICE,
      ]),
    },
    {
      id: "avis-transfert-siege",
      title: "Avis de transfert de siège",
      category: "transfert",
      required: true,
      content: buildTransferNotice(ctx),
    },
    {
      id: "liste-sieges-successifs",
      title: "Liste des sièges successifs",
      category: "transfert",
      required: true,
      content: compactLines([
        "LISTE DES SIÈGES SOCIAUX SUCCESSIFS",
        "",
        `Société : ${ctx.companyName}`,
        `SIRET : ${ctx.siret}`,
        "",
        "1. Ancien siège social",
        ctx.oldCompanyAddress,
        "",
        "2. Nouveau siège social",
        ctx.companyAddress,
        "",
        "Cette liste est à compléter si la société a connu plusieurs transferts depuis son immatriculation.",
        "",
        LEGAL_NOTICE,
      ]),
    },
    {
      id: "fiche-beneficiaires-effectifs-modification",
      title: "Contrôle bénéficiaires effectifs",
      category: "transfert",
      required: false,
      content: compactLines([
        "CONTRÔLE DES BÉNÉFICIAIRES EFFECTIFS",
        "",
        `Société : ${ctx.companyName}`,
        "",
        "Le transfert de siège n'entraîne pas automatiquement une modification des bénéficiaires effectifs. Vérifier néanmoins si une modification de contrôle, d'associés ou de dirigeant est intervenue.",
        "",
        "Situation à confirmer :",
        "- Bénéficiaires effectifs inchangés : oui / non",
        "- Modification à déclarer : oui / non",
        "- Pièces justificatives à joindre : à compléter",
        "",
        LEGAL_NOTICE,
      ]),
    },
    {
      id: "mandat-formaliste",
      title: "Mandat de formalités",
      category: "commun",
      required: true,
      content: buildMandat(ctx),
    },
    buildBeneficialOwnersUpdateDeclaration(ctx),
    buildAttestation(ctx),
    buildDepositPacketMemo(ctx),
    buildGuichetSummary(ctx),
    buildChecklist(ctx),
  ];
}

function buildMandat(ctx: FormaliteContext): string {
  const operation =
    ctx.projectType === "transfert"
      ? "transfert de siège social"
      : "création et immatriculation de société";

  return compactLines([
    "MANDAT DE FORMALITÉS",
    "",
    `Je soussigné(e), ${ctx.legalRepresentativeName}, représentant légal de ${ctx.companyName}, donne mandat à CCS DOM et/ou à son prestataire formaliste afin d'accomplir les démarches nécessaires à l'opération suivante : ${operation}.`,
    "",
    "Le mandataire est autorisé à préparer, déposer, compléter et suivre le dossier auprès du guichet unique et des organismes compétents, sur la base des informations et justificatifs transmis.",
    "",
    "Adresse e-mail de contact du mandant :",
    ctx.legalRepresentativeEmail,
    "",
    `Fait le ${ctx.registrationDate}.`,
    "",
    "Signature du mandant",
    "",
    LEGAL_NOTICE,
  ]);
}

function buildGuichetSummary(ctx: FormaliteContext): GeneratedFormaliteDocument {
  const c = enrichedContext(ctx);
  const creation = c.projectType === "creation";

  return {
    id: "synthese-guichet-unique",
    title: "Synthèse de dépôt guichet unique",
    category: "checklist",
    required: true,
    content: compactLines([
      "SYNTHÈSE DE DÉPÔT - GUICHET UNIQUE",
      "",
      `Opération : ${creation ? "Création et immatriculation" : "Modification - transfert de siège social"}`,
      `Société : ${c.companyName}`,
      `Forme : ${c.legalFormLabel}`,
      `Représentant légal : ${c.legalRepresentativeName}`,
      `Adresse de domiciliation : ${c.companyAddress}`,
      creation ? false : `Ancienne adresse : ${c.oldCompanyAddress}`,
      creation ? false : `SIRET : ${c.siret}`,
      "",
      "Données à contrôler avant dépôt",
      "- Dénomination sociale strictement identique sur tous les documents",
      "- Forme juridique cohérente entre statuts, annonce légale et formulaire",
      "- Capital social et répartition des titres cohérents avec le dépôt de fonds",
      "- Adresse du siège identique à l'attestation ou au contrat de domiciliation",
      "- Identité complète du représentant légal",
      "- Bénéficiaires effectifs renseignés lorsque nécessaire",
      "",
      "Contraintes de dépôt",
      "- Les pièces justificatives destinées au guichet unique doivent être préparées au format PDF.",
      "- Vérifier la lisibilité, les signatures, les dates et la taille des fichiers avant transmission.",
      "- Les pièces exactes peuvent varier selon l'activité, la forme juridique et les réponses saisies sur le guichet.",
      "",
      "Statut interne CCS DOM",
      "[ ] Informations client vérifiées",
      "[ ] Documents générés relus",
      "[ ] Pièces justificatives collectées",
      "[ ] Annonce légale prête ou publiée",
      "[ ] Dossier prêt pour dépôt",
      "",
      LEGAL_NOTICE,
    ]),
  };
}

function buildChecklist(ctx: FormaliteContext): GeneratedFormaliteDocument {
  const c = enrichedContext(ctx);
  const creationItems = [
    `[ ] Statuts ${c.legalFormLabel} signés`,
    `[ ] Décision de constitution ou procès-verbal constitutif ${c.singleMember ? "de l'associé unique" : "des associés/actionnaires"}`,
    `[ ] Acte de nomination du ${c.leaderTitle} si séparé des statuts`,
    "[ ] Déclaration de non-condamnation et filiation",
    `[ ] Liste des ${c.holderLabel} / souscripteurs et apports`,
    "[ ] Attestation de dépôt des fonds si capital en numéraire",
    "[ ] Avis de constitution publié",
    "[ ] Justificatif de domiciliation",
    "[ ] Pièce d'identité du dirigeant",
    "[ ] Déclaration des bénéficiaires effectifs",
    "[ ] Mandat de formalités signé",
    "[ ] Pièces PDF lisibles et datées",
  ];

  const transfertItems = [
    `[ ] Décision ou procès-verbal de transfert de siège par ${c.decisionBody}`,
    "[ ] Statuts mis à jour et certifiés conformes",
    "[ ] Attestation de domiciliation du nouveau siège",
    "[ ] Avis de transfert publié",
    "[ ] Deux avis si changement de ressort",
    "[ ] Liste des sièges successifs si nécessaire",
    "[ ] Extrait Kbis récent",
    "[ ] Vérification des bénéficiaires effectifs",
    "[ ] Mandat de formalités signé",
    "[ ] Pièces PDF lisibles et datées",
  ];

  return {
    id: "checklist-formalite",
    title: "Checklist de dépôt",
    category: "checklist",
    required: true,
    content: compactLines([
      "CHECKLIST DE DÉPÔT - GUICHET UNIQUE",
      "",
      `Dossier : ${ctx.companyName}`,
      `Opération : ${ctx.projectType === "transfert" ? "Transfert de siège" : "Création de société"}`,
      "",
      ...(ctx.projectType === "transfert" ? transfertItems : creationItems),
      "",
      "Contrôles avant dépôt :",
      "[ ] Cohérence dénomination / SIRET / représentant",
      "[ ] Dates identiques entre décision, statuts, attestation et annonce légale",
      "[ ] Adresse complète et conforme au contrat de domiciliation",
      "[ ] Pièces lisibles et signées",
      "",
      LEGAL_NOTICE,
    ]),
  };
}

function attachLegacyKeys(projectType: ProjectType, documents: GeneratedFormaliteDocument[]) {
  const byId = new Map(documents.map((doc) => [doc.id, doc.content]));

  return {
    statutsProjet: byId.get("statuts-constitutifs") ?? null,
    decisionAGE: byId.get("decision-transfert-siege") ?? null,
    statutsMisAJour: byId.get("statuts-mis-a-jour") ?? null,
    attestationDomiciliation: byId.get("attestation-domiciliation") ?? null,
    checklistFormalite: byId.get("checklist-formalite") ?? null,
    projectType,
  };
}

export const generateDocumentsFromData = onCall({ region: "europe-west9" }, async (req) => {
  const caller = await getCallerAccess(req);

  if (!caller.role || !STAFF_ROLES.includes(caller.role)) {
    throw new HttpsError("permission-denied", "Droits insuffisants pour générer les documents.");
  }

  const input = (req.data || {}) as FormaliteInput;
  const projectType = getProjectType(input.projectType);
  const centerId = normalizeCenterId(input.addressId);

  if (centerId && !canTouchCenter(caller.role, caller.managedCenterIds, centerId)) {
    throw new HttpsError("permission-denied", "Ce centre n'est pas dans votre périmètre.");
  }

  const center = await resolveCenter(centerId ?? (caller.managedCenterIds[0] as CenterId | undefined));
  const ctx = buildContext({ ...input, projectType }, center);
  const documents = projectType === "transfert" ? transfertDocuments(ctx) : creationDocuments(ctx);

  await adminDb.collection("activity_logs").add({
    type: "formalites.documents_generated",
    createdAt: AdminFieldValue.serverTimestamp(),
    actorUid: caller.uid,
    actorRole: caller.role,
    centerId: center?.id ?? centerId ?? null,
    targetCompanyName: asString(input.companyName) || null,
    projectType,
    documentCount: documents.length,
  });

  return {
    status: "ok",
    message: `${documents.length} documents préparés.`,
    documents,
    ...attachLegacyKeys(projectType, documents),
  };
});
