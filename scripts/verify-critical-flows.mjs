import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();

function readText(relativePath) {
  const fullPath = path.join(rootDir, relativePath);
  return fs.readFileSync(fullPath, "utf8");
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function pushCheck(results, name, ok, details) {
  results.push({ name, ok, details });
}

function collectAddressBlocks(source) {
  const matches = source.match(/\{\s*id:\s*"[^"]+"[\s\S]*?localDetails:\s*"[^"]*"[\s\S]*?\}/g) || [];
  return matches;
}

function ensureContainsAll(text, fragments) {
  return fragments.filter((fragment) => !text.includes(fragment));
}

function main() {
  const results = [];

  const packageJson = readJson("package.json");
  const firebaseJson = readJson("firebase.json");
  const appHostingYaml = readText("apphosting.yaml");
  const rolesSource = readText("src/lib/constants/roles.ts");
  const accessControlSource = readText("src/lib/access-control.ts");
  const addressesSource = readText("src/lib/addresses.ts");
  const signupConfigSource = readText("src/features/signup/config.ts");
  const signupDomiciliationStepSource = readText("src/components/signup/DomiciliationStep.tsx");
  const signupCompanySearchSource = readText("src/components/signup/CompanySearchStep.tsx");
  const signupRepresentativeSource = readText("src/components/signup/RepresentativeStep.tsx");
  const searchCompanyFlowSource = readText("src/ai/flows/search-company-flow.ts");
  const addressesPageSource = readText("src/app/admin/adresses/page.tsx");
  const clientsPageSource = readText("src/app/admin/clients/page.tsx");
  const dashboardDocumentsSource = readText("src/app/dashboard/documents/page.tsx");
  const dashboardSubscriptionSource = readText("src/app/dashboard/subscription/page.tsx");
  const navSource = readText("src/components/dashboard-nav.tsx");
  const functionsIndexSource = readText("functions/src/index.ts");
  const setRoleSource = readText("functions/src/callable/roles/setRole.ts");
  const adminDeleteUserSource = readText("functions/src/callable/roles/adminDeleteUser.ts");
  const subscriptionFunctionsSource = readText("functions/src/manageClientSubscription.ts");
  const manualRenewalsCronSource = readText("functions/src/crons/processManualSubscriptionRenewals.ts");
  const createStripeCheckoutSessionSource = readText("functions/src/createStripeCheckoutSession.ts");
  const stripeWebhookSource = readText("functions/src/triggers/stripeWebhook.ts");
  const pdfJobsSource = readText("functions/src/pdfJobs.ts");
  const documentsGeneratorSource = readText("functions/src/generateDocumentsFromData.ts");
  const centerGovernanceSource = readText("functions/src/admin/admin-update-center-governance.ts");
  const plansSource = readText("src/lib/plans.ts");
  const scanPageSource = readText("src/app/admin/scan/page.tsx");
  const mailPlanPolicySource = readText("functions/src/_config/mail-plan-policy.ts");
  const mailDocumentTriggerSource = readText("functions/src/triggers/courriers/onMailDocumentCreated.ts");

  pushCheck(
    results,
    "package scripts",
    Boolean(
      packageJson.scripts?.typecheck &&
        packageJson.scripts?.build &&
        packageJson.scripts?.["qa:critical"] &&
        packageJson.scripts?.["qa:release"]
    ),
    "Scripts attendus: typecheck, build, qa:critical, qa:release"
  );

  const missingAppHostingEnv = ensureContainsAll(appHostingYaml, [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_APP_URL",
  ]);
  pushCheck(
    results,
    "app hosting env",
    missingAppHostingEnv.length === 0,
    missingAppHostingEnv.length === 0
      ? "Variables publiques critiques presentes"
      : `Variables manquantes: ${missingAppHostingEnv.join(", ")}`
  );

  const extensions = firebaseJson.extensions || {};
  const requiredExtensions = [
    "firestore-stripe-payments",
    "firestore-pdf-generator",
    "pdf-generator-invoices-orly",
    "pdf-generator-invoices-paris",
  ];
  const missingExtensions = requiredExtensions.filter((key) => !(key in extensions));
  pushCheck(
    results,
    "firebase extensions",
    missingExtensions.length === 0,
    missingExtensions.length === 0
      ? "Extensions critiques presentes"
      : `Extensions manquantes: ${missingExtensions.join(", ")}`
  );

  const missingRoles = ensureContainsAll(rolesSource, [
    '"client"',
    '"manager"',
    '"manager_paris"',
    '"manager_orly"',
    '"secretary_paris"',
    '"secretary_orly"',
    '"super_admin"',
    "STAFF_ROLES",
    "MANAGER_ROLES",
    "ADMIN_ROLES",
  ]);
  pushCheck(
    results,
    "roles metier",
    missingRoles.length === 0,
    missingRoles.length === 0
      ? "Roles et groupes critiques definis"
      : `Elements manquants: ${missingRoles.join(", ")}`
  );

  const missingAccessRules = ensureContainsAll(accessControlSource, [
    'if (centerId === "paris") return "paris_12e";',
    'if (centerId === "orly") return "orly_ville";',
    'if (role === "super_admin") return true;',
    "resolveRecordCenterId",
  ]);
  pushCheck(
    results,
    "controle d acces multi-centres",
    missingAccessRules.length === 0,
    missingAccessRules.length === 0
      ? "Normalisation centre et bypass super_admin verifies"
      : `Regles manquantes: ${missingAccessRules.join(", ")}`
  );

  const addressBlocks = collectAddressBlocks(addressesSource);
  const hasTwoCenters = addressBlocks.length >= 2;
  const missingAddressFields = hasTwoCenters
    ? addressBlocks.flatMap((block, index) =>
        ensureContainsAll(block, [
          'tenantId:',
          'slug:',
          'addressKey:',
          'locationKey:',
          'lat:',
          'lng:',
          'companyName:',
          'companyRepresentative:',
        ]).map((field) => `center#${index + 1}:${field}`)
      )
    : ["moins de deux centres definis"];
  pushCheck(
    results,
    "catalogue des centres",
    hasTwoCenters && missingAddressFields.length === 0,
    hasTwoCenters && missingAddressFields.length === 0
      ? `${addressBlocks.length} centres detectes avec metadonnees critiques`
      : `Problemes detectes: ${missingAddressFields.join(", ")}`
  );

  const missingCenterArchiveFragments = [
    ...ensureContainsAll(centerGovernanceSource, [
      '"archived"',
      '"center.archived"',
      "countActiveClientsForCenter",
      "Archivage impossible",
      "archiveReason",
    ]).map((fragment) => `function:${fragment}`),
    ...ensureContainsAll(addressesPageSource, [
      "showArchived",
      'value="archived"',
      "archiveBlockedByActiveClients",
      "Archiver le centre",
      "Afficher archives",
    ]).map((fragment) => `ui:${fragment}`),
    ...ensureContainsAll(addressesSource, [
      '"active" | "inactive" | "archived"',
      "archivedAt",
      "archiveReason",
    ]).map((fragment) => `model:${fragment}`),
  ];
  pushCheck(
    results,
    "archivage centre protege",
    missingCenterArchiveFragments.length === 0,
    missingCenterArchiveFragments.length === 0
      ? "Archivage non destructif, masque par defaut et bloque si clients actifs"
      : `Fragments manquants: ${missingCenterArchiveFragments.join(", ")}`
  );

  const missingPublicSignupCentersFragments = [
    ...ensureContainsAll(functionsIndexSource, [
      'export { listPublicCenters } from "./listPublicCenters";',
    ]).map((fragment) => `export:${fragment}`),
    ...ensureContainsAll(readText("functions/src/listPublicCenters.ts"), [
      "publicSignupEnabled",
      "documentsReady",
      "billingReady",
      'status !== "active"',
      "DEFAULT_PUBLIC_CENTERS",
    ]).map((fragment) => `function:${fragment}`),
    ...ensureContainsAll(signupDomiciliationStepSource, [
      "listPublicCenters",
      "fallbackCenters",
      "setValue(\"addressKey\"",
      "setValue(\"locationKey\"",
    ]).map((fragment) => `ui:${fragment}`),
    ...ensureContainsAll(signupConfigSource, [
      "addressId: z",
      "addressKey: z.string().optional()",
      "locationKey: z.string().optional()",
    ]).map((fragment) => `schema:${fragment}`),
  ];
  pushCheck(
    results,
    "centres publics inscription dynamiques",
    missingPublicSignupCentersFragments.length === 0,
    missingPublicSignupCentersFragments.length === 0
      ? "Le choix d'adresse publique consomme une liste filtree et garde un fallback Orly/Paris"
      : `Fragments manquants: ${missingPublicSignupCentersFragments.join(", ")}`
  );

  const missingCenterPublicationReadinessFragments = [
    ...ensureContainsAll(centerGovernanceSource, [
      "publicSignupEnabled",
      "documentsReady",
      "billingReady",
      "readiness",
    ]).map((fragment) => `callable:${fragment}`),
    ...ensureContainsAll(addressesPageSource, [
      "Publication inscription",
      "publicSignupEnabled",
      "documentsReady",
      "billingReady",
      "isCenterPublicationReady",
    ]).map((fragment) => `ui:${fragment}`),
    ...ensureContainsAll(addressesSource, [
      "publicSignupEnabled?: boolean",
      "documentsReady?: boolean",
      "billingReady?: boolean",
    ]).map((fragment) => `model:${fragment}`),
  ];
  pushCheck(
    results,
    "publication centre prete",
    missingCenterPublicationReadinessFragments.length === 0,
    missingCenterPublicationReadinessFragments.length === 0
      ? "Un centre actif reste masque de l'inscription tant que documents et facturation ne sont pas prets"
      : `Fragments manquants: ${missingCenterPublicationReadinessFragments.join(", ")}`
  );

  const missingSignupRepresentativePrefillFragments = [
    ...ensureContainsAll(searchCompanyFlowSource, [
      "directorQuality",
    ]).map((fragment) => `flow:${fragment}`),
    ...ensureContainsAll(signupCompanySearchSource, [
      "resolveLegalStatusCode",
      "'autres'",
      "inferRepresentativeQuality",
      "setValue('quality'",
    ]).map((fragment) => `search:${fragment}`),
    ...ensureContainsAll(signupRepresentativeSource, [
      "getLegalStatusLabel",
      "Statut juridique récupéré",
      "value={field.value ?? ''}",
    ]).map((fragment) => `representative:${fragment}`),
  ];
  pushCheck(
    results,
    "pre-remplissage representant transfert",
    missingSignupRepresentativePrefillFragments.length === 0,
    missingSignupRepresentativePrefillFragments.length === 0
      ? "Statut juridique et qualite du representant sont recuperes ou inferes"
      : `Fragments manquants: ${missingSignupRepresentativePrefillFragments.join(", ")}`
  );

  const orlyAddressIdIndex = signupConfigSource.indexOf('if (addressId.includes("orly"))');
  const parisFreeAddressIndex = signupConfigSource.indexOf('if (address.includes("paris"))');
  const parisAddressIdIndex = signupConfigSource.indexOf('if (addressId.includes("paris"))');
  const orlyFreeAddressIndex = signupConfigSource.indexOf('if (address.includes("orly"))');
  const hasSignupCenterPriority =
    parisAddressIdIndex >= 0 &&
    orlyAddressIdIndex >= 0 &&
    parisFreeAddressIndex >= 0 &&
    orlyFreeAddressIndex >= 0 &&
    parisAddressIdIndex < parisFreeAddressIndex &&
    orlyAddressIdIndex < parisFreeAddressIndex &&
    orlyAddressIdIndex < orlyFreeAddressIndex;

  pushCheck(
    results,
    "priorite centre inscription",
    hasSignupCenterPriority,
    hasSignupCenterPriority
      ? "Le choix explicite du centre prime sur l'adresse libre du client"
      : "Le choix addressId doit primer sur les mots Paris/Orly presents dans l'adresse client"
  );

  const missingDirectClientCenterFragments = ensureContainsAll(clientsPageSource, [
    "centerId: addressId",
    "addressId,",
    "domiciliationAddressId: addressId",
    "addressKey: addressKeyForAddressId(addressId)",
    "locationKey: addressKeyForAddressId(addressId)",
    "paymentFrequency: userData.paymentFrequency",
    'paymentFrequency: z.enum(["monthly", "yearly"])',
    "scopedAddressId",
    "managedCenterIds.includes('paris_12e')",
    "managedCenterIds.includes('orly_ville')",
  ]);
  const missingSetRoleCenterFragments = ensureContainsAll(setRoleSource, [
    "const resolvedAddressId = domiciliationAddressId;",
    "const resolvedAddressKey = addressKeyForCenter(domiciliationAddressId);",
    "centerId: resolvedAddressId",
    "locationKey: resolvedAddressKey",
  ]);
  const missingDirectClientFragments = [
    ...missingDirectClientCenterFragments.map((fragment) => `ui:${fragment}`),
    ...missingSetRoleCenterFragments.map((fragment) => `callable:${fragment}`),
  ];
  pushCheck(
    results,
    "creation client directe par centre",
    missingDirectClientFragments.length === 0,
    missingDirectClientFragments.length === 0
      ? "Creation manager/secretaire rattachee au centre explicite et canonique"
      : `Fragments manquants: ${missingDirectClientFragments.join(", ")}`
  );

  const missingDirectClientBillingFragments = ensureContainsAll(setRoleSource, [
    "ensureDirectClientCreationInvoice",
    "inv_admin_onboarding_",
    'subscriptionStatus: "active"',
    'paymentStatus: "paid"',
    "planAmountCents",
    "paymentFrequency",
    "subscriptionRenewalDate",
    "billingPeriod",
    "pdf: {",
    "PDF_STATUS.PENDING",
    "invoiceIds: admin.firestore.FieldValue.arrayUnion(invoiceId)",
  ]);
  pushCheck(
    results,
    "facturation client cree par manager",
    missingDirectClientBillingFragments.length === 0,
    missingDirectClientBillingFragments.length === 0
      ? "Creation directe active l'abonnement et prepare une facture initiale PDF"
      : `Fragments manquants: ${missingDirectClientBillingFragments.join(", ")}`
  );

  const missingStaffRevocationFragments = ensureContainsAll(adminDeleteUserSource, [
    '"manager"',
    "function assertDeleteAllowed",
    "Un manager peut uniquement revoquer un secretaire de son centre",
    "managedCenterIdsFromData(targetRole, targetData)",
    "canTouchCenter(caller.role, caller.managedCenterIds, centerId)",
  ]);
  pushCheck(
    results,
    "revocation secretaire par manager bornee",
    missingStaffRevocationFragments.length === 0,
    missingStaffRevocationFragments.length === 0
      ? "Les managers peuvent revoquer uniquement les secretaires rattaches a leurs centres."
      : `Fragments manquants: ${missingStaffRevocationFragments.join(", ")}`
  );

  const missingClientDocumentPermissionFragments = ensureContainsAll(
    readText("firestore.rules"),
    [
      "function clientSelfUpdateFieldsAllowed()",
      "allow update: if isStaffOfExistingAndNext() || (isSelf(uid) && clientSelfUpdateFieldsAllowed());",
      "'documents'",
      "'documentsUploadMeta'",
    ]
  );
  pushCheck(
    results,
    "documents client self-service",
    missingClientDocumentPermissionFragments.length === 0,
    missingClientDocumentPermissionFragments.length === 0
      ? "Le client peut mettre a jour ses justificatifs sans toucher aux champs sensibles"
      : `Fragments manquants: ${missingClientDocumentPermissionFragments.join(", ")}`
  );

  const missingClientMailStatusFragments = ensureContainsAll(readText("firestore.rules"), [
    "function mailOwnerStatusUpdateAllowed()",
    "resource.data.ownerUid == request.auth.uid",
    "request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status'])",
    "allow update: if isStaffOfExistingAndNext() || mailOwnerStatusUpdateAllowed();",
  ]);
  pushCheck(
    results,
    "statut courrier modifiable par le client",
    missingClientMailStatusFragments.length === 0,
    missingClientMailStatusFragments.length === 0
      ? "Le client peut archiver ou marquer lu uniquement ses propres courriers"
      : `Fragments manquants: ${missingClientMailStatusFragments.join(", ")}`
  );

  const missingDashboardDocumentFragments = ensureContainsAll(dashboardDocumentsSource, [
    "function mergeDocumentSources",
    'doc(db, "client_requests", currentUserUid)',
    'doc(db, "clients", currentUserUid)',
    "setItems(extractDocuments(merged).length > 0 ? [merged] : [])",
  ]);
  pushCheck(
    results,
    "vue documents client fusionnee",
    missingDashboardDocumentFragments.length === 0,
    missingDashboardDocumentFragments.length === 0
      ? "La page client fusionne les PDF de client_requests et les uploads du profil client"
      : `Fragments manquants: ${missingDashboardDocumentFragments.join(", ")}`
  );

  const missingSubscriptionFragments = [
    ...ensureContainsAll(dashboardSubscriptionSource, [
      '"updateClientSubscription"',
      '"cancelClientSubscription"',
      'value={paymentFrequency}',
      'frequency={paymentFrequency}',
      "subscriptionCancelAtPeriodEnd",
      "pendingSubscriptionChange",
    ]).map((fragment) => `ui:${fragment}`),
    ...ensureContainsAll(subscriptionFunctionsSource, [
      "export const updateClientSubscription",
      "export const cancelClientSubscription",
      "stripePriceIdForPlan",
      "stripeClient.subscriptions.update",
      "cancel_at_period_end: true",
      "manual_subscription_proration",
      "manual_scheduled_change",
      "manual_cancel_at_period_end",
    ]).map((fragment) => `functions:${fragment}`),
    ...ensureContainsAll(manualRenewalsCronSource, [
      "export const processManualSubscriptionRenewals",
      "manual_subscription_renewal",
      "pendingSubscriptionChange",
      "subscriptionCancelAtPeriodEnd",
      "renewalInvoiceId",
    ]).map((fragment) => `cron:${fragment}`),
    ...ensureContainsAll(stripeWebhookSource, [
      "customer.subscription.updated",
      "planFromStripePriceId",
      "paymentFrequency",
      "subscriptionStatus",
    ]).map((fragment) => `webhook:${fragment}`),
  ];
  pushCheck(
    results,
    "module abonnement coherent",
    missingSubscriptionFragments.length === 0,
    missingSubscriptionFragments.length === 0
      ? "Offres, periodicite, changement, annulation et sync Stripe couverts"
      : `Fragments manquants: ${missingSubscriptionFragments.join(", ")}`
  );

  const missingStripeCheckoutFragments = ensureContainsAll(createStripeCheckoutSessionSource, [
    "const requestSnap = await requestRef.get();",
    "...(requestSnap.exists ? {} : { createdAt: now })",
    "paymentStatus: \"checkout_created\"",
    "client_reference_id: uid",
  ]);
  pushCheck(
    results,
    "checkout stripe idempotent",
    missingStripeCheckoutFragments.length === 0,
    missingStripeCheckoutFragments.length === 0
      ? "Les relances Checkout preservent la date de creation et gardent le mapping utilisateur"
      : `Fragments manquants: ${missingStripeCheckoutFragments.join(", ")}`
  );

  const missingStripeWebhookFragments = ensureContainsAll(stripeWebhookSource, [
    "const [eventDoc, requestSnap, clientSnap, counterSnap, invoiceSnap] = await Promise.all",
    "const invoiceRef = db.collection(\"invoices\").doc(invoiceId);",
    "if (!invoiceSnap.exists)",
    "invoiceId,",
    "paymentStatus: isPaid ? \"paid\" : \"pending\"",
  ]);
  pushCheck(
    results,
    "webhook stripe autonome",
    missingStripeWebhookFragments.length === 0,
    missingStripeWebhookFragments.length === 0
      ? "Le webhook peut confirmer le paiement sans retour navigateur et sans transaction invalide"
      : `Fragments manquants: ${missingStripeWebhookFragments.join(", ")}`
  );

  const missingNavPolicies = ensureContainsAll(navSource, [
    'if (displayRole === "super_admin")',
    '{ title: "Centres", href: "/admin/adresses", icon: Building }',
    '{ title: "Facturation centres", href: "/admin/billing", icon: CreditCard }',
    'displayRole === "manager"',
    '{ title: "Clients", href: "/admin/clients", icon: Users2 }',
    'displayRole === "secretary_paris" || displayRole === "secretary_orly"',
  ]);
  pushCheck(
    results,
    "navigation par role",
    missingNavPolicies.length === 0,
    missingNavPolicies.length === 0
      ? "Les politiques de navigation critiques sont presentes"
      : `Fragments manquants: ${missingNavPolicies.join(", ")}`
  );

  const missingFunctionExports = ensureContainsAll(functionsIndexSource, [
    'export { createPdfJobs } from "./pdfJobs";',
    'export * from "./requestInvoicePdf";',
    'export * from "./manageClientSubscription";',
    'export { processManualSubscriptionRenewals } from "./crons/processManualSubscriptionRenewals";',
    'export { generateDocumentsFromData } from "./generateDocumentsFromData";',
    'export { approveSignup, rejectSignup, retryProvisioning } from "./adminSignups";',
    'export * from "./triggers/pdf/syncPdfStatus";',
    'export { syncRoleClaim } from "./triggers/users/syncRoleClaim";',
  ]);
  pushCheck(
    results,
    "exports functions critiques",
    missingFunctionExports.length === 0,
    missingFunctionExports.length === 0
      ? "Les fonctions critiques sont exportees"
      : `Exports manquants: ${missingFunctionExports.join(", ")}`
  );

  const missingPdfJobFragments = ensureContainsAll(pdfJobsSource, [
    'INVOICE_PDF_TEMPLATE_VERSION',
    'pdf_requests_contrats_paris',
    'pdf_requests_contrats_orly',
    'pdf_requests_attestations_paris',
    'pdf_requests_attestations_orly',
    'pdf_requests_invoices_paris',
    'pdf_requests_invoices_orly',
    'templateVersion: INVOICE_PDF_TEMPLATE_VERSION',
    'function buildContractOutputName(addressKey: AddressKey, jobId: string)',
    'function buildAttestationOutputName(addressKey: AddressKey, jobId: string)',
    '${jobId}.pdf',
  ]);
  pushCheck(
    results,
    "orchestration pdf",
    missingPdfJobFragments.length === 0,
    missingPdfJobFragments.length === 0
      ? "Contrats, attestations et factures couverts"
      : `Fragments manquants: ${missingPdfJobFragments.join(", ")}`
  );

  const missingDirectClientPdfFragments = ensureContainsAll(setRoleSource, [
    'import { performCreatePdfJobs } from "../../pdfJobs";',
    "directPdfResult = await performCreatePdfJobs(",
    'source: "admin_manual_client"',
    "pdfJobs: directPdfResult",
  ]);
  pushCheck(
    results,
    "creation manager documents ccs",
    missingDirectClientPdfFragments.length === 0,
    missingDirectClientPdfFragments.length === 0
      ? "La creation client manager declenche contrat et attestation"
      : `Fragments manquants: ${missingDirectClientPdfFragments.join(", ")}`
  );

  const missingFormaliteDocs = ensureContainsAll(documentsGeneratorSource, [
    'id: "statuts-constitutifs"',
    'id: "liste-souscripteurs-apports"',
    'id: "declaration-beneficiaires-effectifs"',
    "memo-dossier-depot-",
    'id: "statuts-mis-a-jour"',
    'id: "liste-sieges-successifs"',
    'id: "attestation-domiciliation"',
    'id: "mandat-formaliste"',
  ]);
  pushCheck(
    results,
    "liasse formalites critique",
    missingFormaliteDocs.length === 0,
    missingFormaliteDocs.length === 0
      ? "Creation et transfert couvrent les livrables critiques"
      : `Documents manquants: ${missingFormaliteDocs.join(", ")}`
  );

  const missingMailPlanPolicyFragments = [
    ...ensureContainsAll(plansSource, [
      'id: "classic"',
      '"Notification email": false',
      '"Résumé IA": false',
      '"Alerte prioritaire": false',
      'id: "premium"',
      '"Résumé IA": true',
      '"Alerte prioritaire": true',
      "isMailScanEnabled",
      "isAiMailSummaryEnabled",
      'subscription.plan',
      'return "starter";',
    ]).map((fragment) => `catalogue:${fragment}`),
    ...ensureContainsAll(mailPlanPolicySource, [
      "scanEnabled: false",
      "emailNotificationEnabled: false",
      "aiSummaryEnabled: true",
      "priorityAlertEnabled: true",
      'forwarding: "weekly"',
      'subscription.plan',
      'return "starter";',
    ]).map((fragment) => `function-policy:${fragment}`),
    ...ensureContainsAll(mailDocumentTriggerSource, [
      "mailPolicy.aiSummaryEnabled && storagePath && contentType",
      "mailPolicy.emailNotificationEnabled",
      "notificationAnalysis = mailPolicy.aiSummaryEnabled ? aiAnalysis : null",
      "plan_without_ai_summary",
    ]).map((fragment) => `mail-trigger:${fragment}`),
    ...ensureContainsAll(scanPageSource, [
      "clientCanReceiveDigitalMail",
      "isMailScanEnabled",
      "clients centre",
      "Classic - retrait",
      "scan et les notifications courrier ne sont pas inclus",
    ]).map((fragment) => `scan-ui:${fragment}`),
  ];
  pushCheck(
    results,
    "politique offres courrier",
    missingMailPlanPolicyFragments.length === 0,
    missingMailPlanPolicyFragments.length === 0
      ? "Classic bloque le digital, Starter/Business notifient simplement, Premium active resume IA et alerte"
      : `Fragments manquants: ${missingMailPlanPolicyFragments.join(", ")}`
  );

  const failedChecks = results.filter((item) => !item.ok);

  console.log("");
  console.log("QA critique - synthese");
  console.log("======================");
  for (const result of results) {
    console.log(`${result.ok ? "PASS" : "FAIL"}  ${result.name}`);
    console.log(`      ${result.details}`);
  }
  console.log("");
  console.log(`Total checks: ${results.length}`);
  console.log(`Failures: ${failedChecks.length}`);

  if (failedChecks.length > 0) {
    process.exitCode = 1;
  }
}

main();
